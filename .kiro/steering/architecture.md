---
inclusion: always
---

# Architecture

Build the rewrite as a Vite React TypeScript app with Phaser 3 embedded inside React.

## Toolchain

- **Build:** Vite with `@vitejs/plugin-react`
- **Language:** TypeScript in strict mode
- **UI framework:** React 19
- **Game engine:** Phaser 3 (latest v3.x)
- **Test runner:** Vitest with fast-check for property-based tests
- **Linter:** ESLint with typescript-eslint and react-hooks plugins
- **Package manager:** npm with exact version pinning for core deps

Use one unified Phaser game with shared core systems and mode-specific scenes. Shared systems should handle cross-mode concepts such as:

- game configuration and settings validation
- input mapping
- scoring and match lifecycle
- ball and paddle primitives
- collision helpers
- audio event routing
- powerup registry and effect application
- pause/resume/restart/menu transitions

Mode-specific scenes should handle the rules and layout for each mode:

- `PongScene` for `Pong: Solo` and `Pong: Versus`
- `BreakoutScene` for `Breakout`

Prefer this ownership split:

- React components: menus, settings controls, modal overlays, HUD containers when outside the Phaser canvas, routing between app states.
- Phaser scenes: active gameplay simulation, arcade physics bodies, canvas rendering, gameplay input, particles, tweens, camera effects, and event emission.
- Pure TypeScript modules: deterministic game rules that are practical to test without Phaser.

Keep deterministic gameplay logic outside Phaser scene methods where practical. Good candidates for pure modules include:

- Pong win-score validation
- Pong scoring and serve direction rules
- AI target selection and difficulty configuration
- Breakout brick-grid generation
- Breakout life/win/loss rules
- powerup definitions, eligibility, duration, stacking policy, and effect metadata
- collision math that does not depend on Phaser runtime objects

Phaser scenes may orchestrate runtime details, but they should not become the only place where game rules exist. If a rule can be expressed as data or a pure function, prefer doing that.

Use TypeScript-first boundaries. Define explicit types for:

- game modes
- match settings
- AI difficulty presets
- player identifiers
- powerup IDs and powerup effects
- scene launch payloads
- scene-to-React events
- audio event names

## System Initialization Order

When the game starts (GameView mounts), systems must be initialized in this order:

1. **SceneLauncher** — call `setLaunchPayload(payload)` with the match settings BEFORE creating the Phaser game
2. **AudioManager** — call `audioManager.init()` to create the AudioContext and subscribe to EventBridge audio events
3. **Phaser Game** — create `new Phaser.Game(config)` with the scene added via `postBoot` callback
4. **PongScene/BreakoutScene** — reads payload from SceneLauncher in `init()`, sets up physics and input in `create()`

On cleanup (GameView unmounts):
1. Destroy the Phaser game (`game.destroy(true)`)
2. Destroy the AudioManager (`audioManager.destroy()`)

The AudioManager is a passive EventBridge listener — it does nothing until `init()` is called. Forgetting to call `init()` results in silent audio (no errors, just no sound).

## Communication Patterns

| Direction | Mechanism | Example |
|-----------|-----------|---------|
| React → Phaser (launch) | SceneLauncher module variable | Settings, mode, winScore |
| React → Phaser (runtime) | EventBridge events | `match:pause`, `scene:restart` |
| Phaser → React | EventBridge events | `score:update`, `match:win`, `audio:*` |
| React → AudioManager | Direct method calls | `toggleMute()`, `setVolume()` |
| AudioManager → React | EventBridge `audio:state-change` | Mute/volume state updates |
| Scenes → Audio | EventBridge `audio:*` events | Passive — AudioManager listens automatically |

## Critical Implementation Rules (Learned from Bugs)

These rules exist because violating them caused real bugs during implementation:

1. **Never set `body.y` directly on a moving physics body.** Let Phaser move it via velocity, then clamp only at boundaries.
2. **Always reposition the ball to center immediately when a point is scored.** Don't leave it out of bounds during a serve delay.
3. **Use `window` event listeners for keyboard input** (not Phaser's keyboard plugin) when the game is embedded in React. Phaser's default targets the canvas which loses focus to React elements.
4. **Always call `audioManager.init()` before gameplay starts.** It's a passive listener that does nothing until initialized.
5. **Use the SceneLauncher pattern for passing data to scenes.** Don't rely on Phaser's `scene.add` data parameter timing.
6. **Add a visible serve delay (500ms–1s)** before the first serve and between points so players can see the ball reset.

