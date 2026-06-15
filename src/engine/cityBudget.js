import { BudgetConstants } from './budgetConstants.js';

/**
 * CityBudget tracks liquid municipal reserves and micro-accrued fund escrows.
 * Ports CityBudget.java.
 */
export class CityBudget {
    /**
     * @param {object} city - Reference to the core Micropolis engine instance
     */
    constructor(city) {
        this.city = city;

        // Total spending power available to the player
        this.totalFunds = BudgetConstants.INITIAL_FUNDS;

        // Micro-accrual escrow bins (measured in 1/TAX_FREQUENCY fractions)
        this.taxFund = 0;
        this.roadFundEscrow = 0;
        this.fireFundEscrow = 0;
        this.policeFundEscrow = 0;
    }

    /**
     * Deducts or adds money to the city's liquid cash reserves.
     * @param {number} amount - Negative value to spend funds, positive to deposit
     */
    spendFunds(amount) {
        this.totalFunds += amount;
        
        // Broadcast the treasury mutation so UI layers can sync their text readouts
        if (this.city.emit) {
            this.city.emit('funds-changed', { totalFunds: this.totalFunds, variance: amount });
        }
    }

    /**
     * Reset escrow tracking parameters at the beginning of a fresh annual calculation cycle.
     */
    clearEscrows() {
        this.taxFund = 0;
        this.roadFundEscrow = 0;
        this.fireFundEscrow = 0;
        this.policeFundEscrow = 0;
    }
}