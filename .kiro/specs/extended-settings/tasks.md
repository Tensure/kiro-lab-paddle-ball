# Implementation Plan: Extended Settings

## Overview

This plan implements the extended pre-match settings feature across four layers: types, store, validator, and UI. Each task builds incrementally, starting with type foundations and ending with full integration wiring. Property-based tests validate correctness invariants defined in the design.

## Tasks

- [x] 1. Extend MatchSettings types
  - [x] 1.1 Add new preset types and extend interfaces in `src/game/types/settings.ts`
    - Add `BrickDensityPreset = 'sparse' | 'normal' | 'dense'` type
    - Add `StartingLives = 1 | 3 | 5` type
    - Add `ballSpeedPreset: BallSpeedPreset`, `paddleSizePreset: PaddleSizePreset`, `speedIncreasePreset: SpeedIncreasePreset` to `MatchSettingsBase`
    - Add `startingLives: StartingLives` and `brickDensity: BrickDensityPreset` to `BreakoutSettings`
    - If `BallSpeedPreset`, `SpeedIncreasePreset`, `PaddleSizePreset` are not yet exported from settings.ts, add them
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Update Zustand store with new settings state and actions
  - [x] 2.1 Add new state fields, defaults, and setter actions to `src/app/store.ts`
    - Add `ballSpeedPreset`, `paddleSizePreset`, `speedIncreasePreset`, `startingLives`, `brickDensity` to `AppState` interface
    - Set defaults: ballSpeedPreset='normal', paddleSizePreset='normal', speedIncreasePreset='gentle', startingLives=3, brickDensity='normal'
    - Add setter actions: `setBallSpeedPreset`, `setPaddleSizePreset`, `setSpeedIncreasePreset`, `setStartingLives`, `setBrickDensity`
    - Each setter must reject changes when `phase === 'playing'`
    - Update `goToMenu` to reset all new fields to defaults
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 2.2 Write property test: Settings immutability during playing phase
    - **Property 1: Settings immutability during playing phase**
    - **Validates: Requirements 2.6, 7.1, 7.2**
    - Tag: `Feature: extended-settings, Property 1: Settings immutability during playing phase`
    - Generate random valid preset values and setter call sequences; verify no field changes when phase is 'playing'
    - Minimum 100 iterations

  - [ ]* 2.3 Write property test: goToMenu resets new settings to defaults
    - **Property 2: goToMenu resets new settings to defaults**
    - **Validates: Requirements 2.7**
    - Tag: `Feature: extended-settings, Property 2: goToMenu resets new settings to defaults`
    - Generate random non-default values for all new fields; call goToMenu; verify all reset to defaults
    - Minimum 100 iterations

  - [ ]* 2.4 Write unit tests for store new settings fields
    - Extend `src/app/store.test.ts` with tests for:
      - Initial state includes all new fields with correct defaults
      - Each setter updates its field when phase is 'settings'
      - Each setter is rejected when phase is 'playing'
      - `goToMenu` resets all new fields to defaults
      - `startMatch` does not alter settings fields
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 9.1_

- [x] 3. Checkpoint - Ensure store changes compile and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Extend settings validator for new preset fields
  - [x] 4.1 Update `src/game/rules/settings-validator.ts` to validate new fields
    - Add allowed-value arrays: `VALID_BALL_SPEED`, `VALID_PADDLE_SIZE`, `VALID_SPEED_INCREASE`, `VALID_BRICK_DENSITY`, `VALID_STARTING_LIVES`
    - For all modes: validate `ballSpeedPreset`, `paddleSizePreset`, `speedIncreasePreset` are present and in valid sets
    - For breakout: additionally validate `startingLives` and `brickDensity`
    - Return descriptive error messages identifying the invalid field
    - Include validated new fields in the returned settings object when valid
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 4.2 Write property test: Validation round-trip preserves valid settings
    - **Property 3: Validation round-trip preserves valid settings**
    - **Validates: Requirements 3.7, 10.1**
    - Tag: `Feature: extended-settings, Property 3: Validation round-trip preserves valid settings`
    - Generate valid MatchSettings for all modes with preset fields drawn from valid value sets
    - Verify `validateSettings(input)` returns `{ valid: true, settings }` with new fields identical to input
    - Minimum 200 iterations

  - [ ]* 4.3 Write property test: Validation rejects invalid preset values
    - **Property 4: Validation rejects invalid preset values**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 10.2**
    - Tag: `Feature: extended-settings, Property 4: Validation rejects invalid preset values`
    - Generate settings with at least one preset field containing a value outside its valid set
    - Verify `validateSettings(input)` returns `{ valid: false, errors }` with at least one descriptive message
    - Minimum 200 iterations

  - [ ]* 4.4 Write unit tests for validator new field validation
    - Extend `src/game/rules/settings-validator.test.ts` with tests for:
      - Valid pong-solo with all new fields passes
      - Valid pong-versus with all new fields passes
      - Valid breakout with all new fields passes
      - Missing `ballSpeedPreset` returns error
      - Invalid `paddleSizePreset` value returns error
      - Invalid `speedIncreasePreset` value returns error
      - Invalid `startingLives` (e.g., 2) returns error for breakout
      - Invalid `brickDensity` value returns error for breakout
      - Default values pass validation for all modes
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 9.2_

- [x] 5. Checkpoint - Ensure validator changes compile and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update SettingsPanel UI with new segmented controls
  - [x] 6.1 Add segmented controls for Pong modes in `src/components/SettingsPanel.tsx`
    - Add "Match Rules" section heading containing Win Score and AI Difficulty (solo only)
    - Add "Feel" section heading containing Ball Speed, Paddle Size, Ball Speed Increase segmented controls
    - Each segmented control uses native `<button>` elements with `segmented__btn` / `segmented__btn--active` classes
    - Wire each control to its corresponding store setter
    - Pre-select default values on initial render
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 6.2 Add segmented controls for Breakout mode in `src/components/SettingsPanel.tsx`
    - Add "Match Rules" section heading containing Starting Lives segmented control
    - Add "Feel" section heading containing Ball Speed, Paddle Size, Brick Density segmented controls
    - Wire each control to its corresponding store setter
    - Pre-select default values on initial render
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [x] 6.3 Update `buildSettingsInput` to include new fields in validation payload
    - For pong-solo and pong-versus: include `ballSpeedPreset`, `paddleSizePreset`, `speedIncreasePreset`
    - For breakout: include `ballSpeedPreset`, `paddleSizePreset`, `speedIncreasePreset`, `startingLives`, `brickDensity`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 6.4 Write unit tests for SettingsPanel new controls
    - Extend `src/components/SettingsPanel.test.tsx` with tests for:
      - Pong mode renders Ball Speed, Paddle Size, Ball Speed Increase controls
      - Breakout mode renders Starting Lives, Ball Speed, Paddle Size, Brick Density controls
      - Controls are grouped under "Match Rules" and "Feel" headings
      - Clicking a segment updates the store
      - Default segments are pre-selected on render
      - Controls use native `<button>` elements (keyboard accessible)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 8.1, 8.2, 8.3, 9.3_

- [x] 7. Verify SceneLaunchPayload carries new fields
  - [x] 7.1 Confirm type-level integration in `src/game/types/payload.ts` and `GameView.tsx`
    - Verify `SceneLaunchPayload.settings` type includes new fields via `MatchSettings` union extension
    - Verify `GameView` builds the payload from store state including all new fields
    - Fix any TypeScript errors arising from the extended types
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 8. Final checkpoint - Ensure all tests pass and types compile
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The `SceneLaunchPayload` automatically carries new fields since it uses the `MatchSettings` type — task 7 is a verification step
- `BallSpeedPreset`, `SpeedIncreasePreset`, and `PaddleSizePreset` may already exist from the `ball-physics` spec; if not, task 1.1 adds them
