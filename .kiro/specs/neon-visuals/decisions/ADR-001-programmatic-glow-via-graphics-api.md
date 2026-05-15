# ADR-001: Programmatic Glow via Graphics API

## Status

Accepted

## Context

The neon-visuals spec requires glow effects on game objects (paddles, ball, bricks). Several approaches exist for rendering glow in Phaser 3:

1. WebGL shader-based post-processing (bloom filter)
2. Pre-rendered glow textures (sprite-based)
3. Programmatic layered strokes via Phaser Graphics API
4. Phaser FX pipeline (Phaser 3.60+ Glow effect)

The project constraints require: no external assets, no shaders (out of scope for v1), and 60fps performance.

## Options Considered

### Option A: WebGL Bloom Shader
- Pros: Authentic glow, applies uniformly, single pass
- Cons: Requires custom shader code, WebGL-only (breaks Canvas fallback), complex to maintain, explicitly out of scope per spec

### Option B: Pre-rendered Glow Textures
- Pros: Fast rendering (just sprite draws), easy to configure
- Cons: Requires external image assets or complex RenderTexture generation, doesn't adapt to dynamic object sizes

### Option C: Phaser Graphics API Layered Strokes
- Pros: No external assets, works on both Canvas and WebGL, simple to implement, adapts to any object size, easy to tune colors/intensity
- Cons: Redraws every frame for moving objects (minor CPU cost), less physically accurate than bloom

### Option D: Phaser FX Pipeline (Glow)
- Pros: Built-in, easy API (`gameObject.preFX.addGlow()`)
- Cons: WebGL-only, requires Phaser 3.60+, per-object FX has performance cost with many objects (50 bricks), less control over appearance

## Decision

Use **Option C: Phaser Graphics API Layered Strokes**.

This approach satisfies all constraints (programmatic, no assets, no shaders) while being simple to implement and performant. For static objects (bricks), the glow is drawn once. For moving objects (paddles, ball), 2–3 Graphics redraws per frame is well within the 16.67ms frame budget.

## Consequences

### Positive
- Zero external dependencies or assets
- Works on both Canvas and WebGL renderers
- Full control over glow appearance (color, intensity, layer count)
- Easy to tune per-object (bricks get lower intensity than paddles)
- Simple to remove individual glows (brick destruction)

### Negative
- Glow appearance is approximate (layered strokes vs. true Gaussian blur)
- Moving object glows require per-frame redraw (minor CPU cost, ~0.1ms per object)
- More code than using built-in FX pipeline

### Risks and Mitigations
- Risk: Glow redraw becomes expensive with many objects → Mitigation: Brick glows use a single shared Graphics object, redrawn only on brick destruction
- Risk: Visual quality doesn't meet expectations → Mitigation: Tunable config allows adjusting layer count, alpha decay, and width growth until it looks right
