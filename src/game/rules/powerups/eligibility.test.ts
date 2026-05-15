import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getEligiblePowerups, isPowerupEligible } from './eligibility';
import type { GameMode } from '../../types/modes';
import type { PowerupId } from '../../types/powerup';

describe('eligibility', () => {
  it('pong-solo returns 7 eligible powerups', () => {
    const eligible = getEligiblePowerups('pong-solo');
    expect(eligible).toHaveLength(7);
  });

  it('pong-versus returns 6 eligible powerups', () => {
    const eligible = getEligiblePowerups('pong-versus');
    expect(eligible).toHaveLength(6);
  });

  it('breakout returns 9 eligible powerups', () => {
    const eligible = getEligiblePowerups('breakout');
    expect(eligible).toHaveLength(9);
  });

  it('AI Freeze is NOT eligible for pong-versus or breakout', () => {
    expect(isPowerupEligible('ai-freeze', 'pong-versus')).toBe(false);
    expect(isPowerupEligible('ai-freeze', 'breakout')).toBe(false);
  });

  it('Piercing Ball is NOT eligible for pong-solo or pong-versus', () => {
    expect(isPowerupEligible('piercing-ball', 'pong-solo')).toBe(false);
    expect(isPowerupEligible('piercing-ball', 'pong-versus')).toBe(false);
  });

  it('isPowerupEligible returns correct boolean for each combination', () => {
    expect(isPowerupEligible('ai-freeze', 'pong-solo')).toBe(true);
    expect(isPowerupEligible('opponent-paddle-shrink', 'pong-solo')).toBe(true);
    expect(isPowerupEligible('opponent-paddle-shrink', 'pong-versus')).toBe(true);
    expect(isPowerupEligible('opponent-paddle-shrink', 'breakout')).toBe(false);
    expect(isPowerupEligible('piercing-ball', 'breakout')).toBe(true);
    expect(isPowerupEligible('sticky-paddle', 'breakout')).toBe(true);
    expect(isPowerupEligible('extra-life', 'breakout')).toBe(true);
    expect(isPowerupEligible('wide-paddle', 'breakout')).toBe(true);
  });

  // Property 1: Eligibility filter returns only mode-valid powerups
  describe('Property 1: Eligibility filter returns only mode-valid powerups', () => {
    /** Validates: Requirements 3.5, 3.1 */
    const modes: GameMode[] = ['pong-solo', 'pong-versus', 'breakout'];

    it('every returned PowerupDefinition has eligibleModes containing that mode', () => {
      fc.assert(
        fc.property(fc.constantFrom(...modes), (mode) => {
          const eligible = getEligiblePowerups(mode);
          for (const def of eligible) {
            expect(def.eligibleModes).toContain(mode);
          }
        }),
        { numRuns: 100 },
      );
    });
  });

  // Property 7: Eligible powerup count per mode
  describe('Property 7: Eligible powerup count per mode', () => {
    /** Validates: Requirements 3.2, 3.3, 3.4 */
    const expectedCounts: Record<GameMode, number> = {
      'pong-solo': 7,
      'pong-versus': 6,
      breakout: 9,
    };

    it('each mode returns the expected count of eligible powerups', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<GameMode>('pong-solo', 'pong-versus', 'breakout'),
          (mode) => {
            const eligible = getEligiblePowerups(mode);
            expect(eligible).toHaveLength(expectedCounts[mode]);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
