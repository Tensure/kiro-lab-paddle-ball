# Implementation Plan: React App Shell

## Overview

Implement the React app shell with mode selection, pre-match settings, pause/win/loss overlays, audio controls, Phaser lifecycle management, and Zustand state store. Tasks are ordered by dependency: store first (foundation for all components), then individual components from outer shell inward, then integration wiring, then tests, then validation.

## Tasks

- [x] 1. Install Zustand and create app store
  - [x] 1.1 Install Zustand dependency
    - Run `npm install zustand --save-exact`
    - Verify `package.json` has exact version pinned
    - Verify `package-lock.json` updated
    - _Requirements: 9.8_

  - [x] 1.2 Create Zustand store in `src/app/store.ts`
    - Define `AppPhase` type: `'menu' | 'settings' | 'playing'`
    - Define `MatchData` interface with scores, lives, winner, finalScore
    - Define `AppState` interface with all state fields and actions
    - Implement `useAppStore` with `create()`:
      - Initial phase: `'menu'`
      - Initial selectedMode: `null`
      - Initial winScore: `7`, aiDifficulty: `'normal'`, powerupsEnabled: `false`
      - Initial overlays: both closed
      - Initial matchData: `{ scores: { left: 0, right: 0 }, lives: 3, winner: null, finalScore: null }`
    - Implement actions: `selectMode`, `goToMenu`, `goToSettings`, `startMatch`
    - Implement actions: `setWinScore` (clamp via validateWinScore), `setAiDifficulty`, `setPowerupsEnabled`
    - Implement actions: `openPauseOverlay`, `closePauseOverlay`, `openWinLossOverlay`, `closeWinLossOverlay`
    - Implement actions: `updateScores`, `updateLives`, `resetMatchData`
    - `goToMenu` resets overlays, matchData, and sets phase to 'menu'
    - `startMatch` resets matchData and sets phase to 'playing'
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [x] 2. Create neon arcade styles
  - [x] 2.1 Create `src/app/styles.css` with design tokens and base styles
    - Define CSS custom properties: --bg-primary, --bg-surface, --text-primary, --text-secondary, --accent-neon, --accent-glow, --border-color, --border-radius, --focus-ring
    - Style `.app-shell` container: full viewport, dark background, flex layout
    - Style button base: crisp borders, geometric shape, neon focus ring
    - Style overlay backdrop: semi-transparent dark overlay
    - Style focus indicators: visible box-shadow using --focus-ring
    - Style segmented controls for mode/difficulty selection
    - Style form controls (inputs, sliders, toggles)
    - Import styles in `src/app/App.tsx` or `src/main.tsx`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [x] 3. Implement Mode Selection Screen
  - [x] 3.1 Create `src/components/ModeSelectionScreen.tsx`
    - Render three mode buttons: "Pong: Solo", "Pong: Versus", "Breakout"
    - Each button calls `useAppStore.getState().selectMode(mode)`
    - Use semantic `<button>` elements
    - Apply neon arcade styling (dark cards with crisp borders)
    - Add `aria-label` for each button if needed
    - Ensure Tab navigation between buttons works
    - Ensure Enter activates the focused button
    - Add visible focus indicator (neon glow ring)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 4. Implement Settings Panel
  - [x] 4.1 Create `src/components/SettingsPanel.tsx`
    - Read `selectedMode` from store to determine visible controls
    - For pong-solo: render win score input, AI difficulty segmented control, powerups toggle
    - For pong-versus: render win score input, powerups toggle
    - For breakout: render powerups toggle only
    - Win score: number input with min=3, max=21, step=1, default=7
    - AI difficulty: three-button segmented control (Easy/Normal/Hard), default Normal
    - Powerups toggle: checkbox/toggle, default off, label "Powerups (Coming Soon)"
    - "Start" button: validate settings, construct SceneLaunchPayload, call startMatch()
    - "Back" button: call goToMenu()
    - Use `validateSettings()` from settings-validator on Start
    - If validation fails, display error messages inline
    - Keyboard: Tab between controls, Enter on buttons
    - Apply neon arcade styling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 4.1, 4.2, 4.3_

- [x] 5. Implement Audio Controls
  - [x] 5.1 Create `src/components/AudioControls.tsx`
    - Import AudioManager singleton from `src/game/systems/AudioManager.ts`
    - Render mute toggle button (speaker icon or text: 🔊/🔇)
    - Render volume slider (range input, min=0, max=1, step=0.1)
    - On mount: read initial state from AudioManager (`getState()`)
    - Subscribe to `audio:state-change` on EventBridge in useEffect
    - On mute toggle: call `AudioManager.toggleMute()`
    - On volume change: call `AudioManager.setVolume(value)`
    - Update local display state from `audio:state-change` events
    - Unsubscribe from EventBridge on unmount (useEffect cleanup)
    - Keyboard: Tab to focus, Enter/Space for mute, arrow keys for slider
    - Position: fixed/absolute in corner, visible on all screens
    - Apply neon arcade styling
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 6. Implement Pause Overlay
  - [x] 6.1 Create `src/components/PauseOverlay.tsx`
    - Render only when `pauseOverlayOpen === true` from store
    - Display overlay backdrop (semi-transparent dark)
    - Display "PAUSED" heading
    - Three buttons: "Resume", "Restart", "Return to Menu"
    - Resume: call `closePauseOverlay()`, emit `match:pause { paused: false }` on EventBridge
    - Restart: call `resetMatchData()`, `closePauseOverlay()`, emit restart signal
    - Return to Menu: call `goToMenu()`
    - Focus trap: on mount, focus first button; Tab cycles within overlay
    - Escape key within overlay: equivalent to Resume
    - Use semantic `<button>` elements with clear labels
    - Apply neon arcade styling
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

- [x] 7. Implement Win/Loss Overlay
  - [x] 7.1 Create `src/components/WinLossOverlay.tsx`
    - Render only when `winLossOverlayOpen === true` from store
    - Read `matchData.winner` and `matchData.finalScore` from store
    - Display outcome: "Player [Left/Right] Wins!" for Pong, "Game Over — Score: N" for Breakout
    - Two buttons: "Restart", "Return to Menu"
    - Restart: call `resetMatchData()`, `closeWinLossOverlay()`, emit restart signal
    - Return to Menu: call `goToMenu()`
    - Focus trap: on mount, focus first button; Tab cycles within overlay
    - Use semantic `<button>` elements with clear labels
    - Apply neon arcade styling
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 8. Implement GameView with Phaser lifecycle and EventBridge wiring
  - [x] 8.1 Create `src/components/GameView.tsx`
    - Mount `PhaserContainer` with game config including scene and launch payload
    - Construct `SceneLaunchPayload` from store state on mount
    - Pass payload to Phaser via game config `data` field or scene init data
    - Subscribe to EventBridge events in useEffect:
      - `score:update` → call `updateScores(left, right)`
      - `match:win` → call `openWinLossOverlay(winner, null)`
      - `match:loss` → call `openWinLossOverlay(null, finalScore)`
      - `lives:update` → call `updateLives(remaining)`
      - `match:pause` → sync with store (external pause from scene)
    - Listen for Escape keydown on document:
      - If not already paused: call `openPauseOverlay()`, emit `match:pause { paused: true }`
      - If paused: call `closePauseOverlay()`, emit `match:pause { paused: false }`
    - Render `PauseOverlay` and `WinLossOverlay` conditionally
    - Unsubscribe all EventBridge listeners on unmount
    - Remove Escape keydown listener on unmount
    - Prevent Escape default only during "playing" phase
    - _Requirements: 4.4, 4.5, 4.6, 5.1, 5.2, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 11.3, 11.9_

- [x] 9. Update App.tsx to use phase-based routing
  - [x] 9.1 Refactor `src/app/App.tsx`
    - Import `useAppStore` and read `phase`
    - Import styles from `./styles.css`
    - Conditionally render: ModeSelectionScreen (menu), SettingsPanel (settings), GameView (playing)
    - Always render AudioControls
    - Wrap in `.app-shell` container div
    - Remove existing PhaserContainer direct rendering (replaced by GameView)
    - _Requirements: 1.2, 3.1, 7.1, 7.2_

- [x] 10. Write Zustand store tests
  - [x] 10.1 Create `src/app/store.test.ts`
    - Test: initial state has phase 'menu', selectedMode null, default settings
    - Test: selectMode sets mode and transitions to 'settings'
    - Test: goToMenu resets to phase 'menu', clears overlays and matchData
    - Test: startMatch sets phase to 'playing' and resets matchData
    - Test: setWinScore clamps values to [3, 21]
    - Test: setAiDifficulty updates difficulty
    - Test: setPowerupsEnabled updates toggle
    - Test: openPauseOverlay / closePauseOverlay toggle state
    - Test: openWinLossOverlay sets winner/finalScore and opens overlay
    - Test: updateScores updates matchData.scores
    - Test: updateLives updates matchData.lives
    - Test: resetMatchData clears scores, lives, winner, finalScore
    - Property test (fast-check): for any numeric input, setWinScore produces value in [3, 21]
    - Property test (fast-check): for any sequence of valid actions, phase is always one of 'menu' | 'settings' | 'playing'
    - Property test (fast-check): goToMenu from any state resets overlays and matchData
    - _Requirements: 9.1–9.8_

- [x] 11. Write component tests
  - [x] 11.1 Create `src/components/ModeSelectionScreen.test.tsx`
    - Test: renders three mode buttons
    - Test: clicking a mode button transitions to settings phase
    - Test: keyboard Enter on focused button selects mode
    - Test: all buttons have accessible names
    - _Requirements: 1.1, 1.3, 1.4_

  - [x] 11.2 Create `src/components/SettingsPanel.test.tsx`
    - Test: pong-solo mode shows win score, AI difficulty, and powerups controls
    - Test: pong-versus mode shows win score and powerups controls (no AI difficulty)
    - Test: breakout mode shows only powerups control
    - Test: win score defaults to 7
    - Test: win score input rejects values outside [3, 21]
    - Test: AI difficulty defaults to Normal
    - Test: powerups toggle defaults to off
    - Test: Start button calls validateSettings and transitions to playing
    - Test: Back button returns to menu
    - Test: validation error displays when settings invalid
    - _Requirements: 2.1–2.12, 4.1–4.3_

  - [x] 11.3 Create `src/components/AudioControls.test.tsx`
    - Test: renders mute toggle and volume slider
    - Test: mute toggle calls AudioManager.toggleMute()
    - Test: volume slider calls AudioManager.setVolume()
    - Test: subscribes to audio:state-change on mount
    - Test: unsubscribes from audio:state-change on unmount
    - Test: updates display when audio:state-change event received
    - _Requirements: 3.1–3.7_

  - [x] 11.4 Create `src/components/PauseOverlay.test.tsx`
    - Test: renders when pauseOverlayOpen is true
    - Test: does not render when pauseOverlayOpen is false
    - Test: Resume button closes overlay and emits match:pause false
    - Test: Return to Menu button calls goToMenu
    - Test: Escape key within overlay triggers resume
    - Test: focus moves to first button on open
    - _Requirements: 5.3–5.9_

  - [x] 11.5 Create `src/components/WinLossOverlay.test.tsx`
    - Test: renders when winLossOverlayOpen is true
    - Test: displays winner name for Pong win
    - Test: displays final score for Breakout loss
    - Test: Restart button resets match data and closes overlay
    - Test: Return to Menu button calls goToMenu
    - Test: focus moves to first button on open
    - _Requirements: 6.1–6.8_

  - [x] 11.6 Create `src/components/GameView.test.tsx`
    - Test: subscribes to score:update, match:win, match:loss, lives:update on mount
    - Test: unsubscribes from all events on unmount
    - Test: score:update event updates store scores
    - Test: match:win event opens win/loss overlay with winner
    - Test: match:loss event opens win/loss overlay with finalScore
    - Test: Escape key opens pause overlay
    - Test: does not process events when phase is not 'playing'
    - _Requirements: 8.1–8.7_

- [x] 12. Validation and cleanup
  - [x] 12.1 Run all validation commands
    - `npm run typecheck` passes with no errors
    - `npm run lint` passes with no errors or warnings
    - `npm test` passes with all new and existing tests green
    - `npm run build` produces output without errors
    - _Delivery Standards: Definition of Done_

  - [x] 12.2 Verify keyboard navigation end-to-end
    - Tab navigates between all interactive elements in logical order
    - Enter activates focused buttons
    - Escape opens/closes pause overlay during gameplay
    - Focus indicators are visible on all interactive elements
    - Overlays trap focus correctly
    - _Requirements: 11.1–11.9_

  - [x] 12.3 Verify no regressions in existing tests
    - All existing tests from prior specs continue to pass
    - EventBridge tests still pass
    - AudioManager tests still pass
    - Settings validator tests still pass
    - _Delivery Standards: Definition of Done_

## Notes

- The Phaser game currently only has a PlaceholderScene. The app shell launches this scene during the "playing" phase. Actual game scenes (PongScene, BreakoutScene) will be wired in by later specs.
- The powerups toggle is rendered but functionally disabled ("Coming Soon" label) until the `powerups` spec is implemented.
- Restart functionality emits a signal that scenes will handle. For now with PlaceholderScene, restart is a no-op beyond resetting React state.
- AudioManager is imported as a singleton module. Tests mock it to avoid Web Audio API dependency.
- CSS uses custom properties for theming. No CSS-in-JS library is added — plain CSS with the neon arcade design tokens.
- Property-based tests in the store test file validate state invariants across random action sequences.
- Component tests use `@testing-library/react` with `happy-dom` environment.
- This spec adds `zustand` as the only new npm dependency. It is well-known, actively maintained, and minimal in size.
