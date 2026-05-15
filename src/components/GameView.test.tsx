import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { useAppStore } from '../app/store';

// Stub AudioContext for AudioManager.init()
vi.stubGlobal('AudioContext', vi.fn(function () {
  return {
    state: 'running',
    currentTime: 0,
    destination: {},
    createGain: vi.fn(() => ({ gain: { value: 1 }, connect: vi.fn(), disconnect: vi.fn() })),
    createOscillator: vi.fn(() => ({ connect: vi.fn(), start: vi.fn(), stop: vi.fn(), frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() }, type: 'sine' })),
    resume: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
  };
}));

vi.mock('phaser', () => {
  class GameMock {
    destroy = vi.fn();
    scene = { add: vi.fn(), start: vi.fn() };
    events = { once: vi.fn() };
    constructor(config: { callbacks?: { postBoot?: (g: unknown) => void } }) {
      // Simulate postBoot callback
      if (config?.callbacks?.postBoot) {
        config.callbacks.postBoot(this);
      }
    }
  }
  class SceneMock {
    constructor() {}
  }
  return {
    default: { Game: GameMock, Scene: SceneMock, AUTO: 0, Math: { FloatBetween: () => 0 } },
    Game: GameMock,
    Scene: SceneMock,
    AUTO: 0,
  };
});

const onSpy = vi.fn();
const offSpy = vi.fn();

vi.mock('../game/systems/EventBridge', () => ({
  default: {
    on: (...args: unknown[]) => onSpy(...args),
    off: (...args: unknown[]) => offSpy(...args),
    emit: vi.fn(),
    removeAllListeners: vi.fn(),
  },
}));

import GameView from './GameView';

describe('GameView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    useAppStore.setState({
      phase: 'playing',
      selectedMode: 'pong-solo',
      winScore: 7,
      aiDifficulty: 'normal',
      powerupsEnabled: false,
      pauseOverlayOpen: false,
      winLossOverlayOpen: false,
      matchData: { scores: { left: 0, right: 0 }, lives: 3, winner: null, finalScore: null },
    });
  });

  it('subscribes to EventBridge events on mount', () => {
    render(<GameView />);
    const subscribedEvents = onSpy.mock.calls.map((call) => call[0]);
    expect(subscribedEvents).toContain('score:update');
    expect(subscribedEvents).toContain('match:win');
    expect(subscribedEvents).toContain('match:loss');
    expect(subscribedEvents).toContain('lives:update');
  });

  it('unsubscribes on unmount', () => {
    const { unmount } = render(<GameView />);
    unmount();
    const unsubscribedEvents = offSpy.mock.calls.map((call) => call[0]);
    expect(unsubscribedEvents).toContain('score:update');
    expect(unsubscribedEvents).toContain('match:win');
    expect(unsubscribedEvents).toContain('match:loss');
    expect(unsubscribedEvents).toContain('lives:update');
  });

  describe('Escape key guard (Task 3)', () => {
    it('Escape does nothing when winLossOverlayOpen is true', () => {
      useAppStore.setState({ winLossOverlayOpen: true, pauseOverlayOpen: false });
      render(<GameView />);

      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      document.dispatchEvent(event);

      const state = useAppStore.getState();
      expect(state.pauseOverlayOpen).toBe(false);
      expect(state.winLossOverlayOpen).toBe(true);
    });

    it('Escape toggles pause when winLossOverlayOpen is false', () => {
      useAppStore.setState({ winLossOverlayOpen: false, pauseOverlayOpen: false });
      render(<GameView />);

      // First Escape opens pause
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(useAppStore.getState().pauseOverlayOpen).toBe(true);

      // Second Escape closes pause
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(useAppStore.getState().pauseOverlayOpen).toBe(false);
    });
  });
});
