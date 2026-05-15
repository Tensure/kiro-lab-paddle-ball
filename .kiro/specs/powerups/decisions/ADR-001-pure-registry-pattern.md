# ADR-001: Pure Registry Pattern

## Status

Accepted

## Context

The powerup system needs a central place to define all powerup metadata (IDs, names, durations, weights, eligible modes, effect types). This registry is consumed by the spawn system, effect manager, eligibility filter, and tests. We need to decide how to structure this data.

## Options Considered

### Option A: Class-based registry with methods

A singleton class that holds definitions and exposes methods for lookup, filtering, and validation.

**Rejected because:**
- Introduces unnecessary statefulness for what is fundamentally static data
- Harder to test (need to instantiate or mock the singleton)
- Violates the project's preference for pure modules over classes in the rules layer

### Option B: Pure data array + standalone functions

A readonly array of PowerupDefinition objects plus exported pure functions for lookup and filtering.

### Option C: Map-based registry

A `Map<PowerupId, PowerupDefinition>` with helper functions.

**Rejected because:**
- Maps are less ergonomic for iteration and filtering
- Readonly enforcement is weaker with Maps
- No meaningful performance benefit for 11 entries

## Decision

Use **Option B**: a readonly array of PowerupDefinition objects with standalone pure functions for lookup and filtering. The registry module exports `POWERUP_DEFINITIONS` as the source of truth and provides `getPowerupById()` and `getAllPowerups()` as convenience accessors.

## Consequences

### Positive
- Fully testable without mocks or instantiation
- Consistent with existing pure rule modules (scoring.ts, life-rules.ts, etc.)
- Easy to extend — adding a powerup means adding one object to the array
- TypeScript's `as const` and readonly types enforce immutability at compile time

### Negative
- Lookup by ID is O(n) for 11 items — negligible but not O(1)
- No encapsulation — any module can import and iterate the raw array

### Risks
- If powerup count grows significantly (50+), linear lookup could matter. Mitigation: convert to a Map internally while keeping the same function signatures.
