# Requirements Document

## Introduction

This spec defines the typed contracts and pure rule modules that all game modes and UI components import. It covers game mode types, match settings, player identifiers, AI difficulty presets, scene launch payloads, scene-to-React events, audio event names, and pure deterministic rule functions for Pong scoring, win-score validation, Breakout brick-grid generation, and Breakout life/win/loss logic. Every rule is unit-tested and property-tested where invariants exist. Powerup types are intentionally excluded (deferred to the `powerups` spec).

## Glossary

- **Game_Mode**: A union type representing the three playable modes: `Pong: Solo`, `Pong: Versus`, and `Breakout`.
- **Match_Settings**: A typed configuration object describing all pre-match options for a given mode, locked at match start.
- **Player_Id**: A discriminated identifier for each player position in a match (e.g., left, right, solo).
- **AI_Difficulty_Preset**: A union type representing named AI difficulty levels: `Easy`, `Normal`, `Hard`. Defines shape only — no numeric tuning values.
- **Scene_Launch_Payload**: A typed object passed from React to Phaser when launching a game scene, containing mode, settings, and player configuration.
- **Event_Map**: The central typed event registry in `src/game/types/events.ts` that the Event_Bridge uses for compile-time safety.
- **Audio_Event_Name**: A union type of all named audio cues the game can trigger.
- **Scoring_Rules**: Pure functions that determine point awards and serve direction in Pong.
- **Win_Score_Validator**: A pure function that validates and clamps the configurable win score to the allowed range.
- **Brick_Grid_Generator**: A pure function that produces a grid of brick positions given configurable rows and columns.
- **Life_Rules**: Pure functions that manage Breakout life tracking, win detection, and loss detection.
- **Settings_Validator**: Pure functions that enforce mode-specific settings constraints and value clamping.

## Requirements

### Requirement 1: Game Mode and Player Types

**User Story:** As a gameplay implementer, I want typed definitions for game modes and player identifiers, so that all modules reference a single source of truth for mode and player discrimination.

#### Acceptance Criteria

1. THE Game_Mode type SHALL enumerate exactly three values: `pong-solo`, `pong-versus`, and `breakout`.
2. THE Player_Id type SHALL distinguish between `left`, `right`, and `solo` player positions.
3. THE Game_Mode type SHALL be exported from `src/game/types/` and importable by any module in the project.
4. THE Player_Id type SHALL be exported from `src/game/types/` and importable by any module in the project.
5. WHEN a module references a game mode or player, THE module SHALL use the Game_Mode or Player_Id type rather than raw strings.

### Requirement 2: Match Settings Types

**User Story:** As a gameplay implementer, I want typed match settings that are mode-specific and immutable once a match starts, so that settings validation and scene launch have a clear contract.

#### Acceptance Criteria

1. THE Match_Settings type SHALL include a `mode` field typed as Game_Mode.
2. THE Match_Settings type SHALL include a `winScore` field for Pong modes, typed as a number.
3. THE Match_Settings type SHALL include an `aiDifficulty` field for `pong-solo` mode, typed as AI_Difficulty_Preset.
4. THE Match_Settings type SHALL include a `powerupsEnabled` field typed as boolean.
5. THE Match_Settings type SHALL be a discriminated union keyed on `mode`, so that mode-specific fields are only accessible for the correct mode.
6. THE Match_Settings type SHALL be read-only (all fields marked `readonly`) to signal immutability after match start.

### Requirement 3: AI Difficulty Preset Types

**User Story:** As a gameplay implementer, I want a typed AI difficulty preset that defines the shape without numeric tuning, so that the `pong-ai` spec can fill in values later without breaking the contract.

#### Acceptance Criteria

1. THE AI_Difficulty_Preset type SHALL enumerate exactly three values: `easy`, `normal`, and `hard`.
2. THE AI_Difficulty_Preset type SHALL be exported from `src/game/types/` and importable by any module.
3. THE AI_Difficulty_Preset type SHALL define shape only and SHALL NOT include numeric parameters such as speed, reaction delay, or prediction error.

### Requirement 4: Scene Launch Payload Types

**User Story:** As a gameplay implementer, I want a typed scene launch payload, so that React can pass validated settings to Phaser scenes with compile-time safety.

#### Acceptance Criteria

1. THE Scene_Launch_Payload type SHALL include the Match_Settings for the match being launched.
2. THE Scene_Launch_Payload type SHALL include the Player_Id assignments for the match.
3. THE Scene_Launch_Payload type SHALL be the single contract used when React instructs Phaser to start a game scene.
4. WHEN a Scene_Launch_Payload is constructed, THE payload SHALL contain all information needed by the target scene to initialize without additional queries.

### Requirement 5: Scene-to-React Event Types

**User Story:** As a gameplay implementer, I want typed scene-to-React events extending the existing Event_Map, so that score updates, win/loss, pause, and other scene events flow to the UI with compile-time safety.

#### Acceptance Criteria

1. WHEN a point is scored in Pong, THE Event_Map SHALL include a `score:update` event with a payload containing both players' current scores.
2. WHEN a match is won, THE Event_Map SHALL include a `match:win` event with a payload identifying the winning player.
3. WHEN a match is lost in Breakout, THE Event_Map SHALL include a `match:loss` event with a payload containing the final score.
4. WHEN the game is paused or resumed, THE Event_Map SHALL include a `match:pause` event with a payload indicating the paused state.
5. WHEN a life is lost in Breakout, THE Event_Map SHALL include a `lives:update` event with a payload containing the remaining lives count.
6. THE Event_Map extensions SHALL preserve the existing `placeholder:ping` event without modification.
7. THE Event_Map SHALL be the single source of truth for all scene-to-React event names and payload shapes.

### Requirement 6: Audio Event Name Types

**User Story:** As a gameplay implementer, I want a typed union of all audio event names, so that the audio system and scenes reference a consistent set of sound cues.

#### Acceptance Criteria

1. THE Audio_Event_Name type SHALL include events for: paddle hit, wall bounce, brick break, score point, life loss, powerup pickup, pause, win, and loss.
2. THE Audio_Event_Name type SHALL be a string literal union exported from `src/game/types/`.
3. WHEN a scene or system triggers an audio cue, THE caller SHALL use an Audio_Event_Name value rather than a raw string.

### Requirement 7: Pong Scoring Rules

**User Story:** As a gameplay implementer, I want pure scoring functions for Pong, so that point awards and serve direction are testable without Phaser.

#### Acceptance Criteria

1. WHEN the ball exits the left edge, THE Scoring_Rules SHALL award one point to the right player.
2. WHEN the ball exits the right edge, THE Scoring_Rules SHALL award one point to the left player.
3. WHEN a point is awarded, THE Scoring_Rules SHALL return the updated scores for both players.
4. WHEN a point is awarded, THE Scoring_Rules SHALL determine the next serve direction as toward the player who lost the point.
5. THE Scoring_Rules SHALL be pure functions with no side effects, taking current state as input and returning new state as output.
6. FOR ALL sequences of scored points, THE Scoring_Rules SHALL produce scores where left + right equals the total number of points played (invariant property).

### Requirement 8: Pong Win-Score Validation

**User Story:** As a gameplay implementer, I want win-score validation that clamps values to the allowed range, so that invalid configurations cannot reach the game scene.

#### Acceptance Criteria

1. THE Win_Score_Validator SHALL accept values in the range 3 through 21 inclusive.
2. WHEN a value below 3 is provided, THE Win_Score_Validator SHALL clamp the result to 3.
3. WHEN a value above 21 is provided, THE Win_Score_Validator SHALL clamp the result to 21.
4. WHEN no value is provided, THE Win_Score_Validator SHALL return the default value of 7.
5. WHEN a non-integer value is provided, THE Win_Score_Validator SHALL round to the nearest integer before clamping.
6. FOR ALL numeric inputs, THE Win_Score_Validator SHALL produce a result in the range 3 through 21 inclusive (invariant property).
7. THE Win_Score_Validator SHALL be a pure function with no side effects.

### Requirement 9: Breakout Brick-Grid Generation

**User Story:** As a gameplay implementer, I want a pure brick-grid generator, so that Breakout levels are deterministic, configurable, and testable without Phaser.

#### Acceptance Criteria

1. THE Brick_Grid_Generator SHALL accept configurable row count and column count parameters.
2. THE Brick_Grid_Generator SHALL produce an array of brick descriptors, each containing position (x, y), width, and height.
3. FOR ALL generated grids, no two bricks SHALL overlap in position (no-overlap invariant property).
4. FOR ALL generated grids, every brick SHALL fit within the specified play area bounds (fits-bounds invariant property).
5. THE Brick_Grid_Generator SHALL produce exactly `rows × columns` bricks for valid inputs.
6. WHEN row count or column count is zero or negative, THE Brick_Grid_Generator SHALL return an empty array.
7. THE Brick_Grid_Generator SHALL be a pure function with no side effects, taking grid configuration as input and returning brick descriptors as output.

### Requirement 10: Breakout Life, Win, and Loss Rules

**User Story:** As a gameplay implementer, I want pure functions for Breakout life tracking and win/loss detection, so that match state transitions are testable without Phaser.

#### Acceptance Criteria

1. THE Life_Rules SHALL initialize with a starting life count of 3.
2. WHEN a life is lost, THE Life_Rules SHALL decrement the remaining lives by 1.
3. WHEN remaining lives reach 0, THE Life_Rules SHALL indicate a loss condition.
4. WHEN all bricks are cleared (remaining brick count equals 0), THE Life_Rules SHALL indicate a win condition.
5. WHILE lives remain and bricks remain, THE Life_Rules SHALL indicate the match is in progress.
6. THE Life_Rules SHALL be pure functions with no side effects, taking current state as input and returning new state as output.
7. FOR ALL valid life counts, decrementing SHALL never produce a negative value (non-negative invariant).

### Requirement 11: Settings Validation

**User Story:** As a gameplay implementer, I want settings validation that enforces mode-specific constraints, so that only valid configurations reach game scenes.

#### Acceptance Criteria

1. WHEN Match_Settings specify `pong-solo` mode, THE Settings_Validator SHALL require an `aiDifficulty` field.
2. WHEN Match_Settings specify `pong-versus` mode, THE Settings_Validator SHALL require a `winScore` field and SHALL NOT require `aiDifficulty`.
3. WHEN Match_Settings specify `breakout` mode, THE Settings_Validator SHALL NOT require `winScore` or `aiDifficulty`.
4. WHEN a `winScore` value is present, THE Settings_Validator SHALL apply Win_Score_Validator clamping before accepting the settings.
5. THE Settings_Validator SHALL return a validated, clamped copy of the settings rather than mutating the input.
6. IF required fields for the specified mode are missing, THEN THE Settings_Validator SHALL return a validation error indicating which fields are missing.
7. THE Settings_Validator SHALL be a pure function with no side effects.
