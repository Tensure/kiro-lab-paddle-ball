---
inclusion: fileMatch
fileMatchPattern: ["src/**/*.ts", "src/**/*.tsx"]
---

# Phaser TypeScript Guidance

Use Phaser 3 for real-time game scenes and TypeScript for all new source files.

Recommended source organization:

- `src/app/` for React app shell and route/state composition
- `src/components/` for React UI components
- `src/game/` for Phaser setup, scene registration, and scene classes
- `src/game/scenes/` for mode scenes such as `PongScene` and `BreakoutScene`
- `src/game/systems/` for shared runtime systems such as audio, input, powerups, and scene events
- `src/game/rules/` for pure deterministic TypeScript game logic
- `src/game/types/` for shared gameplay types

Keep Phaser object mutation inside scenes and systems. Keep React state serializable and focused on settings, selected mode, app flow, and overlay state.

Use typed event contracts when Phaser needs to communicate with React. Prefer a small event bridge with explicit event names and payload types over ad hoc string events scattered across components.

Avoid driving Phaser's frame loop through React state. React should mount/unmount the Phaser game container and pass initial settings. Phaser should own the active simulation loop.

Use Phaser Arcade Physics unless a later spec requires a different physics model. Pong and Breakout do not need complex physics.

For rendering v1 assets:

- draw paddles, balls, bricks, particles, and simple glow effects programmatically
- avoid requiring external image assets
- keep visual effects readable and restrained

For audio v1:

- synthesize short Web Audio effects or use Phaser sound wrappers around generated buffers
- include distinct cues for paddle hit, wall bounce, brick break, score/life loss, powerup pickup, pause, win, and loss
- respect mute and volume settings when implemented

