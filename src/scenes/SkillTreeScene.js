/**
 * SkillTreeScene.js
 *
 * Skill tree UI for spending skill points on permanent stat boosts
 */

import { ProgressionSystem } from '../systems/ProgressionSystem.js';
import { soundFX } from '../systems/SoundFX.js';

export default class SkillTreeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SkillTreeScene' });
    }

    create() {
        this.progression = new ProgressionSystem();
        const data = this.progression.getData();

        // Background
        this.add.rectangle(400, 300, 800, 600, 0x0a0a1a);

        // Title
        this.add.text(400, 50, "SKILL TREE", {
            fontSize: "48px",
            fill: "#ffd700",
            fontFamily: "Courier New",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Skill points available
        this.pointsText = this.add.text(400, 110,
            `Skill Points Available: ${data.skillTree.pointsAvailable} ✨`, {
            fontSize: "24px",
            fill: "#00ff88",
            fontFamily: "Courier New",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Create skill displays
        this.createSkillDisplay('health', '❤️', 'Health Boost', '+5% starting HP per level', 180);
        this.createSkillDisplay('damage', '⚔️', 'Damage Boost', '+5% damage per level', 300);
        this.createSkillDisplay('speed', '💨', 'Speed Boost', '+5% movement speed per level', 420);

        // Reset button
        this.createResetButton();

        // Back button
        this.createBackButton();

        // Update all displays
        this.updateAllDisplays();
    }

    /**
     * Create skill display panel
     * @param {string} skillName - 'health', 'damage', or 'speed'
     * @param {string} icon - Emoji icon
     * @param {string} name - Display name
     * @param {string} description - Skill description
     * @param {number} y - Y position
     */
    createSkillDisplay(skillName, icon, name, description, y) {
        const data = this.progression.getData();
        const level = data.skillTree.skills[skillName];

        // Background panel
        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a2a, 0.9);
        panel.fillRect(100, y, 600, 100);
        panel.lineStyle(3, 0x4a4a5a, 1);
        panel.strokeRect(100, y, 600, 100);

        // Icon
        this.add.text(140, y + 50, icon, {
            fontSize: "48px"
        }).setOrigin(0.5);

        // Name
        this.add.text(200, y + 25, name, {
            fontSize: "22px",
            fill: "#ffffff",
            fontFamily: "Courier New",
            fontStyle: "bold"
        });

        // Description
        this.add.text(200, y + 50, description, {
            fontSize: "14px",
            fill: "#aaaaaa",
            fontFamily: "Courier New"
        });

        // FIX: Removed current bonus text display per user request
        // The description alone is sufficient

        // Level indicator with progress circles
        const levelsX = 520;
        for (let i = 0; i < 5; i++) {
            const circle = this.add.graphics();
            const filled = i < level;

            if (filled) {
                circle.fillStyle(0xffd700, 1);
                circle.fillCircle(levelsX + i * 25, y + 35, 8);
            } else {
                circle.lineStyle(2, 0x4a4a5a, 1);
                circle.strokeCircle(levelsX + i * 25, y + 35, 8);
            }
        }

        // Level text - FIX: Moved left to avoid overlapping with circles
        const levelText = this.add.text(levelsX + 45, y + 35,
            `${level}/5`, {
            fontSize: "18px",
            fill: "#ffffff",
            fontFamily: "Courier New",
            fontStyle: "bold"
        }).setOrigin(0, 0.5);
        this[`${skillName}LevelText`] = levelText;

        // Upgrade button
        const buttonX = 550;
        const buttonY = y + 70;
        const buttonWidth = 120;
        const buttonHeight = 35;

        const button = this.add.graphics();
        button.fillStyle(0x00ff88, 1);
        button.fillRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight);
        button.setInteractive(
            new Phaser.Geom.Rectangle(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight),
            Phaser.Geom.Rectangle.Contains
        );

        const buttonText = this.add.text(buttonX, buttonY, "UPGRADE", {
            fontSize: "16px",
            fill: "#000000",
            fontFamily: "Courier New",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this[`${skillName}Button`] = button;
        this[`${skillName}ButtonText`] = buttonText;

        // Button hover
        button.on('pointerover', () => {
            if (this.canUpgrade(skillName)) {
                button.clear();
                button.fillStyle(0x00ffaa, 1);
                button.fillRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight);
                this.input.setDefaultCursor('pointer');
                soundFX.play('hover');
            }
        });

        button.on('pointerout', () => {
            this.input.setDefaultCursor('default');
            this.updateButtonStyle(skillName);
        });

        // Button click
        button.on('pointerdown', () => {
            if (this.canUpgrade(skillName)) {
                soundFX.play('select');
                this.progression.upgradeSkill(skillName);
                this.updateAllDisplays();
            }
        });

        // Store references for updates
        this[`${skillName}Panel`] = panel;
    }

    /**
     * Check if skill can be upgraded
     * @param {string} skillName - Skill to check
     * @returns {boolean} True if can upgrade
     */
    canUpgrade(skillName) {
        const data = this.progression.getData();
        const level = data.skillTree.skills[skillName];
        const hasPoints = data.skillTree.pointsAvailable > 0;
        const notMaxLevel = level < 5;
        return hasPoints && notMaxLevel;
    }

    /**
     * Update button style based on upgrade availability
     * @param {string} skillName - Skill name
     */
    updateButtonStyle(skillName) {
        const button = this[`${skillName}Button`];
        const buttonText = this[`${skillName}ButtonText`];
        const canUpgrade = this.canUpgrade(skillName);

        const buttonX = button.x || (skillName === 'health' ? 550 : skillName === 'damage' ? 550 : 550);
        const buttonY = button.y || (skillName === 'health' ? 250 : skillName === 'damage' ? 370 : 490);
        const buttonWidth = 120;
        const buttonHeight = 35;

        // Get Y position from skill position
        const yPos = skillName === 'health' ? 180 : skillName === 'damage' ? 300 : 420;

        button.clear();
        if (canUpgrade) {
            button.fillStyle(0x00ff88, 1);
            buttonText.setColor('#000000');
        } else {
            button.fillStyle(0x333333, 0.5);
            buttonText.setColor('#666666');
        }
        button.fillRect(550 - buttonWidth/2, yPos + 70 - buttonHeight/2, buttonWidth, buttonHeight);
    }

    /**
     * Update all displays after skill change
     */
    updateAllDisplays() {
        const data = this.progression.getData();

        // Update points text
        this.pointsText.setText(`Skill Points Available: ${data.skillTree.pointsAvailable} ✨`);

        // Pulse animation if points available
        if (data.skillTree.pointsAvailable > 0) {
            this.tweens.add({
                targets: this.pointsText,
                scale: 1.1,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        } else {
            this.tweens.killTweensOf(this.pointsText);
            this.pointsText.setScale(1);
        }

        // Update each skill
        ['health', 'damage', 'speed'].forEach(skillName => {
            const level = data.skillTree.skills[skillName];

            // Update level text
            this[`${skillName}LevelText`].setText(`${level}/5`);

            // Update button style
            this.updateButtonStyle(skillName);

            // Redraw level circles
            this.updateLevelCircles(skillName, level);
        });
    }

    /**
     * Update level indicator circles
     * @param {string} skillName - Skill name
     * @param {number} level - Current level
     */
    updateLevelCircles(skillName, level) {
        const yPos = skillName === 'health' ? 180 : skillName === 'damage' ? 300 : 420;
        const levelsX = 520;

        // Clear old circles and redraw
        for (let i = 0; i < 5; i++) {
            const circle = this.add.graphics();
            const filled = i < level;

            if (filled) {
                circle.fillStyle(0xffd700, 1);
                circle.fillCircle(levelsX + i * 25, yPos + 35, 8);
            } else {
                circle.lineStyle(2, 0x4a4a5a, 1);
                circle.strokeCircle(levelsX + i * 25, yPos + 35, 8);
            }
        }
    }

    /**
     * Get bonus description text
     * @param {string} skillName - Skill name
     * @param {number} level - Current level
     * @returns {string} Bonus text
     */
    getBonusText(skillName, level) {
        const bonusPercent = level * 5;

        if (level === 0) {
            return "Current: No bonus";
        }

        switch (skillName) {
            case 'health':
                const newHP = Math.floor(50 * (1 + level * 0.05));
                return `Current: +${bonusPercent}% HP (50 → ${newHP} HP)`;
            case 'damage':
                const newDmg = Math.floor(20 * (1 + level * 0.05));
                return `Current: +${bonusPercent}% DMG (20 → ${newDmg} dmg)`;
            case 'speed':
                const newSpd = Math.floor(140 * (1 + level * 0.05));
                return `Current: +${bonusPercent}% SPD (140 → ${newSpd})`;
            default:
                return "";
        }
    }

    /**
     * Create reset skill tree button
     */
    createResetButton() {
        const y = 550;
        const button = this.add.graphics();
        button.fillStyle(0xff4444, 1);
        button.fillRect(100, y, 200, 40);
        button.setInteractive(
            new Phaser.Geom.Rectangle(100, y, 200, 40),
            Phaser.Geom.Rectangle.Contains
        );

        const buttonText = this.add.text(200, y + 20, "RESET TREE", {
            fontSize: "18px",
            fill: "#ffffff",
            fontFamily: "Courier New",
            fontStyle: "bold"
        }).setOrigin(0.5);

        button.on('pointerover', () => {
            button.clear();
            button.fillStyle(0xff6666, 1);
            button.fillRect(100, y, 200, 40);
            this.input.setDefaultCursor('pointer');
            soundFX.play('hover');
        });

        button.on('pointerout', () => {
            button.clear();
            button.fillStyle(0xff4444, 1);
            button.fillRect(100, y, 200, 40);
            this.input.setDefaultCursor('default');
        });

        button.on('pointerdown', () => {
            const data = this.progression.getData();
            if (data.skillTree.pointsSpent > 0) {
                soundFX.play('select');
                this.progression.resetSkillTree();
                this.updateAllDisplays();
            }
        });
    }

    /**
     * Create back to menu button
     */
    createBackButton() {
        const y = 550;
        const button = this.add.graphics();
        button.fillStyle(0x4a4a5a, 1);
        button.fillRect(500, y, 200, 40);
        button.setInteractive(
            new Phaser.Geom.Rectangle(500, y, 200, 40),
            Phaser.Geom.Rectangle.Contains
        );

        const buttonText = this.add.text(600, y + 20, "BACK TO MENU", {
            fontSize: "18px",
            fill: "#ffffff",
            fontFamily: "Courier New",
            fontStyle: "bold"
        }).setOrigin(0.5);

        button.on('pointerover', () => {
            button.clear();
            button.fillStyle(0x5a5a6a, 1);
            button.fillRect(500, y, 200, 40);
            this.input.setDefaultCursor('pointer');
            soundFX.play('hover');
        });

        button.on('pointerout', () => {
            button.clear();
            button.fillStyle(0x4a4a5a, 1);
            button.fillRect(500, y, 200, 40);
            this.input.setDefaultCursor('default');
        });

        button.on('pointerdown', () => {
            soundFX.play('select');
            this.scene.start('CharacterSelectScene');
        });
    }
}
