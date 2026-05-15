# Design Document — breakout-hud

## Overview

Add a score and lives HUD to BreakoutScene using Phaser text objects. The HUD shows current score (top-left) and remaining lives (top-right). Updated on brick break and life loss. Cleaned up automatically on scene restart/shutdown.

## Implementation

### Text Objects

Create two `Phaser.GameObjects.Text` instances in `BreakoutScene.create()`:

```typescript
// After walls and bricks are created:
this.scoreText = this.add.text(
  BREAKOUT.WALL_THICKNESS + 12,
  BREAKOUT.WALL_THICKNESS + 8,
  'Score: 0',
  { fontSize: '20px', fontFamily: 'monospace', color: '#ffffff' }
).setOrigin(0, 0);

this.livesText = this.add.text(
  BREAKOUT.GAME_WIDTH - BREAKOUT.WALL_THICKNESS - 12,
  BREAKOUT.WALL_THICKNESS + 8,
  'Lives: 3',
  { fontSize: '20px', fontFamily: 'monospace', color: '#00ffcc' }
).setOrigin(1, 0);
```

### Score Update

In `onBrickHit()`, after calling `breakBrick()`:

```typescript
this.scoreText.setText(`Score: ${this.breakoutState.score}`);
```

### Lives Update

In `onBallExitBottom()`, after calling `loseLife()`:

```typescript
this.livesText.setText(`Lives: ${this.breakoutState.lives}`);
```

### Depth

Text is positioned in the wall zone (above brick grid) so it never overlaps gameplay objects.

## Dependencies

- `breakout-core` (BreakoutScene must exist)
- No new modules or npm dependencies

## Testing

- Manual verification: score updates on brick break, lives update on life loss, both reset on restart
- No unit tests needed (visual text rendering)
