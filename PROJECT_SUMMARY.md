# Ascii Airlines - Project Summary

> [!IMPORTANT]
> This repo uses classic script tags and shared globals. Preserve script load order. Do not add imports/exports or convert to modules.

Welcome to **Ascii Airlines**, a retro-futuristic, high-performance browser-based arcade shooter and survival game. It is built entirely in vanilla HTML5, CSS, and JavaScript using global scope sharing and `<canvas>` rendering combined with a modern DOM HUD.

---

## Technical Stack & Architecture

- **Rendering Engine**: Low-level HTML5 `<canvas>` rendering utilizing pixelated image scaling, high-performance cached ASCII/glyph glow rendering (`glow-renderer.js`), and particle system simulation.
- **Audio Engine**: Custom Web Audio API synthesizers and buffers (`audio.js`) featuring an interactive music player and an audio signal visualizer (`music-visualizer.js`).
- **HUD (Heads-Up Display)**: Hybrid DOM rendering (`hud.js`) overlaid on the canvas, styled with custom CSS animations, variables, gradients, and a pixelated cyberpunk terminal aesthetics.
- **Dependency Management**: Standard browser script loading (`index.html`) using shared globals. Load order is strictly managed (see below).

---

## Script Load Order & Core Systems

All scripts share a global namespace. Their loading sequence in `index.html` governs their dependencies:

1. **[sprites.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/sprites.js)**: Holds the raw ASCII art, glyph layouts, and color configuration maps for enemies, player ships, boss patterns, and visual effects.
2. **[void-content.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/void-content.js)**: Black Void and late-game void mechanics, containing event horizon defenses, void projectiles, and custom rendering.
3. **[galaxies.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/galaxies.js)**: Defines galaxy select locations, destinations, metadata, unlocks, and coordinates.
4. **[wave-data.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/wave-data.js)**: Contains wave specifications, procedural level curves, enemy formation templates, and campaign waves.
5. **[waves.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/waves.js)**: Orchestrates spawning, pathing, fly-by patterns, bosses, and formation timing (`WaveManager`).
6. **[bootstrap.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/bootstrap.js)**: Captures DOM references for the game canvas, HUD containers, and FPS counters.
7. **[audio.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/audio.js)**: Synthesizes sound effects, configures gain routing, loads audio streams, and manages soundtrack playback states.
8. **[render-config.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/render-config.js)**: Defines logical dimensions (e.g., 750x1000) and resolution scales.
9. **[boss-defeat.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/boss-defeat.js)**: Triggers screen freeze, explosion visual/audio cascades, and rewards when bosses die.
10. **[state.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/state.js)**: Tracks global runtime state, theme colors, settings, physics ticks, and player metrics.
11. **[glow-renderer.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/glow-renderer.js)**: Manages a cache of blurred glow sprites to keep the canvas update loop running fast.
12. **[music-visualizer.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/music-visualizer.js)**: Music player compact/fullscreen visualizer rendering, visualizer geometry, fullscreen controls, visualizer caches, black-hole/eclipse visualizer, and mini galaxy-select clone.
13. **[player.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/player.js)**: Models the player's ship, standard shooting/beam actions, upgrades, inventory stats, level-up choices, and debug console commands.
14. **[galaxy-select-render.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/galaxy-select-render.js)**: Renders the interactive map navigation, warp portal animations, and destination details.
15. **[ship-terminal.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/ship-terminal.js)**: Renders the hangar dock UI for selecting fleet ships, showcasing statistics, and transitioning to active levels.
16. **[entities-input.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/entities-input.js)**: Declares game entity arrays (like `enemies`, `comboProjectiles`, etc.). Owns keyboard/mouse input listeners, key state tracking, and state/menu transitions (e.g. launching active levels).
17. **[combat-systems.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/combat-systems.js)**: Manages shared combat/projectile/bomb collision logic, particle array initialization, spatial hash utility functions, and boss explosion triggers.
18. **[physics.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/physics.js)**: The main simulation update engine. Resolves movement (with fixed-step-ish behavior), hit detection, item pickups, background particle updates, and calls mode-specific update dispatch hooks.
19. **[ui-render.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/ui-render.js)**: Handles main menus, card selections on level-up, options menus, and game-over screens.
20. **[hud.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/hud.js)**: Synchronizes player health, weapon slots, and score metrics to the CSS-powered DOM overlay.
21. **[main-loop.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/main-loop.js)**: Runs the top-level game tick (`requestAnimationFrame`) with frame capping and resizing logic.

---

## Game Modes

Ascii Airlines houses several distinct gameplay prototypes accessible from the galaxy select screen:

### 1. Binary Quasar (Bullet Route)
*File:* **[binary-vertical.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/binary-vertical.js)**
*Type:* Classic Vertical Shoot-'Em-Up (Shmup)
*Description:* Renders the vertical shmup mode layout and acts as a future owner shell, while campaign waves, fly-by spawning, and boss sequencing remain in `waves.js`.

### 2. Bitshift Dwarf (Vector Scroll)
*File:* **[bitshift-scroller.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/bitshift-scroller.js)**
*Type:* Side-scrolling Shmup
*Description:* Scrolls horizontally. Integrates terrain hazards, collision hazards, narrow tunnels, and a custom Dwarf Core Warden boss fight.

### 3. Fractal Halo (Gravity Run)
*File:* **[fractal-gravity.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/fractal-gravity.js)**
*Type:* Physics-based Gravity Thrust Shmup
*Description:* Unlocked and playable gravity-thrust prototype. Features localized gravity wells, ship rotation/thrust controls, trajectory tracking, and the Gravity Core mini-boss.

### 4. Matrix Nebula
*File:* **[matrix-crawler.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/matrix-crawler.js)**
*Type:* Isaac-like Room Crawler
*Description:* Renders room layouts dynamically in a grid. Players pilot a ship through rooms, collect hearts/caches/data, defeat Matrix enemies, open doors/gates, and navigate to node portals.

### 5. Prism Array
*File:* **[prism-survivor.js](file:///c:/Users/Admin/Documents/Projects/Ascii%20Airlines/js/prism-survivor.js)**
*Type:* Horde-survival (Roguelite Survivor)
*Description:* Arena-based combat where the player fights off vast, ever-growing swarms of procedurally selected enemies. Focuses heavily on auto-firing weapon synergies, upgrade card picks, and leveling survival stats.
