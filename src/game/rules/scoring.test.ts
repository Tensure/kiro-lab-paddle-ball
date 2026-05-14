import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { awardPoint, type PongScores, type ExitEdge } from './scoring';

describe('scoring', () => {
  describe('unit tests', () => {
    it('ball exits left → right player scores', () => {
      const result = awardPoint({ left: 0, right: 0 }, 'left');
      expect(result.scores.right).toBe(1);
      expect(result.scores.left).toBe(0);
    });

    it('ball exits right → left player scores', () => {
      const result = awardPoint({ left: 0, right: 0 }, 'right');
      expect(result.scores.left).toBe(1);
      expect(result.scores.right).toBe(0);
    });

    it('serve direction goes toward losing player (nextServeDirection === exitEdge)', () => {
      const resultLeft = awardPoint({ left: 2, right: 3 }, 'left');
      expect(resultLeft.nextServeDirection).toBe('left');

      const resultRight = awardPoint({ left: 2, right: 3 }, 'right');
      expect(resultRight.nextServeDirection).toBe('right');
    });

    it('starting from {left: 0, right: 0} scores correctly', () => {
      const r1 = awardPoint({ left: 0, right: 0 }, 'left');
      expect(r1.scores).toEqual({ left: 0, right: 1 });

      const r2 = awardPoint({ left: 0, right: 0 }, 'right');
      expect(r2.scores).toEqual({ left: 1, right: 0 });
    });
  });

  describe('property tests', () => {
    /**
     * Feature: shared-types-and-rules, Property 1: Score sum equals total points played
     *
     * For random sequences of ExitEdge, applying awardPoint repeatedly from {0,0}
     * → left + right === sequence.length
     *
     * **Validates: Requirements 7.6, 7.3**
     */
    it('property 1: score sum equals total points played', () => {
      const exitEdgeArb = fc.constantFrom<ExitEdge>('left', 'right');

      fc.assert(
        fc.property(
          fc.array(exitEdgeArb, { minLength: 0, maxLength: 50 }),
          (sequence) => {
            let scores: PongScores = { left: 0, right: 0 };
            for (const edge of sequence) {
              const result = awardPoint(scores, edge);
              scores = result.scores;
            }
            return scores.left + scores.right === sequence.length;
          },
        ),
        { numRuns: 100 },
      );
    });

    /**
     * Feature: shared-types-and-rules, Property 2: Serve direction toward losing player
     *
     * For any PongScores and ExitEdge, nextServeDirection === exitEdge
     *
     * **Validates: Requirements 7.4**
     */
    it('property 2: serve direction toward losing player', () => {
      const scoresArb = fc.record({
        left: fc.nat({ max: 100 }),
        right: fc.nat({ max: 100 }),
      });
      const exitEdgeArb = fc.constantFrom<ExitEdge>('left', 'right');

      fc.assert(
        fc.property(scoresArb, exitEdgeArb, (scores, exitEdge) => {
          const result = awardPoint(scores, exitEdge);
          return result.nextServeDirection === exitEdge;
        }),
        { numRuns: 100 },
      );
    });
  });
});
