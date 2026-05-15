# Requirements Document

## Introduction

This spec defines the optional powerup system for all three game modes. Powerups add variety and replayability by temporarily modifying gameplay (paddle size, ball speed, multi-ball, AI freeze, etc.). They are toggled on/off before each match via the `powerupsEnabled` setting and default to off. The system includes a pure powerup registry, mode-aware eligibility, spawn timing, collection mechanics, effect application, duration tracking, stacking policy, opponent-targeting logic for Pong, and cleanup on match end.

## Glossary

- **Powerup_Registry**: A pure TypeScript module exporting all powerup definitions as data, keyed by stable ID.
- **Powerup_Definition**: A typed object describing a single powerup: ID, display name, eligible modes, duration, spawn weight, effect type, and audio/visual hooks.
- **Powerup_ID**: A stable string literal union identifying each powerup (e.g., `'ball-speed-up'`, `'piercing-ball'`).
- **Spawn_System**: The scene-level logic that decides when and where to create a collectible powerup sprite during gameplay.
- **Effect_Manager**: A scene-level system that applies, tracks, and cleans up active powerup effects.
- **Stacking_Policy**: The rule governing what happens when a player collects a powerup they already have active — duration refreshes, no duplicate stacking.
- **Opponent_Targeting**: The Pong-specific rule where harmful effects (paddle shrink, AI freeze) apply to the opponent rather than the collector.
- **Timed_Effect**: A powerup effect with a finite duration that auto-expires and triggers cleanup.
- **Permanent_Effect**: A powerup effect that persists for the remainder of the match (e.g., Extra Life).
- **Eligible_Modes**: The subset of game modes in which a given powerup may spawn.
- **Spawn_Weight**: A relative probability value controlling how likely a powerup is to be selected when a spawn event occurs.
- **PongScene**: The Phaser scene handling Pong Solo and Pong Versus gameplay.
- **BreakoutScene**: The Phaser scene handling Breakout gameplay.
- **EventBridge**: The typed event bus used for scene-to-React and scene-to-audio communication.

## Requirements

### Requirement 1: Powerup Type Definitions

**User Story:** As a gameplay implementer, I want typed powerup definitions, so that all modules reference a single source of truth for powerup IDs, metadata, and effect contracts.

#### Acceptance Criteria

1. THE Powerup_ID type SHALL enumerate all powerup identifiers as a string literal union.
2. THE Powerup_Definition type SHALL include fields for: `id` (Powerup_ID), `displayName` (string), `eligibleModes` (array of GameMode), `duration` (number in milliseconds or `null` for permanent), `spawnWeight` (number), `effectType` ('beneficial' | 'harmful' | 'neutral'), and `targetsSelf` (boolean).
3. THE Powerup_Definition type SHALL be exported from `src/game/types/` and importable by any module.
4. WHEN a module references a powerup, THE module SHALL use the Powerup_ID type rather than raw strings.

### Requirement 2: Powerup Registry

**User Story:** As a gameplay implementer, I want a pure registry module containing all powerup definitions, so that scenes and systems can look up powerup metadata without hardcoding values.

#### Acceptance Criteria

1. THE Powerup_Registry SHALL export a readonly array of all Powerup_Definition objects.
2. THE Powerup_Registry SHALL export a lookup function that accepts a Powerup_ID and returns the corresponding Powerup_Definition.
3. THE Powerup_Registry SHALL contain exactly 11 powerup definitions: Ball Speed Up, Ball Slow Down, Paddle Grow, Paddle Shrink, Multi Ball, AI Freeze, Opponent Paddle Shrink, Piercing Ball, Sticky Paddle, Extra Life, and Wide Paddle.
4. THE Powerup_Registry SHALL be a pure module with no Phaser imports and no side effects.
5. FOR ALL Powerup_ID values, the lookup function SHALL return a valid Powerup_Definition (no undefined results for known IDs).

### Requirement 3: Mode Eligibility

**User Story:** As a gameplay implementer, I want mode-aware eligibility filtering, so that only powerups valid for the current game mode can spawn.

#### Acceptance Criteria

1. THE Powerup_Registry SHALL export a filter function that accepts a GameMode and returns only Powerup_Definitions whose `eligibleModes` include that mode.
2. WHEN the mode is `pong-solo`, THE filter SHALL include shared powerups, AI Freeze, and Opponent Paddle Shrink.
3. WHEN the mode is `pong-versus`, THE filter SHALL include shared powerups and Opponent Paddle Shrink, but SHALL NOT include AI Freeze.
4. WHEN the mode is `breakout`, THE filter SHALL include shared powerups, Piercing Ball, Sticky Paddle, Extra Life, and Wide Paddle, but SHALL NOT include AI Freeze or Opponent Paddle Shrink.
5. FOR ALL game modes, THE filter SHALL return only powerups whose `eligibleModes` array contains the specified mode (eligibility invariant).

### Requirement 4: Spawn System

**User Story:** As a player, I want powerups to appear occasionally during gameplay, so that I have opportunities to collect them without them dominating the match.

#### Acceptance Criteria

1. WHILE `powerupsEnabled` is true and the match is in progress, THE Spawn_System SHALL periodically evaluate whether to spawn a powerup.
2. THE Spawn_System SHALL use a configurable spawn interval (default 8–15 seconds between spawn attempts).
3. WHEN a spawn attempt occurs, THE Spawn_System SHALL use a spawn probability (default 40%) to decide whether a powerup actually appears.
4. WHEN a powerup spawns, THE Spawn_System SHALL select a random powerup from the mode-eligible set, weighted by `spawnWeight`.
5. WHEN a powerup spawns, THE Spawn_System SHALL place the powerup sprite at a random position within the play area, avoiding paddle zones.
6. THE Spawn_System SHALL allow at most one uncollected powerup on screen at a time.
7. IF a spawned powerup is not collected within 8 seconds, THEN THE Spawn_System SHALL remove the powerup sprite from the play area.
8. WHILE the match is paused, THE Spawn_System SHALL not advance spawn timers or spawn new powerups.

### Requirement 5: Collection Mechanics

**User Story:** As a player, I want to collect powerups by hitting them with the ball or paddle, so that collection feels natural within gameplay.

#### Acceptance Criteria

1. WHEN the ball collides with a powerup sprite, THE scene SHALL collect the powerup and remove the sprite.
2. WHEN a paddle collides with a powerup sprite in Breakout, THE scene SHALL collect the powerup and remove the sprite.
3. WHEN a powerup is collected, THE scene SHALL emit an `audio:powerup-pickup` event on the EventBridge.
4. WHEN a powerup is collected, THE scene SHALL pass the Powerup_ID and the collecting player's PlayerId to the Effect_Manager.

### Requirement 6: Effect Application

**User Story:** As a player, I want collected powerups to immediately modify gameplay, so that I feel the impact of collecting them.

#### Acceptance Criteria

1. WHEN a Ball Speed Up powerup is collected, THE Effect_Manager SHALL increase ball velocity by a defined multiplier (1.3×).
2. WHEN a Ball Slow Down powerup is collected, THE Effect_Manager SHALL decrease ball velocity by a defined multiplier (0.7×).
3. WHEN a Paddle Grow powerup is collected, THE Effect_Manager SHALL increase the collecting player's paddle height by a defined multiplier (1.5×).
4. WHEN a Paddle Shrink powerup is collected, THE Effect_Manager SHALL decrease the target player's paddle height by a defined multiplier (0.7×).
5. WHEN a Multi Ball powerup is collected, THE Effect_Manager SHALL spawn one additional ball with the same velocity magnitude as the current ball.
6. WHEN an AI Freeze powerup is collected in Pong Solo, THE Effect_Manager SHALL stop AI paddle movement for the effect duration.
7. WHEN an Opponent Paddle Shrink powerup is collected in Pong, THE Effect_Manager SHALL shrink the opponent's paddle by a defined multiplier (0.7×).
8. WHEN a Piercing Ball powerup is collected in Breakout, THE Effect_Manager SHALL allow the ball to pass through bricks without bouncing for the effect duration.
9. WHEN a Sticky Paddle powerup is collected in Breakout, THE Effect_Manager SHALL cause the ball to stick to the paddle on contact, releasing on player input.
10. WHEN an Extra Life powerup is collected in Breakout, THE Effect_Manager SHALL increment the player's remaining lives by 1.
11. WHEN a Wide Paddle powerup is collected in Breakout, THE Effect_Manager SHALL increase the paddle width by a defined multiplier (1.5×).

### Requirement 7: Duration Tracking and Expiry

**User Story:** As a player, I want timed powerup effects to expire automatically, so that gameplay returns to normal after a defined period.

#### Acceptance Criteria

1. WHEN a timed powerup effect is applied, THE Effect_Manager SHALL start a countdown timer for the effect's configured duration.
2. WHEN a timed effect's duration expires, THE Effect_Manager SHALL revert the affected property to its pre-powerup value.
3. WHEN a timed effect expires, THE Effect_Manager SHALL emit an `audio:powerup-expire` event on the EventBridge.
4. WHILE the match is paused, THE Effect_Manager SHALL pause all active effect timers.
5. WHEN the match resumes from pause, THE Effect_Manager SHALL resume all active effect timers with remaining time preserved.
6. THE Extra Life powerup SHALL NOT have a duration timer because the effect is permanent.

### Requirement 8: Stacking Policy

**User Story:** As a gameplay implementer, I want explicit stacking rules, so that collecting duplicate powerups behaves predictably.

#### Acceptance Criteria

1. WHEN a player collects a powerup that is already active on the same target, THE Effect_Manager SHALL refresh the duration timer to the full configured duration.
2. WHEN a duration is refreshed, THE Effect_Manager SHALL NOT apply the effect multiplier a second time (no stacking of magnitude).
3. THE Effect_Manager SHALL allow multiple different powerup types to be active simultaneously on the same target.
4. FOR ALL timed effects, refreshing duration SHALL reset the timer to the full duration value, not add to the remaining time.

### Requirement 9: Opponent Targeting in Pong

**User Story:** As a player in Pong, I want harmful powerups to affect my opponent, so that collecting them gives me a competitive advantage.

#### Acceptance Criteria

1. WHEN a harmful powerup is collected in Pong Solo, THE Effect_Manager SHALL apply the effect to the AI-controlled paddle (left player).
2. WHEN a harmful powerup is collected in Pong Versus, THE Effect_Manager SHALL apply the effect to the opponent of the collecting player.
3. WHEN a beneficial powerup is collected in Pong, THE Effect_Manager SHALL apply the effect to the collecting player's own paddle or ball.
4. THE Opponent_Targeting logic SHALL determine the target based on the `targetsSelf` field of the Powerup_Definition and the collecting player's PlayerId.

### Requirement 10: Pre-Match Toggle Integration

**User Story:** As a player, I want to enable or disable powerups before starting a match, so that I can choose whether to play with or without them.

#### Acceptance Criteria

1. WHEN `powerupsEnabled` is false in the MatchSettings, THE Spawn_System SHALL not spawn any powerups during the match.
2. WHEN `powerupsEnabled` is true in the MatchSettings, THE Spawn_System SHALL operate normally according to spawn rules.
3. THE `powerupsEnabled` setting SHALL be read from the SceneLaunchPayload during scene initialization.
4. THE `powerupsEnabled` setting SHALL NOT change during an active match.

### Requirement 11: Cleanup on Match End

**User Story:** As a gameplay implementer, I want all powerup state to be cleaned up when a match ends or restarts, so that no stale effects carry over.

#### Acceptance Criteria

1. WHEN a match ends (win or loss), THE Effect_Manager SHALL revert all active effects to their pre-powerup values.
2. WHEN a match is restarted, THE Effect_Manager SHALL revert all active effects and clear all timers.
3. WHEN the scene shuts down (return to menu), THE Effect_Manager SHALL destroy all active effects, timers, and powerup sprites.
4. IF a Multi Ball effect created additional balls, THEN cleanup SHALL destroy all extra balls, leaving only the primary ball.

### Requirement 12: Audio and Visual Events

**User Story:** As a player, I want audio and visual feedback when powerups spawn, are collected, and expire, so that I'm aware of powerup activity.

#### Acceptance Criteria

1. WHEN a powerup is collected, THE scene SHALL emit `audio:powerup-pickup` on the EventBridge.
2. WHEN a timed powerup expires, THE scene SHALL emit `audio:powerup-expire` on the EventBridge.
3. WHEN a powerup spawns, THE scene SHALL render a simple geometric sprite representing the powerup.
4. WHEN a powerup is collected, THE scene SHALL display a brief particle burst at the collection point.
5. THE powerup sprite SHALL use a distinct color or shape to differentiate it from paddles, balls, and bricks.
6. THE `audio:powerup-expire` event SHALL be added to the EventMap type definition.
