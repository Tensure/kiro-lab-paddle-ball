# Implementation Tasks — pong-ai

## Task 1: Create AI difficulty configuration

- [x] 1.1 Create `src/game/rules/ai-controller.ts` with `AIDifficultyConfig` interface and `AI_DIFFICULTY_CONFIGS` constant
- [x] 1.2 Define numeric values for Easy (maxPaddleSpeed: 180, reactionDelayMs: 500, predictionError: 80)
- [x] 1.3 Define numeric values for Normal (maxPaddleSpeed: 280, reactionDelayMs: 250, predictionError: 40)
- [x] 1.4 Define numeric values for Hard (maxPaddleSpeed: 370, reactionDelayMs: 100, predictionError: 15)
- [x] 1.5 Export `BallState` and `PlayAreaBounds` interfaces

**Requirements:** 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
**Files:** `src/game/rules/ai-controller.ts`

## Task 2: Implement AI target selection function

- [x] 2.1 Implement `computeAITarget` pure function with ball intercept prediction
- [x] 2.2 Implement wall bounce reflection (fold algorithm) for multi-bounce prediction
- [x] 2.3 Add prediction error offset using randomSeed parameter
- [x] 2.4 Return center Y when ball moves away from AI paddle (vx >= 0)
- [x] 2.5 Clamp returned target to play area bounds

**Requirements:** 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
**Files:** `src/game/rules/ai-controller.ts`

## Task 3: Implement reaction delay and paddle velocity functions

- [x] 3.1 Implement `shouldUpdateTarget` function comparing elapsed time against reactionDelayMs
- [x] 3.2 Implement `computeAIPaddleVelocity` function with speed capping and dead zone
- [x] 3.3 Ensure velocity direction is correct (negative when target is above, positive when below)
- [x] 3.4 Ensure velocity magnitude never exceeds maxPaddleSpeed

**Requirements:** 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4
**Files:** `src/game/rules/ai-controller.ts`

## Task 4: Write unit tests for AI controller

- [x] 4.1 Create `src/game/rules/ai-controller.test.ts` with unit tests for `AI_DIFFICULTY_CONFIGS` validation
- [x] 4.2 Add unit tests for `computeAITarget` — ball moving away returns center
- [x] 4.3 Add unit tests for `computeAITarget` — ball moving toward AI returns value within bounds
- [x] 4.4 Add unit tests for `computeAITarget` — wall bounce prediction with steep angles
- [x] 4.5 Add unit tests for `shouldUpdateTarget` — before and after delay
- [x] 4.6 Add unit tests for `computeAIPaddleVelocity` — dead zone, direction, and capping

**Requirements:** 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4
**Files:** `src/game/rules/ai-controller.test.ts`

## Task 5: Write property-based tests for AI controller

- [x] 5.1 Property test: AI target Y is always within play area bounds for all valid inputs
- [x] 5.2 Property test: AI paddle velocity never exceeds difficulty speed cap for all inputs
- [x] 5.3 Property test: AI prediction error is bounded by difficulty config predictionError value
- [x] 5.4 Property test: shouldUpdateTarget is monotonically true once delay elapses

**Requirements:** 2.5, 4.4, 6.1, 6.4, 6.5
**Files:** `src/game/rules/ai-controller.test.ts`

## Task 6: Integrate AI controller into PongScene

- [x] 6.1 Add AI runtime state fields to PongScene (isAIControlled, aiState)
- [x] 6.2 In `init()`, detect `pong-solo` mode and resolve AIDifficultyConfig from payload
- [x] 6.3 In `update()`, branch left paddle logic: AI controller when pong-solo, keyboard when pong-versus
- [x] 6.4 Implement AI frame logic: accumulate delta, call shouldUpdateTarget, call computeAITarget when due, call computeAIPaddleVelocity each frame
- [x] 6.5 Pass ball position and velocity as BallState to computeAITarget
- [x] 6.6 Ensure AI paddle is still clamped by existing clampPaddleY after velocity application

**Requirements:** 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
**Files:** `src/game/scenes/PongScene.ts`

## Task 7: Validation and integration verification

- [x] 7.1 Run `npm run typecheck` — verify no type errors
- [x] 7.2 Run `npm run lint` — verify no lint errors or warnings
- [x] 7.3 Run `npm test` — verify all tests pass (including new property-based tests)
- [x] 7.4 Run `npm run build` — verify production build succeeds
- [x] 7.5 Manual verification: launch Pong: Solo from mode selection at each difficulty, verify AI moves left paddle, player controls right paddle, AI is beatable

**Requirements:** All
**Files:** N/A (validation step)
