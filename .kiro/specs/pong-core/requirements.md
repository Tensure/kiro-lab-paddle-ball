# Requirements Document

## Introduction

This spec delivers the `PongScene` — the first playable game mode in the paddle arcade rewrite. Two local players compete on the same keyboard in `Pong: Versus` mode. The scene uses Phaser Arcade Physics for ball and paddle simulation, integrates with the existing pure scoring rules, emits typed events to the React shell via EventBridge, and triggers audio cues for all gameplay events. Ball speed increases on each paddle hit and resets when a point is scored. The match ends when one player reaches the configured win score.

## Glossary

- **PongScene**: The Phaser 3 scene class (`src/game/scenes/PongScene.ts`) that runs a Pong match using Arcade Physics.
- **Ball**: A circular Arcade Physics body that moves continuously, bouncing off paddles and walls.
- **Paddle**: A rectangular Arcade Physics body controlled by keyboard input, constrained to vertical movement within the play area.
- **Wall**: An immovable Arcade Physics body at the top and bottom edges of the play area that the Ball bounces off.
- **EventBridge**: The typed singleton event bus (`src/game/systems/EventBridge.ts`) for bidirectional Phaser ↔ React communication.
- **SceneLaunchPayload**: The typed object (`src/game/types/payload.ts`) passed from React to Phaser when launching a scene, containing match settings and player assignments.
- **Scoring_Rules**: The existing pure functions in `src/game/rules/scoring.ts` that award points and determine serve direction.
- **Win_Score**: The target score to win the match, received from SceneLaunchPayload and locked at match start.
- **Serve_Direction**: The horizontal direction the Ball travels after a reset — alternates based on who lost the previous point.
- **Base_Speed**: The initial Ball velocity magnitude when served or after a point is scored.
- **Speed_Increment**: The amount Ball speed increases on each Paddle hit.
- **Max_Speed**: The upper bound on Ball speed to prevent unplayable velocities.

## Requirements

### Requirement 1: Scene Initialization

**User Story:** As a gameplay implementer, I want PongScene to initialize from a SceneLaunchPayload, so that the scene receives validated settings from the React shell and locks them for the match duration.

#### Acceptance Criteria

1. WHEN PongScene receives a SceneLaunchPayload via scene `init()` data, THE PongScene SHALL extract the `winScore` from the payload settings and lock it for the match duration.
2. WHEN PongScene starts, THE PongScene SHALL create a Ball, two Paddles, and top/bottom Walls using Phaser Arcade Physics.
3. THE PongScene SHALL position the left Paddle near the left edge and the right Paddle near the right edge of the play area.
4. THE PongScene SHALL position the Ball at the center of the play area for the initial serve.
5. IF the SceneLaunchPayload is missing or malformed, THEN THE PongScene SHALL use default settings (winScore of 7).

### Requirement 2: Paddle Movement

**User Story:** As a player, I want to control my paddle with keyboard keys, so that I can intercept the ball during a match.

#### Acceptance Criteria

1. WHILE the match is active, THE PongScene SHALL move the left Paddle up when the W key is held and down when the S key is held.
2. WHILE the match is active, THE PongScene SHALL move the right Paddle up when the ArrowUp key is held and down when the ArrowDown key is held.
3. THE PongScene SHALL constrain both Paddles to remain fully within the vertical play area bounds (between top Wall and bottom Wall).
4. WHEN no movement key is held for a Paddle, THE PongScene SHALL stop that Paddle's vertical movement.
5. FOR ALL input sequences, THE PongScene SHALL ensure Paddle positions never exceed the vertical bounds (bounds invariant).

### Requirement 3: Ball Physics

**User Story:** As a player, I want the ball to move realistically, bouncing off walls and paddles, so that gameplay feels responsive and fair.

#### Acceptance Criteria

1. WHEN the match begins or a point is scored, THE PongScene SHALL serve the Ball from the center at Base_Speed in the current Serve_Direction.
2. WHEN the Ball collides with the top or bottom Wall, THE PongScene SHALL reflect the Ball's vertical velocity (bounce).
3. WHEN the Ball collides with a Paddle, THE PongScene SHALL reflect the Ball's horizontal velocity and increase the Ball's speed by Speed_Increment.
4. WHEN the Ball collides with a Paddle, THE PongScene SHALL NOT increase the Ball's speed beyond Max_Speed.
5. WHEN a point is scored, THE PongScene SHALL reset the Ball's speed to Base_Speed for the next serve.
6. THE Ball SHALL maintain constant speed magnitude between collisions (no deceleration or acceleration from physics drag).

### Requirement 4: Ball Speed Increase

**User Story:** As a player, I want the ball to speed up on each paddle hit, so that rallies become progressively more challenging.

#### Acceptance Criteria

1. WHEN the Ball collides with a Paddle, THE PongScene SHALL increase the Ball's total speed by a fixed Speed_Increment amount.
2. THE PongScene SHALL cap the Ball's speed at Max_Speed to prevent unplayable velocities.
3. WHEN a point is scored, THE PongScene SHALL reset the Ball's speed to Base_Speed.
4. FOR ALL paddle hit sequences, THE Ball's speed SHALL remain in the range [Base_Speed, Max_Speed] inclusive (speed bounds invariant).

### Requirement 5: Scoring

**User Story:** As a player, I want points awarded correctly when the ball passes an opponent's edge, so that the match progresses toward a winner.

#### Acceptance Criteria

1. WHEN the Ball exits the left edge of the play area, THE PongScene SHALL call the existing `awardPoint` function with exit edge `left` to award a point to the right player.
2. WHEN the Ball exits the right edge of the play area, THE PongScene SHALL call the existing `awardPoint` function with exit edge `right` to award a point to the left player.
3. WHEN a point is awarded, THE PongScene SHALL emit a `score:update` event via EventBridge with the updated scores for both players.
4. WHEN a point is awarded, THE PongScene SHALL emit an `audio:score-point` event via EventBridge.

### Requirement 6: Win Detection

**User Story:** As a player, I want the match to end when a player reaches the win score, so that there is a clear winner.

#### Acceptance Criteria

1. WHEN a player's score reaches the Win_Score, THE PongScene SHALL stop Ball movement and Paddle input processing.
2. WHEN a player's score reaches the Win_Score, THE PongScene SHALL emit a `match:win` event via EventBridge with the winning player's identifier.
3. WHEN a player's score reaches the Win_Score, THE PongScene SHALL emit an `audio:win` event via EventBridge.
4. THE PongScene SHALL compare scores against the Win_Score value locked at match start, not a dynamically changing value.

### Requirement 7: Serve Mechanics

**User Story:** As a player, I want the serve direction to alternate after each point, so that neither player has a persistent positional advantage.

#### Acceptance Criteria

1. WHEN a point is scored, THE PongScene SHALL use the `nextServeDirection` returned by `awardPoint` to determine the Ball's horizontal direction on the next serve.
2. WHEN the Ball is served, THE PongScene SHALL position the Ball at the center of the play area.
3. WHEN the Ball is served, THE PongScene SHALL launch the Ball at Base_Speed in the determined Serve_Direction.
4. THE PongScene SHALL add a brief delay (300–800ms) between a point being scored and the next serve to allow players to reset.

### Requirement 8: Pause and Resume

**User Story:** As a player, I want the game to pause and resume when the React shell sends a pause event, so that I can take breaks without losing match state.

#### Acceptance Criteria

1. WHEN a `match:pause` event with `{ paused: true }` is received from EventBridge, THE PongScene SHALL freeze all physics simulation (Ball and Paddle movement stops).
2. WHEN a `match:pause` event with `{ paused: false }` is received from EventBridge, THE PongScene SHALL resume physics simulation from the frozen state.
3. WHILE the match is paused, THE PongScene SHALL ignore Paddle movement input.
4. WHEN the match is paused, THE PongScene SHALL emit an `audio:pause` event via EventBridge.

### Requirement 9: Audio Event Emission

**User Story:** As a player, I want distinct audio cues for gameplay events, so that I receive auditory feedback during the match.

#### Acceptance Criteria

1. WHEN the Ball collides with a Paddle, THE PongScene SHALL emit an `audio:paddle-hit` event via EventBridge.
2. WHEN the Ball collides with a top or bottom Wall, THE PongScene SHALL emit an `audio:wall-bounce` event via EventBridge.
3. WHEN a point is scored, THE PongScene SHALL emit an `audio:score-point` event via EventBridge.
4. WHEN a player wins the match, THE PongScene SHALL emit an `audio:win` event via EventBridge.
5. WHEN the match is paused, THE PongScene SHALL emit an `audio:pause` event via EventBridge.

### Requirement 10: Scene Lifecycle

**User Story:** As a gameplay implementer, I want PongScene to support clean startup, restart, and shutdown, so that the React shell can manage match flow without resource leaks.

#### Acceptance Criteria

1. WHEN PongScene is started, THE PongScene SHALL subscribe to `match:pause` events on the EventBridge.
2. WHEN PongScene is shut down, THE PongScene SHALL unsubscribe all EventBridge listeners to prevent memory leaks.
3. WHEN PongScene is restarted (scene restart), THE PongScene SHALL reset scores to 0-0, reset Ball position and speed, and re-read the SceneLaunchPayload.
4. THE PongScene SHALL not retain references to destroyed physics bodies after shutdown.
