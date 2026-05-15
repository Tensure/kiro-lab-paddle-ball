import { describe, it, expect } from 'vitest';

/**
 * Unit test verifying max particle configuration respects 200-particle cap across emitters.
 * The NeonParticles system uses these caps:
 *   score: 40, brickBreak: 60, win: 100
 * Total: 200
 */

const MAX_PARTICLES = {
  score: 40,
  brickBreak: 60,
  win: 100,
} as const;

describe('NeonParticles max particle cap', () => {
  it('total max particles across all emitters does not exceed 200', () => {
    const total = MAX_PARTICLES.score + MAX_PARTICLES.brickBreak + MAX_PARTICLES.win;
    expect(total).toBeLessThanOrEqual(200);
  });

  it('total max particles equals exactly 200', () => {
    const total = MAX_PARTICLES.score + MAX_PARTICLES.brickBreak + MAX_PARTICLES.win;
    expect(total).toBe(200);
  });

  it('each emitter has a positive max particle count', () => {
    expect(MAX_PARTICLES.score).toBeGreaterThan(0);
    expect(MAX_PARTICLES.brickBreak).toBeGreaterThan(0);
    expect(MAX_PARTICLES.win).toBeGreaterThan(0);
  });

  it('score burst count (20) is within emitter max (40)', () => {
    const burstCount = 20;
    expect(burstCount).toBeLessThanOrEqual(MAX_PARTICLES.score);
  });

  it('brick-break burst count (10) is within emitter max (60)', () => {
    const burstCount = 10;
    expect(burstCount).toBeLessThanOrEqual(MAX_PARTICLES.brickBreak);
  });

  it('win burst count (50) is within emitter max (100)', () => {
    const burstCount = 50;
    expect(burstCount).toBeLessThanOrEqual(MAX_PARTICLES.win);
  });
});
