# Requirements Document

## Introduction

This spec adds a visible scoreboard HUD to the Pong game canvas. During Pong: Solo and Pong: Versus matches, both players' scores and the target win score are displayed directly on the Phaser canvas using programmatic text rendering. The scoreboard updates immediately when a point is scored and resets on match restart.

## Glossary

- **Scoreboard_HUD**: Phaser text objects rendered on the game canvas showing current scores and win target.
- **PongScene**: The existing Phaser scene that runs Pong matches.
- **Win_Score**: The target score to win the match (configured pre-match, locked at start).

## Requirements

### Requirement 1: Score Display

**User Story:** As a player, I want to see both players' scores on screen during a Pong match, so that I know the current state of the game without guessing.

#### Acceptance Criteria

1. THE Scoreboard_HUD SHALL display the left player's score and the right player's score on the Phaser canvas during active gameplay.
2. THE Scoreboard_HUD SHALL position the scores at the top of the play area, with the left score on the left side and the right score on the right side.
3. THE Scoreboard_HUD SHALL use a readable font size (at least 24px) with high contrast against the dark background.
4. WHEN a point is scored, THE Scoreboard_HUD SHALL update the displayed score immediately (same frame as the score event).

### Requirement 2: Win Target Label

**User Story:** As a player, I want to see the target win score displayed, so that I know how many points are needed to win.

#### Acceptance Criteria

1. THE Scoreboard_HUD SHALL display a "First to N" label (where N is the configured Win_Score) centered at the top of the play area.
2. THE label SHALL be smaller than the score numbers and use a secondary text color for visual hierarchy.
3. THE label SHALL remain static throughout the match (does not change).

### Requirement 3: Lifecycle Integration

**User Story:** As a gameplay implementer, I want the scoreboard to reset on restart and clean up on shutdown, so that no stale text persists across matches.

#### Acceptance Criteria

1. WHEN the scene restarts, THE Scoreboard_HUD SHALL reset both displayed scores to 0.
2. WHEN the scene shuts down, THE Scoreboard_HUD text objects SHALL be destroyed with no memory leaks.
3. THE Scoreboard_HUD SHALL be created in `create()` and SHALL NOT require external assets (programmatic Phaser text only).

### Requirement 4: Visual Style

**User Story:** As a player, I want the scoreboard to match the neon arcade aesthetic, so that it feels cohesive with the rest of the game.

#### Acceptance Criteria

1. THE Scoreboard_HUD SHALL use a monospace or geometric font style consistent with the neon arcade direction.
2. THE Scoreboard_HUD text SHALL use a light color (white or cyan) for scores and a dimmer color for the "First to N" label.
3. THE Scoreboard_HUD SHALL not obscure gameplay (positioned above the play area or in the wall zone).
