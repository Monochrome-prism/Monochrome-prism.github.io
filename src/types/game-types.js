/**
 * Core Type Definitions for Magic Affinity
 *
 * This file defines all shared types used across the game.
 * Import these types in JSDoc comments with @typedef
 */

/**
 * @typedef {Object} Player
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} health - Current health
 * @property {number} maxHealth - Maximum health
 * @property {number} damage - Base damage
 * @property {number} speed - Movement speed
 * @property {number} defense - Damage reduction
 * @property {string|null} element - Selected element ('flame', 'water', etc.)
 * @property {number} level - Player level
 * @property {number} xp - Current XP
 * @property {number} xpToNext - XP needed for next level
 * @property {Array<string>} elementalUpgrades - Upgrades taken
 * @property {boolean} invulnerable - Invulnerability frame status
 * @property {number} invulnerableTime - Invuln duration remaining
 * @property {Phaser.Physics.Arcade.Body} body - Physics body
 *
 * @property {Object<string, number>} upgradeStacks - Tracks stacks for stackable percentage upgrades (v3.1.1+)
 *
 * @property {number} [orbCount] - Number of orbiting orbs (Gravity/Celestial elements)
 * @property {number} [orbSpeed] - Orb rotation speed multiplier
 * @property {number} [orbDistance] - Orb orbit radius
 * @property {boolean} [isGravityElement] - Is Gravity element (semi-random orbit)
 * @property {boolean} [isCelestialElement] - Is Celestial element (large fast orb)
 * @property {boolean} [isLevelingUp] - Is currently leveling up (invulnerable)
 *
 * @property {number} [lastActionTime] - Last attack/action timestamp
 *
 * @property {boolean} [hasCriticalStrike] - Has critical strike upgrade
 * @property {number} [critChance] - Critical strike chance (0-1)
 * @property {number} [critMultiplier] - Critical damage multiplier
 *
 * @property {number} [damageReduction] - Total damage reduction (0-1)
 * @property {number} [dodgeChance] - Chance to dodge attacks (0-1)
 * @property {number} [lifeSteal] - Flat HP heal per kill
 * @property {number} [lifeStealPercent] - Percent of damage dealt as healing (0-1)
 * @property {boolean} [hasRegeneration] - Has HP regeneration upgrade (1% max HP every 10s)
 * @property {number} [armorBoostCount] - Number of times Armor Boost upgrade taken (max 2)
 *
 * @property {number} [burnDamageBonus] - Bonus burn damage per tick (stackable)
 * @property {number} [burnDurationBonus] - Bonus burn duration in ms
 * @property {boolean} [hasWildfire] - Burn spreads to nearby enemies
 * @property {number} [moltenCore] - Damage multiplier vs burning enemies
 *
 * @property {number} [freezeChanceBonus] - Bonus freeze chance (0-1, stackable)
 * @property {number} [freezeDurationBonus] - Freeze duration multiplier
 * @property {number} [glacialShards] - Damage multiplier vs frozen enemies
 * @property {number} [waterStreamRangeBonus] - Water beam range multiplier (stackable)
 *
 * @property {boolean} [hasChainLightning] - Attacks jump to nearby enemies
 * @property {number} [paralyzeChanceBonus] - Bonus paralyze chance (0-1, stackable)
 * @property {boolean} [hasStaticField] - Paralyzed enemies take DOT
 * @property {number} [electricRangeBonus] - Electric attack range multiplier (stackable, Thor's Hammer upgrade)
 *
 * @property {number} [poisonDamageBonus] - Bonus poison starting damage
 * @property {number} [poisonProcChance] - Poison proc chance (base 30%, stackable with Toxicity)
 * @property {boolean} [hasSporeCloud] - Poison spreads to nearby enemies
 *
 * @property {number} [knockbackBonus] - Knockback distance multiplier
 * @property {number} [maxBoomerangs] - Max simultaneous boomerangs (base 1, stackable with Hurricane)
 *
 * @property {boolean} [hasEarthquake] - Terra knockback stuns enemies
 * @property {boolean} [hasTremor] - Terra knockback affects area
 *
 * @property {number} [slowBonus] - Bonus slow effectiveness (0-1, stackable)
 * @property {boolean} [hasDenseMatter] - Slow affects larger area
 * @property {boolean} [hasEventHorizon] - Confused enemies damage each other
 *
 * @property {number} [charmChanceBonus] - Bonus charm chance (0-1, stackable)
 * @property {number} [charmDurationBonus] - Bonus charm duration in ms
 *
 * @property {number} [blindChanceBonus] - Bonus blind chance (0-1, stackable)
 *
 * @property {number} [fearChanceBonus] - Bonus fear chance (0-1, stackable)
 * @property {boolean} [hasVoidClone] - Has second shadow clone
 * @property {boolean} [hasUmbralShroud] - Enemies have reduced accuracy
 */

/**
 * @typedef {Object} Enemy
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} health - Current health
 * @property {number} maxHealth - Maximum health
 * @property {number} speed - Movement speed
 * @property {number} damage - Attack damage
 * @property {number} xpValue - XP awarded on death
 * @property {number} scoreValue - Score awarded on death
 * @property {string} enemyType - Type: 'slime', 'goblin', 'tank', 'bomber', 'boss'
 * @property {boolean} isBoss - Is this a boss enemy
 * @property {StatusEffects} statusEffects - Active status effects
 * @property {Phaser.Physics.Arcade.Body} body - Physics body
 */

/**
 * @typedef {Object} StatusEffects
 * @property {StatusEffect} burn - Burn status
 * @property {StatusEffect} freeze - Freeze status
 * @property {StatusEffect} paralyze - Paralyze status
 * @property {StatusEffect} poison - Poison status
 * @property {StatusEffect} sleep - Sleep status
 * @property {StatusEffect} charm - Charm status
 * @property {StatusEffect} confusion - Confusion status
 * @property {StatusEffect} blind - Blind status
 * @property {StatusEffect} fear - Fear status
 * @property {StatusEffect} slow - Slow status
 */

/**
 * @typedef {Object} StatusEffect
 * @property {boolean} active - Is effect active
 * @property {number} damage - Damage per tick (if applicable)
 * @property {number} duration - Duration in milliseconds
 * @property {number} lastTick - Last damage tick timestamp
 * @property {number} tickRate - Milliseconds between ticks
 * @property {number} [slowAmount] - Speed reduction (for slow effect)
 */

/**
 * @typedef {Object} ElementConfig
 * @property {string} name - Display name
 * @property {string} icon - Emoji icon
 * @property {number} color - Hex color (e.g., 0xff4500)
 * @property {string} description - Element description
 * @property {string} effect - Primary status effect
 */

/**
 * @typedef {'flame'|'water'|'electric'|'nature'|'wind'|'terra'|'gravity'|'celestial'|'radiant'|'shadow'} ElementType
 */

/**
 * @typedef {'spring'|'summer'|'fall'|'winter'} Season
 */

/**
 * @typedef {'slime'|'goblin'|'tank'|'bomber'|'boss'} EnemyType
 */

/**
 * @typedef {Object} WaveConfig
 * @property {number} currentWave - Current wave number
 * @property {number} enemiesThisWave - Enemies in this wave
 * @property {number} enemiesSpawned - Enemies spawned so far
 * @property {number} enemiesAlive - Enemies currently alive
 * @property {boolean} isBossWave - Is this a boss wave
 */

/**
 * @typedef {Object} Upgrade
 * @property {string} name - Upgrade name
 * @property {string} icon - Emoji icon
 * @property {string} [description] - Static description (optional if using getDescription)
 * @property {string} [upgradeKey] - Unique key for stackable upgrades (v3.1.1+)
 * @property {function(Player): string} [getDescription] - Dynamic description generator for stackable upgrades (v3.1.1+)
 * @property {Function} apply - Function to apply upgrade to player
 *
 * @example
 * // Static upgrade (one-time take)
 * {
 *   name: "Wildfire",
 *   icon: "🔥",
 *   description: "Burn spreads to nearby enemies",
 *   apply: () => { this.player.hasWildfire = true; }
 * }
 *
 * @example
 * // Stackable upgrade (infinite takes with dynamic description)
 * {
 *   name: "Inferno Blast",
 *   icon: "💥",
 *   upgradeKey: "infernoBlast",
 *   getDescription: (player) => {
 *     const stacks = player.upgradeStacks?.infernoBlast || 0;
 *     const current = BASE_VALUES.burn_damage + (stacks * 2);
 *     const next = BASE_VALUES.burn_damage + ((stacks + 1) * 2);
 *     return `+2 burn damage per tick (${current} → ${next} damage)`;
 *   },
 *   apply: () => {
 *     this.player.upgradeStacks.infernoBlast = (this.player.upgradeStacks.infernoBlast || 0) + 1;
 *     this.player.burnDamageBonus = (this.player.burnDamageBonus || 0) + 2;
 *   }
 * }
 */

// Export nothing - this file is only for type definitions
export {};
