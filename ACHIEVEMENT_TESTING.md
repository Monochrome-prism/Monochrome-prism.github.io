# Achievement Testing Guide (v3.4.6)

This document provides step-by-step test scenarios to verify that the achievement system is working correctly after the v3.4.6 bug fixes.

## 🔍 Pre-Test: Browser Console Setup

1. **Open the game** in your browser (http://localhost:8000)
2. **Open Developer Console** (F12 or Cmd+Option+I)
3. **Go to Console tab** to see achievement tracking logs

---

## ✅ Test 1: Data Integrity Check

**Purpose:** Verify localStorage is working and data structure is valid

**Steps:**
1. Open browser console
2. Run this command:
   ```javascript
   window.integrity = await import('./src/systems/PersistenceSystem.js').then(m => m.PersistenceSystem.checkDataIntegrity())
   ```
3. Check console output

**Expected Result:**
- ✅ `Data integrity check PASSED`
- Shows `Achievements: X/15 unlocked`
- No error messages

**If it fails:**
- Check console for specific issues
- Verify localStorage is enabled in browser settings

---

## ✅ Test 2: First Blood Achievement (Lifetime Progress)

**Purpose:** Verify lifetime enemy kill tracking works across multiple runs

**Steps:**
1. Open console and check current progress:
   ```javascript
   localStorage.getItem('magicAffinityProgression')
   ```
2. Copy the output and note `totalEnemiesKilled` value
3. Play a game and kill 10+ enemies
4. Die or complete wave
5. Check console for `[ProgressionSystem]` logs
6. Verify `totalEnemiesKilled` increased by the amount you killed

**Expected Console Output:**
```
[ProgressionSystem] Checking achievements with runData: ...
[ProgressionSystem] First Blood progress: X/100
[ProgressionSystem] Save result: SUCCESS
```

**Verification:**
```javascript
// Check updated value
const data = JSON.parse(localStorage.getItem('magicAffinityProgression'));
console.log('Total enemies killed:', data.stats.totalEnemiesKilled);
console.log('First Blood progress:', data.achievements.firstBlood.progress);
```

---

## ✅ Test 3: Element Master Achievement (Wave 11 Check)

**Purpose:** Verify element-specific achievement tracking

**Steps:**
1. Start a new game
2. Select **Flame** element at level 1
3. Check console for:
   ```
   [ProgressionSystem] Element selection tracked: flame
   ```
4. Reach **Wave 11** (use cheat if needed - see below)
5. Complete the wave or die
6. Check console for Element Master logs

**Expected Console Output:**
```
[ProgressionSystem] Element Master check: flameMaster, waveReached=11
[ProgressionSystem] flameMaster UNLOCKED!
```

**Verification:**
```javascript
const data = JSON.parse(localStorage.getItem('magicAffinityProgression'));
console.log('Flame Master unlocked:', data.achievements.flameMaster.unlocked);
console.log('Flame Master best wave:', data.achievements.flameMaster.bestWave);
```

---

## ✅ Test 4: Migration System (Version Compatibility)

**Purpose:** Verify migration preserves progress when updating game version

**Steps:**
1. Check current data version:
   ```javascript
   const data = JSON.parse(localStorage.getItem('magicAffinityProgression'));
   console.log('Game version:', data.version);
   console.log('Data version:', data.dataVersion);
   ```
2. Note unlocked achievements:
   ```javascript
   const unlocked = Object.keys(data.achievements).filter(id => data.achievements[id].unlocked);
   console.log('Unlocked before reload:', unlocked);
   ```
3. **Refresh the page** (F5)
4. Check console for migration logs

**Expected Console Output (First load after v3.4.6):**
```
[PersistenceSystem] ===== MIGRATION START =====
[PersistenceSystem] Old game version: 3.4.5
[PersistenceSystem] Old data version: legacy
[PersistenceSystem] Unlocked achievements BEFORE migration: [...]
[PersistenceSystem] Unlocked achievements AFTER migration: [...]
[PersistenceSystem] ===== MIGRATION COMPLETE =====
```

**Expected Result:**
- Unlocked achievements list should be IDENTICAL before and after
- No warning about lost achievements
- Data version updated to `1.0.0`
- Game version updated to `3.4.6`

**Verification:**
```javascript
const data = JSON.parse(localStorage.getItem('magicAffinityProgression'));
const unlocked = Object.keys(data.achievements).filter(id => data.achievements[id].unlocked);
console.log('Unlocked after reload:', unlocked);
console.log('Data version:', data.dataVersion); // Should be "1.0.0"
console.log('Game version:', data.version);     // Should be "3.4.6"
```

---

## ✅ Test 5: localStorage Availability Warning

**Purpose:** Verify warning appears when localStorage is disabled

**Steps:**
1. Open browser settings
2. Disable cookies/localStorage for localhost
3. Reload the game
4. Check if warning pop-up appears on main menu

**Expected Result:**
- Red warning overlay appears
- Shows "⚠️ Browser Storage Disabled"
- Message: "Achievements and progress will NOT save!"
- Dismissible by clicking "OK" button

**To re-enable:**
- Re-enable localStorage in browser settings
- Refresh page

---

## 🎮 Quick Cheat Commands (For Testing Only)

Use these in the browser console to speed up testing:

### Unlock Wave 11 Instantly
```javascript
// During gameplay, open console and run:
game.scene.scenes[0].currentWave = 11;
```

### Add Enemy Kills
```javascript
// Add 50 enemy kills to progress
const progression = new (await import('./src/systems/ProgressionSystem.js')).ProgressionSystem();
const data = progression.getData();
data.stats.totalEnemiesKilled += 50;
data.achievements.firstBlood.progress += 50;
progression.save();
console.log('Added 50 kills. New total:', data.stats.totalEnemiesKilled);
```

### Check All Achievement Progress
```javascript
const data = JSON.parse(localStorage.getItem('magicAffinityProgression'));
Object.entries(data.achievements).forEach(([id, ach]) => {
    console.log(`${ach.name}: ${ach.unlocked ? '✅ UNLOCKED' : '❌ Locked'}`);
    if (ach.progress !== undefined) console.log(`  Progress: ${ach.progress}/${ach.target}`);
    if (ach.bestWave !== undefined) console.log(`  Best wave: ${ach.bestWave}`);
});
```

### Reset All Progress (USE WITH CAUTION)
```javascript
localStorage.removeItem('magicAffinityProgression');
location.reload();
```

---

## 🐛 Known Issues to Watch For

### Issue: Achievements not saving
**Symptoms:** Progress resets after page reload
**Check:**
- Console shows `Save result: FAILED`
- localStorage disabled in browser

**Fix:** Enable localStorage in browser settings

### Issue: Migration loops infinitely
**Symptoms:** Migration logs appear on every page load
**Check:**
- Data version not being updated
- Migration logic has a bug

**Debug:**
```javascript
const data = JSON.parse(localStorage.getItem('magicAffinityProgression'));
console.log('dataVersion:', data.dataVersion);
// Should be "1.0.0" after first migration
```

### Issue: Element Master not unlocking at Wave 11
**Symptoms:** Reach Wave 11 but achievement doesn't unlock
**Check:**
```javascript
// During game over, check console for:
[ProgressionSystem] Element Master check: flameMaster, waveReached=11
[ProgressionSystem] flameMaster UNLOCKED!
```

**Common causes:**
- `gameState.elementUsed` not set (should happen when selecting element)
- `runData.element` is undefined in GameOverScene
- Achievement ID mismatch (e.g., "Flame" vs "flame")

**Debug:**
```javascript
// Check what element was used
const data = JSON.parse(localStorage.getItem('magicAffinityProgression'));
console.log('Element used this run:', gameState.elementUsed);
console.log('flameMaster status:', data.achievements.flameMaster);
```

---

## 📊 Success Criteria

After running all tests, you should see:

✅ **Data integrity check passes**
✅ **Enemy kills accumulate across runs** (First Blood)
✅ **Element Masters unlock at Wave 11** (tested with at least 1 element)
✅ **Migration preserves all progress** (no achievements lost)
✅ **localStorage warning appears when disabled**
✅ **Console shows detailed migration logs** (helpful for debugging)

If all tests pass, the achievement system is working correctly!

---

## 🔧 Advanced Debugging

### View Raw localStorage Data
```javascript
console.log(JSON.parse(localStorage.getItem('magicAffinityProgression')));
```

### Compare Before/After Data
```javascript
// Before playing
const before = JSON.parse(localStorage.getItem('magicAffinityProgression'));

// After playing (run in console after game over)
const after = JSON.parse(localStorage.getItem('magicAffinityProgression'));

// Compare
console.log('Enemies killed change:', after.stats.totalEnemiesKilled - before.stats.totalEnemiesKilled);
```

### Monitor Achievement System in Real-Time
```javascript
// Add this to watch for changes
setInterval(() => {
    const data = JSON.parse(localStorage.getItem('magicAffinityProgression'));
    console.log('Current totalEnemiesKilled:', data.stats.totalEnemiesKilled);
}, 5000); // Check every 5 seconds
```

---

**Last Updated:** v3.4.6
**Testing Time Required:** ~15-20 minutes for full test suite
