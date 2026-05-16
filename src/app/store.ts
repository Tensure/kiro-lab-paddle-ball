import { create } from 'zustand';
import type { GameMode, PlayerId, AIDifficultyPreset } from '../game/types/modes';
import type { BallSpeedPreset, PaddleSizePreset, SpeedIncreasePreset, BrickDensityPreset, StartingLives } from '../game/types/settings';
import { validateWinScore } from '../game/rules/win-score';

export type AppPhase = 'menu' | 'settings' | 'playing';

export interface MatchData {
  scores: { left: number; right: number };
  lives: number;
  winner: PlayerId | null;
  finalScore: number | null;
}

const INITIAL_MATCH_DATA: MatchData = {
  scores: { left: 0, right: 0 },
  lives: 3,
  winner: null,
  finalScore: null,
};

export interface AppState {
  // Phase
  phase: AppPhase;

  // Mode & Settings
  selectedMode: GameMode | null;
  winScore: number;
  aiDifficulty: AIDifficultyPreset;
  powerupsEnabled: boolean;
  ballSpeedPreset: BallSpeedPreset;
  paddleSizePreset: PaddleSizePreset;
  speedIncreasePreset: SpeedIncreasePreset;
  startingLives: StartingLives;
  brickDensity: BrickDensityPreset;

  // Overlays
  pauseOverlayOpen: boolean;
  winLossOverlayOpen: boolean;

  // Match data (updated by scene events)
  matchData: MatchData;

  // Actions
  selectMode: (mode: GameMode) => void;
  goToMenu: () => void;
  goToSettings: () => void;
  startMatch: () => void;
  setWinScore: (score: number) => void;
  setAiDifficulty: (difficulty: AIDifficultyPreset) => void;
  setPowerupsEnabled: (enabled: boolean) => void;
  setBallSpeedPreset: (preset: BallSpeedPreset) => void;
  setPaddleSizePreset: (preset: PaddleSizePreset) => void;
  setSpeedIncreasePreset: (preset: SpeedIncreasePreset) => void;
  setStartingLives: (lives: StartingLives) => void;
  setBrickDensity: (density: BrickDensityPreset) => void;
  openPauseOverlay: () => void;
  closePauseOverlay: () => void;
  openWinLossOverlay: (winner: PlayerId | null, finalScore: number | null) => void;
  closeWinLossOverlay: () => void;
  updateScores: (left: number, right: number) => void;
  updateLives: (remaining: number) => void;
  resetMatchData: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  phase: 'menu',
  selectedMode: null,
  winScore: 7,
  aiDifficulty: 'normal',
  powerupsEnabled: false,
  ballSpeedPreset: 'normal',
  paddleSizePreset: 'normal',
  speedIncreasePreset: 'gentle',
  startingLives: 3,
  brickDensity: 'normal',
  pauseOverlayOpen: false,
  winLossOverlayOpen: false,
  matchData: { ...INITIAL_MATCH_DATA },

  // Actions
  selectMode: (mode) => set({ selectedMode: mode, phase: 'settings' }),

  goToMenu: () => set({
    phase: 'menu',
    selectedMode: null,
    pauseOverlayOpen: false,
    winLossOverlayOpen: false,
    matchData: { ...INITIAL_MATCH_DATA },
    ballSpeedPreset: 'normal',
    paddleSizePreset: 'normal',
    speedIncreasePreset: 'gentle',
    startingLives: 3,
    brickDensity: 'normal',
  }),

  goToSettings: () => set({ phase: 'settings' }),

  startMatch: () => set({
    phase: 'playing',
    pauseOverlayOpen: false,
    winLossOverlayOpen: false,
    matchData: { ...INITIAL_MATCH_DATA },
  }),

  setWinScore: (score) => {
    if (get().phase === 'playing') return;
    set({ winScore: validateWinScore(score) });
  },

  setAiDifficulty: (difficulty) => {
    if (get().phase === 'playing') return;
    set({ aiDifficulty: difficulty });
  },

  setPowerupsEnabled: (enabled) => {
    if (get().phase === 'playing') return;
    set({ powerupsEnabled: enabled });
  },

  setBallSpeedPreset: (preset) => {
    if (get().phase === 'playing') return;
    set({ ballSpeedPreset: preset });
  },

  setPaddleSizePreset: (preset) => {
    if (get().phase === 'playing') return;
    set({ paddleSizePreset: preset });
  },

  setSpeedIncreasePreset: (preset) => {
    if (get().phase === 'playing') return;
    set({ speedIncreasePreset: preset });
  },

  setStartingLives: (lives) => {
    if (get().phase === 'playing') return;
    set({ startingLives: lives });
  },

  setBrickDensity: (density) => {
    if (get().phase === 'playing') return;
    set({ brickDensity: density });
  },

  openPauseOverlay: () => {
    if (get().winLossOverlayOpen) return;
    set({ pauseOverlayOpen: true });
  },

  closePauseOverlay: () => set({ pauseOverlayOpen: false }),

  openWinLossOverlay: (winner, finalScore) => set({
    winLossOverlayOpen: true,
    pauseOverlayOpen: false,
    matchData: {
      ...INITIAL_MATCH_DATA,
      winner,
      finalScore,
    },
  }),

  closeWinLossOverlay: () => set({ winLossOverlayOpen: false }),

  updateScores: (left, right) => set((state) => ({
    matchData: { ...state.matchData, scores: { left, right } },
  })),

  updateLives: (remaining) => set((state) => ({
    matchData: { ...state.matchData, lives: remaining },
  })),

  resetMatchData: () => set({ matchData: { ...INITIAL_MATCH_DATA } }),
}));
