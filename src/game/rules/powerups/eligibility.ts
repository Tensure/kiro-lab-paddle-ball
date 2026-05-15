import type { GameMode } from '../../types/modes';
import type { PowerupDefinition, PowerupId } from '../../types/powerup';
import { POWERUP_DEFINITIONS } from './registry';

/** Filter powerups to those eligible for the given mode */
export function getEligiblePowerups(mode: GameMode): readonly PowerupDefinition[] {
  return POWERUP_DEFINITIONS.filter((def) => def.eligibleModes.includes(mode));
}

/** Check if a specific powerup is eligible for a mode */
export function isPowerupEligible(powerupId: PowerupId, mode: GameMode): boolean {
  const def = POWERUP_DEFINITIONS.find((d) => d.id === powerupId);
  if (!def) return false;
  return def.eligibleModes.includes(mode);
}
