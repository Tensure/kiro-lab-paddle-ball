# Design Document — pong-scoreboard

## Overview

Add a scoreboard HUD to PongScene using Phaser text objects. The scoreboard shows left score, right score, and a "First to N" label. It's rendered directly on the canvas, updated on each point, and cleaned up on shutdown/restart.

## Implementation

### Text Objects

Create three `Phaser.GameObjects.Text` instances in `PongScene.create()`:

```typescript
// In PongScene.create(), after walls are created:
this.leftScoreText = this.add.text(
  PONG.GAME_WIDTH / 2 - 60,
  PONG.WALL_THICKNESS + 8,
  '0',
  { fontSize: '32px', fontFamily: 'monospace', color: '#ffffff' }
).setOrigin(1, 0);

this.rightScoreText = this.add.text(
  PONG.GAME_WIDTH / 2 + 60,
  PONG.WALL_THICKNESS + 8,
  '0',
  { fontSize: '32px', fontFamily: 'monospace', color: '#ffffff' }
).setOrigin(0, 0);

this.winScoreLabel = this.add.text(
  PONG.GAME_WIDTH / 2,
  PONG.WALL_THICKNESS + 44,
  `First to ${this.winScore}`,
  { fontSize: '14px', fontFamily: 'monospace', color: '#8888aa' }
).setOrigin(0.5, 0);
```

### Score Update

In `onBallExit()`, after updating `this.scores`, update the text:

```typescript
this.leftScoreText.setText(String(this.scores.left));
this.rightScoreText.setText(String(this.scores.right));
```

### Cleanup

Text objects are automatically destroyed when the scene restarts or shuts down (Phaser destroys all game objects on scene restart). No explicit cleanup needed beyond what `scene.restart()` already does.

### Depth

Set text depth to a high value (e.g., 10) so it renders above glow effects but this is optional since text is positioned in the wall zone where no gameplay objects exist.

## Dependencies

- `pong-core` (PongScene must exist)
- No new modules or npm dependencies

## Testing

- Manual verification: scores display correctly, update on each point, reset on restart
- No unit tests needed (visual text rendering)
