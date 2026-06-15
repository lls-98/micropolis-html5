import { ToolEffect } from './toolEffect.js';
import { ToolResult } from './toolResult.js';
import { TileConstants } from './tileConstants.js'; // Assuming TileConstants mapping module exists

/**
 * Manages user mouse stroke interpolation, brush layout math, and neighbor tile auto-connection logic.
 * Ports ToolStroke.java.
 */
export class ToolStroke {
    /**
     * @param {object} city - Reference to the core Micropolis engine instance.
     * @param {object} tool - Map tool brush configuration metadata instance.
     * @param {number} xpos - Initial click-down column coordinate index.
     * @param {number} ypos - Initial click-down row coordinate index.
     */
    constructor(city, tool, xpos, ypos) {
        this.city = city;
        this.tool = tool;
        this.xpos = xpos;
        this.ypos = ypos;
        this.xdest = xpos;
        this.ydest = ypos;
        this.inPreview = false;
    }

    /**
     * Executes a dry-run operation stroke to generate an uncommitted map layout preview.
     * @returns {ToolPreview}
     */
    getPreview() {
        const eff = new ToolEffect(this.city, this.xpos, this.ypos);
        this.inPreview = true;
        try {
            this.applyArea(eff);
        } finally {
            this.inPreview = false;
        }
        return eff.preview;
    }

    /**
     * Transacts the operational changes, permanently committing changes if conditions permit.
     * @returns {string} ToolResult status token.
     */
    apply() {
        const eff = new ToolEffect(this.city, this.xpos, this.ypos);
        this.applyArea(eff);
        return eff.apply();
    }

    /**
     * Identifies tool categories and coordinates spatial point layout calculations.
     * @param {ToolEffectIfc} eff
     */
    applyArea(eff) {
        if (this.tool.isLineTool()) {
            // Bresenham's straight line vector drawing algorithm
            let x = this.xpos;
            let y = this.ypos;

            const dx = Math.abs(this.xdest - x);
            const dy = Math.abs(this.ydest - y);
            const sx = (x < this.xdest) ? 1 : -1;
            const sy = (y < this.ydest) ? 1 : -1;
            let err = dx - dy;

            while (true) {
                const localEff = new ToolEffect(this.city, x, y);
                this.applyStroke(localEff);

                if (x === this.xdest && y === this.ydest) {
                    break;
                }

                const e2 = 2 * err;
                if (e2 > -dy) {
                    err -= dy;
                    x += sx;
                }
                if (e2 < dx) {
                    err += dx;
                    y += sy;
                }
            }
        } else {
            // Rectangular area operations (zones, bulldozer brushes, buildings)
            this.applyStroke(eff);
        }
    }

    /**
     * Performs direct actions or applies structural brush stamps onto localized origin tracking coordinates.
     * @param {ToolEffectIfc} eff
     */
    applyStroke(eff) {
        this.tool.apply(eff);

        // Run auto-connection topological lookups if we are building road or rail tiles
        if (this.tool.isAutomatedNetworkTool()) {
            this.autoConnect(eff);
        }
    }

    /**
     * Evaluates adjacent map squares to automatically format network line shapes.
     * Ports the intricate bitmask-shifting neighborhood logic.
     * @param {ToolEffectIfc} eff
     */
    autoConnect(eff) {
        const tile = eff.getTile(0, 0);

        if (TileConstants.isRoadDynamic(tile)) {
            let adjTile = 0;

            // Check north road connectivity (Bit 0)
            if (TileConstants.roadConnectsSouth(eff.getTile(0, -1))) {
                adjTile |= 1;
            }
            // Check east road connectivity (Bit 1)
            if (TileConstants.roadConnectsWest(eff.getTile(1, 0))) {
                adjTile |= 2;
            }
            // Check south road connectivity (Bit 2)
            if (TileConstants.roadConnectsNorth(eff.getTile(0, 1))) {
                adjTile |= 4;
            }
            // Check west road connectivity (Bit 3)
            if (TileConstants.roadConnectsEast(eff.getTile(-1, 0))) {
                adjTile |= 8;
            }

            eff.setTile(0, 0, TileConstants.RoadTable[adjTile]);
        } 
        else if (TileConstants.isRailDynamic(tile)) {
            let adjTile = 0;

            // Check north rail connectivity (Bit 0)
            if (TileConstants.railConnectsSouth(eff.getTile(0, -1))) {
                adjTile |= 1;
            }
            // Check east rail connectivity (Bit 1)
            if (TileConstants.railConnectsWest(eff.getTile(1, 0))) {
                adjTile |= 2;
            }
            // Check south rail connectivity (Bit 2)
            if (TileConstants.railConnectsNorth(eff.getTile(0, 1))) {
                adjTile |= 4;
            }
            // Check west rail connectivity (Bit 3)
            if (TileConstants.railConnectsEast(eff.getTile(-1, 0))) {
                adjTile |= 8;
            }

            eff.setTile(0, 0, TileConstants.RailTable[adjTile]);
        }
    }
}