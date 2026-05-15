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

When launching a scene with data from React:

- Do NOT rely on Phaser's `postBoot` callback or `scene.add` data parameter for passing init data — timing is unreliable.
- Instead, use the SceneLauncher module (`src/game/systems/SceneLauncher.ts`) to store the payload before creating the game.
- Scenes read from `getLaunchPayload()` in their `init()` method as the primary data source.
- This eliminates all timing dependencies between React game creation and Phaser scene initialization.
- For scene restart, emit `'scene:restart'` on EventBridge. Scenes subscribe and call `this.scene.restart()`.
- When detecting ball exit from play area, immediately reposition the ball to center BEFORE any delayed serve. Otherwise the exit condition fires on every subsequent frame while the ball remains out of bounds.
- Always use `>=` (not `===`) for win score comparisons to handle edge cases.
- Ensure `input: { keyboard: { target: window } }` is in the game config so keyboard events are captured from the window, not the canvas. This is critical for React-embedded Phaser games where the canvas may not have focus.
- Set `ball.body.setMaxSpeed(MAX_SPEED)` to prevent tunneling at high velocities.

Use Phaser Arcade Physics unless a later spec requires a different physics model. Pong and Breakout do not need complex physics.

## Phaser Arcade Physics Pitfalls

These patterns caused bugs in the initial implementation. Follow them to avoid repeating the same mistakes:

### Paddle Movement
- Do NOT set `body.y` directly every frame to clamp paddle position. This overrides velocity-based movement and makes paddles appear frozen.
- Instead, let Phaser move bodies via `setVelocityY()`, then clamp only when the paddle exceeds bounds (set position and zero velocity at the boundary).
- Paddles should use `setImmovable(true)` so the ball bounces off them, but velocity still works for movement.

### Ball Exit Detection
- When the ball exits the play area (scores a point), immediately reposition it to center (`ball.setPosition(centerX, centerY)`) before any delayed serve.
- If you only stop the ball's velocity but leave it at the out-of-bounds position, the exit check fires on every subsequent frame during the serve delay, causing rapid multi-scoring.

### Keyboard Input in React-Embedded Games
- Use `input: { keyboard: { target: window } }` in the Phaser game config, OR use direct `window.addEventListener('keydown'/'keyup')` in the scene.
- Phaser's default keyboard input targets the canvas element, which may not have focus when React components (buttons, overlays) are present.
- Direct window listeners are the most reliable approach for React-embedded Phaser games.
- Remember to remove window listeners in the scene's `shutdown` method.

### Scene Data Passing from React
- Do NOT rely solely on Phaser's `scene.add(key, class, autoStart, data)` or `postBoot` callbacks for passing init data. Timing is unreliable.
- Use a module-level variable (SceneLauncher pattern) that React sets before game creation and the scene reads in `init()`.
- The scene should check both the `init(data)` parameter AND the SceneLauncher as a fallback.

### Serve Timing
- Add a visible delay (500ms–1000ms) before the first serve and between points so players can see the ball reset and prepare.
- Use `this.time.delayedCall()` for serve delays, guarded by `!this.matchOver && !this.paused`.

For rendering v1 assets:

- draw paddles, balls, bricks, particles, and simple glow effects programmatically
- avoid requiring external image assets
- keep visual effects readable and restrained

For audio v1:

- synthesize short Web Audio effects or use Phaser sound wrappers around generated buffers
- include distinct cues for paddle hit, wall bounce, brick break, score/life loss, powerup pickup, pause, win, and loss
- respect mute and volume settings when implemented
- The AudioManager is a singleton that must be explicitly initialized via `audioManager.init()` when gameplay starts (e.g., in GameView mount). It subscribes to EventBridge audio events and plays sounds automatically. Call `audioManager.destroy()` on cleanup.

