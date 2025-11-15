/**
 * ProgressionSystem.js
 *
 * Manages achievement tracking, skill point awarding, and progression logic
 */

import { PersistenceSystem } from './PersistenceSystem.js';

export class ProgressionSystem {
    constructor() {
        this.data = PersistenceSystem.load();
    }

    /**
     * Get current progression data
     * @returns {Object} Current progression data
     */
    getData() {
        return this.data;
    }

    /**
     * Save current progression data
     * @returns {boolean} True if save succeeded
     */
    save() {
        return PersistenceSystem.save(this.data);
    }

    /**
     * Check and update achievement progress after a game run
     * @param {Object} runData - Data from completed run
     * @returns {Array<string>} Array of newly unlocked achievement IDs
     */
    checkAchievements(runData) {
        const newlyUnlocked = [];

        console.log('[ProgressionSystem] Checking achievements with runData:', runData);

        // First Blood: Kill 100 enemies (lifetime)
        if (!this.data.achievements.firstBlood.unlocked) {
            this.data.stats.totalEnemiesKilled += runData.enemiesKilled || 0;
            this.data.achievements.firstBlood.progress = this.data.stats.totalEnemiesKilled;

            console.log(`[ProgressionSystem] First Blood progress: ${this.data.stats.totalEnemiesKilled}/100`);

            if (this.data.stats.totalEnemiesKilled >= 100) {
                this.unlockAchievement('firstBlood');
                newlyUnlocked.push('firstBlood');
            }
        } else {
            console.log('[ProgressionSystem] First Blood already unlocked');
        }

        // Untouchable: Reach Wave 6 without taking damage
        if (!this.data.achievements.untouchable.unlocked) {
            console.log(`[ProgressionSystem] Untouchable check: damageTaken=${runData.damageTaken}, waveReached=${runData.waveReached}`);

            if (runData.damageTaken === 0 && runData.waveReached >= 6) {
                console.log('[ProgressionSystem] Untouchable UNLOCKED!');
                this.unlockAchievement('untouchable');
                newlyUnlocked.push('untouchable');
            } else if (runData.damageTaken === 0) {
                // Track best wave without damage
                this.data.achievements.untouchable.bestWaveNoHit = Math.max(
                    this.data.achievements.untouchable.bestWaveNoHit,
                    runData.waveReached
                );
                console.log(`[ProgressionSystem] Untouchable best wave no-hit: ${this.data.achievements.untouchable.bestWaveNoHit}`);
            }
        } else {
            console.log('[ProgressionSystem] Untouchable already unlocked');
        }

        // Element Master: Reach Wave 7 with all 10 elements
        if (!this.data.achievements.elementMaster.unlocked) {
            console.log(`[ProgressionSystem] Element Master check: element=${runData.element}, waveReached=${runData.waveReached}`);

            if (runData.element && runData.waveReached >= 7) {
                // Add element to completed list if not already there
                if (!this.data.achievements.elementMaster.elementsCompleted.includes(runData.element)) {
                    this.data.achievements.elementMaster.elementsCompleted.push(runData.element);
                    console.log(`[ProgressionSystem] Element Master: Added ${runData.element}. Progress: ${this.data.achievements.elementMaster.elementsCompleted.length}/10`);
                }

                // Check if all 10 elements complete
                if (this.data.achievements.elementMaster.elementsCompleted.length >= 10) {
                    console.log('[ProgressionSystem] Element Master UNLOCKED!');
                    this.unlockAchievement('elementMaster');
                    newlyUnlocked.push('elementMaster');
                }
            }
        } else {
            console.log('[ProgressionSystem] Element Master already unlocked');
        }

        // Speed Demon: Reach Wave 10 in under 10 minutes
        if (!this.data.achievements.speedDemon.unlocked) {
            console.log(`[ProgressionSystem] Speed Demon check: waveReached=${runData.waveReached}, survivalTime=${runData.survivalTime}s`);

            if (runData.waveReached >= 10 && runData.survivalTime <= 600) {
                console.log('[ProgressionSystem] Speed Demon UNLOCKED!');
                this.unlockAchievement('speedDemon');
                newlyUnlocked.push('speedDemon');
            } else if (runData.waveReached >= 10) {
                // Track best time for wave 10+
                this.data.achievements.speedDemon.bestTime = Math.min(
                    this.data.achievements.speedDemon.bestTime,
                    runData.survivalTime
                );
                console.log(`[ProgressionSystem] Speed Demon best time: ${this.data.achievements.speedDemon.bestTime}s`);
            }
        } else {
            console.log('[ProgressionSystem] Speed Demon already unlocked');
        }

        // Element Master achievements: Reach Wave 11 with specific element
        if (runData.element && runData.waveReached >= 11) {
            const elementMasterId = `${runData.element}Master`;
            console.log(`[ProgressionSystem] Element Master check: ${elementMasterId}, waveReached=${runData.waveReached}`);

            if (this.data.achievements[elementMasterId] && !this.data.achievements[elementMasterId].unlocked) {
                console.log(`[ProgressionSystem] ${elementMasterId} UNLOCKED!`);
                this.unlockAchievement(elementMasterId);
                newlyUnlocked.push(elementMasterId);
            } else if (this.data.achievements[elementMasterId]?.unlocked) {
                console.log(`[ProgressionSystem] ${elementMasterId} already unlocked`);
            } else {
                console.log(`[ProgressionSystem] WARNING: Achievement ${elementMasterId} not found in data!`);
            }
        }

        // Track best wave for each element master achievement (even if not unlocked yet)
        if (runData.element) {
            const elementMasterId = `${runData.element}Master`;
            if (this.data.achievements[elementMasterId]) {
                this.data.achievements[elementMasterId].bestWave = Math.max(
                    this.data.achievements[elementMasterId].bestWave || 0,
                    runData.waveReached
                );
            }
        }

        // Update global stats
        this.data.stats.totalRunsPlayed += 1;
        this.data.stats.highestWave = Math.max(this.data.stats.highestWave, runData.waveReached || 0);
        this.data.stats.totalPlayTime += runData.survivalTime || 0;
        this.data.stats.totalLevelsGained += runData.levelReached || 0;

        // Save progress
        const saveSuccess = this.save();
        console.log(`[ProgressionSystem] Save result: ${saveSuccess ? 'SUCCESS' : 'FAILED'}`);
        console.log(`[ProgressionSystem] Newly unlocked achievements:`, newlyUnlocked);

        return newlyUnlocked;
    }

    /**
     * Unlock an achievement and award skill point
     * @param {string} achievementId - ID of achievement to unlock
     */
    unlockAchievement(achievementId) {
        const achievement = this.data.achievements[achievementId];
        if (!achievement || achievement.unlocked) return;

        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();

        // Award 1 skill point per achievement
        this.data.skillTree.totalPointsEarned += 1;
        this.data.skillTree.pointsAvailable += 1;

        console.log(`[ProgressionSystem] Achievement unlocked: ${achievement.name}`);
        console.log(`[ProgressionSystem] +1 Skill Point! (${this.data.skillTree.pointsAvailable} available)`);
    }

    /**
     * Upgrade a skill in the skill tree
     * @param {string} skillName - 'health', 'damage', or 'speed'
     * @returns {boolean} True if upgrade succeeded
     */
    upgradeSkill(skillName) {
        const skills = this.data.skillTree.skills;

        // Validate skill exists
        if (!skills.hasOwnProperty(skillName)) {
            console.error(`[ProgressionSystem] Invalid skill: ${skillName}`);
            return false;
        }

        // Check if at max level
        if (skills[skillName] >= 5) {
            console.warn(`[ProgressionSystem] Skill ${skillName} already at max level`);
            return false;
        }

        // Check if enough points
        if (this.data.skillTree.pointsAvailable <= 0) {
            console.warn(`[ProgressionSystem] Not enough skill points`);
            return false;
        }

        // Upgrade skill
        skills[skillName] += 1;
        this.data.skillTree.pointsSpent += 1;
        this.data.skillTree.pointsAvailable -= 1;

        console.log(`[ProgressionSystem] Upgraded ${skillName} to level ${skills[skillName]}`);

        // Save progress
        this.save();

        return true;
    }

    /**
     * Reset skill tree and refund all points
     * @returns {boolean} True if reset succeeded
     */
    resetSkillTree() {
        const skills = this.data.skillTree.skills;

        // Reset all skills to 0
        skills.health = 0;
        skills.damage = 0;
        skills.speed = 0;

        // Refund all spent points
        this.data.skillTree.pointsAvailable = this.data.skillTree.totalPointsEarned;
        this.data.skillTree.pointsSpent = 0;

        console.log(`[ProgressionSystem] Skill tree reset. ${this.data.skillTree.pointsAvailable} points refunded`);

        // Save progress
        this.save();

        return true;
    }

    /**
     * Get skill bonuses as multipliers
     * @returns {Object} Bonuses for health, damage, speed
     */
    getSkillBonuses() {
        const skills = this.data.skillTree.skills;
        return {
            health: 1 + (skills.health * 0.05),  // +5% per level
            damage: 1 + (skills.damage * 0.05),  // +5% per level
            speed: 1 + (skills.speed * 0.05)     // +5% per level
        };
    }

    /**
     * Get achievement progress for display
     * @param {string} achievementId - ID of achievement
     * @returns {Object} Progress data for UI
     */
    getAchievementProgress(achievementId) {
        const achievement = this.data.achievements[achievementId];
        if (!achievement) return null;

        switch (achievementId) {
            case 'firstBlood':
                return {
                    current: achievement.progress,
                    target: achievement.target,
                    percentage: Math.min(100, (achievement.progress / achievement.target) * 100)
                };

            case 'untouchable':
                return {
                    current: achievement.bestWaveNoHit,
                    target: achievement.target,
                    percentage: Math.min(100, (achievement.bestWaveNoHit / achievement.target) * 100)
                };

            case 'elementMaster':
                return {
                    current: achievement.elementsCompleted.length,
                    target: achievement.target,
                    percentage: Math.min(100, (achievement.elementsCompleted.length / achievement.target) * 100),
                    elements: achievement.elementsCompleted
                };

            case 'speedDemon':
                const bestTime = achievement.bestTime === Infinity ? 0 : achievement.bestTime;
                return {
                    current: bestTime,
                    target: achievement.target,
                    percentage: bestTime > 0 ? Math.min(100, (achievement.target / bestTime) * 100) : 0,
                    bestTimeStr: this.formatTime(bestTime)
                };

            default:
                // Handle element master achievements (flameMaster, waterMaster, etc.)
                if (achievementId.endsWith('Master') && achievement.bestWave !== undefined) {
                    return {
                        current: achievement.bestWave,
                        target: achievement.target,
                        percentage: Math.min(100, (achievement.bestWave / achievement.target) * 100)
                    };
                }
                return null;
        }
    }

    /**
     * Format time in seconds to MM:SS
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Get all unlocked achievements
     * @returns {Array<Object>} Array of unlocked achievements
     */
    getUnlockedAchievements() {
        return Object.values(this.data.achievements).filter(ach => ach.unlocked);
    }

    /**
     * Get total achievement count
     * @returns {Object} Unlocked and total counts
     */
    getAchievementCount() {
        const total = Object.keys(this.data.achievements).length;
        const unlocked = this.getUnlockedAchievements().length;
        return { unlocked, total };
    }

    /**
     * Reset all progression data (for debugging)
     */
    resetAll() {
        this.data = PersistenceSystem.reset();
        console.log('[ProgressionSystem] All progression data reset');
    }
}
