/**
 * Element System - 10 Magical Elements
 *
 * Each element has unique status effects and 4 upgrades
 * Elements are selected at level 1 and determine playstyle
 */

/**
 * @typedef {import('../types/game-types.js').ElementType} ElementType
 * @typedef {import('../types/game-types.js').ElementConfig} ElementConfig
 */

/** @type {Record<ElementType, ElementConfig>} */
export const ELEMENTS = {
    flame: {
        name: "Flame",
        icon: "🔥",
        color: 0xff4500, // Red-Orange
        description: "Burn enemies over time",
        effect: "burn"
    },
    water: {
        name: "Water",
        icon: "💧",
        color: 0x4169e1, // Blue
        description: "Freeze enemies in place",
        effect: "freeze"
    },
    electric: {
        name: "Electric",
        icon: "⚡",
        color: 0xffff00, // Yellow
        description: "Paralyze and chain damage",
        effect: "paralyze"
    },
    nature: {
        name: "Nature",
        icon: "🌿",
        color: 0x228b22, // Forest Green (darker to stand out from background)
        description: "Poison that doubles damage",
        effect: "poison"
    },
    wind: {
        name: "Wind",
        icon: "💨",
        color: 0x87ceeb, // Light Cyan
        description: "Knockback and sleep",
        effect: "sleep"
    },
    terra: {
        name: "Terra",
        icon: "🪨",
        color: 0x8b4513, // Brown
        description: "Strong knockback",
        effect: "knockback"
    },
    gravity: {
        name: "Gravity",
        icon: "🌌",
        color: 0x9370db, // Purple
        description: "Slow and confuse enemies",
        effect: "slow"
    },
    celestial: {
        name: "Celestial",
        icon: "✨",
        color: 0xffd700, // Gold with shimmer
        description: "Charm enemies",
        effect: "charm"
    },
    radiant: {
        name: "Radiant",
        icon: "☀️",
        color: 0xfffacd, // Bright White-Gold
        description: "Blind and buff allies",
        effect: "blind"
    },
    shadow: {
        name: "Shadow",
        icon: "🌑",
        color: 0x4b0082, // Dark Purple/Indigo
        description: "Fear and weaken enemies",
        effect: "fear"
    }
};
