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
    }
};