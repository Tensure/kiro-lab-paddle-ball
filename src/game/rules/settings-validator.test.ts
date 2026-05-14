import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateSettings } from './settings-validator';

describe('settings-validator', () => {
  describe('unit tests', () => {
    it('valid pong-solo settings pass', () => {
      const input = {
        mode: 'pong-solo',
        winScore: 7,
        aiDifficulty: 'normal',
        powerupsEnabled: false,
      };
      const result = validateSettings(input);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.settings.mode).toBe('pong-solo');
      }
    });

    it('valid pong-versus settings pass', () => {
      const input = {
        mode: 'pong-versus',
        winScore: 11,
        powerupsEnabled: true,
      };
      const result = validateSettings(input);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.settings.mode).toBe('pong-versus');
      }
    });

    it('valid breakout settings pass', () => {
      const input = {
        mode: 'breakout',
        powerupsEnabled: false,
      };
      const result = validateSettings(input);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.settings.mode).toBe('breakout');
      }
    });

    it('missing aiDifficulty for pong-solo returns error', () => {
      const input = {
        mode: 'pong-solo',
        winScore: 7,
        powerupsEnabled: false,
      };
      const result = validateSettings(input);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toContain('Missing required field: aiDifficulty');
      }
    });

    it('missing winScore for pong-versus returns error', () => {
      const input = {
        mode: 'pong-versus',
        powerupsEnabled: false,
      };
      const result = validateSettings(input);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toContain('Missing required field: winScore');
      }
    });

    it('winScore is clamped in output', () => {
      const input = {
        mode: 'pong-versus',
        winScore: 50,
        powerupsEnabled: false,
      };
      const result = validateSettings(input);
      expect(result.valid).toBe(true);
      if (result.valid && result.settings.mode === 'pong-versus') {
        expect(result.settings.winScore).toBe(21);
      }
    });

    it('invalid mode returns error', () => {
      const input = {
        mode: 'invalid-mode',
        powerupsEnabled: false,
      };
      const result = validateSettings(input);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors[0]).toContain('Invalid mode');
      }
    });

    it('input object is not mutated', () => {
      const input = {
        mode: 'pong-solo',
        winScore: 50,
        aiDifficulty: 'hard',
        powerupsEnabled: true,
      };
      const inputCopy = JSON.parse(JSON.stringify(input));
      validateSettings(input);
      expect(input).toEqual(inputCopy);
    });
  });

  describe('property tests', () => {
    /**
     * Feature: shared-types-and-rules, Property 9: Settings validation clamps winScore to valid range
     *
     * For pong-solo/versus inputs with random numeric winScore, validated winScore is integer in [3, 21]
     *
     * **Validates: Requirements 11.4**
     */
    it('property 9: validated winScore is integer in [3, 21]', () => {
      const modeArb = fc.constantFrom('pong-solo', 'pong-versus');
      const winScoreArb = fc.double({ noNaN: true });

      fc.assert(
        fc.property(modeArb, winScoreArb, (mode, winScore) => {
          const input: Record<string, unknown> = {
            mode,
            winScore,
            powerupsEnabled: false,
          };
          if (mode === 'pong-solo') {
            input.aiDifficulty = 'normal';
          }

          const result = validateSettings(input);
          if (!result.valid) {
            // If winScore is not a finite number, validation may fail
            return true;
          }
          if (result.settings.mode === 'pong-solo' || result.settings.mode === 'pong-versus') {
            const ws = result.settings.winScore;
            return Number.isInteger(ws) && ws >= 3 && ws <= 21;
          }
          return true;
        }),
        { numRuns: 100 },
      );
    });
  });
});
