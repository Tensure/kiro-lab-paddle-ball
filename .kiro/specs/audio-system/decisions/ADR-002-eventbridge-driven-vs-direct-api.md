# ADR-002: EventBridge-Driven vs Direct API Calls

## Status

Accepted

## Context

Scenes need to trigger audio playback during gameplay events (paddle hits, brick breaks, scoring, etc.). Two integration patterns are possible:

1. Scenes import and call the AudioManager directly (`audioManager.play('paddle-hit')`)
2. Scenes emit audio events on the EventBridge; the AudioManager subscribes and plays automatically

The choice affects coupling, testability, and extensibility.

## Options Considered

### Option A: Direct API Calls

Scenes import the AudioManager and call `play()` methods directly.

```typescript
// In PongScene
import audioManager from '../systems/AudioManager';
audioManager.play('audio:paddle-hit');
```

**Rejected because:**
- Creates a direct import dependency between every scene and the AudioManager
- Scenes cannot be tested without mocking or stubbing the AudioManager import
- Adding new audio consumers (e.g., visual feedback system that flashes on audio events) requires modifying scenes
- If audio is disabled or swapped, every scene import must be updated
- Violates the architecture steering preference for EventBridge-based communication between systems

### Option B: EventBridge-Driven (Passive Listener)

Scenes emit typed audio events on the EventBridge. The AudioManager subscribes during `init()` and plays sounds when events arrive.

```typescript
// In PongScene
eventBridge.emit('audio:paddle-hit', undefined);

// AudioManager subscribes during init — scene doesn't know about it
```

**Chosen because:**
- Zero coupling between scenes and audio — scenes only know about EventBridge and event names
- Scenes are testable without any audio mocking
- Multiple systems can subscribe to the same audio events (visual feedback, analytics, etc.)
- Audio can be disabled by simply not initializing the AudioManager — no scene changes needed
- Aligns with the existing EventBridge pattern established in `react-phaser-foundation`
- Consistent with the architecture steering: "Prefer a small event bridge with explicit event names"

## Decision

Use the EventBridge-driven pattern. Scenes emit audio events; the AudioManager subscribes passively. Scenes never import or reference the AudioManager.

## Consequences

### Positive
- Complete decoupling — scenes and audio are independently testable and deployable
- Extensible — new subscribers can react to audio events without modifying emitters
- Consistent with project architecture (EventBridge is the standard communication channel)
- Audio can be toggled off at the system level without touching scene code
- Enables future features like visual beat indicators or audio-reactive effects

### Negative
- Slightly less discoverable — a developer reading scene code sees `emit('audio:paddle-hit')` but must know the AudioManager exists to understand what happens
- No compile-time guarantee that an emitted audio event has a subscriber (fire-and-forget by design)
- Small indirection cost — event dispatch through the bridge vs direct function call (negligible for audio timing)

### Risks and Mitigations
- **Risk:** Audio events emitted but no AudioManager initialized (silent failure) → **Mitigation:** This is acceptable behavior — audio is optional. The game works without sound.
- **Risk:** Event name typos cause silent failures → **Mitigation:** TypeScript's `EventMap` type enforces valid event names at compile time. A typo is a type error.
- **Risk:** EventBridge becomes a bottleneck with many subscribers → **Mitigation:** The bridge is a simple Map of Sets with O(1) lookup. 9 audio events with 1 subscriber each is trivial.
