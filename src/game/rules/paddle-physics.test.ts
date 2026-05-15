import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  clampPaddleY,
  computePaddleY,
  type PaddleBounds,
  type PaddleConfig,
} from './paddle-physics';

describe('paddle-physics', () => {
  const bounds: PaddleBounds = { minY: 16, maxY: 584 };
  const config: PaddleConfig = { height: 100, speed: 400 };

  describe('unit tests', () => {
    it('clampPaddleY returns value within bounds for center position', () => {
      const result = clampPaddleY(300, 100, bounds);
      expect(result).toBe(300);
    });

    it('clampPaddleY clamps when paddle would extend above minY', () => {
      // minY=16, height=100 → min center = 16 + 50 = 66
      const result = clampPaddleY(30, 100, bounds);
      expect(result).toBe(66);
    });

    it('clampPaddleY clamps when paddle would extend below maxY', () => {
      // maxY=584, height=100 → max center = 584 - 50 = 534
      const result = clampPaddleY(570, 100, bounds);
      expect(result).toBe(534);
    });

    it('computePaddleY with direction 0 returns clamped current position', () => {
      const result = computePaddleY(300, 0, config, bounds, 16);
      expect(result).toBe(300);
    });

    it('computePaddleY with direction -1 moves up', () => {
      // speed=400, deltaMs=1000 → moves 400px up: 300 - 400 = -100 → clamped to 66
      const result = computePaddleY(300, -1, config, bounds, 1000);
      expect(result).toBe(66);

      // smaller delta: speed=400, deltaMs=100 → moves 40px up: 300 - 40 = 260
      const result2 = computePaddleY(300, -1, config, bounds, 100);
      expect(result2).toBe(260);
    });

    it('computePaddleY with direction +1 moves down', () => {
      // speed=400, deltaMs=100 → moves 40px down: 300 + 40 = 340
      const result = computePaddleY(300, 1, config, bounds, 100);
      expect(result).toBe(340);
    });

    it('computePaddleY clamps result to bounds', () => {
      // Large delta moving down: 300 + 400*2 = 1100 → clamped to 534
      const result = computePaddleY(300, 1, config, bounds, 2000);
      expect(result).toBe(534);

      // Large delta moving up: 300 - 400*2 = -500 → clamped to 66
      const result2 = computePaddleY(300, -1, config, bounds, 2000);
      expect(result2).toBe(66);
    });
  });

  describe('property tests', () => {
    /**
     * Feature: pong-core, Property 1: paddle Y stays within bounds for any input sequence
     *
     * For ALL input sequences (any currentY, any direction, any deltaMs >= 0,
     * any valid bounds and config), computePaddleY result is always within
     * [minY + height/2, maxY - height/2].
     *
     * **Validates: Requirements 2.3, 2.5**
     */
    it('property 1: paddle Y stays within bounds for any input sequence', () => {
      const directionArb = fc.constantFrom<-1 | 0 | 1>(-1, 0, 1);

      // Generate valid bounds where maxY > minY + height (so paddle fits)
      const boundsAndConfigArb = fc
        .record({
          minY: fc.integer({ min: 0, max: 200 }),
          span: fc.integer({ min: 50, max: 1000 }),
          height: fc.integer({ min: 10, max: 200 }),
          speed: fc.integer({ min: 1, max: 2000 }),
        })
        .filter(({ span, height }) => span > height)
        .map(({ minY, span, height, speed }) => ({
          bounds: { minY, maxY: minY + span } as PaddleBounds,
          config: { height, speed } as PaddleConfig,
        }));

      fc.assert(
        fc.property(
          boundsAndConfigArb,
          fc.float({ min: -2000, max: 2000, noNaN: true }),
          directionArb,
          fc.float({ min: 0, max: 5000, noNaN: true }),
          ({ bounds: b, config: c }, currentY, direction, deltaMs) => {
            const result = computePaddleY(currentY, direction, c, b, deltaMs);
            const minCenter = b.minY + c.height / 2;
            const maxCenter = b.maxY - c.height / 2;
            return result >= minCenter && result <= maxCenter;
          },
        ),
        { numRuns: 200 },
      );
    });
  });
});
