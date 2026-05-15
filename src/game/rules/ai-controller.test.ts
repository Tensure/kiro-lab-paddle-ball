import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  AI_DIFFICULTY_CONFIGS,
  computeAITarget,
  shouldUpdateTarget,
  computeAIPaddleVelocity,
  type AIDifficultyConfig,
  type BallState,
  type PlayAreaBounds,
} from './ai-controller';

describe('ai-controller', () => {
  const bounds: PlayAreaBounds = { minY: 16, maxY: 584 };
  const centerY = (bounds.minY + bounds.maxY) / 2; // 300

  describe('unit tests', () => {
    describe('AI_DIFFICULTY_CONFIGS', () => {
      it('has entries for all three presets with valid numeric values', () => {
        for (const preset of ['easy', 'normal', 'hard'] as const) {
          const config = AI_DIFFICULTY_CONFIGS[preset];
          expect(config.maxPaddleSpeed).toBeGreaterThan(0);
          expect(config.reactionDelayMs).toBeGreaterThan(0);
          expect(config.predictionError).toBeGreaterThan(0);
        }
      });

      it('maxPaddleSpeed increases from easy to hard', () => {
        expect(AI_DIFFICULTY_CONFIGS.easy.maxPaddleSpeed)
          .toBeLessThan(AI_DIFFICULTY_CONFIGS.normal.maxPaddleSpeed);
        expect(AI_DIFFICULTY_CONFIGS.normal.maxPaddleSpeed)
          .toBeLessThan(AI_DIFFICULTY_CONFIGS.hard.maxPaddleSpeed);
      });

      it('reactionDelayMs decreases from easy to hard', () => {
        expect(AI_DIFFICULTY_CONFIGS.easy.reactionDelayMs)
          .toBeGreaterThan(AI_DIFFICULTY_CONFIGS.normal.reactionDelayMs);
        expect(AI_DIFFICULTY_CONFIGS.normal.reactionDelayMs)
          .toBeGreaterThan(AI_DIFFICULTY_CONFIGS.hard.reactionDelayMs);
      });

      it('predictionError decreases from easy to hard', () => {
        expect(AI_DIFFICULTY_CONFIGS.easy.predictionError)
          .toBeGreaterThan(AI_DIFFICULTY_CONFIGS.normal.predictionError);
        expect(AI_DIFFICULTY_CONFIGS.normal.predictionError)
          .toBeGreaterThan(AI_DIFFICULTY_CONFIGS.hard.predictionError);
      });
    });

    describe('computeAITarget', () => {
      const config = AI_DIFFICULTY_CONFIGS.normal;
      const paddleX = 40;

      it('returns center when ball moves away (vx >= 0)', () => {
        const ball: BallState = { x: 400, y: 300, vx: 200, vy: -100 };
        const result = computeAITarget(ball, bounds, paddleX, config, 0);
        expect(result).toBe(centerY);
      });

      it('returns center when ball vx is zero', () => {
        const ball: BallState = { x: 400, y: 300, vx: 0, vy: -100 };
        const result = computeAITarget(ball, bounds, paddleX, config, 0);
        expect(result).toBe(centerY);
      });

      it('returns value within bounds when ball moves toward AI', () => {
        const ball: BallState = { x: 400, y: 200, vx: -300, vy: 50 };
        const result = computeAITarget(ball, bounds, paddleX, config, 0);
        expect(result).toBeGreaterThanOrEqual(bounds.minY);
        expect(result).toBeLessThanOrEqual(bounds.maxY);
      });

      it('handles wall bounces with steep angle', () => {
        // Ball with steep vertical velocity that would exceed bounds
        const ball: BallState = { x: 400, y: 300, vx: -200, vy: 500 };
        const result = computeAITarget(ball, bounds, paddleX, config, 0);
        expect(result).toBeGreaterThanOrEqual(bounds.minY);
        expect(result).toBeLessThanOrEqual(bounds.maxY);
      });

      it('applies prediction error with positive randomSeed', () => {
        const ball: BallState = { x: 400, y: 300, vx: -300, vy: 0 };
        const noError = computeAITarget(ball, bounds, paddleX, config, 0);
        const withError = computeAITarget(ball, bounds, paddleX, config, 1);
        // With randomSeed=1, error offset = 1 * predictionError = 40
        expect(withError).toBeGreaterThan(noError);
      });

      it('applies prediction error with negative randomSeed', () => {
        const ball: BallState = { x: 400, y: 300, vx: -300, vy: 0 };
        const noError = computeAITarget(ball, bounds, paddleX, config, 0);
        const withError = computeAITarget(ball, bounds, paddleX, config, -1);
        // With randomSeed=-1, error offset = -1 * predictionError = -40
        expect(withError).toBeLessThan(noError);
      });
    });

    describe('shouldUpdateTarget', () => {
      const config = AI_DIFFICULTY_CONFIGS.normal; // reactionDelayMs: 250

      it('returns false before delay elapses', () => {
        expect(shouldUpdateTarget(100, config)).toBe(false);
        expect(shouldUpdateTarget(249, config)).toBe(false);
      });

      it('returns true after delay elapses', () => {
        expect(shouldUpdateTarget(250, config)).toBe(true);
        expect(shouldUpdateTarget(500, config)).toBe(true);
      });
    });

    describe('computeAIPaddleVelocity', () => {
      const config = AI_DIFFICULTY_CONFIGS.normal; // maxPaddleSpeed: 280

      it('returns 0 when within dead zone', () => {
        expect(computeAIPaddleVelocity(300, 303, config)).toBe(0);
        expect(computeAIPaddleVelocity(300, 297, config)).toBe(0);
        expect(computeAIPaddleVelocity(300, 305, config)).toBe(0);
      });

      it('returns positive velocity when target is below current', () => {
        const result = computeAIPaddleVelocity(200, 400, config);
        expect(result).toBeGreaterThan(0);
      });

      it('returns negative velocity when target is above current', () => {
        const result = computeAIPaddleVelocity(400, 200, config);
        expect(result).toBeLessThan(0);
      });

      it('caps velocity at maxPaddleSpeed', () => {
        const result = computeAIPaddleVelocity(100, 500, config);
        expect(Math.abs(result)).toBe(config.maxPaddleSpeed);
      });
    });
  });

  describe('property tests', () => {
    // Arbitraries for property tests
    const configArb = fc.record({
      maxPaddleSpeed: fc.float({ min: 50, max: 1000, noNaN: true }),
      reactionDelayMs: fc.float({ min: 10, max: 2000, noNaN: true }),
      predictionError: fc.float({ min: 1, max: 200, noNaN: true }),
    }) as fc.Arbitrary<AIDifficultyConfig>;

    const boundsArb = fc
      .record({
        minY: fc.float({ min: 0, max: 100, noNaN: true }),
        span: fc.float({ min: 50, max: 1000, noNaN: true }),
      })
      .map(({ minY, span }) => ({
        minY,
        maxY: minY + span,
      })) as fc.Arbitrary<PlayAreaBounds>;

    /**
     * Feature: pong-ai, Property 1: AI target Y is always within play area bounds
     *
     * For ALL valid BallState (vx < 0), bounds, paddleX, config, and randomSeed in [-1, 1],
     * computeAITarget returns a value within [bounds.minY, bounds.maxY].
     *
     * **Validates: Requirements 2.5**
     */
    it('property 1: computeAITarget always returns value within bounds', () => {
      const ballMovingTowardAIArb = fc.record({
        x: fc.float({ min: 50, max: 800, noNaN: true }),
        y: fc.float({ min: 0, max: 600, noNaN: true }),
        vx: fc.float({ min: -1000, max: -1, noNaN: true }),
        vy: fc.float({ min: -500, max: 500, noNaN: true }),
      }) as fc.Arbitrary<BallState>;

      fc.assert(
        fc.property(
          ballMovingTowardAIArb,
          boundsArb,
          fc.float({ min: 0, max: 50, noNaN: true }), // paddleX
          configArb,
          fc.float({ min: -1, max: 1, noNaN: true }), // randomSeed
          (ball, b, paddleX, config, randomSeed) => {
            const result = computeAITarget(ball, b, paddleX, config, randomSeed);
            return result >= b.minY && result <= b.maxY;
          },
        ),
        { numRuns: 200 },
      );
    });

    /**
     * Feature: pong-ai, Property 2: AI paddle velocity never exceeds difficulty speed cap
     *
     * For ALL currentY, targetY, and config, the absolute value of
     * computeAIPaddleVelocity is always <= config.maxPaddleSpeed.
     *
     * **Validates: Requirements 4.4**
     */
    it('property 2: computeAIPaddleVelocity absolute value never exceeds maxPaddleSpeed', () => {
      fc.assert(
        fc.property(
          fc.float({ min: -1000, max: 1000, noNaN: true }), // currentY
          fc.float({ min: -1000, max: 1000, noNaN: true }), // targetY
          configArb,
          (currentY, targetY, config) => {
            const result = computeAIPaddleVelocity(currentY, targetY, config);
            return Math.abs(result) <= config.maxPaddleSpeed;
          },
        ),
        { numRuns: 200 },
      );
    });

    /**
     * Feature: pong-ai, Property 3: AI prediction error is bounded by config.predictionError
     *
     * For ALL valid inputs with randomSeed in [-1, 1], the difference between
     * computeAITarget with randomSeed and computeAITarget with randomSeed=0
     * is at most config.predictionError (accounting for clamping).
     *
     * **Validates: Requirements 6.5**
     */
    it('property 3: prediction error bounded by config.predictionError', () => {
      const ballMovingTowardAIArb = fc.record({
        x: fc.float({ min: 100, max: 800, noNaN: true }),
        y: fc.float({ min: 50, max: 550, noNaN: true }),
        vx: fc.float({ min: -1000, max: -1, noNaN: true }),
        vy: fc.float({ min: -300, max: 300, noNaN: true }),
      }) as fc.Arbitrary<BallState>;

      fc.assert(
        fc.property(
          ballMovingTowardAIArb,
          boundsArb,
          fc.float({ min: 0, max: 50, noNaN: true }), // paddleX
          configArb,
          fc.float({ min: -1, max: 1, noNaN: true }), // randomSeed
          (ball, b, paddleX, config, randomSeed) => {
            const withSeed = computeAITarget(ball, b, paddleX, config, randomSeed);
            const noSeed = computeAITarget(ball, b, paddleX, config, 0);
            const diff = Math.abs(withSeed - noSeed);
            // The difference should be at most predictionError
            // (may be less due to clamping at bounds)
            return diff <= config.predictionError + 0.001; // small epsilon for float precision
          },
        ),
        { numRuns: 200 },
      );
    });

    /**
     * Feature: pong-ai, Property 4: shouldUpdateTarget is monotonically true once delay elapses
     *
     * For ALL elapsed >= config.reactionDelayMs, shouldUpdateTarget returns true.
     * Adding any positive delta to elapsed also returns true.
     *
     * **Validates: Requirements 3.2, 3.3**
     */
    it('property 4: shouldUpdateTarget is monotonically true once delay elapses', () => {
      fc.assert(
        fc.property(
          configArb,
          fc.float({ min: 0, max: 5000, noNaN: true }), // extra time beyond delay
          fc.float({ min: 0, max: 5000, noNaN: true }), // positive delta
          (config, extra, delta) => {
            const elapsed = config.reactionDelayMs + extra;
            const result1 = shouldUpdateTarget(elapsed, config);
            const result2 = shouldUpdateTarget(elapsed + delta, config);
            return result1 === true && result2 === true;
          },
        ),
        { numRuns: 200 },
      );
    });
  });
});
