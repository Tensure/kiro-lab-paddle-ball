import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import SettingsPanel from './SettingsPanel';
import { useAppStore } from '../app/store';

describe('SettingsPanel', () => {
  beforeEach(() => {
    useAppStore.setState({
      phase: 'settings',
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

  it('pong-solo mode shows win score, AI difficulty, and powerups controls', () => {
    useAppStore.setState({ selectedMode: 'pong-solo' });
    render(<SettingsPanel />);
    expect(screen.getByLabelText('Win Score')).toBeDefined();
    expect(screen.getByText('Easy')).toBeDefined();
    expect(screen.getByText('Normal')).toBeDefined();
    expect(screen.getByText('Hard')).toBeDefined();
    expect(screen.getByText(/Powerups/)).toBeDefined();
  });

  it('pong-versus mode shows win score and powerups (no AI difficulty)', () => {
    useAppStore.setState({ selectedMode: 'pong-versus' });
    render(<SettingsPanel />);
    expect(screen.getByLabelText('Win Score')).toBeDefined();
    expect(screen.getByText(/Powerups/)).toBeDefined();
    expect(screen.queryByText('Easy')).toBeNull();
    expect(screen.queryByText('Normal')).toBeNull();
    expect(screen.queryByText('Hard')).toBeNull();
  });

  it('breakout mode shows only powerups', () => {
    useAppStore.setState({ selectedMode: 'breakout' });
    render(<SettingsPanel />);
    expect(screen.getByText(/Powerups/)).toBeDefined();
    expect(screen.queryByLabelText('Win Score')).toBeNull();
    expect(screen.queryByText('Easy')).toBeNull();
  });

  it('win score defaults to 7', () => {
    useAppStore.setState({ selectedMode: 'pong-solo' });
    render(<SettingsPanel />);
    const input = screen.getByLabelText('Win Score') as HTMLInputElement;
    expect(input.value).toBe('7');
  });

  it('Start button calls startMatch when settings valid', () => {
    useAppStore.setState({ selectedMode: 'pong-solo' });
    render(<SettingsPanel />);
    fireEvent.click(screen.getByText('Start'));
    expect(useAppStore.getState().phase).toBe('playing');
  });

  it('Back button calls goToMenu', () => {
    useAppStore.setState({ selectedMode: 'pong-solo' });
    render(<SettingsPanel />);
    fireEvent.click(screen.getByText('Back'));
    expect(useAppStore.getState().phase).toBe('menu');
  });
});
