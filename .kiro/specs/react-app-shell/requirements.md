# Requirements Document

## Introduction

This spec delivers the React app shell for Paddle Arcade: mode selection, pre-match settings, overlays (pause, win/loss), Phaser game lifecycle management, and navigation between menu and active game. It uses Zustand for global state management, wires mute/volume controls to the AudioManager via EventBridge, and ensures all UI is keyboard-navigable. The shell launches Phaser scenes with correct `SceneLaunchPayload` and listens for scene events to drive overlay state. No actual gameplay scenes are implemented — the shell launches placeholder or stub scenes.

## Glossary

- **App_Shell**: The top-level React component tree that manages navigation between menu, settings, active game, and overlays.
- **Mode_Selection_Screen**: The initial screen presenting the three playable modes: Pong: Solo, Pong: Versus, and Breakout.
- **Settings_Panel**: The pre-match configuration UI showing mode-specific settings before launching a match.
- **Pause_Overlay**: A modal overlay displayed when the game is paused, offering resume, restart, and return-to-menu actions.
- **Win_Loss_Overlay**: A modal overlay displayed when a match ends, showing the outcome and offering restart and return-to-menu actions.
- **App_Store**: The Zustand store managing global application state: selected mode, match settings, app phase, overlay visibility, and score/lives data.
- **Phaser_Lifecycle**: The React-managed mount/unmount cycle of the Phaser game instance, controlled by the App_Shell based on app phase.
- **Event_Bridge**: The typed communication layer carrying events between Phaser scenes and React components.
- **Scene_Launch_Payload**: The typed object passed from React to Phaser when launching a game scene, containing mode, settings, and player configuration.
- **Audio_Controls**: The mute toggle and volume slider wired to the AudioManager via EventBridge state events.
- **Neon_Arcade_Style**: The visual direction using dark neutral backgrounds, high-contrast text, crisp borders, geometric shapes, and restrained glow accents.

## Requirements

### Requirement 1: Mode Selection Screen

**User Story:** As a player, I want to see a mode selection screen as the first thing when the app loads, so that I can choose which game to play.

#### Acceptance Criteria

1. THE Mode_Selection_Screen SHALL display exactly three selectable options: "Pong: Solo", "Pong: Versus", and "Breakout".
2. THE Mode_Selection_Screen SHALL be the first screen visible when the application loads.
3. WHEN a player selects a mode, THE App_Shell SHALL transition to the Settings_Panel for that mode.
4. THE Mode_Selection_Screen SHALL support keyboard navigation using Tab to move between options and Enter to select.
5. THE Mode_Selection_Screen SHALL visually indicate which option currently has focus.
6. THE Mode_Selection_Screen SHALL apply Neon_Arcade_Style with dark background, high-contrast text, and crisp geometric controls.

### Requirement 2: Pre-Match Settings Panel

**User Story:** As a player, I want to configure match settings before starting a game, so that I can customize the experience for each mode.

#### Acceptance Criteria

1. WHEN the selected mode is "Pong: Solo", THE Settings_Panel SHALL display win score configuration, AI difficulty selection, and powerups toggle.
2. WHEN the selected mode is "Pong: Versus", THE Settings_Panel SHALL display win score configuration and powerups toggle.
3. WHEN the selected mode is "Breakout", THE Settings_Panel SHALL display only the powerups toggle.
4. THE Settings_Panel SHALL default win score to 7 for Pong modes.
5. THE Settings_Panel SHALL constrain win score to the range 3 through 21 inclusive.
6. THE Settings_Panel SHALL default AI difficulty to "Normal" for Pong: Solo.
7. THE Settings_Panel SHALL display AI difficulty as three selectable options: "Easy", "Normal", and "Hard".
8. THE Settings_Panel SHALL default the powerups toggle to disabled.
9. THE Settings_Panel SHALL include a "Start" button that launches the match with the configured settings.
10. THE Settings_Panel SHALL include a "Back" button that returns to the Mode_Selection_Screen.
11. THE Settings_Panel SHALL validate settings using the Settings_Validator before launching a match.
12. THE Settings_Panel SHALL support keyboard navigation using Tab between controls and Enter to activate buttons.

### Requirement 3: Mute and Volume Controls

**User Story:** As a player, I want mute and volume controls accessible from any screen, so that I can adjust audio without interrupting gameplay.

#### Acceptance Criteria

1. THE Audio_Controls SHALL be visible on all screens (mode selection, settings, and during active gameplay).
2. THE Audio_Controls SHALL include a mute toggle that reflects the current AudioManager mute state.
3. THE Audio_Controls SHALL include a volume control that reflects the current AudioManager volume level.
4. WHEN the player toggles mute, THE Audio_Controls SHALL call the AudioManager mute API and update the displayed state.
5. WHEN the player adjusts volume, THE Audio_Controls SHALL call the AudioManager volume API and update the displayed state.
6. WHEN the AudioManager emits an `audio:state-change` event, THE Audio_Controls SHALL update to reflect the new mute and volume values.
7. THE Audio_Controls SHALL unsubscribe from EventBridge listeners on component unmount to prevent memory leaks.
8. THE Audio_Controls SHALL support keyboard interaction (Tab to focus, Enter or Space to toggle mute, arrow keys for volume).

### Requirement 4: Match Launch

**User Story:** As a player, I want to start a match with my configured settings, so that the game begins with the correct mode and options.

#### Acceptance Criteria

1. WHEN the player activates the "Start" button, THE App_Shell SHALL construct a Scene_Launch_Payload from the current settings.
2. THE App_Shell SHALL validate settings through the Settings_Validator before constructing the payload.
3. IF settings validation fails, THEN THE App_Shell SHALL display the validation errors and remain on the Settings_Panel.
4. WHEN a valid payload is constructed, THE App_Shell SHALL mount the Phaser game container and start the appropriate scene.
5. THE Scene_Launch_Payload SHALL include the validated MatchSettings and the correct player assignments for the selected mode.
6. WHEN the Phaser game mounts, THE App_Shell SHALL transition the app phase from "settings" to "playing".

### Requirement 5: Pause Overlay

**User Story:** As a player, I want to pause the game and see options to resume, restart, or quit, so that I can take a break or change my mind mid-match.

#### Acceptance Criteria

1. WHEN the player presses the Escape key during active gameplay, THE App_Shell SHALL display the Pause_Overlay.
2. WHEN the Pause_Overlay is displayed, THE App_Shell SHALL emit a `match:pause` event with `{ paused: true }` on the Event_Bridge.
3. THE Pause_Overlay SHALL display three action buttons: "Resume", "Restart", and "Return to Menu".
4. WHEN the player activates "Resume", THE App_Shell SHALL hide the Pause_Overlay and emit `match:pause` with `{ paused: false }`.
5. WHEN the player activates "Restart", THE App_Shell SHALL reset match state and restart the scene with the same settings.
6. WHEN the player activates "Return to Menu", THE App_Shell SHALL unmount the Phaser game and return to the Mode_Selection_Screen.
7. WHEN the Pause_Overlay is visible, THE Pause_Overlay SHALL trap keyboard focus within the overlay.
8. THE Pause_Overlay SHALL support keyboard navigation using Tab between buttons and Enter to activate.
9. WHEN the player presses Escape while the Pause_Overlay is visible, THE App_Shell SHALL resume the game (equivalent to activating "Resume").

### Requirement 6: Win/Loss Overlay

**User Story:** As a player, I want to see the match result and choose to replay or return to menu, so that I can continue playing without restarting the app.

#### Acceptance Criteria

1. WHEN the Event_Bridge delivers a `match:win` event, THE App_Shell SHALL display the Win_Loss_Overlay with the winner information.
2. WHEN the Event_Bridge delivers a `match:loss` event, THE App_Shell SHALL display the Win_Loss_Overlay with the final score.
3. THE Win_Loss_Overlay SHALL display two action buttons: "Restart" and "Return to Menu".
4. WHEN the player activates "Restart", THE App_Shell SHALL reset match state and restart the scene with the same settings.
5. WHEN the player activates "Return to Menu", THE App_Shell SHALL unmount the Phaser game and return to the Mode_Selection_Screen.
6. THE Win_Loss_Overlay SHALL trap keyboard focus within the overlay.
7. THE Win_Loss_Overlay SHALL support keyboard navigation using Tab between buttons and Enter to activate.
8. THE Win_Loss_Overlay SHALL display the match outcome clearly (which player won for Pong, or "Game Over" with score for Breakout).

### Requirement 7: Phaser Game Lifecycle Management

**User Story:** As a gameplay implementer, I want React to manage the Phaser game mount/unmount lifecycle, so that the game container is created when entering gameplay and destroyed cleanly when leaving.

#### Acceptance Criteria

1. WHEN the app phase transitions to "playing", THE Phaser_Lifecycle SHALL mount the Phaser game container with the correct configuration.
2. WHEN the app phase transitions away from "playing" (return to menu), THE Phaser_Lifecycle SHALL destroy the Phaser game instance.
3. THE Phaser_Lifecycle SHALL not create multiple Phaser game instances simultaneously.
4. WHEN the Phaser game is destroyed, THE Phaser_Lifecycle SHALL clean up all EventBridge listeners registered for that session.
5. THE Phaser_Lifecycle SHALL pass the Scene_Launch_Payload to the scene via the Phaser game configuration or EventBridge.
6. WHEN a restart is triggered, THE Phaser_Lifecycle SHALL restart the active scene without full game destruction when possible.

### Requirement 8: EventBridge Scene Event Listeners

**User Story:** As a gameplay implementer, I want the app shell to listen for scene events on the EventBridge, so that React overlays update in response to gameplay state changes.

#### Acceptance Criteria

1. THE App_Shell SHALL subscribe to `score:update` events and update the App_Store with current scores.
2. THE App_Shell SHALL subscribe to `match:win` events and trigger the Win_Loss_Overlay.
3. THE App_Shell SHALL subscribe to `match:loss` events and trigger the Win_Loss_Overlay.
4. THE App_Shell SHALL subscribe to `match:pause` events and synchronize pause state with the Pause_Overlay.
5. THE App_Shell SHALL subscribe to `lives:update` events and update the App_Store with remaining lives.
6. THE App_Shell SHALL unsubscribe from all scene event listeners when the Phaser game is unmounted.
7. THE App_Shell SHALL not process scene events when the app phase is not "playing".

### Requirement 9: Zustand App State Store

**User Story:** As a gameplay implementer, I want a Zustand store for app state, so that any React component can access selected mode, settings, match state, and overlay visibility without prop drilling.

#### Acceptance Criteria

1. THE App_Store SHALL track the current app phase: "menu", "settings", or "playing".
2. THE App_Store SHALL track the selected GameMode.
3. THE App_Store SHALL track the current match settings (validated MatchSettings).
4. THE App_Store SHALL track overlay visibility: pause overlay open/closed, win/loss overlay open/closed.
5. THE App_Store SHALL track match data: current scores (Pong) and remaining lives (Breakout).
6. THE App_Store SHALL expose actions to transition between phases, update settings, and control overlay visibility.
7. THE App_Store SHALL reset match-specific state (scores, lives, overlay visibility) when a new match starts or when returning to menu.
8. THE App_Store SHALL be importable by any React component without prop drilling.

### Requirement 10: Neon Arcade Visual Styling

**User Story:** As a player, I want the UI to have a clean neon arcade look, so that the game feels like a focused arcade experience.

#### Acceptance Criteria

1. THE App_Shell SHALL use a dark neutral background color for all screens.
2. THE App_Shell SHALL use high-contrast text that is readable against the dark background.
3. THE App_Shell SHALL use crisp borders and geometric shapes for buttons and controls.
4. THE App_Shell SHALL use restrained glow accents on focused or active elements.
5. THE App_Shell SHALL not use decorative gradient blobs, hero images, or marketing-style layouts.
6. THE App_Shell SHALL ensure consistent visual language between menu screens and gameplay overlays.
7. THE App_Shell SHALL ensure text remains readable at standard desktop viewport sizes.

### Requirement 11: Keyboard Navigation and Accessibility

**User Story:** As a player, I want to navigate all menus and overlays using only the keyboard, so that I can play the game without a mouse.

#### Acceptance Criteria

1. THE App_Shell SHALL support Tab key navigation to move focus between interactive elements in logical order.
2. THE App_Shell SHALL support Enter key to activate focused buttons and controls.
3. THE App_Shell SHALL support Escape key to open the pause overlay during gameplay and to resume from the pause overlay.
4. THE App_Shell SHALL provide visible focus indicators on all interactive elements.
5. THE App_Shell SHALL use semantic HTML elements (button, input, label) for interactive controls.
6. THE App_Shell SHALL use `aria-label` or visible labels for controls where the purpose is not self-evident from text content alone.
7. WHEN an overlay opens, THE App_Shell SHALL move focus to the first interactive element within the overlay.
8. WHEN an overlay closes, THE App_Shell SHALL restore focus to the element that triggered the overlay or a logical default.
9. THE App_Shell SHALL use `event.preventDefault()` only for keys the game consumes (Escape during gameplay) to avoid breaking browser accessibility shortcuts.
