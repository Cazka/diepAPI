<div align="center">
  <img src="assets/diepAPI-logo.png" alt="diepAPI Logo" width="400">

  <p><strong>A powerful JavaScript API for building bots, tools, and automation scripts for diep.io</strong></p>

![Version](https://img.shields.io/badge/version-3.3.1-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![GitHub Stars](https://img.shields.io/github/stars/Cazka/diepAPI?style=social)

</div>

---

## What is diepAPI?

**diepAPI** is a comprehensive library that gives you programmatic access to the diep.io game. Build powerful bots and tools with just a few lines of code! Whether you want to create an AFK script, automate shape farming, or build advanced analytics tools, diepAPI makes it easy.

**Key capabilities:**

- 🎮 **Real-time game state** - Access player position, velocity, level, tank type, and more
- 🤖 **Player control** - Move, aim, shoot, and upgrade programmatically
- 👁️ **Entity tracking** - Track all visible players, shapes, and projectiles
- 🎨 **Canvas overlays** - Draw custom visualizations on top of the game
- ⚡ **Event-driven** - React to game events like spawning, leveling up, and frame updates
- 📘 **TypeScript support** - Full type definitions included

---

## 📦 Getting Started

### Using diepAPI in Your Scripts (Recommended)

You don't need to install diepAPI separately! Just add a `@require` directive to your userscript, and your userscript manager will automatically load diepAPI for you.

Create a new userscript in Tampermonkey/Violentmonkey with:

```javascript
// ==UserScript==
// @name         My Awesome Bot
// @description  My custom diep.io bot
// @match        https://diep.io/*
// @require      https://github.com/Cazka/diepAPI/releases/latest/download/diepAPI.user.js
// @grant        none
// ==/UserScript==

// diepAPI is automatically loaded and available here!
const { game, player } = diepAPI.apis;

game.on('ready', () => {
  console.log('Bot started!');
  player.spawn('MyBot');
});
```

That's it! The `@require` line automatically downloads and loads diepAPI before your script runs.

**Requirements:** [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)

---

### Install Standalone (Optional)

If you want to experiment with diepAPI directly in the browser console without writing a script:

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)
2. Download `diepAPI.user.js` from [Releases](https://github.com/Cazka/diepAPI/releases)
3. Install it in your userscript manager
4. Navigate to [diep.io](https://diep.io)
5. Open browser console and use `window.diepAPI`

This method is mainly for testing and experimentation. For building bots, use the `@require` method above.

---

### Building from Source

See the [Building from Source](#-building-from-source) section below.

---

## 🚀 Quick Start

Here's a complete, ready-to-use example. Copy this entire code block and create a new userscript in your userscript manager:

```javascript
// ==UserScript==
// @name         Position Logger
// @description  Logs player position every frame
// @match        https://diep.io/*
// @require      https://github.com/Cazka/diepAPI/releases/latest/download/diepAPI.user.js
// @grant        none
// ==/UserScript==

// Access the APIs you need
const { game, player } = diepAPI.apis;

// Wait for the game to be ready
game.on('ready', () => {
  console.log('diepAPI is ready!');

  // Spawn with a custom name
  player.spawn('MyBot');
});

// Run code every frame
game.on('frame', () => {
  // Access player state
  console.log('Position:', player.position);
  console.log('Velocity:', player.velocity);
  console.log('Level:', player.level);
});
```

**How to use:**

1. Copy the code above
2. In Tampermonkey/Violentmonkey, click "Create new script"
3. Paste the code and save
4. Navigate to [diep.io](https://diep.io)
5. Open browser console (F12) to see the logs

The `@require` directive automatically downloads diepAPI - no separate installation needed!

---

## 📚 Core Concepts

### API Structure

diepAPI is organized into three main namespaces:

- **`diepAPI.apis`** - Core game APIs for accessing state and controlling the player
  - `game`, `player`, `input`, `arena`, `camera`, `scaling`, `minimap`, `playerMovement`

- **`diepAPI.extensions`** - Optional features that must be loaded before use
  - `entityManager` (track all visible entities), `debugTool` (visual debugging)

- **`diepAPI.tools`** - Utility tools for drawing and visualization
  - `overlay` (canvas overlay), `backgroundOverlay` (background canvas)

- **`diepAPI.core`** - Core utilities like `Vector` math

### Events

diepAPI uses an event-driven architecture. Subscribe to events to react to game state changes:

```javascript
const { game, player } = diepAPI.apis;

// Game events
game.on('ready', () => console.log('Game is ready!'));
game.on('frame', () => console.log('New frame'));
game.on('frame_start', () => console.log('Frame started'));
game.on('frame_end', () => console.log('Frame ended'));

// Player events
player.on('spawn', () => console.log('Player spawned'));
player.on('dead', () => console.log('Player died'));
player.on('level', (level) => console.log('Level up!', level));
player.on('tank', (tankType) => console.log('Tank changed:', tankType));
```

Remove event listeners with `.off()`:

```javascript
const handler = () => console.log('Frame');
game.on('frame', handler);
game.off('frame', handler); // Remove listener
```

### Coordinate Systems

diepAPI works with three coordinate systems:

- **Arena coordinates** - Game world coordinates (origin at arena center)
- **Canvas coordinates** - High-DPI canvas rendering coordinates
- **Screen coordinates** - Browser viewport pixel coordinates

Convert between them using the `scaling` API:

```javascript
const { scaling } = diepAPI.apis;

// Convert between coordinate systems
const arenaPos = scaling.toArenaPos(canvasPos);
const canvasPos = scaling.toCanvasPos(arenaPos);
const screenPos = scaling.canvasToScreen(canvasPos);
const canvasPos = scaling.screenToCanvas(screenPos);
```

### Loading Extensions

Extensions must be loaded before use:

```javascript
const { entityManager } = diepAPI.extensions;

// Load the extension (call once)
entityManager.load();

// Now you can use it
console.log(entityManager.entities);
```

---

## 💡 Complete Examples

### Quick Reference

Choose an example based on your experience level:

| Example                                    | Difficulty      | What You'll Learn                        | Install                                                                                                                                                                |
| ------------------------------------------ | --------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Press O Script](#beginner-press-o-script) | 🟢 Beginner     | Basic events, auto-spawn                 | [![Install](https://img.shields.io/badge/Install-Press_O-44cc11?style=flat&logo=tampermonkey)](https://github.com/Cazka/diepAPI/raw/main/examples/press_o.user.js)     |
| [AFK Script](#beginner-afk-script)         | 🟢 Beginner     | Event handling, player control, movement | [![Install](https://img.shields.io/badge/Install-AFK_Script-44cc11?style=flat&logo=tampermonkey)](https://github.com/Cazka/diepAPI/raw/main/examples/afk.user.js)      |
| [Shape Farmer](#intermediate-shape-farmer) | 🟡 Intermediate | Entity tracking, filtering, targeting    | [![Install](https://img.shields.io/badge/Install-Shape_Farmer-44cc11?style=flat&logo=tampermonkey)](https://github.com/Cazka/diepAPI/raw/main/examples/farmer.user.js) |

---

### Beginner Examples

#### Beginner: Press O Script

The simplest possible bot - automatically opens the upgrade menu when you spawn and respawns when you die.

[![Install Press O Script](https://img.shields.io/badge/Install-Press_O_Script-44cc11?style=flat&logo=tampermonkey)](https://github.com/Cazka/diepAPI/raw/main/examples/press_o.user.js)

```javascript
// ==UserScript==
// @name         Press O
// @description  best script
// @version      0.0.2
// @author       Cazka
// @match        https://diep.io/*
// @require      https://github.com/Cazka/diepAPI/releases/latest/download/diepAPI.user.js
// @icon         https://www.google.com/s2/favicons?domain=diep.io
// @grant        none
// ==/UserScript==

const { player } = window.diepAPI.apis;

player.on('spawn', async () => await player.keyPress('o'));
player.on('dead', async () => await player.spawn());
```

**What you'll learn:**

- Using player events (`spawn`, `dead`)
- Auto-spawning with `player.spawn()`
- Simulating key presses with `player.keyPress()`

---

#### Beginner: AFK Script

Keep your tank stationary at its current position. Press Q to toggle AFK mode on/off.

[![Install AFK Script](https://img.shields.io/badge/Install-AFK_Script-44cc11?style=flat&logo=tampermonkey)](https://github.com/Cazka/diepAPI/raw/main/examples/afk.user.js)

```javascript
// ==UserScript==
// @name         AFK Script
// @description  press Q to activate AFK
// @version      0.0.5
// @author       Cazka
// @match        https://diep.io/*
// @require      https://github.com/Cazka/diepAPI/releases/latest/download/diepAPI.user.js
// @icon         https://www.google.com/s2/favicons?domain=diep.io
// @grant        none
// ==/UserScript==

const { Vector } = window.diepAPI.core;
const { player, game } = window.diepAPI.apis;

let afkActive = false;
let afkPosition;

// Toggle AFK mode with Q key
window.addEventListener('keydown', (e) => {
  if (e.code != 'KeyQ') return;

  // Toggle AFK state
  afkActive = !afkActive;

  // Enable/disable API control of player movement
  // (prevents user keyboard input from interfering)
  player.useGamepad(afkActive);

  // Save current position when activating AFK
  if (afkActive) afkPosition = player.position;
});

// Every frame, move back to the saved position
game.on('frame', () => {
  if (!afkActive) return;

  // Move player to the saved AFK position
  player.moveTo(afkPosition);
});
```

**What you'll learn:**

- Basic event handling with keyboard and game events
- Using `player.useGamepad()` to enable API control
- Using `player.moveTo()` to control player position
- Toggle pattern for activating/deactivating features

---

### Intermediate Examples

#### Intermediate: Shape Farmer

Automatically aims at nearby shapes and shoots them. Press P to toggle farming mode on/off.

[![Install Shape Farmer](https://img.shields.io/badge/Install-Shape_Farmer-44cc11?style=flat&logo=tampermonkey)](https://github.com/Cazka/diepAPI/raw/main/examples/farmer.user.js)

```javascript
// ==UserScript==
// @name         Farm Script
// @description  press P to start the farmer
// @version      0.0.7
// @author       Cazka
// @match        https://diep.io/*
// @require      https://github.com/Cazka/diepAPI/releases/latest/download/diepAPI.user.js
// @icon         https://www.google.com/s2/favicons?domain=diep.io
// @grant        none
// ==/UserScript==

const { Vector } = window.diepAPI.core;
const { player, game } = window.diepAPI.apis;
const { entityManager } = window.diepAPI.extensions;

// Load the entity manager extension to track entities
entityManager.load();

let farmActive = false;

// Toggle farming mode with P key
window.addEventListener('keydown', (e) => {
  if (e.code != 'KeyP') return;

  farmActive = !farmActive;
});

// Every frame, find and aim at the nearest shape
game.on('frame', () => {
  if (!farmActive) return;

  // Filter entities to find shapes only
  // Entity types: 0-3 are players/projectiles, 4+ are shapes
  // Type 9 is Alpha Pentagon (too dangerous), so we exclude it
  const entities = entityManager.entities.filter((x) => x.type > 3 && x.type !== 9);

  if (entities.length === 0) {
    return; // No shapes nearby
  }

  // Find the closest shape using reduce
  const entity = entities.reduce((acc, x) => {
    // Use predictPos() to account for entity movement
    // This gives better accuracy when entities are moving
    const distAcc = Vector.distance(acc.predictPos(100), player.predictPos(100));
    const distX = Vector.distance(x.predictPos(100), player.predictPos(100));

    // Return whichever entity is closer
    return distX < distAcc ? x : acc;
  });

  // Aim at the closest shape
  if (entity) player.lookAt(entity.position);
});
```

**What you'll learn:**

- Loading and using the `entityManager` extension
- Filtering entities by type to find specific targets
- Using `Vector.distance()` for distance calculations
- Using `predictPos()` for better targeting of moving entities
- Using `player.lookAt()` to aim at targets
- Using `reduce()` to find the closest entity

---

## 📖 API Reference

### Core APIs (`diepAPI.apis`)

Quick reference for the main APIs:

| API                | Description                  | Key Properties/Methods                                                                                                                                                                 |
| ------------------ | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **game**           | Game state and events        | `.on(event, handler)`, `.off(event, handler)`, `.isReady`                                                                                                                              |
| **player**         | Player state and control     | `.position`, `.velocity`, `.level`, `.tank`, `.isDead`, `.spawn(name)`, `.moveTo(pos)`, `.lookAt(pos)`, `.upgrade_stat(stat, amount)`, `.upgrade_tank(choice)`, `.useGamepad(enabled)` |
| **input**          | Keyboard and mouse control   | `.keyDown(key)`, `.keyUp(key)`, `.keyPress(key)`, `.mouse(x, y)`, `.mousePress(button)`                                                                                                |
| **arena**          | Arena information            | `.size` (arena dimensions)                                                                                                                                                             |
| **camera**         | Camera position tracking     | `.position` (current camera position)                                                                                                                                                  |
| **scaling**        | Coordinate system conversion | `.toArenaPos(canvasPos)`, `.toCanvasPos(arenaPos)`, `.screenToCanvas(screenPos)`, `.canvasToScreen(canvasPos)`                                                                         |
| **minimap**        | Minimap position tracking    | `.position` (minimap position)                                                                                                                                                         |
| **playerMovement** | Advanced movement tracking   | Position/velocity tracking with prediction                                                                                                                                             |

### Extensions (`diepAPI.extensions`)

Extensions must be loaded with `.load()` before use:

| Extension         | Description                                               | Usage                                                                   |
| ----------------- | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| **entityManager** | Track all visible entities (players, shapes, projectiles) | `.load()`, `.entities` (array), `.getPlayer()` (get your player entity) |
| **debugTool**     | Visual debugging overlays for development                 | `.load()`, `.enable()`, `.disable()`                                    |

### Tools (`diepAPI.tools`)

| Tool                  | Description                                | Usage                             |
| --------------------- | ------------------------------------------ | --------------------------------- |
| **overlay**           | Canvas overlay for drawing custom graphics | `.ctx` (CanvasRenderingContext2D) |
| **backgroundOverlay** | Background layer overlay                   | `.ctx` (CanvasRenderingContext2D) |

### Core Utilities (`diepAPI.core`)

| Utility    | Description            | Key Methods                                                                        |
| ---------- | ---------------------- | ---------------------------------------------------------------------------------- |
| **Vector** | Vector math operations | `.add()`, `.subtract()`, `.scale()`, `.distance()`, `.magnitude()`, `.normalize()` |

### Event Reference

**Game Events:**

- `ready` - Fired when diepAPI is ready to use
- `frame` - Fired every game frame
- `frame_start` - Fired at the start of each frame
- `frame_end` - Fired at the end of each frame

**Player Events:**

- `spawn` - Fired when the player spawns
- `dead` - Fired when the player dies
- `level` - Fired when the player levels up (callback receives level number)
- `tank` - Fired when the player changes tank (callback receives tank type)
- `keydown` - Fired when a key is pressed
- `keyup` - Fired when a key is released

### Entity Types

When using `entityManager`, entities have a `type` property:

- **0-3**: Players and player projectiles (bullets, drones, etc.)
- **4**: Square
- **5**: Triangle
- **6**: Pentagon
- **7**: Crasher
- **9**: Alpha Pentagon

Use `entity.type` to filter for specific entity types.

### Full Documentation

For complete API documentation with all methods and properties, visit:
📘 **[https://cazka.github.io/diepAPI/](https://cazka.github.io/diepAPI/)**

---

## 🔧 Building from Source

Want to modify diepAPI or contribute? Here's how to build it yourself:

```bash
# Clone the repository
git clone https://github.com/Cazka/diepAPI.git
cd diepAPI

# Install dependencies
npm install

# Build the userscript
npm run build
```

**Output:** `dist/diepAPI.user.js`

### Development Workflow

1. Make changes to files in `src/`
2. Run `npm run build` to compile
3. Install `dist/diepAPI.user.js` in Tampermonkey
4. Test your changes at [diep.io](https://diep.io)
5. Iterate!

### Other Commands

- `npm run lint` - Check code style with ESLint
- `npm run build-tools` - Compile TypeScript development tools

---

## 🤝 Contributing

Contributions are welcome! Whether it's bug reports, feature requests, or code contributions, we'd love your help making diepAPI better.

- **Issues & Bug Reports:** [GitHub Issues](https://github.com/Cazka/diepAPI/issues)
- **Pull Requests:** Fork the repo, make your changes, and submit a PR
- **Code Style:** Run `npm run lint` before submitting to ensure consistent code style

---

## 👥 Community & Support

### Join Our Discord

[![Discord](https://img.shields.io/discord/298838657974927360?label=Discord&logo=discord&color=7289DA&style=for-the-badge)](https://discord.gg/5q2E3Sx)

Join our Discord community to:

- 💬 Get help and support from other developers
- 🎨 Share your bots and scripts
- 💡 Discuss new features and ideas
- 🐛 Report bugs and get quick assistance
- 🤝 Connect with the diepAPI community

### Community Projects

Showcase your amazing creations built with diepAPI! See what others have made and share your own.

| Project Name         | Description                            | Author      | Links                    |
| -------------------- | -------------------------------------- | ----------- | ------------------------ |
| _Your project here!_ | _Submit a PR to showcase your project_ | _Your name_ | _Link to your repo/gist_ |

**Want to showcase your project?** Submit a PR adding your project to this table! Make sure your project is educational or automation-focused (no cheats/exploits).

### Contributors

A huge thank you to everyone who has contributed to diepAPI! 🎉

- **View all contributors:** [GitHub Contributors](https://github.com/Cazka/diepAPI/graphs/contributors)
- **Want to contribute?** Check out the [Contributing](#-contributing) section above

We appreciate:

- 🐛 Bug reports and fixes
- ✨ New features and improvements
- 📚 Documentation enhancements
- 💡 Ideas and suggestions

---

## 📄 License

diepAPI is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## 🔗 Helpful Links

- **📘 Full Documentation:** [https://cazka.github.io/diepAPI/](https://cazka.github.io/diepAPI/)
- **💡 Examples:** See [Complete Examples](#-complete-examples) (categorized by difficulty) or browse all in [examples/](https://github.com/Cazka/diepAPI/tree/main/examples)
- **💬 Discord Community:** [Join our Discord](https://discord.gg/5q2E3Sx) - Get help, share projects, and connect with developers
- **🐛 Report Issues:** [GitHub Issues](https://github.com/Cazka/diepAPI/issues)
- **⭐ Star on GitHub:** [Cazka/diepAPI](https://github.com/Cazka/diepAPI)

---

<div align="center">
  <p>Made with ❤️ for the diep.io community</p>
  <p><strong>Happy botting! 🤖</strong></p>
</div>
