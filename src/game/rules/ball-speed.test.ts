import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  computeSpeedAfterHit,
  getServeSpeed,
  type BallSpeedConfig,
} from './ball-speed';

describe('ball-speed', () => {
  const config: BallSpeedConfig = {
    baseSpeed: 300,
    increment: 25,
    maxSpeed: 600,
  };

  describe('unit tests', () => {
    it('computeSpeedAfterHit adds increment to current speed', () => {
      const result = computeSpeedAfterHit(300, config);
      expect(result).toBe(325);
    });

    it('computeSpeedAfterHit caps at maxSpeed', () => {
      const result = computeSpeedAfterHit(590, config);
      expect(result).toBe(600);
    });

    it('computeSpeedAfterHit at exactly maxSpeed stays at maxSpeed', () => {
      const result = computeSpeedAfterHit(600, config);
      expect(result).toBe(600);
    });

    it('getServeSpeed returns baseSpeed', () => {
      const result = getServeSpeed(config);
      expect(result).toBe(300);
    });
  });

  describe('property tests', () => {
    /**
     * Feature: pong-core, Property 2: ball speed stays within [baseSpeed, maxSpeed] for any hit sequence
     *
     * For any currentSpeed in [baseSpeed, maxSpeed], computeSpeedAfterHit
     * result is always in [baseSpeed, maxSpeed].
     *
     * **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
     */
    it('property 2: ball speed stays within [baseSpeed, maxSpeed] for any hit sequence', () => {
      const configArb = fc
        .record({
          baseSpeed: fc.integer({ min: 50, max: 500 }),
          increment: fc.integer({ min: 1, max: 100 }),
          maxSpeedOffset: fc.integer({ min: 50, max: 500 }),
        })
        .map(({ baseSpeed, increment, maxSpeedOffset }) => ({
          baseSpeed,
          increment,
          maxSpeed: baseSpeed + maxSpeedOffset,
        }));

      fc.assert(
        fc.property(configArb, (cfg) => {
          // Generate a random currentSpeed within [baseSpeed, maxSpeed]
          const currentSpeed =
            cfg.baseSpeed + Math.random() * (cfg.maxSpeed - cfg.baseSpeed);
          const result = computeSpeedAfterHit(currentSpeed, cfg);
          return result >= cfg.baseSpeed && result <= cfg.maxSpeed;
        }),
        { numRuns: 200 },
      );
    });

    /**
     * Feature: pong-core, Property 3: ball speed never decreases on paddle hit
     *
     * For any valid currentSpeed, computeSpeedAfterHit(s, config) >= s.
     *
     * **Validates: Requirements 4.1, 4.2**
     */
    it('property 3: ball speed never decreases on paddle hit', () => {
      const configArb = fc
        .record({
          baseSpeed: fc.integer({ min: 50, max: 500 }),
          increment: fc.integer({ min: 1, max: 100 }),
          maxSpeedOffset: fc.integer({ min: 50, max: 500 }),
        })
        .map(({ baseSpeed, increment, maxSpeedOffset }) => ({
          baseSpeed,
          increment,
          maxSpeed: baseSpeed + maxSpeedOffset,
        }));

      fc.assert(
        fc.property(
          configArb,
          fc.float({ min: 0, max: 1, noNaN: true }),
          (cfg, fraction) => {
            const currentSpeed =
              cfg.baseSpeed + fraction * (cfg.maxSpeed - cfg.baseSpeed);
            const result = computeSpeedAfterHit(currentSpeed, cfg);
            return result >= currentSpeed;
          },
        ),
        { numRuns: 200 },
      );
    });
  });
});
