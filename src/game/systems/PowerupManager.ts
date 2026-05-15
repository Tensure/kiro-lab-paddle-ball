import Phaser from 'phaser';
import type { GameMode, PlayerId } from '../types/modes';
import type { PowerupId, PowerupDefinition, SpawnConfig, ActiveEffect } from '../types/powerup';
import {
  getEligiblePowerups,
  getPowerupById,
  applyStackingPolicy,
  resolveTarget,
  EFFECT_MULTIPLIERS,
  DEFAULT_SPAWN_CONFIG,
} from '../rules/powerups';
import eventBridge from './EventBridge';

/** Color mapping for powerup sprites by effect type */
const POWERUP_COLORS = {
  beneficial: 0x00ffff,
  harmful: 0xff4444,
  neutral: 0xffff00,
} as const;

/** Particle texture key for powerup collection burst */
const POWERUP_PARTICLE_KEY = 'powerup-particle';

/** Diamond texture keys by effect type */
const DIAMOND_TEXTURE_KEYS = {
  beneficial: 'powerup-diamond-beneficial',
  harmful: 'powerup-diamond-harmful',
  neutral: 'powerup-diamond-neutral',
} as const;

/** Callbacks the scene provides so PowerupManager can apply/revert effects */
export interface PowerupCallbacks {
  /** Get the ball physics body (for speed effects) */
  getBall(): Phaser.GameObjects.Arc & { body: Phaser.Physics.Arcade.Body } | null;
  /** Get a paddle physics body by player ID */
  getPaddle(player: PlayerId): Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body } | null;
  /** Set AI freeze flag (pong-solo only) */
  setAIFrozen?(frozen: boolean): void;
  /** Set piercing ball flag (breakout only) */
  setPiercing?(piercing: boolean): void;
  /** Set sticky paddle flag (breakout only) */
  setSticky?(sticky: boolean): void;
  /** Add extra life (breakout only) */
  addExtraLife?(): void;
}

interface SpawnedPowerup {
  sprite: Phaser.GameObjects.Sprite;
  powerupId: PowerupId;
  despawnTimer: Phaser.Time.TimerEvent;
  tween: Phaser.Tweens.Tween;
}

interface TrackedEffect {
  effect: ActiveEffect;
  timer: Phaser.Time.TimerEvent | null;
  originalValue: number | null;
  revertFn: (() => void) | null;
}

/**
 * Manages powerup spawning, collection, effect application, and cleanup.
 * Instantiated per scene — not a singleton.
 */
export class PowerupManager {
  private scene: Phaser.Scene;
  private mode: GameMode;
  private config: SpawnConfig;
  private callbacks: PowerupCallbacks;

  private spawnTimer: Phaser.Time.TimerEvent | null = null;
  private spawnedPowerups: SpawnedPowerup[] = [];
  private trackedEffects: TrackedEffect[] = [];
  private activeEffects: ActiveEffect[] = [];
  private destroyed = false;
  private paused = false;

  /** Physics group for powerup sprites — scenes add overlap colliders against this */
  public spriteGroup: Phaser.Physics.Arcade.Group;

  /** Particle emitter for collection bursts */
  private particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  constructor(
    scene: Phaser.Scene,
    mode: GameMode,
    callbacks: PowerupCallbacks,
    config?: Partial<SpawnConfig>,
  ) {
    this.scene = scene;
    this.mode = mode;
    this.callbacks = callbacks;
    this.config = { ...DEFAULT_SPAWN_CONFIG, ...config };
    this.spriteGroup = scene.physics.add.group();

    // Generate particle texture for collection burst
    this.setupParticleTexture();
  }

  /** Start the spawn loop. Call in scene create() when powerupsEnabled is true. */
  start(): void {
    if (this.destroyed) return;
    this.scheduleNextSpawn();
  }

  /** Pause all timers (spawn + active effects). Call on match pause. */
  pause(): void {
    if (this.destroyed || this.paused) return;
    this.paused = true;

    if (this.spawnTimer) {
      this.spawnTimer.paused = true;
    }

    for (const tracked of this.trackedEffects) {
      if (tracked.timer) {
        tracked.timer.paused = true;
      }
    }

    // Pause despawn timers
    for (const spawned of this.spawnedPowerups) {
      spawned.despawnTimer.paused = true;
      spawned.tween.pause();
    }
  }

  /** Resume all timers. Call on match resume. */
  resume(): void {
    if (this.destroyed || !this.paused) return;
    this.paused = false;

    if (this.spawnTimer) {
      this.spawnTimer.paused = false;
    }

    for (const tracked of this.trackedEffects) {
      if (tracked.timer) {
        tracked.timer.paused = false;
      }
    }

    // Resume despawn timers
    for (const spawned of this.spawnedPowerups) {
      spawned.despawnTimer.paused = false;
      spawned.tween.resume();
    }
  }

  /** Handle powerup collection. Called from physics collider callback. */
  collect(powerupId: PowerupId, collector: PlayerId): void {
    if (this.destroyed || this.paused) return;

    const definition = getPowerupById(powerupId);
    if (!definition) return;

    // Find and remove the spawned powerup sprite
    const spawnedIndex = this.spawnedPowerups.findIndex((s) => s.powerupId === powerupId);
    if (spawnedIndex < 0) return;

    const spawned = this.spawnedPowerups[spawnedIndex];
    const spriteX = spawned.sprite.x;
    const spriteY = spawned.sprite.y;
    const spriteColor = POWERUP_COLORS[definition.effectType];

    // Cancel despawn timer and remove sprite
    spawned.despawnTimer.destroy();
    spawned.tween.destroy();
    spawned.sprite.destroy();
    this.spawnedPowerups.splice(spawnedIndex, 1);

    // Resolve target
    const target = resolveTarget(definition, collector, this.mode);

    // Apply stacking policy
    const stackResult = applyStackingPolicy(
      this.activeEffects,
      powerupId,
      target,
      definition.duration,
      Date.now(),
    );
    this.activeEffects = [...stackResult.effects];

    // Emit audio
    eventBridge.emit('audio:powerup-pickup');

    // Particle burst at collection point
    this.emitCollectionBurst(spriteX, spriteY, spriteColor);

    // Apply effect
    if (stackResult.action === 'apply-new') {
      this.applyEffect(definition, target);
    } else {
      // Refresh duration — cancel old timer and start new one
      this.refreshEffectTimer(powerupId, target, definition.duration);
    }
  }

  /** Clean up all effects, timers, and sprites. Call on match end/restart/shutdown. */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    // Cancel spawn timer
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }

    // Revert all active effects
    for (const tracked of this.trackedEffects) {
      if (tracked.timer) {
        tracked.timer.destroy();
      }
      if (tracked.revertFn) {
        tracked.revertFn();
      }
    }
    this.trackedEffects = [];
    this.activeEffects = [];

    // Destroy all spawned powerup sprites
    for (const spawned of this.spawnedPowerups) {
      spawned.despawnTimer.destroy();
      spawned.tween.destroy();
      spawned.sprite.destroy();
    }
    this.spawnedPowerups = [];

    // Destroy particle emitter
    if (this.particleEmitter) {
      this.particleEmitter.destroy();
      this.particleEmitter = null;
    }

    // Destroy sprite group
    this.spriteGroup.destroy(true);
  }

  /** Get currently active effects (for testing/debugging) */
  getActiveEffects(): readonly ActiveEffect[] {
    return this.activeEffects;
  }

  // --- Private methods ---

  private setupParticleTexture(): void {
    if (this.scene.textures.exists(POWERUP_PARTICLE_KEY)) return;

    // Generate particle texture
    const gfx = this.scene.add.graphics();
    gfx.fillStyle(0xffffff, 0.8);
    gfx.fillCircle(4, 4, 4);
    gfx.fillStyle(0xffffff, 1.0);
    gfx.fillCircle(4, 4, 2);
    gfx.generateTexture(POWERUP_PARTICLE_KEY, 8, 8);
    gfx.destroy();

    // Generate diamond textures for each effect type
    for (const [effectType, color] of Object.entries(POWERUP_COLORS)) {
      const key = DIAMOND_TEXTURE_KEYS[effectType as keyof typeof DIAMOND_TEXTURE_KEYS];
      if (this.scene.textures.exists(key)) continue;

      const diamondGfx = this.scene.add.graphics();
      diamondGfx.fillStyle(color, 0.9);
      diamondGfx.beginPath();
      // Diamond shape: 16x16, centered at (8, 8)
      diamondGfx.moveTo(8, 0);   // top
      diamondGfx.lineTo(16, 8);  // right
      diamondGfx.lineTo(8, 16);  // bottom
      diamondGfx.lineTo(0, 8);   // left
      diamondGfx.closePath();
      diamondGfx.fillPath();
      // Add a brighter inner diamond for glow effect
      diamondGfx.fillStyle(color, 1.0);
      diamondGfx.beginPath();
      diamondGfx.moveTo(8, 3);
      diamondGfx.lineTo(13, 8);
      diamondGfx.lineTo(8, 13);
      diamondGfx.lineTo(3, 8);
      diamondGfx.closePath();
      diamondGfx.fillPath();
      diamondGfx.generateTexture(key, 16, 16);
      diamondGfx.destroy();
    }

    // Create particle emitter
    this.particleEmitter = this.scene.add.particles(0, 0, POWERUP_PARTICLE_KEY, {
      lifespan: 300,
      speed: { min: 80, max: 180 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      emitting: false,
      maxParticles: 16,
    });
    this.particleEmitter.setDepth(15);
  }

  private emitCollectionBurst(x: number, y: number, tint: number): void {
    if (!this.particleEmitter) return;
    this.particleEmitter.setParticleTint(tint);
    this.particleEmitter.emitParticleAt(x, y, 8);
  }

  private scheduleNextSpawn(): void {
    if (this.destroyed) return;

    const delay = Phaser.Math.Between(this.config.minInterval, this.config.maxInterval);
    this.spawnTimer = this.scene.time.addEvent({
      delay,
      callback: () => {
        this.attemptSpawn();
        this.scheduleNextSpawn();
      },
    });
  }

  private attemptSpawn(): void {
    if (this.destroyed || this.paused) return;

    // Enforce maxOnScreen
    if (this.spawnedPowerups.length >= this.config.maxOnScreen) return;

    // Probability check
    if (Math.random() > this.config.spawnProbability) return;

    // Get eligible powerups for this mode
    const eligible = getEligiblePowerups(this.mode);
    if (eligible.length === 0) return;

    // Weighted random selection
    const selected = this.weightedRandomSelect(eligible);
    if (!selected) return;

    // Spawn the powerup sprite
    this.spawnPowerup(selected);
  }

  private weightedRandomSelect(
    definitions: readonly PowerupDefinition[],
  ): PowerupDefinition | null {
    const totalWeight = definitions.reduce((sum, d) => sum + d.spawnWeight, 0);
    if (totalWeight <= 0) return null;

    let roll = Math.random() * totalWeight;
    for (const def of definitions) {
      roll -= def.spawnWeight;
      if (roll <= 0) return def;
    }
    return definitions[definitions.length - 1];
  }

  private spawnPowerup(definition: PowerupDefinition): void {
    // Determine spawn position — avoid paddle zones
    const gameWidth = 800;
    const gameHeight = 600;
    const margin = 60;

    let minY: number;
    let maxY: number;

    if (this.mode === 'breakout') {
      // Avoid bottom 20% (paddle area) and top 15% (brick area)
      minY = gameHeight * 0.4;
      maxY = gameHeight * 0.75;
    } else {
      // Pong: avoid top/bottom 15%
      minY = gameHeight * 0.15;
      maxY = gameHeight * 0.85;
    }

    const x = Phaser.Math.Between(margin, gameWidth - margin);
    const y = Phaser.Math.Between(minY, maxY);

    // Create diamond sprite using generated texture
    const textureKey = DIAMOND_TEXTURE_KEYS[definition.effectType];
    const sprite = this.scene.add.sprite(x, y, textureKey);
    sprite.setDepth(10);
    this.scene.physics.add.existing(sprite, false);
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 16);
    body.setAllowGravity(false);
    body.setImmovable(true);

    // Add to physics group
    this.spriteGroup.add(sprite);

    // Store powerupId on the sprite for retrieval during collision
    (sprite as Phaser.GameObjects.Sprite & { powerupId?: PowerupId }).powerupId = definition.id;

    // Pulsing scale tween (0.9 → 1.1 loop)
    const tween = this.scene.tweens.add({
      targets: sprite,
      scaleX: { from: 0.9, to: 1.1 },
      scaleY: { from: 0.9, to: 1.1 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Despawn timer
    const despawnTimer = this.scene.time.addEvent({
      delay: this.config.despawnTime,
      callback: () => {
        this.removePowerupSprite(definition.id);
      },
    });

    this.spawnedPowerups.push({
      sprite,
      powerupId: definition.id,
      despawnTimer,
      tween,
    });
  }

  private removePowerupSprite(powerupId: PowerupId): void {
    const index = this.spawnedPowerups.findIndex((s) => s.powerupId === powerupId);
    if (index < 0) return;

    const spawned = this.spawnedPowerups[index];
    spawned.tween.destroy();
    spawned.sprite.destroy();
    this.spawnedPowerups.splice(index, 1);
  }

  private applyEffect(definition: PowerupDefinition, target: PlayerId): void {
    let revertFn: (() => void) | null = null;
    let originalValue: number | null = null;

    switch (definition.id) {
      case 'ball-speed-up': {
        const ball = this.callbacks.getBall();
        if (ball) {
          const vx = ball.body.velocity.x;
          const vy = ball.body.velocity.y;
          const mag = Math.sqrt(vx * vx + vy * vy);
          originalValue = mag;
          if (mag > 0) {
            const newMag = mag * EFFECT_MULTIPLIERS.ballSpeedUp;
            const scale = newMag / mag;
            ball.body.setVelocity(vx * scale, vy * scale);
          }
          revertFn = () => {
            const b = this.callbacks.getBall();
            if (b) {
              const cvx = b.body.velocity.x;
              const cvy = b.body.velocity.y;
              const cmag = Math.sqrt(cvx * cvx + cvy * cvy);
              if (cmag > 0 && originalValue !== null && originalValue > 0) {
                const s = originalValue / cmag;
                b.body.setVelocity(cvx * s, cvy * s);
              }
            }
          };
        }
        break;
      }
      case 'ball-slow-down': {
        const ball = this.callbacks.getBall();
        if (ball) {
          const vx = ball.body.velocity.x;
          const vy = ball.body.velocity.y;
          const mag = Math.sqrt(vx * vx + vy * vy);
          originalValue = mag;
          if (mag > 0) {
            const newMag = mag * EFFECT_MULTIPLIERS.ballSlowDown;
            const scale = newMag / mag;
            ball.body.setVelocity(vx * scale, vy * scale);
          }
          revertFn = () => {
            const b = this.callbacks.getBall();
            if (b) {
              const cvx = b.body.velocity.x;
              const cvy = b.body.velocity.y;
              const cmag = Math.sqrt(cvx * cvx + cvy * cvy);
              if (cmag > 0 && originalValue !== null && originalValue > 0) {
                const s = originalValue / cmag;
                b.body.setVelocity(cvx * s, cvy * s);
              }
            }
          };
        }
        break;
      }
      case 'paddle-grow': {
        const paddle = this.callbacks.getPaddle(target);
        if (paddle) {
          originalValue = paddle.height;
          const newHeight = paddle.height * EFFECT_MULTIPLIERS.paddleGrow;
          paddle.setSize(paddle.width, newHeight);
          paddle.body.setSize(paddle.width, newHeight);
          revertFn = () => {
            const p = this.callbacks.getPaddle(target);
            if (p && originalValue !== null) {
              p.setSize(p.width, originalValue);
              p.body.setSize(p.width, originalValue);
            }
          };
        }
        break;
      }
      case 'paddle-shrink': {
        const paddle = this.callbacks.getPaddle(target);
        if (paddle) {
          originalValue = paddle.height;
          const newHeight = paddle.height * EFFECT_MULTIPLIERS.paddleShrink;
          paddle.setSize(paddle.width, newHeight);
          paddle.body.setSize(paddle.width, newHeight);
          revertFn = () => {
            const p = this.callbacks.getPaddle(target);
            if (p && originalValue !== null) {
              p.setSize(p.width, originalValue);
              p.body.setSize(p.width, originalValue);
            }
          };
        }
        break;
      }
      case 'opponent-paddle-shrink': {
        const paddle = this.callbacks.getPaddle(target);
        if (paddle) {
          originalValue = paddle.height;
          const newHeight = paddle.height * EFFECT_MULTIPLIERS.opponentPaddleShrink;
          paddle.setSize(paddle.width, newHeight);
          paddle.body.setSize(paddle.width, newHeight);
          revertFn = () => {
            const p = this.callbacks.getPaddle(target);
            if (p && originalValue !== null) {
              p.setSize(p.width, originalValue);
              p.body.setSize(p.width, originalValue);
            }
          };
        }
        break;
      }
      case 'wide-paddle': {
        const paddle = this.callbacks.getPaddle(target);
        if (paddle) {
          originalValue = paddle.width;
          const newWidth = paddle.width * EFFECT_MULTIPLIERS.widePaddle;
          paddle.setSize(newWidth, paddle.height);
          paddle.body.setSize(newWidth, paddle.height);
          revertFn = () => {
            const p = this.callbacks.getPaddle(target);
            if (p && originalValue !== null) {
              p.setSize(originalValue, p.height);
              p.body.setSize(originalValue, p.height);
            }
          };
        }
        break;
      }
      case 'ai-freeze': {
        if (this.callbacks.setAIFrozen) {
          this.callbacks.setAIFrozen(true);
          revertFn = () => {
            if (this.callbacks.setAIFrozen) {
              this.callbacks.setAIFrozen(false);
            }
          };
        }
        break;
      }
      case 'piercing-ball': {
        if (this.callbacks.setPiercing) {
          this.callbacks.setPiercing(true);
          revertFn = () => {
            if (this.callbacks.setPiercing) {
              this.callbacks.setPiercing(false);
            }
          };
        }
        break;
      }
      case 'sticky-paddle': {
        if (this.callbacks.setSticky) {
          this.callbacks.setSticky(true);
          revertFn = () => {
            if (this.callbacks.setSticky) {
              this.callbacks.setSticky(false);
            }
          };
        }
        break;
      }
      case 'extra-life': {
        if (this.callbacks.addExtraLife) {
          this.callbacks.addExtraLife();
        }
        // No timer, no revert
        break;
      }
      case 'multi-ball': {
        // Multi-ball: no-op for now (complex, would need scene-level ball management)
        // Placeholder — the effect is tracked but doesn't create extra balls in v1
        break;
      }
    }

    // Start duration timer if applicable
    let timer: Phaser.Time.TimerEvent | null = null;
    if (definition.duration !== null) {
      timer = this.scene.time.addEvent({
        delay: definition.duration,
        callback: () => {
          this.expireEffect(definition.id, target);
        },
      });
    }

    this.trackedEffects.push({
      effect: { powerupId: definition.id, targetPlayer: target, remainingMs: definition.duration, appliedAt: Date.now() },
      timer,
      originalValue,
      revertFn,
    });
  }

  private refreshEffectTimer(powerupId: PowerupId, target: PlayerId, duration: number | null): void {
    const tracked = this.trackedEffects.find(
      (t) => t.effect.powerupId === powerupId && t.effect.targetPlayer === target,
    );
    if (!tracked) return;

    // Cancel old timer
    if (tracked.timer) {
      tracked.timer.destroy();
      tracked.timer = null;
    }

    // Start new timer with full duration
    if (duration !== null) {
      tracked.timer = this.scene.time.addEvent({
        delay: duration,
        callback: () => {
          this.expireEffect(powerupId, target);
        },
      });
    }
  }

  private expireEffect(powerupId: PowerupId, target: PlayerId): void {
    if (this.destroyed) return;

    const index = this.trackedEffects.findIndex(
      (t) => t.effect.powerupId === powerupId && t.effect.targetPlayer === target,
    );
    if (index < 0) return;

    const tracked = this.trackedEffects[index];

    // Revert effect
    if (tracked.revertFn) {
      tracked.revertFn();
    }

    // Cancel timer if still active
    if (tracked.timer) {
      tracked.timer.destroy();
    }

    // Remove from tracked
    this.trackedEffects.splice(index, 1);

    // Remove from active effects
    this.activeEffects = this.activeEffects.filter(
      (e) => !(e.powerupId === powerupId && e.targetPlayer === target),
    );

    // Emit audio
    eventBridge.emit('audio:powerup-expire');
  }
}
