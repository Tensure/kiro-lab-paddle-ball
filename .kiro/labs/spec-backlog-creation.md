# Lab: Create A Spec Backlog With Agents

This lab demonstrates how Kiro agents turn a product vision into an implementable spec backlog.

The goal is not to start by coding. The goal is to show a professional delivery loop:

1. Capture durable product direction in steering.
2. Use a spec writer agent to decompose the product.
3. Review the decomposition as a team.
4. Generate one spec at a time.
5. Validate readiness before implementation.
6. Hand off to implementation and review agents.

## Starting Point

Use these existing artifacts:

- `.kiro/steering/product-direction.md`
- `.kiro/steering/architecture.md`
- `.kiro/steering/game-rules.md`
- `.kiro/steering/testing.md`
- `.kiro/agents/spec-writer.json`
- `.kiro/specs/_template/`
- `.kiro/checklists/spec-readiness.md`
- `.kiro/steering/architecture-decisions.md`

Do not pre-create the spec roadmap before the lab. The roadmap is the thing participants should watch the agent produce.

## Step 1: Establish The Product Frame

Open the steering files and summarize the target product:

- React TypeScript app.
- Phaser 3 gameplay engine.
- `Pong: Solo`, `Pong: Versus`, and `Breakout`.
- Synthesized sound effects.
- Optional mode-aware powerups.
- Clean neon arcade visual direction.
- Tests for pure rules and React settings behavior.

Point out that these are durable decisions. They are not buried in a chat transcript.

## Step 2: Launch The Spec Writer Agent

Open the `spec-writer` custom agent.

Use a prompt like:

```text
Read the repo steering and current baseline spec. Break the paddle arcade product into an implementable Kiro spec backlog. Do not create the individual specs yet. Produce a roadmap with spec names, goals, dependencies, implementation order, and why each spec is sized correctly.
```

Expected agent behavior:

- Reads steering and existing specs.
- Proposes a dependency-ordered backlog.
- Separates foundation, app shell, Pong, Breakout, audio, powerups, polish, and testing.
- Calls out anything ambiguous rather than inventing hidden requirements.

## Step 3: Review The Proposed Backlog

Use this review checklist live:

- Does each spec deliver one coherent capability?
- Are dependencies explicit?
- Is any spec too large to implement safely?
- Are tests included in the right specs?
- Are Phaser, React, and pure-rule responsibilities separated?
- Is visual/audio polish separated from core gameplay where possible?
- Are powerups delayed until baseline modes exist?

Discuss tradeoffs. This is where agent value is visible: the agent provides a structured first draft, while the team makes product and delivery decisions.

## Step 4: Create The Roadmap File

After review, ask the agent:

```text
Create .kiro/specs/README.md from the approved backlog. Include status, dependencies, implementation order, and a short description of what each spec proves.
```

The roadmap should become the delivery map for the rest of the work.

Recommended statuses:

- `Planned`
- `Ready`
- `In Progress`
- `Implemented`
- `Verified`
- `Deferred`

## Step 5: Generate The First Spec

Choose the first spec, likely `react-phaser-foundation`.

Ask the agent:

```text
Create the react-phaser-foundation spec using .kiro/specs/_template. Include requirements with EARS acceptance criteria, design, and tasks. Keep it scoped to scaffolding the React TypeScript app, mounting Phaser, creating typed scene/event boundaries, and establishing test scripts.
```

Expected output:

- `.kiro/specs/react-phaser-foundation/requirements.md`
- `.kiro/specs/react-phaser-foundation/design.md`
- `.kiro/specs/react-phaser-foundation/tasks.md`
- `.kiro/specs/react-phaser-foundation/decisions/ADR-001-*.md`

## Step 6: Run The Readiness Checklist

Open `.kiro/checklists/spec-readiness.md`.

Ask the `spec-writer` or `spec-maintainer` agent:

```text
Review the react-phaser-foundation spec against the spec readiness checklist. Identify gaps, overlaps, ambiguous requirements, and tasks that are too large.
```

Fix the spec before implementation starts.

## Step 6.5: Inspect Architecture Decisions

Open the generated spec's `decisions/` directory.

Ask:

```text
Review the spec-local ADRs. Confirm each significant design choice records options considered, rejected options, the final decision, positive consequences, negative tradeoffs, and risks.
```

Point out that ADRs make agent decisions auditable. The team can see not just what was chosen, but why other paths were rejected.

## Step 7: Hand Off To Implementation

Use the `gameplay-implementer` or `game-architect` agent depending on the spec.

For the foundation spec, use:

```text
Implement task 1 from .kiro/specs/react-phaser-foundation/tasks.md. Follow steering and update tests or validation scripts as needed.
```

Point out that agents are specialized:

- `spec-writer` decomposes product work.
- `game-architect` shapes technical boundaries.
- `gameplay-implementer` writes code.
- `quality-reviewer` reviews behavior and tests.
- `spec-maintainer` keeps Kiro artifacts coherent.

## Step 8: Review And Close The Loop

Trigger the manual implementation review hook or ask `quality-reviewer`:

```text
Review the completed task against requirements, design, tasks, steering, delivery standards, and implementation readiness checklists.
```

Close the loop by updating task status only after validation.

## Teaching Points

This lab should demonstrate:

- Kiro specs are not just documentation; they are execution plans.
- Steering prevents repeated context loss.
- Agents can specialize by workflow role.
- Hooks automate recurring quality checks.
- Templates and checklists make quality repeatable.
- Human review still matters for product judgment and scope control.
