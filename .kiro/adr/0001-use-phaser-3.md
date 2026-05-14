# ADR 0001: Use Phaser 3 For Real-Time Gameplay

## Status

Accepted

## Context

The product needs Pong-style and Breakout-style gameplay with collision, physics, sound, particles, scene lifecycle, and keyboard input.

React is a strong fit for menus, settings, overlays, and application state, but it should not own the real-time frame loop.

## Decision

Use Phaser 3 for active gameplay. Embed Phaser inside a React TypeScript app.

React owns app shell concerns. Phaser owns gameplay scenes, physics, rendering, input during active matches, particles, tweens, and audio triggers.

## Consequences

- Gameplay can use mature arcade-game primitives instead of hand-rolled canvas loops.
- React remains focused on UI and app flow.
- Tests should avoid brittle Phaser internals and focus on pure rules where practical.
- The codebase needs a clear event boundary between React and Phaser.

