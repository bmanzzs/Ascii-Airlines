# JS Directory Guide

The game uses classic browser script tags, not ES modules. Files share globals, so `index.html` script order is the dependency order.

## Load Order

1. `sprites.js`
   ASCII/glyph art, sprite color helpers, and asset-adjacent factories.

2. `void-content.js`
   Black Void and late-game void mechanics: void projectiles, event horizon defense, void enemy factories, Black Void update logic, and Black Void rendering.

3. `galaxies.js`
   Galaxy/destination definitions and metadata, including titles, availability, visual metadata, and mode ids.

4. `wave-data.js`
   Pure wave and boss definition data, procedural wave theme data, signal drift data, and the static campaign wave table.

5. `waves.js`
   `WaveManager`, campaign wave routing, path builders, fly-by spawning, formation tracking, boss sequencing, custom wave composition, and spawn behavior.

6. `bootstrap.js`
   Canvas, HUD, and FPS DOM references.

7. `audio.js`
   Music loading, SFX buffers, gain routing, volume control, and boss music helpers.

8. `render-config.js`
   Logical canvas size, HUD constants, font sizing, and render dimensions.

9. `boss-defeat.js`
   Boss defeat freeze, explosion SFX, cleanup, and reward handoff.

10. `state.js`
   Theme settings, FPS state, physics constants, runtime state, pause helpers, screen shake, and shared coordinate helpers.

11. `glow-renderer.js`
   Cached glow glyph/radial rendering helpers, glow quality selection, glow budgets, and glow cache cleanup.

12. `music-visualizer.js`
   Music player compact/fullscreen visualizer rendering, visualizer geometry helpers, fullscreen controls, and visualizer render caches.

13. `player.js`
   Player model, ship rendering helpers, beam helpers, weapons, upgrades, level-up options, and console commands.

14. `galaxy-select-render.js`
   Galaxy select map rendering, destination sprites, Prism Array galaxy-select atlas/cache helpers, cursor/ship idle rendering, intro reveal, and galaxy warp visuals.

15. `ship-terminal.js`
   Terminal / fleet hub dock state, ship-select screen rendering, selected ship stats, hangar background, and dock transition rendering.

16. `entities-input.js`
   Entity arrays, keyboard/mouse listeners, background particles, and spatial hash state.

17. `combat-systems.js`
   Explosions, player projectiles, bombs, resizing, field rebuild, spatial hash utilities, reset, and combat helpers.

18. `binary-vertical.js`
   Binary Quasar / Bullet Route vertical shmup owner shell. Current route helpers, path builders, fly-by spawning, and boss sequencing remain in `waves.js`.

19. `bitshift-scroller.js`
   Bitshift Dwarf / Vector Scroll side-scroller runtime, including mode state, first-stage pacing, spawning, terrain hazards, the Dwarf Core Warden boss, rendering, and debug helpers.

20. `matrix-crawler.js`
   Matrix Nebula node crawler mode state, room generation, robot controls, enemies, pickups, rendering helpers, and HUD data.

21. `prism-survivor.js`
   Prism Array survival run state, horde waves, survivor combat helpers, and survivor-specific rendering data.

22. `physics.js`
   Main simulation update loop for player, enemies, bullets, bosses, drops, debris, and wave progression.

23. `ui-render.js`
   Pause/settings menus, level-up cards, console overlay, title/loading screen, and canvas frame rendering.

24. `hud.js`
   HUD color helpers, DOM construction, meter syncing, weapon grid syncing, and incremental HUD updates.

25. `main-loop.js`
   `requestAnimationFrame` loop, FPS pacing, startup resize, and font-ready boot.

## Edit Rules

- Add sprite art or sprite color helpers in `sprites.js`.
- Add or edit galaxy/destination metadata in `galaxies.js`.
- Add or rebalance wave/boss definition data in `wave-data.js`; keep wave routing, path builders, formation composition, fly-by spawning, boss sequencing, and spawn behavior in `waves.js`.
- Add Black Void-specific behavior in `void-content.js`.
- Add music player visualizer rendering or fullscreen visualizer visual polish in `music-visualizer.js`; keep playback/analyser code in `audio.js`.
- Add galaxy select map visuals, destination sprite polish, map cursor behavior, and galaxy warp visual changes in `galaxy-select-render.js`; keep metadata in `galaxies.js` and launch routing in `state.js`.
- Add Terminal / fleet hub visuals, dock transitions, and ship-select screen work in `ship-terminal.js`; keep shared player ship config and runtime player behavior in `player.js`.
- Add Binary Quasar / Bullet Route owner-shell work in `binary-vertical.js`; keep campaign wave definition data in `wave-data.js` and routing behavior in `waves.js`.
- Add Bitshift Dwarf side-scroller behavior in `bitshift-scroller.js`; keep mode-specific runtime logic there.
- Add Matrix Nebula node-crawler behavior in `matrix-crawler.js`.
- Add Prism Array survival-run behavior in `prism-survivor.js`; preserve existing survivor globals unless doing an explicit API migration.
- Add broad rendering/UI work in `ui-render.js` unless it only touches HUD DOM, then use `hud.js`.
- Keep shared weapons, upgrades, stat bonuses, sprites, projectiles, bombs, HUD, audio, input, and rendering helpers shared.
- Mode files should consume shared systems through mode-specific rules and tuning, not duplicate those systems.
- Keep files loaded in the order above unless you also check all globals used at file load time.

## Good Future Extractions

- `bosses.js` for shared boss AI/render helpers once older bosses are separated from `physics.js` and `ui-render.js`.
- `projectiles.js` if player shots, bombs, and enemy bullets keep growing.
- `menus.js` if pause, settings, level-up, console, and title screens need independent iteration.
