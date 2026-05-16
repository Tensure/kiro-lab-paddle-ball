---
inclusion: always
---

# Game Rules

## Pong

Pong has two variants:

- `Pong: Solo`: player controls the right paddle; AI controls the left paddle.
- `Pong: Versus`: left player uses `W/S`; right player uses `ArrowUp/ArrowDown`.

Pong win score is configurable before starting a match only. Default to `7`, and use a reasonable range such as `3` through `21`. Lock the value once the match starts.

Display a scoreboard on the Pong canvas during gameplay showing:
- Left player score and right player score
- Target win score (e.g., "First to 7")
- Use Phaser text rendered directly on the canvas, positioned at the top center
- Update the scoreboard immediately when a point is scored

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

## Ball Physics

Ball physics should prioritize game feel over realism. The ball should feel responsive, satisfying, and player-controllable.

### Paddle Hit Angle Influence

Both Pong and Breakout should use paddle-relative hit position to determine bounce angle:

- Hitting the center of the paddle returns the ball at a shallow angle (close to horizontal in Pong, close to straight up in Breakout).
- Hitting near the edge of the paddle produces a steeper angle.
- The influence should be smooth and proportional — not discrete zones.
- Implement as a pure function: `computeBounceAngle(hitOffset: number, paddleHalfHeight: number, maxAngle: number) → angle`.

### Speed Ramping

- Ball speed increases on each paddle hit during a rally (Pong) or on each brick hit (Breakout).
- The increment and max speed should be configurable via the "Ball speed increase" setting (Off / Gentle / Aggressive).
- Speed resets to base on serve (Pong) or life loss (Breakout).
- Base speed and max speed are determined by the "Ball speed preset" setting (Slow / Normal / Fast).

### Degenerate Trajectory Prevention

- If the ball's vertical velocity component drops below a minimum threshold, nudge it away from horizontal.
- This prevents boring back-and-forth loops where the ball barely moves vertically.
- Implement as a pure function that can be called after any collision: `ensureMinimumVerticalSpeed(vx: number, vy: number, minVyRatio: number) → { vx, vy }`.

### Serve Behavior

- Serve speed should feel intentional and snappy — not a slow drift.
- Serve direction alternates in Pong. In Breakout, serve launches upward at a slight random angle.
- A visible delay (500ms–1000ms) precedes each serve so the player can prepare.

### Tunable Constants

All physics-feel parameters should be named constants in the pure rules layer:

- `BASE_SPEED_SLOW`, `BASE_SPEED_NORMAL`, `BASE_SPEED_FAST`
- `MAX_SPEED_SLOW`, `MAX_SPEED_NORMAL`, `MAX_SPEED_FAST`
- `SPEED_INCREMENT_OFF`, `SPEED_INCREMENT_GENTLE`, `SPEED_INCREMENT_AGGRESSIVE`
- `MAX_BOUNCE_ANGLE` (radians, e.g., π/3 for 60°)
- `MIN_VERTICAL_SPEED_RATIO` (minimum vy as fraction of total speed)
- `PADDLE_HEIGHT_SMALL`, `PADDLE_HEIGHT_NORMAL`, `PADDLE_HEIGHT_LARGE`

These constants should be grouped in a dedicated config module (e.g., `src/game/rules/physics-config.ts`) so tuning doesn't require touching scene code.

## Pre-Match Configuration

### Pong Settings

| Setting | Options | Default | Applies To |
|---------|---------|---------|------------|
| Win Score | 3–21 (number input) | 7 | Solo, Versus |
| AI Difficulty | Easy / Normal / Hard | Normal | Solo only |
| Ball Speed | Slow / Normal / Fast | Normal | Solo, Versus |
| Paddle Size | Small / Normal / Large | Normal | Solo, Versus |
| Ball Speed Increase | Off / Gentle / Aggressive | Gentle | Solo, Versus |
| Powerups | On / Off | Off | Solo, Versus |

### Breakout Settings

| Setting | Options | Default |
|---------|---------|---------|
| Starting Lives | 1 / 3 / 5 | 3 |
| Ball Speed | Slow / Normal / Fast | Normal |
| Paddle Size | Small / Normal / Large | Normal |
| Brick Density | Sparse / Normal / Dense | Normal |
| Powerups | On / Off | Off |

### Rules

- All settings are locked at match start.
- Settings use segmented controls for preset options and number inputs for numeric values.
- New settings must be added to `MatchSettings` types and validated by the settings validator.
- Pure rule functions must accept settings as parameters — no hardcoded physics values in scenes.

## Shared Match Behavior

All modes should support:

- pause/resume
- restart current match
- return to menu
- audio mute/volume setting if settings persistence is implemented
- powerups enabled/disabled before match start

Do not allow gameplay settings that affect fairness to change mid-match unless a later spec explicitly requires it.

