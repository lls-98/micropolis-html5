/**
 * TrafficRules defines the static lookups, vector step maps,
 * and zone destination boundary specifications for the transit simulation.
 */
export const TrafficRules = {
    MAX_TRAFFIC_DISTANCE: 30, // Maximum stamina steps allowed for a single trip

    // Cardinal direction offset tables matching DX/DY from TrafficGen.java
    // Index: 0 = North, 1 = East, 2 = South, 3 = West
    DX: [0, 1, 0, -1],
    DY: [-1, 0, 1, 0],

    // Radial coordinate offsets for scanning the perimeter of a 3x3 zone
    PERIM_X: [-1, 0, 1,  2, 2, 2,  1, 0,-1, -2,-2,-2],
    PERIM_Y: [-2,-2,-2, -1, 0, 1,  2, 2, 2,  1, 0,-1],

    /**
     * Determines the legal tile ID target bounds based on the commuter's source.
     * Ports the destination ranges directly from driveDone() in TrafficGen.java.
     * @param {string} sourceZone - The originating zone type ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL')
     * @returns {object} { low, high } legal tile ID range boundaries
     */
    getDestinationRange(sourceZone, TC) {
        switch (sourceZone) {
            case 'RESIDENTIAL':
                // Residential looks for Commercial buildings through Nuclear power plants
                return { low: TC.COMBASE, high: TC.NUCLEAR };
            case 'COMMERCIAL':
                // Commercial looks for Residential houses through Seaports
                return { low: TC.LHTHR, high: TC.PORT };
            case 'INDUSTRIAL':
                // Industrial looks for Residential houses through Commercial base tiles
                return { low: TC.LHTHR, high: TC.COMBASE };
            default:
                throw new Error(`Unknown source zone type: ${sourceZone}`);
        }
    },

    /**
     * Verifies if a given tile character code represents a valid drivable road or rail segment.
     * Ports roadTest() from TrafficGen.java.
     */
    isValidTransitTile(tile, TC) {
        if (tile < TC.ROADBASE) return false;
        if (tile > TC.LASTRAIL) return false;
        
        // Power lines block vehicle movement unless they are combined road/rail overlaps
        if (tile >= TC.POWERBASE && tile < TC.LASTPOWER) return false;
        
        return true;
    }
};