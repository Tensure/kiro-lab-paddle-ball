# Lab Prompt Cards

These prompts are short, copy-ready cards for the live demo.

## 1. Generate The Spec Backlog

```text
Read the repo steering and current baseline spec. Break the paddle arcade product into an implementable Kiro spec backlog. Do not create the individual specs yet. Produce a roadmap with spec names, goals, dependencies, implementation order, and why each spec is sized correctly.
```

## 2. Create The Roadmap File

```text
Create .kiro/specs/README.md from the approved backlog. Include status, dependencies, implementation order, and a short description of what each spec proves.
```

## 3. Generate The Foundation Spec

```text
Create the react-phaser-foundation spec using .kiro/specs/_template. Include requirements with EARS acceptance criteria, design, tasks, and spec-local ADRs under decisions/. Keep it scoped to scaffolding the React TypeScript app, mounting Phaser, creating typed scene/event boundaries, and establishing validation scripts.
```

## 4. Review Spec Readiness

```text
Review .kiro/specs/react-phaser-foundation against .kiro/checklists/spec-readiness.md and .kiro/steering/architecture-decisions.md. Identify gaps, ambiguous acceptance criteria, missing ADRs, missing dependencies, and oversized tasks.
```

## 5. Tighten ADRs

```text
Review the spec-local ADRs for react-phaser-foundation. Confirm each significant design choice records options considered, rejected options, the final decision, positive consequences, negative tradeoffs, risks, and mitigations.
```

## 6. Hand Off To Implementation

```text
Implement task 1 from .kiro/specs/react-phaser-foundation/tasks.md. Follow steering, ADRs, and delivery standards. Update tests or validation scripts as needed.
```

## 7. Run Quality Review

```text
Review the completed task against requirements, design, tasks, steering, ADRs, delivery standards, and implementation readiness checklists. Lead with findings and include concrete file references.
```

## 8. Maintain Kiro Artifacts

```text
Check whether the completed work created durable decisions or workflow changes. If so, update steering, repo-level ADRs, hooks, agents, skills, or powers as appropriate.
```
