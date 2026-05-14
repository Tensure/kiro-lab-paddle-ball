---
inclusion: auto
name: powerups
description: Powerup design, implementation, eligibility, balancing, and testing for Pong and Breakout modes.
---

# Powerups

Powerups are optional per match and default off for the initial better-version implementation.

Use a mode-aware powerup registry. A powerup definition should describe:

- stable ID
- display name
- eligible modes
- duration, if time-limited
- spawn weight or rarity
- whether it is beneficial, harmful, or neutral
- effect application behavior
- effect cleanup behavior
- audio/visual event hooks

Shared powerups:

- `Ball Speed Up`
- `Ball Slow Down`
- `Paddle Grow`
- `Paddle Shrink`
- `Multi Ball`

Pong-only powerups:

- `AI Freeze`, only in `Pong: Solo`
- `Opponent Paddle Shrink`, in `Pong: Solo` and `Pong: Versus`

Breakout-only powerups:

- `Piercing Ball`
- `Sticky Paddle`
- `Extra Life`
- `Wide Paddle`

Most powerups should be time-limited. `Extra Life` is permanent because it changes the lives count.

Pong harmful effects should target the opponent, not the player who collected the powerup. In `Pong: Solo`, opponent-targeting effects apply to the AI when the player earns them. In `Pong: Versus`, opponent-targeting effects apply to the other local player.

Powerups should spawn rarely enough that baseline paddle/ball skill remains the main game. Do not make powerups mandatory to win.

Keep stacking rules explicit. If no later spec says otherwise, prefer refreshing an active effect's duration over stacking multiple copies of the same timed effect.

