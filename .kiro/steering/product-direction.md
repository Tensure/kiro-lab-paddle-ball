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

## Ball Physics Direction

Ball physics should feel **gamey and satisfying**, not like a realistic physics simulation. Prioritize fun and responsiveness over accuracy.

Key principles:

- **Angle influence from paddle hit position**: Where the ball hits the paddle should meaningfully change its bounce angle. Hitting near the edge produces steeper angles; hitting the center returns it more flatly. This gives players agency over ball direction.
- **Speed ramping with feel**: Ball speed should increase over a rally in a way that builds tension. The ramp should be noticeable but not punishing — players should feel the pace quicken without losing control.
- **Spin or curve (optional, stretch)**: Consider subtle ball curve based on paddle movement at the moment of contact. This is a stretch goal but would add depth.
- **Snappy serve**: The ball should launch with purpose after a serve delay, not drift slowly. The initial speed should feel intentional.
- **Breakout angle variety**: In Breakout, ball angle off the paddle should vary based on hit position (same as Pong). Ball-to-brick collisions should feel punchy — slight speed bump or visual feedback on each break.
- **No "boring loops"**: The physics should avoid the ball getting stuck in repetitive horizontal or near-horizontal patterns. Introduce a minimum vertical velocity or slight random perturbation if the ball enters a degenerate trajectory.
- **Tunable constants**: All physics feel parameters (base speed, max speed, speed increment, angle influence strength, minimum vertical velocity) should be exposed as named constants in the pure rules layer so they can be tweaked without digging through scene code.

These principles should be implemented as pure rule functions where possible (angle calculation, speed ramping, degenerate trajectory detection) and wired into scenes at the physics layer.

## Menu Configuration Options

The pre-match settings UI should offer **more player control** over the game experience. The goal is to let players tune the feel of a match without overwhelming them — use sensible defaults and progressive disclosure.

### Pong Settings (Solo and Versus)

Current:
- Win score (3–21)
- AI difficulty (Solo only)
- Powerups toggle

Add:
- **Ball speed preset**: Slow / Normal / Fast — maps to base speed and max speed constants. Default: Normal.
- **Paddle size**: Small / Normal / Large — affects paddle height. Default: Normal.
- **Ball speed increase**: Off / Gentle / Aggressive — controls how much the ball accelerates per rally hit. Default: Gentle.

### Pong Settings (Solo only, in addition to above)

- AI difficulty already exists (Easy / Normal / Hard)

### Breakout Settings

Current:
- Powerups toggle

Add:
- **Starting lives**: 1 / 3 / 5 — default: 3.
- **Ball speed preset**: Slow / Normal / Fast — same as Pong. Default: Normal.
- **Paddle size**: Small / Normal / Large — default: Normal.
- **Brick density**: Sparse / Normal / Dense — controls how many rows/columns of bricks are generated. Default: Normal.

### UI Approach

- Use segmented controls (like the existing AI difficulty selector) for preset-based options.
- Group settings logically: "Match Rules" (win score, lives) and "Feel" (ball speed, paddle size, speed increase, brick density).
- All new settings should have clear defaults so players can just hit Start without configuring anything.
- New settings must be locked at match start — no mid-match changes.
- Settings types in `src/game/types/settings.ts` must be extended to include new fields.
- Pure rule functions should accept these settings as parameters rather than using hardcoded values.

Current baseline reference:

#[[file:.kiro/specs/paddle-ball-game/requirements.md]]
#[[file:.kiro/specs/paddle-ball-game/design.md]]
#[[file:.kiro/specs/paddle-ball-game/tasks.md]]

