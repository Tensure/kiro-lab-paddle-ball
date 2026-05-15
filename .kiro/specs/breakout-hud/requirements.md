# Requirements Document

## Introduction

This spec adds a visible score and lives HUD to the Breakout game canvas. During Breakout matches, the current score and remaining lives are displayed directly on the Phaser canvas using programmatic text rendering. The HUD updates immediately when a brick is broken or a life is lost, and resets on match restart.

## Glossary

- **Breakout_HUD**: Phaser text objects rendered on the game canvas showing current score and remaining lives.
- **BreakoutScene**: The existing Phaser scene that runs Breakout matches.

## Requirements

### Requirement 1: Score Display

**User Story:** As a player, I want to see my current score on screen during a Breakout match, so that I know how well I'm doing.

#### Acceptance Criteria

1. THE Breakout_HUD SHALL display the current score on the Phaser canvas during active gameplay.
2. THE Breakout_HUD SHALL position the score at the top-left of the play area (inside the wall zone).
3. THE Breakout_HUD SHALL use a readable font size (at least 20px) with high contrast against the dark background.
4. WHEN a brick is destroyed, THE Breakout_HUD SHALL update the displayed score immediately.

### Requirement 2: Lives Display

**User Story:** As a player, I want to see my remaining lives on screen, so that I know how many chances I have left.

#### Acceptance Criteria

1. THE Breakout_HUD SHALL display the remaining lives count on the Phaser canvas during active gameplay.
2. THE Breakout_HUD SHALL position the lives display at the top-right of the play area.
3. WHEN a life is lost, THE Breakout_HUD SHALL update the displayed lives count immediately.
4. THE lives display SHALL show a label (e.g., "Lives: 3") or use a visual indicator (e.g., ball icons).

### Requirement 3: Lifecycle Integration

**User Story:** As a gameplay implementer, I want the HUD to reset on restart and clean up on shutdown.

#### Acceptance Criteria

1. WHEN the scene restarts, THE Breakout_HUD SHALL reset the score to 0 and lives to 3.
2. WHEN the scene shuts down, THE Breakout_HUD text objects SHALL be destroyed with no memory leaks.
3. THE Breakout_HUD SHALL be created in `create()` using programmatic Phaser text only (no external assets).

### Requirement 4: Visual Style

**User Story:** As a player, I want the HUD to match the neon arcade aesthetic.

#### Acceptance Criteria

1. THE Breakout_HUD SHALL use a monospace font style consistent with the neon arcade direction.
2. THE Breakout_HUD text SHALL use a light color (white or cyan) for values and a dimmer color for labels.
3. THE Breakout_HUD SHALL not obscure gameplay (positioned in the wall/header zone above the brick grid).
