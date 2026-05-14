# ADR 0004: Use Synthesized Audio For V1

## Status

Accepted

## Context

The product needs sound effects, but v1 does not need external audio asset management. The visual direction also favors programmatic neon arcade assets.

## Decision

Use synthesized Web Audio effects for v1, routed through Phaser or a shared audio system.

Include distinct cues for paddle hits, wall bounces, brick breaks, score or life loss, powerup pickup, pause, win, and loss.

## Consequences

- The game can ship with sound without asset procurement.
- Audio behavior remains deterministic enough to route through named events.
- Future specs can add external audio assets if needed.
- Audio design must avoid spam and respect mute/volume settings.

