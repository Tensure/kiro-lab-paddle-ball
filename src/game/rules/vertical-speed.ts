export interface Velocity {
  readonly vx: number;
  readonly vy: number;
}

/**
 * Ensures the ball's vertical velocity component meets a minimum ratio
 * of total speed. If it doesn't, adjusts vy upward while preserving
 * total speed magnitude and vy sign.
 *
 * @param vx - Horizontal velocity component
 * @param vy - Vertical velocity component
 * @param minVyRatio - Minimum |vy| as fraction of total speed (0 to 1)
 * @returns Adjusted velocity preserving total speed magnitude
 */
export function ensureMinimumVerticalSpeed(
  vx: number,
  vy: number,
  minVyRatio: number,
): Velocity {
  const totalSpeed = Math.sqrt(vx * vx + vy * vy);

  // Edge case: stationary ball
  if (totalSpeed === 0) {
    return { vx: 0, vy: 0 };
  }

  // Edge case: clamp minVyRatio to 0.99 if >= 1
  const ratio = minVyRatio >= 1 ? 0.99 : minVyRatio;

  const absVy = Math.abs(vy);
  const minAbsVy = ratio * totalSpeed;

  // Already meets the minimum — return unchanged
  if (absVy >= minAbsVy) {
    return { vx, vy };
  }

  // Determine sign of vy: preserve existing sign, default to positive if vy=0
  const vySign = vy >= 0 ? 1 : -1;

  const newVy = vySign * minAbsVy;

  // Recompute vx to preserve total speed: |vx| = sqrt(totalSpeed² - newVy²)
  const vxSquared = totalSpeed * totalSpeed - newVy * newVy;
  const newAbsVx = Math.sqrt(Math.max(0, vxSquared));

  // Preserve sign of vx
  const vxSign = vx >= 0 ? 1 : -1;
  const newVx = vxSign * newAbsVx;

  return { vx: newVx, vy: newVy };
}
