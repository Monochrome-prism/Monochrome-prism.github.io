// @ts-check
/**
 * GameScene.js
 *
 * Main game scene handling player, enemies, combat, waves, and UI
 * Coordinates all game systems and manages the core game loop
 */

import { gameState } from '../config/gameState.js';
import { ELEMENTS } from '../config/elements.js';
import { soundFX } from '../systems/SoundFX.js';
import { UISystem } from '../systems/UISystem.js';
import { WaveSystem } from '../systems/WaveSystem.js';
import { UpgradeSystem } from '../systems/UpgradeSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { EnemySystem } from '../systems/EnemySystem.js';
import { ProgressionSystem } from '../systems/ProgressionSystem.js';
import {
    drawWizard,
    drawBoss,
    drawSlime,
    drawGoblin,
    drawTank,
    drawBomber,
} from '../utils/DrawingHelpers.js';
import {
    createStatusEffectVisuals,
    createBossDeathEffect,
    createLevelUpEffect,
    createDeathEffect,
    createTeleportEffect,
} from '../utils/StatusEffectHelpers.js';
import {
    getSpawnPositionOnEdge,
    applyKnockback,
    normalizeAngle,
    getVelocityFromAngle,
    getAngleDifference,
} from '../utils/MathHelpers.js';

/**
 * Main Game Scene
 * Handles all gameplay including player control, enemies, combat, waves, and UI
 */
class GameScene extends Phaser.Scene {
    /**
     * Create the GameScene
     */
    constructor() {
        super({ key: "GameScene" });
    }

    /**
     * Preload game assets
     * @returns {void}
     */
    preload() {
        // Load background music
        this.load.audio('bgMusic', 'Here comes trouble!.mp3');
    }

    /**
     * Create and initialize the game scene
     * Sets up player, systems, groups, and starts the first wave
     * @returns {void}
     */
    create() {
        // Reset game state
        this.score = 0;
        this.survivalTime = 0;
        this.paused = false;

        // Stats tracking
        this.totalDamageDealt = 0;
        this.enemiesKilled = 0;
        this.upgradesTaken = []; // Track upgrades by name

        // Combo system
        this.comboCount = 0;
        this.lastKillTime = 0;
        this.comboTimeWindow = 3000; // 3 seconds to chain kills
        this.comboText = null;

        // Wave completion flag (prevents multiple completeWave() calls)
        this.isWaveCompleting = false;

        // Reset achievement tracking for this run
        gameState.damageTaken = 0;
        gameState.waveReached = 0;
        gameState.elementUsed = null;
        gameState.levelReached = 1;

        // Mobile detection and scaling
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                        ('ontouchstart' in window && window.innerWidth < 1024);
        this.mobileScale = this.isMobile ? 1.5 : 1.0;

        // Create Wave System
        this.waveSystem = new WaveSystem(this);

        // Create tiled grass background
        this.createBackground();

        // Start background music
        if (!this.bgMusic) {
            const musicVolume = (gameState.masterVolume || 1.0) * (gameState.musicVolume || 1.0) * 0.3;
            this.bgMusic = this.sound.add('bgMusic', {
                loop: true,
                volume: musicVolume
            });
            this.bgMusic.play();
        }

        // Initialize groups with object pooling
        this.enemies = this.physics.add.group();
        this.projectiles = this.physics.add.group({
            maxSize: 100, // Pool up to 100 projectiles for reuse
            runChildUpdate: false
        });
        this.xpOrbs = this.physics.add.group({
            maxSize: 50, // Pool up to 50 XP orbs
            runChildUpdate: false
        });
        this.damageNumbers = [];
        this.damageNumberPool = []; // Pool for reusable damage number text objects

        // Set physics world bounds to exclude UI area at bottom (y=600+)
        this.physics.world.setBounds(0, 0, 800, 595);

        // Wizard orbs array (always initialize to prevent errors)
        this.wizardOrbs = [];

        // Environmental hazards
        this.hazards = [];

        // Tank lasers group (for enemy projectiles)
        this.tankLasers = this.add.group();

        // Create player
        this.createPlayer();

        // Apply skill tree bonuses to player stats
        const progression = new ProgressionSystem();
        const bonuses = progression.getSkillBonuses();
        this.player.maxHealth = Math.floor(50 * bonuses.health);
        this.player.health = this.player.maxHealth;
        this.player.damage = Math.floor(20 * bonuses.damage);
        this.player.speed = Math.floor(140 * bonuses.speed);
        console.log('[GameScene] Skill tree bonuses applied:', bonuses);

        // Create UI System
        this.uiSystem = new UISystem(this);
        this.uiSystem.createUI();
        this.uiSystem.updateHealthBar(this.player);
        this.uiSystem.updateXPBar(this.player);

        // Create Upgrade System (after player, uiSystem, and waveSystem are ready)
        this.upgradeSystem = new UpgradeSystem(this, this.player, this.uiSystem, this.waveSystem);

        // Create Combat System (after player is ready)
        this.combatSystem = new CombatSystem(this, this.player);

        // Create Enemy System (after player, uiSystem, and waveSystem are ready)
        this.enemySystem = new EnemySystem(this, this.player, this.uiSystem, this.waveSystem);

        // Setup input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.W,
        );
        this.aKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.A,
        );
        this.sKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.S,
        );
        this.dKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.D,
        );
        this.spaceKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE,
        );
        this.pKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.P,
        );
        this.escKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ESC,
        );

        // Prevent right-click context menu from interfering with movement
        this.input.mouse.disableContextMenu();

        // Pause menu elements (hidden by default)
        this.pauseMenuElements = null;

        // Stats screen elements (hidden by default)
        this.statsScreenElements = null;

        // Touch controls for mobile
        this.touchControls = { x: 0, y: 0, active: false };
        this.setupTouchControls();

        // Handle pause key
        this.pKey.on("down", () => this.togglePause());
        this.escKey.on("down", () => this.toggleStatsScreen());

        // Setup collisions
        this.physics.add.overlap(
            this.player,
            this.enemies,
            this.playerHitEnemy,
            null,
            this,
        );
        this.physics.add.overlap(
            this.projectiles,
            this.enemies,
            this.projectileHitEnemy,
            null,
            this,
        );
        this.physics.add.overlap(
            this.player,
            this.xpOrbs,
            this.collectXP,
            null,
            this,
        );
        this.physics.add.overlap(
            this.player,
            this.tankLasers,
            this.tankLaserHitPlayer,
            null,
            this,
        );

        // Summer trees block projectiles (if they exist)
        if (this.trees) {
            this.physics.add.collider(
                this.projectiles,
                this.trees,
                (projectile) => {
                    // Return to pool instead of destroying
                    projectile.setActive(false);
                    projectile.setVisible(false);
                },
            );
        }

        // Start first wave
        this.time.delayedCall(1000, () => this.startWave());

        // Spawn environmental hazards after a delay
        this.time.delayedCall(3000, () => this.spawnHazards());

        // Survival timer
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.paused) {
                    this.survivalTime++;
                    this.uiSystem.updateTimeDisplay(this.survivalTime);
                }
            },
            loop: true,
        });

        // Camera effects
        this.cameras.main.fadeIn(500);
    }

    createBackground() {
        const graphics = this.add.graphics();
        const season = gameState.currentSeason;

        // Seasonal color palettes
        const seasonalColors = {
            spring: {
                grass: 0x4a7c2e,
                grassDark: 0x3a6c1e,
                grassLight: 0x5a8c3e,
                decoration: 0xff69b4, // Pink flowers
                name: "Spring",
            },
            summer: {
                grass: 0x8b6914, // Desert sand
                grassDark: 0x6b4910,
                grassLight: 0xab8924,
                decoration: 0xffd700, // Cacti green
                name: "Summer",
            },
            fall: {
                grass: 0x5a4a2a,
                grassDark: 0x4a3a1a,
                grassLight: 0x6a5a3a,
                decoration: 0xff8c00, // Orange leaves
                name: "Fall",
            },
            winter: {
                grass: 0xd0d0d0, // Snow/ice
                grassDark: 0xb0b0b0,
                grassLight: 0xf0f0f0,
                decoration: 0x87ceeb, // Ice patches
                name: "Winter",
            },
        };

        const colors = seasonalColors[season];

        // Draw tiled ground with seasonal patterns
        for (let y = 0; y < 600; y += 32) {
            for (let x = 0; x < 800; x += 32) {
                // Base tile
                graphics.fillStyle(colors.grass, 1);
                graphics.fillRect(x, y, 32, 32);

                // Seasonal tile details
                if (season === "spring") {
                    // Grass blades
                    graphics.fillStyle(colors.grassDark, 1);
                    graphics.fillRect(x + 4, y + 4, 2, 6);
                    graphics.fillRect(x + 20, y + 12, 2, 6);
                    graphics.fillRect(x + 12, y + 24, 2, 6);
                    graphics.fillStyle(colors.grassLight, 1);
                    graphics.fillRect(x + 8, y + 8, 2, 4);
                    graphics.fillRect(x + 24, y + 16, 2, 4);
                } else if (season === "summer") {
                    // Sand dunes pattern
                    graphics.fillStyle(colors.grassDark, 1);
                    graphics.fillRect(x + 2, y + 20, 28, 8);
                    graphics.fillStyle(colors.grassLight, 1);
                    graphics.fillRect(x + 4, y + 4, 24, 8);
                } else if (season === "fall") {
                    // Dirt patches
                    graphics.fillStyle(colors.grassDark, 1);
                    graphics.fillRect(x + 4, y + 4, 8, 8);
                    graphics.fillRect(x + 20, y + 16, 8, 8);
                    graphics.fillStyle(colors.grassLight, 1);
                    graphics.fillRect(x + 14, y + 24, 6, 6);
                } else if (season === "winter") {
                    // Ice crystals
                    graphics.fillStyle(colors.grassLight, 1);
                    graphics.fillRect(x + 8, y + 8, 4, 4);
                    graphics.fillRect(x + 20, y + 16, 4, 4);
                    graphics.fillStyle(colors.decoration, 0.3);
                    graphics.fillRect(x + 4, y + 20, 8, 8);
                }
            }
        }

        // Add seasonal decorations and mechanics
        if (season === "spring") {
            // Spring: Many colorful flowers
            // Mobile optimization: reduce flower count for better performance
            const flowerCount = this.isMobile ? 15 : 40;
            for (let i = 0; i < flowerCount; i++) {
                const x = Phaser.Math.Between(50, 750);
                const y = Phaser.Math.Between(50, 550);

                // Flower petals
                const flowerColors = [
                    0xff69b4, 0xff1493, 0xffc0cb, 0xff6eb4,
                ];
                const color = flowerColors[i % flowerColors.length];

                graphics.fillStyle(color, 1);
                graphics.fillCircle(x + 4, y, 3);
                graphics.fillCircle(x + 8, y, 3);
                graphics.fillCircle(x + 6, y - 3, 3);
                graphics.fillCircle(x + 6, y + 3, 3);

                // Center
                graphics.fillStyle(0xffd700, 1);
                graphics.fillCircle(x + 6, y, 2);

                // Stem
                graphics.fillStyle(0x2d5016, 1);
                graphics.fillRect(x + 5, y + 3, 2, 8);
            }
        } else if (season === "summer") {
            // Summer: Trees that block projectiles
            this.trees = this.physics.add.staticGroup();

            for (let i = 0; i < 8; i++) {
                const treeX = Phaser.Math.Between(100, 700);
                const treeY = Phaser.Math.Between(100, 500);

                const tree = this.add.graphics();
                // Graphics objects don't have setOrigin() - position is already centered
                tree.x = treeX;
                tree.y = treeY;

                // Tree trunk (brown)
                tree.fillStyle(0x654321, 1);
                tree.fillRect(-8, 0, 16, 30);

                // Tree canopy (green)
                tree.fillStyle(0x228b22, 1);
                tree.fillCircle(0, -10, 25);
                tree.fillCircle(-15, 0, 20);
                tree.fillCircle(15, 0, 20);

                // Darker green details
                tree.fillStyle(0x1a6b1a, 1);
                tree.fillCircle(-8, -5, 12);
                tree.fillCircle(8, -5, 12);

                tree.setDepth(15); // Above game entities

                // Add physics body for collision
                this.physics.add.existing(tree, true); // true = static
                if (tree.body) {
                    tree.body.setCircle(30, 0, 10); // Circle radius 30, centered roughly on tree
                }

                this.trees.add(tree);
            }
        } else if (season === "fall") {
            // Fall: Flying leaves that obscure vision
            this.fallingLeaves = [];

            // Mobile optimization: reduce leaf count for better performance
            const leafCount = this.isMobile ? 30 : 100;
            for (let i = 0; i < leafCount; i++) {
                const leaf = this.add.graphics();
                leaf.x = Phaser.Math.Between(0, 800);
                leaf.y = Phaser.Math.Between(-100, 600);

                // Brown leaf shape
                const leafColors = [0x8b4513, 0xa0522d, 0x654321];
                leaf.fillStyle(leafColors[i % 3], 0.7);

                // Leaf shape
                leaf.fillTriangle(-6, 0, 0, -8, 6, 0);
                leaf.fillTriangle(-6, 0, 0, 8, 0);

                leaf.setDepth(50); // Above game entities, below UI

                // Random float speed
                leaf.floatSpeed = Phaser.Math.Between(20, 60);
                leaf.driftSpeed = Phaser.Math.Between(-30, 30);

                this.fallingLeaves.push(leaf);
            }
        } else if (season === "winter") {
            // Winter: Slippery ice patches
            this.icePatches = [];

            for (let i = 0; i < 12; i++) {
                const icePatch = this.add.graphics();
                const iceX = Phaser.Math.Between(100, 700);
                const iceY = Phaser.Math.Between(100, 500);

                icePatch.x = iceX;
                icePatch.y = iceY;

                // Ice patch (light blue, semi-transparent)
                icePatch.fillStyle(0x87ceeb, 0.6);
                icePatch.fillCircle(0, 0, 40);

                // Ice highlights
                icePatch.fillStyle(0xf0f8ff, 0.8);
                icePatch.fillCircle(-10, -10, 15);
                icePatch.fillCircle(12, 8, 12);

                // Shine effect
                icePatch.fillStyle(0xffffff, 0.9);
                icePatch.fillCircle(-5, -8, 6);

                icePatch.setDepth(5); // Just above ground

                this.icePatches.push(icePatch);
            }
        }

        // Display season name
        this.add
            .text(400, 580, `${colors.name} Map`, {
                fontSize: "14px",
                fill: "#ffffff",
                fontFamily: "Courier New",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5)
            .setDepth(1002);
    }

    /**
     * Create and initialize the player character (wizard)
     * Sets up player stats, physics, graphics, and orbs
     * @returns {void}
     */
    createPlayer() {
        // Player is always the wizard now
        this.player = this.add.graphics();
        this.player.x = 400;
        this.player.y = 300;
        // Graphics objects don't have setOrigin() - position is already centered

        // Draw grey wizard (no element chosen yet)
        drawWizard(this.player);

        // Scale player for mobile (visual and physics)
        this.player.setScale(this.mobileScale);

        // Wizard stats
        this.player.maxHealth = 50; // Reduced from 100 for increased difficulty
        this.player.baseSpeed = 140;
        this.player.baseDamage = 20;
        this.player.attackSpeed = 0; // Doesn't use attack speed (uses orbs)
        this.player.orbCount = 2; // Start with 2 orbs
        this.player.orbSpeed = 2.5; // Rotation speed (25% faster)
        this.player.orbDistance = 50; // Distance from player

        // Element system - starts with no element
        this.player.element = null; // Will be set on first level up
        this.player.elementalUpgrades = []; // Track which element upgrades have been taken
        this.player.upgradeStacks = {}; // Track stacks for stackable percentage upgrades

        this.player.health = this.player.maxHealth;
        this.player.level = 1;
        this.player.xp = 0;
        this.player.xpToNext = 100;
        this.player.speed = this.player.baseSpeed;
        this.player.damage = this.player.baseDamage;
        this.player.defense = 5;
        this.player.characterType = "wizard"; // Always wizard now

        // Physics (scaled to match visual size)
        this.physics.add.existing(this.player);
        // Player hitbox: 50% smaller than visual size for better gameplay feel
        this.player.body.setSize(10 * this.mobileScale, 10 * this.mobileScale);
        this.player.body.setCollideWorldBounds(true);

        // Set depth so player appears behind UI
        this.player.setDepth(10);

        // Auto-attack timer
        this.player.lastAttackTime = 0;

        // Invulnerability frames
        this.player.invulnerable = false;
        this.player.invulnerableTime = 0;

        // Create wizard orbs (will be grey until element is chosen)
        this.createWizardOrbs();
    }

    // Archer and Warrior characters removed - Wizard only now
    // drawWizard moved to src/utils/DrawingHelpers.js

    createWizardOrbs() {
        if (!this.player || !this.player.orbCount) {
            console.warn(
                "Cannot create wizard orbs: player not ready",
            );
            return;
        }

        // CRITICAL: Clear existing orbs before creating new ones
        if (this.wizardOrbs && this.wizardOrbs.length > 0) {
            this.wizardOrbs.forEach(orb => {
                if (orb && orb.active) {
                    orb.destroy();
                }
            });
            this.wizardOrbs = [];
        }

        // Get orb color based on element (grey if no element chosen yet)
        const orbColor = this.player.element ? ELEMENTS[this.player.element].color : 0x808080;

        // Create the initial wizard orbs
        for (let i = 0; i < this.player.orbCount; i++) {
            const orb = this.add.graphics();
            // Graphics objects don't have setOrigin() - position is already centered
            orb.orbAngle = (i / this.player.orbCount) * Math.PI * 2;

            // Draw magical orb (grey initially, changes when element is chosen)
            // Celestial orbs are twice the size
            if (this.player.isCelestialElement) {
                orb.fillStyle(orbColor, 0.6);
                orb.fillCircle(0, 0, 20); // 2x outer radius
                orb.fillStyle(this.player.element ? orbColor : 0xa0a0a0, 1);
                orb.fillCircle(0, 0, 12); // 2x inner radius
                orb.fillStyle(0xffffff, 1);
                orb.fillCircle(-4, -4, 4); // 2x highlight radius
                this.physics.add.existing(orb);
                orb.body.setCircle(24); // 2x physics body, increased by 50% for better hitbox
            } else {
                orb.fillStyle(orbColor, 0.6);
                orb.fillCircle(0, 0, 10);
                orb.fillStyle(this.player.element ? orbColor : 0xa0a0a0, 1);
                orb.fillCircle(0, 0, 6);
                orb.fillStyle(0xffffff, 1);
                orb.fillCircle(-2, -2, 2);
                this.physics.add.existing(orb);
                orb.body.setCircle(12);
            }
            orb.setDepth(10);

            this.wizardOrbs.push(orb);
        }
    }

    updateOrbColors(color) {
        // Redraw all existing orbs with the new element color
        this.wizardOrbs.forEach((orb) => {
            if (!orb || !orb.active) return;

            orb.clear();
            // Celestial orbs are twice the size
            if (this.player.isCelestialElement) {
                orb.fillStyle(color, 0.6);
                orb.fillCircle(0, 0, 20); // 2x outer radius
                orb.fillStyle(color, 1);
                orb.fillCircle(0, 0, 12); // 2x inner radius
                orb.fillStyle(0xffffff, 1);
                orb.fillCircle(-4, -4, 4); // 2x highlight radius
            } else {
                orb.fillStyle(color, 0.6);
                orb.fillCircle(0, 0, 10);
                orb.fillStyle(color, 1);
                orb.fillCircle(0, 0, 6);
                orb.fillStyle(0xffffff, 1);
                orb.fillCircle(-2, -2, 2);
            }
        });
    }

    updateWizardOrbs() {
        if (!this.player || this.player.characterType !== "wizard")
            return;
        if (!this.wizardOrbs) this.wizardOrbs = [];

        // Make sure we have the right number of orbs
        while (this.wizardOrbs.length < this.player.orbCount) {
            const orb = this.add.graphics();
            // Graphics objects don't have setOrigin() - position is already centered
            orb.orbAngle =
                (this.wizardOrbs.length / this.player.orbCount) *
                Math.PI *
                2;

            // Use element color if chosen, otherwise grey
            const orbColor = this.player.element ? ELEMENTS[this.player.element].color : 0x808080;

            // Celestial orbs are twice the size
            if (this.player.isCelestialElement) {
                orb.fillStyle(orbColor, 0.6);
                orb.fillCircle(0, 0, 20); // 2x outer radius
                orb.fillStyle(this.player.element ? orbColor : 0xa0a0a0, 1);
                orb.fillCircle(0, 0, 12); // 2x inner radius
                orb.fillStyle(0xffffff, 1);
                orb.fillCircle(-4, -4, 4); // 2x highlight radius
                this.physics.add.existing(orb);
                orb.body.setCircle(24); // 2x physics body, increased by 50% for better hitbox
            } else {
                orb.fillStyle(orbColor, 0.6);
                orb.fillCircle(0, 0, 10);
                orb.fillStyle(this.player.element ? orbColor : 0xa0a0a0, 1);
                orb.fillCircle(0, 0, 6);
                orb.fillStyle(0xffffff, 1);
                orb.fillCircle(-2, -2, 2);
                this.physics.add.existing(orb);
                orb.body.setCircle(12);
            }
            orb.setDepth(10);

            this.wizardOrbs.push(orb);
        }

        // Update orb positions
        this.wizardOrbs.forEach((orb, index) => {
            if (!orb || !orb.active) return;

            // Gravity element has semi-random orbit pattern
            if (this.player.isGravityElement) {
                // Initialize semi-random parameters if needed
                if (!orb.randomOffsetPhase) {
                    orb.randomOffsetPhase = Math.random() * Math.PI * 2;
                    orb.randomSpeedVariation = 0.8 + Math.random() * 0.4; // Speed varies 0.8-1.2x
                    orb.randomRadiusVariation = 0.9 + Math.random() * 0.2; // Radius varies 0.9-1.1x
                }

                // Update angle with speed variation
                orb.orbAngle += this.player.orbSpeed * this.player.orbSpeed * 0.02 * orb.randomSpeedVariation;

                // Add semi-random wobble to orbital distance
                const wobbleAmount = 15 * Math.sin(orb.randomOffsetPhase + this.time.now * 0.002);
                const variableDistance = this.player.orbDistance * orb.randomRadiusVariation + wobbleAmount;

                const x =
                    this.player.x +
                    Math.cos(orb.orbAngle) * variableDistance;
                const y =
                    this.player.y +
                    Math.sin(orb.orbAngle) * variableDistance;

                orb.x = x;
                orb.y = y;
            } else {
                // Normal orbit pattern for other elements
                orb.orbAngle += this.player.orbSpeed * 0.02;

                const x =
                    this.player.x +
                    Math.cos(orb.orbAngle) * this.player.orbDistance;
                const y =
                    this.player.y +
                    Math.sin(orb.orbAngle) * this.player.orbDistance;

                orb.x = x;
                orb.y = y;
            }

            // Check collision with enemies
            const collisionDist = this.player.isCelestialElement ? 36 : 18; // 2x for larger Celestial orb
            this.enemies.children.entries.forEach((enemy) => {
                if (!enemy.active || !enemy.body) return;

                const dist = Phaser.Math.Distance.Between(
                    orb.x,
                    orb.y,
                    enemy.x,
                    enemy.y,
                );
                if (dist < collisionDist) {
                    this.orbHitEnemy(orb, enemy);
                }
            });
        });
    }

    orbHitEnemy(orb, enemy) {
        if (!orb || !enemy || !orb.active || !enemy.active) return;

        // Cooldown check to prevent hitting same enemy too fast
        const now = this.time.now;
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

        // Apply damage with crit check and lifesteal
        this.applyDamage(enemy, damage);

        // Apply elemental status effects based on player's element
        if (this.player.element && enemy.statusEffects) {
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
                            this.enemies.children.entries.forEach((nearbyEnemy) => {
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
                        let closestDist = 105; // Max chain range (reduced by 30%)
                        this.enemies.children.entries.forEach((nearbyEnemy) => {
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
                            // Deal 50% damage to chained enemy with crit check and lifesteal
                            const chainDamage = Math.floor(this.player.damage * 0.5);
                            this.applyDamage(closestEnemy, chainDamage, 0xffff00);
                            if (closestEnemy.health <= 0) {
                                this.killEnemy(closestEnemy);
                            }
                        }
                    }
                    break;

                case 'nature':
                    // Poison: 30% base chance (+ Toxicity upgrades), starts at 2 damage (+ bonuses), doubles every 2 seconds
                    const poisonChance = this.player.poisonProcChance || 0.30; // 30% base chance
                    if (Math.random() < poisonChance) {
                        effects.poison.active = true;
                        effects.poison.damage = 2 + (this.player.poisonDamageBonus || 0);
                        effects.poison.duration = 6000;
                        effects.poison.lastTick = now;
                        effects.poison.stacks = 0;
                    }
                    break;

                case 'wind':
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
                        this.enemies.children.entries.forEach((nearbyEnemy) => {
                            if (nearbyEnemy === enemy || !nearbyEnemy.active) return;
                            const dist = Phaser.Math.Distance.Between(
                                enemy.x, enemy.y,
                                nearbyEnemy.x, nearbyEnemy.y
                            );
                            if (dist < 56) { // Reduced by 30% from 80
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
                        this.enemies.children.entries.forEach((nearbyEnemy) => {
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

        // Play hit sound
        soundFX.play("hit");

        // Flash enemy
        enemy.setAlpha(0.5);
        this.time.delayedCall(50, () => {
            if (enemy.active) enemy.setAlpha(1);
        });

        // Check if enemy died
        if (enemy.health <= 0) {
            this.killEnemy(enemy);
        }
    }

    /**
     * Update flamethrower attack (Flame element)
     * Fires cone-shaped fire in opposite direction of movement
     * @param {number} moveX - Player movement X direction (-1, 0, or 1)
     * @param {number} moveY - Player movement Y direction (-1, 0, or 1)
     * @param {number} time - Current game time
     * @returns {void}
     */
    updateFlamethrowerAttack(moveX, moveY, time) {
        // Only fire while moving
        if (moveX === 0 && moveY === 0) {
            return;
        }

        // Fire cones in BOTH directions (forward and backward)
        const forwardAngle = Math.atan2(moveY, moveX); // Direction of movement
        const backwardAngle = Math.atan2(-moveY, -moveX); // Opposite direction

        // Initialize flamethrower timer if needed
        if (!this.player.lastFlamethrowerTick) {
            this.player.lastFlamethrowerTick = time;
        }

        // Tick damage every 0.5 seconds (increased fire rate)
        if (time - this.player.lastFlamethrowerTick >= 500) {
            this.player.lastFlamethrowerTick = time;

            // Create wide cone spray effect
            const coneAngleSpread = Math.PI / 3; // 60 degree spread
            const flameRange = 188; // BUFFED by 25% (was 150)
            const fireAngles = [forwardAngle, backwardAngle]; // Shoot BOTH directions

            // Track which enemies we've already hit (prevent double damage)
            const hitEnemies = new Set();

            // Fire flames in both directions
            fireAngles.forEach((fireAngle) => {
                // Create fire particles
                for (let i = 0; i < 8; i++) {
                    const offsetAngle = (i / 8 - 0.5) * coneAngleSpread;
                    const particleAngle = fireAngle + offsetAngle;
                    const px = this.player.x + Math.cos(particleAngle) * (flameRange * 0.5);
                    const py = this.player.y + Math.sin(particleAngle) * (flameRange * 0.5);

                    const particle = this.add.graphics();
                    particle.fillStyle(0xff4500, 0.8);
                    particle.fillCircle(0, 0, Phaser.Math.Between(5, 12));
                    particle.x = px;
                    particle.y = py;
                    particle.setDepth(15);

                    this.tweens.add({
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
                this.enemies.children.entries.forEach((enemy) => {
                    if (!enemy.active || hitEnemies.has(enemy)) return; // Skip already hit enemies

                    const toEnemy = Math.atan2(
                        enemy.y - this.player.y,
                        enemy.x - this.player.x
                    );
                    // Calculate angle difference using helper (Phaser.Math.Angle.Difference doesn't exist in v3.70.0)
                    const angleDiff = getAngleDifference(fireAngle, toEnemy);

                    const dist = Phaser.Math.Distance.Between(
                        this.player.x, this.player.y,
                        enemy.x, enemy.y
                    );

                    // Check if in cone - BUFFED by 25% (was 100)
                    if (dist < 125 && angleDiff < Math.PI / 3) {
                        hitEnemies.add(enemy); // Mark as hit to prevent double damage

                        // Deal damage with crit check and lifesteal
                        const damage = this.player.damage;
                        this.applyDamage(enemy, damage, 0xffffff);

                        // Apply burn status effect
                        if (enemy.statusEffects) {
                            enemy.statusEffects.burn.active = true;
                            enemy.statusEffects.burn.damage = 3 + (this.player.burnDamageBonus || 0);
                            enemy.statusEffects.burn.duration = 3000 + (this.player.burnDurationBonus || 0);
                            enemy.statusEffects.burn.lastTick = time;
                        }

                        // Flash enemy
                        enemy.setAlpha(0.5);
                        this.time.delayedCall(50, () => {
                            if (enemy.active) enemy.setAlpha(1);
                        });

                        // Check if died
                        if (enemy.health <= 0) {
                            this.killEnemy(enemy);
                        }
                    }
                });
            });

            soundFX.play("hit");
        }
    }

    /**
     * Update water bullets attack (Water element)
     * Fires piercing water streams at nearest enemy
     * @param {number} time - Current game time
     * @returns {void}
     */
    updateWaterBulletsAttack(time) {
        // Initialize water stream timer if needed
        if (!this.player.lastWaterStreamTime) {
            this.player.lastWaterStreamTime = time;
        }

        // Fire piercing water stream every 1 second
        if (time - this.player.lastWaterStreamTime >= 1000) {
            this.player.lastWaterStreamTime = time;

            // Find nearest enemy (global range)
            let nearestEnemy = null;
            let nearestDistance = Infinity;

            this.enemies.children.entries.forEach((enemy) => {
                if (!enemy.active) return;
                const dist = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    enemy.x, enemy.y
                );
                if (dist < nearestDistance) {
                    nearestDistance = dist;
                    nearestEnemy = enemy;
                }
            });

            // Only fire if there's an enemy
            if (nearestEnemy) {
                const angle = Math.atan2(
                    nearestEnemy.y - this.player.y,
                    nearestEnemy.x - this.player.x
                );

                // Create piercing water stream (base 200px, affected by Jet Stream upgrade)
                const streamLength = Math.floor(200 * (1 + (this.player.waterStreamRangeBonus || 0)));
                const streamWidth = 12;
                const startX = this.player.x;
                const startY = this.player.y;
                const endX = this.player.x + Math.cos(angle) * streamLength;
                const endY = this.player.y + Math.sin(angle) * streamLength;

                // Draw water stream effect (thick blue line)
                const stream = this.add.graphics();
                stream.lineStyle(streamWidth, 0x4169e1, 0.8);
                stream.lineBetween(startX, startY, endX, endY);
                stream.setDepth(15);

                // Add water flow effect (lighter blue inner line)
                stream.lineStyle(streamWidth * 0.6, 0x87ceeb, 0.6);
                stream.lineBetween(startX, startY, endX, endY);

                // Fade out stream
                this.tweens.add({
                    targets: stream,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => stream.destroy(),
                });

                // Track hit enemies for this stream (prevent multi-hit)
                const hitEnemies = new Set();

                // Check collision with ALL enemies in stream path (piercing)
                this.enemies.children.entries.forEach((enemy) => {
                    if (!enemy.active || !enemy.statusEffects || hitEnemies.has(enemy)) return;

                    // Check if enemy is in stream path using line-to-point distance
                    const lineVec = { x: endX - startX, y: endY - startY };
                    const pointVec = { x: enemy.x - startX, y: enemy.y - startY };
                    const lineLength = Math.sqrt(lineVec.x * lineVec.x + lineVec.y * lineVec.y);
                    const lineDot = (pointVec.x * lineVec.x + pointVec.y * lineVec.y) / lineLength;

                    // Check if enemy is along the line (not behind or beyond)
                    if (lineDot < 0 || lineDot > lineLength) return;

                    // Calculate perpendicular distance from line
                    const perpDist = Math.abs(
                        (lineVec.y * pointVec.x - lineVec.x * pointVec.y) / lineLength
                    );

                    // Hit if within stream width + 50% for better hitbox
                    if (perpDist < (streamWidth * 1.5)) {
                        hitEnemies.add(enemy);

                        // Deal damage (using applyDamage for crit support)
                        const damage = this.player.damage; // 30 for water (includes +10 bonus)
                        this.applyDamage(enemy, damage, 0x4169e1);
                        soundFX.play("hit");

                        // Apply freeze effect (50% chance) - FIX: Was missing duration!
                        const freezeChance = 0.50 + (this.player.freezeChanceBonus || 0);
                        if (Math.random() < freezeChance && enemy.statusEffects) {
                            enemy.statusEffects.freeze.active = true;
                            const baseDuration = 2000;
                            enemy.statusEffects.freeze.duration = baseDuration * (this.player.freezeDurationBonus || 1);
                        }

                        // Flash enemy
                        enemy.setAlpha(0.5);
                        this.time.delayedCall(50, () => {
                            if (enemy.active) enemy.setAlpha(1);
                        });

                        // Check death
                        if (enemy.health <= 0) {
                            this.killEnemy(enemy);
                        }
                    }
                });

                soundFX.play("shoot");
            }
        }
    }

    updateChainLightningAttack(time) {
        // Initialize lightning timer if needed
        if (!this.player.lastLightningTime) {
            this.player.lastLightningTime = time;
        }

        // Fire 1 lightning chain per second
        if (time - this.player.lastLightningTime >= 1000) {
            this.player.lastLightningTime = time;

            // Find nearest enemy within reduced range (125 pixels base + Thor's Hammer bonus)
            let nearestEnemy = null;
            const baseRange = 125;
            let nearestDistance = baseRange * (1 + (this.player.electricRangeBonus || 0));

            this.enemies.children.entries.forEach((enemy) => {
                if (!enemy.active) return;
                const dist = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    enemy.x, enemy.y
                );
                if (dist < nearestDistance) {
                    nearestDistance = dist;
                    nearestEnemy = enemy;
                }
            });

            // Only fire if there's an enemy in range
            if (nearestEnemy) {
                const hitEnemies = new Set();
                let currentEnemy = nearestEnemy;

                // Chain lightning
                for (let chain = 0; chain < 10; chain++) {
                    if (!currentEnemy || !currentEnemy.active) break;

                    // Mark as hit
                    hitEnemies.add(currentEnemy);

                    // Deal damage (using applyDamage for crit support)
                    const damage = this.player.damage;
                    this.applyDamage(currentEnemy, damage, 0xffff00);

                    // Apply paralyze status effect
                    if (currentEnemy.statusEffects) {
                        currentEnemy.statusEffects.paralyze.active = true;
                        currentEnemy.statusEffects.paralyze.duration = 1500 + (this.player.paralyzeChanceBonus || 0) * 100;
                    }

                    // Flash enemy
                    currentEnemy.setAlpha(0.5);
                    this.time.delayedCall(50, () => {
                        if (currentEnemy.active) currentEnemy.setAlpha(1);
                    });

                    // Check if died
                    if (currentEnemy.health <= 0) {
                        this.killEnemy(currentEnemy);
                    }

                    // Find next nearest enemy to chain to (from current enemy's position + Thor's Hammer bonus)
                    let nextEnemy = null;
                    const baseChainRange = 75;
                    let nextDistance = baseChainRange * (1 + (this.player.electricRangeBonus || 0));

                    this.enemies.children.entries.forEach((enemy) => {
                        if (!enemy.active || hitEnemies.has(enemy)) return;
                        const dist = Phaser.Math.Distance.Between(
                            currentEnemy.x, currentEnemy.y,
                            enemy.x, enemy.y
                        );
                        if (dist < nextDistance) {
                            nextDistance = dist;
                            nextEnemy = enemy;
                        }
                    });

                    // Draw lightning bolt from current to next
                    if (nextEnemy) {
                        const lightning = this.add.graphics();
                        lightning.lineStyle(3, 0xffff00, 0.8);
                        lightning.beginPath();
                        lightning.moveTo(currentEnemy.x, currentEnemy.y);
                        lightning.lineTo(nextEnemy.x, nextEnemy.y);
                        lightning.strokePath();
                        lightning.setDepth(15);

                        this.time.delayedCall(100, () => {
                            if (lightning) lightning.destroy();
                        });

                        currentEnemy = nextEnemy;
                    } else {
                        break; // No more enemies to chain to
                    }
                }

                soundFX.play("hit");
            }
        }
    }

    /**
     * Update seed planting (Nature element)
     * Plants poisonous seeds behind player that explode after delay
     * @param {number} moveX - Player movement X direction (-1, 0, or 1)
     * @param {number} moveY - Player movement Y direction (-1, 0, or 1)
     * @param {number} time - Current game time
     * @returns {void}
     */
    updateSeedPlanting(moveX, moveY, time) {
        // Initialize seed system if needed
        if (!this.playerSeeds) {
            this.playerSeeds = [];
        }

        // Only plant while moving
        if (moveX === 0 && moveY === 0) {
            return;
        }

        // Initialize seed planting timer if needed
        if (!this.player.lastSeedPlantTime) {
            this.player.lastSeedPlantTime = time;
        }

        // Plant seed every 667ms (50% faster fire rate)
        if (time - this.player.lastSeedPlantTime >= 667) {
            this.player.lastSeedPlantTime = time;

            const seed = {
                x: this.player.x,
                y: this.player.y,
                plantedTime: time,
                graphic: null
            };

            // Create visual seed (plant sprout)
            const seedGraphic = this.add.graphics();
            seedGraphic.fillStyle(0x228b22, 1); // Forest green

            // Draw plant sprout (stem)
            seedGraphic.fillRect(-1, -8, 2, 8);

            // Draw leaves
            seedGraphic.fillRect(-4, -6, 3, 3);
            seedGraphic.fillRect(1, -6, 3, 3);
            seedGraphic.fillRect(-3, -3, 2, 2);
            seedGraphic.fillRect(1, -3, 2, 2);

            seedGraphic.x = seed.x;
            seedGraphic.y = seed.y;
            seedGraphic.setDepth(5);

            seed.graphic = seedGraphic;
            this.playerSeeds.push(seed);

            soundFX.play("xpCollect"); // Use plant sound
        }
    }

    updateSeedExplosions(time) {
        if (!this.playerSeeds) {
            this.playerSeeds = [];
        }

        // Check each seed for explosion timing
        for (let i = this.playerSeeds.length - 1; i >= 0; i--) {
            const seed = this.playerSeeds[i];

            // Explode after 2 seconds on ground
            if (time - seed.plantedTime >= 2000) {
                // Explosion particles (green leaves flying)
                for (let j = 0; j < 12; j++) {
                    const particle = this.add.graphics();
                    particle.fillStyle(0x228b22, 0.9);
                    particle.fillCircle(0, 0, Phaser.Math.Between(2, 5));
                    particle.x = seed.x;
                    particle.y = seed.y;
                    particle.setDepth(15);

                    const angle = (j / 12) * Math.PI * 2;
                    const distance = 60;

                    this.tweens.add({
                        targets: particle,
                        x: seed.x + Math.cos(angle) * distance,
                        y: seed.y + Math.sin(angle) * distance,
                        alpha: 0,
                        duration: 400,
                        onComplete: () => particle.destroy()
                    });
                }

                // Damage enemies in explosion radius (150 pixels, increased by 50% for better hitbox)
                this.enemies.children.entries.forEach((enemy) => {
                    if (!enemy.active) return;

                    const dist = Phaser.Math.Distance.Between(
                        seed.x, seed.y,
                        enemy.x, enemy.y
                    );

                    // Check if in explosion radius
                    if (dist < 150) {
                        // Deal damage with crit check and lifesteal
                        const damage = this.player.damage;
                        this.applyDamage(enemy, damage, 0xffffff);

                        // Apply poison status effect (30% base chance + Toxicity upgrades)
                        const poisonChance = this.player.poisonProcChance || 0.30; // 30% base chance
                        if (enemy.statusEffects && Math.random() < poisonChance) {
                            enemy.statusEffects.poison.active = true;
                            enemy.statusEffects.poison.damage = 2 + (this.player.poisonDamageBonus || 0);
                            enemy.statusEffects.poison.duration = 2000;
                            enemy.statusEffects.poison.lastTick = time;
                        }

                        // Flash enemy
                        enemy.setAlpha(0.5);
                        this.time.delayedCall(50, () => {
                            if (enemy.active) enemy.setAlpha(1);
                        });

                        // Check if died
                        if (enemy.health <= 0) {
                            this.killEnemy(enemy);
                        }
                    }
                });

                // Destroy seed graphic and remove from array
                if (seed.graphic && seed.graphic.destroy) {
                    seed.graphic.destroy();
                }
                this.playerSeeds.splice(i, 1);

                soundFX.play("hit");
            }
        }
    }

    updateWindBoomerangAttack(time) {
        // Initialize wind boomerang system if needed
        if (!this.windBoomerangs) {
            this.windBoomerangs = [];
        }

        // Initialize boomerang timer
        if (!this.player.lastBoomerangTime) {
            this.player.lastBoomerangTime = time;
        }

        // Fire boomerang every 1 second (Hurricane upgrade increases max simultaneous boomerangs)
        const maxBoomerangs = this.player.maxBoomerangs || 3; // Base 3 boomerangs
        if (time - this.player.lastBoomerangTime >= 1000 && this.windBoomerangs.length < maxBoomerangs) {
            this.player.lastBoomerangTime = time;

            // Check if there's already a targeting boomerang active
            const hasTargetingBoomerang = this.windBoomerangs.some(b => b.isTargeting);

            let angle;
            let isTargeting = false;
            // If no targeting boomerang exists, make this one target the nearest enemy
            if (!hasTargetingBoomerang) {
                isTargeting = true;
                // Find nearest enemy to target
                let nearestEnemy = null;
                let nearestDistance = Infinity;
                this.enemies.children.entries.forEach((enemy) => {
                    if (!enemy.active) return;
                    const dist = Phaser.Math.Distance.Between(
                        this.player.x, this.player.y,
                        enemy.x, enemy.y
                    );
                    if (dist < nearestDistance) {
                        nearestDistance = dist;
                        nearestEnemy = enemy;
                    }
                });

                // Determine angle - aim at nearest enemy, or random if no enemies
                if (nearestEnemy) {
                    angle = Phaser.Math.Angle.Between(
                        this.player.x, this.player.y,
                        nearestEnemy.x, nearestEnemy.y
                    );
                } else {
                    angle = Math.random() * Math.PI * 2;
                }
            } else {
                // 2nd and 3rd boomerangs go random direction
                angle = Math.random() * Math.PI * 2;
            }

            const boomerang = {
                x: this.player.x,
                y: this.player.y,
                startX: this.player.x,
                startY: this.player.y,
                angle: angle,
                progress: 0, // 0 to 1 (0=start, 0.5=max distance, 1=return to start)
                maxDistance: this.scale.width / 3, // 1/3 screen distance
                graphic: null,
                hitEnemies: new Set(), // Track hit enemies for this boomerang
                spawnTime: time,
                isTargeting: isTargeting // Track if this boomerang targets enemies
            };

            // Create boomerang visual (grey curved shape)
            const boomerangGraphic = this.add.graphics();
            boomerangGraphic.fillStyle(0x888888, 1); // Grey
            boomerangGraphic.fillCircle(0, 0, 6); // Main body
            boomerangGraphic.fillCircle(8, 0, 4); // Wing

            boomerang.graphic = boomerangGraphic;
            this.windBoomerangs.push(boomerang);

            soundFX.play("hit"); // Boomerang launch sound
        }

        // Update existing boomerangs
        for (let i = this.windBoomerangs.length - 1; i >= 0; i--) {
            const boomerang = this.windBoomerangs[i];
            const boomerangAge = time - boomerang.spawnTime;
            const totalTravelTime = 2000; // 2 seconds total journey (out and back)

            boomerang.progress = (boomerangAge % totalTravelTime) / totalTravelTime;

            let distance;
            if (boomerang.progress < 0.5) {
                // Going out
                distance = boomerang.maxDistance * (boomerang.progress * 2);
            } else {
                // Coming back
                distance = boomerang.maxDistance * (2 - boomerang.progress * 2);
            }

            // Calculate position with curved trajectory (sine wave)
            boomerang.x = boomerang.startX + Math.cos(boomerang.angle) * distance;
            boomerang.y = boomerang.startY + Math.sin(boomerang.angle) * distance;

            // Add curve based on progress (parabolic arc)
            const curveAmount = Math.sin(boomerang.progress * Math.PI) * 30;
            boomerang.x += Math.sin(boomerang.angle + Math.PI / 2) * curveAmount;
            boomerang.y += Math.cos(boomerang.angle + Math.PI / 2) * curveAmount;

            // Update boomerang position and rotation
            if (boomerang.graphic) {
                boomerang.graphic.x = boomerang.x;
                boomerang.graphic.y = boomerang.y;
                boomerang.graphic.rotation += 0.1; // Spinning effect

                // Check collision with enemies
                this.enemies.children.entries.forEach((enemy) => {
                    if (!enemy.active) return;

                    const dist = Phaser.Math.Distance.Between(
                        boomerang.x, boomerang.y,
                        enemy.x, enemy.y
                    );

                    // Hit if within 22.5 pixels (increased by 50% for better hitbox) and not already hit
                    if (dist < 22.5 && !boomerang.hitEnemies.has(enemy)) {
                        boomerang.hitEnemies.add(enemy);

                        // Deal damage with crit check and lifesteal
                        const damage = this.player.damage;
                        this.applyDamage(enemy, damage, 0xffffff);

                        // Apply knockback (+ bonuses) - FIX: Was missing!
                        if (enemy.body) {
                            const knockbackPower = 200 * (this.player.knockbackBonus || 1);
                            applyKnockback(enemy.body, boomerang.x, boomerang.y, enemy.x, enemy.y, knockbackPower);
                        }

                        // Flash enemy
                        enemy.setAlpha(0.5);
                        this.time.delayedCall(50, () => {
                            if (enemy.active) enemy.setAlpha(1);
                        });

                        // Apply 0.5 second immunity timer to prevent stacking
                        const hitTime = time;
                        const checkImmunity = () => {
                            if (time - hitTime < 500) {
                                // Still immune - don't allow re-hitting in same boomerang pass
                            } else {
                                // Immunity expired - this enemy can be hit again by future boomerangs
                                boomerang.hitEnemies.delete(enemy);
                            }
                        };

                        // Check if died
                        if (enemy.health <= 0) {
                            this.killEnemy(enemy);
                        }

                        soundFX.play("hit");
                    }
                });
            }

            // Remove boomerang after returning (3 seconds total: 2 sec travel + 1 sec buffer)
            if (boomerangAge >= 3000) {
                if (boomerang.graphic && boomerang.graphic.destroy) {
                    boomerang.graphic.destroy();
                }
                this.windBoomerangs.splice(i, 1);
            }
        }
    }

    updateTerrainWalls(moveX, moveY, time) {
        // Initialize wall system if needed
        if (!this.playerWalls) {
            this.playerWalls = [];
        }

        // Initialize wall spawn timer
        if (!this.player.lastWallSpawnTime) {
            this.player.lastWallSpawnTime = time;
        }

        // Spawn wall every 2 seconds
        if (time - this.player.lastWallSpawnTime >= 2000) {
            this.player.lastWallSpawnTime = time;

            // Random distance between 80-200 pixels
            const spawnDistance = Phaser.Math.Between(80, 200);
            const spawnAngle = Math.random() * Math.PI * 2;

            const wall = {
                x: this.player.x + Math.cos(spawnAngle) * spawnDistance,
                y: this.player.y + Math.sin(spawnAngle) * spawnDistance,
                width: 60,
                height: 60,
                spawnTime: time,
                graphic: null,
                physicsBody: null,
                hitEnemies: new Set() // Track enemies hit during spawn phase
            };

            // Create wall visual (brown stone)
            const wallGraphic = this.add.graphics();
            wallGraphic.fillStyle(0x8b4513, 1); // Brown stone
            wallGraphic.fillRect(-wall.width / 2, -wall.height / 2, wall.width, wall.height);

            // Add stone texture (simple cracks)
            wallGraphic.lineStyle(1, 0x654321, 0.5);
            wallGraphic.beginPath();
            wallGraphic.moveTo(-15, -10);
            wallGraphic.lineTo(10, 15);
            wallGraphic.stroke();
            wallGraphic.beginPath();
            wallGraphic.moveTo(-10, 15);
            wallGraphic.lineTo(15, -10);
            wallGraphic.stroke();

            wallGraphic.x = wall.x;
            wallGraphic.y = wall.y;
            wallGraphic.setDepth(10);

            // Create physics body for collision
            const wallPhysics = this.physics.add.staticGroup();
            const wallBody = wallPhysics.create(wall.x, wall.y);
            wallBody.setSize(wall.width, wall.height);
            wallBody.setBounce(0, 0);

            wall.graphic = wallGraphic;
            wall.physicsBody = wallPhysics;
            this.playerWalls.push(wall);

            soundFX.play("xpCollect"); // Wall creation sound
        }

        // Update existing walls
        for (let i = this.playerWalls.length - 1; i >= 0; i--) {
            const wall = this.playerWalls[i];
            const wallAge = time - wall.spawnTime;
            const spawnDuration = 7500; // 7.5 seconds spawn phase (50% longer)
            const staticDuration = 10000; // 10 seconds static phase
            const totalDuration = spawnDuration + staticDuration; // 17.5 seconds total

            if (wallAge < spawnDuration) {
                // SPAWN PHASE: Wall is spawning and can damage enemies
                const spawnProgress = wallAge / spawnDuration;

                // Scale up the wall during spawn
                const scale = 0.3 + spawnProgress * 0.7;
                if (wall.graphic) {
                    wall.graphic.setScale(scale);
                    // Pulsing effect during spawn
                    wall.graphic.setAlpha(0.7 + Math.sin(spawnProgress * Math.PI * 4) * 0.3);
                }

                // Deal damage to enemies during spawn phase
                this.enemies.children.entries.forEach((enemy) => {
                    if (!enemy.active) return;

                    const dist = Phaser.Math.Distance.Between(
                        wall.x, wall.y,
                        enemy.x, enemy.y
                    );

                    // Hit if within wall radius (60 pixels from center) and not already hit
                    if (dist < 40 && !wall.hitEnemies.has(enemy)) {
                        wall.hitEnemies.add(enemy);

                        // Deal damage with crit check and lifesteal
                        const damage = this.player.damage;
                        this.applyDamage(enemy, damage, 0xffffff);

                        // Flash enemy
                        enemy.setAlpha(0.5);
                        this.time.delayedCall(50, () => {
                            if (enemy.active) enemy.setAlpha(1);
                        });

                        // Check if died
                        if (enemy.health <= 0) {
                            this.killEnemy(enemy);
                        }

                        soundFX.play("hit");
                    }
                });
            } else if (wallAge < totalDuration) {
                // STATIC PHASE: Wall is solid barrier, blocks movement
                if (wall.graphic) {
                    wall.graphic.setAlpha(1); // Full opacity
                    wall.graphic.setScale(1); // Full size
                }

                // Check collision with player
                const playerDist = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    wall.x, wall.y
                );

                if (playerDist < 40) {
                    // Push player away from wall
                    const angle = Math.atan2(
                        this.player.y - wall.y,
                        this.player.x - wall.x
                    );

                    this.player.x = wall.x + Math.cos(angle) * 50;
                    this.player.y = wall.y + Math.sin(angle) * 50;

                    // Also stop player velocity to prevent push-through
                    if (this.player.body) {
                        this.player.body.setVelocity(0, 0);
                    }
                }

                // Block enemy movement through wall
                this.enemies.children.entries.forEach((enemy) => {
                    if (!enemy.active) return;

                    const enemyDist = Phaser.Math.Distance.Between(
                        enemy.x, enemy.y,
                        wall.x, wall.y
                    );

                    if (enemyDist < 40) {
                        // Push enemy away from wall
                        const angle = Math.atan2(
                            enemy.y - wall.y,
                            enemy.x - wall.x
                        );

                        enemy.x = wall.x + Math.cos(angle) * 50;
                        enemy.y = wall.y + Math.sin(angle) * 50;
                        if (enemy.body) {
                            enemy.body.setVelocity(0, 0);
                        }
                    }
                });
            } else {
                // DESPAWN PHASE: Wall is gone
                if (wall.graphic && wall.graphic.destroy) {
                    wall.graphic.destroy();
                }
                if (wall.physicsBody) {
                    // Clear all children from the physics group before destroying
                    wall.physicsBody.clear(true, true);
                    if (wall.physicsBody.destroy) {
                        wall.physicsBody.destroy();
                    }
                }
                this.playerWalls.splice(i, 1);
            }
        }
    }

    /**
     * Update radiant beam attack (Radiant element)
     * Fires pulsing beams at multiple enemies simultaneously
     * @param {number} time - Current game time
     * @returns {void}
     */
    updateRadiantBeamAttack(time) {
        // Initialize beam timer if needed
        if (!this.player.lastRadiantBeamTime) {
            this.player.lastRadiantBeamTime = time;
        }

        // Pulse beams every 1.5 seconds
        if (time - this.player.lastRadiantBeamTime >= 1500) {
            this.player.lastRadiantBeamTime = time;

            // Create beams in all directions (8 beams in a circle pattern)
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const beamLength = 150;
                const startX = this.player.x + Math.cos(angle) * 30;
                const startY = this.player.y + Math.sin(angle) * 30;
                const endX = this.player.x + Math.cos(angle) * beamLength;
                const endY = this.player.y + Math.sin(angle) * beamLength;

                // Draw beam effect
                const beam = this.add.graphics();
                beam.lineStyle(8, 0xfffacd, 1); // Bright gold beam
                beam.lineBetween(startX, startY, endX, endY);
                beam.setDepth(15);

                // Fade out beam
                this.tweens.add({
                    targets: beam,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => beam.destroy(),
                });

                // Check collision with enemies
                this.enemies.children.entries.forEach((enemy) => {
                    if (!enemy.active || !enemy.statusEffects) return;

                    // Check if enemy is in beam path
                    const enemyDist = Phaser.Math.Distance.Between(
                        enemy.x,
                        enemy.y,
                        this.player.x + Math.cos(angle) * (beamLength / 2),
                        this.player.y + Math.sin(angle) * (beamLength / 2)
                    );

                    if (enemyDist < 90) {
                        // Deal damage with crit check and lifesteal
                        const damage = this.player.damage;
                        this.applyDamage(enemy, damage, 0xffffff);
                        soundFX.play("hit");

                        // Apply blind effect
                        const blindChance = 0.50 + (this.player.blindChanceBonus || 0);
                        if (Math.random() < blindChance && enemy.statusEffects) {
                            enemy.statusEffects.blind.active = true;
                        }

                        if (enemy.health <= 0) {
                            this.killEnemy(enemy);
                        }
                    }
                });
            }

            // Create visual pulse effect at player center
            const pulseGraphic = this.add.graphics();
            pulseGraphic.fillStyle(0xfffacd, 0.4);
            pulseGraphic.fillCircle(this.player.x, this.player.y, 30);
            pulseGraphic.setDepth(15);

            this.tweens.add({
                targets: pulseGraphic,
                alpha: 0,
                duration: 300,
                onComplete: () => pulseGraphic.destroy(),
            });
        }
    }

    /**
     * Update shadow clones (Shadow element)
     * Manages AI-controlled clones that mimic player and attack enemies
     * @param {number} time - Current game time
     * @param {number} delta - Time since last frame
     * @returns {void}
     */
    updateShadowClones(time, delta) {
        // Initialize shadow clones if needed
        if (!this.shadowClones) {
            this.shadowClones = [];
        }

        // Initialize spawn timer for shadow clones
        if (!this.player.lastShadowCloneSpawnTime) {
            this.player.lastShadowCloneSpawnTime = time;
        }

        // Spawn shadow clones 2 seconds after wave starts (50% faster - if not already spawned)
        const cloneCountNeeded = this.player.hasVoidClone ? 2 : 1;
        if (this.shadowClones.length === 0 && time - this.player.lastShadowCloneSpawnTime >= 2000) {
            // Spawn initial clone(s)
            for (let i = 0; i < cloneCountNeeded; i++) {
                this.spawnShadowClone(i, time, delta);
            }
        }

        // Update existing shadow clones
        for (let i = this.shadowClones.length - 1; i >= 0; i--) {
            const clone = this.shadowClones[i];
            if (!clone || !clone.active) continue;

            // TARGET LOCKING: Check if current locked target is still valid
            let targetEnemy = null;
            if (clone.targetLocked) {
                const distToPlayer = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    clone.targetLocked.x, clone.targetLocked.y
                );

                // Keep target if still active and within range of player
                if (clone.targetLocked.active && distToPlayer <= 250) {
                    targetEnemy = clone.targetLocked;
                } else {
                    // Target invalid, clear lock
                    clone.targetLocked = null;
                }
            }

            // Only search for new target if no locked target
            if (!clone.targetLocked) {
                let targetDistance = clone.aiType === 0 ? 0 : 250; // Start at 0 for farthest, 250 for nearest

                this.enemies.children.entries.forEach((enemy) => {
                    if (!enemy.active || !enemy.body) return;

                    const distToPlayer = Phaser.Math.Distance.Between(
                        this.player.x, this.player.y,
                        enemy.x, enemy.y
                    );

                    // Must be within 250px of player
                    if (distToPlayer > 250) return;

                    const distToClone = Phaser.Math.Distance.Between(
                        clone.x, clone.y,
                        enemy.x, enemy.y
                    );

                    // Clone 1 (AI type 0): Target farthest enemy
                    // Clone 2 (AI type 1): Target nearest enemy
                    if (clone.aiType === 0) {
                        // Farthest enemy
                        if (distToClone > targetDistance) {
                            targetDistance = distToClone;
                            targetEnemy = enemy;
                        }
                    } else {
                        // Nearest enemy
                        if (distToClone < targetDistance) {
                            targetDistance = distToClone;
                            targetEnemy = enemy;
                        }
                    }
                });

                // Lock onto the found target
                if (targetEnemy) {
                    clone.targetLocked = targetEnemy;
                }
            }

            // Move towards target or towards player if no target
            if (targetEnemy && targetEnemy.active) {
                // Move towards target
                const angle = Phaser.Math.Angle.Between(
                    clone.x, clone.y,
                    targetEnemy.x, targetEnemy.y
                );
                const speed = 120; // Clone movement speed
                clone.x += Math.cos(angle) * speed * (delta / 1000); // Frame-rate independent
                clone.y += Math.sin(angle) * speed * (delta / 1000);

                // Deal damage if touching (scaled for mobile, increased by 50% for better hitbox)
                const distToTarget = Phaser.Math.Distance.Between(
                    clone.x, clone.y,
                    targetEnemy.x, targetEnemy.y
                );
                const collisionRadius = 37.5 * this.mobileScale;
                if (distToTarget < collisionRadius) {
                    // Check damage cooldown (every 0.75 seconds per clone)
                    if (time - clone.lastDamageTime >= 750) {
                        const damage = this.player.damage;
                        this.applyDamage(targetEnemy, damage, 0x4b0082); // Dark purple
                        clone.lastDamageTime = time;

                        // Flash enemy
                        targetEnemy.setAlpha(0.5);
                        this.time.delayedCall(50, () => {
                            if (targetEnemy.active) targetEnemy.setAlpha(1);
                        });

                        // Check if enemy died
                        if (targetEnemy.health <= 0) {
                            this.killEnemy(targetEnemy);
                        }

                        soundFX.play("hit");
                    }
                }
            } else {
                // No target, move towards player
                const distToPlayer = Phaser.Math.Distance.Between(
                    clone.x, clone.y,
                    this.player.x, this.player.y
                );
                if (distToPlayer > 100) {
                    const angle = Phaser.Math.Angle.Between(
                        clone.x, clone.y,
                        this.player.x, this.player.y
                    );
                    const speed = 80;
                    clone.x += Math.cos(angle) * speed * (delta / 1000); // Frame-rate independent
                    clone.y += Math.sin(angle) * speed * (delta / 1000);
                }
            }

            // Keep clone within 250px of player
            const distToPlayer = Phaser.Math.Distance.Between(
                clone.x, clone.y,
                this.player.x, this.player.y
            );
            if (distToPlayer > 250) {
                const angle = Phaser.Math.Angle.Between(
                    clone.x, clone.y,
                    this.player.x, this.player.y
                );
                clone.x = this.player.x + Math.cos(angle) * 240;
                clone.y = this.player.y + Math.sin(angle) * 240;
            }

            // Note: clone IS the graphics object, so x/y are already updated
            // No need for separate graphic.x/graphic.y update
        }
    }

    spawnShadowClone(cloneIndex, time, delta) {
        // Create shadow clone graphics (black silhouette)
        const clone = this.add.graphics();
        // Graphics objects don't have setOrigin() - position is already centered
        clone.x = this.player.x + Phaser.Math.Between(-40, 40);
        clone.y = this.player.y + Phaser.Math.Between(-40, 40);

        // Draw as black silhouette wizard
        clone.clear();

        // Draw shadow clone with black color only
        // Wizard hat (black)
        clone.fillStyle(0x1a1a1a, 1); // Very dark grey/black
        clone.fillRect(-6, -10, 12, 6);
        clone.fillRect(-4, -14, 8, 4);

        // Hat star (dark)
        clone.fillStyle(0x3a3a3a, 1);
        clone.fillRect(-1, -8, 2, 2);

        // Face (dark grey)
        clone.fillStyle(0x2a2a2a, 1);
        clone.fillRect(-4, -4, 8, 6);

        // Eyes (darker)
        clone.fillStyle(0x1a1a1a, 1);
        clone.fillRect(-3, -2, 2, 2);
        clone.fillRect(1, -2, 2, 2);

        // Beard (very dark)
        clone.fillStyle(0x1a1a1a, 1);
        clone.fillRect(-4, 2, 8, 4);

        // Robe (black)
        clone.fillStyle(0x1a1a1a, 1);
        clone.fillRect(-5, 6, 10, 10);

        // Robe trim (dark grey)
        clone.fillStyle(0x3a3a3a, 1);
        clone.fillRect(-5, 6, 10, 1);

        // Arms/sleeves (black)
        clone.fillStyle(0x1a1a1a, 1);
        clone.fillRect(-7, 8, 2, 6);
        clone.fillRect(5, 8, 2, 6);

        // Hands (dark grey)
        clone.fillStyle(0x2a2a2a, 1);
        clone.fillRect(-7, 13, 2, 2);
        clone.fillRect(5, 13, 2, 2);

        // Staff (very dark)
        clone.fillStyle(0x1a1a1a, 1);
        clone.fillRect(-9, 6, 2, 10);

        // Staff orb (black)
        clone.fillStyle(0x1a1a1a, 1);
        clone.fillCircle(-8, 4, 3);
        clone.fillStyle(0x3a3a3a, 1);
        clone.fillCircle(-8, 4, 2);

        clone.setAlpha(0.7); // Slightly transparent to show it's a clone
        clone.active = true;
        clone.aiType = cloneIndex; // 0 = farthest, 1 = nearest
        clone.lastDamageTime = time - 2000; // Allow immediate damage on first contact
        clone.setDepth(10);

        // Scale for mobile (same as player and enemies)
        clone.setScale(this.mobileScale);

        this.shadowClones.push(clone);
    }


    setupTouchControls() {
        // Only show on touch devices
        if (!("ontouchstart" in window)) return;

        // Floating joystick size (scaled for mobile)
        const baseRadius = 60 * this.mobileScale;
        const stickRadius = 30 * this.mobileScale;
        const maxDistance = 50 * this.mobileScale;

        // Minimum touch target size (44pt iOS / 48dp Android)
        const minTouchSize = Math.max(88, baseRadius * 2);

        // Virtual joystick base (initially hidden)
        this.joystickBase = this.add.graphics();
        this.joystickBase.setDepth(1500);
        this.joystickBase.setScrollFactor(0);
        this.joystickBase.setAlpha(0); // Start invisible

        // Virtual joystick stick (initially hidden)
        this.joystickStick = this.add.graphics();
        this.joystickStick.setDepth(1501);
        this.joystickStick.setScrollFactor(0);
        this.joystickStick.setAlpha(0); // Start invisible

        // Joystick state
        this.joystickState = {
            active: false,
            baseX: 0,
            baseY: 0,
            baseRadius: baseRadius,
            stickRadius: stickRadius,
            maxDistance: maxDistance,
            pointerId: null,
        };

        // Touch input for floating joystick
        this.input.on("pointerdown", (pointer) => {
            if (this.paused) return;

            // Only activate if touch is in bottom 60% of screen (ergonomic thumb zone)
            const screenHeight = this.cameras.main.height;
            if (pointer.y > screenHeight * 0.4) {
                // Activate floating joystick at touch position
                this.joystickState.active = true;
                this.joystickState.baseX = pointer.x;
                this.joystickState.baseY = pointer.y;
                this.joystickState.pointerId = pointer.id;

                // Draw joystick base at touch position
                this.joystickBase.clear();
                this.joystickBase.fillStyle(0x333333, 0.4);
                this.joystickBase.fillCircle(pointer.x, pointer.y, baseRadius);
                this.joystickBase.lineStyle(3 * this.mobileScale, 0x666666, 0.6);
                this.joystickBase.strokeCircle(pointer.x, pointer.y, baseRadius);

                // Fade in joystick
                this.tweens.add({
                    targets: [this.joystickBase, this.joystickStick],
                    alpha: 1,
                    duration: 100,
                    ease: 'Power2',
                });

                this.touchControls.active = true;
                this.updateFloatingJoystick(pointer);
            }
        });

        this.input.on("pointermove", (pointer) => {
            if (this.joystickState.active &&
                this.joystickState.pointerId === pointer.id &&
                !this.paused) {
                this.updateFloatingJoystick(pointer);
            }
        });

        this.input.on("pointerup", (pointer) => {
            if (this.joystickState.pointerId === pointer.id) {
                this.joystickState.active = false;
                this.joystickState.pointerId = null;
                this.touchControls.active = false;
                this.touchControls.x = 0;
                this.touchControls.y = 0;

                // Fade out joystick
                this.tweens.add({
                    targets: [this.joystickBase, this.joystickStick],
                    alpha: 0,
                    duration: 150,
                    ease: 'Power2',
                });
            }
        });
    }

    updateFloatingJoystick(pointer) {
        const state = this.joystickState;
        const deltaX = pointer.x - state.baseX;
        const deltaY = pointer.y - state.baseY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Dead zone for more precise control (10% of max distance)
        const deadZone = state.maxDistance * 0.1;

        if (distance < deadZone) {
            // In dead zone - no movement
            this.touchControls.x = 0;
            this.touchControls.y = 0;

            // Draw stick at center
            this.joystickStick.clear();
            this.joystickStick.fillStyle(0x00ff88, 0.6);
            this.joystickStick.fillCircle(state.baseX, state.baseY, state.stickRadius);
        } else if (distance > state.maxDistance) {
            // Outside max range - clamp to edge
            const angle = Math.atan2(deltaY, deltaX);
            this.touchControls.x = Math.cos(angle);
            this.touchControls.y = Math.sin(angle);

            // Draw stick at max distance
            this.joystickStick.clear();
            this.joystickStick.fillStyle(0x00ff88, 0.8);
            this.joystickStick.fillCircle(
                state.baseX + Math.cos(angle) * state.maxDistance,
                state.baseY + Math.sin(angle) * state.maxDistance,
                state.stickRadius,
            );
        } else {
            // Within range - proportional movement
            const normalizedDistance = (distance - deadZone) / (state.maxDistance - deadZone);
            const angle = Math.atan2(deltaY, deltaX);
            this.touchControls.x = Math.cos(angle) * normalizedDistance;
            this.touchControls.y = Math.sin(angle) * normalizedDistance;

            // Draw stick at pointer position
            this.joystickStick.clear();
            this.joystickStick.fillStyle(0x00ff88, 0.8);
            this.joystickStick.fillCircle(pointer.x, pointer.y, state.stickRadius);
        }
    }

    togglePause() {
        // Don't allow pausing during level up screen
        if (this.paused && this.pauseMenuElements === null) return;

        if (this.paused && this.pauseMenuElements) {
            // Unpause
            this.paused = false;
            this.physics.resume();
            this.hidePauseMenu();
        } else if (!this.paused) {
            // Pause
            this.paused = true;
            this.physics.pause();
            this.showPauseMenu();
        }
    }

    showPauseMenu() {
        this.pauseMenuElements = [];

        // Dark overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.85);
        overlay.fillRect(0, 0, 800, 600);
        overlay.setDepth(2000);
        this.pauseMenuElements.push(overlay);

        // Title
        const title = this.add
            .text(400, 150, "PAUSED", {
                fontSize: "64px",
                fill: "#ffffff",
                fontFamily: "Courier New",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(2001);
        this.pauseMenuElements.push(title);

        // Instructions
        const instructions = this.add
            .text(400, 250, "Press ESC or P to Resume", {
                fontSize: "20px",
                fill: "#cccccc",
                fontFamily: "Courier New",
            })
            .setOrigin(0.5)
            .setDepth(2001);
        this.pauseMenuElements.push(instructions);

        // Resume button
        const resumeBtn = this.add
            .text(400, 340, "RESUME", {
                fontSize: "28px",
                fill: "#00ff88",
                fontFamily: "Courier New",
                fontStyle: "bold",
                backgroundColor: "#1a1a2a",
                padding: { x: 30, y: 15 },
            })
            .setOrigin(0.5)
            .setDepth(2001)
            .setInteractive();

        resumeBtn.on("pointerover", () => {
            resumeBtn.setFill("#ffffff");
            this.input.setDefaultCursor("pointer");
            soundFX.play("hover");
        });

        resumeBtn.on("pointerout", () => {
            resumeBtn.setFill("#00ff88");
            this.input.setDefaultCursor("default");
        });

        resumeBtn.on("pointerdown", () => {
            soundFX.play("select");
            this.togglePause();
        });

        this.pauseMenuElements.push(resumeBtn);

        // Quit button
        const quitBtn = this.add
            .text(400, 420, "QUIT TO MENU", {
                fontSize: "24px",
                fill: "#ff6b6b",
                fontFamily: "Courier New",
                fontStyle: "bold",
                backgroundColor: "#1a1a2a",
                padding: { x: 20, y: 10 },
            })
            .setOrigin(0.5)
            .setDepth(2001)
            .setInteractive();

        quitBtn.on("pointerover", () => {
            quitBtn.setFill("#ffffff");
            this.input.setDefaultCursor("pointer");
            soundFX.play("hover");
        });

        quitBtn.on("pointerout", () => {
            quitBtn.setFill("#ff6b6b");
            this.input.setDefaultCursor("default");
        });

        quitBtn.on("pointerdown", () => {
            soundFX.play("select");
            this.quitToMenu();
        });

        this.pauseMenuElements.push(quitBtn);
    }

    hidePauseMenu() {
        if (this.pauseMenuElements) {
            this.pauseMenuElements.forEach((element) => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.pauseMenuElements = null;
        }
    }

    quitToMenu() {
        // Cleanup
        this.hidePauseMenu();
        if (this.wizardOrbs) {
            this.wizardOrbs.forEach((orb) => {
                if (orb && orb.destroy) orb.destroy();
            });
            this.wizardOrbs = [];
        }

        // Stop and destroy background music
        if (this.bgMusic) {
            this.bgMusic.stop();
            this.bgMusic.destroy();
            this.bgMusic = null;
        }

        // Clean up boss health bar
        this.uiSystem.destroyBossHealthBar();

        // Return to character select
        this.scene.start("CharacterSelectScene");
    }

    toggleStatsScreen() {
        // Don't allow during level up or pause
        if (this.paused && !this.statsScreenElements) return;

        if (this.statsScreenElements) {
            // Hide stats screen
            this.paused = false;
            this.physics.resume();
            this.hideStatsScreen();
        } else {
            // Show stats screen
            this.paused = true;
            this.physics.pause();
            this.showStatsScreen();
        }
    }

    showStatsScreen() {
        this.statsScreenElements = [];

        // Semi-transparent overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.85);
        overlay.fillRect(0, 0, 800, 600);
        overlay.setDepth(1000);
        this.statsScreenElements.push(overlay);

        // Title
        const title = this.add.text(400, 80, "STATS", {
            fontSize: "48px",
            fill: "#00ff88",
            fontFamily: "Courier New",
            fontStyle: "bold"
        }).setOrigin(0.5).setDepth(1001);
        this.statsScreenElements.push(title);

        // Stats display
        const statsY = 160;
        const lineHeight = 40;

        const stats = [
            { label: "Time Survived", value: `${Math.floor(this.survivalTime / 60)}m ${this.survivalTime % 60}s` },
            { label: "Damage Dealt", value: this.totalDamageDealt.toLocaleString() },
            { label: "Enemies Killed", value: this.enemiesKilled },
            { label: "Current Wave", value: this.waveSystem.getCurrentWave() },
            { label: "Score", value: this.score }
        ];

        stats.forEach((stat, index) => {
            const label = this.add.text(250, statsY + index * lineHeight, `${stat.label}:`, {
                fontSize: "24px",
                fill: "#ffffff",
                fontFamily: "Courier New"
            }).setOrigin(1, 0).setDepth(1001);

            const value = this.add.text(270, statsY + index * lineHeight, stat.value, {
                fontSize: "24px",
                fill: "#ffff00",
                fontFamily: "Courier New",
                fontStyle: "bold"
            }).setOrigin(0, 0).setDepth(1001);

            this.statsScreenElements.push(label, value);
        });

        // Upgrades section
        const upgradesY = statsY + stats.length * lineHeight + 40;
        const upgradesTitle = this.add.text(400, upgradesY, "UPGRADES TAKEN", {
            fontSize: "28px",
            fill: "#00ff88",
            fontFamily: "Courier New",
            fontStyle: "bold"
        }).setOrigin(0.5).setDepth(1001);
        this.statsScreenElements.push(upgradesTitle);

        // List upgrades (max 8 visible)
        const maxUpgrades = 8;
        const upgradesList = this.upgradesTaken.slice(-maxUpgrades);
        upgradesList.forEach((upgrade, index) => {
            const upgradeText = this.add.text(400, upgradesY + 40 + index * 28, `• ${upgrade}`, {
                fontSize: "20px",
                fill: "#ffffff",
                fontFamily: "Courier New"
            }).setOrigin(0.5).setDepth(1001);
            this.statsScreenElements.push(upgradeText);
        });

        // Close instruction
        const closeText = this.add.text(400, 540, "Press ESC to close", {
            fontSize: "20px",
            fill: "#888888",
            fontFamily: "Courier New",
            fontStyle: "italic"
        }).setOrigin(0.5).setDepth(1001);
        this.statsScreenElements.push(closeText);
    }

    hideStatsScreen() {
        if (this.statsScreenElements) {
            this.statsScreenElements.forEach((element) => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.statsScreenElements = null;
        }
    }

    /**
     * Start a new wave
     * Resets timers and delegates to WaveSystem
     * @returns {void}
     */
    startWave() {
        // Reset wave completion flag for new wave
        this.isWaveCompleting = false;

        // Reset shadow clone spawn timer for new wave
        if (this.player.element === 'shadow') {
            this.player.lastShadowCloneSpawnTime = this.time.now;
        }

        this.waveSystem.startWave({
            spawnBoss: () => this.enemySystem.spawnBoss(this.enemies),
            spawnEnemy: () => this.enemySystem.spawnEnemy(this.enemies),
            repositionHazards: this.hazards && this.hazards.length > 0 ? () => this.repositionHazards() : null,
        }, this.uiSystem);
    }

    updateStatusEffects(enemy, time, delta) {
        if (!enemy.statusEffects) return;

        const effects = enemy.statusEffects;

        // BURN - Damage over time
        if (effects.burn.active) {
            if (time - effects.burn.lastTick >= effects.burn.tickRate) {
                enemy.health -= effects.burn.damage;
                this.showDamageNumber(enemy.x, enemy.y, effects.burn.damage, 0xffa500);
                effects.burn.lastTick = time;

                // Wildfire (Flame upgrade) - burn spreads to nearby enemies
                if (this.player.hasWildfire) {
                    this.enemies.children.entries.forEach((nearbyEnemy) => {
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
                this.showDamageNumber(enemy.x, enemy.y, damage, 0xffa500);
                effects.poison.lastTick = time;
                effects.poison.stacks++; // Double on next tick

                // Spore Cloud (Nature upgrade) - poison spreads to nearby enemies
                if (this.player.hasSporeCloud) {
                    this.enemies.children.entries.forEach((nearbyEnemy) => {
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
                    this.showDamageNumber(enemy.x, enemy.y, staticDamage, 0xffa500);
                    effects.paralyze.lastDamageTick = time;
                }
            }

            effects.paralyze.duration -= delta;
            if (effects.paralyze.duration <= 0) {
                effects.paralyze.active = false;
                // Restore alpha when paralyze ends
                if (enemy.active) {
                    enemy.setAlpha(1);
                }
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

        // BLIND - Reduced accuracy (visual indicator)
        if (effects.blind.active) {
            effects.blind.duration -= delta;
            if (effects.blind.duration <= 0) {
                effects.blind.active = false;
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
            this.killEnemy(enemy);
        }
    }

    /**
     * Spawn environmental hazards based on current season
     * Creates 5 hazards with season-specific properties and visuals
     * @returns {void}
     */
    spawnHazards() {
        const season = gameState.currentSeason;
        const hazardCount = 5;

        // Cleanup existing hazards from previous run
        if (this.hazards && this.hazards.length > 0) {
            this.hazards.forEach(hazard => {
                if (hazard && hazard.destroy) {
                    hazard.destroy();
                }
            });
            this.hazards = [];
        }

        for (let i = 0; i < hazardCount; i++) {
            const hazard = this.add.graphics();
            hazard.x = Phaser.Math.Between(100, 700);
            hazard.y = Phaser.Math.Between(100, 500);

            // Different hazards per season
            if (season === "spring") {
                // Thorny bushes (2x size for Spring)
                hazard.fillStyle(0x2d5016, 1);
                hazard.fillCircle(0, 0, 40); // Doubled from 20
                hazard.fillStyle(0xff0000, 1);
                for (let j = 0; j < 8; j++) {
                    const angle = (j / 8) * Math.PI * 2;
                    hazard.fillTriangle(
                        Math.cos(angle) * 30, // Doubled from 15
                        Math.sin(angle) * 30, // Doubled from 15
                        Math.cos(angle) * 50 - 3, // Doubled from 25
                        Math.sin(angle) * 50, // Doubled from 25
                        Math.cos(angle) * 50 + 3, // Doubled from 25
                        Math.sin(angle) * 50, // Doubled from 25
                    );
                }
                hazard.damageType = "thorns";
            } else if (season === "summer") {
                // Fire pits
                hazard.fillStyle(0xff4500, 0.7);
                hazard.fillCircle(0, 0, 25);
                hazard.fillStyle(0xff0000, 1);
                hazard.fillCircle(0, 0, 15);
                hazard.fillStyle(0xffd700, 1);
                hazard.fillCircle(0, -5, 8);
                hazard.damageType = "fire";

                // Animate fire
                this.tweens.add({
                    targets: hazard,
                    alpha: { from: 0.7, to: 1 },
                    scale: { from: 0.95, to: 1.05 },
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                });
            } else if (season === "fall") {
                // Poison mushrooms
                hazard.fillStyle(0x8b008b, 1);
                hazard.fillCircle(0, 5, 18);
                hazard.fillStyle(0xffffff, 1);
                hazard.fillCircle(-5, 0, 5);
                hazard.fillCircle(5, 5, 4);
                hazard.fillStyle(0x654321, 1);
                hazard.fillRect(-5, 10, 10, 8);
                hazard.damageType = "poison";
            } else if (season === "winter") {
                // Ice spikes
                hazard.fillStyle(0x0047ab, 0.8); // Deep blue
                hazard.fillTriangle(0, -20, -15, 15, 15, 15);
                hazard.fillStyle(0x4169e1, 1); // Royal blue highlight
                hazard.fillTriangle(0, -18, -8, 10, 8, 10);
                hazard.damageType = "ice";
            }

            this.physics.add.existing(hazard);
            // Spring hazards have 2x physics body size
            hazard.body.setCircle(season === "spring" ? 40 : 20);
            hazard.body.immovable = true;
            hazard.setDepth(5); // Below player but above background
            hazard.lastDamageTime = 0;

            // Spawn delay: 3 seconds before hazard becomes active
            hazard.spawnTime = this.time.now;
            hazard.canDamage = false;
            hazard.setAlpha(0.3); // Semi-transparent during spawn

            // Animate to full opacity over 3 seconds
            this.tweens.add({
                targets: hazard,
                alpha: 1,
                duration: 3000,
                onComplete: () => {
                    hazard.canDamage = true;
                }
            });

            this.hazards.push(hazard);
        }
    }

    repositionHazards() {
        // Move all hazards to new random positions each wave
        this.hazards.forEach((hazard) => {
            if (hazard && hazard.active) {
                hazard.x = Phaser.Math.Between(100, 700);
                hazard.y = Phaser.Math.Between(100, 500);

                // Reset spawn delay when repositioning
                hazard.spawnTime = this.time.now;
                hazard.canDamage = false;
                hazard.setAlpha(0.3); // Semi-transparent during spawn

                // Animate to full opacity over 3 seconds
                this.tweens.add({
                    targets: hazard,
                    alpha: 1,
                    duration: 3000,
                    onComplete: () => {
                        hazard.canDamage = true;
                    }
                });
            }
        });
    }

    // spawnBoss, spawnEnemy, killEnemy, bossLaserAttack, tankLaserAttack,
    // fireBossLaser, bomberExplode, spawnXPOrb methods moved to EnemySystem

    // Wrapper methods call EnemySystem for modularity


    // Drawing methods moved to src/utils/DrawingHelpers.js
    // drawSlime, drawGoblin, drawTank, drawBomber

    /**
     * Main game loop - called every frame by Phaser
     * Handles player movement, attacks, enemy AI, collision, and UI updates
     * @param {number} time - Current time in milliseconds
     * @param {number} delta - Time since last frame in milliseconds
     * @returns {void}
     */
    update(time, delta) {
        if (this.paused) return;

        // Guard against missing player or body
        if (!this.player || !this.player.body) return;

        // Player movement
        this.player.body.setVelocity(0);

        let moveX = 0;
        let moveY = 0;

        // Keyboard controls
        if (this.cursors.left.isDown || this.aKey.isDown)
            moveX = -1;
        if (this.cursors.right.isDown || this.dKey.isDown)
            moveX = 1;
        if (this.cursors.up.isDown || this.wKey.isDown) moveY = -1;
        if (this.cursors.down.isDown || this.sKey.isDown) moveY = 1;

        // Touch controls (override keyboard if active)
        if (this.touchControls.active) {
            moveX = this.touchControls.x;
            moveY = this.touchControls.y;
        }

        // Normalize diagonal movement (only if using keyboard)
        if (
            !this.touchControls.active &&
            moveX !== 0 &&
            moveY !== 0
        ) {
            moveX *= 0.707;
            moveY *= 0.707;
        }

        // Check for ice patches (winter season - slippery effect)
        let isOnIce = false;
        if (this.icePatches) {
            this.icePatches.forEach((ice) => {
                const dist = Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    ice.x,
                    ice.y,
                );
                if (dist < 40) {
                    isOnIce = true;
                }
            });
        }

        // Apply movement with ice slipperiness
        if (isOnIce) {
            // Ice makes player slide more (increased speed but less control)
            this.player.body.setVelocity(
                moveX * this.player.speed * 2.0, // 100% faster
                moveY * this.player.speed * 2.0,
            );
            // Add slight momentum/slide effect
            this.player.body.setDrag(50); // Lower drag = more sliding
        } else {
            this.player.body.setVelocity(
                moveX * this.player.speed,
                moveY * this.player.speed,
            );
            this.player.body.setDrag(500); // Normal drag
        }

        // Update falling leaves (fall season)
        if (this.fallingLeaves) {
            this.fallingLeaves.forEach((leaf) => {
                // Drift downward
                leaf.y += (leaf.floatSpeed * delta) / 1000;
                leaf.x += (leaf.driftSpeed * delta) / 1000;

                // Gentle rotation
                leaf.rotation += delta / 1000;

                // Wrap around screen
                if (leaf.y > 650) {
                    leaf.y = -50;
                    leaf.x = Phaser.Math.Between(0, 800);
                }
                if (leaf.x < -50) leaf.x = 850;
                if (leaf.x > 850) leaf.x = -50;
            });
        }

        // Store movement direction for element-specific attacks
        if (!this.player.lastMoveX) this.player.lastMoveX = 0;
        if (!this.player.lastMoveY) this.player.lastMoveY = 0;
        if (moveX !== 0 || moveY !== 0) {
            this.player.lastMoveX = moveX;
            this.player.lastMoveY = moveY;
        }

        // Update combo text position to follow player
        if (this.comboText && this.comboText.active) {
            this.comboText.setPosition(this.player.x, this.player.y - 40);
        }

        // Element-specific attacks replace orbs
        if (this.player.element === 'flame') {
            this.updateFlamethrowerAttack(moveX, moveY, time);
        } else if (this.player.element === 'water') {
            this.updateWaterBulletsAttack(time);
        } else if (this.player.element === 'electric') {
            this.updateChainLightningAttack(time);
        } else if (this.player.element === 'nature') {
            this.updateSeedPlanting(moveX, moveY, time);
            this.updateSeedExplosions(time);
        } else if (this.player.element === 'wind') {
            this.updateWindBoomerangAttack(time);
        } else if (this.player.element === 'terra') {
            this.updateTerrainWalls(moveX, moveY, time);
        } else if (this.player.element === 'radiant') {
            this.updateRadiantBeamAttack(time);
        } else if (this.player.element === 'shadow') {
            this.updateShadowClones(time, delta);
        } else {
            // Default orb attacks for celestial and gravity
            this.updateWizardOrbs();
        }

        // Regeneration upgrade (Nature) - heal over time (1% max HP every 10 seconds)
        if (this.player.hasRegeneration) {
            if (!this.player.lastRegenTime) this.player.lastRegenTime = time - 10000; // Allow immediate first heal
            if (time - this.player.lastRegenTime >= 10000) {
                const healAmount = Math.ceil(this.player.maxHealth * 0.01); // 1% of max HP
                this.player.health = Math.min(
                    this.player.maxHealth,
                    this.player.health + healAmount
                );

                // Show green healing number
                this.showDamageNumber(this.player.x, this.player.y, healAmount, 0x00ff88);

                this.uiSystem.updateHealthBar(this.player);
                this.player.lastRegenTime = time;
            }
        }

        // Update enemies
        this.enemies.children.entries.forEach((enemy) => {
            if (!enemy.active || !enemy.body) return;

            // Update boss health bar if boss exists
            if (enemy.isBoss) {
                this.uiSystem.updateBossHealthBar(enemy);

                // Boss laser attack every 3 seconds (but only after 5 seconds from spawn)
                if (!enemy.lastLaserTime) enemy.lastLaserTime = 0;
                const timeSinceSpawn = time - enemy.spawnTime;
                if (
                    enemy.health > 0 &&
                    timeSinceSpawn >= 5000 &&
                    time - enemy.lastLaserTime > 3000 &&
                    !this.paused
                ) {
                    enemy.lastLaserTime = time;
                    this.bossLaserAttack(enemy);
                }
            }

            // Special behavior for Bomber (teleporting)
            if (enemy.isBomber) {
                const dist = Phaser.Math.Distance.Between(
                    enemy.x,
                    enemy.y,
                    this.player.x,
                    this.player.y,
                );

                // Teleport closer if far away (cooldown: 3 seconds)
                if (
                    dist > 200 &&
                    time - enemy.teleportCooldown > 3000 &&
                    !this.paused
                ) {
                    // Double-check pause state before executing teleport
                    if (!this.paused) {
                        enemy.teleportCooldown = time;

                        // Teleport effect at old position
                        createTeleportEffect(this, enemy.x, enemy.y);
                        soundFX.play("xpCollect"); // Use existing sound

                        // Teleport near player
                        const angle = Math.random() * Math.PI * 2;
                        enemy.x = this.player.x + Math.cos(angle) * 100;
                        enemy.y = this.player.y + Math.sin(angle) * 100;

                        // Teleport effect at new position
                        createTeleportEffect(this, enemy.x, enemy.y);
                    }
                }

                // Explode when close to player (and low HP)
                if (
                    dist < 50 &&
                    enemy.health < enemy.maxHealth * 0.3
                ) {
                    this.bomberExplode(enemy);
                    return;
                }
            }

            // Special behavior for Tank (laser attack)
            if (enemy.isTank) {
                if (!enemy.lastTankLaser) enemy.lastTankLaser = 0;
                if (
                    time - enemy.lastTankLaser > 4000 &&
                    !this.paused
                ) {
                    enemy.lastTankLaser = time;
                    this.enemySystem.tankLaserAttack(enemy, this.tankLasers);
                }
            }

            // Update status effects
            this.updateStatusEffects(enemy, time, delta);

            // Create visual effects for active status conditions (throttled to every 5 frames for performance)
            if (this.game.loop.frame % 5 === 0) {
                createStatusEffectVisuals(this, enemy, time);
            }

            // Check if enemy can move (not frozen, paralyzed, or sleeping)
            const canMove = enemy.statusEffects &&
                           !enemy.statusEffects.freeze.active &&
                           !enemy.statusEffects.paralyze.active &&
                           !enemy.statusEffects.sleep.active;

            if (canMove) {
                // Move towards player, away if feared, or randomly if confused
                let angle;

                if (enemy.statusEffects.confusion.active) {
                    // Confused enemies move randomly
                    if (!enemy.randomMove || enemy.randomMove.time <= 0) {
                        enemy.randomMove = {
                            x: Math.random() * 2 - 1,
                            y: Math.random() * 2 - 1,
                            time: 500,
                        };
                    }
                    enemy.randomMove.time -= delta;
                    // Safety check: enemy might have been killed by Chain Lightning or Event Horizon
                    if (enemy.body) {
                        enemy.body.setVelocity(
                            enemy.randomMove.x * enemy.speed,
                            enemy.randomMove.y * enemy.speed,
                        );
                    }

                    // Event Horizon (Gravity upgrade) - confused enemies damage each other
                    if (this.player.hasEventHorizon) {
                        if (!enemy.lastConfusionDamageTime) enemy.lastConfusionDamageTime = time - 1000; // Allow immediate first damage
                        if (time - enemy.lastConfusionDamageTime >= 1000) {
                            this.enemies.children.entries.forEach((otherEnemy) => {
                                if (otherEnemy === enemy || !otherEnemy.active) return;
                                const dist = Phaser.Math.Distance.Between(
                                    enemy.x, enemy.y,
                                    otherEnemy.x, otherEnemy.y
                                );
                                if (dist < 50) {
                                    const confusionDamage = 3;
                                    otherEnemy.health -= confusionDamage;
                                    this.showDamageNumber(otherEnemy.x, otherEnemy.y, confusionDamage, 0x9933ff);
                                    if (otherEnemy.health <= 0) {
                                        this.killEnemy(otherEnemy);
                                    }
                                }
                            });
                            enemy.lastConfusionDamageTime = time;
                        }
                    }
                } else {
                    // Optimize: Only recalculate AI direction every 3 frames for performance
                    if (!enemy.cachedVelocity || this.game.loop.frame % 3 === 0) {
                        angle = Phaser.Math.Angle.Between(
                            enemy.x,
                            enemy.y,
                            this.player.x,
                            this.player.y,
                        );

                        // Fear makes enemies run away
                        if (enemy.statusEffects.fear.active) {
                            angle += Math.PI; // Reverse direction
                        }

                        // Cache velocity calculation
                        enemy.cachedVelocity = {
                            x: Math.cos(angle) * enemy.speed,
                            y: Math.sin(angle) * enemy.speed
                        };
                    }

                    // Safety check: enemy might have been killed by Chain Lightning or Event Horizon
                    if (enemy.body && enemy.cachedVelocity) {
                        enemy.body.setVelocity(
                            enemy.cachedVelocity.x,
                            enemy.cachedVelocity.y
                        );
                    }
                }
            } else {
                // Stop movement if stunned
                // Safety check: enemy might have been killed by Chain Lightning or Event Horizon
                if (enemy.body) {
                    enemy.body.setVelocity(0, 0);
                }
            }
        });

        // Update projectiles (return to pool if off-screen)
        this.projectiles.children.entries.forEach((proj) => {
            if (!proj || !proj.active) return;

            if (
                proj.x < -50 ||
                proj.x > 850 ||
                proj.y < -50 ||
                proj.y > 650
            ) {
                // Return to pool instead of destroying
                proj.setActive(false);
                proj.setVisible(false);
            }
        });

        // Update damage numbers
        this.damageNumbers = this.damageNumbers.filter(
            (dn) => dn.text.active,
        );

        // Handle invulnerability
        if (this.player.invulnerable) {
            this.player.invulnerableTime -= delta;
            if (this.player.invulnerableTime <= 0) {
                this.player.invulnerable = false;
                this.player.setAlpha(1);
                // Remove glow effect
                if (this.player.invulnerabilityGlow) {
                    this.player.invulnerabilityGlow.destroy();
                    this.player.invulnerabilityGlow = null;
                }
            } else {
                // Flicker effect
                this.player.setAlpha(
                    Math.floor(time / 100) % 2 === 0 ? 0.5 : 1,
                );

                // Pulsing glow effect (create on first frame)
                if (!this.player.invulnerabilityGlow) {
                    this.player.invulnerabilityGlow = this.add.graphics();
                    this.player.invulnerabilityGlow.setDepth(9); // Behind player (depth 10)
                }

                // Update glow position and pulse
                const glowColor = this.player.element ? ELEMENTS[this.player.element].color : 0xffffff;
                const pulseScale = 0.8 + Math.sin(time / 150) * 0.2; // Pulse between 0.6 and 1.0
                const glowRadius = 20 * pulseScale * this.mobileScale;
                const glowAlpha = 0.3 + Math.sin(time / 150) * 0.2; // Pulse alpha between 0.1 and 0.5

                this.player.invulnerabilityGlow.clear();
                this.player.invulnerabilityGlow.fillStyle(glowColor, glowAlpha);
                this.player.invulnerabilityGlow.fillCircle(this.player.x, this.player.y, glowRadius);
            }
        }

        // Check wave completion
        const totalEnemiesForWave = this.waveSystem.getIsBossWave()
            ? 4
            : this.waveSystem.getEnemiesThisWave(); // Boss + 3 enemies = 4, or just regular enemies
        const waveEnemiesSpawned = this.waveSystem.getIsBossWave()
            ? this.waveSystem.getEnemiesSpawned() + 1
            : this.waveSystem.getEnemiesSpawned(); // +1 for boss if boss wave

        if (
            !this.isWaveCompleting &&
            waveEnemiesSpawned >= totalEnemiesForWave &&
            this.waveSystem.getEnemiesAlive() === 0
        ) {
            this.isWaveCompleting = true;
            this.completeWave();
        }

        // Check hazard collisions
        this.hazards.forEach((hazard) => {
            if (!hazard.active) return;

            const dist = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                hazard.x,
                hazard.y,
            );

            // Only deal damage after 3-second spawn delay (and player not leveling up)
            if (dist < 35 && hazard.canDamage && time - hazard.lastDamageTime > 1000 && !this.player.isLevelingUp) {
                hazard.lastDamageTime = time;
                // Spring hazards deal 2x damage (12), other seasons deal 6
                let damage = hazard.damageType === "thorns" ? 12 : 6;

                // Apply damage reduction
                if (this.player.damageReduction) {
                    damage = Math.floor(damage * (1 - this.player.damageReduction));
                    damage = Math.max(1, damage); // At least 1 damage
                }

                this.player.health -= damage;
                this.uiSystem.updateHealthBar(this.player);
                this.showDamageNumber(
                    this.player.x,
                    this.player.y,
                    damage,
                );
                soundFX.play("playerHit");

                // Flash hazard
                hazard.setAlpha(0.5);
                this.time.delayedCall(100, () => {
                    if (hazard.active) hazard.setAlpha(1);
                });

                // Check death
                if (this.player.health <= 0) {
                    this.gameOver();
                }
            }
        });
    }

    autoAttack() {
        // Find nearest enemy
        let nearestEnemy = null;
        let nearestDist = 999999;

        this.enemies.children.entries.forEach((enemy) => {
            if (!enemy.active) return;
            const dist = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                enemy.x,
                enemy.y,
            );
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestEnemy = enemy;
            }
        });

        if (nearestEnemy) {
            this.shootProjectile(nearestEnemy);
        }
    }

    shootArrowTowardsMouse() {
        // Get mouse position in world coordinates (accounting for camera)
        const pointer = this.input.activePointer;
        const worldX = pointer.worldX;
        const worldY = pointer.worldY;

        const projectile = this.add.graphics();
        projectile.x = this.player.x;
        projectile.y = this.player.y;

        // Draw arrow pointing upward initially
        projectile.fillStyle(0x8b4513, 1); // Brown shaft
        projectile.fillRect(-1, -6, 2, 12);

        projectile.fillStyle(0xc0c0c0, 1); // Silver arrowhead
        projectile.fillTriangle(0, -8, -3, -4, 3, -4);

        projectile.fillStyle(0xff0000, 1); // Red fletching
        projectile.fillTriangle(-2, 6, 0, 4, 2, 6);

        this.physics.add.existing(projectile);
        projectile.body.setSize(6, 12);
        projectile.damage = this.player.damage;

        // Calculate angle from player to mouse cursor
        const angle = Phaser.Math.Angle.Between(
            this.player.x,
            this.player.y,
            worldX,
            worldY,
        );

        const speed = 450; // Fast arrow speed for ranged combat
        projectile.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
        );

        // Rotate arrow to point in direction of travel
        projectile.setRotation(angle + Math.PI / 2); // +90 degrees because arrow drawn pointing up
        projectile.setDepth(10);

        this.projectiles.add(projectile);

        // Play shoot sound
        soundFX.play("shoot");

        // Auto-return to pool after 3 seconds or when off-screen
        this.time.delayedCall(3000, () => {
            if (projectile.active) {
                projectile.setActive(false);
                projectile.setVisible(false);
            }
        });
    }

    shootArrowOppositeMovement(moveX, moveY) {
        const projectile = this.add.graphics();
        projectile.x = this.player.x;
        projectile.y = this.player.y;

        // Draw arrow pointing upward initially
        projectile.fillStyle(0x8b4513, 1); // Brown shaft
        projectile.fillRect(-1, -6, 2, 12);

        projectile.fillStyle(0xc0c0c0, 1); // Silver arrowhead
        projectile.fillTriangle(0, -8, -3, -4, 3, -4);

        projectile.fillStyle(0xff0000, 1); // Red fletching
        projectile.fillTriangle(-2, 6, 0, 4, 2, 6);

        this.physics.add.existing(projectile);
        projectile.body.setSize(6, 12);
        projectile.damage = this.player.damage;

        // Calculate angle OPPOSITE to movement direction
        // Invert moveX and moveY to shoot backwards
        const angle = Math.atan2(-moveY, -moveX);

        const speed = 450; // Fast arrow speed for ranged combat
        projectile.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
        );

        // Rotate arrow to point in direction of travel
        projectile.setRotation(angle + Math.PI / 2); // +90 degrees because arrow drawn pointing up
        projectile.setDepth(10);

        this.projectiles.add(projectile);

        // Play shoot sound
        soundFX.play("shoot");

        // Auto-return to pool after 3 seconds or when off-screen
        this.time.delayedCall(3000, () => {
            if (projectile.active) {
                projectile.setActive(false);
                projectile.setVisible(false);
            }
        });
    }

    shootProjectile(target) {
        const projectile = this.add.graphics();
        projectile.x = this.player.x;
        projectile.y = this.player.y;

        // Warrior throws axes
        projectile.fillStyle(0xc0c0c0, 1);
        projectile.fillRect(-3, -2, 6, 4);
        projectile.fillStyle(0x8b4513, 1);
        projectile.fillRect(-1, 2, 2, 4);

        this.physics.add.existing(projectile);
        projectile.body.setSize(8, 8);
        projectile.damage = this.player.damage;

        // Shoot towards target
        const angle = Phaser.Math.Angle.Between(
            projectile.x,
            projectile.y,
            target.x,
            target.y,
        );

        const speed = 300;
        projectile.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
        );

        // Rotate projectile
        projectile.setRotation(angle);
        projectile.setDepth(10); // Behind UI

        this.projectiles.add(projectile);

        // Play shoot sound
        soundFX.play("shoot");

        // Auto-return to pool after 2 seconds
        this.time.delayedCall(2000, () => {
            if (projectile.active) {
                projectile.setActive(false);
                projectile.setVisible(false);
            }
        });
    }

    projectileHitEnemy(projectile, enemy) {
        if (!projectile.active || !enemy.active) return;

        // Prevent multiple hits from same projectile (except for piercing bullets)
        if (projectile.hasHit && !projectile.canPierce) return;

        // Mark hit if not piercing, or if first hit for piercing
        if (!projectile.canPierce) {
            projectile.hasHit = true;
        }

        // Deal damage (Tanks take reduced damage)
        let damage = projectile.damage;
        if (enemy.isTank) {
            damage = Math.floor(damage * 0.5); // Tanks take 50% less damage
        }

        // Apply damage with crit check and lifesteal
        this.applyDamage(enemy, damage);

        // Play hit sound
        soundFX.play("hit");

        // Enhanced hit effect - flash enemy white and create impact particles
        enemy.setAlpha(0.5);
        this.time.delayedCall(50, () => {
            if (enemy.active) enemy.setAlpha(1);
        });

        // Impact particles
        for (let i = 0; i < 5; i++) {
            const particle = this.add.graphics();
            particle.x = projectile.x;
            particle.y = projectile.y;
            particle.fillStyle(0xffff00, 1);
            particle.fillCircle(0, 0, 2);
            particle.setDepth(50);

            const angle = Math.random() * Math.PI * 2;
            this.tweens.add({
                targets: particle,
                x: projectile.x + Math.cos(angle) * 20,
                y: projectile.y + Math.sin(angle) * 20,
                alpha: 0,
                duration: 200,
                onComplete: () => particle.destroy(),
            });
        }

        // Return projectile to pool
        projectile.setActive(false);
        projectile.setVisible(false);

        // Check if enemy died
        if (enemy.health <= 0) {
            this.killEnemy(enemy);
        }
    }

    /**
     * Kill an enemy - wrapper method that delegates to EnemySystem
     * Handles XP orb spawning and score updates
     * @param {import('../types/game-types.js').Enemy} enemy - Enemy to kill
     * @returns {void}
     */
    killEnemy(enemy) {
        // Track enemies killed
        this.enemiesKilled++;

        // Combo system: check if kill is within time window
        const currentTime = this.time.now;
        if (currentTime - this.lastKillTime <= this.comboTimeWindow) {
            this.comboCount++;
        } else {
            this.comboCount = 1; // Start new combo
        }
        this.lastKillTime = currentTime;

        // Calculate combo multiplier (linear: combo 5 = 1.5x, combo 10 = 2x)
        const comboMultiplier = 1 + (this.comboCount * 0.1);

        // Update combo UI
        this.updateComboDisplay();

        // Play milestone sound effects
        if (this.comboCount === 5 || this.comboCount === 10 || this.comboCount === 25) {
            soundFX.play("levelUp"); // Use level up sound for milestones
        }

        // Wrapper method that delegates to EnemySystem
        this.enemySystem.killEnemy(
            enemy,
            (x, y, value) => {
                // Apply combo multiplier to XP
                const bonusXP = Math.floor(value * comboMultiplier);
                this.spawnXPOrb(x, y, bonusXP);
            },
            (scoreValue) => {
                // Apply combo multiplier to score
                const bonusScore = Math.floor(scoreValue * comboMultiplier);
                this.score += bonusScore;
                this.uiSystem.updateScore(this.score);
            }
        );
    }


    /**
     * Update combo display above player
     * Shows combo count with flash effect
     * @returns {void}
     */
    updateComboDisplay() {
        // Remove old combo text if exists
        if (this.comboText) {
            this.comboText.destroy();
        }

        // Only show combo if 2 or more
        if (this.comboCount >= 2) {
            // Calculate size: half the player sprite size (player is 30px radius, so 15px for combo)
            const fontSize = 15;

            // Create combo text above player
            this.comboText = this.add.text(
                this.player.x,
                this.player.y - 40,
                `${this.comboCount}x COMBO`,
                {
                    fontSize: `${fontSize}px`,
                    fill: "#ffff00",
                    fontFamily: "Courier New",
                    fontStyle: "bold",
                    stroke: "#000000",
                    strokeThickness: 2,
                }
            ).setOrigin(0.5).setDepth(1002);

            // Flash effect when combo increases
            this.tweens.add({
                targets: this.comboText,
                scale: { from: 1.5, to: 1 },
                duration: 200,
                ease: 'Back.out'
            });

            // Change color based on combo milestones
            if (this.comboCount >= 25) {
                this.comboText.setFill("#ff00ff"); // Purple for 25+
            } else if (this.comboCount >= 10) {
                this.comboText.setFill("#ff0000"); // Red for 10+
            } else if (this.comboCount >= 5) {
                this.comboText.setFill("#ff8800"); // Orange for 5+
            }
        }
    }

    /**
     * Reset combo counter (called when player takes damage)
     * @returns {void}
     */
    resetCombo() {
        this.comboCount = 0;
        this.lastKillTime = 0;

        if (this.comboText) {
            // Flash red and fade out
            this.tweens.add({
                targets: this.comboText,
                alpha: 0,
                scale: 1.5,
                tint: 0xff0000,
                duration: 300,
                onComplete: () => {
                    if (this.comboText) {
                        this.comboText.destroy();
                        this.comboText = null;
                    }
                }
            });
        }
    }

    bossLaserAttack(boss) {
        // Wrapper method that delegates to EnemySystem
        this.enemySystem.bossLaserAttack(
            boss,
            () => this.gameOver(),
            (x, y, dmg, color) => this.showDamageNumber(x, y, dmg, color)
        );
    }

    tankLaserAttack(tank) {
        // Wrapper method - already called with tankLasers group from call site
        // No need to do anything here as the call site handles it
    }

    bomberExplode(enemy) {
        // Wrapper method that delegates to EnemySystem
        this.enemySystem.bomberExplode(
            enemy,
            this.enemies,
            () => this.gameOver(),
            (x, y, dmg, color) => this.showDamageNumber(x, y, dmg, color),
            (en) => this.killEnemy(en),
            (x, y, val) => this.spawnXPOrb(x, y, val),
            (score) => {
                this.score += score;
                this.uiSystem.updateScore(this.score);
            }
        );
    }

    /**
     * Spawn an XP orb at a position - wrapper method
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} value - XP value
     * @returns {void}
     */
    spawnXPOrb(x, y, value) {
        // Wrapper method that delegates to EnemySystem
        this.enemySystem.spawnXPOrb(
            x,
            y,
            value,
            this.xpOrbs,
            this.collectXP.bind(this)
        );
    }

    collectXP(player, orb) {
        if (!orb.active) return;

        // Add XP
        this.player.xp += orb.xpValue;

        // Check for level up
        if (this.player.xp >= this.player.xpToNext) {
            this.levelUp();
        }

        this.uiSystem.updateXPBar(this.player);

        // Play collect sound
        soundFX.play("xpCollect");

        // Destroy orb
        orb.destroy();
    }

    tankLaserHitPlayer(player, laser) {
        // Check if player is invulnerable or leveling up
        if (!laser.active || this.player.invulnerable || this.player.isLevelingUp) return;

        // Apply damage
        let damage = laser.damage || 15;

        // Apply damage reduction
        if (this.player.damageReduction) {
            damage = Math.floor(damage * (1 - this.player.damageReduction));
            damage = Math.max(1, damage); // At least 1 damage
        }

        this.player.health -= damage;
        this.uiSystem.updateHealthBar(this.player);

        // Show damage number
        this.showDamageNumber(this.player.x, this.player.y, damage);

        // Play hit sound
        soundFX.play("playerHit");

        // Grant invulnerability frames
        this.player.invulnerable = true;
        this.time.delayedCall(500, () => {
            this.player.invulnerable = false;
        });

        // Knockback effect
        if (this.player.body) {
            const angle = Phaser.Math.Angle.Between(
                laser.x,
                laser.y,
                this.player.x,
                this.player.y,
            );
            this.player.body.setVelocity(
                Math.cos(angle) * 200,
                Math.sin(angle) * 200,
            );
        }

        // Camera shake
        this.cameras.main.shake(100, 0.005);

        // Destroy laser
        laser.destroy();

        // Check for game over
        if (this.player.health <= 0) {
            this.gameOver();
        }
    }

    levelUp() {
        this.player.level++;

        // Track level reached for achievements
        gameState.levelReached = this.player.level;

        this.player.xp -= this.player.xpToNext;
        this.player.xpToNext = Math.floor(
            this.player.xpToNext * 1.5,
        );

        this.uiSystem.updateLevel(this.player.level);

        // Play level up sound
        soundFX.play("levelUp");

        // Level up effect (plays immediately)
        createLevelUpEffect(this, this.player);

        // Make player invincible during level up animation
        this.player.isLevelingUp = true;

        // Pause game AND physics
        this.paused = true;
        this.physics.pause();

        // Delay upgrade menu by 1.25 seconds to show particle effect
        this.time.delayedCall(1250, () => {
            // First level up = choose element, after that = upgrades
            if (this.player.level === 2 && !this.player.element) {
                this.upgradeSystem.showElementSelection({
                    drawWizard: () => drawWizard(this.player),
                    updateOrbColors: (color) => this.updateOrbColors(color),
                    removeOrbs: () => {
                        if (this.wizardOrbs) {
                            this.wizardOrbs.forEach(orb => {
                                if (orb && orb.destroy) orb.destroy();
                            });
                            this.wizardOrbs = [];
                        }
                    }
                });
            } else {
                this.upgradeSystem.showUpgradeMenu();
            }
        });
    }

    // Upgrade methods moved to UpgradeSystem.js

    /**
     * Apply damage to enemy with critical strike check and lifesteal
     * @param {Phaser.GameObjects.Graphics} enemy - Enemy to damage
     * @param {number} baseDamage - Base damage to deal
     * @param {number} [color=0xff0000] - Damage number color
     * @returns {number} Actual damage dealt (including crit)
     */
    applyDamage(enemy, baseDamage, color = 0xffffff) {
        let finalDamage = baseDamage;
        let isCrit = false;

        // Check for critical strike
        if (this.player.hasCriticalStrike && Math.random() < this.player.critChance) {
            finalDamage = Math.floor(baseDamage * this.player.critMultiplier);
            isCrit = true;
        }

        // Apply damage
        enemy.health -= finalDamage;

        // Show damage number with CRIT! text if critical
        if (isCrit) {
            this.showDamageNumber(enemy.x, enemy.y - 10, `CRIT! ${finalDamage}`, 0xffff00, true);

            // Create particle burst for critical strike
            for (let i = 0; i < 8; i++) {
                const particle = this.add.graphics();
                particle.x = enemy.x;
                particle.y = enemy.y;

                const colors = [0xffff00, 0xffa500, 0xff6347];
                const color = colors[i % colors.length];

                particle.fillStyle(color, 1);
                particle.fillCircle(0, 0, 3);
                particle.setDepth(50);

                const angle = (i / 8) * Math.PI * 2;
                const distance = Phaser.Math.Between(20, 35);

                this.tweens.add({
                    targets: particle,
                    x: enemy.x + Math.cos(angle) * distance,
                    y: enemy.y + Math.sin(angle) * distance,
                    alpha: 0,
                    scale: 0,
                    duration: 300,
                    onComplete: () => particle.destroy(),
                });
            }
        } else {
            this.showDamageNumber(enemy.x, enemy.y, finalDamage, color);
        }

        // Lifesteal for Shadow element
        if (this.player.element === 'shadow' && this.player.lifeStealPercent) {
            const healAmount = Math.floor(finalDamage * this.player.lifeStealPercent);
            if (healAmount > 0) {
                this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
                this.uiSystem.updateHealthBar(this.player);
                // Show green healing number
                this.showDamageNumber(this.player.x, this.player.y - 20, `+${healAmount}`, 0x00ff00);
            }
        }

        // Track total damage dealt
        this.totalDamageDealt += finalDamage;

        return finalDamage;
    }

    /**
     * Show floating damage number at a position
     * Creates animated text that fades out and floats upward
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number|string} damage - Damage amount to display (can be string for "CRIT! 50")
     * @param {number} [color=0xff0000] - Optional text color (default: red)
     * @param {boolean} [isCrit=false] - If true, makes text larger for critical strikes
     * @returns {void}
     */
    showDamageNumber(x, y, damage, color = 0xffffff, isCrit = false) {
        // Limit max damage numbers to 20 for performance
        const MAX_DAMAGE_NUMBERS = 20;
        if (this.damageNumbers.length >= MAX_DAMAGE_NUMBERS) {
            // Remove oldest damage number
            const oldest = this.damageNumbers.shift();
            if (oldest && oldest.text) {
                // Return to pool instead of destroying
                oldest.text.setActive(false);
                oldest.text.setVisible(false);
                this.damageNumberPool.push(oldest.text);
            }
        }

        // Scale font size for mobile (larger for crits)
        const baseFontSize = isCrit ? 28 : 20;
        const fontSize = Math.floor(baseFontSize * this.mobileScale);
        const strokeThickness = Math.floor((isCrit ? 4 : 3) * this.mobileScale);

        // Try to get text from pool first
        let text = this.damageNumberPool.pop();
        if (text) {
            // Reuse existing text object
            text.setText(damage.toString());
            text.setPosition(x, y - 20 * this.mobileScale);
            text.setAlpha(1);
            text.setActive(true);
            text.setVisible(true);
        } else {
            // Create new text object if pool is empty
            text = this.add
                .text(x, y - 20 * this.mobileScale, damage.toString(), {
                    fontSize: `${fontSize}px`,
                    fill: "#ff0000",
                    fontFamily: "Courier New",
                    fontStyle: "bold",
                    stroke: "#000000",
                    strokeThickness: strokeThickness,
                })
                .setOrigin(0.5);
        }

        this.damageNumbers.push({ text });

        this.tweens.add({
            targets: text,
            y: y - 50 * this.mobileScale,
            alpha: 0,
            duration: 800,
            onComplete: () => {
                // Return to pool instead of destroying
                text.setActive(false);
                text.setVisible(false);
                this.damageNumberPool.push(text);
            },
        });
    }

    playerHitEnemy(player, enemy) {
        if (!enemy.active || this.player.invulnerable || this.player.isLevelingUp) return;

        // Void Step (Celestial) - chance to dodge attacks
        if (this.player.dodgeChance && Math.random() < this.player.dodgeChance) {
            // Dodged! Show "DODGE" text
            const dodgeText = this.add.text(this.player.x, this.player.y - 30, "DODGE", {
                fontSize: "16px",
                fill: "#00ffff",
                fontFamily: "Courier New",
                fontStyle: "bold",
            }).setOrigin(0.5).setDepth(100);

            this.tweens.add({
                targets: dodgeText,
                y: this.player.y - 60,
                alpha: 0,
                duration: 800,
                onComplete: () => dodgeText.destroy(),
            });
            return; // No damage taken
        }

        // Umbral Shroud (Shadow) - enemies have reduced accuracy
        if (this.player.hasUmbralShroud && Math.random() < 0.15) {
            // Enemy missed! Show "MISS" text
            const missText = this.add.text(this.player.x, this.player.y - 30, "MISS", {
                fontSize: "16px",
                fill: "#9966cc",
                fontFamily: "Courier New",
                fontStyle: "bold",
            }).setOrigin(0.5).setDepth(100);

            this.tweens.add({
                targets: missText,
                y: this.player.y - 60,
                alpha: 0,
                duration: 800,
                onComplete: () => missText.destroy(),
            });
            return; // No damage taken
        }

        // Calculate damage (reduced by defense)
        let damage = Math.max(1, enemy.damage - this.player.defense);

        // Radiant Shield (Radiant) - reduce damage taken
        if (this.player.damageReduction) {
            damage = Math.floor(damage * (1 - this.player.damageReduction));
            damage = Math.max(1, damage); // At least 1 damage
        }

        this.player.health -= damage;
        this.uiSystem.updateHealthBar(this.player);

        // Track damage taken for Untouchable achievement
        gameState.damageTaken += damage;

        // Reset combo on taking damage
        this.resetCombo();

        // Thornmail (Nature) - reflect damage back to attacker with crit check and lifesteal
        if (this.player.thornmail) {
            const reflectDamage = Math.floor(damage * this.player.thornmail);
            this.applyDamage(enemy, reflectDamage, 0x32cd32); // Green damage for reflect

            if (enemy.health <= 0) {
                this.killEnemy(enemy);
            }
        }

        // Show damage on player
        this.showDamageNumber(this.player.x, this.player.y, damage);

        // Play player hit sound
        soundFX.play("playerHit");

        // Invulnerability frames
        this.player.invulnerable = true;
        this.player.invulnerableTime = 1000;

        // Knockback
        const angle = Phaser.Math.Angle.Between(
            enemy.x,
            enemy.y,
            this.player.x,
            this.player.y,
        );
        this.player.body.setVelocity(
            Math.cos(angle) * 200,
            Math.sin(angle) * 200,
        );

        // Camera shake
        this.cameras.main.shake(100, 0.005);

        // Check death
        if (this.player.health <= 0) {
            this.gameOver();
        }
    }

    completeWave() {
        // Track wave reached for achievements
        gameState.waveReached = this.currentWave;

        // Despawn shadow clones when wave ends
        if (this.shadowClones) {
            this.shadowClones.forEach((clone) => {
                if (clone && clone.destroy) {
                    clone.destroy();
                }
            });
            this.shadowClones = [];
        }

        // Despawn Terra walls when wave ends
        if (this.playerWalls && this.playerWalls.length > 0) {
            for (let i = this.playerWalls.length - 1; i >= 0; i--) {
                const wall = this.playerWalls[i];
                try {
                    if (wall.graphic && wall.graphic.destroy) {
                        wall.graphic.destroy();
                    }
                    if (wall.physicsBody) {
                        // Clear all children from the physics group before destroying
                        wall.physicsBody.clear(true, true);
                        if (wall.physicsBody.destroy) {
                            wall.physicsBody.destroy(true);
                        }
                    }
                } catch (e) {
                    // Silently catch cleanup errors
                    console.warn('Terra wall cleanup error:', e);
                }
            }
            this.playerWalls = [];
        }

        // Heal 25% of max HP on wave completion
        const healAmount = Math.floor(this.player.maxHealth * 0.25);
        this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
        this.uiSystem.updateHealthBar(this.player);
        // Show green healing number at player position
        this.showDamageNumber(this.player.x, this.player.y - 20, `+${healAmount}`, 0x00ff88);

        // Complete wave and auto-start next wave after 2 seconds
        this.waveSystem.completeWave();

        // NOTE: Players earn XP naturally from killing enemies
        // Level-ups happen independently when XP bar fills (pauses game immediately)
        // Next wave auto-starts regardless of level-up state
    }

    /**
     * Handle game over
     * Pauses game, stops music, saves stats, and transitions to game over scene
     * @returns {void}
     */
    gameOver() {
        this.paused = true;

        // Stop and destroy background music
        if (this.bgMusic) {
            this.bgMusic.stop();
            this.bgMusic.destroy();
            this.bgMusic = null;
        }

        // Cleanup wizard orbs if needed
        if (this.wizardOrbs) {
            this.wizardOrbs.forEach((orb) => {
                if (orb && orb.destroy) orb.destroy();
            });
            this.wizardOrbs = [];
        }

        // Cleanup hazards
        if (this.hazards) {
            this.hazards.forEach((hazard) => {
                if (hazard && hazard.destroy) hazard.destroy();
            });
            this.hazards = [];
        }

        // Update high score
        const finalScore = this.score + this.survivalTime * 10;
        if (finalScore > gameState.highScore) {
            gameState.highScore = finalScore;
        }

        // Save game stats
        gameState.currentLevel = this.player.level;
        gameState.totalXP = this.player.xp;
        gameState.enemiesKilled =
            this.waveSystem.getCurrentWave() * this.waveSystem.getEnemiesThisWave() - this.waveSystem.getEnemiesAlive();
        gameState.survivalTime = this.survivalTime;

        this.cameras.main.fade(1000, 0, 0, 0);
        this.time.delayedCall(1000, () => {
            this.scene.start("GameOverScene", {
                score: finalScore,
            });
        });
    }
}

// Game Over Scene

export { GameScene };
