import type { AIDifficultyPreset } from './modes';

/** Ball speed preset names */
export type BallSpeedPreset = 'slow' | 'normal' | 'fast';

/** Speed increase preset names */
export type SpeedIncreasePreset = 'off' | 'gentle' | 'aggressive';

/** Paddle size preset names */
export type PaddleSizePreset = 'small' | 'normal' | 'large';

/** Brick density preset names */
export type BrickDensityPreset = 'sparse' | 'normal' | 'dense';

/** Starting lives options */
export type StartingLives = 1 | 3 | 5;

/** Base fields shared by all match settings */
interface MatchSettingsBase {
  readonly powerupsEnabled: boolean;
  readonly ballSpeedPreset?: BallSpeedPreset;
  readonly paddleSizePreset?: PaddleSizePreset;
  readonly speedIncreasePreset?: SpeedIncreasePreset;
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

/** Breakout has lives and brick density */
export interface BreakoutSettings extends MatchSettingsBase {
  readonly mode: 'breakout';
  readonly startingLives?: StartingLives;
  readonly brickDensity?: BrickDensityPreset;
}

/** Discriminated union keyed on `mode` */
export type MatchSettings = PongSoloSettings | PongVersusSettings | BreakoutSettings;
