---
name: gameplay-quality-review
description: Review paddle arcade gameplay changes for bugs, missing tests, game feel, audio issues, accessibility, and spec or steering drift.
---

# Gameplay Quality Review

Use this skill after implementation or before accepting a spec task.

Review priorities:

1. Requirements and steering alignment.
2. Match lifecycle: start, pause, resume, restart, win, loss, return to menu.
3. Gameplay edge cases: stuck ball, repeated collision triggers, missed cleanup, unbounded speed, impossible AI, brick grid overlap.
4. Powerups: eligibility, duration, stacking, cleanup, target ownership, mode-specific behavior.
5. Audio: event coverage, mute/volume respect, spam prevention.
6. UI: keyboard accessibility, readable labels, responsive layout, no control text overflow.
7. Tests: pure-rule unit tests, property tests where useful, React settings tests.

Use `references/review-rubric.md` for severity guidance.

