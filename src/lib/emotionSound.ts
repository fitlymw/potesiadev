/**
 * Emotion Impostor sound cues (synthesised, see lib/sfx.ts).
 *
 * Secret screens use ONE sound for everybody — looking at a Citizen or an
 * Impostor card, or voting for anyone, sounds exactly the same — so nobody
 * at the table can hear a secret.
 */
import { arpeggio, buzz, chord, noise, now, tone } from '@/lib/sfx';

export { buzz };

const C4 = 261.63, G4 = 392, A4 = 440, C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880, C6 = 1046.5;

/** Game starts: a bright little fanfare. */
export function sfxStartGame(): void {
  const t = now();
  if (t === null) return;
  arpeggio([C5, E5, G5, C6], t, 0.09, 0.25, { type: 'square', gain: 0.07 });
  chord([C5, E5, G5], t + 0.4, 0.7, { type: 'triangle', gain: 0.22 });
  noise(t + 0.4, 0.25, { filter: 'highpass', freq: 6000, gain: 0.06 });
}

/** Seats shuffled: a rattle of ticks ending in a ding. */
export function sfxShuffle(): void {
  const t = now();
  if (t === null) return;
  for (let i = 0; i < 9; i++) tone(700 + ((i * 137) % 500), t + i * 0.045, 0.04, { type: 'square', gain: 0.04 });
  tone(C6, t + 0.45, 0.5, { gain: 0.15 });
}

/** A new screen slides in. */
export function sfxWhoosh(): void {
  const t = now();
  if (t === null) return;
  noise(t, 0.35, { filter: 'bandpass', freq: 400, endFreq: 2600, q: 1.2, gain: 0.08 });
}

/** A light tap: add a player, pick an option. */
export function sfxPop(): void {
  const t = now();
  if (t === null) return;
  tone(600, t, 0.09, { endFreq: 950, gain: 0.12 });
}

/** Removing a player. */
export function sfxDrop(): void {
  const t = now();
  if (t === null) return;
  tone(500, t, 0.12, { endFreq: 260, gain: 0.1 });
}

/** Secret card turned face up — identical for Citizens and the Impostor. */
export function sfxCardFlip(): void {
  const t = now();
  if (t === null) return;
  noise(t, 0.18, { filter: 'bandpass', freq: 1800, endFreq: 3500, q: 0.8, gain: 0.07 });
  tone(G5, t + 0.05, 0.25, { type: 'triangle', gain: 0.06 });
}

/** Secret card hidden again. */
export function sfxCardHide(): void {
  const t = now();
  if (t === null) return;
  noise(t, 0.12, { filter: 'bandpass', freq: 2200, endFreq: 900, q: 0.8, gain: 0.05 });
}

/** Locked in: role seen or vote cast (same sound for every choice). */
export function sfxLockIn(): void {
  const t = now();
  if (t === null) return;
  tone(180, t, 0.18, { type: 'square', endFreq: 70, gain: 0.12 });
  noise(t, 0.12, { filter: 'lowpass', freq: 900, gain: 0.15 });
  tone(A5, t + 0.08, 0.15, { gain: 0.06 });
}

/** Choosing a suspect (same sound for everyone). */
export function sfxSelect(): void {
  const t = now();
  if (t === null) return;
  tone(A5, t, 0.06, { type: 'square', gain: 0.05 });
}

/** Spotlight on the next speaker / clue round begins. */
export function sfxSpotlight(): void {
  const t = now();
  if (t === null) return;
  tone(C6, t, 0.6, { gain: 0.12 });
  tone(1568, t, 0.45, { gain: 0.05 });
  noise(t, 0.3, { filter: 'highpass', freq: 5000, gain: 0.04 });
}

/** Discussion timer: start / last-ten-seconds tick / time's up. */
export function sfxTimerStart(): void {
  const t = now();
  if (t === null) return;
  arpeggio([E5, A5], t, 0.08, 0.12, { type: 'square', gain: 0.05 });
}
export function sfxTick(urgent = false): void {
  const t = now();
  if (t === null) return;
  tone(urgent ? 1400 : 1000, t, 0.05, { type: 'square', gain: 0.06 });
}
export function sfxTimeUp(): void {
  const t = now();
  if (t === null) return;
  chord([220, 233], t, 0.7, { type: 'square', gain: 0.12 });
}

/** Drum roll that speeds up for `seconds`, ending in a cymbal crash. */
export function sfxDrumroll(seconds = 1.6): void {
  const t = now();
  if (t === null) return;
  let at = 0;
  let gap = 0.11;
  while (at < seconds) {
    noise(t + at, 0.07, { filter: 'bandpass', freq: 1800, q: 0.7, gain: 0.05 + (at / seconds) * 0.12 });
    at += gap;
    gap = Math.max(0.035, gap * 0.93);
  }
  noise(t + seconds, 0.9, { filter: 'highpass', freq: 4000, gain: 0.12 });
  tone(90, t + seconds, 0.4, { endFreq: 45, gain: 0.25 });
}

/** One vote bar fills (index raises the pitch). */
export function sfxBar(index: number): void {
  const t = now();
  if (t === null) return;
  tone(A4 * 2 ** (index / 12), t, 0.12, { type: 'triangle', gain: 0.1 });
}

/** "Dun-dun!": the most-voted player is announced. */
export function sfxDunDun(): void {
  const t = now();
  if (t === null) return;
  chord([110, 164.81], t, 0.35, { type: 'sawtooth', gain: 0.18 });
  chord([103.83, 155.56], t + 0.4, 0.9, { type: 'sawtooth', gain: 0.2 });
  noise(t + 0.4, 0.5, { filter: 'lowpass', freq: 400, gain: 0.15 });
}

/** The Impostor is caught: a triumphant "gotcha" stab. */
export function sfxCaught(): void {
  const t = now();
  if (t === null) return;
  chord([C5, E5, G5], t, 0.18, { type: 'sawtooth', gain: 0.16 });
  chord([D5, G5, C6], t + 0.2, 0.6, { type: 'sawtooth', gain: 0.18 });
  noise(t + 0.2, 0.6, { filter: 'highpass', freq: 5000, gain: 0.08 });
}

/** Wrong person / tie: a sad trombone. */
export function sfxMiss(): void {
  const t = now();
  if (t === null) return;
  [G4, 370, 349.23].forEach((f, i) => tone(f, t + i * 0.32, 0.3, { type: 'sawtooth', gain: 0.07, endFreq: f * 0.98 }));
  tone(329.63, t + 0.96, 0.8, { type: 'sawtooth', gain: 0.07, endFreq: 300 });
}

/** One heartbeat (the last-chance screen repeats it). */
export function sfxHeartbeat(): void {
  const t = now();
  if (t === null) return;
  tone(70, t, 0.16, { endFreq: 45, gain: 0.35 });
  tone(62, t + 0.22, 0.14, { endFreq: 40, gain: 0.25 });
}

/** Citizens win: victory fanfare. */
export function sfxCitizensWin(): void {
  const t = now();
  if (t === null) return;
  arpeggio([C5, E5, G5], t, 0.12, 0.2, { type: 'square', gain: 0.07 });
  chord([C5, E5, G5, C6], t + 0.38, 1.1, { type: 'triangle', gain: 0.25 });
  noise(t + 0.38, 0.5, { filter: 'highpass', freq: 6000, gain: 0.06 });
}

/** The Impostor wins: a sneaky villain motif. */
export function sfxImpostorWins(): void {
  const t = now();
  if (t === null) return;
  arpeggio([A4 / 2, C4, 311.13, 415.3], t, 0.16, 0.3, { type: 'sawtooth', gain: 0.07 });
  chord([A4 / 2, 311.13, 415.3], t + 0.7, 1.2, { type: 'sawtooth', gain: 0.12 });
  noise(t + 0.7, 1, { filter: 'lowpass', freq: 300, gain: 0.12 });
}

/** A coin for a line of points. */
export function sfxCoin(): void {
  const t = now();
  if (t === null) return;
  tone(988, t, 0.07, { type: 'square', gain: 0.05 });
  tone(1319, t + 0.07, 0.25, { type: 'square', gain: 0.05 });
}

/** A run of coins, one per points line, `gap` seconds apart (starting after `delay`). */
export function sfxCoins(count: number, delay = 0, gap = 0.14): void {
  const t = now();
  if (t === null) return;
  for (let i = 0; i < count; i++) {
    tone(988, t + delay + i * gap, 0.07, { type: 'square', gain: 0.045 });
    tone(1319, t + delay + i * gap + 0.07, 0.2, { type: 'square', gain: 0.045 });
  }
}

/** Sparkles: best clue picked. */
export function sfxSparkle(): void {
  const t = now();
  if (t === null) return;
  [2093, 2637, 3136, 2349].forEach((f, i) => tone(f, t + i * 0.06, 0.25, { gain: 0.04 }));
}

/** Final results: a longer fanfare with a drum hit. */
export function sfxFinale(): void {
  const t = now();
  if (t === null) return;
  tone(90, t, 0.5, { endFreq: 45, gain: 0.3 });
  noise(t, 0.8, { filter: 'highpass', freq: 4500, gain: 0.1 });
  arpeggio([G4, C5, E5, G5], t + 0.1, 0.12, 0.25, { type: 'square', gain: 0.07 });
  chord([C5, E5, G5, C6], t + 0.6, 1.6, { type: 'triangle', gain: 0.28 });
  arpeggio([C6, 1318.5, 1568, 2093], t + 0.9, 0.08, 0.3, { gain: 0.04 });
}
