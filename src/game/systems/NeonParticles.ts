import Phaser from 'phaser';

/**
 * Configuration for a particle burst.
 */
export interface BurstConfig {
  count: number;
  lifespan: number;
  speed: { min: number; max: number };
  scale: { start: number; end: number };
  tint?: number | number[];
}

const PARTICLE_TEXTURE_KEY = 'neon-particle';

/** Max particle caps per emitter (total ≤ 200) */
const MAX_PARTICLES = {
  score: 40,
  brickBreak: 60,
  win: 100,
} as const;

/**
 * NeonParticles manages particle emitters for gameplay event bursts.
 * Uses a programmatically generated 16x16 radial gradient circle texture.
 */
export class NeonParticles {
  private scene: Phaser.Scene;
  private scoreEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private brickBreakEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private winEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private textureGenerated = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Generate the 16x16 radial gradient circle texture programmatically.
   * Must be called before creating emitters.
   */
  generateParticleTexture(): void {
    // Only generate once per scene
    if (this.scene.textures.exists(PARTICLE_TEXTURE_KEY)) {
      this.textureGenerated = true;
      return;
    }

    const gfx = this.scene.add.graphics();
    // Outer soft glow
    gfx.fillStyle(0xffffff, 0.3);
    gfx.fillCircle(8, 8, 8);
    // Middle layer
    gfx.fillStyle(0xffffff, 0.6);
    gfx.fillCircle(8, 8, 6);
    // Inner bright core
    gfx.fillStyle(0xffffff, 1.0);
    gfx.fillCircle(8, 8, 4);
    gfx.generateTexture(PARTICLE_TEXTURE_KEY, 16, 16);
    gfx.destroy();
    this.textureGenerated = true;
  }

  /**
   * Create all emitters. Call after generateParticleTexture().
   */
  createEmitters(): void {
    if (!this.textureGenerated) return;

    // Score burst emitter
    this.scoreEmitter = this.scene.add.particles(0, 0, PARTICLE_TEXTURE_KEY, {
      lifespan: 800,
      speed: { min: 100, max: 250 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      emitting: false,
      maxParticles: MAX_PARTICLES.score,
    });
    this.scoreEmitter.setDepth(10);

    // Brick break emitter
    this.brickBreakEmitter = this.scene.add.particles(0, 0, PARTICLE_TEXTURE_KEY, {
      lifespan: 500,
      speed: { min: 80, max: 200 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 1, end: 0 },
      emitting: false,
      maxParticles: MAX_PARTICLES.brickBreak,
    });
    this.brickBreakEmitter.setDepth(10);

    // Win celebration emitter
    this.winEmitter = this.scene.add.particles(0, 0, PARTICLE_TEXTURE_KEY, {
      lifespan: 1500,
      speed: { min: 150, max: 350 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      emitting: false,
      maxParticles: MAX_PARTICLES.win,
    });
    this.winEmitter.setDepth(10);
  }

  /**
   * Emit a score burst at the given position.
   */
  burstScore(x: number, y: number, tint: number): void {
    if (!this.scoreEmitter) return;
    this.scoreEmitter.setParticleTint(tint);
    this.scoreEmitter.emitParticleAt(x, y, 20);
  }

  /**
   * Emit a brick-break burst at the given position.
   */
  burstBrickBreak(x: number, y: number, tint: number): void {
    if (!this.brickBreakEmitter) return;
    this.brickBreakEmitter.setParticleTint(tint);
    this.brickBreakEmitter.emitParticleAt(x, y, 10);
  }

  /**
   * Emit a win celebration burst at the given position with multi-color particles.
   */
  burstWin(x: number, y: number): void {
    if (!this.winEmitter) return;
    // Multi-color: cycle through neon colors
    const colors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00, 0xff4444];
    this.winEmitter.setParticleTint(colors[Math.floor(Math.random() * colors.length)]);
    this.winEmitter.emitParticleAt(x, y, 50);
  }

  /**
   * Destroy all emitters and remove the generated texture.
   */
  destroy(): void {
    if (this.scoreEmitter) {
      this.scoreEmitter.destroy();
      this.scoreEmitter = null;
    }
    if (this.brickBreakEmitter) {
      this.brickBreakEmitter.destroy();
      this.brickBreakEmitter = null;
    }
    if (this.winEmitter) {
      this.winEmitter.destroy();
      this.winEmitter = null;
    }
    // Remove texture if it exists
    if (this.scene.textures.exists(PARTICLE_TEXTURE_KEY)) {
      this.scene.textures.remove(PARTICLE_TEXTURE_KEY);
    }
    this.textureGenerated = false;
  }
}
