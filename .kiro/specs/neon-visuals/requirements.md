# Requirements Document

## Introduction

This spec delivers the neon arcade visual treatment for Paddle Arcade. It adds programmatic glow outlines to game objects (paddles, ball, bricks), particle explosions on gameplay events (score, brick break, win), camera shake on score/life loss, and screen flash on win. All effects are rendered programmatically using Phaser 3 Graphics, Particle Emitters, and Camera effects — no external image assets are required. The visual system maintains 60fps with all effects active and provides a consistent neon aesthetic that complements the existing React UI styling.

## Glossary

- **Glow_Renderer**: The system responsible for drawing neon glow outlines around game objects using Phaser Graphics API and layered strokes with decreasing alpha.
- **Particle_System**: The Phaser particle emitter configuration that produces burst effects on gameplay events.
- **Camera_Effects**: Phaser Camera shake and flash methods used for screen-level feedback on scoring and win events.
- **Game_Object**: Any Phaser physics body rendered in a scene — paddles, ball, bricks, and walls.
- **Neon_Color**: A high-saturation, high-brightness color value used for glow outlines and particle tints.
- **Effect_Trigger**: A gameplay event (score point, brick break, life loss, match win) that activates a visual effect.
- **Pong_Scene**: The Phaser scene handling Pong Solo and Pong Versus modes.
- **Breakout_Scene**: The Phaser scene handling Breakout mode.
- **Event_Bridge**: The typed communication layer carrying events between Phaser scenes, systems, and React components.
- **Frame_Budget**: The maximum time per frame (16.67ms at 60fps) available for rendering, physics, and effects combined.

## Requirements

### Requirement 1: Neon Glow on Paddles

**User Story:** As a player, I want paddles to have a visible neon glow outline, so that they stand out against the dark background and feel like an arcade game.

#### Acceptance Criteria

1. THE Glow_Renderer SHALL draw a neon glow outline around each paddle in Pong_Scene.
2. THE Glow_Renderer SHALL draw a neon glow outline around the paddle in Breakout_Scene.
3. THE Glow_Renderer SHALL render the glow using multiple layered strokes with decreasing alpha to simulate light falloff.
4. THE Glow_Renderer SHALL use a distinct Neon_Color for paddles that provides high contrast against the dark background.
5. THE Glow_Renderer SHALL update the glow position every frame to track paddle movement.
6. THE Glow_Renderer SHALL render all glow effects programmatically using Phaser Graphics API without external image assets.

### Requirement 2: Neon Glow on Ball

**User Story:** As a player, I want the ball to have a neon glow, so that it is easy to track and visually consistent with the arcade aesthetic.

#### Acceptance Criteria

1. THE Glow_Renderer SHALL draw a neon glow outline around the ball in Pong_Scene.
2. THE Glow_Renderer SHALL draw a neon glow outline around the ball in Breakout_Scene.
3. THE Glow_Renderer SHALL use a distinct Neon_Color for the ball that differentiates it from paddles.
4. THE Glow_Renderer SHALL update the ball glow position every frame to track ball movement.
5. THE Glow_Renderer SHALL render the ball glow as concentric circles with decreasing alpha.

### Requirement 3: Neon Glow on Bricks

**User Story:** As a player, I want bricks to have a subtle neon glow, so that the brick grid looks vibrant and the game feels alive.

#### Acceptance Criteria

1. THE Glow_Renderer SHALL draw a neon glow outline around each brick in Breakout_Scene.
2. THE Glow_Renderer SHALL use the brick's existing row color as the base Neon_Color for its glow.
3. THE Glow_Renderer SHALL remove the glow for a brick when that brick is destroyed.
4. THE Glow_Renderer SHALL render brick glows with lower intensity than paddle and ball glows to avoid visual clutter.

### Requirement 4: Particle Explosion on Score Point

**User Story:** As a player, I want a particle burst when a point is scored in Pong, so that scoring feels impactful and rewarding.

#### Acceptance Criteria

1. WHEN a point is scored in Pong_Scene, THE Particle_System SHALL emit a burst of particles at the scoring edge.
2. THE Particle_System SHALL use a Neon_Color tint for score particles that matches the scoring player's side.
3. THE Particle_System SHALL emit between 15 and 30 particles per score burst.
4. THE Particle_System SHALL complete the particle animation within 800 milliseconds.
5. THE Particle_System SHALL render particles programmatically without external image assets.

### Requirement 5: Particle Explosion on Brick Break

**User Story:** As a player, I want a particle burst when a brick is destroyed, so that breaking bricks feels satisfying.

#### Acceptance Criteria

1. WHEN a brick is destroyed in Breakout_Scene, THE Particle_System SHALL emit a burst of particles at the brick's position.
2. THE Particle_System SHALL tint brick-break particles with the destroyed brick's row color.
3. THE Particle_System SHALL emit between 8 and 15 particles per brick break.
4. THE Particle_System SHALL complete the brick-break particle animation within 500 milliseconds.
5. THE Particle_System SHALL render particles programmatically without external image assets.

### Requirement 6: Particle Explosion on Match Win

**User Story:** As a player, I want a large particle celebration when I win a match, so that winning feels climactic.

#### Acceptance Criteria

1. WHEN a match is won, THE Particle_System SHALL emit a large burst of particles from the center of the screen.
2. THE Particle_System SHALL use multiple Neon_Colors for win celebration particles.
3. THE Particle_System SHALL emit between 40 and 60 particles for the win celebration.
4. THE Particle_System SHALL complete the win celebration animation within 1500 milliseconds.
5. THE Particle_System SHALL render particles programmatically without external image assets.

### Requirement 7: Camera Shake on Score and Life Loss

**User Story:** As a player, I want the screen to shake briefly when a point is scored or a life is lost, so that these events feel impactful.

#### Acceptance Criteria

1. WHEN a point is scored in Pong_Scene, THE Camera_Effects SHALL apply a short camera shake.
2. WHEN a life is lost in Breakout_Scene, THE Camera_Effects SHALL apply a short camera shake.
3. THE Camera_Effects SHALL limit shake duration to 150 milliseconds or less.
4. THE Camera_Effects SHALL limit shake intensity to a maximum displacement of 5 pixels.
5. THE Camera_Effects SHALL not apply shake while the match is paused.

### Requirement 8: Screen Flash on Win

**User Story:** As a player, I want a brief screen flash when I win a match, so that the victory moment is visually distinct.

#### Acceptance Criteria

1. WHEN a match is won, THE Camera_Effects SHALL apply a brief white screen flash.
2. THE Camera_Effects SHALL limit flash duration to 300 milliseconds or less.
3. THE Camera_Effects SHALL fade the flash from full intensity to transparent over its duration.
4. THE Camera_Effects SHALL apply the flash before or simultaneously with the win particle celebration.

### Requirement 9: Performance Target

**User Story:** As a player, I want the game to maintain smooth 60fps gameplay with all visual effects active, so that effects enhance rather than degrade the experience.

#### Acceptance Criteria

1. WHILE all visual effects are active, THE Pong_Scene SHALL maintain a frame rate of 60 frames per second.
2. WHILE all visual effects are active, THE Breakout_Scene SHALL maintain a frame rate of 60 frames per second.
3. THE Glow_Renderer SHALL use efficient rendering techniques that stay within the Frame_Budget.
4. THE Particle_System SHALL limit the maximum number of simultaneous active particles to 200.
5. THE Particle_System SHALL reuse particle emitter instances rather than creating new emitters per event.

### Requirement 10: Programmatic Rendering

**User Story:** As a developer, I want all visual effects rendered programmatically, so that the game requires no external image assets and remains self-contained.

#### Acceptance Criteria

1. THE Glow_Renderer SHALL generate all glow textures using Phaser Graphics API draw calls.
2. THE Particle_System SHALL use programmatically generated textures for particle sprites.
3. THE Camera_Effects SHALL use built-in Phaser Camera methods for shake and flash.
4. THE Pong_Scene SHALL not load any external image, spritesheet, or atlas assets for visual effects.
5. THE Breakout_Scene SHALL not load any external image, spritesheet, or atlas assets for visual effects.

### Requirement 11: Dark Background with High Contrast

**User Story:** As a player, I want a dark neutral background with high-contrast glowing objects, so that the neon aesthetic is clear and readable.

#### Acceptance Criteria

1. THE Pong_Scene SHALL use a dark neutral background color (near-black) as the base canvas.
2. THE Breakout_Scene SHALL use a dark neutral background color (near-black) as the base canvas.
3. THE Glow_Renderer SHALL produce glow colors with sufficient contrast ratio against the dark background for clear visibility.
4. THE Glow_Renderer SHALL ensure game objects remain clearly distinguishable from each other through distinct Neon_Colors.
