import { useEffect } from 'react';
import PhaserContainer from './PhaserContainer';
import PauseOverlay from './PauseOverlay';
import WinLossOverlay from './WinLossOverlay';
import eventBridge from '../game/systems/EventBridge';
import { useAppStore } from '../app/store';
import gameConfig from '../game/config';
import type { PlayerId } from '../game/types/modes';

function GameView(): React.JSX.Element {
  useEffect(() => {
    const handleScoreUpdate = (payload: { left: number; right: number }): void => {
      useAppStore.getState().updateScores(payload.left, payload.right);
    };

    const handleMatchWin = (payload: { winner: PlayerId }): void => {
      useAppStore.getState().openWinLossOverlay(payload.winner, null);
    };

    const handleMatchLoss = (payload: { finalScore: number }): void => {
      useAppStore.getState().openWinLossOverlay(null, payload.finalScore);
    };

    const handleLivesUpdate = (payload: { remaining: number }): void => {
      useAppStore.getState().updateLives(payload.remaining);
    };

    eventBridge.on('score:update', handleScoreUpdate);
    eventBridge.on('match:win', handleMatchWin);
    eventBridge.on('match:loss', handleMatchLoss);
    eventBridge.on('lives:update', handleLivesUpdate);

    return () => {
      eventBridge.off('score:update', handleScoreUpdate);
      eventBridge.off('match:win', handleMatchWin);
      eventBridge.off('match:loss', handleMatchLoss);
      eventBridge.off('lives:update', handleLivesUpdate);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        const state = useAppStore.getState();
        if (!state.pauseOverlayOpen) {
          state.openPauseOverlay();
          eventBridge.emit('match:pause', { paused: true });
        } else {
          state.closePauseOverlay();
          eventBridge.emit('match:pause', { paused: false });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <PhaserContainer config={gameConfig} />
      <PauseOverlay />
      <WinLossOverlay />
    </>
  );
}

export default GameView;
