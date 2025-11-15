/**
 * changelogData.js
 *
 * Patch history data for display in PatchHistoryScene
 * Exported from CHANGELOG.md - keep in sync when updating changelog
 */

export const CHANGELOG = [
    {
        version: "3.4.7",
        date: "2025-11-15",
        sections: [
            {
                title: "Fixed - CRITICAL ACHIEVEMENT BUG",
                items: [
                    {
                        heading: "waveReached Always Undefined (ROOT CAUSE)",
                        bullets: [
                            "CRITICAL FIX: Fixed the actual root cause of achievement tracking failure",
                            "Issue: this.currentWave doesn't exist in GameScene - it's in WaveSystem",
                            "Result: gameState.waveReached was always undefined",
                            "Impact: ALL wave-based achievements couldn't unlock",
                            "Fix: Changed to this.waveSystem.getCurrentWave()",
                            "Players can now unlock Element Master achievements"
                        ]
                    }
                ]
            }
        ]
    },
    {
        version: "3.4.6",
        date: "2025-11-15",
        sections: [
            {
                title: "Fixed - ACHIEVEMENT SYSTEM BUG FIXES",
                items: [
                    {
                        heading: "PersistenceSystem Version Mismatch (CRITICAL)",
                        bullets: [
                            "Fixed version mismatch causing unnecessary data migrations",
                            "Version was stuck at 3.1.3 while game was at 3.4.5",
                            "Separated game version from data structure version",
                            "Migration only occurs when data structure actually changes"
                        ]
                    },
                    {
                        heading: "localStorage Availability Check",
                        bullets: [
                            "Added warning pop-up when browser storage is disabled",
                            "Dismissible notification appears on main menu",
                            "Helps diagnose why progress isn't persisting"
                        ]
                    },
                    {
                        heading: "Enhanced Migration Logging",
                        bullets: [
                            "Shows unlocked achievements before/after migration",
                            "Warns if any achievement progress is lost",
                            "Displays skill points, total enemies killed, versions"
                        ]
                    }
                ]
            },
            {
                title: "Added - TESTING DOCUMENTATION",
                items: [
                    {
                        heading: "Achievement Testing Guide",
                        bullets: [
                            "Created comprehensive ACHIEVEMENT_TESTING.md",
                            "5 test scenarios covering all achievement functionality",
                            "Console commands for debugging",
                            "Quick cheat commands for testing"
                        ]
                    }
                ]
            }
        ]
    },
    {
        version: "3.4.5",
        date: "2025-11-15",
        sections: [
            {
                title: "Fixed - CRITICAL UI BUG",
                items: [
                    {
                        heading: "HP/XP Bar Visual Accuracy",
                        bullets: [
                            "CRITICAL FIX: HP/XP bars now show actual values",
                            "Removed lerp animation causing visual lag",
                            "Players thought they had more HP than they did",
                            "Damage scaling was CORRECT - visual bug created false impression"
                        ]
                    },
                    {
                        heading: "Added Numeric HP/XP Displays",
                        bullets: [
                            "Added '50/50' format text displays",
                            "14px font, bold, black stroke",
                            "Updates in real-time alongside bars"
                        ]
                    },
                    {
                        heading: "Healing Visual Accuracy",
                        bullets: [
                            "Shows ACTUAL heal amount, not potential",
                            "Wave heal shows '+2' if only needed 2 HP to cap",
                            "Healing feedback now accurately reflects what happened"
                        ]
                    }
                ]
            },
            {
                title: "Changed - BALANCE ADJUSTMENTS & UPGRADES",
                items: [
                    {
                        heading: "Swift Foot Replaces Cyclone (Wind)",
                        bullets: [
                            "Replaced useless 'Cyclone' upgrade with 'Swift Foot' 👟",
                            "+25% movement speed per stack (INFINITE stacking)",
                            "Fits Wind's mobility theme better"
                        ]
                    },
                    {
                        heading: "Wind Boomerang Targeting",
                        bullets: [
                            "ALL Wind boomerangs now auto-target nearest enemy",
                            "Each boomerang independently finds closest target",
                            "Removed isTargeting property"
                        ]
                    },
                    {
                        heading: "Wildfire Non-Stackable",
                        bullets: [
                            "Wildfire can only be picked once",
                            "Burn spread doesn't benefit from multiple picks"
                        ]
                    },
                    {
                        heading: "Wind Knockback Buff",
                        bullets: [
                            "Tripled knockback distance (200 → 600 power)",
                            "Applies to both orb hits and boomerang hits"
                        ]
                    },
                    {
                        heading: "Terra Fire Rate Buff",
                        bullets: [
                            "Increased wall spawn rate by 50%",
                            "Cooldown: 2000ms → 1333ms"
                        ]
                    }
                ]
            }
        ]
    },
    {
        version: "3.4.4",
        date: "2025-11-15",
        sections: [
            {
                title: "Fixed - BUG FIXES & QOL",
                items: [
                    {
                        heading: "Boss Laser During Upgrades",
                        bullets: [
                            "Fixed unavoidable laser damage during upgrade selection",
                            "Boss laser delayed callback fired even when paused",
                            "Added this.scene.paused check in laser callback"
                        ]
                    },
                    {
                        heading: "Ice Patches Persisting",
                        bullets: [
                            "Fixed invisible ice patches from previous runs",
                            "Ice patches from winter maps weren't cleaned up",
                            "Ice patches only exist in winter maps as intended"
                        ]
                    },
                    {
                        heading: "Red Potion Not Healing",
                        bullets: [
                            "Fixed treasure chest potions sometimes not healing",
                            "Chest destroyed before healing processed",
                            "Red potions now reliably heal 50% max HP"
                        ]
                    }
                ]
            },
            {
                title: "Changed - BALANCE ADJUSTMENTS",
                items: [
                    {
                        heading: "Health Boost Upgrade Buff",
                        bullets: [
                            "Max HP: +20 → +25",
                            "Instant Heal: 30 → 50 HP",
                            "More competitive with damage/utility upgrades"
                        ]
                    }
                ]
            }
        ]
    },
    {
        version: "3.4.3",
        date: "2025-11-15",
        sections: [
            {
                title: "Fixed - CRITICAL BUG FIXES",
                items: [
                    {
                        heading: "Achievement Tracking",
                        bullets: [
                            "CRITICAL: Fixed waveReached being undefined",
                            "All 10 Element Master achievements now work",
                            "Wave Warrior now properly tracks progress"
                        ]
                    },
                    {
                        heading: "Knockback System",
                        bullets: [
                            "Fixed knockback not pushing enemies away",
                            "Enemy AI recalculated velocity every 3 frames",
                            "Added knockbackUntil timer system (300ms)"
                        ]
                    },
                    {
                        heading: "Wind Element",
                        bullets: [
                            "Removed Sleep effect from Wind element",
                            "Wind now only applies knockback (25% chance)"
                        ]
                    }
                ]
            },
            {
                title: "Changed - BALANCE ADJUSTMENTS",
                items: [
                    {
                        heading: "Skill Tree Buffs",
                        bullets: [
                            "Increased all bonuses from +5% to +10% per level",
                            "Health Boost: Max +50% HP (50 → 75 HP)",
                            "Damage Boost: Max +50% damage",
                            "Speed Boost: Max +50% speed"
                        ]
                    }
                ]
            }
        ]
    }
];

/**
 * Get the latest N versions
 * @param {number} count - Number of versions to return
 * @returns {Array} Latest N version entries
 */
export function getLatestVersions(count = 5) {
    return CHANGELOG.slice(0, count);
}

/**
 * Get a specific version by version number
 * @param {string} version - Version number (e.g., "3.4.7")
 * @returns {Object|null} Version entry or null if not found
 */
export function getVersion(version) {
    return CHANGELOG.find(v => v.version === version) || null;
}

/**
 * Get all versions
 * @returns {Array} All version entries
 */
export function getAllVersions() {
    return CHANGELOG;
}
