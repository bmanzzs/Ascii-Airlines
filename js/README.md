# JS Directory Guide

The game uses classic browser script tags, not ES modules. Files share globals, so `index.html` script order is the dependency order.

## Load Order

1. `sprites.js`
   ASCII/glyph art, sprite color helpers, and asset-adjacent factories.

2. `void-content.js`
   Black Void and late-game void mechanics: void projectiles, event horizon defense, void enemy factories, Black Void update logic, and Black Void rendering.

3. `waves.js`
   `WaveManager`, wave definitions, path builders, fly-by spawning, formation tracking, and custom wave composition.

4. `bootstrap.js`
   Canvas, HUD, and FPS DOM references.

5. `audio.js`
   Music loading, SFX buffers, gain routing, volume control, and boss music helpers.

6. `render-config.js`
   Logical canvas size, HUD constants, font sizing, and render dimensions.

7. `boss-defeat.js`
   Boss defeat freeze, explosion SFX, cleanup, and reward handoff.

8. `state.js`
   Theme settings, FPS state, physics constants, runtime state, pause helpers, screen shake, and shared coordinate helpers.

9. `player.js`
   Player model, ship rendering helpers, beam helpers, weapons, upgrades, level-up options, and console commands.

10. `entities-input.js`
   Entity arrays, keyboard/mouse listeners, background particles, and spatial hash state.

11. `combat-systems.js`
   Explosions, player projectiles, bombs, resizing, field rebuild, spatial hash utilities, reset, and combat helpers.

12. `physics.js`
   Main simulation update loop for player, enemies, bullets, bosses, drops, debris, and wave progression.

13. `ui-render.js`
   Pause/settings menus, level-up cards, console overlay, title/loading screen, and canvas frame rendering.

14. `hud.js`
   HUD color helpers, DOM construction, meter syncing, weapon grid syncing, and incremental HUD updates.

15. `main-loop.js`
   `requestAnimationFrame` loop, FPS pacing, startup resize, and font-ready boot.

## Edit Rules

- Add sprite art or sprite color helpers in `sprites.js`.
- Add or rebalance waves in `waves.js`.
- Add Black Void-specific behavior in `void-content.js`.
- Add broad rendering/UI work in `ui-render.js` unless it only touches HUD DOM, then use `hud.js`.
- Keep files loaded in the order above unless you also check all globals used at file load time.

## Good Future Extractions

- `bosses.js` for shared boss AI/render helpers once older bosses are separated from `physics.js` and `ui-render.js`.
- `projectiles.js` if player shots, bombs, and enemy bullets keep growing.
- `menus.js` if pause, settings, level-up, console, and title screens need independent iteration.
