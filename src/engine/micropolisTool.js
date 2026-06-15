import { MicropolisToolData } from './micropolisToolData.js';

/**
 * Placeholder map to register stroke class constructors dynamically later on.
 * Prevents initialization errors caused by circular import paths.
 */
export const ToolStrokeFactories = {
    Bulldozer: null,
    RoadLikeTool: null,
    BuildingTool: null,
    DefaultToolStroke: null
};

/**
 * MicropolisTool exposes the structural dimensions and raw build costs for tools.
 * Ports MicropolisTool.java.
 */
export class MicropolisTool {
    static BULLDOZER   = new MicropolisTool('BULLDOZER', 1, 1);
    static WIRE        = new MicropolisTool('WIRE', 1, 5);
    static ROADS       = new MicropolisTool('ROADS', 1, 10);
    static RAIL        = new MicropolisTool('RAIL', 1, 20);
    static RESIDENTIAL = new MicropolisTool('RESIDENTIAL', 3, 100);
    static COMMERCIAL  = new MicropolisTool('COMMERCIAL', 3, 100);
    static INDUSTRIAL  = new MicropolisTool('INDUSTRIAL', 3, 100);
    static FIRE        = new MicropolisTool('FIRE', 3, 500);
    static POLICE      = new MicropolisTool('POLICE', 3, 500);
    static STADIUM     = new MicropolisTool('STADIUM', 4, 5000);
    static PARK        = new MicropolisTool('PARK', 1, 10);
    static SEAPORT     = new MicropolisTool('SEAPORT', 4, 3000);
    static POWERPLANT  = new MicropolisTool('POWERPLANT', 4, 3000);
    static NUCLEAR     = new MicropolisTool('NUCLEAR', 4, 5000);
    static AIRPORT     = new MicropolisTool('AIRPORT', 6, 10000);
    static QUERY       = new MicropolisTool('QUERY', 1, 0);

    constructor(key, size, cost) {
        this.key = key;
        this.size = size;
        this.cost = cost;
        Object.freeze(this);
    }

    getWidth() { return this.size; }
    getHeight() { return this.size; }
    getToolCost() { return this.cost; }

    /**
     * Stubs out stroke creation mechanics to map against structural stroke workers.
     */
    beginStroke(engine, xpos, ypos) {
        // High-level orchestration mapping hooks hook up smoothly into ToolStroke classes later
        return {
            apply: () => ({ success: true, cost: this.cost })
        };
    }

    apply(engine, xpos, ypos) {
        return this.beginStroke(engine, xpos, ypos).apply();
    }

    static values() {
        return [
            this.BULLDOZER, this.WIRE, this.ROADS, this.RAIL,
            this.RESIDENTIAL, this.COMMERCIAL, this.INDUSTRIAL,
            this.FIRE, this.POLICE, this.STADIUM, this.PARK,
            this.SEAPORT, this.POWERPLANT, this.NUCLEAR, this.AIRPORT, this.QUERY
        ];
    }
}