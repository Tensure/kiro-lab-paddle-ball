# Spec Readiness Checklist

Use this before implementation starts.

## Product Scope

- [ ] The spec delivers one coherent capability.
- [ ] The affected mode is explicit: `Pong: Solo`, `Pong: Versus`, `Breakout`, or shared.
- [ ] Dependencies on earlier specs are listed.
- [ ] Out-of-scope items are clear.

## Requirements

- [ ] Requirements use user stories.
- [ ] Acceptance criteria use EARS notation.
- [ ] Acceptance criteria are observable and testable.
- [ ] Settings say whether they are pre-match only or can change mid-match.
- [ ] Keyboard controls are documented if input changes.
- [ ] Powerup behavior says whether powerups must be enabled.
- [ ] Audio and visual expectations are testable or clearly marked as polish.

## Design

- [ ] React ownership is clear.
- [ ] Phaser ownership is clear.
- [ ] Shared systems are identified.
- [ ] Pure TypeScript rules are identified.
- [ ] Data models and event contracts are typed.
- [ ] Edge cases are listed.
- [ ] Correctness properties are included where useful.

## Architecture Decisions

- [ ] Significant architectural choices have spec-local ADRs under `decisions/`.
- [ ] ADR filenames follow `ADR-NNN-short-title.md`.
- [ ] Each ADR includes `Status`, `Context`, `Options Considered`, `Decision`, and `Consequences`.
- [ ] Rejected options are recorded with reasons.
- [ ] Consequences include positives, negatives, risks, and mitigations.
- [ ] Cross-spec decisions are promoted or summarized in `.kiro/adr/` when appropriate.

## Tasks

- [ ] Tasks are ordered by dependency.
- [ ] Tasks are small enough for focused implementation.
- [ ] Each task references requirements.
- [ ] Tests or validation are included.
- [ ] No task depends on a later spec.

## Delivery

- [ ] Validation commands are known or the spec adds them.
- [ ] Review expectations are clear.
- [ ] No unresolved product decisions remain.
