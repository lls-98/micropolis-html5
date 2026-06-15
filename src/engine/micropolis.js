import { TileConstants } from './tileConstants.js';
import { EventEmitter } from './eventEmitter.js';
import { MapGrid } from './mapGrid.js';
import { DemandValves } from './demandValves.js';
import { CensusManager } from './censusManager.js';
import { SimulationClock } from './simulationClock.js';
import { PowerGrid } from './powerGrid.js';
import { DisasterManager } from './disasterManager.js';
import { MapScanner } from './mapScanner.js';

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

        // Link the global constants registry here
        this.constants = TileConstants;

        // --- Instantiate Submodules ---
        this.map = new MapGrid(120, 100);
        this.valves = new DemandValves();
        this.census = new CensusManager();
        this.clock = new SimulationClock(this);
        this.powerGrid = new PowerGrid(this);
        this.disasters = new DisasterManager(this);

        // --- Stubs for Future Engine Files ---
        // These are separate files in the java source tree that we will port later
        this.scanner = new MapScanner(this);
        this.budget = null;   // Becomes CityBudget.js
        this.evaluation = null; // Becomes CityEval.js

        this.poweredZoneCount = 0;
        this.unpoweredZoneCount = 0;

        // Inside your micropolis.js constructor(), add these grid memory matrices:
        this.fireStationEffectMem = Array.from({ length: 15 }, () => new Uint8Array(15));
        this.policeStationEffectMem = Array.from({ length: 15 }, () => new Uint8Array(15));

        this.earthquakeListeners = [];

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

    isTilePowered(x, y) {
        // Check if the PWRBIT flag is currently appended to the map coordinate
        return (this.map.getTile(x, y) & 32768) !== 0;
    }

    setTilePower(x, y, status) {
        const current = this.map.getTile(x, y);
        if (status) {
            this.map.setTile(x, y, current | 32768); // Append PWRBIT
        } else {
            this.map.setTile(x, y, current & ~32768); // Strip PWRBIT
        }
    }

    hasPower(x, y) {
        // Placeholder logic for grid BFS: assume true for testing sandbox purposes
        return true; 
    }

    testBounds(x, y) {
        return x >= 0 && x < this.map.width && y >= 0 && y < this.map.height;
    }

    neutralizeRoad(tile) {
        // Strips away overlay/simulation status bits (like the power bit 32768)
        return tile & ~32768; 
    }

    getWidth() {
        return this.map ? this.map.width : 120;
    }

    getHeight() {
        return this.map ? this.map.height : 100;
    }

    addTraffic(x, y, amount) {
        // Placeholder for density grid mapping arrays.
        // In future iterations, this updates an explicit 2D traffic heatmap layer!
        console.log(`🚗 Traffic recorded at (${x}, ${y}) +${amount} density units.`);
    }

    /**
     * Allows UI components, screen-shakers, or sound engines to register interest
     * in tectonic events. Ports the registration intent of EarthquakeListener.
     */
    addEarthquakeListener(callback) {
        if (typeof callback === 'function') {
            this.earthquakeListeners.push(callback);
        }
    }

    /**
     * Removes an earthquake listener hook to prevent memory leaks.
     */
    removeEarthquakeListener(callback) {
        this.earthquakeListeners = this.earthquakeListeners.filter(
            listener => listener !== callback
        );
    }

    /**
     * Core trigger method executed when an earthquake is rolled or forced.
     * Fires the callback on all registered subscribers.
     */
    fireEarthquakeStarted() {
        console.log("⚠️ Tectonic shift detected! Shaking the city layout...");
        
        this.earthquakeListeners.forEach(callback => {
            try {
                callback();
            } catch (err) {
                console.error("Error executing EarthquakeListener callback:", err);
            }
        });
    }
}