/**
 * TileBehavior serves as the base class for cell behaviors evaluated during map scanner phases.
 * Tracks positional state variables and exposes abstract cell update steps.
 * Ports TileBehavior.java.
 */
export class TileBehavior {
    /**
     * @param {object} city - The primary Micropolis engine instance context.
     */
    constructor(city) {
        if (this.constructor === TileBehavior) {
            throw new TypeError('Cannot instantiate abstract class TileBehavior directly.');
        }

        this.city = city;
        this.PRNG = city.PRNG;

        // Context coordinates updated statefully per grid scanner increment
        this.xpos = 0;
        this.ypos = 0;
        this.tile = 0;
    }

    /**
     * Prepares positional variables for a specific grid coordinate and applies behavioral rules.
     * @param {number} xpos - Map tile X coordinate.
     * @param {number} ypos - Map tile Y coordinate.
     */
    processTile(xpos, ypos) {
        this.xpos = xpos;
        this.ypos = ypos;
        this.tile = this.city.getTile(xpos, ypos);
        this.apply();
    }

    /**
     * Abstract lifecycle hook. Must be overridden by subclasses to implement targeted logic.
     * @abstract
     */
    apply() {
        throw new Error(`Abstract method 'apply()' must be implemented by subclass ${this.constructor.name}.`);
    }
}