/**
 * PatchHistoryScene.js
 *
 * Displays game patch history from changelog data
 * Uses DOM overlay for smooth scrolling of text content
 */

import { soundFX } from '../systems/SoundFX.js';
import { getLatestVersions, getAllVersions } from '../data/changelogData.js';

export default class PatchHistoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PatchHistoryScene' });
        this.showingAll = false;
        this.domContainer = null;
    }

    create() {
        // Background
        this.add.rectangle(400, 350, 800, 700, 0x0a0a1a).setScrollFactor(0);

        // Title
        this.add
            .text(400, 40, "📜  PATCH HISTORY", {
                fontSize: "36px",
                fill: "#ffd700",
                fontFamily: "Courier New",
                fontStyle: "bold"
            })
            .setOrigin(0.5)
            .setScrollFactor(0);

        // Create DOM overlay for scrollable content
        this.createDOMOverlay();

        // Load More button
        this.createLoadMoreButton();

        // Back button
        this.createBackButton();

        // Play sound
        soundFX.play("select");
    }

    createDOMOverlay() {
        // Create DOM element for scrollable content
        const domElement = document.createElement('div');
        domElement.id = 'patch-history-container';
        domElement.style.position = 'absolute';
        domElement.style.left = '50px';
        domElement.style.top = '100px';
        domElement.style.width = '700px';
        domElement.style.height = '450px';
        domElement.style.overflowY = 'auto';
        domElement.style.overflowX = 'hidden';
        domElement.style.fontFamily = 'Courier New, monospace';
        domElement.style.fontSize = '13px';
        domElement.style.color = '#ffffff';
        domElement.style.backgroundColor = 'rgba(15, 15, 30, 0.95)';
        domElement.style.padding = '20px';
        domElement.style.borderRadius = '5px';
        domElement.style.border = '2px solid #4a4a5a';
        domElement.style.boxSizing = 'border-box';

        // Custom scrollbar styling
        const style = document.createElement('style');
        style.textContent = `
            #patch-history-container::-webkit-scrollbar {
                width: 10px;
            }
            #patch-history-container::-webkit-scrollbar-track {
                background: #1a1a2a;
                border-radius: 5px;
            }
            #patch-history-container::-webkit-scrollbar-thumb {
                background: #4a4a5a;
                border-radius: 5px;
            }
            #patch-history-container::-webkit-scrollbar-thumb:hover {
                background: #5a5a6a;
            }
        `;
        document.head.appendChild(style);

        // Get initial versions (latest 5)
        const versions = this.showingAll ? getAllVersions() : getLatestVersions(5);

        // Build HTML content
        let html = '';
        versions.forEach((version, index) => {
            html += `<div style="margin-bottom: ${index < versions.length - 1 ? '30px' : '0'};">`;
            html += `<h2 style="color: #ffd700; margin: 0 0 5px 0; font-size: 20px;">v${version.version}</h2>`;
            html += `<p style="color: #888; margin: 0 0 15px 0; font-size: 11px;">${version.date}</p>`;

            version.sections.forEach(section => {
                html += `<h3 style="color: #4ecdc4; margin: 15px 0 10px 0; font-size: 15px;">${section.title}</h3>`;

                section.items.forEach(item => {
                    html += `<p style="color: #fff; margin: 10px 0 5px 0; font-weight: bold;">${item.heading}</p>`;
                    html += `<ul style="margin: 5px 0 10px 20px; padding: 0;">`;
                    item.bullets.forEach(bullet => {
                        html += `<li style="margin-bottom: 4px; color: #ccc;">${bullet}</li>`;
                    });
                    html += `</ul>`;
                });
            });

            html += `</div>`;
        });

        domElement.innerHTML = html;
        document.body.appendChild(domElement);
        this.domContainer = domElement;
    }

    createLoadMoreButton() {
        // Only show if not showing all versions yet
        if (this.showingAll) return;

        const allVersions = getAllVersions();
        if (allVersions.length <= 5) return; // No need for button if 5 or fewer versions

        const button = this.add.graphics();
        button.fillStyle(0x6b5b95, 1);
        button.fillRect(275, 565, 250, 40);
        button.lineStyle(2, 0xffd700, 1);
        button.strokeRect(275, 565, 250, 40);
        button.setDepth(1000);
        button.setInteractive(
            new Phaser.Geom.Rectangle(275, 565, 250, 40),
            Phaser.Geom.Rectangle.Contains
        );

        const buttonText = this.add
            .text(400, 585, "LOAD MORE", {
                fontSize: "18px",
                fill: "#ffffff",
                fontFamily: "Courier New",
                fontStyle: "bold"
            })
            .setOrigin(0.5)
            .setDepth(1001);

        button.on("pointerover", () => {
            button.clear();
            button.fillStyle(0x7c6ba6, 1);
            button.fillRect(275, 565, 250, 40);
            button.lineStyle(2, 0xffd700, 1);
            button.strokeRect(275, 565, 250, 40);
            this.input.setDefaultCursor("pointer");
            buttonText.setScale(1.1);
            soundFX.play("hover");
        });

        button.on("pointerout", () => {
            button.clear();
            button.fillStyle(0x6b5b95, 1);
            button.fillRect(275, 565, 250, 40);
            button.lineStyle(2, 0xffd700, 1);
            button.strokeRect(275, 565, 250, 40);
            this.input.setDefaultCursor("default");
            buttonText.setScale(1);
        });

        button.on("pointerdown", () => {
            soundFX.play("select");
            this.showingAll = true;
            button.destroy();
            buttonText.destroy();
            // Recreate DOM overlay with all versions
            if (this.domContainer) {
                this.domContainer.remove();
            }
            this.createDOMOverlay();
        });
    }

    createBackButton() {
        const button = this.add.graphics();
        button.fillStyle(0xff6b6b, 1);
        button.fillRect(275, 620, 250, 40);
        button.lineStyle(2, 0xffffff, 1);
        button.strokeRect(275, 620, 250, 40);
        button.setDepth(1000);
        button.setInteractive(
            new Phaser.Geom.Rectangle(275, 620, 250, 40),
            Phaser.Geom.Rectangle.Contains
        );

        const buttonText = this.add
            .text(400, 640, "BACK", {
                fontSize: "18px",
                fill: "#ffffff",
                fontFamily: "Courier New",
                fontStyle: "bold"
            })
            .setOrigin(0.5)
            .setDepth(1001);

        button.on("pointerover", () => {
            button.clear();
            button.fillStyle(0xff8888, 1);
            button.fillRect(275, 620, 250, 40);
            button.lineStyle(2, 0xffffff, 1);
            button.strokeRect(275, 620, 250, 40);
            this.input.setDefaultCursor("pointer");
            buttonText.setScale(1.1);
            soundFX.play("hover");
        });

        button.on("pointerout", () => {
            button.clear();
            button.fillStyle(0xff6b6b, 1);
            button.fillRect(275, 620, 250, 40);
            button.lineStyle(2, 0xffffff, 1);
            button.strokeRect(275, 620, 250, 40);
            this.input.setDefaultCursor("default");
            buttonText.setScale(1);
        });

        button.on("pointerdown", () => {
            soundFX.play("select");
            // Clean up DOM element
            if (this.domContainer) {
                this.domContainer.remove();
                this.domContainer = null;
            }
            this.scene.start("CharacterSelectScene");
        });
    }

    shutdown() {
        // Clean up DOM element when scene shuts down
        if (this.domContainer) {
            this.domContainer.remove();
            this.domContainer = null;
        }
    }
}
