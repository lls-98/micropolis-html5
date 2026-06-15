import { ToolEffectIfc } from './toolEffectIfc.js';
import { CityRect } from './cityGeometry.js'; // Assuming CityRect lives here with other geometry tools
import { ToolResult } from './toolResult.js';
/**
 * Nested data structure representing an audio emission scheduled during tool previewing.
 */
export class SoundInfo {
    /**
     * @param {number} x - Relative offset column index.
     * @param {number} y - Relative offset row index.
     * @param {string} sound - Sound identifier token.
     */
    constructor(x, y, sound) {
        this.x = x;
        this.y = y;
        this.sound = sound;
    }
}

/**
 * Dynamic canvas layout that grows automatically to record sandbox map updates.
 * Ports ToolPreview.java.
 */
export class ToolPreview extends ToolEffectIfc {
    constructor() {
        super();
        this.offsetX = 0;
        this.offsetY = 0;
        
        /** @type {number[][]} Matrix of short integer tile values */
        this.tiles = [];
        this.cost = 0;
        this.toolResultState = ToolResult.NONE;
        
        /** @type {SoundInfo[]} */
        this.sounds = [];
    }

    /**
     * @override
     */
    getTile(dx, dy) {
        const CLEAR = 0; // Mirroring TileConstants.CLEAR
        if (this.inRange(dx, dy)) {
            return this.tiles[this.offsetY + dy][this.offsetX + dx];
        } else {
            return CLEAR;
        }
    }

    /**
     * Returns a bounding rectangle relative to the tool interaction origin.
     * @returns {CityRect}
     */
    getBounds() {
        return new CityRect(
            -this.offsetX,
            -this.offsetY,
            this.getWidth(),
            this.getHeight()
        );
    }

    getWidth() {
        return this.tiles.length !== 0 ? this.tiles[0].length : 0;
    }

    getHeight() {
        return this.tiles.length;
    }

    /**
     * Checks if a relative coordinate offset maps inside the current allocated boundaries.
     */
    inRange(dx, dy) {
        return (this.offsetY + dy >= 0) &&
               (this.offsetY + dy < this.getHeight()) &&
               (this.offsetX + dx >= 0) &&
               (this.offsetX + dx < this.getWidth());
    }

    /**
     * Expands the size of the backing matrix array dynamically to fit the requested coordinate.
     * Ports the intricate nested layout-shifting array logic from expandTo.
     * @param {number} dx 
     * @param {number} dy 
     */
    expandTo(dx, dy) {
        const CLEAR = 0;

        if (!this.tiles || this.tiles.length === 0) {
            this.tiles = [[CLEAR]];
            this.offsetX = -dx;
            this.offsetY = -dy;
            return;
        }

        // 1. Expand each existing row horizontally as needed
        for (let i = 0; i < this.tiles.length; i++) {
            let row = this.tiles[i];
            
            if (this.offsetX + dx >= row.length) {
                // Expanding to the right
                const newLen = this.offsetX + dx + 1;
                while (row.length < newLen) {
                    row.push(CLEAR);
                }
            } else if (this.offsetX + dx < 0) {
                // Prepending cells to the left
                const additionalCells = -(this.offsetX + dx);
                const prefixArray = new Array(additionalCells).fill(CLEAR);
                this.tiles[i] = prefixArray.concat(row);
            }
        }

        // Shift our horizontal tracking offset if we appended to the left
        if (this.offsetX + dx < 0) {
            this.offsetX += -(this.offsetX + dx);
        }

        const currentWidth = this.tiles[0].length;

        // 2. Expand vertically by adding or prepending entire row groups
        if (this.offsetY + dy >= this.tiles.length) {
            // Expanding downwards
            const newTargetHeight = this.offsetY + dy + 1;
            while (this.tiles.length < newTargetHeight) {
                this.tiles.push(new Array(currentWidth).fill(CLEAR));
            }
        } else if (this.offsetY + dy < 0) {
            // Prepending rows at the top
            const additionalRows = -(this.offsetY + dy);
            const newRowsBlock = [];
            for (let i = 0; i < additionalRows; i++) {
                newRowsBlock.push(new Array(currentWidth).fill(CLEAR));
            }
            this.tiles = newRowsBlock.concat(this.tiles);

            // Shift our vertical tracking offset anchor
            this.offsetY += additionalRows;
        }
    }

    /**
     * @override
     */
    makeSound(dx, dy, sound) {
        this.sounds.push(new SoundInfo(dx, dy, sound));
    }

    /**
     * @override
     */
    setTile(dx, dy, tileValue) {
        this.expandTo(dx, dy);
        this.tiles[this.offsetY + dy][this.offsetX + dx] = tileValue;
    }

    /**
     * @override
     */
    spend(amount) {
        this.cost += amount;
    }

    /**
     * @override
     */
    toolResult(tr) {
        this.toolResultState = tr;
    }
}