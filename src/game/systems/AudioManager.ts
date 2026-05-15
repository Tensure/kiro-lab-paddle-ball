import type { AudioState } from '../types/events';
import type { AudioEventName } from '../types/audio';
import eventBridge from './EventBridge';
import { getSynthFunctions, type SynthFunction } from './audio/SynthEngine';

export type { AudioState };

export interface IAudioManager {
  /** Initialize the audio system — creates AudioContext, subscribes to EventBridge */
  init(): void;

  /** Destroy the audio system — closes context, unsubscribes, cleans up */
  destroy(): void;

  /** Get current mute state */
  isMuted(): boolean;

  /** Set mute state */
  setMuted(muted: boolean): void;

  /** Toggle mute state */
  toggleMute(): void;

  /** Get current volume level [0.0, 1.0] */
  getVolume(): number;

  /** Set volume level — clamped to [0.0, 1.0] */
  setVolume(volume: number): void;

  /** Get combined audio state snapshot */
  getState(): AudioState;
}

const AUDIO_EVENTS: AudioEventName[] = [
  'audio:paddle-hit',
  'audio:wall-bounce',
  'audio:brick-break',
  'audio:score-point',
  'audio:life-loss',
  'audio:powerup-pickup',
  'audio:powerup-expire',
  'audio:pause',
  'audio:win',
  'audio:loss',
];

function clampVolume(value: number): number {
  if (Number.isNaN(value) || value === -Infinity) return 0.0;
  if (value === Infinity) return 1.0;
  return Math.max(0, Math.min(1, value));
}

class AudioManager implements IAudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;
  private volume = 1.0;
  private initialized = false;
  private handlers: Map<AudioEventName, () => void> = new Map();
  private resumeCleanup: (() => void) | null = null;
  private synthFunctions: Record<AudioEventName, SynthFunction> | null = null;

  init(): void {
    // Guard against double-init
    if (this.initialized && this.audioContext) {
      return;
    }

    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = this.muted ? 0 : this.volume;

    this.synthFunctions = getSynthFunctions();

    // Subscribe to all 9 audio events
    for (const eventName of AUDIO_EVENTS) {
      const handler = (): void => {
        this.playSound(eventName);
      };
      this.handlers.set(eventName, handler);
      eventBridge.on(eventName, handler);
    }

    this.handleAutoplayPolicy();
    this.initialized = true;
  }

  destroy(): void {
    // Guard against double-destroy
    if (!this.initialized) {
      return;
    }

    // Unsubscribe all handlers from EventBridge
    for (const [eventName, handler] of this.handlers) {
      eventBridge.off(eventName, handler);
    }
    this.handlers.clear();

    // Remove autoplay listeners
    if (this.resumeCleanup) {
      this.resumeCleanup();
      this.resumeCleanup = null;
    }

    // Close AudioContext
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.masterGain = null;
    this.synthFunctions = null;
    this.initialized = false;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    if (this.muted === muted) return;
    this.muted = muted;

    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : this.volume;
    }

    eventBridge.emit('audio:state-change', { muted: this.muted, volume: this.volume });
  }

  toggleMute(): void {
    this.setMuted(!this.muted);
  }

  getVolume(): number {
    return this.volume;
  }

  setVolume(volume: number): void {
    const clamped = clampVolume(volume);
    if (this.volume === clamped) return;
    this.volume = clamped;

    if (this.masterGain && !this.muted) {
      this.masterGain.gain.value = this.volume;
    }

    eventBridge.emit('audio:state-change', { muted: this.muted, volume: this.volume });
  }

  getState(): AudioState {
    return { muted: this.muted, volume: this.volume };
  }

  private playSound(eventName: AudioEventName): void {
    if (!this.initialized) return;
    if (this.muted) return;
    if (!this.audioContext || this.audioContext.state === 'suspended') return;
    if (!this.masterGain) return;
    if (!this.synthFunctions) return;

    const synthFn = this.synthFunctions[eventName];
    if (synthFn) {
      synthFn(this.audioContext, this.masterGain, this.audioContext.currentTime);
    }
  }

  private handleAutoplayPolicy(): void {
    if (!this.audioContext || this.audioContext.state !== 'suspended') return;

    const resume = (): void => {
      if (this.audioContext) {
        this.audioContext.resume();
      }
      document.removeEventListener('click', resume);
      document.removeEventListener('keydown', resume);
      this.resumeCleanup = null;
    };

    document.addEventListener('click', resume, { once: true });
    document.addEventListener('keydown', resume, { once: true });

    this.resumeCleanup = () => {
      document.removeEventListener('click', resume);
      document.removeEventListener('keydown', resume);
    };
  }
}

/** Singleton AudioManager instance */
const audioManager = new AudioManager();
export default audioManager;
