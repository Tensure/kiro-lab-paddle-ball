# ADR-002: Effect Application Strategy

## Status

Accepted

## Context

When a powerup is collected, its effect modifies a gameplay property (paddle size, ball speed, etc.). We need a strategy for applying these modifications and reverting them when the effect expires. The strategy must handle:
- Multiple simultaneous effects on the same property
- Duration refresh (stacking policy)
- Clean revert on expiry without corrupting other active effects

## Options Considered

### Option A: Multiplier stack with composite calculation

Store all active multipliers and recalculate the property value from the base value each frame. `currentValue = baseValue * multiplier1 * multiplier2 * ...`

**Rejected because:**
- Requires recalculating every frame even when nothing changes
- Complex interaction when multipliers are added/removed
- Stacking policy says no duplicate stacking, so multiple multipliers of the same type shouldn't exist

### Option B: Store original value, apply multiplier, revert on expiry

Before applying an effect, store the original property value. Apply the multiplier once. On expiry, restore the original value. If the same effect is refreshed, only the timer resets (value already modified).

### Option C: Delta-based approach

Store the delta (amount changed) and subtract it on expiry.

**Rejected because:**
- Floating point accumulation errors over multiple apply/revert cycles
- Harder to reason about when multiple effects touch the same property
- The stacking policy (no duplicate stacking) makes this unnecessary complexity

## Decision

Use **Option B**: store original values before first application, apply multiplier once, revert to stored original on expiry. The stacking policy ensures at most one instance of each effect type per target, so there's no conflict between multiple multipliers on the same property.

## Consequences

### Positive
- Simple mental model: one original value, one modified value, clean revert
- No per-frame recalculation needed
- Stacking policy (refresh duration, no duplicate) eliminates multi-multiplier conflicts
- Easy to verify in tests: apply → check modified → expire → check original restored

### Negative
- If two different powerups modify the same property (e.g., Paddle Grow and Wide Paddle both affect paddle size), reverting one could restore the "original" that doesn't account for the other. Mitigation: design powerups so different types don't overlap on the same property, or use per-effect original tracking.
- Requires careful ordering if destroy() is called while multiple effects are active. Mitigation: destroy() reverts all effects in reverse order.

### Risks
- Future powerups that stack multiplicatively would require rethinking this approach. Mitigation: the stacking policy explicitly forbids duplicate stacking, and the current 11 powerups don't have overlapping property targets within the same mode.
