import { gameState } from '../config/gameState.js';
import { soundFX } from '../systems/SoundFX.js';
import { ProgressionSystem } from '../systems/ProgressionSystem.js';
import { NotificationHelper } from '../utils/NotificationHelper.js';

// Game Over Scene
export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameOverScene" });
    }

    init(data) {
        this.finalScore = data.score;
    }

    create() {
        // Background
        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a2e, 1);
        bg.fillRect(0, 0, 800, 600);

        // Title
        this.add
            .text(400, 100, "GAME OVER", {
                fontSize: "48px",
                fill: "#ff6b6b",
                fontFamily: "Courier New",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Stats panel
        const panelGraphics = this.add.graphics();
        panelGraphics.fillStyle(0x0f0f1e, 0.9);
        panelGraphics.fillRect(200, 180, 400, 280);
        panelGraphics.lineStyle(3, 0x4a4a5a, 1);
        panelGraphics.strokeRect(200, 180, 400, 280);

        // Stats (always NUXX now) (v3.4.1)
        const charName = "NUXX";
        const stats = [
            `Character: ${charName}`,
            `Final Level: ${gameState.currentLevel}`,
            `Survival Time: ${Math.floor(gameState.survivalTime / 60)}:${(gameState.survivalTime % 60).toString().padStart(2, "0")}`,
            `Enemies Defeated: ${gameState.enemiesKilled}`,
            `Final Score: ${this.finalScore}`,
            `High Score: ${gameState.highScore}`,
        ];

        stats.forEach((stat, index) => {
            const color =
                index === stats.length - 1 ? "#ffd700" : "#ffffff";
            this.add
                .text(400, 220 + index * 40, stat, {
                    fontSize: "20px",
                    fill: color,
                    fontFamily: "Courier New",
                    fontStyle:
                        index === stats.length - 1
                            ? "bold"
                            : "normal",
                })
                .setOrigin(0.5);
        });

        // Check achievements
        const progression = new ProgressionSystem();
        const runData = {
            enemiesKilled: gameState.enemiesKilled,
            damageTaken: gameState.damageTaken,
            waveReached: gameState.waveReached,
            element: gameState.elementUsed,
            survivalTime: gameState.survivalTime,
            levelReached: gameState.currentLevel
        };

        const unlockedAchievements = progression.checkAchievements(runData);

        // Show unlock notifications
        if (unlockedAchievements.length > 0) {
            const achievements = unlockedAchievements.map(id =>
                progression.getData().achievements[id]
            );

            // Queue notifications (staggered by 4 seconds each)
            NotificationHelper.queueAchievements(this, achievements);
        }

        // Play Again Button
        const playButton = this.add
            .text(400, 520, "PLAY AGAIN", {
                fontSize: "24px",
                fill: "#00ff88",
                fontFamily: "Courier New",
                fontStyle: "bold",
                backgroundColor: "#1a1a2a",
                padding: { x: 20, y: 10 },
            })
            .setOrigin(0.5)
            .setInteractive();

        playButton.on("pointerover", () => {
            playButton.setFill("#ffffff");
            this.input.setDefaultCursor("pointer");
            soundFX.play("hover");
        });

        playButton.on("pointerout", () => {
            playButton.setFill("#00ff88");
            this.input.setDefaultCursor("default");
        });

        playButton.on("pointerdown", () => {
            soundFX.play("select");
            this.scene.start("CharacterSelectScene");
        });

        // Fade in
        this.cameras.main.fadeIn(500);
    }
}
