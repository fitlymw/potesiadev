/**
 * Nightfall Deception sound design, synthesised live with the Web Audio API.
 *
 * Nothing is downloaded: the horror night music and every sound effect are
 * generated in the browser, so they are original (no copyright issues) and add
 * no loading time. Every cue is the same for all players, so sounds never leak
 * a secret (there is no "you were poisoned" sound).
 */

const MUTE_KEY = 'nightfall-muted';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = readMuted();
let night: { stop: () => void } | null = null;

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function audio(): { ctx: AudioContext; out: GainNode } | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.9;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return { ctx, out: master! };
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  } catch {
    // ignore
  }
  if (ctx && master) master.gain.setTargetAtTime(value ? 0 : 0.9, ctx.currentTime, 0.05);
}

/** Short vibration on phones that support it. */
export function buzz(pattern: number | number[]): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // ignore
  }
}

function noiseBuffer(c: AudioContext, seconds: number): AudioBuffer {
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** One enveloped oscillator note. */
function tone(freq: number, start: number, duration: number, opts: { type?: OscillatorType; gain?: number; endFreq?: number; attack?: number } = {}): void {
  const a = audio();
  if (!a) return;
  const { ctx: c, out } = a;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(freq, start);
  if (opts.endFreq) osc.frequency.exponentialRampToValueAtTime(opts.endFreq, start + duration);
  const peak = opts.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + (opts.attack ?? 0.01));
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(g).connect(out);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

function noiseBurst(start: number, duration: number, opts: { gain?: number; filter?: BiquadFilterType; freq?: number; endFreq?: number; q?: number } = {}): void {
  const a = audio();
  if (!a) return;
  const { ctx: c, out } = a;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, duration + 0.1);
  const f = c.createBiquadFilter();
  f.type = opts.filter ?? 'bandpass';
  f.frequency.setValueAtTime(opts.freq ?? 1200, start);
  if (opts.endFreq) f.frequency.exponentialRampToValueAtTime(opts.endFreq, start + duration);
  f.Q.value = opts.q ?? 4;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.2, start + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  src.connect(f).connect(g).connect(out);
  src.start(start);
  src.stop(start + duration + 0.1);
}

// ==================== NIGHT MUSIC ====================
/** Starts the looping horror ambience (drone, dissonance, heartbeat, creaks). */
export function startNightMusic(): void {
  if (night) return;
  const a = audio();
  if (!a) return;
  const { ctx: c, out } = a;
  const bus = c.createGain();
  bus.gain.setValueAtTime(0.0001, c.currentTime);
  bus.gain.exponentialRampToValueAtTime(0.8, c.currentTime + 3);
  bus.connect(out);
  const nodes: AudioScheduledSourceNode[] = [];

  // Low detuned drone through a slowly breathing low-pass filter
  const droneFilter = c.createBiquadFilter();
  droneFilter.type = 'lowpass';
  droneFilter.frequency.value = 170;
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 0.06;
  lfoGain.gain.value = 90;
  lfo.connect(lfoGain).connect(droneFilter.frequency);
  const droneGain = c.createGain();
  droneGain.gain.value = 0.16;
  droneFilter.connect(droneGain).connect(bus);
  for (const f of [55, 55.7, 82.4]) {
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = f;
    o.connect(droneFilter);
    nodes.push(o);
  }
  const sub = c.createOscillator();
  const subGain = c.createGain();
  sub.frequency.value = 36.7;
  subGain.gain.value = 0.12;
  sub.connect(subGain).connect(bus);
  nodes.push(sub, lfo);

  // Dissonant minor-second cluster that swells in and out
  const padGain = c.createGain();
  padGain.gain.value = 0.0;
  const padLfo = c.createOscillator();
  const padLfoGain = c.createGain();
  padLfo.frequency.value = 0.045;
  padLfoGain.gain.value = 0.025;
  padLfo.connect(padLfoGain).connect(padGain.gain);
  const padFilter = c.createBiquadFilter();
  padFilter.type = 'bandpass';
  padFilter.frequency.value = 600;
  padFilter.Q.value = 0.8;
  padGain.connect(padFilter).connect(bus);
  for (const f of [233.08, 246.94, 349.23]) {
    const o = c.createOscillator();
    o.type = 'triangle';
    o.frequency.value = f;
    o.connect(padGain);
    nodes.push(o);
  }
  nodes.push(padLfo);
  nodes.forEach((n) => n.start());

  // Heartbeat and random creaks, scheduled on timers
  const beat = () => {
    const t = c.currentTime + 0.05;
    tone(62, t, 0.18, { gain: 0.35, endFreq: 40 });
    tone(58, t + 0.24, 0.16, { gain: 0.25, endFreq: 38 });
  };
  const heart = window.setInterval(beat, 1300);
  let creakTimer = 0;
  const creak = () => {
    const t = c.currentTime + 0.05;
    if (Math.random() < 0.6) noiseBurst(t, 0.9, { gain: 0.06, freq: 900, endFreq: 2600, q: 12 });
    else tone(1760 * (0.97 + Math.random() * 0.06), t, 2.5, { type: 'sine', gain: 0.035, attack: 0.3 });
    creakTimer = window.setTimeout(creak, 5000 + Math.random() * 6000);
  };
  creakTimer = window.setTimeout(creak, 4000);

  night = {
    stop: () => {
      window.clearInterval(heart);
      window.clearTimeout(creakTimer);
      const t = c.currentTime;
      bus.gain.cancelScheduledValues(t);
      bus.gain.setValueAtTime(Math.max(bus.gain.value, 0.0001), t);
      bus.gain.exponentialRampToValueAtTime(0.0001, t + 2);
      window.setTimeout(() => {
        nodes.forEach((n) => { try { n.stop(); } catch { /* already stopped */ } });
        bus.disconnect();
      }, 2200);
    },
  };
}

export function stopNightMusic(): void {
  night?.stop();
  night = null;
}

// ==================== EFFECTS ====================
export function sfxTick(urgent = false): void {
  const a = audio();
  if (!a) return;
  tone(urgent ? 1400 : 1000, a.ctx.currentTime, 0.05, { type: 'square', gain: 0.08 });
}

/** Time ran out on a private turn. */
export function sfxGlitch(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  for (let i = 0; i < 6; i++) noiseBurst(t + i * 0.06, 0.05, { gain: 0.25, filter: 'highpass', freq: 1500 + Math.random() * 3000, q: 1 });
  tone(90, t, 0.35, { type: 'square', gain: 0.12, endFreq: 40 });
}

/** Someone died in the night: a deep, inharmonic funeral bell and a low boom. */
export function sfxDeath(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  tone(45, t, 2.5, { gain: 0.5, endFreq: 30 });
  for (const [ratio, g] of [[1, 0.35], [2.76, 0.18], [5.4, 0.1], [8.9, 0.05]] as const) {
    tone(98 * ratio, t, 5, { type: 'sine', gain: g, attack: 0.01 });
    tone(98 * ratio, t + 2.2, 4, { type: 'sine', gain: g * 0.7, attack: 0.01 });
  }
}

/** A calm morning with no deaths: soft rising chimes. */
export function sfxMorning(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.28, 1.6, { type: 'triangle', gain: 0.14, attack: 0.02 }));
  tone(261.63, t, 2.5, { type: 'sine', gain: 0.08, attack: 0.4 });
}

export function sfxExecution(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  noiseBurst(t, 0.5, { gain: 0.45, filter: 'lowpass', freq: 400, q: 1 });
  tone(130, t, 0.9, { gain: 0.5, endFreq: 38 });
}

/** Discussion is over: a hand bell rings several times — everyone back to their seat. */
export function sfxBell(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  [880, 1046.5, 880, 1046.5, 880, 1046.5].forEach((f, i) => {
    tone(f, t + i * 0.22, 0.9, { type: 'sine', gain: 0.24 });
    tone(f * 2.76, t + i * 0.22, 0.4, { type: 'sine', gain: 0.05 });
  });
}

/** The day is over and night falls: descending wind, a sinking horn and a deep gong. */
export function sfxNightfall(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  noiseBurst(t, 3.2, { gain: 0.16, filter: 'bandpass', freq: 1600, endFreq: 220, q: 2 });
  tone(392, t, 2.4, { type: 'triangle', gain: 0.13, endFreq: 147, attack: 0.15 });
  tone(294, t + 0.3, 2.4, { type: 'triangle', gain: 0.09, endFreq: 110, attack: 0.15 });
  for (const [ratio, g] of [[1, 0.3], [2.4, 0.12], [3.9, 0.06]] as const) tone(73.4 * ratio, t + 0.9, 4, { gain: g, attack: 0.01 });
}

/** The night is over and morning comes: a rising sunrise swell with bird chirps. */
export function sfxDawn(): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  tone(261.63, t, 2.2, { type: 'triangle', gain: 0.12, endFreq: 523.25, attack: 0.6 });
  tone(392, t + 0.2, 2, { type: 'sine', gain: 0.08, endFreq: 783.99, attack: 0.6 });
  [0.9, 1.05, 1.5, 1.62, 1.74].forEach((d, i) => tone(2600 + i * 180, t + d, 0.09, { type: 'sine', gain: 0.07, endFreq: 3600 + i * 150 }));
}

export function sfxVictory(side: 'good' | 'evil'): void {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  const notes = side === 'good' ? [392, 523.25, 659.25, 783.99] : [311.13, 293.66, 233.08, 155.56];
  notes.forEach((f, i) => tone(f, t + i * 0.3, 1.8, { type: side === 'good' ? 'triangle' : 'sawtooth', gain: side === 'good' ? 0.16 : 0.09 }));
}
