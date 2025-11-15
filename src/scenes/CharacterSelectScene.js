import { gameState } from '../config/gameState.js';
import { soundFX } from '../systems/SoundFX.js';
import { ProgressionSystem } from '../systems/ProgressionSystem.js';
import { PersistenceSystem } from '../systems/PersistenceSystem.js';

// Character Select Scene
export class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: "CharacterSelectScene" });
    }

    preload() {
        // No assets to load
    }

    create() {
        // Load progression data
        this.progression = new ProgressionSystem();
        const progressionData = this.progression.getData();

        // Check localStorage availability and show warning if not available (v3.4.6)
        this.checkStorageAvailability();

        // Title
        this.add
            .text(400, 110, "BRANDED FOR DEATH", {
                fontSize: "44px",
                fill: "#ffd700",
                fontFamily: "Courier New",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Subtitle (game name)
        this.add
            .text(400, 160, "MAGIC AFFINITY", {
                fontSize: "32px",
                fill: "#87ceeb",
                fontFamily: "Courier New",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Tagline
        this.add
            .text(400, 195, "Master the Elements. Survive the Waves.", {
                fontSize: "16px",
                fill: "#888888",
                fontFamily: "Courier New",
                fontStyle: "italic",
            })
            .setOrigin(0.5);

        // Skill Points Available indicator (if any points)
        if (progressionData.skillTree.pointsAvailable > 0) {
            const pointsText = this.add
                .text(400, 230, `Skill Points Available: ${progressionData.skillTree.pointsAvailable} ✨`, {
                    fontSize: "20px",
                    fill: "#00ff88",
                    fontFamily: "Courier New",
                    fontStyle: "bold",
                })
                .setOrigin(0.5);

            // Pulse animation to draw attention
            this.tweens.add({
                targets: pointsText,
                scale: 1.1,
                duration: 600,
                yoyo: true,
                repeat: -1
            });
        }

        // START GAME button
        this.createStartButton();

        // ACHIEVEMENTS button
        this.createAchievementsButton();

        // SKILL TREE button
        this.createSkillTreeButton();

        // SETTINGS button
        this.createSettingsButton();

        // High Score Display
        if (gameState.highScore > 0) {
            this.add
                .text(
                    400,
                    560,
                    `High Score: ${gameState.highScore}`,
                    {
                        fontSize: "18px",
                        fill: "#4ecdc4",
                        fontFamily: "Courier New",
                    },
                )
                .setOrigin(0.5);
        }

        // Version number (bottom left)
        this.add
            .text(10, 590, "v3.4.6", {
                fontSize: "14px",
                fill: "#666666",
                fontFamily: "Courier New",
            })
            .setOrigin(0, 1);

        // Fullscreen button
        this.createFullscreenButton();
    }

    createStartButton() {
        const button = this.add.graphics();
        button.fillStyle(0x4ecdc4, 1);
        button.fillRect(275, 280, 250, 60);
        button.lineStyle(3, 0xffd700, 1);
        button.strokeRect(275, 280, 250, 60);
        button.setInteractive(new Phaser.Geom.Rectangle(275, 280, 250, 60), Phaser.Geom.Rectangle.Contains);
        button.setDepth(1000);

        const buttonText = this.add
            .text(400, 310, "START GAME", {
                fontSize: "28px",
                fill: "#ffffff",
                fontFamily: "Courier New",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(1001);

        button.on("pointerover", () => {
            button.clear();
            button.fillStyle(0x5cd6d3, 1);
            button.fillRect(275, 280, 250, 60);
            button.lineStyle(3, 0xffd700, 1);
            button.strokeRect(275, 280, 250, 60);
            this.input.setDefaultCursor("pointer");
            buttonText.setScale(1.1);
            soundFX.play("hover");
        });

        button.on("pointerout", () => {
            button.clear();
            button.fillStyle(0x4ecdc4, 1);
            button.fillRect(275, 280, 250, 60);
            button.lineStyle(3, 0xffd700, 1);
            button.strokeRect(275, 280, 250, 60);
            this.input.setDefaultCursor("default");
            buttonText.setScale(1);
        });

        button.on("pointerdown", () => {
            soundFX.play("select");
            gameState.selectedCharacter = "wizard";
            // Select random season for this run
            const seasons = ["spring", "summer", "fall", "winter"];
            gameState.currentSeason =
                seasons[Math.floor(Math.random() * seasons.length)];
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start("GameScene");
            });
        });
    }

    createAchievementsButton() {
        const button = this.add.graphics();
        button.fillStyle(0xffa500, 1);
        button.fillRect(275, 355, 250, 50);
        button.lineStyle(3, 0xffd700, 1);
        button.strokeRect(275, 355, 250, 50);
        button.setInteractive(
            new Phaser.Geom.Rectangle(275, 355, 250, 50),
            Phaser.Geom.Rectangle.Contains
        );
        button.setDepth(1000);

        const buttonText = this.add
            .text(400, 380, "🏆  ACHIEVEMENTS", {
                fontSize: "22px",
                fill: "#ffffff",
                fontFamily: "Courier New",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(1001);

        button.on("pointerover", () => {
            button.clear();
            button.fillStyle(0xffb732, 1);
            button.fillRect(275, 355, 250, 50);
            button.lineStyle(3, 0xffd700, 1);
            button.strokeRect(275, 355, 250, 50);
            this.input.setDefaultCursor("pointer");
            buttonText.setScale(1.1);
            soundFX.play("hover");
        });

        button.on("pointerout", () => {
            button.clear();
            button.fillStyle(0xffa500, 1);
            button.fillRect(275, 355, 250, 50);
            button.lineStyle(3, 0xffd700, 1);
            button.strokeRect(275, 355, 250, 50);
            this.input.setDefaultCursor("default");
            buttonText.setScale(1);
        });

        button.on("pointerdown", () => {
            soundFX.play("select");
            this.scene.start("AchievementScene");
        });
    }

    createSkillTreeButton() {
        const button = this.add.graphics();
        button.fillStyle(0x00cc66, 1);
        button.fillRect(275, 420, 250, 50);
        button.lineStyle(3, 0xffd700, 1);
        button.strokeRect(275, 420, 250, 50);
        button.setInteractive(
            new Phaser.Geom.Rectangle(275, 420, 250, 50),
            Phaser.Geom.Rectangle.Contains
        );
        button.setDepth(1000);

        const buttonText = this.add
            .text(400, 445, "🌳  SKILL TREE", {
                fontSize: "22px",
                fill: "#ffffff",
                fontFamily: "Courier New",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(1001);

        button.on("pointerover", () => {
            button.clear();
            button.fillStyle(0x00dd77, 1);
            button.fillRect(275, 420, 250, 50);
            button.lineStyle(3, 0xffd700, 1);
            button.strokeRect(275, 420, 250, 50);
            this.input.setDefaultCursor("pointer");
            buttonText.setScale(1.1);
            soundFX.play("hover");
        });

        button.on("pointerout", () => {
            button.clear();
            button.fillStyle(0x00cc66, 1);
            button.fillRect(275, 420, 250, 50);
            button.lineStyle(3, 0xffd700, 1);
            button.strokeRect(275, 420, 250, 50);
            this.input.setDefaultCursor("default");
            buttonText.setScale(1);
        });

        button.on("pointerdown", () => {
            soundFX.play("select");
            this.scene.start("SkillTreeScene");
        });
    }

    createSettingsButton() {
        const button = this.add.graphics();
        button.fillStyle(0x6b5b95, 1);
        button.fillRect(275, 485, 250, 50);
        button.lineStyle(3, 0xffd700, 1);
        button.strokeRect(275, 485, 250, 50);
        button.setInteractive(
            new Phaser.Geom.Rectangle(275, 485, 250, 50),
            Phaser.Geom.Rectangle.Contains
        );
        button.setDepth(1000);

        const buttonText = this.add
            .text(400, 510, "⚙️  SETTINGS", {
                fontSize: "22px",
                fill: "#ffffff",
                fontFamily: "Courier New",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(1001);

        button.on("pointerover", () => {
            button.clear();
            button.fillStyle(0x7c6ba6, 1);
            button.fillRect(275, 485, 250, 50);
            button.lineStyle(3, 0xffd700, 1);
            button.strokeRect(275, 485, 250, 50);
            this.input.setDefaultCursor("pointer");
            buttonText.setScale(1.1);
            soundFX.play("hover");
        });

        button.on("pointerout", () => {
            button.clear();
            button.fillStyle(0x6b5b95, 1);
            button.fillRect(275, 485, 250, 50);
            button.lineStyle(3, 0xffd700, 1);
            button.strokeRect(275, 485, 250, 50);
            this.input.setDefaultCursor("default");
            buttonText.setScale(1);
        });

        button.on("pointerdown", () => {
            soundFX.play("select");
            this.scene.start("SettingsScene");
        });
    }

    createFullscreenButton() {
        const fsButton = this.add
            .text(750, 20, "⛶", {
                fontSize: "32px",
                fill: "#ffffff",
                fontFamily: "Arial",
            })
            .setOrigin(0.5)
            .setInteractive();

        fsButton.on("pointerover", () => {
            fsButton.setScale(1.2);
            this.input.setDefaultCursor("pointer");
            soundFX.play("hover");
        });

        fsButton.on("pointerout", () => {
            fsButton.setScale(1);
            this.input.setDefaultCursor("default");
        });

        fsButton.on("pointerdown", () => {
            soundFX.play("select");
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });
    }

    checkStorageAvailability() {
        if (!PersistenceSystem.isAvailable()) {
            // Create semi-transparent overlay
            const overlay = this.add.rectangle(400, 350, 800, 700, 0x000000, 0.8)
                .setDepth(2000)
                .setInteractive();

            // Warning panel
            const panel = this.add.graphics();
            panel.fillStyle(0x330000, 1);
            panel.fillRect(200, 200, 400, 200);
            panel.lineStyle(4, 0xff0000, 1);
            panel.strokeRect(200, 200, 400, 200);
            panel.setDepth(2001);

            // Warning icon
            this.add
                .text(400, 240, "⚠️", {
                    fontSize: "48px"
                })
                .setOrigin(0.5)
                .setDepth(2002);

            // Warning title
            this.add
                .text(400, 290, "Browser Storage Disabled", {
                    fontSize: "20px",
                    fill: "#ff4444",
                    fontFamily: "Courier New",
                    fontStyle: "bold"
                })
                .setOrigin(0.5)
                .setDepth(2002);

            // Warning message
            this.add
                .text(400, 320, "Achievements and progress will NOT save!", {
                    fontSize: "14px",
                    fill: "#ff8888",
                    fontFamily: "Courier New"
                })
                .setOrigin(0.5)
                .setDepth(2002);

            // Dismiss button
            const dismissButton = this.add.graphics();
            dismissButton.fillStyle(0xff4444, 1);
            dismissButton.fillRect(325, 350, 150, 35);
            dismissButton.lineStyle(2, 0xffffff, 1);
            dismissButton.strokeRect(325, 350, 150, 35);
            dismissButton.setDepth(2002);
            dismissButton.setInteractive(
                new Phaser.Geom.Rectangle(325, 350, 150, 35),
                Phaser.Geom.Rectangle.Contains
            );

            const dismissText = this.add
                .text(400, 367, "OK", {
                    fontSize: "18px",
                    fill: "#ffffff",
                    fontFamily: "Courier New",
                    fontStyle: "bold"
                })
                .setOrigin(0.5)
                .setDepth(2003);

            // Hover effect
            dismissButton.on("pointerover", () => {
                dismissButton.clear();
                dismissButton.fillStyle(0xff6666, 1);
                dismissButton.fillRect(325, 350, 150, 35);
                dismissButton.lineStyle(2, 0xffffff, 1);
                dismissButton.strokeRect(325, 350, 150, 35);
                this.input.setDefaultCursor("pointer");
                soundFX.play("hover");
            });

            dismissButton.on("pointerout", () => {
                dismissButton.clear();
                dismissButton.fillStyle(0xff4444, 1);
                dismissButton.fillRect(325, 350, 150, 35);
                dismissButton.lineStyle(2, 0xffffff, 1);
                dismissButton.strokeRect(325, 350, 150, 35);
                this.input.setDefaultCursor("default");
            });

            // Dismiss notification
            dismissButton.on("pointerdown", () => {
                soundFX.play("select");
                overlay.destroy();
                panel.destroy();
                dismissButton.destroy();
                dismissText.destroy();
                // Destroy all text objects
                this.children.list.forEach(child => {
                    if (child.depth >= 2002 && child.type === 'Text') {
                        child.destroy();
                    }
                });
            });
        }
    }
}
