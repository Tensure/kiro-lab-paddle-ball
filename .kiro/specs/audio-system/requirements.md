# Requirements Document

## Introduction

This spec delivers the synthesized Web Audio system for Paddle Arcade. It provides an AudioManager that subscribes to audio events on the EventBridge, plays distinct synthesized sounds for each of the 9 named audio cues, and exposes mute/volume state for React UI consumption. The system uses no external audio assets — all sounds are generated programmatically via the Web Audio API. Scenes emit audio events on the EventBridge; the AudioManager listens passively with no direct coupling to scene code.

## Glossary

- **Audio_Manager**: The singleton system in `src/game/systems/` that owns the Web Audio context, subscribes to EventBridge audio events, and plays synthesized sounds.
- **Audio_Context**: The browser-provided `AudioContext` instance used for all sound synthesis and playback.
- **Audio_Event**: A typed event emitted on the EventBridge with an `AudioEventName` value, triggering sound playback.
- **Synthesizer**: The internal component of Audio_Manager responsible for generating distinct waveforms for each audio cue using oscillators, gain nodes, and envelope shaping.
- **Mute_State**: A boolean flag indicating whether audio output is suppressed (true = muted, false = audible).
- **Volume_Level**: A numeric value in the range [0.0, 1.0] controlling the master gain of all audio output.
- **Autoplay_Policy**: The browser restriction requiring a user gesture (click, tap, or keypress) before an AudioContext can produce sound.
- **Event_Bridge**: The typed communication layer carrying events between Phaser scenes, systems, and React components.
- **Audio_State**: The combined mute and volume state exposed to React for UI rendering and control.

## Requirements

### Requirement 1: Audio Manager Initialization and Lifecycle

**User Story:** As a gameplay implementer, I want an AudioManager that initializes a Web Audio context and subscribes to EventBridge audio events, so that sound playback is available from the moment the game starts.

#### Acceptance Criteria

1. WHEN the Audio_Manager is initialized, THE Audio_Manager SHALL create a single Audio_Context instance.
2. WHEN the Audio_Manager is initialized, THE Audio_Manager SHALL subscribe to all 9 Audio_Event types on the Event_Bridge.
3. THE Audio_Manager SHALL not create multiple Audio_Context instances across repeated initializations.
4. WHEN the Audio_Manager is destroyed, THE Audio_Manager SHALL unsubscribe all handlers from the Event_Bridge.
5. WHEN the Audio_Manager is destroyed, THE Audio_Manager SHALL close the Audio_Context to release system resources.
6. THE Audio_Manager SHALL reside in `src/game/systems/` as a shared runtime system.

### Requirement 2: Synthesized Sound Generation

**User Story:** As a player, I want distinct synthesized sounds for each game event, so that I receive clear audio feedback during gameplay.

#### Acceptance Criteria

1. THE Synthesizer SHALL produce a distinct sound for each of the 9 AudioEventName cues: `audio:paddle-hit`, `audio:wall-bounce`, `audio:brick-break`, `audio:score-point`, `audio:life-loss`, `audio:powerup-pickup`, `audio:pause`, `audio:win`, `audio:loss`.
2. THE Synthesizer SHALL generate all sounds programmatically using Web Audio API oscillators, gain nodes, and envelope shaping.
3. THE Synthesizer SHALL not require any external audio assets (no WAV, MP3, OGG, or other file formats).
4. WHEN a sound is triggered, THE Synthesizer SHALL produce audio output within one animation frame of the trigger.
5. THE Synthesizer SHALL produce sounds that are short (under 1 second for gameplay cues, under 2 seconds for win/loss).
6. THE Synthesizer SHALL use distinct frequency, waveform, or envelope characteristics so that each cue is audibly distinguishable from the others.

### Requirement 3: EventBridge-Driven Playback

**User Story:** As a gameplay implementer, I want the AudioManager to play sounds automatically when audio events are emitted on the EventBridge, so that scenes do not need to import or call the audio module directly.

#### Acceptance Criteria

1. WHEN an Audio_Event is emitted on the Event_Bridge, THE Audio_Manager SHALL play the corresponding synthesized sound.
2. THE Audio_Manager SHALL subscribe to Audio_Events as a passive listener — scenes SHALL NOT import or call Audio_Manager directly.
3. WHEN multiple Audio_Events are emitted in rapid succession, THE Audio_Manager SHALL play each sound without dropping or queuing (polyphonic playback).
4. IF an Audio_Event is emitted with an unrecognized event name, THEN THE Audio_Manager SHALL ignore the event without error.
5. THE Audio_Manager SHALL not emit events back onto the Event_Bridge during playback (no feedback loops).

### Requirement 4: Mute Toggle

**User Story:** As a player, I want to mute all game audio with a single toggle, so that I can play silently when needed.

#### Acceptance Criteria

1. THE Audio_Manager SHALL expose a Mute_State that defaults to `false` (unmuted) on initialization.
2. WHEN Mute_State is set to `true`, THE Audio_Manager SHALL suppress all audio output immediately.
3. WHEN Mute_State is set to `false`, THE Audio_Manager SHALL resume producing audio output for subsequent events.
4. WHILE Mute_State is `true`, THE Audio_Manager SHALL not produce any audible output regardless of Audio_Events received.
5. THE Audio_Manager SHALL expose a method to toggle Mute_State between `true` and `false`.
6. WHEN Mute_State changes, THE Audio_Manager SHALL not interrupt or replay any currently decaying sound.

### Requirement 5: Volume Control

**User Story:** As a player, I want to adjust the game volume, so that I can set audio to a comfortable level.

#### Acceptance Criteria

1. THE Audio_Manager SHALL expose a Volume_Level that defaults to `1.0` on initialization.
2. THE Audio_Manager SHALL accept Volume_Level values in the range [0.0, 1.0] inclusive.
3. WHEN Volume_Level is set, THE Audio_Manager SHALL apply the value as a gain multiplier to all subsequent audio output.
4. IF a Volume_Level value outside [0.0, 1.0] is provided, THEN THE Audio_Manager SHALL clamp the value to the nearest bound.
5. WHEN Volume_Level is set to `0.0`, THE Audio_Manager SHALL produce no audible output (functionally equivalent to mute for playback, but Mute_State remains unchanged).
6. THE Audio_Manager SHALL apply Volume_Level changes immediately to subsequent sounds without affecting currently decaying sounds.

### Requirement 6: Browser Autoplay Policy Handling

**User Story:** As a gameplay implementer, I want the AudioManager to handle browser autoplay restrictions gracefully, so that audio works reliably across all browsers without errors.

#### Acceptance Criteria

1. WHEN the Audio_Context is in a `suspended` state due to autoplay policy, THE Audio_Manager SHALL attempt to resume the Audio_Context on the next user gesture.
2. THE Audio_Manager SHALL not throw errors or crash when the Audio_Context is suspended.
3. WHILE the Audio_Context is suspended, THE Audio_Manager SHALL silently skip sound playback without queuing missed sounds.
4. WHEN the Audio_Context transitions from `suspended` to `running`, THE Audio_Manager SHALL begin playing sounds for subsequent Audio_Events normally.
5. THE Audio_Manager SHALL register a one-time user gesture listener (click or keydown) to resume a suspended Audio_Context.
6. WHEN the Audio_Context is successfully resumed, THE Audio_Manager SHALL remove the user gesture listener to avoid unnecessary event handling.

### Requirement 7: React-Accessible Audio State

**User Story:** As a UI implementer, I want to read and set mute/volume state from React components, so that I can build audio controls in the app shell.

#### Acceptance Criteria

1. THE Audio_Manager SHALL expose a method to get the current Mute_State as a boolean.
2. THE Audio_Manager SHALL expose a method to set the Mute_State to a specific boolean value.
3. THE Audio_Manager SHALL expose a method to get the current Volume_Level as a number.
4. THE Audio_Manager SHALL expose a method to set the Volume_Level to a specific number.
5. THE Audio_State (mute and volume) SHALL be readable and settable from React components without importing Phaser.
6. WHEN Audio_State changes, THE Audio_Manager SHALL emit a state-change notification that React components can subscribe to for re-rendering.

### Requirement 8: Cleanup and Resource Management

**User Story:** As a gameplay implementer, I want the AudioManager to clean up all resources on game destroy, so that no audio contexts, listeners, or nodes leak after the game is unmounted.

#### Acceptance Criteria

1. WHEN the game is destroyed, THE Audio_Manager SHALL close the Audio_Context.
2. WHEN the game is destroyed, THE Audio_Manager SHALL unsubscribe all handlers from the Event_Bridge.
3. WHEN the game is destroyed, THE Audio_Manager SHALL remove any user gesture listeners registered for autoplay policy handling.
4. WHEN the game is destroyed, THE Audio_Manager SHALL disconnect all active audio nodes.
5. IF the Audio_Manager is initialized again after destruction, THEN THE Audio_Manager SHALL create a fresh Audio_Context and re-subscribe to the Event_Bridge.
6. THE Audio_Manager SHALL not retain references to destroyed audio nodes or closed contexts after cleanup.
