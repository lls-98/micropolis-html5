/**
 * ExplosionData defines pixel sizes, animation limits, 
 * and directional post-blast combustion coordinates.
 */
export const ExplosionData = {
    SPRITE_KIND: 'EXP',
    DIMENSION: 48,
    OFFSET: -24,
    MAX_FRAMES: 6,
    
    // 5-point cross coordinate offsets for fire spawning
    FIRE_SCATTER_GRID: [
        { dx:  0, dy:  0 }, // Center
        { dx: -1, dy: -1 }, // Top-Left
        { dx:  1, dy: -1 }, // Top-Right
        { dx: -1, dy:  1 }, // Bottom-Left
        { dx:  1, dy:  1 }  // Bottom-Right
    ]
};