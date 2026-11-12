import type { Lang } from '../../../../shared/nightfall2/constants';
import { nf2 } from './store';

/**
 * The Town Crier's voice: the browser's own speech synthesis in the lobby's language, so the
 * same bulletin is read on every phone and PC. When muted (or unsupported) the lines still pace
 * themselves on a timer so the speech bubble keeps moving.
 */
const KEY = 'nf2-crier-muted';
let muted = false;
try { muted = localStorage.getItem(KEY) === '1'; } catch { /* no storage */ }
const listeners = new Set<() => void>();
export const isCrierMuted = () => muted;
export function setCrierMuted(v: boolean) {
  muted = v;
  try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* no storage */ }
  if (v) window.speechSynthesis?.cancel();
  listeners.forEach((fn) => fn());
}
export function subscribeCrierMuted(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

let run = 0;

function pickVoice(lang: Lang): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const pref = lang === 'id' ? ['id-ID', 'id'] : ['en-GB', 'en-US', 'en'];
  for (const p of pref) {
    const list = voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(p.toLowerCase()));
    if (list.length) return list.find((v) => /google|natural|premium|enhanced/i.test(v.name)) ?? list[0];
  }
  return null;
}

/** Read the bulletin line by line; the store's `crier.index` follows along for the bubble. */
export function speakNews(lines: string[], lang: Lang): void {
  const my = ++run;
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  synth?.cancel();

  const step = (i: number) => {
    if (my !== run) return;
    if (i >= lines.length) {
      const c = nf2.get().crier;
      if (c) nf2.set({ crier: { ...c, index: lines.length } });
      return;
    }
    const c = nf2.get().crier;
    if (c) nf2.set({ crier: { ...c, index: i } });
    const text = lines[i];
    const fallbackMs = Math.max(2600, text.length * 70);
    if (!synth || muted) {
      window.setTimeout(() => step(i + 1), fallbackMs);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'id' ? 'id-ID' : 'en-GB';
    const voice = pickVoice(lang);
    if (voice) u.voice = voice;
    u.rate = 0.92;
    u.pitch = 0.8; // an old crier
    let done = false;
    const next = () => { if (!done) { done = true; window.setTimeout(() => step(i + 1), 450); } };
    u.onend = next;
    u.onerror = next;
    window.setTimeout(next, fallbackMs + 4000); // some engines never fire onend
    synth.speak(u);
  };

  // voices load lazily on some browsers; give them a moment on first use
  if (synth && synth.getVoices().length === 0) window.setTimeout(() => step(0), 300);
  else step(0);
}

export function stopSpeech(): void {
  run++;
  window.speechSynthesis?.cancel();
}
