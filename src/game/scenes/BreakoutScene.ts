import Phaser from 'phaser';
import eventBridge from '../systems/EventBridge';
import { getLaunchPayload } from '../systems/SceneLauncher';
import { generateBrickGrid, type BrickGridConfig } from '../rules/brick-grid';
import {
  createInitialState,
  loseLife,
  breakBrick,
  getMatchStatus,
  type BreakoutState,
} from '../rules/life-rules';
import { computeSpeedAfterHit } from '../rules/ball-speed';
import { NeonGlow, GLOW_PRESETS } from '../systems/NeonGlow';
import { NeonParticles } from '../systems/NeonParticles';
import { PowerupManager } from '../systems/PowerupManager';
import type { SceneLaunchPayload } from '../types/payload';
import type { PlayerId } from '../types/modes';
import type { PowerupId } from '../types/powerup';

const BREAKOUT = {
  GAME_WIDTH: 800,
  GAME_HEIGHT: 600,
  PADDLE_WIDTH: 100,
  PADDLE_HEIGHT: 16,
  PADDLE_Y: 560,
  PADDLE_SPEED: 500,
  BALL_RADIUS: 8,
  BASE_SPEED: 300,
  SPEED_INCREMENT: 15,
  MAX_SPEED: 550,
  WALL_THICKNESS: 16,
  BRICK_ROWS: 5,
  BRICK_COLUMNS: 10,
  BRICK_TOP_OFFSET: 80,
  BRICK_PADDING: 4,
  BRICK_AREA_HEIGHT: 200,
  POINTS_PER_BRICK: 10,
  SERVE_DELAY_MS: 750,
  SPEED_INCREASE_ENABLED: true,
} as const;

const BRICK_COLORS = [
  0xff4444, // row 0 — red
  0xff8844, // row 1 — orange
  0xffcc44, // row 2 — yellow
  0x44ff44, // row 3 — green
  0x44ccff, // row 4 — cyan
];

export default class BreakoutScene extends Phaser.Scene {
  // Physics bodies
  private ball!: Phaser.GameObjects.Arc & { body: Phaser.Physics.Arcade.Body };
  private paddle!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  private topWall!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.StaticBody };
  private leftWall!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.StaticBody };
  private rightWall!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.StaticBody };
  private bricks!: Phaser.Physics.Arcade.StaticGroup;

  // Input state (window listeners)
  private keyState = { left: false, right: false };
  private boundKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private boundKeyUp: ((e: KeyboardEvent) => void) | null = null;

  // Match state
  private breakoutState!: BreakoutState;
  private matchOver = false;
  private paused = false;
  private currentSpeed = BREAKOUT.BASE_SPEED;
  private _pausedVelocity: { x: number; y: number } | null = null;
  private speedIncreaseEnabled = BREAKOUT.SPEED_INCREASE_ENABLED;

  // HUD
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;

  // Powerup effect flags
  private piercing = false;
  private sticky = false;
  private ballStuck = false;
  private ballStuckOffsetX = 0;

  // Neon visual systems
  private neonGlow: NeonGlow | null = null;
  private neonParticles: NeonParticles | null = null;
  private paddleGlowId = '';
  private ballGlowId = '';
  private brickGlowIds: Map<Phaser.GameObjects.Rectangle, string> = new Map();

  // Powerup system
  private powerupManager: PowerupManager | null = null;
  private powerupsEnabled = false;

  constructor() {
    super({ key: 'BreakoutScene' });
  }

  init(data?: SceneLaunchPayload): void {
    // Read payload from SceneLauncher (primary) or init data (fallback)
    const payload = data?.settings ? data : getLaunchPayload();

    // Extract speedIncreaseEnabled — default to true
    this.speedIncreaseEnabled = BREAKOUT.SPEED_INCREASE_ENABLED;

    // Extract powerupsEnabled
    this.powerupsEnabled = payload?.settings?.powerupsEnabled ?? false;

    // Reset match state
    this.matchOver = false;
    this.paused = false;
    this.currentSpeed = BREAKOUT.BASE_SPEED;
    this.piercing = false;
    this.sticky = false;
    this.ballStuck = false;
    this.ballStuckOffsetX = 0;
  }

  create(): void {
    // Set background color (dark blue-tinted near-black for neon aesthetic)
    this.cameras.main.setBackgroundColor('#0a0a0f');

    // Create top wall (static body, full width)
    this.topWall = this.add.rectangle(
      BREAKOUT.GAME_WIDTH / 2,
      BREAKOUT.WALL_THICKNESS / 2,
      BREAKOUT.GAME_WIDTH,
      BREAKOUT.WALL_THICKNESS,
      0x444444,
    ) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.StaticBody };
    this.physics.add.existing(this.topWall, true);

    // Create left wall (static body, full height)
    this.leftWall = this.add.rectangle(
      BREAKOUT.WALL_THICKNESS / 2,
      BREAKOUT.GAME_HEIGHT / 2,
      BREAKOUT.WALL_THICKNESS,
      BREAKOUT.GAME_HEIGHT,
      0x444444,
    ) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.StaticBody };
    this.physics.add.existing(this.leftWall, true);

    // Create right wall (static body, full height)
    this.rightWall = this.add.rectangle(
      BREAKOUT.GAME_WIDTH - BREAKOUT.WALL_THICKNESS / 2,
      BREAKOUT.GAME_HEIGHT / 2,
      BREAKOUT.WALL_THICKNESS,
      BREAKOUT.GAME_HEIGHT,
      0x444444,
    ) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.StaticBody };
    this.physics.add.existing(this.rightWall, true);

    // HUD
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

    // Generate brick grid
    const gridConfig: BrickGridConfig = {
      rows: BREAKOUT.BRICK_ROWS,
      columns: BREAKOUT.BRICK_COLUMNS,
      playAreaWidth: BREAKOUT.GAME_WIDTH - 2 * BREAKOUT.WALL_THICKNESS,
      playAreaHeight: BREAKOUT.BRICK_AREA_HEIGHT,
      topOffset: BREAKOUT.BRICK_TOP_OFFSET,
      padding: BREAKOUT.BRICK_PADDING,
    };
    const brickDescriptors = generateBrickGrid(gridConfig);

    // Create static group for bricks
    this.bricks = this.physics.add.staticGroup();

    // Initialize neon glow system (before brick creation so we can add brick glows)
    this.neonGlow = new NeonGlow(this);

    // Create a colored rectangle for each BrickDescriptor
    for (let i = 0; i < brickDescriptors.length; i++) {
      const desc = brickDescriptors[i];
      const row = Math.floor(i / BREAKOUT.BRICK_COLUMNS);
      const color = BRICK_COLORS[row % BRICK_COLORS.length];

      // Offset by WALL_THICKNESS to account for left wall
      const brickX = BREAKOUT.WALL_THICKNESS + desc.x + desc.width / 2;
      const brickY = desc.y + desc.height / 2;

      const brick = this.add.rectangle(brickX, brickY, desc.width, desc.height, color);
      this.bricks.add(brick);
      // Refresh the static body to match the rectangle position/size
      (brick.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();

      // Add glow to brick with its row color (lower intensity)
      const brickGlowConfig = { ...GLOW_PRESETS.brick, color };
      const glowId = this.neonGlow.addRectGlow(brickX, brickY, desc.width, desc.height, brickGlowConfig);
      this.brickGlowIds.set(brick, glowId);
    }

    // Initialize breakout state
    this.breakoutState = createInitialState(brickDescriptors.length);

    // Create paddle (dynamic, immovable, no gravity)
    this.paddle = this.add.rectangle(
      BREAKOUT.GAME_WIDTH / 2,
      BREAKOUT.PADDLE_Y,
      BREAKOUT.PADDLE_WIDTH,
      BREAKOUT.PADDLE_HEIGHT,
      0xffffff,
    ) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    this.physics.add.existing(this.paddle, false);
    this.paddle.body.setImmovable(true);
    this.paddle.body.setAllowGravity(false);

    // Create ball (dynamic, no gravity, bounce 1, circle body)
    this.ball = this.add.circle(
      BREAKOUT.GAME_WIDTH / 2,
      BREAKOUT.PADDLE_Y - BREAKOUT.BALL_RADIUS - BREAKOUT.PADDLE_HEIGHT / 2 - 2,
      BREAKOUT.BALL_RADIUS,
      0xffffff,
    ) as Phaser.GameObjects.Arc & { body: Phaser.Physics.Arcade.Body };
    this.physics.add.existing(this.ball, false);
    this.ball.body.setAllowGravity(false);
    this.ball.body.setBounce(1, 1);
    this.ball.body.setCircle(BREAKOUT.BALL_RADIUS);
    this.ball.body.setCollideWorldBounds(false);
    this.ball.body.setMaxSpeed(BREAKOUT.MAX_SPEED);

    // Add colliders
    this.physics.add.collider(this.ball, this.topWall, this.onWallHit, undefined, this);
    this.physics.add.collider(this.ball, this.leftWall, this.onWallHit, undefined, this);
    this.physics.add.collider(this.ball, this.rightWall, this.onWallHit, undefined, this);
    this.physics.add.collider(this.ball, this.paddle, this.onPaddleHit, undefined, this);
    this.physics.add.collider(this.ball, this.bricks, this.onBrickHit, undefined, this);

    // Register keyboard input via window listeners
    this.boundKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.keyState.left = true;
        e.preventDefault();
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.keyState.right = true;
        e.preventDefault();
      }
      // Release sticky ball on any key press
      if (this.ballStuck) {
        this.releaseStickyBall();
      }
    };
    this.boundKeyUp = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.keyState.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.keyState.right = false;
      }
    };
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);

    // Subscribe to EventBridge events
    eventBridge.on('match:pause', this.handlePause);
    eventBridge.on('scene:restart', this.handleRestart);

    // Register shutdown cleanup
    this.events.on('shutdown', this.shutdown, this);

    // Add glow to paddle and ball
    this.paddleGlowId = this.neonGlow.addRectGlow(
      this.paddle.x, this.paddle.y,
      BREAKOUT.PADDLE_WIDTH, BREAKOUT.PADDLE_HEIGHT,
      GLOW_PRESETS.paddle,
    );
    this.ballGlowId = this.neonGlow.addCircleGlow(
      this.ball.x, this.ball.y,
      BREAKOUT.BALL_RADIUS,
      GLOW_PRESETS.ball,
    );

    // Initialize neon particle system
    this.neonParticles = new NeonParticles(this);
    this.neonParticles.generateParticleTexture();
    this.neonParticles.createEmitters();

    // Initialize powerup system if enabled
    if (this.powerupsEnabled) {
      this.powerupManager = new PowerupManager(this, 'breakout', {
        getBall: () => this.ball,
        getPaddle: (_player: PlayerId) => this.paddle,
        setPiercing: (piercing: boolean) => {
          this.piercing = piercing;
        },
        setSticky: (sticky: boolean) => {
          this.sticky = sticky;
          // If sticky is turned off while ball is stuck, release it
          if (!sticky && this.ballStuck) {
            this.releaseStickyBall();
          }
        },
        addExtraLife: () => {
          this.breakoutState = {
            ...this.breakoutState,
            lives: this.breakoutState.lives + 1,
          };
          eventBridge.emit('lives:update', { remaining: this.breakoutState.lives });
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

      // Add overlap between paddle and powerup sprites
      this.physics.add.overlap(
        this.paddle,
        this.powerupManager.spriteGroup,
        this.onPowerupCollect,
        undefined,
        this,
      );
    }

    // Emit initial state
    eventBridge.emit('lives:update', { remaining: this.breakoutState.lives });
    eventBridge.emit('score:update', { left: 0, right: 0 });

    // Schedule first serve after delay
    this.time.delayedCall(BREAKOUT.SERVE_DELAY_MS, () => {
      if (!this.matchOver && !this.paused) {
        this.serve();
      }
    });
  }

  update(): void {
    // Skip processing if match is over or paused
    if (this.matchOver || this.paused) return;

    // Paddle movement
    if (this.keyState.left) {
      this.paddle.body.setVelocityX(-BREAKOUT.PADDLE_SPEED);
    } else if (this.keyState.right) {
      this.paddle.body.setVelocityX(BREAKOUT.PADDLE_SPEED);
    } else {
      this.paddle.body.setVelocityX(0);
    }

    // Clamp paddle X within walls
    const minPaddleX = BREAKOUT.WALL_THICKNESS + this.paddle.width / 2;
    const maxPaddleX = BREAKOUT.GAME_WIDTH - BREAKOUT.WALL_THICKNESS - this.paddle.width / 2;

    if (this.paddle.x < minPaddleX) {
      this.paddle.x = minPaddleX;
      this.paddle.body.setVelocityX(0);
    } else if (this.paddle.x > maxPaddleX) {
      this.paddle.x = maxPaddleX;
      this.paddle.body.setVelocityX(0);
    }

    // Sticky ball: follow paddle
    if (this.ballStuck) {
      this.ball.setPosition(
        this.paddle.x + this.ballStuckOffsetX,
        BREAKOUT.PADDLE_Y - BREAKOUT.BALL_RADIUS - BREAKOUT.PADDLE_HEIGHT / 2 - 2,
      );
    }

    // Ball exit detection — bottom edge
    if (this.ball.y > BREAKOUT.GAME_HEIGHT) {
      this.onBallExitBottom();
    }

    // Update glow positions for moving objects
    if (this.neonGlow) {
      this.neonGlow.updatePosition(this.paddleGlowId, this.paddle.x, this.paddle.y);
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
    this.brickGlowIds.clear();
  };

  private handleRestart = (): void => {
    // Destroy powerup manager before restart
    if (this.powerupManager) {
      this.powerupManager.destroy();
      this.powerupManager = null;
    }
    this.time.removeAllEvents();
    this.scene.restart();
  };

  private handlePause = (payload: { paused: boolean }): void => {
    this.paused = payload.paused;
    if (payload.paused) {
      // Save ball velocity and stop it
      if (this.ball?.body) {
        this._pausedVelocity = { x: this.ball.body.velocity.x, y: this.ball.body.velocity.y };
        this.ball.body.setVelocity(0, 0);
      }
      // Stop paddle velocity
      if (this.paddle?.body) this.paddle.body.setVelocityX(0);
      this.powerupManager?.pause();
      eventBridge.emit('audio:pause');
    } else {
      // Restore ball velocity
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

  private serve(): void {
    // Position ball on top of paddle
    this.ball.setPosition(
      this.paddle.x,
      BREAKOUT.PADDLE_Y - BREAKOUT.BALL_RADIUS - BREAKOUT.PADDLE_HEIGHT / 2 - 2,
    );

    // Compute velocity: upward with random horizontal angle
    const horizontal = Phaser.Math.FloatBetween(-0.4, 0.4);
    const vertical = -1;
    const vec = new Phaser.Math.Vector2(horizontal, vertical).normalize();
    this.ball.body.setVelocity(
      vec.x * BREAKOUT.BASE_SPEED,
      vec.y * BREAKOUT.BASE_SPEED,
    );
  }

  private releaseStickyBall(): void {
    if (!this.ballStuck) return;
    this.ballStuck = false;

    // Launch ball upward with slight random angle
    const horizontal = Phaser.Math.FloatBetween(-0.3, 0.3);
    const vertical = -1;
    const vec = new Phaser.Math.Vector2(horizontal, vertical).normalize();
    this.ball.body.setVelocity(
      vec.x * this.currentSpeed,
      vec.y * this.currentSpeed,
    );
  }

  private onBallExitBottom(): void {
    // Immediately reposition ball on top of paddle
    this.ball.setPosition(
      this.paddle.x,
      BREAKOUT.PADDLE_Y - BREAKOUT.BALL_RADIUS - BREAKOUT.PADDLE_HEIGHT / 2 - 2,
    );
    this.ball.body.setVelocity(0, 0);
    this.ballStuck = false;

    // Lose life
    this.breakoutState = loseLife(this.breakoutState);

    // Update HUD
    this.livesText.setText(`Lives: ${this.breakoutState.lives}`);

    // Reset speed
    this.currentSpeed = BREAKOUT.BASE_SPEED;

    // Emit events
    eventBridge.emit('lives:update', { remaining: this.breakoutState.lives });
    eventBridge.emit('audio:life-loss');

    // Camera shake on life loss (guard: not while paused)
    if (!this.paused) {
      this.cameras.main.shake(100, 0.005);
    }

    // Check match status
    const status = getMatchStatus(this.breakoutState);
    if (status === 'loss') {
      this.triggerLoss();
    } else {
      // Schedule serve after delay
      this.time.delayedCall(BREAKOUT.SERVE_DELAY_MS, () => {
        if (!this.matchOver && !this.paused) {
          this.serve();
        }
      });
    }
  }

  private onPaddleHit = (): void => {
    // If sticky paddle is active, stick the ball
    if (this.sticky && !this.ballStuck) {
      this.ballStuck = true;
      this.ballStuckOffsetX = this.ball.x - this.paddle.x;
      this.ball.body.setVelocity(0, 0);
      return;
    }

    // Emit audio
    eventBridge.emit('audio:paddle-hit');

    // Apply angle variation based on hit offset
    const hitOffset = (this.ball.x - this.paddle.x) / (this.paddle.width / 2);
    const angle = hitOffset * (Math.PI / 3); // max ±60° from vertical

    // Optionally increase speed
    if (this.speedIncreaseEnabled) {
      this.currentSpeed = computeSpeedAfterHit(this.currentSpeed, {
        baseSpeed: BREAKOUT.BASE_SPEED,
        increment: BREAKOUT.SPEED_INCREMENT,
        maxSpeed: BREAKOUT.MAX_SPEED,
      });
    }

    const speed = this.currentSpeed;
    this.ball.body.setVelocity(
      speed * Math.sin(angle),
      -speed * Math.cos(angle), // always upward after paddle hit
    );
  };

  private onWallHit = (): void => {
    eventBridge.emit('audio:wall-bounce');
  };

  private onBrickHit = (
    _ball: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    brick: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
  ): void => {
    const brickRect = brick as Phaser.GameObjects.Rectangle;
    const brickX = brickRect.x;
    const brickY = brickRect.y;
    const brickColor = brickRect.fillColor;

    // Remove brick glow
    const glowId = this.brickGlowIds.get(brickRect);
    if (glowId && this.neonGlow) {
      this.neonGlow.removeGlow(glowId);
      this.brickGlowIds.delete(brickRect);
    }

    // Destroy the brick
    brickRect.destroy();

    // Trigger brick-break particles at brick position
    if (this.neonParticles) {
      this.neonParticles.burstBrickBreak(brickX, brickY, brickColor);
    }

    // Piercing ball: don't bounce off bricks (keep current velocity)
    if (this.piercing) {
      // Restore pre-collision velocity direction (ball should pass through)
      // Since Phaser already bounced the ball, we need to negate the bounce
      const vx = this.ball.body.velocity.x;
      const vy = this.ball.body.velocity.y;
      // The ball bounced off the brick, so we reverse the Y component to "undo" the bounce
      // This effectively makes the ball pass through
      this.ball.body.setVelocity(vx, -vy);
    }

    // Update state
    this.breakoutState = breakBrick(this.breakoutState, BREAKOUT.POINTS_PER_BRICK);

    // Update HUD
    this.scoreText.setText(`Score: ${this.breakoutState.score}`);

    // Emit events
    eventBridge.emit('score:update', { left: this.breakoutState.score, right: 0 });
    eventBridge.emit('audio:brick-break');

    // Check win condition
    const status = getMatchStatus(this.breakoutState);
    if (status === 'win') {
      this.triggerWin();
    }
  };

  private onPowerupCollect = (
    _obj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    powerupSprite: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
  ): void => {
    if (!this.powerupManager) return;

    const sprite = powerupSprite as Phaser.GameObjects.Sprite & { powerupId?: PowerupId };
    const powerupId = sprite.powerupId;
    if (!powerupId) return;

    this.powerupManager.collect(powerupId, 'solo');
  };

  private triggerWin(): void {
    this.matchOver = true;
    this.ball.body.setVelocity(0, 0);

    // Camera flash on win (guard: not while paused)
    if (!this.paused) {
      this.cameras.main.flash(250, 255, 255, 255, false, undefined, 0.6);
    }

    // Win particle celebration at screen center
    if (this.neonParticles && !this.paused) {
      this.neonParticles.burstWin(BREAKOUT.GAME_WIDTH / 2, BREAKOUT.GAME_HEIGHT / 2);
    }

    eventBridge.emit('match:win', { winner: 'solo' });
    eventBridge.emit('audio:win');
  }

  private triggerLoss(): void {
    this.matchOver = true;
    this.ball.body.setVelocity(0, 0);
    eventBridge.emit('match:loss', { finalScore: this.breakoutState.score });
    eventBridge.emit('audio:loss');
  }
}
