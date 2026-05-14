import type { AIDifficultyPreset } from './modes';

/** Base fields shared by all match settings */
interface MatchSettingsBase {
  readonly powerupsEnabled: boolean;
}

/** Pong Solo requires AI difficulty and win score */
export interface PongSoloSettings extends MatchSettingsBase {
  readonly mode: 'pong-solo';
  readonly winScore: number;
  readonly aiDifficulty: AIDifficultyPreset;
}

/** Pong Versus requires win score only */
export interface PongVersusSettings extends MatchSettingsBase {
  readonly mode: 'pong-versus';
  readonly winScore: number;
}

/** Breakout has no win score or AI difficulty */
export interface BreakoutSettings extends MatchSettingsBase {
  readonly mode: 'breakout';
}

/** Discriminated union keyed on `mode` */
export type MatchSettings = PongSoloSettings | PongVersusSettings | BreakoutSettings;
