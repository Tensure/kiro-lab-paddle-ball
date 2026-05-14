import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateWinScore } from './win-score';

describe('win-score', () => {
  describe('unit tests', () => {
    it('returns default value (7) for undefined', () => {
      expect(validateWinScore(undefined)).toBe(7);
    });

    it('returns default value (7) for null', () => {
      expect(validateWinScore(null)).toBe(7);
    });

    it('returns default value (7) for NaN', () => {
      expect(validateWinScore(NaN)).toBe(7);
    });

    it('clamps below 3 → returns 3', () => {
      expect(validateWinScore(1)).toBe(3);
      expect(validateWinScore(2)).toBe(3);
      expect(validateWinScore(0)).toBe(3);
      expect(validateWinScore(-10)).toBe(3);
    });

    it('clamps above 21 → returns 21', () => {
      expect(validateWinScore(22)).toBe(21);
      expect(validateWinScore(100)).toBe(21);
    });

    it('rounds non-integers: 5.4 → 5, 5.6 → 6', () => {
      expect(validateWinScore(5.4)).toBe(5);
      expect(validateWinScore(5.6)).toBe(6);
    });

    it('boundary values: 3 → 3, 21 → 21', () => {
      expect(validateWinScore(3)).toBe(3);
      expect(validateWinScore(21)).toBe(21);
    });

    it('Infinity → 21, -Infinity → 3', () => {
      expect(validateWinScore(Infinity)).toBe(21);
      expect(validateWinScore(-Infinity)).toBe(3);
    });
  });

  describe('property tests', () => {
    /**
     * Feature: shared-types-and-rules, Property 3: Win-score validation always produces valid range
     *
     * For any numeric input (fc.double()), validateWinScore returns integer in [3, 21]
     *
     * **Validates: Requirements 8.6, 8.1, 8.2, 8.3, 8.5**
     */
    it('property 3: validateWinScore always returns integer in [3, 21]', () => {
      fc.assert(
        fc.property(fc.double(), (value) => {
          const result = validateWinScore(value);
          return (
            Number.isInteger(result) &&
            result >= 3 &&
            result <= 21
          );
        }),
        { numRuns: 100 },
      );
    });
  });
});
