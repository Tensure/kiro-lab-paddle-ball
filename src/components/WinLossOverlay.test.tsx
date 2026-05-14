import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WinLossOverlay from './WinLossOverlay';
import { useAppStore } from '../app/store';

describe('WinLossOverlay', () => {
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

  it('renders when winLossOverlayOpen is true', () => {
    useAppStore.setState({
      winLossOverlayOpen: true,
      matchData: { scores: { left: 7, right: 3 }, lives: 3, winner: 'left', finalScore: null },
    });
    render(<WinLossOverlay />);
    expect(screen.getByText(/Wins!/)).toBeDefined();
  });

  it('displays winner for Pong win', () => {
    useAppStore.setState({
      winLossOverlayOpen: true,
      matchData: { scores: { left: 7, right: 3 }, lives: 3, winner: 'left', finalScore: null },
    });
    render(<WinLossOverlay />);
    expect(screen.getByText('Player Left Wins!')).toBeDefined();
  });

  it('displays final score for Breakout loss', () => {
    useAppStore.setState({
      winLossOverlayOpen: true,
      matchData: { scores: { left: 0, right: 0 }, lives: 0, winner: null, finalScore: 42 },
    });
    render(<WinLossOverlay />);
    expect(screen.getByText('Game Over')).toBeDefined();
    expect(screen.getByText('Score: 42')).toBeDefined();
  });

  it('Return to Menu calls goToMenu', () => {
    useAppStore.setState({
      winLossOverlayOpen: true,
      matchData: { scores: { left: 7, right: 3 }, lives: 3, winner: 'left', finalScore: null },
    });
    const { getByRole } = render(<WinLossOverlay />);
    const menuBtn = getByRole('button', { name: 'Return to Menu' });
    fireEvent.click(menuBtn);
    expect(useAppStore.getState().phase).toBe('menu');
    expect(useAppStore.getState().winLossOverlayOpen).toBe(false);
  });
});
