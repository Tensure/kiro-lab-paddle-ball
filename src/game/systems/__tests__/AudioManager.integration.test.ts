import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// --- Mock AudioContext and related Web Audio nodes ---

function createMockOscillator() {
  return {
    type: 'sine',
    frequency: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
}

function createMockGainNode() {
  return {
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

let mockContextState: AudioContextState = 'running';

vi.stubGlobal('AudioContext', vi.fn(function () {
  // The first createGain call is for the master gain node
  // Subsequent calls are from synth functions
  let callCount = 0;
  return {
    state: mockContextState,
    currentTime: 0,
    destination: {},
    createGain: vi.fn(() => {
      callCount++;
      const node = createMockGainNode();
      // First call is master gain — connect to destination
      if (callCount === 1) {
        node.gain.value = 1;
      }
      return node;
    }),
    createOscillator: vi.fn(() => createMockOscillator()),
    resume: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
  };
}));

describe('AudioManager Integration', () => {
  let audioManager: typeof import('../AudioManager').default;
  let eventBridge: typeof import('../EventBridge').default;

  beforeEach(async () => {
    vi.resetModules();
    mockContextState = 'running';

    // Re-stub AudioContext after resetModules
    let callCount = 0;
    vi.stubGlobal('AudioContext', vi.fn(function () {
      callCount = 0;
      return {
        state: mockContextState,
        currentTime: 0,
        destination: {},
        createGain: vi.fn(() => {
          callCount++;
          return createMockGainNode();
        }),
        createOscillator: vi.fn(() => createMockOscillator()),
        resume: vi.fn(() => Promise.resolve()),
        close: vi.fn(() => Promise.resolve()),
      };
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

  it('emit audio:paddle-hit triggers synth function', () => {
    audioManager.init();
    // After init, emit an audio event — should call createOscillator on the context
    const ctx = (AudioContext as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
    const oscCallsBefore = ctx.createOscillator.mock.calls.length;

    eventBridge.emit('audio:paddle-hit');

    expect(ctx.createOscillator.mock.calls.length).toBeGreaterThan(oscCallsBefore);
  });

  it('emit audio event while muted does not trigger synth', () => {
    audioManager.init();
    audioManager.setMuted(true);
    const ctx = (AudioContext as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
    const oscCallsBefore = ctx.createOscillator.mock.calls.length;

    eventBridge.emit('audio:paddle-hit');

    expect(ctx.createOscillator.mock.calls.length).toBe(oscCallsBefore);
  });

  it('emit audio event while context suspended does not trigger synth', () => {
    mockContextState = 'suspended';

    // Re-stub for suspended state
    vi.stubGlobal('AudioContext', vi.fn(function () {
      return {
        state: 'suspended',
        currentTime: 0,
        destination: {},
        createGain: vi.fn(() => createMockGainNode()),
        createOscillator: vi.fn(() => createMockOscillator()),
        resume: vi.fn(() => Promise.resolve()),
        close: vi.fn(() => Promise.resolve()),
      };
    }));

    // Need to re-import with fresh modules for the suspended context
    // Since we already imported, just test with the current setup
    audioManager.init();
    const ctx = (AudioContext as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
    const oscCallsBefore = ctx.createOscillator.mock.calls.length;

    eventBridge.emit('audio:wall-bounce');

    expect(ctx.createOscillator.mock.calls.length).toBe(oscCallsBefore);
  });

  it('emit multiple events rapidly triggers each independently', () => {
    audioManager.init();
    const ctx = (AudioContext as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
    const oscCallsBefore = ctx.createOscillator.mock.calls.length;

    eventBridge.emit('audio:paddle-hit');
    eventBridge.emit('audio:wall-bounce');
    eventBridge.emit('audio:brick-break');

    // Each event should create at least one oscillator
    expect(ctx.createOscillator.mock.calls.length).toBeGreaterThanOrEqual(oscCallsBefore + 3);
  });

  it('emit unrecognized event causes no error', () => {
    audioManager.init();
    // Emitting an event that's not an audio event should not throw
    expect(() => {
      eventBridge.emit('placeholder:ping', { timestamp: 1 });
    }).not.toThrow();
  });
});
