import type { PowerupDefinition } from '../../types/powerup';
import type { PlayerId, GameMode } from '../../types/modes';

/**
 * Determines which player a powerup effect targets.
 * - Beneficial/neutral or targetsSelf=true: targets the collector
 * - Harmful in Pong (targetsSelf=false): targets the opponent
 * - Harmful in Breakout: targets the collector (no opponent)
 */
export function resolveTarget(
  definition: PowerupDefinition,
  collector: PlayerId,
  mode: GameMode,
): PlayerId {
  if (definition.targetsSelf) {
    return collector;
  }

  // Harmful + Pong modes → target opponent
  if (mode === 'pong-solo' || mode === 'pong-versus') {
    if (collector === 'left') return 'right';
    if (collector === 'right') return 'left';
  }

  // Harmful + Breakout or fallback → target collector (no opponent)
  return collector;
}
