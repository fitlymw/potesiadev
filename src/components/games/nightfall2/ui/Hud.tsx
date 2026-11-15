import { useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Moon, SkipForward, Sun, Users, Volume2, VolumeX } from 'lucide-react';
import { MAX_PLAYERS } from '../../../../../shared/nightfall2/constants';
import { hostAction, leaveLobby } from '../net';
import { getVoiceStatus, isCrierMuted, setCrierMuted, subscribeCrierMuted, subscribeVoiceStatus } from '../speech';
import { useNf2 } from '../store';
import { useNow } from '../useNow';
import { RoleBookButton } from './RolePanel';
import type { Lang, TEXT } from '../texts';

const PIXEL = { fontFamily: '"Press Start 2P", cursive' };

export function Hud({ t, lang, touch }: { t: (typeof TEXT)['id']; lang: Lang; touch: boolean }) {
  const phase = useNf2((s) => s.phase);
  const endsAt = useNf2((s) => s.phaseEndsAt);
  const day = useNf2((s) => s.day);
  const code = useNf2((s) => s.code);
  const roster = useNf2((s) => s.roster);
  const me = useNf2((s) => s.me);
  const notices = useNf2((s) => s.notices);
  const now = useNow();
  const crierMuted = useSyncExternalStore(subscribeCrierMuted, isCrierMuted, isCrierMuted);
  const voice = useSyncExternalStore(subscribeVoiceStatus, getVoiceStatus, getVoiceStatus);
  const living = roster.filter((p) => p.alive);
  const readyCount = living.filter((p) => p.ready).length;
  const iAmReady = roster.find((p) => p.id === me)?.ready ?? false;
  const crier = useNf2((s) => s.crier);
  const crierLine = crier && crier.index >= 0 && crier.index < crier.lines.length ? crier.lines[crier.index] : null;
  // big banner for a few seconds after the phase flips (derived from the server's notice)
  const last = notices[notices.length - 1];
  const flip = last && (last.key === 'night' || last.key === 'day' || last.key === 'started') && now - last.at < 3500;
  const banner = flip ? (last.key === 'night' ? t.nightBanner : t.dayBanner) : null;

  const left = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const night = phase === 'night';

  return (
    <>
      <div data-ui className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3 text-white">
        <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 backdrop-blur-md ${night ? 'border-indigo-300/40 bg-indigo-950/60' : 'border-amber-200/40 bg-amber-900/40'}`}>
          {night ? <Moon className="h-4 w-4 text-indigo-200" /> : <Sun className="h-4 w-4 text-amber-200" />}
          <span className="text-[10px]" style={PIXEL}>{t.phase[phase]}</span>
          {day > 0 && <span className="text-xs text-white/70">· {t.dayN(day)}</span>}
          {endsAt > 0 && <span className="ml-1 font-mono text-sm tabular-nums">{mm}:{ss}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-xl border border-white/15 bg-black/40 px-2.5 py-2 text-xs backdrop-blur-md"><Users className="h-3.5 w-3.5" />{roster.length}/{MAX_PLAYERS}</span>
          <span className="hidden rounded-xl border border-white/15 bg-black/40 px-2.5 py-2 font-mono text-xs tracking-widest backdrop-blur-md sm:inline">{code}</span>
          <button onClick={() => setCrierMuted(!crierMuted)} className="rounded-xl border border-white/15 bg-black/40 p-2 backdrop-blur-md" aria-label={crierMuted ? t.crierVoiceOff : t.crierVoiceOn} aria-pressed={crierMuted} title={crierMuted ? t.crierVoiceOff : t.crierVoiceOn}>
            {crierMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <RoleBookButton t={t} lang={lang} />
          {phase !== 'lobby' && (
            <button
              onClick={() => hostAction('skip')}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs backdrop-blur-md ${iAmReady ? 'border-emerald-300 bg-emerald-500/25 text-emerald-100' : 'border-white/15 bg-black/40 text-white'}`}
              aria-label={t.skip}
              aria-pressed={iAmReady}
              title={`${t.skip} — ${t.readyHint}`}
            >
              <SkipForward className="h-4 w-4" />
              <span className="tabular-nums">{readyCount}/{living.length}</span>
            </button>
          )}
          <button onClick={() => { if (confirm(`${t.leave}?`)) leaveLobby(); }} className="rounded-xl border border-white/15 bg-black/40 p-2 backdrop-blur-md" aria-label={t.leave} title={t.leave}><LogOut className="h-4 w-4" /></button>
        </div>
      </div>

      {/* One column under the top bar: proclamation, voice notice, then transient notices */}
      <div className="pointer-events-none absolute left-1/2 top-16 flex w-[min(94vw,460px)] -translate-x-1/2 flex-col items-center gap-1.5">
        {/* readable anywhere in town — the Crier's world bubble is only visible nearby */}
        {night && crierLine && (
          <motion.div key={crierLine} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="w-full rounded-2xl border border-amber-300/50 bg-[#1a1408]/85 px-4 py-2.5 text-center backdrop-blur-md">
            <p className="text-[9px] uppercase tracking-widest text-amber-300/80" style={PIXEL}>🔔 {t.crier}</p>
            <p className="mt-1.5 text-sm leading-snug text-amber-50">{crierLine}</p>
          </motion.div>
        )}
        {night && voice.missing && !crierMuted && (
          <p className="w-full rounded-xl border border-amber-300/40 bg-amber-950/70 px-3 py-2 text-center text-[11px] text-amber-100 backdrop-blur-md">{t.voiceMissing}</p>
        )}
        {/* who has already pressed "end the phase" */}
        {phase !== 'lobby' && readyCount > 0 && (
          <p className="w-full rounded-xl border border-emerald-300/30 bg-emerald-950/60 px-3 py-1.5 text-center text-[11px] text-emerald-100 backdrop-blur-md">
            {t.readyCount(readyCount, living.length)} · {living.filter((p) => p.ready).map((p) => p.name).join(', ')}
          </p>
        )}
        <AnimatePresence>
          {notices.slice(-3).map((n) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-full bg-black/50 px-3 py-1 text-xs text-white/85 backdrop-blur-sm">
              {n.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {banner && (
          <motion.div key={banner} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-x-6 top-1/3 text-center">
            <p className={`mx-auto max-w-md rounded-2xl border px-5 py-4 text-sm text-white backdrop-blur-md ${night ? 'border-indigo-300/40 bg-indigo-950/70' : 'border-amber-200/40 bg-amber-900/60'}`}>{banner}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!touch && <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-[11px] text-white/60">{t.controlsDesktop}</p>}
    </>
  );
}
