import { TileValidator } from './tileValidator.js';

/**
 * ZonePlopManager isolates the code responsible for printing, repairing,
 * and powering complex 3x3 and 4x4 zone structures on the city map grid.
 * Ports structural methods directly out of MapScanner.java.
 */
export const ZonePlopManager = {

    /**
     * Toggles power registration for a zone block and updates global statistics.
     * Ports checkZonePower / setZonePower from MapScanner.java.
     * @param {object} city - The main engine city instance
     * @param {number} xpos - Center column index
     * @param {number} ypos - Center row index
     * @param {number} tile - Raw tile value at the center
     * @returns {boolean} True if the zone currently has power
     */
    checkAndApplyZonePower(city, xpos, ypos, tile) {
        const oldPower = city.isTilePowered(xpos, ypos);
        
        // Base power assumptions matching original engine criteria
        // Note: Nuclear and Coal plants are self-powering anchors
        const newPower = (
            tile === city.constants.NUCLEAR ||
            tile === city.constants.POWERPLANT ||
            city.hasPower(xpos, ypos)
        );

        // Fetch dimension block criteria
        const size = TileValidator.getZoneSizeFor ? TileValidator.getZoneSizeFor(tile) : { width: 3, height: 3 };

        if (newPower && !oldPower) {
            city.setTilePower(xpos, ypos, true);
            if (city.powerZone) city.powerZone(xpos, ypos, size);
        } else if (!newPower && oldPower) {
            city.setTilePower(xpos, ypos, false);
            if (city.shutdownZone) city.shutdownZone(xpos, ypos, size);
        }

        if (newPower) {
            city.poweredZoneCount++;
        } else {
            city.unpoweredZoneCount++;
        }

        return newPower;
    },

    /**
     * Stamps a modular zone footprint onto the map grid centered on target coordinates.
     * Ports zonePlop(TileSpec base) from MapScanner.java.
     * @param {object} city - The main engine city instance
     * @param {number} xpos - Center coordinate X
     * @param {number} ypos - Center coordinate Y
     * @param {object} tileSpec - Definition object specifying width, height, and member arrays
     * @returns {boolean} True if successful
     */
    zonePlop(city, xpos, ypos, tileSpec) {
        if (!tileSpec || !tileSpec.buildingInfo) return false;

        const bi = tileSpec.buildingInfo;
        const xorg = xpos - 1;
        const yorg = ypos - 1;

        // Step A: Pre-flight bounds validation loop
        for (let y = yorg; y < yorg + bi.height; y++) {
            for (let x = xorg; x < xorg + bi.width; x++) {
                if (!city.testBounds(x, y)) {
                    return false;
                }
                
                // Block placement if current ground is a disaster state
                const currentTile = city.getTile(x, y);
                if (city.constants.FLOOD && currentTile >= city.constants.FLOOD && currentTile < city.constants.ROADBASE) {
                    return false;
                }
            }
        }

        // Step B: Structural application loop
        let i = 0;
        for (let y = yorg; y < yorg + bi.height; y++) {
            for (let x = xorg; x < xorg + bi.width; x++) {
                city.setTile(x, y, bi.members[i].tileNumber);
                i++;
            }
        }

        // Apply updated power calculation
        const updatedCenterTile = city.getTile(xpos, ypos);
        this.checkAndApplyZonePower(city, xpos, ypos, updatedCenterTile);
        return true;
    },

    /**
     * Automatically fixes damaged tiles inside an existing zone configuration
     * (e.g., recovering from fire or clear-outs) without altering disaster-locked coordinates.
     * Ports repairZone(int base) from MapScanner.java.
     */
    repairZone(city, xpos, ypos, baseTile, tileSpecLookup) {
        const powerOn = city.isTilePowered(xpos, ypos);
        const spec = tileSpecLookup(baseTile);
        if (!spec || !spec.buildingInfo) return;

        const bi = spec.buildingInfo;
        const xorg = xpos - 1;
        const yorg = ypos - 1;

        let i = 0;
        for (let y = 0; y < bi.height; y++) {
            for (let x = 0; x < bi.width; x++, i++) {
                const xx = xorg + x;
                const yy = yorg + y;

                let memberSpec = bi.members[i];
                if (powerOn && memberSpec.onPower) {
                    memberSpec = memberSpec.onPower;
                }

                if (city.testBounds(xx, yy)) {
                    const currentTile = city.getTile(xx, yy);

                    // Skip updating active centers or running animation frames
                    if (currentTile === baseTile) continue;
                    
                    // Use TileValidator to ensure we don't accidentally stomp active rubble/disasters
                    if (TileValidator.isRubble(currentTile)) continue;
                    
                    const isDisasterState = currentTile >= city.constants.FLOOD && currentTile < city.constants.ROADBASE;
                    if (!isDisasterState) {
                        city.setTile(xx, yy, memberSpec.tileNumber);
                    }
                }
            }
        }
    },

    /**
     * Specialized 4x4 matrix tool explicitly managing sports stadiums.
     * Ports drawStadium(int zoneCenter) from MapScanner.java.
     */
    drawStadium(city, xpos, ypos, zoneCenter) {
        let zoneBase = zoneCenter - 1 - 4;

        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                city.setTile(xpos - 1 + x, ypos - 1 + y, zoneBase);
                zoneBase++;
            }
        }
        city.setTilePower(xpos, ypos, true);
    }
};