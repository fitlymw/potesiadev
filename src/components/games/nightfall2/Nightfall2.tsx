import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUp, ChevronDown, Copy, Crown, Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { pauseBgMusic, resumeBgMusic } from '@/lib/audio';
import { MAX_PLAYERS, PLAYER_COLORS } from '../../../../shared/nightfall2/constants';
import { decodeLook, defaultLook, encodeLook, type Look } from '../../../../shared/nightfall2/look';
import { createLobby, hostAction, joinLobby, jump, leaveLobby, serverUrls, setNoticeFormatter } from './net';
import { camera as cam, useNf2 } from './store';
import { TEXT, detectLang, type Lang } from './texts';
import { Town } from './scene/Town';
import { DayNight } from './scene/DayNight';
import { RemotePlayers } from './scene/Players';
import { LocalPlayer } from './scene/LocalPlayer';
import { Crier } from './scene/Crier';
import { preloadCharacters } from './scene/characterAssets';
import { Hud } from './ui/Hud';
import { Chat } from './ui/Chat';
import { Joystick } from './ui/Joystick';
import { EmoteWheel } from './ui/EmoteWheel';
import { CharacterEditor } from './ui/CharacterEditor';
import { RoleCard } from './ui/RolePanel';

const PIXEL = { fontFamily: '"Press Start 2P", cursive' };

export function Nightfall2() {
  const [lang, setLang] = useState<Lang>(detectLang);
  const t = TEXT[lang];
  const status = useNf2((s) => s.status);
  const touch = useMemo(() => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches, []);

  useEffect(() => { setNoticeFormatter(TEXT[lang].notice); }, [lang]);
  useEffect(() => {
    pauseBgMusic(); // the town has its own sounds; the site's chiptune would clash
    preloadCharacters();
    return () => {
      leaveLobby();
      resumeBgMusic();
    };
  }, []);

  if (status === 'lobby' || status === 'playing') return <GameView t={t} lang={lang} touch={touch} />;
  return <Entry t={t} lang={lang} setLang={setLang} />;
}

// ==================== ENTRY: name, character, create / join ====================
function Entry({ t, lang, setLang }: { t: (typeof TEXT)['id']; lang: Lang; setLang: (l: Lang) => void }) {
  const navigate = useNavigate();
  const status = useNf2((s) => s.status);
  const error = useNf2((s) => s.error);
  const [name, setName] = useState(() => { try { return localStorage.getItem('nf2-name') ?? ''; } catch { return ''; } });
  const [color, setColor] = useState(() => { try { return localStorage.getItem('nf2-color') ?? PLAYER_COLORS[0]; } catch { return PLAYER_COLORS[0]; } });
  const [look, setLook] = useState<Look>(() => { try { return decodeLook(localStorage.getItem('nf2-look')); } catch { return defaultLook(); } });
  const [code, setCode] = useState('');
  const busy = status === 'connecting';
  const offline = serverUrls() === null;

  const remember = () => {
    try {
      localStorage.setItem('nf2-name', name.trim());
      localStorage.setItem('nf2-color', color);
      localStorage.setItem('nf2-look', encodeLook(look));
    } catch { /* private mode */ }
  };
  const opts = () => ({ name: name.trim(), color, look: encodeLook(look) });
  const create = () => { if (!name.trim()) return; remember(); createLobby({ ...opts(), lang }); };
  const join = () => { if (!name.trim() || code.length < 4) return; remember(); joinLobby(code, opts()); };

  return (
    <div className="min-h-screen bg-[#0b1020] text-indigo-50" style={{ backgroundImage: 'radial-gradient(ellipse at top, rgba(99,102,241,0.25), transparent 60%), radial-gradient(ellipse at bottom, rgba(16,185,129,0.15), transparent 60%)' }}>
      <div className="mx-auto flex max-w-md flex-col px-5 py-5">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/games')} className="flex items-center gap-2 text-sm text-indigo-200/80"><ArrowLeft className="h-4 w-4" />{t.back}</button>
          <div className="flex gap-1 text-[10px]" style={PIXEL}>
            {(['id', 'en'] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-3 py-1.5 border ${lang === l ? 'border-emerald-300 bg-emerald-500/20 text-emerald-100' : 'border-indigo-800 text-indigo-300'}`}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
          <h1 className="text-xl text-emerald-300" style={PIXEL}>{t.title}</h1>
          <p className="mt-2 text-[10px] text-indigo-200" style={PIXEL}>{t.subtitle}</p>
          <p className="mt-4 text-sm text-indigo-200/80">{t.tagline}</p>
          <p className="mt-2 text-xs text-amber-200/80">{t.earlyAccess}</p>
        </motion.div>

        <div className="mt-6 space-y-4">
          <div className="space-y-4 rounded-2xl border border-indigo-400/20 bg-black/30 p-4 backdrop-blur-sm">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-indigo-300/80">{t.yourName}</span>
              <input value={name} onChange={(e) => setName(e.target.value.slice(0, 16))} placeholder={t.namePlaceholder} maxLength={16} className="mt-1 w-full rounded-lg border border-indigo-400/30 bg-black/40 px-3 py-2.5 text-indigo-50 placeholder:text-indigo-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </label>
            <div>
              <span className="text-xs uppercase tracking-wider text-indigo-300/80">{t.pickColor}</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {PLAYER_COLORS.map((c) => (
                  <button key={c} onClick={() => setColor(c)} aria-label={c} className={`h-7 w-7 rounded-full border-2 transition-transform ${color === c ? 'scale-110 border-white' : 'border-transparent'}`} style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>

          <CharacterEditor look={look} onChange={setLook} t={t} />

          <div className="space-y-4 rounded-2xl border border-indigo-400/20 bg-black/30 p-4 backdrop-blur-sm">
            {error && status === 'error' && <p className="rounded-lg border border-rose-400/40 bg-rose-950/50 px-3 py-2 text-xs text-rose-200">{t.errors[error as keyof typeof t.errors] ?? t.errors.failed}</p>}
            {offline && !error && <p className="rounded-lg border border-amber-400/40 bg-amber-950/40 px-3 py-2 text-xs text-amber-100">{t.errors.offline}</p>}

            <button onClick={create} disabled={busy || !name.trim() || offline} className="flex w-full items-center justify-center gap-2 border-2 border-emerald-300 bg-emerald-500/20 py-3.5 text-[11px] text-emerald-100 disabled:opacity-40" style={PIXEL}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{busy ? t.connecting : t.create}
            </button>
            <p className="text-center text-[11px] text-indigo-300/60">{t.langNote}</p>
            <div className="flex items-center gap-3 text-xs text-indigo-300/60"><span className="h-px flex-1 bg-indigo-400/20" />{t.or}<span className="h-px flex-1 bg-indigo-400/20" /></div>
            <div className="flex gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4))} placeholder={t.codePlaceholder} maxLength={4} autoCapitalize="characters" className="w-32 rounded-lg border border-indigo-400/30 bg-black/40 px-3 py-2.5 text-center font-mono text-lg tracking-[0.4em] text-indigo-50 placeholder:text-indigo-300/40 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              <button onClick={join} disabled={busy || !name.trim() || code.length < 4 || offline} className="flex-1 border-2 border-indigo-300 bg-indigo-500/20 py-3 text-[11px] text-indigo-100 disabled:opacity-40" style={PIXEL}>{t.join}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== GAME VIEW: the 3D town with the UI on top ====================
function GameView({ t, lang, touch }: { t: (typeof TEXT)['id']; lang: Lang; touch: boolean }) {
  const meRef = useRef(new THREE.Vector3());
  const drag = useRef<{ id: number; x: number } | null>(null);
  const phase = useNf2((s) => s.phase);

  return (
    <div
      className="fixed inset-0 touch-none select-none overflow-hidden bg-black"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('[data-ui]')) return;
        if (drag.current) return;
        drag.current = { id: e.pointerId, x: e.clientX };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current || drag.current.id !== e.pointerId) return;
        cam.yaw -= (e.clientX - drag.current.x) * 0.006;
        drag.current.x = e.clientX;
      }}
      onPointerUp={(e) => { if (drag.current?.id === e.pointerId) drag.current = null; }}
      onPointerCancel={() => { drag.current = null; }}
    >
      {/* `flat` = no filmic tone mapping: the kits are flat-shaded, so their palette should land as authored */}
      <Canvas flat dpr={[1, 1.5]} camera={{ fov: 55, near: 0.1, far: 220, position: [0, 4, 8] }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <Suspense fallback={null}>
          <DayNight />
          <Town />
          <RemotePlayers meRef={meRef} t={t} />
          <LocalPlayer meRef={meRef} t={t} />
          <Crier t={t} />
        </Suspense>
      </Canvas>
      <Hud t={t} lang={lang} touch={touch} />
      {phase === 'lobby' && <LobbyBar t={t} />}
      <RoleCard t={t} lang={lang} />
      <Chat t={t} touch={touch} />
      {/* action column: emote above jump, on the right (the chat button sits at the bottom on phones) */}
      <EmoteWheel t={t} corner={touch} className={touch ? 'bottom-44 right-5' : 'bottom-4 right-[22rem]'} />
      <button
        data-ui
        onPointerDown={(e) => { e.preventDefault(); jump(); }}
        className={`absolute flex h-14 w-14 touch-none select-none items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm ${touch ? 'bottom-24 right-5' : 'bottom-4 right-[26.5rem]'}`}
        aria-label={t.jump}
        title={`${t.jump} (Space)`}
      >
        <ArrowUp className="h-6 w-6" />
      </button>
      {touch && <Joystick />}
    </div>
  );
}

/** While in the lobby everyone can already walk around; this bar carries the code and the start button. */
function LobbyBar({ t }: { t: (typeof TEXT)['id'] }) {
  const code = useNf2((s) => s.code);
  const lang = useNf2((s) => s.lang);
  const roster = useNf2((s) => s.roster);
  const me = useNf2((s) => s.me);
  const isHost = roster.find((p) => p.id === me)?.host ?? false;
  /** Nightfall Deception's table only covers 5–10 seats; outside that the town runs without roles. */
  const canDeal = roster.length >= 5 && roster.length <= 10;
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* no clipboard */ }
  };
  return (
    <div data-ui className="absolute left-1/2 top-16 w-[min(92vw,380px)] -translate-x-1/2 rounded-2xl border border-emerald-300/30 bg-black/60 p-3 text-white backdrop-blur-md">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between">
        <span className="text-[10px] text-emerald-200" style={PIXEL}>{t.lobbyCode}</span>
        <span className="flex items-center gap-2 font-mono text-2xl tracking-[0.35em]">{code}<ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} /></span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>{t.players(roster.length, MAX_PLAYERS)} · {t.lobbyLang}: {lang.toUpperCase()}</span>
            <button onClick={copy} className="flex items-center gap-1 rounded-md border border-white/20 px-2 py-1"><Copy className="h-3 w-3" />{copied ? '✓' : 'copy'}</button>
          </div>
          <ul className="grid grid-cols-2 gap-1 text-sm">
            {roster.map((p) => (
              <li key={p.id} className="flex items-center gap-2 truncate">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: p.color }} />
                <span className="truncate">{p.name}{p.id === me ? ` (${t.you})` : ''}</span>
                {p.host && <Crown className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-label={t.host} />}
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-white/50">{t.shareHint}</p>
          {isHost ? (
            <>
              <button onClick={() => hostAction('start')} className="w-full border-2 border-emerald-300 bg-emerald-500/25 py-3 text-[11px] text-emerald-100" style={PIXEL}>
                {canDeal ? t.start : t.startNoRoles}
              </button>
              {!canDeal && <p className="text-[11px] text-amber-200/80">{t.rolesNeed}</p>}
            </>
          ) : (
            <p className="text-center text-xs text-white/60">{t.waitingHost}</p>
          )}
        </div>
      )}
    </div>
  );
}
