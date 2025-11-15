# Branded For Death: Magic Affinity - Game Design Document

**Version:** 3.4.5
**Last Updated:** November 15, 2025
**Status:** Complete Phase 3 - Bug Fixes, Balance, and Polish

---

## Documentation Files

This project uses **3 main documentation files**:
1. **MagicAffinityBible.md** - This file (game design reference)
2. **CHANGELOG.md** - Version history
3. **README.md** - Quick start guide

See also:
- **CONTRIBUTING.md** - Development standards and code quality guidelines
- **TESTING.md** - Test protocols and checklists

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Design Philosophy](#design-philosophy)
3. [Technical Specifications](#technical-specifications)
4. [Game Design](#game-design)
5. [Player Character](#player-character)
6. [Elemental System](#elemental-system)
7. [Game Systems](#game-systems)
8. [Art & Audio](#art--audio)

---

## 🎮 Project Overview

**Branded For Death: Magic Affinity** is a roguelike survivor game inspired by Vampire Survivors and Brotato. Players control a mysterious Suited Man who masters one of 10 elemental magic types. Survive waves of increasingly difficult enemies while leveling up and choosing synergistic upgrades that build upon your chosen element.

**Core Pillars:**
1. **Elemental Mastery** - 10 elements with unique mechanics and 4 specialized upgrades each
2. **Meaningful Progression** - Level up each wave and choose powerful upgrades
3. **Replayability** - Different elemental choices create vastly different playstyles
4. **Polish** - Smooth gameplay, visual feedback for status effects, procedural audio

**Target Experience:**
- Session Length: 5-15 minutes per run
- Difficulty: Gradually increasing with elemental power growth
- Skill Expression: Build optimization and positioning-based combat

---

## 🎮 Design Philosophy

**Core Principles:**

1. **Build Synergy Over Random Chaos**
   - Upgrades meaningfully interact with each other
   - Player choices matter more than RNG

2. **Clear Visual/Audio Feedback**
   - Player always knows why they got hit
   - Damage numbers, sounds, and visual flashes confirm actions
   - Readability > Spectacle

3. **Meaningful Progression**
   - Level ups feel impactful
   - High scores motivate "one more run"
   - Death teaches lessons, not frustration

4. **Controlled Randomness**
   - Random elements create variety (upgrades, spawns, maps)
   - Player agency determines success

5. **Respect Player Time**
   - Target: 5-15 minutes per run
   - Quick restart, minimal downtime
   - Early power spikes (feel stronger within 2-5 minutes)

---

## 🔧 Technical Specifications

- **Framework:** Phaser 3 (v3.70.0)
- **Architecture:** ES6 Modules
- **Resolution:** 800x700 pixels
- **Physics:** Arcade Physics
- **Audio:** Web Audio API (procedural sound generation)
- **Platform:** Browser-based (requires local web server for ES6 modules)

**File Structure:**
```
/
├── index.html (29 lines)
├── src/
│   ├── main.js (27 lines)
│   ├── config/ (gameState.js, elements.js)
│   ├── systems/ (CombatSystem, EnemySystem, WaveSystem, UpgradeSystem, UISystem, SoundFX)
│   ├── scenes/ (CharacterSelectScene, GameScene, GameOverScene)
│   └── utils/ (MathHelpers, DrawingHelpers, StatusEffectHelpers)
```

**Performance Targets:**
- 60 FPS
- <50ms input latency
- Instant load time (no external assets)

---

## 🎨 Game Design

### Core Gameplay Loop
```
Start → Choose Element at Level 1 → Survive Waves → Kill Enemies →
Collect XP → Level Up → Choose Upgrade → Repeat → Death → View Stats → Play Again
```

### Win/Loss Conditions
- **No Win Condition:** Endless survival (score-based)
- **Loss Condition:** Player health reaches 0
- **Goal:** Survive as long as possible, maximize score

### Difficulty Scaling
- **Wave Progression:** Boss every 5 waves (5, 10, 15, 20...)
- **Enemy Scaling:** +5 HP, +1 Damage per wave (Speed is STATIC - no scaling)
- **Enemy Variety:**
  - Wave 1-2: Slimes (Wave 2 guarantees 1 goblin)
  - Wave 3: 50% Slimes, 50% Goblins (early difficulty spike)
  - Wave 4+: Goblins unlocked
  - Wave 7+: Tanks and Bombers unlocked
  - Wave 5, 10, 15...: Boss waves

---

## 👤 Player Character

### The Suited Man
The player character is a mysterious man in a suit, complete with top hat and sunglasses. His appearance adapts to the chosen element, with his attire changing color to match his magical affinity.

**Visual Design:**
- **Top Hat:** Double-height element-colored crown (16px) with darker brim (0.8x brightness)
- **Sunglasses:** Always black (curved lenses)
- **Suit Jacket:** Element-colored trapezoid shape (wider shoulders, narrower waist)
- **Collar/Lapels:** Darker element color accent (0.6x brightness)
- **Buttons:** 3 small circle buttons down center (0.6x brightness)
- **Arms & Legs:** Element-colored
- **Shoes:** Rectangular, darker element color (0.4x brightness)
- **Skin/Hands:** Pale beige (0xFFF5E1) - whiter skin tone (v3.3.2+)
- **Pose:** One arm at side, one arm raised (waving/gesturing)
- **Hitbox:** 15px radius circle
- **Total Height:** ~53px

### Base Stats
| Stat | Value | Notes |
|------|-------|-------|
| Health | 50 | Starting health |
| Max Health | 50 | Increases with upgrades |
| Speed | 140 | Medium mobility |
| Damage | 20 | Base damage per orb hit (+10 for Water/Wind) |
| Defense | 5 | Damage reduction |
| Attack Speed | N/A | Uses orbiting orbs |

### Combat Mechanic
- **Orbiting Orbs:** Start with 2 orbs rotating around player
- **Orbit Distance:** 50 units (upgradeable)
- **Rotation Speed:** 2x base (upgradeable)
- **Hit Cooldown:** 500ms per enemy (prevents multi-hitting)
- **Orb Count:** 2-3 depending on element choice

### Visual Customization
- Starts **GREY** with no element chosen
- Upon element selection, the following change to element color:
  - Top hat (crown at full brightness, brim at 0.8x)
  - Suit jacket
  - Arms and legs
  - Orbiting orbs
- Sunglasses remain **black** regardless of element

---

## 🔮 Elemental System

At level 1, choose one of 10 elemental types. Each element has:
- **Primary Status Effect** applied by orbs
- **4 Element-Specific Upgrades**
- **Unique Visual Color**
- **Distinct Playstyle**

### 🔥 FLAME - Burn Specialist
**Primary Effect:** Burn (3 damage/second for 3 seconds)
**Base Damage Bonus:** +5 damage (25 damage) - BUFFED +25% from base
**Attack Rate:** 0.5 seconds (increased fire rate)
**Attack Pattern:** Dual flamethrower cones (forward AND backward simultaneously)
**Attack Range:** 125px hit range, 188px visual range (BUFFED +25% from base)
**Color:** Orange-red (#FF4500)
**Orbs:** 0 (removed for dual flamethrower system)

**Upgrades:**
1. **Inferno Blast** - +2 burn damage per tick (stackable: 3→5→7→9...)
2. **Wildfire** - Burn spreads to nearby enemies (60px radius) (NON-STACKABLE) (v3.4.5)
3. **Molten Core** - +25% damage to burning enemies
4. **Firestorm** - +2 seconds burn duration (3→5 seconds)

---

### 💧 WATER - Crowd Control Master
**Primary Effect:** Freeze (50% chance, 2 seconds - stops movement)
**Base Damage Bonus:** +10 damage (30 total)
**Attack Rate:** 1 second cooldown
**Color:** Royal blue (#4169E1)
**Orbs:** 0 (removed for piercing water stream system)
**Attack Pattern:** Piercing water stream (200px length, 1/4 screen)
- Auto-aims to nearest enemy
- Passes through all enemies in path (piercing)
- 12px width stream with water flow visual effect

**Upgrades:**
1. **Deep Freeze** - +50% freeze duration (2→3 seconds)
2. **Glacial Shards** - +30% damage to frozen enemies
3. **Permafrost** - +5% freeze chance (stackable: 50%→55%→60%→65%...)
4. **Jet Stream** - +25% water beam range (stackable: 200→250→312→390px)

---

### ⚡ ELECTRIC - Chain Damage Master
**Primary Effect:** Paralyze (50% chance, 1 second - stuns)
**Base Damage Bonus:** None (20 damage)
**Attack Range:** 125px initial target, 75px chain range (base values)
**Color:** Yellow (#FFFF00)
**Orbs:** 0 (removed for lightning bolt system)

**Upgrades:**
1. **Chain Lightning** - Attacks jump to 1 nearby enemy (75px, 50% damage)
2. **Overload** - +10% paralyze chance (stackable: 30%→40%→50%→60%...)
3. **Static Field** - Paralyzed enemies take 2 damage every 0.5s
4. **Thor's Hammer** - +25% attack range (stackable: 0%→25%→50%→75%...)

---

### 🌿 NATURE - Sustain & Spread
**Primary Effect:** Poison (30% proc chance, 2→4→8→16 damage doubling for 6 seconds)
**Base Damage Bonus:** None (20 damage)
**Attack Rate:** Plants seed every 667ms (50% faster fire rate)
**Color:** Lime green (#32CD32)
**Orbs:** 0 (removed for seed planting system)
**Attack Pattern:** Drops seeds that explode after 2 seconds

**Upgrades:**
1. **Toxic Bloom** - +2 seconds poison duration (6→8 seconds)
2. **Regeneration** - Heal 1% of max HP every 10 seconds
3. **Toxicity** - +10% poison proc chance (stackable: 30%→40%→50%→60%...)
4. **Spore Cloud** - Poison spreads to nearby enemies (60px radius)

---

### 💨 WIND - Control & Knockback
**Primary Effect:** Knockback (600 power, 150px distance) - 25% base chance (v3.4.5)
**Base Damage Bonus:** +10 damage (30 total)
**Color:** Light cyan (#E0FFFF)
**Orbs:** 0 (removed for boomerang system)
**Attack Pattern:** Throwing boomerangs that return (1 per second, max 3 simultaneous base)
- **ALL boomerangs target nearest enemy** (each independently finds closest target) (v3.4.5)
- 25% chance per hit to apply knockback

**Upgrades:**
1. **Gale Force** - +50% knockback distance
2. **Zephyr** - Stackable (max 4x): +25% knockback chance (25%→50%→75%→100%) (v3.4.1)
3. **Swift Foot** 👟 - +25% movement speed (INFINITE stacking) (v3.4.5)
4. **Hurricane** - +1 additional boomerang (stackable: 3→4→5→6...)

---

### 🪨 TERRA - Tank & Knockback
**Primary Effect:** Knockback (strong, 300 power)
**Base Damage Bonus:** +20 damage (40 total)
**Color:** Brown (#8B4513)
**Orbs:** 0 (removed for stone block system)
**Attack Pattern:** Stone blocks spawn randomly around player
- Blocks spawn every 1.333 seconds (50% faster fire rate) (v3.4.5)
- **Spawn Phase:** 7.5 seconds (deals damage to enemies on contact)
- **Static Phase:** 10 seconds (blocks enemy movement)
- **Total Duration:** 17.5 seconds

**Upgrades:**
1. **Earthquake** - +100% knockback power
2. **Stone Skin** - +2 defense
3. **Tremor** - Knockback affects area around impact (56px, half power)
4. **Mountain's Might** - +40% knockback chance (20%→28%)

---

### 🌌 GRAVITY - Slow & Confusion
**Primary Effect:** Slow (40% speed reduction) + Confusion (10% chance, random movement)
**Base Damage Bonus:** None (20 damage)
**Color:** Purple (#9370DB)
**Orbs:** 3 (semi-random orbit pattern, upgradeable with Planet Orb)

**Upgrades:**
1. **Gravitational Pull** - +10% slow effectiveness (stackable: 40%→50%→60%→70%...)
2. **Planet Orb** - Gain +1 gravity orb (stackable)
3. **Dense Matter** - Slow affects larger area (100px, half effectiveness)
4. **Event Horizon** - Confused enemies damage each other (50px, 3 damage/sec)

---

### ✨ CELESTIAL - Mobility & Charm
**Primary Effect:** Charm (5% chance, 3 seconds - enemy stops attacking)
**Base Damage Bonus:** None (20 damage)
**Color:** Gold (#FFD700)
**Orbs:** 1 (large, fast orb - 2x speed, 70px orbit distance)

**Upgrades:**
1. **Astral Chains** - +1 second charm duration (3→4 seconds)
2. **Starfall** - +3% charm chance (stackable: 5%→8%→11%→14%...)
3. **Star's Orbit** - +25% orb rotation speed (stackable: 0%→25%→50%→75%...)
4. **Void Step** - 10% chance to dodge attacks with "DODGE" text

---

### ☀️ RADIANT - Defense & Sustain
**Primary Effect:** Blind (15% chance, 2 seconds - reduced accuracy)
**Base Damage Bonus:** None (20 damage)
**Color:** Bright white-gold (#FFFACD)
**Orbs:** 0 (removed for radiant beam system)

**Upgrades:**
1. **Divine Blessing** - +15% damage
2. **Brilliant Flash** - +10% blind chance (stackable: 20%→30%→40%→50%...)
3. **Beacon of Hope** - Heal 3 HP per kill
4. **Radiant Shield** - Reduce damage taken by 10%

---

### 🌑 SHADOW - Fear & Lifesteal
**Primary Effect:** Fear (10% chance, 2 seconds - enemy flees)
**Base Damage Bonus:** None (20 damage)
**Attack Rate:** Clone spawns in 2 seconds, deals damage every 0.75 seconds per clone
**Color:** Dark purple/indigo (#4B0082)
**Orbs:** 0 (removed for shadow clone system)
**Attack Pattern:** Shadow clones (AI-controlled minions)
- 1 clone spawns 2 seconds after wave starts (2 with Void Clone upgrade - 2nd spawns immediately)
- Each clone deals base damage (20) every 0.75 seconds on contact (individual timing)
- Targets enemies within 250px of player
- Clone AI: Type 0 targets farthest enemy, Type 1 targets nearest

**Upgrades:**
1. **Lifesteal** - +10% lifesteal (stackable: 0%→10%→20%→30%... of damage as healing)
2. **Dark Embrace** - +5% fear chance (stackable: 10%→15%→20%→25%...)
3. **Void Clone** - Summon 2nd shadow clone immediately (max 1x)
4. **Umbral Shroud** - Enemies have 15% miss chance with "MISS" text

---

## ⚙️ Game Systems

### Wave System

**Wave Structure:**
- **Wave 1-4:** Regular waves (increasing enemies)
- **Wave 5:** BOSS WAVE (1 boss + 3 minions)
- **Wave 6-9:** Regular waves
- **Wave 10:** BOSS WAVE (1 boss + 3 minions)
- **Pattern:** Boss every 5 waves (5, 10, 15, 20...)

**Spawn System:**
- Enemies spawn from screen edges (random)
- Staggered spawning (500ms between spawns)
- 2 second pause between waves

**Scaling Formula:**
- Enemies per wave: `enemiesThisWave * 1.2` (reduced from 1.3 in v3.4.1)
- Enemy HP: `30 + (wave * 5)`
- Enemy Speed: Static (no scaling) - Slime: 40, Goblin: 70, Tank: 30, Bomber: 45
- Enemy Damage: `5 + wave`

---

### Enemy Types

#### Slime (Basic Enemy)
| Stat | Formula | Wave 1 Example |
|------|---------|----------------|
| Appearance | Wave 1+ | Always |
| Health | 30 + (wave * 5) | 35 HP |
| Speed | 40 (static) | 40 |
| Damage | 5 + wave | 6 |
| XP Value | 20 | 20 |
| Score Value | 10 | 10 |
| Color | Green | Green |

---

#### Goblin (Advanced Enemy)
| Stat | Formula | Wave 4 Example |
|------|---------|----------------|
| Appearance | Wave 4+ | Wave 4+ |
| Health | 50 + (wave * 8) | 82 HP |
| Speed | 70 (static) | 70 |
| Damage | 8 + (wave * 2) | 16 |
| XP Value | 35 | 35 |
| Score Value | 25 | 25 |
| Color | Green with red eyes | - |

---

#### Tank (Heavy Enemy)
| Stat | Formula | Wave 7 Example |
|------|---------|----------------|
| Appearance | Wave 7+ | Wave 7+ |
| Health | 150 + (wave * 15) | 255 HP |
| Speed | 30 (static) | 30 |
| Damage | 12 + (wave * 2) | 26 (melee), 15 (laser) |
| XP Value | 60 | 60 |
| Score Value | 50 | 50 |
| Color | Dark gray armor | - |
| Special | Laser attack every 4s | 50% projectile resist |

---

#### Bomber (Suicide Enemy)
| Stat | Formula | Wave 7 Example |
|------|---------|----------------|
| Appearance | Wave 7+ | Wave 7+ |
| Health | 20 + (wave * 3) | 41 HP |
| Speed | 45 (static) | 45 |
| Damage | 15 + (wave * 3) | 36 (explosion) |
| XP Value | 40 | 40 |
| Score Value | 35 | 35 |
| Color | Purple/black | - |
| Special | Teleport (3s CD) | Explosion (80 unit radius) |

---

#### Boss (Elite Enemy)
| Stat | Formula | Wave 5 Example |
|------|---------|----------------|
| Appearance | Wave 5, 10, 15, 20... | Every 5 waves |
| Health | 375 + (bossLevel * 150) | 525 HP (bossLevel=1) - reduced 25% (v3.4.1) |
| Speed | 35 + (bossLevel * 5) | 40 |
| Damage | 20 + (bossLevel * 5) | 25 (melee), 25 (laser) |
| XP Value | 113 | 113 |
| Score Value | 500 | 500 |
| Color | Dark red demon | - |
| Special | Scaling laser attack every 3s | Health bar at top |
| Size | 2x normal enemies | - |

**Boss Laser Scaling:**
- Laser count increases with each boss: `1 + Math.floor(wave / 5)`
- First laser always aims at player, additional lasers fire in random directions
- All lasers fire simultaneously
- **Wave 5** (1st boss): 2 lasers (1 aimed + 1 random)
- **Wave 10** (2nd boss): 3 lasers (1 aimed + 2 random)
- **Wave 15** (3rd boss): 4 lasers (1 aimed + 3 random)
- **Wave 20** (4th boss): 5 lasers (1 aimed + 4 random)
- **Wave 25+**: Continues scaling infinitely

**Boss Stats by Wave:**
- Wave 5: 700 HP, 40 Speed, 25/25 Damage, 2 Lasers
- Wave 10: 900 HP, 45 Speed, 30/30 Damage, 3 Lasers
- Wave 15: 1100 HP, 50 Speed, 35/35 Damage, 4 Lasers
- Wave 20: 1300 HP, 55 Speed, 40/40 Damage, 5 Lasers

---

### Leveling System

**XP Requirements:**
- Level 1→2: 100 XP
- Level 2→3: 150 XP (previous * 1.5)
- Level 3→4: 225 XP (previous * 1.5)
- Continues exponentially

**Level Up Mechanics:**
- **1 wave = 1 level**
- Wave completion awards remaining XP needed
- **Heal 25% of max HP on wave completion**
- Game pauses on level up
- Choose 1 of 3 random upgrades
- Upgrade applied immediately

**XP Collection:**
- Blue orbs drop from killed enemies
- Collect by walking over them (20px collection radius)

---

### Upgrade System

**Universal Upgrades (4 total):**
1. **Health Boost** ❤️ - +25 Max HP, restore 50 HP immediately (v3.4.4)
2. **Damage Boost** ⚔️ - +50% Damage
3. **Critical Strike** 💥 - Stackable (max 4x): 25%→50%→75%→100% crit chance, always 2x damage (v3.4.0+)
4. **Armor Boost** 🛡️ - 25% damage reduction from all sources (max 2x)

**Element-Specific Upgrades (40 total - 4 per element):**
- See Elemental System section above for complete list
- Only available after choosing element
- Element choice at level 1 (first level-up)

**Upgrade Selection:**
- 3 random upgrades shown each level
- No duplicates in same selection
- Element choice is permanent for that run

---

### Status Effect System

**Visual Status Effects:**

| Effect | Element | Visual | Duration | Proc Chance |
|--------|---------|--------|----------|-------------|
| Burn 🔥 | Flame | Orange particles rising | 3s | 25% |
| Freeze ❄️ | Water | Blue ice overlay | 2s | 50% |
| Paralyze ⚡ | Electric | Yellow electric sparks | 1s | 50% |
| Poison ☠️ | Nature | Green bubbles floating | 6s | 30% |
| Sleep 💤 | ~~Wind~~ | White "Z" symbols | 2s | ~~Removed v3.4.3~~ |
| Charm 💝 | Celestial | Pink hearts | 3s | 5% |
| Confusion 😵 | Gravity | Yellow spinning stars | 2s | 10% |
| Blind 🕶️ | Radiant | Dark overlay | 2s | 15% |
| Fear 😱 | Shadow | Red exclamation mark | 2s | 10% |
| Slow 🐌 | Gravity | Blue aura outline | Permanent | Always |

**Status Effect Mechanics:**
- Multiple effects can stack on same enemy
- Visual effects follow enemy position
- Auto-cleanup on status end or enemy death
- All effects created at depth 14-15 (above enemies, below UI)

---

### Seasonal Map System

**Random season chosen at game start. 4 themes:**

#### Spring 🌸
- **Color:** Bright green grass (#4a7c2e)
- **Decoration:** 40 colorful flowers (15 on mobile for performance)
- **Hazard:** Thorny bushes (12 damage/sec - 2x damage)
- **Mechanics:** None (pure visual)

#### Summer 🌳
- **Color:** Desert sand (#8b6914)
- **Decoration:** 8 large trees
- **Hazard:** Fire pits (6 damage/sec)
- **Mechanics:** Trees BLOCK ALL PROJECTILES (player and enemy)

#### Fall 🍂
- **Color:** Brown/tan earth (#5a4a2a)
- **Decoration:** 100 flying brown leaves
- **Hazard:** Poison mushrooms (6 damage/sec)
- **Mechanics:** Leaves OBSCURE VISION (drift across screen)

#### Winter ❄️
- **Color:** White/gray snow (#d0d0d0)
- **Decoration:** 12 light blue ice patches
- **Hazard:** Ice spikes (6 damage/sec)
- **Mechanics:** Ice patches make floor SLIPPERY (100% faster movement, reduced control)

**Hazard Properties:**
- 5 hazards spawn per map
- Deal 6 damage per second on contact (Spring thorns deal 12)
- 1 second cooldown between damage ticks
- Damage affected by player's damage reduction stat
- Visual flash on damage dealt

---

### UI System

**HUD Elements:**

**Top Left Panel:**
- Character name (Suited Man + Element)
- Level display
- HP bar (color-coded: green>50%, orange 25-50%, red<25%)
- XP bar (blue, shows progress to next level)

**Top Right Panel:**
- Wave number (red text)
- Current score (cyan text)
- Survival time (MM:SS format)

**Damage Numbers:**
- Float upward from hit location
- Red color for visibility
- 800ms duration with fade

**Level Up Screen:**
- Dark overlay (80% opacity)
- "LEVEL UP!" title (gold)
- 3 upgrade cards with icon, name, description
- Hover effect (border changes to green)

**Boss Health Bar:**
- Appears at top center when boss spawns
- Color-coded by HP percentage
- Shows boss name and current/max HP

---

### Pause System

**Controls:**
- ESC or P key to pause/unpause

**Pause Menu:**
- Dark overlay (85% opacity)
- "PAUSED" title
- Resume button (green)
- Quit to Menu button (red)
- All buttons have hover effects

**Restrictions:**
- Cannot pause during level-up screen
- Physics fully paused
- Touch controls disabled while paused

---

### Scoring System

**Score Sources:**
- Enemy Kill: +10 (Slime), +25 (Goblin), +50 (Tank), +35 (Bomber), +500 (Boss)
- Survival Time: +10 per second
- Final Score = Kill Score + (Survival Time * 10)

**High Score:**
- Persists during session
- Displayed on character select and game over
- Resets on page refresh

---

### Combo System

**Combo Mechanics:**
- **Chain Window:** 3 seconds to chain kills
- **Combo Multiplier:** Linear scaling (+10% per kill in chain)
- **Visual Feedback:** Combo text appears at 2+ kills
  - 2-4 kills: White text
  - 5-9 kills: Yellow text
  - 10-24 kills: Orange text
  - 25+ kills: Red text with glow
- **Combo Reset:** Taking damage resets combo counter

**Combo Tiers:**
- 2x Combo: 1.2x damage
- 5x Combo: 1.5x damage (color change to yellow)
- 10x Combo: 2.0x damage (color change to orange)
- 25x Combo: 3.5x damage (color change to red + glow effect)

**Implementation:**
- Damage multiplier applies to all player damage output
- Stacks multiplicatively with critical strikes
- Does NOT affect status effect damage (burn, poison, static field)

---

### Treasure Chest System

**Drop Mechanics:**
- **Drop Chance:** 5% from any enemy kill
- **Appearance:** 24x24px brown chest with gold outline (v3.4.0: doubled size for visibility)
- **Collection:** Auto-pickup on contact (30px radius)
- **Persistence:** 15 second lifespan
  - Blinking warning starts at 5 seconds (200ms intervals)
  - Despawns at 15 seconds if not collected
- **Visual:** Gentle bobbing animation (±5px vertical)

**Buff Items (4 types, equal drop chance):**

1. **Red Potion** 🧪 (25% chance)
   - **Effect:** Instant heal for 50% of max HP
   - **Visual:** Red bottle with cork and liquid shine
   - **Healing Cap:** Shows green "+X HP" text even at full HP for feedback
   - **Particles:** Green healing sparkles on pickup

2. **Sword** ⚔️ (25% chance)
   - **Effect:** Double all damage dealt for 15 seconds
   - **Visual:** Silver blade with gold guard and brown handle
   - **Stacking:** Refreshes duration to full 15s if picked up again
   - **Interaction:** Multiplicative with critical strikes (2x × 2x = 4x total!)
   - **Buff Icon:** Top-right corner with countdown timer

3. **Gold Potion** ✨ (25% chance)
   - **Effect:** Invincibility for 15 seconds (immune to all damage)
   - **Visual:** Gold bottle with cork and liquid shine
   - **Stacking:** Refreshes duration to full 15s if picked up again
   - **Visual Effect:** Pulsing gold ring around player (sine wave glow)
   - **Buff Icon:** Top-right corner with countdown timer

4. **Magnet** 🧲 (25% chance) - NEW v3.4.0
   - **Effect:** Pulls all XP orbs to player for 15 seconds
   - **Pull Speed:** 300 pixels/second
   - **Visual:** Magnet emoji icon
   - **Stacking:** Refreshes duration to full 15s if picked up again
   - **Buff Icon:** Top-right corner with countdown timer (silver background)
   - **Behavior:** Automatically moves all XP orbs toward player; stops velocities when expired

**Buff Features:**
- **Multiple Buffs:** Can have Sword + Invincibility active simultaneously
- **Duration Refresh:** Picking up same buff type resets timer to 15s
- **Visual Feedback:**
  - Buff icons with emoji displayed in top-right corner
  - Colored backgrounds (red for Sword, gold for Invincibility)
  - Countdown timer shows seconds remaining
  - "Buff Expired!" message when buff ends (gray text)
- **Invincibility Implementation:**
  - Blocks all enemy contact damage
  - Blocks boss laser damage
  - Does NOT prevent environmental hazard damage
  - Stacks with player's invulnerability frames

**Treasure Chest Stats:**
- **Spawn Rate:** 5% per enemy kill (independent roll)
- **Visual Size:** 24x24px with 2px gold outline (v3.4.0: doubled from 12x12px)
- **Drop Rate Balance:** ~1 chest every 20 enemy kills on average
- **Buff Distribution:** Each buff type has equal 1/4 probability (25% each)
- **Sound Effects:**
  - Chest pickup: "collect" sound (800-1200Hz ascending)
  - Buff activation: "powerup" sound (special tone)

---

## 🏆 Meta-Progression System

### Skill Tree
Players earn permanent stat boosts that apply to all future runs.

**Skill Point Economy:**
- **Starting Points:** 1 free skill point
- **Earning Points:** +1 skill point per achievement unlocked
- **Total Possible:** 15 points (1 free + 14 from achievements)

**3 Skill Upgrades Available:**

1. **Health Boost** ❤️
   - **Effect:** +10% starting HP per level (v3.4.3)
   - **Max Level:** 5
   - **Max Bonus:** +50% HP (50 → 75 HP)

2. **Damage Boost** ⚔️
   - **Effect:** +10% damage per level (v3.4.3)
   - **Max Level:** 5
   - **Max Bonus:** +50% damage (20 → 30 dmg)

3. **Speed Boost** 💨
   - **Effect:** +10% movement speed per level (v3.4.3)
   - **Max Level:** 5
   - **Max Bonus:** +50% speed (140 → 210)

**Skill Builds:**
- **Focused Build:** 5 points in one skill (e.g., max HP)
- **Balanced Build:** Spread across 2-3 skills
- **Free Respec:** Reset tree anytime from skill tree menu

---

### Achievements

**14 Achievements (expandable to 20)**

Each achievement unlocked grants +1 skill point.

#### Core Achievements (4)

1. **First Blood** 🏆
   - **Requirement:** Kill 100 enemies (lifetime)
   - **Type:** Cumulative across all runs
   - **Progress:** Tracked globally, never resets
   - **Reward:** +1 skill point

2. **Untouchable** 🛡️
   - **Requirement:** Reach Wave 6 without taking damage
   - **Type:** Single-run challenge
   - **Progress:** Must complete wave 6 with 0 damage taken
   - **Reward:** +1 skill point

3. **Element Master** 🔮
   - **Requirement:** Reach Wave 7 with all 10 elements
   - **Type:** Long-term goal across multiple runs
   - **Progress:** Must reach wave 7+ with each of the 10 elements
   - **Tracking:** Progress saved per element
   - **Reward:** +1 skill point

4. **Speed Demon** ⚡
   - **Requirement:** Reach Wave 10 in under 10 minutes
   - **Type:** Speed-run challenge
   - **Time Limit:** 600 seconds (10:00) from game start
   - **Progress:** Best time tracked
   - **Reward:** +1 skill point

#### Element Master Achievements (10)

Each element has a dedicated achievement for reaching Wave 11.

5. **Flame Master** 🔥 - Reach Wave 11 with Flame (+1 skill point)
6. **Water Master** 💧 - Reach Wave 11 with Water (+1 skill point)
7. **Electric Master** ⚡ - Reach Wave 11 with Electric (+1 skill point)
8. **Nature Master** 🌿 - Reach Wave 11 with Nature (+1 skill point)
9. **Wind Master** 💨 - Reach Wave 11 with Wind (+1 skill point)
10. **Terra Master** 🪨 - Reach Wave 11 with Terra (+1 skill point)
11. **Gravity Master** 🌌 - Reach Wave 11 with Gravity (+1 skill point)
12. **Celestial Master** ✨ - Reach Wave 11 with Celestial (+1 skill point)
13. **Radiant Master** ☀️ - Reach Wave 11 with Radiant (+1 skill point)
14. **Shadow Master** 🌑 - Reach Wave 11 with Shadow (+1 skill point)

**Achievement Features:**
- **Scrollable List:** Mouse wheel or touch drag to view all achievements
- **Progress Bars:** Visual progress tracking for all achievements
- **Unlock Notifications:** Animated popup when achievements unlock
- **Unlock Dates:** Displays when each achievement was earned
- **Persistent Storage:** Saved in browser LocalStorage

---

### Persistence

**Storage System:**
- **Technology:** Browser LocalStorage
- **Storage Key:** `magicAffinityProgression`
- **Data Size:** ~10KB (well under browser limits)

**What's Saved:**
- Achievement progress and unlock status
- Skill tree state (points earned, spent, available)
- Global stats (total enemies killed, runs played, etc.)

**Data Safety:**
- **Validation:** Checks data integrity on load
- **Corruption Recovery:** Resets to defaults if data corrupted
- **Version Migration:** Supports future version updates
- **Manual Reset:** Available in skill tree menu

**Storage Availability:**
- **Desktop Browsers:** Full support (Chrome, Firefox, Edge, Safari)
- **Mobile Browsers:** Full support
- **Incognito/Private Mode:** Works but data cleared on browser close
- **LocalStorage Disabled:** Game still playable, progression not saved

---

## 🎨 Art & Audio

### Visual Style
- **Aesthetic:** Classic 16x16 pixel art RPG style
- **Sprite Sizes:** Characters 16x16, Enemies 16x16, Projectiles 8x12, Orbs 10x10
- **Color Palette:** Rich colors with good contrast
- **Background:** Tiled grass with seasonal variations

### Pixel Art Specifications
- Character sprites: ~53px tall (procedural graphics)
- Enemy sprites: 16x16 pixels
- Projectiles: 8x12 pixels
- XP Orbs: 8x8 pixels
- Element Orbs: 10x10 pixels

### Audio Design (Procedural)
All sound effects generated in real-time using Web Audio API:

1. **Shoot** - Short ascending tone (200-400Hz, 0.1s)
2. **Hit** - Quick descending square wave (200-50Hz, 0.05s)
3. **Enemy Death** - Sawtooth descend (300-50Hz, 0.2s)
4. **Player Hit** - Low harsh tone (100Hz, 0.15s)
5. **XP Collect** - Ascending chime (800-1200Hz, 0.1s)
6. **Level Up** - C Major arpeggio (C-E-G-C notes)
7. **Select** - Quick ascending (600-800Hz, 0.05s)
8. **Hover** - Subtle tone (400Hz, 0.03s)

**Master Volume:** 30% (0.3)
**Advantages:** No file loading, instant, customizable

---

**End of Document**

*For development standards, see CONTRIBUTING.md*
*For testing protocols, see TESTING.md*
*For version history, see CHANGELOG.md*
