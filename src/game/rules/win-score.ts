export const WIN_SCORE_MIN = 3;
export const WIN_SCORE_MAX = 21;
export const WIN_SCORE_DEFAULT = 7;

/**
 * Validates and clamps a win score value to the allowed range [3, 21].
 * - Returns default (7) for undefined/null/NaN.
 * - Rounds non-integers to nearest integer.
 * - Clamps below 3 to 3, above 21 to 21.
 */
export function validateWinScore(value?: number | null): number {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return WIN_SCORE_DEFAULT;
  }

  const rounded = Math.round(value);
  return Math.max(WIN_SCORE_MIN, Math.min(WIN_SCORE_MAX, rounded));
}
