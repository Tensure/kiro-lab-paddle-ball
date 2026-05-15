# Requirements Document

## Introduction

This spec hardens the match lifecycle across all three game modes (Pong: Solo, Pong: Versus, Breakout). It addresses edge cases in pause/resume, restart, return-to-menu, settings mutation, and overlay management that can cause frozen states, double-scoring, or stale UI. This is not a new-feature spec — it adds guards and focused tests to existing behavior.

## Glossary

- **Store**: The Zustand state store (`src/app/store.ts`) managing app phase, overlays, settings, and match data.
- **Phase**: The current app lifecycle state — one of `menu`, `settings`, or `playing`.
- **Overlay**: A React component rendered on top of the game canvas (PauseOverlay or WinLossOverlay).
- **Scene**: A Phaser scene instance (PongScene or BreakoutScene) that owns the active gameplay simulation.
- **EventBridge**: The typed singleton event bus for bidirectional React ↔ Phaser communication.
- **Serve_Delay**: A pending `this.time.delayedCall()` timer in a scene that schedules the next ball serve.
- **Settings_Actions**: Store actions that mutate gameplay-affecting state: `setWinScore`, `setAiDifficulty`, `setPowerupsEnabled`.

## Requirements

### Requirement 1: Settings Immutability During Match

**User Story:** As a player, I want gameplay settings to be locked once a match starts, so that fairness is preserved and no accidental changes corrupt the active match.

#### Acceptance Criteria

1. WHILE the Store phase equals `playing`, THE Store SHALL reject calls to `setWinScore` without modifying state.
2. WHILE the Store phase equals `playing`, THE Store SHALL reject calls to `setAiDifficulty` without modifying state.
3. WHILE the Store phase equals `playing`, THE Store SHALL reject calls to `setPowerupsEnabled` without modifying state.
4. WHEN the Store phase transitions from `playing` to `menu`, THE Store SHALL allow settings actions to modify state again.

### Requirement 2: Overlay Stacking Prevention

**User Story:** As a player, I want only one overlay visible at a time, so that I never see conflicting UI states stacked on top of each other.

#### Acceptance Criteria

1. WHEN `openPauseOverlay` is called WHILE `winLossOverlayOpen` is true, THE Store SHALL reject the call without modifying overlay state.
2. WHEN `openWinLossOverlay` is called WHILE `pauseOverlayOpen` is true, THE Store SHALL close the pause overlay before opening the win/loss overlay.
3. THE Store SHALL maintain the invariant that `pauseOverlayOpen` and `winLossOverlayOpen` are never both true simultaneously.

### Requirement 3: Escape Key Ignored During Win/Loss Overlay

**User Story:** As a player, I want the Escape key to have no effect when the win/loss screen is showing, so that I cannot accidentally trigger a pause state on a finished match.

#### Acceptance Criteria

1. WHILE `winLossOverlayOpen` is true, THE GameView Escape key handler SHALL ignore the keypress without emitting `match:pause` or toggling `pauseOverlayOpen`.
2. WHILE `winLossOverlayOpen` is false AND `pauseOverlayOpen` is false, THE GameView Escape key handler SHALL open the pause overlay and emit `match:pause` with `paused: true`.
3. WHILE `pauseOverlayOpen` is true, THE GameView Escape key handler SHALL close the pause overlay and emit `match:pause` with `paused: false`.

### Requirement 4: Restart Cancels Pending Timers

**User Story:** As a player, I want restart to immediately start a fresh match, so that a pending serve delay from the previous match does not fire after the restart.

#### Acceptance Criteria

1. WHEN `scene:restart` is received by a Scene, THE Scene SHALL cancel all pending Phaser time events before calling `this.scene.restart()`.
2. WHEN a Scene restarts, THE Scene SHALL begin with zero pending time events and a fresh serve delay.
3. WHEN `scene:restart` is received during a serve delay, THE Scene SHALL not execute the pending serve callback after the restart completes.

### Requirement 5: Return-to-Menu Cleanup

**User Story:** As a player, I want return-to-menu to work cleanly from any state (paused, serving, playing, win/loss), so that I never encounter a frozen or corrupted state when navigating back.

#### Acceptance Criteria

1. WHEN `goToMenu` is called, THE Store SHALL set phase to `menu`, close all overlays, clear `selectedMode`, and reset match data regardless of the prior state.
2. WHEN GameView unmounts due to phase changing from `playing` to `menu`, THE GameView SHALL destroy the Phaser game instance and AudioManager.
3. WHEN the Phaser game is destroyed, THE Scene SHALL unsubscribe all EventBridge listeners and remove all window keyboard listeners via its shutdown handler.
4. IF a serve delay is pending when the scene shuts down, THEN THE Scene shutdown SHALL not cause errors from orphaned timer callbacks.

### Requirement 6: Rapid Pause/Unpause Stability

**User Story:** As a player, I want rapid pause/unpause toggling to leave the game in a consistent state, so that physics bodies, velocities, and positions are never corrupted.

#### Acceptance Criteria

1. WHEN `match:pause` with `paused: true` is received, THE Scene SHALL call `this.physics.pause()` exactly once.
2. WHEN `match:pause` with `paused: false` is received, THE Scene SHALL call `this.physics.resume()` exactly once.
3. FOR ALL sequences of rapid pause/unpause toggles, THE Scene physics state SHALL be paused if and only if the most recent `match:pause` payload had `paused: true`.
4. WHEN the Scene is paused, THE Scene update loop SHALL skip all movement, scoring, and ball-exit detection.
