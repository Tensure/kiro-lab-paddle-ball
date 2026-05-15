---
inclusion: always
---

# Product Direction

This project is evolving from a single-file HTML paddle-ball prototype into a better arcade paddle game built with React 19, TypeScript, and Phaser 3.

The target experience has three launchable modes:

- `Pong: Solo`: one player controls the right paddle; the left paddle is controlled by AI.
- `Pong: Versus`: two local players compete on the same keyboard.
- `Breakout`: one player controls a bottom paddle and clears a brick grid without losing all lives.

React owns app shell concerns: mode selection, settings, overlays, pause/restart/menu flows, and non-real-time UI. Phaser owns real-time gameplay, physics, rendering, input inside active matches, particles, and audio triggers.

Core product expectations:

- Use a clean neon arcade direction: dark neutral background, crisp geometric paddles/bricks, restrained glow/particle feedback, high contrast, and readable HUDs.
- Display a visible scoreboard during Pong matches showing both players' scores and the target win score. Use Phaser text or graphics rendered on the canvas (not a React overlay) so it stays in sync with gameplay.
- Display score and lives during Breakout matches on the canvas.
- Keep gameplay keyboard-only for v1.
- Keep pointer support limited to React menus and buttons.
- Provide sound effects for important game events.
- Use programmatic Phaser visuals and synthesized Web Audio for v1 instead of requiring external art or audio assets.
- Support optional powerups per match. Powerups default off for the first implementation.
- Persist settings only if straightforward; this is useful but not a hard v1 requirement.
- Do not add high scores in v1 unless a later spec defines scoring rules across modes and powerup-enabled runs.

Current baseline reference:

#[[file:.kiro/specs/paddle-ball-game/requirements.md]]
#[[file:.kiro/specs/paddle-ball-game/design.md]]
#[[file:.kiro/specs/paddle-ball-game/tasks.md]]

