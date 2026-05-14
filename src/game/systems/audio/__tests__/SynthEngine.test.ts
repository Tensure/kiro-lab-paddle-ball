import { describe, it, expect, vi } from 'vitest';
import { getSynthFunctions } from '../SynthEngine';
import type { AudioEventName } from '../../../types/audio';

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

function createMockAudioContext() {
  return {
    state: 'running' as AudioContextState,
    currentTime: 0,
    destination: {},
    createGain: vi.fn(() => createMockGainNode()),
    createOscillator: vi.fn(() => createMockOscillator()),
    resume: vi.fn(),
    close: vi.fn(),
  } as unknown as AudioContext;
}

const ALL_AUDIO_EVENTS: AudioEventName[] = [
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

describe('SynthEngine', () => {
  it('getSynthFunctions returns a function for each of the 9 AudioEventName values', () => {
    const fns = getSynthFunctions();

    for (const event of ALL_AUDIO_EVENTS) {
      expect(fns[event]).toBeDefined();
      expect(typeof fns[event]).toBe('function');
    }

    expect(Object.keys(fns)).toHaveLength(9);
  });

  describe('each synth function', () => {
    for (const eventName of ALL_AUDIO_EVENTS) {
      describe(eventName, () => {
        it('calls createOscillator or createGain on the provided context', () => {
          const ctx = createMockAudioContext();
          const destination = createMockGainNode();
          const fns = getSynthFunctions();

          fns[eventName](ctx, destination as unknown as AudioNode, 0);

          const oscCalls = (ctx.createOscillator as ReturnType<typeof vi.fn>).mock.calls.length;
          const gainCalls = (ctx.createGain as ReturnType<typeof vi.fn>).mock.calls.length;
          expect(oscCalls + gainCalls).toBeGreaterThan(0);
        });

        it('connects nodes to the provided destination', () => {
          const ctx = createMockAudioContext();
          const destination = createMockGainNode();
          const fns = getSynthFunctions();

          fns[eventName](ctx, destination as unknown as AudioNode, 0);

          // At least one gain node should connect to the destination
          const gainNodes = (ctx.createGain as ReturnType<typeof vi.fn>).mock.results;
          const connectedToDestination = gainNodes.some(
            (result: { value: ReturnType<typeof createMockGainNode> }) =>
              result.value.connect.mock.calls.some(
                (call: unknown[]) => call[0] === destination,
              ),
          );
          expect(connectedToDestination).toBe(true);
        });

        it('schedules start and stop times', () => {
          const ctx = createMockAudioContext();
          const destination = createMockGainNode();
          const fns = getSynthFunctions();

          fns[eventName](ctx, destination as unknown as AudioNode, 0);

          const oscillators = (ctx.createOscillator as ReturnType<typeof vi.fn>).mock.results;
          expect(oscillators.length).toBeGreaterThan(0);

          for (const result of oscillators) {
            const osc = result.value;
            expect(osc.start).toHaveBeenCalled();
            expect(osc.stop).toHaveBeenCalled();
          }
        });
      });
    }
  });
});
