# Implementation Plan: React + Phaser Foundation

## Overview

This plan scaffolds the Vite + React + TypeScript + Phaser 3 project from scratch. Tasks are ordered by dependency: toolchain first, then folder structure, then core modules (EventBridge, PhaserContainer, PlaceholderScene), then tests, then documentation. Each task builds on the previous so there is no orphaned code.

## Tasks

- [x] 1. Initialize Vite project with React and TypeScript
  - Run `npm create vite@latest . -- --template react-ts` (or equivalent manual setup)
  - Install dependencies with exact versions: `react@19.2.0`, `react-dom@19.2.0`, `phaser@3.90.0`
  - Install dev dependencies: `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`
  - Configure `vite.config.ts` with React plugin
  - Add CSP meta tag to `index.html` per security steering (default-src 'self', style-src 'self' 'unsafe-inline', img-src 'self' data: blob:, media-src 'self' blob:)
  - Ensure `package-lock.json` is committed
  - Verify `npm run dev` starts without errors
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [x] 2. Configure TypeScript strict mode
  - [ ] 2.1 Update `tsconfig.json` with strict mode settings
    - Enable `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, `strictFunctionTypes: true`
    - Configure path resolution and module settings for Vite compatibility
    - Add `tsconfig.node.json` for Vite/Node config files
    - _Requirements: 1.2_

  - [ ] 2.2 Add `typecheck` script to `package.json`
    - Add `"typecheck": "tsc --noEmit"` to scripts
    - Verify `npm run typecheck` passes with zero errors
    - _Requirements: 5.2_

- [ ] 3. Create canonical folder structure
  - Create `src/app/` with `App.tsx` placeholder
  - Create `src/components/` (empty, will hold PhaserContainer)
  - Create `src/game/` with `config.ts` placeholder
  - Create `src/game/scenes/` (empty, will hold PlaceholderScene)
  - Create `src/game/systems/` (empty, will hold EventBridge)
  - Create `src/game/rules/` (empty for this spec)
  - Create `src/game/types/` with `events.ts` placeholder
  - Ensure `src/main.tsx` renders `App`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [ ] 4. Configure ESLint for TypeScript and React
  - Install ESLint dependencies: `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
  - Create `eslint.config.js` with flat config format
  - Enable TypeScript-aware rules (unused variables, missing return types on exports)
  - Enable React hooks rules
  - Add `"lint": "eslint src/"` script to `package.json`
  - Verify `npm run lint` passes with zero errors/warnings on the scaffold
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 5.3_

- [ ] 5. Configure Vitest and fast-check
  - Install dev dependencies: `vitest`, `fast-check`, `happy-dom`, `@testing-library/react`, `@testing-library/jest-dom`
  - Configure Vitest in `vite.config.ts` (or separate `vitest.config.ts`) with `happy-dom` environment
  - Set test file pattern to `src/**/*.test.{ts,tsx}`
  - Add `"test": "vitest run"` script to `package.json`
  - Add a trivial passing test to verify the runner works
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 5.4_

- [ ] 6. Checkpoint — Toolchain verification
  - Ensure `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` all pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement EventBridge
  - [ ] 7.1 Define event type registry
    - Create `src/game/types/events.ts` with `EventMap` type containing `'placeholder:ping': { timestamp: number }`
    - Export the `EventMap` type for use by the bridge and consumers
    - _Requirements: 4.1, 4.4_

  - [ ] 7.2 Implement EventBridge class
    - Create `src/game/systems/EventBridge.ts`
    - Implement typed `emit<K>`, `on<K>`, `off<K>`, `removeAllListeners` methods
    - Use `Map<string, Set<Function>>` internally with TypeScript generics for type safety
    - Export a singleton instance
    - Ensure `emit` with no listeners is a no-op (no error thrown)
    - Ensure `off` with an unregistered handler is a no-op (no error thrown)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 8. Implement PhaserContainer React component
  - Create `src/components/PhaserContainer.tsx`
  - Accept optional `config` prop for Phaser game config overrides
  - Use `useRef` for the DOM container element and the game instance
  - Use `useEffect` with empty deps to create `Phaser.Game` on mount
  - Implement ref guard to prevent double-instantiation on React 19 strict mode double-effect invocations
  - Call `game.destroy(true)` in the `useEffect` cleanup function
  - Render a `<div>` with the ref as the Phaser parent
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 9. Implement PlaceholderScene and wire integration
  - [ ] 9.1 Create PlaceholderScene
    - Create `src/game/scenes/PlaceholderScene.ts` extending `Phaser.Scene`
    - In `create()`, emit `'placeholder:ping'` with `{ timestamp: Date.now() }` via EventBridge
    - _Requirements: 3.4, 4.5_

  - [ ] 9.2 Create Phaser game configuration
    - Create `src/game/config.ts` with default game config
    - Set `type: Phaser.AUTO`, `width: 800`, `height: 600`
    - Configure Arcade Physics as default physics engine
    - Register `PlaceholderScene` in the scene array
    - _Requirements: 3.5_

  - [ ] 9.3 Wire App shell together
    - Update `src/app/App.tsx` to render `PhaserContainer` with the game config
    - Update `src/main.tsx` to render `App` into the DOM root
    - Verify `npm run dev` shows the Phaser canvas without console errors
    - _Requirements: 3.1, 3.4, 4.5, 4.6_

- [ ] 10. Checkpoint — Integration verification
  - Ensure `npm run typecheck`, `npm run lint`, and `npm run build` all pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Write tests
  - [ ] 11.1 Write EventBridge unit tests
    - Create `src/game/systems/EventBridge.test.ts`
    - Test: `on` registers a listener and `emit` delivers the payload
    - Test: `off` removes a listener so it no longer receives events
    - Test: `removeAllListeners` clears all subscriptions
    - Test: `emit` with no listeners does not throw
    - Test: `off` with unregistered handler does not throw
    - Test: multiple listeners receive the same event
    - _Requirements: 4.2, 4.3_

  - [ ]* 11.2 Write property-based test for EventBridge round-trip
    - Create property test in `src/game/systems/EventBridge.test.ts`
    - **Property 1: Event Bridge payload round-trip preservation**
    - Use `fast-check` to generate arbitrary `{ timestamp: number }` payloads
    - Emit via `EventBridge.emit('placeholder:ping', payload)`
    - Capture in listener registered via `EventBridge.on`
    - Assert deep equality between emitted and received payload
    - Include edge cases: `0`, `Number.MAX_SAFE_INTEGER`, negative values, `NaN`, `Infinity`
    - Minimum 100 iterations
    - **Validates: Requirements 4.2, 4.3, 4.7**

  - [ ]* 11.3 Write PhaserContainer lifecycle tests
    - Create `src/components/PhaserContainer.test.tsx`
    - Mock `Phaser.Game` to verify lifecycle contract without real canvas
    - Test: mounting creates exactly one `Phaser.Game` instance
    - Test: unmounting calls `game.destroy(true)`
    - Test: re-render does not create a second game instance
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 12. Create README documentation
  - Create `README.md` at the repository root
  - Document dependency installation (`npm install`)
  - Document how to start the dev server (`npm run dev`)
  - Document all validation commands: `npm run build`, `npm run typecheck`, `npm run lint`, `npm test`
  - Describe the folder structure and purpose of each top-level source directory
  - Describe the React ↔ Phaser integration pattern at a high level
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 13. Final checkpoint — All validation commands pass
  - Run `npm run typecheck` — zero type errors
  - Run `npm run lint` — zero lint errors or warnings
  - Run `npm test` — all tests pass, zero failures
  - Run `npm run build` — produces `dist/` directory without errors
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation of the toolchain
- The property-based test (11.2) validates the key correctness property from the design
- Unit tests (11.1) validate specific examples and edge cases for the EventBridge
- PhaserContainer tests (11.3) verify the lifecycle contract without requiring a real Phaser canvas
- No gameplay logic is included — this spec only proves the scaffold works end-to-end
