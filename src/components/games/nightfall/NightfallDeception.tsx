import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ScrollText, Map as MapIcon, Volume2, VolumeX, Plus, Trash2, Users, EyeOff, Moon, Sun, Skull, Crosshair, Gavel, Pause, Play, RotateCcw, HelpCircle, Ghost, Megaphone, Lock, Shuffle, Trophy, Sparkles } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { pauseBgMusic, resumeBgMusic } from '@/lib/audio';
import { RoundTable } from '@/components/games/party/RoundTable';
import { PLAYER_COLORS } from '@/components/games/party/colors';
import { ROLES, TEAM_LABEL, type RoleId } from '@/data/nightfallRoles';
import {
  reducer,
  initialState,
  pendingPlayer,
  nightSpec,
  jokerOptions,
  canSuspect,
  canStillVote,
  turnPlayer,
  canGhostVote,
  saintMustAct,
  saintOf,
  onWinningSide,
  pointsOf,
  mvps,
  sideOfPlayer,
  seatOf,
  lapStart,
  voteThreshold,
  voteWeight,
  validateNightfallPlayers,
  shuffleSeats,
  TIMING,
  MODES,
  NF_MIN_PLAYERS,
  NF_MAX_PLAYERS,
  type NfState,
  type Action,
  type Lang,
  type Mode,
  type JokerMove,
  type NightSpec,
  type PublicEvent,
  type ChronEntry,
} from '@/lib/party/nightfall';
import { startNightMusic, stopNightMusic, sfxTick, sfxGlitch, sfxDeath, sfxMorning, sfxExecution, sfxBell, sfxVictory, sfxNightfall, sfxDawn, sfxConfession, buzz, isMuted, setMuted } from '@/lib/nightfallSound';
import { RoleIcon } from '@/components/games/nightfall/RoleIcon';
import { TEAM_COLOR, seatTileClass } from '@/components/games/nightfall/palette';
import { Overlay, RoleBook, RulesView, RoleHint, SeatMap } from '@/components/games/nightfall/Panels';
import { UI, reportLine, chronicleLine, type UIText } from '@/components/games/nightfall/texts';
import { useTurnClock, useDayClock } from '@/components/games/nightfall/useClock';

const STORAGE_KEY = 'nightfall-game-v3';
const PIXEL = { fontFamily: '"Press Start 2P", cursive' };
const primaryBtn = 'w-full py-4 border-2 border-indigo-400 bg-indigo-500/15 text-indigo-100 text-[10px] sm:text-xs disabled:opacity-40';
const secondaryBtn = 'w-full py-3 border border-indigo-500/50 text-indigo-100 text-[10px] disabled:opacity-40';
const MODE_ICON: Record<Mode, RoleId> = { standard: 'abyss', joker: 'joker', zombie: 'zombie' };

function loadState(): NfState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as NfState;
      if (parsed && typeof parsed.phase === 'string' && Array.isArray(parsed.players) && Array.isArray(parsed.seats)) return reducer(parsed, { type: 'RESUME_AT_PASS' });
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
    case 'novaMiss': return t.events.novaMiss(nm(e.shooter), nm(e.target), e.died);
    case 'deaths': return e.players.length ? t.deathsSome(nameList(state, e.players)) : t.deathsNone;
    case 'saved': return t.events.saved(nm(e.target), e.by, e.what);
    case 'pyre': return t.events.pyre(nm(e.by), nm(e.target));
    case 'pactDeath': return t.events.pactDeath(nm(e.target), nm(e.partner));
    case 'crownBurden': return t.events.crownBurden(nm(e.target));
    case 'revived': return t.events.revived(nm(e.target));
    case 'apex': return t.events.apex;
    case 'saintRevealed': return t.events.saintRevealed(nm(e.player));
    case 'saintKill': return t.events.saintKill(nm(e.saint), nm(e.target), e.blocked);
    case 'saintRevive': return t.events.saintRevive(nm(e.saint), nm(e.target));
    case 'seats': return null;
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

/** Players listed in seat order; `canPick` decides who is selectable. */
function PlayerPicker({ state, selected, onToggle, canPick, self, ordered, t }: { state: NfState; selected: number[]; onToggle: (p: number) => void; canPick: (p: number) => boolean; self: number; ordered?: boolean; t: UIText }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {state.seats.map((p) => {
        const on = selected.includes(p);
        return (
          <button
            key={p}
            disabled={!canPick(p)}
            onClick={() => onToggle(p)}
            className={`py-2.5 px-2 border text-sm truncate disabled:opacity-30 ${on ? 'text-black font-bold' : 'border-indigo-600/50 text-indigo-100'}`}
            style={on ? { background: PLAYER_COLORS[p], borderColor: PLAYER_COLORS[p] } : undefined}
          >
            {state.players[p]}{p === self ? ' •' : ''}{ordered && on ? ` (${t.order(selected.indexOf(p))})` : ''}
          </button>
        );
      })}
    </div>
  );
}

const toggleIn = (prev: number[], p: number, max: number) => (prev.includes(p) ? prev.filter((x) => x !== p) : max === 1 ? [p] : prev.length < max ? [...prev, p] : prev);

function RoleCard({ state, player, t }: { state: NfState; player: number; t: UIText }) {
  const role = state.roles[player];
  const color = TEAM_COLOR[ROLES[role].team];
  return (
    <div className="border p-3 bg-black/40 space-y-2" style={{ borderColor: `${color}66` }}>
      <div className="flex items-center gap-3">
        <RoleIcon role={role} size={52} />
        <div className="min-w-0">
          <p className="text-xs text-indigo-300/70">{state.players[player]} · {t.yourRole} · {t.yourSeat(seatOf(state, player) + 1)}</p>
          <p className="text-lg font-bold" style={{ color }}>{ROLES[role].name}{!state.alive[player] ? ' 👻' : ''}</p>
          <p className="text-[11px]" style={{ color }}>{TEAM_LABEL[ROLES[role].team][state.lang]}</p>
        </div>
      </div>
      {state.crowned === player && <p className="text-sm font-bold text-amber-200">{t.crownBadge}</p>}
      {state.infected[player] && <p className="text-sm font-bold text-lime-300">{t.infectedBadge}</p>}
    </div>
  );
}

function promptFor(state: NfState, player: number, spec: NightSpec, t: UIText): string {
  if (!state.alive[player]) return t.prompt.dead;
  switch (spec.kind) {
    case 'aura': return t.prompt.aura;
    case 'protect': return t.prompt.protect;
    case 'poison': return t.prompt.poison;
    case 'kill': return t.prompt.kill(spec.count, spec.allowSelf);
    case 'gouge': return t.prompt.gouge(spec.count);
    case 'bane': return t.prompt.bane;
    case 'revive': return t.prompt.revive;
    case 'revenge': return t.prompt.revenge;
    case 'tide': return t.prompt.tide(state.tideLeft);
    case 'infect': return t.prompt.infect(spec.count);
    case 'frenzy': return t.prompt.frenzy;
    case 'crownKill': return t.prompt.crownKill;
    default: return canSuspect(state, player) ? t.prompt.dummy : t.prompt.dummyDark;
  }
}

// ==================== PRIVATE NIGHT TURN ====================
type TurnProps = { state: NfState; dispatch: (a: Action) => void; t: UIText; onHint: () => void };

function NightTurn(props: TurnProps) {
  const player = pendingPlayer(props.state)!;
  return nightSpec(props.state, player).kind === 'joker' ? <JokerTurn {...props} /> : <ActionTurn {...props} />;
}

function ActionTurn({ state, dispatch, t, onHint }: TurnProps) {
  const player = pendingPlayer(state)!;
  const spec = nightSpec(state, player);
  const [selected, setSelected] = useState<number[]>([]);
  const [suspect, setSuspect] = useState<number | null>(null);
  const showSuspect = canSuspect(state, player) && spec.kind !== 'dummy';
  const suspectRef = useRef<number | null>(null);
  useEffect(() => {
    suspectRef.current = suspect;
  }, [suspect]);
  const total = state.night === 1 ? TIMING.nightTurnFirst : TIMING.nightTurn;
  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  const onExpire = useCallback(() => {
    sfxGlitch();
    buzz([60, 40, 60]);
    const current = selectedRef.current;
    dispatch({ type: 'SUBMIT_NIGHT', targets: spec.accept.includes(current.length) ? current : [], suspect: suspectRef.current ?? undefined });
  }, [dispatch, spec.accept]);
  const { elapsed, remaining } = useTurnClock(total, onExpire);
  const unlocked = elapsed >= TIMING.minTurn;
  const ready = selected.length > 0 && spec.accept.includes(selected.length);
  const toggle = (p: number) => setSelected((prev) => toggleIn(prev, p, spec.count));
  const canPick = (p: number) =>
    (spec.pool === 'dead' ? !state.alive[p] : state.alive[p]) && (spec.allowSelf || p !== player) && !(spec.excludeInfected && state.infected[p]);
  const seatNames = state.seats.map((p) => state.players[p]);
  return (
    <div className="space-y-4 pb-20">
      <ClockBar remaining={remaining} total={total} label={t.night(state.night)} />
      <RoleCard state={state} player={player} t={t} />
      {state.crowned === player && <p className="text-xs text-amber-200/80">{t.crownNote}</p>}
      {state.night === 1 && <p className="text-xs text-amber-200/80">{t.keepSecret}</p>}
      <p className="text-sm text-indigo-50">{promptFor(state, player, spec, t)}</p>
      {spec.pool === 'seat' ? (
        <div className="border border-amber-400/40 bg-black/30 p-2">
          <RoundTable
            players={seatNames}
            startsLabel=""
            hideNames
            colors={state.seats.map(() => '#a5b4fc')}
            ring={state.seats.map((_, k) => (selected.includes(k) ? '#fbbf24' : null))}
            disabledSeats={state.seats.map((p) => p === player)}
            center={[t.yourSeat(seatOf(state, player) + 1), t.seatChosen(selected.length ? selected[0] + 1 : null)]}
            onSeat={toggle}
          />
        </div>
      ) : (
        <PlayerPicker state={state} selected={selected} onToggle={toggle} canPick={canPick} self={player} ordered={spec.kind === 'bane'} t={t} />
      )}
      {spec.count > 1 && <p className="text-xs text-indigo-300/70">{t.selected(selected.length, spec.count)}</p>}
      {showSuspect && (
        <div className="space-y-2 border border-indigo-500/30 bg-black/30 p-2.5">
          <p className="text-xs text-indigo-200/85">{t.suspectOptional}</p>
          <PlayerPicker state={state} selected={suspect === null ? [] : [suspect]} onToggle={(p) => setSuspect((prev) => (prev === p ? null : p))} canPick={(p) => state.alive[p] && p !== player} self={player} t={t} />
        </div>
      )}
      <button disabled={!ready || !unlocked} onClick={() => dispatch({ type: 'SUBMIT_NIGHT', targets: selected, suspect: suspect ?? undefined })} className={primaryBtn} style={PIXEL}>
        {unlocked ? t.hideAndPass : t.minWait(Math.ceil(TIMING.minTurn - elapsed))}
      </button>
      {spec.accept.includes(0) && (
        <button disabled={!unlocked} onClick={() => dispatch({ type: 'SUBMIT_NIGHT', targets: [], suspect: suspect ?? undefined })} className={secondaryBtn} style={PIXEL}>{t.skipAbility}</button>
      )}
      <HintButton t={t} onHint={onHint} />
    </div>
  );
}

function JokerTurn({ state, dispatch, t, onHint }: TurnProps) {
  const player = pendingPlayer(state)!;
  const { canRecall } = jokerOptions(state);
  const [swap, setSwap] = useState<number[]>([]);
  const [move, setMove] = useState<JokerMove>('keep');
  const [giveTo, setGiveTo] = useState<number | null>(null);
  const total = state.night === 1 ? TIMING.nightTurnFirst : TIMING.nightTurn;
  const plan = useRef({ swap, move, giveTo });
  useEffect(() => {
    plan.current = { swap, move, giveTo };
  }, [swap, move, giveTo]);
  const submit = useCallback(() => {
    const p = plan.current;
    const mode: JokerMove = p.move === 'give' && p.giveTo === null ? 'keep' : p.move;
    dispatch({ type: 'SUBMIT_NIGHT', targets: mode === 'give' ? [p.giveTo!] : [], joker: { mode, swap: p.swap.length === 2 ? p.swap : [] } });
  }, [dispatch]);
  const onExpire = useCallback(() => {
    sfxGlitch();
    submit();
  }, [submit]);
  const { elapsed, remaining } = useTurnClock(total, onExpire);
  const unlocked = elapsed >= TIMING.minTurn;
  const ready = (move !== 'give' || giveTo !== null) && swap.length !== 1;
  const holder = state.crowned;
  const moveBtn = (m: JokerMove, label: string, disabled = false) => (
    <button key={m} disabled={disabled} onClick={() => setMove(m)} className={`py-2.5 px-2 border text-sm disabled:opacity-30 ${move === m ? 'border-amber-300 bg-amber-500/20 text-amber-100 font-bold' : 'border-indigo-600/50 text-indigo-100'}`}>{label}</button>
  );
  return (
    <div className="space-y-4 pb-20">
      <ClockBar remaining={remaining} total={total} label={t.night(state.night)} />
      <RoleCard state={state} player={player} t={t} />
      {state.night === 1 && <p className="text-xs text-amber-200/80">{t.keepSecret}</p>}
      <div className="space-y-2">
        <p className="text-sm text-indigo-50 flex items-center gap-2"><Shuffle className="w-4 h-4" />{t.joker.swapTitle}</p>
        <PlayerPicker state={state} selected={swap} onToggle={(p) => setSwap((prev) => toggleIn(prev, p, 2))} canPick={(p) => state.alive[p]} self={player} t={t} />
        <p className="text-xs text-indigo-300/70">{t.selected(swap.length, 2)}</p>
      </div>
      <div className="space-y-2 border border-red-500/30 bg-red-500/5 p-3">
        <p className="text-sm font-bold text-red-200">👑 {t.joker.crownTitle}</p>
        <p className="text-xs text-indigo-200/80">{t.joker.holderNow(holder !== null ? state.players[holder] : null)}</p>
        <div className="grid grid-cols-1 gap-1.5">
          {moveBtn('give', t.joker.give)}
          {moveBtn('recall', t.joker.recall, !canRecall)}
          {moveBtn('keep', t.joker.keep)}
        </div>
        {move === 'give' && (
          <>
            <p className="text-xs text-indigo-300/70">{t.joker.giveHint}</p>
            <PlayerPicker state={state} selected={giveTo === null ? [] : [giveTo]} onToggle={(p) => setGiveTo((prev) => (prev === p ? null : p))} canPick={(p) => state.alive[p] && p !== player && p !== holder} self={player} t={t} />
          </>
        )}
        {move === 'recall' && <p className="text-xs text-indigo-300/70">{t.joker.recallHint}</p>}
      </div>
      <button disabled={!ready || !unlocked} onClick={submit} className={primaryBtn} style={PIXEL}>
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
    // Everyone hears that the night is over, then what it brought
    sfxDawn();
    buzz([100, 80, 100]);
    window.setTimeout(() => {
      if (state.lastNightDeaths.length) {
        sfxDeath();
        buzz([300, 150, 300]);
      } else sfxMorning();
    }, 1500);
    if (state.seatsBefore) window.setTimeout(() => sfxGlitch(), 3300);
    dispatch({ type: 'SHOW_MORNING' });
  }, [dispatch, state.lastNightDeaths.length, state.seatsBefore]);
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

// ==================== PRIVATE DAWN REPORT + READ-ALOUD CHOICE ====================
function DawnTurn({ state, dispatch, t, onHint }: TurnProps) {
  const [speaking, setSpeaking] = useState(false);
  const player = pendingPlayer(state)!;
  const report = (state.reports[player] ?? []).find((r) => r.night === state.night);
  const lines = (report?.items ?? []).map((item) => reportLine(item, state.players, state.lang));
  return speaking ? (
    <div className="space-y-4 pb-20">
      <div className="flex items-center gap-2 text-amber-200"><Megaphone className="w-5 h-5" /><h2 className="text-sm" style={PIXEL}>{t.speakingTitle}</h2></div>
      <p className="text-sm text-indigo-200/80">{t.speakingHint}</p>
      <div className="border-2 border-amber-400/50 bg-amber-500/5 p-4 space-y-2">
        {lines.map((line, i) => <p key={i} className="text-lg text-indigo-50 leading-relaxed">{line}</p>)}
      </div>
      <button onClick={() => dispatch({ type: 'DONE_DAWN', shared: true })} className={primaryBtn} style={PIXEL}>{t.doneSpeaking}</button>
      <HintButton t={t} onHint={onHint} />
    </div>
  ) : (
    <DawnRead state={state} dispatch={dispatch} t={t} onHint={onHint} lines={lines} onShare={() => { sfxConfession(); buzz([120, 60, 120, 60, 300]); setSpeaking(true); }} />
  );
}

function DawnRead({ state, dispatch, t, onHint, lines, onShare }: TurnProps & { lines: string[]; onShare: () => void }) {
  const player = pendingPlayer(state)!;
  const total = state.night === 1 ? TIMING.dawnTurnFirst : TIMING.dawnTurn;
  const onExpire = useCallback(() => dispatch({ type: 'DONE_DAWN', shared: false }), [dispatch]);
  const { elapsed, remaining } = useTurnClock(total, onExpire);
  const unlocked = elapsed >= TIMING.minTurn;
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
        {lines.map((line, i) => <p key={i} className="text-indigo-50 leading-relaxed">{line}</p>)}
      </div>
      <p className="text-xs text-indigo-200/80">{t.shareQuestion}</p>
      <div className="grid grid-cols-1 gap-2">
        <button disabled={!unlocked} onClick={onShare} className={`${primaryBtn} flex items-center justify-center gap-2`} style={PIXEL}>
          <Megaphone className="w-4 h-4" />{unlocked ? t.shareRead : t.minWait(Math.ceil(TIMING.minTurn - elapsed))}
        </button>
        <button disabled={!unlocked} onClick={() => dispatch({ type: 'DONE_DAWN', shared: false })} className={`${secondaryBtn} flex items-center justify-center gap-2`} style={PIXEL}>
          <Lock className="w-4 h-4" />{t.shareKeep}
        </button>
      </div>
      <HintButton t={t} onHint={onHint} />
    </div>
  );
}

// ==================== TABLE & STATUS ====================
function StatusList({ state, t }: { state: NfState; t: UIText }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {state.seats.map((p, k) => (
        <div key={p} className={seatTileClass(canStillVote(state, p), p === turnPlayer(state))}>
          <span className={`flex items-center gap-2 w-full min-w-0 ${state.alive[p] ? '' : 'opacity-30'}`}>
            <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-black shrink-0" style={{ background: PLAYER_COLORS[p] }}>{k + 1}</span>
            <span className={`truncate flex-1 ${state.alive[p] ? '' : 'line-through'}`}>{state.players[p]}</span>
            {!state.alive[p] && (state.ghostVote[p] ? <Ghost className="w-3.5 h-3.5 text-indigo-300" aria-label={t.ghost} /> : <Skull className="w-3.5 h-3.5 text-zinc-500" aria-label={t.dead} />)}
          </span>
        </div>
      ))}
    </div>
  );
}

/** The table as it is now; when seats changed overnight, also how it was and who must move. */
function SeatingView({ state, t }: { state: NfState; t: UIText }) {
  const names = (seats: number[]) => seats.map((p) => state.players[p]);
  const colors = (seats: number[]) => seats.map((p) => (state.alive[p] ? PLAYER_COLORS[p] : '#52525b'));
  const before = state.seatsBefore;
  const pairs = state.morningEvents.flatMap((e) => (e.k === 'seats' ? e.pairs : []));
  const moved = state.seats.map((p, k) => (before && before[k] !== p ? '#fbbf24' : null));
  return (
    <div className="space-y-3">
      {before && (
        <div className="border-2 border-amber-400/60 bg-amber-500/10 p-3 space-y-1">
          <p className="font-bold text-amber-200 flex items-center gap-2"><Shuffle className="w-4 h-4" />{t.seatsChanged}</p>
          {pairs.map(([a, b], i) => <p key={i} className="text-sm text-amber-50">{t.swapNow(state.players[a], state.players[b])}</p>)}
        </div>
      )}
      {before && (
        <div className="border border-indigo-500/20 bg-black/20 p-2 opacity-70">
          <p className="text-center text-xs text-indigo-300/70">{t.before}</p>
          <div className="max-w-[240px] mx-auto">
            <RoundTable players={names(before)} startsLabel="" colors={colors(before)} dim={before.map((p) => !state.alive[p])} center={[t.before, '']} />
          </div>
        </div>
      )}
      <div className="border border-indigo-500/30 bg-black/30 p-2">
        <p className="text-center text-xs text-indigo-300/70">{before ? t.after : t.currentSeating}</p>
        <RoundTable players={names(state.seats)} startsLabel="" colors={colors(state.seats)} dim={state.seats.map((p) => !state.alive[p])} ring={moved} center={[before ? t.after : t.currentSeating, '']} />
      </div>
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

function EventLines({ events, state, t }: { events: PublicEvent[]; state: NfState; t: UIText }) {
  return (
    <>
      {events.map((e, i) => {
        const line = eventLine(e, state, t);
        return line ? <p key={i} className={`text-sm ${e.k === 'saved' || e.k === 'revived' || e.k === 'saintRevive' ? 'text-emerald-200 font-bold' : e.k === 'saintRevealed' || e.k === 'saintKill' ? 'text-amber-200 font-bold' : 'text-indigo-50'}`}>{line}</p> : null;
      })}
    </>
  );
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
  const votes = voters.reduce((a, v) => a + voteWeight(state, v), 0);
  const chip = (p: number, on: boolean, onClick: () => void, disabled = false, extra = '') => (
    <button key={p} disabled={disabled} onClick={onClick} className={`py-2 px-2 border text-sm truncate disabled:opacity-30 ${on ? 'text-black font-bold' : 'border-indigo-600/50 text-indigo-100'}`} style={on ? { background: PLAYER_COLORS[p], borderColor: PLAYER_COLORS[p] } : undefined}>
      {state.players[p]}{extra}
    </button>
  );
  const leader = leadingNomination(state);
  const order = state.players.map((_, k) => state.seats[(lapStart(state) + k) % state.players.length]);
  const shared = order.filter((p) => state.testimony[p] === true);
  const kept = order.filter((p) => state.testimony[p] === false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-amber-200"><Sun className="w-5 h-5" /><h2 className="text-sm" style={PIXEL}>{t.day(state.night)}</h2></div>
      <div className="space-y-1">
        <EventLines events={state.morningEvents} state={state} t={t} />
        <EventLines events={state.events} state={state} t={t} />
      </div>
      {(shared.length > 0 || kept.length > 0) && (
        <div className="border border-indigo-500/30 bg-black/30 p-3 text-sm space-y-1">
          <p><Megaphone className="inline w-4 h-4 mr-1 text-amber-300" /><span className="text-indigo-300/80">{t.testimonyShared}:</span> {nameList(state, shared) || '—'}</p>
          <p><Lock className="inline w-4 h-4 mr-1 text-indigo-300" /><span className="text-indigo-300/80">{t.testimonyKept}:</span> {nameList(state, kept) || '—'}</p>
        </div>
      )}
      <StatusList state={state} t={t} />

      {state.dayStage === 'discussion' ? (
        <div className="space-y-3">
          <p className="text-sm text-indigo-100 leading-relaxed border border-amber-400/30 bg-amber-500/5 p-3"><Users className="inline w-4 h-4 mr-1" />{t.discussionHint}</p>
          <DayClockPanel key={`d-${state.night}`} total={TIMING.discussion} onExpire={toNominations} label={t.discussion} t={t} />
          {saintMustAct(state) && <SaintPanel state={state} dispatch={dispatch} t={t} />}
          <button disabled={saintMustAct(state)} onClick={toNominations} className={primaryBtn} style={PIXEL}>{t.toNominations}</button>
          {saintMustAct(state) && <p className="text-xs text-amber-200/80">{t.saintWaiting}</p>}
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
              <button onClick={() => setMode('nova')} className={secondaryBtn} style={PIXEL}><Crosshair className="inline w-4 h-4 mr-2" />{t.dayAbility}</button>
              <button onClick={() => { if (window.confirm(t.confirmEndDay)) endDay(); }} className="w-full py-3 border border-red-500/60 text-red-200 text-[10px]" style={PIXEL}>{t.endDay}</button>
            </div>
          )}

          {mode === 'nominate' && (
            <div className="border border-indigo-400/40 bg-indigo-950/40 p-3 space-y-3">
              <p className="text-sm">{t.nominator}</p>
              <div className="grid grid-cols-2 gap-1.5">{state.seats.map((p) => chip(p, nominator === p, () => { setNominator(p); if (nominee === p) setNominee(null); }, !state.alive[p] || state.nominations.some((x) => x.nominator === p)))}</div>
              <p className="text-sm">{t.nominee}</p>
              <div className="grid grid-cols-2 gap-1.5">{state.seats.map((p) => chip(p, nominee === p, () => setNominee(p), !state.alive[p] || p === nominator || state.nominations.some((x) => x.nominee === p)))}</div>
              <p className="text-sm">{t.voters}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {state.seats.map((p) => chip(p, voters.includes(p), () => setVoters((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])), !state.alive[p] && !canGhostVote(state, p), !state.alive[p] ? (state.ghostVote[p] > 1 ? ' 👻×2' : ' 👻') : ''))}
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
              <div className="grid grid-cols-2 gap-1.5">{state.seats.map((p) => chip(p, shooter === p, () => setShooter(p), !state.alive[p]))}</div>
              <p className="text-sm">{t.target}</p>
              <div className="grid grid-cols-2 gap-1.5">{state.seats.map((p) => chip(p, target === p, () => setTarget(p), !state.alive[p] || p === shooter))}</div>
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

/** The revealed Saint (or the Heretic posing as one) must kill or revive before nominations. */
function SaintPanel({ state, dispatch, t }: { state: NfState; dispatch: (a: Action) => void; t: UIText }) {
  const saint = saintOf(state)!;
  const [mode, setMode] = useState<'kill' | 'revive'>('kill');
  const [target, setTarget] = useState<number | null>(null);
  const revivable = state.firstBlood.filter((p) => !state.alive[p]);
  const options = mode === 'kill' ? state.seats.filter((p) => state.alive[p] && p !== saint) : revivable;
  const choose = (m: 'kill' | 'revive') => {
    setMode(m);
    setTarget(null);
  };
  return (
    <div className="border-2 border-amber-300 bg-amber-500/10 p-3 space-y-3">
      <p className="font-bold text-amber-100 flex items-center gap-2"><Sparkles className="w-5 h-5" />{t.saintTitle(state.players[saint])}</p>
      <p className="text-sm text-amber-50/90 leading-relaxed">{t.saintMust}</p>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => choose('kill')} className={`py-2.5 border text-sm ${mode === 'kill' ? 'border-red-300 bg-red-500/20 text-red-100 font-bold' : 'border-indigo-600/50'}`}>{t.saintKillBtn}</button>
        <button disabled={!revivable.length} onClick={() => choose('revive')} className={`py-2.5 border text-sm disabled:opacity-30 ${mode === 'revive' ? 'border-emerald-300 bg-emerald-500/20 text-emerald-100 font-bold' : 'border-indigo-600/50'}`}>{t.saintReviveBtn}</button>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {options.map((p) => (
          <button key={p} onClick={() => setTarget(p)} className={`py-2 px-2 border text-sm truncate ${target === p ? 'text-black font-bold' : 'border-indigo-600/50 text-indigo-100'}`} style={target === p ? { background: PLAYER_COLORS[p], borderColor: PLAYER_COLORS[p] } : undefined}>
            {state.players[p]}
          </button>
        ))}
      </div>
      <button
        disabled={target === null}
        onClick={() => {
          if (!window.confirm(t.saintConfirmAsk)) return;
          if (mode === 'kill') sfxExecution();
          else sfxMorning();
          buzz(200);
          dispatch({ type: 'SAINT_ACT', mode, target: target! });
        }}
        className="w-full py-3 border-2 border-amber-300 bg-amber-500/20 text-amber-100 text-[10px] disabled:opacity-40"
        style={PIXEL}
      >
        {t.saintConfirm}
      </button>
    </div>
  );
}

/** Final points, highest first, with the MVP highlighted. */
function ScoreBoard({ state, t }: { state: NfState; t: UIText }) {
  const best = mvps(state);
  const rows = state.players
    .map((name, p) => ({ p, name, pts: pointsOf(state, p), s: state.score[p] }))
    .sort((a, b) => b.pts - a.pts || state.seats.indexOf(a.p) - state.seats.indexOf(b.p));
  return (
    <section className="space-y-2">
      <h3 className="text-indigo-200 text-xs uppercase tracking-wider flex items-center gap-1.5"><Trophy className="w-4 h-4 text-amber-300" />{t.scoreTitle}</h3>
      {best.length > 0 && (
        <div className="border-2 border-amber-300 bg-amber-500/10 p-3 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-300 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-amber-200" style={PIXEL}>{t.mvp}</p>
            <p className="text-lg font-bold text-amber-100 break-words">{best.map((p) => state.players[p]).join(' & ')}</p>
            <p className="text-xs text-amber-200/80">{t.pts(pointsOf(state, best[0]))} · {best.map((p) => ROLES[state.roles[p]].name).join(' & ')}</p>
          </div>
        </div>
      )}
      <ol className="space-y-1">
        {rows.map(({ p, name, pts, s }, i) => {
          const parts = s
            ? [
                s.suspect ? t.scoreSuspect(s.suspect) : '',
                s.votesRight ? t.scoreVotesRight(s.votesRight) : '',
                s.votesWrong ? t.scoreVotesWrong(s.votesWrong) : '',
                s.feats ? t.scoreFeats(s.feats) : '',
                s.survived ? t.scoreSurvived(s.survived) : '',
                s.kills ? t.scoreKills(s.kills) : '',
                onWinningSide(state, p) ? t.scoreWin : '',
              ].filter(Boolean)
            : [];
          return (
            <li key={p} className={`flex items-center gap-2 border px-2 py-1.5 ${best.includes(p) ? 'border-amber-300/70 bg-amber-500/5' : 'border-indigo-600/40'}`}>
              <span className="w-6 text-center text-xs text-indigo-300/80">{i + 1}.</span>
              <RoleIcon role={state.roles[p]} size={28} />
              <span className="flex-1 min-w-0">
                <span className="block truncate font-bold text-sm">{name}{best.includes(p) ? ' 🏆' : ''}</span>
                <span className="block text-[11px] text-indigo-300/75">{parts.length ? parts.join(' · ') : t.scoreNone}</span>
              </span>
              <span className="text-sm font-bold text-amber-200 shrink-0">{t.pts(pts)}</span>
            </li>
          );
        })}
      </ol>
      <p className="text-[11px] text-indigo-300/60 leading-relaxed">{t.pointsHint}</p>
    </section>
  );
}

/** Chronicle entries grouped by round and stage (Night 1, Morning 1, Day 1, Night 2…). */
function groupChronicle(entries: ChronEntry[]) {
  const groups: { round: number; stage: ChronEntry['stage']; items: ChronEntry['item'][] }[] = [];
  for (const e of entries) {
    const last = groups[groups.length - 1];
    if (last && last.round === e.round && last.stage === e.stage) last.items.push(e.item);
    else groups.push({ round: e.round, stage: e.stage, items: [e.item] });
  }
  return groups;
}

// ==================== MAIN ====================
export function NightfallDeception() {
  const navigate = useNavigate();
  const { addExp } = useGamification();
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [overlay, setOverlay] = useState<null | 'rules' | 'roles' | 'hint' | 'map'>(null);
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
  // Night falls — the game starts, or the day ends by timer, Skip or "End the day": same sound for everyone
  const prevPhase = useRef(state.phase);
  const nightfallTimer = useRef(0);
  useEffect(() => {
    const prev = prevPhase.current;
    prevPhase.current = state.phase;
    if (state.phase === 'nightPass' && (prev === 'day' || prev === 'seating')) {
      const executed = prev === 'day' && state.events.some((e) => e.k === 'executed');
      nightfallTimer.current = window.setTimeout(() => {
        sfxNightfall();
        buzz([200, 100, 200, 100, 200]);
      }, executed ? 1100 : 0);
    }
  }, [state.phase, state.events]);
  useEffect(() => () => window.clearTimeout(nightfallTimer.current), []);
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
  // The seat map is always available during a game — except to a crown holder picking a seat number blind
  const mapAvailable = state.seats.length === state.players.length && state.players.length > 0 && !(state.phase === 'night' && hintPlayer !== null && hintPlayer === state.crowned);

  const shell = (children: React.ReactNode) => (
    <div className={`fixed inset-0 z-50 overflow-auto font-sans transition-colors duration-1000 ${isNightLook ? 'bg-[#05030a] text-indigo-50' : 'bg-[#120f1c] text-indigo-50'}`}>
      <div className="absolute inset-0 pointer-events-none opacity-10"><div className="scanlines h-full w-full" /></div>
      <div className="relative z-10 min-h-full flex flex-col items-center px-4 pt-4 pb-12">
        <div className="w-full max-w-xl flex items-center justify-between mb-4 gap-2">
          <button onClick={exit} className="p-2 border border-indigo-500/40 text-indigo-300" aria-label={t.backToGames}><ArrowLeft className="w-5 h-5" /></button>
          <span className="text-indigo-200 text-[9px] sm:text-[10px] text-center" style={PIXEL}>{t.title}</span>
          <div className="flex gap-1.5">
            {mapAvailable && <button onClick={() => setOverlay('map')} className="p-2 border-2 border-amber-400/80 bg-amber-500/10 text-amber-200" aria-label={t.seatMap} title={t.seatMap}><MapIcon className="w-5 h-5" /></button>}
            {!privateTurn && <button onClick={() => setOverlay('roles')} className="p-2 border border-indigo-500/40 text-indigo-300" aria-label={t.roleBook}><BookOpen className="w-5 h-5" /></button>}
            {!privateTurn && <button onClick={() => setOverlay('rules')} className="p-2 border border-indigo-500/40 text-indigo-300" aria-label={t.rules}><ScrollText className="w-5 h-5" /></button>}
            <button onClick={toggleMute} className="p-2 border border-indigo-500/40 text-indigo-300" aria-label={muted ? t.unmute : t.mute}>{muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</button>
          </div>
        </div>
        <div className="w-full max-w-xl">{children}</div>
      </div>
      {overlay === 'roles' && <Overlay title={t.roleBook} onClose={() => setOverlay(null)} closeLabel={t.close}><RoleBook lang={lang} /></Overlay>}
      {overlay === 'map' && mapAvailable && <Overlay title={t.seatMap} onClose={() => setOverlay(null)} closeLabel={t.close}><SeatMap state={state} /></Overlay>}
      {overlay === 'rules' && <Overlay title={t.rules} onClose={() => setOverlay(null)} closeLabel={t.close}><RulesView lang={lang} /></Overlay>}
      {overlay === 'hint' && hintPlayer !== null && (
        <Overlay title={t.roleHint} onClose={() => setOverlay(null)} closeLabel={t.close}>
          <RoleHint
            role={state.roles[hintPlayer]}
            lang={lang}
            mode={state.mode}
            side={sideOfPlayer(state, hintPlayer)}
            status={[...(state.crowned === hintPlayer ? [t.crownBadge] : []), ...(state.infected[hintPlayer] ? [t.infectedBadge] : [])]}
            reports={state.reports[hintPlayer] ?? []}
            names={state.players}
          />
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
        <button onClick={() => setOverlay('rules')} className={`${secondaryBtn} flex items-center justify-center gap-2`} style={PIXEL}><ScrollText className="w-4 h-4" />{t.viewRules}</button>
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
        <h1 className="text-indigo-200 text-sm mb-3" style={PIXEL}>{t.modeTitle}</h1>
        <div className="grid grid-cols-1 gap-2 mb-6">
          {MODES.map((m) => (
            <button key={m} onClick={() => dispatch({ type: 'SET_MODE', mode: m })} className={`flex items-center gap-3 border-2 p-2.5 text-left ${state.mode === m ? 'border-amber-300 bg-amber-500/10' : 'border-indigo-700/50'}`} aria-pressed={state.mode === m}>
              <RoleIcon role={MODE_ICON[m]} size={40} className="shrink-0" />
              <span className="min-w-0">
                <span className={`block font-bold ${state.mode === m ? 'text-amber-200' : 'text-indigo-100'}`}>{t.modes[m].name}</span>
                <span className="block text-xs text-indigo-200/75 leading-snug">{t.modes[m].desc}</span>
              </span>
            </button>
          ))}
        </div>
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
        {names.length >= NF_MIN_PLAYERS && <p className="text-xs text-indigo-300/70 mb-3">{t.composition(names.length, state.mode)}</p>}
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
        <p className="text-xs text-amber-200/80">{t.modes[state.mode].name} · {t.composition(state.players.length, state.mode)}</p>
        <button onClick={() => { startNightMusic(); expGiven.current = false; dispatch({ type: 'START', seed: Math.floor(Math.random() * 2 ** 31) }); }} className={primaryBtn} style={PIXEL}>{t.beginNight}</button>
        <button onClick={() => arrange(state.players)} className={`${secondaryBtn} flex items-center justify-center gap-2`} style={PIXEL}><RotateCcw className="w-4 h-4" />{t.reshuffle}</button>
      </motion.div>
    );
  }

  // ==================== PASS SCREENS ====================
  if (state.phase === 'nightPass' || state.phase === 'dawnPass') {
    const player = pendingPlayer(state)!;
    const isNight = state.phase === 'nightPass';
    const yesterday = isNight && state.turn === 0 && state.night > 1 ? state.events : [];
    return shell(
      <motion.div key={`${state.phase}-${state.night}-${player}`} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center pt-4">
        <p className="text-indigo-300/70 text-xs mb-4 flex items-center gap-2" style={PIXEL}>{isNight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}{isNight ? t.night(state.night) : t.morningTitle(state.night)}</p>
        {yesterday.length > 0 && (
          <div className="w-full border border-red-500/30 bg-red-500/5 p-3 mb-6 text-sm">
            <p className="text-red-200/70 text-xs mb-1">{t.yesterday}</p>
            <EventLines events={yesterday} state={state} t={t} />
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
    const highlights = state.morningEvents.filter((e) => e.k !== 'deaths' && e.k !== 'seats');
    return shell(
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="flex flex-col items-center text-center pt-6 space-y-5">
        {deaths.length ? <Skull className="w-16 h-16 text-red-400" /> : <Sun className="w-16 h-16 text-amber-300" />}
        <h2 className="text-lg" style={PIXEL}>{t.morningTitle(state.night)}</h2>
        <p className={`text-xl font-bold ${deaths.length ? 'text-red-200' : 'text-amber-100'}`}>{deaths.length ? t.deathsSome(nameList(state, deaths)) : t.deathsNone}</p>
        {highlights.length > 0 && (
          <div className="w-full text-left border border-emerald-400/40 bg-emerald-500/5 p-3 space-y-1.5">
            <p className="text-xs text-emerald-200/80 uppercase tracking-wider">{t.highlights}</p>
            <EventLines events={highlights} state={state} t={t} />
          </div>
        )}
        <div className="w-full"><SeatingView state={state} t={t} /></div>
        <div className="w-full"><StatusList state={state} t={t} /></div>
        <button onClick={() => dispatch({ type: 'BEGIN_DAWN' })} className={primaryBtn} style={PIXEL}>{state.winner ? t.seeResult : t.startDawnLap(state.players[state.seats[lapStart(state)]])}</button>
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
        <ScoreBoard state={state} t={t} />
        <h3 className="text-indigo-200 text-xs uppercase tracking-wider">{t.grimoire}</h3>
        <div className="space-y-1.5">
          {state.seats.map((p, k) => {
            const role = state.roles[p];
            return (
              <div key={p} className={`flex items-center gap-3 border p-2 ${state.alive[p] ? 'border-indigo-600/40' : 'border-zinc-700 opacity-70'}`}>
                <RoleIcon role={role} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{k + 1}. {state.players[p]}{!state.alive[p] ? ' ☠' : ''}{state.crowned === p ? ' 👑' : ''}</p>
                  <p className="text-xs" style={{ color: TEAM_COLOR[ROLES[role].team] }}>
                    {ROLES[role].name}{state.startRoles[p] !== role ? ` (${ROLES[state.startRoles[p]].name} →)` : ''}{state.infected[p] ? ` · 🧟 ${t.infectedTag}` : ''} · {TEAM_LABEL[ROLES[role].team][lang]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <h3 className="text-indigo-200 text-xs uppercase tracking-wider pt-2">{t.chronicle}</h3>
        <div className="space-y-3">
          {groupChronicle(state.chronicle).map((g, i) => (
            <section key={i} className={`border-l-2 pl-3 ${g.stage === 'night' ? 'border-indigo-500' : g.stage === 'morning' ? 'border-amber-400' : 'border-red-400'}`}>
              <p className="text-xs font-bold text-indigo-300/80 mb-1 flex items-center gap-1.5">{g.stage === 'night' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}{t.stage[g.stage]} {g.round}</p>
              <ul className="space-y-1 text-sm text-indigo-50/90 leading-relaxed">
                {g.items.map((item, j) => <li key={j}>{chronicleLine(item, state.players, state.roundRoles[g.round] ?? state.startRoles, lang)}</li>)}
              </ul>
            </section>
          ))}
        </div>
        <button onClick={() => arrange(state.players)} className={`${primaryBtn} flex items-center justify-center gap-2`} style={PIXEL}><RotateCcw className="w-4 h-4" />{t.playAgain}</button>
        <button onClick={() => { setNames(state.players); dispatch({ type: 'SHOW_SETUP' }); }} className={secondaryBtn} style={PIXEL}>{t.newPlayers}</button>
      </motion.div>
    );
  }

  return shell(null);
}
