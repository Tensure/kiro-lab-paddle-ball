# Spec Backlog — Paddle Arcade

Roadmap for the React + TypeScript + Phaser 3 rewrite of the paddle arcade game.

Each spec is sized for incremental delivery: one concern, clear boundaries, testable output. Specs build on each other in dependency order. Later specs assume earlier ones are complete.

---

## Implementation Order

| # | Spec Name | Status |
|---|-----------|--------|
| 1 | `react-phaser-foundation` | ✅ Complete |
| 2 | `shared-types-and-rules` | ✅ Complete |
| 3 | `audio-system` | ✅ Complete |
| 4 | `react-app-shell` | ✅ Complete |
| 5 | `pong-core` | ✅ Complete |
| 6 | `pong-ai` | ✅ Complete |
| 7 | `breakout-core` | ✅ Complete |
| 8 | `match-lifecycle` | ✅ Complete |
| 9 | `neon-visuals` | ✅ Complete |
| 10 | `powerups` | ✅ Complete |

---

## Follow-Up Items (Post-Backlog)

These items were identified during implementation and should be addressed:

| Item | Priority | Belongs In | Description |
|------|----------|-----------|-------------|
| Gamey ball physics | High | New spec: `ball-physics` | Rework ball bounce to use paddle-relative hit position for angle influence, add degenerate trajectory prevention, tune speed ramping to feel satisfying. Implement as pure rule functions with tunable constants. |
| Extended menu configuration | High | New spec: `extended-settings` | Add ball speed preset, paddle size, ball speed increase (Pong); starting lives, ball speed, paddle size, brick density (Breakout). Extend settings types, validator, and UI. |
| Pong scoreboard HUD | High | `pong-core` | Display both players' scores and target win score on the Phaser canvas during Pong matches. Use Phaser text at top center, update on each `score:update`. |
| Breakout score/lives HUD | High | `breakout-core` | Display current score and remaining lives on the Phaser canvas during Breakout matches. |
| Restart from win/loss overlay | Medium | `match-lifecycle` | Verify restart works cleanly from win/loss state in all modes. |

---

## Spec Details

### 1. `react-phaser-foundation`

**Goal:** Stand up the Vite + React + TypeScript + Phaser 3 project with working build, lint, typecheck, and test commands. Establish the React ↔ Phaser integration pattern and event bridge contract. No gameplay yet.

**Proves:** The toolchain works end-to-end. Phaser mounts inside React. The event bridge pattern compiles and a placeholder event round-trips. All four validation commands pass on an empty app.

**Dependencies:** None (first spec).

**Scope rationale:** Isolates all toolchain decisions (Vite config, tsconfig, ESLint, Vitest, Phaser integration pattern, folder structure, event bridge contract) so later specs can focus on behavior. Keeps the first PR reviewable and mergeable without gameplay risk.

**Key deliverables:**
- Vite project with React 18+ and TypeScript strict mode
- Phaser 3 installed and mounting a placeholder scene inside a React component
- Folder structure matching `src/app/`, `src/components/`, `src/game/`, `src/game/scenes/`, `src/game/systems/`, `src/game/rules/`, `src/game/types/`
- React ↔ Phaser event bridge: typed contract, placeholder event, integration test
- `npm run dev`, `npm run build`, `npm run typecheck`, `npm run lint`, `npm test` all pass
- Vitest configured with fast-check available for property-based tests
- Kiro hooks: lint-on-save for `.ts`/`.tsx` files
- Basic README with dev instructions

**Spec-local ADRs expected:** Vite vs alternatives, event bridge pattern choice, test runner selection.

**Owner:** `gameplay-implementer` · **Reviewer:** `game-architect`

---

### 2. `shared-types-and-rules`

**Goal:** Define the typed contracts for modes, settings, players, AI difficulty, scene events, and audio events. Implement pure deterministic game rules that all modes share or consume.

**Proves:** Core game logic is testable without Phaser. Types enforce boundaries between React, Phaser, and pure modules.

**Dependencies:** `react-phaser-foundation`

**Scope rationale:** Types and pure rules are the foundation every scene and UI component imports. Delivering them before any scene work prevents type drift and ensures rules are tested in isolation before being wired into runtime. Powerup types are deferred to the `powerups` spec to avoid premature design.

**Key deliverables:**
- Type definitions: game modes, match settings, player IDs, AI difficulty presets, scene launch payloads, scene-to-React events, audio event names
- Pure rule modules: Pong scoring, win-score validation, serve direction, Breakout brick-grid generation, Breakout life/win/loss rules
- Unit tests and property-based tests for all pure rules
- Settings validation (win score range clamping, mode-specific settings gating)

**Note:** Powerup types are intentionally excluded. They will be defined in the `powerups` spec when that system is designed.

**Owner:** `gameplay-implementer` · **Reviewer:** `quality-reviewer`

---

### 3. `audio-system`

**Goal:** Implement the synthesized Web Audio system with named event routing, mute/volume support, and distinct cues for all game events.

**Proves:** Audio plays on demand, respects mute/volume, and integrates with both Phaser scenes and React controls without external assets.

**Dependencies:** `react-phaser-foundation`, `shared-types-and-rules` (for audio event name types)

**Scope rationale:** Audio is cross-cutting. Building it before gameplay scenes means scenes can emit audio events from day one. Isolating audio avoids mixing sound synthesis debugging with gameplay logic debugging.

**Key deliverables:**
- Audio manager with synthesized Web Audio buffers
- Named audio events: paddle hit, wall bounce, brick break, score, life loss, powerup pickup, pause, win, loss
- Mute toggle and volume control interface
- Integration hook for Phaser scenes (emit event → sound plays)
- React-accessible mute/volume state
- **CRITICAL:** AudioManager requires explicit `init()` call from GameView on mount and `destroy()` on unmount. It is a passive EventBridge listener that does nothing until initialized.

**Spec-local ADRs expected:** Web Audio synthesis approach, Phaser sound manager vs custom wrapper.

**Owner:** `gameplay-implementer` · **Reviewer:** `game-architect`

---

### 4. `react-app-shell`

**Goal:** Build the React app shell: mode selection, pre-match settings, overlays, pause/resume, Phaser game container lifecycle, and navigation between menu and active game.

**Proves:** Users can select a mode, configure settings, launch a Phaser scene with correct settings, pause/resume, restart, and return to menu — all through keyboard-navigable React UI. The event bridge carries scene events to React overlays.

**Dependencies:** `react-phaser-foundation`, `shared-types-and-rules`, `audio-system`

**Scope rationale:** The app shell is the integration layer that launches scenes and manages non-gameplay flow. Delivering it before mode scenes means scenes wire into a real shell from the start rather than building throwaway overlays. Mode scenes can focus purely on gameplay.

**Key deliverables:**
- Mode selection screen: Pong: Solo, Pong: Versus, Breakout
- Pre-match settings: win score (Pong), AI difficulty (Solo), powerups toggle (disabled until `powerups` spec)
- Mute/volume controls wired to audio system
- Pause overlay (triggered by Escape or button)
- Restart and return-to-menu from pause and win/loss overlays
- Phaser game mount/unmount lifecycle managed by React
- Event bridge: scene events update React overlay state (score, win/loss, pause)
- Clean neon arcade styling for all UI elements
- React component tests for settings and mode selection

**Spec-local ADRs expected:** Event bridge implementation pattern, state management approach.

**Owner:** `gameplay-implementer` · **Reviewer:** `game-architect`

---

### 5. `pong-core`

**Goal:** Implement the `PongScene` with working ball physics, paddle movement, scoring, win detection, and two-player (`Pong: Versus`) keyboard input. Wire into the app shell.

**Proves:** A complete Pong match can be played to completion with two local players. Ball/paddle physics feel correct. Scoring and win state emit correctly to the React shell.

**Dependencies:** `shared-types-and-rules`, `audio-system`, `react-app-shell`

**Scope rationale:** Pong Versus is the simplest complete match: two paddles, one ball, score to win. No AI complexity. Delivers a playable game early and validates the Phaser scene pattern, physics tuning, and event bridge integration.

**Key deliverables:**
- `PongScene` with Arcade Physics: ball, two paddles, walls
- Keyboard input: left player W/S, right player ArrowUp/ArrowDown
- Scoring: ball off edge awards point to opponent
- Configurable win score (received from shell, locked at match start)
- Ball speed increases slightly on each paddle hit (resets on point scored)
- Scoreboard HUD rendered on Phaser canvas: both players' scores and "First to N" label, updated on each point
- Scene emits score/win/pause events to React shell via event bridge
- Audio event emission for hits, bounces, scores, win
- Serve direction alternates after each point
- Property-based tests for collision helpers and paddle bounds

**Owner:** `gameplay-implementer` · **Reviewer:** `quality-reviewer`

---

### 6. `pong-ai`

**Goal:** Add AI paddle control for `Pong: Solo` with three difficulty levels (Easy, Normal, Hard).

**Proves:** AI is beatable at all difficulties. Difficulty selection works before match start. AI uses capped speed, reaction delay, and prediction error — not direct ball tracking.

**Dependencies:** `pong-core`

**Scope rationale:** AI is a distinct behavioral layer on top of working Pong physics. Separating it lets `pong-core` ship and be tested with two humans first. AI tuning and difficulty balancing are their own review concern.

**Key deliverables:**
- AI controller with configurable difficulty presets
- Difficulty parameters: max paddle speed, reaction delay, prediction error margin
- Pre-match difficulty selector wired into app shell settings
- `Pong: Solo` mode launches PongScene with AI on left paddle
- Pure AI target-selection logic testable without Phaser
- Tests verifying AI respects speed caps and introduces error

**Owner:** `gameplay-implementer` · **Reviewer:** `quality-reviewer`

---

### 7. `breakout-core`

**Goal:** Implement the `BreakoutScene` with brick grid, ball physics, paddle control, lives, scoring, and win/loss conditions. Wire into the app shell.

**Proves:** A complete Breakout match can be played to win (clear all bricks) or loss (lose all lives). Brick generation is correct and testable.

**Dependencies:** `shared-types-and-rules`, `audio-system`, `react-app-shell`

**Scope rationale:** Breakout is the second game mode and exercises different mechanics (bricks, lives, single paddle). It reuses shared types, audio, and the app shell but has its own scene, rules, and layout.

**Key deliverables:**
- `BreakoutScene` with Arcade Physics: ball, paddle, brick grid, walls
- Keyboard input: ArrowLeft/ArrowRight and A/D
- Brick grid generated from pure rule module
- Score tracking (points per brick)
- Lives display, starting at 3
- Scoreboard HUD rendered on Phaser canvas: current score and remaining lives, updated on each brick break and life loss
- Win condition: all bricks cleared
- Loss condition: all lives gone
- Scene emits score/lives/win/loss events to React shell
- Audio events for brick break, life loss, win, loss
- Property-based tests for brick grid generation (no overlap, fits bounds)

**Owner:** `gameplay-implementer` · **Reviewer:** `quality-reviewer`

---

### 8. `match-lifecycle`

**Goal:** Harden and unify the match lifecycle across all modes: start, pause, resume, restart, win/loss, and return-to-menu transitions. This is a hardening spec, not a new capability — it catches edge cases and integration bugs in transitions that mode specs delivered individually.

**Proves:** No mode has broken transitions. Pause freezes physics. Restart resets state cleanly. Menu return destroys the scene properly. Settings cannot change mid-match. Rapid state transitions don't corrupt game state.

**Dependencies:** `react-app-shell`, `pong-core`, `pong-ai`, `breakout-core`

**Scope rationale:** Each mode spec delivers basic lifecycle, but edge cases (rapid pause/unpause, restart during win overlay, settings mutation attempts, scene destruction during transitions) need a focused hardening pass. This spec catches integration bugs between React and Phaser lifecycle that individual mode specs don't exercise.

**Key deliverables:**
- Shared lifecycle state machine or pattern across scenes (extracted if practical)
- Pause freezes physics and input; resume restores cleanly
- Restart resets score, ball, bricks, lives without scene re-creation if possible
- Return-to-menu destroys active scene and returns to mode selection
- Settings locked at match start; no mid-match mutation
- Edge case coverage: rapid transitions, overlay stacking, destruction timing
- Tests for lifecycle transitions (pure state machine if extracted)

**Owner:** `gameplay-implementer` · **Reviewer:** `game-architect`

---

### 9. `neon-visuals`

**Goal:** Apply the clean neon arcade visual direction: glow effects, particle feedback, camera effects, and polished programmatic rendering across all modes and UI.

**Proves:** Visual feedback reinforces gameplay events. Programmatic rendering is consistent across modes. Performance remains at 60fps with effects active.

**Dependencies:** `pong-core`, `breakout-core`, `react-app-shell`

**Scope rationale:** Visual polish is best applied after gameplay and UI are stable. Separating it avoids mixing rendering concerns with physics/logic debugging. It also lets visual work be reviewed for game feel independently. This spec's requirements will need careful scoping during design to define exactly which treatments apply where. Note: React UI neon styling (CSS tokens, focus rings, dark theme) was delivered in `react-app-shell` — this spec focuses on Phaser-side visuals only.

**Key deliverables:**
- Neon glow on paddles, ball, and bricks (programmatic, no external assets)
- Particle effects for: scoring point, brick break, match win, powerup pickup
- Camera shake or flash on significant events (configurable intensity)
- Dark neutral background with high-contrast game objects
- Consistent visual language between React UI and Phaser canvas
- Performance validation: 60fps maintained with all effects active on target hardware
- Graceful degradation: effects can be reduced if performance drops

**Owner:** `gameplay-implementer` · **Reviewer:** `quality-reviewer`

---

### 10. `powerups`

**Goal:** Implement the mode-aware powerup system: registry, spawning, collection, effect application, duration, cleanup, and per-match toggle.

**Proves:** Powerups spawn, apply effects correctly per mode, respect duration/stacking rules, clean up on expiry or match end, and can be toggled off entirely.

**Dependencies:** `pong-core`, `pong-ai`, `breakout-core`, `match-lifecycle`, `shared-types-and-rules`

**Scope rationale:** Powerups are explicitly optional and default off. They touch every mode and the lifecycle system. Delivering them last means the base game is solid before adding complexity. The powerup registry and eligibility rules are already typed in `shared-types-and-rules`, so this spec wires them into runtime.

**Key deliverables:**
- Powerup registry with all defined powerups (shared, Pong-only, Breakout-only)
- Spawn system: rare, random, mode-eligible
- Collection: ball or paddle collision with powerup sprite
- Effect application: modify paddle size, ball speed, add balls, freeze AI, etc.
- Duration tracking and cleanup for timed effects
- Stacking policy: refresh duration, no duplicate stacking
- Pong opponent-targeting logic (harmful effects hit the other player)
- Pre-match toggle: powerups enabled/disabled
- Audio and visual events for pickup and expiry
- Tests for eligibility, duration, cleanup, and stacking rules

**Owner:** `gameplay-implementer` · **Reviewer:** `quality-reviewer`

---

### 11. `ball-physics` (Planned)

**Goal:** Rework ball bounce mechanics to feel gamey and satisfying. Implement paddle-relative angle influence, degenerate trajectory prevention, tunable speed ramping, and snappy serves. All physics-feel logic lives in pure rule functions with named constants.

**Proves:** Ball behavior feels responsive and player-controllable. No boring horizontal loops. Paddle hit position meaningfully affects ball direction. Speed builds tension over a rally without feeling unfair.

**Dependencies:** `pong-core`, `breakout-core`, `shared-types-and-rules`

**Scope rationale:** Ball feel is the single biggest factor in whether the game feels fun. Isolating it into a dedicated spec lets us tune and test physics rules independently from scene wiring. Pure functions make property-based testing straightforward.

**Key deliverables:**
- Pure function: `computeBounceAngle(hitOffset, paddleHalfHeight, maxAngle)` for paddle-relative angle
- Pure function: `ensureMinimumVerticalSpeed(vx, vy, minVyRatio)` for degenerate trajectory prevention
- Physics config module (`src/game/rules/physics-config.ts`) with all tunable constants grouped by preset
- Speed ramping respects "Ball speed increase" setting (Off / Gentle / Aggressive)
- Base/max speed respects "Ball speed" preset (Slow / Normal / Fast)
- Breakout brick-hit speed bump for punchy feel
- Integration into PongScene and BreakoutScene
- Property-based tests: angle stays within bounds, speed never exceeds max, vertical speed never drops below minimum ratio
- Manual play-test confirms improved feel

**Owner:** `gameplay-implementer` · **Reviewer:** `quality-reviewer`

---

### 12. `extended-settings` (Planned)

**Goal:** Expand the pre-match settings UI with ball speed, paddle size, ball speed increase (Pong), and starting lives, ball speed, paddle size, brick density (Breakout). Extend types, validation, and store.

**Proves:** Players can tune match feel before starting. All new settings flow through to scenes correctly. Defaults let players start without configuring anything.

**Dependencies:** `ball-physics`, `react-app-shell`, `shared-types-and-rules`

**Scope rationale:** Settings UI is a React concern that depends on the physics config being in place. Separating it from ball-physics keeps the physics spec focused on pure rules and the settings spec focused on UI, types, and validation.

**Key deliverables:**
- Extended `MatchSettings` types with new fields (ball speed preset, paddle size, speed increase, starting lives, brick density)
- Updated settings validator with new field validation
- Updated Zustand store with new setting state and actions
- Updated SettingsPanel UI with segmented controls grouped into "Match Rules" and "Feel" sections
- SceneLaunchPayload extended to carry new settings to scenes
- Scenes read new settings and apply corresponding physics config values
- React component tests for new settings controls
- Property-based tests for settings validation with new fields

**Owner:** `gameplay-implementer` · **Reviewer:** `quality-reviewer`

---

## Cross-Cutting Concerns

These are handled incrementally across specs rather than in a single dedicated spec:

| Concern | Addressed In |
|---------|-------------|
| Folder structure | `react-phaser-foundation` |
| Validation commands | `react-phaser-foundation` (available from spec 2 onward) |
| React ↔ Phaser event bridge | `react-phaser-foundation` (contract), `react-app-shell` (full implementation) |
| Type contracts | `shared-types-and-rules` |
| Pure rule testing | `shared-types-and-rules`, each mode spec |
| Property-based testing | `shared-types-and-rules`, mode specs |
| Audio integration | `audio-system`, wired in mode specs |
| Keyboard-only gameplay | Each mode spec |
| Neon visual direction | `neon-visuals` (dedicated pass) |
| Kiro hooks | `react-phaser-foundation` (lint-on-save); additional hooks added per spec as needed |
| Spec-local ADRs | `react-phaser-foundation`, `audio-system`, `react-app-shell` (most likely); any spec with significant choices |
| Settings persistence | Optional; add if straightforward during `react-app-shell` |
| Accessibility (keyboard nav) | `react-app-shell` |
| Ball physics feel | `ball-physics` (dedicated spec) |
| Extended configuration UI | `extended-settings` (dedicated spec) |

---

## Agent Ownership Summary

| Agent | Primary Specs | Role |
|-------|--------------|------|
| `gameplay-implementer` | All specs | Implementation |
| `game-architect` | `react-phaser-foundation`, `audio-system`, `react-app-shell`, `match-lifecycle` | Review for architecture boundaries |
| `quality-reviewer` | `shared-types-and-rules`, `pong-core`, `pong-ai`, `breakout-core`, `neon-visuals`, `powerups` | Review for correctness and test coverage |
| `spec-writer` | All specs | Create/refine specs before implementation |
| `spec-maintainer` | Cross-spec | Update steering/ADRs when durable decisions change |

---

## Notes

- The existing `paddle-ball-game` spec is the original single-file prototype. It serves as a reference but is not part of the rewrite backlog.
- Each spec should produce its own `requirements.md`, `design.md`, and `tasks.md` following the spec template.
- Specs with significant architectural choices should produce spec-local ADRs in their `decisions/` subdirectory per the architecture-decisions steering.
- All four validation commands (`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`) are established in spec 1 and must pass from spec 2 onward.
- No high-score system in v1 per product direction.
- Settings persistence is nice-to-have, not blocking.
- Powerup types are deferred to the `powerups` spec; `shared-types-and-rules` should not pre-define them.
- See `.kiro/steering/phaser-typescript.md` "Phaser Arcade Physics Pitfalls" section for critical implementation patterns learned during `pong-core` and `pong-ai` — these MUST be followed by any scene spec to avoid paddle movement, ball scoring, and keyboard input bugs.
- See `.kiro/steering/architecture.md` "Critical Implementation Rules" for the full list of 9 rules including the Escape key ownership rule, the scene pause method rule (manual velocity save/restore, not Phaser API), and the paddle velocity zeroing rule.
