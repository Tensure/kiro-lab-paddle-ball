import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './store';
import type { AppState } from './store';
import * as fc from 'fast-check';

const initialState: Partial<AppState> = {
  phase: 'menu',
  selectedMode: null,
  winScore: 7,
  aiDifficulty: 'normal',
  powerupsEnabled: false,
  pauseOverlayOpen: false,
  winLossOverlayOpen: false,
  matchData: { scores: { left: 0, right: 0 }, lives: 3, winner: null, finalScore: null },
};

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState(initialState);
  });

  describe('initial state', () => {
    it('has phase menu, selectedMode null, winScore 7, aiDifficulty normal, powerupsEnabled false', () => {
      const state = useAppStore.getState();
      expect(state.phase).toBe('menu');
      expect(state.selectedMode).toBeNull();
      expect(state.winScore).toBe(7);
      expect(state.aiDifficulty).toBe('normal');
      expect(state.powerupsEnabled).toBe(false);
    });
  });

  describe('selectMode', () => {
    it('sets mode and transitions to settings', () => {
      useAppStore.getState().selectMode('pong-solo');
      const state = useAppStore.getState();
      expect(state.selectedMode).toBe('pong-solo');
      expect(state.phase).toBe('settings');
    });
  });

  describe('goToMenu', () => {
    it('resets to phase menu, clears overlays and matchData', () => {
      useAppStore.setState({
        phase: 'playing',
        selectedMode: 'breakout',
        pauseOverlayOpen: true,
        winLossOverlayOpen: true,
        matchData: { scores: { left: 5, right: 3 }, lives: 1, winner: 'left', finalScore: 10 },
      });
      useAppStore.getState().goToMenu();
      const state = useAppStore.getState();
      expect(state.phase).toBe('menu');
      expect(state.pauseOverlayOpen).toBe(false);
      expect(state.winLossOverlayOpen).toBe(false);
      expect(state.matchData).toEqual({ scores: { left: 0, right: 0 }, lives: 3, winner: null, finalScore: null });
    });
  });

  describe('startMatch', () => {
    it('sets phase to playing and resets matchData', () => {
      useAppStore.setState({
        phase: 'settings',
        matchData: { scores: { left: 2, right: 1 }, lives: 1, winner: 'right', finalScore: 5 },
      });
      useAppStore.getState().startMatch();
      const state = useAppStore.getState();
      expect(state.phase).toBe('playing');
      expect(state.matchData).toEqual({ scores: { left: 0, right: 0 }, lives: 3, winner: null, finalScore: null });
    });
  });

  describe('setWinScore', () => {
    it('clamps values to [3, 21]', () => {
      useAppStore.getState().setWinScore(1);
      expect(useAppStore.getState().winScore).toBe(3);

      useAppStore.getState().setWinScore(25);
      expect(useAppStore.getState().winScore).toBe(21);

      useAppStore.getState().setWinScore(7);
      expect(useAppStore.getState().winScore).toBe(7);

      useAppStore.getState().setWinScore(3.6);
      expect(useAppStore.getState().winScore).toBe(4);
    });
  });

  describe('setAiDifficulty', () => {
    it('updates difficulty', () => {
      useAppStore.getState().setAiDifficulty('hard');
      expect(useAppStore.getState().aiDifficulty).toBe('hard');

      useAppStore.getState().setAiDifficulty('easy');
      expect(useAppStore.getState().aiDifficulty).toBe('easy');
    });
  });

  describe('setPowerupsEnabled', () => {
    it('updates toggle', () => {
      useAppStore.getState().setPowerupsEnabled(true);
      expect(useAppStore.getState().powerupsEnabled).toBe(true);

      useAppStore.getState().setPowerupsEnabled(false);
      expect(useAppStore.getState().powerupsEnabled).toBe(false);
    });
  });

  describe('openPauseOverlay / closePauseOverlay', () => {
    it('toggles pause overlay state', () => {
      expect(useAppStore.getState().pauseOverlayOpen).toBe(false);

      useAppStore.getState().openPauseOverlay();
      expect(useAppStore.getState().pauseOverlayOpen).toBe(true);

      useAppStore.getState().closePauseOverlay();
      expect(useAppStore.getState().pauseOverlayOpen).toBe(false);
    });
  });

  describe('openWinLossOverlay', () => {
    it('sets winner/finalScore and opens overlay', () => {
      useAppStore.getState().openWinLossOverlay('left', null);
      const state = useAppStore.getState();
      expect(state.winLossOverlayOpen).toBe(true);
      expect(state.matchData.winner).toBe('left');
      expect(state.matchData.finalScore).toBeNull();
    });

    it('sets finalScore for breakout loss', () => {
      useAppStore.getState().openWinLossOverlay(null, 42);
      const state = useAppStore.getState();
      expect(state.winLossOverlayOpen).toBe(true);
      expect(state.matchData.winner).toBeNull();
      expect(state.matchData.finalScore).toBe(42);
    });
  });

  describe('updateScores', () => {
    it('updates matchData.scores', () => {
      useAppStore.getState().updateScores(3, 5);
      expect(useAppStore.getState().matchData.scores).toEqual({ left: 3, right: 5 });
    });
  });

  describe('updateLives', () => {
    it('updates matchData.lives', () => {
      useAppStore.getState().updateLives(1);
      expect(useAppStore.getState().matchData.lives).toBe(1);
    });
  });

  describe('resetMatchData', () => {
    it('clears scores, lives, winner, finalScore', () => {
      useAppStore.setState({
        matchData: { scores: { left: 7, right: 3 }, lives: 0, winner: 'left', finalScore: 15 },
      });
      useAppStore.getState().resetMatchData();
      expect(useAppStore.getState().matchData).toEqual({
        scores: { left: 0, right: 0 },
        lives: 3,
        winner: null,
        finalScore: null,
      });
    });
  });

  describe('Property-based tests', () => {
    it('Feature: react-app-shell, Property 1: for any numeric input, setWinScore produces value in [3, 21]', () => {
      fc.assert(
        fc.property(fc.double({ noNaN: true, noDefaultInfinity: true }), (n) => {
          useAppStore.setState(initialState);
          useAppStore.getState().setWinScore(n);
          const score = useAppStore.getState().winScore;
          return score >= 3 && score <= 21 && Number.isInteger(score);
        }),
        { numRuns: 100 },
      );
    });

    it('Feature: react-app-shell, Property 2: for any sequence of valid actions, phase is always one of menu | settings | playing', () => {
      const actionArb = fc.oneof(
        fc.constant('selectMode' as const),
        fc.constant('goToMenu' as const),
        fc.constant('startMatch' as const),
      );

      fc.assert(
        fc.property(fc.array(actionArb, { minLength: 1, maxLength: 20 }), (actions) => {
          useAppStore.setState(initialState);
          for (const action of actions) {
            switch (action) {
              case 'selectMode':
                useAppStore.getState().selectMode('pong-solo');
                break;
              case 'goToMenu':
                useAppStore.getState().goToMenu();
                break;
              case 'startMatch':
                useAppStore.getState().startMatch();
                break;
            }
          }
          const phase = useAppStore.getState().phase;
          return phase === 'menu' || phase === 'settings' || phase === 'playing';
        }),
        { numRuns: 100 },
      );
    });

    it('Feature: react-app-shell, Property 3: goToMenu from any state resets overlays and matchData', () => {
      fc.assert(
        fc.property(
          fc.record({
            pauseOverlayOpen: fc.boolean(),
            winLossOverlayOpen: fc.boolean(),
            scores: fc.record({ left: fc.nat(21), right: fc.nat(21) }),
            lives: fc.nat(10),
            winner: fc.oneof(fc.constant('left' as const), fc.constant('right' as const), fc.constant(null)),
            finalScore: fc.oneof(fc.nat(1000), fc.constant(null)),
          }),
          ({ pauseOverlayOpen, winLossOverlayOpen, scores, lives, winner, finalScore }) => {
            useAppStore.setState({
              ...initialState,
              phase: 'playing',
              pauseOverlayOpen,
              winLossOverlayOpen,
              matchData: { scores, lives, winner, finalScore },
            });
            useAppStore.getState().goToMenu();
            const state = useAppStore.getState();
            return (
              state.pauseOverlayOpen === false &&
              state.winLossOverlayOpen === false &&
              state.matchData.scores.left === 0 &&
              state.matchData.scores.right === 0 &&
              state.matchData.lives === 3 &&
              state.matchData.winner === null &&
              state.matchData.finalScore === null
            );
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
