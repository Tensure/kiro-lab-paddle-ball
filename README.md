# Paddle Arcade

A React + TypeScript + Phaser 3 arcade game featuring Pong (Solo & Versus) and Breakout modes.

## Getting Started

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Opens at `http://localhost:5173` with hot module replacement.

## Validation Commands

```bash
npm run typecheck   # TypeScript strict mode check (no emit)
npm run lint        # ESLint for src/ (TypeScript + React rules)
npm test            # Vitest in single-run mode
npm run build       # TypeScript compile + Vite production bundle
```

All four commands must pass before any task is considered complete.

## Folder Structure

```
src/
├── app/              # React app shell, root component, providers
├── components/       # React UI components (PhaserContainer, menus, overlays)
├── game/
│   ├── config.ts     # Phaser game configuration
│   ├── scenes/       # Phaser scenes (PongScene, BreakoutScene, etc.)
│   ├── systems/      # Shared runtime systems (EventBridge, audio, input)
│   ├── rules/        # Pure deterministic game logic (scoring, AI, bricks)
│   └── types/        # Shared gameplay types and event contracts
└── main.tsx          # Vite entry point
```

### Directory purposes

- **`src/app/`** — React app shell and state composition. Owns mode selection, settings, and overlay state.
- **`src/components/`** — React UI components. `PhaserContainer` manages the Phaser game lifecycle.
- **`src/game/scenes/`** — Phaser scenes for each game mode. Own physics, rendering, input, and audio triggers.
- **`src/game/systems/`** — Shared runtime systems. `EventBridge` provides typed bidirectional communication between React and Phaser.
- **`src/game/rules/`** — Pure TypeScript modules for deterministic game logic. Testable without Phaser.
- **`src/game/types/`** — Shared type definitions for events, settings, modes, and contracts.

## React ↔ Phaser Integration

React and Phaser communicate through a typed **EventBridge** — a lightweight custom EventEmitter with compile-time type safety.

- **React → Phaser:** React emits typed events (e.g., pause, settings changes) that Phaser scenes listen for.
- **Phaser → React:** Scenes emit typed events (e.g., score updates, win/loss) that React components subscribe to for overlay state.
- **Lifecycle:** React's `PhaserContainer` component creates the Phaser game on mount and destroys it on unmount. Phaser owns the frame loop; React owns app flow.

Event types are defined in `src/game/types/events.ts`. Adding a new event requires only a type addition — no runtime changes to the bridge.

## Tech Stack

- **React 19** — UI framework
- **TypeScript** — Strict mode, all source files
- **Phaser 3** — Game engine (Arcade Physics)
- **Vite** — Build tool and dev server
- **Vitest** — Test runner with fast-check for property-based tests
- **ESLint** — Linting with typescript-eslint and react-hooks plugins
