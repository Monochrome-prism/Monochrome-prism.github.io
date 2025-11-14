/**
 * NotificationHelper.js
 *
 * Shows achievement unlock notifications and other in-game popups
 */

import { soundFX } from '../systems/SoundFX.js';

export class NotificationHelper {
    /**
     * Show achievement unlock notification
     * @param {Phaser.Scene} scene - The scene to show notification in
     * @param {Object} achievement - Achievement data
     */
    static showAchievementUnlock(scene, achievement) {
        // Container for all notification elements
        const container = scene.add.container(400, -150);
        container.setDepth(2000); // Very high depth to appear above everything

        // Background panel
        const bg = scene.add.graphics();
        bg.fillStyle(0x1a1a2a, 0.95);
        bg.fillRect(-200, 0, 400, 120);
        bg.lineStyle(4, 0xffd700, 1);
        bg.strokeRect(-200, 0, 400, 120);
        container.add(bg);

        // Header text
        const header = scene.add.text(0, 15, "🎉 ACHIEVEMENT UNLOCKED! 🎉", {
            fontSize: "20px",
            fill: "#ffd700",
            fontFamily: "Courier New",
            fontStyle: "bold",
            align: "center"
        }).setOrigin(0.5);
        container.add(header);

        // Achievement icon and name
        const iconText = scene.add.text(-80, 55, achievement.icon, {
            fontSize: "36px"
        }).setOrigin(0.5);
        container.add(iconText);

        const nameText = scene.add.text(30, 45, achievement.name, {
            fontSize: "18px",
            fill: "#ffffff",
            fontFamily: "Courier New",
            fontStyle: "bold",
            align: "left"
        }).setOrigin(0, 0.5);
        container.add(nameText);

        const descText = scene.add.text(30, 68, achievement.description, {
            fontSize: "12px",
            fill: "#aaaaaa",
            fontFamily: "Courier New",
            align: "left",
            wordWrap: { width: 250 }
        }).setOrigin(0, 0.5);
        container.add(descText);

        // Skill point notification
        const skillPointText = scene.add.text(0, 95, "+1 Skill Point Earned! ✨", {
            fontSize: "14px",
            fill: "#00ff88",
            fontFamily: "Courier New",
            fontStyle: "bold",
            align: "center"
        }).setOrigin(0.5);
        container.add(skillPointText);

        // Play sound
        soundFX.play("levelUp"); // Reuse level up sound for achievement

        // Animation: Slide in from top
        scene.tweens.add({
            targets: container,
            y: 100,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Hold for 3 seconds
                scene.time.delayedCall(3000, () => {
                    // Fade out and slide up
                    scene.tweens.add({
                        targets: container,
                        y: -150,
                        alpha: 0,
                        duration: 400,
                        ease: 'Back.easeIn',
                        onComplete: () => {
                            container.destroy();
                        }
                    });
                });
            }
        });

        // Particle burst effect
        this.createParticleBurst(scene, 400, 100);
    }

    /**
     * Create particle burst effect
     * @param {Phaser.Scene} scene - The scene
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    static createParticleBurst(scene, x, y) {
        const colors = [0xffd700, 0xffa500, 0xff6347];

        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const speed = 150 + Math.random() * 100;

            const particle = scene.add.graphics();
            particle.fillStyle(colors[i % colors.length], 1);
            particle.fillCircle(0, 0, 4);
            particle.setPosition(x, y);
            particle.setDepth(2001);

            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            scene.tweens.add({
                targets: particle,
                x: x + vx * 0.5,
                y: y + vy * 0.5,
                alpha: 0,
                scale: 0,
                duration: 800,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    /**
     * Show generic notification message
     * @param {Phaser.Scene} scene - The scene
     * @param {string} message - Message to display
     * @param {string} color - Text color (hex)
     * @param {number} duration - Display duration in ms
     */
    static showMessage(scene, message, color = "#ffffff", duration = 2000) {
        const text = scene.add.text(400, -50, message, {
            fontSize: "24px",
            fill: color,
            fontFamily: "Courier New",
            fontStyle: "bold",
            align: "center",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5);
        text.setDepth(2000);

        // Slide in
        scene.tweens.add({
            targets: text,
            y: 80,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Hold
                scene.time.delayedCall(duration, () => {
                    // Fade out
                    scene.tweens.add({
                        targets: text,
                        alpha: 0,
                        y: 60,
                        duration: 300,
                        onComplete: () => {
                            text.destroy();
                        }
                    });
                });
            }
        });
    }

    /**
     * Queue multiple achievement notifications
     * @param {Phaser.Scene} scene - The scene
     * @param {Array<Object>} achievements - Array of achievement objects
     */
    static queueAchievements(scene, achievements) {
        achievements.forEach((achievement, index) => {
            // Stagger notifications by 4 seconds each
            scene.time.delayedCall(index * 4000, () => {
                this.showAchievementUnlock(scene, achievement);
            });
        });
    }
}
