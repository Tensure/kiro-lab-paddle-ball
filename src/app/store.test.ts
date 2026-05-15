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

    /**
     * **Validates: Requirements 1.1, 1.2, 1.3**
     * Property 4: For any sequence of phase transitions and settings mutations,
     * settings values are unchanged when phase is 'playing'.
     */
    it('Feature: match-lifecycle, Property 4: settings are immutable when phase is playing', () => {
      const phaseActionArb = fc.oneof(
        fc.constant({ type: 'selectMode' } as const),
        fc.constant({ type: 'goToMenu' } as const),
        fc.constant({ type: 'startMatch' } as const),
      );

      const settingsActionArb = fc.oneof(
        fc.record({ type: fc.constant('setWinScore' as const), value: fc.integer({ min: 1, max: 25 }) }),
        fc.record({ type: fc.constant('setAiDifficulty' as const), value: fc.constantFrom('easy' as const, 'normal' as const, 'hard' as const) }),
        fc.record({ type: fc.constant('setPowerupsEnabled' as const), value: fc.boolean() }),
      );

      const actionArb = fc.oneof(phaseActionArb, settingsActionArb);

      fc.assert(
        fc.property(fc.array(actionArb, { minLength: 1, maxLength: 30 }), (actions) => {
          useAppStore.setState(initialState);

          for (const action of actions) {
            const stateBefore = useAppStore.getState();
            const phase = stateBefore.phase;

            switch (action.type) {
              case 'selectMode':
                useAppStore.getState().selectMode('pong-solo');
                break;
              case 'goToMenu':
                useAppStore.getState().goToMenu();
                break;
              case 'startMatch':
                useAppStore.getState().startMatch();
                break;
              case 'setWinScore':
                useAppStore.getState().setWinScore(action.value);
                if (phase === 'playing') {
                  if (useAppStore.getState().winScore !== stateBefore.winScore) return false;
                }
                break;
              case 'setAiDifficulty':
                useAppStore.getState().setAiDifficulty(action.value);
                if (phase === 'playing') {
                  if (useAppStore.getState().aiDifficulty !== stateBefore.aiDifficulty) return false;
                }
                break;
              case 'setPowerupsEnabled':
                useAppStore.getState().setPowerupsEnabled(action.value);
                if (phase === 'playing') {
                  if (useAppStore.getState().powerupsEnabled !== stateBefore.powerupsEnabled) return false;
                }
                break;
            }
          }
          return true;
        }),
        { numRuns: 100 },
      );
    });

    /**
     * **Validates: Requirements 2.1, 2.2, 2.3**
     * Property 5: For any sequence of overlay actions, pauseOverlayOpen && winLossOverlayOpen is never true.
     */
    it('Feature: match-lifecycle, Property 5: overlay stacking never occurs', () => {
      const overlayActionArb = fc.oneof(
        fc.constant('openPause' as const),
        fc.constant('closePause' as const),
        fc.constant('openWinLoss' as const),
        fc.constant('closeWinLoss' as const),
      );

      fc.assert(
        fc.property(fc.array(overlayActionArb, { minLength: 1, maxLength: 30 }), (actions) => {
          useAppStore.setState(initialState);

          for (const action of actions) {
            switch (action) {
              case 'openPause':
                useAppStore.getState().openPauseOverlay();
                break;
              case 'closePause':
                useAppStore.getState().closePauseOverlay();
                break;
              case 'openWinLoss':
                useAppStore.getState().openWinLossOverlay('left', null);
                break;
              case 'closeWinLoss':
                useAppStore.getState().closeWinLossOverlay();
                break;
            }
            const state = useAppStore.getState();
            if (state.pauseOverlayOpen && state.winLossOverlayOpen) return false;
          }
          return true;
        }),
        { numRuns: 100 },
      );
    });

    /**
     * **Validates: Requirements 6.3**
     * Property 6: For any sequence of openPauseOverlay/closePauseOverlay calls,
     * pauseOverlayOpen matches the last action.
     */
    it('Feature: match-lifecycle, Property 6: rapid pause/unpause stability', () => {
      const pauseActionArb = fc.oneof(
        fc.constant('open' as const),
        fc.constant('close' as const),
      );

      fc.assert(
        fc.property(fc.array(pauseActionArb, { minLength: 1, maxLength: 50 }), (actions) => {
          useAppStore.setState(initialState);

          let lastAction: 'open' | 'close' = 'close';
          for (const action of actions) {
            if (action === 'open') {
              useAppStore.getState().openPauseOverlay();
            } else {
              useAppStore.getState().closePauseOverlay();
            }
            lastAction = action;
          }

          const state = useAppStore.getState();
          const expected = lastAction === 'open';
          return state.pauseOverlayOpen === expected;
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('Settings immutability guards (Task 1)', () => {
    it('setWinScore works when phase is menu', () => {
      useAppStore.setState({ ...initialState, phase: 'menu' });
      useAppStore.getState().setWinScore(11);
      expect(useAppStore.getState().winScore).toBe(11);
    });

    it('setWinScore works when phase is settings', () => {
      useAppStore.setState({ ...initialState, phase: 'settings' });
      useAppStore.getState().setWinScore(15);
      expect(useAppStore.getState().winScore).toBe(15);
    });

    it('setWinScore is rejected when phase is playing', () => {
      useAppStore.setState({ ...initialState, phase: 'playing', winScore: 7 });
      useAppStore.getState().setWinScore(15);
      expect(useAppStore.getState().winScore).toBe(7);
    });

    it('setAiDifficulty is rejected when phase is playing', () => {
      useAppStore.setState({ ...initialState, phase: 'playing', aiDifficulty: 'normal' });
      useAppStore.getState().setAiDifficulty('hard');
      expect(useAppStore.getState().aiDifficulty).toBe('normal');
    });

    it('setPowerupsEnabled is rejected when phase is playing', () => {
      useAppStore.setState({ ...initialState, phase: 'playing', powerupsEnabled: false });
      useAppStore.getState().setPowerupsEnabled(true);
      expect(useAppStore.getState().powerupsEnabled).toBe(false);
    });
  });

  describe('Overlay stacking prevention (Task 2)', () => {
    it('openPauseOverlay is rejected when winLossOverlayOpen is true', () => {
      useAppStore.setState({ ...initialState, winLossOverlayOpen: true, pauseOverlayOpen: false });
      useAppStore.getState().openPauseOverlay();
      expect(useAppStore.getState().pauseOverlayOpen).toBe(false);
    });

    it('openWinLossOverlay closes pause overlay if it was open', () => {
      useAppStore.setState({ ...initialState, pauseOverlayOpen: true, winLossOverlayOpen: false });
      useAppStore.getState().openWinLossOverlay('left', null);
      const state = useAppStore.getState();
      expect(state.winLossOverlayOpen).toBe(true);
      expect(state.pauseOverlayOpen).toBe(false);
    });
  });
});
