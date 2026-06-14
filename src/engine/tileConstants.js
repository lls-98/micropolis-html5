/**
 * TileConstants maps symbolic names to raw tile ID numbers and connection lookup matrices.
 * This is a precise 1-to-1 port of the data values in TileConstants.java.
 */
export const TileConstants = Object.freeze({
    // --- Terrain Mapping ---
    CLEAR: -1,
    DIRT: 0,
    RIVER: 2,
    REDGE: 3,
    CHANNEL: 4,
    RIVEDGE: 5,
    FIRSTRIVEDGE: 5,
    LASTRIVEDGE: 20,
    TREEBASE: 21,
    WOODS_LOW: 21,
    WOODS: 37,
    WOODS_HIGH: 39,
    WOODS2: 40,
    WOODS5: 43,
    RUBBLE: 44,
    LASTRUBBLE: 47,
    FLOOD: 48,
    LASTFLOOD: 51,
    RADTILE: 52,
    FIRE: 56,

    // --- Roads and Transport Infrastructure ---
    ROADBASE: 64,
    HBRIDGE: 64,
    VBRIDGE: 65,
    ROADS: 66,
    ROADS2: 67,
    ROADS3: 68,
    ROADS4: 69,
    ROADS5: 70,
    ROADS6: 71,
    ROADS7: 72,
    ROADS8: 73,
    ROADS9: 74,
    ROADS10: 75,
    INTERSECTION: 76,
    HROADPOWER: 77,
    VROADPOWER: 78,
    BRWH: 79,       // Horizontal bridge, open
    LTRFBASE: 80,   // Low traffic threshold base
    BRWV: 95,       // Vertical bridge, open
    HTRFBASE: 144,  // High traffic threshold base
    LASTROAD: 206,

    // --- Power Distribution Lines ---
    POWERBASE: 208,
    HPOWER: 208,    // Underwater power-line (Horizontal)
    VPOWER: 209,    // Underwater power-line (Vertical)
    LHPOWER: 210,
    LVPOWER: 211,
    LVPOWER2: 212,
    LVPOWER3: 213,
    LVPOWER4: 214,
    LVPOWER5: 215,
    LVPOWER6: 216,
    LVPOWER7: 217,
    LVPOWER8: 218,
    LVPOWER9: 219,
    LVPOWER10: 220,
    RAILHPOWERV: 221,
    RAILVPOWERH: 222,
    LASTPOWER: 222,

    // --- Railroad Infrastructure ---
    RAILBASE: 224,
    HRAIL: 224,     // Underwater rail (Horizontal)
    VRAIL: 225,     // Underwater rail (Vertical)
    LHRAIL: 226,
    LVRAIL: 227,
    LVRAIL2: 228,
    LVRAIL3: 229,
    LVRAIL4: 230,
    LVRAIL5: 231,
    LVRAIL6: 232,
    LVRAIL7: 233,
    LVRAIL8: 234,
    LVRAIL9: 235,
    LVRAIL10: 236,
    HRAILROAD: 237,
    VRAILROAD: 238,
    LASTRAIL: 238,

    // --- City Zones and Special Buildings ---
    RESBASE: 240,
    RESCLR: 244,
    HOUSE: 249,
    LHTHR: 249,     // 12 house tiles lower bound
    HHTHR: 260,     // House tiles upper bound
    RZB: 265,       // Residential zone center base
    HOSPITAL: 409,
    CHURCH: 418,
    COMBASE: 423,
    COMCLR: 427,
    CZB: 436,       // Commercial zone center base
    INDBASE: 612,
    INDCLR: 616,
    IZB: 625,       // Industrial zone center base
    PORTBASE: 693,
    PORT: 698,
    AIRPORT: 716,
    POWERPLANT: 750,
    FIRESTATION: 765,
    POLICESTATION: 774,
    STADIUM: 784,
    FULLSTADIUM: 800,
    NUCLEAR: 816,
    LASTZONE: 826,

    // --- Visual Special Effects / Animations ---
    LIGHTNINGBOLT: 827,
    HBRDG0: 828,    // Draw bridge animation states (Horizontal)
    HBRDG1: 829,
    HBRDG2: 830,
    HBRDG3: 831,
    FOUNTAIN: 840,
    TINYEXP: 860,
    LASTTINYEXP: 867,
    FOOTBALLGAME1: 932,
    FOOTBALLGAME2: 940,
    VBRDG0: 948,    // Draw bridge animation states (Vertical)
    VBRDG1: 949,
    VBRDG2: 950,
    VBRDG3: 951,
    LAST_TILE: 956,

    // --- Status and Value Bitmasks ---
    PWRBIT: 32768,  // Bit 15 set means tile is currently supplied with power
    ALLBITS: 64512, // Binary mask for reading upper 6 configuration flags
    LOMASK: 1023,   // Binary mask for isolation of the lower 10-bit raw tile graphic index

    // --- Autoconnection State Tables ---
    // Ports the raw arrays used to calculate tile tile-snapping variations dynamically
    RoadTable: Object.freeze([
        66, 67, 66, 68,
        67, 67, 69, 73,
        66, 71, 66, 72,
        70, 75, 74, 76
    ]),

    WireTable: Object.freeze([
        210, 211, 210, 212,
        211, 211, 213, 217,
        210, 215, 210, 216,
        214, 219, 218, 220
    ]),

    RailTable: Object.freeze([
        226, 227, 226, 228,
        227, 227, 229, 233,
        226, 231, 226, 232,
        230, 235, 234, 236
    ]),

    // --- Core Translation Inline Utilities ---

    /**
     * Converts a road tile back to its un-congested base value.
     * Ports the math of capitalize/neutralizeRoad using JavaScript bitmasks.
     * @param {number} tile 
     * @returns {number}
     */
    neutralizeRoad(tile) {
        tile = tile & this.LOMASK;
        if (tile >= this.ROADBASE && tile <= this.LASTROAD) {
            tile = ((tile - this.ROADBASE) & 0xf) + this.ROADBASE;
        }
        return tile;
    }
});