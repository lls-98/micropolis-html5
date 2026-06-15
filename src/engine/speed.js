/**
 * Speed enumerates the performance loops and execution timing configurations.
 * Dictates client rendering intervals alongside engine tick execution step ratios.
 * Ports Speed.java.
 */
export class Speed {
    static PAUSED     = new Speed('PAUSED', 999, 0);
    static SLOW       = new Speed('SLOW', 625, 1);       // One sim step every 1250ms
    static NORMAL     = new Speed('NORMAL', 125, 1);     // One sim step every 250ms
    static FAST       = new Speed('FAST', 25, 1);        // One sim step every 50ms
    static SUPER_FAST = new Speed('SUPER_FAST', 25, 5);  // One sim step every 10ms

    /**
     * @param {string} key - The lookup string key identification token.
     * @param {number} animationDelay - The interval time threshold expressed in milliseconds.
     * @param {number} simStepsPerUpdate - Number of logic simulation ticks executed per animation loop.
     */
    constructor(key, animationDelay, simStepsPerUpdate) {
        this.key = key;
        this.animationDelay = animationDelay;
        this.simStepsPerUpdate = simStepsPerUpdate;
        Object.freeze(this);
    }

    /**
     * Gets the full collection array containing all configuration speeds.
     * @returns {Speed[]}
     */
    static values() {
        return [
            this.PAUSED,
            this.SLOW,
            this.NORMAL,
            this.FAST,
            this.SUPER_FAST
        ];
    }

    /**
     * Look up a speed configuration instance by its string token key.
     * @param {string} name 
     * @returns {Speed|null}
     */
    static valueOf(name) {
        const found = this.values().find(s => s.key === name.toUpperCase());
        if (!found) {
            throw new Error(`No speed constant found matching identifier: ${name}`);
        }
        return found;
    }

    /**
     * Helper to compute real-world time elapsed per core simulation cycle.
     * Accounts for the rule: 2 animation cycles = 1 simulation step.
     * @returns {number} Delay in milliseconds.
     */
    getSimulationStepDelay() {
        if (this.simStepsPerUpdate === 0) {
            return Infinity;
        }
        return (this.animationDelay * 2) / this.simStepsPerUpdate;
    }

    toString() {
        return `Speed.${this.key} (Delay: ${this.animationDelay}ms, Steps: ${this.simStepsPerUpdate})`;
    }
}

Object.freeze(Speed);