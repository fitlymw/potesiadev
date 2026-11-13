import type { Lang } from '../../../../shared/nightfall2/constants';
import { nf2 } from './store';

/**
 * The Town Crier's voice: the browser's own speech synthesis in the lobby's language, so the
 * same bulletin is read on every phone and PC. The voice is pitched low and slow — a deep,
 * commanding herald. When muted (or unsupported) the lines still pace themselves on a timer
 * so the speech bubble keeps moving.
 *
 * Accent: the crier only ever uses a voice of the lobby's language. If the device has no
 * Indonesian (or English) voice installed, `voiceStatus` reports it so the HUD can say so,
 * and the bubble runs on the timer instead of a wrong-accent voice.
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

/** Which voice the crier last used (or why none): shown in the HUD. */
export interface VoiceStatus { lang: Lang; voice: string | null; missing: boolean }
let status: VoiceStatus = { lang: 'id', voice: null, missing: false };
const statusListeners = new Set<() => void>();
export const getVoiceStatus = () => status;
export function subscribeVoiceStatus(fn: () => void) {
  statusListeners.add(fn);
  return () => { statusListeners.delete(fn); };
}
function setStatus(s: VoiceStatus) {
  status = s;
  statusListeners.forEach((fn) => fn());
}

let run = 0;

/** Chrome loads voices lazily; wait for them (briefly) before choosing one. */
function voicesReady(): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  if (!synth) return Promise.resolve([]);
  const now = synth.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(synth.getVoices()); } };
    synth.addEventListener('voiceschanged', finish, { once: true });
    window.setTimeout(finish, 1500);
  });
}

/** Deeper male voices first, then anything in the right language. Never a voice of another language. */
const DEEP = /andika|ardi|male|david|george|daniel|james|ryan|guy|mark|richard|thomas|arthur|oliver|brian|christopher|eric|roger|matthew|fajar|gadis/i;
function pickVoice(voices: SpeechSynthesisVoice[], lang: Lang): SpeechSynthesisVoice | null {
  const want = lang === 'id' ? ['id-id', 'id'] : ['en-gb', 'en-au', 'en-us', 'en'];
  const norm = (v: SpeechSynthesisVoice) => v.lang.replace('_', '-').toLowerCase();
  const inLang = voices.filter((v) => norm(v).startsWith(lang));
  if (!inLang.length) return null;
  const score = (v: SpeechSynthesisVoice) => {
    const l = norm(v);
    const dialect = want.findIndex((w) => l.startsWith(w));
    return (dialect < 0 ? 9 : dialect) * 10 - (DEEP.test(v.name) ? 5 : 0) - (/natural|neural|premium|enhanced|google/i.test(v.name) ? 2 : 0) + (/female|zira|siti|woman/i.test(v.name) ? 4 : 0);
  };
  return [...inLang].sort((a, b) => score(a) - score(b))[0];
}

/** Read the bulletin line by line; the store's `crier.index` follows along for the bubble. */
export function speakNews(lines: string[], lang: Lang): void {
  const my = ++run;
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  synth?.cancel();

  const start = (voice: SpeechSynthesisVoice | null) => {
    setStatus({ lang, voice: voice?.name ?? null, missing: !!synth && !voice });
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
      const fallbackMs = Math.max(2800, text.length * 80);
      if (!synth || muted || !voice) {
        window.setTimeout(() => step(i + 1), fallbackMs);
        return;
      }
      const u = new SpeechSynthesisUtterance(text);
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = 0.82; // slow and deliberate
      u.pitch = 0.45; // as deep as browsers allow: the voice of a herald, not a clerk
      u.volume = 1;
      let done = false;
      const next = () => { if (!done) { done = true; window.setTimeout(() => step(i + 1), 550); } };
      u.onend = next;
      u.onerror = next;
      window.setTimeout(next, fallbackMs + 6000); // some engines never fire onend
      synth.speak(u);
    };
    step(0);
  };

  if (!synth) start(null);
  else voicesReady().then((voices) => { if (my === run) start(pickVoice(voices, lang)); });
}

export function stopSpeech(): void {
  run++;
  window.speechSynthesis?.cancel();
}
