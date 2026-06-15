/**
 * Disaster provides an immutable string dictionary for the primary crises 
 * that can befall the city grid. Ports Disaster.java.
 * @type {Readonly<{
 * MONSTER: string,
 * FIRE: string,
 * FLOOD: string,
 * MELTDOWN: string,
 * TORNADO: string,
 * EARTHQUAKE: string
 * }>}
 */
export const Disaster = Object.freeze({
    MONSTER: 'MONSTER',
    FIRE: 'FIRE',
    FLOOD: 'FLOOD',
    MELTDOWN: 'MELTDOWN',
    TORNADO: 'TORNADO',
    EARTHQUAKE: 'EARTHQUAKE'
});