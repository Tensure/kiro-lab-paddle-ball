import { describe, it } from 'vitest';
import fc from 'fast-check';
import { awardPoint, type ExitEdge } from './scoring';
import { validateWinScore } from './win-score';
import { generateBrickGrid } from './brick-grid';
import { loseLife, breakBrick } from './life-rules';
import { validateSettings } from './settings-validator';

/**
 * Feature: shared-types-and-rules, Property 10: Rule functions do not mutate inputs
 *
 * For random inputs to all rule functions, deep-equal check before/after call
 *
 * **Validates: Requirements 7.5, 8.7, 9.7, 10.6, 11.5, 11.7**
 */
describe('no-mutation', () => {
  it('property 10: awardPoint does not mutate input scores', () => {
    const scoresArb = fc.record({
      left: fc.nat({ max: 100 }),
      right: fc.nat({ max: 100 }),
    });
    const exitEdgeArb = fc.constantFrom<ExitEdge>('left', 'right');

    fc.assert(
      fc.property(scoresArb, exitEdgeArb, (scores, exitEdge) => {
        const before = JSON.parse(JSON.stringify(scores));
        awardPoint(scores, exitEdge);
        return JSON.stringify(scores) === JSON.stringify(before);
      }),
      { numRuns: 100 },
    );
  });

  it('property 10: validateWinScore does not mutate (primitive input — always safe)', () => {
    fc.assert(
      fc.property(fc.double(), (value) => {
        const before = value;
        validateWinScore(value);
        return value === before || (Number.isNaN(value) && Number.isNaN(before));
      }),
      { numRuns: 100 },
    );
  });

  it('property 10: generateBrickGrid does not mutate input config', () => {
    const configArb = fc.record({
      rows: fc.integer({ min: 0, max: 10 }),
      columns: fc.integer({ min: 0, max: 10 }),
      playAreaWidth: fc.integer({ min: 100, max: 1000 }),
      playAreaHeight: fc.integer({ min: 100, max: 1000 }),
      topOffset: fc.integer({ min: 0, max: 100 }),
      padding: fc.integer({ min: 1, max: 10 }),
    });

    fc.assert(
      fc.property(configArb, (config) => {
        const before = JSON.parse(JSON.stringify(config));
        generateBrickGrid(config);
        return JSON.stringify(config) === JSON.stringify(before);
      }),
      { numRuns: 100 },
    );
  });

  it('property 10: loseLife does not mutate input state', () => {
    const stateArb = fc.record({
      lives: fc.nat({ max: 10 }),
      bricksRemaining: fc.nat({ max: 100 }),
      score: fc.nat({ max: 10000 }),
    });

    fc.assert(
      fc.property(stateArb, (state) => {
        const before = JSON.parse(JSON.stringify(state));
        loseLife(state);
        return JSON.stringify(state) === JSON.stringify(before);
      }),
      { numRuns: 100 },
    );
  });

  it('property 10: breakBrick does not mutate input state', () => {
    const stateArb = fc.record({
      lives: fc.nat({ max: 10 }),
      bricksRemaining: fc.nat({ max: 100 }),
      score: fc.nat({ max: 10000 }),
    });
    const pointsArb = fc.nat({ max: 500 });

    fc.assert(
      fc.property(stateArb, pointsArb, (state, points) => {
        const before = JSON.parse(JSON.stringify(state));
        breakBrick(state, points);
        return JSON.stringify(state) === JSON.stringify(before);
      }),
      { numRuns: 100 },
    );
  });

  it('property 10: validateSettings does not mutate input object', () => {
    const modeArb = fc.constantFrom('pong-solo', 'pong-versus', 'breakout');
    const difficultyArb = fc.constantFrom('easy', 'normal', 'hard');
    const winScoreArb = fc.double({ noNaN: true });

    fc.assert(
      fc.property(modeArb, winScoreArb, difficultyArb, (mode, winScore, difficulty) => {
        const input: Record<string, unknown> = {
          mode,
          winScore,
          aiDifficulty: difficulty,
          powerupsEnabled: false,
        };
        const before = JSON.parse(JSON.stringify(input));
        validateSettings(input);
        return JSON.stringify(input) === JSON.stringify(before);
      }),
      { numRuns: 100 },
    );
  });
});
