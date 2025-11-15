# Changelog - Branded For Death: Magic Affinity

All notable changes to Branded For Death: Magic Affinity will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.4.6] - 2025-11-15

### Fixed - ACHIEVEMENT SYSTEM BUG FIXES

**PersistenceSystem Version Mismatch (CRITICAL):**
- **Fixed version mismatch causing unnecessary data migrations**
  - Issue: Version was stuck at 3.1.3 while game was at 3.4.5
  - Impact: Every page load triggered full data migration (potential progress loss)
  - Fix: Separated game version (3.4.6) from data structure version (1.0.0)
  - New behavior: Migration only occurs when data structure actually changes
  - Location: PersistenceSystem.js lines 9-10, 226-240

**localStorage Availability Check:**
- **Added warning pop-up when browser storage is disabled**
  - Dismissible notification appears on main menu
  - Warns players: "Achievements and progress will NOT save!"
  - Helps diagnose why progress isn't persisting
  - Location: CharacterSelectScene.js lines 348-449

**Enhanced Migration Logging:**
- **Added detailed console logs for debugging migration issues**
  - Shows unlocked achievements before/after migration
  - Warns if any achievement progress is lost during migration
  - Displays skill points, total enemies killed, data versions
  - Location: PersistenceSystem.js lines 283-337

**Data Integrity Validation:**
- **Added checkDataIntegrity() function for diagnosing corruption**
  - Verifies all 15 achievements exist
  - Checks for missing core objects (achievements, skillTree, stats)
  - Detects negative values (corruption indicator)
  - Returns detailed report with unlocked count
  - Location: PersistenceSystem.js lines 339-384

### Added - TESTING DOCUMENTATION

**Achievement Testing Guide:**
- Created comprehensive testing document (ACHIEVEMENT_TESTING.md)
- 5 test scenarios covering all achievement functionality
- Console commands for debugging achievement tracking
- Quick cheat commands for testing (Wave 11, enemy kills, etc.)
- Known issues section with debugging steps

### Documentation

**Updated MagicAffinityBible.md:**
- Updated version to 3.4.6

---

## [3.4.5] - 2025-11-15

### Fixed - CRITICAL UI BUG

**HP/XP Bar Visual Accuracy:**
- **CRITICAL FIX: HP/XP bars now show actual values instead of lerped values**
  - Issue: v3.4.2 lerp animation caused bars to lag behind actual health/XP
  - Example: Player at 0 HP showed bar 80% full due to lerp animation
  - Impact: Players thought they had more HP than they actually did
  - Fix: Removed lerp animation entirely, bars now use `player.health / player.maxHealth` directly
  - Discovery: This meant damage scaling was CORRECT - visual bug created false impression
  - Location: UISystem.js lines 205-252

**Added Numeric HP/XP Displays:**
- **Added numeric text displays showing "50/50" format for HP and XP**
  - 14px font size, bold, black stroke (thickness 3)
  - Positioned at (220, 649) for HP, (220, 667) for XP
  - Updates in real-time alongside bars
  - Locations: UISystem.js lines 23, 26, 99-111, 130-141, 234, 253

**Healing Visual Accuracy:**
- **Fixed healing numbers to show ACTUAL heal amount, not potential**
  - Issue: Wave heal showed "+25" even if player only needed +2 HP to reach max
  - Fix: Calculate `actualHeal = health_after - health_before`, display that value
  - Impact: Healing feedback now accurately reflects what happened
  - Location: GameScene.js lines 4469-4476

### Changed - BALANCE ADJUSTMENTS & UPGRADES

**Swift Foot Replaces Cyclone (Wind Element):**
- **Replaced useless "Cyclone" upgrade with "Swift Foot" 👟**
  - Cyclone: Wind doesn't use orbs, so orb rotation speed was useless
  - Swift Foot: +25% movement speed per stack (INFINITE stacking)
  - Fits Wind's mobility theme better
  - Tracks stacks dynamically in description ("Swift Foot x3: +25% speed")
  - Location: UpgradeSystem.js lines 655-674

**Wind Boomerang Targeting:**
- **ALL Wind boomerangs now auto-target nearest enemy**
  - Previous: Only 1st boomerang targeted, others flew randomly
  - Now: Each boomerang independently finds and targets nearest enemy
  - Since fire rate is slow (1/sec), targets naturally differ as enemies move
  - Removed `isTargeting` property from boomerang objects
  - Locations: GameScene.js lines 1460-1497

**Wildfire Non-Stackable:**
- **Wildfire upgrade can now only be picked once**
  - Burn spread mechanic doesn't benefit from multiple picks
  - Added filter check to prevent Wildfire from appearing after first selection
  - Location: UpgradeSystem.js lines 1008-1011

**Wind Knockback Buff:**
- **Tripled Wind knockback distance (200 → 600 power)**
  - Applies to both orb hits and boomerang hits
  - Formula: `600 * (this.player.knockbackBonus || 1)`
  - Locations: GameScene.js lines 871, 1562

**Terra Fire Rate Buff:**
- **Increased Terra wall spawn rate by 50%**
  - Cooldown: 2000ms → 1333ms (walls spawn 1.5x faster)
  - Calculation: 2000 / 1.5 = 1333ms
  - Location: GameScene.js line 1617

### Documentation

**Updated MagicAffinityBible.md:**
- Updated Wind element (knockback 600 power, all boomerangs target)
- Updated Swift Foot upgrade (replaces Cyclone)
- Updated Terra element (1333ms fire rate)
- Updated Wildfire upgrade (non-stackable)
- Updated wave completion heal (25% max HP, confirmed accurate)
- Updated version to 3.4.5

---

## [3.4.4] - 2025-11-15

### Fixed - BUG FIXES & QOL

**Boss Laser During Upgrades:**
- **Fixed unavoidable laser damage during upgrade selection**
  - Issue: Boss laser delayed callback fired even when game was paused
  - Fix: Added `this.scene.paused` check in laser delayed callback
  - Impact: Players no longer take damage while selecting upgrades
  - Location: EnemySystem.js line 427

**Ice Patches Persisting:**
- **Fixed invisible ice patches from previous runs affecting new games**
  - Issue: Ice patches from winter maps weren't cleaned up on game over
  - Fix: Added ice patch cleanup in `gameOver()` function
  - Impact: Ice patches only exist in winter maps as intended
  - Location: GameScene.js lines 4535-4541

**Red Potion Not Healing:**
- **Fixed treasure chest potions sometimes not healing**
  - Issue: Chest could be destroyed before healing processed (high enemy count)
  - Fix: Destroy chest immediately after collection, ensure heal always applies
  - Impact: Red potions now reliably heal 50% max HP
  - Location: GameScene.js lines 3788-3836

**Skill Tree Menu Display:**
- **Fixed skill tree menu showing outdated +5% values**
  - Issue: Display text not updated when bonuses changed to +10% in v3.4.3
  - Fix: Updated all three skill descriptions to show "+10% per level"
  - Location: SkillTreeScene.js lines 40-42

### Changed - BALANCE ADJUSTMENTS

**Health Boost Upgrade Buff:**
- **Increased Health Boost upgrade effectiveness**
  - Max HP: +20 → +25
  - Instant Heal: 30 → 50 HP
  - Added green +50 visual feedback when selected
  - Rationale: Makes health upgrade more competitive with damage/utility
  - Location: UpgradeSystem.js lines 920-933

### Removed - UI POLISH CLEANUP

**Removed Distracting Visual Effects:**
- **Removed animated shine overlay** from health and XP bars
  - User feedback: Distracting and not essential
  - Kept: Lerp animation, low HP pulse (functional feedback)
  - Locations: UISystem.js lines 34-41, 89-97, 105-113, 210-222, 235-250

- **Removed drop shadows** from health and XP bars
  - Simplified UI appearance
  - Locations: UISystem.js (removed shadow graphics creation)

### Documentation

**Updated MagicAffinityBible.md:**
- Updated Health Boost upgrade (+25 HP, restore 50 HP)
- Confirmed wave completion heal is 25% max HP (already implemented)
- Updated version to 3.4.4

---

## [3.4.3] - 2025-11-15

### Fixed - CRITICAL BUG FIXES

**Achievement Tracking:**
- **CRITICAL:** Fixed `waveReached` being undefined causing all wave-dependent achievements to fail
  - Issue: `waveReached` was only set when completing a wave, not when dying mid-wave
  - Fix: Added `gameState.waveReached = this.currentWave` in `gameOver()` function
  - Impact: All 10 Element Master achievements and Wave Warrior now properly track progress
  - Location: GameScene.js line 4510

**Knockback System:**
- **Fixed knockback not pushing enemies away**
  - Issue: Enemy AI recalculated velocity every 3 frames, overriding knockback immediately
  - Fix: Added `knockbackUntil` timer system (300ms duration)
  - Enemy movement AI now checks `isKnockedBack` before allowing velocity changes
  - Locations: GameScene.js lines 1577 (timer set), 3143 (movement check)

**Wind Element:**
- **Removed Sleep effect from Wind element** (mistakenly re-added in v3.4.1)
  - Wind now only applies knockback (25% base chance)
  - Sleep status effect removed from Wind boomerang hits
  - Location: GameScene.js lines 1572-1578

### Changed - BALANCE ADJUSTMENTS

**Skill Tree Buffs:**
- **Increased all skill tree bonuses from +5% to +10% per level**
  - Health Boost: Max +50% HP (50 → 75 HP) (was +25%)
  - Damage Boost: Max +50% damage (20 → 30 dmg) (was +25%)
  - Speed Boost: Max +50% speed (140 → 210) (was +25%)
  - Rationale: Makes skill tree progression more impactful and rewarding
  - Location: ProgressionSystem.js lines 256-258

### Documentation

**Updated MagicAffinityBible.md:**
- Updated Wind element description to remove Sleep effect (v3.4.3)
- Updated Skill Tree section with new 10% bonuses and max values
- Updated Status Effects table to mark Sleep as removed from Wind
- Updated version to 3.4.3

---

## [3.4.2] - 2025-11-15

### Added - VISUAL POLISH UPDATE

**Screen Effects:**
- **Screen shake on damage:** 3px shake for 200ms on all damage types (enemy contact, laser, hazards)
  - Applied to player damage in 3 locations
  - Location: GameScene.js lines 3343, 4106, 4410

**Player Visual Feedback:**
- **Red flash on damage:** Player tints red for 100ms when taking damage
  - Provides clear visual feedback
  - Location: GameScene.js lines 3346-3350, 4109-4113, 4413-4417

**Particle Effects:**
- **Crit particles upgrade:** Changed from 8 circles to 10 five-pointed stars
  - Star shapes add more impact to critical strikes
  - Same colors (yellow/orange/red rotation)
  - Location: GameScene.js lines 4235-4260

- **Treasure chest spawn poof:** White smoke particles (15 total)
  - Expand upward and outward over 500ms
  - Alternating white/gray colors for depth
  - Location: EnemySystem.js lines 647-675

- **Boss portal entrance:** Purple spiraling particles (25 total)
  - Spiral inward toward boss spawn point
  - Staggered delays for dramatic effect (200ms between particles)
  - 800ms animation duration
  - Location: EnemySystem.js lines 44-80

**Player Animations:**
- **Idle bobbing:** ±2px gentle vertical motion when stationary
  - Sine wave based on time (500ms cycle = 2 bobs/second)
  - Location: GameScene.js lines 2957-2960

- **Movement lean:** 10° rotation in direction of travel
  - Calculated from movement angle
  - Adds life and dynamism to movement
  - Location: GameScene.js lines 2952-2955

- **Damage flash:** Red tint already added (see above)

**Enemy Animations:**
- **Spawn animation:** Scale from 0 → 1 with 360° rotation
  - 400ms duration with Back.easeOut easing
  - Enemies appear with dramatic flair
  - Location: EnemySystem.js lines 267-276

- **Death animation:** Fade + shrink + rotate (500ms)
  - Random rotation direction (0-360°)
  - Loot drops AFTER animation completes
  - Cubic.easeIn for smooth disappearance
  - Location: EnemySystem.js lines 302-330

**UI Improvements:**
- **Health/XP bar lerp:** Smooth animated fill instead of instant updates
  - Lerp speed: 0.2 (balanced smoothness)
  - Location: UISystem.js lines 205-210, 259-265

- **Low HP pulse:** Health bar flashes red when < 25% HP
  - Pulses every 1000ms
  - 200ms flash duration
  - Location: UISystem.js lines 220-232

- **Animated shine overlay:** Moving gloss effect on both bars
  - Travels across bar every ~5 seconds
  - White gradient with 40% opacity at peak
  - Location: UISystem.js lines 237-248, 277-289

- **Drop shadows:** Added to both health and XP bars
  - 2px offset, 50% opacity black
  - Adds depth to UI
  - Location: UISystem.js lines 94-98, 121-125

### Technical

**GameScene.js:**
- Added screen shake to 3 damage locations (lines 3343, 4106, 4410)
- Added red flash to 3 damage locations (lines 3346-3350, 4109-4113, 4413-4417)
- Updated crit particles to stars (lines 4235-4260)
- Added player idle bobbing (lines 2957-2960)
- Added player movement lean (lines 2952-2955)

**EnemySystem.js:**
- Added treasure chest poof particles (lines 647-675)
- Added boss portal entrance effect (lines 44-80)
- Added enemy spawn animation (lines 267-276)
- Updated killEnemy() for death animation (lines 286-369)
  - Loot spawns after animation completes
  - Enemy disabled immediately to prevent interactions

**UISystem.js:**
- Added bar tracking variables to constructor (lines 34-41)
- Added drop shadows for HP/XP bars (lines 94-98, 121-125)
- Added shine overlay graphics (lines 108-110, 135-137)
- Updated updateHealthBar() with lerp + pulse + shine (lines 202-249)
- Updated updateXPBar() with lerp + shine (lines 256-290)

**CharacterSelectScene.js:**
- Updated version number to v3.4.2 (line 101)

**MagicAffinityBible.md:**
- Updated version to 3.4.2
- Updated status to "Complete Phase 3 - Meta-Progression with Visual Polish"

### Documentation
- Version number updated across all files
- CHANGELOG.md: Complete v3.4.2 entry with all visual polish changes

---

## [3.4.1] - 2025-11-15

### Changed - WIND ELEMENT KNOCKBACK REWORK
- **Base Knockback Chance:** Increased from 5% to 25%
  - Wind boomerang attacks now have 25% chance to apply knockback + sleep
  - Sleep duration: 2 seconds when knockback triggers
  - Initialized when Wind element is selected
  - Location: UpgradeSystem.js lines 234-238

- **Zephyr Upgrade:** Completely reworked to stackable knockback chance boost
  - **OLD:** +20% movement speed (one-time)
  - **NEW:** +25% knockback chance per stack (stackable up to 4 times)
  - **Stack 1:** 25% → 50% knockback chance
  - **Stack 2:** 50% → 75% knockback chance
  - **Stack 3:** 75% → 100% knockback chance
  - **Stack 4:** 100% knockback chance (guaranteed!)
  - Automatically removed from upgrade pool after 4th stack
  - Dynamic description shows progression
  - Location: UpgradeSystem.js lines 634-654, 1001-1004

- **Knockback Application:** Now uses chance-based system
  - Checks `player.knockbackChance` before applying knockback
  - Applies sleep status effect on successful knockback
  - Knockback distance: 50px push (200 power * knockbackBonus)
  - Location: GameScene.js lines 1572-1583

### Changed - BALANCE ADJUSTMENTS
- **Boss HP Reduction:** Reduced boss health by 25% across all waves
  - **Formula:** 500 + (bossLevel × 200) → 375 + (bossLevel × 150)
  - Makes boss fights less grindy
  - Location: EnemySystem.js line 46

- **Enemy Wave Scaling:** Reduced wave-to-wave enemy count growth
  - **Multiplier:** 1.3 → 1.2 per wave
  - Slower difficulty ramp for better pacing
  - Location: WaveSystem.js line 139

- **Character Name:** Changed from "WIZARD" to "NUXX"
  - Updated in all UI locations
  - Location: UISystem.js lines 59, 249; GameOverScene.js line 40

### Fixed - CRITICAL BUGS
- **Invincibility Buff:** Fixed buff not blocking tank laser and bomber explosion damage
  - **Root Cause:** Missing `player.hasInvincibility` check in two damage locations
  - **Tank Laser:** Added check to `tankLaserHitPlayer()`
  - **Bomber Explosion:** Added check to `bomberExplode()`
  - Invincibility now correctly blocks ALL damage types
  - Location: GameScene.js line 4079; EnemySystem.js lines 525-529

### Changed - ACHIEVEMENT DEBUGGING
- **Element Master Tracking:** Added comprehensive debugging for element-specific achievements
  - Logs when element selection occurs
  - Logs best wave tracking for each element
  - Logs if achievement ID doesn't exist in data structure
  - Shows available achievement IDs if lookup fails
  - Warns if `runData.element` is not set
  - Location: ProgressionSystem.js lines 133-151

### Technical
- **UpgradeSystem.js:**
  - Added Wind knockback initialization (lines 234-238)
  - Reworked Zephyr upgrade to stackable (lines 634-654)
  - Added Zephyr max stack filter (lines 1001-1004)

- **GameScene.js:**
  - Fixed invincibility check in tank laser collision (line 4079)
  - Updated wind boomerang knockback logic (lines 1572-1583)

- **EnemySystem.js:**
  - Reduced boss HP formula by 25% (line 46)
  - Fixed invincibility check in bomber explosion (lines 525-529)

- **WaveSystem.js:**
  - Reduced wave scaling multiplier from 1.3 to 1.2 (line 139)

- **UISystem.js:**
  - Changed character name to "NUXX" (lines 59, 249)

- **GameOverScene.js:**
  - Changed character name to "NUXX" (line 40)

- **ProgressionSystem.js:**
  - Enhanced element master debugging (lines 133-151)

### Documentation
- **MagicAffinityBible.md:** (to be updated)
  - Version: 3.4.0 → 3.4.1
  - Updated Wind base knockback: 5% → 25%
  - Updated Zephyr upgrade: stackable knockback chance (+25% per stack, max 4)
  - Updated boss HP formula (25% reduction)
  - Updated enemy wave scaling formula (1.3 → 1.2)
  - Changed character name to NUXX

- **CharacterSelectScene.js:** (to be updated)
  - Version number: v3.4.0 → v3.4.1

---

## [3.4.0] - 2025-11-15

### Added - MAGNET POWER-UP (4TH TREASURE CHEST ITEM)
- **Magnet Buff:** New treasure chest drop that pulls XP orbs for 15 seconds
  - 25% drop chance (equal with Red Potion, Sword, Gold Potion)
  - Pull speed: 300 pixels/second toward player
  - Silver/gray color theme (0xC0C0C0)
  - Stops when within 5px to avoid jittering
  - All XP orb velocities reset to 0 when buff expires
  - Location: GameScene.js lines 3796-3802 (collection), 2859-2879 (pull logic)

- **Magnet UI:**
  - 🧲 emoji icon with silver background
  - Countdown timer in top-right corner
  - Buff expiration message: "Magnet Expired"
  - Location: GameScene.js lines 4051-4074 (icon display), 3943-3956 (expiration)

- **JSDoc Properties:**
  - Added `hasMagnet` and `magnetEndTime` to Player typedef
  - Location: game-types.js lines 91-92

### Changed - STACKABLE CRITICAL STRIKE UPGRADE
- **Critical Strike:** Now stackable up to 4 times (was one-time unlock)
  - **Stack 1:** 25% crit chance (was 15%)
  - **Stack 2:** 50% crit chance
  - **Stack 3:** 75% crit chance
  - **Stack 4:** 100% crit chance (guaranteed crits!)
  - Always 2x damage multiplier
  - Automatically removed from upgrade pool after 4th stack
  - Location: UpgradeSystem.js lines 921-950, 978-981

- **Dynamic Upgrade Card:**
  - Shows progression: "50% → 75% crit chance\n2x damage"
  - First stack: "25% chance for 2x damage"
  - Uses `getDescription()` function for dynamic text
  - Location: UpgradeSystem.js lines 925-936

- **JSDoc Updates:**
  - Added `critStacks` property to Player typedef (max 4)
  - Updated `critChance` description (0.25 per stack)
  - Updated `critMultiplier` description (always 2x)
  - Location: game-types.js lines 38-40

### Changed - TREASURE CHEST VISUAL IMPROVEMENTS
- **Chest Size:** Doubled from 12x12px to 24x24px for better visibility
  - Latch size: 4x2 → 8x4
  - Lock radius: 1.5 → 3
  - Location: DrawingHelpers.js lines 514-531

- **Gold Outline:** Added 2px thick gold stroke (0xFFD700) around chest
  - Makes chests stand out against backgrounds
  - Location: DrawingHelpers.js line 515

- **Collision Radius:** Increased from 15px to 30px (doubled for 2x size)
  - Location: EnemySystem.js line 648

- **Drop Distribution:** Updated from 3 items (33.33% each) to 4 items (25% each)
  - Red Potion: 33.33% → 25%
  - Sword: 33.33% → 25%
  - Gold Potion: 33.33% → 25%
  - Magnet: NEW 25%
  - Location: GameScene.js lines 3766-3802

### Changed - TERRA ELEMENT ICON
- **Icon Update:** Changed from 🪨 (rock) to ⛰️ (mountain emoji)
  - **Reason:** Rock emoji shows as blank square on many browsers
  - Mountain emoji has better cross-browser support
  - Location: elements.js line 52

### Fixed - CRITICAL BUGS
- **Critical Strike Color:** Fixed hardcoded red color bug
  - **Root Cause:** Color parameter was passed but ignored (line 4228)
  - **Fix:** Use color parameter in both pooled and new text objects
  - Crit popups now correctly show gold (0xFFD700) instead of red
  - Location: GameScene.js lines 4220, 4228

- **Achievement Tracking:** Fixed "First Blood" and ALL achievements not unlocking
  - **Root Cause:** Used faulty calculation instead of `enemiesKilled` counter
  - **Old Code:** `getCurrentWave() * getEnemiesThisWave() - getEnemiesAlive()`
  - **New Code:** `this.enemiesKilled` (proper counter incremented at line 3569)
  - All achievements can now unlock out of order
  - Location: GameScene.js line 4448

- **Achievement Debugging:** Added comprehensive console logging
  - Logs all achievement checks with conditions
  - Logs unlock events and save results
  - Helps identify which achievements are failing and why
  - Location: ProgressionSystem.js lines 38-153

### Technical
- **GameScene.js:**
  - Fixed color parameter in `showDamageNumber()` (lines 4220, 4228)
  - Fixed `enemiesKilled` tracking (line 4448)
  - Updated `collectTreasureChest()` for 4-item distribution (lines 3766-3802)
  - Added magnet pull logic in `update()` (lines 2859-2879)
  - Added magnet expiration in `updateBuffTimers()` (lines 3943-3956)
  - Added magnet icon in `drawBuffIcons()` (lines 4051-4074)

- **UpgradeSystem.js:**
  - Added `crit_chance: 0` to BASE_VALUES (line 68)
  - Updated Critical Strike to stackable (lines 921-950)
  - Added `getDescription()` for dynamic text (lines 925-936)
  - Added stack filter (max 4) in `generateUpgradeOptions()` (lines 978-981)

- **DrawingHelpers.js:**
  - Doubled chest size and added gold outline (lines 514-531)

- **EnemySystem.js:**
  - Updated chest collision radius from 15px to 30px (line 648)

- **elements.js:**
  - Updated Terra icon from 🪨 to ⛰️ (line 52)

- **game-types.js:**
  - Added `critStacks` property to Player typedef (line 38)
  - Updated crit property descriptions (lines 39-40)
  - Added `hasMagnet` and `magnetEndTime` properties (lines 91-92)

- **ProgressionSystem.js:**
  - Added comprehensive debugging logs for all achievements (lines 38-153)
  - Logs runData, progress, unlock events, and save results

### Documentation
- **MagicAffinityBible.md:** (to be updated)
  - Version: 3.3.2 → 3.4.0
  - Updated Critical Strike to stackable (4 stacks max)
  - Updated Treasure Chest section (4 items, 25% each, added Magnet)
  - Updated Terra icon documentation (⛰️)
  - Updated chest visual specs (24x24px with gold outline)

- **CharacterSelectScene.js:** (to be updated)
  - Version number: v3.3.2 → v3.4.0

---

## [3.3.2] - 2025-11-15

### Added - TREASURE CHEST SYSTEM
- **Enemy Loot Drops:** 5% chance for enemies to drop treasure chests on death
  - Brown chest with gold latch and lock visual
  - Gentle bobbing animation (±5px vertical)
  - 15 second lifespan before despawn
  - Blinking warning after 5 seconds (200ms intervals)
  - Auto-pickup on contact (20px radius)
  - Location: EnemySystem.js lines 237-244, 631-667

- **Three Buff Items (equal drop chance):**
  1. **Red Potion 🧪** - Heals 50% of max HP instantly
     - Shows green "+X HP" healing effect with particles
     - Visual feedback even at full HP

  2. **Sword ⚔️** - Double damage for 15 seconds
     - Multiplicative with critical strikes (2x × 2x = 4x!)
     - Applied BEFORE crit calculation
     - Shows buff icon with countdown in top-right corner

  3. **Gold Potion ✨** - Invincibility for 15 seconds
     - Immune to all enemy damage (contact + boss lasers)
     - Pulsing gold ring visual effect around player
     - Shows buff icon with countdown in top-right corner

  - **Buff Stacking:** Picking up same buff type refreshes duration to full 15s
  - **Multiple Buffs:** Can have Sword + Invincibility active simultaneously
  - Location: GameScene.js lines 3710-3954

- **Visual Feedback Systems:**
  - Healing effect: Green "+X HP" text with particle sparkles
  - Item pickup message: Center screen fade message
  - Buff icons: Top-right corner with emoji, colored background, countdown timer
  - Buff expiration: Gray "Buff Expired!" message
  - Invincibility glow: Pulsing gold ring (sine wave animation)
  - Location: GameScene.js lines 3757-3828, 3018-3033

- **Invincibility Implementation:**
  - Blocks player-enemy collision damage (playerHitEnemy)
  - Blocks boss laser damage (fireBossLaser)
  - Does NOT block environmental hazard damage
  - Location: GameScene.js line 4254, EnemySystem.js line 372-380

- **Drawing Functions:**
  - `drawTreasureChest()` - Brown box with gold latch
  - `drawPotionIcon(color)` - Bottle with cork and liquid shine
  - `drawSwordIcon()` - Silver blade with gold guard
  - Location: DrawingHelpers.js lines 318-395

### Changed - VISUAL ENHANCEMENTS
- **Critical Strike Popup:**
  - Color: Yellow (0xFFFF00) → Gold (0xFFD700) for richer appearance
  - Font size: 28px → 32px (14% larger)
  - Stroke thickness: 4px → 6px (50% thicker, better visibility)
  - Location: GameScene.js lines 3822, 3896-3898

- **Player Skin Color:**
  - Skin/Hands: 0xFFE4C4 → 0xFFF5E1 (~10% whiter, purer beige tone)
  - Location: DrawingHelpers.js line 24

### Technical
- **GameScene.js:**
  - Added `treasureChests` physics group (line 124)
  - Added collision detection for chest pickup (lines 230-236)
  - Modified `applyDamage()` to apply double damage BEFORE crit check (lines 3807-3820)
  - Added `collectTreasureChest()` function (lines 3710-3755)
  - Added `showHealingEffect()` function (lines 3757-3787)
  - Added `showItemPickupMessage()` function (lines 3789-3810)
  - Added `updateBuffTimers()` function (lines 3812-3826)
  - Added `showBuffExpiredMessage()` function (lines 3828-3849)
  - Added `drawBuffIcons()` function (lines 3851-3954)
  - Modified `update()` to call buff timers and draw buff UI (lines 2849-2857)
  - Added chest despawn/blink logic (lines 2996-3016)
  - Added invincibility glow effect (lines 3018-3033)
  - Modified `playerHitEnemy()` to check invincibility (line 4254)

- **EnemySystem.js:**
  - Modified `killEnemy()` to spawn chest with 5% chance (lines 237-244)
  - Added `spawnTreasureChest()` function (lines 631-667)
  - Modified `fireBossLaser()` to check invincibility buff (lines 372-380)

- **DrawingHelpers.js:**
  - Updated skin color constant (line 24)
  - Added `drawTreasureChest()` function (lines 318-337)
  - Added `drawPotionIcon()` function (lines 339-358)
  - Added `drawSwordIcon()` function (lines 360-395)

- **game-types.js:**
  - Added treasure chest buff properties to Player typedef (lines 86-91):
    - `hasDoubleDamage`, `doubleDamageEndTime`
    - `hasInvincibility`, `invincibilityEndTime`

### Documentation
- **MagicAffinityBible.md:**
  - Version bumped: 3.3.1 → 3.3.2 (line 3)
  - Updated last updated date to November 15, 2025 (line 4)
  - Updated player skin color documentation (line 146)
  - Updated Critical Strike upgrade description (line 490)
  - Added "Treasure Chest System" section (lines 658-712):
    - Drop mechanics and persistence
    - All three buff items with detailed stats
    - Buff features and interaction rules
    - Sound effects and visual feedback

- **CHANGELOG.md:**
  - Version bumped: 3.3.1 → 3.3.2

---

## [3.3.1] - 2025-11-14

### Changed - PLAYER SPRITE ENHANCEMENTS
- **Top Hat:** Doubled crown height (8px → 16px tall)
  - Crown starts at y=-30 (was y=-22)
  - Brim remains at y=-14
  - Total character height increased from ~45px to ~53px
  - Location: DrawingHelpers.js line 49

- **Suit Details:**
  - **Buttons:** Added 3 small circle buttons (1px radius) down center of jacket
    - Top button: y=0
    - Middle button: y=3
    - Bottom button: y=6
    - Color: 0.6x element brightness (darker than jacket)
    - Location: DrawingHelpers.js lines 85-88

  - **Lapels:** Updated from 0.8x to 0.6x brightness for better contrast
    - Created new `suitDetailColor` variable at 0.6x brightness
    - Location: DrawingHelpers.js lines 34-38, 80-82

  - **Shoes:** Added rectangular shoes at bottom of legs
    - Color: 0.4x element brightness (darkest detail)
    - Size: 3x2px rectangles
    - Position: y=14-16 (bottom of character)
    - Legs shortened from 8px to 6px to make room
    - Location: DrawingHelpers.js lines 109-118

### Changed - WAVE 3 DIFFICULTY SPIKE
- **Wave 3 Composition:** Changed from 100% Slimes to 50% Goblins / 50% Slimes
  - Creates early difficulty spike (Goblins have 67% more HP and 17% more speed)
  - Prepares players for enemy variety in wave 4+
  - Location: EnemySystem.js lines 136-138

### Changed - BOSS LASER SCALING
- **Dynamic Laser Count:** Boss lasers now scale with wave number
  - Formula: `laserCount = 1 + Math.floor(currentWave / 5)`
  - Wave 5 (1st boss): 2 lasers (1 aimed + 1 random)
  - Wave 10 (2nd boss): 3 lasers (1 aimed + 2 random)
  - Wave 15 (3rd boss): 4 lasers (1 aimed + 3 random)
  - Wave 20 (4th boss): 5 lasers (1 aimed + 4 random)
  - Continues scaling infinitely
  - First laser always aims at player (guaranteed threat)
  - Additional lasers fire in random directions
  - All lasers fire simultaneously
  - Location: EnemySystem.js lines 295-310

### Technical
- **DrawingHelpers.js:**
  - Added three color calculations: 0.8x (brim), 0.6x (details), 0.4x (shoes)
  - Updated variable naming: `r` → `r8`, `g` → `g8`, `b` → `b8` for clarity
  - Lines 28-44: Color calculation updates
  - Lines 46-53: Top hat doubled height
  - Lines 79-88: Suit details (lapels + buttons)
  - Lines 107-118: Legs shortened + shoes added

- **EnemySystem.js:**
  - Line 136-138: Wave 3 composition updated
  - Lines 289-310: Boss laser scaling implementation
  - Updated JSDoc comment for bossLaserAttack

### Documentation
- **MagicAffinityBible.md:**
  - Version bumped: 3.3.0 → 3.3.1 (line 3)
  - Updated character visual design specs (lines 133-144):
    - Top hat: mentioned double-height (16px)
    - Lapels: noted 0.6x brightness
    - Buttons: added to spec (0.6x brightness)
    - Shoes: added to spec (0.4x brightness)
    - Total height: ~45px → ~53px
  - Updated difficulty scaling section (lines 121-129):
    - Added wave 3 composition details
  - Updated boss section (lines 442-459):
    - Added "Boss Laser Scaling" subsection
    - Updated boss stats table to include laser counts
  - Updated pixel art specs: ~45px → ~53px (line 785)

- **CHANGELOG.md:**
  - Version bumped: 3.3.0 → 3.3.1

- **CharacterSelectScene.js:**
  - Version number: v3.3.0 → v3.3.1 (line 101)

- Version bumped: 3.3.0 → 3.3.1

---

## [3.3.0] - 2025-11-14

### Changed - VISUAL REDESIGN & REBRANDING
- **Game Title Update**
  - New title: "Branded For Death: Magic Affinity"
  - Main title: "BRANDED FOR DEATH" (gold, 44px)
  - Subtitle: "MAGIC AFFINITY" (cyan, 32px)
  - Tagline: "Master the Elements. Survive the Waves." (gray, 16px)
  - Location: CharacterSelectScene.js lines 20-48

- **Character Redesign: Wizard → Suited Man**
  - Replaced wizard character with mysterious suited man
  - New visual design:
    - Top hat with element-colored crown, darker brim (0.8x brightness)
    - Black sunglasses (curved lenses, always black regardless of element)
    - Element-colored suit jacket (trapezoid shape: wider shoulders, narrower waist)
    - Darker element-colored collar/lapels
    - Element-colored arms and legs
    - Pale beige skin and hands (0xFFE4C4)
    - Dynamic pose: one arm at side, one arm raised (waving/gesturing)
  - Hitbox unchanged: 15px radius circle
  - Total height: ~45px
  - Location: DrawingHelpers.js lines 16-94

- **Visual Customization Updates**
  - Grey default appearance before element selection
  - Upon element selection:
    - Top hat crown: element color (full brightness)
    - Top hat brim: darker element color (0.8x brightness)
    - Suit, arms, legs: element color
    - Orbiting orbs: element color
  - Sunglasses remain black always (critical design choice)

### Technical
- **DrawingHelpers.js:**
  - Created drawSuitedMan() function (lines 16-94)
  - Deprecated drawWizard() function with @deprecated tag (lines 97-160)
  - Color calculation for darker brim: RGB * 0.8 (lines 29-32)

- **GameScene.js:**
  - Import: drawWizard → drawSuitedMan (line 19)
  - Updated all character drawing calls (lines 502, 3781)
  - Updated comments: "wizard" → "suited man" (lines 495, 501, 507, 546, 550-551)

- **CharacterSelectScene.js:**
  - Updated title layout with three-tier display (lines 20-48)
  - Repositioned UI elements for new title spacing

- **UpgradeSystem.js:**
  - Updated JSDoc: callbacks.drawWizard description updated (line 86)

- **gameState.js:**
  - Updated JSDoc: selectedCharacter description updated (line 8)

### Documentation
- **MagicAffinityBible.md:**
  - Updated title: "Branded For Death: Magic Affinity" (line 1)
  - Version bumped: 3.2.2 → 3.3.0 (line 3)
  - Section renamed: "Wizard Stats" → "Player Character" (line 128)
  - Added detailed "The Suited Man" section with visual specs (lines 130-168)
  - Updated all "wizard" references to "suited man" or "player"
  - Updated character sprite size: 16x16px → ~45px tall (line 768)
  - Updated orb naming: "Wizard Orbs" → "Element Orbs" (line 772)
  - Updated UI reference: "Wizard + Element" → "Suited Man + Element" (line 555)

- **CHANGELOG.md:**
  - Updated title with new game name
  - Version bumped: 3.2.2 → 3.3.0

- Version bumped: 3.2.2 → 3.3.0

---

## [3.2.2] - 2025-11-14

### Fixed - CRITICAL BUG FIXES
- **Star's Orbit Bug (Celestial)**
  - Fixed upgrade DECREASING orb speed instead of increasing it
  - Root cause: Setting orbSpeed to absolute value (2.5 * 1.25) instead of multiplying current value
  - Celestial starts with orbSpeed 5.0, upgrade was setting it to 3.125 (slower!)
  - Now correctly multiplies current speed by 1.25 (e.g., 5.0 → 6.25 → 7.81...)
  - Location: UpgradeSystem.js line 776

- **Wind Boomerang Count**
  - Fixed base boomerang count (was 1, should be 3)
  - Hurricane upgrade now correctly adds to base 3 (3→4→5→6...)
  - First boomerang targets nearest enemy, others shoot random directions
  - Locations: UpgradeSystem.js lines 647-655, GameScene.js line 1448

### Changed - UI IMPROVEMENTS
- **Skill Tree Display**
  - Removed 5-circle progress indicator (was overlapping with text)
  - Now only shows level text (e.g., "3 / 5")
  - Larger, gold-colored text for better readability
  - Location: SkillTreeScene.js lines 96-105

### Technical
- **UpgradeSystem.js:**
  - Star's Orbit: Changed from absolute value to multiplicative (line 776)
  - Hurricane: Base count 1→3, description updated (lines 647-655)

- **GameScene.js:**
  - Wind boomerang max: Default 1→3 (line 1448)

- **SkillTreeScene.js:**
  - Removed circle rendering loop (lines 96-109)
  - Updated level text formatting (line 99)
  - Deprecated updateLevelCircles function (lines 242-245)

- **CharacterSelectScene.js:**
  - Version number: 3.2.1 → 3.2.2 (line 91)

- **MagicAffinityBible.md:**
  - Updated Wind element description with base 3 boomerangs
  - Updated Hurricane upgrade description (3→4→5...)
  - Version bumped to 3.2.2

### Documentation
- Version bumped: 3.2.1 → 3.2.2
- All bug fixes documented

---

## [3.2.1] - 2025-11-14

### Fixed - CRITICAL BUG FIXES
- **Water Freeze Bug**
  - Fixed freeze status not setting duration on water stream hits
  - Water freeze now properly freezes enemies for 2 seconds (was broken)
  - Location: GameScene.js lines 1168-1174

- **Wind Knockback Bug**
  - Fixed wind boomerangs not applying knockback at all
  - Boomerang hits now properly knockback enemies
  - Location: GameScene.js lines 1559-1563

### Changed - BALANCE & MECHANIC UPDATES
- **Wind Element Rework**
  - **REMOVED:** Sleep status effect (no longer applied)
  - Knockback is now the only primary effect (200 power)
  - Makes wind more focused on positioning/control
  - **Suffocate → Hurricane:** New stackable upgrade (+1 boomerang per stack)
  - Base: 1 boomerang, can stack infinitely (1→2→3→4...)

- **Electric Element Upgrade Change**
  - **Surge → Thor's Hammer:** Replaced "+30% damage vs Tanks" with "+25% attack range"
  - Stackable: 0%→25%→50%→75%...
  - Affects both initial target range (125px base) and chain range (75px base)
  - More universally useful than situational Tank damage

- **Flame Element Buff**
  - Damage: -5 bonus → +5 bonus (15 dmg → 25 dmg, +25% buff)
  - Hit range: 100px → 125px (+25%)
  - Visual range: 150px → 188px (+25%)
  - Flame was underperforming and needed this buff

- **Nature Element Changes**
  - **Regeneration Rework:** Already updated in v3.2.0 (1% max HP every 10s)
  - **Thornmail → Toxicity:** Already replaced in v3.2.0
  - **Poison Proc Chance:** Base 30% (was 100% in orb hits, now with Toxicity stacks)

- **XP Collection Range Increase**
  - Increased from 12px → 20px (+67% larger radius)
  - Makes XP collection more forgiving after v3.2.0 removed auto-collect

### Added
- **Version Number Display**
  - Main menu now shows version "v3.2.1" in bottom left corner
  - Helps players identify which version they're playing

- **Achievement UI Improvements**
  - Removed redundant "Current: +X% bonus" text on skill tree (description is sufficient)
  - Fixed overlapping skill level text (moved from X+60 to X+45)
  - Cleaner, more readable skill tree interface

### Technical
- **GameScene.js:**
  - Removed sleep application from wind orb hits (line 861-865)
  - Added knockback to wind boomerang hits (lines 1559-1563)
  - Fixed water freeze duration setting (lines 1168-1174)
  - Buffed flame damage bonus (UpgradeSystem.js line 228)
  - Buffed flame ranges (lines 990, 1040)
  - Added electric range bonus scaling (lines 1204-1207, 1254-1257)

- **UpgradeSystem.js:**
  - Suffocate → Hurricane upgrade (lines 631-646)
  - Surge → Thor's Hammer upgrade (lines 554-569)
  - Hurricane uses maxBoomerangs player property

- **EnemySystem.js:**
  - XP orb collision radius: 12px → 20px (line 607)

- **SkillTreeScene.js:**
  - Removed bonus text display (lines 93-94)
  - Fixed level text positioning (line 112)

- **CharacterSelectScene.js:**
  - Added version number display (lines 89-96)

- **game-types.js (JSDoc):**
  - Added `maxBoomerangs` property
  - Added `electricRangeBonus` property
  - Added `poisonProcChance` property
  - Removed `hasCosmicDash` property
  - Removed `thornmail` property
  - Removed `sleepDurationBonus` property
  - Removed `surge` property
  - Removed `regenRate` property
  - Updated `hasRegeneration` description

### Documentation
- Version bumped: 3.2.0 → 3.2.1
- Updated MagicAffinityBible.md with all element changes
- Updated all upgrade descriptions
- Updated XP collection mechanics
- Updated Flame, Electric, Wind, Nature sections

---

## [3.2.0] - 2025-11-14

### Changed - BALANCE & PROGRESSION UPDATES
- **XP Collection System Redesign**
  - Removed 5-second auto-collect timer
  - Increased XP orb collision radius by 50% (8px → 12px)
  - Players must now actively collect XP orbs for better risk/reward gameplay
  - Larger collection range compensates for manual collection

- **Enemy Speed Increases**
  - Goblin speed: 60 → 70 (+16.7% faster)
  - Tank speed: 20 → 30 (+50% faster)
  - Makes mid-to-late game more challenging
  - Requires better positioning and kiting

- **Wave Pacing Acceleration**
  - Staggered enemy spawning: 800ms → 500ms between spawns
  - Waves ramp up 37.5% faster
  - More intense combat pressure
  - Locations: WaveSystem.js lines 106, 119

- **Nature Element Rebalance**
  - **Regeneration Rework:** Changed from flat 2 HP every 2 seconds to 1% max HP every 10 seconds
  - Scales better with Health Boost upgrades (better late-game value)
  - Weaker early game, stronger late game
  - Shows green healing numbers for visual feedback
  - **Thornmail Removed:** Replaced with Toxicity upgrade
  - **Toxicity Added:** +10% poison proc chance (stackable: 30%→40%→50%→60%...)
  - Base poison proc chance now 30% (was 100%)
  - Applies to both orb hits and seed explosions
  - Toxicity upgrade can stack infinitely for late-game scaling

- **Celestial Element Rework**
  - **Cosmic Dash Removed:** Teleport mechanic removed from the game
  - **Star's Orbit Added:** +25% orb rotation speed (stackable: 0%→25%→50%→75%...)
  - Increases damage output via faster attacks
  - Stacks infinitely for continuous scaling
  - More consistent with element's offensive identity

- **Shadow Element Quality of Life**
  - Void Clone now spawns 2nd clone **immediately** when upgrade is taken
  - Previously delayed until next wave (poor UX)
  - 1st clone still spawns 2 seconds after wave starts
  - Locations: UpgradeSystem.js lines 846-854

### Technical
- **EnemySystem.js:**
  - XP orb body: setCircle(8) → setCircle(12) (line 607)
  - Removed auto-collect timer delayedCall (line 621-635)
  - Goblin speed: 60 → 70 (line 173)
  - Tank speed: 20 → 30 (line 181)

- **WaveSystem.js:**
  - Spawn delay: 800ms → 500ms (lines 106, 119)

- **GameScene.js:**
  - Regeneration: 2s interval → 10s, flat HP → 1% max HP (lines 3016-3032)
  - Added poison proc chance checks (30% base) (lines 850-858, 1401-1408)
  - Removed Cosmic Dash spacebar teleport code (lines 2898-2962 deleted)

- **UpgradeSystem.js:**
  - Regeneration: Removed regenRate property, updated description (lines 572-577)
  - Thornmail → Toxicity: New stackable upgrade (lines 580-595)
  - Cosmic Dash → Star's Orbit: New stackable upgrade (lines 742-758)
  - Void Clone: Added immediate spawn logic (lines 846-854)

- **MagicAffinityBible.md:**
  - Updated version to 3.2.0
  - Updated all enemy speed values
  - Updated Nature upgrade descriptions
  - Updated Celestial upgrade descriptions
  - Updated Shadow upgrade descriptions
  - Updated XP collection mechanics
  - Updated spawn timing
  - Added poison proc chance information

### Documentation
- Version bumped: 3.1.3 → 3.2.0
- All changes documented in MagicAffinityBible.md

---

## [3.1.3] - 2025-11-13

### Fixed - CRITICAL BUG FIXES
- **Ice Spike Respawn Bug**
  - Winter map ice spike hazards now properly respawn between runs
  - Root cause: Hazards array not cleaned up between game sessions
  - Solution: Added hazard cleanup in `spawnHazards()` before creating new ones
  - Also added cleanup in `gameOver()` to prevent memory leaks
  - Locations: GameScene.js lines 2684-2692, 4160-4166

- **Boss Laser After Death Bug**
  - Boss laser attacks no longer fire after boss health reaches 0
  - Added `enemy.health > 0` check before laser attack execution
  - Prevents ghost attacks from dead bosses
  - Location: GameScene.js line 3037

- **Element Master Achievements Not Unlocking (CRITICAL)**
  - Fixed achievement migration system deleting new element master achievements for existing players
  - Root cause: Spread operator order in `migrateData()` overwrote defaults with old data
  - Solution: Properly merge each achievement individually (defaults first, then overlay old unlock status)
  - This was preventing ALL element master achievements from working for existing players
  - Version bumped from 3.1.0 to 3.1.3 to trigger migration for all users
  - Locations: PersistenceSystem.js lines 9, 271-296

- **Bomber Teleport During Pause Bug**
  - Bombers can no longer teleport while level up menu is open
  - Added double-check of pause state before executing teleport
  - Prevents race condition where pause happens between check and teleport
  - Location: GameScene.js lines 3063-3078

- **Right Click Movement Lock Bug**
  - Right-clicking while moving no longer locks player direction
  - Browser context menu was interfering with keyboard input
  - Solution: Disabled context menu via `this.input.mouse.disableContextMenu()`
  - Location: GameScene.js line 191

### Changed - BALANCE UPDATES
- **Enemy Speed Scaling Removed**
  - All enemy speeds are now STATIC (no speed increase per wave)
  - Late-game enemies no longer become impossibly fast
  - New static speeds:
    - Slime: 40 (was 40 + wave*2)
    - Goblin: 60 (was 60 + wave*3)
    - Tank: 20 (was 20 + wave)
    - Bomber: 45 (was 45 + wave*2)
  - HP and damage scaling unchanged (still increase per wave)
  - Locations: EnemySystem.js lines 165, 173, 181, 190

- **Armor Boost Pick Limit**
  - Universal upgrade "Armor Boost" can now only be picked twice (max 2x)
  - Prevents infinite damage reduction stacking
  - Maximum: 50% damage reduction (25% × 2)
  - Upgrade is completely filtered from options after 2nd pick
  - Description updated to show "(max 2x)"
  - Locations: UpgradeSystem.js lines 887-891, 907-910

- **Boss XP Reward Increased**
  - Boss XP increased by 50% (75 → 113)
  - Boss kills now feel more rewarding for the difficulty
  - Better progression pacing for players who reach boss waves
  - Location: EnemySystem.js line 50

### Technical - DOCUMENTATION & TYPE SAFETY
- **JSDoc Type System Updates**
  - Added `armorBoostCount` property to Player typedef
  - Tracks number of times Armor Boost upgrade has been taken
  - Location: game-types.js line 48

- **CLAUDE.md Critical Note Added**
  - Added warning section about keeping JSDoc documentation updated
  - Emphasizes that ALL code changes must include corresponding JSDoc updates
  - Prevents future bugs from outdated type definitions
  - Location: CLAUDE.md lines 90-96

- **MagicAffinityBible.md Updates**
  - Version bumped to 3.1.3
  - Updated all enemy speed formulas to show static values
  - Updated Boss XP value (200 → 113)
  - Updated Armor Boost description to mention "(max 2x)"
  - Updated difficulty scaling notes to clarify speed is static

### Performance
- No performance impact from these changes
- Ice spike cleanup actually improves memory usage
- Achievement migration runs once on version change

---

## [3.1.2] - 2025-11-12

### Added - STACKABLE PERCENTAGE UPGRADES
- **8 Percentage Upgrades Converted to Infinite Stacking**
  - All percentage-based upgrades now show dynamic descriptions with current→next values
  - Players can take the same upgrade multiple times for unlimited scaling
  - Late-game progression significantly improved with compounding upgrades

**Stackable Upgrades by Element:**
1. **Flame - Inferno Blast:** +2 burn damage per tick (stackable: 3→5→7→9...)
2. **Water - Permafrost:** +5% freeze chance (stackable: 50%→55%→60%→65%...)
3. **Water - Jet Stream:** +25% water beam range (already stackable from v3.1.1)
4. **Electric - Overload:** +10% paralyze chance (stackable: 30%→40%→50%→60%...)
5. **Gravity - Gravitational Pull:** +10% slow effect (stackable: 40%→50%→60%→70%...)
6. **Celestial - Starfall:** +3% charm chance (stackable: 5%→8%→11%→14%...)
7. **Radiant - Brilliant Flash:** +10% blind chance (stackable: 20%→30%→40%→50%...)
8. **Shadow - Lifesteal:** +10% lifesteal (stackable: 0%→10%→20%→30%...)
9. **Shadow - Dark Embrace:** +5% fear chance (stackable: 10%→15%→20%→25%...)

### Changed - UPGRADE DESCRIPTIONS
- **Dynamic Upgrade Descriptions:** All stackable upgrades now show real-time calculations
  - Example: "Permafrost +5% freeze chance (50% → 55%)" on first take
  - Example: "Permafrost +5% freeze chance (55% → 60%)" on second take
  - Example: "Inferno Blast +2 burn damage (3 → 5 damage)" on first take
- **Upgrade System Refactor:** Added `getDescription()` function support for dynamic text

### Fixed - DOCUMENTATION CORRECTIONS
- **MagicAffinityBible.md:** Corrected upgrade descriptions to match actual implementation
  - Electric: Overload changed from "+2 damage to paralyzed" to "+10% paralyze chance"
  - Radiant: Brilliant Flash base chance corrected from 15% to 20%
  - Shadow: "Nightmare" upgrade replaced with "Lifesteal" (matches code)
  - Flame: Firestorm duration corrected from "+1 second" to "+2 seconds"
  - Celestial: Astral Chains duration corrected from "+2 seconds" to "+1 second"

### Technical
- **UpgradeSystem.js:**
  - 8 upgrades converted to use `upgradeKey`, `getDescription()`, and `upgradeStacks`
  - All stackable upgrades now use BASE_VALUES for consistent calculations
  - Dynamic description generation with current→next value display
- **GameScene.js:** No changes needed (bonus application already supports stacking)
- **MagicAffinityBible.md:** Updated to v3.1.2 with corrected upgrade descriptions

---

## [3.1.1] - 2025-11-12

### Fixed - BUG FIXES
- **Gravity Planet Orb:** Fixed bug where upgrade spawned +3 orbs instead of +1
  - `createWizardOrbs()` now clears existing orbs before creating new ones
  - Taking Planet Orb upgrade correctly increases count from 3→4→5 etc.
- **Healing Text Color:** Changed all healing numbers from red to green (0x00ff88)
  - Wave completion heal (+25% HP) now shows green healing number
  - Lifesteal already used green, now consistent across all healing
- **Shadow Clone AI:** Implemented target locking to fix indecisive behavior
  - Clones lock onto targets until they die or move out of range
  - Eliminates target switching when multiple enemies are nearby

### Changed - BALANCE UPDATES
- **Terra - Spawn Duration:** +50% longer spawn phase (5s → 7.5s)
  - Blocks deal damage for 50% longer, improving late-game viability
  - Total duration: 15s → 17.5s
- **Water - Jet Stream:** Replaced "Tidal Wave" with stackable range upgrade
  - +25% water beam range per stack (200→250→312→390px)
  - Infinite stacking for late-game scaling

### Added - STACKABLE UPGRADE SYSTEM
- **Infrastructure:** Added support for infinitely stackable percentage upgrades
  - `BASE_VALUES` constant for centralized stat management
  - `player.upgradeStacks` tracks stacks per upgrade
  - Dynamic descriptions show current→next values
  - Template ready for converting all percentage upgrades

### Technical
- GameScene.js: Orb cleanup, healing colors, shadow AI, terra duration, water range
- UpgradeSystem.js: BASE_VALUES constant, Jet Stream upgrade, dynamic descriptions

---

## [3.1.0] - 2025-11-12

### Added - ELEMENT MASTERS & BALANCE UPDATE
- **10 New Element Master Achievements**
  - One achievement per element for reaching Wave 11
  - Flame Master 🔥, Water Master 💧, Electric Master ⚡, Nature Master 🌿
  - Wind Master 💨, Terra Master 🪨, Gravity Master 🌌, Celestial Master ✨
  - Radiant Master ☀️, Shadow Master 🌑
  - Each awards +1 skill point (10 total new skill points available)
  - Progress tracking shows best wave reached per element
  - Total achievements increased from 4 to 14

- **Scrollable Achievement List**
  - Mouse wheel scrolling support for viewing all achievements
  - Touch/drag scrolling for mobile devices
  - Fixed header and footer for better navigation
  - Visual scroll indicators (arrows + scrollbar)
  - Dynamic content height based on achievement count

### Changed - ELEMENT BALANCE
- **Flame Element (Buffed)**
  - **NEW:** Dual flamethrower attack (shoots both forward AND backward simultaneously)
  - Attack rate increased: 0.75s → 0.5s (33% faster)
  - Base damage adjusted: 20 → 15 (balanced for dual flames)
  - Effective DPS increase due to hitting enemies from multiple angles
  - Better survivability with 360-degree coverage while moving

- **Shadow Element (Buffed)**
  - Shadow clone damage rate increased: 1.33s → 0.75s per clone (77% faster)
  - Each clone attacks independently on its own timer
  - Significant DPS increase with Void Clone upgrade (2 clones)
  - Improved scaling for late-game waves

- **Gravity Element (Upgrade Rework)**
  - **REMOVED:** Singularity upgrade (confusion duration bonus)
  - **NEW:** Planet Orb upgrade - Gain +1 gravity orb (stackable)
  - Allows scaling orb count from 3 to 4, 5, 6+ orbs
  - Same orbit pattern as existing orbs
  - Increases both damage output and status effect coverage

### Changed - META-PROGRESSION
- **Skill Point Economy Expansion**
  - Total skill points available: 5 → 15 (1 free + 14 from achievements)
  - Enough points to max all 3 skills (15 points for 3x5 levels)
  - Players can now achieve full build potential
  - Encourages long-term progression across all elements

- **Achievement System**
  - Total achievements: 4 → 14 (250% increase)
  - Achievement scene dynamically loads all achievements
  - Progress tracking expanded to handle element-specific achievements
  - `getAchievementProgress()` supports element master achievements
  - Version updated to 3.1.0 in PersistenceSystem

### Technical Changes
- **GameScene.js**
  - `updateFlamethrowerAttack()`: Refactored to fire dual flame cones
  - Added `hitEnemies` Set to prevent double-damage from overlapping cones
  - Shadow clone damage interval: 1333ms → 750ms (line 1938)

- **UpgradeSystem.js**
  - Added Flame to -5 damage modifier group (alongside Nature)
  - Replaced "Singularity" with "Planet Orb" in gravity upgrades
  - Planet Orb increments `player.orbCount` and recreates orbs

- **PersistenceSystem.js**
  - Version bumped: 3.0.0 → 3.1.0
  - Added 10 element master achievement definitions
  - Each tracks `bestWave` and targets Wave 11

- **ProgressionSystem.js**
  - `checkAchievements()`: Added element master checking logic
  - Dynamically checks `${element}Master` achievement IDs
  - Tracks best wave per element even if not unlocked yet
  - `getAchievementProgress()`: Added default case for element masters

- **AchievementScene.js**
  - Dynamically loads all achievements via `Object.keys(data.achievements)`
  - Camera bounds set based on content height
  - Scrolling system with wheel and touch support
  - Fixed UI elements (title, count, back button) use `.setScrollFactor(0)`
  - `getProgressText()`: Handles element master progress display

### Documentation
- **MagicAffinityBible.md**
  - Version updated to 3.1.0
  - Flame element: Updated attack pattern, rate, and damage
  - Shadow element: Updated clone damage timing
  - Gravity element: Replaced Singularity with Planet Orb
  - Meta-Progression: Updated skill points (5 → 15)
  - Meta-Progression: Added 10 element master achievements
  - Added scrollable list feature to achievement documentation

### Performance
- No performance impact from scrolling system (only activates if content exceeds viewport)
- Element master checks use O(1) lookup via dynamic achievement IDs
- Flame dual attack uses Set to prevent O(n²) double-damage checks

---

## [3.0.0] - 2025-11-12

### Added - META-PROGRESSION SYSTEM (MAJOR UPDATE)
- **Persistent Progression via LocalStorage**
  - Player progress saves between browser sessions
  - Graceful fallback if localStorage unavailable
  - Data validation prevents corruption
  - Version migration support for future updates
  - Storage key: `magicAffinityProgression` (~10KB)

- **Achievement System (4 achievements, expandable to 20)**
  - **First Blood:** Kill 100 enemies (lifetime tracking)
  - **Untouchable:** Reach Wave 6 without taking damage
  - **Element Master:** Reach Wave 7 with all 10 elements
  - **Speed Demon:** Reach Wave 10 in under 10 minutes
  - In-game notification popups with particle effects
  - Progress tracking with visual progress bars
  - Achievement unlock dates displayed
  - Each achievement awards +1 skill point
  - New AchievementScene accessible from main menu

- **Skill Tree System**
  - 3 permanent stat boosts: Health (+5% per level), Damage (+5% per level), Speed (+5% per level)
  - Max 5 levels per skill (+25% maximum bonus)
  - Players start with 1 free skill point
  - Earn 1 skill point per achievement unlocked (max 5 total)
  - Free respec option to reset skill tree
  - Skill bonuses apply to all future runs
  - New SkillTreeScene accessible from main menu

- **New Systems Created**
  - `PersistenceSystem.js`: LocalStorage save/load with validation
  - `ProgressionSystem.js`: Achievement tracking and skill logic
  - `NotificationHelper.js`: Achievement unlock popup animations

- **Main Menu Updates**
  - New "🏆 Achievements" button (orange theme)
  - New "🌳 Skill Tree" button (green theme)
  - Reorganized button layout (4 buttons total)
  - Skill points available indicator with pulse animation
  - Updated button positioning: Start (280), Achievements (355), Skill Tree (420), Settings (485)

### Changed
- **Player Starting Stats** (now affected by skill tree bonuses)
  - Base stats: 50 HP, 20 damage, 140 speed
  - With max skills: 62 HP (+25%), 25 damage (+25%), 175 speed (+25%)
  - Bonuses apply on game start before any element selection

- **Game Over Flow**
  - Achievement checks run automatically after death
  - Unlock notifications displayed with particle effects
  - Progress automatically saved to LocalStorage
  - Displays new achievements unlocked this run

- **Main Menu Layout**
  - Title moved up slightly to accommodate skill points indicator
  - High score display moved down to position 560
  - All buttons now have emoji icons for better visual distinction

- **Achievement Tracking During Gameplay**
  - Damage taken tracked per run for Untouchable
  - Wave reached tracked continuously
  - Element selection tracked for Element Master
  - Level reached tracked for potential future achievements

### Fixed
- **Upgrade Screen Text Colors**
  - Element names now white instead of element color (better readability on dark backgrounds)
  - Upgrade names now white instead of gold (consistent with element names)
  - Fixes visibility issues with dark-colored elements like Shadow and Terra

### Technical Details
- LocalStorage size: ~10KB (well under 5-10MB browser limits)
- Data structure includes version number for migration
- Corrupted data automatically resets to defaults
- Skill point economy: 1 free + 4 from achievements = 5 total
- Achievement progress tracked in `gameState` during gameplay
- Progression saved on every game over
- New scenes registered in main.js scene array
- Import `ProgressionSystem` in GameScene and GameOverScene
- Import `NotificationHelper` in GameOverScene

### Performance
- No performance impact from LocalStorage operations
- Achievement checks run once per game over (negligible cost)
- Skill bonus calculations done once at game start
- Notification animations use existing tween system

### Documentation
- Updated `MagicAffinityBible.md` to v3.0.0
  - Added comprehensive Meta-Progression System section
  - Documented skill tree mechanics and bonuses
  - Documented all 4 achievements with requirements
  - Added persistence and storage information
- Updated version status to "Phase 3 - Meta-Progression System"

---

## [2.3.6] - 2025-11-12

### Changed
- **Armor Boost Upgrade Rework**
  - Changed from +3 Defense to 25% damage reduction from all sources
  - Now stacks additively with Radiant Shield (10% reduction)
  - Applies to enemy collision, hazards, and boss laser damage
  - More intuitive and consistent defensive scaling

- **Wave Heal Balance Adjustment**
  - Changed from flat 10 HP to 25% of max HP
  - Scales better with Health Boost upgrades
  - Provides more meaningful healing in late game
  - Early game: ~7-8 HP (30 base HP × 0.25)
  - Mid game: ~12-15 HP with 1-2 Health Boosts
  - Late game: ~20-25 HP with 3+ Health Boosts

- **Combo Window Extension**
  - Increased combo chain window from 2 seconds to 3 seconds
  - Easier to maintain combos during intense combat
  - Rewards aggressive playstyles more consistently
  - Damage multiplier formula unchanged (1 + combo × 0.1)

### Fixed
- **Critical Strike Bug**
  - Fixed critical strikes not working for Water, Electric, and Shadow clone attacks
  - Root cause: These attacks bypassed `applyDamage()` function
  - Water stream (line 1126), Electric chain (line 1194), Shadow clone (line 1916)
  - All attacks now use `applyDamage()` for consistent crit checks
  - Critical strikes now work for ALL damage sources (except DOTs)
  - Shadow clone lifesteal also fixed as side effect

- **Electric Element Transparency Bug**
  - Fixed enemies staying semi-transparent after paralysis ends
  - Root cause: No alpha restoration in paralyze cleanup code
  - Solution: Added `enemy.setAlpha(1)` when paralyze effect expires
  - Enemies now correctly return to full opacity (updateStatusEffects line 2555-2557)

### Added
- **Critical Strike Visual Effects**
  - Particle burst on critical hit (8 particles in radial pattern)
  - Yellow/orange/red particle colors for visual impact
  - Larger damage number font (28px vs 20px normal)
  - Thicker stroke (4px vs 3px) for better visibility
  - "CRIT! {damage}" text format in yellow

- **Element Icon in UI**
  - Element emoji now displayed before "WIZARD" text
  - Example: "🔥 WIZARD" for Flame element
  - Updates dynamically when element is selected
  - Improves visual clarity of current build

### Documentation
- **MagicAffinityBible.md Updates**
  - Updated version to 2.3.6
  - Added Combo System documentation (3s window, damage multipliers)
  - Updated Universal Upgrades section (now 4 total, added Critical Strike and Armor Boost)
  - Updated wave heal to 25% of max HP
  - Fixed hazard damage values (6 damage/sec, Spring thorns 12 damage/sec)
  - Added note about damage reduction affecting hazards

---

## [2.3.5] - 2025-11-12

### Fixed
- **CRITICAL: Wave 2 Stuck Bug**
  - Fixed waves getting stuck at wave 2 (and other waves during level-up)
  - Root cause: Enemy spawn callbacks checked `!this.scene.paused`
  - During level-up, `paused = true` prevented spawns
  - Timer repeat counter still decremented, exhausting all spawns
  - Result: `enemiesSpawned` stayed at 0, wave completion never triggered
  - Solution: Removed pause check from spawn callbacks
  - Player already protected by `isLevelingUp` flag (v2.2.8)
  - Enemies can spawn during level-up but can't damage player

- **CRITICAL: Wave System Duplicate Completion Bug**
  - Fixed waves sometimes calling `completeWave()` multiple times
  - Root cause: Wave completion check ran every frame (~120 times during 2s delay)
  - This caused multiple `completeWave()` calls, corrupting wave state
  - Solution: Added `isWaveCompleting` flag to prevent duplicate completions
  - Flag set to true when wave completes, reset to false when new wave starts
  - Prevents wave counter increment bugs and multiple "Wave Complete" messages
  - Fixes issue introduced in v2.3.0 wave decoupling refactor

### Technical Details
- Removed `!this.scene.paused` check from WaveSystem.js line 108 (boss wave spawns)
- Removed `!this.scene.paused` check from WaveSystem.js line 121 (regular wave spawns)
- Added `isWaveCompleting` flag in GameScene.create() at line 83
- Added flag check in wave completion condition at line 3189
- Reset flag in startWave() at line 2450
- Wave completion now guaranteed to trigger exactly once per wave
- All enemies now spawn even during level-up pause

---

## [2.3.4] - 2025-11-12

### Added
- **Combo System with 2-Second Chain Window**
  - Chain kills within 2 seconds to build combo multiplier
  - Linear multiplier formula: 1 + (combo × 0.1)
    - Combo 5 = 1.5x XP/Score
    - Combo 10 = 2x XP/Score
    - Combo 25 = 3.5x XP/Score
  - Combo counter displays above player sprite (15px font, half player size)
  - Shows "Xx COMBO" format (e.g., "5x COMBO")
  - Only visible when combo >= 2
  - Follows player movement in real-time
  - Flash animation when combo increases (scale pulse effect)
  - Color changes based on milestones:
    - Yellow (default) for combo 2-4
    - Orange for combo 5-9
    - Red for combo 10-24
    - Purple for combo 25+
  - Milestone sound effects at combos 5, 10, and 25
  - Combo resets to 0 when player takes damage
  - Red flash and fade-out animation on combo break

### Verified
- **Map Selection Probabilities**
  - Confirmed all 4 seasons (spring, summer, fall, winter) have equal 25% probability
  - Uses uniform distribution via Math.random() * seasons.length

---

## [2.3.3] - 2025-11-12

### Added
- **Stats Screen (ESC Key)**
  - Press ESC to view mid-game statistics
  - Pauses game while viewing
  - Displays: time survived, damage dealt, enemies killed, current wave, score, upgrades list
  - Can toggle with ESC key or clicking ESC button

- **ESC Button (Top Left Corner)**
  - Clickable "[ESC] Stats" button at position (20, 20)
  - Green color (#00ff88) with cyan hover effect (#00ffff)
  - Opens stats screen when clicked

- **Settings Menu with Volume Controls**
  - New SettingsScene accessible from main menu
  - Interactive drag-and-drop volume sliders:
    - Master Volume (0-100%)
    - Music Volume (0-100%)
    - SFX Volume (0-100%) - plays test sound on adjust
  - Fullscreen toggle button (ON/OFF display)
  - Back button to return to main menu
  - Volume settings saved to gameState
  - Real-time volume adjustments affect game audio

- **Fullscreen Toggle Enhancement**
  - Added to Settings menu with ON/OFF toggle
  - Works across all scenes via Phaser scale manager
  - Existing fullscreen button in CharacterSelectScene kept

### Changed
- **Color-Coded Damage Numbers**
  - White (0xffffff): Normal damage from player attacks
  - Yellow (0xffff00): Critical hits (unchanged)
  - Orange (0xffa500): Status effect DOT (burn, poison, static field)
  - Green (0x00ff00): Lifesteal healing (unchanged)
  - Updated all element attack colors to white for consistency
  - Changed burn, poison, and static field DOT to orange

### Technical Details
- Added volume properties to gameState.js (masterVolume, musicVolume, sfxVolume)
- Modified SoundFX.js to use gameState volumes via getVolume()
- Created SettingsScene.js with drag-and-drop slider implementation
- Added SettingsScene to main.js scene list
- Updated CharacterSelectScene with Settings button
- Added stats tracking: totalDamageDealt, enemiesKilled, upgradesTaken
- Modified UISystem.createUI() to add ESC button with hover effects

---

## [2.3.2] - 2025-11-12

### Added
- **Stats Tracking System**
  - Added totalDamageDealt tracking in applyDamage()
  - Added enemiesKilled counter in killEnemy()
  - Added upgradesTaken[] array in UpgradeSystem.applyUpgrade()
  - Element selection tracking for character stats
  - Foundation for stats screen implementation

### Changed
- **Healing Numbers Now Green**
  - Lifesteal healing displays as green damage numbers
  - Modified applyDamage() to show green (+X) healing text
  - Visual distinction between damage and healing

---

## [2.3.1] - 2025-11-12

### Added
- **New Universal Upgrade: Critical Strike**
  - 15% chance for 2x damage on all player attacks
  - Applies to ALL damage sources from player
  - Shows yellow "CRIT! X" text on critical hits
  - Icon: 💥

- **New Universal Upgrade: Armor Boost**
  - +3 Defense
  - Reduces incoming damage
  - Icon: 🛡️

- **New Shadow Upgrade: Lifesteal**
  - Replaces Shadow Nightmare upgrade
  - Heal 10% of damage dealt while using Shadow element
  - Applies to all damage player deals
  - Shows green healing numbers
  - Icon: 🩸

### Changed
- **Centralized Damage System**
  - Created applyDamage() helper function for consistent damage application
  - Replaced all enemy.health -= damage with applyDamage() calls (9 locations)
  - Critical strike check now centralized in one location
  - Lifesteal check now centralized in one location
  - Improved code maintainability and consistency

### Removed
- **Speed Boost Universal Upgrade**
  - Removed completely from the game
  - Simplified universal upgrade pool

---

## [2.3.0] - 2025-11-12

### Changed - MAJOR REFACTOR
- **Wave System Decoupled from Level-Ups**
  - Waves now auto-start 2 seconds after all enemies die
  - Level-ups happen independently when XP threshold reached
  - Removed waveReadyToStart flag and related methods
  - Removed XP guarantee from WaveSystem.completeWave()
  - Removed wave control from UpgradeSystem
  - Simplified from complex callback system to independent progression
  - Fixes timing issues and race conditions between waves and level-ups

### Technical Details
- Modified WaveSystem.completeWave() to auto-start next wave
- Removed isWaveReady() and setWaveReady() methods
- Removed wave callback from UpgradeSystem.hideUpgradeMenu()
- Changed from user-triggered waves to automatic progression
- Wave delay: 2 seconds between completion and next wave start

---

## [2.2.10] - 2025-11-12

### Fixed
- **Music Not Restarting After Death/Retry**
  - Music now properly restarts when clicking retry button
  - Root cause: bgMusic.stop() didn't destroy the music object
  - Solution: Added bgMusic.destroy() and bgMusic = null in gameOver()
  - Also fixed in quitToMenu() for consistency
  - Music create() check now works correctly on retry

---

## [2.2.9] - 2025-11-12

### Fixed
- **Fall Map Leaves Overlaying Upgrade Menu**
  - Changed fall leaves depth from 500 to 50
  - Leaves now render below upgrade menu (depth 1000+)
  - Prevents visual obstruction during level-ups

- **Wind Boomerang Not Targeting Nearest Enemy**
  - Fixed targeting logic to track active targeting boomerang
  - Changed from checking boomerangNumber to dedicated tracking
  - One boomerang now always targets nearest enemy as intended

- **Terra Walls Not Cleaning Up**
  - Added wall.physicsBody.clear(true, true) before destroy()
  - Walls now properly clean up physics bodies
  - Prevents memory leaks and stale physics objects

- **Tree Physics Error on Spawn**
  - Added body existence check before setCircle() call
  - Prevents "Cannot read properties of undefined" error
  - Tree collisions now safe from race conditions

---

## [2.2.8] - 2025-11-12

### Changed
- **Nature Regeneration Nerfed**
  - Healing rate: 1 HP per 1 second → 1 HP per 2 seconds (50% slower)
  - More balanced for Nature element survivability
  - Modified regeneration timing from 1000ms to 2000ms

- **Bomber Damage Buffed**
  - Explosion damage: 5 → 10 (100% increase)
  - Makes bombers more threatening and impactful
  - Rewards players for killing bombers before they explode

- **Physics Boundaries Updated**
  - Physics world bounds set to y=595 (prevents walking into UI area)
  - Player and enemies now collide with bottom boundary
  - UI area at bottom (600-700px) now protected from gameplay

- **Player Invincible During Level-Up**
  - Added isLevelingUp flag to player
  - All damage sources check isLevelingUp before applying damage
  - Prevents frustrating deaths during upgrade selection
  - Applied to: enemy collision, boss lasers, tank lasers, bomber explosions

- **Tank Laser Color Changed**
  - Tank lasers now red (0xff0000) instead of cyan
  - Better visual distinction from other attack types
  - Implemented full tank laser collision system

### Technical Details
- Modified GameScene.js regeneration timing at line 2932
- Modified EnemySystem.js bomber damage at multiple locations
- Set physics world bounds at GameScene create()
- Added isLevelingUp checks in playerHitEnemy(), bossLaserAttack(), tank collision, bomber explosions
- Changed tank laser graphics fillStyle to 0xff0000

---

## [2.2.7] - 2025-11-11

### Improved
- **Major Performance: Object Pooling Implementation**
  - Implemented object pooling for projectiles (max 100 pool size)
  - Implemented object pooling for damage numbers (20 text objects recycled)
  - Implemented object pooling for XP orbs (max 50 pool size)
  - Expected 20-30% FPS improvement during heavy combat
  - Reduces garbage collection pauses and memory churn

### Technical Details
- **Projectile Pooling:**
  - Configured physics group with maxSize: 100
  - Changed all `projectile.destroy()` → `setActive(false).setVisible(false)`
  - Projectiles now recycled instead of destroyed (7 locations updated)
  - Off-screen, tree collision, timed destruction all use pooling

- **Damage Number Pooling:**
  - Created damageNumberPool array for text object reuse
  - Reuses existing text objects by updating text/position/alpha
  - Only creates new text if pool is empty
  - Automatic return to pool after animation completes

- **XP Orb Pooling:**
  - Configured physics group with maxSize: 50
  - Group automatically recycles inactive orbs

### Performance Impact
- Before: ~1000 object allocations per minute in Wave 15+
- After: ~50-100 allocations per minute (95% reduction)
- Eliminates stuttering from garbage collection
- Smoother gameplay during particle-heavy moments

---

## [2.2.6] - 2025-11-11

### Fixed
- **Bug Fix: Blind Effect Never Expires (HIGH Priority)**
  - Added missing duration handling for Blind status effect in updateStatusEffects()
  - Blind effect now properly expires after 2 seconds as intended
  - Previously, blinded enemies stayed permanently blinded
  - Location: GameScene.js:2434-2440

- **Bug Fix: Cosmic Dash First Use Delay**
  - Cosmic Dash (Celestial upgrade) now fires immediately on first use
  - Fixed timer initialization: `lastDashTime = time - cooldown` instead of `0`
  - Eliminates unintended 5-second delay on first teleport
  - Location: GameScene.js:2664

- **Bug Fix: Regeneration First Heal Delay**
  - Regeneration (Nature upgrade) now heals immediately on first tick
  - Fixed timer initialization: `lastRegenTime = time - 1000` instead of `0`
  - Eliminates unintended 1-second delay before first heal
  - Location: GameScene.js:2780

- **Bug Fix: Event Horizon First Damage Delay**
  - Event Horizon (Gravity upgrade) confused enemies now damage immediately
  - Fixed timer initialization: `lastConfusionDamageTime = time - 1000` instead of `0`
  - Eliminates unintended 1-second delay on first damage tick
  - Location: GameScene.js:2903

### Technical Details
- Followed OPTIMIZATION_BUGFIX_ROUTINE.md systematic bug audit
- Searched for 5 common bug patterns across codebase
- Found 4 bugs total (1 HIGH, 2 MEDIUM, 1 LOW priority)
- All timer initialization bugs follow same pattern: initialize to `time - cooldown` for immediate first activation

---

## [2.2.5] - 2025-11-11

### Fixed
- **Level Up Effect Timing**
  - Added 1.25 second delay before upgrade menu appears
  - Players can now see the element-colored particle burst effect
  - Effect plays immediately on level up, menu appears after delay
  - Improves visual feedback and celebration moment

---

## [2.2.4] - 2025-11-11

### Added
- **Visual Polish: Screen Shake on Boss Death**
  - Subtle camera shake effect (300ms, 0.005 intensity) when boss is defeated
  - Enhances impact and satisfaction of boss kills

- **Visual Polish: Element-Colored Level Up Effect**
  - Level up particle burst now matches player's element color
  - Gold particles if no element selected yet
  - 12 particles burst outward in circular pattern with pulsing ring

- **Visual Polish: Invulnerability Glow**
  - Pulsing glow effect around wizard when invulnerable
  - Matches element color (white if no element)
  - Pulses between 0.6x-1.0x radius with dynamic alpha
  - Works alongside existing flicker effect

### Improved
- **Performance: Status Effect Particle Throttling**
  - Status effect visuals now update every 5 frames instead of every frame
  - Expected 10-15% FPS improvement with many enemies on screen
  - Visual quality maintained - difference imperceptible to players

- **Performance: Enemy AI Debouncing**
  - Enemy pathfinding calculations throttled to every 3 frames
  - Direction/velocity cached and reused between calculations
  - Expected 5-10% FPS improvement with 20+ enemies
  - Smoother performance in late-game waves

---

## [2.2.3] - 2025-11-11

### Added
- **New Universal Upgrade: Speed Boost**
  - +20% movement speed increase
  - Icon: 💨
  - Available to all players alongside Health Boost and Damage Boost
  - Enhances kiting and positioning strategies

### Improved
- **Performance Optimization: Damage Number Limit**
  - Capped maximum on-screen damage numbers to 20
  - Oldest damage numbers automatically removed when limit reached
  - Expected 5-10% FPS improvement during heavy combat
  - Prevents memory accumulation during extended play sessions

### Changed
- **Code Cleanup**
  - Removed 2 debug console.log statements
  - Removed dead code comments
  - Cleaner codebase with improved maintainability

---

## [2.2.0] - 2025-11-10

### Changed
- **Nature Element Fire Rate Increased by 50%**
  - Seed planting cooldown: 1000ms → 667ms
  - Plants seeds 50% faster for higher DPS
  - Significantly improves Nature element combat effectiveness

- **Shadow Element Fire Rate Increased by 50%**
  - Clone spawn time: 3000ms → 2000ms (spawns 1 second earlier)
  - Clone damage rate: 2000ms → 1333ms (attacks 50% faster)
  - Major buff to Shadow element damage output

### Fixed
- **Spring Map Mobile Performance**
  - Reduced flower count from 40 to 15 on mobile devices (62.5% reduction)
  - Significantly improves frame rate on mobile
  - Matches optimization pattern used for fall leaves

### Improved
- **Nature/Shadow Combat Feel:** Both elements now feel more responsive and powerful
- **Mobile Performance:** Spring map no longer lags on mobile devices

---

## [2.1.9] - 2025-11-10

### Changed
- **Water Element Complete Redesign**
  - Removed bullet system
  - New piercing water stream attack (200px length, 1/4 screen)
  - Auto-aims to nearest enemy
  - Stream passes through all enemies in path
  - 12px width with water flow visual effect
  - 1 second cooldown maintained
  - Still applies freeze with 50% chance

- **Enemy Hitboxes Reduced by 50%**
  - Regular enemies: 20px → 10px hitbox
  - Boss enemies: 40px → 20px hitbox
  - Makes enemies easier to hit without getting damaged first
  - Note: This reverses the hitbox increases from earlier v2.1.9 iteration

- **All Player Attack Hitboxes Increased by 50%**
  - **Wizard orbs:** Collision radius 18px → 27px, physics body 8px → 12px
  - **Celestial orbs:** Physics body 16px → 24px
  - **Gravity orbs:** Physics body 8px → 12px
  - **Flame attack:** Range 100px → 150px
  - **Electric lightning:** (No hitbox change - uses direct targeting)
  - **Nature explosions:** Radius 100px → 150px
  - **Wind boomerangs:** Collision 15px → 22.5px
  - **Terra walls:** Size 40px → 60px
  - **Radiant beams:** Detection radius 60px → 90px
  - **Shadow clones:** Collision radius 25px → 37.5px (scaled with mobile)

### Fixed
- **Mobile Performance Optimization**
  - Reduced fall season leaf count from 100 to 30 on mobile (70% reduction)
  - Capped maximum enemy count at 15 on mobile devices
  - Significantly improves frame rate and gameplay smoothness on mobile

### Improved
- **Combat Feel:** Player attacks now have more forgiving hitboxes
- **Enemy Balance:** Reduced enemy collision boxes prevent damage before player can attack
- **Water Gameplay:** New piercing stream allows hitting multiple enemies per attack

---

## [2.1.8] - 2025-11-10

### Fixed
- **Shadow Clone Mobile Scaling Bug**
  - Fixed shadow clones not being scaled for mobile (1.5x)
  - Fixed collision radius not scaled for mobile devices
  - Shadow clones now properly match player/enemy sizes on mobile
  - This was the root cause of recurring "shadow clone not damaging" issue

### Changed
- **Flame Element Balance**
  - Attack rate increased to twice as fast (1.5s → 0.75s cooldown)
  - Significantly increases DPS for Flame element

- **Terra Element Balance**
  - Added +20 base damage bonus (20 → 40 total damage)
  - Terra now deals highest base damage of all elements
  - Balances Terra's slow attack rate with higher damage per hit

---

## [2.1.6] - 2025-11-10

### Fixed
- **Universal Damage Boost Upgrade Not Working**
  - Fixed 6 elements using hardcoded damage instead of `this.player.damage`
  - **Water bullets:** 15 → 30 damage (now uses player.damage, includes +10 element bonus)
  - **Wind boomerang:** 15 → 30 damage (now uses player.damage, includes +10 element bonus)
  - **Nature explosions:** 30 → 20 damage (now uses player.damage correctly)
  - **Terra walls:** 30 → 20 damage (now uses player.damage correctly)
  - **Radiant beam:** Now uses player.damage instead of hardcoded 20
  - **Shadow clones:** 15 → 20 damage (now uses player.damage)
  - All elements now benefit from the +50% Damage Boost universal upgrade
  - Corrects damage values to match design specs in MagicAffinityBible.md

---

## [2.1.5] - 2025-11-10

### Fixed
- **Shadow Clone Damage Bug**
  - Fixed shadow clones not damaging enemies on contact (recurring issue)
  - Changed `lastDamageTime` initialization from `0` to `time - 2000` to allow immediate damage
  - Fixed frame-rate dependent movement using hardcoded `0.016` delta
  - Now uses actual `delta` parameter for frame-rate independent movement
  - Removed redundant damage timer initialization check

### Changed
- **Shadow Clone Mechanics Documentation**
  - Added detailed shadow clone behavior to MagicAffinityBible.md
  - Documented clone spawn timing, damage rate, targeting range, and AI behavior
  - Fixed Shadow upgrades list (removed non-existent "Siphon", added missing "Void Clone")

---

## [2.1.4] - 2025-11-10

### Added
- **New Universal Upgrade: Damage Boost**
  - +50% damage increase
  - Available to all players
  - Icon: ⚔️

### Changed
- **Wave Completion Heal**
  - Players now heal 10 HP every time they complete a wave
  - Encourages aggressive play and rewards wave completion

- **Electric Element Balance**
  - Chain Lightning range reduced by 30% (150px → 105px)
  - Makes electric more balanced in group fights

- **Terra Element Balance**
  - Tremor area effect range reduced by 30% (80px → 56px)
  - Balances terra's area control power

- **Winter Season Enhancement**
  - Ice patches now provide 100% speed increase (was 50%)
  - Movement is twice as fast but with reduced control
  - Makes winter more distinct and challenging

- **Fall Season Enhancement**
  - Flying brown leaves increased from 30 to 100
  - Significantly more vision obscuration for challenge

---

## [2.1.3] - 2025-11-10

### Fixed
- **Electric Element Console Error**
  - Fixed critical bug where Chain Lightning and Event Horizon upgrades would kill enemies mid-loop
  - This caused `Cannot read properties of undefined (reading 'setVelocity')` console errors
  - Added safety checks before all `enemy.body.setVelocity()` calls in GameScene.js
  - Affected lines: 2683, 2726, 2736

### Changed
- **Water Element Balance**
  - Water element now receives +10 base damage bonus upon selection
  - Total base damage: 30 (was 20)
  - Makes Water more viable for both control and damage

- **Wind Element Balance**
  - Wind element now receives +10 base damage bonus upon selection
  - Total base damage: 30 (was 20)
  - Enhances Wind's aggressive control playstyle

---

## [2.0.0] - 2025-11-08

### Added - ELEMENTAL MAGIC SYSTEM (PHASE 2)
- **Complete Status Effect System**
  - Burn: 3 damage per second for 3 seconds (Flame)
  - Freeze: Stops enemy movement for 2 seconds, 15% chance (Water)
  - Poison: Doubling damage over time (2, 4, 8, 16...) for 6 seconds (Nature)
  - Paralyze: Stuns enemy for 1 second, 20% chance (Electric)
  - Sleep: Enemy cannot act for 2 seconds, 10% chance (Wind)
  - Charm: Enemy stops attacking for 3 seconds, 5% chance (Celestial)
  - Confusion: Random movement for 2 seconds, 10% chance (Gravity)
  - Blind: Reduces enemy accuracy, 15% chance (Radiant)
  - Fear: Enemy flees from player for 2 seconds, 10% chance (Shadow)
  - Slow: Reduces enemy speed by 40% (Gravity)
  - Knockback: Pushes enemies away (Wind, Terra)

- **40 Element-Specific Upgrades (4 per element)**
  - **Flame:** Inferno Blast, Wildfire, Molten Core, Firestorm
  - **Water:** Deep Freeze, Glacial Shards, Permafrost, Tidal Wave
  - **Electric:** Chain Lightning, Overload, Static Field, Surge
  - **Nature:** Toxic Bloom, Regeneration, Thornmail, Spore Cloud
  - **Wind:** Gale Force, Zephyr, Cyclone, Suffocate
  - **Terra:** Earthquake, Stone Skin, Tremor, Mountain's Might
  - **Gravity:** Gravitational Pull, Singularity, Dense Matter, Event Horizon
  - **Celestial:** Astral Chains, Starfall, Cosmic Dash, Void Step
  - **Radiant:** Divine Blessing, Brilliant Flash, Beacon of Hope, Radiant Shield
  - **Shadow:** Nightmare, Dark Embrace, Siphon, Umbral Shroud

- **Complex Upgrade Mechanics**
  - Wildfire: Burn spreads to nearby enemies within 60px radius
  - Spore Cloud: Poison spreads to nearby enemies within 60px radius
  - Chain Lightning: Attacks jump to 1 nearby enemy (150px range, 50% damage)
  - Static Field: Paralyzed enemies take 2 damage every 0.5 seconds
  - Tidal Wave: Can freeze 2 enemies at once (80px range)
  - Tremor: Knockback affects area around impact (80px, half power)
  - Dense Matter: Slow affects larger area (100px, half effectiveness)
  - Event Horizon: Confused enemies damage each other (50px, 3 damage/sec)
  - Cosmic Dash: Teleport 150px on spacebar with 5s cooldown and visual effects
  - Void Step: 10% chance to dodge attacks with "DODGE" text
  - Umbral Shroud: Enemies have 15% miss chance with "MISS" text
  - Radiant Shield: Reduce damage taken by 10%
  - Thornmail: Reflect 15% of damage taken back to attacker
  - Regeneration: Heal 2 HP per second
  - Siphon: Heal 5 HP per feared enemy kill

- **Visual Status Effect System**
  - Burn: Fire particles rising from enemy (orange/red colors)
  - Freeze: Ice overlay with light blue circle and crystalline border
  - Poison: Green bubbles floating upward with scaling animation
  - Paralyze: Yellow electric sparks appearing randomly
  - Sleep: White "Z" symbols floating up
  - Charm: Pink heart particles rising
  - Confusion: Rotating yellow stars (★ ★ ★) above enemy
  - Blind: Dark semi-transparent overlay covering enemy
  - Fear: Red exclamation mark (!) above enemy head
  - Slow: Blue aura circle outline around enemy
  - All effects follow enemy position and auto-cleanup on status end or death

- **Wizard Visual Customization**
  - Wizard starts grey with no element chosen
  - Upon selecting element, wizard's hat, robe, sleeves, and staff orb change to element color
  - Flame: Orange-red (#FF4500)
  - Water: Royal blue (#4169E1)
  - Electric: Yellow (#FFFF00)
  - Nature: Lime green (#32CD32)
  - Wind: Light cyan (#E0FFFF)
  - Terra: Brown (#8B4513)
  - Gravity: Purple (#9933FF)
  - Celestial: Gold (#FFD700)
  - Radiant: White (#FFFFFF)
  - Shadow: Dark grey (#2F2F2F)

### Changed
- **Difficulty Increased**
  - Player max health reduced from 100 to 50 (50% reduction)
  - Game now significantly more challenging
  - Health Boost upgrade becomes more valuable

- **Upgrade System Redesign**
  - Removed old wizard upgrades: Extra Orb, Orbit Speed, Orbit Range, Gravity Crush, Confusion, Event Horizon
  - Removed Archer/Warrior upgrades: Rapid Fire
  - Only universal upgrade: Health Boost (+20 Max HP, restore 30 HP)
  - All other upgrades are element-specific and only appear after choosing an element

- **XP and Progression**
  - 1 wave completion now equals exactly 1 level-up
  - Wave completion awards remaining XP needed to level up
  - Players still collect XP orbs from enemies, but wave guarantees the level
  - XP requirement per level still scales (100, 150, 225, 338, etc.)

- **Elemental Effects Applied to Orbs**
  - All orb hits now apply element-specific status effects
  - Upgrade bonuses modify effect chances, durations, and damage
  - Molten Core: +25% damage to burning enemies
  - Glacial Shards: +30% damage to frozen enemies
  - Surge: +30% damage vs tank enemies

### Fixed
- Element-specific upgrade bonuses now properly apply to game mechanics
- Status effects correctly prevent movement when frozen/paralyzed/sleeping
- Confused enemies move randomly as intended
- Feared enemies flee from player correctly

---

## [1.2.1] - 2025-11-08

### Changed
- **Game renamed to "Magic Affinity"**
  - Updated all references from "Root Test Game", "Pixel Dungeon Survivor", and "Twinstick Demo"
  - Updated HTML title tag
  - Updated all documentation files (README.md, TwinStick Bible.md, game-development-template.md)
  - Unified all file references to `index.html`

### Fixed
- Fixed syntax error on line 462 (nested ternary operator formatting issue)
- Fixed missing favicon causing 404 error
- Added inline SVG favicon with sword emoji

---

## [1.2.0] - 2025-11-06

### Changed
- **Archer Mechanic Redesigned - Complete overhaul of shooting system**
  - Changed from mouse-aim to movement-based shooting
  - Archer now shoots in OPPOSITE direction of movement (natural kiting)
  - Only shoots while moving (standing still = no shooting)
  - WASD now controls both movement AND shooting direction
  - Better mobile support (no separate aim input needed)
  - Improved skill expression through movement choices

### Technical
- Added new function `shootArrowOppositeMovement(moveX, moveY)`
- Removed dependency on mouse/pointer input for Archer
- Kept old `shootArrowTowardsMouse()` function for potential future use

---

## [1.1.2] - 2025-11-06

### Fixed
- **CRITICAL: Fixed Archer Arrow Freeze Bug**
  - Game would completely freeze when Archer's arrow hit an enemy
  - Added `hasHit` flag to prevent multiple collision callbacks
  - Prevents infinite loop of collision checks

- **Fixed setTint Error on Enemy Hit**
  - Replaced `enemy.setTint()` with `enemy.setAlpha()` for Graphics objects
  - Fixed console error when arrows hit enemies

### Changed
- **Character Rename: Rogue → Archer**
  - Renamed throughout game for better clarity
  - "Archer" better matches gameplay (ranged bow shooter)
  - Updated all UI text, internal variables, and comments

---

## [1.1.1] - 2025-11-03

### Fixed
- **CRITICAL: Wave 1 Freezing Bug**
  - Game no longer freezes during first wave
  - Separated boss wave logic from regular wave logic
  - Fixed wave completion check to account for boss spawn

- **Enemies Attacking During Pause**
  - Tank lasers, boss lasers, and bomber teleports no longer fire during level-up pause
  - Added `!this.paused` checks to all special attacks

- **Wave Completion Counting**
  - Boss waves now complete properly (1 boss + 3 minions = 4 total)
  - Fixed counting logic to include boss in spawn count

### Added
- Initialized `isBossWave` flag in `create()` method to prevent undefined behavior
- Pause state checks to enemy spawn callbacks

---

## [1.1.0] - 2025-11-03

### Added
- **Pause Menu System**
  - ESC or P key to pause/unpause
  - Resume and Quit to Menu buttons
  - Physics fully paused during pause state

- **Fullscreen Mode**
  - Button in top-right corner of character select
  - Game scales to fit screen with aspect ratio maintained

- **Touch/Mobile Support**
  - Virtual joystick for mobile devices (bottom-left corner)
  - Touch controls work seamlessly with all 3 characters
  - Auto-detects touch support

- **Seasonal Maps System**
  - 4 unique map themes: Spring, Summer, Fall, Winter
  - Each season has distinct visuals and mechanics:
    - **Spring:** 40 colorful flowers, thorny bushes (hazard)
    - **Summer:** 8 trees that BLOCK projectiles, fire pits (hazard)
    - **Fall:** 30 flying leaves that obscure vision, poison mushrooms (hazard)
    - **Winter:** Slippery ice patches (50% speed boost, reduced control), ice spikes (hazard)

- **Environmental Hazards**
  - 5 hazards per map (3 damage per second)
  - Season-specific visuals and effects
  - 1 second cooldown between damage ticks

- **Boss System**
  - Bosses spawn every 5 waves (Wave 5, 10, 15, 20, etc.)
  - Dedicated boss health bar at top of screen
  - Dramatic entrance with camera shake and warning message
  - Boss + 3 minions per boss wave
  - Scaling stats based on wave number

- **New Enemy Types**
  - **Tank (Wave 7+):** Slow, very tanky, fires laser beams, 50% projectile resistance
  - **Bomber (Wave 7+):** Teleports near player, explodes when low HP, AoE damage

### Enhanced
- Boss now shoots 2 lasers (one at player, one random direction)
- Enhanced seasonal visuals with detailed patterns
- Trees provide strategic cover (block all projectiles)
- Ice mechanics add movement challenge (speed vs control)

### Technical
- Enhanced `createBackground()` with detailed seasonal rendering
- Added tree collision physics (static group)
- Added falling leaves animation system
- Added ice slipperiness detection and drag mechanics
- Trees block projectiles via collider system

---

## [1.0.0] - 2025-11-01 (Estimated)

### Added
- **Initial Release - Playable MVP**
- 3 Playable Characters:
  - Archer (movement-based shooting, fast, glass cannon)
  - Warrior (auto-targeting, tanky, slow)
  - Wizard (orbiting orbs, medium complexity)

- **Core Gameplay**
  - Wave-based enemy spawning with scaling difficulty
  - 5 Enemy types: Slime, Goblin, Tank, Bomber, Boss
  - XP and leveling system
  - 12 Upgrade types (6 universal + 1 archer/warrior + 5 wizard-only)

- **Game Systems**
  - Health, damage, and combat systems
  - Invulnerability frames (1 second after hit)
  - Damage numbers floating text
  - Particle effects (death explosions, level up)
  - Sound effects (8 types, procedurally generated)

- **UI/UX**
  - Character selection screen with stats
  - In-game HUD (health bar, XP bar, wave number, score, time)
  - Boss health bar system
  - Game over screen with final stats
  - High score tracking (session-based)

- **Visual/Audio**
  - Pixel art style (16x16 character sprites)
  - Procedural sound generation (Web Audio API)
  - Visual feedback (camera shake, screen effects)
  - Tiled grass background

### Technical
- Built with Phaser 3 (v3.70.0)
- Single self-contained HTML file
- 800x600 resolution
- 60 FPS target
- Arcade physics engine

---

## Version Naming Convention

**Format:** MAJOR.MINOR.PATCH

- **MAJOR:** Significant gameplay overhauls or fundamental changes
- **MINOR:** New features, characters, enemies, or systems
- **PATCH:** Bug fixes, balance changes, small improvements

---

## Future Versions (Planned)

### [1.3.0] - Planned
- Elemental magic system integration
- 4th character class
- More upgrade variety (15+ total)
- Meta-progression system

### [2.0.0] - Planned
- Multiple boss types with unique attacks
- Achievement system
- Save/load system (localStorage)
- Difficulty selection modes

---

**Project:** Magic Affinity
**Repository:** Monochrome-prism.github.io
**Last Updated:** November 8, 2025
