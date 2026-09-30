import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ScrollText, Volume2, VolumeX, Plus, Trash2, Users, EyeOff, Moon, Sun, Skull, Crosshair, Gavel, Pause, Play, RotateCcw, HelpCircle, Ghost } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { pauseBgMusic, resumeBgMusic } from '@/lib/audio';
import { RoundTable } from '@/components/games/party/RoundTable';
import { PLAYER_COLORS } from '@/components/games/party/colors';
import { ROLES, TEAM_LABEL } from '@/data/nightfallRoles';
import {
  reducer,
  initialState,
  pendingPlayer,
  nightSpec,
  lapStart,
  voteThreshold,
  validateNightfallPlayers,
  shuffleSeats,
  TIMING,
  NF_MIN_PLAYERS,
  NF_MAX_PLAYERS,
  type NfState,
  type Action,
  type Lang,
  type PublicEvent,
} from '@/lib/party/nightfall';
import { startNightMusic, stopNightMusic, sfxTick, sfxGlitch, sfxDeath, sfxMorning, sfxExecution, sfxBell, sfxVictory, buzz, isMuted, setMuted } from '@/lib/nightfallSound';
import { RoleIcon } from '@/components/games/nightfall/RoleIcon';
import { TEAM_COLOR } from '@/components/games/nightfall/palette';
import { Overlay, RoleBook, RulesView, RoleHint } from '@/components/games/nightfall/Panels';
import { UI, reportLine, type UIText } from '@/components/games/nightfall/texts';
import { useTurnClock, useDayClock } from '@/components/games/nightfall/useClock';

const STORAGE_KEY = 'nightfall-game';
const PIXEL = { fontFamily: '"Press Start 2P", cursive' };
const primaryBtn = 'w-full py-4 border-2 border-indigo-400 bg-indigo-500/15 text-indigo-100 text-[10px] sm:text-xs disabled:opacity-40';

function loadState(): NfState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as NfState;
      if (parsed && typeof parsed.phase === 'string' && Array.isArray(parsed.players)) return reducer(parsed, { type: 'RESUME_AT_PASS' });
    }
  } catch {
    // Corrupt or unavailable storage: start fresh
  }
  return initialState('id');
}

function nameList(state: NfState, ids: number[]) {
  return ids.map((i) => state.players[i]).join(', ');
}

function eventLine(e: PublicEvent, state: NfState, t: UIText): string | null {
  const nm = (i: number) => state.players[i];
  switch (e.k) {
    case 'executed': return t.events.executed(nm(e.player));
    case 'shielded': return t.events.shielded(nm(e.player));
    case 'noExecution': return t.events.noExecution;
    case 'novaHit': return t.events.novaHit(nm(e.shooter), nm(e.target));
    case 'novaMiss': return t.events.novaMiss(nm(e.shooter), nm(e.target));
    case 'deaths': return e.players.length ? t.deathsSome(nameList(state, e.players)) : t.deathsNone;
  }
}

/** Countdown bar with tick sounds in the last 10 seconds. */
function ClockBar({ remaining, total, label }: { remaining: number; total: number; label: string }) {
  const sec = Math.ceil(remaining);
  useEffect(() => {
    if (sec <= 10 && sec > 0) sfxTick(sec <= 5);
    if (sec === 10 || sec === 5) buzz(80);
  }, [sec]);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1"><span className="text-indigo-300/70">{label}</span><span className={sec <= 5 ? 'text-red-400 font-bold' : 'text-indigo-100'}>{sec}s</span></div>
      <div className="h-2 bg-black/50 border border-indigo-900"><div className={`h-full transition-[width] duration-200 ${sec <= 5 ? 'bg-red-500' : 'bg-indigo-400'}`} style={{ width: `${(remaining / total) * 100}%` }} /></div>
    </div>
  );
}

function PlayerPicker({ state, selected, onToggle, allowSelf, self, max }: { state: NfState; selected: number[]; onToggle: (p: number) => void; allowSelf: boolean; self: number; max: number }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {state.players.map((name, p) => {
        const disabled = !state.alive[p] || (!allowSelf && p === self);
        const on = selected.includes(p);
        return (
          <button
            key={p}
            disabled={disabled || (!on && selected.length >= max && max > 1)}
            onClick={() => onToggle(p)}
            className={`py-2.5 px-2 border text-sm truncate disabled:opacity-30 ${on ? 'text-black font-bold' : 'border-indigo-600/50 text-indigo-100'}`}
            style={on ? { background: PLAYER_COLORS[p], borderColor: PLAYER_COLORS[p] } : undefined}
          >
            {name}{p === self ? ' •' : ''}
          </button>
        );
      })}
    </div>
  );
}

// ==================== PRIVATE NIGHT TURN ====================
function NightTurn({ state, dispatch, t, onHint }: { state: NfState; dispatch: (a: Action) => void; t: UIText; onHint: () => void }) {
  const player = pendingPlayer(state)!;
  const spec = nightSpec(state, player);
  const [selected, setSelected] = useState<number[]>([]);
  const total = state.night === 1 ? TIMING.nightTurnFirst : TIMING.nightTurn;
  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  const onExpire = useCallback(() => {
    sfxGlitch();
    buzz([60, 40, 60]);
    const current = selectedRef.current;
    dispatch({ type: 'SUBMIT_NIGHT', targets: current.length === spec.count ? current : [] });
  }, [dispatch, spec.count]);
  const { elapsed, remaining } = useTurnClock(total, onExpire);
  const role = state.roles[player];
  const complete = selected.length === spec.count;
  const unlocked = elapsed >= TIMING.minTurn;
  const toggle = (p: number) =>
    setSelected((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : spec.count === 1 ? [p] : prev.length < spec.count ? [...prev, p] : prev));
  const prompt = !state.alive[player]
    ? t.prompt.dead
    : spec.kind === 'aura' ? t.prompt.aura
    : spec.kind === 'protect' ? t.prompt.protect
    : spec.kind === 'poison' ? t.prompt.poison
    : spec.kind === 'kill' ? t.prompt.kill(spec.count, spec.allowSelf)
    : t.prompt.dummy;
  return (
    <div className="space-y-4 pb-20">
      <ClockBar remaining={remaining} total={total} label={t.night(state.night)} />
      <div className="flex items-center gap-3 border p-3 bg-black/40" style={{ borderColor: `${TEAM_COLOR[ROLES[role].team]}66` }}>
        <RoleIcon role={role} size={52} />
        <div className="min-w-0">
          <p className="text-xs text-indigo-300/70">{state.players[player]} · {t.yourRole}</p>
          <p className="text-lg font-bold" style={{ color: TEAM_COLOR[ROLES[role].team] }}>{ROLES[role].name}{!state.alive[player] ? ' 👻' : ''}</p>
          <p className="text-[11px]" style={{ color: TEAM_COLOR[ROLES[role].team] }}>{TEAM_LABEL[ROLES[role].team][state.lang]}</p>
        </div>
      </div>
      {state.night === 1 && <p className="text-xs text-amber-200/80">{t.keepSecret}</p>}
      <p className="text-sm text-indigo-50">{prompt}</p>
      <PlayerPicker state={state} selected={selected} onToggle={toggle} allowSelf={spec.allowSelf} self={player} max={spec.count} />
      {spec.count > 1 && <p className="text-xs text-indigo-300/70">{t.selected(selected.length, spec.count)}</p>}
      <button disabled={!complete || !unlocked} onClick={() => dispatch({ type: 'SUBMIT_NIGHT', targets: selected })} className={primaryBtn} style={PIXEL}>
        {unlocked ? t.hideAndPass : t.minWait(Math.ceil(TIMING.minTurn - elapsed))}
      </button>
      <HintButton t={t} onHint={onHint} />
    </div>
  );
}

function HintButton({ t, onHint }: { t: UIText; onHint: () => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[65] p-3 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center">
      <button onClick={onHint} className="w-full max-w-xl py-3 border-2 border-amber-400 bg-amber-500/15 text-amber-100 text-[10px] flex items-center justify-center gap-2" style={PIXEL}>
        <HelpCircle className="w-4 h-4" />{t.roleHint}
      </button>
    </div>
  );
}

// ==================== LAST PLAYER: PHONE TO THE CENTRE ====================
function NightEnd({ state, dispatch, t }: { state: NfState; dispatch: (a: Action) => void; t: UIText }) {
  const onExpire = useCallback(() => {
    stopNightMusic();
    if (state.lastNightDeaths.length) {
      sfxDeath();
      buzz([300, 150, 300]);
    } else sfxMorning();
    dispatch({ type: 'SHOW_MORNING' });
  }, [dispatch, state.lastNightDeaths.length]);
  const { remaining } = useTurnClock(TIMING.phoneToCenter, onExpire);
  return (
    <div className="flex flex-col items-center text-center pt-10 space-y-6">
      <Moon className="w-14 h-14 text-indigo-300" />
      <h2 className="text-xl font-bold">{t.lastPlayerTitle}</h2>
      <p className="text-indigo-200/80 text-sm max-w-sm">{t.lastPlayerHint}</p>
      <p className="text-5xl text-indigo-100" style={PIXEL}>{Math.ceil(remaining)}</p>
      <p className="text-indigo-300/60 text-sm">{t.dawnIn(Math.ceil(remaining))}</p>
    </div>
  );
}

// ==================== PRIVATE DAWN REPORT ====================
function DawnTurn({ state, dispatch, t, onHint }: { state: NfState; dispatch: (a: Action) => void; t: UIText; onHint: () => void }) {
  const player = pendingPlayer(state)!;
  const total = state.night === 1 ? TIMING.dawnTurnFirst : TIMING.dawnTurn;
  const onExpire = useCallback(() => dispatch({ type: 'DONE_DAWN' }), [dispatch]);
  const { elapsed, remaining } = useTurnClock(total, onExpire);
  const report = (state.reports[player] ?? []).find((r) => r.night === state.night);
  const role = state.roles[player];
  return (
    <div className="space-y-4 pb-20">
      <ClockBar remaining={remaining} total={total} label={t.reportTitle(state.night)} />
      <div className="flex items-center gap-3">
        <RoleIcon role={role} size={44} />
        <div>
          <p className="text-xs text-indigo-300/70">{state.players[player]}</p>
          <p className="font-bold" style={{ color: TEAM_COLOR[ROLES[role].team] }}>{ROLES[role].name}</p>
        </div>
      </div>
      <div className="border border-indigo-400/40 bg-indigo-950/40 p-4 space-y-2">
        {(report?.items ?? []).map((item, i) => <p key={i} className="text-indigo-50 leading-relaxed">{reportLine(item, state.players, state.lang)}</p>)}
      </div>
      <button disabled={elapsed < TIMING.minTurn} onClick={() => dispatch({ type: 'DONE_DAWN' })} className={primaryBtn} style={PIXEL}>
        {elapsed >= TIMING.minTurn ? t.readPass : t.minWait(Math.ceil(TIMING.minTurn - elapsed))}
      </button>
      <HintButton t={t} onHint={onHint} />
    </div>
  );
}

// ==================== DAY ====================
function StatusList({ state, t }: { state: NfState; t: UIText }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {state.players.map((name, p) => (
        <div key={p} className={`flex items-center gap-2 border px-2 py-1.5 text-sm ${state.alive[p] ? 'border-indigo-600/40' : 'border-zinc-700 opacity-60'}`}>
          <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-black shrink-0" style={{ background: state.alive[p] ? PLAYER_COLORS[p] : '#52525b' }}>{p + 1}</span>
          <span className={`truncate flex-1 ${state.alive[p] ? '' : 'line-through'}`}>{name}</span>
          {!state.alive[p] && (state.ghostVote[p] ? <Ghost className="w-3.5 h-3.5 text-indigo-300" aria-label={t.ghost} /> : <Skull className="w-3.5 h-3.5 text-zinc-500" aria-label={t.dead} />)}
        </div>
      ))}
    </div>
  );
}

function DayClockPanel({ total, onExpire, label, t }: { total: number; onExpire: () => void; label: string; t: UIText }) {
  const clock = useDayClock(total, onExpire);
  const mm = Math.floor(clock.remaining / 60);
  const ss = String(clock.remaining % 60).padStart(2, '0');
  useEffect(() => {
    if (clock.remaining <= 10 && clock.remaining > 0) sfxTick(clock.remaining <= 5);
  }, [clock.remaining]);
  return (
    <div className="border border-indigo-500/40 bg-black/40 p-3">
      <p className="text-indigo-300/70 text-xs">{label}</p>
      <p className={`text-4xl font-bold ${clock.remaining <= 30 ? 'text-red-300' : 'text-indigo-50'}`}>{mm}:{ss}</p>
      <div className="flex gap-2 mt-2">
        <button onClick={clock.toggle} className="flex-1 py-2 border border-indigo-500/50 text-sm flex items-center justify-center gap-1">{clock.running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}{clock.running ? t.pause : t.resume}</button>
        <button onClick={clock.addMinute} className="flex-1 py-2 border border-indigo-500/50 text-sm">{t.addMinute}</button>
        <button onClick={clock.skip} className="flex-1 py-2 border border-indigo-500/50 text-sm">{t.skip}</button>
      </div>
    </div>
  );
}

function leadingNomination(state: NfState) {
  const valid = state.nominations.filter((x) => x.valid);
  const top = Math.max(0, ...valid.map((x) => x.votes));
  const leaders = valid.filter((x) => x.votes === top);
  return leaders.length === 1 ? leaders[0] : null;
}

function DayScreen({ state, dispatch, t }: { state: NfState; dispatch: (a: Action) => void; t: UIText }) {
  const [mode, setMode] = useState<null | 'nominate' | 'nova'>(null);
  const [nominator, setNominator] = useState<number | null>(null);
  const [nominee, setNominee] = useState<number | null>(null);
  const [voters, setVoters] = useState<number[]>([]);
  const [shooter, setShooter] = useState<number | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const need = voteThreshold(state);
  const endDay = useCallback(() => {
    if (leadingNomination(state)) {
      sfxExecution();
      buzz(200);
    }
    dispatch({ type: 'END_DAY' });
  }, [dispatch, state]);
  const toNominations = useCallback(() => {
    sfxBell();
    buzz([150, 100, 150]);
    dispatch({ type: 'START_NOMINATIONS' });
  }, [dispatch]);
  const reset = () => { setMode(null); setNominator(null); setNominee(null); setVoters([]); setShooter(null); setTarget(null); };
  const weight = (v: number) => (state.roles[v] === 'echo' && state.alive[v] && state.poisoned !== v ? 2 : 1);
  const votes = voters.reduce((a, v) => a + weight(v), 0);
  const chip = (p: number, on: boolean, onClick: () => void, disabled = false, extra = '') => (
    <button key={p} disabled={disabled} onClick={onClick} className={`py-2 px-2 border text-sm truncate disabled:opacity-30 ${on ? 'text-black font-bold' : 'border-indigo-600/50 text-indigo-100'}`} style={on ? { background: PLAYER_COLORS[p], borderColor: PLAYER_COLORS[p] } : undefined}>
      {state.players[p]}{extra}
    </button>
  );
  const leader = leadingNomination(state);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-amber-200"><Sun className="w-5 h-5" /><h2 className="text-sm" style={PIXEL}>{t.day(state.night)}</h2></div>
      <div className="space-y-1">
        {state.events.map((e, i) => <p key={i} className="text-sm text-indigo-50">{eventLine(e, state, t)}</p>)}
      </div>
      <StatusList state={state} t={t} />

      {state.dayStage === 'discussion' ? (
        <div className="space-y-3">
          <p className="text-sm text-indigo-100 leading-relaxed border border-amber-400/30 bg-amber-500/5 p-3"><Users className="inline w-4 h-4 mr-1" />{t.discussionHint}</p>
          <DayClockPanel key={`d-${state.night}`} total={TIMING.discussion} onExpire={toNominations} label={t.discussion} t={t} />
          <button onClick={toNominations} className={primaryBtn} style={PIXEL}>{t.toNominations}</button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-center text-amber-200 font-bold">{t.backToSeats}</p>
          <p className="text-xs text-indigo-200/80 leading-relaxed">{t.nominationHint(need)}</p>
          <DayClockPanel key={`n-${state.night}`} total={TIMING.nomination} onExpire={endDay} label={t.nomination} t={t} />
          <div className="border border-indigo-500/30 bg-black/30 p-3 space-y-1.5">
            {state.nominations.map((x, i) => (
              <p key={i} className="text-sm flex justify-between gap-2">
                <span><b style={{ color: PLAYER_COLORS[x.nominee] }}>{state.players[x.nominee]}</b> <span className="text-indigo-300/60">← {state.players[x.nominator]}</span></span>
                <span className={x.valid ? 'text-emerald-300' : 'text-indigo-300/60'}>{x.votes} · {x.valid ? t.valid : t.notValid}</span>
              </p>
            ))}
            <p className="text-sm font-bold text-amber-200">{leader ? t.leading(state.players[leader.nominee]) : t.noLeader}</p>
          </div>

          {mode === null && (
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => setMode('nominate')} className={primaryBtn} style={PIXEL}><Gavel className="inline w-4 h-4 mr-2" />{t.newNomination}</button>
              <button onClick={() => setMode('nova')} className="w-full py-3 border border-indigo-500/50 text-indigo-100 text-[10px]" style={PIXEL}><Crosshair className="inline w-4 h-4 mr-2" />{t.dayAbility}</button>
              <button onClick={() => { if (window.confirm(t.confirmEndDay)) endDay(); }} className="w-full py-3 border border-red-500/60 text-red-200 text-[10px]" style={PIXEL}>{t.endDay}</button>
            </div>
          )}

          {mode === 'nominate' && (
            <div className="border border-indigo-400/40 bg-indigo-950/40 p-3 space-y-3">
              <p className="text-sm">{t.nominator}</p>
              <div className="grid grid-cols-2 gap-1.5">{state.players.map((_, p) => chip(p, nominator === p, () => setNominator(p), !state.alive[p] || state.nominations.some((x) => x.nominator === p)))}</div>
              <p className="text-sm">{t.nominee}</p>
              <div className="grid grid-cols-2 gap-1.5">{state.players.map((_, p) => chip(p, nominee === p, () => setNominee(p), !state.alive[p] || state.nominations.some((x) => x.nominee === p)))}</div>
              <p className="text-sm">{t.voters}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {state.players.map((_, p) => chip(p, voters.includes(p), () => setVoters((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])), !state.alive[p] && !state.ghostVote[p], !state.alive[p] ? ' 👻' : ''))}
              </div>
              <p className={`text-sm font-bold ${votes >= need ? 'text-emerald-300' : 'text-indigo-200'}`}>{t.votesCount(votes, need)}</p>
              <div className="flex gap-2">
                <button onClick={reset} className="flex-1 py-3 border border-indigo-600/50 text-sm">{t.cancel}</button>
                <button disabled={nominator === null || nominee === null} onClick={() => { dispatch({ type: 'NOMINATE', nominator: nominator!, nominee: nominee!, voters }); reset(); }} className="flex-[2] py-3 border-2 border-indigo-400 bg-indigo-500/20 text-[10px] disabled:opacity-40" style={PIXEL}>{t.confirmNomination}</button>
              </div>
            </div>
          )}

          {mode === 'nova' && (
            <div className="border border-indigo-400/40 bg-indigo-950/40 p-3 space-y-3">
              <p className="text-sm">{t.shooter}</p>
              <div className="grid grid-cols-2 gap-1.5">{state.players.map((_, p) => chip(p, shooter === p, () => setShooter(p), !state.alive[p]))}</div>
              <p className="text-sm">{t.target}</p>
              <div className="grid grid-cols-2 gap-1.5">{state.players.map((_, p) => chip(p, target === p, () => setTarget(p), !state.alive[p] || p === shooter))}</div>
              <div className="flex gap-2">
                <button onClick={reset} className="flex-1 py-3 border border-indigo-600/50 text-sm">{t.cancel}</button>
                <button disabled={shooter === null || target === null} onClick={() => { sfxExecution(); dispatch({ type: 'NOVA_SHOT', shooter: shooter!, target: target! }); reset(); }} className="flex-[2] py-3 border-2 border-red-400 bg-red-500/20 text-[10px] disabled:opacity-40" style={PIXEL}>{t.shoot}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== MAIN ====================
export function NightfallDeception() {
  const navigate = useNavigate();
  const { addExp } = useGamification();
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [overlay, setOverlay] = useState<null | 'rules' | 'roles' | 'hint'>(null);
  const [names, setNames] = useState<string[]>(() => (state.players.length ? state.players : Array(NF_MIN_PLAYERS).fill('')));
  const [muted, setMutedState] = useState(isMuted);
  const expGiven = useRef(false);
  const t = UI[state.lang];
  const lang: Lang = state.lang;
  const inGame = !['howto', 'setup', 'seating', 'final'].includes(state.phase);

  useEffect(() => {
    try {
      if (state.phase === 'howto' || state.phase === 'setup') sessionStorage.removeItem(STORAGE_KEY);
      else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable: the game still works, it just cannot be resumed
    }
  }, [state]);

  // Site background music off while playing; night music follows the phase
  useEffect(() => {
    pauseBgMusic();
    return () => {
      stopNightMusic();
      resumeBgMusic();
    };
  }, []);
  useEffect(() => {
    if (state.phase === 'nightPass' || state.phase === 'night' || state.phase === 'nightEnd') startNightMusic();
    else if (state.phase !== 'morning') stopNightMusic();
  }, [state.phase]);
  useEffect(() => {
    if (state.phase === 'final' && state.winner && !expGiven.current) {
      expGiven.current = true;
      sfxVictory(state.winner);
      addExp(50);
    }
  }, [state.phase, state.winner, addExp]);

  useEffect(() => {
    if (!inGame) return;
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> } };
    nav.wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => {});
    return () => { lock?.release().catch(() => {}); };
  }, [inGame]);

  const exit = () => {
    if (inGame && !window.confirm(t.confirmExit)) return;
    dispatch({ type: 'RESET' });
    navigate('/games');
  };
  const arrange = (list: string[]) => {
    if (validateNightfallPlayers(list) !== null) return;
    dispatch({ type: 'ARRANGE', players: shuffleSeats(list) });
  };
  const toggleMute = () => {
    setMuted(!muted);
    setMutedState(!muted);
  };

  const isNightLook = ['nightPass', 'night', 'nightEnd'].includes(state.phase);
  const privateTurn = state.phase === 'night' || state.phase === 'dawn';
  const hintPlayer = privateTurn ? pendingPlayer(state) : null;

  const shell = (children: React.ReactNode) => (
    <div className={`fixed inset-0 z-50 overflow-auto font-sans transition-colors duration-1000 ${isNightLook ? 'bg-[#05030a] text-indigo-50' : 'bg-[#120f1c] text-indigo-50'}`}>
      <div className="absolute inset-0 pointer-events-none opacity-10"><div className="scanlines h-full w-full" /></div>
      <div className="relative z-10 min-h-full flex flex-col items-center px-4 pt-4 pb-12">
        <div className="w-full max-w-xl flex items-center justify-between mb-4 gap-2">
          <button onClick={exit} className="p-2 border border-indigo-500/40 text-indigo-300" aria-label={t.backToGames}><ArrowLeft className="w-5 h-5" /></button>
          <span className="text-indigo-200 text-[9px] sm:text-[10px] text-center" style={PIXEL}>{t.title}</span>
          <div className="flex gap-1.5">
            {!privateTurn && <button onClick={() => setOverlay('roles')} className="p-2 border border-indigo-500/40 text-indigo-300" aria-label={t.roleBook}><BookOpen className="w-5 h-5" /></button>}
            {!privateTurn && <button onClick={() => setOverlay('rules')} className="p-2 border border-indigo-500/40 text-indigo-300" aria-label={t.rules}><ScrollText className="w-5 h-5" /></button>}
            <button onClick={toggleMute} className="p-2 border border-indigo-500/40 text-indigo-300" aria-label={muted ? t.unmute : t.mute}>{muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</button>
          </div>
        </div>
        <div className="w-full max-w-xl">{children}</div>
      </div>
      {overlay === 'roles' && <Overlay title={t.roleBook} onClose={() => setOverlay(null)} closeLabel={t.close}><RoleBook lang={lang} /></Overlay>}
      {overlay === 'rules' && <Overlay title={t.rules} onClose={() => setOverlay(null)} closeLabel={t.close}><RulesView lang={lang} /></Overlay>}
      {overlay === 'hint' && hintPlayer !== null && (
        <Overlay title={t.roleHint} onClose={() => setOverlay(null)} closeLabel={t.close}>
          <RoleHint role={state.roles[hintPlayer]} lang={lang} reports={state.reports[hintPlayer] ?? []} names={state.players} />
        </Overlay>
      )}
    </div>
  );

  // ==================== START ====================
  if (state.phase === 'howto') {
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center space-y-5">
        <Moon className="w-16 h-16 text-indigo-300 mt-2" strokeWidth={1.5} />
        <h1 className="text-lg sm:text-2xl text-indigo-100 leading-relaxed" style={PIXEL}>{t.title}</h1>
        <p className="text-indigo-200/80 italic">{t.tagline}</p>
        <div className="flex gap-2">
          {(['id', 'en'] as Lang[]).map((l) => (
            <button key={l} onClick={() => dispatch({ type: 'SET_LANG', lang: l })} className={`px-4 py-2 border text-[10px] ${state.lang === l ? 'border-indigo-300 bg-indigo-500/20' : 'border-indigo-800 text-indigo-400'}`} style={PIXEL}>{l === 'id' ? 'INDONESIA' : 'ENGLISH'}</button>
          ))}
        </div>
        <p className="text-sm text-indigo-100/85 leading-relaxed text-left">{t.intro}</p>
        <button onClick={() => setOverlay('roles')} className="w-full py-4 border-2 border-amber-400 bg-amber-500/15 text-amber-100 text-[10px] flex items-center justify-center gap-2" style={PIXEL}><BookOpen className="w-4 h-4" />{t.viewRoles}</button>
        <button onClick={() => setOverlay('rules')} className="w-full py-3 border border-indigo-500/50 text-indigo-100 text-[10px] flex items-center justify-center gap-2" style={PIXEL}><ScrollText className="w-4 h-4" />{t.viewRules}</button>
        <button onClick={() => dispatch({ type: 'SHOW_SETUP' })} className={primaryBtn} style={PIXEL}>{t.toSetup}</button>
      </motion.div>
    );
  }

  // ==================== SETUP ====================
  if (state.phase === 'setup') {
    const error = validateNightfallPlayers(names);
    const showError = error !== null && !(error === 'empty' && names.every((x) => x.trim() === ''));
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-indigo-200 text-sm mb-1 flex items-center gap-2" style={PIXEL}><Users className="w-5 h-5" />{t.setupTitle}</h1>
        <p className="text-indigo-200/70 text-sm mb-4">{t.setupHint}</p>
        <div className="space-y-2 mb-3">
          {names.map((name, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={name} maxLength={14} onChange={(e) => { const value = e.target.value; setNames((prev) => prev.map((x, j) => (j === i ? value : x))); }} placeholder={t.playerPlaceholder(i)} className="flex-1 min-w-0 bg-black/40 border border-indigo-600/50 px-3 py-2.5 outline-none focus:border-indigo-300" />
              {names.length > NF_MIN_PLAYERS && <button onClick={() => setNames((prev) => prev.filter((_, j) => j !== i))} className="p-2 text-indigo-400 hover:text-red-400" aria-label="remove"><Trash2 className="w-4 h-4" /></button>}
            </div>
          ))}
        </div>
        {names.length < NF_MAX_PLAYERS && <button onClick={() => setNames((prev) => [...prev, ''])} className="flex items-center gap-2 text-sm text-indigo-300 mb-3"><Plus className="w-4 h-4" />{t.addPlayer}</button>}
        {names.length >= NF_MIN_PLAYERS && <p className="text-xs text-indigo-300/70 mb-3">{t.composition(names.length)}</p>}
        {showError && <p className="text-amber-300 text-sm mb-3">{t.errors[error]}</p>}
        <button disabled={error !== null} onClick={() => arrange(names)} className={primaryBtn} style={PIXEL}>{t.shuffleSeats}</button>
      </motion.div>
    );
  }

  // ==================== ROUND TABLE ====================
  if (state.phase === 'seating') {
    const first = state.players[0];
    return shell(
      <motion.div key={state.players.join('|')} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h1 className="text-indigo-200 text-sm flex items-center gap-2" style={PIXEL}><Users className="w-5 h-5" />{t.seatingTitle}</h1>
        <p className="text-sm leading-relaxed">{t.seatingIntro(first)}</p>
        <div className="border border-indigo-500/30 bg-black/30 p-3">
          <RoundTable players={state.players} startsLabel={t.seatingStarts} />
          <p className="text-center text-indigo-300/50 text-[11px] mt-1">{t.seatingView}</p>
        </div>
        <ol className="space-y-1.5">
          {state.players.map((name, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-bold text-black" style={{ background: PLAYER_COLORS[i] }}>{i + 1}</span>
              <span>{i === 0 ? <><b>{name}</b> — {t.seatingStarts}</> : t.seatingLeftOf(name, state.players[i - 1])}</span>
            </li>
          ))}
        </ol>
        <p className="text-indigo-200/70 text-sm">{t.seatingPass}</p>
        <button onClick={() => { startNightMusic(); expGiven.current = false; dispatch({ type: 'START', seed: Math.floor(Math.random() * 2 ** 31) }); }} className={primaryBtn} style={PIXEL}>{t.beginNight}</button>
        <button onClick={() => arrange(state.players)} className="w-full py-3 border border-indigo-500/50 text-[10px] flex items-center justify-center gap-2" style={PIXEL}><RotateCcw className="w-4 h-4" />{t.reshuffle}</button>
      </motion.div>
    );
  }

  // ==================== PASS SCREENS ====================
  if (state.phase === 'nightPass' || state.phase === 'dawnPass') {
    const player = pendingPlayer(state)!;
    const isNight = state.phase === 'nightPass';
    const yesterday = isNight && state.turn === 0 && state.night > 1 ? state.events.filter((e) => e.k !== 'deaths') : [];
    return shell(
      <motion.div key={`${state.phase}-${state.night}-${player}`} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center pt-4">
        <p className="text-indigo-300/70 text-xs mb-4 flex items-center gap-2" style={PIXEL}>{isNight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}{isNight ? t.night(state.night) : t.morningTitle(state.night)}</p>
        {yesterday.length > 0 && (
          <div className="w-full border border-red-500/30 bg-red-500/5 p-3 mb-6 text-sm">
            <p className="text-red-200/70 text-xs mb-1">{t.yesterday}</p>
            {yesterday.map((e, i) => <p key={i}>{eventLine(e, state, t)}</p>)}
          </div>
        )}
        <p className="text-indigo-200 mb-2">{t.passTo}</p>
        <p className="text-3xl sm:text-4xl font-bold mb-4 break-all" style={{ color: PLAYER_COLORS[player] }}>{state.players[player]}</p>
        <p className="text-indigo-200/70 text-sm mb-10 max-w-sm">{isNight ? t.passNightHint : t.passDawnHint}</p>
        <EyeOff className="w-12 h-12 text-indigo-500/60 mb-10" />
        <button onClick={() => { setOverlay(null); dispatch({ type: 'CONFIRM_PASS' }); }} className="w-full py-4 border-2 text-sm font-bold" style={{ borderColor: PLAYER_COLORS[player], color: PLAYER_COLORS[player] }}>{t.imReady(state.players[player])}</button>
      </motion.div>
    );
  }

  if (state.phase === 'night') return shell(<NightTurn key={`n-${state.night}-${state.turn}`} state={state} dispatch={dispatch} t={t} onHint={() => setOverlay('hint')} />);
  if (state.phase === 'nightEnd') return shell(<NightEnd key={`e-${state.night}`} state={state} dispatch={dispatch} t={t} />);
  if (state.phase === 'dawn') return shell(<DawnTurn key={`d-${state.night}-${state.turn}`} state={state} dispatch={dispatch} t={t} onHint={() => setOverlay('hint')} />);

  // ==================== MORNING ANNOUNCEMENT ====================
  if (state.phase === 'morning') {
    const deaths = state.lastNightDeaths;
    return shell(
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="flex flex-col items-center text-center pt-6 space-y-6">
        {deaths.length ? <Skull className="w-16 h-16 text-red-400" /> : <Sun className="w-16 h-16 text-amber-300" />}
        <h2 className="text-lg" style={PIXEL}>{t.morningTitle(state.night)}</h2>
        <p className={`text-xl font-bold ${deaths.length ? 'text-red-200' : 'text-amber-100'}`}>{deaths.length ? t.deathsSome(nameList(state, deaths)) : t.deathsNone}</p>
        <div className="w-full"><StatusList state={state} t={t} /></div>
        <button onClick={() => dispatch({ type: 'BEGIN_DAWN' })} className={primaryBtn} style={PIXEL}>{state.winner ? t.seeResult : t.startDawnLap(state.players[lapStart(state)])}</button>
      </motion.div>
    );
  }

  if (state.phase === 'day') return shell(<DayScreen key={`day-${state.night}`} state={state} dispatch={dispatch} t={t} />);

  // ==================== FINAL ====================
  if (state.phase === 'final' && state.winner) {
    const good = state.winner === 'good';
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-center text-indigo-200 text-xs" style={PIXEL}>{t.finalTitle}</h2>
        <div className={`border-2 p-5 text-center ${good ? 'border-amber-300 bg-amber-500/10' : 'border-red-500 bg-red-500/10'}`}>
          <p className={`text-2xl font-bold ${good ? 'text-amber-200' : 'text-red-300'}`}>{good ? t.winGood : t.winEvil}</p>
          {state.winReason && <p className="text-sm mt-1 text-indigo-100/80">{t.reasons[state.winReason]}</p>}
        </div>
        {state.events.length > 0 && <div className="space-y-1">{state.events.map((e, i) => <p key={i} className="text-sm">{eventLine(e, state, t)}</p>)}</div>}
        <h3 className="text-indigo-200 text-xs uppercase tracking-wider">{t.grimoire}</h3>
        <div className="space-y-1.5">
          {state.players.map((name, p) => {
            const role = state.roles[p];
            return (
              <div key={p} className={`flex items-center gap-3 border p-2 ${state.alive[p] ? 'border-indigo-600/40' : 'border-zinc-700 opacity-70'}`}>
                <RoleIcon role={role} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{name}{!state.alive[p] ? ' ☠' : ''}</p>
                  <p className="text-xs" style={{ color: TEAM_COLOR[ROLES[role].team] }}>{ROLES[role].name}{state.startRoles[p] !== role ? ` (${ROLES[state.startRoles[p]].name} →)` : ''} · {TEAM_LABEL[ROLES[role].team][lang]}</p>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={() => arrange(state.players)} className={`${primaryBtn} flex items-center justify-center gap-2`} style={PIXEL}><RotateCcw className="w-4 h-4" />{t.playAgain}</button>
        <button onClick={() => { setNames(state.players); dispatch({ type: 'SHOW_SETUP' }); }} className="w-full py-3 border border-indigo-500/50 text-[10px]" style={PIXEL}>{t.newPlayers}</button>
      </motion.div>
    );
  }

  return shell(null);
}
