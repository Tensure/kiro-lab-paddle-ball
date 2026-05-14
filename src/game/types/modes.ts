/** The three playable game modes */
export type GameMode = 'pong-solo' | 'pong-versus' | 'breakout';

/** Player position identifiers */
export type PlayerId = 'left' | 'right' | 'solo';

/** AI difficulty presets — shape only, no numeric values */
export type AIDifficultyPreset = 'easy' | 'normal' | 'hard';
