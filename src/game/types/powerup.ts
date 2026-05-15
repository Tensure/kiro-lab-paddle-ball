import type { GameMode, PlayerId } from './modes';

/** Stable powerup identifiers */
export type PowerupId =
  | 'ball-speed-up'
  | 'ball-slow-down'
  | 'paddle-grow'
  | 'paddle-shrink'
  | 'multi-ball'
  | 'ai-freeze'
  | 'opponent-paddle-shrink'
  | 'piercing-ball'
  | 'sticky-paddle'
  | 'extra-life'
  | 'wide-paddle';

/** Effect classification */
export type EffectType = 'beneficial' | 'harmful' | 'neutral';

/** A powerup definition — pure data, no behavior */
export interface PowerupDefinition {
  readonly id: PowerupId;
  readonly displayName: string;
  readonly eligibleModes: readonly GameMode[];
  readonly duration: number | null;
  readonly spawnWeight: number;
  readonly effectType: EffectType;
  readonly targetsSelf: boolean;
}

/** An active effect being tracked at runtime */
export interface ActiveEffect {
  readonly powerupId: PowerupId;
  readonly targetPlayer: PlayerId;
  readonly remainingMs: number | null;
  readonly appliedAt: number;
}

/** Spawn configuration */
export interface SpawnConfig {
  readonly minInterval: number;
  readonly maxInterval: number;
  readonly spawnProbability: number;
  readonly maxOnScreen: number;
  readonly despawnTime: number;
}
