# Task Completion Checklist

Use this before marking a Kiro implementation task complete.

## Implementation

- [ ] Linked requirements are satisfied.
- [ ] The implementation follows steering and ADRs.
- [ ] React state does not drive Phaser's frame loop.
- [ ] Phaser object mutation stays inside scenes or systems.
- [ ] Pure rules stay outside scenes where practical.
- [ ] Typed contracts are updated when boundaries change.

## Gameplay

- [ ] Controls work with the expected keyboard mappings.
- [ ] Pause, resume, restart, win/loss, and return-to-menu behavior still works when affected.
- [ ] Ball, paddle, brick, and powerup behavior does not create stuck or impossible states.
- [ ] Audio cues fire at the right times and respect mute/volume when affected.
- [ ] Visual effects remain readable and restrained.

## Tests And Validation

- [ ] Unit tests cover changed pure rules.
- [ ] React tests cover changed settings or menu behavior.
- [ ] Property-based tests cover important invariants where useful.
- [ ] Available validation commands pass.
- [ ] Any skipped validation is documented with a reason.

## Kiro Artifacts

- [ ] Task status is updated only after validation.
- [ ] Specs are updated if behavior changed.
- [ ] Steering is updated if durable project policy changed.
- [ ] Spec-local ADRs are added or updated for significant architecture decisions.
- [ ] Repo-level ADRs are added or updated for durable cross-spec decisions.
- [ ] Hooks, agents, skills, or powers are updated if workflow behavior changed.
