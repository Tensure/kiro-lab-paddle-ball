# ADR-001: AI Behavior Model

## Status

Accepted

## Context

The `pong-ai` spec needs an AI opponent for the left paddle in Pong: Solo mode. The AI must be beatable at all three difficulty levels (Easy, Normal, Hard) and feel human-like rather than robotic. The game-rules steering explicitly states: "Model AI with capped paddle speed, reaction delay, and prediction error rather than directly following the ball every frame."

We need to choose an AI behavior model that:
- Is beatable at all difficulties
- Feels natural to play against
- Is tunable via numeric parameters
- Has pure logic testable without Phaser
- Does not require machine learning or complex state

## Options Considered

### Option A: Direct Ball Tracking with Speed Cap

The AI paddle moves directly toward the ball's current Y position each frame, but with a capped speed.

**Rejected because:**
- At high speeds, the AI becomes nearly perfect since it always knows exactly where to go
- Feels robotic — the paddle always moves toward the ball with no hesitation
- Only one tuning parameter (speed) makes difficulty levels feel similar
- Violates the steering requirement to not directly follow the ball every frame

### Option B: Prediction + Reaction Delay + Speed Cap (Chosen)

The AI predicts where the ball will intercept its paddle column (accounting for wall bounces), adds a random prediction error, and only recalculates after a reaction delay. Paddle speed is capped per difficulty.

**Chosen because:**
- Three independent tuning parameters create distinct difficulty feels
- Prediction error makes the AI miss even when it has time to reach the target
- Reaction delay creates windows where the AI is moving to an outdated target
- Speed cap prevents the AI from recovering from bad predictions too quickly
- Pure prediction function is easily testable with deterministic random seeds
- Matches the steering requirement exactly

### Option C: Zone-Based AI

The AI divides the play area into zones and moves to the zone center where the ball is predicted to arrive, with some probability of choosing the wrong zone.

**Rejected because:**
- Zone boundaries create unnatural movement patterns (paddle jumps between zones)
- Harder to tune for smooth difficulty progression
- Less intuitive to test — zone selection logic adds complexity without clear benefit
- Still needs speed capping, so it's strictly more complex than Option B

### Option D: Replay-Based AI

Record human player movements and replay them with timing offsets.

**Rejected because:**
- Requires recorded data or a recording phase
- Not reactive to actual ball position — feels disconnected
- Difficult to guarantee beatability
- Overly complex for a v1 implementation

## Decision

Use **Option B: Prediction + Reaction Delay + Speed Cap**.

The AI controller is a pure TypeScript module with three exported functions:
1. `computeAITarget` — predicts ball intercept with error offset
2. `shouldUpdateTarget` — enforces reaction delay
3. `computeAIPaddleVelocity` — moves toward target with speed cap

Difficulty is configured via `AIDifficultyConfig` objects with three numeric fields:
- `maxPaddleSpeed`: caps movement speed (180 / 280 / 370 px/s vs player's 400)
- `reactionDelayMs`: minimum time between target updates (500 / 250 / 100 ms)
- `predictionError`: random offset range in pixels (80 / 40 / 15 px)

## Consequences

### Positive

- Clear separation of concerns: pure prediction logic vs scene integration
- Three independent tuning knobs allow fine-grained difficulty balancing
- Deterministic testing via `randomSeed` parameter
- AI feels human-like: it commits to a target, sometimes wrong, and can't always recover
- Matches steering guidance exactly
- No external dependencies or data requirements

### Negative

- Prediction with wall bounces requires a fold/reflect algorithm (moderate complexity)
- Tuning the three parameters for good game feel requires manual playtesting
- The AI doesn't adapt during a match — difficulty is fixed at start

### Risks and Mitigations

- **Risk**: Numeric values may need retuning after playtesting.
  **Mitigation**: Values are in a single config constant, easy to adjust without code changes.
- **Risk**: Wall bounce prediction could have edge cases (ball moving parallel to walls, very steep angles).
  **Mitigation**: Property-based tests cover all angle combinations; result is always clamped to bounds.
- **Risk**: Hard difficulty might feel too easy or too hard depending on ball speed.
  **Mitigation**: Parameters are conservative (Hard AI is still 7.5% slower than player). Can be adjusted post-playtesting.
