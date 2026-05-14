# Implementation Plan: Audio System

## Overview

Implement the synthesized Web Audio system that subscribes to EventBridge audio events and plays distinct programmatic sounds for all 9 named cues. The system exposes mute/volume state for React UI consumption, handles browser autoplay policy, and cleans up on game destroy. No external audio assets are used.

## Tasks

- [x] 1. Extend EventMap with audio events
  - [x] 1.1 Add audio event entries to `src/game/types/events.ts`
    - Add all 9 `audio:*` events with `undefined` payload type
    - Add `audio:state-change` event with `{ muted: boolean; volume: number }` payload
    - Preserve all existing events unchanged
    - _Requirements: 3.1, 7.6_

- [x] 2. Implement AudioManager core
  - [x] 2.1 Create `src/game/systems/AudioManager.ts` with initialization and lifecycle
    - Export `AudioState` interface and `IAudioManager` interface
    - Implement singleton AudioManager class
    - `init()`: create AudioContext, create master GainNode, subscribe to all 9 audio events on EventBridge
    - `destroy()`: unsubscribe all handlers, close AudioContext, remove autoplay listeners, null out references
    - Guard against double-init (reuse existing context) and double-destroy (idempotent)
    - Export default singleton instance
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 2.2 Implement mute toggle in AudioManager
    - `isMuted()`: return current mute state
    - `setMuted(muted)`: set mute state, apply to master gain (0 when muted, volume when unmuted)
    - `toggleMute()`: flip mute state
    - Default mute state: `false`
    - Emit `audio:state-change` on EventBridge when mute changes
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 7.1, 7.2, 7.5, 7.6_

  - [x] 2.3 Implement volume control in AudioManager
    - `getVolume()`: return current volume level
    - `setVolume(volume)`: clamp to [0.0, 1.0], apply to master gain (unless muted)
    - Handle NaN → 0.0, Infinity → 1.0, -Infinity → 0.0
    - Default volume: `1.0`
    - Emit `audio:state-change` on EventBridge when volume changes
    - `getState()`: return `{ muted, volume }` snapshot
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.3, 7.4, 7.5, 7.6_

  - [x] 2.4 Implement autoplay policy handling in AudioManager
    - Check `audioContext.state` after creation
    - If `suspended`: register one-time `click` and `keydown` listeners on `document` to call `audioContext.resume()`
    - Remove listeners after successful resume or on destroy
    - While suspended: silently skip playback (no queue, no error)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 3. Implement synthesis engine
  - [x] 3.1 Create `src/game/systems/audio/SynthEngine.ts` with synthesis functions
    - Export `SynthFunction` type: `(ctx: AudioContext, destination: AudioNode, time: number) => void`
    - Implement synthesis function for `audio:paddle-hit` (square wave, 220→440Hz sweep, ~80ms)
    - Implement synthesis function for `audio:wall-bounce` (triangle wave, 330Hz, ~60ms)
    - Implement synthesis function for `audio:brick-break` (sawtooth, 440→110Hz sweep down, ~120ms)
    - Implement synthesis function for `audio:score-point` (sine, 523→784Hz sweep up, ~200ms)
    - Implement synthesis function for `audio:life-loss` (sawtooth, 200→80Hz sweep down, ~400ms)
    - Implement synthesis function for `audio:powerup-pickup` (sine arpeggio 660→880→1100Hz, ~300ms)
    - Implement synthesis function for `audio:pause` (sine, 440Hz, ~150ms)
    - Implement synthesis function for `audio:win` (sine arpeggio C5→E5→G5→C6, ~800ms)
    - Implement synthesis function for `audio:loss` (sawtooth, 200→100→50Hz descending, ~600ms)
    - Export `getSynthFunctions()` returning a `Record<AudioEventName, SynthFunction>`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 3.2 Wire synthesis engine into AudioManager playback
    - Import `getSynthFunctions()` in AudioManager
    - On audio event received: look up synth function, call with AudioContext, master gain node, and currentTime
    - Skip playback if muted, context is suspended, or manager is not initialized
    - Each call creates independent nodes (polyphonic — no shared state between sounds)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.4_

- [x] 4. Write unit tests
  - [x] 4.1 Create `src/game/systems/__tests__/AudioManager.test.ts` with state and lifecycle tests
    - Test: init creates AudioContext (mock)
    - Test: init subscribes to all 9 audio events on EventBridge
    - Test: destroy unsubscribes all handlers from EventBridge
    - Test: destroy closes AudioContext
    - Test: double-init does not create second context
    - Test: double-destroy is idempotent
    - Test: re-init after destroy creates fresh context
    - Test: isMuted() defaults to false
    - Test: getVolume() defaults to 1.0
    - Test: setMuted(true) sets gain to 0
    - Test: setMuted(false) restores gain to volume level
    - Test: toggleMute flips state
    - Test: setVolume clamps values to [0, 1]
    - Test: setVolume(NaN) clamps to 0
    - Test: state change emits audio:state-change event
    - Test: autoplay — suspended context registers resume listeners
    - Test: autoplay — resume called on simulated user gesture
    - Test: autoplay — listeners removed after resume
    - Test: destroy removes autoplay listeners
    - _Requirements: 1.1–1.5, 4.1–4.6, 5.1–5.6, 6.1–6.6, 7.1–7.6, 8.1–8.6_

  - [x] 4.2 Create `src/game/systems/__tests__/AudioManager.integration.test.ts` with EventBridge integration tests
    - Test: emit audio:paddle-hit → synth function called with correct context and destination
    - Test: emit audio event while muted → no synth function called
    - Test: emit audio event while context suspended → no synth function called
    - Test: emit multiple events rapidly → each triggers independent synth call
    - Test: emit unrecognized event → no error, no synth call
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.4_

  - [x] 4.3 Create `src/game/systems/audio/__tests__/SynthEngine.test.ts` with synthesis tests
    - Test: getSynthFunctions returns a function for each of the 9 AudioEventName values
    - Test: each synth function calls createOscillator or createGain on the provided context
    - Test: each synth function connects nodes to the provided destination
    - Test: each synth function schedules start and stop times
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [x] 5. Validation and cleanup
  - [x] 5.1 Run all validation commands
    - `npm run typecheck` passes with no errors
    - `npm run lint` passes with no errors or warnings
    - `npm test` passes with all new tests green
    - `npm run build` produces output without errors
    - _Delivery Standards: Definition of Done_

  - [x] 5.2 Verify no regressions in existing tests
    - All existing tests from `react-phaser-foundation` and `shared-types-and-rules` continue to pass
    - EventBridge tests still pass with extended EventMap
    - _Delivery Standards: Definition of Done_

## Notes

- All tests use a mocked AudioContext since Web Audio API is not available in Node/Vitest environment
- The real EventBridge is used in integration tests (it's pure TypeScript)
- No property-based tests needed — audio is imperative, not invariant-based
- Sound design values (frequencies, durations) are starting points; can be tuned during gameplay testing
- The `audio:state-change` event enables React components to re-render when mute/volume changes without polling
- This spec depends on `react-phaser-foundation` (EventBridge) and `shared-types-and-rules` (AudioEventName type, EventMap)
