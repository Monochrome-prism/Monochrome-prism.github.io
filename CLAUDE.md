# Claude Code Context - Magic Affinity

## Project Overview

**Magic Affinity** is a wizard-focused roguelike survivor game inspired by Vampire Survivors. Built with Phaser 3 (v3.70.0) using ES6 modules and vanilla JavaScript. The game features 10 unique elemental magic systems, 11 status effects, and seasonal maps with dynamic mechanics.

**Key Files:**
- `index.html` - Main entry point (800x700px canvas)
- `src/scenes/GameScene.js` - Core game loop (3,345 lines)
- `src/systems/` - Modular systems (Combat, Enemy, Wave, Upgrade, UI, Sound)
- `MagicAffinityBible.md` - Primary game design doc (633 lines, stats/numbers focused)
- `TESTING.md` - Testing checklists and protocols
- `CONTRIBUTING.md` - Development standards and code quality rules

## Architecture

```
├── src/
│   ├── scenes/
│   │   └── GameScene.js          # Main game scene (player, enemies, attacks, UI)
│   └── systems/
│       ├── CombatSystem.js       # Collision detection, damage calculation
│       ├── EnemySystem.js        # Enemy spawning, AI behaviors
│       ├── WaveSystem.js         # Wave progression, boss spawning
│       ├── UpgradeSystem.js      # 40 element upgrades + 2 universal
│       ├── UISystem.js           # Health bars, XP, wave counter
│       └── SoundSystem.js        # Procedural Web Audio API sounds
├── assets/                       # (No external assets - all procedural)
├── MagicAffinityBible.md         # Game design reference
├── CHANGELOG.md                  # Version history
├── TESTING.md                    # Testing protocols
└── CONTRIBUTING.md               # Dev standards
```

## Development Workflow

**Follow the Explore → Plan → Code → Test → Commit cycle for all changes.**

### 1. Explore Phase
**CRITICAL: Never jump straight to coding. Always explore first.**

Before making any changes, read relevant files and understand existing patterns:

```bash
# Read core files (use Read tool, not cat)
# Example: Read src/scenes/GameScene.js to understand player movement
# Example: Read MagicAffinityBible.md for game design specs

# Search for existing patterns (use Grep tool)
# Example: Grep for "element === 'shadow'" to see how Shadow element works
# Example: Grep for "statusEffects" to find status effect implementations

# Find related files (use Glob tool)
# Example: Glob "src/systems/*.js" to see all system files
```

**Ask exploratory questions:**
- "Where is the player movement handled?"
- "How does the Electric element apply chain lightning?"
- "What's the pattern for creating new status effects?"

### 2. Plan Phase
**ALWAYS create a plan before coding. Use thinking mode for complex tasks.**

**Use TodoWrite tool to track tasks:**
- Break complex features into 3-5 concrete steps
- Mark one task as in_progress at a time
- Complete tasks immediately when done (don't batch)

**Request detailed plans:**
- For simple tasks: Just outline the steps
- For complex tasks: Use "think about this" to trigger extended thinking
- For very complex tasks: Use "think hard about this" or "think harder" or "ultrathink"

**Example plan request:**
```
"I want to add a new Ice element with freeze mechanics.
Think hard about this and create a detailed implementation plan.
Consider: status effects, visual feedback, upgrades, balance."
```

**Confirm direction before implementation:**
- Review the plan for accuracy
- Ask clarifying questions if anything is unclear
- Check against MagicAffinityBible.md for game design consistency

### 3. Code Phase
**Write code following established patterns and conventions.**

**⚠️ CRITICAL: ALWAYS UPDATE JSDoc!**
- **EVERY code change MUST include corresponding JSDoc updates**
- Add new properties to Player typedef (`src/types/game-types.js`)
- Document new functions with `@param`, `@returns`, `@typedef`
- Update constant descriptions (e.g., `BASE_VALUES`)
- Keep `@ts-check` compatibility in mind
- **NO EXCEPTIONS** - Outdated JSDoc leads to bugs and confusion

**ES6 Module Standards:**
- No build system required
- Import only what you need
- Export classes and functions explicitly

**Phaser 3 Conventions:**
- Use Phaser 3 Arcade Physics
- All graphics are procedural (no image assets)
- Colors are hex values (e.g., `0xff6347`)
- Depth layering: Background (0-5), Gameplay (10-20), UI (100+), Overlays (1000+)

**Frame-rate Independence:**
```javascript
// CORRECT - Uses delta for smooth movement
sprite.x += speed * (delta / 1000);

// WRONG - Hardcoded value breaks at different frame rates
sprite.x += speed * 0.016;
```

**Timer Patterns:**
```javascript
// Initialize for immediate first activation
this.player.lastActionTime = time - cooldown;

// Standard cooldown check
if (time - this.player.lastActionTime >= cooldown) {
    // Perform action
    this.player.lastActionTime = time;
}
```

**Safety Checks:**
```javascript
// Always check physics body exists before velocity changes
if (enemy.body) {
    enemy.body.setVelocity(vx, vy);
}
```

**Damage Formula:**
```javascript
// Use player.damage (affected by upgrades), not hardcoded values
enemy.health -= this.player.damage;
```

### 4. Test Phase
**MANDATORY: Test changes in browser before committing.**

**Browser Testing Workflow:**
```bash
# 1. Start local server
python3 -m http.server 8000

# 2. Open http://localhost:8000 in browser

# 3. Open browser console (F12) to check for errors

# 4. Run through quick smoke test (see TESTING.md)
```

**Visual Testing for Phaser Games:**
1. **Take screenshots** of before/after states (Cmd+Shift+4 on macOS)
2. **Compare visual output** to expected behavior
3. **Check console** for JavaScript errors (zero tolerance)
4. **Monitor FPS** - Should stay at 60fps consistently
5. **Test mobile** - Use browser DevTools device emulation

**Element-Specific Testing:**
- Select the element you changed
- Verify status effects display correctly
- Verify damage numbers appear
- Verify upgrades work as expected
- Play for 5+ waves to catch edge cases

**Performance Testing:**
```javascript
// Check FPS in console
game.loop.actualFps

// Monitor object counts
console.log('Enemies:', this.enemies.getChildren().length);
console.log('Projectiles:', this.projectiles.getChildren().length);
```

### 5. Commit Phase
**Create descriptive commits and push to feature branch.**

```bash
# Stage changes
git add -A

# Check what's staged (review carefully)
git diff --cached

# Commit with semantic message
git commit -m "Brief summary (vX.X.X)

Detailed explanation of:
- What changed
- Why it changed
- Any side effects
- Testing performed

Fixes: #issue (if applicable)"

# Push to feature branch
git push -u origin claude/[branch-name]
```

**Commit Message Best Practices:**
- Start with verb (Add, Fix, Update, Refactor, Remove)
- Include version number in parentheses
- Add details in body explaining WHY, not just WHAT
- Reference issue numbers when applicable

## Common Commands

### Testing
```bash
# Start local server
python3 -m http.server 8000

# Check for JavaScript syntax errors
node --check src/scenes/GameScene.js
node --check src/systems/*.js
```

### Search & Explore
```bash
# Find all references to a function
grep -rn "functionName" src/

# Find element-specific code
grep -A 10 "element === 'shadow'" src/scenes/GameScene.js

# Count lines in main files
wc -l src/scenes/GameScene.js src/systems/*.js
```

### Version Management
```bash
# View recent changes
git log --oneline -10

# See what changed in a file
git log -p --follow src/scenes/GameScene.js

# Compare with previous version
git diff HEAD~1 src/scenes/GameScene.js
```

## Code Style Guidelines

### Naming Conventions
- **Variables:** `camelCase` (e.g., `playerHealth`, `maxEnemies`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_HEALTH`, `WAVE_DURATION`)
- **Functions:** `camelCase` (e.g., `updateWizardOrbs()`, `spawnEnemy()`)
- **Classes:** `PascalCase` (e.g., `CombatSystem`, `WaveSystem`)

### Phaser Patterns
```javascript
// Creating graphics objects
const graphic = this.add.graphics();
graphic.fillStyle(0xcolor, alpha);
graphic.fillRect(x, y, width, height);
graphic.setDepth(zIndex);

// Physics bodies
this.physics.add.existing(sprite);
sprite.body.setVelocity(vx, vy);

// Frame-rate independent movement
sprite.x += speed * (delta / 1000); // NOT speed * 0.016

// Timers
if (!this.player.lastActionTime) this.player.lastActionTime = time;
if (time - this.player.lastActionTime >= cooldown) {
    // Action
    this.player.lastActionTime = time;
}

// Initialize for immediate first activation
this.player.lastActionTime = time - cooldown;
```

### Attack System Patterns
All element attacks follow similar structure:
1. Initialize system arrays/timers if needed
2. Check cooldowns using `time - lastTime >= cooldownMs`
3. Apply damage: `enemy.health -= damage;`
4. Show damage number: `this.showDamageNumber(x, y, damage, color);`
5. Flash enemy: `enemy.setAlpha(0.5)` then delayed restore
6. Check death: `if (enemy.health <= 0) this.killEnemy(enemy);`
7. Play sound: `soundFX.play("hit");`

## Game-Specific Knowledge

### 10 Elements
1. **Flame** - Burn DOT (flamethrower)
2. **Water** - Freeze CC + bonus damage (bullets)
3. **Electric** - Chain lightning + Paralyze
4. **Nature** - Poison DOT (seeds/explosions)
5. **Wind** - Knockback + Sleep (boomerang)
6. **Terra** - Knockback walls + high HP
7. **Gravity** - Pull enemies (orbs)
8. **Celestial** - Teleport dash (orbs)
9. **Radiant** - Blind + beam attack
10. **Shadow** - Fear + AI clones

### Status Effects (11 total)
Burn, Freeze, Paralyze, Poison, Sleep, Charm, Confusion, Blind, Fear, Slow, Knockback

### Enemy Types
- **Slime** (30 HP, 60 speed, 5 damage)
- **Goblin** (50 HP, 70 speed, 8 damage)
- **Orc** (80 HP, 50 speed, 12 damage)
- **Tank** (120 HP, 40 speed, 15 damage)
- **Boss** (300 HP, 30 speed, 20 damage) - Every 5 waves

### Wave System
- Boss spawns every 5 waves
- XP guaranteed per wave for 1 level-up
- 3 random upgrades offered per level
- Enemies scale: HP +10%, Speed +2%, Damage +1 per wave
- Player heals 10 HP on wave completion (v2.1.4+)

## Testing References

See `TESTING.md` for:
- Quick smoke test (5 checks)
- Full testing checklist (20 points)
- Element-specific tests
- Status effect verification
- Performance benchmarks

## Documentation Updates

**⚠️ CRITICAL: Always Keep MagicAffinityBible.md Up to Date!**

This file is the PRIMARY game design reference. It must reflect the current state of the game at all times.

**When making changes:**
1. Update `CHANGELOG.md` with version bump (required for every commit)
2. **Update `MagicAffinityBible.md` if ANY game design changes** (stats, mechanics, upgrades, enemies, waves, elements, status effects, formulas, etc.)
3. Increment version number in format: `vMAJOR.MINOR.PATCH`
   - MAJOR: Breaking changes or new game modes
   - MINOR: New features, elements, or significant balance changes
   - PATCH: Bug fixes, small tweaks, documentation

**What requires MagicAffinityBible.md updates:**
- ✅ New upgrades or upgrade changes
- ✅ Stat changes (damage, health, cooldowns, durations, ranges)
- ✅ Element mechanics changes
- ✅ Status effect changes
- ✅ Enemy stat changes (HP, speed, damage)
- ✅ Wave system changes
- ✅ New formulas or balance changes
- ✅ Removed or replaced features

**Update workflow:**
1. Make code changes
2. Immediately update MagicAffinityBible.md with new stats/mechanics
3. Update CHANGELOG.md with version entry
4. Commit all three together

## Hard Rules (from CONTRIBUTING.md)

1. **NO external dependencies** (except Phaser 3)
2. **NO image/audio files** (all procedural)
3. **NO build systems** (pure ES6 modules)
4. **ALWAYS test before committing** (no untested code)
5. **Frame-rate independence** (use `delta`, not hardcoded values)
6. **Null checks on physics bodies** (check `body` before `setVelocity`)
7. **Consistent damage patterns** (follow existing attack implementations)

## Useful Slash Commands

Available in `.claude/commands/` for reusable workflows:

**Analysis & Planning:**
- `/balance` - Analyze element balance and suggest changes
- `/test-element` - Generate test plan for specific element
- `/search-pattern` - Find implementation patterns for new features
- `/investigate-bug` - Systematic bug investigation workflow

**Testing & Quality:**
- `/quick-test` - MANDATORY pre-commit smoke test checklist
- `/visual-test` - Screenshot-based visual testing workflow
- `/check-performance` - Comprehensive FPS/memory/object monitoring

**Debugging:**
- `/phaser-debug` - Enable debug mode and show debug console commands

## Advanced Workflows

### Test-Driven Development for Phaser
**For new game features, write tests first:**

1. **Define test cases** based on expected behavior
   ```
   "Write test cases for new Frost element:
   - Test 1: Frost orb hits enemy, enemy receives Freeze status
   - Test 2: Frozen enemy cannot move for 2 seconds
   - Test 3: Frost damage bonus applies to frozen enemies
   - Make sure tests fail before implementation"
   ```

2. **Confirm tests fail** (red phase)
   - Run tests, verify they fail
   - Commit failing tests

3. **Implement feature** until tests pass (green phase)
   - Write minimal code to make tests pass
   - Verify all tests pass in browser

4. **Refactor** for code quality (refactor phase)
   - Clean up implementation
   - Ensure tests still pass

### Visual Iteration Workflow
**For UI/visual features, use screenshot-based iteration:**

1. **Provide reference** (mockup, screenshot, or description)
   ```
   "Here's a screenshot of how the health bar should look.
   Current implementation doesn't match - iterate until it matches."
   ```

2. **Implement initial version**

3. **Take screenshot** and compare
   - Screenshot before/after states
   - Paste screenshots directly into chat (drag-drop or Cmd+V)

4. **Iterate 2-3 times** until visual output matches expectations

### Context Management
**Use `/clear` frequently to maintain focus:**

- After completing a major feature
- When switching between unrelated tasks
- Before starting a new development session
- If conversation becomes too long (reduces performance)

**Don't use `/clear` when:**
- In the middle of implementing a feature
- Debugging an ongoing issue
- Context is still relevant to current task

### Specificity Best Practices

**❌ Vague requests lead to poor results:**
- "Fix the bug"
- "Make it better"
- "Add tests"
- "Why is this weird?"

**✅ Specific requests produce excellent results:**
- "Fix the shadow clone at GameScene.js:1864 - it initializes lastDamageTime to 0, causing a 2-second delay on first damage"
- "Increase Electric element fire rate by 25% to match the DPS of Flame element"
- "Write test case for Water element covering the edge case where multiple enemies freeze simultaneously"
- "Look through WaveSystem.js git history and explain why boss spawn timing changed from 3 waves to 5 waves"

**Guidelines for specific requests:**
- Include file names and line numbers
- Describe expected vs actual behavior
- Provide concrete numbers (percentages, durations, counts)
- Reference existing patterns when possible
- Explain WHY, not just WHAT

## Phaser-Specific Debugging

### Browser Console Commands
```javascript
// Access the game instance
window.phaserGame = game;

// Check current scene
game.scene.scenes[0];

// Inspect player object
game.scene.scenes[0].player;

// Count active enemies
game.scene.scenes[0].enemies.getChildren().length;

// Check FPS
game.loop.actualFps;

// Pause/resume physics
game.scene.scenes[0].physics.pause();
game.scene.scenes[0].physics.resume();

// Get all active timers
game.scene.scenes[0].time.getAllEvents();

// Destroy all projectiles (useful for debugging)
game.scene.scenes[0].projectiles.clear(true, true);
```

### Common Phaser Errors and Fixes

**Error: "Cannot read property 'setVelocity' of undefined"**
```javascript
// Fix: Always check body exists
if (enemy.body) {
    enemy.body.setVelocity(vx, vy);
}
```

**Error: "Graphics object has no method 'setTint'"**
```javascript
// Fix: Graphics use setAlpha, not setTint
graphic.setAlpha(0.5); // NOT graphic.setTint(0xff0000);
```

**Error: "Collision not working"**
```javascript
// Fix: Ensure physics body exists
this.physics.add.existing(sprite);
// And check collision group setup
this.physics.add.overlap(group1, group2, callback, null, this);
```

**Error: "Movement stutters at different frame rates"**
```javascript
// Fix: Use delta, not hardcoded values
sprite.x += speed * (delta / 1000); // Correct
sprite.x += speed * 0.016; // Wrong
```

### Visual Debugging Tools
```javascript
// Enable physics debug rendering (in config)
physics: {
    default: "arcade",
    arcade: {
        debug: true, // Shows collision boxes
        debugShowBody: true,
        debugShowStaticBody: true
    }
}

// Draw custom debug info
scene.add.text(10, 10, `Enemies: ${enemies.length}\nFPS: ${game.loop.actualFps}`, {
    fontSize: '16px',
    fill: '#00ff00'
}).setDepth(9999);
```

## Tips for Claude

- **Be specific:** Instead of "fix the bug", say "the shadow clone at GameScene.js:1864 initializes lastDamageTime to 0, causing first damage delay"
- **Reference line numbers:** Use format `filename:line` (e.g., `GameScene.js:2729`)
- **Check Bible first:** Game design decisions are documented in MagicAffinityBible.md
- **Follow existing patterns:** Search codebase for similar implementations before creating new patterns
- **Ask before assuming:** If requirements unclear, ask the user for clarification
- **Test incrementally:** Don't batch multiple features without testing each
- **Use thinking modes:** For complex problems, request "think hard" or "ultrathink"
- **Iterate visually:** For UI work, use screenshots to verify results match expectations
- **Manage context:** Use `/clear` between unrelated tasks to stay focused

## Current Version

**v2.2.2** - Balance adjustments: Nature nerf + Spring hazard buff (2025-11-11)

See CHANGELOG.md for full history.
