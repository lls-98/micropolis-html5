/**
 * Interface defining the execution environment contract for map editing tools.
 * Ports ToolEffectIfc.java.
 * * @interface
 */
export class ToolEffectIfc {
    /**
     * Retrieves the tile index identifier at a relative map layout coordinate.
     * @param {number} dx - Offset column index relative to the operation origin.
     * @param {number} dy - Offset row index relative to the operation origin.
     * @returns {number} A non-negative tile identifier index.
     */
    getTile(dx, dy) {
        throw new Error("Method 'getTile()' must be implemented.");
    }

    /**
     * Queues an audio sound emission linked to a relative location.
     * @param {number} dx - Offset column index relative to the operation origin.
     * @param {number} dy - Offset row index relative to the operation origin.
     * @param {string} sound - Sound enum key identifier string.
     */
    makeSound(dx, dy, sound) {
        throw new Error("Method 'makeSound()' must be implemented.");
    }

    /**
     * Assigns a modified tile state at a relative map layout coordinate.
     * @param {number} dx - Offset column index relative to the operation origin.
     * @param {number} dy - Offset row index relative to the operation origin.
     * @param {number} tileValue - The target replacement tile index integer.
     */
    setTile(dx, dy, tileValue) {
        throw new Error("Method 'setTile()' must be implemented.");
    }

    /**
     * Registers a structural or administrative expense debt to be billed.
     * @param {number} amount - Total financial budget value to deduct.
     */
    spend(amount) {
        throw new Error("Method 'spend()' must be implemented.");
    }

    /**
     * Sets an explicit error, warning, or success status code definition.
     * @param {string} tr - ToolResult status outcome key identifier.
     */
    toolResult(tr) {
        throw new Error("Method 'toolResult()' must be implemented.");
    }
}