# Requirements Document

## Introduction

This spec establishes the Vite + React + TypeScript + Phaser 3 project foundation for the Paddle Arcade rewrite. It delivers a working toolchain, the canonical folder structure, the React ↔ Phaser integration pattern, and a typed event bridge contract. No gameplay logic is included — this spec proves the scaffold works end-to-end and that all validation commands pass on an empty app.

## Glossary

- **Build_System**: The Vite-based build toolchain that bundles the application for development and production.
- **Type_Checker**: The TypeScript compiler running in strict mode to validate type correctness without emitting output.
- **Linter**: The ESLint-based static analysis tool configured for TypeScript and React.
- **Test_Runner**: The Vitest-based test execution environment with fast-check available for property-based tests.
- **Dev_Server**: The Vite development server providing hot module replacement during local development.
- **Phaser_Container**: The React component responsible for mounting and unmounting the Phaser 3 game instance.
- **Event_Bridge**: The typed communication layer that carries events between Phaser scenes and React components.
- **Placeholder_Scene**: A minimal Phaser scene used to verify that Phaser mounts and runs inside the React component.
- **Placeholder_Event**: A typed event used to verify the Event_Bridge carries payloads from Phaser to React correctly.
- **Project_Scaffold**: The complete set of configuration files, folder structure, and scripts that constitute the empty project.

## Requirements

### Requirement 1: Project Initialization with Vite and React

**User Story:** As a developer, I want a Vite project with React 19 and TypeScript strict mode, so that I have a modern, fast build toolchain for the arcade game rewrite.

#### Acceptance Criteria

1. THE Build_System SHALL use Vite as the bundler with React and TypeScript plugins configured.
2. THE Type_Checker SHALL enforce TypeScript strict mode with no implicit any, strict null checks, and strict function types enabled.
3. THE Build_System SHALL produce a production bundle when `npm run build` is executed.
4. THE Dev_Server SHALL serve the application with hot module replacement when `npm run dev` is executed.
5. THE Project_Scaffold SHALL include a `package.json` with React 19 (latest stable) as a dependency.
6. THE Project_Scaffold SHALL include a `package.json` with Phaser 3 (latest v3.x stable, currently 3.90+) as a dependency.
7. THE Project_Scaffold SHALL commit a `package-lock.json` with pinned dependency versions.
8. THE Project_Scaffold SHALL use exact versions (not open ranges) for `react`, `react-dom`, and `phaser` in `package.json`.

### Requirement 2: Canonical Folder Structure

**User Story:** As a developer, I want a consistent folder structure established from the start, so that all future specs place code in predictable locations.

#### Acceptance Criteria

1. THE Project_Scaffold SHALL contain the directory `src/app/` for React app shell and state composition.
2. THE Project_Scaffold SHALL contain the directory `src/components/` for React UI components.
3. THE Project_Scaffold SHALL contain the directory `src/game/` for Phaser setup and scene registration.
4. THE Project_Scaffold SHALL contain the directory `src/game/scenes/` for mode-specific Phaser scenes.
5. THE Project_Scaffold SHALL contain the directory `src/game/systems/` for shared runtime systems.
6. THE Project_Scaffold SHALL contain the directory `src/game/rules/` for pure deterministic game logic.
7. THE Project_Scaffold SHALL contain the directory `src/game/types/` for shared gameplay types.

### Requirement 3: Phaser Mounting Inside React

**User Story:** As a developer, I want Phaser 3 to mount inside a React component, so that React owns the application lifecycle while Phaser owns the real-time game loop.

#### Acceptance Criteria

1. THE Phaser_Container SHALL create a Phaser game instance and attach it to a DOM element managed by React.
2. THE Phaser_Container SHALL destroy the Phaser game instance when the React component unmounts.
3. THE Phaser_Container SHALL not create multiple Phaser game instances on React re-renders or React 19 strict mode double-effect invocations in development.
4. WHEN the Phaser_Container mounts, THE Placeholder_Scene SHALL start and render without errors.
5. THE Phaser_Container SHALL use Phaser Arcade Physics as the default physics engine.

### Requirement 4: Typed Event Bridge Contract

**User Story:** As a developer, I want a typed event bridge between Phaser and React, so that scene events flow to the UI layer with compile-time safety and no ad hoc string coupling.

#### Acceptance Criteria

1. THE Event_Bridge SHALL define event names and payload types in a single TypeScript module.
2. THE Event_Bridge SHALL support emitting events from Phaser scenes to React listeners.
3. THE Event_Bridge SHALL support emitting events from React to Phaser scenes.
4. THE Event_Bridge SHALL enforce type safety on event payloads at compile time.
5. WHEN the Placeholder_Scene emits a Placeholder_Event, THE Event_Bridge SHALL deliver the typed payload to a registered React listener.
6. WHEN a React component emits a Placeholder_Event toward Phaser, THE Event_Bridge SHALL deliver the typed payload to a registered Phaser listener.
7. FOR ALL valid event payloads, emitting then receiving through the Event_Bridge SHALL preserve the payload value without mutation (round-trip property).
8. THE Event_Bridge SHALL not accumulate listeners without bound; components that subscribe SHALL unsubscribe on cleanup to prevent memory leaks.

### Requirement 5: Validation Commands

**User Story:** As a developer, I want all four validation commands to pass on the empty project, so that future specs can rely on a green baseline.

#### Acceptance Criteria

1. WHEN `npm run build` is executed, THE Build_System SHALL complete without errors and produce output in a `dist/` directory.
2. WHEN `npm run typecheck` is executed, THE Type_Checker SHALL complete without type errors.
3. WHEN `npm run lint` is executed, THE Linter SHALL complete without lint errors or warnings.
4. WHEN `npm test` is executed, THE Test_Runner SHALL execute all test files and report zero failures.
5. WHEN `npm run dev` is executed, THE Dev_Server SHALL start and serve the application on a local port.

### Requirement 6: Test Infrastructure

**User Story:** As a developer, I want Vitest configured with fast-check available, so that future specs can write both example-based and property-based tests from day one.

#### Acceptance Criteria

1. THE Test_Runner SHALL use Vitest as the test framework.
2. THE Test_Runner SHALL resolve and execute `.test.ts` and `.test.tsx` files from the `src/` directory tree.
3. THE Project_Scaffold SHALL include `fast-check` as a dev dependency available for property-based tests.
4. WHEN a property-based test using fast-check is included in the test suite, THE Test_Runner SHALL execute it alongside standard unit tests.
5. THE Test_Runner SHALL support testing React components using a jsdom or happy-dom environment.
6. THE Project_Scaffold SHALL include at least one integration test verifying the Event_Bridge round-trip property using fast-check.

### Requirement 7: ESLint Configuration

**User Story:** As a developer, I want ESLint configured for TypeScript and React, so that code quality is enforced consistently across the project.

#### Acceptance Criteria

1. THE Linter SHALL use ESLint with TypeScript-aware rules enabled.
2. THE Linter SHALL include React-specific lint rules for hooks and JSX patterns.
3. THE Linter SHALL report errors for unused variables, missing return types on exported functions, and other TypeScript best practices.
4. THE Linter SHALL not produce false positives on the empty project scaffold.

### Requirement 8: Developer Documentation

**User Story:** As a developer, I want a README with setup and development instructions, so that contributors can get started without tribal knowledge.

#### Acceptance Criteria

1. THE Project_Scaffold SHALL include a `README.md` at the repository root.
2. THE README.md SHALL document how to install dependencies.
3. THE README.md SHALL document how to start the development server.
4. THE README.md SHALL document how to run each validation command (`build`, `typecheck`, `lint`, `test`).
5. THE README.md SHALL describe the folder structure and the purpose of each top-level source directory.
6. THE README.md SHALL describe the React ↔ Phaser integration pattern at a high level.
