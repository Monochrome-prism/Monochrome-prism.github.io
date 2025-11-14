import { gameState } from '../config/gameState.js';
import { soundFX } from '../systems/SoundFX.js';

/**
 * Settings Scene
 * Allows players to adjust volume levels and toggle fullscreen
 */
export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: "SettingsScene" });
        this.sliders = [];
    }

    create() {
        // Title
        this.add
            .text(400, 80, "SETTINGS", {
                fontSize: "48px",
                fill: "#ffd700",
                fontFamily: "Courier New",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Master Volume Slider
        this.createSlider(200, "Master Volume", gameState.masterVolume, (value) => {
            gameState.masterVolume = value;
        });

        // Music Volume Slider
        this.createSlider(300, "Music Volume", gameState.musicVolume, (value) => {
            gameState.musicVolume = value;
        });

        // SFX Volume Slider
        this.createSlider(400, "SFX Volume", gameState.sfxVolume, (value) => {
            gameState.sfxVolume = value;
            // Play test sound when adjusting SFX volume
            soundFX.play("select");
        });

        // Fullscreen Toggle
        this.createFullscreenToggle();

        // Back Button
        this.createBackButton();
    }

    createSlider(y, label, initialValue, onChange) {
        // Label
        this.add
            .text(200, y - 10, label, {
                fontSize: "20px",
                fill: "#ffffff",
                fontFamily: "Courier New",
            });

        // Slider background
        const sliderBg = this.add.graphics();
        sliderBg.fillStyle(0x3a3a3a, 1);
        sliderBg.fillRect(200, y + 20, 400, 10);

        // Slider fill (shows current volume)
        const sliderFill = this.add.graphics();
        sliderFill.fillStyle(0x4ecdc4, 1);
        sliderFill.fillRect(200, y + 20, 400 * initialValue, 10);

        // Slider handle
        const handle = this.add.graphics();
        handle.fillStyle(0xffd700, 1);
        handle.fillCircle(200 + 400 * initialValue, y + 25, 15);
        handle.setInteractive(
            new Phaser.Geom.Circle(200 + 400 * initialValue, y + 25, 15),
            Phaser.Geom.Circle.Contains
        );

        // Value display
        const valueText = this.add
            .text(620, y + 15, `${Math.round(initialValue * 100)}%`, {
                fontSize: "18px",
                fill: "#4ecdc4",
                fontFamily: "Courier New",
            });

        // Make slider interactive
        let isDragging = false;

        handle.on("pointerdown", () => {
            isDragging = true;
            this.input.setDefaultCursor("grabbing");
        });

        this.input.on("pointerup", () => {
            isDragging = false;
            this.input.setDefaultCursor("default");
        });

        this.input.on("pointermove", (pointer) => {
            if (isDragging) {
                // Calculate new value
                let newX = Phaser.Math.Clamp(pointer.x, 200, 600);
                let value = (newX - 200) / 400;
                value = Phaser.Math.Clamp(value, 0, 1);

                // Update visuals
                handle.clear();
                handle.fillStyle(0xffd700, 1);
                handle.fillCircle(newX, y + 25, 15);
                handle.setInteractive(
                    new Phaser.Geom.Circle(newX, y + 25, 15),
                    Phaser.Geom.Circle.Contains
                );

                sliderFill.clear();
                sliderFill.fillStyle(0x4ecdc4, 1);
                sliderFill.fillRect(200, y + 20, 400 * value, 10);

                valueText.setText(`${Math.round(value * 100)}%`);

                // Apply change
                onChange(value);
            }
        });

        // Hover effect
        handle.on("pointerover", () => {
            if (!isDragging) {
                this.input.setDefaultCursor("grab");
            }
        });

        handle.on("pointerout", () => {
            if (!isDragging) {
                this.input.setDefaultCursor("default");
            }
        });

        this.sliders.push({ handle, sliderFill, valueText, y });
    }

    createFullscreenToggle() {
        const y = 500;

        // Label
        this.add
            .text(200, y, "Fullscreen", {
                fontSize: "20px",
                fill: "#ffffff",
                fontFamily: "Courier New",
            });

        // Toggle button
        const toggleBg = this.add.graphics();
        const isFullscreen = this.scale.isFullscreen;
        toggleBg.fillStyle(isFullscreen ? 0x4ecdc4 : 0x3a3a3a, 1);
        toggleBg.fillRect(500, y, 100, 40);
        toggleBg.lineStyle(2, 0xffd700, 1);
        toggleBg.strokeRect(500, y, 100, 40);
        toggleBg.setInteractive(
            new Phaser.Geom.Rectangle(500, y, 100, 40),
            Phaser.Geom.Rectangle.Contains
        );

        const toggleText = this.add
            .text(550, y + 20, isFullscreen ? "ON" : "OFF", {
                fontSize: "20px",
                fill: "#ffffff",
                fontFamily: "Courier New",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        toggleBg.on("pointerover", () => {
            this.input.setDefaultCursor("pointer");
            soundFX.play("hover");
        });

        toggleBg.on("pointerout", () => {
            this.input.setDefaultCursor("default");
        });

        toggleBg.on("pointerdown", () => {
            soundFX.play("select");
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
                toggleBg.clear();
                toggleBg.fillStyle(0x3a3a3a, 1);
                toggleBg.fillRect(500, y, 100, 40);
                toggleBg.lineStyle(2, 0xffd700, 1);
                toggleBg.strokeRect(500, y, 100, 40);
                toggleText.setText("OFF");
            } else {
                this.scale.startFullscreen();
                toggleBg.clear();
                toggleBg.fillStyle(0x4ecdc4, 1);
                toggleBg.fillRect(500, y, 100, 40);
                toggleBg.lineStyle(2, 0xffd700, 1);
                toggleBg.strokeRect(500, y, 100, 40);
                toggleText.setText("ON");
            }
        });
    }

    createBackButton() {
        const button = this.add.graphics();
        button.fillStyle(0x4ecdc4, 1);
        button.fillRect(275, 590, 250, 60);
        button.lineStyle(3, 0xffd700, 1);
        button.strokeRect(275, 590, 250, 60);
        button.setInteractive(
            new Phaser.Geom.Rectangle(275, 590, 250, 60),
            Phaser.Geom.Rectangle.Contains
        );

        const buttonText = this.add
            .text(400, 620, "BACK", {
                fontSize: "28px",
                fill: "#ffffff",
                fontFamily: "Courier New",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        button.on("pointerover", () => {
            button.clear();
            button.fillStyle(0x5cd6d3, 1);
            button.fillRect(275, 590, 250, 60);
            button.lineStyle(3, 0xffd700, 1);
            button.strokeRect(275, 590, 250, 60);
            this.input.setDefaultCursor("pointer");
            buttonText.setScale(1.1);
            soundFX.play("hover");
        });

        button.on("pointerout", () => {
            button.clear();
            button.fillStyle(0x4ecdc4, 1);
            button.fillRect(275, 590, 250, 60);
            button.lineStyle(3, 0xffd700, 1);
            button.strokeRect(275, 590, 250, 60);
            this.input.setDefaultCursor("default");
            buttonText.setScale(1);
        });

        button.on("pointerdown", () => {
            soundFX.play("select");
            this.scene.start("CharacterSelectScene");
        });
    }
}
