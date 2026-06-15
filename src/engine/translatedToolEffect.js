/**
 * A proxy decorator that shifts tool layout actions by a spatial offset.
 * Allows tools to work in local (0,0) space while writing to absolute map positions.
 * Ports TranslatedToolEffect.java.
 */
export class TranslatedToolEffect {
    /**
     * @param {ToolEffectIfc} base - The underlying tool execution tracking context.
     * @param {number} dx - Relative horizontal grid offset shift.
     * @param {number} dy - Relative vertical grid offset shift.
     */
    constructor(base, dx, dy) {
        this.base = base;
        this.dx = dx;
        this.dy = dy;
    }

    /**
     * Retrieves a tile value from the map relative to the translated coordinate point.
     * @param {number} x - Local x-coordinate.
     * @param {number} y - Local y-coordinate.
     * @returns {number} The tile index value.
     */
    getTile(x, y) {
        return this.base.getTile(x + this.dx, y + this.dy);
    }

    /**
     * Emits a localized structural game sound through the underlying registry.
     * @param {number} x - Local x-coordinate.
     * @param {number} y - Local y-coordinate.
     * @param {Sound} sound - Sound asset type identifier.
     */
    makeSound(x, y, sound) {
        this.base.makeSound(x + this.dx, y + this.dy, sound);
    }

    /**
     * Modifies a tile index on the map relative to the translated coordinate point.
     * @param {number} x - Local x-coordinate.
     * @param {number} y - Local y-coordinate.
     * @param {number} tileValue - The target tile state index.
     */
    setTile(x, y, tileValue) {
        this.base.setTile(x + this.dx, y + this.dy, tileValue);
    }

    /**
     * Forwards an expenditure request to the underlying city budget funds.
     * @param {number} amount - Cost in simoleons.
     */
    spend(amount) {
        this.base.spend(amount);
    }

    /**
     * Reports an operational execution outcome status token.
     * @param {string} tr - The ToolResult status variant.
     */
    toolResult(tr) {
        this.base.toolResult(tr);
    }
}