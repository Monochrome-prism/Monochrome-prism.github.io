/**
 * Global Game State
 * Shared state across all scenes
 */

/**
 * @typedef {Object} GameState
 * @property {string|null} selectedCharacter - Character type (always 'suited man' now)
 * @property {number} currentLevel - Current player level
 * @property {number} totalXP - Total XP accumulated
 * @property {number} enemiesKilled - Total enemies killed
 * @property {number} survivalTime - Survival time in seconds
 * @property {number} highScore - Session high score
 * @property {import('../types/game-types.js').Season|null} currentSeason - Current map season
 * @property {number} masterVolume - Master volume (0-1)
 * @property {number} musicVolume - Music volume (0-1)
 * @property {number} sfxVolume - SFX volume (0-1)
 * @property {number} damageTaken - Damage taken this run (for Untouchable achievement)
 * @property {number} waveReached - Highest wave reached this run
 * @property {string|null} elementUsed - Element selected this run (for Element Master)
 * @property {number} levelReached - Highest level reached this run
 */

/** @type {GameState} */
export const gameState = {
    selectedCharacter: null,
    currentLevel: 1,
    totalXP: 0,
    enemiesKilled: 0,
    survivalTime: 0,
    highScore: 0,
    currentSeason: null, // spring, summer, fall, winter
    masterVolume: 1.0,
    musicVolume: 1.0,
    sfxVolume: 1.0,
    // Achievement tracking (reset each run)
    damageTaken: 0,
    waveReached: 0,
    elementUsed: null,
    levelReached: 1,
};
