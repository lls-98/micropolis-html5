/**
 * BudgetNumbers is a pure data record capturing a snapshot of the city's
 * financial state during the year-end budget review phase.
 * Ports BudgetNumbers.java.
 */
export class BudgetNumbers {
    constructor() {
        // Macroeconomic balances
        this.taxRate = 7;             // Default tax rate percentage
        this.taxIncome = 0;           // Total calculated revenue received from R-C-I taxes
        this.operatingExpenses = 0;    // Sum of road, fire, and police department expenses
        this.previousBalance = 0;     // Municipal cash reserves prior to processing the new year
        this.newBalance = 0;          // Final municipal cash reserves after processing revenues/expenses

        // Transportation department funding state
        this.roadRequest = 0;         // Ideal cost needed to keep 100% of roads/rails maintained
        this.roadFunded = 0;          // Actual municipal funds allocated to the road network
        this.roadPercent = 0.0;       // Funding ratio (0.0 to 1.0) impacting transit decay rates

        // Fire department funding state
        this.fireRequest = 0;         // Ideal budget needed to support all active stations at 100%
        this.fireFunded = 0;          // Actual municipal funds allocated to fire departments
        this.firePercent = 0.0;       // Funding ratio impacting fire station response effectiveness

        // Law enforcement funding state
        this.policeRequest = 0;       // Ideal budget needed to support all active stations at 100%
        this.policeFunded = 0;        // Actual municipal funds allocated to police departments
        this.policePercent = 0.0;     // Funding ratio impacting police station crime-fighting range
    }

    /**
     * Optional utility helper to generate a shallow clone of the budget numbers,
     * useful when pushing records to UI charts or historical logging graphs.
     */
    clone() {
        const copy = new BudgetNumbers();
        Object.assign(copy, this);
        return copy;
    }
}