# Demo Script: Agentic Spec-Driven Development With Kiro

Use this script to demonstrate how this repo shows professional Kiro delivery.

## Demo Goal

Show how a rough product idea becomes an implementable, reviewed, agent-assisted delivery plan.

The example product is a paddle arcade game evolving from a single HTML file into a React TypeScript Phaser 3 game with Pong, Breakout, sound, powerups, tests, and a professional workflow.

## 1. Show The Baseline

Open:

- `index.html`
- `.kiro/specs/paddle-ball-game/requirements.md`
- `.kiro/specs/paddle-ball-game/design.md`
- `.kiro/specs/paddle-ball-game/tasks.md`

Say:

```text
This is the starting point: a simple working prototype plus a simple Kiro spec.
```

## 2. Show Durable Product Direction

Open:

- `.kiro/steering/product-direction.md`
- `.kiro/steering/architecture.md`
- `.kiro/steering/game-rules.md`
- `.kiro/steering/delivery-standards.md`
- `.kiro/steering/architecture-decisions.md`

Say:

```text
Steering keeps durable decisions out of chat. Every agent and future spec can reuse these decisions.
```

## 3. Show Specialized Agents

Open `.kiro/agents/`.

Highlight:

- `spec-writer`
- `game-architect`
- `gameplay-implementer`
- `quality-reviewer`
- `spec-maintainer`

Say:

```text
Instead of one generic assistant, the repo defines focused agents for planning, architecture, implementation, review, and Kiro artifact maintenance.
```

## 4. Run The Spec Backlog Lab

Open `.kiro/labs/spec-backlog-creation.md`.

Use the prompt from the lab:

```text
Read the repo steering and current baseline spec. Break the paddle arcade product into an implementable Kiro spec backlog. Do not create the individual specs yet. Produce a roadmap with spec names, goals, dependencies, implementation order, and why each spec is sized correctly.
```

Review the generated backlog with participants.

Say:

```text
The agent creates a structured backlog. The human team reviews scope, sequencing, and product judgment before implementation starts.
```

## 5. Create The Roadmap

Ask the agent:

```text
Create .kiro/specs/README.md from the approved backlog. Include status, dependencies, implementation order, and a short description of what each spec proves.
```

Say:

```text
Now the roadmap is a durable repo artifact, not a transient conversation.
```

## 6. Generate One Spec From Templates

Open `.kiro/specs/_template/`.

Ask:

```text
Create the react-phaser-foundation spec using .kiro/specs/_template. Include requirements with EARS acceptance criteria, design, and tasks. Keep it scoped to scaffolding the React TypeScript app, mounting Phaser, creating typed scene/event boundaries, and establishing test scripts.
```

Say:

```text
Templates make spec quality repeatable. The agent fills in the structure, but the team still reviews it.
```

Open the generated `decisions/` directory.

Say:

```text
ADRs make the agent's architectural reasoning inspectable. We can see the chosen path, rejected options, and tradeoffs before implementation starts.
```

## 7. Validate Readiness

Open:

- `.kiro/checklists/spec-readiness.md`
- `.kiro/checklists/task-completion.md`

Ask:

```text
Review the new spec against .kiro/checklists/spec-readiness.md. Identify gaps, ambiguous acceptance criteria, missing dependencies, and oversized tasks.
```

Say:

```text
This is the quality gate before coding. It prevents vague specs from becoming vague implementation work.
```

## 8. Show Hooks

Open `.kiro/hooks/`.

Highlight:

- manual implementation review
- source-save test companion
- spec task quality gate
- steering drift check
- gameplay spec refinement

Say:

```text
Hooks make recurring review behaviors automatic or one-click. They reinforce the workflow without relying on memory.
```

## 9. Show Skills And Power Packaging

Open:

- `.kiro/skills/`
- `.kiro/powers/paddle-arcade/POWER.md`

Say:

```text
Skills package repeatable team procedures. Powers package domain expertise so it can be reused or installed as a bundle.
```

## 10. Close With The Delivery Loop

Summarize:

```text
The delivery loop is: steering -> specialized agent -> spec roadmap -> spec templates -> readiness checklist -> implementation agent -> hooks -> quality reviewer -> task completion checklist.
```

The value is not just faster code generation. The value is structured, inspectable, repeatable delivery.
