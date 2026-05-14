# ADR-001: Zustand vs Plain React State

## Status

Accepted

## Context

The React app shell needs to manage global application state that multiple components access: selected mode, match settings, app phase, overlay visibility, and match data (scores, lives). Components at different levels of the tree need to read and write this state — mode selection sets the mode, settings panel reads it, game view reads settings to build the launch payload, overlays read match data.

The question is whether to use plain React state (useState/useReducer + context) or an external state management library.

## Options Considered

### Option A: Plain React State (useState + useContext)

- Use `useReducer` in a top-level provider for complex state
- Wrap the app in a context provider
- Components consume state via `useContext`

**Rejected because:**
- Context causes re-renders of all consumers when any part of the state changes (no selector support without `useMemo` wrappers)
- Requires boilerplate: provider component, context creation, reducer definition
- Testing requires wrapping components in providers
- As the app grows (more overlays, more match data), the single context becomes a performance concern or splits into multiple contexts with more boilerplate

### Option B: Zustand (chosen)

- Lightweight global store (~1KB)
- Selector-based subscriptions — components only re-render when their selected slice changes
- No provider wrapper needed — import the hook directly
- Actions are plain functions defined in the store
- Easy to test — call actions directly, assert state

### Option C: Jotai / Recoil / Redux

- Jotai: atom-based, good for fine-grained state but adds conceptual overhead for a simple app
- Recoil: Meta-maintained but larger, experimental status concerns
- Redux: too heavy for this use case, excessive boilerplate

**Rejected because:** All are more complex than needed for this app's state shape. The app shell has ~10 state fields and ~12 actions — a single Zustand store handles this cleanly.

## Decision

Use Zustand for global app state management. Create a single store in `src/app/store.ts` with all app shell state and actions.

## Consequences

### Positive

- Components access state with zero prop drilling and no provider wrappers
- Selector-based subscriptions prevent unnecessary re-renders
- Store is trivially testable — import, call actions, assert state
- Minimal bundle impact (~1KB gzipped)
- Well-known library with active maintenance and large community
- Simple mental model: one store, plain functions, no middleware needed for v1

### Negative

- Adds one new npm dependency (though minimal in size)
- Developers unfamiliar with Zustand need to learn its API (though it's simpler than Redux/Context patterns)
- State lives outside React's tree — React DevTools won't show it without the Zustand devtools middleware (acceptable for v1)

### Risks and Mitigations

- **Risk:** Store grows unwieldy as more specs add state. **Mitigation:** Zustand supports store slicing and multiple stores if needed in later specs.
- **Risk:** Zustand version drift. **Mitigation:** Exact version pinning per security steering. Update deliberately.
