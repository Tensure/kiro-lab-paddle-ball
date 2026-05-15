# Design Document

## Overview

The neon-visuals spec adds a cohesive neon arcade aesthetic to PongScene and BreakoutScene using three programmatic systems: a glow renderer (layered Graphics strokes), a particle system (pre-generated texture + emitter pools), and camera effects (shake/flash). All rendering is done with standard Phaser 3 APIs — no shaders, no external assets.

## Architecture

### System Placement

```
src/game/systems/
  NeonGlow.ts          — Glow rendering utility (creates glow graphics per object)
  NeonParticles.ts     — Particle emitter pool and burst triggers
  
src/game/scenes/
  PongScene.ts         — Modified to integrate glow + particles + camera effects
  BreakoutScene.ts     — Modified to integrate glow + particles + camera effects
```

The glow and particle systems are utility modules in `src/game/systems/`. They are instantiated and owned by each scene — not singletons. Each scene creates its own glow renderer and particle pool in `create()` and destroys them in `shutdown`.

### NeonGlow System

**Approach:** For each game object that needs a glow, create a `Phaser.GameObjects.Graphics` object positioned behind the game object. Each frame, clear and redraw the glow shape (rectangle for paddles/bricks, circle for ball) using 3–4 layered strokes with increasing line width and decreasing alpha. This simulates light falloff without shaders.

**Glow Configuration:**
```typescript
interface GlowConfig {
  color: number;        // Base neon color (e.g., 0x00ffff)
  layers: number;       // Number of glow layers (3–4)
  baseAlpha: number;    // Alpha of innermost layer (0.8–1.0)
  alphaDecay: number;   // Alpha multiplier per layer (0.4–0.5)
  baseWidth: number;    // Stroke width of innermost layer (2–3px)
  widthGrowth: number;  // Additional width per layer (3–4px)
  intensity: number;    // Overall intensity multiplier (0.0–1.0)
}
```

**Color Palette:**
- Paddles: Cyan (`0x00ffff`)
- Ball: White-hot (`0xffffff`) with slight cyan tint
- Bricks: Match existing row colors with increased saturation
- Walls: Dim purple (`0x6600cc`) at low intensity

**Performance Strategy:**
- Use a single `Graphics` object per glow group (all bricks share one Graphics, each paddle/ball gets its own)
- Brick glows are drawn once and only redrawn when a brick is destroyed (static objects)
- Paddle/ball glows redraw every frame (moving objects) — this is 2–3 Graphics.clear()+redraw calls per frame, well within budget
- Depth sorting: glow Graphics are placed at depth -1 (behind game objects)

### NeonParticles System

**Approach:** Generate a small circular particle texture programmatically in `create()` using a `Phaser.GameObjects.RenderTexture` or `Graphics.generateTexture()`. Use Phaser's built-in particle emitter with `explode()` for burst effects.

**Texture Generation:**
```typescript
// Create a 16x16 radial gradient circle texture
const gfx = scene.add.graphics();
gfx.fillStyle(0xffffff, 1);
gfx.fillCircle(8, 8, 6);
gfx.fillStyle(0xffffff, 0.5);
gfx.fillCircle(8, 8, 8);
gfx.generateTexture('neon-particle', 16, 16);
gfx.destroy();
```

**Emitter Pool:**
- Pre-create 3 particle emitters (score, brick-break, win) with different configs
- Each emitter uses `explode()` for one-shot bursts — no continuous emission
- Emitters are reused across multiple triggers (Phaser handles particle lifecycle)

**Burst Configurations:**

| Event | Particles | Lifespan | Speed | Tint | Scale |
|-------|-----------|----------|-------|------|-------|
| Score point | 20 | 600–800ms | 100–250 | Cyan/Magenta | 0.5→0 |
| Brick break | 10 | 300–500ms | 80–200 | Brick color | 0.4→0 |
| Match win | 50 | 1000–1500ms | 150–350 | Multi-color | 0.6→0 |

**Max Particles Cap:** 200 total across all emitters. Phaser's `maxParticles` config enforces this per-emitter, distributed as: score=40, brick=60, win=100.

### Camera Effects

**Approach:** Use Phaser's built-in `camera.shake()` and `camera.flash()` methods. These are zero-cost when not active and require no custom rendering.

**Shake Config:**
- Duration: 100ms
- Intensity: 0.005 (≈3–4px displacement at 800px width)
- Triggered on: `onBallExit` (Pong), `onBallExitBottom` (Breakout)

**Flash Config:**
- Duration: 250ms
- Color: White (0xffffff)
- Alpha: starts at 0.6, fades to 0
- Triggered on: `triggerWin()` in both scenes

### Integration Points

Effects are triggered inline within existing scene methods — no EventBridge subscription needed for visual effects (they happen in the same scene that detects the event):

| Scene Method | Effects Triggered |
|---|---|
| `PongScene.onBallExit()` | Camera shake + score particles |
| `PongScene.triggerWin()` | Camera flash + win particles |
| `BreakoutScene.onBrickHit()` | Brick-break particles |
| `BreakoutScene.onBallExitBottom()` | Camera shake |
| `BreakoutScene.triggerWin()` | Camera flash + win particles |

### Scene Modifications

Both scenes receive these changes in `create()`:
1. Generate particle texture (shared key `'neon-particle'`)
2. Create `NeonGlow` instance for game objects
3. Create `NeonParticles` instance with emitter configs
4. Set background to `#0a0a0f` (slightly blue-tinted near-black)

Both scenes receive these changes in `update()`:
1. Call `neonGlow.update()` to redraw moving object glows

Both scenes receive these changes in `shutdown()`:
1. Destroy glow graphics
2. Destroy particle emitters

## Data Flow

```
Game Event (score/brick/win/life-loss)
  → Scene method detects event (existing logic)
  → Scene calls particle.burst() and/or camera.shake()/flash()
  → Phaser renders effects in same frame
  → Particles auto-expire via lifespan config
```

No new EventBridge events are needed. Visual effects are scene-local and triggered synchronously from existing game logic.

## File Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `src/game/systems/NeonGlow.ts` | New | Glow rendering utility class |
| `src/game/systems/NeonParticles.ts` | New | Particle emitter pool and burst API |
| `src/game/scenes/PongScene.ts` | Modified | Integrate glow, particles, camera effects |
| `src/game/scenes/BreakoutScene.ts` | Modified | Integrate glow, particles, camera effects |

## Testing Strategy

Visual effects are inherently difficult to unit test (they produce pixels, not data). The testing approach:

1. **Type safety:** TypeScript compilation ensures correct API usage and config shapes.
2. **Integration verification:** Scenes create and destroy effect systems without errors (covered by existing scene lifecycle tests).
3. **Performance assertion:** A manual play-test confirms 60fps with effects active (part of Definition of Done for scene specs).
4. **Particle cap:** Unit test that `NeonParticles` respects the 200-particle maximum configuration.
5. **Glow config validation:** Unit test that glow configs produce valid layer counts and alpha values.

No property-based tests are appropriate here — visual effects don't have meaningful input-output relationships that vary with random data. The correctness properties are structural (configs are valid) and behavioral (effects trigger at the right time), both verified through type checking and integration.

## Constraints

- No external image assets
- No shader-based effects (WebGL shaders are out of scope for v1)
- No powerup visual effects (deferred to powerups spec)
- No React UI changes (already neon-styled from react-app-shell)
- Effects must not interfere with physics or game logic
- Effects must not persist across scene restarts (clean shutdown required)

## Dependencies

- `pong-core` — PongScene must exist with scoring and win logic
- `breakout-core` — BreakoutScene must exist with brick destruction and life loss
- `react-app-shell` — Dark background and neon UI already established
