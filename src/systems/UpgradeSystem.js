// @ts-check
/**
 * UpgradeSystem.js
 *
 * Manages upgrade and element selection UI and logic
 * Handles element choice at level 1, upgrade menu display, and upgrade application
 */

import { ELEMENTS } from '../config/elements.js';
import { soundFX } from './SoundFX.js';
import { gameState } from '../config/gameState.js';

/**
 * Base values for stackable percentage upgrades.
 *
 * These values serve as the starting point for dynamic upgrade descriptions.
 * Stackable upgrades add to these base values and display current→next in descriptions.
 *
 * @constant {Object} BASE_VALUES
 * @property {number} freeze_chance - Water base freeze chance: 50%
 * @property {number} water_stream_range - Water base stream length: 200px
 * @property {number} burn_damage - Flame base burn damage per tick: 3
 * @property {number} chain_chance - Electric base chain lightning chance: 50%
 * @property {number} knockback_chance - Wind base knockback chance: 20%
 * @property {number} terra_knockback_chance - Terra base knockback chance: 20%
 * @property {number} slow_effectiveness - Gravity base slow effectiveness: 40%
 * @property {number} charm_chance - Celestial base charm chance: 5%
 * @property {number} fear_chance - Shadow base fear chance: 10%
 * @property {number} life_steal_percent - Shadow base lifesteal: 0% (only from upgrade)
 *
 * @since v3.1.1 - Introduced with stackable upgrade system
 *
 * @example
 * // Stackable upgrade using BASE_VALUES
 * const stacks = player.upgradeStacks?.permafrost || 0;
 * const current = BASE_VALUES.freeze_chance + (stacks * 5); // 50% + 5% per stack
 * const next = BASE_VALUES.freeze_chance + ((stacks + 1) * 5);
 * return `+5% freeze chance (${current}% → ${next}%)`;
 */
const BASE_VALUES = {
    // Water
    freeze_chance: 50,
    water_stream_range: 200,

    // Flame
    burn_damage: 3,

    // Electric
    chain_chance: 50,

    // Wind
    knockback_chance: 20,

    // Terra
    terra_knockback_chance: 20,

    // Gravity
    slow_effectiveness: 40,

    // Celestial
    charm_chance: 5,

    // Shadow
    fear_chance: 10,
    life_steal_percent: 0,
};

export class UpgradeSystem {
    /**
     * Create a new UpgradeSystem
     * @param {Phaser.Scene} scene - The game scene
     * @param {import('../types/game-types.js').Player} player - The player object
     * @param {import('./UISystem.js').UISystem} uiSystem - UI system for display
     * @param {import('./WaveSystem.js').WaveSystem} waveSystem - Wave system for progression
     */
    constructor(scene, player, uiSystem, waveSystem) {
        this.scene = scene;
        this.player = player;
        this.uiSystem = uiSystem;
        this.waveSystem = waveSystem;
    }

    /**
     * Show element selection menu (level 1 only)
     * @param {Object} callbacks - Callbacks for GameScene actions
     * @param {Function} callbacks.drawWizard - Function to redraw wizard with element color
     * @param {Function} callbacks.updateOrbColors - Function to update orb colors
     * @param {Function} callbacks.removeOrbs - Function to remove orbs for certain elements
     * @returns {void}
     */
    showElementSelection(callbacks) {
        // Track all UI elements for cleanup
        const uiElements = [];

        // Dim background
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, 800, 600);
        overlay.setDepth(100);
        uiElements.push(overlay);

        // Title
        const title = this.scene.add
            .text(400, 80, "CHOOSE YOUR ELEMENT", {
                fontSize: "42px",
                fill: "#ffd700",
                fontFamily: "Courier New",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(101);
        uiElements.push(title);

        const subtitle = this.scene.add
            .text(400, 130, "This will define your magical affinity", {
                fontSize: "18px",
                fill: "#ffffff",
                fontFamily: "Courier New",
            })
            .setOrigin(0.5)
            .setDepth(101);
        uiElements.push(subtitle);

        // Get 3 random elements
        const elementKeys = Object.keys(ELEMENTS);
        const shuffled = Phaser.Utils.Array.Shuffle([...elementKeys]);
        const selectedElements = shuffled.slice(0, 3);

        selectedElements.forEach((elementKey, index) => {
            const element = ELEMENTS[elementKey];
            const x = 200 + index * 200;
            const y = 320;

            // Element panel
            const panel = this.scene.add.graphics();
            panel.fillStyle(0x1a1a2a, 0.9);
            panel.fillRect(x - 80, y - 120, 160, 240);
            panel.lineStyle(3, element.color, 1);
            panel.strokeRect(x - 80, y - 120, 160, 240);
            panel.setDepth(101);
            uiElements.push(panel);

            // Icon
            const icon = this.scene.add
                .text(x, y - 60, element.icon, {
                    fontSize: "64px",
                })
                .setOrigin(0.5)
                .setDepth(102);
            uiElements.push(icon);

            // Name
            const name = this.scene.add
                .text(x, y + 10, element.name.toUpperCase(), {
                    fontSize: "20px",
                    fill: "#ffffff",
                    fontFamily: "Courier New",
                    fontStyle: "bold",
                })
                .setOrigin(0.5)
                .setDepth(102);
            uiElements.push(name);

            // Description
            const desc = this.scene.add
                .text(x, y + 60, element.description, {
                    fontSize: "13px",
                    fill: "#ffffff",
                    fontFamily: "Courier New",
                    align: "center",
                    wordWrap: { width: 140 },
                })
                .setOrigin(0.5)
                .setDepth(102);
            uiElements.push(desc);

            // Make interactive
            const hitArea = new Phaser.Geom.Rectangle(
                x - 80,
                y - 120,
                160,
                240,
            );
            panel.setInteractive(
                hitArea,
                Phaser.Geom.Rectangle.Contains,
            );

            panel.on("pointerover", () => {
                panel.clear();
                panel.fillStyle(0x2a2a3a, 0.95);
                panel.fillRect(x - 80, y - 120, 160, 240);
                panel.lineStyle(4, element.color, 1);
                panel.strokeRect(x - 80, y - 120, 160, 240);
                this.scene.input.setDefaultCursor("pointer");
                soundFX.play("hover");
            });

            panel.on("pointerout", () => {
                panel.clear();
                panel.fillStyle(0x1a1a2a, 0.9);
                panel.fillRect(x - 80, y - 120, 160, 240);
                panel.lineStyle(3, element.color, 1);
                panel.strokeRect(x - 80, y - 120, 160, 240);
                this.scene.input.setDefaultCursor("default");
            });

            panel.on("pointerdown", () => {
                soundFX.play("select");

                // Set player element
                this.player.element = elementKey;

                // Track element selection for achievements
                gameState.elementUsed = elementKey;

                // Track element selection for stats screen
                this.scene.upgradesTaken.push(`Element: ${element.name}`);

                // Apply element-specific damage bonuses
                if (elementKey === 'water' || elementKey === 'wind') {
                    this.player.damage += 10; // Water and Wind get +10 base damage
                } else if (elementKey === 'terra') {
                    this.player.damage += 20; // Terra gets +20 base damage
                } else if (elementKey === 'nature') {
                    this.player.damage -= 5; // Nature gets -5 base damage (15 total)
                } else if (elementKey === 'flame') {
                    this.player.damage += 5; // Flame gets +5 base damage (25 total) - BUFFED by 25%
                }

                // Update character name display
                this.uiSystem.updateCharacterName(element.name);

                // Change wizard color to match element
                callbacks.drawWizard();

                // Remove orbs for certain elements (they use different attack systems)
                if (elementKey === 'flame' || elementKey === 'water' || elementKey === 'electric' ||
                    elementKey === 'nature' || elementKey === 'wind' || elementKey === 'terra' ||
                    elementKey === 'radiant' || elementKey === 'shadow') {
                    callbacks.removeOrbs();
                } else if (elementKey === 'celestial') {
                    // Celestial: 1 large fast orb
                    this.player.orbCount = 1;
                    this.player.orbSpeed = 5.0; // Double speed (2x of normal 2.5)
                    this.player.orbDistance = 70; // Adjusted for larger orb
                    this.player.isCelestialElement = true; // Flag for special drawing
                    // Change orb colors to match element
                    callbacks.updateOrbColors(element.color);
                } else if (elementKey === 'gravity') {
                    // Gravity: 3 orbs in semi-random orbit pattern
                    this.player.orbCount = 3;
                    this.player.orbSpeed = 2.5; // Normal speed
                    this.player.orbDistance = 100; // Larger orbital radius
                    this.player.isGravityElement = true; // Flag for semi-random orbit
                    // Change orb colors to match element
                    callbacks.updateOrbColors(element.color);
                } else {
                    // Change orb colors to match element (shadow)
                    callbacks.updateOrbColors(element.color);
                }

                // Cleanup UI
                uiElements.forEach((el) => el.destroy());

                // Remove level up invincibility
                this.player.isLevelingUp = false;

                // Unpause game (wave progression is independent)
                this.scene.paused = false;
                this.scene.physics.resume();
            });
        });
    }

    /**
     * Show upgrade selection menu with 3 random options
     * @returns {void}
     */
    showUpgradeMenu() {
        // Track all UI elements for cleanup
        const uiElements = [];

        // Dim background
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, 800, 600);
        overlay.setDepth(100);
        uiElements.push(overlay);

        // Title
        const title = this.scene.add
            .text(400, 100, "LEVEL UP!", {
                fontSize: "48px",
                fill: "#ffd700",
                fontFamily: "Courier New",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(101);
        uiElements.push(title);

        const subtitle = this.scene.add
            .text(400, 150, "Choose an Upgrade:", {
                fontSize: "20px",
                fill: "#ffffff",
                fontFamily: "Courier New",
            })
            .setOrigin(0.5)
            .setDepth(101);
        uiElements.push(subtitle);

        // Generate 3 random upgrades
        const upgrades = this.generateUpgradeOptions();

        upgrades.forEach((upgrade, index) => {
            const x = 200 + index * 200;
            const y = 300;

            // Upgrade panel
            const panel = this.scene.add.graphics();
            panel.fillStyle(0x1a1a2a, 0.9);
            panel.fillRect(x - 80, y - 100, 160, 200);
            panel.lineStyle(3, 0x4a4a5a, 1);
            panel.strokeRect(x - 80, y - 100, 160, 200);
            panel.setDepth(101);
            uiElements.push(panel);

            // Icon
            const icon = this.scene.add
                .text(x, y - 50, upgrade.icon, {
                    fontSize: "48px",
                })
                .setOrigin(0.5)
                .setDepth(102);
            uiElements.push(icon);

            // Name
            const name = this.scene.add
                .text(x, y + 10, upgrade.name, {
                    fontSize: "16px",
                    fill: "#ffffff",
                    fontFamily: "Courier New",
                    fontStyle: "bold",
                    align: "center",
                    wordWrap: { width: 140 },
                })
                .setOrigin(0.5)
                .setDepth(102);
            uiElements.push(name);

            // Description (support dynamic descriptions via getDescription())
            const description = upgrade.getDescription ?
                upgrade.getDescription(this.player) :
                upgrade.description;
            const desc = this.scene.add
                .text(x, y + 50, description, {
                    fontSize: "12px",
                    fill: "#ffffff",
                    fontFamily: "Courier New",
                    align: "center",
                    wordWrap: { width: 140 },
                })
                .setOrigin(0.5)
                .setDepth(102);
            uiElements.push(desc);

            // Make interactive
            const hitArea = new Phaser.Geom.Rectangle(
                x - 80,
                y - 100,
                160,
                200,
            );
            panel.setInteractive(
                hitArea,
                Phaser.Geom.Rectangle.Contains,
            );

            panel.on("pointerover", () => {
                panel.clear();
                panel.fillStyle(0x2a2a3a, 0.9);
                panel.fillRect(x - 80, y - 100, 160, 200);
                panel.lineStyle(3, 0x00ff88, 1);
                panel.strokeRect(x - 80, y - 100, 160, 200);
                this.scene.input.setDefaultCursor("pointer");
                soundFX.play("hover");
            });

            panel.on("pointerout", () => {
                panel.clear();
                panel.fillStyle(0x1a1a2a, 0.9);
                panel.fillRect(x - 80, y - 100, 160, 200);
                panel.lineStyle(3, 0x4a4a5a, 1);
                panel.strokeRect(x - 80, y - 100, 160, 200);
                this.scene.input.setDefaultCursor("default");
            });

            panel.on("pointerdown", () => {
                // Play select sound
                soundFX.play("select");

                // Apply upgrade
                this.applyUpgrade(upgrade);

                // Clean up all UI elements
                uiElements.forEach((element) => {
                    if (element && element.destroy) {
                        element.destroy();
                    }
                });

                // Remove level up invincibility
                this.player.isLevelingUp = false;

                // Resume game (wave progression is independent)
                this.scene.paused = false;
                this.scene.physics.resume();
            });
        });
    }

    /**
     * Get element-specific upgrades for current player element
     * @returns {Array<import('../types/game-types.js').Upgrade>} Array of upgrade objects
     */
    getElementalUpgrades() {
        const element = this.player.element;
        if (!element) return [];

        const ELEMENTAL_UPGRADES = {
            flame: [
                {
                    name: "Inferno Blast",
                    icon: "💥",
                    upgradeKey: "infernoBlast",
                    getDescription: (player) => {
                        const stacks = player.upgradeStacks?.infernoBlast || 0;
                        const current = BASE_VALUES.burn_damage + (stacks * 2);
                        const next = BASE_VALUES.burn_damage + ((stacks + 1) * 2);
                        return `+2 burn damage per tick (${current} → ${next} damage)`;
                    },
                    apply: () => {
                        this.player.upgradeStacks.infernoBlast = (this.player.upgradeStacks.infernoBlast || 0) + 1;
                        this.player.burnDamageBonus = (this.player.burnDamageBonus || 0) + 2;
                    }
                },
                {
                    name: "Wildfire",
                    icon: "🔥",
                    description: "Burn spreads to nearby enemies",
                    apply: () => {
                        this.player.hasWildfire = true;
                    }
                },
                {
                    name: "Molten Core",
                    icon: "🌋",
                    description: "+25% damage to burning enemies",
                    apply: () => {
                        this.player.moltenCore = (this.player.moltenCore || 1) * 1.25;
                    }
                },
                {
                    name: "Firestorm",
                    icon: "☄️",
                    description: "Burn lasts +2 seconds",
                    apply: () => {
                        this.player.burnDurationBonus = (this.player.burnDurationBonus || 0) + 2000;
                    }
                }
            ],
            water: [
                {
                    name: "Deep Freeze",
                    icon: "❄️",
                    description: "Freeze duration +50%",
                    apply: () => {
                        this.player.freezeDurationBonus = (this.player.freezeDurationBonus || 1) * 1.5;
                    }
                },
                {
                    name: "Glacial Shards",
                    icon: "💎",
                    description: "Frozen enemies take +30% damage",
                    apply: () => {
                        this.player.glacialShards = (this.player.glacialShards || 1) * 1.3;
                    }
                },
                {
                    name: "Permafrost",
                    icon: "🧊",
                    upgradeKey: "permafrost",
                    getDescription: (player) => {
                        const stacks = player.upgradeStacks?.permafrost || 0;
                        const current = Math.floor(BASE_VALUES.freeze_chance + (stacks * 5));
                        const next = Math.floor(BASE_VALUES.freeze_chance + ((stacks + 1) * 5));
                        return `+5% freeze chance (${current}% → ${next}%)`;
                    },
                    apply: () => {
                        this.player.upgradeStacks.permafrost = (this.player.upgradeStacks.permafrost || 0) + 1;
                        this.player.freezeChanceBonus = (this.player.freezeChanceBonus || 0) + 0.05;
                    }
                },
                {
                    name: "Jet Stream",
                    icon: "🌊",
                    upgradeKey: "jetStream",
                    getDescription: (player) => {
                        const stacks = player.upgradeStacks?.jetStream || 0;
                        const current = Math.floor(BASE_VALUES.water_stream_range * (1 + stacks * 0.25));
                        const next = Math.floor(BASE_VALUES.water_stream_range * (1 + (stacks + 1) * 0.25));
                        return `+25% water beam range (${current}px → ${next}px)`;
                    },
                    apply: () => {
                        this.player.upgradeStacks.jetStream = (this.player.upgradeStacks.jetStream || 0) + 1;
                        this.player.waterStreamRangeBonus = (this.player.waterStreamRangeBonus || 0) + 0.25;
                    }
                }
            ],
            electric: [
                {
                    name: "Chain Lightning",
                    icon: "⚡",
                    description: "Attacks jump to 1 nearby enemy",
                    apply: () => {
                        this.player.hasChainLightning = true;
                    }
                },
                {
                    name: "Overload",
                    icon: "🔌",
                    upgradeKey: "overload",
                    getDescription: (player) => {
                        const stacks = player.upgradeStacks?.overload || 0;
                        // Electric base paralyze chance is 30%, bonus adds to it
                        const baseChance = 30;
                        const current = baseChance + (stacks * 10);
                        const next = baseChance + ((stacks + 1) * 10);
                        return `+10% paralyze chance (${current}% → ${next}%)`;
                    },
                    apply: () => {
                        this.player.upgradeStacks.overload = (this.player.upgradeStacks.overload || 0) + 1;
                        this.player.paralyzeChanceBonus = (this.player.paralyzeChanceBonus || 0) + 0.10;
                    }
                },
                {
                    name: "Static Field",
                    icon: "⚡",
                    description: "Paralyzed enemies take damage over time",
                    apply: () => {
                        this.player.hasStaticField = true;
                    }
                },
                {
                    name: "Thor's Hammer",
                    icon: "🔨",
                    description: "Increase attack range",
                    upgradeKey: "thorsHammer",
                    getDescription: () => {
                        const stacks = this.player.upgradeStacks?.thorsHammer || 0;
                        const currentBonus = stacks * 25;
                        const nextBonus = (stacks + 1) * 25;
                        return `Thor's Hammer +25% attack range (${currentBonus}% → ${nextBonus}%)`;
                    },
                    apply: () => {
                        if (!this.player.upgradeStacks) this.player.upgradeStacks = {};
                        this.player.upgradeStacks.thorsHammer = (this.player.upgradeStacks.thorsHammer || 0) + 1;
                        this.player.electricRangeBonus = (this.player.electricRangeBonus || 0) + 0.25;
                    }
                }
            ],
            nature: [
                {
                    name: "Toxic Bloom",
                    icon: "🍄",
                    description: "Poison starts at 4 damage",
                    apply: () => {
                        this.player.poisonDamageBonus = (this.player.poisonDamageBonus || 0) + 2;
                    }
                },
                {
                    name: "Regeneration",
                    icon: "🌿",
                    description: "Heal 1% of max HP every 10 seconds",
                    apply: () => {
                        this.player.hasRegeneration = true;
                    }
                },
                {
                    name: "Toxicity",
                    icon: "☠️",
                    description: "Increase poison proc chance",
                    upgradeKey: "toxicity",
                    getDescription: () => {
                        const stacks = this.player.upgradeStacks?.toxicity || 0;
                        const currentChance = 30 + (stacks * 10);
                        const nextChance = currentChance + 10;
                        return `Toxicity +10% poison chance (${currentChance}% → ${nextChance}%)`;
                    },
                    apply: () => {
                        if (!this.player.upgradeStacks) this.player.upgradeStacks = {};
                        this.player.upgradeStacks.toxicity = (this.player.upgradeStacks.toxicity || 0) + 1;
                        this.player.poisonProcChance = 0.30 + (this.player.upgradeStacks.toxicity * 0.10);
                    }
                },
                {
                    name: "Spore Cloud",
                    icon: "☁️",
                    description: "Poison spreads to nearby enemies",
                    apply: () => {
                        this.player.hasSporeCloud = true;
                    }
                }
            ],
            wind: [
                {
                    name: "Gale Force",
                    icon: "💨",
                    description: "Knockback distance +50%",
                    apply: () => {
                        this.player.knockbackBonus = (this.player.knockbackBonus || 1) * 1.5;
                    }
                },
                {
                    name: "Zephyr",
                    icon: "🌬️",
                    description: "+20% movement speed",
                    apply: () => {
                        this.player.speed *= 1.2;
                    }
                },
                {
                    name: "Cyclone",
                    icon: "🌀",
                    description: "Orb rotation speed +30%",
                    apply: () => {
                        this.player.orbSpeed *= 1.3;
                    }
                },
                {
                    name: "Hurricane",
                    icon: "🌪️",
                    description: "Fire +1 additional boomerang",
                    upgradeKey: "hurricane",
                    getDescription: () => {
                        const stacks = this.player.upgradeStacks?.hurricane || 0;
                        const current = 3 + stacks;
                        const next = current + 1;
                        return `Hurricane +1 boomerang (${current} → ${next} simultaneous)`;
                    },
                    apply: () => {
                        if (!this.player.upgradeStacks) this.player.upgradeStacks = {};
                        this.player.upgradeStacks.hurricane = (this.player.upgradeStacks.hurricane || 0) + 1;
                        this.player.maxBoomerangs = 3 + this.player.upgradeStacks.hurricane;
                    }
                }
            ],
            terra: [
                {
                    name: "Earthquake",
                    icon: "💥",
                    description: "Knockback stuns for 0.5 seconds",
                    apply: () => {
                        this.player.hasEarthquake = true;
                    }
                },
                {
                    name: "Stone Skin",
                    icon: "🗿",
                    description: "+20 max health",
                    apply: () => {
                        this.player.maxHealth += 20;
                        this.uiSystem.updateHealthBar(this.player);
                    }
                },
                {
                    name: "Tremor",
                    icon: "🌍",
                    description: "Knockback affects area around impact",
                    apply: () => {
                        this.player.hasTremor = true;
                    }
                },
                {
                    name: "Mountain's Might",
                    icon: "⛰️",
                    description: "+25% knockback power",
                    apply: () => {
                        this.player.knockbackBonus = (this.player.knockbackBonus || 1) * 1.25;
                    }
                }
            ],
            gravity: [
                {
                    name: "Gravitational Pull",
                    icon: "🌑",
                    upgradeKey: "gravitationalPull",
                    getDescription: (player) => {
                        const stacks = player.upgradeStacks?.gravitationalPull || 0;
                        const current = BASE_VALUES.slow_effectiveness + (stacks * 10);
                        const next = BASE_VALUES.slow_effectiveness + ((stacks + 1) * 10);
                        return `+10% slow effect (${current}% → ${next}% slow)`;
                    },
                    apply: () => {
                        this.player.upgradeStacks.gravitationalPull = (this.player.upgradeStacks.gravitationalPull || 0) + 1;
                        this.player.slowBonus = (this.player.slowBonus || 0) + 0.10;
                    }
                },
                {
                    name: "Planet Orb",
                    icon: "🪐",
                    description: "Gain +1 gravity orb",
                    apply: () => {
                        this.player.orbCount = (this.player.orbCount || 0) + 1;
                        // Recreate orbs with new count
                        this.scene.createWizardOrbs();
                    }
                },
                {
                    name: "Dense Matter",
                    icon: "🪨",
                    description: "Slow affects larger area",
                    apply: () => {
                        this.player.hasDenseMatter = true;
                    }
                },
                {
                    name: "Event Horizon",
                    icon: "🌌",
                    description: "Confused enemies damage each other",
                    apply: () => {
                        this.player.hasEventHorizon = true;
                    }
                }
            ],
            celestial: [
                {
                    name: "Astral Chains",
                    icon: "⭐",
                    description: "Charm duration +1 second",
                    apply: () => {
                        this.player.charmDurationBonus = (this.player.charmDurationBonus || 0) + 1000;
                    }
                },
                {
                    name: "Starfall",
                    icon: "✨",
                    upgradeKey: "starfall",
                    getDescription: (player) => {
                        const stacks = player.upgradeStacks?.starfall || 0;
                        const current = BASE_VALUES.charm_chance + (stacks * 3);
                        const next = BASE_VALUES.charm_chance + ((stacks + 1) * 3);
                        return `+3% charm chance (${current}% → ${next}%)`;
                    },
                    apply: () => {
                        this.player.upgradeStacks.starfall = (this.player.upgradeStacks.starfall || 0) + 1;
                        this.player.charmChanceBonus = (this.player.charmChanceBonus || 0) + 0.03;
                    }
                },
                {
                    name: "Star's Orbit",
                    icon: "⭐",
                    description: "Increase orb rotation speed",
                    upgradeKey: "starsOrbit",
                    getDescription: () => {
                        const stacks = this.player.upgradeStacks?.starsOrbit || 0;
                        const currentBonus = stacks * 25;
                        const nextBonus = (stacks + 1) * 25;
                        return `Star's Orbit +25% fire rate (${currentBonus}% → ${nextBonus}%)`;
                    },
                    apply: () => {
                        if (!this.player.upgradeStacks) this.player.upgradeStacks = {};
                        this.player.upgradeStacks.starsOrbit = (this.player.upgradeStacks.starsOrbit || 0) + 1;
                        // Increase orb rotation speed by 25% - FIX: Multiply current speed, don't set to absolute value!
                        this.player.orbSpeed *= 1.25;
                    }
                },
                {
                    name: "Void Step",
                    icon: "🌌",
                    description: "10% chance to dodge attacks",
                    apply: () => {
                        this.player.dodgeChance = (this.player.dodgeChance || 0) + 0.10;
                    }
                }
            ],
            radiant: [
                {
                    name: "Divine Blessing",
                    icon: "✝️",
                    description: "+15% damage",
                    apply: () => {
                        this.player.damage = Math.floor(this.player.damage * 1.15);
                    }
                },
                {
                    name: "Brilliant Flash",
                    icon: "💡",
                    upgradeKey: "brilliantFlash",
                    getDescription: (player) => {
                        const stacks = player.upgradeStacks?.brilliantFlash || 0;
                        // Radiant base blind chance is 20%, bonus adds to it
                        const baseChance = 20;
                        const current = baseChance + (stacks * 10);
                        const next = baseChance + ((stacks + 1) * 10);
                        return `+10% blind chance (${current}% → ${next}%)`;
                    },
                    apply: () => {
                        this.player.upgradeStacks.brilliantFlash = (this.player.upgradeStacks.brilliantFlash || 0) + 1;
                        this.player.blindChanceBonus = (this.player.blindChanceBonus || 0) + 0.10;
                    }
                },
                {
                    name: "Beacon of Hope",
                    icon: "🕯️",
                    description: "Heal 3 HP per kill",
                    apply: () => {
                        this.player.lifeSteal = (this.player.lifeSteal || 0) + 3;
                    }
                },
                {
                    name: "Radiant Shield",
                    icon: "🛡️",
                    description: "Reduce damage taken by 10%",
                    apply: () => {
                        this.player.damageReduction = (this.player.damageReduction || 0) + 0.10;
                    }
                }
            ],
            shadow: [
                {
                    name: "Lifesteal",
                    icon: "🩸",
                    upgradeKey: "lifesteal",
                    getDescription: (player) => {
                        const stacks = player.upgradeStacks?.lifesteal || 0;
                        const current = BASE_VALUES.life_steal_percent + (stacks * 10);
                        const next = BASE_VALUES.life_steal_percent + ((stacks + 1) * 10);
                        return `+10% lifesteal (${current}% → ${next}% of damage as healing)`;
                    },
                    apply: () => {
                        this.player.upgradeStacks.lifesteal = (this.player.upgradeStacks.lifesteal || 0) + 1;
                        this.player.lifeStealPercent = (this.player.lifeStealPercent || 0) + 0.10;
                    }
                },
                {
                    name: "Dark Embrace",
                    icon: "🌑",
                    upgradeKey: "darkEmbrace",
                    getDescription: (player) => {
                        const stacks = player.upgradeStacks?.darkEmbrace || 0;
                        const current = BASE_VALUES.fear_chance + (stacks * 5);
                        const next = BASE_VALUES.fear_chance + ((stacks + 1) * 5);
                        return `+5% fear chance (${current}% → ${next}%)`;
                    },
                    apply: () => {
                        this.player.upgradeStacks.darkEmbrace = (this.player.upgradeStacks.darkEmbrace || 0) + 1;
                        this.player.fearChanceBonus = (this.player.fearChanceBonus || 0) + 0.05;
                    }
                },
                {
                    name: "Void Clone",
                    icon: "👤",
                    description: "Summon 2nd shadow clone (max 1x)",
                    apply: () => {
                        this.player.hasVoidClone = true;
                        // Spawn the 2nd clone immediately (1st clone should already exist)
                        if (this.scene.shadowClones && this.scene.shadowClones.length === 1) {
                            const time = this.scene.time.now;
                            const delta = this.scene.game.loop.delta;
                            this.scene.spawnShadowClone(1, time, delta); // Spawn 2nd clone (index 1)
                        }
                    }
                },
                {
                    name: "Umbral Shroud",
                    icon: "🌫️",
                    description: "Enemies have -15% accuracy",
                    apply: () => {
                        this.player.hasUmbralShroud = true;
                    }
                }
            ]
        };

        return ELEMENTAL_UPGRADES[element] || [];
    }

    /**
     * Generate 3 random upgrade options
     * @returns {Array<import('../types/game-types.js').Upgrade>} Array of 3 upgrade objects
     */
    generateUpgradeOptions() {
        // Universal upgrade (always available)
        const universalUpgrades = [
            {
                name: "Health Boost",
                icon: "❤️",
                description: "+20 Max HP\nRestore 30 HP",
                apply: () => {
                    this.player.maxHealth += 20;
                    this.player.health = Math.min(
                        this.player.maxHealth,
                        this.player.health + 30,
                    );
                    this.uiSystem.updateHealthBar(this.player);
                },
            },
            {
                name: "Damage Boost",
                icon: "⚔️",
                description: "+50% Damage",
                apply: () => {
                    this.player.damage = Math.floor(this.player.damage * 1.5);
                },
            },
            {
                name: "Critical Strike",
                icon: "💥",
                description: "15% chance for 2x damage",
                apply: () => {
                    this.player.hasCriticalStrike = true;
                    this.player.critChance = 0.15;
                    this.player.critMultiplier = 2.0;
                },
            },
            {
                name: "Armor Boost",
                icon: "🛡️",
                description: "25% damage reduction (max 2x)",
                apply: () => {
                    this.player.damageReduction = (this.player.damageReduction || 0) + 0.25;
                    this.player.armorBoostCount = (this.player.armorBoostCount || 0) + 1;
                },
            }
        ];

        // Get element-specific upgrades
        const elementalUpgrades = this.getElementalUpgrades();

        // Combine universal + elemental upgrades
        const allUpgrades = [...universalUpgrades, ...elementalUpgrades];

        // Filter out upgrades already taken
        const availableUpgrades = allUpgrades.filter(upgrade => {
            // Void Clone can only be selected once
            if (upgrade.name === "Void Clone" && this.player.hasVoidClone) {
                return false;
            }
            // Armor Boost can only be selected twice
            if (upgrade.name === "Armor Boost" && (this.player.armorBoostCount || 0) >= 2) {
                return false;
            }
            return true;
        });

        // Return 3 random upgrades
        return Phaser.Utils.Array.Shuffle(availableUpgrades).slice(0, 3);
    }

    /**
     * Apply selected upgrade
     * @param {import('../types/game-types.js').Upgrade} upgrade - Upgrade object with apply() method
     * @returns {void}
     */
    applyUpgrade(upgrade) {
        upgrade.apply();
        // Track upgrade for stats screen
        this.scene.upgradesTaken.push(upgrade.name);
    }
}
