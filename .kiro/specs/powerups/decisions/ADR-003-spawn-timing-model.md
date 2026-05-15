# ADR-003: Spawn Timing Model

## Status

Accepted

## Context

Powerups need to appear during gameplay at a rate that adds variety without dominating the match. The spawn system must decide when to attempt spawning, whether the attempt succeeds, and which powerup appears. The steering file states: "Powerups should spawn rarely enough that baseline paddle/ball skill remains the main game."

## Options Considered

### Option A: Fixed interval spawning

Spawn a powerup every N seconds (e.g., every 12 seconds). Deterministic and predictable.

**Rejected because:**
- Too predictable — players can time their positioning to always collect
- Doesn't feel organic or surprising
- No way to tune "rarity" independently of timing

### Option B: Random interval + probability gate

Choose a random interval between min and max seconds. When the interval fires, roll a probability check. If it passes, spawn a powerup. If not, reset the timer.

### Option C: Score/event-triggered spawning

Spawn powerups in response to game events (e.g., after every 3rd point in Pong, or every 5th brick in Breakout).

**Rejected because:**
- Ties spawn rate to player skill (better players see more powerups)
- Creates feedback loops (powerups help score → more powerups)
- Harder to balance across modes with different scoring rates

## Decision

Use **Option B**: random interval (8–15 seconds) between spawn attempts, with a 40% probability gate per attempt, maximum 1 uncollected powerup on screen, and 8-second despawn timer for uncollected powerups.

Expected spawn rate: one powerup appears roughly every 20–37 seconds on average (interval midpoint 11.5s ÷ 0.4 probability ≈ 28.75s average). This is rare enough that most points in Pong and most brick sequences in Breakout play out without powerup interference.

## Consequences

### Positive
- Unpredictable timing keeps gameplay fresh
- Probability gate provides a tuning knob independent of interval
- Max-1-on-screen prevents visual clutter and decision overload
- Despawn timer prevents stale powerups lingering indefinitely
- All parameters are configurable via SpawnConfig for future tuning

### Negative
- Randomness means some matches may have more powerups than others (variance)
- Players cannot reliably plan around powerup timing

### Risks
- If spawn rate feels too low in playtesting, parameters can be adjusted without code changes (just config values). If too high, same applies.
- The 40% probability is a starting point — may need tuning after manual play-testing.
