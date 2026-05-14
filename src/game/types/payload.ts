import type { MatchSettings } from './settings';
import type { PlayerId } from './modes';

/** Payload passed from React to Phaser when launching a game scene */
export interface SceneLaunchPayload {
  readonly settings: MatchSettings;
  readonly players: readonly PlayerId[];
}
