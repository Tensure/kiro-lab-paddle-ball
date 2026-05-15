# ADR-001: Ball Speed Increase Configurability

## Status

Accepted

## Context

The refined story specifies that ball speed increase on paddle hit should be configurable (can be enabled/disabled), defaulting to enabled. We need to decide where this configuration lives and how it's exposed.

Options range from adding a field to `BreakoutSettings` (full React UI integration) to a simple scene-level constant that can be toggled in code.

## Options Considered

### Option A: Add field to BreakoutSettings type

- Requires updating `BreakoutSettings` in `src/game/types/settings.ts`
- Requires UI control in SettingsPanel
- Requires store field and action
- Full user-facing configurability

**Rejected because:** The refined story says "This could be a field in BreakoutSettings or a scene constant for now." Adding UI for a single boolean toggle adds scope to the settings panel and store without clear user demand in v1. Can be promoted later.

### Option B: Scene-level constant (default enabled)

- Simple `SPEED_INCREASE_ENABLED: true` in scene constants
- Can be overridden by future settings integration
- No UI changes needed
- Minimal scope

## Decision

Use a scene-level constant (`BREAKOUT.SPEED_INCREASE_ENABLED = true`) that the scene reads during initialization. The scene stores this as an instance field so it can be overridden by payload data if a future spec adds it to `BreakoutSettings`.

## Consequences

### Positive
- Minimal implementation scope — no settings UI changes
- Easy to promote to a full setting later (just add to BreakoutSettings and read from payload)
- Default behavior (enabled) matches user expectation for progressive difficulty

### Negative
- Not user-configurable in v1 without code change
- If a user wants to disable it, they must wait for a future spec or modify the constant

### Risks
- None significant — this is a low-stakes default that can be changed in a single line
