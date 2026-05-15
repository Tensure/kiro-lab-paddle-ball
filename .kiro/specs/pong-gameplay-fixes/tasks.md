# Tasks — Pong Gameplay Fixes

## Task 1: Add `scene:restart` event to EventMap

- [ ] 1.1 Add `'scene:restart': undefined` entry to the `EventMap` type in `src/game/types/events.ts`
- [ ] 1.2 Verify TypeScript compiles with `npm run typecheck`

## Task 2: Create SceneLauncher module

- [ ] 2.1 Create `src/game/systems/SceneLauncher.ts` with module-level `currentPayload` variable
- [ ] 2.2 Export `setLaunchPayload(payload: SceneLaunchPayload): void` that stores the payload
- [ ] 2.3 Export `getLaunchPayload(): SceneLaunchPayload | null` that retrieves the stored payload
- [ ] 2.4 Export `clearLaunchPayload(): void` that sets the variable to null
- [ ] 2.5 Write unit tests in `src/game/systems/__tests__/SceneLauncher.test.ts` verifying set/get/clear behavior

## Task 3: Update GameView to use SceneLauncher

- [ ] 3.1 Import `setLaunchPayload` from `../game/systems/SceneLauncher` in `src/components/GameView.tsx`
- [ ] 3.2 Call `setLaunchPayload(payload)` before creating the `new Phaser.Game(...)` instance
- [ ] 3.3 Verify existing GameView tests still pass

## Task 4: Update PongScene.init() to read from SceneLauncher

- [ ] 4.1 Import `getLaunchPayload` from `../systems/SceneLauncher` in `src/game/scenes/PongScene.ts`
- [ ] 4.2 At the top of `init()`, if `data` is undefined or `data.settings` is undefined, read from `getLaunchPayload()`
- [ ] 4.3 Add defensive guard: if `winScore` is 0, NaN, or undefined after both sources, default to 7
- [ ] 4.4 Remove the dummy key fallback in `create()` — replace with an assertion that `this.input.keyboard` is non-null (throw descriptive error if null)
- [ ] 4.5 Verify TypeScript compiles with `npm run typecheck`

## Task 5: Update PongScene to subscribe to `scene:restart` event

- [ ] 5.1 In `create()`, subscribe to `'scene:restart'` on EventBridge with a `handleRestart` handler
- [ ] 5.2 Implement `handleRestart` as an arrow property that calls `this.scene.restart()` (which re-runs init+create with fresh state)
- [ ] 5.3 In `shutdown()`, unsubscribe from `'scene:restart'` to prevent listener leaks
- [ ] 5.4 Verify that `scene.restart()` triggers `init()` which reads from SceneLauncher (same payload persists in module variable)

## Task 6: Update PauseOverlay and WinLossOverlay to emit `scene:restart`

- [ ] 6.1 In `src/components/PauseOverlay.tsx`, update `handleRestart` to emit `eventBridge.emit('scene:restart')` after calling `resetMatchData()` and `closePauseOverlay()`
- [ ] 6.2 In `src/components/WinLossOverlay.tsx`, import `eventBridge` and update `handleRestart` to emit `eventBridge.emit('scene:restart')` after calling `resetMatchData()` and `closeWinLossOverlay()`
- [ ] 6.3 Update PauseOverlay tests to verify `scene:restart` is emitted on restart click
- [ ] 6.4 Update WinLossOverlay tests to verify `scene:restart` is emitted on restart click

## Task 7: Harden ball physics

- [ ] 7.1 In PongScene `create()`, add `this.ball.body.setMaxSpeed(PONG.MAX_SPEED)` after ball body setup to prevent tunneling at high velocities
- [ ] 7.2 Verify ball body circle size matches visual radius (already `setCircle(PONG.BALL_RADIUS)` — confirm no offset)
- [ ] 7.3 Verify `computeSpeedAfterHit` respects MAX_SPEED cap (existing test in `ball-speed.test.ts`)

## Task 8: Run all validation commands

- [ ] 8.1 Run `npm run typecheck` — zero errors
- [ ] 8.2 Run `npm run lint` — zero errors and zero warnings
- [ ] 8.3 Run `npm test` — all tests pass
- [ ] 8.4 Run `npm run build` — successful production build
