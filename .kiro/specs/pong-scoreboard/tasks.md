# Implementation Tasks — pong-scoreboard

## Task 1: Add scoreboard text objects to PongScene

- [ ] 1.1 Add `leftScoreText`, `rightScoreText`, and `winScoreLabel` private fields to PongScene class
- [ ] 1.2 Create the three Phaser text objects in `create()` after walls are built
  - Left score: positioned left of center, 32px monospace white, right-aligned
  - Right score: positioned right of center, 32px monospace white, left-aligned
  - Win label: centered, 14px monospace dim color (#8888aa), "First to N"
- [ ] 1.3 Position all text in the top wall zone so it doesn't obscure gameplay

## Task 2: Update scores on point

- [ ] 2.1 In `onBallExit()`, after `this.scores` is updated, call `this.leftScoreText.setText(String(this.scores.left))` and `this.rightScoreText.setText(String(this.scores.right))`

## Task 3: Verify lifecycle

- [ ] 3.1 Verify scene restart resets scores to "0" / "0" (Phaser destroys and recreates text objects on restart)
- [ ] 3.2 Verify shutdown doesn't leak text objects

## Task 4: Validation

- [ ] 4.1 Run `npm run typecheck` — no errors
- [ ] 4.2 Run `npm run lint` — no errors
- [ ] 4.3 Run `npm test` — all pass
- [ ] 4.4 Manual play-test: verify scores display, update on each point, show correct "First to N" label
