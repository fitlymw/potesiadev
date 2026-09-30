/**
 * The Profiler — pass-the-phone "who said it?" game (pure logic, no React).
 *
 * Players sit around a round table in a random order (seat 1 first, then to
 * the left). Each round:
 *  1. Everyone sees the question on the table (it can be swapped if the group
 *     does not like it).
 *  2. Answer lap: the phone goes to the left; each player answers in secret
 *     and predicts how many friends will recognise their answer (Johari mode).
 *  3. Once everyone has answered the phone goes on the table, and only then are
 *     the answers shuffled and shown anonymously — so nobody sees them early.
 *  4. Guess lap: each player matches every anonymous answer to a player in one
 *     turn (instead of one pass per answer).
 *  5. Reveal: owners, who recognised whom, and whether predictions were right.
 *
 * Scoring: +10 for each friend you identify; +10 when your "how many will
 * recognise me" prediction is exact, +5 when it is off by one. There is no
 * reward for being hard to guess, so nobody gains by answering dishonestly.
 * Identical answers are interchangeable: matching either owner counts.
 */
import { validatePlayers } from '@/lib/party/common';

export { MIN_PLAYERS, MAX_PLAYERS, validatePlayers, shuffleSeats, pickQuestions, shuffle } from '@/lib/party/common';

export const ROUND_OPTIONS = [3, 5] as const;
export const DETECT_POINTS = 10;
export const JOHARI_EXACT_POINTS = 10;
export const JOHARI_CLOSE_POINTS = 5;

export type Phase = 'howto' | 'setup' | 'seating' | 'question' | 'pass' | 'answer' | 'collected' | 'table' | 'guess' | 'reveal' | 'final';
export type Lang = 'en' | 'id';
export type Lap = 'answer' | 'guess';

export interface PlayerAnswer {
  /** Option index as "opt:N" for multiple choice, or the typed text. */
  value: string;
  /** How many other players this player expects to recognise their answer. */
  predicted: number;
}

export interface ProfilerRound {
  questionId: string;
  /** Seat that starts both laps of this round. */
  starter: number;
  answers: Record<number, PlayerAnswer>;
  /** cardOwners[c] = player who wrote anonymous card c (a shuffle; empty until shown). */
  cardOwners: number[];
  /** guesses[guesser][c] = player the guesser thinks wrote card c. */
  guesses: Record<number, number[]>;
}

export interface GameState {
  phase: Phase;
  lang: Lang;
  /** Names in seating order (seat 1 first, then to the left). */
  players: string[];
  roundsTotal: number;
  rounds: ProfilerRound[];
  lap: Lap;
  turn: number;
  usedQuestionIds: string[];
}

export const initialState = (lang: Lang = 'id'): GameState => ({
  phase: 'howto',
  lang,
  players: [],
  roundsTotal: ROUND_OPTIONS[0],
  rounds: [],
  lap: 'answer',
  turn: 0,
  usedQuestionIds: [],
});

export type Action =
  | { type: 'SET_LANG'; lang: Lang }
  | { type: 'SHOW_SETUP' }
  | { type: 'SHOW_HOWTO' }
  | { type: 'ARRANGE'; players: string[]; roundsTotal: number }
  | { type: 'START'; questionId: string }
  | { type: 'SWAP_QUESTION'; questionId: string }
  | { type: 'BEGIN_ANSWERS' }
  | { type: 'CONFIRM_PASS' }
  | { type: 'SUBMIT_ANSWER'; value: string; predicted: number }
  | { type: 'SHOW_TABLE'; cardOwners: number[] }
  | { type: 'BEGIN_GUESSES' }
  | { type: 'SUBMIT_GUESS'; assignment: number[] }
  | { type: 'NEXT_ROUND'; questionId: string }
  | { type: 'RESUME_AT_PASS' }
  | { type: 'RESET' };

// ==================== SELECTORS ====================
export function currentRound(state: GameState): ProfilerRound | undefined {
  return state.rounds[state.rounds.length - 1];
}

/** The player who should be holding the phone during a lap. */
export function pendingPlayer(state: GameState): number | null {
  const round = currentRound(state);
  const n = state.players.length;
  if (!round || state.turn >= n) return null;
  return (round.starter + state.turn) % n;
}

export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?,;:]+$/, '');
}

export function sameAnswer(a: string, b: string): boolean {
  return normalizeAnswer(a) === normalizeAnswer(b);
}

function isPermutation(values: number[], n: number) {
  return values.length === n && [...values].sort((a, b) => a - b).every((v, i) => v === i);
}

function newRound(questionId: string, starter: number): ProfilerRound {
  return { questionId, starter, answers: {}, cardOwners: [], guesses: {} };
}

function replaceLast(state: GameState, round: ProfilerRound): ProfilerRound[] {
  return [...state.rounds.slice(0, -1), round];
}

// ==================== REDUCER ====================
export function reducer(state: GameState, action: Action): GameState {
  const round = currentRound(state);
  const n = state.players.length;
  switch (action.type) {
    case 'SET_LANG':
      return { ...state, lang: action.lang };
    case 'SHOW_SETUP':
      return { ...state, phase: 'setup' };
    case 'SHOW_HOWTO':
      return { ...state, phase: 'howto' };
    case 'ARRANGE': {
      if (validatePlayers(action.players) !== null) return state;
      if (!(ROUND_OPTIONS as readonly number[]).includes(action.roundsTotal)) return state;
      return { ...state, phase: 'seating', players: action.players.map((p) => p.trim()), roundsTotal: action.roundsTotal, rounds: [], turn: 0 };
    }
    case 'START':
      if (state.phase !== 'seating') return state;
      return {
        ...state,
        phase: 'question',
        rounds: [newRound(action.questionId, 0)],
        usedQuestionIds: [...state.usedQuestionIds, action.questionId],
      };
    case 'SWAP_QUESTION':
      if (state.phase !== 'question' || !round) return state;
      return {
        ...state,
        rounds: replaceLast(state, { ...round, questionId: action.questionId }),
        usedQuestionIds: [...state.usedQuestionIds, action.questionId],
      };
    case 'BEGIN_ANSWERS':
      if (state.phase !== 'question') return state;
      return { ...state, phase: 'pass', lap: 'answer', turn: 0 };
    case 'CONFIRM_PASS':
      if (state.phase !== 'pass') return state;
      return { ...state, phase: state.lap === 'answer' ? 'answer' : 'guess' };
    case 'SUBMIT_ANSWER': {
      const player = pendingPlayer(state);
      if (state.phase !== 'answer' || !round || player === null) return state;
      if (normalizeAnswer(action.value) === '') return state;
      if (!Number.isInteger(action.predicted) || action.predicted < 0 || action.predicted > n - 1) return state;
      const updated = { ...round, answers: { ...round.answers, [player]: { value: action.value.trim(), predicted: action.predicted } } };
      const turn = state.turn + 1;
      return { ...state, phase: turn >= n ? 'collected' : 'pass', turn, rounds: replaceLast(state, updated) };
    }
    case 'SHOW_TABLE':
      if (state.phase !== 'collected' || !round || !isPermutation(action.cardOwners, n)) return state;
      return { ...state, phase: 'table', rounds: replaceLast(state, { ...round, cardOwners: action.cardOwners }) };
    case 'BEGIN_GUESSES':
      if (state.phase !== 'table') return state;
      return { ...state, phase: 'pass', lap: 'guess', turn: 0 };
    case 'SUBMIT_GUESS': {
      const player = pendingPlayer(state);
      if (state.phase !== 'guess' || !round || player === null) return state;
      const a = action.assignment;
      // Must assign every card to a different player, with the guesser's own card to themself
      if (!isPermutation(a, n) || a[round.cardOwners.indexOf(player)] !== player) return state;
      const updated = { ...round, guesses: { ...round.guesses, [player]: a } };
      const turn = state.turn + 1;
      return { ...state, phase: turn >= n ? 'reveal' : 'pass', turn, rounds: replaceLast(state, updated) };
    }
    case 'NEXT_ROUND':
      if (state.phase !== 'reveal') return state;
      if (state.rounds.length >= state.roundsTotal) return { ...state, phase: 'final' };
      return {
        ...state,
        phase: 'question',
        turn: 0,
        rounds: [...state.rounds, newRound(action.questionId, state.rounds.length % n)],
        usedQuestionIds: [...state.usedQuestionIds, action.questionId],
      };
    case 'RESUME_AT_PASS':
      // After a reload, never reopen a secret screen directly
      return state.phase === 'answer' || state.phase === 'guess' ? { ...state, phase: 'pass' } : state;
    case 'RESET':
      return initialState(state.lang);
  }
}

// ==================== SCORING ====================
/** Did `guesser` identify `owner` (a card with the owner's answer assigned to the owner)? */
export function identifies(round: ProfilerRound, guesser: number, owner: number): boolean {
  const assignment = round.guesses[guesser];
  const ownAnswer = round.answers[owner];
  if (!assignment || !ownAnswer || guesser === owner) return false;
  return assignment.some((p, c) => p === owner && sameAnswer(round.answers[round.cardOwners[c]].value, ownAnswer.value));
}

export function johariPoints(predicted: number, actual: number): number {
  const diff = Math.abs(predicted - actual);
  return diff === 0 ? JOHARI_EXACT_POINTS : diff === 1 ? JOHARI_CLOSE_POINTS : 0;
}

export interface RoundResult {
  owners: { player: number; identifiedBy: number[]; predicted: number; actual: number; johari: number }[];
  players: { player: number; detected: number[]; detectPoints: number; johari: number; total: number }[];
}

export function roundResult(round: ProfilerRound, n: number): RoundResult {
  const everyone = Array.from({ length: n }, (_, i) => i);
  const owners = everyone.map((owner) => {
    const identifiedBy = everyone.filter((g) => identifies(round, g, owner));
    const predicted = round.answers[owner]?.predicted ?? 0;
    return { player: owner, identifiedBy, predicted, actual: identifiedBy.length, johari: johariPoints(predicted, identifiedBy.length) };
  });
  const players = everyone.map((p) => {
    const detected = everyone.filter((owner) => identifies(round, p, owner));
    const johari = owners[p].johari;
    return { player: p, detected, detectPoints: detected.length * DETECT_POINTS, johari, total: detected.length * DETECT_POINTS + johari };
  });
  return { owners, players };
}

export interface FinalStats {
  players: {
    player: number;
    detectPoints: number;
    johariPoints: number;
    total: number;
    /** % of the other players' answers this player identified. */
    detectRate: number;
    /** % of friends who recognised this player's answers. */
    recognisedRate: number;
    /** Rounds where the "how many will recognise me" prediction was exact. */
    exactPredictions: number;
  }[];
  bestDetective: number[];
  mostSelfAware: number[];
  openBook: number[];
  fullOfSurprises: number[];
}

function argBest(values: number[], better: (a: number, b: number) => boolean): number[] {
  let best: number[] = [];
  values.forEach((v, i) => {
    if (best.length === 0 || better(v, values[best[0]])) best = [i];
    else if (v === values[best[0]]) best.push(i);
  });
  return best;
}

export function finalStats(state: GameState): FinalStats {
  const n = state.players.length;
  const detect = Array(n).fill(0);
  const johari = Array(n).fill(0);
  const detected = Array(n).fill(0);
  const recognised = Array(n).fill(0);
  const exact = Array(n).fill(0);
  let rounds = 0;
  for (const round of state.rounds) {
    if (Object.keys(round.guesses).length < n) continue;
    rounds += 1;
    const result = roundResult(round, n);
    for (const p of result.players) {
      detect[p.player] += p.detectPoints;
      johari[p.player] += p.johari;
      detected[p.player] += p.detected.length;
    }
    for (const o of result.owners) {
      recognised[o.player] += o.actual;
      if (o.predicted === o.actual) exact[o.player] += 1;
    }
  }
  const possible = Math.max(1, rounds * (n - 1));
  const pct = (v: number) => Math.round((100 * v) / possible);
  const players = Array.from({ length: n }, (_, p) => ({
    player: p,
    detectPoints: detect[p],
    johariPoints: johari[p],
    total: detect[p] + johari[p],
    detectRate: pct(detected[p]),
    recognisedRate: pct(recognised[p]),
    exactPredictions: exact[p],
  }));
  return {
    players: [...players].sort((a, b) => b.total - a.total),
    bestDetective: argBest(detect, (a, b) => a > b),
    mostSelfAware: argBest(johari, (a, b) => a > b),
    openBook: argBest(recognised, (a, b) => a > b),
    fullOfSurprises: argBest(recognised, (a, b) => a < b),
  };
}
