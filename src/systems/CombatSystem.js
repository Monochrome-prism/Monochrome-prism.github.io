/**
 * CombatSystem.js
 *
 * Manages all combat mechanics including orb attacks, elemental effects, and status effects
 * Handles damage calculation, orb positioning, collision detection, and status effect ticks
 */

import { ELEMENTS } from '../config/elements.js';
import { soundFX } from './SoundFX.js';
import { applyKnockback, getAngleDifference } from '../utils/MathHelpers.js';

export class CombatSystem {
    /**
     * Create a new CombatSystem
     * @param {Phaser.Scene} scene - The game scene
     * @param {import('../types/game-types.js').Player} player - The player object
     */
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.wizardOrbs = [];
    }

    /**
     * Update orb colors when element changes
     * @param {number} color - Hex color code for the element
     * @returns {void}
     */
    updateOrbColors(color) {
        // Redraw all existing orbs with the new element color
        this.wizardOrbs.forEach((orb) => {
            orb.clear();
            orb.fillStyle(color, 0.6);
            orb.fillCircle(0, 0, 10);
            orb.fillStyle(color, 1);
            orb.fillCircle(0, 0, 6);
            orb.fillStyle(0xffffff, 1);
            orb.fillCircle(-2, -2, 2);
        });
    }

    /**
     * Update wizard orbs - position, rotation, and collision detection
     * @param {Phaser.GameObjects.Group} enemies - Enemy group for collision detection
     * @param {Function} orbHitCallback - Callback when orb hits enemy
     * @returns {void}
     */
    updateWizardOrbs(enemies, orbHitCallback) {
        if (!this.player || this.player.characterType !== "wizard")
            return;
        if (!this.wizardOrbs) this.wizardOrbs = [];

        // Make sure we have the right number of orbs
        while (this.wizardOrbs.length < this.player.orbCount) {
            const orb = this.scene.add.graphics();
            orb.orbAngle =
                (this.wizardOrbs.length / this.player.orbCount) *
                Math.PI *
                2;

            // Use element color if chosen, otherwise grey
            const orbColor = this.player.element ? ELEMENTS[this.player.element].color : 0x808080;

            orb.fillStyle(orbColor, 0.6);
            orb.fillCircle(0, 0, 10);
            orb.fillStyle(this.player.element ? orbColor : 0xa0a0a0, 1);
            orb.fillCircle(0, 0, 6);
            orb.fillStyle(0xffffff, 1);
            orb.fillCircle(-2, -2, 2);

            this.scene.physics.add.existing(orb);
            orb.body.setCircle(12);
            orb.setDepth(10);

            this.wizardOrbs.push(orb);
        }

        // Update orb positions
        this.wizardOrbs.forEach((orb, index) => {
            orb.orbAngle += this.player.orbSpeed * 0.02;

            const x =
                this.player.x +
                Math.cos(orb.orbAngle) * this.player.orbDistance;
            const y =
                this.player.y +
                Math.sin(orb.orbAngle) * this.player.orbDistance;

            orb.x = x;
            orb.y = y;

            // Check collision with enemies
            enemies.children.entries.forEach((enemy) => {
                if (!enemy.active) return;

                const dist = Phaser.Math.Distance.Between(
                    orb.x,
                    orb.y,
                    enemy.x,
                    enemy.y,
                );
                if (dist < 27) {
                    orbHitCallback(orb, enemy);
                }
            });
        });
    }

    /**
     * Handle orb hitting an enemy - apply damage and elemental effects
     * @param {Phaser.GameObjects.Graphics} orb - The orb that hit
     * @param {import('../types/game-types.js').Enemy} enemy - The enemy that was hit
     * @param {Phaser.GameObjects.Group} enemies - All enemies for AoE effects
     * @param {Function} showDamageCallback - Callback to show damage number
     * @param {Function} killEnemyCallback - Callback to kill enemy
     * @returns {void}
     */
    orbHitEnemy(orb, enemy, enemies, showDamageCallback, killEnemyCallback) {
        if (!orb || !enemy || !orb.active || !enemy.active) return;

        // Cooldown check to prevent hitting same enemy too fast
        const now = this.scene.time.now;
        if (enemy.lastOrbHit && now - enemy.lastOrbHit < 500)
            return;
        enemy.lastOrbHit = now;

        // Deal damage with element-specific bonuses
        let damage = this.player.damage;

        // Molten Core: +25% damage to burning enemies (Flame upgrade)
        if (this.player.moltenCore && enemy.statusEffects && enemy.statusEffects.burn.active) {
            damage = Math.floor(damage * this.player.moltenCore);
        }

        // Glacial Shards: +30% damage to frozen enemies (Water upgrade)
        if (this.player.glacialShards && enemy.statusEffects && enemy.statusEffects.freeze.active) {
            damage = Math.floor(damage * this.player.glacialShards);
        }

        // Surge: +30% damage vs tank enemies (Electric upgrade)
        if (this.player.surge && enemy.isTank) {
            damage = Math.floor(damage * this.player.surge);
        } else if (enemy.isTank) {
            damage = Math.floor(damage * 0.5); // Tanks take 50% less damage normally
        }

        enemy.health -= damage;

        // Show damage number
        showDamageCallback(enemy.x, enemy.y, damage);

        // Apply elemental status effects based on player's element
        if (this.player.element && enemy.statusEffects) {
            this.applyElementalEffect(enemy, enemies, orb, now, showDamageCallback, killEnemyCallback);
        }

        // Play hit sound
        soundFX.play("hit");

        // Flash enemy
        enemy.setAlpha(0.5);
        this.scene.time.delayedCall(50, () => {
            if (enemy.active) enemy.setAlpha(1);
        });

        // Check if enemy died
        if (enemy.health <= 0) {
            killEnemyCallback(enemy);
        }
    }

    /**
     * Apply elemental effects based on player's current element
     * @private
     * @param {import('../types/game-types.js').Enemy} enemy - Enemy to affect
     * @param {Phaser.GameObjects.Group} enemies - All enemies for AoE effects
     * @param {Phaser.GameObjects.Graphics} orb - The orb that hit
     * @param {number} now - Current time
     * @param {Function} showDamageCallback - Callback to show damage number
     * @param {Function} killEnemyCallback - Callback to kill enemy
     * @returns {void}
     */
    applyElementalEffect(enemy, enemies, orb, now, showDamageCallback, killEnemyCallback) {
        const element = this.player.element;
        const effects = enemy.statusEffects;

        switch(element) {
            case 'flame':
                // Burn: 3 damage/sec for 3 seconds (+ bonuses)
                effects.burn.active = true;
                effects.burn.damage = 3 + (this.player.burnDamageBonus || 0);
                effects.burn.duration = 3000 + (this.player.burnDurationBonus || 0);
                effects.burn.lastTick = now;
                break;

            case 'water':
                // 50% chance to freeze for 2 seconds (+ bonuses)
                const freezeChance = 0.50 + (this.player.freezeChanceBonus || 0);
                if (Math.random() < freezeChance) {
                    effects.freeze.active = true;
                    const baseDuration = 2000;
                    effects.freeze.duration = baseDuration * (this.player.freezeDurationBonus || 1);

                    // Tidal Wave (Water upgrade) - can freeze 2 enemies at once
                    if (this.player.hasTidalWave) {
                        let closestEnemy = null;
                        let closestDist = 80; // Max tidal wave range
                        enemies.children.entries.forEach((nearbyEnemy) => {
                            if (nearbyEnemy === enemy || !nearbyEnemy.active) return;
                            const dist = Phaser.Math.Distance.Between(
                                enemy.x, enemy.y,
                                nearbyEnemy.x, nearbyEnemy.y
                            );
                            if (dist < closestDist && nearbyEnemy.statusEffects) {
                                closestDist = dist;
                                closestEnemy = nearbyEnemy;
                            }
                        });

                        if (closestEnemy && closestEnemy.statusEffects) {
                            closestEnemy.statusEffects.freeze.active = true;
                            closestEnemy.statusEffects.freeze.duration = baseDuration * (this.player.freezeDurationBonus || 1);
                        }
                    }
                }
                break;

            case 'electric':
                // 50% chance to paralyze for 1 second (+ bonuses)
                const paralyzeChance = 0.50 + (this.player.paralyzeChanceBonus || 0);
                if (Math.random() < paralyzeChance) {
                    effects.paralyze.active = true;
                    effects.paralyze.duration = 1000;
                }

                // Chain Lightning (Electric upgrade) - jump to nearby enemy
                if (this.player.hasChainLightning) {
                    let closestEnemy = null;
                    let closestDist = 100; // Max chain range (reduced to 100px)
                    enemies.children.entries.forEach((nearbyEnemy) => {
                        if (nearbyEnemy === enemy || !nearbyEnemy.active) return;
                        const dist = Phaser.Math.Distance.Between(
                            enemy.x, enemy.y,
                            nearbyEnemy.x, nearbyEnemy.y
                        );
                        if (dist < closestDist) {
                            closestDist = dist;
                            closestEnemy = nearbyEnemy;
                        }
                    });

                    if (closestEnemy) {
                        // Deal 50% damage to chained enemy
                        const chainDamage = Math.floor(this.player.damage * 0.5);
                        closestEnemy.health -= chainDamage;
                        showDamageCallback(closestEnemy.x, closestEnemy.y, chainDamage, 0xffff00);
                        if (closestEnemy.health <= 0) {
                            killEnemyCallback(closestEnemy);
                        }
                    }
                }
                break;

            case 'nature':
                // Poison: starts at 2 damage (+ bonuses), doubles every 2 seconds
                effects.poison.active = true;
                effects.poison.damage = 2 + (this.player.poisonDamageBonus || 0);
                effects.poison.duration = 6000;
                effects.poison.lastTick = now;
                effects.poison.stacks = 0;
                break;

            case 'wind':
                // 50% chance to sleep for 2 seconds (+ bonuses)
                if (Math.random() < 0.50) {
                    effects.sleep.active = true;
                    effects.sleep.duration = 2000 + (this.player.sleepDurationBonus || 0);
                }
                // Always apply knockback (+ bonuses)
                const knockbackPower = 200 * (this.player.knockbackBonus || 1);
                applyKnockback(enemy.body, orb.x, orb.y, enemy.x, enemy.y, knockbackPower);
                break;

            case 'terra':
                // Strong knockback (+ bonuses)
                const terraKnockback = 300 * (this.player.knockbackBonus || 1);
                applyKnockback(enemy.body, orb.x, orb.y, enemy.x, enemy.y, terraKnockback);
                // Earthquake: Knockback stuns for 0.5 seconds
                if (this.player.hasEarthquake) {
                    effects.paralyze.active = true;
                    effects.paralyze.duration = 500;
                }

                // Tremor (Terra upgrade) - knockback affects area around impact
                if (this.player.hasTremor) {
                    enemies.children.entries.forEach((nearbyEnemy) => {
                        if (nearbyEnemy === enemy || !nearbyEnemy.active) return;
                        const dist = Phaser.Math.Distance.Between(
                            enemy.x, enemy.y,
                            nearbyEnemy.x, nearbyEnemy.y
                        );
                        if (dist < 80) {
                            const nearbyKnockback = (terraKnockback * 0.5); // Half power for area effect
                            applyKnockback(nearbyEnemy.body, enemy.x, enemy.y, nearbyEnemy.x, nearbyEnemy.y, nearbyKnockback);
                        }
                    });
                }
                break;

            case 'gravity':
                // Slow 40% (+ bonuses) + 50% confusion chance
                effects.slow.active = true;
                effects.slow.slowAmount = 0.4 + (this.player.slowBonus || 0);
                if (Math.random() < 0.50) {
                    effects.confusion.active = true;
                    effects.confusion.duration = 2000 + (this.player.confusionDurationBonus || 0);
                }

                // Dense Matter (Gravity upgrade) - slow affects larger area
                if (this.player.hasDenseMatter) {
                    enemies.children.entries.forEach((nearbyEnemy) => {
                        if (nearbyEnemy === enemy || !nearbyEnemy.active || !nearbyEnemy.statusEffects) return;
                        const dist = Phaser.Math.Distance.Between(
                            enemy.x, enemy.y,
                            nearbyEnemy.x, nearbyEnemy.y
                        );
                        if (dist < 100) {
                            nearbyEnemy.statusEffects.slow.active = true;
                            nearbyEnemy.statusEffects.slow.slowAmount = (0.4 + (this.player.slowBonus || 0)) * 0.5; // Half effectiveness for area
                        }
                    });
                }
                break;

            case 'celestial':
                // 50% charm chance (+ bonuses) for 3 seconds
                const charmChance = 0.50 + (this.player.charmChanceBonus || 0);
                if (Math.random() < charmChance) {
                    effects.charm.active = true;
                    effects.charm.duration = 3000 + (this.player.charmDurationBonus || 0);
                }
                break;

            case 'radiant':
                // 50% blind chance (+ bonuses)
                const blindChance = 0.50 + (this.player.blindChanceBonus || 0);
                if (Math.random() < blindChance) {
                    effects.blind.active = true;
                }
                break;

            case 'shadow':
                // 50% fear (+ bonuses) for 2 seconds
                const fearChance = 0.50 + (this.player.fearChanceBonus || 0);
                if (Math.random() < fearChance) {
                    effects.fear.active = true;
                    effects.fear.duration = 2000 + (this.player.fearDurationBonus || 0);
                }
                break;
        }
    }

    /**
     * Update status effects on an enemy (burn, poison, freeze, etc.)
     * @param {import('../types/game-types.js').Enemy} enemy - Enemy to update
     * @param {number} time - Current game time
     * @param {number} delta - Time since last frame
     * @param {Phaser.GameObjects.Group} enemies - All enemies for spread effects
     * @param {Function} showDamageCallback - Callback to show damage
     * @param {Function} killEnemyCallback - Callback when enemy dies
     * @returns {void}
     */
    updateStatusEffects(enemy, time, delta, enemies, showDamageCallback, killEnemyCallback) {
        if (!enemy.statusEffects) return;

        const effects = enemy.statusEffects;

        // BURN - Damage over time
        if (effects.burn.active) {
            if (time - effects.burn.lastTick >= effects.burn.tickRate) {
                enemy.health -= effects.burn.damage;
                showDamageCallback(enemy.x, enemy.y, effects.burn.damage, 0xff4500);
                effects.burn.lastTick = time;

                // Wildfire (Flame upgrade) - burn spreads to nearby enemies
                if (this.player.hasWildfire) {
                    enemies.children.entries.forEach((nearbyEnemy) => {
                        if (nearbyEnemy === enemy || !nearbyEnemy.active) return;
                        const dist = Phaser.Math.Distance.Between(
                            enemy.x, enemy.y,
                            nearbyEnemy.x, nearbyEnemy.y
                        );
                        if (dist < 60 && nearbyEnemy.statusEffects && !nearbyEnemy.statusEffects.burn.active) {
                            nearbyEnemy.statusEffects.burn.active = true;
                            nearbyEnemy.statusEffects.burn.damage = effects.burn.damage;
                            nearbyEnemy.statusEffects.burn.duration = 2000; // Shorter spread duration
                            nearbyEnemy.statusEffects.burn.lastTick = time;
                        }
                    });
                }
            }
            effects.burn.duration -= delta;
            if (effects.burn.duration <= 0) {
                effects.burn.active = false;
            }
        }

        // POISON - Doubling damage over time
        if (effects.poison.active) {
            if (time - effects.poison.lastTick >= effects.poison.tickRate) {
                const damage = effects.poison.damage * Math.pow(2, effects.poison.stacks);
                enemy.health -= damage;
                showDamageCallback(enemy.x, enemy.y, damage, 0x32cd32);
                effects.poison.lastTick = time;
                effects.poison.stacks++; // Double on next tick

                // Spore Cloud (Nature upgrade) - poison spreads to nearby enemies
                if (this.player.hasSporeCloud) {
                    enemies.children.entries.forEach((nearbyEnemy) => {
                        if (nearbyEnemy === enemy || !nearbyEnemy.active) return;
                        const dist = Phaser.Math.Distance.Between(
                            enemy.x, enemy.y,
                            nearbyEnemy.x, nearbyEnemy.y
                        );
                        if (dist < 60 && nearbyEnemy.statusEffects && !nearbyEnemy.statusEffects.poison.active) {
                            nearbyEnemy.statusEffects.poison.active = true;
                            nearbyEnemy.statusEffects.poison.damage = effects.poison.damage;
                            nearbyEnemy.statusEffects.poison.duration = 3000; // Shorter spread duration
                            nearbyEnemy.statusEffects.poison.lastTick = time;
                            nearbyEnemy.statusEffects.poison.stacks = 0;
                        }
                    });
                }
            }
            effects.poison.duration -= delta;
            if (effects.poison.duration <= 0) {
                effects.poison.active = false;
                effects.poison.stacks = 0;
            }
        }

        // FREEZE - Stop movement (handled in movement code)
        if (effects.freeze.active) {
            effects.freeze.duration -= delta;
            if (effects.freeze.duration <= 0) {
                effects.freeze.active = false;
            }
        }

        // PARALYZE - Stun (handled in movement code)
        if (effects.paralyze.active) {
            // Static Field (Electric upgrade) - paralyzed enemies take damage over time
            if (this.player.hasStaticField) {
                if (!effects.paralyze.lastDamageTick) effects.paralyze.lastDamageTick = 0;
                if (time - effects.paralyze.lastDamageTick >= 500) {
                    const staticDamage = 2;
                    enemy.health -= staticDamage;
                    showDamageCallback(enemy.x, enemy.y, staticDamage, 0xffff00);
                    effects.paralyze.lastDamageTick = time;
                }
            }

            effects.paralyze.duration -= delta;
            if (effects.paralyze.duration <= 0) {
                effects.paralyze.active = false;
            }
        }

        // SLEEP - Cannot act (handled in movement code)
        if (effects.sleep.active) {
            effects.sleep.duration -= delta;
            if (effects.sleep.duration <= 0) {
                effects.sleep.active = false;
            }
        }

        // CHARM - Cannot attack player
        if (effects.charm.active) {
            effects.charm.duration -= delta;
            if (effects.charm.duration <= 0) {
                effects.charm.active = false;
            }
        }

        // CONFUSION - Random movement (handled in movement code)
        if (effects.confusion.active) {
            effects.confusion.duration -= delta;
            if (effects.confusion.duration <= 0) {
                effects.confusion.active = false;
            }
        }

        // FEAR - Run away from player (handled in movement code)
        if (effects.fear.active) {
            effects.fear.duration -= delta;
            if (effects.fear.duration <= 0) {
                effects.fear.active = false;
            }
        }

        // SLOW - Reduce speed
        if (effects.slow.active) {
            enemy.speed = enemy.originalSpeed * (1 - effects.slow.slowAmount);
        } else {
            enemy.speed = enemy.originalSpeed;
        }

        // Check if enemy died from status effects
        if (enemy.health <= 0) {
            killEnemyCallback(enemy);
        }
    }

    /**
     * Update flamethrower attack (Flame element special attack)
     * @param {number} moveX - Player movement X
     * @param {number} moveY - Player movement Y
     * @param {number} time - Current time
     * @param {Phaser.GameObjects.Group} enemies - Enemy group
     * @param {Function} showDamageCallback - Callback to show damage
     * @returns {void}
     */
    updateFlamethrowerAttack(moveX, moveY, time, enemies, showDamageCallback) {
        // Only fire while moving
        if (moveX === 0 && moveY === 0) {
            return;
        }

        // Fire cone in opposite direction of movement
        const fireAngle = Math.atan2(-moveY, -moveX);

        // Initialize flamethrower timer if needed
        if (!this.player.lastFlamethrowerTick) {
            this.player.lastFlamethrowerTick = time;
        }

        // Tick damage every 0.5 seconds
        if (time - this.player.lastFlamethrowerTick >= 500) {
            this.player.lastFlamethrowerTick = time;

            // Create wide cone spray effect
            const coneAngleSpread = Math.PI / 3; // 60 degree spread
            const flameRange = 100;

            // Create fire particles
            for (let i = 0; i < 8; i++) {
                const offsetAngle = (i / 8 - 0.5) * coneAngleSpread;
                const particleAngle = fireAngle + offsetAngle;
                const px = this.player.x + Math.cos(particleAngle) * (flameRange * 0.5);
                const py = this.player.y + Math.sin(particleAngle) * (flameRange * 0.5);

                const particle = this.scene.add.graphics();
                particle.fillStyle(0xff4500, 0.8);
                particle.fillCircle(0, 0, Phaser.Math.Between(5, 12));
                particle.x = px;
                particle.y = py;
                particle.setDepth(15);

                this.scene.tweens.add({
                    targets: particle,
                    x: px + Math.cos(particleAngle) * 30,
                    y: py + Math.sin(particleAngle) * 30,
                    alpha: 0,
                    scale: 0.5,
                    duration: 500,
                    onComplete: () => particle.destroy()
                });
            }

            // Damage enemies in cone
            enemies.children.entries.forEach((enemy) => {
                if (!enemy.active) return;

                const toEnemy = Math.atan2(
                    enemy.y - this.player.y,
                    enemy.x - this.player.x
                );
                // Calculate angle difference using helper
                const angleDiff = getAngleDifference(fireAngle, toEnemy);

                const dist = Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    enemy.x,
                    enemy.y
                );

                // Check if enemy is within cone and range
                if (angleDiff < coneAngleSpread / 2 && dist < flameRange) {
                    const damage = this.player.damage;
                    enemy.health -= damage;
                    showDamageCallback(enemy.x, enemy.y, damage, 0xff4500);

                    // Apply burn
                    if (enemy.statusEffects) {
                        enemy.statusEffects.burn.active = true;
                        enemy.statusEffects.burn.damage = 3 + (this.player.burnDamageBonus || 0);
                        enemy.statusEffects.burn.duration = 2000;
                        enemy.statusEffects.burn.lastTick = time;
                    }
                }
            });
        }
    }
}
