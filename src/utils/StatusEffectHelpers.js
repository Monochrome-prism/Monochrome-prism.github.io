/**
 * StatusEffectHelpers.js
 *
 * Functions for creating visual status effects and particle effects
 * All functions take a Phaser scene as first parameter for accessing scene methods
 */

import { ELEMENTS } from '../config/elements.js';

/**
 * Create visual effects for status effects on an enemy
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {import('../types/game-types.js').Enemy} enemy - Enemy object with statusEffects property
 * @param {number} time - Current game time
 * @returns {void}
 */
export function createStatusEffectVisuals(scene, enemy, time) {
    if (!enemy.statusEffects || !enemy.active) return;

    const effects = enemy.statusEffects;

    // BURN - Fire particles
    if (effects.burn.active) {
        if (!enemy.lastBurnParticle || time - enemy.lastBurnParticle > 200) {
            const particle = scene.add.graphics();
            particle.x = enemy.x + Phaser.Math.Between(-8, 8);
            particle.y = enemy.y + Phaser.Math.Between(-8, 8);
            const colors = [0xff4500, 0xff6347, 0xffa500];
            particle.fillStyle(colors[Math.floor(Math.random() * 3)], 0.8);
            particle.fillCircle(0, 0, Phaser.Math.Between(2, 4));
            particle.setDepth(15);
            scene.tweens.add({
                targets: particle,
                y: particle.y - 20,
                alpha: 0,
                duration: 500,
                onComplete: () => particle.destroy()
            });
            enemy.lastBurnParticle = time;
        }
    }

    // FREEZE - Ice overlay
    if (effects.freeze.active) {
        if (!enemy.freezeOverlay) {
            enemy.freezeOverlay = scene.add.graphics();
            enemy.freezeOverlay.fillStyle(0x87ceeb, 0.4);
            enemy.freezeOverlay.fillCircle(0, 0, 12);
            enemy.freezeOverlay.lineStyle(2, 0xe0ffff, 0.8);
            enemy.freezeOverlay.strokeCircle(0, 0, 12);
            enemy.freezeOverlay.setDepth(14);
        }
        enemy.freezeOverlay.x = enemy.x;
        enemy.freezeOverlay.y = enemy.y;
    } else if (enemy.freezeOverlay) {
        enemy.freezeOverlay.destroy();
        enemy.freezeOverlay = null;
    }

    // POISON - Green bubbles
    if (effects.poison.active) {
        if (!enemy.lastPoisonBubble || time - enemy.lastPoisonBubble > 300) {
            const bubble = scene.add.graphics();
            bubble.x = enemy.x + Phaser.Math.Between(-8, 8);
            bubble.y = enemy.y + Phaser.Math.Between(-8, 8);
            bubble.lineStyle(2, 0x32cd32, 0.8);
            bubble.strokeCircle(0, 0, Phaser.Math.Between(3, 5));
            bubble.setDepth(15);
            scene.tweens.add({
                targets: bubble,
                y: bubble.y - 15,
                alpha: 0,
                scale: 1.5,
                duration: 600,
                onComplete: () => bubble.destroy()
            });
            enemy.lastPoisonBubble = time;
        }
    }

    // PARALYZE - Electric sparks
    if (effects.paralyze.active) {
        if (!enemy.lastSparkParticle || time - enemy.lastSparkParticle > 100) {
            const spark = scene.add.graphics();
            spark.x = enemy.x + Phaser.Math.Between(-10, 10);
            spark.y = enemy.y + Phaser.Math.Between(-10, 10);
            spark.lineStyle(2, 0xffff00, 1);
            const endX = Phaser.Math.Between(-8, 8);
            const endY = Phaser.Math.Between(-8, 8);
            spark.lineBetween(0, 0, endX, endY);
            spark.setDepth(15);
            scene.tweens.add({
                targets: spark,
                alpha: 0,
                duration: 200,
                onComplete: () => spark.destroy()
            });
            enemy.lastSparkParticle = time;
        }
    }

    // SLEEP - Zzz symbols
    if (effects.sleep.active) {
        if (!enemy.lastSleepZ || time - enemy.lastSleepZ > 800) {
            const zzz = scene.add.text(enemy.x + 10, enemy.y - 15, 'Z', {
                fontSize: '14px',
                fill: '#ffffff',
                fontFamily: 'Courier New'
            }).setOrigin(0.5).setDepth(15);
            scene.tweens.add({
                targets: zzz,
                y: zzz.y - 20,
                alpha: 0,
                duration: 800,
                onComplete: () => zzz.destroy()
            });
            enemy.lastSleepZ = time;
        }
    }

    // CHARM - Heart particles
    if (effects.charm.active) {
        if (!enemy.lastCharmHeart || time - enemy.lastCharmHeart > 400) {
            const heart = scene.add.text(enemy.x, enemy.y - 12, '♥', {
                fontSize: '12px',
                fill: '#ff69b4',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(15);
            scene.tweens.add({
                targets: heart,
                y: heart.y - 15,
                alpha: 0,
                duration: 600,
                onComplete: () => heart.destroy()
            });
            enemy.lastCharmHeart = time;
        }
    }

    // CONFUSION - Dizzy stars
    if (effects.confusion.active) {
        if (!enemy.confusionStars) {
            enemy.confusionStars = scene.add.text(enemy.x, enemy.y - 18, '★ ★ ★', {
                fontSize: '10px',
                fill: '#ffff00',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(15);
            scene.tweens.add({
                targets: enemy.confusionStars,
                angle: 360,
                duration: 1000,
                repeat: -1
            });
        }
        enemy.confusionStars.x = enemy.x;
        enemy.confusionStars.y = enemy.y - 18;
    } else if (enemy.confusionStars) {
        enemy.confusionStars.destroy();
        enemy.confusionStars = null;
    }

    // BLIND - Dark overlay
    if (effects.blind.active) {
        if (!enemy.blindOverlay) {
            enemy.blindOverlay = scene.add.graphics();
            enemy.blindOverlay.fillStyle(0x000000, 0.5);
            enemy.blindOverlay.fillCircle(0, 0, 12);
            enemy.blindOverlay.setDepth(14);
        }
        enemy.blindOverlay.x = enemy.x;
        enemy.blindOverlay.y = enemy.y;
    } else if (enemy.blindOverlay) {
        enemy.blindOverlay.destroy();
        enemy.blindOverlay = null;
    }

    // FEAR - Exclamation mark
    if (effects.fear.active) {
        if (!enemy.fearMark) {
            enemy.fearMark = scene.add.text(enemy.x, enemy.y - 18, '!', {
                fontSize: '16px',
                fill: '#ff0000',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(15);
        }
        enemy.fearMark.x = enemy.x;
        enemy.fearMark.y = enemy.y - 18;
    } else if (enemy.fearMark) {
        enemy.fearMark.destroy();
        enemy.fearMark = null;
    }

    // SLOW - Blue aura
    if (effects.slow.active) {
        if (!enemy.slowAura) {
            enemy.slowAura = scene.add.graphics();
            enemy.slowAura.lineStyle(2, 0x4169e1, 0.5);
            enemy.slowAura.strokeCircle(0, 0, 14);
            enemy.slowAura.setDepth(14);
        }
        enemy.slowAura.x = enemy.x;
        enemy.slowAura.y = enemy.y;
    } else if (enemy.slowAura) {
        enemy.slowAura.destroy();
        enemy.slowAura = null;
    }
}

/**
 * Create massive explosion effect for boss death
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {void}
 */
export function createBossDeathEffect(scene, x, y) {
    // Massive explosion for boss
    for (let i = 0; i < 32; i++) {
        const particle = scene.add.graphics();
        particle.x = x;
        particle.y = y;

        const colors = [0xff0000, 0xff6b00, 0xffed4e, 0xffffff];
        const color = colors[i % colors.length];

        const size = Phaser.Math.Between(5, 10);
        particle.fillStyle(color, 1);
        particle.fillCircle(0, 0, size);
        particle.setDepth(50);

        const angle = (i / 32) * Math.PI * 2;
        const distance = Phaser.Math.Between(50, 120);

        scene.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * distance,
            y: y + Math.sin(angle) * distance,
            alpha: 0,
            scale: 0,
            duration: 600 + Math.random() * 300,
            onComplete: () => particle.destroy(),
        });
    }

    // Multiple explosion rings
    for (let j = 0; j < 3; j++) {
        const ring = scene.add.graphics();
        ring.x = x;
        ring.y = y;
        ring.setDepth(49);

        scene.tweens.add({
            targets: ring,
            duration: 600,
            delay: j * 150,
            onUpdate: (tween) => {
                ring.clear();
                const progress = tween.progress;
                const radius = progress * 80;
                const alpha = 1 - progress;

                ring.lineStyle(4, 0xff6b00, alpha);
                ring.strokeCircle(0, 0, radius);
            },
            onComplete: () => ring.destroy(),
        });
    }
}

/**
 * Create level up visual effect at player position
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {import('../types/game-types.js').Player} player - Player object with x, y properties
 * @returns {void}
 */
export function createLevelUpEffect(scene, player) {
    // Use element color if available, otherwise gold
    const effectColor = player.element ? ELEMENTS[player.element].color : 0xffd700;

    // Ring effect
    const effect = scene.add.graphics();
    effect.x = player.x;
    effect.y = player.y;
    effect.setDepth(50);

    scene.tweens.add({
        targets: effect,
        duration: 800,
        onUpdate: (tween) => {
            effect.clear();
            const progress = tween.progress;
            const radius = 10 + progress * 50;
            const alpha = 1 - progress;

            effect.lineStyle(4, effectColor, alpha);
            effect.strokeCircle(0, 0, radius);
        },
        onComplete: () => effect.destroy(),
    });

    // Particles
    for (let i = 0; i < 12; i++) {
        const particle = scene.add.graphics();
        particle.x = player.x;
        particle.y = player.y;
        particle.fillStyle(effectColor, 1);
        particle.fillCircle(0, 0, 3);
        particle.setDepth(50);

        const angle = (i / 12) * Math.PI * 2;
        scene.tweens.add({
            targets: particle,
            x: player.x + Math.cos(angle) * 60,
            y: player.y + Math.sin(angle) * 60,
            alpha: 0,
            duration: 600,
            onComplete: () => particle.destroy(),
        });
    }
}

/**
 * Create enemy death explosion effect
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {void}
 */
export function createDeathEffect(scene, x, y) {
    // Enhanced explosion particles with more variety
    for (let i = 0; i < 16; i++) {
        const particle = scene.add.graphics();
        particle.x = x;
        particle.y = y;

        const colors = [0xff6b6b, 0xffa502, 0xffed4e, 0xff4500];
        const color = colors[i % colors.length];

        // Vary particle sizes
        const size = Phaser.Math.Between(3, 6);
        particle.fillStyle(color, 1);
        particle.fillCircle(0, 0, size);
        particle.setDepth(50);

        const angle = (i / 16) * Math.PI * 2;
        const distance = Phaser.Math.Between(30, 60);

        scene.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * distance,
            y: y + Math.sin(angle) * distance,
            alpha: 0,
            scale: 0,
            duration: 400 + Math.random() * 200,
            onComplete: () => particle.destroy(),
        });
    }

    // Add explosion ring
    const ring = scene.add.graphics();
    ring.x = x;
    ring.y = y;
    ring.setDepth(49);

    scene.tweens.add({
        targets: ring,
        duration: 300,
        onUpdate: (tween) => {
            ring.clear();
            const progress = tween.progress;
            const radius = progress * 40;
            const alpha = 1 - progress;

            ring.lineStyle(3, 0xff6b00, alpha);
            ring.strokeCircle(0, 0, radius);
        },
        onComplete: () => ring.destroy(),
    });

    // Small camera shake on death
    scene.cameras.main.shake(100, 0.002);
}

/**
 * Create teleport effect particles
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {void}
 */
export function createTeleportEffect(scene, x, y) {
    // Purple/cyan teleport particles
    for (let i = 0; i < 12; i++) {
        const particle = scene.add.graphics();
        particle.x = x;
        particle.y = y + (i - 6) * 5;

        particle.fillStyle(0x00ffff, 1);
        particle.fillCircle(0, 0, 3);
        particle.setDepth(50);

        scene.tweens.add({
            targets: particle,
            x: x + (Math.random() - 0.5) * 40,
            y: particle.y + (Math.random() - 0.5) * 40,
            alpha: 0,
            scale: 0,
            duration: 300,
            onComplete: () => particle.destroy(),
        });
    }
}
