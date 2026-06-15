import { GameLevelData } from './gameLevelData.js';

/**
 * GameLevel provides validation and fund queries based on difficulty settings.
 * Ports GameLevel.java.
 */
export const GameLevel = {
    /**
     * Checks if a level value falls within the legal boundaries.
     * @param {number} lev - The difficulty level index (0-2)
     * @returns {boolean} True if within legal boundaries
     */
    isValid(lev) {
        return (
            typeof lev === 'number' &&
            lev >= GameLevelData.MIN_LEVEL &&
            lev <= GameLevelData.MAX_LEVEL
        );
    },

    /**
     * Retrieves the starting balance for a valid difficulty tier.
     * @param {number} lev - The difficulty level index (0-2)
     * @returns {number} Initial starting funds matching selection
     */
    getStartingFunds(lev) {
        if (!this.isValid(lev)) {
            throw new Error(`Unexpected game level value matching query: ${lev}`);
        }

        // Loop through configured levels to locate a matching ID match
        const levelConfig = Object.values(GameLevelData.LEVELS).find(item => item.id === lev);
        return levelConfig ? levelConfig.funds : 20000;
    }
};