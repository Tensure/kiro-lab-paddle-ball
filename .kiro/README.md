# Kiro Workspace Guide

This `.kiro` directory is intentionally fleshed out as an example agentic developer workflow for the paddle ball game rewrite.

## What Each Folder Demonstrates

- `specs/`: feature-level requirements, design, and implementation tasks.
- `steering/`: persistent project knowledge and conventions.
- `agents/`: project-specific custom agents for focused workflows.
- `hooks/`: IDE automations that react to saves, spec tasks, and manual triggers.
- `skills/`: reusable workspace skills that activate from natural language or slash commands.
- `powers/`: an example local Kiro power bundle that could be installed from the Powers panel.
- `specs/_template/`: reusable spec document templates.
- `checklists/`: readiness and completion quality gates.
- `adr/`: repo-level architecture decision records for durable cross-spec decisions.
- `labs/`: facilitator walkthroughs for live demos.

## Suggested Demo Flow

1. Start with `.kiro/specs/paddle-ball-game/` to show the current baseline spec.
2. Open `.kiro/steering/` to show how the rewrite direction is kept persistent.
3. Use a custom agent from `.kiro/agents/` for a focused task such as spec writing, architecture, implementation, or QA.
4. Trigger a manual hook from `.kiro/hooks/` to demonstrate event-driven agent workflows.
5. Invoke a workspace skill from `.kiro/skills/` to show reusable team procedures.
6. Install `.kiro/powers/paddle-arcade/` from local path to demonstrate packaging domain expertise.
7. Use `.kiro/labs/spec-backlog-creation.md` and `.kiro/demo-script.md` for the end-to-end lab flow.

## Lab Support Files

- `.kiro/labs/spec-backlog-creation.md`: full walkthrough for creating the spec backlog live.
- `.kiro/labs/facilitator-checklist.md`: preflight and recovery checklist.
- `.kiro/labs/prompt-cards.md`: short copy-ready prompts for the live demo.
- `.kiro/demo-script.md`: presenter script for the complete story.

## Important Notes

- The current codebase is still a single `index.html`; the steering points toward a future Vite React TypeScript Phaser 3 rewrite.
- Hooks that reference `src/**` are examples for the future scaffolded app.
- Custom agents explicitly load steering and workspace skills because custom agents do not automatically inherit skills.
- The local power is an example package. It is not automatically active unless installed from the Kiro Powers panel.

## Custom Agent Examples

- `spec-writer`: decomposes the product vision into implementable Kiro specs.
- `game-architect`: plans React, Phaser, TypeScript, scene, and system architecture.
- `gameplay-implementer`: implements focused gameplay slices.
- `quality-reviewer`: reviews behavior, tests, game feel, and spec alignment.
- `spec-maintainer`: keeps Kiro artifacts consistent as decisions change.
