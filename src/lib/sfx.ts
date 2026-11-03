/**
 * Tiny Web Audio synthesiser shared by the pass-the-phone party games.
 *
 * Every sound is generated live (no audio files, no copyright issues, no
 * loading time). Game-specific cue sheets build on these helpers. One mute
 * switch covers all party-game sound effects.
 */

const MUTE_KEY = 'party-sfx-muted';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = readMuted();
const listeners = new Set<() => void>();

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function isSfxMuted(): boolean {
  return muted;
}

export function setSfxMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  } catch {
    // Storage unavailable: the choice lasts for this visit only
  }
  if (ctx && master) master.gain.setTargetAtTime(value ? 0 : 0.8, ctx.currentTime, 0.05);
  listeners.forEach((fn) => fn());
}

export function subscribeSfxMuted(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** The shared audio context (created on first use, resumed after a user gesture). */
export function audio(): { ctx: AudioContext; out: GainNode } | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.8;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return { ctx, out: master! };
}

/** Seconds from now on the audio clock (or null when audio is unavailable). */
export function now(): number | null {
  const a = audio();
  return a ? a.ctx.currentTime : null;
}

/** Short vibration on phones that support it. */
export function buzz(pattern: number | number[]): void {
  if (muted) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Not supported
  }
}

export interface ToneOptions {
  type?: OscillatorType;
  gain?: number;
  /** Glide to this frequency by the end of the note. */
  endFreq?: number;
  attack?: number;
}

/** One enveloped oscillator note starting at audio time `start`. */
export function tone(freq: number, start: number, duration: number, opts: ToneOptions = {}): void {
  const a = audio();
  if (!a) return;
  const { ctx: c, out } = a;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(freq, start);
  if (opts.endFreq) osc.frequency.exponentialRampToValueAtTime(opts.endFreq, start + duration);
  const peak = opts.gain ?? 0.25;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + (opts.attack ?? 0.01));
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(g).connect(out);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

export interface NoiseOptions {
  gain?: number;
  filter?: BiquadFilterType;
  freq?: number;
  endFreq?: number;
  q?: number;
}

/** A filtered noise burst (drums, whooshes, sparkles). */
export function noise(start: number, duration: number, opts: NoiseOptions = {}): void {
  const a = audio();
  if (!a) return;
  const { ctx: c, out } = a;
  const buffer = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * (duration + 0.05))), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const f = c.createBiquadFilter();
  f.type = opts.filter ?? 'bandpass';
  f.frequency.setValueAtTime(opts.freq ?? 1200, start);
  if (opts.endFreq) f.frequency.exponentialRampToValueAtTime(opts.endFreq, start + duration);
  f.Q.value = opts.q ?? 1;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.2, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  src.connect(f).connect(g).connect(out);
  src.start(start);
  src.stop(start + duration + 0.05);
}

/** Notes played one after another (`step` seconds apart). */
export function arpeggio(freqs: number[], start: number, step: number, duration: number, opts: ToneOptions = {}): void {
  freqs.forEach((f, i) => tone(f, start + i * step, duration, opts));
}

/** Notes played together. */
export function chord(freqs: number[], start: number, duration: number, opts: ToneOptions = {}): void {
  freqs.forEach((f) => tone(f, start, duration, { ...opts, gain: (opts.gain ?? 0.2) / Math.sqrt(freqs.length) }));
}
