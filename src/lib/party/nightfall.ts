/**
 * Nightfall Deception — Standard mode rules engine (pure logic, no React).
 *
 * One phone, players around a round table in a random seating order. The
 * phone always travels to the left. A round is:
 *  1. Night lap   — every player (alive or dead) takes a private turn so nobody
 *                   can tell who has an ability. Players choose their targets.
 *  2. Phone to the centre — the night is resolved in a fixed order:
 *                   poison → protection → kills → delayed deaths → information.
 *  3. Morning     — deaths are announced to everyone.
 *  4. Dawn lap    — every player privately reads their morning report.
 *  5. Day         — free discussion, then nominations and open voting. The most
 *                   voted nominee (needs more than half the living players, no
 *                   tie) is executed when the day ends.
 *
 * Light side wins when the Nightbringer dies; Dark side wins when the living
 * Dark players are at least as many as the living Light players.
 * Randomness comes from a seed stored in the state, so games are replayable.
 */
import { ROLES, rolesOfTeam, isEvilTeam, type RoleId } from '@/data/nightfallRoles';
import { createRng, shuffle } from '@/lib/party/common';

export { shuffleSeats } from '@/lib/party/common';

export const NF_MIN_PLAYERS = 5;
export const NF_MAX_PLAYERS = 10;

/** [Luminaries, Cursed, Shadows, Nightbringer] per player count (Blood on the Clocktower proportions). */
export const SETUP_TABLE: Record<number, [number, number, number, number]> = {
  5: [3, 0, 1, 1],
  6: [3, 1, 1, 1],
  7: [5, 0, 1, 1],
  8: [5, 1, 1, 1],
  9: [5, 2, 1, 1],
  10: [7, 0, 2, 1],
};

/** Synergy lock: at most one role that corrupts information is dealt per game. */
export const MISINFO_ROLES: RoleId[] = ['mirage', 'baiter'];

/** Seconds. Night/dawn turns use the "fast" tempo; day phases are long on purpose. */
export const TIMING = {
  nightTurn: 20,
  nightTurnFirst: 30,
  dawnTurn: 15,
  dawnTurnFirst: 25,
  minTurn: 5,
  phoneToCenter: 10,
  discussion: 300,
  nomination: 300,
};

export type Lang = 'en' | 'id';
export type Phase = 'howto' | 'setup' | 'seating' | 'nightPass' | 'night' | 'nightEnd' | 'morning' | 'dawnPass' | 'dawn' | 'day' | 'final';
export type Side = 'good' | 'evil';

export type ReportItem =
  | { k: 'evilTeam'; nightbringer: number; shadows: number[]; bluffs: RoleId[] | null }
  | { k: 'aura'; a: number; b: number; yes: boolean }
  | { k: 'noChoice' }
  | { k: 'rune'; count: number }
  | { k: 'trace'; target: number | null }
  | { k: 'pair'; source: 'spark' | 'gaze' | 'glyph'; a: number; b: number; role: RoleId }
  | { k: 'pairNone'; source: 'gaze' | 'glyph' }
  | { k: 'snare'; left: number; leftRole: RoleId; right: number; rightRole: RoleId }
  | { k: 'dirge'; player: number; role: RoleId }
  | { k: 'dirgeNone' }
  | { k: 'died' }
  | { k: 'becameBoss'; role: RoleId }
  | { k: 'nothing' };

export interface Report {
  night: number;
  items: ReportItem[];
}

export interface Nomination {
  nominator: number;
  nominee: number;
  voters: number[];
  votes: number;
  /** Last voter in seating order, counting to the left from the nominee. */
  lastVoter: number | null;
  /** More than half of the living players voted. */
  valid: boolean;
}

export type PublicEvent =
  | { k: 'deaths'; night: number; players: number[] }
  | { k: 'executed'; player: number }
  | { k: 'shielded'; player: number }
  | { k: 'noExecution' }
  | { k: 'novaHit'; shooter: number; target: number }
  | { k: 'novaMiss'; shooter: number; target: number };

export interface NfState {
  phase: Phase;
  lang: Lang;
  /** Names in seating order (seat 1 first, then to the left). */
  players: string[];
  roles: RoleId[];
  startRoles: RoleId[];
  alive: boolean[];
  /** Dead players keep one ghost vote for the rest of the game. */
  ghostVote: boolean[];
  bluffs: RoleId[];
  seed: number;
  night: number;
  turn: number;
  /** This night's chosen targets per player (only real abilities are stored). */
  choices: Record<number, number[]>;
  /** Private morning reports per player, kept for the whole game. */
  reports: Record<number, Report[]>;
  /** Poisoned player for the current night and the following day. */
  poisoned: number | null;
  novaUsed: boolean;
  fangShield: boolean;
  /** Player executed in the most recent day (read by Dirge the next night). */
  executedToday: number | null;
  echoDoom: boolean;
  viperVictim: number | null;
  voidDouble: boolean;
  lastNightDeaths: number[];
  dayStage: 'discussion' | 'nomination';
  nominations: Nomination[];
  events: PublicEvent[];
  winner: Side | null;
  winReason: 'nbExecuted' | 'nbShot' | 'nbGone' | 'parity' | null;
}

export const initialState = (lang: Lang = 'id'): NfState => ({
  phase: 'howto',
  lang,
  players: [],
  roles: [],
  startRoles: [],
  alive: [],
  ghostVote: [],
  bluffs: [],
  seed: 1,
  night: 0,
  turn: 0,
  choices: {},
  reports: {},
  poisoned: null,
  novaUsed: false,
  fangShield: true,
  executedToday: null,
  echoDoom: false,
  viperVictim: null,
  voidDouble: false,
  lastNightDeaths: [],
  dayStage: 'discussion',
  nominations: [],
  events: [],
  winner: null,
  winReason: null,
});

export type Action =
  | { type: 'SET_LANG'; lang: Lang }
  | { type: 'SHOW_SETUP' }
  | { type: 'SHOW_HOWTO' }
  | { type: 'ARRANGE'; players: string[] }
  | { type: 'START'; seed: number }
  | { type: 'CONFIRM_PASS' }
  | { type: 'SUBMIT_NIGHT'; targets: number[] }
  | { type: 'SHOW_MORNING' }
  | { type: 'BEGIN_DAWN' }
  | { type: 'DONE_DAWN' }
  | { type: 'START_NOMINATIONS' }
  | { type: 'NOMINATE'; nominator: number; nominee: number; voters: number[] }
  | { type: 'NOVA_SHOT'; shooter: number; target: number }
  | { type: 'END_DAY' }
  | { type: 'RESUME_AT_PASS' }
  | { type: 'RESET' };

// ==================== HELPERS ====================
export function validateNightfallPlayers(names: string[]): 'tooFew' | 'tooMany' | 'empty' | 'duplicate' | null {
  const trimmed = names.map((n) => n.trim());
  if (trimmed.some((n) => n === '')) return 'empty';
  if (trimmed.length < NF_MIN_PLAYERS) return 'tooFew';
  if (trimmed.length > NF_MAX_PLAYERS) return 'tooMany';
  if (new Set(trimmed.map((n) => n.toLowerCase())).size !== trimmed.length) return 'duplicate';
  return null;
}

export function sideOf(role: RoleId): Side {
  return isEvilTeam(ROLES[role].team) ? 'evil' : 'good';
}

export function isNightbringer(role: RoleId): boolean {
  return ROLES[role].team === 'nightbringer';
}

/** How information abilities see a player (Baiter reads Dark, Snare reads Light). */
export function registersEvil(role: RoleId): boolean {
  if (role === 'baiter') return true;
  if (role === 'snare') return false;
  return sideOf(role) === 'evil';
}

export function aliveCount(state: NfState): number {
  return state.alive.filter(Boolean).length;
}

/** More than half of the living players must vote for an execution. */
export function voteThreshold(state: NfState): number {
  return Math.floor(aliveCount(state) / 2) + 1;
}

/** First seat of each lap; it moves one seat to the left every night. */
export function lapStart(state: NfState): number {
  return Math.max(0, state.night - 1) % state.players.length;
}

export function pendingPlayer(state: NfState): number | null {
  const n = state.players.length;
  if (state.turn >= n) return null;
  return (lapStart(state) + state.turn) % n;
}

/** Nearest living neighbour on each side (skipping the dead). */
export function livingNeighbours(state: NfState, p: number): [number | null, number | null] {
  const n = state.players.length;
  const find = (dir: 1 | -1) => {
    for (let step = 1; step < n; step++) {
      const q = (p + dir * step + n) % n;
      if (q === p) return null;
      if (state.alive[q]) return q;
    }
    return null;
  };
  const left = find(1);
  const right = find(-1);
  return [left, right === left ? null : right];
}

export type NightActionKind = 'aura' | 'protect' | 'poison' | 'kill' | 'dummy';

export interface NightSpec {
  kind: NightActionKind;
  count: number;
  allowSelf: boolean;
}

/** What a player does on their private night turn. Everyone gets a turn. */
export function nightSpec(state: NfState, p: number): NightSpec {
  const role = state.roles[p];
  const dummy: NightSpec = { kind: 'dummy', count: 1, allowSelf: false };
  if (!state.alive[p]) return dummy;
  if (role === 'aura') return { kind: 'aura', count: 2, allowSelf: true };
  if (role === 'mirage') return { kind: 'poison', count: 1, allowSelf: false };
  if (state.night >= 2) {
    if (role === 'aegis') return { kind: 'protect', count: 1, allowSelf: false };
    if (role === 'abyss' || role === 'fang') {
      const count = state.voidDouble ? 2 : 1;
      return { kind: 'kill', count, allowSelf: role === 'abyss' && count === 1 };
    }
  }
  return dummy;
}

export function validTargets(state: NfState, p: number, targets: number[]): boolean {
  const spec = nightSpec(state, p);
  if (targets.length !== spec.count || new Set(targets).size !== targets.length) return false;
  return targets.every((t) => Number.isInteger(t) && t >= 0 && t < state.players.length && state.alive[t] && (spec.allowSelf || t !== p));
}

/** Deal roles for n players following SETUP_TABLE and the synergy lock. */
export function dealRoles(n: number, random: () => number): { roles: RoleId[]; bluffs: RoleId[] } {
  const [lum, cursed, shadow, boss] = SETUP_TABLE[n];
  const nightbringers = shuffle(rolesOfTeam('nightbringer'), random).slice(0, boss);
  const shadows = shuffle(rolesOfTeam('shadow'), random).slice(0, shadow);
  const lockUsed = () => [...nightbringers, ...shadows].some((r) => MISINFO_ROLES.includes(r));
  const cursedPool = rolesOfTeam('cursed').filter((r) => !(lockUsed() && MISINFO_ROLES.includes(r)));
  const cursedRoles = shuffle(cursedPool, random).slice(0, cursed);
  const luminaries = shuffle(rolesOfTeam('luminary'), random).slice(0, lum);
  const inPlay = [...luminaries, ...cursedRoles, ...shadows, ...nightbringers];
  const notInPlay = [...rolesOfTeam('luminary'), ...rolesOfTeam('cursed')].filter((r) => !inPlay.includes(r));
  return { roles: shuffle(inPlay, random), bluffs: shuffle(notInPlay, random).slice(0, 3) };
}

function checkWinner(state: NfState): Pick<NfState, 'winner' | 'winReason'> | null {
  const aliveRoles = state.roles.filter((_, i) => state.alive[i]);
  if (!aliveRoles.some(isNightbringer)) return { winner: 'good', winReason: 'nbGone' };
  const evil = aliveRoles.filter((r) => sideOf(r) === 'evil').length;
  const good = aliveRoles.length - evil;
  if (evil >= good) return { winner: 'evil', winReason: 'parity' };
  return null;
}

function addReport(reports: NfState['reports'], p: number, night: number, item: ReportItem): NfState['reports'] {
  const mine = reports[p] ?? [];
  const last = mine[mine.length - 1];
  const updated = last && last.night === night ? [...mine.slice(0, -1), { night, items: [...last.items, item] }] : [...mine, { night, items: [item] }];
  return { ...reports, [p]: updated };
}

// ==================== NIGHT RESOLUTION ====================
export function resolveNight(state: NfState): NfState {
  const rng = createRng(state.seed + state.night * 7919);
  const n = state.players.length;
  const everyone = Array.from({ length: n }, (_, i) => i);
  const alive = [...state.alive];
  const roles = [...state.roles];
  let reports = state.reports;
  const deaths: number[] = [];
  const visited = new Set<number>();
  const pick = <T,>(xs: T[]): T => xs[Math.floor(rng() * xs.length)];
  const holder = (role: RoleId) => everyone.find((p) => alive[p] && roles[p] === role);

  // 1. Poison
  const mirage = holder('mirage');
  const poisonTarget = mirage !== undefined ? state.choices[mirage]?.[0] : undefined;
  const poisoned = poisonTarget !== undefined ? poisonTarget : null;
  if (poisoned !== null) visited.add(poisoned);
  const misinformed = (p: number) => poisoned === p;

  // 2. Protection
  const aegis = holder('aegis');
  const protectedPlayer = aegis !== undefined && !misinformed(aegis) ? state.choices[aegis]?.[0] ?? null : null;

  // 3. Nightbringer attack
  const boss = everyone.find((p) => alive[p] && isNightbringer(roles[p]));
  if (boss !== undefined && state.night >= 2 && !misinformed(boss)) {
    const targets = state.choices[boss] ?? [];
    for (const t of targets) {
      visited.add(t);
      if (t === boss && roles[boss] === 'abyss') {
        // Pass the title: Abyss dies, a living Shadow becomes the new Abyss
        alive[boss] = false;
        deaths.push(boss);
        const shadows = everyone.filter((p) => alive[p] && ROLES[roles[p]].team === 'shadow');
        if (shadows.length) {
          const heir = pick(shadows);
          roles[heir] = 'abyss';
          reports = addReport(reports, heir, state.night, { k: 'becameBoss', role: 'abyss' });
        }
      } else if (t !== protectedPlayer && alive[t]) {
        alive[t] = false;
        deaths.push(t);
      }
    }
  }

  // 4. Delayed deaths from the previous day
  if (state.echoDoom) {
    const echo = everyone.find((p) => alive[p] && roles[p] === 'echo');
    if (echo !== undefined) {
      alive[echo] = false;
      deaths.push(echo);
    }
  }
  if (state.viperVictim !== null && alive[state.viperVictim]) {
    alive[state.viperVictim] = false;
    deaths.push(state.viperVictim);
  }

  // 5. Information for the living
  const after: NfState = { ...state, alive, roles };
  const others = (p: number) => everyone.filter((q) => q !== p);
  const falsePair = (p: number, source: 'spark' | 'gaze' | 'glyph', team: 'luminary' | 'cursed' | 'shadow'): ReportItem => {
    const role = pick(rolesOfTeam(team));
    const candidates = others(p).filter((q) => roles[q] !== role);
    const [a, b] = shuffle(candidates, rng).slice(0, 2);
    return { k: 'pair', source, a, b, role };
  };
  const truePair = (p: number, source: 'spark' | 'gaze' | 'glyph', holders: number[], roleOf: (q: number) => RoleId): ReportItem => {
    const who = pick(holders);
    const decoy = pick(others(p).filter((q) => q !== who));
    const [a, b] = shuffle([who, decoy], rng);
    return { k: 'pair', source, a, b, role: roleOf(who) };
  };

  for (const p of everyone) {
    if (!alive[p]) continue;
    const role = roles[p];
    const lie = misinformed(p);
    let item: ReportItem | null = null;

    if (role === 'aura') {
      const pair = state.choices[p];
      if (!pair) item = { k: 'noChoice' };
      else {
        const truth = registersEvil(roles[pair[0]]) || registersEvil(roles[pair[1]]);
        item = { k: 'aura', a: pair[0], b: pair[1], yes: lie ? !truth : truth };
      }
    } else if (role === 'rune') {
      const truth = livingNeighbours(after, p).filter((q): q is number => q !== null && registersEvil(roles[q])).length;
      item = { k: 'rune', count: lie ? pick([0, 1, 2].filter((c) => c !== truth)) : truth };
    } else if (role === 'trace') {
      const seen = [...visited];
      const truth = seen.length ? pick(seen) : null;
      const fakes = everyone.filter((q) => alive[q] && !visited.has(q) && q !== p);
      item = { k: 'trace', target: lie ? (fakes.length ? pick(fakes) : null) : truth };
    } else if (role === 'dirge' && state.night >= 2) {
      const ex = state.executedToday;
      if (ex === null) item = { k: 'dirgeNone' };
      else item = { k: 'dirge', player: ex, role: lie ? pick([...rolesOfTeam('luminary'), ...rolesOfTeam('shadow')].filter((r) => r !== roles[ex])) : roles[ex] };
    } else if (state.night === 1) {
      if (role === 'spark') {
        const holders = others(p).filter((q) => ROLES[roles[q]].team === 'luminary');
        item = lie || !holders.length ? falsePair(p, 'spark', 'luminary') : truePair(p, 'spark', holders, (q) => roles[q]);
      } else if (role === 'gaze') {
        const holders = others(p).filter((q) => ROLES[roles[q]].team === 'cursed');
        if (lie) item = falsePair(p, 'gaze', 'cursed');
        else item = holders.length ? truePair(p, 'gaze', holders, (q) => roles[q]) : { k: 'pairNone', source: 'gaze' };
      } else if (role === 'glyph') {
        // Snare hides from Glyph; a Baiter may be shown as a Shadow
        const shadows = others(p).filter((q) => ROLES[roles[q]].team === 'shadow' && roles[q] !== 'snare');
        const baiters = others(p).filter((q) => roles[q] === 'baiter' && rng() < 0.5);
        const holders = [...shadows, ...baiters];
        const roleOf = (q: number) => (roles[q] === 'baiter' ? pick(rolesOfTeam('shadow').filter((r) => r !== 'snare')) : roles[q]);
        if (lie) item = falsePair(p, 'glyph', 'shadow');
        else item = holders.length ? truePair(p, 'glyph', holders, roleOf) : { k: 'pairNone', source: 'glyph' };
      } else if (role === 'snare') {
        const left = (p + 1) % n;
        const right = (p - 1 + n) % n;
        const fake = () => pick([...rolesOfTeam('luminary'), ...rolesOfTeam('cursed')]);
        item = { k: 'snare', left, leftRole: lie ? fake() : roles[left], right, rightRole: lie ? fake() : roles[right] };
      }
    }
    if (item) reports = addReport(reports, p, state.night, item);
  }

  // Dark side learns its team on the first night (never affected by poison)
  if (state.night === 1) {
    const nb = everyone.find((p) => isNightbringer(roles[p]))!;
    const shadows = everyone.filter((p) => ROLES[roles[p]].team === 'shadow');
    for (const p of [nb, ...shadows]) {
      reports = addReport(reports, p, 1, { k: 'evilTeam', nightbringer: nb, shadows, bluffs: p === nb ? state.bluffs : null });
    }
  }

  for (const d of deaths) reports = addReport(reports, d, state.night, { k: 'died' });
  for (const p of everyone) if (!(reports[p] ?? []).some((r) => r.night === state.night)) reports = addReport(reports, p, state.night, { k: 'nothing' });

  const ghostVote = state.ghostVote.map((g, i) => (deaths.includes(i) ? true : g));
  const resolved: NfState = {
    ...state,
    alive,
    roles,
    ghostVote,
    reports,
    poisoned,
    lastNightDeaths: [...new Set(deaths)],
    echoDoom: false,
    viperVictim: null,
    voidDouble: false,
    executedToday: null,
    phase: 'nightEnd',
  };
  const win = checkWinner(resolved);
  return win ? { ...resolved, ...win } : resolved;
}

// ==================== DAY ====================
function execute(state: NfState, player: number, nomination: Nomination): NfState {
  const role = state.roles[player];
  if (role === 'fang' && state.fangShield) {
    return { ...state, fangShield: false, events: [...state.events, { k: 'shielded', player }] };
  }
  const alive = state.alive.map((a, i) => (i === player ? false : a));
  const ghostVote = state.ghostVote.map((g, i) => (i === player ? true : g));
  const working = state.poisoned !== player;
  let next: NfState = {
    ...state,
    alive,
    ghostVote,
    executedToday: player,
    events: [...state.events, { k: 'executed', player }],
    viperVictim: role === 'viper' && working ? nomination.lastVoter : state.viperVictim,
    voidDouble: role === 'void' && working ? true : state.voidDouble,
    echoDoom: sideOf(role) === 'good' ? true : state.echoDoom,
  };
  if (isNightbringer(role)) next = { ...next, winner: 'good', winReason: 'nbExecuted' };
  else {
    const win = checkWinner(next);
    if (win) next = { ...next, ...win };
  }
  return next;
}

// ==================== REDUCER ====================
export function reducer(state: NfState, action: Action): NfState {
  const n = state.players.length;
  switch (action.type) {
    case 'SET_LANG':
      return { ...state, lang: action.lang };
    case 'SHOW_SETUP':
      return { ...state, phase: 'setup' };
    case 'SHOW_HOWTO':
      return { ...state, phase: 'howto' };
    case 'ARRANGE':
      if (validateNightfallPlayers(action.players) !== null) return state;
      return { ...initialState(state.lang), phase: 'seating', players: action.players.map((p) => p.trim()) };
    case 'START': {
      if (state.phase !== 'seating') return state;
      const { roles, bluffs } = dealRoles(n, createRng(action.seed));
      return {
        ...initialState(state.lang),
        players: state.players,
        phase: 'nightPass',
        roles,
        startRoles: roles,
        bluffs,
        seed: action.seed,
        alive: Array(n).fill(true),
        ghostVote: Array(n).fill(false),
        night: 1,
      };
    }
    case 'CONFIRM_PASS':
      if (state.phase === 'nightPass') return { ...state, phase: 'night' };
      if (state.phase === 'dawnPass') return { ...state, phase: 'dawn' };
      return state;
    case 'SUBMIT_NIGHT': {
      const p = pendingPlayer(state);
      if (state.phase !== 'night' || p === null) return state;
      const spec = nightSpec(state, p);
      const choices = spec.kind !== 'dummy' && validTargets(state, p, action.targets) ? { ...state.choices, [p]: action.targets } : state.choices;
      const turn = state.turn + 1;
      const next = { ...state, choices, turn };
      return turn >= n ? resolveNight(next) : { ...next, phase: 'nightPass' };
    }
    case 'SHOW_MORNING':
      if (state.phase !== 'nightEnd') return state;
      return { ...state, phase: 'morning', events: [{ k: 'deaths', night: state.night, players: state.lastNightDeaths }] };
    case 'BEGIN_DAWN':
      if (state.phase !== 'morning') return state;
      return state.winner ? { ...state, phase: 'final' } : { ...state, phase: 'dawnPass', turn: 0 };
    case 'DONE_DAWN': {
      if (state.phase !== 'dawn') return state;
      const turn = state.turn + 1;
      if (turn < n) return { ...state, turn, phase: 'dawnPass' };
      return { ...state, turn, phase: 'day', dayStage: 'discussion', nominations: [] };
    }
    case 'START_NOMINATIONS':
      if (state.phase !== 'day') return state;
      return { ...state, dayStage: 'nomination' };
    case 'NOMINATE': {
      if (state.phase !== 'day' || state.dayStage !== 'nomination') return state;
      const { nominator, nominee } = action;
      const voters = [...new Set(action.voters)];
      if (!state.alive[nominator] || !state.alive[nominee]) return state;
      if (state.nominations.some((x) => x.nominator === nominator || x.nominee === nominee)) return state;
      if (!voters.every((v) => v >= 0 && v < n && (state.alive[v] || state.ghostVote[v]))) return state;
      const weight = (v: number) => (state.roles[v] === 'echo' && state.alive[v] && state.poisoned !== v ? 2 : 1);
      const votes = voters.reduce((acc, v) => acc + weight(v), 0);
      const order = Array.from({ length: n }, (_, i) => (nominee + 1 + i) % n);
      const lastVoter = voters.length ? voters.reduce((a, b) => (order.indexOf(b) > order.indexOf(a) ? b : a)) : null;
      const ghostVote = state.ghostVote.map((g, i) => (voters.includes(i) && !state.alive[i] ? false : g));
      const nomination: Nomination = { nominator, nominee, voters, votes, lastVoter, valid: votes >= voteThreshold(state) };
      return { ...state, ghostVote, nominations: [...state.nominations, nomination] };
    }
    case 'NOVA_SHOT': {
      const { shooter, target } = action;
      if (state.phase !== 'day' || !state.alive[shooter] || !state.alive[target] || shooter === target) return state;
      const realNova = state.roles[shooter] === 'nova' && !state.novaUsed;
      const hit = realNova && state.poisoned !== shooter && isNightbringer(state.roles[target]);
      if (!hit) {
        return { ...state, novaUsed: state.novaUsed || realNova, events: [...state.events, { k: 'novaMiss', shooter, target }] };
      }
      const alive = state.alive.map((a, i) => (i === target ? false : a));
      return {
        ...state,
        alive,
        novaUsed: true,
        events: [...state.events, { k: 'novaHit', shooter, target }],
        winner: 'good',
        winReason: 'nbShot',
        phase: 'final',
      };
    }
    case 'END_DAY': {
      if (state.phase !== 'day') return state;
      const valid = state.nominations.filter((x) => x.valid);
      const top = Math.max(0, ...valid.map((x) => x.votes));
      const leaders = valid.filter((x) => x.votes === top);
      let next: NfState = leaders.length === 1 ? execute(state, leaders[0].nominee, leaders[0]) : { ...state, events: [...state.events, { k: 'noExecution' }] };
      if (leaders.length !== 1) next = { ...next, executedToday: null };
      if (next.winner) return { ...next, phase: 'final' };
      return { ...next, phase: 'nightPass', night: state.night + 1, turn: 0, choices: {}, poisoned: null, nominations: [], dayStage: 'discussion' };
    }
    case 'RESUME_AT_PASS':
      // After a reload, never reopen a secret screen directly
      if (state.phase === 'night') return { ...state, phase: 'nightPass' };
      if (state.phase === 'dawn') return { ...state, phase: 'dawnPass' };
      return state;
    case 'RESET':
      return initialState(state.lang);
  }
}
