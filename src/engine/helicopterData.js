/**
 * HelicopterData holds directional steps, radio reporting intervals,
 * and lifecycle metrics for airborne traffic monitors.
 */
export const HelicopterData = {
    SPRITE_KIND: 'COP',
    SOUND_FREQ: 200,
    BASE_ENDURANCE: 1500,
    TRAFFIC_THRESHOLD: 170,
    LANDING_RADIUS: 30,

    // Step multipliers mapping frames 1-8 to pixel displacement velocities
    CDX: [0,  0,  3,  5,  3,  0, -3, -5, -3],
    CDY: [0, -5, -3,  0,  3,  5,  3,  0, -3]
};