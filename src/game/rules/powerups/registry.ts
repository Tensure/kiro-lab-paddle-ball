import type { PowerupDefinition, PowerupId, SpawnConfig } from '../../types/powerup';

/** All 11 powerup definitions */
export const POWERUP_DEFINITIONS: readonly PowerupDefinition[] = [
  {
    id: 'ball-speed-up',
    displayName: 'Ball Speed Up',
    eligibleModes: ['pong-solo', 'pong-versus', 'breakout'],
    duration: 6000,
    spawnWeight: 10,
    effectType: 'neutral',
    targetsSelf: true,
  },
  {
    id: 'ball-slow-down',
    displayName: 'Ball Slow Down',
    eligibleModes: ['pong-solo', 'pong-versus', 'breakout'],
    duration: 6000,
    spawnWeight: 10,
    effectType: 'beneficial',
    targetsSelf: true,
  },
  {
    id: 'paddle-grow',
    displayName: 'Paddle Grow',
    eligibleModes: ['pong-solo', 'pong-versus', 'breakout'],
    duration: 8000,
    spawnWeight: 8,
    effectType: 'beneficial',
    targetsSelf: true,
  },
  {
    id: 'paddle-shrink',
    displayName: 'Paddle Shrink',
    eligibleModes: ['pong-solo', 'pong-versus', 'breakout'],
    duration: 8000,
    spawnWeight: 8,
    effectType: 'harmful',
    targetsSelf: false,
  },
  {
    id: 'multi-ball',
    displayName: 'Multi Ball',
    eligibleModes: ['pong-solo', 'pong-versus', 'breakout'],
    duration: 10000,
    spawnWeight: 5,
    effectType: 'beneficial',
    targetsSelf: true,
  },
  {
    id: 'ai-freeze',
    displayName: 'AI Freeze',
    eligibleModes: ['pong-solo'],
    duration: 4000,
    spawnWeight: 4,
    effectType: 'harmful',
    targetsSelf: false,
  },
  {
    id: 'opponent-paddle-shrink',
    displayName: 'Opponent Shrink',
    eligibleModes: ['pong-solo', 'pong-versus'],
    duration: 8000,
    spawnWeight: 6,
    effectType: 'harmful',
    targetsSelf: false,
  },
  {
    id: 'piercing-ball',
    displayName: 'Piercing Ball',
    eligibleModes: ['breakout'],
    duration: 6000,
    spawnWeight: 7,
    effectType: 'beneficial',
    targetsSelf: true,
  },
  {
    id: 'sticky-paddle',
    displayName: 'Sticky Paddle',
    eligibleModes: ['breakout'],
    duration: 10000,
    spawnWeight: 6,
    effectType: 'beneficial',
    targetsSelf: true,
  },
  {
    id: 'extra-life',
    displayName: 'Extra Life',
    eligibleModes: ['breakout'],
    duration: null,
    spawnWeight: 3,
    effectType: 'beneficial',
    targetsSelf: true,
  },
  {
    id: 'wide-paddle',
    displayName: 'Wide Paddle',
    eligibleModes: ['breakout'],
    duration: 8000,
    spawnWeight: 7,
    effectType: 'beneficial',
    targetsSelf: true,
  },
] as const;

/** Look up a powerup by ID. Returns undefined for unknown IDs. */
export function getPowerupById(id: PowerupId): PowerupDefinition | undefined {
  return POWERUP_DEFINITIONS.find((def) => def.id === id);
}

/** Get all powerup definitions as an array */
export function getAllPowerups(): readonly PowerupDefinition[] {
  return POWERUP_DEFINITIONS;
}

/** Effect multiplier constants */
export const EFFECT_MULTIPLIERS = {
  ballSpeedUp: 1.3,
  ballSlowDown: 0.7,
  paddleGrow: 1.5,
  paddleShrink: 0.7,
  opponentPaddleShrink: 0.7,
  widePaddle: 1.5,
} as const;

/** Default spawn configuration */
export const DEFAULT_SPAWN_CONFIG: SpawnConfig = {
  minInterval: 8000,
  maxInterval: 15000,
  spawnProbability: 0.4,
  maxOnScreen: 1,
  despawnTime: 8000,
};
