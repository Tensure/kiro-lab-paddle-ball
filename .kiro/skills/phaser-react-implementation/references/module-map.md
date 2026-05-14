# Module Map

Recommended locations for the future scaffold:

- `src/app/`: app shell, top-level state, route-like mode flow.
- `src/components/`: React menus, settings, overlays, HUD wrappers.
- `src/game/`: Phaser game bootstrap and scene registration.
- `src/game/scenes/`: `PongScene`, `BreakoutScene`, shared base scene helpers if needed.
- `src/game/systems/`: audio, input, scene events, powerups, match lifecycle.
- `src/game/rules/`: pure deterministic rules.
- `src/game/types/`: shared TypeScript contracts.
- `src/test/`: test utilities.

If a file does not fit this map, pause and decide whether the map or the design needs updating.

