/**
 * DemandValves implements the classic RCI (Residential, Commercial, Industrial) 
 * economic calculation logic. It determines the city's development demand.
 */
export class DemandValves {
    constructor() {
        // Demand valves range roughly from -2000 to +2000
        this.resValve = 0;
        this.comValve = 0;
        this.indValve = 0;
    }

    /**
     * Ports the core mathematical logic from Java's setValves() method.
     * Calculates new demand values based on current census data and tax rates.
     * * @param {object} census - The current population statistics (from censusManager)
     * @param {number} gameLevel - The difficulty setting (0: Easy, 1: Medium, 2: Hard)
     * @param {number} taxRate - The city's current tax rate (0 to 20)
     */
    update(census, gameLevel, taxRate) {
        // --- 1. Residential Demand Calculation ---
        const laborBase = census.resPop;
        const employment = census.comPop + census.indPop;
        
        let targetResPop = 0;
        if (laborBase > 0) {
            // How many homes the economy can support based on job availability
            targetResPop = Math.floor((employment / laborBase) * 32);
        } else {
            targetResPop = 32;
        }
        
        if (targetResPop > 32) targetResPop = 32;

        // Base internal calculation logic matching the original simulator rules
        let resDemand = (targetResPop - 16) * 120;
        
        // Adjust for tax penalties (Original game considers 7% to be 'neutral')
        resDemand += (7 - taxRate) * 60;

        // Apply difficulty modifiers
        if (gameLevel === 1) resDemand -= 150; // Medium penalty
        if (gameLevel === 2) resDemand -= 350; // Hard penalty

        // Smoothly adjust the current valve toward the new demand target
        this.resValve += Math.floor(resDemand / 16);

        // --- 2. Commercial Demand Calculation ---
        let targetComPop = Math.floor(census.resPop / 4); // Commercial follows residential
        let comDemand = (targetComPop - census.comPop) * 150;
        comDemand += (7 - taxRate) * 60;
        
        this.comValve += Math.floor(comDemand / 16);

        // --- 3. Industrial Demand Calculation ---
        let targetIndPop = census.resPop; // Factories scale with available workforce
        let indDemand = (targetIndPop - census.indPop) * 120;
        indDemand += (7 - taxRate) * 40;
        
        this.indValve += Math.floor(indDemand / 16);

        // --- 4. Clamp Valve Ranges ---
        // Keeps the meters within their classic visual boundaries (-2000 to +2000)
        this.resValve = Math.max(-2000, Math.min(2000, this.resValve));
        this.comValve = Math.max(-2000, Math.min(2000, this.comValve));
        this.indValve = Math.max(-2000, Math.min(2000, this.indValve));
    }
}