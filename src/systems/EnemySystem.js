/**
 * EnemySystem.js
 *
 * Manages enemy spawning, AI behaviors, special attacks, and death handling
 * Handles boss spawning, enemy types, XP orbs, and special enemy abilities
 */

import { soundFX } from './SoundFX.js';
import { drawBoss, drawSlime, drawGoblin, drawTank, drawBomber } from '../utils/DrawingHelpers.js';
import { createBossDeathEffect, createDeathEffect } from '../utils/StatusEffectHelpers.js';
import { getSpawnPositionOnEdge } from '../utils/MathHelpers.js';

export class EnemySystem {
    /**
     * Create a new EnemySystem
     * @param {Phaser.Scene} scene - The game scene
     * @param {import('../types/game-types.js').Player} player - The player object
     * @param {import('./UISystem.js').UISystem} uiSystem - UI system for updates
     * @param {import('./WaveSystem.js').WaveSystem} waveSystem - Wave system for wave info
     */
    constructor(scene, player, uiSystem, waveSystem) {
        this.scene = scene;
        this.player = player;
        this.uiSystem = uiSystem;
        this.waveSystem = waveSystem;
    }

    /**
     * Spawn a boss enemy
     * @param {Phaser.GameObjects.Group} enemies - Enemy group to add boss to
     * @returns {void}
     */
    spawnBoss(enemies) {
        const boss = this.scene.add.graphics();
        boss.x = 400; // Center of screen
        boss.y = -50; // Spawn from top

        // Draw boss (large, imposing)
        drawBoss(boss);

        // Scale for mobile
        boss.setScale(this.scene.mobileScale);

        // Boss stats (very powerful)
        const bossLevel = Math.floor(this.waveSystem.getCurrentWave() / 5);
        boss.maxHealth = 500 + bossLevel * 200;
        boss.health = boss.maxHealth;
        boss.speed = 35 + bossLevel * 5;
        boss.damage = (20 + bossLevel * 5) * 2; // Doubled damage
        boss.xpValue = 113; // +50% buff from 75 for better progression
        boss.scoreValue = 500;
        boss.isBoss = true;
        boss.enemyType = 99; // Special boss type

        // Status effect system (same as regular enemies)
        boss.statusEffects = {
            burn: { active: false, damage: 3, duration: 0, tickRate: 1000, lastTick: 0 },
            freeze: { active: false, duration: 0 },
            poison: { active: false, damage: 2, duration: 0, tickRate: 2000, lastTick: 0, stacks: 0 },
            paralyze: { active: false, duration: 0 },
            sleep: { active: false, duration: 0 },
            charm: { active: false, duration: 0 },
            confusion: { active: false, duration: 0 },
            blind: { active: false, accuracyMod: 0.5 },
            fear: { active: false, duration: 0 },
            slow: { active: false, slowAmount: 0.4 },
            knockback: { velocity: { x: 0, y: 0 } }
        };

        boss.health = boss.maxHealth;
        boss.originalSpeed = boss.speed; // Store original speed

        this.scene.physics.add.existing(boss);
        // Boss hitbox: 50% smaller for better gameplay (reduced from 40 to 20 base)
        boss.body.setSize(20 * this.scene.mobileScale, 20 * this.scene.mobileScale);
        boss.body.setCollideWorldBounds(true); // Prevent boss from entering UI area
        boss.setDepth(10);
        enemies.add(boss);
        this.waveSystem.incrementEnemiesAlive();

        // Boss warning message
        const warningText = this.scene.add
            .text(400, 300, "BOSS INCOMING!", {
                fontSize: "48px",
                fill: "#ff0000",
                fontFamily: "Courier New",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 6,
            })
            .setOrigin(0.5)
            .setDepth(1500);

        // Fade out warning
        this.scene.tweens.add({
            targets: warningText,
            alpha: 0,
            y: 250,
            duration: 2000,
            onComplete: () => warningText.destroy(),
        });

        // Camera shake
        this.scene.cameras.main.shake(500, 0.01);

        // Boss special attack timer
        boss.lastSpecialAttack = this.scene.time.now;

        // Boss spawn time - wait 5 seconds before attacking
        boss.spawnTime = this.scene.time.now;
    }

    /**
     * Spawn a regular enemy
     * @param {Phaser.GameObjects.Group} enemies - Enemy group to add enemy to
     * @returns {void}
     */
    spawnEnemy(enemies) {
        const enemy = this.scene.add.graphics();

        // Spawn on edges
        const spawnPos = getSpawnPositionOnEdge(800, 600);
        enemy.x = spawnPos.x;
        enemy.y = spawnPos.y;

        // Enemy type (more variety in later waves)
        let enemyType;
        const rand = Math.random();
        const currentWave = this.waveSystem.getCurrentWave();

        if (currentWave === 1) {
            enemyType = 0; // Wave 1: Only slimes
        } else if (currentWave === 2) {
            // Wave 2: Mostly slimes but guarantee 1 goblin
            enemyType = this.waveSystem.getEnemiesSpawned() === 0 ? 1 : 0; // First enemy is goblin, rest are slimes
        } else if (currentWave < 4) {
            // Wave 3: Only slimes
            enemyType = 0;
        } else if (currentWave === 4) {
            // Wave 4: Slimes, Goblins, and guarantee 1 Tank
            const enemiesSpawned = this.waveSystem.getEnemiesSpawned();
            if (enemiesSpawned === 0) {
                enemyType = 2; // First enemy is Tank
            } else {
                enemyType = rand < 0.7 ? 0 : 1; // Rest are Slimes and Goblins
            }
        } else if (currentWave < 7) {
            // Waves 5-6: Slimes and Goblins
            enemyType = rand < 0.7 ? 0 : 1;
        } else {
            // Wave 7+: All enemy types
            if (rand < 0.4)
                enemyType = 0; // Slime
            else if (rand < 0.65)
                enemyType = 1; // Goblin
            else if (rand < 0.85)
                enemyType = 2; // Tank
            else enemyType = 3; // Bomber
        }

        if (enemyType === 0) {
            // Slime (basic enemy)
            drawSlime(enemy);
            enemy.maxHealth = 30 + currentWave * 5;
            enemy.speed = 40; // Static speed (no wave scaling)
            enemy.damage = (5 + currentWave) * 2; // Doubled damage
            enemy.xpValue = 20;
            enemy.scoreValue = 10;
        } else if (enemyType === 1) {
            // Goblin (stronger, faster)
            drawGoblin(enemy);
            enemy.maxHealth = 50 + currentWave * 8;
            enemy.speed = 70; // Static speed (no wave scaling) - increased from 60
            enemy.damage = (8 + currentWave * 2) * 2; // Doubled damage
            enemy.xpValue = 35;
            enemy.scoreValue = 25;
        } else if (enemyType === 2) {
            // Tank (slow, high HP)
            drawTank(enemy);
            enemy.maxHealth = 150 + currentWave * 15;
            enemy.speed = 30; // Static speed (no wave scaling) - increased from 20
            enemy.damage = (12 + currentWave * 2) * 2; // Doubled damage
            enemy.xpValue = 60;
            enemy.scoreValue = 50;
            enemy.isTank = true;
        } else {
            // Bomber (teleports, self-destructs)
            drawBomber(enemy);
            enemy.maxHealth = 20 + currentWave * 3;
            enemy.speed = 45; // Static speed (no wave scaling)
            enemy.damage = 10; // Fixed damage (buffed from 5)
            enemy.xpValue = 40;
            enemy.scoreValue = 35;
            enemy.isBomber = true;
            enemy.teleportCooldown = 0;
            enemy.explosionRadius = 80;
        }

        // Scale for mobile
        enemy.setScale(this.scene.mobileScale);

        enemy.health = enemy.maxHealth;
        enemy.originalSpeed = enemy.speed; // Store original speed
        enemy.enemyType = enemyType;

        // Status effect system
        enemy.statusEffects = {
            burn: { active: false, damage: 3, duration: 0, tickRate: 1000, lastTick: 0 },
            freeze: { active: false, duration: 0 },
            poison: { active: false, damage: 2, duration: 0, tickRate: 2000, lastTick: 0, stacks: 0 },
            paralyze: { active: false, duration: 0 },
            sleep: { active: false, duration: 0 },
            charm: { active: false, duration: 0 },
            confusion: { active: false, duration: 0 },
            blind: { active: false, accuracyMod: 0.5 },
            fear: { active: false, duration: 0 },
            slow: { active: false, slowAmount: 0.4 },
            knockback: { velocity: { x: 0, y: 0 } }
        };

        this.scene.physics.add.existing(enemy);
        // Enemy hitbox: 50% smaller for better gameplay (reduced from 20 to 10 base)
        enemy.body.setSize(10 * this.scene.mobileScale, 10 * this.scene.mobileScale);
        enemy.body.setCollideWorldBounds(true); // Prevent enemy from entering UI area
        enemy.setDepth(10); // Set depth so enemies appear behind UI
        enemies.add(enemy);
        this.waveSystem.incrementEnemiesAlive();
    }

    /**
     * Kill an enemy - handle death effects, XP drop, scoring, and cleanup
     * @param {import('../types/game-types.js').Enemy} enemy - Enemy to kill
     * @param {Function} spawnXPOrbCallback - Callback to spawn XP orb
     * @param {Function} updateScoreCallback - Callback to update score
     * @returns {void}
     */
    killEnemy(enemy, spawnXPOrbCallback, updateScoreCallback) {
        // Spawn XP orb
        spawnXPOrbCallback(enemy.x, enemy.y, enemy.xpValue);

        // Add score
        updateScoreCallback(enemy.scoreValue);

        // Death effect (bigger for boss)
        if (enemy.isBoss) {
            createBossDeathEffect(this.scene, enemy.x, enemy.y);
            // Subtle screen shake on boss death
            this.scene.cameras.main.shake(300, 0.005);
            // Remove boss health bar
            this.uiSystem.destroyBossHealthBar();
        } else {
            createDeathEffect(this.scene, enemy.x, enemy.y);
        }

        // Play death sound
        soundFX.play("enemyDeath");

        // Apply life steal if player has it
        if (this.player.lifeSteal) {
            this.player.health = Math.min(
                this.player.maxHealth,
                this.player.health + this.player.lifeSteal,
            );
            this.uiSystem.updateHealthBar(this.player);
        }

        // Siphon (Shadow upgrade) - heal 5 HP per feared enemy kill
        if (this.player.hasSiphon && enemy.statusEffects && enemy.statusEffects.fear.active) {
            this.player.health = Math.min(
                this.player.maxHealth,
                this.player.health + 5
            );
            this.uiSystem.updateHealthBar(this.player);
        }

        // Clean up visual status effect overlays
        if (enemy.freezeOverlay) enemy.freezeOverlay.destroy();
        if (enemy.confusionStars) enemy.confusionStars.destroy();
        if (enemy.blindOverlay) enemy.blindOverlay.destroy();
        if (enemy.fearMark) enemy.fearMark.destroy();
        if (enemy.slowAura) enemy.slowAura.destroy();

        // Remove enemy
        enemy.destroy();
        this.waveSystem.decrementEnemiesAlive();
    }

    /**
     * Boss laser attack - fires two lasers (one at player, one random)
     * @param {import('../types/game-types.js').Enemy} boss - Boss enemy
     * @param {Function} gameOverCallback - Callback when player dies
     * @param {Function} showDamageCallback - Callback to show damage
     * @returns {void}
     */
    bossLaserAttack(boss, gameOverCallback, showDamageCallback) {
        // Laser 1: Aimed at player
        this.fireBossLaser(boss, this.player.x, this.player.y, gameOverCallback, showDamageCallback);

        // Laser 2: Random direction
        const randomX = Phaser.Math.Between(100, 700);
        const randomY = Phaser.Math.Between(100, 500);
        this.fireBossLaser(boss, randomX, randomY, gameOverCallback, showDamageCallback);

        soundFX.play("shoot");
    }

    /**
     * Fire a single boss laser
     * @param {import('../types/game-types.js').Enemy} boss - Boss firing the laser
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @param {Function} gameOverCallback - Callback when player dies
     * @param {Function} showDamageCallback - Callback to show damage
     * @returns {void}
     */
    fireBossLaser(boss, targetX, targetY, gameOverCallback, showDamageCallback) {
        const laser = this.scene.add.graphics();
        laser.x = boss.x;
        laser.y = boss.y;
        laser.setDepth(45);

        // Calculate angle
        const angle = Phaser.Math.Angle.Between(
            boss.x,
            boss.y,
            targetX,
            targetY,
        );

        // Warning line (red, thin)
        laser.lineStyle(2, 0xff0000, 0.6);
        const endX = Math.cos(angle) * 1000;
        const endY = Math.sin(angle) * 1000;
        laser.lineBetween(0, 0, endX, endY);

        // After 0.5 seconds, fire the actual laser
        this.scene.time.delayedCall(500, () => {
            if (!laser.active) return;

            laser.clear();
            // Actual laser beam (thick, bright)
            laser.lineStyle(8, 0xff0000, 1);
            laser.lineBetween(0, 0, endX, endY);

            // Outer glow
            laser.lineStyle(12, 0xff6b00, 0.4);
            laser.lineBetween(0, 0, endX, endY);

            // Check if player is hit by laser
            const laserHitbox = new Phaser.Geom.Line(
                boss.x,
                boss.y,
                boss.x + endX,
                boss.y + endY,
            );
            const playerCircle = new Phaser.Geom.Circle(
                this.player.x,
                this.player.y,
                15,
            );

            if (
                Phaser.Geom.Intersects.LineToCircle(
                    laserHitbox,
                    playerCircle,
                ) &&
                !this.player.invulnerable &&
                !this.player.isLevelingUp
            ) {
                const damage = 25;
                this.player.health -= damage;
                this.uiSystem.updateHealthBar(this.player);
                showDamageCallback(
                    this.player.x,
                    this.player.y,
                    damage,
                );
                soundFX.play("playerHit");

                this.player.invulnerable = true;
                this.player.invulnerableTime = 1000;

                // Knockback away from laser
                const knockbackAngle = angle + Math.PI / 2;
                this.player.body.setVelocity(
                    Math.cos(knockbackAngle) * 200,
                    Math.sin(knockbackAngle) * 200,
                );

                if (this.player.health <= 0) {
                    gameOverCallback();
                }
            }

            // Laser disappears after 0.3 seconds
            this.scene.time.delayedCall(300, () => {
                if (laser.active) laser.destroy();
            });
        });
    }

    /**
     * Tank laser attack - slow moving projectile
     * @param {import('../types/game-types.js').Enemy} tank - Tank enemy
     * @param {Phaser.GameObjects.Group} tankLasers - Group to add laser to
     * @returns {void}
     */
    tankLaserAttack(tank, tankLasers) {
        // Slow moving projectile laser
        const laser = this.scene.add.graphics();
        laser.x = tank.x;
        laser.y = tank.y;
        laser.setDepth(10);

        // Draw slow laser beam (red)
        laser.lineStyle(6, 0xff0000, 1);
        laser.lineBetween(0, 0, 0, -15);
        laser.lineStyle(3, 0xffffff, 1);
        laser.lineBetween(0, 0, 0, -15);

        // Physics
        this.scene.physics.add.existing(laser);
        laser.body.setSize(10, 15);

        // Aim at player
        const angle = Phaser.Math.Angle.Between(
            tank.x,
            tank.y,
            this.player.x,
            this.player.y,
        );

        const speed = 120; // Slow moving
        laser.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
        );

        laser.setRotation(angle + Math.PI / 2);
        laser.damage = 15;
        laser.isTankLaser = true;

        // Add to projectiles for collision
        tankLasers.add(laser);

        soundFX.play("shoot");

        // Auto-destroy after 5 seconds
        this.scene.time.delayedCall(5000, () => {
            if (laser.active) laser.destroy();
        });
    }

    /**
     * Bomber explosion - damage player and nearby enemies
     * @param {import('../types/game-types.js').Enemy} enemy - Bomber enemy
     * @param {Phaser.GameObjects.Group} enemies - All enemies
     * @param {Function} gameOverCallback - Callback when player dies
     * @param {Function} showDamageCallback - Callback to show damage
     * @param {Function} killEnemyCallback - Callback to kill enemy
     * @param {Function} spawnXPOrbCallback - Callback to spawn XP orb
     * @param {Function} updateScoreCallback - Callback to update score
     * @returns {void}
     */
    bomberExplode(enemy, enemies, gameOverCallback, showDamageCallback, killEnemyCallback, spawnXPOrbCallback, updateScoreCallback) {
        // Create large explosion
        const explosionRadius = enemy.explosionRadius;

        // Explosion visual
        const explosion = this.scene.add.graphics();
        explosion.x = enemy.x;
        explosion.y = enemy.y;
        explosion.setDepth(50);

        // Animate explosion growing
        this.scene.tweens.add({
            targets: explosion,
            duration: 400,
            onUpdate: (tween) => {
                explosion.clear();
                const progress = tween.progress;
                const radius = explosionRadius * progress;
                const alpha = 1 - progress;

                // Outer blast
                explosion.fillStyle(0xff6b00, alpha * 0.8);
                explosion.fillCircle(0, 0, radius);

                // Inner blast
                explosion.fillStyle(0xff0000, alpha);
                explosion.fillCircle(0, 0, radius * 0.7);

                // Core
                explosion.fillStyle(0xffff00, alpha);
                explosion.fillCircle(0, 0, radius * 0.4);
            },
            onComplete: () => explosion.destroy(),
        });

        // Camera shake
        this.scene.cameras.main.shake(300, 0.01);

        // Play explosion sound
        soundFX.play("enemyDeath");

        // Damage player if in range
        const distToPlayer = Phaser.Math.Distance.Between(
            enemy.x,
            enemy.y,
            this.player.x,
            this.player.y,
        );

        if (
            distToPlayer < explosionRadius &&
            !this.player.invulnerable &&
            !this.player.isLevelingUp
        ) {
            const damage = enemy.damage * 2; // Double damage from explosion
            this.player.health -= damage;
            this.uiSystem.updateHealthBar(this.player);
            showDamageCallback(
                this.player.x,
                this.player.y,
                damage,
            );
            soundFX.play("playerHit");

            // Invulnerability
            this.player.invulnerable = true;
            this.player.invulnerableTime = 1000;

            // Knockback
            const angle = Math.atan2(
                this.player.y - enemy.y,
                this.player.x - enemy.x,
            );
            this.player.body.setVelocity(
                Math.cos(angle) * 300,
                Math.sin(angle) * 300,
            );

            if (this.player.health <= 0) {
                gameOverCallback();
            }
        }

        // Damage other enemies in range
        enemies.children.entries.forEach((otherEnemy) => {
            if (!otherEnemy.active || otherEnemy === enemy) return;

            const dist = Phaser.Math.Distance.Between(
                enemy.x,
                enemy.y,
                otherEnemy.x,
                otherEnemy.y,
            );

            if (dist < explosionRadius) {
                const damage = enemy.damage;
                otherEnemy.health -= damage;
                showDamageCallback(
                    otherEnemy.x,
                    otherEnemy.y,
                    damage,
                );

                if (otherEnemy.health <= 0) {
                    killEnemyCallback(otherEnemy);
                }
            }
        });

        // Give XP and score for suicide bombing
        spawnXPOrbCallback(enemy.x, enemy.y, enemy.xpValue);
        updateScoreCallback(enemy.scoreValue);

        // Remove bomber
        enemy.destroy();
        this.waveSystem.decrementEnemiesAlive();
    }

    /**
     * Spawn an XP orb at a location
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} value - XP value
     * @param {Phaser.GameObjects.Group} xpOrbs - XP orb group
     * @param {Function} collectXPCallback - Callback when orb is collected
     * @returns {void}
     */
    spawnXPOrb(x, y, value, xpOrbs, collectXPCallback) {
        const orb = this.scene.add.graphics();
        orb.x = x;
        orb.y = y;
        orb.xpValue = value;

        // Draw XP orb
        orb.fillStyle(0x4169e1, 0.6);
        orb.fillCircle(0, 0, 8);
        orb.fillStyle(0x6495ed, 1);
        orb.fillCircle(0, 0, 5);
        orb.fillStyle(0xffffff, 1);
        orb.fillCircle(-2, -2, 2);

        this.scene.physics.add.existing(orb);
        orb.body.setCircle(20); // Increased from 12 to 20 for even better collection range
        orb.setDepth(10); // Behind UI
        xpOrbs.add(orb);

        // Pulse animation
        this.scene.tweens.add({
            targets: orb,
            scale: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1,
        });
    }
}
