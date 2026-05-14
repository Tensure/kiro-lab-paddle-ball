---
inclusion: fileMatch
fileMatchPattern: ["src/app/store*", "src/**/*.tsx"]
---

# Zustand State Management

Use Zustand for global React app state. The store lives in `src/app/store.ts`.

## Store Design

- One store for the app shell. Do not create multiple stores unless a later spec explicitly requires it.
- Define state and actions in a single `create()` call.
- Use TypeScript interfaces for the store shape — export `AppState` for test consumption.
- Keep state flat where possible. Nest only when grouping makes semantic sense (e.g., `matchData`).
- Mark state fields that should not change mid-match as conceptually immutable (enforce via actions, not `readonly` on the store itself since Zustand mutates internally).

## Selectors

- Always use selectors in components: `useAppStore((s) => s.phase)` not `useAppStore()`.
- Selectors prevent unnecessary re-renders — only the selected slice triggers updates.
- For multiple fields, use shallow equality: `useAppStore((s) => ({ phase: s.phase, mode: s.selectedMode }), shallow)`.
- Import `shallow` from `zustand/shallow` when selecting multiple fields.

## Actions

- Define actions inside the store's `create()` call using `set` and `get`.
- Actions are plain functions — no async, no middleware for v1.
- Actions that reset state should explicitly set all affected fields (don't rely on spread from initial state object unless you define one).
- Validate inputs in actions where appropriate (e.g., clamp win score via `validateWinScore`).

## Testing

- Test the store by importing it directly and calling actions.
- Use `useAppStore.setState()` to set up test preconditions.
- Call `useAppStore.getState()` to assert results.
- Reset store between tests: `useAppStore.setState(initialState)` or re-create.
- Property-based tests can generate random action sequences to verify state invariants.

## What NOT to Put in the Store

- Phaser game instance or scene references (those live in refs inside PhaserContainer).
- AudioContext or Web Audio nodes (AudioManager owns those).
- Transient UI state that only one component uses (use local `useState` instead).
- EventBridge subscriptions (managed in `useEffect` cleanup, not store state).

## Integration with EventBridge

- The store does NOT subscribe to EventBridge directly.
- React components subscribe to EventBridge in `useEffect` and call store actions to update state.
- This keeps the store pure and testable without EventBridge mocking.
