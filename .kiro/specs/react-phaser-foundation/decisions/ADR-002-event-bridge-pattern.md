# ADR-002: Event Bridge Pattern

## Status

Accepted

## Context

React and Phaser operate in different paradigms: React is declarative and state-driven; Phaser is imperative and frame-loop-driven. They need a communication channel that:

- Carries typed payloads bidirectionally (Phaser → React and React → Phaser)
- Enforces compile-time type safety on event names and payloads
- Is extensible — future specs will add many event types
- Does not couple React state management to Phaser internals
- Is testable in isolation without a running Phaser game or React DOM

## Options Considered

### Custom Typed EventEmitter (chosen)

- Thin wrapper around a `Map<string, Set<Function>>` with TypeScript generics
- Single `EventMap` type defines all valid events and their payload shapes
- `emit<K>`, `on<K>`, `off<K>` methods enforce type safety via mapped types
- Zero dependencies, ~30 lines of implementation
- Fully testable as a pure module
- Singleton export for simplicity in v1

### Phaser's Built-in Event System (`Phaser.Events.EventEmitter`)

- Already available since Phaser is a dependency
- Supports `emit`, `on`, `off`, `once`
- No TypeScript generics for payload types — events are `string` + `...args: any[]`
- Tied to Phaser's lifecycle — if the game is destroyed, the emitter goes with it
- Testing requires Phaser to be importable (large dependency in test context)
- **Rejected:** No compile-time type safety on payloads. Lifecycle coupling means React can't listen for events after game destruction. Testing overhead.

### Third-Party Event Library (mitt, eventemitter3, nanoevents)

- `mitt`: ~200 bytes, typed, popular — closest to what we'd build ourselves
- `eventemitter3`: fast, but untyped by default
- `nanoevents`: tiny, typed, good API
- All add an external dependency for minimal functionality
- **Rejected:** The implementation is trivial (~30 lines). Adding a dependency for this introduces supply-chain surface area without meaningful benefit. If the bridge grows complex enough to warrant a library, we can adopt one later.

### React Context + Callbacks

- Pass event handlers down via React context
- Phaser scenes would need a reference to React's context (breaks ownership boundary)
- Tightly couples Phaser to React's component tree
- Not bidirectional without additional plumbing
- **Rejected:** Violates the ownership boundary. Phaser should not depend on React's component hierarchy.

### Redux / Zustand Shared Store

- Both sides read/write to a shared state store
- Overkill for event-based communication
- Introduces state synchronization complexity
- Events are ephemeral; stores are for persistent state
- **Rejected:** Wrong abstraction. Events are fire-and-forget signals, not persistent state. A store would add unnecessary complexity and blur the boundary between events and state.

## Decision

Implement a custom typed EventEmitter as a singleton module. Define all event names and payload types in a single `EventMap` type. Both React and Phaser import and use the same bridge instance.

## Consequences

**Positive outcomes:**
- Full compile-time type safety — adding a new event requires only a type addition
- Zero external dependencies for the bridge itself
- Testable in pure unit tests without DOM or Phaser
- Clear, minimal API surface (`emit`, `on`, `off`, `removeAllListeners`)
- Decoupled from both React and Phaser lifecycles
- Easy to understand and debug

**Negative tradeoffs:**
- No built-in features like event history, replay, or middleware (not needed for v1)
- Singleton pattern means no per-instance isolation (acceptable for a single-game app)
- Manual implementation means we own any bugs (mitigated: property-based test covers correctness)

**Risks:**
- If event volume grows very large, the simple Set-based dispatch may need optimization (mitigated: arcade games have low event frequency; revisit if profiling shows issues)
- If multiple Phaser game instances are ever needed, the singleton would need to become instance-scoped (mitigated: product direction specifies one unified game)
