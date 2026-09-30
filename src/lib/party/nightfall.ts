/**
 * Nightfall Deception — rules engine (pure logic, no React).
 *
 * One phone, players around a round table in a random seating order. The
 * phone always travels to the left. A round is:
 *  1. Night lap   — every player (alive or dead) takes a private turn so nobody
 *                   can tell who has an ability. Players choose their targets.
 *  2. Phone to the centre — the night is resolved in a fixed order:
 *                   poison → seat swaps/protection → Dark actions → delayed
 *                   deaths → revenge/bonds → revival → information.
 *  3. Morning     — deaths and highlights (saves, revivals, seat swaps) are
 *                   announced to everyone.
 *  4. Dawn lap    — every player privately reads their report and chooses to
 *                   read their information aloud or keep it to themselves.
 *  5. Day         — free discussion, then nominations and open voting. The most
 *                   voted nominee (needs more than half the living players, no
 *                   tie) is executed when the day ends.
 *
 * Three modes: Standard (Nightbringer + Shadows), Joker and Zombie (solo
 * bosses, no Shadows). The Joker never kills: it hands a crown to a player
 * who must attack a seat number every night, and it swaps seats so those
 * attacks land on someone else. Players are identified by their index in `players`;
 * `seats` maps seat positions (to the left) to player indices, because the
 * Joker and the Tide can make players swap seats.
 * Randomness comes from a seed stored in the state, so games are replayable.
 */
import { ROLES, rolesOfTeam, isEvilTeam, STANDARD_BOSSES, type RoleId } from '@/data/nightfallRoles';
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

export type Mode = 'standard' | 'joker' | 'zombie';
export const MODES: Mode[] = ['standard', 'joker', 'zombie'];

/** Role mix for a mode: solo bosses have no Shadows, their seats go to Luminaries. */
export function setupFor(n: number, mode: Mode): [number, number, number, number] {
  const [l, c, s, b] = SETUP_TABLE[n] ?? [0, 0, 0, 0];
  return mode === 'standard' ? [l, c, s, b] : [l + s, c, 0, b];
}

/** Synergy lock: at most one role that corrupts information is dealt per game. */
export const MISINFO_ROLES: RoleId[] = ['mirage', 'baiter', 'gouge'];
/** First-night information roles: useless under the solo-boss blackout, so left out of those modes. */
export const NIGHT_ONE_ROLES: RoleId[] = ['spark', 'gaze', 'glyph'];
export const TIDE_USES = 2;
/**
 * Zombie rules, tuned by simulation so it wins about as often as Standard:
 * the horde acts on odd nights (1, 3, 5…) and must outnumber the healthy
 * players. The Joker is deliberately left very hard — a mode for true
 * manipulators.
 */
export const ZOMBIE_RULES = { infectEvery: 2, strictParity: true, frenzyKills: true };
export const BLIGHT_EXTRA_CURSED = 2;

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
/** Why a piece of information may be wrong: poisoned, dying from a Gouge, or the solo-boss first-night blackout. */
export type Quality = 'true' | 'poison' | 'gouge' | 'blind';
export type Guard = 'aegis' | 'tide';
export type AttackResult = 'killed' | Guard | 'dead';

export type ReportItem =
  | { k: 'evilTeam'; nightbringer: number; shadows: number[]; bluffs: RoleId[] | null }
  | { k: 'bossBluffs'; bluffs: RoleId[] }
  | { k: 'nightBlind' }
  | { k: 'aura'; a: number; b: number; yes: boolean }
  | { k: 'noChoice' }
  | { k: 'rune'; count: number }
  | { k: 'trace'; target: number | null }
  | { k: 'pair'; source: 'spark' | 'gaze' | 'glyph'; a: number; b: number; role: RoleId }
  | { k: 'pairNone'; source: 'gaze' | 'glyph' }
  | { k: 'snare'; left: number; leftRole: RoleId; right: number; rightRole: RoleId }
  | { k: 'dirge'; player: number; role: RoleId; infected: boolean }
  | { k: 'dirgeNone' }
  | { k: 'pact'; partner: number }
  | { k: 'protectSaved'; target: number }
  | { k: 'tideDone'; a: number; b: number; ok: boolean }
  | { k: 'tideSaved'; target: number }
  | { k: 'revived'; target: number; ok: boolean }
  | { k: 'wasRevived' }
  | { k: 'pyreFired'; target: number }
  | { k: 'baneReset'; target: number }
  | { k: 'crowned' }
  | { k: 'crownTaken' }
  | { k: 'crownGiven'; target: number }
  | { k: 'crownReturned'; target: number }
  | { k: 'infected'; zombie: number; hive: number[] }
  | { k: 'infectResult'; target: number; ok: boolean }
  | { k: 'hiveGrew'; target: number }
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
  | { k: 'saved'; target: number; by: Guard; what: 'attack' | 'infect' }
  | { k: 'pyre'; by: number; target: number }
  | { k: 'pactDeath'; target: number; partner: number }
  | { k: 'crownBurden'; target: number }
  | { k: 'revived'; target: number }
  | { k: 'seats'; pairs: [number, number][] }
  | { k: 'executed'; player: number }
  | { k: 'shielded'; player: number }
  | { k: 'noExecution' }
  | { k: 'novaHit'; shooter: number; target: number }
  | { k: 'novaMiss'; shooter: number; target: number }
  | { k: 'apex' };

/** Everything that happened, in plain order, for the end-of-game chronicle. */
export type ChronItem =
  | { k: 'darkMeet'; boss: number; shadows: number[] }
  | { k: 'poison'; by: number; target: number }
  | { k: 'protect'; by: number; target: number; ok: boolean }
  | { k: 'attack'; by: number; target: number; result: AttackResult }
  | { k: 'bossPoisoned'; by: number }
  | { k: 'titlePassed'; from: number; to: number | null }
  | { k: 'gouge'; by: number; target: number; result: 'marked' | Guard }
  | { k: 'gougeDeath'; target: number }
  | { k: 'baneReset'; by: number; first: number }
  | { k: 'tide'; by: number; a: number; b: number; ok: boolean }
  | { k: 'glitch'; by: number; a: number; b: number }
  | { k: 'crown'; by: number; target: number }
  | { k: 'recall'; by: number; target: number }
  | { k: 'crownBurden'; target: number }
  | { k: 'seatAttack'; by: number; seat: number; target: number; result: AttackResult }
  | { k: 'infect'; by: number; target: number; result: 'ok' | Guard | 'already' }
  | { k: 'frenzy'; target: number; result: AttackResult }
  | { k: 'revive'; by: number; target: number; ok: boolean }
  | { k: 'pyre'; by: number; target: number }
  | { k: 'pactDeath'; target: number; partner: number }
  | { k: 'echoDoom'; target: number }
  | { k: 'viperDeath'; target: number }
  | { k: 'info'; p: number; item: ReportItem; quality: Quality }
  | { k: 'testimony'; shared: number[]; kept: number[] }
  | { k: 'nomination'; nominator: number; nominee: number; votes: number; voters: number[]; valid: boolean }
  | { k: 'executed'; target: number }
  | { k: 'shielded'; target: number }
  | { k: 'noExecution' }
  | { k: 'nova'; shooter: number; target: number; hit: boolean; real: boolean }
  | { k: 'apex'; by: number };

export interface ChronEntry {
  round: number;
  stage: 'night' | 'morning' | 'day';
  item: ChronItem;
}

/** give: hand the crown to a new holder · recall: take it back · keep: leave it where it is. */
export type JokerMove = 'give' | 'recall' | 'keep';
export interface JokerPlan {
  mode: JokerMove;
  targets: number[];
  /** Glitch: two players who swap seats at dawn (or empty). */
  swap: number[];
}

export type WinReason = 'nbExecuted' | 'nbShot' | 'nbGone' | 'jokerGone' | 'hiveGone' | 'parity' | 'apex';

export interface NfState {
  phase: Phase;
  lang: Lang;
  mode: Mode;
  /** Names by player index. Seat order lives in `seats`. */
  players: string[];
  /** seats[k] = player sitting at seat k (seat 1 first, then to the left). */
  seats: number[];
  /** Seating before last night's swaps (only when seats changed). */
  seatsBefore: number[] | null;
  roles: RoleId[];
  startRoles: RoleId[];
  /** Roles at the start of each night, to label the chronicle. */
  roundRoles: Record<number, RoleId[]>;
  alive: boolean[];
  /** Dead players keep one ghost vote for the rest of the game. */
  ghostVote: boolean[];
  bluffs: RoleId[];
  seed: number;
  night: number;
  turn: number;
  /** This night's chosen targets per player (only real abilities are stored). */
  choices: Record<number, number[]>;
  jokerPlan: JokerPlan | null;
  /** Private morning reports per player, kept for the whole game. */
  reports: Record<number, Report[]>;
  /** Poisoned player for the current night and the following day. */
  poisoned: number | null;
  /** Gouge victims and the night they die. */
  gouged: { target: number; due: number }[];
  novaUsed: boolean;
  fangShield: boolean;
  loomUsed: boolean;
  tideLeft: number;
  pact: [number, number] | null;
  infected: boolean[];
  /** Player holding the Joker's crown (must attack a seat every night). */
  crowned: number | null;
  /** Player executed in the most recent day (read by Dirge the next night). */
  executedToday: number | null;
  echoDoom: boolean;
  viperVictim: number | null;
  voidDouble: boolean;
  lastNightDeaths: number[];
  /** Public announcements of the latest morning. */
  morningEvents: PublicEvent[];
  /** Dawn choice per player: read the information aloud (true) or keep it (false). */
  testimony: Record<number, boolean>;
  dayStage: 'discussion' | 'nomination';
  nominations: Nomination[];
  /** Public events of the current day. */
  events: PublicEvent[];
  chronicle: ChronEntry[];
  winner: Side | null;
  winReason: WinReason | null;
}

export const initialState = (lang: Lang = 'id', mode: Mode = 'standard'): NfState => ({
  phase: 'howto',
  lang,
  mode,
  players: [],
  seats: [],
  seatsBefore: null,
  roles: [],
  startRoles: [],
  roundRoles: {},
  alive: [],
  ghostVote: [],
  bluffs: [],
  seed: 1,
  night: 0,
  turn: 0,
  choices: {},
  jokerPlan: null,
  reports: {},
  poisoned: null,
  gouged: [],
  novaUsed: false,
  fangShield: true,
  loomUsed: false,
  tideLeft: TIDE_USES,
  pact: null,
  infected: [],
  crowned: null,
  executedToday: null,
  echoDoom: false,
  viperVictim: null,
  voidDouble: false,
  lastNightDeaths: [],
  morningEvents: [],
  testimony: {},
  dayStage: 'discussion',
  nominations: [],
  events: [],
  chronicle: [],
  winner: null,
  winReason: null,
});

export type Action =
  | { type: 'SET_LANG'; lang: Lang }
  | { type: 'SET_MODE'; mode: Mode }
  | { type: 'SHOW_SETUP' }
  | { type: 'SHOW_HOWTO' }
  | { type: 'ARRANGE'; players: string[] }
  | { type: 'START'; seed: number }
  | { type: 'CONFIRM_PASS' }
  | { type: 'SUBMIT_NIGHT'; targets: number[]; joker?: { mode: JokerMove; swap: number[] } }
  | { type: 'SHOW_MORNING' }
  | { type: 'BEGIN_DAWN' }
  | { type: 'DONE_DAWN'; shared?: boolean }
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

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export function sideOf(role: RoleId): Side {
  return isEvilTeam(ROLES[role].team) ? 'evil' : 'good';
}

export function isNightbringer(role: RoleId): boolean {
  return ROLES[role].team === 'nightbringer';
}

/** Current side of a player: infected players belong to the Dark side (a crown holder keeps their side). */
export function sideOfPlayer(state: NfState, p: number): Side {
  if (state.infected[p]) return 'evil';
  return sideOf(state.roles[p]);
}

/** How information abilities see a player (Baiter reads Dark, Snare reads Light). */
export function registersEvil(state: NfState, p: number): boolean {
  if (state.roles[p] === 'baiter') return true;
  if (state.roles[p] === 'snare') return false;
  return sideOfPlayer(state, p) === 'evil';
}

/** A boss Nova can shoot. */
export function isBossNow(state: NfState, p: number): boolean {
  return isNightbringer(state.roles[p]);
}

export function zombieAlive(state: NfState): boolean {
  return state.players.some((_, p) => state.alive[p] && state.roles[p] === 'zombie');
}

export function aliveCount(state: NfState): number {
  return state.alive.filter(Boolean).length;
}

/** More than half of the living players must vote for an execution. */
export function voteThreshold(state: NfState): number {
  return Math.floor(aliveCount(state) / 2) + 1;
}

export function seatOf(state: NfState, p: number): number {
  return state.seats.indexOf(p);
}

/** First seat of each lap; it moves one seat to the left every night. */
export function lapStart(state: NfState): number {
  return Math.max(0, state.night - 1) % state.players.length;
}

export function pendingPlayer(state: NfState): number | null {
  const n = state.players.length;
  if (state.turn >= n) return null;
  return state.seats[(lapStart(state) + state.turn) % n];
}

/** Nearest living neighbour on each side (skipping the dead), following the current seats. */
export function livingNeighbours(state: NfState, p: number): [number | null, number | null] {
  const n = state.players.length;
  const s = seatOf(state, p);
  const find = (dir: 1 | -1) => {
    for (let step = 1; step < n; step++) {
      const q = state.seats[(s + dir * step + n * step) % n];
      if (q === p) return null;
      if (state.alive[q]) return q;
    }
    return null;
  };
  const left = find(1);
  const right = find(-1);
  return [left, right === left ? null : right];
}

export type NightActionKind =
  | 'aura' | 'protect' | 'poison' | 'kill' | 'gouge' | 'bane' | 'revive' | 'revenge' | 'tide'
  | 'infect' | 'frenzy' | 'crownKill' | 'joker' | 'dummy';

export interface NightSpec {
  kind: NightActionKind;
  /** Maximum number of targets. */
  count: number;
  /** Accepted numbers of targets (0 means the ability may be skipped). */
  accept: number[];
  allowSelf: boolean;
  /** Choose among the living (default), the dead (Loom) or seat numbers (crown holder). */
  pool: 'alive' | 'dead' | 'seat';
  excludeInfected?: boolean;
}

/** The Zombie horde acts on nights 1, 1 + infectEvery, … (infecting, or killing in a Frenzy). */
export function hordeNight(state: NfState): boolean {
  return (state.night - 1) % ZOMBIE_RULES.infectEvery === 0;
}

/** What the Joker may do tonight (it never kills). */
export function jokerOptions(state: NfState) {
  return { canRecall: state.crowned !== null };
}

/** What a player does on their private night turn. Everyone gets a turn. */
export function nightSpec(state: NfState, p: number): NightSpec {
  const spec = (kind: NightActionKind, count: number, accept: number[], allowSelf = false, pool: NightSpec['pool'] = 'alive'): NightSpec => ({ kind, count, accept, allowSelf, pool });
  const dummy = spec('dummy', 1, [1], false);
  if (!state.alive[p]) return dummy;
  const role = state.roles[p];
  const double = state.voidDouble ? 2 : 1;
  if (state.crowned === p) return spec('crownKill', 1, [1], false, 'seat');
  if (state.mode === 'zombie' && state.infected[p] && !zombieAlive(state) && ZOMBIE_RULES.frenzyKills) return hordeNight(state) ? spec('frenzy', 1, [1]) : dummy;
  if (role === 'zombie') {
    if (!hordeNight(state)) return dummy;
    return { ...spec('infect', double, double === 2 ? [1, 2] : [1]), excludeInfected: true };
  }
  if (role === 'joker') return spec('joker', 1, []);
  if (role === 'aura') return spec('aura', 2, [2], true);
  if (role === 'mirage') return spec('poison', 1, [1]);
  if (state.night >= 2) {
    if (role === 'aegis') return spec('protect', 1, [1]);
    if (role === 'loom' && !state.loomUsed && state.alive.some((a) => !a)) return spec('revive', 1, [0, 1], false, 'dead');
    if (role === 'pyre') return spec('revenge', 1, [0, 1]);
    if (role === 'tide' && state.tideLeft > 0) return spec('tide', 2, [0, 2], true);
    if (role === 'abyss' || role === 'fang') return spec('kill', double, [double], role === 'abyss' && double === 1);
    if (role === 'gouge') return spec('gouge', double, [double]);
    if (role === 'bane') return spec('bane', 2, state.voidDouble ? [2] : [1, 2]);
  }
  return dummy;
}

export function validTargets(state: NfState, p: number, targets: number[]): boolean {
  const spec = nightSpec(state, p);
  if (!spec.accept.includes(targets.length) || new Set(targets).size !== targets.length) return false;
  // Seat targets: any seat except the one the holder sits in now
  if (spec.pool === 'seat') return targets.every((t) => Number.isInteger(t) && t >= 0 && t < state.players.length && state.seats[t] !== p);
  return targets.every(
    (t) =>
      Number.isInteger(t) && t >= 0 && t < state.players.length &&
      (spec.pool === 'dead' ? !state.alive[t] : state.alive[t]) &&
      (spec.allowSelf || t !== p) &&
      !(spec.excludeInfected && state.infected[t]),
  );
}

export function validJokerPlan(state: NfState, p: number, plan: JokerPlan): boolean {
  const ok = (t: number) => Number.isInteger(t) && t >= 0 && t < state.players.length && state.alive[t];
  if (plan.swap.length && (plan.swap.length !== 2 || plan.swap[0] === plan.swap[1] || !plan.swap.every(ok))) return false;
  const { targets } = plan;
  switch (plan.mode) {
    case 'keep':
      return targets.length === 0;
    case 'recall':
      return jokerOptions(state).canRecall && targets.length === 0;
    case 'give':
      return targets.length === 1 && ok(targets[0]) && targets[0] !== p && targets[0] !== state.crowned;
  }
}

/** Deal roles for n players following the setup table, the mode and the synergy lock. */
export function dealRoles(n: number, random: () => number, mode: Mode = 'standard'): { roles: RoleId[]; bluffs: RoleId[]; pact: [number, number] | null } {
  const [lum0, cur0, sha, boss] = setupFor(n, mode);
  const inPlay: RoleId[] = [];
  const draw = (pool: RoleId[], k: number) => {
    const out: RoleId[] = [];
    for (const r of shuffle(pool, random)) {
      if (out.length >= k) break;
      if (MISINFO_ROLES.includes(r) && inPlay.some((x) => MISINFO_ROLES.includes(x))) continue;
      out.push(r);
      inPlay.push(r);
    }
    return out;
  };
  draw(mode === 'standard' ? STANDARD_BOSSES : [mode as RoleId], boss);
  const shadows = draw(rolesOfTeam('shadow'), sha);
  let lum = lum0;
  let cur = cur0;
  if (shadows.includes('blight')) {
    lum -= BLIGHT_EXTRA_CURSED;
    cur += BLIGHT_EXTRA_CURSED;
  }
  // Not enough Cursed roles (small pool or synergy lock): the rest become Luminaries
  lum += cur - draw(rolesOfTeam('cursed'), cur).length;
  const lumPool = rolesOfTeam('luminary').filter((r) => mode === 'standard' || !NIGHT_ONE_ROLES.includes(r));
  draw(lumPool, lum);
  const roles = shuffle(inPlay, random);
  const bluffs = shuffle([...lumPool, ...rolesOfTeam('cursed')].filter((r) => !roles.includes(r)), random).slice(0, 3);
  const pactIdx = roles.indexOf('pact');
  let pact: [number, number] | null = null;
  if (pactIdx >= 0) {
    const partners = range(roles.length).filter((i) => i !== pactIdx && sideOf(roles[i]) === 'good');
    if (partners.length) pact = [pactIdx, partners[Math.floor(random() * partners.length)]];
  }
  return { roles, bluffs, pact };
}

function darkLeaderAlive(state: NfState): boolean {
  const alive = range(state.players.length).filter((p) => state.alive[p]);
  if (state.mode === 'standard') return alive.some((p) => isNightbringer(state.roles[p]));
  if (state.mode === 'joker') return alive.some((p) => state.roles[p] === 'joker');
  return alive.some((p) => state.roles[p] === 'zombie' || state.infected[p]);
}

function checkWinner(state: NfState): Pick<NfState, 'winner' | 'winReason'> | null {
  if (!darkLeaderAlive(state)) {
    return { winner: 'good', winReason: state.mode === 'joker' ? 'jokerGone' : state.mode === 'zombie' ? 'hiveGone' : 'nbGone' };
  }
  const alive = range(state.players.length).filter((p) => state.alive[p]);
  const evil = alive.filter((p) => sideOfPlayer(state, p) === 'evil').length;
  const good = alive.length - evil;
  if (state.mode === 'zombie' && ZOMBIE_RULES.strictParity ? evil > good : evil >= good) return { winner: 'evil', winReason: 'parity' };
  return null;
}

function addReport(reports: NfState['reports'], p: number, night: number, item: ReportItem): NfState['reports'] {
  const mine = reports[p] ?? [];
  const last = mine[mine.length - 1];
  const updated = last && last.night === night ? [...mine.slice(0, -1), { night, items: [...last.items, item] }] : [...mine, { night, items: [item] }];
  return { ...reports, [p]: updated };
}

/** A dead crown holder drops the crown: it returns to the Joker. */
function dropCrown(state: NfState): NfState {
  return state.crowned !== null && !state.alive[state.crowned] ? { ...state, crowned: null } : state;
}

// ==================== NIGHT RESOLUTION ====================
export function resolveNight(state: NfState): NfState {
  const rng = createRng(state.seed + state.night * 7919);
  const n = state.players.length;
  const night = state.night;
  const everyone = range(n);
  const alive = [...state.alive];
  const roles = [...state.roles];
  const infected = [...state.infected];
  const ghostVote = [...state.ghostVote];
  let reports = state.reports;
  let { crowned, loomUsed, tideLeft } = state;
  let gouged = state.gouged.filter((g) => alive[g.target]);
  const chron: ChronItem[] = [];
  const pub: PublicEvent[] = [];
  const deaths: number[] = [];
  const darkKills = new Set<number>();
  const visited = new Set<number>();
  const newlyInfected: number[] = [];
  const pick = <T,>(xs: T[]): T => xs[Math.floor(rng() * xs.length)];
  const report = (p: number, item: ReportItem) => {
    reports = addReport(reports, p, night, item);
  };
  const kindOf = (p: number) => nightSpec(state, p).kind;
  const actorOf = (kind: NightActionKind) => everyone.find((p) => kindOf(p) === kind && state.choices[p] !== undefined);
  const chosen = (p: number) => state.choices[p] ?? [];
  const die = (t: number, byDark: boolean) => {
    if (!alive[t]) return false;
    alive[t] = false;
    ghostVote[t] = true;
    deaths.push(t);
    if (byDark) darkKills.add(t);
    return true;
  };

  // 1. Poison
  const mirage = actorOf('poison');
  const poisoned = mirage !== undefined ? chosen(mirage)[0] ?? null : null;
  if (mirage !== undefined && poisoned !== null) {
    visited.add(poisoned);
    chron.push({ k: 'poison', by: mirage, target: poisoned });
  }
  const disabled = (p: number) => poisoned === p;
  const dying = (p: number) => gouged.some((g) => g.target === p);
  const blind = state.mode !== 'standard' && night === 1;
  const quality = (p: number): Quality => (blind ? 'blind' : disabled(p) ? 'poison' : dying(p) ? 'gouge' : 'true');

  // 2. Tide: two players swap seats at dawn and are shielded tonight
  const immune = new Set<number>();
  const swaps: [number, number][] = [];
  const tide = actorOf('tide');
  if (tide !== undefined && chosen(tide).length === 2) {
    const [a, b] = chosen(tide);
    tideLeft = Math.max(0, tideLeft - 1);
    const ok = !disabled(tide);
    chron.push({ k: 'tide', by: tide, a, b, ok });
    report(tide, { k: 'tideDone', a, b, ok });
    if (ok) {
      swaps.push([a, b]);
      immune.add(a);
      immune.add(b);
    }
  }

  // 3. Aegis protection
  const aegis = actorOf('protect');
  const shieldTarget = aegis !== undefined ? chosen(aegis)[0] ?? null : null;
  if (aegis !== undefined && shieldTarget !== null) chron.push({ k: 'protect', by: aegis, target: shieldTarget, ok: !disabled(aegis) });
  const shield = aegis !== undefined && !disabled(aegis) ? shieldTarget : null;
  const guard = (t: number): Guard | null => (t === shield ? 'aegis' : immune.has(t) ? 'tide' : null);
  const announceSave = (t: number, by: Guard, what: 'attack' | 'infect') => {
    if (pub.some((e) => e.k === 'saved' && e.target === t)) return;
    pub.push({ k: 'saved', target: t, by, what });
    if (by === 'aegis' && aegis !== undefined) report(aegis, { k: 'protectSaved', target: t });
    if (by === 'tide' && tide !== undefined) report(tide, { k: 'tideSaved', target: t });
  };
  /** A Dark attack on t. */
  const attack = (t: number): AttackResult => {
    visited.add(t);
    if (!alive[t]) return 'dead';
    const g = guard(t);
    if (g) {
      announceSave(t, g, 'attack');
      return g;
    }
    die(t, true);
    return 'killed';
  };

  // 4. The Dark side acts
  if (state.mode === 'standard') {
    const boss = everyone.find((p) => alive[p] && isNightbringer(roles[p]));
    const targets = boss !== undefined ? chosen(boss) : [];
    if (boss !== undefined && night >= 2 && targets.length) {
      const r = roles[boss];
      if (disabled(boss)) chron.push({ k: 'bossPoisoned', by: boss });
      else if (r === 'gouge') {
        for (const t of targets) {
          visited.add(t);
          const g = guard(t);
          if (g) announceSave(t, g, 'attack');
          else if (alive[t] && !dying(t)) gouged = [...gouged, { target: t, due: night + 1 }];
          chron.push({ k: 'gouge', by: boss, target: t, result: g ?? 'marked' });
        }
      } else if (r === 'bane') {
        const [first, second] = targets;
        const res = attack(first);
        chron.push({ k: 'attack', by: boss, target: first, result: res });
        if (second !== undefined) {
          if (state.voidDouble) chron.push({ k: 'attack', by: boss, target: second, result: attack(second) });
          else if (res === 'killed' && ROLES[roles[first]].team === 'cursed') {
            report(boss, { k: 'baneReset', target: first });
            chron.push({ k: 'baneReset', by: boss, first });
            chron.push({ k: 'attack', by: boss, target: second, result: attack(second) });
          }
        }
      } else {
        for (const t of targets) {
          if (t === boss && r === 'abyss') {
            // Pass the title: Abyss dies, a living Shadow becomes the new Abyss
            die(boss, false);
            const shadows = everyone.filter((p) => alive[p] && ROLES[roles[p]].team === 'shadow');
            const heir = shadows.length ? pick(shadows) : null;
            if (heir !== null) {
              roles[heir] = 'abyss';
              report(heir, { k: 'becameBoss', role: 'abyss' });
            }
            chron.push({ k: 'titlePassed', from: boss, to: heir });
          } else chron.push({ k: 'attack', by: boss, target: t, result: attack(t) });
        }
      }
    }
  }

  if (state.mode === 'joker') {
    const joker = everyone.find((p) => state.alive[p] && roles[p] === 'joker');
    const plan = joker !== undefined ? state.jokerPlan : null;
    const holder = state.crowned;
    // a. The Joker moves first: seat swap and crown change (a crown taken away cancels its attack)
    if (joker !== undefined && plan) {
      if (plan.swap.length === 2) {
        swaps.push([plan.swap[0], plan.swap[1]]);
        chron.push({ k: 'glitch', by: joker, a: plan.swap[0], b: plan.swap[1] });
      }
      if (plan.mode !== 'keep' && holder !== null) report(holder, { k: 'crownTaken' });
      if (plan.mode === 'recall' && holder !== null) {
        report(joker, { k: 'crownReturned', target: holder });
        chron.push({ k: 'recall', by: joker, target: holder });
        crowned = null;
      }
      if (plan.mode === 'give' && alive[plan.targets[0]]) {
        const t = plan.targets[0];
        crowned = t;
        report(t, { k: 'crowned' });
        report(joker, { k: 'crownGiven', target: t });
        chron.push({ k: 'crown', by: joker, target: t });
      }
    }
    // b. The holder attacks a seat: whoever sits there after tonight's swaps is hit
    if (holder !== null && crowned === holder && alive[holder]) {
      const seat = chosen(holder)[0];
      if (seat === undefined) {
        die(holder, false);
        crowned = null;
        pub.push({ k: 'crownBurden', target: holder });
        chron.push({ k: 'crownBurden', target: holder });
      } else {
        const seatsNow = [...state.seats];
        for (const [x, y] of swaps) {
          const i = seatsNow.indexOf(x);
          const j = seatsNow.indexOf(y);
          [seatsNow[i], seatsNow[j]] = [seatsNow[j], seatsNow[i]];
        }
        const target = seatsNow[seat];
        chron.push({ k: 'seatAttack', by: holder, seat, target, result: attack(target) });
      }
    }
  }

  if (state.mode === 'zombie') {
    const zombie = everyone.find((p) => alive[p] && roles[p] === 'zombie');
    if (zombie !== undefined) {
      for (const t of chosen(zombie)) {
        visited.add(t);
        const g = guard(t);
        let result: 'ok' | Guard | 'already';
        if (g) {
          announceSave(t, g, 'infect');
          result = g;
        } else if (infected[t] || !alive[t]) result = 'already';
        else {
          infected[t] = true;
          newlyInfected.push(t);
          result = 'ok';
        }
        report(zombie, { k: 'infectResult', target: t, ok: result === 'ok' });
        chron.push({ k: 'infect', by: zombie, target: t, result });
      }
    } else {
      // Frenzy: every infected player picks a kill; the most chosen target dies
      const tally = new Map<number, number>();
      for (const p of everyone) if (kindOf(p) === 'frenzy') for (const t of chosen(p)) tally.set(t, (tally.get(t) ?? 0) + 1);
      if (tally.size) {
        const top = Math.max(...tally.values());
        const t = pick([...tally.entries()].filter(([, v]) => v === top).map(([k]) => k));
        chron.push({ k: 'frenzy', target: t, result: attack(t) });
      }
    }
  }

  // 5. Delayed deaths
  for (const g of gouged) if (g.due === night && die(g.target, true)) chron.push({ k: 'gougeDeath', target: g.target });
  gouged = gouged.filter((g) => g.due > night && alive[g.target]);
  if (state.echoDoom) {
    const echo = everyone.find((p) => alive[p] && roles[p] === 'echo');
    if (echo !== undefined && die(echo, false)) chron.push({ k: 'echoDoom', target: echo });
  }
  if (state.viperVictim !== null && die(state.viperVictim, false)) chron.push({ k: 'viperDeath', target: state.viperVictim });

  // 6. Pyre takes someone along when the Dark side kills it
  const pyre = everyone.find((p) => kindOf(p) === 'revenge');
  const revenge = pyre !== undefined ? chosen(pyre)[0] : undefined;
  if (pyre !== undefined && revenge !== undefined && darkKills.has(pyre) && !disabled(pyre) && die(revenge, false)) {
    pub.push({ k: 'pyre', by: pyre, target: revenge });
    report(pyre, { k: 'pyreFired', target: revenge });
    chron.push({ k: 'pyre', by: pyre, target: revenge });
  }

  // 7. Pact partners die together
  if (state.pact) {
    const [a, b] = state.pact;
    for (const [x, y] of [[a, b], [b, a]]) {
      if (deaths.includes(x) && die(y, false)) {
        pub.push({ k: 'pactDeath', target: y, partner: x });
        chron.push({ k: 'pactDeath', target: y, partner: x });
      }
    }
  }

  // 8. Loom revives a player who was already dead before tonight
  const loom = actorOf('revive');
  if (loom !== undefined && chosen(loom).length === 1) {
    const t = chosen(loom)[0];
    loomUsed = true;
    const ok = !disabled(loom) && !state.alive[t] && !alive[t];
    if (ok) {
      alive[t] = true;
      ghostVote[t] = false;
      pub.push({ k: 'revived', target: t });
      report(t, { k: 'wasRevived' });
    }
    report(loom, { k: 'revived', target: t, ok });
    chron.push({ k: 'revive', by: loom, target: t, ok });
  }

  // 9. Seat swaps take effect at dawn
  const seats = [...state.seats];
  for (const [a, b] of swaps) {
    const i = seats.indexOf(a);
    const j = seats.indexOf(b);
    [seats[i], seats[j]] = [seats[j], seats[i]];
  }
  if (swaps.length) pub.push({ k: 'seats', pairs: swaps });

  // 10. Information for the living (read with tonight's final seats and sides)
  const after: NfState = { ...state, alive, roles, seats, infected, crowned };
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
    if (!alive[p] || state.crowned === p || kindOf(p) === 'frenzy') continue;
    const role = roles[p];
    const q = quality(p);
    const lie = q === 'poison' || q === 'gouge';
    const random = q === 'blind';
    let item: ReportItem | null = null;

    if (role === 'aura') {
      const pair = state.choices[p];
      if (!pair) item = { k: 'noChoice' };
      else {
        const truth = registersEvil(after, pair[0]) || registersEvil(after, pair[1]);
        item = { k: 'aura', a: pair[0], b: pair[1], yes: random ? rng() < 0.5 : lie ? !truth : truth };
      }
    } else if (role === 'rune') {
      const truth = livingNeighbours(after, p).filter((x): x is number => x !== null && registersEvil(after, x)).length;
      item = { k: 'rune', count: random ? pick([0, 1, 2]) : lie ? pick([0, 1, 2].filter((c) => c !== truth)) : truth };
    } else if (role === 'trace') {
      const seen = [...visited];
      const truth = seen.length ? pick(seen) : null;
      const fakes = everyone.filter((x) => alive[x] && !visited.has(x) && x !== p);
      const anyone = everyone.filter((x) => alive[x] && x !== p);
      item = { k: 'trace', target: random ? pick(anyone) : lie ? (fakes.length ? pick(fakes) : null) : truth };
    } else if (role === 'dirge' && night >= 2) {
      const ex = state.executedToday;
      if (ex === null) item = { k: 'dirgeNone' };
      else if (lie) item = { k: 'dirge', player: ex, role: pick([...rolesOfTeam('luminary'), ...rolesOfTeam('shadow')].filter((r) => r !== roles[ex])), infected: false };
      else item = { k: 'dirge', player: ex, role: roles[ex], infected: infected[ex] };
    } else if (night === 1) {
      if (role === 'spark') {
        const holders = others(p).filter((x) => ROLES[roles[x]].team === 'luminary');
        item = lie || random || !holders.length ? falsePair(p, 'spark', 'luminary') : truePair(p, 'spark', holders, (x) => roles[x]);
      } else if (role === 'gaze') {
        const holders = others(p).filter((x) => ROLES[roles[x]].team === 'cursed');
        if (lie || random) item = falsePair(p, 'gaze', 'cursed');
        else item = holders.length ? truePair(p, 'gaze', holders, (x) => roles[x]) : { k: 'pairNone', source: 'gaze' };
      } else if (role === 'glyph') {
        // Snare hides from Glyph; a Baiter may be shown as a Shadow
        const shadows = others(p).filter((x) => ROLES[roles[x]].team === 'shadow' && roles[x] !== 'snare');
        const baiters = others(p).filter((x) => roles[x] === 'baiter' && rng() < 0.5);
        const holders = [...shadows, ...baiters];
        const roleOf = (x: number) => (roles[x] === 'baiter' ? pick(rolesOfTeam('shadow').filter((r) => r !== 'snare')) : roles[x]);
        if (lie || random) item = falsePair(p, 'glyph', 'shadow');
        else item = holders.length ? truePair(p, 'glyph', holders, roleOf) : { k: 'pairNone', source: 'glyph' };
      } else if (role === 'snare') {
        const s = seats.indexOf(p);
        const left = seats[(s + 1) % n];
        const right = seats[(s - 1 + n) % n];
        const fake = () => pick([...rolesOfTeam('luminary'), ...rolesOfTeam('cursed')]);
        item = { k: 'snare', left, leftRole: lie ? fake() : roles[left], right, rightRole: lie ? fake() : roles[right] };
      }
    }
    if (item) {
      report(p, item);
      chron.push({ k: 'info', p, item, quality: q });
    }
  }

  // First night: teams and bonds (never affected by poison or the blackout)
  if (night === 1) {
    if (state.mode === 'standard') {
      const nb = everyone.find((p) => isNightbringer(roles[p]))!;
      const shadows = everyone.filter((p) => ROLES[roles[p]].team === 'shadow');
      for (const p of [nb, ...shadows]) report(p, { k: 'evilTeam', nightbringer: nb, shadows, bluffs: p === nb ? state.bluffs : null });
      chron.push({ k: 'darkMeet', boss: nb, shadows });
    } else {
      const boss = everyone.find((p) => roles[p] === state.mode);
      if (boss !== undefined) report(boss, { k: 'bossBluffs', bluffs: state.bluffs });
      for (const p of everyone) if (alive[p] && roles[p] !== state.mode) report(p, { k: 'nightBlind' });
    }
    if (state.pact) {
      const [a, b] = state.pact;
      report(a, { k: 'pact', partner: b });
      report(b, { k: 'pact', partner: a });
      chron.push({ k: 'info', p: a, item: { k: 'pact', partner: b }, quality: 'true' });
    }
  }

  // Newly infected players learn the Zombie and the horde; the horde learns who joined
  if (newlyInfected.length) {
    const zombie = everyone.find((p) => roles[p] === 'zombie')!;
    const hive = everyone.filter((p) => infected[p] && alive[p]);
    for (const t of newlyInfected) if (alive[t]) report(t, { k: 'infected', zombie, hive: hive.filter((h) => h !== t) });
    for (const h of hive) if (!newlyInfected.includes(h)) for (const t of newlyInfected) report(h, { k: 'hiveGrew', target: t });
  }

  for (const d of new Set(deaths)) if (!alive[d]) report(d, { k: 'died' });
  for (const p of everyone) if (!(reports[p] ?? []).some((r) => r.night === night)) report(p, { k: 'nothing' });

  const lastNightDeaths = [...new Set(deaths)].filter((d) => !alive[d]);
  let resolved: NfState = {
    ...state,
    alive,
    roles,
    infected,
    ghostVote,
    reports,
    seats,
    seatsBefore: swaps.length ? state.seats : null,
    poisoned,
    gouged,
    crowned,
    loomUsed,
    tideLeft,
    lastNightDeaths,
    morningEvents: [{ k: 'deaths', night, players: lastNightDeaths }, ...pub],
    echoDoom: false,
    viperVictim: null,
    voidDouble: false,
    executedToday: null,
    jokerPlan: null,
    phase: 'nightEnd',
  };
  resolved = { ...dropCrown(resolved), chronicle: [...state.chronicle, ...chron.map((item) => ({ round: night, stage: 'night' as const, item }))] };
  const win = checkWinner(resolved);
  return win ? { ...resolved, ...win } : resolved;
}

// ==================== DAY ====================
function dayChron(state: NfState, items: ChronItem[]): ChronEntry[] {
  return [...state.chronicle, ...items.map((item) => ({ round: state.night, stage: 'day' as const, item }))];
}

/** Kill players during the day (execution, Nova), with Pact partners; a dead holder drops the crown. */
function dayDeaths(state: NfState, victims: number[]): { state: NfState; events: PublicEvent[]; chron: ChronItem[] } {
  const alive = [...state.alive];
  const ghostVote = [...state.ghostVote];
  const events: PublicEvent[] = [];
  const chron: ChronItem[] = [];
  for (const v of victims) {
    alive[v] = false;
    ghostVote[v] = true;
  }
  if (state.pact) {
    const [a, b] = state.pact;
    for (const [x, y] of [[a, b], [b, a]]) {
      if (victims.includes(x) && alive[y]) {
        alive[y] = false;
        ghostVote[y] = true;
        events.push({ k: 'pactDeath', target: y, partner: x });
        chron.push({ k: 'pactDeath', target: y, partner: x });
      }
    }
  }
  return { state: dropCrown({ ...state, alive, ghostVote }), events, chron };
}

function execute(state: NfState, player: number, nomination: Nomination): NfState {
  const role = state.roles[player];
  if (role === 'fang' && state.fangShield) {
    return { ...state, fangShield: false, events: [...state.events, { k: 'shielded', player }], chronicle: dayChron(state, [{ k: 'shielded', target: player }]) };
  }
  const working = state.poisoned !== player;
  const wrongful = sideOfPlayer(state, player) === 'good';
  const died = dayDeaths(state, [player]);
  let next: NfState = {
    ...died.state,
    executedToday: player,
    events: [...state.events, { k: 'executed', player }, ...died.events],
    chronicle: dayChron(state, [{ k: 'executed', target: player }, ...died.chron]),
    viperVictim: role === 'viper' && working ? nomination.lastVoter : state.viperVictim,
    voidDouble: role === 'void' && working ? true : state.voidDouble,
    echoDoom: wrongful ? true : state.echoDoom,
  };
  const win = checkWinner(next);
  if (win) next = { ...next, ...win, winReason: win.winner === 'good' && isBossNow(state, player) ? 'nbExecuted' : win.winReason };
  return next;
}

// ==================== REDUCER ====================
export function reducer(state: NfState, action: Action): NfState {
  const n = state.players.length;
  switch (action.type) {
    case 'SET_LANG':
      return { ...state, lang: action.lang };
    case 'SET_MODE':
      if (!['howto', 'setup'].includes(state.phase)) return state;
      return { ...state, mode: action.mode };
    case 'SHOW_SETUP':
      return { ...state, phase: 'setup' };
    case 'SHOW_HOWTO':
      return { ...state, phase: 'howto' };
    case 'ARRANGE':
      if (validateNightfallPlayers(action.players) !== null) return state;
      return { ...initialState(state.lang, state.mode), phase: 'seating', players: action.players.map((p) => p.trim()) };
    case 'START': {
      if (state.phase !== 'seating') return state;
      const { roles, bluffs, pact } = dealRoles(n, createRng(action.seed), state.mode);
      return {
        ...initialState(state.lang, state.mode),
        players: state.players,
        seats: range(n),
        phase: 'nightPass',
        roles,
        startRoles: roles,
        roundRoles: { 1: roles },
        bluffs,
        pact,
        seed: action.seed,
        alive: Array(n).fill(true),
        ghostVote: Array(n).fill(false),
        infected: Array(n).fill(false),
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
      let { choices, jokerPlan } = state;
      if (spec.kind === 'joker') {
        const plan: JokerPlan = { mode: action.joker?.mode ?? 'keep', targets: action.targets, swap: action.joker?.swap ?? [] };
        jokerPlan = validJokerPlan(state, p, plan) ? plan : { mode: 'keep', targets: [], swap: [] };
      } else if (spec.kind !== 'dummy' && validTargets(state, p, action.targets)) choices = { ...choices, [p]: action.targets };
      const turn = state.turn + 1;
      const next = { ...state, choices, jokerPlan, turn };
      return turn >= n ? resolveNight(next) : { ...next, phase: 'nightPass' };
    }
    case 'SHOW_MORNING':
      if (state.phase !== 'nightEnd') return state;
      return { ...state, phase: 'morning', events: [] };
    case 'BEGIN_DAWN':
      if (state.phase !== 'morning') return state;
      return state.winner ? { ...state, phase: 'final' } : { ...state, phase: 'dawnPass', turn: 0, testimony: {} };
    case 'DONE_DAWN': {
      const p = pendingPlayer(state);
      if (state.phase !== 'dawn' || p === null) return state;
      const testimony = { ...state.testimony, [p]: action.shared === true };
      const turn = state.turn + 1;
      if (turn < n) return { ...state, testimony, turn, phase: 'dawnPass' };
      const order = range(n).map((k) => state.seats[(lapStart(state) + k) % n]);
      const item: ChronItem = { k: 'testimony', shared: order.filter((x) => testimony[x]), kept: order.filter((x) => !testimony[x]) };
      return {
        ...state,
        testimony,
        turn,
        phase: 'day',
        dayStage: 'discussion',
        nominations: [],
        chronicle: [...state.chronicle, { round: state.night, stage: 'morning', item }],
      };
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
      const pos = (v: number) => (seatOf(state, v) - seatOf(state, nominee) + n) % n;
      const lastVoter = voters.length ? voters.reduce((a, b) => (pos(b) > pos(a) ? b : a)) : null;
      const ghostVote = state.ghostVote.map((g, i) => (voters.includes(i) && !state.alive[i] ? false : g));
      const nomination: Nomination = { nominator, nominee, voters, votes, lastVoter, valid: votes >= voteThreshold(state) };
      return {
        ...state,
        ghostVote,
        nominations: [...state.nominations, nomination],
        chronicle: dayChron(state, [{ k: 'nomination', nominator, nominee, votes, voters, valid: nomination.valid }]),
      };
    }
    case 'NOVA_SHOT': {
      const { shooter, target } = action;
      if (state.phase !== 'day' || !state.alive[shooter] || !state.alive[target] || shooter === target) return state;
      const realNova = state.roles[shooter] === 'nova' && !state.novaUsed && state.crowned !== shooter;
      const hit = realNova && state.poisoned !== shooter && isBossNow(state, target);
      const chron: ChronItem = { k: 'nova', shooter, target, hit, real: realNova };
      if (!hit) {
        return { ...state, novaUsed: state.novaUsed || realNova, events: [...state.events, { k: 'novaMiss', shooter, target }], chronicle: dayChron(state, [chron]) };
      }
      const died = dayDeaths(state, [target]);
      let next: NfState = {
        ...died.state,
        novaUsed: true,
        events: [...state.events, { k: 'novaHit', shooter, target }, ...died.events],
        chronicle: dayChron(state, [chron, ...died.chron]),
      };
      const win = checkWinner(next);
      if (win) next = { ...next, ...win, winReason: win.winner === 'good' ? 'nbShot' : win.winReason, phase: 'final' };
      return next;
    }
    case 'END_DAY': {
      if (state.phase !== 'day') return state;
      const valid = state.nominations.filter((x) => x.valid);
      const top = Math.max(0, ...valid.map((x) => x.votes));
      const leaders = valid.filter((x) => x.votes === top);
      const apex = range(n).find((p) => state.alive[p] && state.roles[p] === 'apex' && sideOfPlayer(state, p) === 'good' && state.poisoned !== p);
      if (leaders.length >= 2 && aliveCount(state) === 3 && apex !== undefined) {
        return {
          ...state,
          events: [...state.events, { k: 'apex' }],
          chronicle: dayChron(state, [{ k: 'apex', by: apex }]),
          winner: 'good',
          winReason: 'apex',
          phase: 'final',
        };
      }
      let next: NfState =
        leaders.length === 1
          ? execute(state, leaders[0].nominee, leaders[0])
          : { ...state, executedToday: null, events: [...state.events, { k: 'noExecution' }], chronicle: dayChron(state, [{ k: 'noExecution' }]) };
      if (next.winner) return { ...next, phase: 'final' };
      const nextNight = state.night + 1;
      next = {
        ...next,
        phase: 'nightPass',
        night: nextNight,
        turn: 0,
        choices: {},
        jokerPlan: null,
        poisoned: null,
        nominations: [],
        dayStage: 'discussion',
        seatsBefore: null,
        roundRoles: { ...next.roundRoles, [nextNight]: next.roles },
      };
      return next;
    }
    case 'RESUME_AT_PASS':
      // After a reload, never reopen a secret screen directly
      if (state.phase === 'night') return { ...state, phase: 'nightPass' };
      if (state.phase === 'dawn') return { ...state, phase: 'dawnPass' };
      return state;
    case 'RESET':
      return initialState(state.lang, state.mode);
  }
}
