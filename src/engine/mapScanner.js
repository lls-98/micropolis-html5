import { TileValidator } from './tileValidator.js';
import { ZonePlopManager } from './zonePlopManager.js';
import { TrafficGen } from './trafficGen.js';

/**
 * MapScanner runs the automated cellular simulation logic across the grid.
 * It handles traffic updates, environmental reactions, and zone evolution loops.
 * Ports the primary execution structures from MapScanner.java.
 */
export class MapScanner {
    /**
     * @param {object} engine - Reference to the core Micropolis engine instance
     */
    constructor(engine) {
        this.engine = engine;
        this.traffic = new TrafficGen(engine);
    }

    /**
     * Scans 1/8th of the map grid horizontally during a specific clock phase.
     * Ports the sliced scanning concept triggered by the simulation clock phases.
     * @param {number} bandIndex - The current slicing band index (0 to 7)
     */
    scanBand(bandIndex) {
        const map = this.engine.map;
        if (!map) return;

        // Calculate vertical slice boundaries based on map dimensions
        const bandHeight = Math.floor(map.height / 8);
        const yStart = bandIndex * bandHeight;
        const yEnd = Math.min(map.height, yStart + bandHeight);

        for (let y = yStart; y < yEnd; y++) {
            for (let x = 0; x < map.width; x++) {
                const rawTile = map.getTile(x, y);
                const tile = TileValidator.cleanTile(rawTile);

                // If a tile is empty dirt or basic terrain, skip advanced calculations
                if (tile === this.engine.constants.DIRT || tile === this.engine.constants.RIVER) {
                    continue;
                }

                // Identify and process active structural zone centers
                this.evaluateTileBehavior(x, y, tile, rawTile);
            }
        }
    }

    /**
     * Routes specific simulation behaviors depending on what structural asset is found.
     * Ports the core behavior switch-case mapping from MapScanner.java.
     */
    evaluateTileBehavior(x, y, tile, rawTile) {
        const TC = this.engine.constants;

        // 1. Residential Zone Evaluation Anchor
        if (tile === TC.RZB) {
            this.processResidentialZone(x, y, rawTile);
            return;
        }

        // 2. Commercial Zone Evaluation Anchor
        if (tile === TC.CZB) {
            this.processCommercialZone(x, y, rawTile);
            return;
        }

        // 3. Industrial Zone Evaluation Anchor
        if (tile === TC.IZB) {
            this.processIndustrialZone(x, y, rawTile);
            return;
        }

        // 4. Utility / Safety Infrastructures
        switch (tile) {
            case TC.FIRESTATION:
                this.engine.fireStationEffectMem[Math.floor(y/8)][Math.floor(x/8)] += 1;
                break;
            case TC.POLICESTATION:
                this.engine.policeStationEffectMem[Math.floor(y/8)][Math.floor(x/8)] += 1;
                break;
            case TC.POWERPLANT:
            case TC.NUCLEAR:
                // Self-register power grid anchors
                ZonePlopManager.checkAndApplyZonePower(this.engine, x, y, tile);
                break;
        }
    }

    /**
     * Math formulas governing residential growth, decline, and traffic access.
     */
    processResidentialZone(x, y, rawTile) {
        const powered = ZonePlopManager.checkAndApplyZonePower(this.engine, x, y, rawTile);
        const demand = this.engine.valves ? this.engine.valves.resValve : 0;

        if (!powered) {
            if (Math.random() < 0.15) {
                this.engine.setTile(x, y, this.engine.constants.RESCLR);
            }
            return;
        }

        // Run the random-walk traffic pathfinder cycle centered on this residential block
        const trafficResult = this.traffic.makeTraffic(x, y, 'RESIDENTIAL');

        if (trafficResult <= 0) {
            // If trafficResult is 0 (gridlock/dead end) or -1 (no road connected at all)
            // The zone suffers from lack of transit infrastructure access.
            if (Math.random() < 0.08) {
                // Decay the zone or mark it visually as un-serviced/abandoned
                this.engine.emit('notification', { message: `Residential zone at (${x},${y}) lacks transit access!` });
            }
            return;
        }

        if (demand > 500 && Math.random() < 0.1) {
            ZonePlopManager.repairZone(this.engine, x, y, this.engine.constants.RZB, this.engine.tileSpecLookup);
        }
    }

    /**
     * Math formulas governing commercial shopping center transit connections.
     */
    processCommercialZone(x, y, rawTile) {
        const powered = ZonePlopManager.checkAndApplyZonePower(this.engine, x, y, rawTile);
        if (powered) {
            this.traffic.makeTraffic(x, y, 'COMMERCIAL');
        }
    }

    /**
     * Math formulas governing industrial factory transit connections.
     */
    processIndustrialZone(x, y, rawTile) {
        const powered = ZonePlopManager.checkAndApplyZonePower(this.engine, x, y, rawTile);
        if (powered) {
            this.traffic.makeTraffic(x, y, 'INDUSTRIAL');
        }
    }
}