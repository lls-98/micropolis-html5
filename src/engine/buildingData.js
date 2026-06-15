/**
 * BuildingData houses the static costs, footprint grid dimensions,
 * and base tile constant mappings for custom structures.
 */
export const BuildingData = {
    // Structural metadata definitions
    FIRE:         { cost: 500,  size: 3, baseTile: 'FIRESTATION' },
    POLICE:       { cost: 500,  size: 3, baseTile: 'POLICESTATION' },
    POWERPLANT:   { cost: 3000, size: 4, baseTile: 'POWERPLANT' },
    NUCLEAR:      { cost: 5000, size: 4, baseTile: 'NUCLEAR' },
    STADIUM:      { cost: 3000, size: 4, baseTile: 'STADIUM' },
    SEAPORT:      { cost: 3000, size: 4, baseTile: 'PORT' },
    AIRPORT:      { cost: 10000, size: 6, baseTile: 'AIRPORT' }
};