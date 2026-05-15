# Implementation Tasks

## Task 1: Add settings immutability guards to store

- [ ] 1.1 Change `create<AppState>((set) => ({` to `create<AppState>((set, get) => ({` in `src/app/store.ts`
- [ ] 1.2 Add phase guard to `setWinScore`: if `get().phase === 'playing'` return early without modifying state
- [ ] 1.3 Add phase guard to `setAiDifficulty`: if `get().phase === 'playing'` return early without modifying state
- [ ] 1.4 Add phase guard to `setPowerupsEnabled`: if `get().phase === 'playing'` return early without modifying state
- [ ] 1.5 Add property-based test: for any sequence of phase transitions and settings mutations, settings values are unchanged when phase is `playing`
- [ ] 1.6 Add unit test: `setWinScore` works normally when phase is `menu` or `settings`
- [ ] 1.7 Add unit test: `setWinScore` is rejected when phase is `playing`
- [ ] 1.8 Run `npm run typecheck` and `npm test` — verify all pass

## Task 2: Add overlay stacking prevention to store

- [ ] 2.1 Modify `openPauseOverlay` to return early if `get().winLossOverlayOpen` is true
- [ ] 2.2 Modify `openWinLossOverlay` to set `pauseOverlayOpen: false` in the same `set()` call
- [ ] 2.3 Add property-based test: for any sequence of overlay actions, `pauseOverlayOpen && winLossOverlayOpen` is never true
- [ ] 2.4 Add unit test: `openPauseOverlay` is rejected when win/loss overlay is open
- [ ] 2.5 Add unit test: `openWinLossOverlay` closes pause overlay if it was open
- [ ] 2.6 Run `npm run typecheck` and `npm test` — verify all pass

## Task 3: Add Escape key guard for win/loss overlay

- [ ] 3.1 In `src/components/GameView.tsx` Escape key handler, add early return if `state.winLossOverlayOpen` is true
- [ ] 3.2 Add unit test in `src/components/GameView.test.tsx`: Escape key does nothing when `winLossOverlayOpen` is true
- [ ] 3.3 Add unit test: Escape key still toggles pause when `winLossOverlayOpen` is false
- [ ] 3.4 Run `npm run typecheck` and `npm test` — verify all pass

## Task 4: Add timer cancellation on scene restart

- [ ] 4.1 In `src/game/scenes/PongScene.ts`, modify `handleRestart` to call `this.time.removeAllEvents()` before `this.scene.restart()`
- [ ] 4.2 In `src/game/scenes/BreakoutScene.ts`, modify `handleRestart` to call `this.time.removeAllEvents()` before `this.scene.restart()`
- [ ] 4.3 In `src/game/scenes/PongScene.ts`, add `this.time.removeAllEvents()` as the first line of the `shutdown` handler
- [ ] 4.4 In `src/game/scenes/BreakoutScene.ts`, add `this.time.removeAllEvents()` as the first line of the `shutdown` handler
- [ ] 4.5 Add focused test in `src/game/scenes/__tests__/lifecycle.test.ts` verifying `removeAllEvents` is called on restart
- [ ] 4.6 Run `npm run typecheck` and `npm test` — verify all pass

## Task 5: Add rapid pause/unpause stability test

- [ ] 5.1 Add property-based test in `src/app/store.test.ts`: for any sequence of `openPauseOverlay`/`closePauseOverlay` calls, `pauseOverlayOpen` matches the last action
- [ ] 5.2 Add unit test verifying `physics.pause()` and `physics.resume()` are idempotent (calling pause twice doesn't throw or corrupt state)
- [ ] 5.3 Run `npm run typecheck` and `npm test` — verify all pass

## Task 6: Manual verification across all modes

- [ ] 6.1 Pong Solo: pause during serve delay → restart → verify ball serves fresh with no double-serve
- [ ] 6.2 Pong Versus: trigger win/loss → press Escape → verify no pause overlay appears
- [ ] 6.3 Breakout: pause → return to menu → verify menu loads cleanly with no console errors
- [ ] 6.4 All modes: rapid Escape key spam → verify game pauses/unpauses without visual glitch or frozen state
- [ ] 6.5 All modes: attempt to change settings via store during `playing` phase → verify settings unchanged
- [ ] 6.6 Run full validation: `npm run typecheck && npm run lint && npm test && npm run build`
