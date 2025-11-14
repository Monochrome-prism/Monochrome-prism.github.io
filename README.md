# Magic Affinity ⚔️

**A wizard-focused roguelike survivor game with deep elemental magic system**

Built with Phaser 3 | ES6 Modular Architecture | Browser-based

---

## 🎮 About

Magic Affinity is a fast-paced, roguelike survivor game where you play as a Wizard with the power to master one of 10 unique elemental magic types. Survive waves of increasingly difficult enemies, level up, and choose powerful upgrades that synergize with your chosen element.

**Key Features:**
- 🔮 **10 Elemental Choices:** Flame, Water, Electric, Nature, Wind, Terra, Gravity, Celestial, Radiant, Shadow
- ⚡ **40+ Unique Upgrades:** 4 element-specific upgrades per element
- 🎨 **Dynamic Status Effects:** Visual feedback for burns, freezes, poisons, and more
- 🌍 **4 Seasonal Maps:** Spring, Summer, Fall, Winter - each with unique mechanics
- 👾 **5 Enemy Types + Bosses:** Slimes, Goblins, Tanks, Bombers, and powerful Bosses every 5 waves
- 📱 **Mobile Support:** Touch controls with virtual joystick
- 🎵 **Procedural Audio:** All sound effects generated in real-time with Web Audio API

---

## 🚀 Quick Start

### Prerequisites

Since the game uses ES6 modules, you **must** run it through a local web server. The browser's CORS policy prevents ES6 modules from loading via `file://` protocol.

### Option 1: Python (Easiest)

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: **http://localhost:8000**

### Option 2: Node.js

```bash
npx http-server
```

Then open: **http://localhost:8080**

### Option 3: VS Code Live Server

1. Install the "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

---

## 📂 Project Structure

```
/
├── index.html                          # Entry point (29 lines)
├── src/
│   ├── main.js                         # Phaser config & initialization (27 lines)
│   ├── config/
│   │   ├── gameState.js                # Global game state
│   │   └── elements.js                 # 10 elemental definitions
│   ├── systems/
│   │   ├── CombatSystem.js             # Orb attacks, status effects
│   │   ├── EnemySystem.js              # Enemy spawning & AI
│   │   ├── WaveSystem.js               # Wave progression
│   │   ├── UpgradeSystem.js            # Upgrade selection & application
│   │   ├── UISystem.js                 # HUD elements
│   │   └── SoundFX.js                  # Procedural audio
│   ├── scenes/
│   │   ├── CharacterSelectScene.js     # Auto-selects Wizard
│   │   ├── GameScene.js                # Main gameplay loop
│   │   └── GameOverScene.js            # End screen
│   └── utils/
│       ├── MathHelpers.js              # Physics & math utilities
│       ├── DrawingHelpers.js           # Rendering functions
│       └── StatusEffectHelpers.js      # Visual effects
├── archive/                            # Historical documentation
├── MagicAffinityBible.md               # Master game design doc ⭐
├── CHANGELOG.md                        # Version history
└── README.md                           # This file
```

---

## 🎯 How to Play

1. **Choose Your Element:** At level 1, select one of 10 elemental magic types
2. **Survive Waves:** Fight off increasingly difficult waves of enemies
3. **Level Up:** Complete waves to level up and choose powerful upgrades
4. **Build Synergies:** Stack element-specific upgrades for devastating combos
5. **Face Bosses:** Every 5 waves, a powerful boss appears
6. **Master the Elements:** Each element has unique status effects and playstyles

**Controls:**
- **WASD / Arrow Keys:** Move
- **ESC / P:** Pause
- **Spacebar:** Element-specific abilities (with certain upgrades)
- **Touch:** Virtual joystick on mobile devices

---

## 🔮 Elemental System

Each element has unique **status effects** and **4 upgrades**:

| Element | Status Effect | Playstyle |
|---------|---------------|-----------|
| 🔥 Flame | Burn damage over time | DoT specialist |
| 💧 Water | Freeze enemies in place | Crowd control |
| ⚡ Electric | Paralyze and chain lightning | AoE damage |
| 🌿 Nature | Doubling poison damage | Sustain + DoT |
| 💨 Wind | Knockback and sleep | Positioning |
| 🪨 Terra | Knockback and defense | Tank build |
| 🌌 Gravity | Slow and pull enemies | Control |
| ✨ Celestial | Charm and mobility | Support + mobility |
| ☀️ Radiant | Blind and damage reduction | Defensive |
| 🌑 Shadow | Fear and life steal | Vampiric |

---

## 🛠️ Development

### Tech Stack
- **Phaser 3.70.0:** Game framework
- **ES6 Modules:** Clean, modular architecture
- **Web Audio API:** Procedural sound generation
- **Vanilla JavaScript:** No build tools required

### Architecture Highlights

**Modular ES6 Structure** (v2.1.0+)
- Refactored from 5,629-line monolithic HTML
- Organized into logical modules for better maintainability
- Clean separation of concerns (scenes, systems, config)

**Why Modular?**
- ✅ Easier to find and update code
- ✅ Better organization
- ✅ Scalable for future features
- ✅ Modern JavaScript standards
- ✅ Easier collaboration

### Key Files

- **`src/main.js`:** Game initialization and Phaser configuration
- **`src/scenes/GameScene.js`:** Core gameplay loop (~2500 lines)
- **`src/config/elements.js`:** All elemental definitions and upgrades
- **`src/systems/SoundFX.js`:** Procedural audio generation

---

## 📖 Documentation

All documentation follows a **3-file standard** for simplicity:

1. **MagicAffinityBible.md:** Complete game design document (master reference ⭐)
   - Design philosophy and principles
   - All game systems explained
   - 10 elemental system details (5-10 pages comprehensive)
   - Complete upgrade list (40 element-specific upgrades)
   - Status effects and mechanics
   - Code architecture (modular ES6)
   - Testing & quality assurance procedures
   - Bug fix history

2. **CHANGELOG.md:** Version history
   - All releases documented
   - Breaking changes and improvements noted
   - Complete version progression

3. **README.md:** Quick start guide (this file)
   - One-paragraph description
   - How to play
   - Quick start instructions

---

## 🎮 Game Versions

- **v2.1.2 (Current):** Shadow element clone system fix
  - Fixed Shadow element clone rendering error
  - Shadow clones now spawn and attack properly
- **v2.1.1:** Bug fixes and gameplay balance
  - Fixed console error (setVelocity guard check)
  - Balanced Electric chain lightning range (100px)
  - Enhanced Fire attack speed (0.5s interval)
- **v2.1.0:** Modular ES6 refactor (6 independent systems)
- **v2.0.0:** Elemental magic system, wizard-only gameplay
- **v1.2.x:** Seasonal maps, boss system, 3-character gameplay
- **v1.0.0:** Initial release

See `CHANGELOG.md` for complete version history and `MagicAffinityBible.md` for design details.

---

## 🤝 Contributing

This is a solo learning project, but feedback and suggestions are welcome!

To suggest changes:
1. Open an issue describing your idea
2. Reference specific files/systems
3. Check `TwinStick Bible.md` for design philosophy

---

## 📜 License

This project is open source and available for learning purposes.

---

## 🙏 Credits

- **Game Framework:** Phaser 3 (https://phaser.io)
- **Inspiration:** Vampire Survivors, Brotato, Halls of Torment
- **Development:** Solo project by Monochrome-prism

---

## 🐛 Known Issues

None currently! All critical bugs fixed in v2.1.0.

See `TwinStick Bible.md` → "Bug Fixes & Issues" section for bug fix history.

---

## 🔗 Links

- **Play Online:** [GitHub Pages URL here]
- **Documentation:** See `TwinStick Bible.md`
- **Project Structure:** See `PROJECT_STRUCTURE.md`

---

**Enjoy mastering the elements!** ⚔️🔮