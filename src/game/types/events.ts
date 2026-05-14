import type { PlayerId } from './modes';

/** Audio state exposed to React for UI rendering */
export interface AudioState {
  readonly muted: boolean;
  readonly volume: number;
}

/**
 * Central event type registry.
 * All event names and their payload shapes are defined here.
 * The EventBridge uses this type to enforce compile-time safety.
 */
export type EventMap = {
  'placeholder:ping': { timestamp: number };
  'score:update': { left: number; right: number };
  'match:win': { winner: PlayerId };
  'match:loss': { finalScore: number };
  'match:pause': { paused: boolean };
  'lives:update': { remaining: number };
  // Audio events — payload is undefined (event name is the signal)
  'audio:paddle-hit': undefined;
  'audio:wall-bounce': undefined;
  'audio:brick-break': undefined;
  'audio:score-point': undefined;
  'audio:life-loss': undefined;
  'audio:powerup-pickup': undefined;
  'audio:pause': undefined;
  'audio:win': undefined;
  'audio:loss': undefined;
  // Audio state change — carries current state for React consumption
  'audio:state-change': AudioState;
};
