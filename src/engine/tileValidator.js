import { TileConstants as TC } from './tileConstants.js';

/**
 * TileValidator handles logical checks on raw map tiles to determine physical 
 * properties like conductivity, transport connectivity, and bulldozing permissions.
 * Ports the helper functions from TileConstants.java.
 */
export const TileValidator = {

    /**
     * Extracts the core tile graphic index by clearing out status bit flags.
     * Replaces the upper bit-mask asserts found throughout TileConstants.java
     * @param {number} tileValue 
     * @returns {number}
     */
    cleanTile(tileValue) {
        return tileValue & TC.LOMASK;
    },

    /**
     * Checks whether the tile can be auto-bulldozed for road, rail, or wire placement.
     * @param {number} tileValue 
     * @returns {boolean}
     */
    canAutoBulldozeRRW(tileValue) {
        const tile = this.cleanTile(tileValue);
        return (
            (tile >= TC.FIRSTRIVEDGE && tile <= TC.LASTRUBBLE) ||
            (tile >= TC.TINYEXP && tile <= TC.LASTTINYEXP)
        );
    },

    /**
     * Checks whether the tile can be auto-bulldozed for placing a major zone.
     * @param {number} tileValue 
     * @returns {boolean}
     */
    canAutoBulldozeZ(tileValue) {
        const tile = this.cleanTile(tileValue);
        return (
            (tile >= TC.FIRSTRIVEDGE && tile <= TC.LASTRUBBLE) ||
            (tile >= TC.POWERBASE + 2 && tile <= TC.POWERBASE + 12) ||
            (tile >= TC.TINYEXP && tile <= TC.LASTTINYEXP)
        );
    },

    /**
     * Checks if a tile is a type of road (including underwater tunnels and rail-crossings).
     * @param {number} tileValue 
     * @returns {boolean}
     */
    isRoad(tileValue) {
        const tile = this.cleanTile(tileValue);
        return (
            (tile >= TC.ROADBASE && tile < TC.POWERBASE) ||
            tile === TC.HRAILROAD ||
            tile === TC.VRAILROAD
        );
    },

    /**
     * Checks if a tile is a railroad track (including rail-power junctions).
     * @param {number} tileValue 
     * @returns {boolean}
     */
    isRail(tileValue) {
        const tile = this.cleanTile(tileValue);
        return (
            (tile >= TC.RAILBASE && tile < TC.RESBASE) ||
            tile === TC.RAILHPOWERV ||
            tile === TC.RAILVPOWERH
        );
    },

    /**
     * Checks if a tile is rubble left behind by disasters or bulldozing.
     * @param {number} tileValue 
     * @returns {boolean}
     */
    isRubble(tileValue) {
        const tile = this.cleanTile(tileValue);
        return tile >= TC.RUBBLE && tile <= TC.LASTRUBBLE;
    },

    /**
     * Checks if a tile is a natural tree cluster.
     * @param {number} tileValue 
     * @returns {boolean}
     */
    isTree(tileValue) {
        const tile = this.cleanTile(tileValue);
        return tile >= TC.WOODS_LOW && tile <= TC.WOODS_HIGH;
    },

    /**
     * Checks if a tile is part of any constructed building layout or infrastructure.
     * @param {number} tileValue 
     * @returns {boolean}
     */
    isConstructed(tileValue) {
        const tile = this.cleanTile(tileValue);
        return tile >= 0 && tile >= TC.ROADBASE;
    },

    /**
     * Checks if a tile can be set on fire by natural causes or arson.
     * @param {number} tileValue 
     * @returns {boolean}
     */
    isArsonable(tileValue) {
        const tile = this.cleanTile(tileValue);
        // Zone centers are protected from direct arson ignition calculations
        return (
            tile >= TC.LHTHR &&
            tile <= TC.LASTZONE
        );
    },

    /**
     * Checks if a tile is a non-empty residential property boundary.
     * @param {number} tileValue 
     * @returns {boolean}
     */
    isResidentialZone(tileValue) {
        const tile = this.cleanTile(tileValue);
        return tile >= TC.RESBASE && tile < TC.HOSPITAL;
    },

    /**
     * Checks if a tile represents any structural zone layout.
     * @param {number} tileValue 
     * @returns {boolean}
     */
    isZoneAny(tileValue) {
        const tile = this.cleanTile(tileValue);
        return tile >= TC.RESBASE;
    },

    isOverWater(tile) {
        // Check if tile falls within river channels/bridges criteria
        return tile === 2 || tile === 3 || tile === 4 || tile === 5 || tile === 79 || tile === 95;
    },

    isZoneCenter(tile) {
        // Basic structural anchor check (matches the zone base lookups from TileConstants)
        return tile === 265 || tile === 436 || tile === 625 || tile === 750 || tile === 816 || tile === 784;
    },

    isDozeable(tile) {
        // Ensure the asset isn't natural blank water or empty ground
        return tile !== 0 && tile !== 2;
    },

    isConductive(tile) {
        const clean = tile & ~32768; // strip simulation flags
        
        // Wire ranges, power plants, and layered power grids are conductive
        return (
            (clean >= 208 && clean <= 260) || // Base wires & tables
            clean === 436 ||                  // Coal Plant anchor
            clean === 445 ||                  // Nuclear Plant anchor
            (clean >= 793 && clean <= 811)    // Road-Power and Rail-Power overlapping pieces
        );
    },

    isRail(tile) {
        const clean = tile & ~32768; // strip simulation flags
        
        // Tracks, tables, crossings, and tunnel entrances
        return (
            (clean >= 266 && clean <= 304) || // Base rail tiles & tables
            clean === 811 ||                  // Combined Rail-Power crossing
            clean === 812                     // Combined Rail-Power crossing alt
        );
    }
};