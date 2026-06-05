/**
 * SimulationClock manages the timeline, tick schedules, 
 * and distributes simulation steps across a 16-phase cycle.
 */
export class SimulationClock {
    /**
     * @param {object} engine - Reference to the core Micropolis engine instance
     */
    constructor(engine) {
        this.engine = engine;

        this.cityTime = 0; // Tracks game time/months, replaces Java's cityTime
        this.fcycle = 0;   // The 16-phase cycle step counter, replaces Java's fcycle
        
        // Speed settings matching Java configurations
        this.SPEED_PAUSED = 0;
        this.SPEED_SLOW = 1;
        this.SPEED_NORMAL = 2;
        this.SPEED_FAST = 3;
        
        this.currentSpeed = this.SPEED_NORMAL;
    }

    /**
     * Advances the internal clock by one frame step and fires phase-specific tasks.
     * Ports the core step/phase scheduling logic found in Micropolis.java
     */
    tick() {
        if (this.currentSpeed === this.SPEED_PAUSED) return;

        // Advance the internal clock frame loop
        this.fcycle = (this.fcycle + 1) % 1024;
        
        // The core game loop runs on a 16-phase cycle (0 to 15)
        const phase = this.fcycle % 16;

        switch (phase) {
            case 0:
                // Phase 0: Start of a new month sequence
                this.cityTime++;
                
                // Clear out census counters for a clean pass
                if (this.engine.census) this.engine.census.clearCensus();
                break;

            case 1: case 2: case 3: case 4: case 5: case 6: case 7: case 8:
                // Phases 1-8: Sliced Map Scanning
                // The map scanner processes 1/8th of the city grid per phase
                const bandIndex = phase - 1;
                if (this.engine.scanner) {
                    this.engine.scanner.scanBand(bandIndex);
                }
                break;

            case 9:
                // Phase 9: Finalize population counts & recalculate RCI demand
                if (this.engine.census) this.engine.census.bakingCensus();
                if (this.engine.valves && this.engine.census) {
                    this.engine.valves.update(
                        this.engine.census, 
                        this.engine.gameLevel, 
                        this.engine.taxRate
                    );
                }
                break;

            case 10:
                // Phase 10: Update city evaluation/popularity polls
                if (this.engine.evaluation) this.engine.evaluation.update();
                break;

            case 11:
                // Phase 11: Process the power grid network simulation
                if (this.engine.powerGrid) this.engine.powerGrid.simulatePower();
                break;

            case 12:
                // Phase 12: Update internal financial budget sheets
                if (this.engine.budget) this.engine.budget.tick();
                break;

            case 14:
                // Phase 14: Random Disaster/Event checks
                if (this.engine.disasters) this.engine.disasters.checkDisasters();
                break;

            default:
                // Other leftover phases (like 13 and 15) are idle or open for extensions
                break;
        }

        // Inform the frontend UI that a time step event just happened
        this.engine.emit('clock-tick', { 
            cityTime: this.cityTime, 
            phase: phase 
        });
    }

    setSpeed(speedCode) {
        this.currentSpeed = speedCode;
    }
}