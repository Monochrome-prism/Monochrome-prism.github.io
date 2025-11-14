# Testing Protocol - Magic Affinity

## Quick Smoke Test (5 minutes)

**MANDATORY before every commit. Run this test in browser.**

### Setup
```bash
# Start local server
python3 -m http.server 8000

# Open http://localhost:8000 in browser
# Open DevTools console (F12) - watch for errors
```

### Checklist
1. [ ] Game starts, no console errors
2. [ ] Can move and attack (WASD works)
3. [ ] Can level up and choose element/upgrade
4. [ ] Wizard color changes on element select
5. [ ] Status effects appear visually
6. [ ] Wave 5 boss spawns with health bar
7. [ ] Zero console errors (check F12)
8. [ ] Sound effects play (not muted)
9. [ ] Can pause/unpause (ESC/P key)
10. [ ] Can reach game over screen
11. [ ] FPS stays at 60 (check `game.loop.actualFps` in console)
12. [ ] No crashes or freezes

### Quick Console Validation
```javascript
// Run these in browser console to verify game state
game.scene.scenes[0].player.element // Should show selected element
game.scene.scenes[0].enemies.getChildren().length // Should show enemy count
game.loop.actualFps // Should be ~60
```

---

## Full Testing Checklist

### 1. Game Startup (5 seconds)
- [ ] Game loads without console errors
- [ ] Character Select screen appears
- [ ] High score displays correctly from session
- [ ] Background music plays at proper volume

### 2. Character & Element Selection (30 seconds)
- [ ] Game auto-selects Wizard
- [ ] Random season is chosen and loads correctly
- [ ] Game transitions to GameScene smoothly
- [ ] Player wizard spawns at center (400, 300)
- [ ] No errors in console on transition

### 3. Gameplay Basics (2 minutes)
- [ ] WASD/Arrow keys move player smoothly
- [ ] Player can move in all 8 directions
- [ ] Touch joystick works on mobile devices
- [ ] Player is confined to screen bounds (no escape)
- [ ] Physics body updates correctly

### 4. Combat System (3 minutes)
- [ ] Wizard orbs are visible rotating around player
- [ ] Orbs deal damage to enemies on contact
- [ ] Orbs don't multi-hit same enemy (500ms cooldown works)
- [ ] Damage numbers appear floating upward from hits
- [ ] Sound effects play on hit (not muted)

### 5. Enemy System (5 minutes)
- [ ] Wave 1 spawns 5 slimes
- [ ] Slimes move towards player
- [ ] Enemies take damage and show health loss
- [ ] Enemy death spawns particles and XP orb
- [ ] No "undefined" errors in console on kill

### 6. Leveling & Upgrades (5 minutes)
- [ ] Kill enemies to collect XP (blue orbs)
- [ ] XP bar fills and triggers level-up at threshold
- [ ] Game pauses on level-up (physics frozen)
- [ ] Level-up overlay appears with 3 element choices
- [ ] Clicking upgrade applies it and resumes game
- [ ] First level-up shows element choice (10 options, not generic)
- [ ] After element selection, only that element's upgrades show

### 7. Status Effects (3 minutes per element being tested)
- [ ] **Flame:** Enemies burn (orange particles rise from them)
- [ ] **Water:** Enemies freeze (blue overlay, crystalline border)
- [ ] **Electric:** Enemies paralyze (yellow electric sparks)
- [ ] **Nature:** Enemies poison (green bubbles float up)
- [ ] **Wind:** Enemies sleep (Z symbols float up) and get knocked back
- [ ] **Terra:** Enemies get knocked back strongly
- [ ] **Gravity:** Enemies slow down (blue aura visible)
- [ ] **Celestial:** Enemies charm (pink hearts float up)
- [ ] **Radiant:** Enemies blind (dark overlay on them)
- [ ] **Shadow:** Enemies fear (red ! marks appear, they flee)

### 8. Wizard Visual Customization (1 minute per element)
- [ ] Wizard starts GREY with no element
- [ ] Upon selecting Flame: Wizard hat, robes, sleeves, and staff orb turn orange-red
- [ ] Upon selecting Water: Wizard turns royal blue
- [ ] Upon selecting Electric: Wizard turns yellow
- [ ] All other elements: Wizard changes to appropriate color
- [ ] Wizard orbs also change color to match element

### 9. UI Systems (2 minutes)
- [ ] Health bar shows current HP (red bar)
- [ ] XP bar shows progress to next level (blue bar)
- [ ] Wave number displays correctly
- [ ] Score increases as enemies die
- [ ] Survival time increases each second (MM:SS format)
- [ ] Damage numbers float upward and fade (visible & readable)

### 10. Wave & Difficulty Scaling (10 minutes)
- [ ] Wave 1: 5 enemies
- [ ] Wave 2-3: More slimes, higher HP/speed
- [ ] Wave 4: Goblins appear mixed with slimes
- [ ] Wave 5: BOSS spawns with health bar at top, 3 minions spawn
- [ ] Boss laser fires (red beam, visual warning)
- [ ] Wave completes when all enemies (including boss) are defeated
- [ ] Wave 6 starts properly after Wave 5 boss defeat
- [ ] Wave 7: Tank enemies spawn (slow, tanky, fire lasers)
- [ ] Wave 7+: Bomber enemies spawn (teleport, explode)

### 11. Seasonal Maps (2 minutes per season)
- [ ] **Spring:** Green grass, 40 colorful flowers, thorny bush hazards
- [ ] **Summer:** Desert tones, 8 trees that block projectiles, fire pit hazards
- [ ] **Fall:** Brown/tan background, 30 falling leaves obscure vision, poison mushroom hazards
- [ ] **Winter:** White/ice tones, ice patches make movement slippery (50% faster), ice spike hazards
- [ ] Hazards deal damage on contact (3 damage/sec, 1 second cooldown)

### 12. Pause System (1 minute)
- [ ] Press ESC or P to pause
- [ ] Game state freezes (physics pause)
- [ ] Dark overlay appears with "PAUSED" text
- [ ] Resume and Quit buttons appear
- [ ] Press ESC/P again or click Resume to unpause
- [ ] Quit returns to Character Select
- [ ] Cannot pause during level-up overlay

### 13. Fullscreen Mode (30 seconds)
- [ ] Click fullscreen button (⛶) on character select
- [ ] Game scales to fill screen (maintains aspect ratio)
- [ ] Game is centered on screen
- [ ] Press ESC to exit fullscreen
- [ ] Gameplay unchanged (same resolution, just scaled)

### 14. Game Over & High Score (1 minute)
- [ ] Player dies when health reaches 0
- [ ] Game Over scene appears
- [ ] Final stats display: Level, Time, Enemies Killed, Score
- [ ] High score updates if current score is higher
- [ ] "PLAY AGAIN" button restarts game
- [ ] High score persists during session (but not on page refresh)

### 15. Sound Effects (1 minute)
- [ ] Shoot: Short ascending tone plays on attack
- [ ] Hit: Quick descending tone plays on enemy hit
- [ ] Enemy Death: Sawtooth descend plays on enemy defeat
- [ ] Player Hit: Low harsh tone plays when player takes damage
- [ ] XP Collect: Ascending chime plays on XP collection
- [ ] Level Up: C Major arpeggio (C-E-G-C notes) plays
- [ ] Select: Quick ascending tone plays on selection
- [ ] Volume is appropriate (not too loud, not muted)

### 16. Elemental Upgrade Mechanics (5 minutes per mechanic)
- [ ] **Wildfire:** Burn spreads to nearby enemies (visually see multiple burning)
- [ ] **Chain Lightning:** Attacks jump visibly between grouped enemies
- [ ] **Tidal Wave:** 2 enemies can be frozen at once (not just 1)
- [ ] **Static Field:** Paralyzed enemies take continuous 2 damage/0.5s
- [ ] **Spore Cloud:** Poison spreads visibly to nearby enemies
- [ ] **Cosmic Dash:** Spacebar teleports 150px with visual effects, 5s cooldown works
- [ ] **Void Step:** Occasionally see "DODGE" text when attacks miss
- [ ] **Umbral Shroud:** Occasionally see "MISS" text on enemy attacks
- [ ] **Event Horizon:** Confused enemies attack other enemies (not player)
- [ ] **Tremor:** Knockback affects area (not just single enemy)

### 17. Balance Testing (10 minutes)
- [ ] Player feels appropriately challenged (not trivial, not impossible)
- [ ] Early game (Waves 1-3): Player learns element, builds confidence
- [ ] Mid game (Waves 4-6): Difficulty ramps up, upgrades feel impactful
- [ ] Late game (Waves 7+): Player at peak power, managing incoming waves
- [ ] Boss fights: Dramatic, challenging moments that feel earned when won
- [ ] No exploits: Can't cheese with positioning/farming
- [ ] Elemental choice affects gameplay (Fire plays different from Water)

### 18. Console Errors (Critical)
- [ ] Open browser console (F12)
- [ ] Play through 2 full waves
- [ ] **ZERO errors or warnings should appear**
- [ ] ZERO "undefined" messages
- [ ] ZERO crashes
- [ ] Game stays smooth 60fps (no stutters)

### 19. Memory & Performance (5 minutes)
- [ ] Game doesn't slow down after 10+ waves
- [ ] No memory leaks (stay in game for 10 minutes, RAM usage stable)
- [ ] Particle effects clean up properly
- [ ] Dead enemies cleanup properly
- [ ] No orphaned graphics objects left behind

---

## Testing Frequency

- **Before Commit:** All tests above (20-30 minutes)
- **Before PR:** Full test suite + extra edge case testing (45 minutes)
- **Before Release:** All tests + cross-browser testing (1 hour)

---

## Known Test Conditions

**Always Test With:**
- All 10 elemental types (test them cyclically)
- All 4 seasonal maps (ensure each season works)
- Mobile touch controls (if available)
- Desktop keyboard controls
- Both Firefox and Chrome (if cross-browser testing)

---

## Automated Testing for Phaser Games

### Browser Automation with Puppeteer
**For headless testing and CI/CD integration:**

```javascript
// Example: automated-test.js
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Navigate to game
    await page.goto('http://localhost:8000');

    // Wait for game to load
    await page.waitForSelector('canvas');

    // Check for console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.error('Console error:', msg.text());
        }
    });

    // Take screenshot
    await page.screenshot({ path: 'test-screenshot.png' });

    // Run assertions
    const errors = await page.evaluate(() => {
        // Access Phaser game instance
        const scene = game.scene.scenes[0];

        // Verify game initialized
        if (!scene.player) return 'Player not initialized';
        if (!scene.enemies) return 'Enemy system not initialized';
        if (!scene.waveSystem) return 'Wave system not initialized';

        return null; // No errors
    });

    if (errors) {
        console.error('Test failed:', errors);
        process.exit(1);
    }

    console.log('✓ All tests passed');
    await browser.close();
})();
```

### Visual Regression Testing
**Compare screenshots before/after changes:**

```bash
# Take baseline screenshot
python3 -m http.server 8000 &
# Open browser, take screenshot, save as baseline.png

# After making changes
# Take new screenshot, save as current.png

# Compare using ImageMagick
compare baseline.png current.png diff.png

# If diff.png shows differences, investigate
```

### Performance Profiling
**Use Chrome DevTools Performance tab:**

1. Open game in Chrome
2. Open DevTools (F12) → Performance tab
3. Click Record
4. Play game for 30 seconds (through 2-3 waves)
5. Stop recording
6. Analyze:
   - FPS should stay at 60
   - No long tasks (>50ms)
   - No memory leaks (heap should be stable)

### Memory Leak Detection
**Check for memory leaks during long sessions:**

```javascript
// In browser console
// Record initial memory
const initial = performance.memory.usedJSHeapSize;

// Play for 10 minutes through multiple waves
// Then check again
const final = performance.memory.usedJSHeapSize;
const increase = ((final - initial) / initial) * 100;

console.log(`Memory increased by ${increase.toFixed(2)}%`);
// Should be < 20% for stable game
```

### Phaser-Specific Test Patterns

**Test Scene Transitions:**
```javascript
// Verify scene changes work
game.scene.start('GameOverScene');
// Manually verify transition is smooth, no errors

game.scene.start('GameScene');
// Verify game resets properly
```

**Test Physics Collisions:**
```javascript
// Spawn enemy next to player
const scene = game.scene.scenes[0];
const testEnemy = scene.enemies.create(scene.player.x + 20, scene.player.y, null);
testEnemy.health = 100;

// Wait 1 second, verify collision happened
setTimeout(() => {
    console.log('Player took damage:', scene.player.health < scene.player.maxHealth);
}, 1000);
```

**Test Status Effects:**
```javascript
// Apply status effect to enemy
const scene = game.scene.scenes[0];
const enemy = scene.enemies.getChildren()[0];

// Apply freeze
enemy.statusEffects = { freeze: { duration: 2000, appliedAt: Date.now() } };

// Verify enemy can't move
console.log('Enemy frozen:', enemy.body.velocity.x === 0 && enemy.body.velocity.y === 0);
```

### Mobile Testing Workflow

**Browser DevTools Device Emulation:**
```
1. Open Chrome DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Select device: iPhone 12 Pro, iPad, etc.
4. Test touch controls:
   - Virtual joystick appears
   - Touch input works
   - Performance is acceptable (>30 FPS)
5. Test different screen sizes
```

**Real Device Testing:**
```bash
# Get local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Start server accessible on network
python3 -m http.server 8000 --bind 0.0.0.0

# On mobile device, navigate to:
# http://<your-ip>:8000

# Test:
# - Touch controls
# - Performance
# - Visual layout
# - Audio (ensure not muted)
```

### Continuous Integration Testing

**Example GitHub Actions workflow:**

```yaml
# .github/workflows/test.yml
name: Test Game

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'

      - name: Install dependencies
        run: npm install puppeteer

      - name: Start server
        run: python3 -m http.server 8000 &

      - name: Run tests
        run: node automated-test.js

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: test-screenshots
          path: '*.png'
```

### Browser Console Test Commands

**Quick manual tests to run in console:**

```javascript
// 1. Verify game instance exists
typeof game !== 'undefined'

// 2. Check scene is running
game.scene.isActive('GameScene')

// 3. Count game objects
const scene = game.scene.scenes[0];
console.log({
    enemies: scene.enemies.getChildren().length,
    projectiles: scene.projectiles.getChildren().length,
    xpOrbs: scene.xpOrbs.getChildren().length
});

// 4. Verify player state
console.log({
    health: scene.player.health,
    maxHealth: scene.player.maxHealth,
    level: scene.player.level,
    element: scene.player.element
});

// 5. Check FPS
console.log('FPS:', game.loop.actualFps);

// 6. Force trigger upgrade screen
scene.upgradeSystem.showUpgradeMenu();

// 7. Test enemy spawn
scene.enemySystem.spawnEnemy('slime');

// 8. Verify no memory leaks
console.log('Heap size:', performance.memory.usedJSHeapSize);
```

---

**Last Updated:** November 11, 2025
