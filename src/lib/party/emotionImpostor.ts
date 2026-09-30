/**
 * Emotion Impostor — pass-the-phone social deduction game (pure logic, no React).
 *
 * Players sit around a round table in a random order; the phone always goes to
 * the left. Each round:
 *  1. Role lap: every player privately (press-and-hold) sees their role.
 *     Citizens get a scenario + the emotion it causes; the Impostor only gets
 *     the category.
 *  2. Table: each player gives one sentence about how they would react, then
 *     the group discusses.
 *  3. Vote lap: everyone secretly votes for a suspect (not themselves).
 *  4. Tally: the player with the most votes is accused. A tie means nobody is
 *     accused and the Impostor escapes.
 *  5. If the Impostor is caught, they get a last chance: pick the real
 *     scenario out of four from the same category. A correct pick still wins.
 *  6. Reveal, and the group may pick the best clue of the round.
 *
 * Every player is the Impostor once before anyone gets a second turn.
 */
import { validatePlayers, shuffle } from '@/lib/party/common';
import type { Difficulty, EmotionScenario } from '@/data/emotionScenarios';

export { MIN_PLAYERS, MAX_PLAYERS, validatePlayers, shuffleSeats, shuffle } from '@/lib/party/common';

export const ROUND_OPTIONS = [3, 5] as const;
export const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard', 'mixed'] as const;
export type DifficultySetting = (typeof DIFFICULTY_OPTIONS)[number];

export const CORRECT_VOTE_POINTS = 100;
export const ESCAPE_POINTS = 200;
export const LAST_GUESS_POINTS = 150;
export const BEST_CLUE_POINTS = 50;
export const LAST_CHANCE_OPTIONS = 4;

export type Phase = 'howto' | 'setup' | 'seating' | 'pass' | 'role' | 'clues' | 'vote' | 'tally' | 'lastChance' | 'reveal' | 'final';
export type Lang = 'en' | 'id';
export type Lap = 'role' | 'vote';

export interface ImpostorRound {
  scenarioId: string;
  impostor: number;
  /** Seat that starts both laps of this round. */
  starter: number;
  /** votes[voter] = suspect */
  votes: Record<number, number>;
  /** Scenario ids offered for the Impostor's last chance (empty unless caught). */
  lastChanceOptions: string[];
  lastGuess: string | null;
  bestClue: number | null;
}

export interface GameState {
  phase: Phase;
  lang: Lang;
  /** Names in seating order (seat 1 first, then to the left). */
  players: string[];
  roundsTotal: number;
  difficulty: DifficultySetting;
  /** Who is the Impostor in round r: impostorOrder[r % n] (a shuffle of the seats). */
  impostorOrder: number[];
  rounds: ImpostorRound[];
  lap: Lap;
  turn: number;
  usedScenarioIds: string[];
}

export const initialState = (lang: Lang = 'id'): GameState => ({
  phase: 'howto',
  lang,
  players: [],
  roundsTotal: ROUND_OPTIONS[0],
  difficulty: 'mixed',
  impostorOrder: [],
  rounds: [],
  lap: 'role',
  turn: 0,
  usedScenarioIds: [],
});

export type Action =
  | { type: 'SET_LANG'; lang: Lang }
  | { type: 'SHOW_SETUP' }
  | { type: 'SHOW_HOWTO' }
  | { type: 'ARRANGE'; players: string[]; roundsTotal: number; difficulty: DifficultySetting; impostorOrder: number[] }
  | { type: 'START'; scenarioId: string }
  | { type: 'CONFIRM_PASS' }
  | { type: 'ROLE_SEEN' }
  | { type: 'BEGIN_VOTING' }
  | { type: 'SUBMIT_VOTE'; suspect: number }
  | { type: 'OPEN_LAST_CHANCE'; options: string[] }
  | { type: 'FINISH_TALLY' }
  | { type: 'SUBMIT_LAST_GUESS'; scenarioId: string }
  | { type: 'PICK_BEST_CLUE'; player: number | null }
  | { type: 'NEXT_ROUND'; scenarioId: string }
  | { type: 'RESUME_AT_PASS' }
  | { type: 'RESET' };

// ==================== SELECTORS ====================
export function currentRound(state: GameState): ImpostorRound | undefined {
  return state.rounds[state.rounds.length - 1];
}

export function pendingPlayer(state: GameState): number | null {
  const round = currentRound(state);
  const n = state.players.length;
  if (!round || state.turn >= n) return null;
  return (round.starter + state.turn) % n;
}

/** Speaking order for the clue round: the starter, then to the left. */
export function speakingOrder(round: ImpostorRound, n: number): number[] {
  return Array.from({ length: n }, (_, i) => (round.starter + i) % n);
}

export interface Tally {
  counts: number[];
  /** The single most-voted player, or null on a tie. */
  accused: number | null;
  caught: boolean;
}

export function tally(round: ImpostorRound, n: number): Tally {
  const counts = Array(n).fill(0);
  Object.values(round.votes).forEach((s) => (counts[s] += 1));
  const top = Math.max(...counts);
  const leaders = counts.flatMap((c, i) => (c === top ? [i] : []));
  const accused = leaders.length === 1 ? leaders[0] : null;
  return { counts, accused, caught: accused === round.impostor };
}

/** Scenarios matching the difficulty setting. */
export function scenarioPool(all: EmotionScenario[], difficulty: DifficultySetting): EmotionScenario[] {
  return difficulty === 'mixed' ? all : all.filter((s) => s.difficulty === (difficulty as Difficulty));
}

/** The real scenario plus decoys from the same category, in random order. */
export function lastChanceOptions(all: EmotionScenario[], realId: string, random: () => number = Math.random): string[] {
  const real = all.find((s) => s.id === realId);
  if (!real) return [realId];
  const decoys = all.filter((s) => s.category === real.category && s.id !== realId).map((s) => s.id);
  const pick = shuffle(decoys, random).slice(0, LAST_CHANCE_OPTIONS - 1);
  return shuffle([...pick, realId], random);
}

function isPermutation(values: number[], n: number) {
  return values.length === n && [...values].sort((a, b) => a - b).every((v, i) => v === i);
}

function newRound(state: GameState, index: number, scenarioId: string): ImpostorRound {
  const n = state.players.length;
  return { scenarioId, impostor: state.impostorOrder[index % n], starter: index % n, votes: {}, lastChanceOptions: [], lastGuess: null, bestClue: null };
}

function replaceLast(state: GameState, round: ImpostorRound): ImpostorRound[] {
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
      if (!(DIFFICULTY_OPTIONS as readonly string[]).includes(action.difficulty)) return state;
      if (!isPermutation(action.impostorOrder, action.players.length)) return state;
      return {
        ...state,
        phase: 'seating',
        players: action.players.map((p) => p.trim()),
        roundsTotal: action.roundsTotal,
        difficulty: action.difficulty,
        impostorOrder: action.impostorOrder,
        rounds: [],
        turn: 0,
      };
    }
    case 'START':
      if (state.phase !== 'seating') return state;
      return {
        ...state,
        phase: 'pass',
        lap: 'role',
        turn: 0,
        rounds: [newRound(state, 0, action.scenarioId)],
        usedScenarioIds: [...state.usedScenarioIds, action.scenarioId],
      };
    case 'CONFIRM_PASS':
      if (state.phase !== 'pass') return state;
      return { ...state, phase: state.lap === 'role' ? 'role' : 'vote' };
    case 'ROLE_SEEN': {
      if (state.phase !== 'role') return state;
      const turn = state.turn + 1;
      return { ...state, turn, phase: turn >= n ? 'clues' : 'pass' };
    }
    case 'BEGIN_VOTING':
      if (state.phase !== 'clues') return state;
      return { ...state, phase: 'pass', lap: 'vote', turn: 0 };
    case 'SUBMIT_VOTE': {
      const voter = pendingPlayer(state);
      if (state.phase !== 'vote' || !round || voter === null) return state;
      if (!Number.isInteger(action.suspect) || action.suspect < 0 || action.suspect >= n || action.suspect === voter) return state;
      const turn = state.turn + 1;
      return { ...state, turn, phase: turn >= n ? 'tally' : 'pass', rounds: replaceLast(state, { ...round, votes: { ...round.votes, [voter]: action.suspect } }) };
    }
    case 'OPEN_LAST_CHANCE': {
      if (state.phase !== 'tally' || !round || !tally(round, n).caught) return state;
      if (!action.options.includes(round.scenarioId)) return state;
      return { ...state, phase: 'lastChance', rounds: replaceLast(state, { ...round, lastChanceOptions: action.options }) };
    }
    case 'FINISH_TALLY':
      if (state.phase !== 'tally' || !round || tally(round, n).caught) return state;
      return { ...state, phase: 'reveal' };
    case 'SUBMIT_LAST_GUESS':
      if (state.phase !== 'lastChance' || !round || !round.lastChanceOptions.includes(action.scenarioId)) return state;
      return { ...state, phase: 'reveal', rounds: replaceLast(state, { ...round, lastGuess: action.scenarioId }) };
    case 'PICK_BEST_CLUE':
      if (state.phase !== 'reveal' || !round) return state;
      if (action.player !== null && (action.player < 0 || action.player >= n)) return state;
      return { ...state, rounds: replaceLast(state, { ...round, bestClue: action.player }) };
    case 'NEXT_ROUND':
      if (state.phase !== 'reveal') return state;
      if (state.rounds.length >= state.roundsTotal) return { ...state, phase: 'final' };
      return {
        ...state,
        phase: 'pass',
        lap: 'role',
        turn: 0,
        rounds: [...state.rounds, newRound(state, state.rounds.length, action.scenarioId)],
        usedScenarioIds: [...state.usedScenarioIds, action.scenarioId],
      };
    case 'RESUME_AT_PASS':
      // After a reload, never reopen a secret screen directly
      return state.phase === 'role' || state.phase === 'vote' ? { ...state, phase: 'pass' } : state;
    case 'RESET':
      return initialState(state.lang);
  }
}

// ==================== SCORING ====================
export type Outcome = 'escaped' | 'caughtButGuessed' | 'caught';

export interface RoundResult {
  tally: Tally;
  outcome: Outcome;
  /** Citizens win when the Impostor is caught and misses the last guess. */
  citizensWin: boolean;
  correctVoters: number[];
  points: number[];
}

export function roundResult(round: ImpostorRound, n: number): RoundResult {
  const t = tally(round, n);
  const outcome: Outcome = !t.caught ? 'escaped' : round.lastGuess === round.scenarioId ? 'caughtButGuessed' : 'caught';
  const correctVoters = Object.entries(round.votes).filter(([, s]) => s === round.impostor).map(([v]) => Number(v));
  const points = Array(n).fill(0);
  correctVoters.forEach((v) => (points[v] += CORRECT_VOTE_POINTS));
  if (outcome === 'escaped') points[round.impostor] += ESCAPE_POINTS;
  if (outcome === 'caughtButGuessed') points[round.impostor] += LAST_GUESS_POINTS;
  if (round.bestClue !== null) points[round.bestClue] += BEST_CLUE_POINTS;
  return { tally: t, outcome, citizensWin: outcome === 'caught', correctVoters, points };
}

export interface FinalStats {
  players: { player: number; total: number; correctVotes: number; impostorWins: number; bestClues: number }[];
  emotionDetective: number[];
  bestActor: number[];
  bestClue: number[];
}

function leaders(values: number[]): number[] {
  const top = Math.max(...values);
  return top > 0 ? values.flatMap((v, i) => (v === top ? [i] : [])) : [];
}

export function finalStats(state: GameState): FinalStats {
  const n = state.players.length;
  const total = Array(n).fill(0);
  const correctVotes = Array(n).fill(0);
  const impostorWins = Array(n).fill(0);
  const bestClues = Array(n).fill(0);
  for (const round of state.rounds) {
    if (Object.keys(round.votes).length < n) continue;
    const r = roundResult(round, n);
    r.points.forEach((p, i) => (total[i] += p));
    r.correctVoters.forEach((v) => (correctVotes[v] += 1));
    if (!r.citizensWin) impostorWins[round.impostor] += 1;
    if (round.bestClue !== null) bestClues[round.bestClue] += 1;
  }
  return {
    players: Array.from({ length: n }, (_, p) => ({ player: p, total: total[p], correctVotes: correctVotes[p], impostorWins: impostorWins[p], bestClues: bestClues[p] })).sort((a, b) => b.total - a.total),
    emotionDetective: leaders(correctVotes),
    bestActor: leaders(impostorWins),
    bestClue: leaders(bestClues),
  };
}
