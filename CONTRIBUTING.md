# Contributing to Magic Affinity

## Development Standards

### ⚠️ Hard Rules (Must Always Follow)

**Before Delivering ANY Code:**
1. ✅ Test wizard with multiple elements
2. ✅ Test all new features - No placeholders or broken functionality
3. ✅ Check console - Zero errors or warnings
4. ✅ Verify memory cleanup - No leaks (destroy objects properly)
5. ✅ Test pause/unpause - Must work in all scenarios
6. ✅ Check depth layering - UI always on top (depth 1000+)
7. ✅ Verify mobile controls - Touch joystick must work
8. ✅ Test all seasons - Each map theme must render correctly
9. ✅ Check hazard collisions - Must deal damage properly
10. ✅ Update documentation - Document ALL changes immediately

**Code Quality Non-Negotiables:**
- ❌ Never use undefined variables - Always initialize
- ❌ Never leave commented-out code - Remove or fix it
- ❌ Never use magic numbers - Use named constants
- ❌ Never skip error checking - Always validate states
- ❌ Never forget cleanup - Destroy graphics/timers on scene end

---

## Quick Testing Protocol

1. Load game → Character select appears
2. Select wizard → Game starts
3. Test movement (keyboard + touch if mobile)
4. Test combat (orb attacks)
5. Take damage from enemy → Check invuln frames
6. Take damage from hazard → Check damage tick
7. Collect XP → Check level up
8. Choose element/upgrade → Verify it applies
9. Pause game (ESC/P) → Everything freezes
10. Resume → Everything continues
11. Die → Game over screen appears

---

## Code Quality Requirements

**Must Have:**
- No errors in console
- Smooth 60fps gameplay
- All features fully implemented
- Proper memory cleanup
- Clear, readable code

**Basic Checklist:**
- [ ] Wizard loads correctly
- [ ] Combat system works
- [ ] Enemies spawn and move
- [ ] Collision detection works
- [ ] XP collection works
- [ ] Leveling up works
- [ ] All upgrades apply correctly
- [ ] Game over triggers properly
- [ ] Sound effects play
- [ ] UI displays correctly
- [ ] No memory leaks

---

## Naming Conventions

- `camelCase` for variables/functions
- `PascalCase` for classes/scenes
- `UPPER_CASE` for constants
- Descriptive names (no single letters except in loops)

---

## Code Organization

1. Constants and configuration at top
2. Scene classes in order (Select → Game → GameOver)
3. Helper functions grouped logically
4. Comments for complex logic only
5. Consistent indentation (4 spaces)

---

## Documentation Standard

This project uses **3 files**:
1. **MagicAffinityBible.md** - Game design document (stats, numbers, mechanics)
2. **CHANGELOG.md** - Version history only
3. **README.md** - Quick start guide

**Update workflow:**
1. Make game changes in code
2. Document changes in MagicAffinityBible.md
3. Add version entry to CHANGELOG.md
4. Update README.md if needed

---

**Last Updated:** November 10, 2025
