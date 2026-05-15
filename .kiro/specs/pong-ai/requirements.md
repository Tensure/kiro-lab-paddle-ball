# Requirements Document

## Introduction

This spec adds AI paddle control for `Pong: Solo` mode. When the game mode is `pong-solo`, the left paddle is driven by an AI controller instead of W/S keyboard input. The player controls the right paddle with ArrowUp/ArrowDown. The AI uses three configurable difficulty levels (Easy, Normal, Hard) selected before match start. AI behavior is modeled with capped paddle speed, reaction delay, and prediction error — it does not directly track the ball's Y position every frame. The AI is beatable at all difficulties. Pure AI target-selection logic is testable without Phaser.

## Glossary

- **AI_Controller**: The pure TypeScript module (`src/game/rules/ai-controller.ts`) that computes AI paddle target positions and movement decisions without Phaser dependencies.
- **AIDifficultyPreset**: The existing type (`'easy' | 'normal' | 'hard'`) from `src/game/types/modes.ts`.
- **AIDifficultyConfig**: A typed object containing numeric parameters for a difficulty level: `maxPaddleSpeed`, `reactionDelayMs`, and `predictionError`.
- **Target_Y**: The Y coordinate the AI paddle is currently moving toward, computed from ball trajectory prediction with applied error.
- **Reaction_Delay**: The minimum time (in milliseconds) the AI waits after a ball direction change before recalculating its target. Longer at Easy, shorter at Hard.
- **Prediction_Error**: A random offset (in pixels) added to the AI's predicted ball intercept position. Larger at Easy, smaller at Hard.
- **Max_Paddle_Speed**: The maximum velocity (pixels/second) the AI paddle can move. Lower at Easy, higher at Hard.
- **PongScene**: The existing Phaser scene (`src/game/scenes/PongScene.ts`) that runs Pong matches.
- **Ball_State**: The ball's current position (x, y) and velocity (vx, vy) used as input to AI target computation.
- **Play_Area_Bounds**: The vertical boundaries of the play area (top wall to bottom wall) within which the AI target must fall.

## Requirements

### Requirement 1: AI Difficulty Configuration

**User Story:** As a gameplay implementer, I want numeric difficulty configurations for Easy, Normal, and Hard presets, so that AI behavior is tunable and each difficulty feels distinct.

#### Acceptance Criteria

1. THE AI_Controller SHALL export an `AI_DIFFICULTY_CONFIGS` constant mapping each AIDifficultyPreset to an AIDifficultyConfig object with `maxPaddleSpeed`, `reactionDelayMs`, and `predictionError` fields.
2. WHEN difficulty is `easy`, THE AI_Controller SHALL use a maxPaddleSpeed significantly lower than the player's paddle speed (PADDLE_SPEED of 400 px/s).
3. WHEN difficulty is `normal`, THE AI_Controller SHALL use a maxPaddleSpeed moderately lower than the player's paddle speed.
4. WHEN difficulty is `hard`, THE AI_Controller SHALL use a maxPaddleSpeed near but not exceeding the player's paddle speed.
5. THE AI_Controller SHALL define reactionDelayMs values that decrease from Easy (longest delay) to Hard (shortest delay).
6. THE AI_Controller SHALL define predictionError values that decrease from Easy (largest error) to Hard (smallest error).

### Requirement 2: AI Target Selection

**User Story:** As a gameplay implementer, I want a pure function that computes the AI's target Y position from ball state, so that AI decision-making is testable without Phaser.

#### Acceptance Criteria

1. THE AI_Controller SHALL export a `computeAITarget` pure function that accepts Ball_State, Play_Area_Bounds, paddle X position, and AIDifficultyConfig, and returns a Target_Y value.
2. WHEN the ball is moving toward the AI paddle (negative vx), THE `computeAITarget` function SHALL predict where the ball will intercept the AI paddle's X column.
3. WHEN the ball is moving away from the AI paddle (positive vx), THE `computeAITarget` function SHALL return the vertical center of the play area (idle position).
4. THE `computeAITarget` function SHALL add a random offset within the range [-predictionError, +predictionError] to the predicted intercept position.
5. FOR ALL inputs, THE `computeAITarget` function SHALL clamp the returned Target_Y to within Play_Area_Bounds (target bounds invariant).
6. THE `computeAITarget` function SHALL account for ball bounces off top and bottom walls when predicting the intercept position.

### Requirement 3: AI Reaction Delay

**User Story:** As a player, I want the AI to have a reaction delay before updating its target, so that the AI feels human-like and is beatable.

#### Acceptance Criteria

1. THE AI_Controller SHALL export a `shouldUpdateTarget` function that accepts the time since the last target update (in milliseconds) and the AIDifficultyConfig, and returns a boolean.
2. WHEN the elapsed time since the last target update is less than reactionDelayMs, THE `shouldUpdateTarget` function SHALL return false.
3. WHEN the elapsed time since the last target update is greater than or equal to reactionDelayMs, THE `shouldUpdateTarget` function SHALL return true.
4. WHEN the AI's target is not due for update, THE PongScene SHALL continue moving the AI paddle toward its previously computed Target_Y.

### Requirement 4: AI Paddle Speed Capping

**User Story:** As a player, I want the AI paddle speed to be limited per difficulty, so that the AI cannot react faster than its difficulty allows.

#### Acceptance Criteria

1. THE AI_Controller SHALL export a `computeAIPaddleVelocity` function that accepts the current paddle Y, Target_Y, and AIDifficultyConfig, and returns a clamped velocity value.
2. THE `computeAIPaddleVelocity` function SHALL return a velocity whose absolute value does not exceed maxPaddleSpeed from the AIDifficultyConfig.
3. WHEN the AI paddle is within a small threshold of Target_Y, THE `computeAIPaddleVelocity` function SHALL return zero velocity (dead zone to prevent oscillation).
4. FOR ALL inputs, THE absolute value of the velocity returned by `computeAIPaddleVelocity` SHALL be less than or equal to maxPaddleSpeed (speed cap invariant).

### Requirement 5: PongScene Integration

**User Story:** As a player, I want to play Pong: Solo against an AI opponent on the left paddle, so that I can practice or play alone.

#### Acceptance Criteria

1. WHEN the game mode in SceneLaunchPayload is `pong-solo`, THE PongScene SHALL use the AI_Controller to drive the left paddle instead of W/S keyboard input.
2. WHEN the game mode is `pong-solo`, THE PongScene SHALL read the `aiDifficulty` from SceneLaunchPayload settings and pass the corresponding AIDifficultyConfig to the AI_Controller.
3. WHEN the game mode is `pong-solo`, THE PongScene SHALL call `shouldUpdateTarget` each frame and update the AI target only when the reaction delay has elapsed.
4. WHEN the game mode is `pong-solo`, THE PongScene SHALL move the AI paddle using the velocity returned by `computeAIPaddleVelocity`, clamped to play area bounds.
5. WHEN the game mode is `pong-versus`, THE PongScene SHALL continue using W/S keyboard input for the left paddle (no AI involvement).
6. THE PongScene SHALL pass the current Ball_State (position and velocity) to the AI_Controller each frame the target is updated.

### Requirement 6: AI Beatability Invariant

**User Story:** As a player, I want the AI to be beatable at all difficulties, so that the game is fun and not frustrating.

#### Acceptance Criteria

1. FOR ALL difficulty presets, THE AI_Controller SHALL introduce enough combined prediction error and reaction delay that the AI cannot perfectly track the ball.
2. WHEN difficulty is `easy`, THE AI_Controller SHALL use parameters that make the AI miss frequently (large prediction error, long reaction delay, slow paddle speed).
3. WHEN difficulty is `hard`, THE AI_Controller SHALL use parameters that make the AI challenging but still beatable (small prediction error, short reaction delay, near-player paddle speed but not equal).
4. FOR ALL difficulty presets, THE maxPaddleSpeed SHALL be strictly less than or equal to the player's PADDLE_SPEED (400 px/s), ensuring the AI cannot outrun the player mechanically.
5. FOR ALL difficulty presets, THE predictionError SHALL be greater than zero, ensuring the AI never has perfect aim.
