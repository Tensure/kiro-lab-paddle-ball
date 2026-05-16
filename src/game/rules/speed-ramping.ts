import type { SpeedConfig } from './physics-config';

/**
 * Computes new ball speed after a paddle hit.
 * Adds the preset increment, caps at maxSpeed.
 * Returns currentSpeed unchanged if increment is 0 (Off preset).
 * If currentSpeed already exceeds maxSpeed, returns maxSpeed.
 */
export function computeSpeedAfterHit(
  currentSpeed: number,
  config: SpeedConfig,
): number {
  if (currentSpeed > config.maxSpeed) {
    return config.maxSpeed;
  }
  return Math.min(currentSpeed + config.increment, config.maxSpeed);
}

/**
 * Computes new ball speed after a brick hit in Breakout.
 * Adds both the preset increment AND the brick-hit speed bump.
 * Caps at maxSpeed.
 * If currentSpeed already exceeds maxSpeed, returns maxSpeed.
 */
export function computeBrickHitSpeed(
  currentSpeed: number,
  config: SpeedConfig,
  brickBump: number,
): number {
  if (currentSpeed > config.maxSpeed) {
    return config.maxSpeed;
  }
  return Math.min(currentSpeed + config.increment + brickBump, config.maxSpeed);
}

/**
 * Returns the serve speed (base speed) for the active preset.
 * Used when resetting speed after a point (Pong) or life loss (Breakout).
 */
export function getServeSpeed(config: SpeedConfig): number {
  return config.baseSpeed;
}
