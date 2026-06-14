import { RoadLikeTool } from './roadLikeTool.js';
import { TileValidator } from './tileValidator.js';

export const RoadPlacer = {
    ROAD_COST: 10,
    BRIDGE_COST: 50,

    /**
     * Public entry-point to construct a line segment of roads from a click-and-drag.
     */
    dragLine(city, xStart, yStart, xEnd, yEnd) {
        const bounds = RoadLikeTool.getBounds(xStart, yStart, xEnd, yEnd);
        
        // Execute the multi-pass simulation sweep across the boundary coordinates
        RoadLikeTool.applyArea(city, bounds, (engine, x, y) => {
            return this.laySingleRoadTile(engine, x, y);
        });
    },

    /**
     * Formulates terrain conditions for a singular cell.
     * Ports layRoad() from RoadLikeTool.java.
     */
    laySingleRoadTile(city, x, y) {
        if (!city.testBounds(x, y)) return false;

        const currentRaw = city.getTile(x, y);
        // Neutralize/Clean the tile to check its base structural type
        let tile = TileValidator.cleanTile(currentRaw);
        if (city.neutralizeRoad) {
            tile = city.neutralizeRoad(tile);
        }

        const TC = city.constants;
        let cost = this.ROAD_COST;
        let targetTile = null;

        switch (tile) {
            case TC.RIVER:
            case TC.REDGE:
            case TC.CHANNEL:
                cost = this.BRIDGE_COST;
                
                // Directional bridge detection checks against neighbors
                if (x < city.map.width - 1 && TileValidator.isRoad(city.getTile(x + 1, y))) {
                    targetTile = TC.HBRIDGE;
                } else if (x > 0 && TileValidator.isRoad(city.getTile(x - 1, y))) {
                    targetTile = TC.HBRIDGE;
                } else if (y < city.map.height - 1 && TileValidator.isRoad(city.getTile(x, y + 1))) {
                    targetTile = TC.VBRIDGE;
                } else if (y > 0 && TileValidator.isRoad(city.getTile(x, y - 1))) {
                    targetTile = TC.VBRIDGE;
                } else {
                    // Fallback to horizontal default if isolated
                    targetTile = TC.HBRIDGE;
                }
                break;

            case TC.LHPOWER: // Road constructed over horizontal power lines
                targetTile = TC.VROADPOWER;
                break;

            case TC.LVPOWER: // Road constructed over vertical power lines
                targetTile = TC.HROADPOWER;
                break;

            case TC.LHRAIL:  // Road constructed over horizontal railway tracks
                targetTile = TC.HRAILROAD;
                break;

            case TC.LVRAIL:  // Road constructed over vertical railway tracks
                targetTile = TC.VRAILROAD;
                break;

            default:
                // Check if ground can be cleared by auto-bulldoze rules
                if (tile !== TC.DIRT) {
                    const canAutoDoze = TileValidator.canAutoBulldozeRRW ? TileValidator.canAutoBulldozeRRW(currentRaw) : false;
                    if (city.autoBulldoze && canAutoDoze) {
                        cost += 1; // Append the custom auto-demolition surcharge
                    } else {
                        return false; // Construction blocked
                    }
                }
                targetTile = TC.ROADS;
                break;
        }

        // Enforce municipal budget spending parameters
        if (city.totalFunds < cost) {
            city.emit('notification', { message: "Insufficient funds to complete construction segment!" });
            return false;
        }

        // If the tile is already configured correctly, return false to stop the loop sweep
        if (currentRaw === targetTile) {
            return false;
        }

        city.setTile(x, y, targetTile);
        city.spendFunds(-cost);

        // Run dynamic corner snapping fixups across local junctions
        if (city.fixZone) city.fixZone(x, y);

        return true;
    }
};