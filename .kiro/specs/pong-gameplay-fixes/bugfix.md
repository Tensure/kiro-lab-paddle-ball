# Bugfix Requirements Document

## Introduction

After launching Pong (Solo or Versus) from the mode selection screen, the game is unplayable due to multiple interacting defects: keyboard input is non-responsive, the match ends after a single point, AI does not move in Solo mode, ball physics produce incorrect behavior, and the restart action from overlays does not restart the Phaser scene. These issues stem from scene launch timing, missing restart signaling between React and Phaser, and potential physics configuration gaps.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the GameView mounts and creates the Phaser game with `postBoot` callback using `game.scene.add('PongScene', PongScene, true, payload)` THEN the scene may not reliably receive the `SceneLaunchPayload` data in its `init()` method due to timing issues with the `postBoot` callback firing before the scene manager is fully ready

1.2 WHEN PongScene starts and `this.input.keyboard` is null (keyboard plugin not loaded) THEN the scene silently falls back to dummy keys and paddles do not respond to W/S or ArrowUp/ArrowDown input

1.3 WHEN a player scores a point and the win condition check runs with `this.scores.left >= this.winScore || this.scores.right >= this.winScore` THEN the match ends after 1 point because `winScore` defaults to an incorrect value (0 or 1) when `init()` receives undefined data

1.4 WHEN the game mode is `pong-solo` but `init()` does not receive the payload with `settings.mode === 'pong-solo'` THEN `isAIControlled` remains `false` and the AI paddle does not move

1.5 WHEN the user clicks "Restart" on the WinLossOverlay or PauseOverlay THEN the overlay calls `resetMatchData()` and `closeWinLossOverlay()`/`closePauseOverlay()` but does NOT restart the Phaser scene, leaving the game frozen in its ended/paused state

1.6 WHEN the ball collides with paddles using Phaser Arcade Physics with `setBounce(1, 1)` on the ball and `setImmovable(true)` on paddles THEN the ball physics may produce incorrect bouncing behavior (ball getting stuck, wrong angles, or inconsistent speed) compared to the expected manual dx/dy reflection behavior from the original prototype

### Expected Behavior (Correct)

2.1 WHEN the GameView mounts and creates the Phaser game THEN PongScene SHALL reliably receive the complete `SceneLaunchPayload` with correct `winScore` and `mode` on every launch, regardless of Phaser boot timing

2.2 WHEN PongScene starts THEN keyboard input SHALL work for both players (W/S for left paddle, ArrowUp/ArrowDown for right paddle) with the keyboard plugin guaranteed to be loaded

2.3 WHEN a player scores a point THEN the match SHALL continue until one player's score reaches the configured `winScore` (default 7, range 3–21) before triggering the win condition

2.4 WHEN the game mode is `pong-solo` THEN the AI SHALL control the left paddle using the configured difficulty settings, moving to intercept the ball

2.5 WHEN the user clicks "Restart" on the WinLossOverlay or PauseOverlay THEN the Phaser scene SHALL restart with the same settings (mode, winScore, aiDifficulty, powerupsEnabled) and scores reset to 0-0

2.6 WHEN the ball collides with paddles or walls THEN the ball SHALL bounce correctly (reverse appropriate velocity component), increase speed by a factor on paddle hits (capped at max speed), and maintain consistent movement without getting stuck

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the user presses Escape during gameplay THEN the system SHALL CONTINUE TO pause the game and show the pause overlay

3.2 WHEN the user clicks "Return to Menu" from any overlay THEN the system SHALL CONTINUE TO navigate back to the mode selection screen and destroy the Phaser game

3.3 WHEN a player reaches the configured win score THEN the system SHALL CONTINUE TO emit `match:win` via EventBridge and display the WinLossOverlay with the correct winner

3.4 WHEN the game is paused via EventBridge `match:pause` event THEN the system SHALL CONTINUE TO freeze physics and ignore paddle input until resumed

3.5 WHEN the ball exits the left or right edge THEN the system SHALL CONTINUE TO award a point to the opposing player, emit `score:update`, and serve the ball from center

3.6 WHEN settings are configured in the SettingsPanel (winScore, aiDifficulty) THEN the system SHALL CONTINUE TO pass those settings through to the scene launch payload without modification
