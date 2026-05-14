---
inclusion: always
---

# Architecture Decisions

When generating or updating `design.md` for any spec, also create or update a `decisions/` subdirectory within the spec folder.

For each significant architectural choice, create a spec-local ADR file using this naming convention:

```text
ADR-NNN-short-title.md
```

Examples of significant choices include:

- technology selection
- data model design
- integration pattern
- state ownership boundary
- event or messaging contract
- security mechanism
- persistence strategy
- testing strategy with meaningful tradeoffs
- build, deployment, or validation approach

Each ADR must include these sections:

- `Status`
- `Context`
- `Options Considered`
- `Decision`
- `Consequences`

The `Consequences` section must cover:

- positive outcomes
- negative tradeoffs
- risks or follow-up mitigations

For options considered but not chosen, record the reasons they were rejected. Do not only document the winning choice.

Use spec-local ADRs for decisions that are made within a spec and matter to that spec's implementation. Use repo-level ADRs in `.kiro/adr/` for durable cross-spec decisions that shape the whole product.

If a spec-local decision becomes a durable project-wide rule, promote or summarize it in `.kiro/adr/` and update steering if future work should follow it.

