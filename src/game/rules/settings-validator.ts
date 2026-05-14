import type { MatchSettings } from '../types/settings';
import { validateWinScore } from './win-score';

/** Validation result — either valid with clamped settings, or invalid with error details */
export type ValidationResult =
  | { readonly valid: true; readonly settings: MatchSettings }
  | { readonly valid: false; readonly errors: readonly string[] };

/**
 * Validates match settings for the specified mode.
 * - Clamps winScore via validateWinScore when present.
 * - Ensures required fields exist for the given mode.
 * - Returns a new validated copy, never mutates input.
 */
export function validateSettings(input: unknown): ValidationResult {
  if (input === null || typeof input !== 'object') {
    return { valid: false, errors: ['Input must be a non-null object'] };
  }

  const obj = input as Record<string, unknown>;

  if (!('mode' in obj) || typeof obj.mode !== 'string') {
    return { valid: false, errors: ['Missing required field: mode'] };
  }

  if (typeof obj.powerupsEnabled !== 'boolean') {
    return { valid: false, errors: ['Missing required field: powerupsEnabled'] };
  }

  const mode = obj.mode;
  const powerupsEnabled = obj.powerupsEnabled as boolean;

  switch (mode) {
    case 'pong-solo': {
      const errors: string[] = [];

      if (obj.winScore === undefined || obj.winScore === null) {
        errors.push('Missing required field: winScore');
      } else if (typeof obj.winScore !== 'number') {
        errors.push('Missing required field: winScore');
      }

      if (
        obj.aiDifficulty === undefined ||
        obj.aiDifficulty === null ||
        !['easy', 'normal', 'hard'].includes(obj.aiDifficulty as string)
      ) {
        errors.push('Missing required field: aiDifficulty');
      }

      if (errors.length > 0) {
        return { valid: false, errors };
      }

      return {
        valid: true,
        settings: {
          mode: 'pong-solo',
          winScore: validateWinScore(obj.winScore as number),
          aiDifficulty: obj.aiDifficulty as 'easy' | 'normal' | 'hard',
          powerupsEnabled,
        },
      };
    }

    case 'pong-versus': {
      if (obj.winScore === undefined || obj.winScore === null || typeof obj.winScore !== 'number') {
        return { valid: false, errors: ['Missing required field: winScore'] };
      }

      return {
        valid: true,
        settings: {
          mode: 'pong-versus',
          winScore: validateWinScore(obj.winScore as number),
          powerupsEnabled,
        },
      };
    }

    case 'breakout': {
      return {
        valid: true,
        settings: {
          mode: 'breakout',
          powerupsEnabled,
        },
      };
    }

    default:
      return { valid: false, errors: [`Invalid mode: ${mode}`] };
  }
}
