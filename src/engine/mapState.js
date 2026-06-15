/**
 * MapState lists the various map overlay options available.
 * Ports MapState.java.
 */
export const MapState = Object.freeze({
    ALL:                'ALL',
    RESIDENTIAL:        'RESIDENTIAL',
    COMMERCIAL:         'COMMERCIAL',
    INDUSTRIAL:         'INDUSTRIAL',
    TRANSPORT:          'TRANSPORT',
    POPDEN_OVERLAY:     'POPDEN_OVERLAY',
    GROWTHRATE_OVERLAY: 'GROWTHRATE_OVERLAY',
    LANDVALUE_OVERLAY:  'LANDVALUE_OVERLAY',
    CRIME_OVERLAY:      'CRIME_OVERLAY',
    POLLUTE_OVERLAY:    'POLLUTE_OVERLAY',
    TRAFFIC_OVERLAY:    'TRAFFIC_OVERLAY',
    POWER_OVERLAY:      'POWER_OVERLAY',
    FIRE_OVERLAY:       'FIRE_OVERLAY',
    POLICE_OVERLAY:     'POLICE_OVERLAY'
});

/**
 * Validates whether a provided string value matches a registered MapState token.
 * @param {string} state - The view overlay string key to verify
 * @returns {boolean} True if the token is valid
 */
export function isValidMapState(state) {
    return Object.values(MapState).includes(state);
}