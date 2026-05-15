import type { ActiveEffect, PowerupId } from '../../types/powerup';
import type { PlayerId } from '../../types/modes';

/** Result of applying stacking policy */
export interface StackingResult {
  readonly action: 'apply-new' | 'refresh-duration';
  readonly effects: readonly ActiveEffect[];
}

/**
 * Applies stacking policy: if the same powerup is already active on the same target,
 * refresh duration. Otherwise, add as new effect.
 */
export function applyStackingPolicy(
  activeEffects: readonly ActiveEffect[],
  powerupId: PowerupId,
  targetPlayer: PlayerId,
  duration: number | null,
  timestamp: number,
): StackingResult {
  const existingIndex = activeEffects.findIndex(
    (e) => e.powerupId === powerupId && e.targetPlayer === targetPlayer,
  );

  if (existingIndex >= 0) {
    // Refresh duration — replace the existing entry with reset timer
    const refreshed: readonly ActiveEffect[] = activeEffects.map((e, i) =>
      i === existingIndex
        ? { ...e, remainingMs: duration, appliedAt: timestamp }
        : e,
    );
    return { action: 'refresh-duration', effects: refreshed };
  }

  // Add new effect
  const newEffect: ActiveEffect = {
    powerupId,
    targetPlayer,
    remainingMs: duration,
    appliedAt: timestamp,
  };
  return { action: 'apply-new', effects: [...activeEffects, newEffect] };
}
