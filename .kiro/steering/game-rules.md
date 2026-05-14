---
inclusion: always
---

# Game Rules

## Pong

Pong has two variants:

- `Pong: Solo`: player controls the right paddle; AI controls the left paddle.
- `Pong: Versus`: left player uses `W/S`; right player uses `ArrowUp/ArrowDown`.

Pong win score is configurable before starting a match only. Default to `7`, and use a reasonable range such as `3` through `21`. Lock the value once the match starts.

When a player reaches the configured win score:

- stop active gameplay
- show a restart/menu overlay
- allow restart with the same settings
- allow returning to the mode menu

Pong AI should expose three named difficulties:

- `Easy`
- `Normal`
- `Hard`

Default to `Normal`. Model AI with capped paddle speed, reaction delay, and prediction error rather than directly following the ball every frame.

## Breakout

Breakout uses one bottom paddle and one or more balls. The player wins by clearing all bricks. The player loses when all lives are gone. Start with `3` lives.

Breakout controls:

- `ArrowLeft` / `ArrowRight`
- `A` / `D`

Breakout should support:

- score display
- lives display
- pause/resume
- restart match
- return to menu

## Shared Match Behavior

All modes should support:

- pause/resume
- restart current match
- return to menu
- audio mute/volume setting if settings persistence is implemented
- powerups enabled/disabled before match start

Do not allow gameplay settings that affect fairness to change mid-match unless a later spec explicitly requires it.

