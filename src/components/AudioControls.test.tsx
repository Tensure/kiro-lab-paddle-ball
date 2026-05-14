import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

vi.mock('../game/systems/AudioManager', () => ({
  default: {
    getState: vi.fn(() => ({ muted: false, volume: 1 })),
    toggleMute: vi.fn(),
    setVolume: vi.fn(),
    isMuted: vi.fn(() => false),
    getVolume: vi.fn(() => 1),
  },
}));

vi.mock('../game/systems/EventBridge', () => {
  const listeners = new Map<string, Set<(payload: unknown) => void>>();
  return {
    default: {
      on: vi.fn((event: string, handler: (payload: unknown) => void) => {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event)!.add(handler);
      }),
      off: vi.fn((event: string, handler: (payload: unknown) => void) => {
        listeners.get(event)?.delete(handler);
      }),
      emit: vi.fn((event: string, payload: unknown) => {
        listeners.get(event)?.forEach((h) => h(payload));
      }),
      removeAllListeners: vi.fn(),
    },
  };
});

import AudioControls from './AudioControls';
import audioManager from '../game/systems/AudioManager';
import eventBridge from '../game/systems/EventBridge';

describe('AudioControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders mute toggle and volume slider', () => {
    render(<AudioControls />);
    expect(screen.getByLabelText(/Mute|Unmute/)).toBeDefined();
    expect(screen.getByLabelText('Volume')).toBeDefined();
  });

  it('mute toggle calls audioManager.toggleMute()', () => {
    render(<AudioControls />);
    fireEvent.click(screen.getByLabelText(/Mute|Unmute/));
    expect(audioManager.toggleMute).toHaveBeenCalled();
  });

  it('volume slider calls audioManager.setVolume()', () => {
    render(<AudioControls />);
    const slider = screen.getByLabelText('Volume') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '0.5' } });
    expect(audioManager.setVolume).toHaveBeenCalledWith(0.5);
  });
});
