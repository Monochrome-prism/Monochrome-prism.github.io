/**
 * WaveSystem.js
 *
 * Manages wave progression, boss wave detection, and enemy spawning orchestration
 * Handles wave start/completion, enemy spawn scheduling, and wave difficulty scaling
 */

import { soundFX } from './SoundFX.js';

export class WaveSystem {
    /**
     * Create a new WaveSystem
     * @param {Phaser.Scene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;

        // Wave state
        this.currentWave = 1;
        this.enemiesThisWave = 5; // Starting number of enemies
        this.enemiesSpawned = 0;
        this.enemiesAlive = 0;
        this.isBossWave = false;
    }

    /**
     * Get current wave number
     * @returns {number} Current wave
     */
    getCurrentWave() {
        return this.currentWave;
    }

    /**
     * Get number of enemies for current wave
     * @returns {number} Enemies in this wave
     */
    getEnemiesThisWave() {
        return this.enemiesThisWave;
    }

    /**
     * Increment enemies alive counter
     * @returns {void}
     */
    incrementEnemiesAlive() {
        this.enemiesAlive++;
    }

    /**
     * Decrement enemies alive counter
     * @returns {void}
     */
    decrementEnemiesAlive() {
        this.enemiesAlive--;
    }

    /**
     * Get enemies alive count
     * @returns {number} Current enemies alive
     */
    getEnemiesAlive() {
        return this.enemiesAlive;
    }

    /**
     * Check if current wave is a boss wave
     * @returns {boolean} True if boss wave
     */
    getIsBossWave() {
        return this.isBossWave;
    }

    /**
     * Start a new wave
     * Spawns enemies based on wave number and boss status
     * @param {Object} callbacks - Callback functions
     * @param {Function} callbacks.spawnBoss - Function to spawn boss
     * @param {Function} callbacks.spawnEnemy - Function to spawn regular enemy
     * @param {Function|null} [callbacks.repositionHazards] - Optional hazard reposition
     * @param {import('./UISystem.js').UISystem} uiSystem - UI system for updates
     * @returns {void}
     */
    startWave(callbacks, uiSystem) {
        uiSystem.updateWave(this.currentWave);
        this.enemiesSpawned = 0;
        this.enemiesAlive = 0;

        // Relocate hazards to new positions each wave
        if (this.currentWave > 1 && callbacks.repositionHazards) {
            callbacks.repositionHazards();
        }

        // Check if this is a boss wave (every 5 waves)
        this.isBossWave = this.currentWave % 5 === 0;

        if (this.isBossWave) {
            // Boss wave! Spawn boss first
            callbacks.spawnBoss();
            // Only spawn 3 additional regular enemies with boss
            const additionalEnemies = 3;

            // Spawn additional enemies over time (if any)
            if (additionalEnemies > 0) {
                this.scene.time.addEvent({
                    delay: 800,
                    callback: () => {
                        if (this.enemiesSpawned < additionalEnemies) {
                            callbacks.spawnEnemy();
                            this.enemiesSpawned++;
                        }
                    },
                    repeat: additionalEnemies - 1,
                });
            }
        } else {
            // Regular wave - spawn enemies over time
            this.scene.time.addEvent({
                delay: 800,
                callback: () => {
                    if (this.enemiesSpawned < this.enemiesThisWave) {
                        callbacks.spawnEnemy();
                        this.enemiesSpawned++;
                    }
                },
                repeat: this.enemiesThisWave - 1,
            });
        }
    }

    /**
     * Complete the current wave and prepare for next
     * Automatically starts next wave after 2 second delay
     * @returns {void}
     */
    completeWave() {
        this.currentWave++;
        this.enemiesThisWave = Math.floor(
            this.enemiesThisWave * 1.3,
        );

        // Mobile optimization: cap enemy count to prevent lag
        if (this.scene.isMobile) {
            this.enemiesThisWave = Math.min(this.enemiesThisWave, 15);
        }

        // Show wave complete message
        this.showWaveCompleteMessage();

        // Auto-start next wave after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            this.scene.startWave();
        });
    }

    /**
     * Show wave complete message
     * @private
     * @returns {void}
     */
    showWaveCompleteMessage() {
        const message = this.scene.add
            .text(400, 250, `Wave ${this.currentWave - 1} Complete!`, {
                fontSize: "36px",
                fill: "#00ff00",
                fontFamily: "Courier New",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 4,
            })
            .setOrigin(0.5);

        this.scene.tweens.add({
            targets: message,
            alpha: 0,
            y: 200,
            duration: 2000,
            onComplete: () => message.destroy(),
        });
    }

    /**
     * Get enemies spawned count
     * @returns {number} Enemies spawned in current wave
     */
    getEnemiesSpawned() {
        return this.enemiesSpawned;
    }
}
