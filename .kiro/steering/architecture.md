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

