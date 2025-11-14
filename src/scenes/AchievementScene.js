/**
 * AchievementScene.js
 *
 * Displays all achievements with progress tracking
 */

import { ProgressionSystem } from '../systems/ProgressionSystem.js';
import { ELEMENTS } from '../config/elements.js';
import { soundFX } from '../systems/SoundFX.js';

export default class AchievementScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AchievementScene' });
    }

    create() {
        this.progression = new ProgressionSystem();
        const data = this.progression.getData();

        // Background (fixed, not scrollable)
        this.add.rectangle(400, 300, 800, 600, 0x0a0a1a).setScrollFactor(0);

        // Title (fixed)
        this.add.text(400, 50, "ACHIEVEMENTS", {
            fontSize: "48px",
            fill: "#ffd700",
            fontFamily: "Courier New",
            fontStyle: "bold"
        }).setOrigin(0.5).setScrollFactor(0);

        // Achievement count (fixed)
        const count = this.progression.getAchievementCount();
        this.add.text(400, 105, `${count.unlocked} / ${count.total} Unlocked`, {
            fontSize: "20px",
            fill: "#00ff88",
            fontFamily: "Courier New"
        }).setOrigin(0.5).setScrollFactor(0);

        // Scrollable container for achievements
        // Get all achievement IDs dynamically
        const achievementIds = Object.keys(data.achievements);
        const startY = 150;
        const spacing = 110;

        // Create scrollable achievement displays
        achievementIds.forEach((id, index) => {
            this.createAchievementDisplay(id, startY + index * spacing);
        });

        // Calculate total content height
        const contentHeight = startY + (achievementIds.length * spacing) + 100;

        // Set camera bounds for scrolling (only if content exceeds viewport)
        if (contentHeight > 600) {
            this.cameras.main.setBounds(0, 0, 800, contentHeight);
            this.cameras.main.setScroll(0, 0);

            // Add scroll functionality
            this.setupScrolling(contentHeight);

            // Add scroll indicators
            this.createScrollIndicators();
        }

        // Back button (fixed at bottom)
        this.createBackButton();
    }

    /**
     * Create achievement display panel
     * @param {string} achievementId - Achievement ID
     * @param {number} y - Y position
     */
    createAchievementDisplay(achievementId, y) {
        const data = this.progression.getData();
        const achievement = data.achievements[achievementId];
        const progress = this.progression.getAchievementProgress(achievementId);

        const isUnlocked = achievement.unlocked;

        // Background panel
        const panel = this.add.graphics();
        if (isUnlocked) {
            panel.fillStyle(0x1a2a1a, 0.9); // Green tint for unlocked
            panel.fillRect(100, y, 600, 100);
            panel.lineStyle(3, 0x00ff88, 1);
            panel.strokeRect(100, y, 600, 100);
        } else {
            panel.fillStyle(0x1a1a2a, 0.7); // Dark for locked
            panel.fillRect(100, y, 600, 100);
            panel.lineStyle(3, 0x4a4a5a, 1);
            panel.strokeRect(100, y, 600, 100);
        }

        // Icon (grayscale filter if locked)
        const icon = this.add.text(140, y + 35, achievement.icon, {
            fontSize: "48px"
        }).setOrigin(0.5);

        if (!isUnlocked) {
            icon.setAlpha(0.4);
        }

        // Name
        const nameColor = isUnlocked ? "#ffd700" : "#888888";
        this.add.text(200, y + 20, achievement.name, {
            fontSize: "20px",
            fill: nameColor,
            fontFamily: "Courier New",
            fontStyle: "bold"
        });

        // Status badge
        const statusText = isUnlocked ? "[UNLOCKED]" : "[LOCKED]";
        const statusColor = isUnlocked ? "#00ff88" : "#666666";
        this.add.text(650, y + 20, statusText, {
            fontSize: "16px",
            fill: statusColor,
            fontFamily: "Courier New",
            fontStyle: "bold"
        }).setOrigin(1, 0);

        // Description
        this.add.text(200, y + 45, achievement.description, {
            fontSize: "14px",
            fill: "#aaaaaa",
            fontFamily: "Courier New"
        });

        // Progress bar
        this.drawProgressBar(200, y + 70, 450, 12, progress.percentage, isUnlocked);

        // Progress text
        const progressText = this.getProgressText(achievementId, progress, achievement);
        this.add.text(200, y + 88, progressText, {
            fontSize: "12px",
            fill: isUnlocked ? "#00ff88" : "#888888",
            fontFamily: "Courier New"
        });

        // Unlocked date (if unlocked)
        if (isUnlocked && achievement.unlockedAt) {
            const date = new Date(achievement.unlockedAt);
            const dateStr = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            this.add.text(650, y + 88, `Unlocked: ${dateStr}`, {
                fontSize: "11px",
                fill: "#666666",
                fontFamily: "Courier New",
                fontStyle: "italic"
            }).setOrigin(1, 0);
        }
    }

    /**
     * Draw progress bar
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Bar width
     * @param {number} height - Bar height
     * @param {number} percentage - Progress percentage (0-100)
     * @param {boolean} isUnlocked - Whether achievement is unlocked
     */
    drawProgressBar(x, y, width, height, percentage, isUnlocked) {
        // Background
        const bg = this.add.graphics();
        bg.fillStyle(0x2a2a2a, 1);
        bg.fillRect(x, y, width, height);

        // Progress fill
        const fillWidth = (width * percentage) / 100;
        const fill = this.add.graphics();
        if (isUnlocked) {
            fill.fillStyle(0x00ff88, 1);
        } else {
            fill.fillStyle(0x4a4a5a, 1);
        }
        fill.fillRect(x, y, fillWidth, height);

        // Border
        const border = this.add.graphics();
        border.lineStyle(2, 0x666666, 1);
        border.strokeRect(x, y, width, height);
    }

    /**
     * Get progress text for achievement
     * @param {string} achievementId - Achievement ID
     * @param {Object} progress - Progress data
     * @param {Object} achievement - Achievement data
     * @returns {string} Progress text
     */
    getProgressText(achievementId, progress, achievement) {
        switch (achievementId) {
            case 'firstBlood':
                return `Progress: ${progress.current} / ${progress.target} enemies killed`;

            case 'untouchable':
                if (achievement.unlocked) {
                    return `Completed! Reached Wave ${progress.target} without damage`;
                }
                return `Best: Wave ${progress.current} / ${progress.target} (no damage taken)`;

            case 'elementMaster':
                if (achievement.unlocked) {
                    return `Completed! All 10 elements mastered`;
                }
                const elementIcons = progress.elements.map(el => ELEMENTS[el]?.icon || '?').join(' ');
                return `Progress: ${progress.current} / ${progress.target} elements | Completed: ${elementIcons || 'None'}`;

            case 'speedDemon':
                if (achievement.unlocked) {
                    return `Completed! Wave 10 in ${progress.bestTimeStr}`;
                }
                if (progress.current > 0) {
                    return `Best Time: ${progress.bestTimeStr} (Target: 10:00)`;
                }
                return `Not yet attempted | Target: Reach Wave 10 in under 10:00`;

            default:
                // Handle element master achievements (flameMaster, waterMaster, etc.)
                if (achievementId.endsWith('Master')) {
                    if (achievement.unlocked) {
                        return `Completed! Reached Wave ${progress.current}`;
                    }
                    if (progress.current > 0) {
                        return `Best: Wave ${progress.current} / ${progress.target}`;
                    }
                    return `Not yet attempted | Target: Wave ${progress.target}`;
                }
                return "";
        }
    }

    /**
     * Setup scrolling with mouse wheel and touch
     * @param {number} contentHeight - Total content height
     */
    setupScrolling(contentHeight) {
        // Mouse wheel scrolling
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            const camera = this.cameras.main;
            const scrollSpeed = 30;
            const newY = Phaser.Math.Clamp(
                camera.scrollY + (deltaY > 0 ? scrollSpeed : -scrollSpeed),
                0,
                contentHeight - 600
            );
            camera.setScroll(0, newY);
            this.updateScrollIndicators(newY, contentHeight);
        });

        // Touch/mouse drag scrolling
        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown && this.lastPointerY !== undefined) {
                const camera = this.cameras.main;
                const deltaY = this.lastPointerY - pointer.y;
                const newY = Phaser.Math.Clamp(
                    camera.scrollY + deltaY,
                    0,
                    contentHeight - 600
                );
                camera.setScroll(0, newY);
                this.updateScrollIndicators(newY, contentHeight);
            }
            this.lastPointerY = pointer.y;
        });

        this.input.on('pointerup', () => {
            this.lastPointerY = undefined;
        });
    }

    /**
     * Create scroll indicators (arrows and scrollbar)
     */
    createScrollIndicators() {
        // Up arrow (fixed)
        this.scrollUpIndicator = this.add.text(750, 130, "▲", {
            fontSize: "24px",
            fill: "#666666",
            fontFamily: "Courier New"
        }).setOrigin(0.5).setScrollFactor(0);

        // Down arrow (fixed)
        this.scrollDownIndicator = this.add.text(750, 520, "▼", {
            fontSize: "24px",
            fill: "#00ff88",
            fontFamily: "Courier New"
        }).setOrigin(0.5).setScrollFactor(0);

        // Scrollbar track (fixed)
        this.scrollbarTrack = this.add.graphics().setScrollFactor(0);
        this.scrollbarTrack.fillStyle(0x2a2a2a, 1);
        this.scrollbarTrack.fillRect(745, 160, 10, 350);

        // Scrollbar thumb (fixed, will move)
        this.scrollbarThumb = this.add.graphics().setScrollFactor(0);
        this.updateScrollIndicators(0, this.cameras.main.getBounds().height);
    }

    /**
     * Update scroll indicators based on current scroll position
     * @param {number} scrollY - Current scroll Y position
     * @param {number} contentHeight - Total content height
     */
    updateScrollIndicators(scrollY, contentHeight) {
        if (!this.scrollUpIndicator) return;

        // Update arrow opacity
        this.scrollUpIndicator.setAlpha(scrollY > 0 ? 1 : 0.3);
        this.scrollDownIndicator.setAlpha(scrollY < contentHeight - 600 ? 1 : 0.3);

        // Update scrollbar thumb position
        const trackHeight = 350;
        const thumbHeight = Math.max(30, (600 / contentHeight) * trackHeight);
        const thumbY = 160 + ((scrollY / (contentHeight - 600)) * (trackHeight - thumbHeight));

        this.scrollbarThumb.clear();
        this.scrollbarThumb.fillStyle(0x00ff88, 1);
        this.scrollbarThumb.fillRect(745, thumbY, 10, thumbHeight);
    }

    /**
     * Create back to menu button
     */
    createBackButton() {
        const y = 550;
        const button = this.add.graphics().setScrollFactor(0); // Fixed at bottom
        button.fillStyle(0x4a4a5a, 1);
        button.fillRect(300, y, 200, 40);
        button.setInteractive(
            new Phaser.Geom.Rectangle(300, y, 200, 40),
            Phaser.Geom.Rectangle.Contains
        );

        const buttonText = this.add.text(400, y + 20, "BACK TO MENU", {
            fontSize: "18px",
            fill: "#ffffff",
            fontFamily: "Courier New",
            fontStyle: "bold"
        }).setOrigin(0.5).setScrollFactor(0); // Fixed at bottom

        button.on('pointerover', () => {
            button.clear();
            button.fillStyle(0x5a5a6a, 1);
            button.fillRect(300, y, 200, 40);
            this.input.setDefaultCursor('pointer');
            soundFX.play('hover');
        });

        button.on('pointerout', () => {
            button.clear();
            button.fillStyle(0x4a4a5a, 1);
            button.fillRect(300, y, 200, 40);
            this.input.setDefaultCursor('default');
        });

        button.on('pointerdown', () => {
            soundFX.play('select');
            this.scene.start('CharacterSelectScene');
        });
    }
}
