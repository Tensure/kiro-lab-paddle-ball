import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { AudioState } from '../../types/events';

// --- Mock AudioContext and related Web Audio nodes ---

function createMockGainNode() {
  return {
    gain: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

function createMockAudioContext(state: AudioContextState = 'running') {
  const mockGain = createMockGainNode();
  return {
    state,
    currentTime: 0,
    destination: {},
    createGain: vi.fn(() => mockGain),
    createOscillator: vi.fn(() => ({
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    })),
    resume: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
    _mockGain: mockGain,
  };
}

let mockContextState: AudioContextState = 'running';
let mockContextInstance: ReturnType<typeof createMockAudioContext> | null = null;

vi.stubGlobal('AudioContext', vi.fn(function () {
  mockContextInstance = createMockAudioContext(mockContextState);
  return mockContextInstance;
}));

describe('AudioManager', () => {
  let audioManager: typeof import('../AudioManager').default;
  let eventBridge: typeof import('../EventBridge').default;

  beforeEach(async () => {
    vi.resetModules();
    mockContextState = 'running';
    mockContextInstance = null;

    // Re-stub AudioContext after resetModules
    vi.stubGlobal('AudioContext', vi.fn(function () {
      mockContextInstance = createMockAudioContext(mockContextState);
      return mockContextInstance;
    }));

    const ebModule = await import('../EventBridge');
    eventBridge = ebModule.default;
    eventBridge.removeAllListeners();

    const amModule = await import('../AudioManager');
    audioManager = amModule.default;
  });

  afterEach(() => {
    audioManager.destroy();
    eventBridge.removeAllListeners();
  });

  // --- Lifecycle tests ---

  it('init creates AudioContext', () => {
    audioManager.init();
    expect(AudioContext).toHaveBeenCalledTimes(1);
  });

  it('init subscribes to all 9 audio events on EventBridge', () => {
    const onSpy = vi.spyOn(eventBridge, 'on');
    audioManager.init();

    const audioEvents = [
      'audio:paddle-hit',
      'audio:wall-bounce',
      'audio:brick-break',
      'audio:score-point',
      'audio:life-loss',
      'audio:powerup-pickup',
      'audio:pause',
      'audio:win',
      'audio:loss',
    ];

    for (const event of audioEvents) {
      expect(onSpy).toHaveBeenCalledWith(event, expect.any(Function));
    }
    expect(onSpy).toHaveBeenCalledTimes(10);
  });

  it('destroy unsubscribes all handlers from EventBridge', () => {
    const offSpy = vi.spyOn(eventBridge, 'off');
    audioManager.init();
    audioManager.destroy();

    expect(offSpy).toHaveBeenCalledTimes(10);
  });

  it('destroy closes AudioContext', () => {
    audioManager.init();
    const ctx = mockContextInstance!;
    audioManager.destroy();
    expect(ctx.close).toHaveBeenCalled();
  });

  it('double-init does not create second context', () => {
    audioManager.init();
    audioManager.init();
    expect(AudioContext).toHaveBeenCalledTimes(1);
  });

  it('double-destroy is idempotent', () => {
    audioManager.init();
    audioManager.destroy();
    expect(() => audioManager.destroy()).not.toThrow();
  });

  it('re-init after destroy creates fresh context', () => {
    audioManager.init();
    audioManager.destroy();
    audioManager.init();
    expect(AudioContext).toHaveBeenCalledTimes(2);
  });

  // --- Mute tests ---

  it('isMuted() defaults to false', () => {
    audioManager.init();
    expect(audioManager.isMuted()).toBe(false);
  });

  it('setMuted(true) sets gain to 0', () => {
    audioManager.init();
    audioManager.setMuted(true);
    expect(mockContextInstance!._mockGain.gain.value).toBe(0);
  });

  it('setMuted(false) restores gain to volume level', () => {
    audioManager.init();
    audioManager.setVolume(0.7);
    audioManager.setMuted(true);
    audioManager.setMuted(false);
    expect(mockContextInstance!._mockGain.gain.value).toBe(0.7);
  });

  it('toggleMute flips state', () => {
    audioManager.init();
    expect(audioManager.isMuted()).toBe(false);
    audioManager.toggleMute();
    expect(audioManager.isMuted()).toBe(true);
    audioManager.toggleMute();
    expect(audioManager.isMuted()).toBe(false);
  });

  // --- Volume tests ---

  it('getVolume() defaults to 1.0', () => {
    audioManager.init();
    expect(audioManager.getVolume()).toBe(1.0);
  });

  it('setVolume clamps values to [0, 1]', () => {
    audioManager.init();
    audioManager.setVolume(1.5);
    expect(audioManager.getVolume()).toBe(1.0);
    audioManager.setVolume(-0.5);
    expect(audioManager.getVolume()).toBe(0.0);
  });

  it('setVolume(NaN) clamps to 0', () => {
    audioManager.init();
    audioManager.setVolume(NaN);
    expect(audioManager.getVolume()).toBe(0.0);
  });

  it('getState() returns combined state', () => {
    audioManager.init();
    audioManager.setVolume(0.5);
    audioManager.setMuted(true);
    const state = audioManager.getState();
    expect(state).toEqual({ muted: true, volume: 0.5 });
  });

  // --- State change event ---

  it('state change emits audio:state-change event on mute', () => {
    audioManager.init();
    let received: AudioState | null = null;
    eventBridge.on('audio:state-change', (payload) => {
      received = payload;
    });
    audioManager.setMuted(true);
    expect(received).toEqual({ muted: true, volume: 1.0 });
  });

  it('state change emits audio:state-change event on volume change', () => {
    audioManager.init();
    let received: AudioState | null = null;
    eventBridge.on('audio:state-change', (payload) => {
      received = payload;
    });
    audioManager.setVolume(0.3);
    expect(received).toEqual({ muted: false, volume: 0.3 });
  });

  // --- Autoplay policy tests ---

  it('suspended context registers resume listeners', () => {
    mockContextState = 'suspended';
    const addSpy = vi.spyOn(document, 'addEventListener');
    audioManager.init();

    expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function), { once: true });
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function), { once: true });
    addSpy.mockRestore();
  });

  it('resume called on simulated user gesture', () => {
    mockContextState = 'suspended';
    audioManager.init();
    const ctx = mockContextInstance!;

    document.dispatchEvent(new Event('click'));
    expect(ctx.resume).toHaveBeenCalled();
  });

  it('listeners removed after resume', () => {
    mockContextState = 'suspended';
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    audioManager.init();

    document.dispatchEvent(new Event('click'));
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('destroy removes autoplay listeners', () => {
    mockContextState = 'suspended';
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    audioManager.init();
    audioManager.destroy();

    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeSpy.mockRestore();
  });
});
