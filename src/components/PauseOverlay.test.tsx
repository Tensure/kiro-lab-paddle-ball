import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import PauseOverlay from './PauseOverlay';
import { useAppStore } from '../app/store';

vi.mock('../game/systems/EventBridge', () => ({
  default: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    removeAllListeners: vi.fn(),
  },
}));

describe('PauseOverlay', () => {
  beforeEach(() => {
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

  afterEach(() => {
    cleanup();
  });

  it('renders when pauseOverlayOpen is true', () => {
    useAppStore.setState({ pauseOverlayOpen: true });
    render(<PauseOverlay />);
    expect(screen.getByText('PAUSED')).toBeDefined();
    expect(screen.getByText('Resume')).toBeDefined();
  });

  it('does not render when pauseOverlayOpen is false', () => {
    useAppStore.setState({ pauseOverlayOpen: false });
    render(<PauseOverlay />);
    expect(screen.queryByText('PAUSED')).toBeNull();
  });

  it('Resume button closes overlay', () => {
    useAppStore.setState({ pauseOverlayOpen: true });
    render(<PauseOverlay />);
    fireEvent.click(screen.getByText('Resume'));
    expect(useAppStore.getState().pauseOverlayOpen).toBe(false);
  });
});
