# Implementation Tasks

## Task 1: Create NeonGlow utility system

- [ ] 1.1 Create `src/game/systems/NeonGlow.ts` with `GlowConfig` interface and `NeonGlow` class
- [ ] 1.2 Implement `addRectGlow(x, y, width, height, config)` method for paddle/brick glow rendering using layered strokes
- [ ] 1.3 Implement `addCircleGlow(x, y, radius, config)` method for ball glow rendering using concentric circles
- [ ] 1.4 Implement `updatePosition(id, x, y)` method to reposition glow graphics for moving objects
- [ ] 1.5 Implement `removeGlow(id)` method to destroy individual glow graphics (for brick destruction)
- [ ] 1.6 Implement `destroy()` method to clean up all glow graphics on scene shutdown
- [ ] 1.7 Define neon color palette constants: paddle cyan `0x00ffff`, ball white `0xffffff`, wall purple `0x6600cc`
- [ ] 1.8 Add unit test for glow config validation (layer count > 0, alpha values in range, width values positive)

## Task 2: Create NeonParticles utility system

- [ ] 2.1 Create `src/game/systems/NeonParticles.ts` with `BurstConfig` interface and `NeonParticles` class
- [ ] 2.2 Implement `generateParticleTexture(scene)` to create a 16x16 radial gradient circle texture programmatically
- [ ] 2.3 Implement `createEmitters(scene)` to pre-create score, brick-break, and win emitters with max particle caps
- [ ] 2.4 Implement `burstScore(x, y, tint)` method for score point particle explosion (20 particles, 800ms lifespan)
- [ ] 2.5 Implement `burstBrickBreak(x, y, tint)` method for brick destruction particles (10 particles, 500ms lifespan)
- [ ] 2.6 Implement `burstWin(x, y)` method for win celebration particles (50 particles, 1500ms lifespan, multi-color)
- [ ] 2.7 Implement `destroy()` method to clean up emitters and generated texture
- [ ] 2.8 Add unit test verifying max particle configuration respects 200-particle cap across emitters

## Task 3: Integrate neon glow into PongScene

- [ ] 3.1 Import `NeonGlow` and instantiate in `PongScene.create()` after game objects are created
- [ ] 3.2 Add glow to left paddle, right paddle, and ball with appropriate neon colors
- [ ] 3.3 Update background color from `#111111` to `#0a0a0f` for blue-tinted near-black
- [ ] 3.4 Call glow position updates in `PongScene.update()` for paddle and ball tracking
- [ ] 3.5 Destroy glow system in `PongScene.shutdown()`
- [ ] 3.6 Verify paddles and ball render with visible glow outlines during manual play-test

## Task 4: Integrate neon glow into BreakoutScene

- [ ] 4.1 Import `NeonGlow` and instantiate in `BreakoutScene.create()` after game objects are created
- [ ] 4.2 Add glow to paddle and ball with appropriate neon colors
- [ ] 4.3 Add glow to each brick using the brick's row color as the glow tint (lower intensity)
- [ ] 4.4 Update background color from `#111111` to `#0a0a0f` for blue-tinted near-black
- [ ] 4.5 Call glow position updates in `BreakoutScene.update()` for paddle and ball tracking
- [ ] 4.6 Remove brick glow in `onBrickHit()` when a brick is destroyed
- [ ] 4.7 Destroy glow system in `BreakoutScene.shutdown()`
- [ ] 4.8 Verify bricks, paddle, and ball render with visible glow outlines during manual play-test

## Task 5: Integrate particle effects into PongScene

- [ ] 5.1 Import `NeonParticles` and instantiate in `PongScene.create()`
- [ ] 5.2 Generate particle texture in `PongScene.create()` using `NeonParticles.generateParticleTexture()`
- [ ] 5.3 Trigger `burstScore()` in `onBallExit()` at the scoring edge position with appropriate tint
- [ ] 5.4 Trigger `burstWin()` in `triggerWin()` at screen center
- [ ] 5.5 Destroy particle system in `PongScene.shutdown()`
- [ ] 5.6 Verify particle bursts appear on score and win during manual play-test

## Task 6: Integrate particle effects into BreakoutScene

- [ ] 6.1 Import `NeonParticles` and instantiate in `BreakoutScene.create()`
- [ ] 6.2 Generate particle texture in `BreakoutScene.create()` using `NeonParticles.generateParticleTexture()`
- [ ] 6.3 Trigger `burstBrickBreak()` in `onBrickHit()` at the destroyed brick's position with brick color tint
- [ ] 6.4 Trigger `burstWin()` in `triggerWin()` at screen center
- [ ] 6.5 Destroy particle system in `BreakoutScene.shutdown()`
- [ ] 6.6 Verify particle bursts appear on brick break and win during manual play-test

## Task 7: Integrate camera effects into PongScene

- [ ] 7.1 Add camera shake call in `PongScene.onBallExit()` — duration 100ms, intensity 0.005
- [ ] 7.2 Add camera flash call in `PongScene.triggerWin()` — duration 250ms, white color, alpha 0.6
- [ ] 7.3 Guard camera effects to not trigger while `this.paused` is true
- [ ] 7.4 Verify camera shake on score and flash on win during manual play-test

## Task 8: Integrate camera effects into BreakoutScene

- [ ] 8.1 Add camera shake call in `BreakoutScene.onBallExitBottom()` — duration 100ms, intensity 0.005
- [ ] 8.2 Add camera flash call in `BreakoutScene.triggerWin()` — duration 250ms, white color, alpha 0.6
- [ ] 8.3 Guard camera effects to not trigger while `this.paused` is true
- [ ] 8.4 Verify camera shake on life loss and flash on win during manual play-test

## Task 9: Validation and performance verification

- [ ] 9.1 Run `npm run typecheck` and fix any type errors
- [ ] 9.2 Run `npm run lint` and fix any lint violations
- [ ] 9.3 Run `npm test` and verify no existing tests are broken
- [ ] 9.4 Manual play-test Pong Solo: confirm glow, particles, shake, flash all work at 60fps
- [ ] 9.5 Manual play-test Pong Versus: confirm glow, particles, shake, flash all work at 60fps
- [ ] 9.6 Manual play-test Breakout: confirm glow, particles, shake, flash all work at 60fps
- [ ] 9.7 Verify scene restart cleans up all effects and re-creates them correctly
- [ ] 9.8 Verify pause does not trigger visual effects
- [ ] 9.9 Run `npm run build` and confirm production build succeeds
