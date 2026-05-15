export interface PaddleBounds {
  readonly minY: number;
  readonly maxY: number;
}

export interface PaddleConfig {
  readonly height: number;
  readonly speed: number;
}

/**
 * Clamps a paddle's Y position to stay within vertical bounds.
 * The paddle's Y is its center. It must not extend beyond bounds.
 * minY and maxY represent the playable area edges.
 * The paddle center must stay within [minY + height/2, maxY - height/2].
 */
export function clampPaddleY(
  currentY: number,
  paddleHeight: number,
  bounds: PaddleBounds,
): number {
  const halfHeight = paddleHeight / 2;
  const min = bounds.minY + halfHeight;
  const max = bounds.maxY - halfHeight;
  return Math.max(min, Math.min(max, currentY));
}

/**
 * Computes the next paddle Y position given input direction and delta time.
 * Direction: -1 (up), 0 (none), +1 (down).
 * Result is clamped to bounds.
 */
export function computePaddleY(
  currentY: number,
  direction: -1 | 0 | 1,
  config: PaddleConfig,
  bounds: PaddleBounds,
  deltaMs: number,
): number {
  if (direction === 0) return clampPaddleY(currentY, config.height, bounds);
  const deltaSec = deltaMs / 1000;
  const newY = currentY + direction * config.speed * deltaSec;
  return clampPaddleY(newY, config.height, bounds);
}
