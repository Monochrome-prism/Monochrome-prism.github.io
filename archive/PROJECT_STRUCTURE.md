# Magic Affinity - Project Structure

**Last Updated:** November 9, 2025

---

## 📁 Official 3-File Documentation Standard

Following the project's documentation standard, **Magic Affinity** uses exactly **3 core files**:

### 1. **index.html + /src/** (The Game)
- **Purpose:** Complete playable game with modular ES6 architecture
- **Size:** ~170 KB total (distributed across modules)
- **Tech:** Phaser 3, ES6 modules
- **Architecture:** Modular structure with organized /src directory
- **Features:**
  - Wizard-only gameplay with elemental magic system
  - 10 elemental choices
  - 5 enemy types + bosses
  - 40+ upgrades
  - 4 seasonal maps
  - Mobile support

**How to play:** Run a local web server (required for ES6 modules) - see setup instructions below

---

### 2. **TwinStick Bible.md** (Complete Design Doc)
- **Purpose:** Complete game design documentation
- **Size:** ~95 KB
- **Contains:**
  - Design philosophy & principles
  - Technical specifications
  - Elemental magic system documentation
  - Character & enemy designs
  - Game systems documentation
  - Code architecture
  - Bug fix history
  - Testing protocols
  - Development timeline

**Note:** Complete reference for all game mechanics and systems

---

### 3. **CHANGELOG.md** (Version History)
- **Purpose:** Version history only
- **Size:** ~7 KB
- **Format:** Keep a Changelog standard
- **Versions:** 1.0.0 → 1.2.1
- **Contains:**
  - Release dates
  - Features added
  - Bugs fixed
  - Breaking changes

---

## 📋 Why Only 3 Files?

✅ **One source of truth** - All documentation in one place
✅ **Easy to maintain** - No scattered information
✅ **No redundancy** - Information never out of sync
✅ **Faster to read** - Everything accessible immediately
✅ **Clear workflow** - Simple update process

❌ **Multiple files create confusion**
❌ **Information gets out of sync**
❌ **Maintenance burden increases**

---

## 🔄 Update Workflow

When making changes to the game:

1. **Edit** appropriate module files in `/src` directory
   - Scenes: `/src/scenes/*.js`
   - Systems: `/src/systems/*.js`
   - Config: `/src/config/*.js`
2. **Test** with local server (ES6 modules require server)
3. **Document** changes in `TwinStick Bible.md`
   - Update relevant sections (Character Design, Game Systems, etc.)
   - Add to Progress Log
   - Document any bug fixes in Bug Fixes section
4. **Add entry** to `CHANGELOG.md` with version number
5. **Commit** changes with descriptive message
6. **That's it!** ✅

---

## 📂 New Modular Architecture (v2.1.0+)

**Magic Affinity** has been refactored from a monolithic 5,629-line HTML file into a clean, modular ES6 structure:

```
/
├── index.html                    (29 lines - entry point)
├── index.backup.html            (original monolithic version)
├── src/
│   ├── config/
│   │   ├── gameState.js        (shared game state)
│   │   └── elements.js         (elemental system definitions)
│   ├── systems/
│   │   └── SoundFX.js          (procedural audio system)
│   ├── scenes/
│   │   ├── CharacterSelectScene.js
│   │   ├── GameScene.js        (main gameplay)
│   │   └── GameOverScene.js
│   └── main.js                 (Phaser config & initialization)
└── [documentation files]
```

### Why Modular?

✅ **Better organization** - Related code grouped together
✅ **Easier maintenance** - Find and update code faster
✅ **Cleaner separation** - Scenes, systems, and config isolated
✅ **Modern standards** - ES6 modules are industry standard
✅ **Scalability** - Easy to add new features without bloating files

### ⚠️ ES6 Modules Require Local Server

**IMPORTANT:** ES6 modules cannot run directly from `file://` protocol due to CORS restrictions.

**To run the game locally:**

```bash
# Option 1: Python 3
python -m http.server 8000

# Option 2: Python 2
python -m SimpleHTTPServer 8000

# Option 3: Node.js
npx http-server

# Option 4: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

Then open: `http://localhost:8000`

### File Breakdown

**index.html** (29 lines)
- Minimal HTML structure
- Phaser 3 CDN import
- Single `<script type="module">` tag loading `src/main.js`

**/src/main.js** (~80 lines)
- Imports all scenes and systems
- Phaser game configuration
- Initializes the game

**/src/config/**
- `gameState.js` - Shared state (high score, selected character)
- `elements.js` - All 10 elemental definitions and 40+ upgrades

**/src/systems/**
- `SoundFX.js` - Web Audio API procedural sound generation

**/src/scenes/**
- `CharacterSelectScene.js` - Character selection UI
- `GameScene.js` - Main gameplay loop (~2500 lines)
- `GameOverScene.js` - End screen with stats

## 📦 Additional Files (Optional/Reference)

These files are **supplementary** and not part of the core documentation standard:

- `README.md` - GitHub repository description with setup instructions
- `PROJECT_STRUCTURE.md` - This file (architecture overview)
- `index.backup.html` - Original monolithic version (backup)
- `Here comes trouble!.mp3` - Audio asset
- `.git/` - Git version control

---

## 🎯 Current Project Status

**Game Name:** Magic Affinity
**Version:** 2.1.0
**Status:** Fully Playable - Modular ES6 Architecture
**Branch:** `claude/update-documentation-structure-011CUwoioHzC3pXQuEof9KXi`

**Recent Changes (v2.1.0):**
- ✅ Refactored 5,629-line monolithic HTML → modular ES6 structure
- ✅ Created organized /src directory with proper separation
- ✅ All code extracted and syntax validated
- ✅ Wizard orb fixes preserved (2 orbs, 25% faster rotation)
- ✅ ES6 module architecture with clean imports/exports
- ✅ Documentation updated to reflect new structure

**Previous Changes (v2.0.0):**
- ✅ Elemental magic system (10 elements, 40+ upgrades)
- ✅ Wizard-only gameplay focus
- ✅ Complete status effect system
- ✅ Visual feedback for all status effects

---

## 📝 Documentation Standard Summary

**DO:**
- ✅ Edit `/src` modules for game changes
- ✅ Run local server for testing (ES6 modules requirement)
- ✅ Update `TwinStick Bible.md` for documentation
- ✅ Add entries to `CHANGELOG.md` for version history
- ✅ Keep documentation unified (not scattered)
- ✅ Test all changes before committing

**DON'T:**
- ❌ Create additional markdown files for documentation
- ❌ Scatter information across multiple files
- ❌ Duplicate documentation
- ❌ Create separate bug tracking files
- ❌ Try to run ES6 modules without a server (will fail)

---

**Code is modular, documentation is unified. Best of both worlds.** ✅
