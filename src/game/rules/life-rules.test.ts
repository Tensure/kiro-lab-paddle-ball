import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  createInitialState,
  loseLife,
  breakBrick,
  getMatchStatus,
  type BreakoutState,
} from './life-rules';

describe('life-rules', () => {
  describe('unit tests', () => {
    it('createInitialState sets lives=3, bricksRemaining=totalBricks, score=0', () => {
      const state = createInitialState(15);
      expect(state.lives).toBe(3);
      expect(state.bricksRemaining).toBe(15);
      expect(state.score).toBe(0);
    });

    it('loseLife decrements by 1', () => {
      const state: BreakoutState = { lives: 3, bricksRemaining: 10, score: 50 };
      const result = loseLife(state);
      expect(result.lives).toBe(2);
    });

    it('loseLife at 0 stays at 0', () => {
      const state: BreakoutState = { lives: 0, bricksRemaining: 10, score: 50 };
      const result = loseLife(state);
      expect(result.lives).toBe(0);
    });

    it('breakBrick decrements bricksRemaining and adds score', () => {
      const state: BreakoutState = { lives: 3, bricksRemaining: 10, score: 50 };
      const result = breakBrick(state, 100);
      expect(result.bricksRemaining).toBe(9);
      expect(result.score).toBe(150);
    });

    it('getMatchStatus returns win when bricksRemaining=0', () => {
      const state: BreakoutState = { lives: 2, bricksRemaining: 0, score: 300 };
      expect(getMatchStatus(state)).toBe('win');
    });

    it('getMatchStatus returns loss when lives=0', () => {
      const state: BreakoutState = { lives: 0, bricksRemaining: 5, score: 100 };
      expect(getMatchStatus(state)).toBe('loss');
    });

    it('getMatchStatus returns in-progress when lives>0 and bricksRemaining>0', () => {
      const state: BreakoutState = { lives: 2, bricksRemaining: 5, score: 100 };
      expect(getMatchStatus(state)).toBe('in-progress');
    });
  });

  describe('property tests', () => {
    const breakoutStateArb = fc.record({
      lives: fc.nat({ max: 10 }),
      bricksRemaining: fc.nat({ max: 100 }),
      score: fc.nat({ max: 10000 }),
    });

    /**
     * Feature: shared-types-and-rules, Property 7: Life count never goes negative
     *
     * For any BreakoutState with lives >= 0, loseLife produces lives >= 0
     *
     * **Validates: Requirements 10.7, 10.2**
     */
    it('property 7: loseLife never produces negative lives', () => {
      fc.assert(
        fc.property(breakoutStateArb, (state) => {
          const result = loseLife(state);
          return result.lives >= 0;
        }),
        { numRuns: 100 },
      );
    });

    /**
     * Feature: shared-types-and-rules, Property 8: Match status determined by lives and bricks
     *
     * For any BreakoutState, getMatchStatus returns correct value based on lives/bricksRemaining
     *
     * **Validates: Requirements 10.3, 10.4, 10.5**
     */
    it('property 8: getMatchStatus returns correct status based on lives/bricksRemaining', () => {
      fc.assert(
        fc.property(breakoutStateArb, (state) => {
          const status = getMatchStatus(state);
          // Loss takes precedence: if lives === 0, you lose regardless of bricks
          if (state.lives === 0) {
            return status === 'loss';
          }
          if (state.bricksRemaining === 0) {
            return status === 'win';
          }
          return status === 'in-progress';
        }),
        { numRuns: 100 },
      );
    });
  });
});
