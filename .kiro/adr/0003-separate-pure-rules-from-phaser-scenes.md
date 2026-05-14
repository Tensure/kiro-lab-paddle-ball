# ADR 0003: Separate Pure Rules From Phaser Scenes

## Status

Accepted

## Context

Many gameplay rules can be tested without a running Phaser scene: scoring, win detection, settings validation, AI target selection, brick-grid generation, and powerup eligibility.

Putting all logic inside Phaser scene methods would make tests brittle and slow.

## Decision

Keep deterministic gameplay logic in pure TypeScript modules where practical. Use Phaser scenes to orchestrate runtime behavior, rendering, physics bodies, input, audio triggers, and scene lifecycle.

## Consequences

- Unit and property-based tests can cover important gameplay invariants.
- Phaser scenes stay smaller and easier to reason about.
- Some logic needs adapters between pure data and Phaser objects.
- Architecture reviews should watch for scene methods accumulating untestable rules.

