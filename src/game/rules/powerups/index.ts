export {
  POWERUP_DEFINITIONS,
  getPowerupById,
  getAllPowerups,
  EFFECT_MULTIPLIERS,
  DEFAULT_SPAWN_CONFIG,
} from './registry';

export { getEligiblePowerups, isPowerupEligible } from './eligibility';

export { applyStackingPolicy } from './stacking';
export type { StackingResult } from './stacking';

export { resolveTarget } from './targeting';
