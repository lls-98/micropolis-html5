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

        // Add this inside micropolis.js constructor if not already there
        this.sprites = []; 
        this.acycle = 0;

        // 🟢 ADD THIS PRNG OBJECT HERE:
        // Provides a Java-like random integer function interface for wandering sprites.
        // Fixes the "Cannot read properties of undefined (reading 'nextInt')" crash!
        this.PRNG = {
            nextInt: (max) => Math.floor(Math.random() * max)
        };

        // --- Stubs for Future Engine Files ---
        // These are separate files in the java source tree that we will port later
        this.scanner = new MapScanner(this);
        this.evaluation = null; // Becomes CityEval.js

        this.budget = {
            get totalFunds() { return this._city.totalFunds; },
            set totalFunds(v) { this._city.totalFunds = v; },
            _city: this
        };

        this.poweredZoneCount = 0;
        this.unpoweredZoneCount = 0;

        // Inside your micropolis.js constructor(), add these grid memory matrices:
        this.fireStationEffectMem = Array.from({ length: 15 }, () => new Uint8Array(15));
        this.policeStationEffectMem = Array.from({ length: 15 }, () => new Uint8Array(15));

        this.earthquakeListeners = [];

        /** @type {MapListener[]} Array tracking registered observers */
        this.listeners = [];

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
     * 🟢 ADD THIS ALIAS BRIDGE INTERFACE HERE:
     * Maps the old tool engine spend invocation directly to modern spendFunds mechanics.
     * Fixes the 'this.city.spend is not a function' crash!
     */
    spend(amount) {
        // Note: Java spent cash by passing a positive cost, which needs to be subtracted
        // from total funds, whereas spendFunds might handle absolute arithmetic.
        // Let's pass it as a negative delta to deduct funds safely:
        this.spendFunds(-amount);
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

    /**
     * 🟢 ADD THIS METHOD HERE:
     * Exposes the active entity tracker array to simulation physics sprites.
     * Fixes the 'this.city.allSprites is not a function' crash!
     * @returns {Sprite[]} Array of tracking entities.
     */
    allSprites() {
        return this.sprites;
    }

    /**
     * 🟢 ADD THIS METHOD HERE:
     * Simulates destruction of a tile on the map layout grid.
     * Triggered by environmental disasters like a TornadoSprite tearing through structures.
     * Fixes the 'this.city.destroyTile is not a function' crash!
     * @param {number} x - Column grid index coordinate.
     * @param {number} y - Row grid index coordinate.
     */
    destroyTile(x, y) {
        if (!this.testBounds(x, y)) return;

        const currentTile = this.getTile(x, y);
        
        // Basic fallback: If the tile isn't empty dirt, obliterate it!
        if (currentTile !== 0) {
            console.log(`💥 [Disaster Dynamics] Structure destroyed at grid location (${x}, ${y})`);
            
            // Replaces the tile index with 0 (dirt) from your configuration recipe
            this.setTile(x, y, 0); 
            
            // In future steps, we can also trigger explosion sound dispatches:
            // this.fireSoundEffect(Sound.EXPLOSION);
        }
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

    /**
     * Attaches a new UI view system or rendering target layer to the engine.
     * @param {MapListener} listener - Class instance implementing the MapListener hooks
     */
    addListener(listener) {
        if (listener && !this.listeners.includes(listener)) {
            this.listeners.push(listener);
        }
    }

    /**
     * Detaches an active UI view or layer system from the update broadcast chain.
     * @param {MapListener} listener 
     */
    removeListener(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    // --- Broadcaster Dispatches matching original Java call parameters ---

    fireMapAnimation() {
        for (const listener of this.listeners) {
            listener.mapAnimation();
        }
    }

    fireMapOverlayDataChanged(overlayDataType) {
        for (const listener of this.listeners) {
            listener.mapOverlayDataChanged(overlayDataType);
        }
    }

    fireSpriteMoved(sprite) {
        for (const listener of this.listeners) {
            listener.spriteMoved(sprite);
        }
    }

    fireTileChanged(xpos, ypos) {
        for (const listener of this.listeners) {
            listener.tileChanged(xpos, ypos);
        }
    }

    fireWholeMapChanged() {
        for (const listener of this.listeners) {
            listener.wholeMapChanged();
        }
    }

    /**
     * Stepping loop frame tick engine executed by main.js
     */
    simulateStep() {
        this.acycle++;
        if (this.clock && typeof this.clock.tick === 'function') {
            this.clock.tick();
        }
        
        // Let any spawned testing sprites execute their move intervals
        for (let i = this.sprites.length - 1; i >= 0; i--) {
            const sprite = this.sprites[i];
            if (sprite && typeof sprite.moveImpl === 'function') {
                sprite.moveImpl();
                if (sprite.frame === 0) {
                    this.sprites.splice(i, 1);
                }
            }
        }
    }
}