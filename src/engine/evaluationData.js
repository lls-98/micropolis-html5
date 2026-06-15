/**
 * EvaluationData holds the mathematical multipliers, bracket boundaries,
 * and key enumerations for civic analytics scoring.
 */
export const EvaluationData = {
    // Structural multiplier values for city asset calculations
    ASSET_WEIGHTS: {
        ROAD: 5,
        RAIL: 10,
        POLICE: 1000,
        FIRE: 1000,
        HOSPITAL: 400,
        STADIUM: 3000,
        SEAPORT: 5000,
        AIRPORT: 10000,
        COAL: 3000,
        NUCLEAR: 6000
    },

    // Population brackets for determining city tier names
    TIERS: [
        { max: 2000,   classID: 0, label: 'VILLAGE' },
        { max: 10000,  classID: 1, label: 'TOWN' },
        { max: 50000,  classID: 2, label: 'CITY' },
        { max: 100000, classID: 3, label: 'CAPITAL' },
        { max: 500000, classID: 4, label: 'METROPOLIS' },
        { max: Infinity, classID: 5, label: 'MEGALOPOLIS' }
    ]
};