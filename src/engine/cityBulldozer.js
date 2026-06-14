import { TileValidator } from './tileValidator.js';

/**
 * CityBulldozer encapsulates the exact dual-pass demolition mechanics 
 * from the original Micropolis simulator core.
 */
export const CityBulldozer = {
    
    BULLDOZER_COST: 1,

    /**
     * Executes a full area bulldozer swipe (handles single tiles or whole zones).
     * Ports applyArea(ToolEffectIfc eff) from Bulldozer.java.
     * @param {object} city - The main engine instance
     * @param {number} x - Target map column
     * @param {number} y - Target map row
     */
    execute(city, x, y) {
        if (!city.testBounds(x, y)) return false;

        // Base check for simple single tile dozing
        const rawTile = city.getTile(x, y);
        const tile = TileValidator.cleanTile(rawTile);

        // 1. Double check tool permissions
        if (!TileValidator.isDozeable(tile)) {
            return false;
        }

        if (city.totalFunds < this.BULLDOZER_COST) {
            city.emit('notification', { message: "Insufficient funds to bulldoze!" });
            return false;
        }

        // 2. Pass A: Handle Zone Demolition if clicked directly on a Zone Center
        if (TileValidator.isZoneCenter(tile)) {
            this.dozeZone(city, x, y, tile);
            return true;
        }

        // 3. Pass B: Handle Single Field Demolition (Roads, wires, trees, bridges)
        this.dozeField(city, x, y, tile);
        return true;
    },

    /**
     * Demolishes an entire complex zone footprint and stamps random explosion debris.
     * Ports dozeZone() and putRubble() from Bulldozer.java.
     */
    dozeZone(city, xpos, ypos, centerTile) {
        const size = TileValidator.getZoneSizeFor ? TileValidator.getZoneSizeFor(centerTile) : { width: 3, height: 3 };
        const area = size.width * size.height;

        // Trigger appropriate sound events based on zone scale
        if (area < 16) {
            city.emit('sound', { type: 'EXPLOSION_HIGH' });
        } else if (area < 36) {
            city.emit('sound', { type: 'EXPLOSION_LOW' });
        } else {
            city.emit('sound', { type: 'EXPLOSION_BOTH' });
        }

        const xorg = xpos - 1;
        const yorg = ypos - 1;

        // Fill the zone's footprint with animated tiny explosion tiles
        for (let y = yorg; y < yorg + size.height; y++) {
            for (let x = xorg; x < xorg + size.width; x++) {
                if (city.testBounds(x, y)) {
                    const current = city.getTile(x, y);
                    if (current !== city.constants.RADTILE && current !== city.constants.DIRT) {
                        // Generate a randomized explosion variance tile index (0-2)
                        const randExplosionOffset = Math.floor(Math.random() * 3);
                        city.setTile(x, y, city.constants.TINYEXP + randExplosionOffset);
                    }
                }
            }
        }

        city.spendFunds(-this.BULLDOZER_COST);
    },

    /**
     * Flattens individual environment assets back into native base terrain.
     * Ports dozeField() from Bulldozer.java.
     */
    dozeField(city, x, y, tile) {
        if (TileValidator.isOverWater(tile)) {
            // Restore water flow channels if clearing an over-water asset
            city.setTile(x, y, city.constants.RIVER);
        } else {
            // Restore back to dry open land dirt
            city.setTile(x, y, city.constants.DIRT);
        }

        // Trigger dynamic border fixups for structural cohesion (roads/wires snapping updates)
        if (city.fixZone) city.fixZone(x, y);

        city.spendFunds(-this.BULLDOZER_COST);
    }
};