import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { useAppStore } from '../app/store';

vi.mock('phaser', () => {
  class GameMock {
    destroy = vi.fn();
    constructor() {}
  }
  class SceneMock {
    constructor() {}
  }
  return {
    default: { Game: GameMock, Scene: SceneMock, AUTO: 0 },
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
});
