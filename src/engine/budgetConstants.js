/**
 * BudgetConstants defines the frequency dividers and default baseline options
 * for handling micro-incremental accounting in the fiscal sub-engine.
 */
export const BudgetConstants = {
    // The frequency at which taxes and maintenance fractions are accrued internally
    TAX_FREQUENCY: 4, 
    
    // Initial baseline startup parameters for a classic sandbox scenario
    INITIAL_FUNDS: 20000
};