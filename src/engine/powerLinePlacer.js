import { RoadLikeTool } from './roadLikeTool.js';
import { TileValidator } from './tileValidator.js';

/**
 * PowerLinePlacer isolates the rules for stringing electrical wires across the city.
 * It manages layered road/rail intersections and underwater cabling systems.
 * Ports layWire() logic out of RoadLikeTool.java.
 */
export const PowerLinePlacer = {
    WIRE_COST: 5,         // Standard wire layout cost
    UNDERWATER_COST: 25,  // Surcharge for underwater power channels

    /**
     * Entry-point to build a line segment of power grids via click-and-drag.
     */
    dragLine(city, xStart, yStart, xEnd, yEnd) {
        const bounds = RoadLikeTool.getBounds(xStart, yStart, xEnd, yEnd);
        
        RoadLikeTool.applyArea(city, bounds, (engine, x, y) => {
            return this.laySingleWireTile(engine, x, y);
        });
    },

    /**
     * Checks map states and transforms a single coordinate index.
     * Ports layWire() from RoadLikeTool.java.
     */
    laySingleWireTile(city, x, y) {
        if (!city.testBounds(x, y)) return false;

        const currentRaw = city.getTile(x, y);
        let tile = TileValidator.cleanTile(currentRaw);
        if (city.neutralizeRoad) {
            tile = city.neutralizeRoad(tile);
        }

        const TC = city.constants;
        let cost = this.WIRE_COST;
        let targetTile = null;

        switch (tile) {
            case TC.RIVER:
            case TC.REDGE:
            case TC.CHANNEL:
                cost = this.UNDERWATER_COST;
                
                // Determine horizontal vs vertical underwater cable pathways
                if (x < city.map.width - 1 && TileValidator.isConductive(city.getTile(x + 1, y))) {
                    targetTile = TC.LHPOWER;
                } else if (x > 0 && TileValidator.isConductive(city.getTile(x - 1, y))) {
                    targetTile = TC.LHPOWER;
                } else if (y < city.map.height - 1 && TileValidator.isConductive(city.getTile(x, y + 1))) {
                    targetTile = TC.LVPOWER;
                } else if (y > 0 && TileValidator.isConductive(city.getTile(x, y - 1))) {
                    targetTile = TC.LVPOWER;
                } else {
                    targetTile = TC.LHPOWER; // Fallback horizontal default
                }
                break;

            case TC.ROADS: // Wire placed over horizontal/generic pavement
                targetTile = TC.HROADPOWER;
                break;

            case TC.ROADS2: // Wire placed over vertical pavement
                targetTile = TC.VROADPOWER;
                break;

            case TC.LHRAIL: // Wire placed over horizontal train tracks
                targetTile = TC.RAILHPOWERV;
                break;

            case TC.LVRAIL: // Wire placed over vertical train tracks
                targetTile = TC.RAILVPOWERH;
                break;

            default:
                // Handle auto-bulldozing for minor foliage obstructions
                if (tile !== TC.DIRT) {
                    const canAutoDoze = TileValidator.canAutoBulldozeRRW ? TileValidator.canAutoBulldozeRRW(currentRaw) : false;
                    if (city.autoBulldoze && canAutoDoze) {
                        cost += 1;
                    } else {
                        return false; // Ground blocked
                    }
                }
                targetTile = TC.POWERBASE; // Standard standalone empty wire post
                break;
        }

        if (city.totalFunds < cost) {
            city.emit('notification', { message: "Insufficient municipal funds for electrical wires!" });
            return false;
        }

        if (currentRaw === targetTile) {
            return false;
        }

        city.setTile(x, y, targetTile);
        city.spendFunds(-cost);

        // Run neighbor graphics snapping updates
        if (city.fixZone) city.fixZone(x, y);

        return true;
    }
};