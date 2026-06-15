import { BuildingData } from './buildingData.js';
import { TileValidator } from './tileValidator.js';

/**
 * BuildingTool processes multi-tile fixed construction placements.
 * Ports behavioral logic implied by BuildingTool.java and ToolStroke hierarchies.
 */
export const BuildingTool = {
    /**
     * Entry-point to build a structural zone centered from a coordinate click.
     * @param {object} city - Main engine instance context
     * @param {number} x - Target top-left or anchor X tile coordinate
     * @param {number} y - Target top-left or anchor Y tile coordinate
     * @param {string} toolType - The target tool identity (e.g., 'FIRE', 'AIRPORT')
     * @returns {boolean} True if construction successfully committed
     */
    plopStructure(city, x, y, toolType) {
        const config = BuildingData[toolType];
        if (!config) {
            throw new Error(`Unexpected or unconfigured tool sequence: ${toolType}`);
        }

        const TC = city.constants;
        const targetBaseTileID = TC[config.baseTile];
        let totalCost = config.cost;

        // 1. Verify spatial boundary conditions across the entire size footprint
        for (let row = 0; row < config.size; row++) {
            for (let col = 0; col < config.size; col++) {
                const checkX = x + col;
                const checkY = y + row;

                if (!city.testBounds(checkX, checkY)) {
                    city.emit('notification', { message: "Construction out of city layout bounds!" });
                    return false;
                }

                const currentTile = city.getTile(checkX, checkY);
                let cleanTile = TileValidator.cleanTile(currentTile);
                if (city.neutralizeRoad) {
                    cleanTile = city.neutralizeRoad(cleanTile);
                }

                // If the coordinate isn't raw dirt, evaluate auto-bulldoze validation
                if (cleanTile !== TC.DIRT) {
                    const canAutoDoze = TileValidator.canAutoBulldozeRRW ? TileValidator.canAutoBulldozeRRW(currentTile) : false;
                    if (city.autoBulldoze && canAutoDoze) {
                        totalCost += 1; // Surcharge fee for minor clearing task
                    } else {
                        city.emit('notification', { message: `Building footprint obstructed at (${checkX}, ${checkY})!` });
                        return false; // Ground is blocked by an un-cleared structural asset
                    }
                }
            }
        }

        // 2. Validate financial compliance
        if (city.totalFunds < totalCost) {
            city.emit('notification', { message: "Insufficient city funds to construct this facility!" });
            return false;
        }

        // 3. Stamp down sequential tile ordinal markers across the cleared zone footprint
        let tileOffset = 0;
        for (let row = 0; row < config.size; row++) {
            for (let col = 0; col < config.size; col++) {
                const currentX = x + col;
                const currentY = y + row;

                // Stamp the exact sequential layout index starting from the base ordinal tile ID
                city.setTile(currentX, currentY, targetBaseTileID + tileOffset);
                tileOffset++;
            }
        }

        // 4. Finalize municipal billing ledger updates
        city.spendFunds(-totalCost);

        // Run neighbor graphics snap fixups across the perimeter boundaries
        if (city.fixZone) {
            city.fixZone(x, y);
            city.fixZone(x + config.size - 1, y + config.size - 1);
        }

        console.log(`🏗️ Facility [${toolType}] successfully constructed at (${x}, ${y}) for §${totalCost}.`);
        return true;
    }
};