# ADR-001: Store-Level Guards for Lifecycle Invariants

## Status

Accepted

## Context

The match lifecycle has several invariants that must hold across all UI paths:
- Settings cannot change during a match
- Only one overlay can be visible at a time
- Certain actions are invalid in certain states

These invariants could be enforced at multiple levels:
1. In the store actions themselves (centralized)
2. In each React component that triggers the action (distributed)
3. In a middleware layer between components and the store

## Options Considered

### Option A: Store-level guards (chosen)

Add `get().phase` checks directly inside store actions. Actions silently reject invalid calls.

- **Pro:** Single enforcement point — impossible to bypass from any UI path
- **Pro:** Easy to test — call action, assert state unchanged
- **Pro:** No new abstractions or middleware
- **Con:** Silent rejection may confuse developers (no error thrown)
- **Con:** Requires `get` parameter in `create()` call

### Option B: Component-level guards

Each component checks phase/overlay state before calling store actions.

- **Pro:** Explicit — clear why an action isn't taken
- **Con:** Every component must independently enforce the same rules
- **Con:** Easy to forget in new components
- **Con:** Harder to test exhaustively

### Option C: Zustand middleware

Create a middleware that intercepts actions and validates state transitions.

- **Pro:** Clean separation of concerns
- **Con:** Over-engineered for 3 simple guards
- **Con:** Adds complexity to store setup
- **Con:** Harder to understand for new contributors

## Decision

Use store-level guards (Option A). The guards are simple `if` checks at the top of each action. This is the minimal change that guarantees the invariant regardless of which component or code path triggers the action.

For defense-in-depth, the GameView Escape handler also checks `winLossOverlayOpen` before emitting events — but the store guard is the authoritative enforcement.

## Consequences

### Positive
- Invariants are guaranteed at the lowest level
- Tests are straightforward: set state, call action, assert no change
- No new dependencies or abstractions

### Negative
- Silent rejection means callers don't get feedback that their action was ignored
- If a future spec needs to distinguish "rejected" from "accepted", the action signatures would need to return a boolean or result type

### Risks / Follow-up
- If more guards accumulate, consider extracting a `canPerformAction(state, action)` helper for readability
- Monitor for developer confusion from silent rejections — add console.warn in dev mode if it becomes a problem
