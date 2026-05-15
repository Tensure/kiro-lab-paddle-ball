export interface BallSpeedConfig {
  readonly baseSpeed: number;
  readonly increment: number;
  readonly maxSpeed: number;
}

/**
 * Computes the new ball speed after a paddle hit.
 * Adds increment, caps at maxSpeed.
 */
export function computeSpeedAfterHit(
  currentSpeed: number,
  config: BallSpeedConfig,
): number {
  return Math.min(currentSpeed + config.increment, config.maxSpeed);
}

/**
 * Returns the base speed (used after scoring a point).
 */
export function getServeSpeed(config: BallSpeedConfig): number {
  return config.baseSpeed;
}
