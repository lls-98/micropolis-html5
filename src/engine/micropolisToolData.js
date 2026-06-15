/**
 * MicropolisToolData holds the configuration dimensions and catalog 
 * pricing matrix for all player-facing interaction tools.
 */
export const MicropolisToolData = Object.freeze({
    BULLDOZER:   { size: 1, cost: 1 },
    WIRE:        { size: 1, cost: 5 },     // Surcharges apply underwater ($25)
    ROADS:       { size: 1, cost: 10 },    // Surcharges apply over water ($50)
    RAIL:        { size: 1, cost: 20 },     // Surcharges apply underwater ($100)
    RESIDENTIAL: { size: 3, cost: 100 },
    COMMERCIAL:  { size: 3, cost: 100 },
    INDUSTRIAL:  { size: 3, cost: 100 },
    FIRE:        { size: 3, cost: 500 },
    POLICE:      { size: 3, cost: 500 },
    STADIUM:     { size: 4, cost: 5000 },
    PARK:        { size: 1, cost: 10 },
    SEAPORT:     { size: 4, cost: 3000 },
    POWERPLANT:  { size: 4, cost: 3000 },
    NUCLEAR:     { size: 4, cost: 5000 },
    AIRPORT:     { size: 6, cost: 10000 },
    QUERY:       { size: 1, cost: 0 }
});