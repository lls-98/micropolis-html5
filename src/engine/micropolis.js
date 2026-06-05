import { EventEmitter } from './eventEmitter.js';
import { MapGrid } from './mapGrid.js';
import { DemandValves } from './demandValves.js';
import { CensusManager } from './censusManager.js';
import { SimulationClock } from './simulationClock.js';
import { PowerGrid } from './powerGrid.js';
import { DisasterManager } from './disasterManager.js';

/**
 * The core controller and state hub for Micropolis.
 * Acts as the unified interface that holds and glues all sub-modules together.
 */
export class Micropolis extends EventEmitter {
    constructor() {
        super(); // Inherit 'on' and 'emit' capabilities from EventEmitter

        // --- Core Simulation Parameters ---
        this.gameLevel = 0; // 0: Easy, 1: Medium, 2: Hard
        this.taxRate = 7;   // Classic 7% neutral tax rate
        this.totalFunds = 20000;

        // --- Instantiate Submodules ---
        this.map = new MapGrid(120, 100);
        this.valves = new DemandValves();
        this.census = new CensusManager();
        this.clock = new SimulationClock(this);
        this.powerGrid = new PowerGrid(this);
        this.disasters = new DisasterManager(this);

        // --- Stubs for Future Engine Files ---
        // These are separate files in the java source tree that we will port later
        this.scanner = null;  // Becomes MapScanner.js
        this.budget = null;   // Becomes CityBudget.js
        this.evaluation = null; // Becomes CityEval.js

        console.log("Modular Micropolis Engine Core fully operational.");
    }

    /**
     * The heartbeat method called by your main game loop.
     * Delegates clock advancement and lifecycle ticking.
     */
    animate() {
        // Step the master timeline clock forward by one phase frame
        this.clock.tick();
    }

    // --- High-Level Engine Utility Methods ---

    /**
     * Modifies city funds safely and alerts listeners of changes.
     * @param {number} amount - The numeric shift (positive or negative)
     */
    spendFunds(amount) {
        this.totalFunds += amount;
        this.emit('funds-changed', this.totalFunds);
    }

    /**
     * Clean proxy to pull a tile value without breaking encapsulation.
     */
    getTile(x, y) {
        return this.map.getTile(x, y);
    }

    /**
     * Proxy to modify a tile value, instantly firing off a network notification.
     */
    setTile(x, y, tileValue) {
        this.map.setTile(x, y, tileValue);
        // Shout into the event microphone so the frontend view can repaint this tile
        this.emit('tile-changed', { x, y, value: tileValue });
    }
}