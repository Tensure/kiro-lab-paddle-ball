# Design Document

## Overview

This design describes targeted guards and behavioral fixes to harden the match lifecycle. Changes are minimal and surgical — no new modules, no state machine extraction, no visual changes. Each requirement maps to a small code change in an existing file plus a focused test.

## Architecture

The existing architecture is preserved. Changes touch:

| Layer | File(s) | Change Type |
|-------|---------|-------------|
| Store | `src/app/store.ts` | Add phase guards to settings actions; add overlay stacking guards |
| React | `src/components/GameView.tsx` | Add win/loss check to Escape handler |
| Phaser | `src/game/scenes/PongScene.ts` | Cancel timers on restart/shutdown |
| Phaser | `src/game/scenes/BreakoutScene.ts` | Cancel timers on restart/shutdown |
| Tests | `src/app/store.test.ts` | New property tests for guards |
| Tests | `src/game/scenes/__tests__/lifecycle.test.ts` | Focused unit tests for timer cancellation logic |
| Tests | `src/components/GameView.test.tsx` | Escape key guard test |

No new systems, modules, or npm dependencies are introduced.

## Detailed Design

### 1. Settings Immutability Guards (Store)

**File:** `src/app/store.ts`

Modify `setWinScore`, `setAiDifficulty`, and `setPowerupsEnabled` actions to check `get().phase` before applying changes:

```typescript
setWinScore: (score) => {
  if (get().phase === 'playing') return;
  set({ winScore: validateWinScore(score) });
},

setAiDifficulty: (difficulty) => {
  if (get().phase === 'playing') return;
  set({ aiDifficulty: difficulty });
},

setPowerupsEnabled: (enabled) => {
  if (get().phase === 'playing') return;
  set({ powerupsEnabled: enabled });
},
```

This requires changing `create<AppState>((set) => ({` to `create<AppState>((set, get) => ({` to access `get`.

**Rationale:** Guards in the store are the single enforcement point. UI components don't need to independently check phase — the store is the source of truth.

### 2. Overlay Stacking Prevention (Store)

**File:** `src/app/store.ts`

Modify `openPauseOverlay` to reject if win/loss is open:

```typescript
openPauseOverlay: () => {
  if (get().winLossOverlayOpen) return;
  set({ pauseOverlayOpen: true });
},
```

Modify `openWinLossOverlay` to close pause overlay first:

```typescript
openWinLossOverlay: (winner, finalScore) => set({
  winLossOverlayOpen: true,
  pauseOverlayOpen: false,
  matchData: { ...INITIAL_MATCH_DATA, winner, finalScore },
}),
```

**Rationale:** Win/loss takes priority over pause. If a match ends while paused, the win/loss overlay replaces the pause overlay. The reverse (pausing during win/loss) is nonsensical and rejected.

### 3. Escape Key Guard (GameView)

**File:** `src/components/GameView.tsx`

In the Escape key `useEffect`, add a check for `winLossOverlayOpen`:

```typescript
const handleKeyDown = (e: KeyboardEvent): void => {
  if (e.key === 'Escape') {
    e.preventDefault();
    const state = useAppStore.getState();
    if (state.winLossOverlayOpen) return; // ignore during win/loss
    if (!state.pauseOverlayOpen) {
      state.openPauseOverlay();
      eventBridge.emit('match:pause', { paused: true });
    } else {
      state.closePauseOverlay();
      eventBridge.emit('match:pause', { paused: false });
    }
  }
};
```

**Rationale:** The guard lives in GameView because that's where the Escape handler is registered. The store's `openPauseOverlay` guard (from §2) provides defense-in-depth, but the GameView guard prevents the `match:pause` event from being emitted at all.

### 4. Timer Cancellation on Restart (Scenes)

**Files:** `src/game/scenes/PongScene.ts`, `src/game/scenes/BreakoutScene.ts`

Modify `handleRestart` in both scenes to remove all pending time events before restarting:

```typescript
private handleRestart = (): void => {
  this.time.removeAllEvents();
  this.scene.restart();
};
```

`this.time.removeAllEvents()` is a Phaser `Clock` method that cancels all pending `delayedCall` timers for the scene. This ensures no stale serve callback fires after the scene re-initializes.

**Rationale:** `this.scene.restart()` triggers `shutdown` then `init` + `create`. The shutdown handler unsubscribes EventBridge listeners and keyboard handlers, but Phaser's internal timer queue is not automatically cleared by `scene.restart()`. Explicitly removing time events prevents the race condition where a pending serve fires into a freshly-initialized scene.

### 5. Shutdown Safety (Scenes)

**Files:** `src/game/scenes/PongScene.ts`, `src/game/scenes/BreakoutScene.ts`

The existing `shutdown` handlers already unsubscribe EventBridge and keyboard listeners. Add `this.time.removeAllEvents()` to shutdown as well, for the return-to-menu path where `game.destroy(true)` triggers shutdown:

```typescript
shutdown = (): void => {
  this.time.removeAllEvents();
  eventBridge.off('match:pause', this.handlePause);
  eventBridge.off('scene:restart', this.handleRestart);
  if (this.boundKeyDown) window.removeEventListener('keydown', this.boundKeyDown);
  if (this.boundKeyUp) window.removeEventListener('keyup', this.boundKeyUp);
};
```

**Rationale:** When `game.destroy(true)` is called (GameView unmount), Phaser destroys scenes which triggers shutdown. Adding timer cleanup here ensures no orphaned callbacks attempt to reference destroyed objects.

### 6. Rapid Pause/Unpause (No Code Change Needed)

The current implementation already handles this correctly:

- `handlePause` in both scenes sets `this.paused` and calls `physics.pause()`/`physics.resume()` based on the payload.
- The `update()` loop checks `this.paused` and skips all logic.
- Physics pause/resume is idempotent in Phaser — calling `pause()` twice has no additional effect.

The only deliverable here is a **focused test** that verifies the invariant: after any sequence of pause/unpause events, the scene's paused state matches the last event's payload.

## Testing Strategy

| Requirement | Test Type | Location |
|-------------|-----------|----------|
| R1: Settings immutability | Property-based (fast-check) | `src/app/store.test.ts` |
| R2: Overlay stacking | Property-based (fast-check) | `src/app/store.test.ts` |
| R3: Escape key guard | Unit test | `src/components/GameView.test.tsx` |
| R4: Timer cancellation | Unit test | `src/game/scenes/__tests__/lifecycle.test.ts` |
| R5: Return-to-menu cleanup | Unit test (store) + manual verification | `src/app/store.test.ts` |
| R6: Rapid pause/unpause | Property-based (fast-check) | `src/app/store.test.ts` |

### Property-Based Test Properties

**Property 1 (R1):** For any sequence of phase transitions and settings mutations, settings values are unchanged whenever the most recent phase transition resulted in `playing`.

**Property 2 (R2):** For any sequence of overlay open/close actions, `pauseOverlayOpen && winLossOverlayOpen` is never true.

**Property 3 (R6):** For any sequence of pause/unpause toggles, the final `pauseOverlayOpen` state equals the last toggle direction.

### Manual Verification Checklist

- [ ] Pong Solo: Pause during serve delay → restart → ball serves fresh
- [ ] Pong Versus: Win/loss overlay showing → Escape does nothing
- [ ] Breakout: Return to menu while paused → menu loads cleanly
- [ ] All modes: Open settings panel during match → settings are read-only
- [ ] All modes: Rapid Escape spam → game pauses/unpauses without visual glitch

## Dependencies

- `react-app-shell` (store, GameView, overlays)
- `pong-core` (PongScene)
- `pong-ai` (PongScene AI mode)
- `breakout-core` (BreakoutScene)

## Out of Scope

- Formal state machine extraction (deferred)
- New UI elements or visual changes
- Powerup cleanup (deferred to powerups spec)
- Settings persistence
