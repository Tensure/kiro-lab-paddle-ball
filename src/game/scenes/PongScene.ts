import Phaser from 'phaser';
import eventBridge from '../systems/EventBridge';
import { getLaunchPayload } from '../systems/SceneLauncher';
import { awardPoint, type PongScores } from '../rules/scoring';
import { computeSpeedAfterHit } from '../rules/ball-speed';
import {
  AI_DIFFICULTY_CONFIGS,
  computeAITarget,
  shouldUpdateTarget,
  computeAIPaddleVelocity,
  type AIDifficultyConfig,
} from '../rules/ai-controller';
import { NeonGlow, GLOW_PRESETS, NEON_COLORS } from '../systems/NeonGlow';
import { NeonParticles } from '../systems/NeonParticles';
import { PowerupManager } from '../systems/PowerupManager';
import type { SceneLaunchPayload } from '../types/payload';
import type { PongSoloSettings } from '../types/settings';
import type { PlayerId } from '../types/modes';
import type { PowerupId } from '../types/powerup';

const PONG = {
  GAME_WIDTH: 800,
  GAME_HEIGHT: 600,
  PADDLE_WIDTH: 16,
  PADDLE_HEIGHT: 100,
  PADDLE_OFFSET_X: 40,
  PADDLE_SPEED: 400,
  BALL_RADIUS: 8,
  BASE_SPEED: 300,
  SPEED_INCREMENT: 25,
  MAX_SPEED: 600,
  WALL_THICKNESS: 16,
  SERVE_DELAY_MS: 500,
} as const;

export default class PongScene extends Phaser.Scene {
  // Physics bodies
  private ball!: Phaser.GameObjects.Arc & { body: Phaser.Physics.Arcade.Body };
  private leftPaddle!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  private rightPaddle!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  private topWall!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.StaticBody };
  private bottomWall!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.StaticBody };

  // Direct keyboard state (bypasses Phaser's keyboard system for reliability in React-embedded games)
  private keyState: { w: boolean; s: boolean; up: boolean; down: boolean } = {
    w: false, s: false, up: false, down: false,
  };
  private boundKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private boundKeyUp: ((e: KeyboardEvent) => void) | null = null;

  // Match state
  private scores: PongScores = { left: 0, right: 0 };
  private winScore = 7;
  private serveDirection: 'left' | 'right' = 'right';
  private matchOver = false;
  private paused = false;
  private currentSpeed = PONG.BASE_SPEED;
  private _pausedVelocity: { x: number; y: number } | null = null;

  // AI state
  private isAIControlled = false;
  private aiFrozen = false;
  private aiState: {
    config: AIDifficultyConfig;
    targetY: number;
    timeSinceLastUpdate: number;
    lastRandomSeed: number;
  } | null = null;

  // Neon visual systems
  private neonGlow: NeonGlow | null = null;
  private neonParticles: NeonParticles | null = null;
  private leftPaddleGlowId = '';
  private rightPaddleGlowId = '';
  private ballGlowId = '';

  // Scoreboard HUD
  private leftScoreText!: Phaser.GameObjects.Text;
  private rightScoreText!: Phaser.GameObjects.Text;
  private winScoreLabel!: Phaser.GameObjects.Text;

  // Powerup system
  private powerupManager: PowerupManager | null = null;
  private powerupsEnabled = false;
  private gameMode: 'pong-solo' | 'pong-versus' = 'pong-versus';

  constructor() {
    super({ key: 'PongScene' });
  }

  init(data?: SceneLaunchPayload): void {
    // Read payload from SceneLauncher (primary) or init data (fallback)
    const payload = data?.settings ? data : getLaunchPayload();

    // Extract winScore from payload settings, default to 7
    if (payload?.settings && ('winScore' in payload.settings)) {
      const raw = Number((payload.settings as { winScore: number }).winScore);
      this.winScore = (raw >= 3 && raw <= 21) ? raw : 7;
    } else {
      this.winScore = 7;
    }

    // Extract powerupsEnabled
    this.powerupsEnabled = payload?.settings?.powerupsEnabled ?? false;

    // Detect AI mode
    if (payload?.settings && payload.settings.mode === 'pong-solo') {
      this.isAIControlled = true;
      this.gameMode = 'pong-solo';
      const preset = (payload.settings as PongSoloSettings).aiDifficulty ?? 'normal';
      this.aiState = {
        config: AI_DIFFICULTY_CONFIGS[preset] ?? AI_DIFFICULTY_CONFIGS['normal'],
        targetY: PONG.GAME_HEIGHT / 2,
        timeSinceLastUpdate: 0,
        lastRandomSeed: 0,
      };
    } else {
      this.isAIControlled = false;
      this.gameMode = 'pong-versus';
      this.aiState = null;
    }

    // Reset match state
    this.scores = { left: 0, right: 0 };
    this.matchOver = false;
    this.paused = false;
    this.aiFrozen = false;
    this.serveDirection = 'right';
    this.currentSpeed = PONG.BASE_SPEED;
  }

  create(): void {
    // Set background color (dark blue-tinted near-black for neon aesthetic)
    this.cameras.main.setBackgroundColor('#0a0a0f');

    // Create top wall (static body)
    this.topWall = this.add.rectangle(
      PONG.GAME_WIDTH / 2,
      PONG.WALL_THICKNESS / 2,
      PONG.GAME_WIDTH,
      PONG.WALL_THICKNESS,
      0x444444,
    ) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.StaticBody };
    this.physics.add.existing(this.topWall, true);

    // Create bottom wall (static body)
    this.bottomWall = this.add.rectangle(
      PONG.GAME_WIDTH / 2,
      PONG.GAME_HEIGHT - PONG.WALL_THICKNESS / 2,
      PONG.GAME_WIDTH,
      PONG.WALL_THICKNESS,
      0x444444,
    ) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.StaticBody };
    this.physics.add.existing(this.bottomWall, true);

    // Scoreboard HUD
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

    // Create left paddle (dynamic, immovable)
    this.leftPaddle = this.add.rectangle(
      PONG.PADDLE_OFFSET_X,
      PONG.GAME_HEIGHT / 2,
      PONG.PADDLE_WIDTH,
      PONG.PADDLE_HEIGHT,
      0xffffff,
    ) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    this.physics.add.existing(this.leftPaddle, false);
    this.leftPaddle.body.setImmovable(true);
    this.leftPaddle.body.setAllowGravity(false);

    // Create right paddle (dynamic, immovable)
    this.rightPaddle = this.add.rectangle(
      PONG.GAME_WIDTH - PONG.PADDLE_OFFSET_X,
      PONG.GAME_HEIGHT / 2,
      PONG.PADDLE_WIDTH,
      PONG.PADDLE_HEIGHT,
      0xffffff,
    ) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    this.physics.add.existing(this.rightPaddle, false);
    this.rightPaddle.body.setImmovable(true);
    this.rightPaddle.body.setAllowGravity(false);

    // Create ball (dynamic body, no gravity, bounce 1)
    this.ball = this.add.circle(
      PONG.GAME_WIDTH / 2,
      PONG.GAME_HEIGHT / 2,
      PONG.BALL_RADIUS,
      0xffffff,
    ) as Phaser.GameObjects.Arc & { body: Phaser.Physics.Arcade.Body };
    this.physics.add.existing(this.ball, false);
    this.ball.body.setAllowGravity(false);
    this.ball.body.setBounce(1, 1);
    this.ball.body.setCircle(PONG.BALL_RADIUS);
    // Disable world bounds collision — we detect ball exit manually
    this.ball.body.setCollideWorldBounds(false);
    // Cap ball speed to prevent tunneling at high velocities
    this.ball.body.setMaxSpeed(PONG.MAX_SPEED);

    // Add colliders: ball ↔ walls
    this.physics.add.collider(this.ball, this.topWall, this.onWallHit, undefined, this);
    this.physics.add.collider(this.ball, this.bottomWall, this.onWallHit, undefined, this);

    // Add colliders: ball ↔ paddles
    this.physics.add.collider(this.ball, this.leftPaddle, this.onPaddleHit, undefined, this);
    this.physics.add.collider(this.ball, this.rightPaddle, this.onPaddleHit, undefined, this);

    // Register keyboard input via window listeners (reliable in React-embedded Phaser)
    this.boundKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W') this.keyState.w = true;
      if (e.key === 's' || e.key === 'S') this.keyState.s = true;
      if (e.key === 'ArrowUp') { this.keyState.up = true; e.preventDefault(); }
      if (e.key === 'ArrowDown') { this.keyState.down = true; e.preventDefault(); }
    };
    this.boundKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W') this.keyState.w = false;
      if (e.key === 's' || e.key === 'S') this.keyState.s = false;
      if (e.key === 'ArrowUp') this.keyState.up = false;
      if (e.key === 'ArrowDown') this.keyState.down = false;
    };
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);

    // Subscribe to match:pause on EventBridge
    eventBridge.on('match:pause', this.handlePause);

    // Subscribe to scene:restart on EventBridge
    eventBridge.on('scene:restart', this.handleRestart);

    // Register shutdown cleanup
    this.events.on('shutdown', this.shutdown, this);

    // Initialize neon glow system
    this.neonGlow = new NeonGlow(this);
    this.leftPaddleGlowId = this.neonGlow.addRectGlow(
      this.leftPaddle.x, this.leftPaddle.y,
      PONG.PADDLE_WIDTH, PONG.PADDLE_HEIGHT,
      GLOW_PRESETS.paddle,
    );
    this.rightPaddleGlowId = this.neonGlow.addRectGlow(
      this.rightPaddle.x, this.rightPaddle.y,
      PONG.PADDLE_WIDTH, PONG.PADDLE_HEIGHT,
      GLOW_PRESETS.paddle,
    );
    this.ballGlowId = this.neonGlow.addCircleGlow(
      this.ball.x, this.ball.y,
      PONG.BALL_RADIUS,
      GLOW_PRESETS.ball,
    );

    // Initialize neon particle system
    this.neonParticles = new NeonParticles(this);
    this.neonParticles.generateParticleTexture();
    this.neonParticles.createEmitters();

    // Initialize powerup system if enabled
    if (this.powerupsEnabled) {
      this.powerupManager = new PowerupManager(this, this.gameMode, {
        getBall: () => this.ball,
        getPaddle: (player: PlayerId) => {
          if (player === 'left') return this.leftPaddle;
          if (player === 'right') return this.rightPaddle;
          return null;
        },
        setAIFrozen: (frozen: boolean) => {
          this.aiFrozen = frozen;
        },
      });
      this.powerupManager.start();

      // Add overlap between ball and powerup sprites
      this.physics.add.overlap(
        this.ball,
        this.powerupManager.spriteGroup,
        this.onPowerupCollect,
        undefined,
        this,
      );
    }

    // Initial serve with a short delay so the player can see the ball before it moves
    this.time.delayedCall(1000, () => {
      if (!this.matchOver && !this.paused) {
        this.serve();
      }
    });
  }

  update(_time: number, delta: number): void {
    // Skip processing if match is over or paused
    if (this.matchOver || this.paused) return;

    // Left paddle: AI or keyboard
    if (this.isAIControlled && this.aiState) {
      // AI Freeze: if frozen, stop AI paddle
      if (this.aiFrozen) {
        this.leftPaddle.body.setVelocityY(0);
      } else {
        // AI controls left paddle
        this.aiState.timeSinceLastUpdate += delta;

        if (shouldUpdateTarget(this.aiState.timeSinceLastUpdate, this.aiState.config)) {
          this.aiState.lastRandomSeed = Math.random() * 2 - 1;
          this.aiState.targetY = computeAITarget(
            {
              x: this.ball.x,
              y: this.ball.y,
              vx: this.ball.body.velocity.x,
              vy: this.ball.body.velocity.y,
            },
            { minY: PONG.WALL_THICKNESS, maxY: PONG.GAME_HEIGHT - PONG.WALL_THICKNESS },
            PONG.PADDLE_OFFSET_X,
            this.aiState.config,
            this.aiState.lastRandomSeed,
          );
          this.aiState.timeSinceLastUpdate = 0;
        }

        const aiVelocity = computeAIPaddleVelocity(
          this.leftPaddle.y,
          this.aiState.targetY,
          this.aiState.config,
        );
        this.leftPaddle.body.setVelocityY(aiVelocity);
      }
    } else {
      // Keyboard controls left paddle: W (up) / S (down)
      if (this.keyState.w) {
        this.leftPaddle.body.setVelocityY(-PONG.PADDLE_SPEED);
      } else if (this.keyState.s) {
        this.leftPaddle.body.setVelocityY(PONG.PADDLE_SPEED);
      } else {
        this.leftPaddle.body.setVelocityY(0);
      }
    }

    // Right paddle: ArrowUp / ArrowDown
    if (this.keyState.up) {
      this.rightPaddle.body.setVelocityY(-PONG.PADDLE_SPEED);
    } else if (this.keyState.down) {
      this.rightPaddle.body.setVelocityY(PONG.PADDLE_SPEED);
    } else {
      this.rightPaddle.body.setVelocityY(0);
    }

    // Clamp paddle Y positions to stay within walls
    const minPaddleY = PONG.WALL_THICKNESS + PONG.PADDLE_HEIGHT / 2;
    const maxPaddleY = PONG.GAME_HEIGHT - PONG.WALL_THICKNESS - PONG.PADDLE_HEIGHT / 2;

    if (this.leftPaddle.y < minPaddleY) {
      this.leftPaddle.y = minPaddleY;
      this.leftPaddle.body.setVelocityY(0);
    } else if (this.leftPaddle.y > maxPaddleY) {
      this.leftPaddle.y = maxPaddleY;
      this.leftPaddle.body.setVelocityY(0);
    }

    if (this.rightPaddle.y < minPaddleY) {
      this.rightPaddle.y = minPaddleY;
      this.rightPaddle.body.setVelocityY(0);
    } else if (this.rightPaddle.y > maxPaddleY) {
      this.rightPaddle.y = maxPaddleY;
      this.rightPaddle.body.setVelocityY(0);
    }

    // Check ball exit
    const ballX = this.ball.x;

    if (ballX < 0) {
      // Ball exited left edge — right player scores
      this.onBallExit('left');
    } else if (ballX > PONG.GAME_WIDTH) {
      // Ball exited right edge — left player scores
      this.onBallExit('right');
    }

    // Update glow positions for moving objects
    if (this.neonGlow) {
      this.neonGlow.updatePosition(this.leftPaddleGlowId, this.leftPaddle.x, this.leftPaddle.y);
      this.neonGlow.updatePosition(this.rightPaddleGlowId, this.rightPaddle.x, this.rightPaddle.y);
      this.neonGlow.updatePosition(this.ballGlowId, this.ball.x, this.ball.y);
    }
  }

  shutdown = (): void => {
    // Cancel all pending time events to prevent orphaned callbacks
    this.time.removeAllEvents();
    // Destroy powerup manager
    if (this.powerupManager) {
      this.powerupManager.destroy();
      this.powerupManager = null;
    }
    // Unsubscribe EventBridge listeners
    eventBridge.off('match:pause', this.handlePause);
    eventBridge.off('scene:restart', this.handleRestart);
    // Remove window keyboard listeners
    if (this.boundKeyDown) window.removeEventListener('keydown', this.boundKeyDown);
    if (this.boundKeyUp) window.removeEventListener('keyup', this.boundKeyUp);
    // Destroy neon visual systems
    if (this.neonGlow) {
      this.neonGlow.destroy();
      this.neonGlow = null;
    }
    if (this.neonParticles) {
      this.neonParticles.destroy();
      this.neonParticles = null;
    }
  };

  private handleRestart = (): void => {
    // Destroy powerup manager before restart
    if (this.powerupManager) {
      this.powerupManager.destroy();
      this.powerupManager = null;
    }
    this.time.removeAllEvents();
    // Restart the scene — this re-runs init() + create() with fresh state
    // init() will read from SceneLauncher which still has the original payload
    this.scene.restart();
  };

  private serve(): void {
    // Position ball at center
    this.ball.setPosition(PONG.GAME_WIDTH / 2, PONG.GAME_HEIGHT / 2);

    // Reset speed to BASE_SPEED
    this.currentSpeed = PONG.BASE_SPEED;

    // Compute velocity direction
    const horizontalDir = this.serveDirection === 'right' ? 1 : -1;
    const verticalDir = Phaser.Math.FloatBetween(-0.5, 0.5);

    // Normalize and scale to BASE_SPEED
    const vec = new Phaser.Math.Vector2(horizontalDir, verticalDir).normalize();
    this.ball.body.setVelocity(
      vec.x * PONG.BASE_SPEED,
      vec.y * PONG.BASE_SPEED,
    );
  }

  private onBallExit(exitEdge: 'left' | 'right'): void {
    // Immediately reposition ball to center and stop it to prevent double-detection
    this.ball.setPosition(PONG.GAME_WIDTH / 2, PONG.GAME_HEIGHT / 2);
    this.ball.body.setVelocity(0, 0);

    // Award point using pure scoring rule
    const result = awardPoint(this.scores, exitEdge);
    this.scores = result.scores;
    this.serveDirection = result.nextServeDirection;

    // Update scoreboard text
    this.leftScoreText.setText(String(this.scores.left));
    this.rightScoreText.setText(String(this.scores.right));

    // Emit score update
    eventBridge.emit('score:update', { left: this.scores.left, right: this.scores.right });

    // Emit audio cue
    eventBridge.emit('audio:score-point');

    // Camera shake on score (guard: not while paused)
    if (!this.paused) {
      this.cameras.main.shake(100, 0.005);
    }

    // Particle burst at scoring edge
    if (this.neonParticles && !this.paused) {
      const burstX = exitEdge === 'left' ? 0 : PONG.GAME_WIDTH;
      const burstY = PONG.GAME_HEIGHT / 2;
      const tint = exitEdge === 'left' ? 0xff00ff : NEON_COLORS.PADDLE_CYAN;
      this.neonParticles.burstScore(burstX, burstY, tint);
    }

    // Check win condition
    if (this.scores.left >= this.winScore || this.scores.right >= this.winScore) {
      this.triggerWin();
    } else {
      // Schedule next serve after delay
      this.time.delayedCall(PONG.SERVE_DELAY_MS, () => {
        if (!this.matchOver && !this.paused) {
          this.serve();
        }
      });
    }
  }

  private triggerWin(): void {
    this.matchOver = true;

    // Stop ball
    this.ball.body.setVelocity(0, 0);

    // Camera flash on win (guard: not while paused)
    if (!this.paused) {
      this.cameras.main.flash(250, 255, 255, 255, false, undefined, 0.6);
    }

    // Win particle celebration at screen center
    if (this.neonParticles && !this.paused) {
      this.neonParticles.burstWin(PONG.GAME_WIDTH / 2, PONG.GAME_HEIGHT / 2);
    }

    // Determine winner
    const winner = this.scores.left >= this.winScore ? 'left' : 'right';

    // Emit win events
    eventBridge.emit('match:win', { winner });
    eventBridge.emit('audio:win');
  }

  private onPaddleHit = (): void => {
    // Emit audio event
    eventBridge.emit('audio:paddle-hit');

    // Increase speed
    this.currentSpeed = computeSpeedAfterHit(this.currentSpeed, {
      baseSpeed: PONG.BASE_SPEED,
      increment: PONG.SPEED_INCREMENT,
      maxSpeed: PONG.MAX_SPEED,
    });

    // Normalize ball velocity and scale to currentSpeed
    const vx = this.ball.body.velocity.x;
    const vy = this.ball.body.velocity.y;
    const magnitude = Math.sqrt(vx * vx + vy * vy);

    if (magnitude > 0) {
      const scale = this.currentSpeed / magnitude;
      this.ball.body.setVelocity(vx * scale, vy * scale);
    }
  };

  private onWallHit = (): void => {
    eventBridge.emit('audio:wall-bounce');
  };

  private onPowerupCollect = (
    _ball: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    powerupSprite: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
  ): void => {
    if (!this.powerupManager) return;

    const sprite = powerupSprite as Phaser.GameObjects.Sprite & { powerupId?: PowerupId };
    const powerupId = sprite.powerupId;
    if (!powerupId) return;

    // Determine collector based on ball direction
    const collector: PlayerId = this.ball.body.velocity.x > 0 ? 'right' : 'left';
    this.powerupManager.collect(powerupId, collector);
  };

  private handlePause = (payload: { paused: boolean }): void => {
    this.paused = payload.paused;
    if (payload.paused) {
      // Save ball velocity and stop it
      if (this.ball?.body) {
        this._pausedVelocity = { x: this.ball.body.velocity.x, y: this.ball.body.velocity.y };
        this.ball.body.setVelocity(0, 0);
      }
      // Stop paddle velocities too (AI and player)
      if (this.leftPaddle?.body) this.leftPaddle.body.setVelocityY(0);
      if (this.rightPaddle?.body) this.rightPaddle.body.setVelocityY(0);
      this.powerupManager?.pause();
      eventBridge.emit('audio:pause');
    } else {
      // Restore ball velocity (if it was moving before pause)
      if (this.ball?.body && this._pausedVelocity) {
        this.ball.body.setVelocity(this._pausedVelocity.x, this._pausedVelocity.y);
      }
      this._pausedVelocity = null;
      // If ball was stationary (pre-serve pause), schedule a new serve
      if (this.ball?.body && this.ball.body.velocity.x === 0 && this.ball.body.velocity.y === 0 && !this.matchOver) {
        this.time.delayedCall(500, () => {
          if (!this.matchOver && !this.paused) {
            this.serve();
          }
        });
      }
      this.powerupManager?.resume();
    }
  };
}
