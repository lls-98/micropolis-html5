/**
 * DisasterManager handles random disaster probability tracking 
 * and triggers specific catastrophic events like fires, floods, or tornados.
 */
export class DisasterManager {
    /**
     * @param {object} engine - Reference to the core Micropolis engine instance
     */
    constructor(engine) {
        this.engine = engine;

        this.disasterType = 0; // 0: None, 1: Fire, 2: Flood, etc.
        this.disasterDuration = 0; // Ticks remaining for the current active disaster
        this.disastersEnabled = true; // Toggle for user settings
    }

    /**
     * Evaluates random disaster probabilities during Phase 14 of the simulation clock.
     * Ports the random disaster checking loops from Micropolis.java
     */
    checkDisasters() {
        if (!this.disastersEnabled) return;

        // If a disaster is currently running, count down its duration
        if (this.disasterDuration > 0) {
            this.disasterDuration--;
            if (this.disasterDuration === 0) {
                this.disasterType = 0;
                this.engine.emit('disaster-ended');
            }
            return;
        }

        // The original game checks a pseudo-random number against a difficulty threshold.
        // Let's implement a simplified skeleton of that check:
        const roll = Math.random();
        
        // Example: a 0.1% chance per cycle depending on city size/pollution
        if (roll < 0.001) {
            this.triggerRandomDisaster();
        }
    }

    /**
     * Selects and unleashes a random catastrophe upon the map.
     */
    triggerRandomDisaster() {
        const choice = Math.floor(Math.random() * 4) + 1; // 1 to 4
        this.activateDisaster(choice, Math.floor(Math.random() * 30) + 10);
    }

    /**
     * Forces a specific disaster to occur. Great for UI buttons!
     * @param {number} type - Code representing the catastrophe
     * @param {number} duration - How many simulation frames it will last
     */
    activateDisaster(type, duration) {
        this.disasterType = type;
        this.disasterDuration = duration;

        // Pick a random spot on the map for it to strike
        const targetX = Math.floor(Math.random() * this.engine.map.width);
        const targetY = Math.floor(Math.random() * this.engine.map.height);

        // Scream into the microphone so the frontend can play animations/sound effects
        this.engine.emit('disaster-started', {
            type: this.disasterType,
            x: targetX,
            y: targetY
        });

        console.log(`Disaster Type ${type} struck at (${targetX}, ${targetY})!`);
    }
}