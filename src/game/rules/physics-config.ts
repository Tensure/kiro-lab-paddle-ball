import type { BallSpeedPreset, SpeedIncreasePreset, PaddleSizePreset } from '../types/settings';

/** Speed configuration for a given combination of presets */
export interface SpeedConfig {
  readonly baseSpeed: number;
  readonly maxSpeed: number;
  readonly increment: number;
}

/** All physics constants */
export const PHYSICS = {
  /** Base speeds by ball speed preset (px/s) */
  BASE_SPEED: { slow: 220, normal: 300, fast: 400 } as const,

  /** Max speeds by ball speed preset (px/s) */
  MAX_SPEED: { slow: 400, normal: 550, fast: 700 } as const,

  /** Speed increments by speed increase preset (px/s per hit) */
  SPEED_INCREMENT: { off: 0, gentle: 20, aggressive: 45 } as const,

  /** Paddle heights by paddle size preset (px) */
  PADDLE_HEIGHT: { small: 60, normal: 100, large: 140 } as const,

  /** Maximum bounce angle from paddle edge (radians, ~60°) */
  MAX_BOUNCE_ANGLE: Math.PI / 3,

  /** Minimum vertical speed as fraction of total speed */
  MIN_VERTICAL_SPEED_RATIO: 0.15,

  /** Additional speed bump when breaking a brick in Breakout (px/s) */
  BRICK_HIT_SPEED_BUMP: 8,

  /** Serve delay in milliseconds */
  SERVE_DELAY_MS: 750,
} as const;

/**
 * Resolves a SpeedConfig from the given presets.
 */
export function getSpeedConfig(
  ballSpeed: BallSpeedPreset,
  speedIncrease: SpeedIncreasePreset,
): SpeedConfig {
  return {
    baseSpeed: PHYSICS.BASE_SPEED[ballSpeed],
    maxSpeed: PHYSICS.MAX_SPEED[ballSpeed],
    increment: PHYSICS.SPEED_INCREMENT[speedIncrease],
  };
}

// Re-export preset types for convenience
export type { BallSpeedPreset, SpeedIncreasePreset, PaddleSizePreset };
