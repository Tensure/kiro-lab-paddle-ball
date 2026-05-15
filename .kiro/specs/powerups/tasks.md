# Implementation Plan: Powerups

## Overview

Implement the optional powerup system for all three game modes. Pure data and logic modules are built first (no Phaser dependency), then the PowerupManager system, then scene integration. Tests accompany each layer. The system is inert when `powerupsEnabled` is false.

## Tasks

- [ ] 1. Define powerup types
  - [ ] 1.1 Create `src/game/types/powerup.ts` with PowerupId, EffectType, PowerupDefinition, ActiveEffect, and SpawnConfig types
    - Export `PowerupId` as string literal union of all 11 powerup IDs
    - Export `EffectType` as `'beneficial' | 'harmful' | 'neutral'`
    - Export `PowerupDefinition` interface with id, displayName, eligibleModes, duration, spawnWeight, effectType, targetsSelf
    - Export `ActiveEffect` interface with powerupId, targetPlayer, remainingMs, appliedAt
    - Export `SpawnConfig` interface with minInterval, maxInterval, spawnProbability, maxOnScreen, despawnTime
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 1.2 Extend `src/game/types/events.ts` with `audio:powerup-expire` event
    - Add `'audio:powerup-expire': undefined` to EventMap
    - _Requirements: 12.2, 12.6_

## 

- [ ] 2. Implement powerup registry (pure module)
  - [ ] 2.1 Create `src/game/rules/powerups/registry.ts` with all 11 powerup definitions
    - Export `POWERUP_DEFINITIONS` readonly array with all definitions matching the data model table
    - Export `getPowerupById(id)` lookup function
    - Export `getAllPowerups()` convenience function
    - Export `EFFECT_MULTIPLIERS` constants object
    - Export `DEFAULT_SPAWN_CONFIG` object
    - No Phaser imports, pure data module
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 2.2 Create `src/game/rules/powerups/eligibility.ts` with mode filtering
    - Export `getEligiblePowerups(mode)` — filter POWERUP_DEFINITIONS by eligibleModes
    - Export `isPowerupEligible(powerupId, mode)` — check single powerup eligibility
    - Pure functions, no side effects
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 2.3 Create `src/game/rules/powerups/stacking.ts` with stacking policy
    - Export `StackingResult` type
    - Export `applyStackingPolicy(activeEffects, powerupId, targetPlayer, duration, timestamp)` — refresh if duplicate, add if new
    - Never produce duplicate (powerupId, targetPlayer) pairs in output
    - Refresh resets to full duration, does not add
    - Pure function, no mutation
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 2.4 Create `src/game/rules/powerups/targeting.ts` with target resolution
    - Export `resolveTarget(definition, collector, mode)` — return target PlayerId
    - Harmful + Pong: return opponent (left↔right)
    - Beneficial or Breakout: return collector
    - Pure function, no side effects
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ] 2.5 Create `src/game/rules/powerups/index.ts` barrel export
    - Re-export all public functions and types from registry, eligibility, stacking, targeting
    - _Requirements: 2.4 (importable by any module)_

## 

- [ ] 3. Write unit tests for pure rule modules
  - [ ] 3.1 Create `src/game/rules/powerups/registry.test.ts`
    - Test POWERUP_DEFINITIONS has exactly 11 entries
    - Test each definition has required fields with correct types
    - Test getPowerupById returns correct definition for each known ID
    - Test getPowerupById returns undefined for unknown ID
    - Test EFFECT_MULTIPLIERS values match design spec
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [ ] 3.2 Create `src/game/rules/powerups/eligibility.test.ts`
    - Test pong-solo returns 7 eligible powerups (5 shared + AI Freeze + Opponent Shrink)
    - Test pong-versus returns 6 eligible powerups (5 shared + Opponent Shrink, no AI Freeze)
    - Test breakout returns 9 eligible powerups (5 shared + 4 breakout-only)
    - Test AI Freeze is NOT eligible for pong-versus or breakout
    - Test Piercing Ball is NOT eligible for pong-solo or pong-versus
    - Test isPowerupEligible returns correct boolean for each combination
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 3.3 Create `src/game/rules/powerups/stacking.test.ts`
    - Test new powerup on empty effects list → action is 'apply-new'
    - Test duplicate powerup on same target → action is 'refresh-duration', duration reset to full
    - Test same powerup on different target → action is 'apply-new' (both exist)
    - Test different powerup on same target → action is 'apply-new' (both exist)
    - Test refresh does not add remaining time, resets to full duration
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 3.4 Create `src/game/rules/powerups/targeting.test.ts`
    - Test harmful powerup in pong-solo collected by 'right' → targets 'left'
    - Test harmful powerup in pong-versus collected by 'left' → targets 'right'
    - Test beneficial powerup in pong-solo → targets collector
    - Test beneficial powerup in breakout → targets collector ('solo')
    - Test harmful powerup in breakout → targets collector (no opponent in breakout)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ] 3.5 Run `npm run typecheck` and `npm test` — verify all pass

## 

- [ ] 4. Write property-based tests for correctness properties
  - [ ]* 4.1 Create property test: Eligibility filter returns only mode-valid powerups
    - **Property 1: Eligibility filter returns only mode-valid powerups**
    - For any GameMode, every returned PowerupDefinition has eligibleModes containing that mode
    - Minimum 100 iterations with fast-check
    - **Validates: Requirements 3.5, 3.1**

  - [ ]* 4.2 Create property test: Registry lookup is total for known IDs
    - **Property 2: Registry lookup is total for known IDs**
    - For any PowerupId from the union, getPowerupById returns a definition with matching id
    - Minimum 100 iterations with fast-check
    - **Validates: Requirements 2.5, 2.2**

  - [ ]* 4.3 Create property test: Stacking policy never duplicates active effects
    - **Property 3: Stacking policy never duplicates active effects**
    - For any sequence of applyStackingPolicy calls with same (powerupId, targetPlayer), result has at most 1 entry for that pair
    - Minimum 100 iterations with fast-check
    - **Validates: Requirements 8.1, 8.2, 8.4**

  - [ ]* 4.4 Create property test: Stacking refresh resets to full duration
    - **Property 4: Stacking refresh resets to full duration**
    - When refreshing an existing effect, remainingMs equals the configured duration (not old + new)
    - Minimum 100 iterations with fast-check
    - **Validates: Requirements 8.4, 8.1**

  - [ ]* 4.5 Create property test: Target resolution for harmful powerups in Pong
    - **Property 5: Target resolution for harmful powerups in Pong**
    - For any harmful powerup with targetsSelf=false in pong-solo or pong-versus, resolveTarget returns a different PlayerId than collector
    - Minimum 100 iterations with fast-check
    - **Validates: Requirements 9.1, 9.2, 9.4**

  - [ ]* 4.6 Create property test: Target resolution for beneficial powerups
    - **Property 6: Target resolution for beneficial powerups**
    - For any powerup with targetsSelf=true, resolveTarget returns the collector
    - Minimum 100 iterations with fast-check
    - **Validates: Requirements 9.3**

  - [ ]* 4.7 Create property test: Eligible powerup count per mode
    - **Property 7: Eligible powerup count per mode**
    - pong-solo → 7, pong-versus → 6, breakout → 9
    - Minimum 100 iterations with fast-check
    - **Validates: Requirements 3.2, 3.3, 3.4**

  - [ ]* 4.8 Create property test: Pure rule functions do not mutate inputs
    - **Property 8: Pure rule functions do not mutate inputs**
    - For any input to getEligiblePowerups, applyStackingPolicy, resolveTarget — deep-equal before and after
    - Minimum 100 iterations with fast-check
    - **Validates: Requirements 2.4**

## 

- [ ] 5. Implement PowerupManager system
  - [ ] 5.1 Create `src/game/systems/PowerupManager.ts` with spawn loop
    - Constructor accepts scene, mode, optional SpawnConfig override
    - `start()` begins spawn interval timer using scene.time
    - Spawn logic: random interval within [min, max], probability check, weighted random selection from eligible set
    - Place sprite at random position avoiding paddle zones (top/bottom 15% for Pong, bottom 20% for Breakout)
    - Enforce maxOnScreen limit (skip spawn if one exists)
    - Despawn timer removes uncollected powerup after despawnTime
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ] 5.2 Add collection handling to PowerupManager
    - `collect(powerupId, collector)` method
    - Resolve target via targeting.ts
    - Apply stacking policy via stacking.ts
    - Emit `audio:powerup-pickup` on EventBridge
    - Trigger particle burst at collection point
    - Remove powerup sprite
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 5.3 Add effect application to PowerupManager
    - Store original values before applying effects (paddle height, ball speed)
    - Apply multipliers per effect type (use EFFECT_MULTIPLIERS constants)
    - Ball Speed Up: multiply ball velocity magnitude by 1.3
    - Ball Slow Down: multiply ball velocity magnitude by 0.7
    - Paddle Grow: multiply paddle body height by 1.5
    - Paddle Shrink: multiply target paddle body height by 0.7
    - Multi Ball: create additional ball with same speed, random angle
    - AI Freeze: set flag read by AI controller to skip movement
    - Opponent Paddle Shrink: multiply opponent paddle height by 0.7
    - Piercing Ball: set flag on ball to skip bounce on brick collision
    - Sticky Paddle: set flag to hold ball on paddle contact
    - Extra Life: increment lives counter (permanent, no timer)
    - Wide Paddle: multiply paddle body width by 1.5
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11_

  - [ ] 5.4 Add duration tracking and expiry to PowerupManager
    - Start scene.time.delayedCall for each timed effect
    - On expiry: revert affected property to stored original value
    - On expiry: emit `audio:powerup-expire` on EventBridge
    - On expiry: remove effect from active effects list
    - Extra Life has no timer (duration is null)
    - _Requirements: 7.1, 7.2, 7.3, 7.6_

  - [ ] 5.5 Add pause/resume support to PowerupManager
    - `pause()`: pause spawn timer, pause all active effect timers, record remaining time
    - `resume()`: resume spawn timer, resume effect timers with remaining time
    - Use scene.time.paused or manual tracking of elapsed time
    - _Requirements: 7.4, 7.5, 4.8_

  - [ ] 5.6 Add cleanup/destroy to PowerupManager
    - `destroy()`: revert all active effects to original values, cancel all timers, destroy powerup sprites, destroy extra balls from Multi Ball, clear internal state
    - Make idempotent (safe to call multiple times)
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ] 5.7 Add unit tests for PowerupManager with mocked Phaser scene
    - Test start() does nothing when called (verify timer setup with mock)
    - Test collect() applies effect and emits audio event
    - Test destroy() reverts all effects and clears state
    - Test pause()/resume() preserves remaining time
    - Test spawn skipped when maxOnScreen reached
    - _Requirements: 4.1, 5.3, 11.1, 7.4, 4.6_

## 

- [ ] 6. Integrate with PongScene
  - [ ] 6.1 Add PowerupManager instantiation to PongScene.create()
    - Check `this.settings.powerupsEnabled` before creating manager
    - Pass scene reference and mode ('pong-solo' or 'pong-versus')
    - Call `powerupManager.start()` after physics setup
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 6.2 Add powerup sprite collision with ball in PongScene
    - Create physics group for powerup sprites
    - Add overlap collider between ball and powerup group
    - On overlap: call `powerupManager.collect(powerupId, scoringPlayerId)`
    - Determine collector based on ball's last paddle contact or direction
    - _Requirements: 5.1, 5.4_

  - [ ] 6.3 Wire PowerupManager to PongScene pause/resume/restart/shutdown
    - In pause handler: call `powerupManager?.pause()`
    - In resume handler: call `powerupManager?.resume()`
    - In handleRestart: call `powerupManager?.destroy()` before scene.restart()
    - In shutdown: call `powerupManager?.destroy()`
    - _Requirements: 11.1, 11.2, 11.3, 7.4, 7.5_

  - [ ] 6.4 Add AI Freeze effect support to AI controller
    - Add `frozen` flag to AI controller state
    - When frozen is true, AI paddle velocity is set to 0 (skip movement)
    - PowerupManager sets/clears this flag on effect apply/expiry
    - _Requirements: 6.6_

  - [ ] 6.5 Run `npm run typecheck` and `npm test` — verify all pass

## 

- [ ] 7. Integrate with BreakoutScene
  - [ ] 7.1 Add PowerupManager instantiation to BreakoutScene.create()
    - Check `this.settings.powerupsEnabled` before creating manager
    - Pass scene reference and mode 'breakout'
    - Call `powerupManager.start()` after physics setup
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 7.2 Add powerup sprite collision with ball and paddle in BreakoutScene
    - Create physics group for powerup sprites
    - Add overlap collider between ball and powerup group
    - Add overlap collider between paddle and powerup group
    - On overlap: call `powerupManager.collect(powerupId, 'solo')`
    - _Requirements: 5.1, 5.2, 5.4_

  - [ ] 7.3 Wire PowerupManager to BreakoutScene pause/resume/restart/shutdown
    - Same pattern as PongScene (6.3)
    - _Requirements: 11.1, 11.2, 11.3, 7.4, 7.5_

  - [ ] 7.4 Add Piercing Ball effect support to BreakoutScene
    - Add `piercing` flag to ball state
    - When piercing is true, ball destroys bricks but does not bounce off them
    - PowerupManager sets/clears this flag on effect apply/expiry
    - _Requirements: 6.8_

  - [ ] 7.5 Add Sticky Paddle effect support to BreakoutScene
    - Add `sticky` flag to paddle state
    - When sticky is true and ball contacts paddle, ball attaches to paddle position
    - Ball releases on player key press (Space or any movement key)
    - PowerupManager sets/clears this flag on effect apply/expiry
    - _Requirements: 6.9_

  - [ ] 7.6 Add Extra Life effect support to BreakoutScene
    - On Extra Life collection, increment lives counter and emit `lives:update` event
    - No timer needed (permanent effect)
    - _Requirements: 6.10_

  - [ ] 7.7 Run `npm run typecheck` and `npm test` — verify all pass

## 

- [ ] 8. Add powerup visuals and audio wiring
  - [ ] 8.1 Add powerup sprite rendering in PowerupManager
    - Draw simple geometric shape (hexagon or diamond) using Phaser graphics
    - Use distinct neon color (e.g., cyan for beneficial, red for harmful, yellow for neutral)
    - Add subtle pulsing tween animation
    - _Requirements: 12.3, 12.5_

  - [ ] 8.2 Add collection particle burst in PowerupManager
    - On collection, emit a brief particle burst (8-12 particles) at collection point
    - Particles use same color as the collected powerup sprite
    - Particles fade out over 300-500ms
    - _Requirements: 12.4_

  - [ ] 8.3 Verify audio events are handled by AudioManager
    - Confirm `audio:powerup-pickup` is already handled (exists in EventMap)
    - Add `audio:powerup-expire` handling to AudioManager (new sound cue)
    - Add synth sound for powerup expire (short descending tone)
    - _Requirements: 12.1, 12.2_

  - [ ] 8.4 Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` — verify all pass

## 

- [ ] 9. Pre-match toggle verification
  - [ ] 9.1 Verify SettingsPanel passes `powerupsEnabled` to store correctly
    - Confirm toggle exists in SettingsPanel component
    - Confirm store's `powerupsEnabled` flows into SceneLaunchPayload
    - Confirm scenes read `powerupsEnabled` from payload in init()
    - _Requirements: 10.3, 10.4_

  - [ ] 9.2 Add unit test: PowerupManager is not created when powerupsEnabled is false
    - Mock scene creation with powerupsEnabled=false
    - Verify no spawn timers are started
    - _Requirements: 10.1_

  - [ ] 9.3 Run `npm run typecheck` and `npm test` — verify all pass

## 

- [ ] 10. Final validation and manual play-test
  - [ ] 10.1 Run full validation suite: `npm run typecheck && npm run lint && npm test && npm run build`
  - [ ] 10.2 Manual play-test: Pong Solo with powerups enabled — verify spawn, collection, AI Freeze, opponent shrink
  - [ ] 10.3 Manual play-test: Pong Versus with powerups enabled — verify opponent targeting works for both players
  - [ ] 10.4 Manual play-test: Breakout with powerups enabled — verify Piercing Ball, Sticky Paddle, Extra Life, Wide Paddle
  - [ ] 10.5 Manual play-test: Any mode with powerups disabled — verify no powerups spawn
  - [ ] 10.6 Manual play-test: Pause during active effect — verify timer pauses and resumes correctly
  - [ ] 10.7 Manual play-test: Restart during active effect — verify all effects revert cleanly

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Pure rule modules (Tasks 1-4) have zero Phaser imports and are fully testable in isolation
- PowerupManager (Task 5) requires mocked Phaser scene for unit tests
- Scene integration (Tasks 6-7) requires prior specs to be implemented: pong-core, pong-ai, breakout-core
- The `audio:powerup-pickup` event already exists in EventMap; only `audio:powerup-expire` is new
- Property tests use `fast-check` with minimum 100 iterations per property
- Each task references specific requirements for traceability
- Dependencies: shared-types-and-rules, pong-core, pong-ai, breakout-core, match-lifecycle, audio-system
