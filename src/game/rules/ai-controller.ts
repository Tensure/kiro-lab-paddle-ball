import type { AIDifficultyPreset } from '../types/modes';

export interface AIDifficultyConfig {
  /** Maximum paddle speed in pixels/second */
  readonly maxPaddleSpeed: number;
  /** Minimum time between target recalculations in milliseconds */
  readonly reactionDelayMs: number;
  /** Maximum random offset applied to predicted intercept in pixels */
  readonly predictionError: number;
}

export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
}

export interface PlayAreaBounds {
  readonly minY: number;
  readonly maxY: number;
}

export const AI_DIFFICULTY_CONFIGS: Record<AIDifficultyPreset, AIDifficultyConfig> = {
  easy: { maxPaddleSpeed: 180, reactionDelayMs: 500, predictionError: 80 },
  normal: { maxPaddleSpeed: 280, reactionDelayMs: 250, predictionError: 40 },
  hard: { maxPaddleSpeed: 370, reactionDelayMs: 100, predictionError: 15 },
};

/**
 * Reflects a Y value within bounds using fold algorithm.
 * Handles any number of wall bounces.
 */
function reflectY(y: number, minY: number, maxY: number): number {
  const range = maxY - minY;
  if (range <= 0) return minY;
  let normalized = y - minY;
  const periods = Math.floor(Math.abs(normalized) / range);
  normalized = Math.abs(normalized) - periods * range;
  if (periods % 2 !== 0) {
    normalized = range - normalized;
  }
  return minY + normalized;
}

/**
 * Computes AI target Y position.
 * - Ball moving toward AI (vx < 0): predict intercept with wall bounces + error
 * - Ball moving away (vx >= 0): return center of play area
 */
export function computeAITarget(
  ball: BallState,
  bounds: PlayAreaBounds,
  paddleX: number,
  config: AIDifficultyConfig,
  randomSeed: number,
): number {
  const centerY = (bounds.minY + bounds.maxY) / 2;

  if (ball.vx >= 0) {
    return centerY;
  }

  // Time for ball to reach paddle X column
  const t = (paddleX - ball.x) / ball.vx;
  if (t <= 0) return centerY;

  // Raw predicted Y (may be outside bounds due to bounces)
  const rawY = ball.y + ball.vy * t;

  // Reflect within bounds (handles wall bounces)
  const predictedY = reflectY(rawY, bounds.minY, bounds.maxY);

  // Apply prediction error
  const errorOffset = randomSeed * config.predictionError;
  const targetY = predictedY + errorOffset;

  // Clamp to bounds
  return Math.max(bounds.minY, Math.min(bounds.maxY, targetY));
}

/**
 * Determines whether the AI should recalculate its target.
 * Returns true when enough time has elapsed since the last update.
 */
export function shouldUpdateTarget(
  elapsedSinceLastUpdate: number,
  config: AIDifficultyConfig,
): boolean {
  return elapsedSinceLastUpdate >= config.reactionDelayMs;
}

const DEFAULT_DEAD_ZONE = 5;

/**
 * Computes the AI paddle's vertical velocity toward its target.
 * Velocity magnitude is capped at maxPaddleSpeed.
 * Returns 0 when within a dead zone threshold of the target.
 */
export function computeAIPaddleVelocity(
  currentY: number,
  targetY: number,
  config: AIDifficultyConfig,
  deadZone: number = DEFAULT_DEAD_ZONE,
): number {
  const diff = targetY - currentY;

  if (Math.abs(diff) <= deadZone) {
    return 0;
  }

  const direction = diff > 0 ? 1 : -1;
  return direction * config.maxPaddleSpeed;
}
