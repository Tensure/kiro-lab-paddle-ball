# Pong Gameplay Fixes Bugfix Design

## Overview

After launching Pong (Solo or Versus), the game is unplayable due to multiple interacting defects rooted in scene launch timing. The `postBoot` callback passes data to PongScene unreliably, causing `init()` to receive undefined data. This cascades into: keyboard input failing (scene input plugin not ready), match ending after 1 point (winScore defaults to 0/NaN), AI not activating (mode not detected), and restart not working (no signal from React overlays back to Phaser). Additionally, ball physics need hardening against tunneling at high speeds.

The fix strategy eliminates the timing dependency by storing the launch payload in a module-level variable that PongScene reads synchronously in `init()`. A new `scene:restart` event on EventBridge enables React overlays to signal the Phaser scene to restart. Ball physics are hardened with a `maxSpeed` cap on the body.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — PongScene's `init()` receives undefined/incomplete data because `postBoot` fires before the scene manager processes the added scene's init data, OR the restart button is clicked but no signal reaches the Phaser scene
- **Property (P)**: The desired behavior — PongScene always receives complete `SceneLaunchPayload` with correct `winScore`, `mode`, and `aiDifficulty`; restart signals reach the scene and trigger a full scene restart
- **Preservation**: Existing pause/resume, return-to-menu, score emission, win detection, and EventBridge communication that must remain unchanged
- **SceneLauncher**: A new module at `src/game/systems/SceneLauncher.ts` that stores and retrieves the launch payload via module-level state
- **PongScene**: The Phaser scene in `src/game/scenes/PongScene.ts` that runs Pong gameplay
- **GameView**: The React component in `src/components/GameView.tsx` that creates the Phaser game and mounts overlays
- **EventBridge**: The typed event bus in `src/game/systems/EventBridge.ts` for Phaser↔React communication

## Bug Details

### Bug Condition

The bug manifests when GameView creates a Phaser game with `postBoot` callback using `game.scene.add('PongScene', PongScene, true, payload)`. The scene manager may not reliably deliver the `data` parameter to `init()` due to timing between boot completion and scene addition. This causes `init()` to receive `undefined` or an empty object, leading to cascading failures in winScore, mode detection, AI activation, and keyboard setup.

A secondary bug manifests when the user clicks "Restart" on overlays — the React state resets but no signal reaches PongScene, leaving it frozen in `matchOver = true` state.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { launchContext: 'initial' | 'restart', sceneData: SceneLaunchPayload | undefined }
  OUTPUT: boolean
  
  CASE input.launchContext OF
    'initial':
      RETURN input.sceneData IS undefined
             OR input.sceneData.settings IS undefined
             OR input.sceneData.settings.winScore IS undefined OR NaN
    'restart':
      RETURN restartButtonClicked
             AND NOT sceneRestartTriggered
  END CASE
END FUNCTION
```

### Examples

- **Initial launch, Solo mode**: User selects Pong Solo with winScore=7, aiDifficulty='hard'. GameView creates game. PongScene.init() receives `undefined` → winScore becomes NaN, isAIControlled stays false, keyboard may not work. **Expected**: init() receives `{ settings: { mode: 'pong-solo', winScore: 7, aiDifficulty: 'hard', powerupsEnabled: false }, players: ['left', 'right'] }`
- **Initial launch, Versus mode**: User selects Pong Versus with winScore=11. PongScene.init() receives `undefined` → match ends after 1 point. **Expected**: winScore=11, both paddles keyboard-controlled
- **Restart from WinLossOverlay**: Player wins, clicks Restart. React resets matchData but PongScene stays in `matchOver=true`. **Expected**: PongScene restarts with same settings, scores reset to 0-0
- **Restart from PauseOverlay**: Player pauses, clicks Restart. Same issue — scene stays paused/frozen. **Expected**: PongScene restarts fresh

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Escape key pauses the game and shows PauseOverlay; pressing Escape again or clicking Resume unpauses
- "Return to Menu" from any overlay navigates back to mode selection and destroys the Phaser game
- When a player reaches winScore, `match:win` is emitted via EventBridge and WinLossOverlay displays the correct winner
- When paused via `match:pause`, physics freeze and paddle input is ignored until resumed
- When the ball exits left/right edge, a point is awarded to the opposing player, `score:update` is emitted, and the ball serves from center
- Settings configured in SettingsPanel (winScore, aiDifficulty) pass through to the scene launch payload without modification
- Audio events (`audio:paddle-hit`, `audio:wall-bounce`, `audio:score-point`, `audio:win`, `audio:pause`) continue to emit at the correct times

**Scope:**
All inputs that do NOT involve scene initialization data delivery or restart signaling should be completely unaffected by this fix. This includes:
- Normal gameplay physics and collision handling
- Score tracking and win condition logic (once winScore is correctly set)
- AI paddle movement (once mode is correctly detected)
- EventBridge event emission patterns
- React store state management

## Hypothesized Root Cause

Based on code inspection, the confirmed root causes are:

1. **Scene Launch Timing (Bugs 1, 2, 3, 4)**: `postBoot` callback calls `game.scene.add('PongScene', PongScene, true, payload)`. The `true` parameter auto-starts the scene, but the data parameter may not be reliably passed to `init()` because the scene manager processes the addition asynchronously relative to the boot callback context. When `init()` receives no data, `winScore` defaults incorrectly, `mode` is undetected, and the keyboard plugin may not be ready because the scene's input system hasn't fully initialized.

2. **Missing Restart Signal (Bug 5)**: PauseOverlay and WinLossOverlay call `resetMatchData()` and close themselves, but nothing tells PongScene to restart. The scene remains in `matchOver = true` or `paused = true` state with no mechanism to re-enter gameplay.

3. **Ball Physics Edge Cases (Bug 6)**: With `setBounce(1, 1)` and no `maxSpeed` cap, the ball can accelerate beyond what Arcade Physics handles cleanly per frame, potentially tunneling through paddles or getting stuck in walls at high velocities.

## Correctness Properties

Property 1: Bug Condition - Scene Always Receives Valid Payload

_For any_ game launch where GameView creates a Phaser game with a SceneLaunchPayload, PongScene's `init()` SHALL receive the complete payload with valid `winScore` (number ≥ 3), correct `mode`, and correct `aiDifficulty` (when applicable), regardless of Phaser boot timing.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Bug Condition - Restart Signal Reaches Scene

_For any_ restart action triggered from PauseOverlay or WinLossOverlay, PongScene SHALL restart with the same settings (mode, winScore, aiDifficulty, powerupsEnabled) and scores reset to 0-0, transitioning from `matchOver=true` or `paused=true` back to active gameplay.

**Validates: Requirements 2.5**

Property 3: Preservation - Existing Gameplay Behavior

_For any_ input that is NOT related to scene initialization or restart signaling (normal gameplay, pause/resume, return-to-menu, scoring, win detection), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing EventBridge emissions, overlay interactions, and physics behavior.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

Property 4: Bug Condition - Ball Physics Stability

_For any_ ball-paddle collision sequence where the ball speed increases via `computeSpeedAfterHit`, the ball's velocity magnitude SHALL never exceed `PONG.MAX_SPEED` and the ball SHALL not tunnel through paddles or get stuck in walls.

**Validates: Requirements 2.6**

## Fix Implementation

### Changes Required

**File**: `src/game/types/events.ts`

**Change**: Add `'scene:restart'` event to EventMap
- Add `'scene:restart': undefined` to the EventMap type

---

**File**: `src/game/systems/SceneLauncher.ts` (NEW)

**Purpose**: Module-level payload storage that eliminates timing dependency

**Specific Changes**:
1. Export `setLaunchPayload(payload: SceneLaunchPayload): void` — stores payload in module variable
2. Export `getLaunchPayload(): SceneLaunchPayload | null` — retrieves stored payload
3. Export `clearLaunchPayload(): void` — clears stored payload (for cleanup)

---

**File**: `src/components/GameView.tsx`

**Specific Changes**:
1. Import `setLaunchPayload` from SceneLauncher
2. Call `setLaunchPayload(payload)` before creating the Phaser game
3. Keep `postBoot` with `game.scene.add('PongScene', PongScene, true, payload)` as-is (the scene will read from SceneLauncher as fallback/primary source)

---

**File**: `src/game/scenes/PongScene.ts`

**Specific Changes**:
1. Import `getLaunchPayload` from SceneLauncher
2. In `init()`: if `data` is undefined or missing settings, read from `getLaunchPayload()`
3. Add defensive guard: if winScore is 0, NaN, or undefined after both sources, force to 7
4. In `create()`: subscribe to `'scene:restart'` on EventBridge
5. Add `handleRestart` method that calls `this.scene.restart()` (which re-runs init+create)
6. In `shutdown`: unsubscribe from `'scene:restart'`
7. Remove the dummy key fallback — assert `this.input.keyboard` exists (it will once scene launches properly)
8. Add `this.ball.body.setMaxSpeed(PONG.MAX_SPEED)` after ball creation to prevent tunneling

---

**File**: `src/components/PauseOverlay.tsx`

**Specific Changes**:
1. Import `eventBridge`
2. In `handleRestart`: emit `eventBridge.emit('scene:restart')` after `resetMatchData()` and `closePauseOverlay()`

---

**File**: `src/components/WinLossOverlay.tsx`

**Specific Changes**:
1. Import `eventBridge`
2. In `handleRestart`: emit `eventBridge.emit('scene:restart')` after `resetMatchData()` and `closeWinLossOverlay()`

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis.

**Test Plan**: Write unit tests that verify PongScene.init() behavior when called with undefined data, and verify that overlay restart buttons do not emit any scene restart signal.

**Test Cases**:
1. **Payload Delivery Test**: Call PongScene.init(undefined) and verify winScore defaults incorrectly (will demonstrate bug on unfixed code)
2. **Restart Signal Test**: Click restart on WinLossOverlay and verify no `scene:restart` event is emitted (will demonstrate bug on unfixed code)
3. **Keyboard Null Test**: Create PongScene via postBoot and verify `this.input.keyboard` may be null (will demonstrate bug on unfixed code)
4. **AI Mode Detection Test**: Call PongScene.init(undefined) and verify isAIControlled stays false even when Solo mode was selected (will demonstrate bug on unfixed code)

**Expected Counterexamples**:
- PongScene.init() receives undefined data, causing winScore=NaN and isAIControlled=false
- Overlay restart buttons reset React state but emit no event to Phaser
- Possible causes: postBoot timing, missing event in EventMap, no restart handler in scene

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := launchPongScene_fixed(input)
  ASSERT result.winScore >= 3 AND result.winScore <= 21
  ASSERT result.mode === expectedMode
  ASSERT result.keyboardWorking === true
  ASSERT result.aiActive === (mode === 'pong-solo')
END FOR

FOR ALL restartAction WHERE restartButtonClicked DO
  result := handleRestart_fixed(restartAction)
  ASSERT sceneRestarted === true
  ASSERT scores === { left: 0, right: 0 }
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalBehavior(input) = fixedBehavior(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for normal gameplay interactions (scoring, pause, resume, return-to-menu), then write property-based tests capturing that behavior.

**Test Cases**:
1. **Pause/Resume Preservation**: Verify Escape key pauses and resumes correctly after fix
2. **Score Emission Preservation**: Verify `score:update` events emit with correct payload after each point
3. **Win Detection Preservation**: Verify `match:win` emits when score reaches winScore
4. **Return to Menu Preservation**: Verify `goToMenu()` destroys game and returns to menu

### Unit Tests

- Test SceneLauncher: setLaunchPayload stores data, getLaunchPayload retrieves it, clearLaunchPayload clears it
- Test PongScene.init() reads from SceneLauncher when data parameter is undefined
- Test PongScene.init() uses data parameter when provided (backward compatibility)
- Test PongScene handles `scene:restart` event by restarting
- Test PauseOverlay restart emits `scene:restart`
- Test WinLossOverlay restart emits `scene:restart`
- Test ball maxSpeed is set correctly

### Property-Based Tests

- Generate random SceneLaunchPayload values and verify PongScene.init() always produces valid state (winScore ≥ 3, mode correctly detected)
- Generate random game states and verify scoring logic is unchanged
- Generate random pause/resume sequences and verify state transitions are preserved

### Integration Tests

- Test full flow: select Pong Solo → launch → verify AI moves and keyboard works
- Test full flow: play to win → click Restart → verify scene restarts with same settings
- Test full flow: pause → restart → verify scene restarts from paused state
- Test ball speed never exceeds MAX_SPEED after many paddle hits
