/**
 * AirplaneData defines the physics movement vectors, dimensions,
 * and structural metadata constants for the airplane entity.
 */
export const AirplaneData = {
    SPRITE_KIND: 'AIR',
    
    // Bounding dimensions for collision calculations
    WIDTH: 48,
    HEIGHT: 48,
    
    // Core render offsets to keep the sprite centered on its anchor point
    OFF_X: -24,
    OFF_Y: -24,

    // Step pixel delta displacement matrices matching CDx/CDy from AirplaneSprite.java
    // Frames 1-8 are compass headings. Frames 9-11 are customized takeoff trajectories.
    CDX: [0,  0,  6,  8,  6,  0, -6, -8, -6,  8,  8,  8],
    CDY: [0, -8, -6,  0,  6,  8,  6,  0, -6,  0,  0,  0]
};