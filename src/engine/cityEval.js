import { EvaluationData } from './evaluationData.js';
import { CityProblem } from './cityProblem.js';

/**
 * CityEval handles public opinion tracking, municipal valuation audits,
 * and calculation of the master city score. Ports CityEval.java.
 */
export class CityEval {
    /**
     * @param {object} engine - Core simulation engine context instance
     */
    constructor(engine) {
        this.engine = engine;

        // Public Poll metrics
        this.cityYes = 0;       // Percentage approving of the Mayor
        this.cityNo = 0;        // Percentage disapproving of the Mayor
        
        // Analytical scores
        this.cityAssValue = 0;   // Calculated property value assessment
        this.cityScore = 500;    // Current satisfaction rating (0 - 1000)
        this.deltaCityScore = 0; // Growth variance since last assessment
        
        // Demographics
        this.cityPop = 0;
        this.deltaCityPop = 0;
        this.cityClass = 0;      // Tier bracket index (0 to 5)

        // Problem state storage maps
        this.problemOrder = [];
        this.problemTable = {};
        this.problemVotes = {};
    }

    /**
     * Master evaluation trigger executed during the yearly loop phase.
     * Ports cityEvaluation() from CityEval.java.
     */
    performEvaluation() {
        if (this.engine.totalPop !== 0) {
            this.calculateAssValue();
            this.doPopNum();
            this.doProblems();
            this.calculateScore();
            this.doVotes();
        } else {
            this.evalInit();
        }

        // Notify engine observers that public records have changed
        if (this.engine.emit) {
            this.engine.emit('evaluation-updated', this.getSnapshot());
        }
    }

    /**
     * Resets parameters back to raw baseline defaults for empty cities.
     */
    evalInit() {
        this.cityYes = 0;
        this.cityNo = 0;
        this.cityAssValue = 0;
        this.cityClass = 0;
        this.cityScore = 500;
        this.deltaCityScore = 0;
        this.problemOrder = [];
        this.problemVotes = {};
        this.problemTable = {};
    }

    /**
     * Calculates structural asset valuations using preset weights.
     */
    calculateAssValue() {
        const weights = EvaluationData.ASSET_WEIGHTS;
        let sum = 0;

        sum += (this.engine.roadTotal || 0) * weights.ROAD;
        sum += (this.engine.railTotal || 0) * weights.RAIL;
        sum += (this.engine.policeCount || 0) * weights.POLICE;
        sum += (this.engine.fireStationCount || 0) * weights.FIRE;
        sum += (this.engine.hospitalCount || 0) * weights.HOSPITAL;
        sum += (this.engine.stadiumCount || 0) * weights.STADIUM;
        sum += (this.engine.seaportCount || 0) * weights.SEAPORT;
        sum += (this.engine.airportCount || 0) * weights.AIRPORT;
        sum += (this.engine.coalCount || 0) * weights.COAL;
        sum += (this.engine.nuclearCount || 0) * weights.NUCLEAR;

        this.cityAssValue = sum * 1000;
    }

    /**
     * Recalculates total headcounts and updates the city tier classification.
     */
    doPopNum() {
        const oldPop = this.cityPop;
        this.cityPop = this.engine.getCityPopulation ? this.engine.getCityPopulation() : (this.engine.totalPop || 0);
        this.deltaCityPop = this.cityPop - oldPop;

        // Locate appropriate tier matching current headcount
        const tier = EvaluationData.TIERS.find(t => this.cityPop <= t.max);
        this.cityClass = tier ? tier.classID : 0;
    }

    /**
     * Compiles, ranks, and logs current urban problems felt by citizens.
     */
    doProblems() {
        const P = CityProblem; // Shortcut to our clean enum tokens
        this.problemTable = {};

        // Extract system calculations using explicit enum keys
        this.problemTable[P.CRIME] = this.engine.crimeAverage || 0;
        this.problemTable[P.POLLUTION] = this.engine.pollutionAverage || 0;
        this.problemTable[P.HOUSING] = Math.round((this.engine.landValueAverage || 0) * 0.7);
        this.problemTable[P.TAXES] = (this.engine.cityTax || 7) * 10;
        this.problemTable[P.TRAFFIC] = this.averageTrf();
        this.problemTable[P.UNEMPLOYMENT] = this.getUnemployment();
        this.problemTable[P.FIRE] = this.getFire();

        // Run the randomized public polling vote routine
        this.problemVotes = this.voteProblems(this.problemTable);

        // Sort keys based on maximum descending polling values
        const sortedKeys = Object.keys(this.problemVotes).sort((a, b) => {
            return this.problemVotes[b] - this.problemVotes[a];
        });

        // Filter out zero votes and grab the top 4 structural complaints
        this.problemOrder = sortedKeys.filter(key => this.problemVotes[key] !== 0).slice(0, 4);
    }

    /**
     * Simulates civic responses via a randomized voting loop.
     */
    voteProblems(probTab) {
        const keys = Object.keys(probTab);
        const votes = {};
        keys.forEach(k => votes[k] = 0);

        let totalVotesCast = 0;
        const prng = this.engine.PRNG || Math;

        for (let i = 0; i < 600; i++) {
            const currentKey = keys[i % keys.length];
            const severityThreshold = probTab[currentKey] || 0;

            if (Math.floor(prng.random() * 301) < severityThreshold) {
                votes[currentKey]++;
                totalVotesCast++;
                if (totalVotesCast >= 100) break; // Sampling target reached
            }
        }
        return votes;
    }

    /**
     * Aggregates and averages traffic metrics where properties hold tangible value.
     */
    averageTrf() {
        let count = 1;
        let total = 0;
        const width = this.engine.getWidth ? this.engine.getWidth() : 120;
        const height = this.engine.getHeight ? this.engine.getHeight() : 100;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (this.engine.getLandValue && this.engine.getLandValue(x, y) !== 0) {
                    total += this.engine.getTrafficDensity ? this.engine.getTrafficDensity(x, y) : 0;
                    count++;
                }
            }
        }

        this.engine.trafficAverage = Math.round((total / count) * 2.4);
        return this.engine.trafficAverage;
    }

    /**
     * Measures employment balance constraints.
     */
    getUnemployment() {
        const baseJobs = ((this.engine.comPop || 0) + (this.engine.indPop || 0)) * 8;
        if (baseJobs === 0) return 0;

        const ratio = (this.engine.resPop || 0) / baseJobs;
        let factor = Math.floor((ratio - 1.0) * 255);
        return Math.max(0, Math.min(255, factor));
    }

    /**
     * Evaluates fire safety severity indicators.
     */
    getFire() {
        return Math.min(255, (this.engine.firePop || 0) * 5);
    }

    /**
     * Executes the main mathematical formulas to calculate the city score.
     */
    calculateScore() {
        const oldScore = this.cityScore;

        // Step A: Accumulate structural problems to find the average
        let sumProblems = 0;
        const problemValues = Object.values(this.problemTable);
        problemValues.forEach(val => sumProblems += val);

        let averageProblemSeverity = Math.floor(sumProblems / 3);
        averageProblemSeverity = Math.min(256, averageProblemSeverity);

        // Step B: Calculate the initial score out of 1000
        let z = Math.max(0, Math.min(1000, (256 - averageProblemSeverity) * 4));

        // Step C: Apply macroeconomic zoning cap penalties
        if (this.engine.resCap) z *= 0.85;
        if (this.engine.comCap) z *= 0.85;
        if (this.engine.indCap) z *= 0.85;

        // Step D: Apply infrastructure funding penalties
        if ((this.engine.roadEffect || 0) < 32) {
            z -= (32 - this.engine.roadEffect);
        }
        if ((this.engine.policeEffect || 0) < 1000) {
            z *= (0.9 + (this.engine.policeEffect / 10000.1));
        }
        if ((this.engine.fireEffect || 0) < 1000) {
            z *= (0.9 + (this.engine.fireEffect / 10000.1));
        }

        // Step E: Apply demand valve decay limits
        if ((this.engine.resValve || 0) < -1000) z *= 0.85;
        if ((this.engine.comValve || 0) < -1000) z *= 0.85;
        if ((this.engine.indValve || 0) < -1000) z *= 0.85;

        // Step F: Apply population variance growth scaling multipliers (SM)
        let SM = 1.0;
        if (this.cityPop !== 0 || this.deltaCityPop !== 0) {
            if (this.deltaCityPop === this.cityPop) {
                SM = 1.0;
            } else if (this.deltaCityPop > 0) {
                SM = (this.deltaCityPop / this.cityPop) + 1.0;
            } else if (this.deltaCityPop < 0) {
                SM = 0.95 + (this.deltaCityPop / (this.cityPop - this.deltaCityPop));
            }
        }
        z *= SM;

        // Step G: Deduct fire and tax impacts
        z -= this.getFire();
        z -= (this.engine.cityTax || 7);

        // Step H: Factor in electrical grid coverage constraints
        const totalZones = (this.engine.unpoweredZoneCount || 0) + (this.engine.poweredZoneCount || 0);
        const powerRatio = totalZones !== 0 ? ((this.engine.poweredZoneCount || 0) / totalZones) : 1.0;
        z *= powerRatio;

        // Step I: Apply moving average smoothing against the previous score
        z = Math.max(0, Math.min(1000, z));
        this.cityScore = Math.round((this.cityScore + z) / 2.0);
        this.deltaCityScore = this.cityScore - oldScore;
    }

    /**
     * Polls the population to update approval rating percentages.
     */
    doVotes() {
        this.cityYes = 0;
        this.cityNo = 0;
        const prng = this.engine.PRNG || Math;

        for (let i = 0; i < 100; i++) {
            if (Math.floor(prng.random() * 1001) < this.cityScore) {
                this.cityYes++;
            } else {
                this.cityNo++;
            }
        }
    }

    /**
     * Gathers a read-only object summary snapshot representing the current assessment records.
     */
    getSnapshot() {
        return {
            cityYes: this.cityYes,
            cityNo: this.cityNo,
            cityAssValue: this.cityAssValue,
            cityScore: this.cityScore,
            deltaCityScore: this.deltaCityScore,
            cityPop: this.cityPop,
            deltaCityPop: this.deltaCityPop,
            cityClass: this.cityClass,
            topProblems: [...this.problemOrder]
        };
    }
}