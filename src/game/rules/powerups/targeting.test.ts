import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { resolveTarget } from './targeting';
import { POWERUP_DEFINITIONS } from './registry';
import type { PowerupDefinition } from '../../types/powerup';
import type { PlayerId, GameMode } from '../../types/modes';

describe('targeting', () => {
  const harmfulPong = POWERUP_DEFINITIONS.find(
    (d) => d.id === 'paddle-shrink',
  )!;
  const beneficialPong = POWERUP_DEFINITIONS.find(
    (d) => d.id === 'paddle-grow',
  )!;
  const harmfulAiFreeze = POWERUP_DEFINITIONS.find(
    (d) => d.id === 'ai-freeze',
  )!;

  it('harmful powerup in pong-solo collected by right → targets left', () => {
    expect(resolveTarget(harmfulPong, 'right', 'pong-solo')).toBe('left');
  });

  it('harmful powerup in pong-versus collected by left → targets right', () => {
    expect(resolveTarget(harmfulPong, 'left', 'pong-versus')).toBe('right');
  });

  it('beneficial powerup in pong-solo → targets collector', () => {
    expect(resolveTarget(beneficialPong, 'right', 'pong-solo')).toBe('right');
  });

  it('beneficial powerup in breakout → targets collector (solo)', () => {
    expect(resolveTarget(beneficialPong, 'solo', 'breakout')).toBe('solo');
  });

  it('harmful powerup in breakout → targets collector (no opponent in breakout)', () => {
    // paddle-shrink is harmful but in breakout there's no opponent
    expect(resolveTarget(harmfulPong, 'solo', 'breakout')).toBe('solo');
  });

  it('AI Freeze in pong-solo collected by right → targets left', () => {
    expect(resolveTarget(harmfulAiFreeze, 'right', 'pong-solo')).toBe('left');
  });

  // Property 5: Target resolution for harmful powerups in Pong
  describe('Property 5: Harmful targeting in Pong returns opponent', () => {
    /** Validates: Requirements 9.1, 9.2, 9.4 */
    const harmfulDefs = POWERUP_DEFINITIONS.filter(
      (d) => d.effectType === 'harmful' && !d.targetsSelf,
    );
    const pongModes: GameMode[] = ['pong-solo', 'pong-versus'];
    const pongPlayers: PlayerId[] = ['left', 'right'];

    it('resolveTarget returns a different PlayerId than collector for harmful powerups in Pong', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...harmfulDefs),
          fc.constantFrom(...pongPlayers),
          fc.constantFrom(...pongModes),
          (def: PowerupDefinition, collector: PlayerId, mode: GameMode) => {
            const target = resolveTarget(def, collector, mode);
            expect(target).not.toBe(collector);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  // Property 6: Target resolution for beneficial powerups
  describe('Property 6: Beneficial targeting returns collector', () => {
    /** Validates: Requirements 9.3 */
    const selfTargetDefs = POWERUP_DEFINITIONS.filter((d) => d.targetsSelf);
    const allPlayers: PlayerId[] = ['left', 'right', 'solo'];
    const allModes: GameMode[] = ['pong-solo', 'pong-versus', 'breakout'];

    it('resolveTarget returns the collector for any powerup with targetsSelf=true', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...selfTargetDefs),
          fc.constantFrom(...allPlayers),
          fc.constantFrom(...allModes),
          (def: PowerupDefinition, collector: PlayerId, mode: GameMode) => {
            const target = resolveTarget(def, collector, mode);
            expect(target).toBe(collector);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
