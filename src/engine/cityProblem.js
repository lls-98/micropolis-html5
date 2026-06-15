/**
 * CityProblem provides a uniform, immutable string dictionary for the 
 * primary urban complaints raised during public opinion polls.
 * Ports CityProblem.java.
 * * @type {Readonly<{
 * CRIME: string,
 * POLLUTION: string,
 * HOUSING: string,
 * TAXES: string,
 * TRAFFIC: string,
 * UNEMPLOYMENT: string,
 * FIRE: string
 * }>}
 */
export const CityProblem = Object.freeze({
    CRIME: 'CRIME',
    POLLUTION: 'POLLUTION',
    HOUSING: 'HOUSING',
    TAXES: 'TAXES',
    TRAFFIC: 'TRAFFIC',
    UNEMPLOYMENT: 'UNEMPLOYMENT',
    FIRE: 'FIRE'
});