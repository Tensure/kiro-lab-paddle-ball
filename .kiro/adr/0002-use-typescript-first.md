# ADR 0002: Use TypeScript First

## Status

Accepted

## Context

The rewrite includes multiple modes, settings, audio events, powerups, scene launch payloads, and cross-boundary communication between React and Phaser.

Plain JavaScript would make these contracts easier to drift over time.

## Decision

Use TypeScript for all new source files in the rewrite.

Define explicit types for modes, settings, player IDs, AI difficulty, powerup IDs, powerup effects, scene events, and audio events.

## Consequences

- Agent-generated implementation can rely on typed contracts.
- Settings and event payloads become easier to validate.
- Tests can target typed pure modules.
- Initial setup has slightly more scaffolding cost.

