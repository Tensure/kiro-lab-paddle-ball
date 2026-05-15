import Phaser from 'phaser';

/**
 * Configuration for a glow effect.
 */
export interface GlowConfig {
  color: number;
  layers: number;
  baseAlpha: number;
  alphaDecay: number;
  baseWidth: number;
  widthGrowth: number;
  intensity: number;
}

/** Neon color palette constants */
export const NEON_COLORS = {
  PADDLE_CYAN: 0x00ffff,
  BALL_WHITE: 0xffffff,
  WALL_PURPLE: 0x6600cc,
} as const;

/** Default glow configs for different object types */
export const GLOW_PRESETS = {
  paddle: {
    color: NEON_COLORS.PADDLE_CYAN,
    layers: 2,
    baseAlpha: 0.4,
    alphaDecay: 0.4,
    baseWidth: 1,
    widthGrowth: 2,
    intensity: 0.6,
  } satisfies GlowConfig,
  ball: {
    color: NEON_COLORS.BALL_WHITE,
    layers: 2,
    baseAlpha: 0.5,
    alphaDecay: 0.4,
    baseWidth: 1,
    widthGrowth: 2,
    intensity: 0.7,
  } satisfies GlowConfig,
  brick: {
    color: 0xffffff, // overridden per brick
    layers: 2,
    baseAlpha: 0.3,
    alphaDecay: 0.4,
    baseWidth: 1,
    widthGrowth: 1,
    intensity: 0.4,
  } satisfies GlowConfig,
};

interface GlowEntry {
  graphics: Phaser.GameObjects.Graphics;
  shape: 'rect' | 'circle';
  width: number;
  height: number;
  radius: number;
  config: GlowConfig;
}

/**
 * NeonGlow renders layered glow strokes around game objects using Phaser Graphics API.
 * Each glow is drawn as 3-4 concentric strokes with decreasing alpha to simulate light falloff.
 */
export class NeonGlow {
  private scene: Phaser.Scene;
  private glows: Map<string, GlowEntry> = new Map();
  private nextId = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Add a rectangular glow (for paddles and bricks).
   * Returns a unique ID for position updates and removal.
   */
  addRectGlow(x: number, y: number, width: number, height: number, config: GlowConfig): string {
    const id = `glow_${this.nextId++}`;
    const graphics = this.scene.add.graphics();
    graphics.setDepth(-1);

    const entry: GlowEntry = {
      graphics,
      shape: 'rect',
      width,
      height,
      radius: 0,
      config,
    };

    this.glows.set(id, entry);
    this.drawRectGlow(graphics, x, y, width, height, config);
    return id;
  }

  /**
   * Add a circular glow (for the ball).
   * Returns a unique ID for position updates and removal.
   */
  addCircleGlow(x: number, y: number, radius: number, config: GlowConfig): string {
    const id = `glow_${this.nextId++}`;
    const graphics = this.scene.add.graphics();
    graphics.setDepth(-1);

    const entry: GlowEntry = {
      graphics,
      shape: 'circle',
      width: 0,
      height: 0,
      radius,
      config,
    };

    this.glows.set(id, entry);
    this.drawCircleGlow(graphics, x, y, radius, config);
    return id;
  }

  /**
   * Update the position of a glow (for moving objects like paddles and ball).
   */
  updatePosition(id: string, x: number, y: number): void {
    const entry = this.glows.get(id);
    if (!entry) return;

    entry.graphics.clear();
    if (entry.shape === 'rect') {
      this.drawRectGlow(entry.graphics, x, y, entry.width, entry.height, entry.config);
    } else {
      this.drawCircleGlow(entry.graphics, x, y, entry.radius, entry.config);
    }
  }

  /**
   * Remove a specific glow (e.g., when a brick is destroyed).
   */
  removeGlow(id: string): void {
    const entry = this.glows.get(id);
    if (!entry) return;
    entry.graphics.destroy();
    this.glows.delete(id);
  }

  /**
   * Destroy all glow graphics. Call in scene shutdown.
   */
  destroy(): void {
    for (const [, entry] of this.glows) {
      entry.graphics.destroy();
    }
    this.glows.clear();
  }

  private drawRectGlow(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    config: GlowConfig,
  ): void {
    for (let i = 0; i < config.layers; i++) {
      const alpha = config.baseAlpha * Math.pow(config.alphaDecay, i) * config.intensity;
      const lineWidth = config.baseWidth + config.widthGrowth * i;

      graphics.lineStyle(lineWidth, config.color, alpha);
      graphics.strokeRect(
        x - width / 2 - lineWidth / 2,
        y - height / 2 - lineWidth / 2,
        width + lineWidth,
        height + lineWidth,
      );
    }
  }

  private drawCircleGlow(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    radius: number,
    config: GlowConfig,
  ): void {
    for (let i = 0; i < config.layers; i++) {
      const alpha = config.baseAlpha * Math.pow(config.alphaDecay, i) * config.intensity;
      const lineWidth = config.baseWidth + config.widthGrowth * i;

      graphics.lineStyle(lineWidth, config.color, alpha);
      graphics.strokeCircle(x, y, radius + lineWidth * (i + 1) * 0.5);
    }
  }
}
