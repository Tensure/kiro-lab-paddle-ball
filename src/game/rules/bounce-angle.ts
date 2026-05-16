/**
 * Computes the outgoing bounce angle based on where the ball hit the paddle.
 *
 * @param hitOffset - Signed distance from paddle center, normalized.
 *   Positive = below center (Pong) or right of center (Breakout).
 *   Values outside [-1, 1] are clamped.
 * @param maxAngle - Maximum deflection angle in radians (e.g., π/3).
 * @returns Angle in radians in the range [-maxAngle, maxAngle].
 */
export function computeBounceAngle(
  hitOffset: number,
  maxAngle: number,
): number {
  if (maxAngle <= 0) {
    return 0;
  }

  const clamped = Math.max(-1, Math.min(1, hitOffset));
  return clamped * maxAngle;
}
