/**
 * UISystem.js
 *
 * Manages all UI elements and updates for the game
 * Handles health bars, XP bars, wave text, score, time display, and boss health bar
 */

import { ELEMENTS } from '../config/elements.js';

export class UISystem {
    /**
     * Create a new UISystem
     * @param {Phaser.Scene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;

        // UI element references
        this.charNameText = null;
        this.levelText = null;
        this.hpBar = null;
        this.hpBarBg = null;
        this.hpValueText = null; // HP numeric display (v3.4.5)
        this.xpBar = null;
        this.xpBarBg = null;
        this.xpValueText = null; // XP numeric display (v3.4.5)
        this.waveText = null;
        this.scoreText = null;
        this.timeText = null;

        // Boss UI elements
        this.bossHealthBarBg = null;
        this.bossNameText = null;
        this.bossHealthBar = null;

        // Low HP pulse tracking (v3.4.5)
        this.lastLowHPPulse = 0;
    }

    /**
     * Create all UI elements for the game
     * @returns {void}
     */
    createUI() {
        // Get mobile scale for UI fonts
        const scale = this.scene.mobileScale;

        // UI Separator Line (divides game area from UI panel)
        const separatorGraphics = this.scene.add.graphics();
        separatorGraphics.lineStyle(3, 0x4a4a5a, 1);
        separatorGraphics.lineBetween(0, 600, 800, 600);
        separatorGraphics.setDepth(999);

        // UI Background (left panel - now at bottom)
        const uiGraphics = this.scene.add.graphics();
        uiGraphics.fillStyle(0x0f0f1e, 0.9);
        uiGraphics.fillRect(10, 610, 300, 80);
        uiGraphics.lineStyle(2, 0x4a4a5a, 1);
        uiGraphics.strokeRect(10, 610, 300, 80);
        uiGraphics.setDepth(1000);

        // Character name (will update when element is chosen)
        this.charNameText = this.scene.add
            .text(20, 615, "NUXX", {
                fontSize: `${Math.floor(14 * scale)}px`,
                fill: "#ffd700",
                fontFamily: "Courier New",
                fontStyle: "bold",
            })
            .setDepth(1001);

        // Level
        this.levelText = this.scene.add
            .text(20, 632, "Level: 1", {
                fontSize: `${Math.floor(12 * scale)}px`,
                fill: "#ffffff",
                fontFamily: "Courier New",
            })
            .setDepth(1001);

        // HP Bar
        this.scene.add
            .text(20, 650, "HP", {
                fontSize: `${Math.floor(10 * scale)}px`,
                fill: "#ffffff",
                fontFamily: "Courier New",
            })
            .setDepth(1001);

        this.hpBarBg = this.scene.add.graphics();
        this.hpBarBg.fillStyle(0x8b0000, 1);
        this.hpBarBg.fillRect(50, 651, 250, 8);
        this.hpBarBg.setDepth(1000);

        this.hpBar = this.scene.add.graphics();
        this.hpBar.setDepth(1001);

        // HP numeric display (v3.4.5 - larger with stroke)
        this.hpValueText = this.scene.add
            .text(220, 649, "50/50", {
                fontSize: `${Math.floor(14 * scale)}px`,
                fill: "#ffffff",
                fontFamily: "Courier New",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 3
            })
            .setDepth(1001)
            .setOrigin(0, 0);

        // XP Bar
        this.scene.add
            .text(20, 668, "XP", {
                fontSize: `${Math.floor(10 * scale)}px`,
                fill: "#ffffff",
                fontFamily: "Courier New",
            })
            .setDepth(1001);

        this.xpBarBg = this.scene.add.graphics();
        this.xpBarBg.fillStyle(0x00008b, 1);
        this.xpBarBg.fillRect(50, 669, 250, 8);
        this.xpBarBg.setDepth(1000);

        this.xpBar = this.scene.add.graphics();
        this.xpBar.setDepth(1001);

        // XP numeric display (v3.4.5 - larger with stroke)
        this.xpValueText = this.scene.add
            .text(220, 667, "0/50", {
                fontSize: `${Math.floor(14 * scale)}px`,
                fill: "#ffffff",
                fontFamily: "Courier New",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 3
            })
            .setDepth(1001)
            .setOrigin(0, 0);

        // Wave and Score info (bottom right)
        const rightUIGraphics = this.scene.add.graphics();
        rightUIGraphics.fillStyle(0x0f0f1e, 0.9);
        rightUIGraphics.fillRect(490, 610, 300, 80);
        rightUIGraphics.lineStyle(2, 0x4a4a5a, 1);
        rightUIGraphics.strokeRect(490, 610, 300, 80);
        rightUIGraphics.setDepth(1000);

        this.waveText = this.scene.add
            .text(500, 615, "Wave: 1", {
                fontSize: `${Math.floor(16 * scale)}px`,
                fill: "#ff6b6b",
                fontFamily: "Courier New",
                fontStyle: "bold",
            })
            .setDepth(1001);

        this.scoreText = this.scene.add
            .text(500, 638, "Score: 0", {
                fontSize: `${Math.floor(14 * scale)}px`,
                fill: "#4ecdc4",
                fontFamily: "Courier New",
            })
            .setDepth(1001);

        this.timeText = this.scene.add
            .text(500, 660, "Time: 0:00", {
                fontSize: `${Math.floor(12 * scale)}px`,
                fill: "#ffffff",
                fontFamily: "Courier New",
            })
            .setDepth(1001);

        // ESC button in top left corner
        const escButton = this.scene.add
            .text(20, 20, "[ESC] Stats", {
                fontSize: `${Math.floor(14 * scale)}px`,
                fill: "#00ff88",
                fontFamily: "Courier New",
                fontStyle: "bold",
            })
            .setDepth(1001)
            .setInteractive({ useHandCursor: true });

        // Add hover effect
        escButton.on("pointerover", () => {
            escButton.setFill("#00ffff");
        });
        escButton.on("pointerout", () => {
            escButton.setFill("#00ff88");
        });

        // Click to toggle stats screen
        escButton.on("pointerdown", () => {
            this.scene.toggleStatsScreen();
        });
    }

    /**
     * Update the player health bar
     * @param {import('../types/game-types.js').Player} player - Player object with health and maxHealth
     * @returns {void}
     */
    updateHealthBar(player) {
        // Use actual health percent (v3.4.5 - removed lerp to fix visual bug)
        const healthPercent = Math.max(0, player.health / player.maxHealth);

        // Clear and redraw
        this.hpBar.clear();

        let color = 0xff0000;
        if (healthPercent > 0.5) color = 0x00ff00;
        else if (healthPercent > 0.25) color = 0xffa500;

        // Low HP pulse: Flash red when < 25% HP every 1000ms
        const now = this.scene.time.now;
        if (healthPercent < 0.25 && healthPercent > 0) {
            if (now - this.lastLowHPPulse > 1000) {
                this.lastLowHPPulse = now;
            }
            const pulseProgress = (now - this.lastLowHPPulse) / 1000;
            if (pulseProgress < 0.2) {
                // Flash red for 200ms
                this.hpBar.fillStyle(0xff0000, 1);
                this.hpBar.fillRect(50, 651, 250, 8); // Full width flash
            }
        }

        this.hpBar.fillStyle(color, 1);
        this.hpBar.fillRect(50, 651, 250 * healthPercent, 8);

        // Update numeric HP display (v3.4.5)
        this.hpValueText.setText(`${Math.floor(player.health)}/${player.maxHealth}`);
    }

    /**
     * Update the player XP bar
     * @param {import('../types/game-types.js').Player} player - Player object with xp and xpToNext
     * @returns {void}
     */
    updateXPBar(player) {
        // Use actual XP percent (v3.4.5 - removed lerp to fix visual bug)
        const xpPercent = Math.min(1, Math.max(0, player.xp / player.xpToNext));

        // Clear and redraw
        this.xpBar.clear();
        this.xpBar.fillStyle(0x4169e1, 1);
        this.xpBar.fillRect(50, 669, 250 * xpPercent, 8);

        // Update numeric XP display (v3.4.5)
        this.xpValueText.setText(`${Math.floor(player.xp)}/${player.xpToNext}`);
    }

    /**
     * Update the time display
     * @param {number} survivalTime - Time in seconds
     * @returns {void}
     */
    updateTimeDisplay(survivalTime) {
        const minutes = Math.floor(survivalTime / 60);
        const seconds = survivalTime % 60;
        this.timeText.setText(
            `Time: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`,
        );
    }

    /**
     * Update the level display
     * @param {number} level - Player level
     * @returns {void}
     */
    updateLevel(level) {
        this.levelText.setText(`Level: ${level}`);
    }

    /**
     * Update the wave display
     * @param {number} wave - Current wave number
     * @returns {void}
     */
    updateWave(wave) {
        this.waveText.setText(`Wave: ${wave}`);
    }

    /**
     * Update the score display
     * @param {number} score - Current score
     * @returns {void}
     */
    updateScore(score) {
        this.scoreText.setText(`Score: ${score}`);
    }

    /**
     * Update the character name display with element
     * @param {string} elementName - Name of the element
     * @returns {void}
     */
    updateCharacterName(elementName) {
        // Get element icon from ELEMENTS config
        const elementKey = elementName.toLowerCase();
        const elementIcon = ELEMENTS[elementKey]?.icon || '';

        // Update text with icon before NUXX (v3.4.1)
        this.charNameText.setText(`${elementIcon} NUXX`);
    }

    /**
     * Create or update the boss health bar
     * @param {import('../types/game-types.js').Enemy} boss - Boss enemy object with health and maxHealth
     * @returns {void}
     */
    updateBossHealthBar(boss) {
        // Create boss health bar if it doesn't exist
        if (!this.bossHealthBarBg) {
            // Background
            this.bossHealthBarBg = this.scene.add.graphics();
            this.bossHealthBarBg.fillStyle(0x1a1a1a, 0.9);
            this.bossHealthBarBg.fillRect(200, 110, 400, 40);
            this.bossHealthBarBg.lineStyle(3, 0xff0000, 1);
            this.bossHealthBarBg.strokeRect(200, 110, 400, 40);
            this.bossHealthBarBg.setDepth(1000);

            // Boss name
            this.bossNameText = this.scene.add
                .text(400, 115, "🔥 BOSS 🔥", {
                    fontSize: "16px",
                    fill: "#ff0000",
                    fontFamily: "Courier New",
                    fontStyle: "bold",
                })
                .setOrigin(0.5, 0)
                .setDepth(1001);

            // Health bar
            this.bossHealthBar = this.scene.add.graphics();
            this.bossHealthBar.setDepth(1001);
        }

        // Update boss health bar
        const healthPercent = boss.health / boss.maxHealth;
        this.bossHealthBar.clear();

        // Color gradient based on health
        let color = 0xff0000;
        if (healthPercent > 0.6) color = 0xff6b00;
        else if (healthPercent > 0.3) color = 0xff0000;
        else color = 0x8b0000;

        this.bossHealthBar.fillStyle(color, 1);
        this.bossHealthBar.fillRect(
            205,
            132,
            390 * healthPercent,
            13,
        );

        // Pulsing effect for low health
        if (healthPercent < 0.3) {
            const pulse = Math.sin(Date.now() / 100) * 0.2 + 0.8;
            this.bossHealthBar.setAlpha(pulse);
        } else {
            this.bossHealthBar.setAlpha(1);
        }
    }

    /**
     * Destroy the boss health bar
     * Call this when the boss dies
     * @returns {void}
     */
    destroyBossHealthBar() {
        if (this.bossHealthBarBg) {
            this.bossHealthBarBg.destroy();
            this.bossHealthBarBg = null;
        }
        if (this.bossNameText) {
            this.bossNameText.destroy();
            this.bossNameText = null;
        }
        if (this.bossHealthBar) {
            this.bossHealthBar.destroy();
            this.bossHealthBar = null;
        }
    }
}
