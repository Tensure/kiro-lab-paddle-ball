# Facilitator Checklist

Use this before running the Kiro spec-driven development lab.

## Before The Lab

- [ ] Confirm the repo opens in Kiro.
- [ ] Confirm `.kiro/README.md` is visible and explains the workspace.
- [ ] Confirm the `spec-writer` custom agent is available.
- [ ] Confirm the existing baseline spec exists under `.kiro/specs/paddle-ball-game/`.
- [ ] Confirm `.kiro/specs/README.md` does not already exist if the roadmap should be generated live.
- [ ] Confirm templates exist under `.kiro/specs/_template/`.
- [ ] Confirm readiness checklists exist under `.kiro/checklists/`.
- [ ] Confirm hooks are visible under `.kiro/hooks/`.
- [ ] Confirm the current codebase is still intentionally simple: `index.html`.

## Demo Safety

- [ ] Tell participants the first lab creates planning artifacts, not production code.
- [ ] Keep generated specs scoped; do not let the first spec absorb the whole product.
- [ ] Pause after the agent proposes a roadmap and review it with humans.
- [ ] Treat agent output as a draft until it passes the readiness checklist.
- [ ] Preserve the moment where participants can see rejected options in ADRs.

## Expected Live Artifacts

The lab should create these during the walkthrough:

- `.kiro/specs/README.md`
- `.kiro/specs/react-phaser-foundation/requirements.md`
- `.kiro/specs/react-phaser-foundation/design.md`
- `.kiro/specs/react-phaser-foundation/tasks.md`
- `.kiro/specs/react-phaser-foundation/decisions/ADR-001-*.md`

## Recovery Prompts

If the agent makes the roadmap too broad:

```text
Revise the backlog so each spec delivers one coherent capability and can be implemented independently. Push polish, powerups, and hardening later unless they are dependencies.
```

If the agent skips ADRs:

```text
Update this spec to follow .kiro/steering/architecture-decisions.md. Add spec-local ADRs under decisions/ for significant architectural choices and record options considered.
```

If the agent starts coding too early:

```text
Stop implementation. We are still in spec planning. Produce or refine requirements, design, tasks, and ADRs only.
```

If the agent creates vague acceptance criteria:

```text
Rewrite the acceptance criteria so each one is observable and testable. Avoid subjective wording unless there is a measurable behavior.
```
