import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getEligiblePowerups } from './eligibility';
import { applyStackingPolicy } from './stacking';
import { resolveTarget } from './targeting';
import { POWERUP_DEFINITIONS } from './registry';
import type { ActiveEffect, PowerupId } from '../../types/powerup';
import type { PlayerId, GameMode } from '../../types/modes';

describe('Property 8: Pure rule functions do not mutate inputs', () => {
  /** Validates: Requirements 2.4 */
  const powerupIds: PowerupId[] = POWERUP_DEFINITIONS.map((d) => d.id);
  const playerIds: PlayerId[] = ['left', 'right', 'solo'];
  const modes: GameMode[] = ['pong-solo', 'pong-versus', 'breakout'];

  it('getEligiblePowerups does not mutate POWERUP_DEFINITIONS', () => {
    fc.assert(
      fc.property(fc.constantFrom(...modes), (mode) => {
        const before = JSON.parse(JSON.stringify(POWERUP_DEFINITIONS));
        getEligiblePowerups(mode);
        expect(POWERUP_DEFINITIONS).toEqual(before);
      }),
      { numRuns: 100 },
    );
  });

  it('applyStackingPolicy does not mutate the input activeEffects array', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...powerupIds),
        fc.constantFrom(...playerIds),
        fc.integer({ min: 1000, max: 20000 }),
        fc.integer({ min: 0, max: 50000 }),
        (powerupId, target, duration, timestamp) => {
          const existing: ActiveEffect[] = [
            { powerupId: 'ball-speed-up', targetPlayer: 'left', remainingMs: 5000, appliedAt: 100 },
            { powerupId: 'paddle-grow', targetPlayer: 'right', remainingMs: 3000, appliedAt: 200 },
          ];
          const before = JSON.parse(JSON.stringify(existing));
          applyStackingPolicy(existing, powerupId, target, duration, timestamp);
          expect(existing).toEqual(before);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('resolveTarget does not mutate the input definition', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...POWERUP_DEFINITIONS),
        fc.constantFrom(...playerIds),
        fc.constantFrom(...modes),
        (def, collector, mode) => {
          const before = JSON.parse(JSON.stringify(def));
          resolveTarget(def, collector, mode);
          expect(def).toEqual(before);
        },
      ),
      { numRuns: 100 },
    );
  });
});
