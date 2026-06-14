import { RoadLikeTool } from './roadLikeTool.js';
import { TileValidator } from './tileValidator.js';

/**
 * RailPlacer isolates the rules for laying down train tracks across the city grid.
 * It manages underwater rail tunnels and level transit crossings.
 * Ports layRail() logic directly out of RoadLikeTool.java.
 */
export const RailPlacer = {
    RAIL_COST: 20,         // Standard rail track construction cost
    TUNNEL_COST: 100,      // Surcharge for underwater transit tunnels

    /**
     * Entry-point to build a linear railroad line via click-and-drag.
     */
    dragLine(city, xStart, yStart, xEnd, yEnd) {
        const bounds = RoadLikeTool.getBounds(xStart, yStart, xEnd, yEnd);
        
        RoadLikeTool.applyArea(city, bounds, (engine, x, y) => {
            return this.laySingleRailTile(engine, x, y);
        });
    },

    /**
     * Checks map states and transforms a single coordinate index.
     * Ports layRail() from RoadLikeTool.java.
     */
    laySingleRailTile(city, x, y) {
        if (!city.testBounds(x, y)) return false;

        const currentRaw = city.getTile(x, y);
        let tile = TileValidator.cleanTile(currentRaw);
        if (city.neutralizeRoad) {
            tile = city.neutralizeRoad(tile);
        }

        const TC = city.constants;
        let cost = this.RAIL_COST;
        let targetTile = null;

        switch (tile) {
            case TC.RIVER:
            case TC.REDGE:
            case TC.CHANNEL:
                cost = this.TUNNEL_COST;
                
                // Determine horizontal vs vertical underwater tunnel orientation
                if (x < city.map.width - 1 && TileValidator.isRail(city.getTile(x + 1, y))) {
                    targetTile = TC.LHRAIL;
                } else if (x > 0 && TileValidator.isRail(city.getTile(x - 1, y))) {
                    targetTile = TC.LHRAIL;
                } else if (y < city.map.height - 1 && TileValidator.isRail(city.getTile(x, y + 1))) {
                    targetTile = TC.LVRAIL;
                } else if (y > 0 && TileValidator.isRail(city.getTile(x, y - 1))) {
                    targetTile = TC.LVRAIL;
                } else {
                    targetTile = TC.LHRAIL; // Fallback horizontal default
                }
                break;

            case TC.ROADS: // Rail placed over horizontal/generic pavement
                targetTile = TC.HRAILROAD;
                break;

            case TC.ROADS2: // Rail placed over vertical pavement
                targetTile = TC.VRAILROAD;
                break;

            case TC.LHPOWER: // Rail placed over horizontal power lines
                targetTile = TC.RAILVPOWERH;
                break;

            case TC.LVPOWER: // Rail placed over vertical power lines
                targetTile = TC.RAILHPOWERV;
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
                targetTile = TC.RAILBASE; // Standard standalone empty track tie
                break;
        }

        if (city.totalFunds < cost) {
            city.emit('notification', { message: "Insufficient municipal funds for railway tracks!" });
            return false;
        }

        if (currentRaw === targetTile) {
            return false;
        }

        city.setTile(x, y, targetTile);
        city.spendFunds(-cost);

        // Trigger network snapping updates
        if (city.fixZone) city.fixZone(x, y);

        return true;
    }
};