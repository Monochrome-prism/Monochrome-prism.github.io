# Optimization & Bug Fixing Routine for Magic Affinity

**Created:** November 11, 2025
**Project:** Magic Affinity v2.2.2
**Purpose:** Systematic guide for bug fixing, performance optimization, and code quality maintenance

---

## Table of Contents

1. [Bug Fixing Workflow](#bug-fixing-workflow)
2. [Performance Optimization Strategy](#performance-optimization-strategy)
3. [Common Bug Patterns](#common-bug-patterns)
4. [Testing Protocols](#testing-protocols)
5. [Code Quality Maintenance](#code-quality-maintenance)
6. [Monitoring & Metrics](#monitoring--metrics)

---

## Bug Fixing Workflow

### Phase 1: Bug Identification & Documentation

#### Step 1: Document the Bug
Create a clear bug report using this template:

```markdown
## Bug Report

**Title:** [Short description]

**Severity:** Critical / High / Medium / Low

**Element/System:** [Which element or system is affected]

**Steps to Reproduce:**
1. Select [element]
2. Reach wave [X]
3. [Action that triggers bug]
4. Observe [unexpected behavior]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Browser Console Errors:**
```
[Paste any console errors]
```

**Wave/Level/Enemy Type:**
- Wave: [X]
- Player Level: [X]
- Element: [X]
- Enemy Type: [X]
- Upgrades taken: [list]

**Screenshots/Video:**
[If available]
```

#### Step 2: Reproduce the Bug
```bash
# Start local server
python3 -m http.server 8000

# Open browser console (F12)
# Follow reproduction steps
# Note any console errors or warnings
```

**Reproduction Checklist:**
- [ ] Can reproduce consistently (5/5 times)
- [ ] Can reproduce sometimes (2-4/5 times)
- [ ] Cannot reproduce (1/5 or less)
- [ ] Console shows errors
- [ ] Console shows warnings
- [ ] No console output (silent failure)

---

### Phase 2: Bug Investigation with JSDoc

#### Step 3: Use JSDoc to Narrow Down the Issue

**With JSDoc, you can:**

1. **Find the method quickly:**
   ```javascript
   // In VS Code: Ctrl+P → type method name
   // Jump directly to implementation
   ```

2. **Check parameter types:**
   ```javascript
   // Hover over method call to see expected types
   this.combatSystem.applyDamage(enemy, damage, element, time);
   // ⚠️ If parameter types don't match, JSDoc will warn you
   ```

3. **Trace property usage:**
   ```javascript
   // Ctrl+Click on property to find all uses
   this.player.element
   // Shows everywhere player.element is accessed
   ```

4. **Check for null/undefined:**
   ```javascript
   // JSDoc types help identify potential null reference errors
   if (enemy.body) {  // ← JSDoc encourages this check
       enemy.body.setVelocity(vx, vy);
   }
   ```

#### Step 4: Identify Root Cause

**Common Root Causes by Category:**

| Category | Root Cause | How JSDoc Helps |
|----------|-----------|-----------------|
| **Typos** | `player.helth` | Autocomplete prevents, red underline catches |
| **Wrong Type** | Passing string instead of number | `@param` type checking catches |
| **Null Reference** | `enemy.body.setVelocity()` without null check | Type hints show nullable properties |
| **Logic Error** | Wrong condition in if statement | Documentation clarifies expected behavior |
| **State Management** | Variable not initialized | JSDoc shows required properties |

**Investigation Tools:**

```javascript
// 1. Add console.log with context
console.log('[BUG DEBUG] Enemy status:', {
    health: enemy.health,
    statusEffects: enemy.statusEffects,
    wave: this.waveSystem.getCurrentWave()
});

// 2. Check object structure
console.log('[BUG DEBUG] Player:', JSON.stringify(this.player, null, 2));

// 3. Add breakpoint in browser DevTools
// Sources → Find file → Click line number
debugger;  // Execution pauses here

// 4. Use VS Code IntelliSense
// Hover over variables to see their types from JSDoc
```

---

### Phase 3: Fix Implementation

#### Step 5: Write the Fix

**Fix Patterns:**

**Pattern 1: Null Check Fix**
```javascript
// ❌ BEFORE (crashes if body doesn't exist)
enemy.body.setVelocity(vx, vy);

// ✅ AFTER (safe with null check)
if (enemy.body) {
    enemy.body.setVelocity(vx, vy);
}
```

**Pattern 2: Initialization Fix**
```javascript
// ❌ BEFORE (undefined reference error)
this.player.lastFlamethrowerTick += delta;

// ✅ AFTER (initialize first)
if (!this.player.lastFlamethrowerTick) {
    this.player.lastFlamethrowerTick = time - 1000; // Immediate first fire
}
```

**Pattern 3: Type Fix**
```javascript
// ❌ BEFORE (typo in element name)
if (this.player.element === 'electirc') {  // Typo!

// ✅ AFTER (JSDoc autocomplete prevents typo)
if (this.player.element === 'electric') {
```

**Pattern 4: Logic Fix**
```javascript
// ❌ BEFORE (wrong comparison)
if (enemy.health < 0) {  // Misses health === 0

// ✅ AFTER (correct comparison)
if (enemy.health <= 0) {
```

#### Step 6: Add Regression Prevention

```javascript
// Add comment explaining the fix
// FIX: Check body exists before velocity change (Issue #X)
if (enemy.body) {
    enemy.body.setVelocity(vx, vy);
}

// Add defensive check for edge case
// SAFETY: Initialize timer to prevent undefined error
if (!this.player.lastActionTime) {
    this.player.lastActionTime = time - cooldown;
}
```

---

### Phase 4: Testing & Verification

#### Step 7: Test the Fix

**Testing Checklist:**
- [ ] Bug no longer reproduces (test 5 times)
- [ ] No new console errors
- [ ] No new warnings
- [ ] Similar code paths still work
- [ ] Performance not degraded
- [ ] Mobile still works (if applicable)

**Element-Specific Testing:**
```bash
# Test the affected element
# 1. Select the element
# 2. Take upgrades related to the bug
# 3. Reach the wave where bug occurred
# 4. Verify bug is fixed
# 5. Play 5 more waves to ensure no new issues
```

**Cross-Element Testing:**
```bash
# If bug affected multiple elements:
# 1. Test each element individually
# 2. Test with different upgrade combinations
# 3. Test in different seasons
# 4. Test with different enemy types
```

#### Step 8: Document the Fix

```bash
# Commit with clear message
git add -A
git commit -m "Fix: [Element] [brief description] (vX.X.X)

Issue: [Detailed description of the bug]

Root Cause: [What caused it]

Solution: [How it was fixed]

Testing: [How it was tested]

Fixes: #[issue number]
"
```

---

## Performance Optimization Strategy

### Performance Monitoring

#### Built-in Performance Checks

**Add to GameScene.js (temporary debugging):**

```javascript
// In update() method - check FPS
if (this.time.now % 1000 < 20) {  // Every ~1 second
    console.log('[PERF] FPS:', Math.round(this.game.loop.actualFps));
}

// Check object counts
if (this.time.now % 5000 < 20) {  // Every ~5 seconds
    console.log('[PERF] Counts:', {
        enemies: this.enemies.getChildren().length,
        projectiles: this.projectiles.getChildren().length,
        xpOrbs: this.xpOrbs.getChildren().length,
        damageNumbers: this.damageNumbers.length
    });
}
```

#### Performance Targets

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| FPS (Desktop) | 60 | <50 | <30 |
| FPS (Mobile) | 60 | <45 | <30 |
| Enemies | <50 | >50 | >80 |
| Projectiles | <100 | >100 | >150 |
| XP Orbs | <30 | >30 | >50 |
| Memory | <100MB | >200MB | >500MB |

---

### Optimization Techniques

#### Optimization 1: Object Pooling

**Problem:** Creating/destroying many objects causes garbage collection lag

**Solution:**
```javascript
// Instead of destroying and recreating projectiles:

// ❌ BEFORE (creates new object every time)
const projectile = this.add.graphics();
projectile.destroy();  // Later - causes GC

// ✅ AFTER (reuse existing objects)
// Use Phaser Groups with maxSize and recycling
this.projectiles = this.physics.add.group({
    maxSize: 100,
    runChildUpdate: true
});

// Get from pool instead of creating
const projectile = this.projectiles.get(x, y);
if (projectile) {
    projectile.setActive(true);
    projectile.setVisible(true);
}

// Return to pool instead of destroying
projectile.setActive(false);
projectile.setVisible(false);
```

#### Optimization 2: Reduce Update Frequency

**Problem:** Checking expensive conditions every frame (60 times/second)

**Solution:**
```javascript
// ❌ BEFORE (checks every frame)
update(time, delta) {
    // This runs 60 times per second!
    this.enemies.children.entries.forEach(enemy => {
        this.checkExpensiveCondition(enemy);
    });
}

// ✅ AFTER (check every N frames)
update(time, delta) {
    // Only check every 10 frames (6 times per second)
    if (this.game.loop.frame % 10 === 0) {
        this.enemies.children.entries.forEach(enemy => {
            this.checkExpensiveCondition(enemy);
        });
    }
}
```

#### Optimization 3: Spatial Optimization

**Problem:** Checking collision with all enemies every frame

**Solution:**
```javascript
// ❌ BEFORE (checks all enemies)
this.enemies.children.entries.forEach(enemy => {
    const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
    );
    if (dist < range) {
        // Do something
    }
});

// ✅ AFTER (only check nearby enemies)
// 1. Use Phaser's built-in arcade physics overlap
this.physics.add.overlap(player, enemies, callback);

// 2. Or use a quick AABB check first
this.enemies.children.entries.forEach(enemy => {
    // Quick axis-aligned bounding box check
    if (Math.abs(enemy.x - this.player.x) < range &&
        Math.abs(enemy.y - this.player.y) < range) {
        // Now do expensive distance check
        const dist = Phaser.Math.Distance.Between(/*...*/);
    }
});
```

#### Optimization 4: Batch Graphics Operations

**Problem:** Drawing graphics operations one at a time is slow

**Solution:**
```javascript
// ❌ BEFORE (creates new graphics for each particle)
for (let i = 0; i < 100; i++) {
    const particle = this.add.graphics();
    particle.fillStyle(0xff0000, 1);
    particle.fillCircle(x, y, 5);
}

// ✅ AFTER (batch operations on single graphics object)
const particles = this.add.graphics();
particles.fillStyle(0xff0000, 1);
for (let i = 0; i < 100; i++) {
    particles.fillCircle(x + i * 10, y, 5);
}
```

#### Optimization 5: Limit Particle Systems

**Problem:** Too many visual effects cause FPS drops

**Solution:**
```javascript
// ❌ BEFORE (unlimited particles)
createBurnEffect(enemy) {
    setInterval(() => {
        const particle = this.add.graphics();
        // Particle animation
    }, 100);  // Creates 10 particles per second forever!
}

// ✅ AFTER (limited particle count)
createBurnEffect(enemy) {
    // Limit to max 3 active particles per enemy
    if (!enemy.burnParticles) enemy.burnParticles = [];
    if (enemy.burnParticles.length >= 3) return;

    const particle = this.add.graphics();
    enemy.burnParticles.push(particle);

    // Remove when animation completes
    this.tweens.add({
        targets: particle,
        alpha: 0,
        duration: 500,
        onComplete: () => {
            particle.destroy();
            enemy.burnParticles = enemy.burnParticles.filter(p => p !== particle);
        }
    });
}
```

---

### Magic Affinity Specific Optimizations

#### Hot Spots to Watch

**1. Shadow Clones (Most Expensive):**
```javascript
// Current: 1-2 AI clones running pathfinding every frame
// Optimization: Reduce pathfinding frequency
updateShadowClones(time, delta) {
    // Only update clone AI every 5 frames instead of every frame
    if (this.game.loop.frame % 5 === 0) {
        // Update clone positions and targets
    }
}
```

**2. Nature Seeds (Memory Leak Risk):**
```javascript
// Current: Seeds created but not cleaned up
// Optimization: Limit max seeds and auto-cleanup
if (this.playerSeeds.length > 20) {
    // Remove oldest seed
    const oldestSeed = this.playerSeeds.shift();
    oldestSeed.destroy();
}
```

**3. Electric Chain Lightning (CPU Intensive):**
```javascript
// Current: Finds nearest enemy for each chain
// Optimization: Pre-calculate enemy distances once per frame
// Store in a sorted array, reuse for chains
```

**4. Status Effect Visuals (Too Many Graphics):**
```javascript
// Current: Creates new graphics for every status effect tick
// Optimization: Reuse existing status effect overlays
if (!enemy.burnOverlay) {
    enemy.burnOverlay = this.add.graphics();
}
// Update existing overlay instead of creating new one
```

**5. Damage Numbers (Memory Accumulation):**
```javascript
// Current: Damage numbers array grows indefinitely
// Optimization: Clean up after destruction
showDamageNumber(x, y, damage) {
    const text = this.add.text(/*...*/);

    this.tweens.add({
        targets: text,
        alpha: 0,
        duration: 800,
        onComplete: () => {
            text.destroy();
            // Clean up reference
            this.damageNumbers = this.damageNumbers.filter(d => d.text !== text);
        }
    });
}
```

---

## Common Bug Patterns

### Pattern 1: Timer Initialization Issues

**Symptom:** Ability doesn't fire immediately, has 2-3 second delay on first use

**Cause:** Timer initialized to 0 instead of `time - cooldown`

**Example Locations:**
- `GameScene.js:907` - Flamethrower timer
- `GameScene.js:1002` - Water bullets timer
- `GameScene.js:1233` - Seed planting timer

**Fix Pattern:**
```javascript
// ❌ WRONG
if (!this.player.lastActionTime) {
    this.player.lastActionTime = 0;  // Causes delay!
}

// ✅ CORRECT
if (!this.player.lastActionTime) {
    this.player.lastActionTime = time - cooldown;  // Fires immediately
}
```

**Search Command:**
```bash
# Find all timer initializations
grep -n "lastActionTime = 0" src/scenes/GameScene.js
grep -n "Time = 0" src/scenes/GameScene.js
```

---

### Pattern 2: Physics Body Null Reference

**Symptom:** `Cannot read property 'setVelocity' of undefined`

**Cause:** Accessing `body` before physics is initialized or after destruction

**Example Locations:**
- Enemy movement code
- Knockback effects
- Projectile velocity

**Fix Pattern:**
```javascript
// ❌ WRONG
enemy.body.setVelocity(vx, vy);

// ✅ CORRECT
if (enemy.body) {
    enemy.body.setVelocity(vx, vy);
}

// ✅ ALSO CORRECT (for new objects)
this.physics.add.existing(enemy);  // Add physics first
enemy.body.setVelocity(vx, vy);    // Then use body
```

---

### Pattern 3: Status Effect Not Ending

**Symptom:** Enemy stays frozen/paralyzed forever

**Cause:** Duration not decreasing, or `active` flag not reset

**Example Locations:**
- `GameScene.js:2305-2443` - updateStatusEffects()

**Fix Pattern:**
```javascript
// ❌ WRONG (duration never decreases)
if (effects.freeze.active) {
    // Forgot to decrease duration!
}

// ✅ CORRECT
if (effects.freeze.active) {
    effects.freeze.duration -= delta;  // Decrease by frame time
    if (effects.freeze.duration <= 0) {
        effects.freeze.active = false;  // End effect
    }
}
```

---

### Pattern 4: Element-Specific Attack Not Firing

**Symptom:** Selected element's special attack never happens

**Cause:** Missing `player.element` check, wrong cooldown, or timer not initialized

**Example Locations:**
- `GameScene.js:2700-2900` - Element attack updates in main loop

**Fix Pattern:**
```javascript
// ❌ WRONG (missing element check)
if (this.player.lastFlamethrowerTick) {
    this.updateFlamethrowerAttack(moveX, moveY, time);
}

// ✅ CORRECT (check element first)
if (this.player.element === 'flame') {
    this.updateFlamethrowerAttack(moveX, moveY, time);
}
```

---

### Pattern 5: Upgrade Not Applying

**Symptom:** Took upgrade, but no effect in game

**Cause:** Property name mismatch, upgrade not stored, or condition check wrong

**Example Locations:**
- `UpgradeSystem.js:368-714` - getElementalUpgrades()

**Fix Pattern:**
```javascript
// ❌ WRONG (property name doesn't match code)
apply: () => {
    this.player.hasInfernoBlast = true;  // Wrong name!
}

// In code later:
if (this.player.infernoBlastActive) {  // Checking different property!

// ✅ CORRECT (consistent naming)
apply: () => {
    this.player.hasMoltenCore = true;  // Consistent name
}

// In code later:
if (this.player.hasMoltenCore) {  // Same property name
```

**Search Command:**
```bash
# Find all upgrade property names
grep -n "this.player.has" src/systems/UpgradeSystem.js
grep -n "this.player.has" src/scenes/GameScene.js

# Compare to make sure they match
```

---

## Testing Protocols

### Pre-Commit Testing (5 minutes)

**Quick Smoke Test:**
```markdown
1. [ ] Start game (`python3 -m http.server 8000`)
2. [ ] Open browser console (F12)
3. [ ] Select character
4. [ ] Choose any element
5. [ ] Play through Wave 1
6. [ ] Take any upgrade
7. [ ] Play through Wave 2
8. [ ] Check: No console errors
9. [ ] Check: FPS stays above 50
10. [ ] Check: Game still playable
```

**If Changed Specific Element:**
```markdown
1. [ ] Select the changed element
2. [ ] Play through Wave 5 (boss wave)
3. [ ] Take all upgrades for that element
4. [ ] Play through Wave 10
5. [ ] Check: Element attacks work correctly
6. [ ] Check: Status effects apply correctly
7. [ ] Check: Upgrades have visible effect
```

---

### Full Testing Protocol (20 minutes)

**See TESTING.md for complete checklist**

Key areas:
- All 10 elements (basic functionality)
- Boss waves (Wave 5, 10)
- All 4 seasons
- Mobile responsiveness
- Status effects
- Performance at Wave 15+

---

### Regression Testing

**After Major Changes:**

Create a test save at key points:
```javascript
// Add to browser console to export game state
const testState = {
    wave: waveSystem.getCurrentWave(),
    player: {
        element: player.element,
        level: player.level,
        health: player.health,
        upgrades: player.elementalUpgrades
    }
};
console.log(JSON.stringify(testState, null, 2));
```

---

## Code Quality Maintenance

### Weekly Maintenance Tasks

#### Task 1: Console Log Cleanup
```bash
# Find all console.log statements
grep -rn "console.log" src/

# Remove or comment out debug logs
# Keep only important warnings/errors
```

#### Task 2: Dead Code Removal
```bash
# Find commented-out code blocks
grep -rn "// DEPRECATED" src/
grep -rn "// OLD:" src/
grep -rn "// Removed" src/

# Delete if confirmed no longer needed
```

#### Task 3: JSDoc Synchronization
```bash
# Check for methods without JSDoc
# Look for recently added methods
git diff main --name-only src/

# Add JSDoc to any new methods
```

#### Task 4: Magic Number Elimination
```javascript
// ❌ BEFORE (magic numbers)
if (time - lastAction > 1000) {  // What does 1000 mean?

// ✅ AFTER (named constants)
const COOLDOWN_MS = 1000;  // 1 second cooldown
if (time - lastAction > COOLDOWN_MS) {
```

---

### Monthly Maintenance Tasks

#### Task 1: Performance Audit
```markdown
1. Run game for 30 waves
2. Monitor FPS throughout
3. Check memory usage (Chrome DevTools > Memory)
4. Identify performance bottlenecks
5. Implement optimizations as needed
```

#### Task 2: Browser Compatibility Check
```markdown
Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome (iOS)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)
```

#### Task 3: Code Complexity Review
```bash
# Look for methods > 100 lines
find src/ -name "*.js" -exec wc -l {} \; | sort -rn

# Consider breaking down large methods into smaller ones
```

---

## Monitoring & Metrics

### Key Metrics to Track

**Game Balance Metrics:**
```javascript
// Add to GameOverScene or as analytics
const metrics = {
    // Survival metrics
    wavesCompleted: waveSystem.getCurrentWave(),
    survivalTime: Math.floor(this.survivalTime / 60), // minutes

    // Performance metrics
    element: gameState.selectedElement,
    finalLevel: player.level,
    upgradesTaken: player.elementalUpgrades.length,

    // Difficulty metrics
    season: gameState.currentSeason,
    enemiesKilled: gameState.enemiesKilled,
    damageDealt: totalDamageDealt,
    damageTaken: totalDamageTaken
};

console.log('[GAME STATS]', metrics);
```

**Balance Questions:**
- Which elements reach highest waves?
- Which elements have lowest survival time?
- Which upgrades are never taken?
- Which status effects are most/least effective?

---

### Performance Benchmarks

**Add to GameScene for periodic logging:**

```javascript
// In create()
this.performanceLog = {
    startTime: Date.now(),
    frameCount: 0,
    lowFpsCount: 0,
    maxEnemies: 0,
    maxProjectiles: 0
};

// In update()
this.performanceLog.frameCount++;

const fps = this.game.loop.actualFps;
if (fps < 50) this.performanceLog.lowFpsCount++;

const enemyCount = this.enemies.getChildren().length;
this.performanceLog.maxEnemies = Math.max(
    this.performanceLog.maxEnemies,
    enemyCount
);

// On game over, log final stats
const runtime = (Date.now() - this.performanceLog.startTime) / 1000;
console.log('[PERFORMANCE]', {
    runtime,
    avgFps: this.performanceLog.frameCount / runtime,
    lowFpsPercent: this.performanceLog.lowFpsCount / this.performanceLog.frameCount,
    maxEnemies: this.performanceLog.maxEnemies,
    maxProjectiles: this.performanceLog.maxProjectiles
});
```

---

## Quick Reference Commands

### Development Commands
```bash
# Start dev server
python3 -m http.server 8000

# Check syntax of all files
node --check src/scenes/GameScene.js
node --check src/systems/*.js

# Search for pattern in code
grep -rn "pattern" src/

# Find large files
find src/ -name "*.js" -exec wc -l {} \; | sort -rn

# Count total lines of code
find src/ -name "*.js" | xargs wc -l
```

### Git Commands
```bash
# View recent changes
git log --oneline -10

# See what changed in a file
git log -p --follow src/scenes/GameScene.js

# Compare with previous version
git diff HEAD~1 src/scenes/GameScene.js

# Rollback to tag if needed
git checkout v2.2.2-pre-jsdoc
```

### Browser DevTools
```javascript
// Access game instance in console
window.phaserGame = game;  // Set in index.html or GameScene

// Check FPS
game.loop.actualFps

// Inspect player
game.scene.scenes[0].player

// Count active objects
game.scene.scenes[0].enemies.getChildren().length
game.scene.scenes[0].projectiles.getChildren().length

// Pause/resume physics
game.scene.scenes[0].physics.pause();
game.scene.scenes[0].physics.resume();
```

---

## Issue Tracking Template

**For GitHub Issues or Internal Tracking:**

```markdown
### Bug Report

**Title:** [Element] [Brief description]

**Severity:** 🔴 Critical / 🟡 High / 🔵 Medium / 🟢 Low

**Category:** Bug / Performance / Balance / UX

**Affected System:**
- [ ] Element-specific
- [ ] Combat System
- [ ] Wave System
- [ ] UI System
- [ ] Enemy AI
- [ ] Status Effects
- [ ] Other: ___________

**Element:** [flame/water/electric/nature/wind/terra/gravity/celestial/radiant/shadow]

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- Device: [Desktop/Mobile]
- OS: [Windows/Mac/Linux/iOS/Android]
- Version: v2.2.2

**Description:**
[Clear description of the issue]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Console Output:**
```
[Paste console errors/warnings]
```

**Additional Context:**
- Wave reached:
- Player level:
- Upgrades taken:
- Season:
- Screenshots:

**Possible Fix:**
[Optional: Your ideas for fixing it]

---

### Performance Issue

**Title:** [Brief description]

**Metric:** FPS / Memory / Load Time

**Baseline:** [Current performance]
**Target:** [Desired performance]

**When it occurs:**
- Wave: [X]
- Enemy count: [X]
- Projectile count: [X]
- Element: [X]
- Conditions: [what makes it worse]

**Performance Data:**
```
FPS: XX
Enemy count: XX
Projectile count: XX
XP orbs: XX
Memory usage: XXX MB
```

**Proposed Optimization:**
[Your idea for improvement]
```

---

## Prioritization Matrix

**How to prioritize bugs and optimizations:**

| Severity | Frequency | Priority | Action Timeline |
|----------|-----------|----------|----------------|
| Critical | Always | P0 | Immediate (same session) |
| Critical | Sometimes | P1 | Within 1 week |
| High | Always | P1 | Within 1 week |
| High | Sometimes | P2 | Within 1 month |
| Medium | Always | P2 | Within 1 month |
| Medium | Sometimes | P3 | Backlog |
| Low | Always | P3 | Backlog |
| Low | Sometimes | P4 | Nice to have |

**Critical Bugs:**
- Game crashes
- Cannot progress (softlock)
- Cannot start game
- Data loss

**High Bugs:**
- Feature completely broken
- Major performance degradation
- Exploits/cheats

**Medium Bugs:**
- Feature partially broken
- Visual glitches
- Unclear UI/UX

**Low Bugs:**
- Minor visual issues
- Typos
- Minor inconsistencies

---

## Session Preparation Checklist

**Before starting optimization/bug fix session:**

```markdown
### Pre-Session Checklist

1. [ ] Review open issues/bug list
2. [ ] Prioritize issues (use matrix above)
3. [ ] Verify current game version (check CHANGELOG.md)
4. [ ] Test current state (5-min smoke test)
5. [ ] Create branch: `fix/[issue-description]`
6. [ ] Read CLAUDE.md for current standards
7. [ ] Have TESTING.md open for reference

### During Session

1. [ ] Follow bug fixing workflow (Phase 1-4)
2. [ ] Use JSDoc to investigate efficiently
3. [ ] Test fix thoroughly before committing
4. [ ] Document fix in commit message
5. [ ] Update CHANGELOG.md if user-facing

### Post-Session

1. [ ] Run full smoke test
2. [ ] Check browser console for warnings
3. [ ] Test on mobile if relevant
4. [ ] Commit with clear message
5. [ ] Push to feature branch
6. [ ] Update issue tracker
7. [ ] Document any new patterns found
```

---

## Future Optimization Opportunities

### Low-Hanging Fruit (Easy Wins)

1. **Reduce status effect particle frequency**
   - Current: Creates particles every frame
   - Target: Create particles every 5 frames
   - Expected: 10-15% FPS improvement

2. **Limit damage number count**
   - Current: Unlimited damage numbers
   - Target: Max 20 on screen
   - Expected: 5-10% FPS improvement

3. **Debounce enemy AI updates**
   - Current: Updates every frame
   - Target: Update every 3 frames
   - Expected: 5-10% FPS improvement

4. **Cache distance calculations**
   - Current: Calculates distance multiple times per enemy
   - Target: Calculate once, reuse result
   - Expected: 3-5% FPS improvement

---

### Medium Effort (Significant Impact)

1. **Implement object pooling**
   - For: Projectiles, damage numbers, particles
   - Expected: 20-30% FPS improvement

2. **Optimize status effect visuals**
   - Use sprite sheets instead of graphics objects
   - Expected: 15-20% FPS improvement

3. **Spatial partitioning for collision**
   - Use quadtree or grid for enemy/projectile checks
   - Expected: 10-20% FPS improvement (late game)

---

### Long-Term (Architecture Changes)

1. **Migrate to Phaser Particle System**
   - Replace custom particle graphics with Phaser particles
   - Expected: 30-40% improvement in particle-heavy scenes

2. **Web Worker for AI calculations**
   - Move shadow clone AI to separate thread
   - Expected: Consistent 60 FPS even with multiple clones

3. **Asset preloading and caching**
   - Preload and cache procedural graphics
   - Expected: Faster scene transitions

---

## Conclusion

This optimization and bug fixing routine provides a systematic approach to maintaining and improving Magic Affinity. By following these workflows, you can:

✅ Fix bugs efficiently using JSDoc-powered investigation
✅ Prevent regressions with thorough testing
✅ Maintain consistent performance across waves
✅ Track and prioritize issues effectively
✅ Keep code quality high over time

**Remember:** Always test before committing, document your changes, and use JSDoc to your advantage!

---

**Next Steps:**
1. Bookmark this file for future sessions
2. Use as checklist when bugs are reported
3. Run monthly performance audit
4. Update with new patterns as discovered

**Document Version:** 1.0
**Last Updated:** November 11, 2025
**Maintainer:** Magic Affinity Development Team
