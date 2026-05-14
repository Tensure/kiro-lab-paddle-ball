# ADR-001: Web Audio API vs Phaser Sound Manager

## Status

Accepted

## Context

The audio system needs to synthesize and play short sound effects for 9 named game cues. Two primary options exist for audio playback in a Phaser + React application:

1. Use Phaser's built-in Sound Manager (`this.sound.play()`)
2. Use the Web Audio API directly via a custom AudioManager

The audio system must:
- Play synthesized sounds (no external assets)
- Be controllable from React (mute/volume)
- Subscribe to EventBridge events (decoupled from scenes)
- Handle browser autoplay policy
- Clean up on game destroy

## Options Considered

### Option A: Phaser Sound Manager

Phaser provides `this.sound.add()` and `this.sound.play()` with built-in volume, mute, and audio context management.

**Rejected because:**
- Phaser's Sound Manager is scene-scoped — accessing it from a system-level EventBridge listener requires a scene reference, creating coupling
- Phaser expects audio assets (loaded via `this.load.audio()`), not programmatically generated buffers
- Exposing mute/volume to React requires bridging through Phaser's scene graph, adding complexity
- Phaser's Sound Manager lifecycle is tied to the game instance, making it harder to control from React independently
- Using Phaser sound would require scenes to own audio playback, violating the passive-listener pattern

### Option B: Web Audio API (Direct)

Use the browser's `AudioContext` directly with oscillators, gain nodes, and envelope shaping for synthesis.

**Chosen because:**
- Full control over synthesis — oscillators, frequency sweeps, and gain envelopes are first-class
- No scene coupling — the AudioManager subscribes to EventBridge independently
- React can read/write mute and volume directly on the AudioManager without going through Phaser
- AudioContext lifecycle is independent of Phaser game lifecycle
- CSP-compatible — no external resources needed (`media-src 'self' blob:` already in CSP)
- Autoplay policy handling is straightforward with direct AudioContext access

## Decision

Use the Web Audio API directly via a custom AudioManager in `src/game/systems/`. Do not use Phaser's built-in Sound Manager.

## Consequences

### Positive
- Complete decoupling from Phaser scenes — audio is a standalone system
- React can control audio state without Phaser imports
- Full synthesis control for distinct, programmatic sound design
- Simpler testing — mock AudioContext in Node, no Phaser runtime needed
- Aligns with EventBridge-driven architecture (passive listener pattern)

### Negative
- Must implement autoplay policy handling manually (Phaser handles this internally)
- Must manage AudioContext lifecycle (create, suspend/resume, close) ourselves
- No access to Phaser's audio sprite or spatial audio features (not needed for v1)
- Slightly more code than delegating to Phaser's abstraction

### Risks and Mitigations
- **Risk:** AudioContext resource leaks if cleanup is missed → **Mitigation:** Explicit `destroy()` method with idempotent cleanup; tested in unit tests
- **Risk:** Browser compatibility edge cases with Web Audio → **Mitigation:** Web Audio API is supported in all modern browsers (Chrome, Firefox, Safari, Edge); no polyfill needed
