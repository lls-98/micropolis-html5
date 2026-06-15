/**
 * GameLevelData houses baseline treasury configs and validation bounds
 * for municipal difficulty configurations.
 */
export const GameLevelData = Object.freeze({
    MIN_LEVEL: 0,
    MAX_LEVEL: 2,

    // Uniform mapping for readability and difficulty configurations
    LEVELS: {
        EASY:   { id: 0, label: 'EASY',   funds: 20000 },
        MEDIUM: { id: 1, label: 'MEDIUM', funds: 10000 },
        HARD:   { id: 2, label: 'HARD',   funds: 5000  }
    }
});