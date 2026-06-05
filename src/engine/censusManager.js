/**
 * CensusManager tracks population numbers, employment ratios, 
 * and stores historical data used to generate city statistic graphs.
 */
export class CensusManager {
    constructor() {
        // --- Current Population Counts ---
        this.resPop = 0;
        this.comPop = 0;
        this.indPop = 0;

        // --- Derived Statistical Values ---
        this.totalPop = 0;
        this.laborBase = 0;
        this.employment = 0;

        // --- Historical Data Arrays (For Graphs) ---
        // Original game tracks historical trends over time across 120 data intervals
        this.resHistory = new Uint16Array(120);
        this.comHistory = new Uint16Array(120);
        this.indHistory = new Uint16Array(120);
        this.moneyHistory = new Uint16Array(120);
        this.pollutionHistory = new Uint16Array(120);
        this.crimeHistory = new Uint16Array(120);

        this.historyIndex = 0;
    }

    /**
     * Resets the active counters before a new map scanning cycle begins.
     */
    clearCensus() {
        this.resPop = 0;
        this.comPop = 0;
        this.indPop = 0;
    }

    /**
     * Finalizes the demographic calculations after a map scan pass completes.
     * Replaces the final calculations in Java's takeCensus()
     */
    bakingCensus() {
        this.totalPop = this.resPop + this.comPop + this.indPop;
        this.laborBase = this.resPop;
        this.employment = this.comPop + this.indPop;
    }

    /**
     * Pushes current metrics into the historical tracking buffers for graphs.
     * @param {number} currentFunds - The current amount of city money
     * @param {number} averagePollution - Calculated mean of the pollution grid
     * @param {number} averageCrime - Calculated mean of the crime grid
     */
    saveHistory(currentFunds, averagePollution, averageCrime) {
        // Wrap-around index loop for historical arrays
        const idx = this.historyIndex;

        this.resHistory[idx] = this.resPop;
        this.comHistory[idx] = this.comPop;
        this.indHistory[idx] = this.indPop;
        this.moneyHistory[idx] = Math.max(0, currentFunds);
        this.pollutionHistory[idx] = averagePollution;
        this.crimeHistory[idx] = averageCrime;

        // Advance history pointer, looping back to 0 at 120 entries
        this.historyIndex = (idx + 1) % 120;
    }
}