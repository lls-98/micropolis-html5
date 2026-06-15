/**
 * MapGeneratorData houses matrix stamps, neighbor displacement offsets,
 * and bitwise autotiling indexing tables for procedural land massing.
 */
export const MapGeneratorData = Object.freeze({
    CREATE_ISLAND: Object.freeze({
        NEVER: 'NEVER',
        ALWAYS: 'ALWAYS',
        SELDOM: 'SELDOM'
    }),

    ISLAND_RADIUS: 18,

    // Step multipliers mapping integer turns 0-7 to grid coordinate cells
    DIRECTION_TABX: [0,  1, 1, 1, 0, -1, -1, -1],
    DIRECTION_TABY: [-1, -1, 0, 1, 1,  1,  0, -1],

    // Cardinal neighbor search directions (Left, Down, Right, Up)
    DX: [-1, 0, 1, 0],
    DY: [0, 1, 0, -1],

    // 9x9 matrix footprint for carving wide rivers and bodies of water
    BR_MATRIX: [
        [0, 0, 0, 3, 3, 3, 0, 0, 0],
        [0, 0, 3, 2, 2, 2, 3, 0, 0],
        [0, 3, 2, 2, 2, 2, 2, 3, 0],
        [3, 2, 2, 2, 2, 2, 2, 2, 3],
        [3, 2, 2, 2, 4, 2, 2, 2, 3],
        [3, 2, 2, 2, 2, 2, 2, 2, 3],
        [0, 3, 2, 2, 2, 2, 2, 3, 0],
        [0, 0, 3, 2, 2, 2, 3, 0, 0],
        [0, 0, 0, 3, 3, 3, 0, 0, 0]
    ],

    // 6x6 matrix footprint for thin channels, streams, and lakes
    SR_MATRIX: [
        [0, 0, 3, 3, 0, 0],
        [0, 3, 2, 2, 3, 0],
        [3, 2, 2, 2, 2, 3],
        [3, 2, 2, 2, 2, 3],
        [0, 3, 2, 2, 3, 0],
        [0, 0, 3, 3, 0, 0]
    ],

    // Autotiling lookup maps for matching raw edges to clean shorelines (0-15 bitindex)
    // Map indices: REDGE -> RIVEDGE tile variants
    R_ED_TAB: [
        20, 20, 24, 22, // RIVEDGE + 8, RIVEDGE + 8, RIVEDGE + 12, RIVEDGE + 10
        12, 2,  26, 24, // RIVEDGE + 0, RIVER,       RIVEDGE + 14, RIVEDGE + 12
        16, 18, 2,  20, // RIVEDGE + 4, RIVEDGE + 6, RIVER,       RIVEDGE + 8
        14, 16, 12, 2   // RIVEDGE + 2, RIVEDGE + 4, RIVEDGE + 0,  RIVER
    ],

    // Autotiling lookup maps for cluster foliage transitions (0-15 bitindex)
    T_ED_TAB: [
        0, 0, 0, 34,
        0, 0, 36, 35,
        0, 32, 0, 33,
        30, 31, 29, 37
    ]
});