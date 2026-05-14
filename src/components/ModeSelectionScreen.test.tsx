import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ModeSelectionScreen from './ModeSelectionScreen';
import { useAppStore } from '../app/store';

describe('ModeSelectionScreen', () => {
  beforeEach(() => {
    useAppStore.setState({
      phase: 'menu',
      selectedMode: null,
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

  it('renders three mode buttons (Pong: Solo, Pong: Versus, Breakout)', () => {
    render(<ModeSelectionScreen />);
    expect(screen.getByText('Pong: Solo')).toBeDefined();
    expect(screen.getByText('Pong: Versus')).toBeDefined();
    expect(screen.getByText('Breakout')).toBeDefined();
  });

  it('clicking a mode button transitions store to settings phase', () => {
    render(<ModeSelectionScreen />);
    fireEvent.click(screen.getByText('Pong: Solo'));
    const state = useAppStore.getState();
    expect(state.phase).toBe('settings');
    expect(state.selectedMode).toBe('pong-solo');
  });

  it('all buttons have accessible text content', () => {
    render(<ModeSelectionScreen />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0].textContent).toBe('Pong: Solo');
    expect(buttons[1].textContent).toBe('Pong: Versus');
    expect(buttons[2].textContent).toBe('Breakout');
  });
});
