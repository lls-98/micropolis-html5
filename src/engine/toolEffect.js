import { ToolEffectIfc } from './toolEffectIfc.js';
import { ToolPreview } from './toolPreview.js';
import { ToolResult } from './toolResult.js';

/**
 * ToolEffect acts as a transactional staging container for structural tool updates.
 * Ports ToolEffect.java and implements ToolEffectIfc.
 */
export class ToolEffect extends ToolEffectIfc {
    /**
     * @param {object} city - Reference to the core Micropolis engine instance.
     * @param {number} [xpos=0] - Central origin column coordinate.
     * @param {number} [ypos=0] - Central origin row coordinate.
     */
    constructor(city, xpos = 0, ypos = 0) {
        super();
        this.city = city;
        this.originX = xpos;
        this.originY = ypos;
        this.preview = new ToolPreview(); // Successfully swapped in real module!
    }

    /**
     * @override
     */
    getTile(dx, dy) {
        const CLEAR_VAL = 0;
        const c = this.preview.getTile(dx, dy);
        
        if (c !== CLEAR_VAL) {
            return c;
        }

        const worldX = this.originX + dx;
        const worldY = this.originY + dy;

        if (this.city.testBounds(worldX, worldY)) {
            return this.city.getTile(worldX, worldY);
        } else {
            return 0;
        }
    }

    /**
     * @override
     */
    makeSound(dx, dy, sound) {
        this.preview.makeSound(dx, dy, sound);
    }

    /**
     * @override
     */
    setTile(dx, dy, tileValue) {
        this.preview.setTile(dx, dy, tileValue);
    }

    /**
     * @override
     */
    spend(amount) {
        this.preview.spend(amount);
    }

    /**
     * @override
     */
    toolResult(tr) {
        this.preview.toolResult(tr);
    }

    /**
     * Applies the staged tool modifications atomically to the city environment.
     * @returns {string} The ToolResult outcome tag.
     */
    apply() {
        if (this.originX - this.preview.offsetX < 0 ||
            this.originX - this.preview.offsetX + this.preview.getWidth() > this.city.getWidth() ||
            this.originY - this.preview.offsetY < 0 ||
            this.originY - this.preview.offsetY + this.preview.getHeight() > this.city.getHeight()) 
        {
            return ToolResult.UH_OH; // Returns official Enum key
        }

        if (this.city.budget.totalFunds < this.preview.cost) {
            return ToolResult.INSUFFICIENT_FUNDS; // Returns official Enum key
        }

        let anyFound = false;
        const tilesGrid = this.preview.tiles;

        for (let y = 0; y < tilesGrid.length; y++) {
            for (let x = 0; x < tilesGrid[y].length; x++) {
                const c = tilesGrid[y][x];
                if (c !== 0) {
                    const destX = this.originX + x - this.preview.offsetX;
                    const destY = this.originY + y - this.preview.offsetY;
                    this.city.setTile(destX, destY, c);
                    anyFound = true;
                }
            }
        }

        for (let i = 0; i < this.preview.sounds.length; i++) {
            const si = this.preview.sounds[i];
            this.city.makeSound(si.x, si.y, si.sound);
        }

        if (anyFound && this.preview.cost !== 0) {
            this.city.spend(this.preview.cost);
            return ToolResult.SUCCESS; // Returns official Enum key
        } else {
            return this.preview.toolResultState;
        }
    }
}