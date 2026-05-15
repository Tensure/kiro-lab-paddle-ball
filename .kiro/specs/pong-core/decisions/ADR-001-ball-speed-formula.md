# ADR-001: Ball Speed Increase Formula

## Status

Accepted

## Context

The ball must speed up on each paddle hit to make rallies progressively harder, then reset to base speed when a point is scored. We need to choose a formula that feels fair, is predictable for players, and prevents unplayable velocities.

The ball speed behavior was confirmed by the user: "Ball speed increases slightly on each paddle hit. Resets to base speed when a point is scored and the ball is re-served."

## Options Considered

### Option A: Linear Increment (uncapped)

`newSpeed = currentSpeed + increment`

- Simple and predictable
- Risk: after many hits in a long rally, speed becomes unplayable
- Rejected because: no upper bound means edge-case rallies produce impossible speeds

### Option B: Exponential Increase

`newSpeed = currentSpeed * multiplier` (e.g., 1.05×)

- Feels natural at first, accelerates dramatically in long rallies
- Harder to reason about — players can't predict when it becomes too fast
- Rejected because: exponential growth is harder to tune and produces unpredictable difficulty spikes

### Option C: Capped Linear Increment (chosen)

`newSpeed = Math.min(currentSpeed + increment, maxSpeed)`

- Simple, predictable, and bounded
- Players can develop intuition for how fast the ball will get
- Max speed provides a hard ceiling that prevents unplayable states
- Easy to tune: adjust `increment` for ramp rate, `maxSpeed` for difficulty ceiling

### Option D: Logarithmic / Diminishing Returns

`newSpeed = baseSpeed + maxDelta * (1 - 1/(1 + hits * factor))`

- Smooth curve that approaches but never reaches max
- More complex to implement and tune
- Rejected because: added complexity provides minimal gameplay benefit over capped linear for Pong's typical rally lengths (5–15 hits)

## Decision

Use **capped linear increment** (Option C).

Configuration:
- `BASE_SPEED = 300` px/s — comfortable starting pace
- `SPEED_INCREMENT = 25` px/s — noticeable but not jarring per hit
- `MAX_SPEED = 600` px/s — 2× base speed, challenging but playable

At these values, the ball reaches max speed after 12 consecutive paddle hits without scoring — a long rally. Most points will be scored well before max speed.

## Consequences

### Positive

- Simple implementation: one `Math.min` call
- Easy to tune: three constants control the entire feel
- Predictable for players: linear ramp is intuitive
- Testable: property-based test can verify bounds invariant trivially
- Reset on score keeps each point fresh

### Negative

- Less "organic" feel compared to exponential or logarithmic curves
- The cap creates a flat ceiling — very long rallies all feel the same once max is reached
- Tuning the three constants requires playtesting (no analytical solution for "fun")

### Risks and Mitigations

- **Risk:** Chosen values feel wrong during playtesting
  - **Mitigation:** Constants are isolated in a single location; easy to adjust without code changes
- **Risk:** Max speed is too fast or too slow for the paddle speed
  - **Mitigation:** Max speed (600) is 1.5× paddle speed (400), ensuring paddles can still reach the ball with good positioning
