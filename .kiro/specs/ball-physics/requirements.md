# Requirements Document

## Introduction

Rework ball bounce mechanics to feel gamey and satisfying rather than like a realistic physics simulation. The current implementation has basic speed ramping (increment on paddle hit, cap at max) but lacks paddle-relative angle influence, degenerate trajectory prevention, and tunable physics constants. This spec delivers pure rule functions for bounce angle calculation, minimum vertical speed enforcement, and a centralized physics config module with named presets. All physics-feel logic lives in the pure rules layer and is wired into PongScene and BreakoutScene at the physics layer.

## Glossary

- **Bounce_Angle_Calculator**: Pure function that computes the ball's outgoing angle based on where it strikes the paddle surface relative to the paddle center.
- **Vertical_Speed_Enforcer**: Pure function that ensures the ball's vertical velocity component never drops below a minimum ratio of total speed, preventing degenerate horizontal trajectories.
- **Physics_Config**: Module containing all tunable physics constants grouped by preset (speed, increment, paddle size) so scenes never hardcode physics values.
- **Speed_Ramping_Engine**: Pure function that computes the new ball speed after a hit, respecting the active speed increase preset and maximum speed cap.
- **Serve_Speed_Resolver**: Pure function that returns the appropriate serve speed for the active ball speed preset.
- **Brick_Hit_Speed_Calculator**: Pure function that computes the speed bump applied when the ball breaks a brick in Breakout mode.
- **Hit_Offset**: The signed distance from the paddle center to the ball contact point, normalized to the range [-1, 1].
- **Max_Bounce_Angle**: The maximum deflection angle (in radians) the ball can achieve when hitting the extreme edge of a paddle.
- **Min_Vertical_Speed_Ratio**: The minimum fraction of total ball speed that the vertical component must maintain.
- **Ball_Speed_Preset**: A named preset (Slow, Normal, Fast) that determines base speed and max speed constants.
- **Speed_Increase_Preset**: A named preset (Off, Gentle, Aggressive) that determines how much the ball accelerates per hit.
- **Paddle_Size_Preset**: A named preset (Small, Normal, Large) that determines paddle height in pixels.

## Requirements

### Requirement 1: Paddle-Relative Bounce Angle Calculation

**User Story:** As a player, I want the ball's bounce angle to change based on where it hits my paddle, so that I have meaningful control over ball direction.

#### Acceptance Criteria

1. WHEN the ball contacts a paddle, THE Bounce_Angle_Calculator SHALL compute the outgoing angle as a smooth, proportional function of the Hit_Offset and the Max_Bounce_Angle.
2. WHEN the ball contacts the center of a paddle (Hit_Offset equals zero), THE Bounce_Angle_Calculator SHALL return an angle of zero (straight horizontal in Pong, straight vertical in Breakout).
3. WHEN the ball contacts the extreme edge of a paddle (Hit_Offset equals 1 or -1), THE Bounce_Angle_Calculator SHALL return an angle equal to Max_Bounce_Angle or negative Max_Bounce_Angle respectively.
4. THE Bounce_Angle_Calculator SHALL produce output angles that vary linearly with Hit_Offset between negative Max_Bounce_Angle and positive Max_Bounce_Angle.
5. FOR ALL valid inputs, THE Bounce_Angle_Calculator SHALL return an angle whose absolute value does not exceed Max_Bounce_Angle.
6. THE Bounce_Angle_Calculator SHALL accept Hit_Offset values outside the range [-1, 1] by clamping them to that range before computing the angle.

### Requirement 2: Degenerate Trajectory Prevention

**User Story:** As a player, I want the ball to always have meaningful vertical movement, so that rallies remain engaging and the ball does not get stuck in boring horizontal loops.

#### Acceptance Criteria

1. WHEN the ball's vertical speed component falls below Min_Vertical_Speed_Ratio multiplied by total speed after any collision, THE Vertical_Speed_Enforcer SHALL adjust the vertical component upward to meet the minimum ratio while preserving total speed magnitude.
2. THE Vertical_Speed_Enforcer SHALL preserve the sign of the original vertical velocity when adjusting the vertical component.
3. THE Vertical_Speed_Enforcer SHALL preserve the total speed magnitude (sqrt of vx squared plus vy squared) after adjustment.
4. IF the vertical component already meets or exceeds the minimum ratio, THEN THE Vertical_Speed_Enforcer SHALL return the velocity unchanged.
5. FOR ALL outputs of the Vertical_Speed_Enforcer, the absolute value of the vertical component SHALL be greater than or equal to Min_Vertical_Speed_Ratio multiplied by total speed.

### Requirement 3: Physics Configuration Module

**User Story:** As a developer, I want all physics-feel parameters centralized in a single config module with named presets, so that tuning game feel does not require modifying scene code.

#### Acceptance Criteria

1. THE Physics_Config SHALL define base speed constants for each Ball_Speed_Preset: Slow, Normal, and Fast.
2. THE Physics_Config SHALL define max speed constants for each Ball_Speed_Preset: Slow, Normal, and Fast.
3. THE Physics_Config SHALL define speed increment constants for each Speed_Increase_Preset: Off, Gentle, and Aggressive.
4. THE Physics_Config SHALL define paddle height constants for each Paddle_Size_Preset: Small, Normal, and Large.
5. THE Physics_Config SHALL define a Max_Bounce_Angle constant in radians.
6. THE Physics_Config SHALL define a Min_Vertical_Speed_Ratio constant as a fraction of total speed.
7. THE Physics_Config SHALL define a brick-hit speed bump constant for Breakout mode.
8. THE Physics_Config SHALL define serve speed values for each Ball_Speed_Preset.
9. THE Physics_Config SHALL export a lookup function that accepts a Ball_Speed_Preset and Speed_Increase_Preset and returns the corresponding base speed, max speed, and increment values.
10. THE Physics_Config SHALL use readonly types to prevent runtime mutation of constants.

### Requirement 4: Speed Ramping

**User Story:** As a player, I want the ball to gradually speed up during a rally, so that tension builds as the rally continues without the speed becoming uncontrollable.

#### Acceptance Criteria

1. WHEN the ball hits a paddle in Pong mode, THE Speed_Ramping_Engine SHALL increase the ball speed by the increment value corresponding to the active Speed_Increase_Preset.
2. WHEN the ball hits a brick in Breakout mode, THE Speed_Ramping_Engine SHALL increase the ball speed by the increment value corresponding to the active Speed_Increase_Preset.
3. THE Speed_Ramping_Engine SHALL cap the ball speed at the max speed value corresponding to the active Ball_Speed_Preset.
4. FOR ALL inputs, THE Speed_Ramping_Engine SHALL return a speed that does not exceed the max speed for the active preset.
5. WHEN the Speed_Increase_Preset is Off, THE Speed_Ramping_Engine SHALL return the current speed unchanged.
6. WHEN a point is scored in Pong, THE Serve_Speed_Resolver SHALL reset ball speed to the base speed for the active Ball_Speed_Preset.
7. WHEN a life is lost in Breakout, THE Serve_Speed_Resolver SHALL reset ball speed to the base speed for the active Ball_Speed_Preset.

### Requirement 5: Breakout Brick-Hit Speed Bump

**User Story:** As a player, I want brick hits in Breakout to feel punchy and impactful, so that breaking bricks provides satisfying feedback.

#### Acceptance Criteria

1. WHEN the ball breaks a brick in Breakout mode, THE Brick_Hit_Speed_Calculator SHALL apply an additional speed bump on top of the standard speed increment.
2. THE Brick_Hit_Speed_Calculator SHALL cap the resulting speed at the max speed for the active Ball_Speed_Preset.
3. THE Brick_Hit_Speed_Calculator SHALL apply the brick-hit speed bump constant defined in Physics_Config.

### Requirement 6: Snappy Serve Behavior

**User Story:** As a player, I want the ball to launch with purpose after a serve, so that the start of each rally feels intentional and responsive.

#### Acceptance Criteria

1. WHEN a serve occurs in Pong mode, THE Serve_Speed_Resolver SHALL return the base speed for the active Ball_Speed_Preset as the initial ball speed.
2. WHEN a serve occurs in Breakout mode, THE Serve_Speed_Resolver SHALL return the base speed for the active Ball_Speed_Preset as the initial ball speed.
3. THE Serve_Speed_Resolver SHALL return a speed that produces noticeable ball movement from the first frame of travel.
4. WHEN a serve occurs in Pong mode, THE PongScene SHALL launch the ball in the direction of the player who was scored upon (alternating serve direction).
5. WHEN a serve occurs in Breakout mode, THE BreakoutScene SHALL launch the ball upward at a slight random angle between negative 30 degrees and positive 30 degrees from vertical.

### Requirement 7: Scene Integration

**User Story:** As a player, I want the improved ball physics to apply consistently in both Pong and Breakout modes, so that the game feels polished across all modes.

#### Acceptance Criteria

1. WHEN the ball collides with a paddle in PongScene, THE PongScene SHALL use the Bounce_Angle_Calculator to determine the outgoing ball direction.
2. WHEN the ball collides with a paddle in BreakoutScene, THE BreakoutScene SHALL use the Bounce_Angle_Calculator to determine the outgoing ball direction.
3. WHEN any collision occurs in PongScene, THE PongScene SHALL apply the Vertical_Speed_Enforcer to the resulting velocity.
4. WHEN any collision occurs in BreakoutScene, THE BreakoutScene SHALL apply the Vertical_Speed_Enforcer to the resulting velocity.
5. THE PongScene SHALL read speed preset values from Physics_Config based on the match settings received at launch.
6. THE BreakoutScene SHALL read speed preset values from Physics_Config based on the match settings received at launch.
7. THE PongScene SHALL not contain hardcoded physics constants for ball speed, angle, or increment values.
8. THE BreakoutScene SHALL not contain hardcoded physics constants for ball speed, angle, or increment values.

### Requirement 8: Property-Based Test Coverage

**User Story:** As a developer, I want property-based tests that verify physics invariants hold across all valid inputs, so that edge cases in angle calculation, speed capping, and trajectory enforcement are caught automatically.

#### Acceptance Criteria

1. FOR ALL valid Hit_Offset values in the range [-1, 1] and positive Max_Bounce_Angle values, THE Bounce_Angle_Calculator output SHALL have an absolute value less than or equal to Max_Bounce_Angle.
2. FOR ALL valid velocity pairs (vx, vy) where total speed is greater than zero, THE Vertical_Speed_Enforcer output SHALL have a vertical component whose absolute value is greater than or equal to Min_Vertical_Speed_Ratio multiplied by total speed.
3. FOR ALL valid velocity pairs (vx, vy), THE Vertical_Speed_Enforcer output SHALL preserve total speed magnitude within floating-point tolerance.
4. FOR ALL valid current speeds and Speed_Increase_Preset configurations, THE Speed_Ramping_Engine output SHALL not exceed the max speed for the active Ball_Speed_Preset.
5. FOR ALL valid current speeds and Speed_Increase_Preset of Off, THE Speed_Ramping_Engine output SHALL equal the input speed.
