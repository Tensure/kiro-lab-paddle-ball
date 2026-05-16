import { useEffect, useRef } from 'react';
import PauseOverlay from './PauseOverlay';
import WinLossOverlay from './WinLossOverlay';
import eventBridge from '../game/systems/EventBridge';
import { setLaunchPayload } from '../game/systems/SceneLauncher';
import audioManager from '../game/systems/AudioManager';
import { useAppStore } from '../app/store';
import type { PlayerId } from '../game/types/modes';
import type { SceneLaunchPayload } from '../game/types/payload';
import type { MatchSettings } from '../game/types/settings';
import Phaser from 'phaser';
import PongScene from '../game/scenes/PongScene';
import BreakoutScene from '../game/scenes/BreakoutScene';

function GameView(): React.JSX.Element {
  const selectedMode = useAppStore((s) => s.selectedMode);
  const winScore = useAppStore((s) => s.winScore);
  const aiDifficulty = useAppStore((s) => s.aiDifficulty);
  const powerupsEnabled = useAppStore((s) => s.powerupsEnabled);
  const ballSpeedPreset = useAppStore((s) => s.ballSpeedPreset);
  const paddleSizePreset = useAppStore((s) => s.paddleSizePreset);
  const speedIncreasePreset = useAppStore((s) => s.speedIncreasePreset);
  const startingLives = useAppStore((s) => s.startingLives);
  const brickDensity = useAppStore((s) => s.brickDensity);
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build launch payload from store state
  const buildPayload = (): SceneLaunchPayload => {
    let settings: MatchSettings;
    let players: PlayerId[];

    switch (selectedMode) {
      case 'pong-solo':
        settings = { mode: 'pong-solo', winScore, aiDifficulty, powerupsEnabled, ballSpeedPreset, paddleSizePreset, speedIncreasePreset };
        players = ['left', 'right'];
        break;
      case 'pong-versus':
        settings = { mode: 'pong-versus', winScore, powerupsEnabled, ballSpeedPreset, paddleSizePreset, speedIncreasePreset };
        players = ['left', 'right'];
        break;
      case 'breakout':
      default:
        settings = { mode: 'breakout', powerupsEnabled, ballSpeedPreset, paddleSizePreset, speedIncreasePreset, startingLives, brickDensity };
        players = ['solo'];
        break;
    }

    return { settings, players };
  };

  // Mount Phaser game and start the correct scene
  useEffect(() => {
    if (gameRef.current || !containerRef.current) return;

    // Initialize audio system (creates AudioContext, subscribes to EventBridge audio events)
    audioManager.init();

    const payload = buildPayload();

    // Store payload in module-level variable for reliable scene access
    setLaunchPayload(payload);

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: containerRef.current,
      backgroundColor: '#111111',
      physics: {
        default: 'arcade',
        arcade: { debug: false },
      },
      input: {
        keyboard: {
          target: window,
        },
      },
      // Empty scene array — we add and start manually after boot
      scene: [],
      callbacks: {
        postBoot: (g: Phaser.Game) => {
          if (payload.settings.mode === 'breakout') {
            g.scene.add('BreakoutScene', BreakoutScene, true, payload);
          } else {
            g.scene.add('PongScene', PongScene, true, payload);
          }
        },
      },
    });

    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
      audioManager.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // EventBridge subscriptions for scene events
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

  // Escape key for pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        const state = useAppStore.getState();
        if (state.winLossOverlayOpen) return;
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
      <div ref={containerRef} />
      <PauseOverlay />
      <WinLossOverlay />
    </>
  );
}

export default GameView;
