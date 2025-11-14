/**
 * PersistenceSystem.js
 *
 * Handles all LocalStorage save/load operations for meta-progression
 * Includes data validation and corruption recovery
 */

const STORAGE_KEY = 'magicAffinityProgression';
const CURRENT_VERSION = '3.1.3';

export class PersistenceSystem {
    /**
     * Get default progression data structure
     * @returns {Object} Default progression data
     */
    static getDefaultData() {
        return {
            version: CURRENT_VERSION,

            achievements: {
                firstBlood: {
                    id: "firstBlood",
                    name: "First Blood",
                    description: "Kill 100 enemies (lifetime)",
                    icon: "🏆",
                    unlocked: false,
                    progress: 0,
                    target: 100,
                    unlockedAt: null
                },
                untouchable: {
                    id: "untouchable",
                    name: "Untouchable",
                    description: "Reach Wave 6 without taking damage",
                    icon: "🛡️",
                    unlocked: false,
                    bestWaveNoHit: 0,
                    target: 6,
                    unlockedAt: null
                },
                elementMaster: {
                    id: "elementMaster",
                    name: "Element Master",
                    description: "Reach Wave 7 with all 10 elements",
                    icon: "🔮",
                    unlocked: false,
                    elementsCompleted: [],
                    target: 10,
                    unlockedAt: null
                },
                speedDemon: {
                    id: "speedDemon",
                    name: "Speed Demon",
                    description: "Reach Wave 10 in under 10 minutes",
                    icon: "⚡",
                    unlocked: false,
                    bestTime: Infinity,
                    target: 600, // seconds
                    unlockedAt: null
                },
                // Element Master achievements (Wave 11 with each element)
                flameMaster: {
                    id: "flameMaster",
                    name: "Flame Master",
                    description: "Reach Wave 11 with Flame",
                    icon: "🔥",
                    unlocked: false,
                    bestWave: 0,
                    target: 11,
                    unlockedAt: null
                },
                waterMaster: {
                    id: "waterMaster",
                    name: "Water Master",
                    description: "Reach Wave 11 with Water",
                    icon: "💧",
                    unlocked: false,
                    bestWave: 0,
                    target: 11,
                    unlockedAt: null
                },
                electricMaster: {
                    id: "electricMaster",
                    name: "Electric Master",
                    description: "Reach Wave 11 with Electric",
                    icon: "⚡",
                    unlocked: false,
                    bestWave: 0,
                    target: 11,
                    unlockedAt: null
                },
                natureMaster: {
                    id: "natureMaster",
                    name: "Nature Master",
                    description: "Reach Wave 11 with Nature",
                    icon: "🌿",
                    unlocked: false,
                    bestWave: 0,
                    target: 11,
                    unlockedAt: null
                },
                windMaster: {
                    id: "windMaster",
                    name: "Wind Master",
                    description: "Reach Wave 11 with Wind",
                    icon: "💨",
                    unlocked: false,
                    bestWave: 0,
                    target: 11,
                    unlockedAt: null
                },
                terraMaster: {
                    id: "terraMaster",
                    name: "Terra Master",
                    description: "Reach Wave 11 with Terra",
                    icon: "🪨",
                    unlocked: false,
                    bestWave: 0,
                    target: 11,
                    unlockedAt: null
                },
                gravityMaster: {
                    id: "gravityMaster",
                    name: "Gravity Master",
                    description: "Reach Wave 11 with Gravity",
                    icon: "🌌",
                    unlocked: false,
                    bestWave: 0,
                    target: 11,
                    unlockedAt: null
                },
                celestialMaster: {
                    id: "celestialMaster",
                    name: "Celestial Master",
                    description: "Reach Wave 11 with Celestial",
                    icon: "✨",
                    unlocked: false,
                    bestWave: 0,
                    target: 11,
                    unlockedAt: null
                },
                radiantMaster: {
                    id: "radiantMaster",
                    name: "Radiant Master",
                    description: "Reach Wave 11 with Radiant",
                    icon: "☀️",
                    unlocked: false,
                    bestWave: 0,
                    target: 11,
                    unlockedAt: null
                },
                shadowMaster: {
                    id: "shadowMaster",
                    name: "Shadow Master",
                    description: "Reach Wave 11 with Shadow",
                    icon: "🌑",
                    unlocked: false,
                    bestWave: 0,
                    target: 11,
                    unlockedAt: null
                }
            },

            skillTree: {
                totalPointsEarned: 1, // Start with 1 free point
                pointsSpent: 0,
                pointsAvailable: 1,
                skills: {
                    health: 0,  // 0-5 levels
                    damage: 0,  // 0-5 levels
                    speed: 0    // 0-5 levels
                }
            },

            stats: {
                totalEnemiesKilled: 0,
                totalRunsPlayed: 0,
                highestWave: 0,
                totalPlayTime: 0,
                totalLevelsGained: 0
            }
        };
    }

    /**
     * Save progression data to LocalStorage
     * @param {Object} data - Progression data to save
     * @returns {boolean} True if save succeeded, false otherwise
     */
    static save(data) {
        try {
            const jsonString = JSON.stringify(data);
            localStorage.setItem(STORAGE_KEY, jsonString);
            return true;
        } catch (error) {
            console.error('[PersistenceSystem] Failed to save:', error);
            // LocalStorage might be full or disabled
            return false;
        }
    }

    /**
     * Load progression data from LocalStorage
     * @returns {Object} Loaded progression data, or default data if none exists
     */
    static load() {
        try {
            const jsonString = localStorage.getItem(STORAGE_KEY);

            if (!jsonString) {
                // No saved data, return defaults
                console.log('[PersistenceSystem] No saved data found, using defaults');
                return this.getDefaultData();
            }

            const data = JSON.parse(jsonString);

            // Validate data structure
            if (!this.validateData(data)) {
                console.warn('[PersistenceSystem] Invalid data structure, resetting to defaults');
                return this.getDefaultData();
            }

            // Migrate data if version mismatch
            if (data.version !== CURRENT_VERSION) {
                console.log(`[PersistenceSystem] Migrating data from ${data.version} to ${CURRENT_VERSION}`);
                return this.migrateData(data);
            }

            console.log('[PersistenceSystem] Data loaded successfully');
            return data;

        } catch (error) {
            console.error('[PersistenceSystem] Failed to load data:', error);
            // Corrupted data, return defaults
            return this.getDefaultData();
        }
    }

    /**
     * Validate progression data structure
     * @param {Object} data - Data to validate
     * @returns {boolean} True if valid, false otherwise
     */
    static validateData(data) {
        if (!data || typeof data !== 'object') return false;

        // Check required top-level keys
        if (!data.achievements || !data.skillTree || !data.stats) return false;

        // Check achievement structure
        const requiredAchievements = ['firstBlood', 'untouchable', 'elementMaster', 'speedDemon'];
        for (const achId of requiredAchievements) {
            if (!data.achievements[achId]) return false;
        }

        // Check skill tree structure
        if (!data.skillTree.skills) return false;
        if (typeof data.skillTree.skills.health !== 'number') return false;
        if (typeof data.skillTree.skills.damage !== 'number') return false;
        if (typeof data.skillTree.skills.speed !== 'number') return false;

        return true;
    }

    /**
     * Migrate old data to current version
     * @param {Object} oldData - Old version data
     * @returns {Object} Migrated data
     */
    static migrateData(oldData) {
        // Merge with defaults to add any missing fields while preserving old data
        const defaultData = this.getDefaultData();

        // Properly merge achievements: start with defaults, then overlay old unlock status
        const mergedAchievements = {};
        Object.keys(defaultData.achievements).forEach(achId => {
            mergedAchievements[achId] = {
                ...defaultData.achievements[achId],  // Start with default structure
                ...(oldData.achievements?.[achId] || {})  // Overlay old data if exists
            };
        });

        const migratedData = {
            ...defaultData,
            ...oldData,
            version: CURRENT_VERSION,
            achievements: mergedAchievements,
            skillTree: { ...defaultData.skillTree, ...(oldData.skillTree || {}) },
            stats: { ...defaultData.stats, ...(oldData.stats || {}) }
        };

        // Save migrated data
        this.save(migratedData);
        return migratedData;
    }

    /**
     * Reset all progression data
     * @returns {Object} Fresh default data
     */
    static reset() {
        const defaultData = this.getDefaultData();
        this.save(defaultData);
        console.log('[PersistenceSystem] Data reset to defaults');
        return defaultData;
    }

    /**
     * Check if LocalStorage is available
     * @returns {boolean} True if localStorage is available
     */
    static isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get current storage usage (approximate)
     * @returns {number} Bytes used by our data
     */
    static getStorageSize() {
        try {
            const jsonString = localStorage.getItem(STORAGE_KEY);
            return jsonString ? jsonString.length : 0;
        } catch (error) {
            return 0;
        }
    }
}
