# Twinstick Demo- Game Development Document

**Version:** 1.2.0  
**Last Updated:** November 6, 2025  
**Status:** Playable MVP - Archer Mechanic Redesigned

---

## ⚠️ IMPORTANT NOTE FOR FUTURE AI ASSISTANTS

**DOCUMENTATION STANDARD:**
This project uses **3 files only**:
1. **MagicAffinityBible.md** - Master design document (comprehensive reference)
2. **CHANGELOG.md** - Version history only
3. **README.md** - Quick start guide

⚠️ **NOTE:** The file `game-development-template.md` is deprecated. All documentation is now consolidated in **MagicAffinityBible.md**

**DO NOT create additional documentation files.** Everything goes in this template:
- Bug fixes → Document in "Bug Fixes & Issues" section below
- New features → Update appropriate sections + Progress Log
- Code changes → Update relevant system documentation
- Testing notes → Add to "Testing Protocol" section

**Why only 3 files?**
- ✅ One source of truth (this file)
- ✅ Easy to maintain
- ✅ No redundancy
- ✅ Faster to read and update
- ❌ Multiple files create confusion
- ❌ Information gets out of sync
- ❌ Maintenance burden increases

**Update workflow:**
1. Make game changes in HTML file
2. Document changes in THIS file (template)
3. Add version entry to CHANGELOG.md
4. That's it!

**This file is comprehensive and contains everything needed. Don't overthink it.**

---

## 🚨 CRITICAL: TOKEN/USAGE MANAGEMENT PROTOCOL

**FOR AI ASSISTANTS - READ THIS BEFORE MAKING CODE CHANGES:**

### Before Starting ANY Code Edits:

1. **Check your token/usage budget**
   - If you have less than 30,000 tokens remaining: **STOP**
   - If you have less than 20% of your budget remaining: **STOP**
   - Warn the user: "I'm running low on tokens. This edit may not complete."

2. **Estimate the work required**
   - Small fix (1-3 function edits): ~5,000-10,000 tokens
   - Medium feature (multiple functions): ~15,000-25,000 tokens
   - Large feature (new system): ~30,000-50,000 tokens
   - Full game refactor: **DO NOT ATTEMPT** (>50,000 tokens)

3. **If insufficient tokens:**
   ```
   ⚠️ WARNING: I only have X tokens remaining.
   This change requires approximately Y tokens.
   
   RECOMMENDATION: 
   - Start a new chat for this change
   - I'll document what needs to be done
   - Fresh chat = full token budget
   
   Would you like me to:
   1. Create a detailed TODO list for the next chat
   2. Attempt the change anyway (risk of incomplete code)
   3. Wait for new chat session
   ```

### During Code Edits:

**NEVER leave the HTML file in a broken state.**

- ✅ Complete small, atomic changes
- ✅ Test each change before moving to next
- ✅ If running low mid-edit: STOP, document what's left, let user know
- ❌ Don't start edits you can't finish
- ❌ Don't leave functions half-written
- ❌ Don't corrupt the working game file

### If You Must Stop Mid-Work:

1. **Save current state** to a separate file (Twinstick Demo-INCOMPLETE.html)
2. **Document exactly what's left** in clear steps
3. **Restore the last working version** to main file
4. **Create explicit handoff notes** for next AI session:
   ```markdown
   ## INCOMPLETE WORK - SESSION HANDOFF
   
   **What was attempted:** [describe feature]
   **What was completed:** [list finished parts]
   **What remains:** 
   1. [specific task]
   2. [specific task]
   3. [specific task]
   
   **Files affected:**
   - Twinstick Demo.html (lines X-Y need work)
   
   **Next steps:**
   1. [first thing to do]
   2. [second thing to do]
   
   **Testing required:**
   - [what to test after completion]
   ```

5. **Tell the user explicitly:**
   ```
   ⚠️ I ran out of tokens before completing this change.
   
   STATUS:
   - Main game file: RESTORED to last working version
   - Incomplete work saved: Twinstick Demo-INCOMPLETE.html
   - Documentation: Updated with what needs to be done
   
   NEXT STEPS:
   Start a new chat and say: "Continue the [feature name] from the handoff notes"
   ```

### Safe Editing Guidelines:

**Low Token Budget (<20% remaining):**
- Only documentation updates
- Only bug analysis (no fixes)
- Only planning/design work
- NO code changes to HTML file

**Medium Token Budget (20-40% remaining):**
- Small bug fixes only (1-2 functions)
- Documentation updates
- Testing/verification
- Planning larger changes

**Healthy Token Budget (>40% remaining):**
- Any size changes okay
- But still check estimates first

### Example Safe Workflow:

```
User: "Add a new enemy type"

AI Response:
"I see you want to add a new enemy type. Let me check my resources first.

Current token budget: 45,000 tokens remaining (23%)

Estimated cost for new enemy:
- Drawing function: ~2,000 tokens
- Spawn logic: ~3,000 tokens  
- Stats/behavior: ~2,000 tokens
- Testing/documentation: ~3,000 tokens
- Total estimate: ~10,000 tokens

⚠️ RISK: I'm at 23% tokens. This is borderline.

RECOMMENDATION: Start a new chat for this feature to ensure:
- Complete implementation
- Thorough testing
- Proper documentation
- No risk of incomplete code

Would you like me to:
1. Create detailed specs for the new enemy (safe to do now)
2. Start implementation in new chat (recommended)
3. Attempt it now anyway (risky)
"
```

### Token Conservation Tips:

When working on this project:
- Read only relevant sections of files (use line ranges)
- Don't repeatedly view same code
- Use targeted searches instead of full file reads
- Batch related changes together
- Document efficiently (no redundant explanations)

### Remember:

**A working game with planned future work > A broken game with partial new features**

Always err on the side of caution. The user would rather wait for a new chat than have a corrupted game file.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Design Philosophy & Principles](#design-philosophy--principles)
3. [Technical Specifications](#technical-specifications)
4. [Game Design](#game-design)
5. [Character Design](#character-design)
6. [Game Systems](#game-systems)
7. [Code Architecture](#code-architecture)
8. [Art & Audio](#art--audio)
9. [Development Standards](#development-standards)
10. [Progress Log](#progress-log)
11. [Future Enhancements](#future-enhancements)

---

## 🎮 Project Overview

### Game Concept
**Magic Affinity** is a roguelike/dungeon crawler survivor game inspired by Vampire Survivors and Brotato. Players choose from three unique character classes and survive waves of enemies while leveling up and choosing powerful upgrades.

### Core Pillars
1. **Engaging Combat** - Each character has a unique playstyle
2. **Meaningful Progression** - Level up and choose powerful upgrades
3. **Replayability** - Different characters and upgrade combinations
4. **Polish** - Smooth gameplay, visual feedback, sound effects

### Target Experience
- **Session Length:** 5-15 minutes per run
- **Difficulty Curve:** Gradually increasing challenge
- **Skill Expression:** Different skill requirements per character
- **Feel:** Fast-paced, satisfying, arcade-like

---

## 🎮 Design Philosophy & Principles

### Core Design Pillars
These principles guide all design decisions for Pixel Dungeon Survivor:

1. **Build Synergy Over Random Chaos**
   - Upgrades should meaningfully interact with each other
   - Player choices matter more than pure RNG
   - Discovering powerful combinations is core to fun
   - Example: Wizard's Extra Orb + Orbit Speed + Attack Up = powerful synergy

2. **Clear Visual/Audio Feedback**
   - Player must always know WHY they got hit
   - Damage numbers, sound effects, visual flashes confirm actions
   - Enemy types must be instantly recognizable
   - Readability > Spectacle (clarity over chaos)

3. **Meaningful Progression Within & Between Runs**
   - Within run: Level ups feel impactful, player grows noticeably stronger
   - Between runs: High scores and mastery motivate "one more run"
   - Death should feel like learning, not punishment
   - Each run contributes to player skill improvement

4. **Controlled Randomness**
   - Random elements create variety (upgrade choices, spawn patterns, seasonal maps)
   - But player agency is paramount - choices determine success
   - Avoid "bad RNG ruins run" scenarios
   - Balance: Surprise without helplessness

5. **Respect Player Time**
   - Target session: 5-15 minutes per run (accessible, not marathon)
   - Quick restart, minimal downtime between runs
   - Early power spikes (feel stronger within 2-5 minutes)
   - Game over screen is fast, replay is instant

---

### Run Pacing Guidelines

**Wave 1-2 (0-2 minutes) - Foundation Phase**
- Easy enemies, low spawn rate
- Player learns character mechanics
- First upgrade choice appears
- Build direction starts to emerge

**Wave 3-4 (2-5 minutes) - Growth Phase**
- Enemy variety increases (Goblins appear)
- Spawn density rises
- Player has 2-3 upgrades, feeling stronger
- Build synergies start to show

**Wave 5 (5-10 minutes) - BOSS CHALLENGE**
- Major difficulty spike
- Boss + minions test player build
- Dramatic moment, high tension
- Victory feels earned and rewarding

**Wave 6-9 (10-15 minutes) - Mastery Phase**
- Continued escalation
- Special enemies (Tanks, Bombers at wave 7+)
- Player at peak power
- Survival becomes skill test

**Wave 10+ (15+ minutes) - Endurance Test**
- Second boss and beyond
- High difficulty, pushing limits
- Score maximization phase
- Victory is mastery

---

### Design Priorities (in order)

1. **Readability** - Can the player parse what's happening under stress?
2. **Meaningful Choices** - Do upgrade decisions feel impactful?
3. **Power Fantasy** - Does the player feel dramatically stronger late-run?
4. **Fairness** - Are deaths understandable, not frustrating?
5. **Replayability** - Does each run feel fresh and worth trying?

---

### Character Design Philosophy

Each character must have:
- **Unique Mechanics** - Not just stat differences, fundamentally different gameplay
- **Clear Difficulty Tier** - Easy (Warrior), Medium (Archer, Wizard)
- **Distinct Skill Expression** - Different ways to "be good" at the game
- **Visual Identity** - Instantly recognizable pixel art design
- **Upgrade Synergy** - Some upgrades should feel "made for" this character

Examples:
- Warrior: Tanky, auto-targeting, forgiving (easy to pick up)
- Archer: Glass cannon, movement-based shooting, natural kiting
- Wizard: Unique orb system, positioning-based, medium complexity

---

### Enemy Design Philosophy

Enemy types should:
- **Escalate Challenge** - Each new type adds complexity
- **Be Visually Distinct** - Color-coded, clear silhouettes
- **Have Clear Tells** - Telegraphed attacks, predictable patterns
- **Scale Appropriately** - HP/Speed/Damage increase per wave without feeling unfair
- **Create Varied Threats** - Mix of melee, ranged, special abilities

Design Progression:
- Wave 1-3: Slimes only (teach fundamentals)
- Wave 4+: Goblins added (faster threat)
- Wave 5: Boss (skill test)
- Wave 7+: Tanks & Bombers (special mechanics)
- Wave 10+: Higher-tier bosses (mastery test)

---

### Upgrade System Philosophy

**Core Principles:**
- **Choice Over Randomness** - Present 3 options, player picks 1
- **No "Dead" Upgrades** - Every upgrade should be useful in some build
- **Synergy Discovery** - Some combinations are powerful (reward experimentation)
- **Universal vs Specialist** - Some upgrades help everyone, some are character-specific
- **Power Curve** - Early upgrades more impactful (quick satisfaction)

**Upgrade Categories:**
1. **Universal** (work for all characters):
   - Health Boost, Attack Up, Defense Up, Speed Boost, Life Steal, Rapid Fire

2. **Character-Specific** (Wizard only):
   - Extra Orb, Orbit Speed, Orbit Range

3. **Future Expansion Ideas**:
   - Archer-specific: Pierce shots, multishot, critical hits
   - Warrior-specific: Area damage, thorns, armor stacking
   - All characters: Elemental effects, special abilities, ultimate attacks

---

### What Makes This Game Good

**Moment-to-Moment:**
- Smooth 60 FPS action
- Responsive controls (<50ms input lag)
- Clear feedback on every action
- Satisfying sound effects and visuals

**Per-Run:**
- Each character plays completely differently
- Upgrade choices create unique builds
- Boss fights are dramatic high points
- Runs are short enough to retry immediately

**Long-Term:**
- Learning curve rewards mastery
- High scores provide goals
- Character variety encourages experimentation
- Seasonal maps add visual variety

---

### Pitfalls We Avoid

❌ **Visual Clutter** - Too many bullets/enemies without clarity
✅ **Solution:** Limited enemy count, clear visual design, depth layering

❌ **Randomness Dominating** - Bad RNG ruins runs
✅ **Solution:** Controlled random, player choices matter most

❌ **Unclear Death** - Player doesn't know why they died
✅ **Solution:** Damage numbers, invulnerability frames, clear enemy tells

❌ **Boring Upgrades** - Choices that don't feel impactful
✅ **Solution:** Each upgrade is meaningful, synergies exist

❌ **Too Long/Too Short** - Run length doesn't match engagement
✅ **Solution:** 5-15 minute target, boss every 5 waves for structure

❌ **No Progression** - Each run resets everything
✅ **Solution:** High scores persist, skill mastery carries over

---

### Design Philosophy Summary

**In one sentence:**  
*"Make every run feel like a unique experiment where player choices matter, death teaches lessons, and victory feels earned."*

**Key Takeaways:**
- Simple controls, deep strategy
- Clear feedback, readable action
- Meaningful choices over pure RNG
- Dramatic power growth within runs
- Short sessions, high replayability
- Each character tells a different story

**When Adding New Features, Ask:**
1. Does it make player choices more meaningful?
2. Does it add clarity or confusion?
3. Does it respect the player's time?
4. Does it create replayability?
5. Does it fit our 5-15 minute session target?

If the answer is "no" to most of these, reconsider the feature.

---

## 🔧 Technical Specifications

### Platform & Technology
- **Framework:** Phaser 3 (v3.70.0)
- **Format:** Single HTML file (self-contained)
- **Resolution:** 800x600 pixels
- **Physics:** Arcade Physics
- **Audio:** Web Audio API (procedural sound generation)

### File Structure
```
Twinstick Demo.html (single file contains):
├── HTML/CSS (minimal styling)
├── Sound System (Web Audio API)
├── Game Scenes
│   ├── CharacterSelectScene
│   ├── GameScene (main gameplay)
│   └── GameOverScene
└── Game Logic (all classes and systems)
```

### Performance Targets
- **FPS:** Solid 60fps
- **Load Time:** Instant (no external assets)
- **Memory:** Efficient cleanup, no leaks
- **Input Latency:** <50ms response time

---

## 🎨 Game Design

### Genre & Inspiration
**Genre:** Roguelike Survivor / Bullet Heaven  
**Inspired by:** Vampire Survivors, Brotato, Halls of Torment

### Core Gameplay Loop
```
Start Run → Choose Character → Survive Waves → Kill Enemies → 
Collect XP → Level Up → Choose Upgrade → Repeat → Death → 
View Stats → Play Again
```

### Win/Loss Conditions
- **No Win Condition:** Endless survival (score-based)
- **Loss Condition:** Player health reaches 0
- **Goal:** Survive as long as possible, maximize score

### Difficulty Scaling
- **Wave Progression:** Each wave has 30% more enemies
- **Enemy Scaling:** +5 HP, +2 Speed, +1 Damage per wave
- **Enemy Variety:** New enemy types unlock at wave 4+
- **Natural Difficulty:** Player must balance offense/defense upgrades

---

## 👥 Character Design

### Design Philosophy
Each character should feel distinctly different with unique:
- **Combat mechanics** (how they attack)
- **Stat distribution** (speed/damage/defense balance)
- **Skill requirements** (easy/medium/hard to play)
- **Visual identity** (clear pixel art design)

### Character 1: Archer 🏹

**Archetype:** Agile Archer / Glass Cannon  
**Difficulty:** Medium (movement-based shooting)

**Base Stats:**
- Health: 80
- Speed: 180 (Fast)
- Damage: 15 (Medium)
- Defense: 5 (Low)
- Attack Speed: 600ms cooldown

**Combat Mechanic:**
- Shoots arrows in OPPOSITE direction of movement (kiting mechanic)
- Only shoots while moving (no shooting when standing still)
- Movement-based shooting (WASD controls both movement and aim)
- Arrows fly at 450 speed across screen
- Natural "run and gun" / "kiting" playstyle

**Playstyle:**
- Always moving to shoot
- Automatically aims away from danger while fleeing
- True kiting character - run from enemies while attacking
- High skill expression through movement choices
- "Ranged DPS" role with active positioning
- Punishes mistakes (low health, must keep moving)

**Visual Design:**
- Dark green leather hood
- Brown leather armor
- Dual daggers at sides (visual only)
- Mysterious face (shadowed eyes)

**Upgrade Priority:**
- Attack Up (increase damage)
- Rapid Fire (shoot faster)
- Speed Boost (kite better)
- Health (survival insurance)

---

### Character 2: Warrior ⚔️

**Archetype:** Heavy Tank / Melee Bruiser  
**Difficulty:** Easy (auto-targeting)

**Base Stats:**
- Health: 150
- Speed: 100 (Slow)
- Damage: 30 (High)
- Defense: 5 (but high HP compensates)
- Attack Speed: 1200ms cooldown

**Combat Mechanic:**
- Auto-targets nearest enemy
- Throws heavy axes automatically
- No aiming required
- Slower but devastating attacks

**Playstyle:**
- Face-tank enemies
- Trade hits effectively
- "Tank/Bruiser" role
- Forgiving for new players

**Visual Design:**
- Iron helmet with visor
- Heavy silver/steel armor
- Large shoulder pads
- Big sword on hip

**Upgrade Priority:**
- Health Boost (get tankier)
- Attack Up (hit harder)
- Defense Up (take less damage)
- Life Steal (sustain)

---

### Character 3: Wizard 🔮

**Archetype:** Magical Battlemage / Area Control  
**Difficulty:** Medium (positioning-based)

**Base Stats:**
- Health: 100
- Speed: 140 (Medium)
- Damage: 20 (Medium)
- Defense: 5 (Medium)
- Attack Speed: N/A (uses orbs)

**Combat Mechanic:**
- **Unique System:** Orbiting magical orbs
- Starts with 2 orbs that rotate around wizard
- Orbs deal damage on contact (500ms cooldown per enemy)
- Medium-range combat (must position near enemies)

**Orb Properties:**
- **Orbit Distance:** 50 units (expandable)
- **Rotation Speed:** 2x base (upgradeable)
- **Damage on Contact:** Full player damage
- **Visual:** Blue/cyan magical orbs with glow

**Playstyle:**
- Dance around enemies in melee-medium range
- Position to maximize orb hits
- "Battle Mage" role
- Scales uniquely with upgrades

**Visual Design:**
- Purple/blue wizard hat with gold star
- Blue/purple robes with gold trim
- White beard
- Wooden staff with glowing blue orb

**Upgrade Priority:**
- Extra Orb (add more orbs)
- Orbit Speed (faster rotation = more DPS)
- Orbit Range (safer distance)
- Attack Up (each orb hits harder)

**Unique Upgrades (Wizard-Only):**
1. **Extra Orb** 🔮 - Add +1 orbiting orb
2. **Orbit Speed** 🌀 - +30% rotation speed
3. **Orbit Range** 📡 - +15 orbit distance

---

## ⚙️ Game Systems

### Wave System

**Wave Structure:**
```javascript
Wave 1: 5 enemies (basic slimes)
Wave 2: 6-7 enemies (basic slimes)
Wave 3: 8-9 enemies (basic slimes)
Wave 4: 10-12 enemies (slimes + goblins)
Wave 5: BOSS WAVE! 1 Boss + 3 minions = 4 total
Wave 6: Regular wave (continues scaling)
Wave 7+: All enemy types + special enemies
Wave 10: BOSS WAVE! 1 Boss + 3 minions = 4 total
Wave 15: BOSS WAVE! 1 Boss + 3 minions = 4 total
(Boss every 5 waves: 5, 10, 15, 20, etc.)
```

**Spawn System:**
- Enemies spawn from screen edges (random)
- Staggered spawning (800ms between spawns)
- 2 second pause between waves
- Wave complete notification
- Boss waves spawn 1 boss immediately + 3 minions over time

**Scaling Formula:**
- Enemies per wave: `enemiesThisWave * 1.3`
- Enemy HP: `30 + (wave * 5)`
- Enemy Speed: `40 + (wave * 2)`
- Enemy Damage: `5 + wave`

**Boss Wave System:**
- Triggers every 5th wave (wave % 5 === 0)
- Boss spawns from top center (x: 400, y: -50)
- "BOSS INCOMING!" warning message
- Camera shake + dramatic sound
- Boss health bar appears at top
- 3 additional regular enemies spawn as minions
- Wave completes when boss + all minions defeated

---

### Enemy Types

#### Slime (Basic Enemy)
**Appearance:** Waves 1+  
**Health:** 30 + (wave * 5)  
**Speed:** 40 + (wave * 2)  
**Damage:** 5 + wave  
**XP Value:** 20  
**Score Value:** 10

**Visual:**
- Green gelatinous body
- Two white eyes with black pupils
- Lighter green highlight on top
- Darker green bottom edge

**Behavior:**
- Moves directly towards player
- Simple chase AI
- Bounces off world edges

---

#### Goblin (Advanced Enemy)
**Appearance:** Wave 4+  
**Health:** 50 + (wave * 8)  
**Speed:** 60 + (wave * 3)  
**Damage:** 8 + (wave * 2)  
**XP Value:** 35  
**Score Value:** 25

**Visual:**
- Green skin with pointed ears
- Red glowing eyes
- Brown leather armor
- Wooden club weapon

**Behavior:**
- Moves directly towards player
- Faster and more aggressive than slimes
- Higher reward for killing

---

#### Tank (Heavy Enemy)
**Appearance:** Wave 7+  
**Health:** 150 + (wave * 15)  
**Speed:** 20 + wave  
**Damage:** 12 + (wave * 2)  
**XP Value:** 60  
**Score Value:** 50

**Visual:**
- Heavy iron armor (dark gray)
- Large armored body
- Red glowing visor
- Imposing stance

**Behavior:**
- Slow but very tanky
- Takes 50% reduced damage from projectiles
- Fires laser beams at player every 4 seconds
- High reward for killing

**Special Ability:**
- Laser Attack: Fires slow-moving red laser toward player
- Laser deals 15 damage
- Visual warning before firing

---

#### Bomber (Suicide Enemy)
**Appearance:** Wave 7+  
**Health:** 20 + (wave * 3)  
**Speed:** 45 + (wave * 2)  
**Damage:** 15 + (wave * 3)  
**XP Value:** 40  
**Score Value:** 35

**Visual:**
- Dark purple/black hooded figure
- Glowing cyan eyes
- Bomb strapped to chest
- Golden sparking fuse

**Behavior:**
- Teleports closer to player (3 second cooldown)
- Explodes when near player at low HP
- Explosion has 80 unit radius
- Explosion damages player AND other enemies
- Gives XP/score even if explodes

**Special Abilities:**
- Teleport: Creates purple particle effect, appears near player
- Explosion: Massive AoE damage, visual blast waves

---

#### Boss (Elite Enemy)
**Appearance:** Wave 5, 10, 15, 20 (every 5th wave)  
**Health:** 500 + (bossLevel * 200) where bossLevel = wave / 5  
**Speed:** 35 + (bossLevel * 5)  
**Damage:** 20 + (bossLevel * 5), 25 laser damage  
**XP Value:** 200  
**Score Value:** 500

**Visual:**
- Large demon-like creature (2x normal enemy size)
- Dark red muscular body
- Black horns
- Glowing yellow eyes
- Red aura effect

**Behavior:**
- Spawns from top center with dramatic entrance
- Chases player (slower than normal enemies)
- Fires laser attacks every 3 seconds
- Has dedicated health bar at top of screen

**Special Abilities:**
- Laser Attack: Warning line (0.5s) then thick red beam
- Laser tracks player position
- Laser deals 25 damage + knockback
- Boss health bar changes color based on HP
- Massive explosion on death

**Boss Stats by Wave:**
```
Wave 5:  HP: 500,  Speed: 35, Damage: 20/25
Wave 10: HP: 700,  Speed: 40, Damage: 25/30
Wave 15: HP: 900,  Speed: 45, Damage: 30/35
Wave 20: HP: 1100, Speed: 50, Damage: 35/40
```

**Boss Wave Composition:**
- 1 Boss (spawns immediately)
- 3 Regular enemies (spawn over 2.4 seconds)
- Total: 4 enemies per boss wave

---

### Leveling System

**XP Requirements:**
```javascript
Level 1→2: 100 XP
Level 2→3: 150 XP (previous * 1.5)
Level 3→4: 225 XP (previous * 1.5)
// Continues exponentially
```

**Level Up Process:**
1. Collect enough XP from kills
2. Game pauses (physics freeze)
3. Screen overlay appears
4. Choose 1 of 3 random upgrades
5. Upgrade applied immediately
6. Game resumes

**XP Collection:**
- Blue orbs drop from killed enemies
- Auto-collect after 5 seconds
- Can be collected earlier by walking over
- Pulse animation attracts attention

---

### Upgrade System

**Universal Upgrades (All Characters):**

1. **Health Boost** ❤️
   - +20 Max HP
   - Restore 30 HP immediately
   - *Priority: High for all*

2. **Attack Up** ⚔️
   - +5 Damage
   - *Priority: High for all*

3. **Speed Boost** 💨
   - +20% Movement Speed
   - *Priority: High for Archer, Medium for others*

4. **Defense Up** 🛡️
   - +3 Defense (damage reduction)
   - *Priority: High for Warrior*

5. **Life Steal** 🩸
   - Heal 2 HP per enemy killed
   - *Priority: High for Warrior, Medium for others*

6. **Rapid Fire** 🏹
   - +20% Attack Speed (reduces cooldown to 0.8x)
   - *Only shows for Archer & Warrior*
   - *Priority: High for Archer*

**Wizard-Specific Upgrades:**

7. **Extra Orb** 🔮
   - Add +1 orbiting orb
   - *Wizard only*
   - *Priority: Highest for Wizard*

8. **Orbit Speed** 🌀
   - +30% Orb rotation speed
   - *Wizard only*
   - *Priority: High for Wizard*

9. **Orbit Range** 📡
   - +15 Orbit distance
   - *Wizard only*
   - *Priority: Medium for Wizard*

**Upgrade Selection Logic:**
- 3 random upgrades shown each level
- Filtered by character (e.g., no Rapid Fire for Wizard)
- No duplicate selections in same level
- Weighted randomization possible for balance

---

### Combat System

**Projectile System (Archer & Warrior):**
- Archer: Arrows towards mouse cursor
- Warrior: Axes towards nearest enemy
- Collision detection with enemies
- Off-screen cleanup (destroy after 2-3 seconds)
- Visual rotation to match direction

**Orb System (Wizard):**
- Continuous rotation around player
- Collision detection on contact
- Per-enemy hit cooldown (500ms)
- Dynamic orb count (upgrades add more)
- No projectiles spawned

**Damage Calculation:**
```javascript
Damage Dealt = Player.damage
Damage Taken = max(1, Enemy.damage - Player.defense)
```

**Invulnerability Frames:**
- 1000ms (1 second) after taking damage
- Prevents stunlock
- Visual flicker effect (50% alpha flash)
- Knockback effect on hit

---

### UI System

**HUD Elements:**

**Top Left Panel (300x100px):**
- Character name (Archer/Warrior/Wizard)
- Level display
- HP bar (color-coded: green>50%, orange 25-50%, red<25%)
- XP bar (blue, shows progress to next level)

**Top Right Panel (300x80px):**
- Wave number (red text)
- Current score (cyan text)
- Survival time (MM:SS format)

**Damage Numbers:**
- Float upward from hit location
- Red color for visibility
- 800ms duration
- Fade out animation

**Level Up Screen:**
- Dark overlay (80% opacity)
- "LEVEL UP!" title (gold)
- 3 upgrade cards with:
  - Icon (emoji)
  - Name (gold text)
  - Description (white text)
  - Hover effect (border changes to green)
  - Click to select

---

### Scoring System

**Score Sources:**
```javascript
Enemy Kill: +10 (Slime) or +25 (Goblin)
Survival Time: +10 per second
Final Score = Kill Score + (Survival Time * 10)
```

**High Score:**
- Persists during session
- Displayed on character select
- Displayed on game over screen
- Resets on page refresh

---

### Seasonal Map System

**Map Selection:**
- Random season chosen at game start
- 4 unique themes: Spring, Summer, Fall, Winter
- Distinct visual appearance per season
- Season-specific environmental hazards AND mechanics
- Each season changes gameplay slightly

**Seasonal Themes:**

**Spring:** 🌸
- Color: Bright green grass (#4a7c2e) with grass blade details
- Decoration: 40 colorful flowers (pink, magenta, light pink) scattered across map
- Hazard: Thorny bushes (3 damage per second)
- Mechanics: No special mechanics, pure visual beauty
- Visual: Fresh, vibrant, blooming, spring garden feel
- Gameplay Impact: Standard movement, focus on visual appeal

**Summer:** 🌳
- Color: Desert sand tones (#8b6914) with dune patterns
- Decoration: 8 large trees with brown trunks and green canopies
- Hazard: Fire pits with animated flames (3 damage per second)
- **Mechanics: Trees BLOCK ALL PROJECTILES** (player and enemy!)
  - Trees have collision physics
  - Both player arrows/axes AND enemy projectiles blocked
  - Forces positioning and line-of-sight strategy
  - Can use trees as cover
- Visual: Desert oasis with protective trees
- Gameplay Impact: Strategic positioning, use trees as shields

**Fall:** 🍂
- Color: Brown/tan earthy tones (#5a4a2a) with dirt patches
- Decoration: 30 flying brown leaves that drift across screen
- Hazard: Poison mushrooms (3 damage per second)
- **Mechanics: Flying leaves OBSCURE VISION**
  - Leaves float at depth 500 (above game but below UI)
  - Drift downward and sideways with rotation
  - Visual impairment only (don't cause damage)
  - Makes it harder to see enemies and projectiles
  - Wrap around screen edges
- Visual: Autumn forest with falling foliage
- Gameplay Impact: Reduced visibility, must track enemies carefully

**Winter:** ❄️
- Color: White/light gray snow/ice (#d0d0d0) with ice crystal details
- Decoration: 12 light blue ice patches with shine effects
- Hazard: Ice spikes (3 damage per second)
- **Mechanics: Ice patches make floor SLIPPERY**
  - Player moves 50% FASTER on ice
  - Reduced control (lower drag = sliding effect)
  - Makes precise dodging harder
  - Can't stop quickly on ice
  - Ice patches clearly visible (light blue, semi-transparent)
- Visual: Frozen, icy, slippery landscape
- Gameplay Impact: Movement challenge, risk vs speed trade-off

---

### Environmental Hazards System

**Hazard Properties:**
- 5 hazards spawn per map
- Placed randomly (avoiding spawn points)
- Deal 3 damage per second on contact
- 1 second cooldown between damage ticks
- Immovable (player can't push them)
- Visual flash on damage dealt

**Hazard Types:**

**Thorny Bushes (Spring):**
- Green circular bush with red thorns
- Static obstacle
- Represents dangerous plant growth

**Fire Pits (Summer):**
- Animated orange/red flames
- Pulsing alpha and scale effect
- Bright yellow center for heat

**Poison Mushrooms (Fall):**
- Purple cap with white spots
- Brown stem
- Classic poisonous appearance

**Ice Spikes (Winter):**
- Light blue crystalline structure
- Triangular spike shape
- Semi-transparent icy look

---

### Pause System

**Pause Controls:**
- ESC key or P key to pause/unpause
- Game state freezes (physics pause)
- Dark overlay (85% opacity)

**Pause Menu:**
- "PAUSED" title (large white text)
- "Press ESC or P to Resume" instruction
- Resume button (green, clickable)
- Quit to Menu button (red, clickable)
- All buttons have hover effects and sounds

**Pause Restrictions:**
- Cannot pause during level-up screen
- Physics fully paused (enemies, projectiles, orbs stop)
- Touch controls disabled while paused

---

### Mobile/Touch Controls

**Virtual Joystick:**
- Bottom-left corner (semi-transparent)
- Base circle: 50px radius, dark gray
- Stick circle: 25px radius, green
- Maximum displacement: 40px

**Touch Input:**
- Drag within joystick area to move
- Normalized movement (smooth in all directions)
- Visual feedback (stick follows finger)
- Auto-resets on touch release

**Touch Detection:**
- Only shows on devices with touch support
- Doesn't interfere with mouse controls
- Overrides keyboard when active
- Works seamlessly with all three characters

---

### Fullscreen Mode

**Fullscreen Button:**
- Top-right corner of character select
- Icon: ⛶ (fullscreen symbol)
- Hover effect: scales to 1.2x
- Click to toggle fullscreen

**Fullscreen Behavior:**
- Game scales to fit screen (maintains aspect ratio)
- Centers automatically
- Works on all modern browsers
- ESC to exit fullscreen (browser standard)

---

## 🏗️ Code Architecture

### Scene Structure

```javascript
// 3 Main Scenes
1. CharacterSelectScene
   - Character selection UI
   - Character preview with stats
   - Sound effects on interaction
   - High score display

2. GameScene (Main Gameplay)
   - Player management
   - Enemy spawning & AI
   - Combat systems
   - UI updates
   - Physics simulation
   - Upgrade system

3. GameOverScene
   - Final statistics
   - Score display
   - Replay button
   - Sound effects
```

---

### Key Classes & Systems

#### Sound System
```javascript
class SoundFX {
    audioContext: AudioContext
    masterVolume: 0.3
    
    Methods:
    - play(type) // shoot, hit, enemyDeath, playerHit, xpCollect, levelUp, select, hover
    - All sounds procedurally generated (no files needed)
}
```

#### Player Object Properties
```javascript
player = {
    // Graphics
    graphics: Phaser.Graphics
    x, y: position
    
    // Stats
    health: current HP
    maxHealth: maximum HP
    speed: movement speed
    damage: base damage
    defense: damage reduction
    level: current level
    xp: current XP
    xpToNext: XP needed for next level
    
    // Character-specific
    characterType: 'archer'|'warrior'|'wizard'
    attackSpeed: cooldown in ms (Archer/Warrior)
    orbCount: number (Wizard only)
    orbSpeed: rotation speed (Wizard only)
    orbDistance: orbit radius (Wizard only)
    
    // State
    invulnerable: boolean
    invulnerableTime: remaining ms
    lastAttackTime: timestamp
    lifeSteal: HP per kill (optional)
}
```

#### Enemy Object Properties
```javascript
enemy = {
    graphics: Phaser.Graphics
    x, y: position
    health: current HP
    maxHealth: max HP
    speed: movement speed
    damage: damage dealt
    enemyType: 0 (slime) or 1 (goblin)
    xpValue: XP dropped
    scoreValue: score awarded
    lastOrbHit: timestamp (for wizard orb cooldown)
}
```

---

### Core Game Loop

```javascript
GameScene.update(time, delta) {
    if (paused) return;
    
    // 1. Player Movement
    - Read WASD/Arrow keys
    - Normalize diagonal movement
    - Apply velocity
    
    // 2. Character-Specific Combat
    if (archer) {
        - Shoot arrow towards mouse every 600ms
    } else if (warrior) {
        - Auto-attack nearest enemy every 1200ms
    } else if (wizard) {
        - Update orb positions (rotate)
        - Check orb-enemy collisions
    }
    
    // 3. Enemy AI
    for each enemy {
        - Calculate angle to player
        - Move towards player
    }
    
    // 4. Cleanup
    - Remove off-screen projectiles
    - Update damage numbers
    - Handle invulnerability frames
    
    // 5. Wave Management
    - Check if wave complete
    - Start next wave after delay
}
```

---

### Collision Systems

**Overlap Handlers:**
```javascript
// Player hit by enemy
physics.add.overlap(player, enemies, playerHitEnemy)
- Deal damage (with defense calculation)
- Apply invulnerability frames
- Knockback effect
- Camera shake
- Sound effect

// Projectile hits enemy
physics.add.overlap(projectiles, enemies, projectileHitEnemy)
- Deal damage
- Destroy projectile
- Check if enemy dies
- Sound effect
- Flash enemy

// Player collects XP
physics.add.overlap(player, xpOrbs, collectXP)
- Add XP
- Check for level up
- Destroy orb
- Sound effect
```

---

### Important Functions

#### Character Drawing Functions
```javascript
drawRogue(graphics) // Green hood, leather armor, daggers
drawWarrior(graphics) // Iron helmet, heavy armor, sword
drawWizard(graphics) // Wizard hat, robes, staff with orb
```

#### Wizard Orb System
```javascript
createWizardOrbs() {
    - Create initial orbs based on orbCount
    - Set starting angles evenly distributed
    - Add physics bodies
    - Store in wizardOrbs array
}

updateWizardOrbs() {
    - Add new orbs if orbCount increased
    - Update each orb position:
        angle += orbSpeed * 0.02
        x = player.x + cos(angle) * orbDistance
        y = player.y + sin(angle) * orbDistance
    - Check collisions with enemies
}

orbHitEnemy(orb, enemy) {
    - Check cooldown (500ms)
    - Deal damage
    - Visual/audio feedback
    - Check if enemy dies
}
```

#### Enemy Spawning
```javascript
spawnEnemy() {
    - Choose random edge (top/right/bottom/left)
    - Spawn position at edge
    - Determine enemy type (wave 1-3: slime only, wave 4+: mix)
    - Set stats based on wave number
    - Add to enemies group
}
```

---

### Memory Management

**Cleanup Points:**
1. Projectiles destroyed when off-screen
2. XP orbs auto-collected after 5 seconds
3. Wizard orbs cleaned up on game over
4. Damage numbers removed after animation
5. Enemies removed when killed

**Depth Layering:**
- Background: 0 (default)
- Game entities: 10 (player, enemies, projectiles, orbs)
- Effects: 50 (level up effects)
- Upgrade UI: 100+ (overlays)
- HUD: 1000+ (always on top)

---

## 🎨 Art & Audio

### Visual Style
**Aesthetic:** Classic 16x16 pixel art RPG style  
**Palette:** Rich colors with good contrast  
**Inspiration:** 8-bit/16-bit era RPGs

### Pixel Art Specifications

**Character Sprites:** 16x16 pixels (base size)  
**Enemy Sprites:** 16x16 pixels  
**Projectiles:** 8x12 pixels  
**XP Orbs:** 8x8 pixels  
**Wizard Orbs:** 10x10 pixels

**Color Palette Examples:**
- Grass: #2d5016 (main), #1e3a0f (dark details)
- UI Panels: #0f0f1e (dark), #4a4a5a (borders)
- Health: #ff0000 (red), #00ff00 (green), #ffa500 (orange)
- XP: #4169e1 (royal blue)
- Gold: #ffd700

### Background Design
- Tiled grass texture (32x32 tiles)
- Dark grass detail pixels for variation
- Scattered stone decorations
- Simple but effective

### Particle Effects
1. **Death Explosion:** 8 particles, multiple colors
2. **Level Up:** Ring + star particles
3. **XP Collection:** Tween to player
4. **Damage Numbers:** Float up + fade

---

### Audio Design

**Sound Effects (Procedural):**

1. **Shoot** - Short ascending tone (200-400Hz, 0.1s)
2. **Hit** - Quick descending square wave (200-50Hz, 0.05s)
3. **Enemy Death** - Sawtooth descend (300-50Hz, 0.2s)
4. **Player Hit** - Low harsh tone (100Hz, 0.15s)
5. **XP Collect** - Ascending chime (800-1200Hz, 0.1s)
6. **Level Up** - C Major arpeggio (C-E-G-C notes)
7. **Select** - Quick ascending (600-800Hz, 0.05s)
8. **Hover** - Subtle tone (400Hz, 0.03s)

**Volume:** Master volume at 30% (0.3)  
**Technology:** Web Audio API oscillators  
**Advantages:** No file loading, instant, customizable

---

## 📐 Development Standards

### ⚠️ HARD RULES (Must Always Follow)

**Before Delivering ANY Code:**
1. ✅ **Test all 3 characters** - Each must work perfectly
2. ✅ **Test all new features** - No placeholders or broken functionality  
3. ✅ **Check console** - Zero errors or warnings
4. ✅ **Verify memory cleanup** - No leaks (destroy objects properly)
5. ✅ **Test pause/unpause** - Must work in all scenarios
6. ✅ **Check depth layering** - UI always on top (depth 1000+)
7. ✅ **Verify mobile controls** - Touch joystick must work
8. ✅ **Test all seasons** - Each map theme must render correctly
9. ✅ **Check hazard collisions** - Must deal damage properly
10. ✅ **Update MD file** - Document ALL changes immediately

**Code Quality Non-Negotiables:**
- ❌ **Never use undefined variables** - Always initialize
- ❌ **Never leave commented-out code** - Remove or fix it
- ❌ **Never use magic numbers** - Use named constants
- ❌ **Never skip error checking** - Always validate states
- ❌ **Never forget cleanup** - Destroy graphics/timers on scene end

**Testing Protocol:**
```
1. Load game → Character select appears
2. Click each character → Game starts with correct char
3. Test movement (keyboard + touch if mobile)
4. Test combat (each character's unique attack)
5. Take damage from enemy → Check invuln frames
6. Take damage from hazard → Check damage tick
7. Collect XP → Check level up
8. Choose upgrade → Verify it applies
9. Pause game (ESC/P) → Everything freezes
10. Resume → Everything continues
11. Die → Game over screen appears
12. Repeat for ALL 3 characters
```

---

### Code Quality Requirements

**Must Have:**
- No errors in console
- Smooth 60fps gameplay
- All features fully implemented
- Proper memory cleanup
- Clear, readable code

**Testing Checklist:**
- [ ] All 3 characters load correctly
- [ ] All 3 characters can attack
- [ ] Enemies spawn and move
- [ ] Collision detection works
- [ ] XP collection works
- [ ] Leveling up works
- [ ] All upgrades apply correctly
- [ ] Game over triggers properly
- [ ] Sound effects play
- [ ] UI displays correctly
- [ ] No memory leaks

### Naming Conventions
- camelCase for variables/functions
- PascalCase for classes/scenes
- UPPER_CASE for constants
- Descriptive names (no single letters except in loops)

### Code Organization
1. Constants and configuration at top
2. Scene classes in order (Select → Game → GameOver)
3. Helper functions grouped logically
4. Comments for complex logic only
5. Consistent indentation (4 spaces)

---

## 🐛 Bug Fixes & Issues

### Version 1.2.0 - Archer Gameplay Redesign (November 6, 2025)

#### Gameplay Change: Archer Movement-Based Shooting 🎯
**Change:** Complete redesign of Archer shooting mechanics from mouse-aim to movement-based.

**Previous System:**
- Archer shot arrows towards mouse cursor position
- Required mouse/pointer for aiming
- Twin-stick shooter style gameplay
- Awkward on mobile and with keyboard-only controls
- Player had to manage both movement keys AND mouse aiming simultaneously

**New System:**
- Archer shoots in OPPOSITE direction of movement
- Only shoots while moving (standing still = no shooting)
- WASD controls both movement AND shooting direction
- Natural kiting mechanic - run away while shooting backwards

**Why This Change:**
- **Better Feel:** More intuitive - just move away from enemies to shoot them
- **Easier Controls:** Single input (WASD) controls both movement and combat
- **True Kiting:** Embodies the "archer running from danger" fantasy
- **Mobile Friendly:** Works perfectly with touch controls (no separate aim needed)
- **Skill Expression:** Still requires positioning skill, but more natural
- **Clearer Identity:** Distinct from Warrior (auto-aim) and Wizard (orbital)

**Implementation:**
- Created new function `shootArrowOppositeMovement(moveX, moveY)`
- Calculates angle using `Math.atan2(-moveY, -moveX)` (inverted for opposite direction)
- Only triggers when `moveX !== 0 || moveY !== 0` (player is moving)
- Removed dependency on mouse/pointer input for Archer
- Kept old `shootArrowTowardsMouse()` function for potential future use

**Code Changes:**
```javascript
// In update() - Archer attack logic:
if (this.player.characterType === 'archer') {
    if (moveX !== 0 || moveY !== 0) {
        if (time > this.player.lastAttackTime + this.player.attackSpeed) {
            this.shootArrowOppositeMovement(moveX, moveY);
            this.player.lastAttackTime = time;
        }
    }
}

// New function:
shootArrowOppositeMovement(moveX, moveY) {
    const angle = Math.atan2(-moveY, -moveX); // Negative for opposite direction
    // ... rest of arrow creation code
}
```

**Files Modified:**
- `update()` function - changed Archer attack trigger (lines ~2078-2085)
- Added `shootArrowOppositeMovement()` function (new, ~30 lines)
- Character design documentation updated

**Difficulty Adjustment:**
- Archer remains "Medium-Hard" difficulty
- Easier to control, but still requires good positioning
- Must constantly move to attack (can't stand and shoot)

---

### Version 1.1.2 - Character Rename & Freeze Fix (November 6, 2025)

#### Bug #4: Archer Arrow Freeze Bug ⚠️ CRITICAL
**Symptom:** Game would completely freeze when an Archer's arrow first hit an enemy.

**Root Cause:**
- Physics overlap callback `projectileHitEnemy()` was firing multiple times per frame
- When arrow collided with enemy, callback triggered continuously while bodies overlapped
- Each callback would destroy the projectile, but multiple callbacks already queued
- Created infinite loop of collision checks before projectile destruction completed
- Result: Browser tab would freeze, game unplayable for Archer character

**Fix Applied:**
- Added `hasHit` flag check to prevent multiple hits from same projectile
- When projectile hits enemy, set `projectile.hasHit = true` immediately
- Early return if `projectile.hasHit` is already true
- Prevents callback from executing multiple times for same projectile
- Pattern matches Wizard's `lastOrbHit` cooldown system

**Code Added:**
```javascript
// In projectileHitEnemy() function:
if (projectile.hasHit) return;
projectile.hasHit = true;
```

**Files Modified:**
- `projectileHitEnemy()` function - added hasHit flag check (lines 2350-2352)

---

#### Bug #5: setTint Error on Enemy Hit
**Symptom:** Console error: "Uncaught TypeError: enemy.setTint is not a function" when arrow hits enemy.

**Root Cause:**
- Enemies are created as Graphics objects, not Sprite objects
- Graphics objects don't have `setTint()` or `clearTint()` methods
- Code was calling `enemy.setTint(0xffffff)` to flash white on hit
- This worked in other games with Sprite-based enemies, but not with Graphics

**Fix Applied:**
- Changed `enemy.setTint(0xffffff)` to `enemy.setAlpha(0.5)`
- Changed `enemy.clearTint()` to `enemy.setAlpha(1)`
- `setAlpha()` works with Graphics objects and provides similar visual feedback
- Matches pattern used successfully in `orbHitEnemy()` function

**Code Changed:**
```javascript
// OLD (broken):
enemy.setTint(0xffffff);
this.time.delayedCall(50, () => {
    if (enemy.active) enemy.clearTint();
});

// NEW (working):
enemy.setAlpha(0.5);
this.time.delayedCall(50, () => {
    if (enemy.active) enemy.setAlpha(1);
});
```

**Files Modified:**
- `projectileHitEnemy()` function - changed flash effect method (lines 2368-2372)

---

#### Change #1: Rogue Renamed to Archer
**Change:** Character "Rogue" renamed to "Archer" throughout game.

**Reason:** 
- Character shoots arrows with bow, not daggers/stealth attacks
- "Archer" is more intuitive and descriptive
- Better matches gameplay mechanics (ranged archer playstyle)

**Changes Made:**
- Character select screen: "ROGUE" → "ARCHER"
- In-game UI: "ROGUE" → "ARCHER" 
- Game over screen: "Rogue" → "Archer"
- Internal character type: `'rogue'` → `'archer'`
- All conditional checks updated: `=== 'rogue'` → `=== 'archer'`
- Comments updated: "Rogue shoots arrows" → "Archer shoots arrows"

**Note:** Function name `drawRogue()` kept as-is for code stability (only internal reference).

**Files Modified:**
- Character select scene (lines ~244, 314, 325, 335, 849)
- Game scene UI (line 1161)
- Game scene update loop (line 2078)
- Game over scene (line 3302)
- Comments and display text throughout

---

### Version 1.1.1 - Critical Bug Fixes (November 3, 2025)

#### Bug #1: Wave 1 Freezing ⚠️ CRITICAL
**Symptom:** Game would freeze during first wave, making it unplayable.

**Root Cause:**
- Boss wave detection logic (`wave % 5 === 0`) was executing even on wave 1
- When boss wave logic ran, it would set `this.enemiesThisWave = 3`
- This overwrote the scaling enemy count mid-wave
- Spawn timer would try to spawn based on incorrect enemy count
- Wave completion check couldn't match spawned vs expected enemies
- Result: Wave never completed, game appeared frozen

**Fix Applied:**
- Completely separated boss wave logic from regular wave logic in `startWave()`
- Boss waves now use separate variable `additionalEnemies = 3` instead of overwriting `enemiesThisWave`
- Boss spawn handled separately from minion spawns
- Wave completion check now accounts for boss + minions properly
- Added `isBossWave` flag initialization to prevent undefined behavior

**Files Modified:**
- `startWave()` function - complete rewrite
- `update()` function - wave completion check
- `create()` function - added `isBossWave = false` initialization

---

#### Bug #2: Enemies Attacking During Pause
**Symptom:** Tank lasers, boss lasers, and bomber teleports would continue during level-up pause.

**Root Cause:**
- Time-based attack cooldowns didn't check `this.paused` state
- Physics would pause but timers would continue
- Special attacks could damage player during upgrade selection
- Unfair and breaks game feel

**Fix Applied:**
- Added `&& !this.paused` check to all special attack conditionals
- Tank laser attack: checks pause before firing
- Boss laser attack: checks pause before firing
- Bomber teleport: checks pause before teleporting
- Enemy spawn callbacks: checks pause before spawning

**Files Modified:**
- `update()` function - added pause checks to enemy behavior section
- `startWave()` function - added pause check to spawn callbacks

---

#### Bug #3: Wave Completion Counting
**Symptom:** Boss waves would sometimes not complete even after all enemies defeated.

**Root Cause:**
- Wave completion check only looked at `this.enemiesSpawned >= this.enemiesThisWave`
- Boss was spawned separately and not counted in `enemiesSpawned`
- Boss waves have 1 boss + 3 minions = 4 total, but check only saw 3 spawned
- Result: Wave stuck even though all enemies dead

**Fix Applied:**
- Created separate counting logic for boss waves
- Boss waves: `totalEnemiesForWave = 4`, `waveEnemiesSpawned = enemiesSpawned + 1`
- Regular waves: Uses normal `enemiesThisWave` and `enemiesSpawned` 
- Wave completes when `waveEnemiesSpawned >= totalEnemiesForWave && enemiesAlive === 0`

**Files Modified:**
- `update()` function - wave completion check section

---

### Testing Protocol After Fixes

**Minimum Test:**
1. Start game with any character
2. Play wave 1 completely (should NOT freeze)
3. Verify wave 2 starts properly

**Boss Test:**
1. Play through to wave 5
2. Verify boss spawns with warning
3. Verify boss health bar appears
4. Level up during boss fight
5. Verify game pauses properly
6. Defeat boss and all minions
7. Verify wave 6 starts

**All Tests Passing = Bugs Fixed ✅**

---

### Known Limitations (Not Bugs)

These are intentional design decisions:

- Boss waves are harder than regular waves (by design)
- Boss can kill player quickly if not careful (by design)
- Only one boss type currently (future enhancement)
- No warning before boss wave except wave number (could be added)
- Boss doesn't drop special items yet (future enhancement)

---

## 📊 Progress Log

### Version 1.1.2 - Seasonal Enhancement Update (November 3, 2025)

**Status:** ✅ Feature Enhancement - Enhanced Seasonal Maps

**New Features:**
- [x] **Boss dual lasers** - Boss now shoots 2 lasers (one at player, one random)
- [x] **Enhanced seasonal visuals** - Each season has distinct visual patterns
- [x] **Summer trees** - 8 trees that BLOCK all projectiles (cover system)
- [x] **Fall flying leaves** - 30 animated leaves that obscure vision
- [x] **Winter ice mechanics** - Slippery ice patches (50% faster, less control)
- [x] **Spring flowers** - 40 colorful flowers for visual appeal

**Seasonal Mechanics:**
- **Spring:** Pure visual beauty, no special mechanics
- **Summer:** Trees provide cover, block projectiles strategically
- **Fall:** Falling leaves reduce visibility, visual challenge
- **Winter:** Ice patches make movement slippery, speed vs control trade-off

**Technical Changes:**
- Enhanced createBackground() with detailed seasonal rendering
- Added tree collision physics (static group)
- Added falling leaves animation system
- Added ice slipperiness detection and drag mechanics
- Trees block projectiles via collider
- Leaves animate with rotation and drift

---

### Version 1.1.1 - Bug Fix Release (November 3, 2025)

**Status:** ✅ Critical Bugs Fixed - Game Fully Playable

**Critical Bugs Fixed:**
- [x] **Wave 1 Freezing** - Game no longer freezes during first wave
- [x] **Boss Wave Logic** - Boss waves now spawn correctly (1 boss + 3 minions)
- [x] **Wave Completion** - Waves complete properly including boss waves
- [x] **Pause State** - Enemies don't attack during level-up pause
- [x] **isBossWave Flag** - Properly initialized to prevent undefined behavior

**Technical Changes:**
- Rewrote `startWave()` function to separate boss and regular wave logic
- Fixed wave completion check to account for boss spawn
- Added pause state checks to all special attacks (tank lasers, boss lasers, bomber teleports)
- Added pause check to enemy spawn callbacks
- Initialized `isBossWave` flag in `create()` method

**Boss System Now Working:**
- Boss spawns at wave 5, 10, 15, 20 (every 5 waves)
- Boss health bar displays correctly
- Boss laser attacks function properly
- 3 minions spawn with boss
- Wave completes when all 4 enemies defeated
- Smooth transition to next wave

**Files Created:**
- BUG_FIXES_SUMMARY.md - Technical bug report
- TESTING_CHECKLIST.md - Comprehensive test plan
- CODE_REVIEW_SUMMARY.md - Before/after code analysis
- QUICK_START_GUIDE.md - 5-minute testing instructions

---

### Version 1.1 - Current (November 3, 2025)

**Status:** ✅ Feature Update - Mobile & Seasonal Maps

**Recently Added Features:**
- [x] **Pause Menu** - ESC/P to pause, resume or quit
- [x] **Fullscreen Mode** - Button in top-right corner
- [x] **Touch/Mobile Support** - Virtual joystick for mobile devices
- [x] **Seasonal Maps** - 4 unique map themes (Spring, Summer, Fall, Winter)
- [x] **Environmental Hazards** - Season-specific obstacles that deal damage
- [x] **Boss System** - Bosses every 5 waves with health bars and special attacks
- [x] **Special Enemies** - Tank and Bomber enemy types (Wave 7+)

**Completed Features:**
- [x] Character selection screen (3 characters)
- [x] Rogue class (arrow shooting to mouse)
- [x] Warrior class (auto-targeting axes)
- [x] Wizard class (orbiting orbs)
- [x] Wave-based enemy spawning
- [x] Five enemy types (Slime, Goblin, Tank, Bomber, Boss)
- [x] XP and leveling system
- [x] 9 upgrade types (6 universal + 3 wizard-specific)
- [x] Health, damage, and combat systems
- [x] Sound effects (8 types)
- [x] Pixel art for all characters and enemies
- [x] Game over screen with stats
- [x] High score tracking
- [x] UI with health/XP bars
- [x] Boss health bar system
- [x] Damage numbers
- [x] Visual effects (particles, level up, explosions)

**Known Issues:**
- None currently (all critical bugs fixed in v1.1.1)

**Recent Fixes:**
- Fixed wave 1 freezing issue (v1.1.1)
- Fixed boss wave spawning logic (v1.1.1)
- Fixed pause state during level-up (v1.1.1)
- Fixed wave completion counting (v1.1.1)
- Fixed wizard orb initialization error (v1.1)
- Fixed upgrade menu not clearing (v1.1)
- Fixed physics not pausing on level up (v1.1)
- Fixed sprite depth layering (v1.1)
- Fixed Rogue arrows not flying properly (v1.1)

---

### Development Timeline

**Session 1 - Initial Development:**
- Created character select scene
- Implemented Rogue and Warrior
- Basic combat and enemy spawning
- UI framework

**Session 2 - Wizard & Polish:**
- Added Wizard class with orb system
- Implemented all upgrade types
- Added sound effects system
- Fixed critical bugs
- Comprehensive testing

**Session 3 - Documentation:**
- Created this complete game design document
- Documented all systems and mechanics
- Added code architecture details
- Created progress tracking system

**Session 4 - Mobile & Seasonal Content:**
- Added pause menu and fullscreen
- Implemented touch controls for mobile
- Created 4 seasonal map themes
- Added environmental hazards
- Boss system implementation started

**Session 5 - Boss System & Bug Fixes (November 3, 2025):**
- Fixed critical wave 1 freezing bug
- Fixed boss wave spawning logic
- Completed boss system (every 5 waves)
- Added Tank and Bomber enemy types
- Fixed pause state issues
- Created comprehensive documentation:
  - BUG_FIXES_SUMMARY.md
  - TESTING_CHECKLIST.md
  - CODE_REVIEW_SUMMARY.md
  - QUICK_START_GUIDE.md
- Updated game-development-template.md with all changes

---

## 🚀 Future Enhancements

### Priority: High

**New Content:**
- [x] ~~Boss enemies every 5 waves~~ ✅ COMPLETED (v1.1.1)
- [ ] 4th character class (e.g., Necromancer with minions)
- [x] ~~2-3 more enemy types~~ ✅ COMPLETED (Tank, Bomber added)
- [ ] Multiple boss types (different attacks per boss)
- [ ] More upgrade variety (10-15 total)

**Gameplay Features:**
- [ ] Difficulty selection (Easy/Normal/Hard)
- [x] ~~Pause menu~~ ✅ COMPLETED
- [ ] Meta-progression (unlock system)
- [ ] Achievement system
- [ ] Boss defeat rewards (guaranteed upgrade or special item)

**Polish:**
- [ ] Better visual effects
- [ ] Screen shake intensity options
- [ ] More particle effects
- [ ] Smoother animations
- [ ] Boss defeat message/celebration

---

### Priority: Medium

**Quality of Life:**
- [ ] Control remapping
- [ ] Volume controls
- [x] ~~Fullscreen mode~~ ✅ COMPLETED
- [x] ~~Touch/mobile support~~ ✅ COMPLETED

**Content:**
- [x] ~~Multiple maps/environments~~ ✅ COMPLETED (4 seasonal maps)
- [x] ~~Environmental hazards~~ ✅ COMPLETED (season-specific)
- [ ] Power-up pickups (temporary buffs)
- [ ] Special abilities per character

**Systems:**
- [ ] Save system (localStorage)
- [ ] Statistics tracking
- [ ] Leaderboard (session-based)

---

### Priority: Low

**Technical:**
- [ ] Code optimization
- [ ] Asset compression (if external assets added)
- [ ] Performance profiling

---

### ❌ Excluded Features (Not Planned)
- Multiple language support
- Color blind accessibility options
- Tutorial/help screen
- Lore/story snippets
- Easter eggs

---

## 📝 Notes for Recreating from Scratch

### Essential Implementation Order:

1. **Setup Phaser Project**
   - Include Phaser 3 CDN
   - Create game config
   - Set up canvas (800x600)

2. **Character Select Scene**
   - Draw all 3 character sprites (functions provided in doc)
   - Display stats for each
   - Handle character selection
   - Store selection in gameState

3. **Game Scene - Basic Structure**
   - Grass background (tiled)
   - Player creation based on selected character
   - Physics setup
   - UI panels (health, XP, score)

4. **Combat Systems**
   - Rogue: mouse-tracking arrows
   - Warrior: auto-target nearest enemy
   - Wizard: orbital orb system (most complex)

5. **Enemy System**
   - Spawn from edges
   - AI moves toward player
   - Wave scaling formula
   - Two enemy types with different stats

6. **Progression Systems**
   - XP orb dropping
   - XP collection
   - Level up trigger
   - Upgrade selection screen
   - Upgrade application

7. **Polish & Feedback**
   - Sound system (procedural audio)
   - Damage numbers
   - Particle effects
   - Camera shake
   - Invulnerability frames

8. **Game Over**
   - Stats display
   - High score tracking
   - Play again functionality

### Critical Implementation Details:

**Wizard Orbs:**
- Must create orbs AFTER player fully initialized
- Use angles to position (Math.cos/sin)
- Per-enemy hit cooldown prevents spam
- updateWizardOrbs() called every frame

**Rogue Arrows:**
- Use `pointer.worldX` and `pointer.worldY`
- Calculate angle from player to cursor
- Set velocity using angle
- Rotate sprite to match direction (+90° offset)

**Boss System:**
- Boss waves trigger at `wave % 5 === 0`
- Boss spawns immediately, minions spawn over time
- `isBossWave` flag must be set and initialized
- Wave completion counts boss + minions separately
- Boss health bar created dynamically on first boss spawn
- Boss health bar destroyed when boss dies
- Pause state must be checked before special attacks

**Wave System:**
- Boss waves: 1 boss + 3 minions = 4 total enemies
- Regular waves: Use `enemiesThisWave` scaling formula
- `enemiesSpawned` tracks regular enemy spawns
- For boss waves, add +1 to spawned count for completion check
- Separate spawn logic for boss waves vs regular waves
- Always check `!this.paused` in time event callbacks

**Depth Layering:**
- Always set game entities to depth 10
- UI must be depth 1000+
- Boss health bar at depth 1000-1001
- Prevents overlap issues

**Physics Pause:**
- Call `this.physics.pause()` on level up
- Call `this.physics.resume()` after upgrade selected
- Check `this.paused` before enemy attacks/teleports
- Prevents enemies from moving during selection

---

## 🎯 Design Philosophy

### What Makes This Game Good:

1. **Three Distinct Playstyles**
   - Easy (Warrior), Medium (Wizard), Hard (Rogue)
   - Each feels completely different
   - Replayability through variety

2. **Satisfying Progression**
   - Frequent level ups early game
   - Meaningful upgrade choices
   - Clear power increases

3. **Visual & Audio Feedback**
   - Every action has a sound
   - Damage numbers confirm hits
   - Particles make actions feel impactful

4. **Balanced Difficulty**
   - Starts easy, ramps up gradually
   - Player scales with upgrades
   - Eventually overwhelming (roguelike tradition)

5. **Polish Over Complexity**
   - Simple controls
   - Clear visuals
   - No confusing mechanics
   - "Easy to learn, hard to master"

---

**End of Document**

*This document should be updated as the game evolves. Always keep it synchronized with the actual game code.*

---

## 🚨 REMINDER: Token Safety Protocol

**Before editing code, AI assistants must:**
1. ✅ Check token budget (need >30,000 or >20% remaining)
2. ✅ Estimate work size vs available tokens
3. ✅ Warn user if insufficient tokens
4. ✅ Never leave HTML file in broken state
5. ✅ Document incomplete work if must stop

**See "TOKEN/USAGE MANAGEMENT PROTOCOL" section at top of this file for full guidelines.**

---

## 📖 Quick Reference - Using This Documentation

### For Players:
1. Open `Twinstick Demo.html` in your browser
2. Read character descriptions in this file if needed
3. Play and enjoy!

### For Developers/Testers:
1. **Making changes?** 
   - Edit `Twinstick Demo.html`
   - Update relevant sections in THIS file
   - Add version entry to `CHANGELOG.md`

2. **Finding information?**
   - Everything is in THIS file (game-development-template.md)
   - Use Ctrl+F to search for what you need
   - Check table of contents at the top

3. **Testing?**
   - See "Testing Protocol" section in this file
   - See "Bug Fixes & Issues" section for known fixes
   - See "Progress Log" for current status

### File Organization:
```
Your Project/
├── Twinstick Demo.html     (128 KB) - The game
├── game-development-template.md    (50 KB)  - This file, complete docs
└── CHANGELOG.md                    (8 KB)   - Version history
```

**That's all you need. Simple and effective.** ✅

---

## 💡 Tips for Working with AI Assistants

### When to Start a NEW Chat Session:

**Start a fresh chat if:**
- ✅ Planning a major feature (new character, new system, big refactor)
- ✅ AI warns about low tokens/usage
- ✅ Previous chat ended mid-work
- ✅ You want a complex multi-file change
- ✅ AI seems to be getting confused or verbose

**Continue current chat if:**
- ✅ Small bug fixes (1-2 functions)
- ✅ Documentation updates only
- ✅ Questions about existing code
- ✅ Planning/design discussions
- ✅ Testing and verification

### How to Handoff Between Chat Sessions:

**At end of current chat, ask AI to:**
```
"Create handoff notes for the next chat session including:
1. What we accomplished this session
2. What needs to be done next
3. Specific files and line numbers to change
4. Testing steps after changes
"
```

**In new chat, provide:**
```
"Continue work on [feature name]. 
Here are the handoff notes from previous session:
[paste notes]

Files attached: 
- Twinstick Demo.html
- game-development-template.md
- CHANGELOG.md
"
```

### Red Flags (AI is running low on resources):

🚩 AI responses getting shorter/incomplete  
🚩 AI stops in middle of code change  
🚩 AI says "I apologize, I need to..."  
🚩 AI provides incomplete code without explanation  
🚩 AI forgets context from earlier in chat  

**If you see these signs:** Start a new chat immediately!

### Best Practices:

1. **Keep working game file safe**
   - Always have a backup before major changes
   - Ask AI to verify changes before applying
   - Test immediately after each change

2. **Work in small increments**
   - One feature at a time
   - Test after each feature
   - Document each change in CHANGELOG

3. **Use multiple short chats vs one long chat**
   - Better to do 3 focused chats than 1 exhausted chat
   - Fresh chat = full AI capacity
   - Less risk of incomplete work

4. **Be explicit about token budget**
   - You can ask: "How much usage do you have left?"
   - You can say: "Let's save this for a new chat"
   - You can request: "Just plan this out, don't code yet"

### Example Good Workflow:

**Chat 1:** Plan new enemy type, write specs in template  
**Chat 2:** Implement the enemy code, test  
**Chat 3:** Balance and polish, update docs  

**Better than:** Try to do all 3 in one chat and risk incomplete code!

---
