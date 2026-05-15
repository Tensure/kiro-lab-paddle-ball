# ADR-002: Score Event Format for Breakout

## Status

Accepted

## Context

The existing `score:update` event in `EventMap` has the payload shape `{ left: number; right: number }`. This was designed for Pong's two-player scoring. Breakout has a single player score. We need to decide how to emit score updates from BreakoutScene.

## Options Considered

### Option A: Add a new event type (e.g., `breakout:score-update`)

- New event with payload `{ score: number }`
- Requires adding to EventMap
- Requires new subscription in GameView
- Clean semantic separation

**Rejected because:** It fragments the event contract and requires changes to GameView, store, and potentially overlays. The existing `score:update` handler in GameView already updates the store — adding a parallel path increases complexity.

### Option B: Reuse `score:update` with `{ left: score, right: 0 }`

- Breakout score goes in `left` field (the solo player's score)
- `right` is always 0 (no opponent)
- No EventMap changes needed
- No GameView subscription changes needed
- Store's `matchData.scores.left` naturally holds the breakout score

### Option C: Change EventMap to a union type

- `score:update` payload becomes `{ left: number; right: number } | { score: number; mode: 'breakout' }`
- Requires discriminated union handling everywhere

**Rejected because:** Over-engineered for the current need. Adds complexity to all consumers.

## Decision

Reuse `score:update` with `{ left: score, right: 0 }`. The `left` field carries the Breakout player's score. The `right` field is always 0.

## Consequences

### Positive
- Zero changes to EventMap, GameView subscriptions, or store
- WinLossOverlay and any score display naturally work
- Simple and pragmatic

### Negative
- Semantic mismatch: "left" doesn't mean "left player" in Breakout context
- If a future spec needs to distinguish Pong scores from Breakout scores in the store, this may need revisiting

### Risks
- Low risk — the store already has a `finalScore` field on `match:loss` for Breakout's end-of-game score display, so the `left/right` format is only used for live score updates during play
