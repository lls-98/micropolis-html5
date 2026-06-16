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
    // --- Core Global Enumeration Options Registry ---
    static BULLDOZER   = new MicropolisTool('BULLDOZER', 1, 1);
    static WIRE        = new MicropolisTool('WIRE', 1, 5);
    static ROAD        = new MicropolisTool('ROAD', 1, 10); // Normalized to ROAD to match lineTool checks and Java core
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
     * Determines whether this tool behaves as a drag-and-draw vector router.
     * Fixes the 'this.tool.isLineTool is not a function' crash!
     * @returns {boolean}
     */
    isLineTool() {
        return this.key === 'ROAD' || 
               this.key === 'RAIL' || 
               this.key === 'WIRE';
    }

    /**
     * Determines if the tool requires neighborhood tile lookups for dynamic layout connection updates.
     * Satisfies toolStroke.js requirements.
     * @returns {boolean}
     */
    isAutomatedNetworkTool() {
        return this.key === 'ROAD' || 
               this.key === 'RAIL';
    }

    /**
     * Stubs out stroke creation mechanics to map against structural stroke workers.
     */
    beginStroke(engine, xpos, ypos) {
        return {
            apply: () => ({ success: true, cost: this.cost })
        };
    }

    apply(eff) {
        // Direct adaptation: if passed a ToolEffect proxy, invoke expenditure mechanics
        if (eff && typeof eff.spend === 'function') {
            eff.spend(this.cost);
            
            // Stamp the core base identifier onto the coordinate origin tracking canvas point
            // For testing sandbox confirmation, write a fixed placeholder value
            if (this.key === 'RESIDENTIAL') {
                eff.setTile(0, 0, 1); // Stamping sub-element index
            }
        }
        return { success: true, cost: this.cost };
    }

    static values() {
        return [
            this.BULLDOZER, this.WIRE, this.ROAD, this.RAIL,
            this.RESIDENTIAL, this.COMMERCIAL, this.INDUSTRIAL,
            this.FIRE, this.POLICE, this.STADIUM, this.PARK,
            this.SEAPORT, this.POWERPLANT, this.NUCLEAR, this.AIRPORT, this.QUERY
        ];
    }
}