import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { applyStackingPolicy } from './stacking';
import type { ActiveEffect, PowerupId } from '../../types/powerup';
import type { PlayerId } from '../../types/modes';

describe('stacking', () => {
  it('new powerup on empty effects list → action is apply-new', () => {
    const result = applyStackingPolicy([], 'paddle-grow', 'left', 8000, 1000);
    expect(result.action).toBe('apply-new');
    expect(result.effects).toHaveLength(1);
    expect(result.effects[0].powerupId).toBe('paddle-grow');
    expect(result.effects[0].targetPlayer).toBe('left');
    expect(result.effects[0].remainingMs).toBe(8000);
  });

  it('duplicate powerup on same target → action is refresh-duration', () => {
    const existing: ActiveEffect[] = [
      { powerupId: 'paddle-grow', targetPlayer: 'left', remainingMs: 3000, appliedAt: 500 },
    ];
    const result = applyStackingPolicy(existing, 'paddle-grow', 'left', 8000, 2000);
    expect(result.action).toBe('refresh-duration');
    expect(result.effects).toHaveLength(1);
    expect(result.effects[0].remainingMs).toBe(8000);
    expect(result.effects[0].appliedAt).toBe(2000);
  });

  it('same powerup on different target → action is apply-new (both exist)', () => {
    const existing: ActiveEffect[] = [
      { powerupId: 'paddle-grow', targetPlayer: 'left', remainingMs: 5000, appliedAt: 500 },
    ];
    const result = applyStackingPolicy(existing, 'paddle-grow', 'right', 8000, 2000);
    expect(result.action).toBe('apply-new');
    expect(result.effects).toHaveLength(2);
  });

  it('different powerup on same target → action is apply-new (both exist)', () => {
    const existing: ActiveEffect[] = [
      { powerupId: 'paddle-grow', targetPlayer: 'left', remainingMs: 5000, appliedAt: 500 },
    ];
    const result = applyStackingPolicy(existing, 'ball-speed-up', 'left', 6000, 2000);
    expect(result.action).toBe('apply-new');
    expect(result.effects).toHaveLength(2);
  });

  it('refresh does not add remaining time, resets to full duration', () => {
    const existing: ActiveEffect[] = [
      { powerupId: 'ball-speed-up', targetPlayer: 'right', remainingMs: 2000, appliedAt: 100 },
    ];
    const result = applyStackingPolicy(existing, 'ball-speed-up', 'right', 6000, 5000);
    expect(result.action).toBe('refresh-duration');
    expect(result.effects[0].remainingMs).toBe(6000); // full duration, not 2000 + 6000
  });

  // Property 3: Stacking policy never duplicates active effects
  describe('Property 3: Stacking policy never duplicates active effects', () => {
    /** Validates: Requirements 8.1, 8.2, 8.4 */
    const powerupIds: PowerupId[] = [
      'ball-speed-up', 'ball-slow-down', 'paddle-grow', 'paddle-shrink',
      'multi-ball', 'ai-freeze', 'opponent-paddle-shrink', 'piercing-ball',
      'sticky-paddle', 'extra-life', 'wide-paddle',
    ];
    const playerIds: PlayerId[] = ['left', 'right', 'solo'];

    it('result has at most 1 entry for any (powerupId, targetPlayer) pair', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...powerupIds),
          fc.constantFrom(...playerIds),
          fc.nat({ max: 20000 }),
          fc.nat({ max: 20000 }),
          fc.nat({ max: 5 }),
          (powerupId, target, duration, timestamp, applyCount) => {
            let effects: readonly ActiveEffect[] = [];
            for (let i = 0; i <= applyCount; i++) {
              const result = applyStackingPolicy(effects, powerupId, target, duration, timestamp + i * 1000);
              effects = result.effects;
            }
            // Count entries for this (powerupId, target) pair
            const count = effects.filter(
              (e) => e.powerupId === powerupId && e.targetPlayer === target,
            ).length;
            expect(count).toBeLessThanOrEqual(1);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  // Property 4: Stacking refresh resets to full duration
  describe('Property 4: Stacking refresh resets to full duration', () => {
    /** Validates: Requirements 8.4, 8.1 */
    const powerupIds: PowerupId[] = [
      'ball-speed-up', 'ball-slow-down', 'paddle-grow', 'paddle-shrink',
      'multi-ball', 'ai-freeze', 'opponent-paddle-shrink', 'piercing-ball',
      'sticky-paddle', 'wide-paddle',
    ];
    const playerIds: PlayerId[] = ['left', 'right', 'solo'];

    it('refreshed effect remainingMs equals the configured duration', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...powerupIds),
          fc.constantFrom(...playerIds),
          fc.integer({ min: 1000, max: 20000 }),
          fc.integer({ min: 0, max: 10000 }),
          fc.integer({ min: 10001, max: 30000 }),
          (powerupId, target, duration, t1, t2) => {
            // First apply
            const first = applyStackingPolicy([], powerupId, target, duration, t1);
            // Simulate partial decay by modifying remainingMs
            const decayed: ActiveEffect[] = first.effects.map((e) => ({
              ...e,
              remainingMs: Math.max(1, (e.remainingMs ?? duration) - 500),
            }));
            // Refresh
            const refreshed = applyStackingPolicy(decayed, powerupId, target, duration, t2);
            expect(refreshed.action).toBe('refresh-duration');
            const entry = refreshed.effects.find(
              (e) => e.powerupId === powerupId && e.targetPlayer === target,
            );
            expect(entry).toBeDefined();
            expect(entry!.remainingMs).toBe(duration);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
