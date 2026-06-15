/**
 * MapState lists the various map overlay options available.
 * Ports MapState.java.
 */
export const MapState = Object.freeze({
    ALL: 'ALL',                         // ALMAP
    RESIDENTIAL: 'RESIDENTIAL',         // REMAP
    COMMERCIAL: 'COMMERCIAL',           // COMAP
    INDUSTRIAL: 'INDUSTRIAL',           // INMAP
    TRANSPORT: 'TRANSPORT',             // RDMAP
    POPDEN_OVERLAY: 'POPDEN_OVERLAY',     // PDMAP
    GROWTHRATE_OVERLAY: 'GROWTHRATE_OVERLAY', // RGMAP
    LANDVALUE_OVERLAY: 'LANDVALUE_OVERLAY',  // LVMAP
    CRIME_OVERLAY: 'CRIME_OVERLAY',       // CRMAP
    POLLUTE_OVERLAY: 'POLLUTE_OVERLAY',     // PLMAP
    TRAFFIC_OVERLAY: 'TRAFFIC_OVERLAY',     // TDMAP
    POWER_OVERLAY: 'POWER_OVERLAY',       // PRMAP
    FIRE_OVERLAY: 'FIRE_OVERLAY',         // FIMAP
    POLICE_OVERLAY: 'POLICE_OVERLAY'      // POMAP
});

/**
 * Validates whether a provided string value matches a registered MapState token.
 * @param {string} state - The view overlay string key to verify
 * @returns {boolean} True if the token is valid
 */
export function isValidMapState(state) {
    return Object.values(MapState).includes(state);
}