# Implementation Plan: Ball Physics

## Overview

Implement pure rule functions for ball bounce angle, vertical speed enforcement, speed ramping with presets, and a centralized physics config module. Wire these into PongScene and BreakoutScene, replacing the existing `ball-speed.ts` module and removing hardcoded physics constants from scenes.

## Tasks

- [x] 1. Add preset types and extend MatchSettings
  - [x] 1.1 Add preset type aliases to `src/game/types/settings.ts`
    - Add `BallSpeedPreset = 'slow' | 'normal' | 'fast'`
    - Add `SpeedIncreasePreset = 'off' | 'gentle' | 'aggressive'`
    - Add `PaddleSizePreset = 'small' | 'normal' | 'large'`
    - Extend `MatchSettingsBase` with `ballSpeedPreset`, `paddleSizePreset`, `speedIncreasePreset`
    - Add `startingLives` and `brickDensity` fields to `BreakoutSettings`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 1.2 Update settings validator for new fields
    - Validate `ballSpeedPreset` against allowed values in all modes
    - Validate `paddleSizePreset` against allowed values in all modes
    - Validate `speedIncreasePreset` against allowed values in all modes
    - Validate `startingLives` and `brickDensity` for breakout mode
    - Default missing preset fields to `'normal'` / `'gentle'` for backward compatibility
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 1.3 Write unit tests for updated settings validator
    - Test valid preset combinations pass validation
    - Test invalid preset values are rejected
    - Test backward compatibility with settings missing new fields
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 2. Implement physics config module
  - [x] 2.1 Create `src/game/rules/physics-config.ts`
    - Define `PHYSICS` constant object with all preset values (base speeds, max speeds, increments, paddle heights)
    - Define `MAX_BOUNCE_ANGLE` (π/3 radians)
    - Define `MIN_VERTICAL_SPEED_RATIO` (0.15)
    - Define `BRICK_HIT_SPEED_BUMP` (8 px/s)
    - Define `SERVE_DELAY_MS` (750ms)
    - Export `SpeedConfig` interface
    - Export `getSpeedConfig(ballSpeed, speedIncrease)` lookup function
    - Use `as const` and readonly types to prevent mutation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

  - [ ]* 2.2 Write unit tests for physics config
    - Verify all 9 preset combinations return correct SpeedConfig
    - Verify baseSpeed < maxSpeed for each ball speed preset
    - Verify increment is 0 for 'off' preset
    - Verify all constants are within sensible ranges
    - _Requirements: 3.9, 3.10_

- [x] 3. Implement bounce angle calculator
  - [x] 3.1 Create `src/game/rules/bounce-angle.ts`
    - Implement `computeBounceAngle(hitOffset, maxAngle)` as a pure function
    - Clamp hitOffset to [-1, 1] before computing
    - Return `clamp(hitOffset, -1, 1) * maxAngle`
    - Handle edge case: maxAngle ≤ 0 returns 0
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 3.2 Write property test for bounce angle (Property 1)
    - **Property 1: Bounce angle linearity and bounds**
    - For any hitOffset and positive maxAngle, result equals `clamp(hitOffset, -1, 1) * maxAngle` and `|result| <= maxAngle`
    - Use fast-check with 200 iterations
    - Tag: `Feature: ball-physics, Property 1: Bounce angle linearity and bounds`
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 8.1**

  - [ ]* 3.3 Write unit tests for bounce angle edge cases
    - Center hit (offset=0) returns 0
    - Edge hit (offset=1) returns maxAngle
    - Edge hit (offset=-1) returns -maxAngle
    - Out-of-range offset (e.g., 1.5) is clamped
    - maxAngle=0 returns 0
    - _Requirements: 1.2, 1.3, 1.6_

- [x] 4. Implement vertical speed enforcer
  - [x] 4.1 Create `src/game/rules/vertical-speed.ts`
    - Implement `ensureMinimumVerticalSpeed(vx, vy, minVyRatio)` as a pure function
    - If `|vy| >= minVyRatio * totalSpeed`, return unchanged
    - Otherwise, set `|vy| = minVyRatio * totalSpeed`, recompute vx to preserve total speed
    - Preserve sign of vy (if vy=0, default to positive)
    - Handle edge case: totalSpeed=0 returns {vx: 0, vy: 0}
    - Handle edge case: minVyRatio >= 1 clamp to 0.99
    - Export `Velocity` interface
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 4.2 Write property test for vertical speed minimum guarantee (Property 2)
    - **Property 2: Vertical speed enforcer minimum guarantee**
    - For any (vx, vy) where totalSpeed > 0, output `|vy| >= minVyRatio * totalSpeed`
    - Use fast-check with 200 iterations
    - Tag: `Feature: ball-physics, Property 2: Vertical speed enforcer minimum guarantee`
    - **Validates: Requirements 2.1, 2.5, 8.2**

  - [ ]* 4.3 Write property test for total speed preservation (Property 3)
    - **Property 3: Vertical speed enforcer preserves total speed**
    - For any (vx, vy) where totalSpeed > 0, output magnitude equals input magnitude within ±1e-9
    - Use fast-check with 200 iterations
    - Tag: `Feature: ball-physics, Property 3: Vertical speed enforcer preserves total speed`
    - **Validates: Requirements 2.3, 8.3**

  - [ ]* 4.4 Write property test for sign preservation (Property 4)
    - **Property 4: Vertical speed enforcer preserves sign**
    - For any (vx, vy) where vy ≠ 0, output vy has same sign as input vy
    - Use fast-check with 200 iterations
    - Tag: `Feature: ball-physics, Property 4: Vertical speed enforcer preserves sign`
    - **Validates: Requirements 2.2**

  - [ ]* 4.5 Write unit tests for vertical speed edge cases
    - Already-valid velocity passes through unchanged
    - Zero-speed input returns {vx: 0, vy: 0}
    - vy=0 case gets corrected to positive vy
    - _Requirements: 2.4_

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement speed ramping module
  - [x] 6.1 Create `src/game/rules/speed-ramping.ts`
    - Implement `computeSpeedAfterHit(currentSpeed, config)` — adds increment, caps at maxSpeed
    - Implement `computeBrickHitSpeed(currentSpeed, config, brickBump)` — adds increment + brickBump, caps at maxSpeed
    - Implement `getServeSpeed(config)` — returns config.baseSpeed
    - Handle edge case: currentSpeed > maxSpeed returns maxSpeed
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 6.1, 6.2_

  - [ ]* 6.2 Write property test for speed cap (Property 5)
    - **Property 5: Speed ramping never exceeds max**
    - For any currentSpeed ≥ 0 and valid SpeedConfig, output ≤ config.maxSpeed
    - Use fast-check with 200 iterations
    - Tag: `Feature: ball-physics, Property 5: Speed ramping never exceeds max`
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 8.4**

  - [ ]* 6.3 Write property test for identity when Off (Property 6)
    - **Property 6: Speed ramping identity when Off**
    - For any currentSpeed ≥ 0 and SpeedConfig where increment=0, output equals min(currentSpeed, maxSpeed)
    - Use fast-check with 200 iterations
    - Tag: `Feature: ball-physics, Property 6: Speed ramping identity when Off`
    - **Validates: Requirements 4.5, 8.5**

  - [ ]* 6.4 Write property test for brick hit speed cap (Property 7)
    - **Property 7: Brick hit speed bump never exceeds max**
    - For any currentSpeed ≥ 0, valid SpeedConfig, and non-negative brickBump, output ≤ config.maxSpeed
    - Use fast-check with 200 iterations
    - Tag: `Feature: ball-physics, Property 7: Brick hit speed bump never exceeds max`
    - **Validates: Requirements 5.1, 5.2, 5.3**

  - [ ]* 6.5 Write unit tests for speed ramping
    - Increment adds correctly below cap
    - Cap works at boundary (currentSpeed + increment > maxSpeed)
    - getServeSpeed returns baseSpeed for each preset
    - Brick bump adds on top of increment
    - _Requirements: 4.1, 4.3, 5.1, 6.1, 6.2_

- [ ] 7. Remove old ball-speed module and migrate imports
  - [x] 7.1 Delete `src/game/rules/ball-speed.ts` and `src/game/rules/ball-speed.test.ts`
    - Remove the old module files
    - _Requirements: 4.1_

  - [x] 7.2 Update PongScene imports from `ball-speed` to `speed-ramping` and `physics-config`
    - Replace `import { computeSpeedAfterHit } from '../rules/ball-speed'` with new imports
    - Use `getSpeedConfig` to resolve preset-based config from match settings
    - _Requirements: 7.5, 7.7_

  - [x] 7.3 Update BreakoutScene imports from `ball-speed` to `speed-ramping` and `physics-config`
    - Replace `import { computeSpeedAfterHit } from '../rules/ball-speed'` with new imports
    - Use `getSpeedConfig` to resolve preset-based config from match settings
    - _Requirements: 7.6, 7.8_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Wire bounce angle into PongScene
  - [x] 9.1 Integrate `computeBounceAngle` into PongScene paddle collision
    - Import `computeBounceAngle` from `bounce-angle.ts`
    - In `onPaddleHit`, compute hitOffset as `(ball.y - paddle.y) / (paddleHeight / 2)`
    - Use `computeBounceAngle(hitOffset, PHYSICS.MAX_BOUNCE_ANGLE)` to get angle
    - Compute vx/vy from angle and currentSpeed, preserving horizontal direction
    - Remove hardcoded angle logic
    - Read `MAX_BOUNCE_ANGLE` from physics-config, not a local constant
    - _Requirements: 7.1, 7.7_

  - [x] 9.2 Read paddle height from physics config in PongScene
    - Use `PHYSICS.PADDLE_HEIGHT[paddleSizePreset]` from match settings for paddle dimensions
    - Remove hardcoded `PADDLE_HEIGHT` constant from scene
    - _Requirements: 7.5, 7.7_

- [ ] 10. Wire bounce angle into BreakoutScene
  - [x] 10.1 Integrate `computeBounceAngle` into BreakoutScene paddle collision
    - Import `computeBounceAngle` from `bounce-angle.ts`
    - In `onPaddleHit`, compute hitOffset as `(ball.x - paddle.x) / (paddleWidth / 2)`
    - Use `computeBounceAngle(hitOffset, PHYSICS.MAX_BOUNCE_ANGLE)` to get angle
    - Compute vx/vy from angle and currentSpeed (ball goes upward after paddle hit)
    - Remove hardcoded angle logic (`hitOffset * Math.PI / 3`)
    - Read `MAX_BOUNCE_ANGLE` from physics-config
    - _Requirements: 7.2, 7.8_

  - [x] 10.2 Read paddle width from physics config in BreakoutScene
    - Use `PHYSICS.PADDLE_HEIGHT[paddleSizePreset]` for paddle width (Breakout uses horizontal paddle)
    - Remove hardcoded `PADDLE_WIDTH` constant from scene
    - _Requirements: 7.6, 7.8_

- [ ] 11. Wire vertical speed enforcer into scenes
  - [x] 11.1 Integrate `ensureMinimumVerticalSpeed` into PongScene
    - Import `ensureMinimumVerticalSpeed` from `vertical-speed.ts`
    - Call after paddle collision (after setting velocity from bounce angle)
    - Call after wall collision
    - Use `PHYSICS.MIN_VERTICAL_SPEED_RATIO` from physics-config
    - _Requirements: 7.3, 7.7_

  - [x] 11.2 Integrate `ensureMinimumVerticalSpeed` into BreakoutScene
    - Import `ensureMinimumVerticalSpeed` from `vertical-speed.ts`
    - Call after paddle collision (after setting velocity from bounce angle)
    - Call after wall collision
    - Call after brick collision
    - Use `PHYSICS.MIN_VERTICAL_SPEED_RATIO` from physics-config
    - _Requirements: 7.4, 7.8_

- [ ] 12. Wire speed ramping with preset config into scenes
  - [x] 12.1 Update PongScene to use preset-based speed ramping
    - Read `ballSpeedPreset` and `speedIncreasePreset` from match settings in `init()`
    - Call `getSpeedConfig(ballSpeedPreset, speedIncreasePreset)` to get runtime config
    - Use `computeSpeedAfterHit(currentSpeed, speedConfig)` in `onPaddleHit`
    - Use `getServeSpeed(speedConfig)` in `serve()` for reset speed
    - Remove hardcoded `BASE_SPEED`, `SPEED_INCREMENT`, `MAX_SPEED` from scene
    - _Requirements: 4.1, 4.3, 4.6, 6.1, 7.5, 7.7_

  - [x] 12.2 Update BreakoutScene to use preset-based speed ramping
    - Read `ballSpeedPreset` and `speedIncreasePreset` from match settings in `init()`
    - Call `getSpeedConfig(ballSpeedPreset, speedIncreasePreset)` to get runtime config
    - Use `computeSpeedAfterHit(currentSpeed, speedConfig)` in `onPaddleHit`
    - Use `computeBrickHitSpeed(currentSpeed, speedConfig, PHYSICS.BRICK_HIT_SPEED_BUMP)` in `onBrickHit`
    - Use `getServeSpeed(speedConfig)` in `serve()` and `onBallExitBottom` for reset speed
    - Remove hardcoded `BASE_SPEED`, `SPEED_INCREMENT`, `MAX_SPEED` from scene
    - _Requirements: 4.2, 4.3, 5.1, 5.2, 5.3, 6.2, 7.6, 7.8_

- [ ] 13. Update serve behavior in scenes
  - [x] 13.1 Update PongScene serve to use preset serve speed
    - Use `getServeSpeed(speedConfig)` instead of hardcoded `BASE_SPEED`
    - Maintain alternating serve direction logic (toward player who was scored upon)
    - Use `PHYSICS.SERVE_DELAY_MS` from physics-config for serve delay
    - _Requirements: 4.6, 6.1, 6.4_

  - [x] 13.2 Update BreakoutScene serve to use preset serve speed
    - Use `getServeSpeed(speedConfig)` instead of hardcoded `BASE_SPEED`
    - Maintain upward launch at random angle between -30° and +30° from vertical
    - Use `PHYSICS.SERVE_DELAY_MS` from physics-config for serve delay
    - _Requirements: 4.7, 6.2, 6.5_

- [ ] 14. Remove remaining hardcoded physics constants from scenes
  - [x] 14.1 Audit and remove hardcoded physics values from PongScene
    - Remove `BASE_SPEED`, `SPEED_INCREMENT`, `MAX_SPEED` from PONG constants object
    - Ensure all physics values come from physics-config or match settings
    - Keep non-physics layout constants (GAME_WIDTH, GAME_HEIGHT, WALL_THICKNESS, etc.)
    - _Requirements: 7.7_

  - [x] 14.2 Audit and remove hardcoded physics values from BreakoutScene
    - Remove `BASE_SPEED`, `SPEED_INCREMENT`, `MAX_SPEED` from BREAKOUT constants object
    - Ensure all physics values come from physics-config or match settings
    - Keep non-physics layout constants (GAME_WIDTH, GAME_HEIGHT, WALL_THICKNESS, etc.)
    - _Requirements: 7.8_

- [x] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Verify no hardcoded physics constants remain in scene files
  - Verify all imports resolve correctly after ball-speed.ts removal

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The existing `paddle-physics.ts` remains unchanged — bounce angle is a separate concern
- Scene integration (Requirements 7.x) is verified through code structure — scenes import pure functions and read from physics-config
