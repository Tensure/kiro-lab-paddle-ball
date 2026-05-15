import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  POWERUP_DEFINITIONS,
  getPowerupById,
  getAllPowerups,
  EFFECT_MULTIPLIERS,
  DEFAULT_SPAWN_CONFIG,
} from './registry';
import type { PowerupId } from '../../types/powerup';

describe('registry', () => {
  it('POWERUP_DEFINITIONS has exactly 11 entries', () => {
    expect(POWERUP_DEFINITIONS).toHaveLength(11);
  });

  it('each definition has required fields with correct types', () => {
    for (const def of POWERUP_DEFINITIONS) {
      expect(typeof def.id).toBe('string');
      expect(typeof def.displayName).toBe('string');
      expect(Array.isArray(def.eligibleModes)).toBe(true);
      expect(def.duration === null || typeof def.duration === 'number').toBe(true);
      expect(typeof def.spawnWeight).toBe('number');
      expect(['beneficial', 'harmful', 'neutral']).toContain(def.effectType);
      expect(typeof def.targetsSelf).toBe('boolean');
    }
  });

  it('getPowerupById returns correct definition for each known ID', () => {
    const knownIds: PowerupId[] = [
      'ball-speed-up',
      'ball-slow-down',
      'paddle-grow',
      'paddle-shrink',
      'multi-ball',
      'ai-freeze',
      'opponent-paddle-shrink',
      'piercing-ball',
      'sticky-paddle',
      'extra-life',
      'wide-paddle',
    ];

    for (const id of knownIds) {
      const def = getPowerupById(id);
      expect(def).toBeDefined();
      expect(def!.id).toBe(id);
    }
  });

  it('getPowerupById returns undefined for unknown ID', () => {
    const result = getPowerupById('nonexistent' as PowerupId);
    expect(result).toBeUndefined();
  });

  it('EFFECT_MULTIPLIERS values match design spec', () => {
    expect(EFFECT_MULTIPLIERS.ballSpeedUp).toBe(1.3);
    expect(EFFECT_MULTIPLIERS.ballSlowDown).toBe(0.7);
    expect(EFFECT_MULTIPLIERS.paddleGrow).toBe(1.5);
    expect(EFFECT_MULTIPLIERS.paddleShrink).toBe(0.7);
    expect(EFFECT_MULTIPLIERS.opponentPaddleShrink).toBe(0.7);
    expect(EFFECT_MULTIPLIERS.widePaddle).toBe(1.5);
  });

  it('DEFAULT_SPAWN_CONFIG has correct defaults', () => {
    expect(DEFAULT_SPAWN_CONFIG.minInterval).toBe(8000);
    expect(DEFAULT_SPAWN_CONFIG.maxInterval).toBe(15000);
    expect(DEFAULT_SPAWN_CONFIG.spawnProbability).toBe(0.4);
    expect(DEFAULT_SPAWN_CONFIG.maxOnScreen).toBe(1);
    expect(DEFAULT_SPAWN_CONFIG.despawnTime).toBe(8000);
  });

  it('getAllPowerups returns same array as POWERUP_DEFINITIONS', () => {
    expect(getAllPowerups()).toBe(POWERUP_DEFINITIONS);
  });

  // Property 2: Registry lookup is total for known IDs
  describe('Property 2: Registry lookup is total for known IDs', () => {
    /** Validates: Requirements 2.5, 2.2 */
    const allIds: PowerupId[] = POWERUP_DEFINITIONS.map((d) => d.id);

    it('getPowerupById returns a definition with matching id for any known PowerupId', () => {
      fc.assert(
        fc.property(fc.constantFrom(...allIds), (id) => {
          const def = getPowerupById(id);
          expect(def).toBeDefined();
          expect(def!.id).toBe(id);
        }),
        { numRuns: 100 },
      );
    });
  });
});
