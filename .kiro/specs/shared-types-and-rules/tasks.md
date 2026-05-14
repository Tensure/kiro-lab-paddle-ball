# Implementation Plan: Shared Types and Rules

## Overview

Implement the typed contracts and pure rule modules that all game modes, scenes, and UI components import. Types are implemented first (no dependencies), then rule modules (depend on types), then unit tests, then property-based tests. All modules live in `src/game/types/` and `src/game/rules/` with zero Phaser imports.

## Tasks

- [x] 1. Define type modules
  - [x] 1.1 Create `src/game/types/modes.ts` with GameMode, PlayerId, and AIDifficultyPreset types
    - Export `GameMode` as `'pong-solo' | 'pong-versus' | 'breakout'`
    - Export `PlayerId` as `'left' | 'right' | 'solo'`
    - Export `AIDifficultyPreset` as `'easy' | 'normal' | 'hard'`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3_

  - [x] 1.2 Create `src/game/types/settings.ts` with discriminated union MatchSettings
    - Define `MatchSettingsBase` with `readonly powerupsEnabled: boolean`
    - Define `PongSoloSettings` extending base with mode, winScore, aiDifficulty
    - Define `PongVersusSettings` extending base with mode, winScore
    - Define `BreakoutSettings` extending base with mode only
    - Export `MatchSettings` as discriminated union keyed on `mode`
    - All fields marked `readonly`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 1.3 Create `src/game/types/audio.ts` with AudioEventName type
    - Export `AudioEventName` string literal union with all 9 audio cues
    - _Requirements: 6.1, 6.2_

  - [x] 1.4 Create `src/game/types/payload.ts` with SceneLaunchPayload interface
    - Import MatchSettings and PlayerId
    - Define readonly `settings` and `players` fields
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 1.5 Extend `src/game/types/events.ts` with scene-to-React events
    - Add `score:update`, `match:win`, `match:loss`, `match:pause`, `lives:update` events
    - Preserve existing `placeholder:ping` event
    - Import PlayerId from modes.ts for payload typing
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 2. Implement pure rule modules
  - [x] 2.1 Create `src/game/rules/scoring.ts` with Pong scoring logic
    - Export `PongScores`, `ScoreResult`, `ExitEdge` types
    - Implement `awardPoint(current, exitEdge)` — ball exits left → right scores, ball exits right → left scores
    - Return updated scores and nextServeDirection toward the player who lost the point
    - Pure function, no mutation of input
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 2.2 Create `src/game/rules/win-score.ts` with win-score validation
    - Export constants `WIN_SCORE_MIN = 3`, `WIN_SCORE_MAX = 21`, `WIN_SCORE_DEFAULT = 7`
    - Implement `validateWinScore(value?)` — clamp to [3, 21], round non-integers, return 7 for undefined/null/NaN
    - Pure function, no side effects
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [x] 2.3 Create `src/game/rules/brick-grid.ts` with brick grid generation
    - Export `BrickGridConfig` and `BrickDescriptor` interfaces
    - Implement `generateBrickGrid(config)` — produce rows×columns non-overlapping bricks within bounds
    - Return empty array for zero or negative rows/columns
    - Pure function, no mutation
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 2.4 Create `src/game/rules/life-rules.ts` with Breakout life/win/loss logic
    - Export `BreakoutState`, `MatchStatus` types and `STARTING_LIVES = 3` constant
    - Implement `createInitialState(totalBricks)` — lives=3, bricksRemaining=totalBricks, score=0
    - Implement `loseLife(state)` — decrement lives, never below 0
    - Implement `breakBrick(state, points)` — decrement bricksRemaining, add points to score
    - Implement `getMatchStatus(state)` — return 'win', 'loss', or 'in-progress'
    - Pure functions, no mutation
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [x] 2.5 Create `src/game/rules/settings-validator.ts` with mode-specific validation
    - Export `ValidationResult` tagged union type
    - Implement `validateSettings(input)` — validate mode-specific required fields, clamp winScore via validateWinScore, return validated copy or error list
    - Pure function, no mutation of input
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [x] 3. Write unit tests for all rule modules
  - [x] 3.1 Create `src/game/rules/scoring.test.ts` with unit tests
    - Test ball exits left → right player scores
    - Test ball exits right → left player scores
    - Test serve direction goes toward losing player
    - Test starting from {0, 0} scores
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 3.2 Create `src/game/rules/win-score.test.ts` with unit tests
    - Test default value (7) for undefined, null, NaN
    - Test clamping below 3 and above 21
    - Test rounding non-integers (e.g., 5.4 → 5, 5.6 → 6)
    - Test boundary values (3, 21)
    - Test Infinity and -Infinity
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 3.3 Create `src/game/rules/brick-grid.test.ts` with unit tests
    - Test standard grid (e.g., 3 rows × 5 columns) produces correct count
    - Test zero rows returns empty array
    - Test zero columns returns empty array
    - Test negative values return empty array
    - Test all bricks have positive width and height
    - _Requirements: 9.1, 9.2, 9.5, 9.6_

  - [x] 3.4 Create `src/game/rules/life-rules.test.ts` with unit tests
    - Test createInitialState sets lives=3
    - Test loseLife decrements by 1
    - Test loseLife at 0 stays at 0
    - Test breakBrick decrements bricksRemaining and adds score
    - Test getMatchStatus returns 'win' when bricksRemaining=0
    - Test getMatchStatus returns 'loss' when lives=0
    - Test getMatchStatus returns 'in-progress' otherwise
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 3.5 Create `src/game/rules/settings-validator.test.ts` with unit tests
    - Test valid pong-solo settings pass with all required fields
    - Test valid pong-versus settings pass without aiDifficulty
    - Test valid breakout settings pass without winScore or aiDifficulty
    - Test missing aiDifficulty for pong-solo returns error
    - Test missing winScore for pong-versus returns error
    - Test winScore is clamped in output
    - Test invalid mode returns error
    - Test input is not mutated
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 4. Write property-based tests for correctness properties
  - [x]* 4.1 Create property test: Score sum equals total points played
    - **Property 1: Score sum equals total points played**
    - Generate random sequences of ExitEdge values, apply awardPoint repeatedly, assert left + right === sequence length
    - Minimum 100 iterations with fast-check
    - **Validates: Requirements 7.6, 7.3**

  - [x]* 4.2 Create property test: Serve direction toward losing player
    - **Property 2: Serve direction toward losing player**
    - For any PongScores and ExitEdge, assert nextServeDirection === exitEdge
    - Minimum 100 iterations with fast-check
    - **Validates: Requirements 7.4**

  - [x]* 4.3 Create property test: Win-score validation always produces valid range
    - **Property 3: Win-score validation always produces valid range**
    - For any numeric input (including edge cases), assert result is integer in [3, 21]
    - Minimum 100 iterations with fast-check
    - **Validates: Requirements 8.6, 8.1, 8.2, 8.3, 8.5**

  - [x]* 4.4 Create property test: Brick grid no-overlap
    - **Property 4: Brick grid no-overlap**
    - For any valid BrickGridConfig with positive rows/columns, assert no two bricks overlap
    - Minimum 100 iterations with fast-check
    - **Validates: Requirements 9.3**

  - [x]* 4.5 Create property test: Brick grid fits bounds
    - **Property 5: Brick grid fits bounds**
    - For any valid BrickGridConfig, assert every brick fits within [0, playAreaWidth] × [topOffset, playAreaHeight]
    - Minimum 100 iterations with fast-check
    - **Validates: Requirements 9.4**

  - [x]* 4.6 Create property test: Brick grid correct count
    - **Property 6: Brick grid correct count**
    - For any valid BrickGridConfig with positive rows/columns, assert result length === rows × columns
    - Minimum 100 iterations with fast-check
    - **Validates: Requirements 9.5, 9.2**

  - [x]* 4.7 Create property test: Life count never goes negative
    - **Property 7: Life count never goes negative**
    - For any BreakoutState (including lives=0), assert loseLife produces lives >= 0
    - Minimum 100 iterations with fast-check
    - **Validates: Requirements 10.7, 10.2**

  - [x]* 4.8 Create property test: Match status determined by lives and bricks
    - **Property 8: Match status determined by lives and bricks**
    - For any BreakoutState, assert getMatchStatus returns correct status based on lives/bricksRemaining values
    - Minimum 100 iterations with fast-check
    - **Validates: Requirements 10.3, 10.4, 10.5**

  - [x]* 4.9 Create property test: Settings validation clamps winScore to valid range
    - **Property 9: Settings validation clamps winScore to valid range**
    - For any pong-solo or pong-versus input with numeric winScore, assert validated winScore is integer in [3, 21]
    - Minimum 100 iterations with fast-check
    - **Validates: Requirements 11.4**

  - [x]* 4.10 Create property test: Rule functions do not mutate inputs
    - **Property 10: Rule functions do not mutate inputs**
    - For any input to awardPoint, validateWinScore, generateBrickGrid, loseLife, breakBrick, validateSettings — deep-equal check before and after call
    - Minimum 100 iterations with fast-check
    - **Validates: Requirements 7.5, 8.7, 9.7, 10.6, 11.5, 11.7**

- [x] 5. Final checkpoint
  - Ensure all tests pass (`npm test`), typecheck passes (`npm run typecheck`), lint passes (`npm run lint`), and build succeeds (`npm run build`). Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All modules have zero Phaser imports — pure TypeScript only
- Property tests use `fast-check` with minimum 100 iterations per property
- Each task references specific requirements for traceability
- The final checkpoint validates all four validation commands from delivery standards
- This spec depends on `react-phaser-foundation` being complete (it is)
