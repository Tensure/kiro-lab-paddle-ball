# Implementation Tasks — breakout-hud

## Task 1: Add HUD text objects to BreakoutScene

- [ ] 1.1 Add `scoreText` and `livesText` private fields to BreakoutScene class
- [ ] 1.2 Create both Phaser text objects in `create()` after walls/bricks are built
  - Score: top-left, 20px monospace white, "Score: 0"
  - Lives: top-right, 20px monospace cyan (#00ffcc), "Lives: 3"
- [ ] 1.3 Position text in the wall/header zone above the brick grid

## Task 2: Update HUD on gameplay events

- [ ] 2.1 In `onBrickHit()`, after `breakBrick()` call, update `this.scoreText.setText(`Score: ${this.breakoutState.score}`)`
- [ ] 2.2 In `onBallExitBottom()`, after `loseLife()` call, update `this.livesText.setText(`Lives: ${this.breakoutState.lives}`)`

## Task 3: Verify lifecycle

- [ ] 3.1 Verify scene restart resets HUD to "Score: 0" and "Lives: 3"
- [ ] 3.2 Verify shutdown doesn't leak text objects

## Task 4: Validation

- [ ] 4.1 Run `npm run typecheck` — no errors
- [ ] 4.2 Run `npm run lint` — no errors
- [ ] 4.3 Run `npm test` — all pass
- [ ] 4.4 Manual play-test: verify score increments on brick break, lives decrement on ball loss, both reset on restart
