# Requirements Document

## Introduction

This spec extends the pre-match settings UI to give players control over ball speed, paddle size, ball speed increase (Pong), and starting lives, ball speed, paddle size, brick density (Breakout). It covers the React UI controls, Zustand store state, settings type extensions, validation logic, and SceneLaunchPayload integration. The `ball-physics` spec provides the preset types (`BallSpeedPreset`, `SpeedIncreasePreset`, `PaddleSizePreset`) and the physics config module that maps presets to runtime values — this spec wires those presets into the player-facing configuration flow.

## Glossary

- **Settings_Panel**: The React component (`src/components/SettingsPanel.tsx`) that renders pre-match configuration controls
- **Settings_Store**: The Zustand store (`src/app/store.ts`) holding app-wide state including match settings
- **Settings_Validator**: The pure function (`src/game/rules/settings-validator.ts`) that validates and normalizes match settings before launch
- **Scene_Launch_Payload**: The typed object (`SceneLaunchPayload`) passed from React to Phaser scenes carrying locked match settings
- **Segmented_Control**: A row of mutually exclusive buttons representing preset options (e.g., Slow / Normal / Fast)
- **BallSpeedPreset**: A union type `'slow' | 'normal' | 'fast'` representing ball base speed and max speed tiers
- **SpeedIncreasePreset**: A union type `'off' | 'gentle' | 'aggressive'` representing ball acceleration per hit
- **PaddleSizePreset**: A union type `'small' | 'normal' | 'large'` representing paddle height tiers
- **BrickDensityPreset**: A union type `'sparse' | 'normal' | 'dense'` representing brick grid density tiers
- **StartingLives**: A constrained numeric value of 1, 3, or 5 representing initial lives in Breakout

## Requirements

### Requirement 1: Extend MatchSettings Types

**User Story:** As a developer, I want the MatchSettings types to include new physics and gameplay fields, so that all settings flow through a single typed contract from UI to scene.

#### Acceptance Criteria

1. THE MatchSettingsBase interface SHALL include a `ballSpeedPreset` field of type BallSpeedPreset
2. THE MatchSettingsBase interface SHALL include a `paddleSizePreset` field of type PaddleSizePreset
3. THE MatchSettingsBase interface SHALL include a `speedIncreasePreset` field of type SpeedIncreasePreset
4. THE BreakoutSettings interface SHALL include a `startingLives` field constrained to the values 1, 3, or 5
5. THE BreakoutSettings interface SHALL include a `brickDensity` field of type BrickDensityPreset
6. THE PongSoloSettings and PongVersusSettings interfaces SHALL inherit ballSpeedPreset, paddleSizePreset, and speedIncreasePreset from MatchSettingsBase

### Requirement 2: Update Zustand Store

**User Story:** As a developer, I want the Zustand store to hold new settings state with sensible defaults, so that the UI can read and write new settings without additional plumbing.

#### Acceptance Criteria

1. THE Settings_Store SHALL hold a `ballSpeedPreset` field with a default value of `'normal'`
2. THE Settings_Store SHALL hold a `paddleSizePreset` field with a default value of `'normal'`
3. THE Settings_Store SHALL hold a `speedIncreasePreset` field with a default value of `'gentle'`
4. THE Settings_Store SHALL hold a `startingLives` field with a default value of 3
5. THE Settings_Store SHALL hold a `brickDensity` field with a default value of `'normal'`
6. THE Settings_Store SHALL expose setter actions for each new field that reject changes when the phase is `'playing'`
7. WHEN the `goToMenu` action is called, THE Settings_Store SHALL reset all new settings fields to their default values

### Requirement 3: Settings Validation

**User Story:** As a developer, I want the settings validator to enforce valid values for new fields, so that scenes never receive invalid configuration.

#### Acceptance Criteria

1. WHEN a Pong settings object is validated, THE Settings_Validator SHALL reject the input if `ballSpeedPreset` is not one of `'slow'`, `'normal'`, or `'fast'`
2. WHEN a Pong settings object is validated, THE Settings_Validator SHALL reject the input if `paddleSizePreset` is not one of `'small'`, `'normal'`, or `'large'`
3. WHEN a Pong settings object is validated, THE Settings_Validator SHALL reject the input if `speedIncreasePreset` is not one of `'off'`, `'gentle'`, or `'aggressive'`
4. WHEN a Breakout settings object is validated, THE Settings_Validator SHALL reject the input if `startingLives` is not one of 1, 3, or 5
5. WHEN a Breakout settings object is validated, THE Settings_Validator SHALL reject the input if `brickDensity` is not one of `'sparse'`, `'normal'`, or `'dense'`
6. WHEN a Breakout settings object is validated, THE Settings_Validator SHALL reject the input if `ballSpeedPreset`, `paddleSizePreset`, or `speedIncreasePreset` contain invalid values
7. WHEN all fields are valid, THE Settings_Validator SHALL return a validated settings object containing all new fields

### Requirement 4: Settings Panel UI — Pong Modes

**User Story:** As a player, I want to see ball speed, paddle size, and speed increase options when configuring a Pong match, so that I can tune the game feel before playing.

#### Acceptance Criteria

1. WHILE the selected mode is `'pong-solo'` or `'pong-versus'`, THE Settings_Panel SHALL display a Ball Speed segmented control with options Slow, Normal, and Fast
2. WHILE the selected mode is `'pong-solo'` or `'pong-versus'`, THE Settings_Panel SHALL display a Paddle Size segmented control with options Small, Normal, and Large
3. WHILE the selected mode is `'pong-solo'` or `'pong-versus'`, THE Settings_Panel SHALL display a Ball Speed Increase segmented control with options Off, Gentle, and Aggressive
4. THE Settings_Panel SHALL group Win Score under a "Match Rules" heading and Ball Speed, Paddle Size, and Ball Speed Increase under a "Feel" heading
5. THE Settings_Panel SHALL pre-select the default value for each new segmented control on initial render
6. WHEN a player selects a segment option, THE Settings_Panel SHALL update the corresponding store field immediately

### Requirement 5: Settings Panel UI — Breakout Mode

**User Story:** As a player, I want to configure starting lives, ball speed, paddle size, and brick density before a Breakout match, so that I can customize the challenge level.

#### Acceptance Criteria

1. WHILE the selected mode is `'breakout'`, THE Settings_Panel SHALL display a Starting Lives segmented control with options 1, 3, and 5
2. WHILE the selected mode is `'breakout'`, THE Settings_Panel SHALL display a Ball Speed segmented control with options Slow, Normal, and Fast
3. WHILE the selected mode is `'breakout'`, THE Settings_Panel SHALL display a Paddle Size segmented control with options Small, Normal, and Large
4. WHILE the selected mode is `'breakout'`, THE Settings_Panel SHALL display a Brick Density segmented control with options Sparse, Normal, and Dense
5. THE Settings_Panel SHALL group Starting Lives under a "Match Rules" heading and Ball Speed, Paddle Size, and Brick Density under a "Feel" heading
6. THE Settings_Panel SHALL pre-select the default value for each new segmented control on initial render
7. WHEN a player selects a segment option, THE Settings_Panel SHALL update the corresponding store field immediately

### Requirement 6: SceneLaunchPayload Integration

**User Story:** As a developer, I want the SceneLaunchPayload to carry all new settings to scenes, so that Phaser scenes can read physics presets without accessing the Zustand store.

#### Acceptance Criteria

1. WHEN a match is started, THE Scene_Launch_Payload SHALL include the `ballSpeedPreset` value from the store
2. WHEN a match is started, THE Scene_Launch_Payload SHALL include the `paddleSizePreset` value from the store
3. WHEN a match is started, THE Scene_Launch_Payload SHALL include the `speedIncreasePreset` value from the store
4. WHEN a Breakout match is started, THE Scene_Launch_Payload SHALL include the `startingLives` value from the store
5. WHEN a Breakout match is started, THE Scene_Launch_Payload SHALL include the `brickDensity` value from the store
6. THE Scene_Launch_Payload SHALL carry settings that match the validated MatchSettings type exactly

### Requirement 7: Settings Lock at Match Start

**User Story:** As a player, I want settings to be locked once a match begins, so that mid-match changes cannot affect fairness.

#### Acceptance Criteria

1. WHILE the app phase is `'playing'`, THE Settings_Store SHALL reject all setter calls for ballSpeedPreset, paddleSizePreset, speedIncreasePreset, startingLives, and brickDensity
2. WHEN the match ends and the player returns to settings, THE Settings_Store SHALL allow modifications to all settings fields again

### Requirement 8: Accessibility and Keyboard Navigation

**User Story:** As a player using keyboard navigation, I want all new settings controls to be reachable and operable via keyboard, so that I can configure matches without a pointer device.

#### Acceptance Criteria

1. THE Settings_Panel SHALL make all new segmented controls focusable via Tab key navigation
2. THE Settings_Panel SHALL allow segment selection via Enter or Space key when a segment button is focused
3. THE Settings_Panel SHALL visually indicate which segment button has keyboard focus

### Requirement 9: Default-First Experience

**User Story:** As a player who does not want to configure anything, I want all new settings to have sensible defaults, so that I can start a match immediately without changing any options.

#### Acceptance Criteria

1. THE Settings_Store SHALL initialize ballSpeedPreset to `'normal'`, paddleSizePreset to `'normal'`, speedIncreasePreset to `'gentle'`, startingLives to 3, and brickDensity to `'normal'`
2. WHEN a player presses Start without modifying any new settings, THE Settings_Validator SHALL accept the default values as valid
3. THE Settings_Panel SHALL render with all defaults pre-selected so that no configuration is required before starting

### Requirement 10: Settings Validation Round-Trip

**User Story:** As a developer, I want to verify that any valid combination of settings passes validation and produces an equivalent validated output, so that the validator does not silently alter valid inputs.

#### Acceptance Criteria

1. FOR ALL valid MatchSettings objects containing valid preset values, THE Settings_Validator SHALL return a validated object whose new fields are identical to the input values
2. FOR ALL invalid preset values, THE Settings_Validator SHALL return an error result with a descriptive message identifying the invalid field
