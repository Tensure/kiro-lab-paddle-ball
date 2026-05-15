# Implementation Tasks — breakout-core

## Task 1: Create BreakoutScene class with initialization and physics world

- [x] 1.1 Create `src/game/scenes/BreakoutScene.ts` with scene key `BreakoutScene`
- [x] 1.2 Implement `init(data)` to read SceneLaunchPayload from SceneLauncher (primary) and init data (fallback), extract settings, set initial match state
- [x] 1.3 Implement `create()` to build walls (top/left/right static bodies), paddle (immovable dynamic body), and ball (dynamic body with bounce 1, no gravity, maxSpeed set)
- [x] 1.4 Draw game objects programmatically (white rectangle for paddle, white circle for ball, dark gray rectangles for walls, dark background)
- [x] 1.5 Position paddle centered horizontally near bottom, position ball on top of paddle

**Requirements:** 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
**Files:** `src/game/scenes/BreakoutScene.ts`

## Task 2: Implement brick grid creation

- [x] 2.1 Call `generateBrickGrid` in `create()` with config matching play area dimensions (accounting for wall thickness)
- [x] 2.2 Create a `Phaser.Physics.Arcade.StaticGroup` and add a colored rectangle for each BrickDescriptor
- [x] 2.3 Apply row-based color gradient to bricks (red → orange → yellow → green → cyan)
- [x] 2.4 Initialize `breakoutState` using `createInitialState(totalBricks)` after grid generation

**Requirements:** 2.1, 2.2, 2.3, 2.4, 1.6
**Files:** `src/game/scenes/BreakoutScene.ts`

## Task 3: Implement paddle input and movement

- [x] 3.1 Register window keyboard listeners for ArrowLeft, ArrowRight, A, D in `create()`
- [x] 3.2 Implement `update()` to read key state and set paddle horizontal velocity using `setVelocityX`
- [x] 3.3 Clamp paddle X position to stay within left and right walls (set position and zero velocity at boundary)
- [x] 3.4 Stop paddle movement when no key is held

**Requirements:** 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
**Files:** `src/game/scenes/BreakoutScene.ts`

## Task 4: Implement ball physics and collisions

- [x] 4.1 Configure ball with no gravity, bounce factor 1, circle body, world bounds collision disabled, maxSpeed set
- [x] 4.2 Add Arcade Physics colliders: ball ↔ top wall, ball ↔ left wall, ball ↔ right wall, ball ↔ paddle, ball ↔ bricks
- [x] 4.3 Implement paddle collision callback: emit `audio:paddle-hit`, apply angle variation based on hit offset, optionally increase speed
- [x] 4.4 Implement wall collision callback: emit `audio:wall-bounce`
- [x] 4.5 Implement ball exit detection in `update()`: check ball Y against bottom edge

**Requirements:** 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.5
**Files:** `src/game/scenes/BreakoutScene.ts`

## Task 5: Implement brick destruction and scoring

- [x] 5.1 Implement brick collision callback: destroy brick, call `breakBrick(state, POINTS_PER_BRICK)`
- [x] 5.2 Emit `score:update` with `{ left: state.score, right: 0 }` after brick destruction
- [x] 5.3 Emit `audio:brick-break` after brick destruction
- [x] 5.4 After brick destruction, call `getMatchStatus` — if `'win'`, trigger win flow

**Requirements:** 6.1, 6.2, 6.3, 6.4, 8.1, 8.2, 8.3, 8.4
**Files:** `src/game/scenes/BreakoutScene.ts`

## Task 6: Implement life management and ball reset

- [x] 6.1 On ball exit bottom, immediately reposition ball on top of paddle (paddle.x, PADDLE_Y - offset)
- [x] 6.2 Stop ball velocity, call `loseLife(breakoutState)`, reset currentSpeed to BASE_SPEED
- [x] 6.3 Emit `lives:update` with `{ remaining: state.lives }` and `audio:life-loss`
- [x] 6.4 Call `getMatchStatus` — if `'loss'`, trigger loss flow; if `'in-progress'`, schedule serve after SERVE_DELAY_MS

**Requirements:** 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.5, 8.6, 8.7, 8.8
**Files:** `src/game/scenes/BreakoutScene.ts`

## Task 7: Implement serve mechanics

- [x] 7.1 Implement `serve()` method: position ball on top of paddle, set velocity upward with random horizontal angle, scale to BASE_SPEED
- [x] 7.2 Schedule first serve in `create()` after SERVE_DELAY_MS, guarded by `!matchOver && !paused`
- [x] 7.3 After life loss (non-loss), schedule serve after SERVE_DELAY_MS with same guard

**Requirements:** 7.5, 5.3, 4.4
**Files:** `src/game/scenes/BreakoutScene.ts`

## Task 8: Implement win and loss flows

- [x] 8.1 Implement win flow: set matchOver, stop ball, emit `match:win` with `{ winner: 'solo' }`, emit `audio:win`
- [x] 8.2 Implement loss flow: set matchOver, stop ball, emit `match:loss` with `{ finalScore: state.score }`, emit `audio:loss`

**Requirements:** 8.2, 8.3, 8.4, 8.6, 8.7, 8.8
**Files:** `src/game/scenes/BreakoutScene.ts`

## Task 9: Implement pause/resume and scene restart

- [x] 9.1 Subscribe to `match:pause` on EventBridge in `create()`, implement handler to freeze/resume physics and emit `audio:pause`
- [x] 9.2 Subscribe to `scene:restart` on EventBridge in `create()`, implement handler to call `this.scene.restart()`
- [x] 9.3 Guard `update()` to skip processing when paused or matchOver

**Requirements:** 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3
**Files:** `src/game/scenes/BreakoutScene.ts`

## Task 10: Implement scene lifecycle cleanup

- [x] 10.1 Implement `shutdown()` to unsubscribe all EventBridge listeners (`match:pause`, `scene:restart`)
- [x] 10.2 Remove window keyboard listeners in `shutdown()`
- [x] 10.3 Register shutdown event listener in `create()` via `this.events.on('shutdown', this.shutdown, this)`

**Requirements:** 3.6, 10.1, 10.2
**Files:** `src/game/scenes/BreakoutScene.ts`

## Task 11: Update GameView to support BreakoutScene

- [x] 11.1 Import `BreakoutScene` in `src/components/GameView.tsx`
- [x] 11.2 Update `postBoot` callback to select scene based on `payload.settings.mode`: add `BreakoutScene` when mode is `'breakout'`, otherwise add `PongScene`
- [x] 11.3 Verify existing `lives:update` and `match:loss` EventBridge subscriptions handle Breakout events correctly (no changes expected)

**Requirements:** 12.1, 12.2, 12.3, 12.4
**Files:** `src/components/GameView.tsx`

## Task 12: Verify property-based tests cover breakout-core brick grid invariants

- [ ] 12.1 Verify existing property tests in `src/game/rules/brick-grid.test.ts` cover: grid fits within bounds, no overlaps, count equals rows × columns (these already exist from shared-types-and-rules spec)
- [ ] 12.2 Add breakout-specific property test: for the exact BREAKOUT scene config (5 rows, 10 columns, 800px width minus walls), all bricks fit and have positive dimensions (fast-check)
- [ ] 12.3 Verify existing `src/game/rules/life-rules.test.ts` covers life transitions and match status detection

**Requirements:** 2.3
**Files:** `src/game/rules/brick-grid.test.ts`, `src/game/rules/life-rules.test.ts`
**Tags:**
- `Feature: breakout-core, Property 1: breakout scene brick config produces valid grid for any padding/offset variation`

**Note:** Properties 1-3 from the design (grid bounds, no overlap, correct count) are already tested under `Feature: shared-types-and-rules` tags. Task 12.2 adds a breakout-specific config validation.

## Task 13: Validation and integration verification

- [x] 13.1 Run `npm run typecheck` — verify no type errors
- [ ] 13.2 Run `npm run lint` — verify no lint errors or warnings
- [x] 13.3 Run `npm test` — verify all tests pass (including property-based tests)
- [x] 13.4 Run `npm run build` — verify production build succeeds
- [ ] 13.5 Manual verification: launch Breakout from mode selection, play a full match to win (clear all bricks), verify scoring, lives, audio, pause, and win overlay
- [ ] 13.6 Manual verification: play a match to loss (lose all 3 lives), verify loss overlay shows final score
- [ ] 13.7 Manual verification: verify restart from win/loss overlay works correctly (fresh grid, reset lives/score)

**Requirements:** All
**Files:** N/A (validation step)
