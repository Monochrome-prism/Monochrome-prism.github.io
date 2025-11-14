# Magic Affinity - Test Plan

## Prerequisites
- Hard refresh browser: **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)
- Open Developer Console: **F12** → **Console tab**
- Keep console open while testing

---

## Test 1: No Console Errors When Status Effects Kill Enemies

### Setup
1. Start game (should auto-start)
2. Choose **Nature element** (has poison that doubles damage) at level-up
3. Pick **Regeneration** upgrade to have healing for survivability

### Test Procedure
1. **Goal:** Get an enemy to low health and let poison kill it
2. Let a slime get to ~10-20 HP (take some hits from it)
3. Player orbs will apply poison when hitting
4. Poison damage doubles: 2→4→8→16 per tick
5. Watch the enemy die from poison damage

### Expected Result
- ✅ Enemy dies from poison
- ✅ **No console errors** (especially no "this.enemyDeath is not a function")
- ✅ XP orb spawns where enemy died
- ✅ Score increases
- ✅ Enemy removed from scene

### Verification
Look at console - should only see:
- Phaser startup messages
- "Creating 2 wizard orbs"
- NO red error messages

---

## Test 2: Wave 2 Spawns with 1 Goblin + Slimes

### Setup
1. Start game (auto-starts)
2. Select any element at level-up
3. Play through **Wave 1** completely (5 slimes)
4. Select an upgrade at level-up after Wave 1
5. **Wave 2 should start**

### Test Procedure
1. **Watch first enemy to spawn in Wave 2**
2. Count the enemies:
   - First enemy should be **GOBLIN** (green skin, red eyes, brown armor, faster)
   - Remaining enemies (2-3 more) should be **SLIMES** (green gelatinous)

### Expected Result
- ✅ Wave 2 message displays
- ✅ **First spawned enemy is GOBLIN** (different appearance from slimes)
- ✅ Goblin is faster and has more health than slimes
- ✅ Remaining enemies in wave are slimes
- ✅ ~3-6 total enemies in Wave 2

### Verification
Visual inspection:
- Goblin: pointed ears, red eyes, armor, club weapon
- Slimes: round, green, simple eyes
- Goblin should spawn first, then slimes spawn over next few seconds

---

## Test 3: Wave 5 Starts After Completing Wave 4

### Setup - WARNING: LONG TEST (5-10 minutes)
This requires playing through 4 complete waves to Wave 5.

1. Start game
2. Play through **Wave 1** (5 slimes) - ~2 minutes
3. Select upgrade, **Wave 2** starts (1 goblin + slimes) - ~2 minutes
4. Select upgrade, **Wave 3** starts (all slimes) - ~2 minutes
5. Select upgrade, **Wave 4** starts (slimes + goblins mix) - ~2 minutes
6. **Defeat all enemies in Wave 4**

### Test Procedure - What to Watch
1. After defeating last enemy in Wave 4:
   - Wave completion message appears: "Wave 4 Complete!"
   - Message should disappear after ~2 seconds
   - Screen should show "LEVEL UP!" prompt

2. **Select an upgrade** from the level-up menu:
   - After selecting, game should unpause
   - Physics should resume
   - You should see enemies again (but from Wave 5!)

3. **Wave 5 should START:**
   - "Wave: 5" displays in top-left corner
   - New enemies spawn (Boss coming!)
   - "BOSS INCOMING!" message appears
   - Boss spawns from top center with camera shake

### Expected Result
- ✅ Wave 4 completes without getting stuck
- ✅ "Wave 4 Complete!" message shows
- ✅ Level-up screen appears (can select upgrade)
- ✅ Game resumes after upgrade selection
- ✅ **Wave 5 starts automatically**
- ✅ Boss spawns with warning and effects
- ✅ Boss health bar appears at top

### If Wave 5 Doesn't Start (Safety Fallback)
If Wave 5 doesn't start after ~10 seconds of selecting the upgrade:
1. **Check console** for message: "Safety fallback: Force starting Wave 5"
2. If you see this message, the safety fallback triggered
3. Wave should then start automatically
4. This is expected behavior if normal flow fails

### Verification
- [ ] Wave 4 completes
- [ ] Level-up menu appears
- [ ] Select an upgrade
- [ ] Game resumes
- [ ] **Wave 5 text appears in corner**
- [ ] **Boss spawns with "BOSS INCOMING!" message**
- [ ] **Boss health bar appears at top**
- [ ] No console errors

---

## Quick Sanity Checks (Do These For Every Session)

1. **Game starts automatically** - No need to click
2. **No console errors on startup** - Should only see Phaser messages
3. **Wizard appears** - Should see character in center
4. **Can move with WASD** - Character responds to keyboard
5. **Level-up happens** - After collecting XP, element selection appears
6. **Can select element** - Click on one of 3 element cards
7. **Wizard color changes** - Hat/robes/orbs change to element color

---

## Debug Console Commands (Optional)

If you want to speed up testing, you can paste these in browser console:

```javascript
// Skip to Wave 5 directly (if needed for testing)
// this.wave = 4;
// this.player.health = 50;
// this.gameScene.completeWave();
```

But for proper testing, play naturally without cheating.

---

## Reporting Issues

If any test fails, please report:
1. **Which test failed** (1, 2, or 3)
2. **What you did** (exact steps)
3. **What happened** (unexpected behavior)
4. **Console errors** (copy the full error message)
5. **Browser** (Chrome, Firefox, Safari, Edge)
6. **Screenshot** (if possible)

---

## Test Results

After running all tests, please report:

- [ ] Test 1 PASSED: No console errors on poison kill
- [ ] Test 2 PASSED: Wave 2 has 1 goblin + slimes
- [ ] Test 3 PASSED: Wave 5 starts after Wave 4

Or note any failures with details above.
