import type {
  MatchSettings,
  BallSpeedPreset,
  PaddleSizePreset,
  SpeedIncreasePreset,
  BrickDensityPreset,
  StartingLives,
} from '../types/settings';
import { validateWinScore } from './win-score';

/** Validation result — either valid with clamped settings, or invalid with error details */
export type ValidationResult =
  | { readonly valid: true; readonly settings: MatchSettings }
  | { readonly valid: false; readonly errors: readonly string[] };

const VALID_BALL_SPEED_PRESETS: readonly BallSpeedPreset[] = ['slow', 'normal', 'fast'];
const VALID_PADDLE_SIZE_PRESETS: readonly PaddleSizePreset[] = ['small', 'normal', 'large'];
const VALID_SPEED_INCREASE_PRESETS: readonly SpeedIncreasePreset[] = ['off', 'gentle', 'aggressive'];
const VALID_BRICK_DENSITIES: readonly BrickDensityPreset[] = ['sparse', 'normal', 'dense'];
const VALID_STARTING_LIVES: readonly StartingLives[] = [1, 3, 5];

/**
 * Resolves a ball speed preset from input, defaulting to 'normal' if missing.
 * Returns the preset value or null if the provided value is invalid.
 */
function resolveBallSpeedPreset(value: unknown): BallSpeedPreset | null {
  if (value === undefined || value === null) return 'normal';
  if (typeof value === 'string' && VALID_BALL_SPEED_PRESETS.includes(value as BallSpeedPreset)) {
    return value as BallSpeedPreset;
  }
  return null;
}

/**
 * Resolves a paddle size preset from input, defaulting to 'normal' if missing.
 * Returns the preset value or null if the provided value is invalid.
 */
function resolvePaddleSizePreset(value: unknown): PaddleSizePreset | null {
  if (value === undefined || value === null) return 'normal';
  if (typeof value === 'string' && VALID_PADDLE_SIZE_PRESETS.includes(value as PaddleSizePreset)) {
    return value as PaddleSizePreset;
  }
  return null;
}

/**
 * Resolves a speed increase preset from input, defaulting to 'gentle' if missing.
 * Returns the preset value or null if the provided value is invalid.
 */
function resolveSpeedIncreasePreset(value: unknown): SpeedIncreasePreset | null {
  if (value === undefined || value === null) return 'gentle';
  if (typeof value === 'string' && VALID_SPEED_INCREASE_PRESETS.includes(value as SpeedIncreasePreset)) {
    return value as SpeedIncreasePreset;
  }
  return null;
}

/**
 * Validates and resolves the shared preset fields (ballSpeedPreset, paddleSizePreset, speedIncreasePreset).
 * Returns resolved values or pushes errors and returns null.
 */
function validateSharedPresets(
  obj: Record<string, unknown>,
  errors: string[],
): { ballSpeedPreset: BallSpeedPreset; paddleSizePreset: PaddleSizePreset; speedIncreasePreset: SpeedIncreasePreset } | null {
  const ballSpeedPreset = resolveBallSpeedPreset(obj.ballSpeedPreset);
  if (ballSpeedPreset === null) {
    errors.push(`Invalid ballSpeedPreset: must be one of ${VALID_BALL_SPEED_PRESETS.join(', ')}`);
  }

  const paddleSizePreset = resolvePaddleSizePreset(obj.paddleSizePreset);
  if (paddleSizePreset === null) {
    errors.push(`Invalid paddleSizePreset: must be one of ${VALID_PADDLE_SIZE_PRESETS.join(', ')}`);
  }

  const speedIncreasePreset = resolveSpeedIncreasePreset(obj.speedIncreasePreset);
  if (speedIncreasePreset === null) {
    errors.push(`Invalid speedIncreasePreset: must be one of ${VALID_SPEED_INCREASE_PRESETS.join(', ')}`);
  }

  if (ballSpeedPreset === null || paddleSizePreset === null || speedIncreasePreset === null) {
    return null;
  }

  return { ballSpeedPreset, paddleSizePreset, speedIncreasePreset };
}

/**
 * Validates match settings for the specified mode.
 * - Clamps winScore via validateWinScore when present.
 * - Validates preset fields against allowed values.
 * - Defaults missing preset fields for backward compatibility.
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

      const presets = validateSharedPresets(obj, errors);

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
          ballSpeedPreset: presets!.ballSpeedPreset,
          paddleSizePreset: presets!.paddleSizePreset,
          speedIncreasePreset: presets!.speedIncreasePreset,
        },
      };
    }

    case 'pong-versus': {
      const errors: string[] = [];

      if (obj.winScore === undefined || obj.winScore === null || typeof obj.winScore !== 'number') {
        errors.push('Missing required field: winScore');
      }

      const presets = validateSharedPresets(obj, errors);

      if (errors.length > 0) {
        return { valid: false, errors };
      }

      return {
        valid: true,
        settings: {
          mode: 'pong-versus',
          winScore: validateWinScore(obj.winScore as number),
          powerupsEnabled,
          ballSpeedPreset: presets!.ballSpeedPreset,
          paddleSizePreset: presets!.paddleSizePreset,
          speedIncreasePreset: presets!.speedIncreasePreset,
        },
      };
    }

    case 'breakout': {
      const errors: string[] = [];

      const presets = validateSharedPresets(obj, errors);

      // Validate startingLives — default to 3 if missing
      let startingLives: StartingLives = 3;
      if (obj.startingLives !== undefined && obj.startingLives !== null) {
        if (!VALID_STARTING_LIVES.includes(obj.startingLives as StartingLives)) {
          errors.push(`Invalid startingLives: must be one of ${VALID_STARTING_LIVES.join(', ')}`);
        } else {
          startingLives = obj.startingLives as StartingLives;
        }
      }

      // Validate brickDensity — default to 'normal' if missing
      let brickDensity: BrickDensityPreset = 'normal';
      if (obj.brickDensity !== undefined && obj.brickDensity !== null) {
        if (typeof obj.brickDensity !== 'string' || !VALID_BRICK_DENSITIES.includes(obj.brickDensity as BrickDensityPreset)) {
          errors.push(`Invalid brickDensity: must be one of ${VALID_BRICK_DENSITIES.join(', ')}`);
        } else {
          brickDensity = obj.brickDensity as BrickDensityPreset;
        }
      }

      if (errors.length > 0) {
        return { valid: false, errors };
      }

      return {
        valid: true,
        settings: {
          mode: 'breakout',
          powerupsEnabled,
          ballSpeedPreset: presets!.ballSpeedPreset,
          paddleSizePreset: presets!.paddleSizePreset,
          speedIncreasePreset: presets!.speedIncreasePreset,
          startingLives,
          brickDensity,
        },
      };
    }

    default:
      return { valid: false, errors: [`Invalid mode: ${mode}`] };
  }
}
