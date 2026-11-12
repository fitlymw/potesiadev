/** Elf Town cues, synthesised with the shared party synth (no files). */
import { noise, now, tone } from '@/lib/sfx';

/** The Crier's hand bell: two strikes. */
export function sfxBell(): void {
  const t = now();
  if (t === null) return;
  for (const at of [0, 0.42]) {
    tone(1760, t + at, 0.9, { gain: 0.12 });
    tone(2637, t + at, 0.5, { gain: 0.05 });
    tone(1046, t + at, 0.7, { type: 'triangle', gain: 0.05 });
    noise(t + at, 0.05, { filter: 'highpass', freq: 5000, gain: 0.08 });
  }
}

/** Little "boing" on take-off. */
export function sfxJump(): void {
  const t = now();
  if (t === null) return;
  tone(260, t, 0.16, { type: 'triangle', endFreq: 620, gain: 0.1 });
}

/** Soft pop when an emote appears nearby. */
export function sfxEmote(): void {
  const t = now();
  if (t === null) return;
  tone(520, t, 0.08, { endFreq: 880, gain: 0.08 });
  tone(1320, t + 0.06, 0.12, { gain: 0.04 });
}

/** "Hush": you tried to speak at night. */
export function sfxHush(): void {
  const t = now();
  if (t === null) return;
  noise(t, 0.35, { filter: 'bandpass', freq: 1200, q: 0.6, gain: 0.07 });
}

/** Dawn: a bright chime. */
export function sfxDawn(): void {
  const t = now();
  if (t === null) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.09, 0.6, { gain: 0.07 }));
}
