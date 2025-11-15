/**
 * DrawingHelpers.js
 *
 * Pure functions for drawing character and enemy sprites
 * All functions take a Phaser Graphics object and draw pixel art
 */

import { ELEMENTS } from '../config/elements.js';

/**
 * Draw the Suited Man character (v3.3.0+)
 * Man in suit with top hat and sunglasses - replaces wizard
 * @param {Phaser.GameObjects.Graphics} player - Player graphics object (player === graphics)
 * @returns {void}
 */
export function drawSuitedMan(player) {
    player.clear();

    // Get element color (grey if no element chosen yet)
    let elementColor = 0x808080; // Grey default
    if (player && player.element && ELEMENTS[player.element]) {
        elementColor = ELEMENTS[player.element].color;
    }

    const skinColor = 0xFFF5E1; // Slightly whiter beige
    const blackColor = 0x000000; // Black sunglasses (always black!)

    // Calculate darker brim color (0.8x brightness)
    const r8 = ((elementColor >> 16) & 0xFF) * 0.8;
    const g8 = ((elementColor >> 8) & 0xFF) * 0.8;
    const b8 = (elementColor & 0xFF) * 0.8;
    const hatBrimColor = (Math.floor(r8) << 16) | (Math.floor(g8) << 8) | Math.floor(b8);

    // Calculate suit detail color (0.6x brightness for buttons and lapels)
    const r6 = ((elementColor >> 16) & 0xFF) * 0.6;
    const g6 = ((elementColor >> 8) & 0xFF) * 0.6;
    const b6 = (elementColor & 0xFF) * 0.6;
    const suitDetailColor = (Math.floor(r6) << 16) | (Math.floor(g6) << 8) | Math.floor(b6);

    // Calculate shoe color (0.4x brightness)
    const r4 = ((elementColor >> 16) & 0xFF) * 0.4;
    const g4 = ((elementColor >> 8) & 0xFF) * 0.4;
    const b4 = (elementColor & 0xFF) * 0.4;
    const shoeColor = (Math.floor(r4) << 16) | (Math.floor(g4) << 8) | Math.floor(b4);

    // === TOP HAT (element color, DOUBLE HEIGHT) ===
    // Hat crown (tall part - full brightness, doubled from 8 to 16)
    player.fillStyle(elementColor, 1);
    player.fillRect(-5, -30, 10, 16);

    // Hat brim (wide part - darker)
    player.fillStyle(hatBrimColor, 1);
    player.fillEllipse(0, -14, 14, 5);

    // === HEAD (pale skin) ===
    player.fillStyle(skinColor, 1);
    player.fillCircle(0, -8, 6);

    // === SUNGLASSES (BLACK - always black, curved lenses) ===
    player.fillStyle(blackColor, 1);
    // Left lens (curved)
    player.fillEllipse(-3, -8, 3.5, 2.5);
    // Right lens (curved)
    player.fillEllipse(3, -8, 3.5, 2.5);
    // Bridge
    player.fillRect(-0.5, -8.5, 1, 2);

    // === SUIT JACKET (element color, trapezoid - wider shoulders, narrower waist) ===
    player.fillStyle(elementColor, 1);
    // Upper body (trapezoid shape)
    player.beginPath();
    player.moveTo(-6, -2); // Left shoulder
    player.lineTo(6, -2);  // Right shoulder
    player.lineTo(4, 8);   // Right waist
    player.lineTo(-4, 8);  // Left waist
    player.closePath();
    player.fillPath();

    // Collar/lapels (0.6x darker for detail)
    player.fillStyle(suitDetailColor, 1);
    player.fillTriangle(-6, -2, -3, -2, -4, 2);
    player.fillTriangle(6, -2, 3, -2, 4, 2);

    // Buttons (0.6x darker, 3 small circles down center)
    player.fillStyle(suitDetailColor, 1);
    player.fillCircle(0, 0, 1);  // Top button
    player.fillCircle(0, 3, 1);  // Middle button
    player.fillCircle(0, 6, 1);  // Bottom button

    // === ARMS (element color) ===
    // Right arm (at side)
    player.fillStyle(elementColor, 1);
    player.fillRect(6, 0, 2, 10);

    // Left arm (raised - waving/gesturing)
    player.fillRect(-8, -8, 2, 6);
    player.fillRect(-10, -10, 2, 4); // Upper raised part

    // === HANDS (pale skin) ===
    player.fillStyle(skinColor, 1);
    // Right hand
    player.fillCircle(7, 10, 2);
    // Left hand (raised)
    player.fillCircle(-9, -10, 2);

    // === LEGS (element color) ===
    player.fillStyle(elementColor, 1);
    // Left leg
    player.fillRect(-3, 8, 3, 6);  // Shortened from 8 to 6 to make room for shoes
    // Right leg
    player.fillRect(0, 8, 3, 6);   // Shortened from 8 to 6 to make room for shoes

    // === SHOES (0.4x darker, rectangular) ===
    player.fillStyle(shoeColor, 1);
    // Left shoe
    player.fillRect(-3, 14, 3, 2);
    // Right shoe
    player.fillRect(0, 14, 3, 2);
}

/**
 * Draw the Wizard character
 * @deprecated Use drawSuitedMan instead (v3.3.0+)
 * @param {Phaser.GameObjects.Graphics} player - Player graphics object (player === graphics)
 * @returns {void}
 */
export function drawWizard(player) {
    player.clear();

    // Get element color (grey if no element chosen yet)
    let elementColor = 0x808080; // Grey default
    if (player && player.element && ELEMENTS[player.element]) {
        elementColor = ELEMENTS[player.element].color;
    }

    // Wizard hat (element color or grey)
    player.fillStyle(elementColor, 1);
    player.fillRect(-6, -10, 12, 6);
    player.fillRect(-4, -14, 8, 4);

    // Hat star
    player.fillStyle(0xffd700, 1);
    player.fillRect(-1, -8, 2, 2);

    // Face
    player.fillStyle(0xffd4a3, 1);
    player.fillRect(-4, -4, 8, 6);

    // Eyes
    player.fillStyle(0x4169e1, 1);
    player.fillRect(-3, -2, 2, 2);
    player.fillRect(1, -2, 2, 2);

    // Beard
    player.fillStyle(0xc0c0c0, 1);
    player.fillRect(-4, 2, 8, 4);

    // Robe (element color or grey)
    player.fillStyle(elementColor, 1);
    player.fillRect(-5, 6, 10, 10);

    // Robe trim (gold)
    player.fillStyle(0xffd700, 1);
    player.fillRect(-5, 6, 10, 1);

    // Arms/sleeves (element color or grey)
    player.fillStyle(elementColor, 1);
    player.fillRect(-7, 8, 2, 6);
    player.fillRect(5, 8, 2, 6);

    // Hands
    player.fillStyle(0xffd4a3, 1);
    player.fillRect(-7, 13, 2, 2);
    player.fillRect(5, 13, 2, 2);

    // Staff
    player.fillStyle(0x8b4513, 1);
    player.fillRect(-9, 6, 2, 10);

    // Staff orb (element color or grey)
    player.fillStyle(elementColor, 1);
    player.fillCircle(-8, 4, 3);
    player.fillStyle(0x87ceeb, 1);
    player.fillCircle(-8, 4, 2);
}

/**
 * Draw a Boss enemy
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics object to draw on
 * @returns {void}
 */
export function drawBoss(graphics) {
    graphics.clear();
    const scale = 2; // Bosses are twice as large

    // Large demon-like boss
    // Body (dark red, muscular)
    graphics.fillStyle(0x8b0000, 1);
    graphics.fillRect(
        -10 * scale,
        -5 * scale,
        20 * scale,
        20 * scale,
    );

    // Chest plates
    graphics.fillStyle(0xa00000, 1);
    graphics.fillRect(
        -8 * scale,
        -3 * scale,
        7 * scale,
        8 * scale,
    );
    graphics.fillRect(
        1 * scale,
        -3 * scale,
        7 * scale,
        8 * scale,
    );

    // Head (horned)
    graphics.fillStyle(0x6b0000, 1);
    graphics.fillRect(
        -8 * scale,
        -12 * scale,
        16 * scale,
        10 * scale,
    );

    // Horns
    graphics.fillStyle(0x2a2a2a, 1);
    graphics.fillTriangle(
        -8 * scale,
        -12 * scale,
        -12 * scale,
        -18 * scale,
        -6 * scale,
        -14 * scale,
    );
    graphics.fillTriangle(
        8 * scale,
        -12 * scale,
        12 * scale,
        -18 * scale,
        6 * scale,
        -14 * scale,
    );

    // Eyes (glowing yellow)
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(
        -6 * scale,
        -9 * scale,
        3 * scale,
        3 * scale,
    );
    graphics.fillRect(
        3 * scale,
        -9 * scale,
        3 * scale,
        3 * scale,
    );

    // Fangs
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(
        -4 * scale,
        -5 * scale,
        -2 * scale,
        -5 * scale,
        -3 * scale,
        -2 * scale,
    );
    graphics.fillTriangle(
        2 * scale,
        -5 * scale,
        4 * scale,
        -5 * scale,
        3 * scale,
        -2 * scale,
    );

    // Massive arms
    graphics.fillStyle(0x8b0000, 1);
    graphics.fillRect(
        -14 * scale,
        -2 * scale,
        4 * scale,
        12 * scale,
    );
    graphics.fillRect(
        10 * scale,
        -2 * scale,
        4 * scale,
        12 * scale,
    );

    // Claws
    graphics.fillStyle(0x2a2a2a, 1);
    graphics.fillTriangle(
        -14 * scale,
        10 * scale,
        -16 * scale,
        14 * scale,
        -12 * scale,
        12 * scale,
    );
    graphics.fillTriangle(
        14 * scale,
        10 * scale,
        16 * scale,
        14 * scale,
        12 * scale,
        12 * scale,
    );

    // Legs
    graphics.fillStyle(0x6b0000, 1);
    graphics.fillRect(
        -7 * scale,
        15 * scale,
        6 * scale,
        8 * scale,
    );
    graphics.fillRect(
        1 * scale,
        15 * scale,
        6 * scale,
        8 * scale,
    );

    // Aura effect (pulsing)
    graphics.fillStyle(0xff0000, 0.2);
    graphics.fillCircle(0, 0, 25 * scale);
}

/**
 * Draw a Slime enemy
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics object to draw on
 * @returns {void}
 */
export function drawSlime(graphics) {
    graphics.clear();

    // Slime body (green)
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(-6, -2, 12, 10);
    graphics.fillRect(-4, -4, 8, 2);
    graphics.fillRect(-7, 0, 2, 6);
    graphics.fillRect(5, 0, 2, 6);

    // Highlight
    graphics.fillStyle(0x88ff88, 1);
    graphics.fillRect(-4, 0, 4, 4);

    // Eyes
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(-4, 1, 2, 2);
    graphics.fillRect(2, 1, 2, 2);

    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(-3, 2, 1, 1);
    graphics.fillRect(3, 2, 1, 1);

    // Bottom edge
    graphics.fillStyle(0x00cc00, 1);
    graphics.fillRect(-6, 6, 12, 2);
}

/**
 * Draw a Goblin enemy
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics object to draw on
 * @returns {void}
 */
export function drawGoblin(graphics) {
    graphics.clear();

    // Head (green skin)
    graphics.fillStyle(0x7cb342, 1);
    graphics.fillRect(-5, -8, 10, 8);

    // Ears
    graphics.fillStyle(0x7cb342, 1);
    graphics.fillRect(-7, -6, 2, 3);
    graphics.fillRect(5, -6, 2, 3);

    // Eyes (mean looking)
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(-4, -5, 2, 2);
    graphics.fillRect(2, -5, 2, 2);

    // Body (armor)
    graphics.fillStyle(0x654321, 1);
    graphics.fillRect(-5, 0, 10, 8);

    // Arms
    graphics.fillStyle(0x7cb342, 1);
    graphics.fillRect(-7, 1, 2, 5);
    graphics.fillRect(5, 1, 2, 5);

    // Weapon (club)
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(7, 3, 2, 5);
    graphics.fillStyle(0x654321, 1);
    graphics.fillRect(6, 2, 4, 2);

    // Legs
    graphics.fillStyle(0x7cb342, 1);
    graphics.fillRect(-4, 8, 3, 4);
    graphics.fillRect(1, 8, 3, 4);
}

/**
 * Draw a Tank enemy
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics object to draw on
 * @returns {void}
 */
export function drawTank(graphics) {
    graphics.clear();

    // Heavy iron armor body (large)
    graphics.fillStyle(0x505050, 1);
    graphics.fillRect(-8, -6, 16, 16);

    // Armor plates
    graphics.fillStyle(0x404040, 1);
    graphics.fillRect(-7, -5, 6, 6);
    graphics.fillRect(1, -5, 6, 6);
    graphics.fillRect(-7, 3, 6, 6);
    graphics.fillRect(1, 3, 6, 6);

    // Helmet (dark, menacing)
    graphics.fillStyle(0x303030, 1);
    graphics.fillRect(-6, -10, 12, 6);

    // Visor slit (glowing red)
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(-5, -7, 10, 2);

    // Large shield
    graphics.fillStyle(0x606060, 1);
    graphics.fillRect(-10, -2, 3, 10);
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(-9, -1, 2, 8);

    // Shoulder spikes
    graphics.fillStyle(0x707070, 1);
    graphics.fillTriangle(-8, -6, -10, -10, -6, -8);
    graphics.fillTriangle(8, -6, 10, -10, 6, -8);

    // Legs (thick, armored)
    graphics.fillStyle(0x505050, 1);
    graphics.fillRect(-6, 10, 5, 6);
    graphics.fillRect(1, 10, 5, 6);
}

/**
 * Draw a Bomber enemy
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics object to draw on
 * @returns {void}
 */
export function drawBomber(graphics) {
    graphics.clear();

    // Hooded figure (dark purple/black)
    graphics.fillStyle(0x2d1b3d, 1);
    graphics.fillRect(-5, -8, 10, 6);

    // Hood point
    graphics.fillStyle(0x2d1b3d, 1);
    graphics.fillRect(-3, -10, 6, 2);

    // Glowing eyes (cyan/white)
    graphics.fillStyle(0x00ffff, 1);
    graphics.fillRect(-4, -5, 2, 2);
    graphics.fillRect(2, -5, 2, 2);

    // Body (robed)
    graphics.fillStyle(0x4a2d5e, 1);
    graphics.fillRect(-5, -2, 10, 10);

    // Bomb strapped to chest (glowing)
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillCircle(0, 2, 4);

    // Fuse (sparking)
    graphics.fillStyle(0xffd700, 1);
    graphics.fillRect(-1, -2, 2, 3);
    graphics.fillCircle(0, -3, 2);

    // Warning symbol on bomb
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(0, 2, 2);

    // Arms (holding bomb)
    graphics.fillStyle(0x4a2d5e, 1);
    graphics.fillRect(-7, 0, 2, 6);
    graphics.fillRect(5, 0, 2, 6);

    // Tattered robe bottom
    graphics.fillStyle(0x4a2d5e, 1);
    graphics.fillRect(-5, 8, 4, 4);
    graphics.fillRect(1, 8, 4, 4);
}

/**
 * Draw treasure chest (brown box with gold latch) - v3.3.2+
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics object
 * @returns {void}
 */
export function drawTreasureChest(graphics) {
    graphics.clear();

    // Gold stroke outline (v3.4.0 - 2px thick for visibility)
    graphics.lineStyle(2, 0xFFD700, 1);

    // Brown box body (v3.4.0 - doubled from 12x12 to 24x24)
    graphics.fillStyle(0x8B4513, 1); // Saddle brown
    graphics.fillRect(-12, -12, 24, 24);
    graphics.strokeRect(-12, -12, 24, 24);

    // Darker brown outline (inner detail)
    graphics.lineStyle(1, 0x654321, 1);
    graphics.strokeRect(-12, -12, 24, 24);

    // Gold latch (horizontal bar) - doubled size
    graphics.fillStyle(0xFFD700, 1);
    graphics.fillRect(-4, -2, 8, 4);

    // Gold lock (circle) - doubled size
    graphics.fillCircle(0, 0, 3);
}

/**
 * Draw potion icon (bottle shape) - v3.3.2+
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics object
 * @param {number} color - Potion liquid color (0xRRGGBB)
 * @returns {void}
 */
export function drawPotionIcon(graphics, color) {
    graphics.clear();

    // Cork
    graphics.fillStyle(0x8B4513, 1); // Brown cork
    graphics.fillRect(-1.5, -10, 3, 1);

    // Bottle neck
    graphics.fillStyle(color, 0.8);
    graphics.fillRect(-2, -9, 4, 2);

    // Bottle body
    graphics.fillStyle(color, 1);
    graphics.fillRect(-3, -7, 6, 10);

    // Glass outline
    graphics.lineStyle(1, 0xCCCCCC, 0.5);
    graphics.strokeRect(-3, -7, 6, 10);

    // Liquid shine (white highlight)
    graphics.fillStyle(0xFFFFFF, 0.6);
    graphics.fillCircle(-1, -4, 1);
}

/**
 * Draw sword icon - v3.3.2+
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics object
 * @returns {void}
 */
export function drawSwordIcon(graphics) {
    graphics.clear();

    // Blade (triangle + rectangle)
    graphics.fillStyle(0xC0C0C0, 1); // Silver
    graphics.fillTriangle(0, -6, -1.5, -2, 1.5, -2); // Point
    graphics.fillRect(-1, -2, 2, 6); // Blade body

    // Guard (horizontal bar)
    graphics.fillStyle(0xFFD700, 1); // Gold guard
    graphics.fillRect(-3, 3, 6, 1);

    // Handle
    graphics.fillStyle(0x8B4513, 1); // Brown handle
    graphics.fillRect(-0.5, 4, 1, 3);

    // Pommel
    graphics.fillStyle(0xFFD700, 1); // Gold pommel
    graphics.fillCircle(0, 7, 1.5);
}
