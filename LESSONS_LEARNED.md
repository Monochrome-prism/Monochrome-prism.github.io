# Lessons Learned - Magic Affinity Game Development

**Project:** Branded For Death: Magic Affinity
**Framework:** Phaser 3 (v3.70.0) + ES6 Modules + Vanilla JavaScript
**Development Period:** v3.4.0 → v3.4.7
**Purpose:** Document technical lessons, gotchas, patterns, and best practices for future Phaser + JavaScript game development

---

## 📚 Table of Contents

1. [Critical Technical Lessons](#critical-technical-lessons)
2. [Phaser-Specific Gotchas](#phaser-specific-gotchas)
3. [Design Patterns That Worked](#design-patterns-that-worked)
4. [Testing & Debugging](#testing--debugging)
5. [Game Balance & Design Decisions](#game-balance--design-decisions)
6. [Documentation Best Practices](#documentation-best-practices)
7. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
8. [Performance Optimization](#performance-optimization)

---

## 🔥 Critical Technical Lessons

### 1. The Lerp Animation Bug (v3.4.5)

**What Happened:**
- Added "smooth" lerp animation to HP/XP bars
- Bars used `displayedHealthPercent` (lerped value)
- Text showed actual values (`player.health`)
- Result: Player at 0 HP showed bar 80% full

**The Lesson:**
- Visual feedback MUST match actual game state
- Smooth animations are nice, but accuracy > aesthetics in critical UI
- Always show actual values in life-or-death situations

**Code Pattern:**
```javascript
// ❌ BAD: Lerp causes visual lag
this.displayedHealthPercent += (targetPercent - this.displayedHealthPercent) * 0.2;
healthBar.scaleX = this.displayedHealthPercent;

// ✅ GOOD: Show actual value immediately
const healthPercent = player.health / player.maxHealth;
healthBar.scaleX = healthPercent;
```

**Takeaway:** Test UI changes extensively. What looks smooth might be misleading.

---

### 2. The `waveReached` Undefined Bug (v3.4.7)

**What Happened:**
- Achievement code: `gameState.waveReached = this.currentWave;`
- Problem: `this.currentWave` doesn't exist in GameScene!
- It lives in `this.waveSystem.currentWave`
- Result: `waveReached` was ALWAYS `undefined`
- ALL wave-based achievements failed silently

**The Lesson:**
- NEVER assume a property exists without checking
- Refactoring can break assumptions about what `this` contains
- Silent failures are the worst kind of bugs
- Console logs showing `undefined` are smoking guns!

**Code Pattern:**
```javascript
// ❌ BAD: Assumes this.currentWave exists
gameState.waveReached = this.currentWave; // undefined!

// ✅ GOOD: Use the system that actually owns the data
gameState.waveReached = this.waveSystem.getCurrentWave();
```

**Takeaway:** When refactoring to systems architecture, update ALL references. Search codebase for `this.propertyName` and verify.

---

### 3. PersistenceSystem Version Mismatch (v3.4.6)

**What Happened:**
- `CURRENT_VERSION = '3.1.3'` hardcoded in PersistenceSystem
- Game was at v3.4.5
- EVERY page load triggered full data migration
- Potential for progress corruption/loss

**The Lesson:**
- Separate game version from data structure version
- Game version changes often (patches, features)
- Data version changes rarely (only when structure changes)

**Code Pattern:**
```javascript
// ❌ BAD: Triggers migration on every patch
const CURRENT_VERSION = '3.4.5'; // Needs manual update
if (data.version !== CURRENT_VERSION) { migrate(); }

// ✅ GOOD: Separate concerns
const CURRENT_VERSION = '3.4.7';  // Game version (auto-updates)
const DATA_VERSION = '1.0.0';     // Data structure version
const needsMigration = !data.dataVersion || data.dataVersion !== DATA_VERSION;
```

**Takeaway:** Version numbers serve different purposes. Don't conflate them.

---

### 4. Frame-Rate Independence

**The Problem:**
- Hardcoded movement: `sprite.x += 5;` breaks at different frame rates
- 60 FPS vs 30 FPS = 2x speed difference

**The Solution:**
- Always use `delta` time for frame-rate independent movement

**Code Pattern:**
```javascript
// ❌ BAD: Assumes 60 FPS
update() {
    sprite.x += 5; // Runs 60x per second at 60 FPS
}

// ✅ GOOD: Frame-rate independent
update(time, delta) {
    const speed = 300; // pixels per second
    sprite.x += speed * (delta / 1000);
}
```

**Takeaway:** ALWAYS multiply movement by `delta / 1000` to get frame-rate independence.

---

## 🎮 Phaser-Specific Gotchas

### 1. Graphics Objects Can't Be Tinted

**The Trap:**
```javascript
const graphic = this.add.graphics();
graphic.setTint(0xff0000); // ❌ ERROR: setTint is not a function
```

**The Fix:**
```javascript
// Use setAlpha() for transparency, or use fillStyle() with color
graphic.setAlpha(0.5); // ✅ Works!
graphic.fillStyle(0xff0000, 0.5); // ✅ Also works!
```

**Takeaway:** Graphics ≠ Sprites. Different methods apply.

---

### 2. Physics Body Null Checks

**The Trap:**
```javascript
enemy.body.setVelocity(vx, vy); // ❌ Crashes if body doesn't exist
```

**The Fix:**
```javascript
if (enemy.body) {
    enemy.body.setVelocity(vx, vy);
}
```

**Takeaway:** ALWAYS check `body` exists before accessing velocity/acceleration.

---

### 3. Depth Ordering Conventions

**The Pattern We Used:**
- Background: 0-5
- Gameplay entities: 10-20
- UI elements: 100+
- Overlays/Modals: 1000+
- Popups/Notifications: 2000+

**Code:**
```javascript
background.setDepth(0);
player.setDepth(15);
healthBar.setDepth(100);
upgradePanel.setDepth(1000);
achievementNotif.setDepth(2000);
```

**Takeaway:** Establish depth conventions early. Stick to them.

---

### 4. Timer Initialization Pattern

**The Trap:**
```javascript
// First hit delayed by cooldown duration!
if (time - this.lastAttackTime >= cooldown) {
    attack();
    this.lastAttackTime = time;
}
```

**The Fix:**
```javascript
// Initialize for immediate first activation
if (!this.lastAttackTime) {
    this.lastAttackTime = time - cooldown; // Backdates timer
}
```

**Takeaway:** Initialize timers in the past for immediate first activation.

---

### 5. Knockback vs AI Movement

**The Problem:**
- Enemy AI recalculates velocity every 3 frames
- Knockback applies velocity once
- AI immediately overwrites knockback velocity
- Result: No knockback effect visible

**The Solution:**
- Add `knockbackUntil` timer (300ms)
- Check `if (time < knockbackUntil)` before AI movement
- Prevents AI from overriding knockback

**Code:**
```javascript
// Apply knockback
enemy.knockbackUntil = time + 300;
enemy.body.setVelocity(kbX, kbY);

// In AI update
if (time < enemy.knockbackUntil) {
    return; // Skip AI movement while knocked back
}
```

**Takeaway:** Competing systems need coordination. Use timing flags.

---

## 🏗️ Design Patterns That Worked

### 1. Systems Architecture

**Structure:**
```
GameScene.js (orchestrator)
    ├── WaveSystem (wave progression, spawn scheduling)
    ├── EnemySystem (enemy spawning, AI behaviors)
    ├── CombatSystem (collision, damage calculation)
    ├── UpgradeSystem (level-up UI, upgrades)
    ├── UISystem (health bars, wave counter)
    └── SoundFX (procedural audio)
```

**Benefits:**
- Each system owns its data (e.g., `waveSystem.currentWave`)
- Clear separation of concerns
- Easy to test systems in isolation
- Reduces GameScene complexity

**Lesson:** Refactor early. Don't let GameScene grow to 5000+ lines before splitting.

---

### 2. Status Effect Pattern

**Shared Structure:**
```javascript
enemy.statusEffects = {
    burn: { active: true, damage: 3, endTime: time + 3000 },
    freeze: { active: true, endTime: time + 2000 },
    poison: { active: true, damage: 2, endTime: time + 6000 }
};
```

**Processing Loop:**
```javascript
Object.entries(enemy.statusEffects).forEach(([effect, data]) => {
    if (data.active && time >= data.endTime) {
        data.active = false;
        // Remove visual indicator
    }
});
```

**Lesson:** Consistent data structure makes iteration easy.

---

### 3. Upgrade System Pattern

**Structure:**
```javascript
{
    name: "Swift Foot",
    icon: "👟",
    upgradeKey: "swiftFoot",
    getDescription: () => {
        const stacks = player.upgradeStacks?.swiftFoot || 0;
        return stacks > 0 ? `Swift Foot x${stacks+1}` : `Swift Foot`;
    },
    apply: () => {
        player.upgradeStacks.swiftFoot = (player.upgradeStacks.swiftFoot || 0) + 1;
        player.speed *= 1.25;
    }
}
```

**Benefits:**
- Dynamic descriptions based on stack count
- Tracks stacks via `upgradeKey`
- Clean apply() logic

**Lesson:** Use functions for dynamic content. Pre-computed strings get stale.

---

### 4. Achievement Tracking Pattern (After Fixes)

**Data Flow:**
```
GameScene.gameOver()
    → gameState.waveReached = this.waveSystem.getCurrentWave()
    → GameOverScene.create()
        → progression.checkAchievements(runData)
            → Check wave >= 11? Unlock Element Master
            → Save to localStorage
```

**Key Points:**
- Set ALL tracking vars BEFORE transitioning to GameOverScene
- Use system getters (not direct property access)
- Check against actual values, not undefined

**Lesson:** Data pipeline must be bulletproof. One undefined kills everything.

---

## 🧪 Testing & Debugging

### 1. Browser Testing is Mandatory

**The Rule:**
- NEVER commit without testing in browser
- Console MUST show zero errors
- Visual output MUST match expectations

**Workflow:**
1. `python3 -m http.server 8000`
2. Open http://localhost:8000
3. Open console (F12)
4. Play through feature
5. Check console for errors
6. Take screenshots before/after

**Lesson:** "It compiles" ≠ "It works". Test visually.

---

### 2. Console Logging Strategy

**Effective Patterns:**
```javascript
// Namespace your logs
console.log('[WaveSystem] Wave completed:', this.currentWave);
console.log('[ProgressionSystem] Checking achievements with runData:', runData);

// Log critical state
console.log('waveReached:', gameState.waveReached); // Shows undefined!

// Log before/after
console.log('BEFORE migration:', unlockedAchievements);
// ... migration ...
console.log('AFTER migration:', unlockedAchievements);
```

**Lesson:** Structured logs make debugging 10x faster.

---

### 3. Test Scenarios Document

**What We Created:**
- ACHIEVEMENT_TESTING.md with step-by-step tests
- Cheat commands for faster testing
- Success criteria checklist

**Example:**
```javascript
// Quick test: Reach Wave 11
game.scene.scenes[0].waveSystem.currentWave = 11;

// Quick test: Add 50 enemy kills
progression.getData().stats.totalEnemiesKilled += 50;
progression.save();
```

**Lesson:** Document testing workflows. Save time on regression testing.

---

### 4. Visual Debugging

**Techniques:**
1. **Screenshots:** Before/after comparisons
2. **Color coding:** Different colors for debug vs production
3. **Debug text:** Display FPS, entity counts, state vars
4. **Physics debug:** Show collision boxes

**Code:**
```javascript
// Enable physics debug (in config)
physics: {
    arcade: {
        debug: true, // Shows collision boxes
    }
}

// Runtime debug text
this.debugText = this.add.text(10, 10, '', {
    fontSize: '12px',
    fill: '#00ff00'
});

update() {
    this.debugText.setText([
        `FPS: ${Math.round(this.game.loop.actualFps)}`,
        `Enemies: ${this.enemies.getChildren().length}`,
        `Wave: ${this.waveSystem.getCurrentWave()}`
    ]);
}
```

**Lesson:** Eyes don't lie. Visual confirmation > assumptions.

---

## ⚖️ Game Balance & Design Decisions

### 1. Wind Element Redesign

**Problem:** Cyclone upgrade = +orb rotation speed, but Wind doesn't use orbs!

**Solution:** Replace with Swift Foot (+25% movement speed, infinite stacking)

**Lesson:** Test upgrades with ALL elements. Edge cases reveal useless upgrades.

---

### 2. Wildfire Non-Stackable

**Decision:** Burn spread doesn't benefit from multiple picks

**Reasoning:**
- Spread is binary (spreads or doesn't)
- Multiple picks = wasted upgrade slots
- Better to offer once, then filter it out

**Lesson:** Not all upgrades should stack. Some are one-and-done.

---

### 3. Damage Scaling Wasn't the Problem

**The Investigation:**
- Players complained damage too high
- HP bars showed 80% full at death
- Conclusion: "Reduce damage by 25%"
- **WRONG:** HP bar was visually lagging (lerp bug)
- **RIGHT:** Damage was fine, UI was misleading

**Lesson:** Don't nerf based on misleading UI. Fix the UI first.

---

### 4. Wave Completion Heal

**Decision:** 25% max HP heal after each wave

**Reasoning:**
- Rewards survival
- Prevents death spirals (low HP = more risky)
- Small enough to not trivialize damage

**Lesson:** Reward systems keep players engaged. Tiny heals add up.

---

## 📖 Documentation Best Practices

### 1. Three-Document System

**Files:**
1. **MagicAffinityBible.md** - Game design reference (stats, formulas, mechanics)
2. **CHANGELOG.md** - Version history (what changed, why, when)
3. **README.md** - Quick start guide (how to run, overview)

**Additional:**
- **CONTRIBUTING.md** - Development standards
- **TESTING.md** - Test protocols
- **LESSONS_LEARNED.md** - This document!

**Lesson:** Separate concerns. Design ≠ History ≠ Instructions.

---

### 2. CHANGELOG Conventions

**Format:**
```markdown
## [3.4.7] - 2025-11-15

### Fixed - CATEGORY
**Feature Name:**
- Issue: What was broken
- Impact: How it affected players
- Fix: What we changed
- Location: File.js lines X-Y
```

**Benefits:**
- Easy to scan
- Location makes debugging faster
- Impact helps prioritize

**Lesson:** Detailed changelogs save hours when debugging later.

---

### 3. JSDoc for Type Safety

**Pattern:**
```javascript
/**
 * @typedef {Object} Player
 * @property {number} health - Current health
 * @property {number} maxHealth - Maximum health
 * @property {number} speed - Movement speed (pixels/second)
 */

/**
 * Update health bar display
 * @param {Player} player - Player object
 * @returns {void}
 */
updateHealthBar(player) {
    // ...
}
```

**Benefits:**
- Type hints in VSCode
- Catches bugs early
- Documents expected structure

**Lesson:** JSDoc is free type checking without TypeScript.

---

### 4. Code Comments That Age Well

**Good Comments:**
```javascript
// v3.4.6: Separate data version from game version to prevent unnecessary migrations
const DATA_VERSION = '1.0.0';

// Initialize for immediate first activation
this.lastAttackTime = time - cooldown;

// CRITICAL: Check body exists before velocity changes
if (enemy.body) {
    enemy.body.setVelocity(vx, vy);
}
```

**Bad Comments:**
```javascript
// Update health
updateHealthBar(player) { ... }

// Loop through enemies
enemies.forEach(enemy => { ... });
```

**Lesson:** Explain WHY, not WHAT. Code shows what, comments show why.

---

## ⚠️ Common Mistakes to Avoid

### 1. Assuming Properties Exist

```javascript
// ❌ Crash waiting to happen
enemy.health -= damage;

// ✅ Null-safe
if (enemy && enemy.health) {
    enemy.health -= damage;
}
```

---

### 2. Hardcoding Values

```javascript
// ❌ Magic numbers everywhere
enemy.health -= 20;
sprite.x += 0.016 * 300;

// ✅ Named constants
enemy.health -= this.player.damage;
sprite.x += (delta / 1000) * PLAYER_SPEED;
```

---

### 3. Not Cleaning Up on Scene Shutdown

```javascript
// ❌ DOM element persists after scene change
create() {
    this.domElement = document.createElement('div');
    document.body.appendChild(this.domElement);
}

// ✅ Clean up properly
shutdown() {
    if (this.domElement) {
        this.domElement.remove();
        this.domElement = null;
    }
}
```

---

### 4. Testing Only Happy Path

**The Trap:**
- Test "Wave 5 → unlock achievement" ✅
- Don't test "Wave 5 but waveReached=undefined" ❌

**The Fix:**
- Test with console open
- Check for `undefined` in logs
- Test edge cases (0 HP, no enemies, etc.)

---

### 5. Batch Committing Without Testing

**The Trap:**
- Change 5 files
- Commit all at once
- Bug appears
- Which change caused it?

**The Fix:**
- Change 1-2 files
- Test in browser
- Commit
- Repeat

**Lesson:** Small commits = easy rollbacks.

---

## 🚀 Performance Optimization

### 1. Object Pooling (Not Implemented, But Should Be)

**Problem:**
- Creating/destroying 100s of projectiles per second
- Garbage collection lag spikes

**Solution:**
```javascript
// Create pool once
this.projectilePool = [];
for (let i = 0; i < 100; i++) {
    const proj = this.add.circle(0, 0, 5, 0xff0000);
    proj.setActive(false).setVisible(false);
    this.projectilePool.push(proj);
}

// Reuse from pool
const proj = this.projectilePool.find(p => !p.active);
if (proj) {
    proj.setActive(true).setVisible(true);
    proj.setPosition(x, y);
}
```

**Lesson:** Reuse objects. Don't create/destroy in update loops.

---

### 2. Limit Active Entities

**Current System:**
```javascript
const MAX_ENEMIES = 50;
const MAX_PROJECTILES = 100;

if (this.enemies.getChildren().length >= MAX_ENEMIES) {
    return; // Don't spawn more
}
```

**Lesson:** Hard caps prevent performance death spirals.

---

### 3. Procedural Audio > Audio Files

**What We Did:**
- No MP3/WAV files
- Generated sounds with Web Audio API
- ~50 lines of code = infinite variations

**Benefits:**
- 0 KB of audio assets
- Consistent audio style
- No loading time

**Lesson:** Procedural generation scales infinitely.

---

## 🎓 Meta Lessons

### 1. Read the Actual Error Messages

**Example:**
```
waveReached=undefined, element=shadow
```

This was a SMOKING GUN! We just had to actually READ the console output.

**Lesson:** Logs tell you exactly what's wrong. Read them carefully.

---

### 2. Separate Game Logic from Presentation

**Good:**
- `waveSystem.getCurrentWave()` (logic)
- `uiSystem.updateWave(wave)` (presentation)

**Bad:**
- `this.waveText.setText(this.currentWave)` (mixed)

**Lesson:** MVC pattern applies to games too.

---

### 3. Plan Migrations BEFORE They're Needed

**What We Learned:**
- v3.1.3 → v3.4.7 migration caused panic
- Should have planned data versioning from the start

**Lesson:** Design for change. Versioning is not optional.

---

### 4. User Feedback is a Treasure Map

**Example:**
```
User: "Achievements aren't saving"
Console: waveReached=undefined
```

The user complaint + console logs = instant diagnosis.

**Lesson:** User reports + logs = root cause analysis.

---

## 📝 Closing Thoughts

**What Worked:**
- Systems architecture for code organization
- Comprehensive testing documents
- Detailed changelogs with locations
- Browser-first development workflow
- Console logging everywhere

**What Could Be Better:**
- Object pooling for projectiles
- Earlier separation of game/data versions
- TypeScript for type safety
- Automated testing (unit tests)
- Performance profiling from day 1

**For Future Projects:**
1. Start with systems architecture, not monolithic scenes
2. Plan data versioning before v1.0
3. Write tests alongside features
4. Document as you code, not after
5. Test in browser EVERY commit

---

**Final Lesson:** The best code is code that's easy to debug. Clear logs, consistent patterns, and comprehensive docs make debugging 10x faster than clever optimizations.

**Date Created:** November 15, 2025
**Version:** 1.0.0
**Maintainer:** Future Claude / Developers
