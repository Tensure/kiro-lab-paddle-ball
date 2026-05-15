# Implementation Tasks — pong-core

## Task 1: Create pure paddle-physics helper module

- [x] 1.1 Create `src/game/rules/paddle-physics.ts` with `clampPaddleY` and `computePaddleY` functions
- [x] 1.2 Create `src/game/rules/paddle-physics.test.ts` with unit tests for clamping and movement
- [x] 1.3 Add property-based test: paddle Y stays within bounds for any input sequence (fast-check)

**Requirements:** 2.3, 2.5
**Files:** `src/game/rules/paddle-physics.ts`, `src/game/rules/paddle-physics.test.ts`

## Task 2: Create pure ball-speed helper module

- [x] 2.1 Create `src/game/rules/ball-speed.ts` with `computeSpeedAfterHit` and `getServeSpeed` functions
- [x] 2.2 Create `src/game/rules/ball-speed.test.ts` with unit tests for speed computation and capping
- [x] 2.3 Add property-based test: ball speed stays within [baseSpeed, maxSpeed] for any hit sequence (fast-check)
- [x] 2.4 Add property-based test: ball speed never decreases on paddle hit (fast-check)

**Requirements:** 4.1, 4.2, 4.3, 4.4
**Files:** `src/game/rules/ball-speed.ts`, `src/game/rules/ball-speed.test.ts`

## Task 3: Create PongScene class with initialization and physics world

- [x] 3.1 Create `src/game/scenes/PongScene.ts` with scene key `PongScene`
- [x] 3.2 Implement `init(data)` to extract winScore from SceneLaunchPayload and set initial match state
- [x] 3.3 Implement `create()` to build walls (top/bottom static bodies), paddles (immovable bodies), and ball (dynamic body)
- [x] 3.4 Draw game objects programmatically (white rectangles for paddles/walls, white circle for ball, dark background)
- [x] 3.5 Register PongScene in `src/game/config.ts` scene array

**Requirements:** 1.1, 1.2, 1.3, 1.4, 1.5
**Files:** `src/game/scenes/PongScene.ts`, `src/game/config.ts`

## Task 4: Implement paddle input and movement

- [x] 4.1 Register keyboard keys (W, S, ArrowUp, ArrowDown) in `create()`
- [x] 4.2 Implement `update()` to read key state and set paddle velocities
- [x] 4.3 Clamp paddle positions using `clampPaddleY` helper to enforce vertical bounds

**Requirements:** 2.1, 2.2, 2.3, 2.4
**Files:** `src/game/scenes/PongScene.ts`

## Task 5: Implement ball physics and collisions

- [x] 5.1 Configure ball with no gravity, bounce factor 1, and world bounds collision disabled (manual edge detection)
- [x] 5.2 Add Arcade Physics colliders: ball ↔ top wall, ball ↔ bottom wall, ball ↔ paddles
- [x] 5.3 Implement paddle collision callback: increase speed using `computeSpeedAfterHit`, normalize and scale velocity, emit `audio:paddle-hit`
- [x] 5.4 Implement wall collision callback: emit `audio:wall-bounce`
- [x] 5.5 Implement ball exit detection in `update()`: check ball X against play area edges

**Requirements:** 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2
**Files:** `src/game/scenes/PongScene.ts`

## Task 6: Implement scoring and win detection

- [x] 6.1 On ball exit, call `awardPoint` with the exit edge and update match scores
- [x] 6.2 Emit `score:update` event via EventBridge with updated scores
- [x] 6.3 Emit `audio:score-point` event via EventBridge
- [x] 6.4 Check if either player's score equals winScore — if yes, trigger win flow
- [x] 6.5 Implement win flow: stop ball, set matchOver, emit `match:win` and `audio:win`

**Requirements:** 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4
**Files:** `src/game/scenes/PongScene.ts`

## Task 7: Implement serve mechanics

- [x] 7.1 Implement `serve()` method: position ball at center, reset speed to BASE_SPEED, launch in serveDirection with random vertical angle
- [x] 7.2 After scoring (non-win), schedule next serve with a delay (500ms) using Phaser time event
- [x] 7.3 Use `nextServeDirection` from `awardPoint` result to set serve direction

**Requirements:** 7.1, 7.2, 7.3, 7.4, 3.1, 4.3
**Files:** `src/game/scenes/PongScene.ts`

## Task 8: Implement pause/resume integration

- [x] 8.1 Subscribe to `match:pause` on EventBridge in `create()`
- [x] 8.2 Implement pause handler: freeze physics with `this.physics.pause()`, emit `audio:pause`
- [x] 8.3 Implement resume handler: resume physics with `this.physics.resume()`
- [x] 8.4 Guard `update()` to skip input processing when paused

**Requirements:** 8.1, 8.2, 8.3, 8.4
**Files:** `src/game/scenes/PongScene.ts`

## Task 9: Implement scene lifecycle cleanup

- [x] 9.1 Implement `shutdown()` method to unsubscribe EventBridge listeners
- [x] 9.2 Ensure scene restart resets all match state (scores, ball, speed, matchOver flag)
- [x] 9.3 Register shutdown event listener in `create()` for cleanup on scene stop/destroy

**Requirements:** 10.1, 10.2, 10.3, 10.4
**Files:** `src/game/scenes/PongScene.ts`

## Task 10: Validation and integration verification

- [x] 10.1 Run `npm run typecheck` — verify no type errors
- [x] 10.2 Run `npm run lint` — verify no lint errors or warnings
- [x] 10.3 Run `npm test` — verify all tests pass (including new property-based tests)
- [x] 10.4 Run `npm run build` — verify production build succeeds
- [x] 10.5 Manual verification: launch Pong: Versus from mode selection, play a full match to win, verify scoring, audio, pause, and win overlay

**Requirements:** All
**Files:** N/A (validation step)
