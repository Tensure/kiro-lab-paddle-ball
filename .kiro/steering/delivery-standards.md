---
inclusion: always
---

# Delivery Standards

Use these standards for all implementation specs and agent-driven work.

## Definition Of Ready

A spec is ready for implementation when:

- requirements, design, and tasks exist
- dependencies are explicit
- acceptance criteria are observable
- React, Phaser, shared-system, and pure-rule ownership are clear
- tasks are ordered by dependency
- testing expectations are documented
- no required product decisions are hidden in assumptions

## Definition Of Done

A task or spec is done when:

- implementation satisfies linked requirements
- design boundaries are preserved
- focused tests are added or updated
- available validation commands pass
- keyboard behavior works for affected flows
- mute/volume behavior is respected when audio is affected
- powerup cleanup is verified when powerups are affected
- pause, restart, win/loss, and return-to-menu flows are checked when match lifecycle is affected
- no unrelated refactors are mixed into the change
- no unresolved TODOs remain unless documented in the spec roadmap

## Review Expectations

Review should prioritize:

1. Behavioral correctness.
2. Spec and steering alignment.
3. Architecture boundaries.
4. Test coverage for changed behavior.
5. Game feel and usability.
6. Maintainability.

Reviews should lead with findings, include file references, and avoid vague feedback.

## Validation Commands

Once the React TypeScript project is scaffolded, prefer these commands:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

If a command is unavailable, either add it as part of the foundation spec or state why it cannot be run.

## Agent Handoff Rules

- The `spec-writer` agent should create or refine specs before implementation.
- The `game-architect` agent should review boundaries for large technical changes.
- The `gameplay-implementer` agent should implement focused tasks.
- The `quality-reviewer` agent should review completed changes before closing tasks.
- The `spec-maintainer` agent should update Kiro artifacts when durable decisions change.

