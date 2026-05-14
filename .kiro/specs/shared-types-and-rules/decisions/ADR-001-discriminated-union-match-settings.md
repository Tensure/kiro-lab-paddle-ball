# ADR-001: Discriminated Union for Match Settings

## Status

Accepted

## Context

Match settings vary by game mode. Pong Solo needs `aiDifficulty` and `winScore`. Pong Versus needs `winScore` but not `aiDifficulty`. Breakout needs neither. We need a type structure that:

1. Prevents accessing mode-specific fields on the wrong mode.
2. Enables TypeScript narrowing so consumers can safely access fields after checking `mode`.
3. Keeps all settings in a single type that can be passed through the system.

## Options Considered

### Option A: Single interface with optional fields

```typescript
interface MatchSettings {
  mode: GameMode;
  winScore?: number;
  aiDifficulty?: AIDifficultyPreset;
  powerupsEnabled: boolean;
}
```

**Rejected because:**
- No compile-time enforcement that `aiDifficulty` is present for `pong-solo`.
- Consumers must null-check fields even when the mode guarantees their presence.
- Easy to forget a required field — errors only surface at runtime.

### Option B: Separate unrelated interfaces per mode

```typescript
interface PongSoloSettings { ... }
interface PongVersusSettings { ... }
interface BreakoutSettings { ... }
// No union type
```

**Rejected because:**
- Functions that accept "any match settings" need `PongSoloSettings | PongVersusSettings | BreakoutSettings` everywhere — verbose and not named.
- No shared base contract for common fields like `powerupsEnabled`.
- Harder to extend with new modes.

### Option C: Discriminated union keyed on `mode` (chosen)

```typescript
type MatchSettings = PongSoloSettings | PongVersusSettings | BreakoutSettings;
```

Each variant has a `readonly mode` literal type that TypeScript uses as the discriminant.

## Decision

Use a discriminated union keyed on the `mode` field. Each variant interface extends a shared `MatchSettingsBase` for common fields. TypeScript's control-flow narrowing gives consumers type-safe access to mode-specific fields after a `mode` check.

## Consequences

### Positive

- Compile-time enforcement: accessing `aiDifficulty` on a `BreakoutSettings` is a type error.
- TypeScript narrows automatically in `switch` and `if` blocks — no type assertions needed.
- Single `MatchSettings` type works everywhere settings are passed.
- Adding a new mode is additive: define a new variant, add it to the union.

### Negative

- Slightly more boilerplate than a single flat interface (multiple interface declarations).
- Consumers must narrow before accessing mode-specific fields (this is intentional safety, but adds code).

### Risks

- If many modes are added in the future, the union grows. Mitigated by the fact that this game has exactly three modes with no plans for more.
