---
inclusion: fileMatch
fileMatchPattern: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.spec.ts", "src/**/*.spec.tsx", "src/game/rules/**/*.ts"]
---

# Testing Guidance

Automated tests are mandatory for the rewrite, focused on behavior that can be tested reliably.

Prioritize unit tests for pure TypeScript modules:

- Pong scoring and win detection
- Pong win-score validation
- AI difficulty config and target selection behavior
- Breakout brick-grid generation
- Breakout lives/win/loss transitions
- powerup eligibility by mode
- powerup duration and cleanup behavior
- settings validation

Use property-based tests where they add value, especially for invariants inherited from the original spec:

- ball collision helpers preserve expected direction changes
- paddles remain within bounds after movement updates
- reset/serve helpers place balls in valid positions
- generated brick grids do not overlap and fit inside play bounds

## Test Runner

Use Vitest as the test runner. It shares Vite's transform pipeline and config, so module resolution is consistent between dev, build, and test.

- Configure with `happy-dom` environment for React component tests.
- Use standard Node environment for pure module tests.
- Run in single-execution mode for CI: `vitest run`.
- Test file pattern: `src/**/*.test.{ts,tsx}`.
- Use `fast-check` for property-based tests — it integrates with Vitest without plugins.
- Minimum 100 iterations per property test.
- Tag format for property tests: `Feature: <spec-name>, Property <N>: <property_text>`

Do not use Jest. The project uses Vitest exclusively (see ADR-003 in `react-phaser-foundation`).

React tests should cover settings and menu behavior:

- selected mode changes visible settings
- Pong win score can be configured before match start
- invalid win scores are rejected or clamped
- powerups toggle is passed into match launch settings
- mute/volume controls update settings if implemented

Do not require full Phaser scene end-to-end tests in v1 unless the project later adds Playwright or another browser test layer. Avoid brittle tests that inspect Phaser internals directly.

When possible, test typed event payload creation and pure rule outputs instead of rendering the Phaser canvas in a test environment.

