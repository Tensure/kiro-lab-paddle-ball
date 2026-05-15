import type { AudioEventName } from '../../types/audio';

/** Synthesis function signature — creates and schedules audio nodes for a single sound cue */
export type SynthFunction = (ctx: AudioContext, destination: AudioNode, time: number) => void;

/** Paddle hit: square wave, 220→440Hz sweep, ~80ms */
function paddleHit(ctx: AudioContext, destination: AudioNode, time: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(220, time);
  osc.frequency.linearRampToValueAtTime(440, time + 0.08);

  gain.gain.setValueAtTime(0.3, time);
  gain.gain.linearRampToValueAtTime(0, time + 0.08);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(time);
  osc.stop(time + 0.08);
}

/** Wall bounce: triangle wave, 330Hz, ~60ms */
function wallBounce(ctx: AudioContext, destination: AudioNode, time: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(330, time);

  gain.gain.setValueAtTime(0.3, time);
  gain.gain.linearRampToValueAtTime(0, time + 0.06);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(time);
  osc.stop(time + 0.06);
}

/** Brick break: sawtooth, 440→110Hz sweep down, ~120ms */
function brickBreak(ctx: AudioContext, destination: AudioNode, time: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(440, time);
  osc.frequency.linearRampToValueAtTime(110, time + 0.12);

  gain.gain.setValueAtTime(0.3, time);
  gain.gain.linearRampToValueAtTime(0, time + 0.12);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(time);
  osc.stop(time + 0.12);
}

/** Score point: sine, 523→784Hz sweep up, ~200ms */
function scorePoint(ctx: AudioContext, destination: AudioNode, time: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(523, time);
  osc.frequency.linearRampToValueAtTime(784, time + 0.2);

  gain.gain.setValueAtTime(0.3, time);
  gain.gain.linearRampToValueAtTime(0, time + 0.2);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(time);
  osc.stop(time + 0.2);
}

/** Life loss: sawtooth, 200→80Hz sweep down, ~400ms */
function lifeLoss(ctx: AudioContext, destination: AudioNode, time: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, time);
  osc.frequency.linearRampToValueAtTime(80, time + 0.4);

  gain.gain.setValueAtTime(0.3, time);
  gain.gain.linearRampToValueAtTime(0, time + 0.4);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(time);
  osc.stop(time + 0.4);
}

/** Powerup pickup: sine arpeggio 660→880→1100Hz, ~300ms */
function powerupPickup(ctx: AudioContext, destination: AudioNode, time: number): void {
  const notes = [660, 880, 1100];
  const noteDuration = 0.1;

  for (let i = 0; i < notes.length; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const noteStart = time + i * noteDuration;
    osc.frequency.setValueAtTime(notes[i], noteStart);

    gain.gain.setValueAtTime(0.3, noteStart);
    gain.gain.linearRampToValueAtTime(0, noteStart + noteDuration);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(noteStart);
    osc.stop(noteStart + noteDuration);
  }
}

/** Powerup expire: short descending tone 880→330Hz, ~150ms */
function powerupExpire(ctx: AudioContext, destination: AudioNode, time: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, time);
  osc.frequency.linearRampToValueAtTime(330, time + 0.15);

  gain.gain.setValueAtTime(0.25, time);
  gain.gain.linearRampToValueAtTime(0, time + 0.15);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(time);
  osc.stop(time + 0.15);
}

/** Pause: sine, 440Hz, ~150ms */
function pause(ctx: AudioContext, destination: AudioNode, time: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, time);

  gain.gain.setValueAtTime(0.3, time);
  gain.gain.linearRampToValueAtTime(0, time + 0.15);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(time);
  osc.stop(time + 0.15);
}

/** Win: sine arpeggio C5→E5→G5→C6, ~800ms */
function win(ctx: AudioContext, destination: AudioNode, time: number): void {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  const noteDuration = 0.2;

  for (let i = 0; i < notes.length; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const noteStart = time + i * noteDuration;
    osc.frequency.setValueAtTime(notes[i], noteStart);

    gain.gain.setValueAtTime(0.3, noteStart);
    gain.gain.linearRampToValueAtTime(0, noteStart + noteDuration);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(noteStart);
    osc.stop(noteStart + noteDuration);
  }
}

/** Loss: sawtooth, 200→100→50Hz descending, ~600ms */
function loss(ctx: AudioContext, destination: AudioNode, time: number): void {
  const notes = [200, 100, 50];
  const noteDuration = 0.2;

  for (let i = 0; i < notes.length; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    const noteStart = time + i * noteDuration;
    osc.frequency.setValueAtTime(notes[i], noteStart);

    gain.gain.setValueAtTime(0.3, noteStart);
    gain.gain.linearRampToValueAtTime(0, noteStart + noteDuration);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(noteStart);
    osc.stop(noteStart + noteDuration);
  }
}

/** Returns a record mapping each AudioEventName to its synthesis function */
export function getSynthFunctions(): Record<AudioEventName, SynthFunction> {
  return {
    'audio:paddle-hit': paddleHit,
    'audio:wall-bounce': wallBounce,
    'audio:brick-break': brickBreak,
    'audio:score-point': scorePoint,
    'audio:life-loss': lifeLoss,
    'audio:powerup-pickup': powerupPickup,
    'audio:powerup-expire': powerupExpire,
    'audio:pause': pause,
    'audio:win': win,
    'audio:loss': loss,
  };
}
