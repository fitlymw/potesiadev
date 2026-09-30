/**
 * Mind Reader — pass-the-phone perspective-taking game (pure logic, no React).
 *
 * The entered names are shuffled into a random seating order around a round
 * table. Seat 1 is the first Target; each round one player is the Target: they
 * rate themselves on a few 1–10 questions and predict which friend knows them
 * best. The phone is then passed to the left (seat order) to every other
 * player, who guesses the Target's answers in secret. Answers and guesses are
 * revealed together on the "table" screen, and the Target role moves one seat
 * to the left until everyone has had a turn.
 *
 * Scoring per guess (err = |answer − guess|):
 *   accuracy  = max(0, 10 − 3·err)        → 10, 7, 4, 1, 0 …
 *   insight   = +5 when the guess is closer than the "safe" middle guess
 *               (|answer − 5.5|), so always guessing 5 or 6 does not pay off.
 * The Target earns +10 when their "who knows me best" pick is (one of) the
 * round's top guessers.
 */

import { validatePlayers } from '@/lib/party/common';

export { MIN_PLAYERS, MAX_PLAYERS, validatePlayers, shuffleSeats, pickQuestions } from '@/lib/party/common';
export const QUESTIONS_PER_ROUND = 4;
export const SCALE_MIN = 1;
export const SCALE_MAX = 10;
const MIDPOINT = (SCALE_MIN + SCALE_MAX) / 2;
const INSIGHT_BONUS = 5;
export const MAX_POINTS_PER_GUESS = 10 + INSIGHT_BONUS;
export const BEST_KNOWER_BONUS = 10;

export type Phase = 'howto' | 'setup' | 'seating' | 'pass' | 'target' | 'guess' | 'reveal' | 'final';
export type Lang = 'en' | 'id';

export interface Round {
  targetIndex: number;
  questionIds: string[];
  /** Target's self-ratings (null until submitted). */
  self: number[] | null;
  /** Player index the Target thinks knows them best. */
  predictedBest: number | null;
  /** guesses[playerIndex] = that player's guesses for this round. */
  guesses: Record<number, number[]>;
}

export interface GameState {
  phase: Phase;
  lang: Lang;
  /** Names in seating order (seat 1 first, then to the left). */
  players: string[];
  rounds: Round[];
  /** Position in the guesser order of the current round. */
  turn: number;
  usedQuestionIds: string[];
}

export const initialState = (lang: Lang = 'id'): GameState => ({
  phase: 'howto',
  lang,
  players: [],
  rounds: [],
  turn: 0,
  usedQuestionIds: [],
});

export type Action =
  | { type: 'SET_LANG'; lang: Lang }
  | { type: 'SHOW_SETUP' }
  | { type: 'SHOW_HOWTO' }
  /** Seat the players (already shuffled by the caller) and show the round table. */
  | { type: 'ARRANGE'; players: string[] }
  | { type: 'START'; questionIds: string[] }
  | { type: 'CONFIRM_PASS' }
  | { type: 'SUBMIT_TARGET'; answers: number[]; predictedBest: number }
  | { type: 'SUBMIT_GUESS'; answers: number[] }
  | { type: 'NEXT_ROUND'; questionIds: string[] }
  | { type: 'RESUME_AT_PASS' }
  | { type: 'RESET' };

// ==================== SELECTORS ====================
export function currentRound(state: GameState): Round | undefined {
  return state.rounds[state.rounds.length - 1];
}

/** Everyone except the Target, starting with the player after the Target. */
export function guessersOf(round: Round, playerCount: number): number[] {
  return Array.from({ length: playerCount - 1 }, (_, i) => (round.targetIndex + 1 + i) % playerCount);
}

/** The player who should be holding the phone right now. */
export function pendingPlayer(state: GameState): number | null {
  const round = currentRound(state);
  if (!round) return null;
  if (!round.self) return round.targetIndex;
  const guessers = guessersOf(round, state.players.length);
  return state.turn < guessers.length ? guessers[state.turn] : null;
}

function newRound(targetIndex: number, questionIds: string[]): Round {
  return { targetIndex, questionIds, self: null, predictedBest: null, guesses: {} };
}

function validAnswers(answers: number[], count: number) {
  return answers.length === count && answers.every((a) => Number.isInteger(a) && a >= SCALE_MIN && a <= SCALE_MAX);
}

// ==================== REDUCER ====================
export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_LANG':
      return { ...state, lang: action.lang };
    case 'SHOW_SETUP':
      return { ...state, phase: 'setup' };
    case 'SHOW_HOWTO':
      return { ...state, phase: 'howto' };
    case 'ARRANGE': {
      if (validatePlayers(action.players) !== null) return state;
      return { ...state, phase: 'seating', players: action.players.map((n) => n.trim()), rounds: [], turn: 0 };
    }
    case 'START': {
      if (state.phase !== 'seating' || validatePlayers(state.players) !== null) return state;
      return {
        ...state,
        phase: 'pass',
        rounds: [newRound(0, action.questionIds)],
        turn: 0,
        // Keep earlier games' questions so a rematch avoids them (the bank recycles when exhausted)
        usedQuestionIds: [...state.usedQuestionIds, ...action.questionIds],
      };
    }
    case 'CONFIRM_PASS': {
      const round = currentRound(state);
      if (state.phase !== 'pass' || !round) return state;
      return { ...state, phase: round.self ? 'guess' : 'target' };
    }
    case 'SUBMIT_TARGET': {
      const round = currentRound(state);
      if (state.phase !== 'target' || !round || round.self) return state;
      if (!validAnswers(action.answers, round.questionIds.length)) return state;
      if (!guessersOf(round, state.players.length).includes(action.predictedBest)) return state;
      const updated: Round = { ...round, self: action.answers, predictedBest: action.predictedBest };
      return { ...state, phase: 'pass', turn: 0, rounds: [...state.rounds.slice(0, -1), updated] };
    }
    case 'SUBMIT_GUESS': {
      const round = currentRound(state);
      const player = pendingPlayer(state);
      if (state.phase !== 'guess' || !round || player === null) return state;
      if (!validAnswers(action.answers, round.questionIds.length)) return state;
      const updated: Round = { ...round, guesses: { ...round.guesses, [player]: action.answers } };
      const turn = state.turn + 1;
      const done = turn >= guessersOf(round, state.players.length).length;
      return { ...state, phase: done ? 'reveal' : 'pass', turn, rounds: [...state.rounds.slice(0, -1), updated] };
    }
    case 'NEXT_ROUND': {
      if (state.phase !== 'reveal') return state;
      const next = state.rounds.length;
      if (next >= state.players.length) return { ...state, phase: 'final' };
      return {
        ...state,
        phase: 'pass',
        turn: 0,
        rounds: [...state.rounds, newRound(next, action.questionIds)],
        usedQuestionIds: [...state.usedQuestionIds, ...action.questionIds],
      };
    }
    case 'RESUME_AT_PASS':
      // After a reload, never reopen a secret screen directly
      return state.phase === 'target' || state.phase === 'guess' ? { ...state, phase: 'pass' } : state;
    case 'RESET':
      return initialState(state.lang);
  }
}

// ==================== SCORING ====================
export interface GuessScore {
  answer: number;
  guess: number;
  error: number;
  accuracy: number;
  insight: boolean;
  points: number;
}

export function scoreGuess(answer: number, guess: number): GuessScore {
  const error = Math.abs(answer - guess);
  const accuracy = Math.max(0, 10 - 3 * error);
  const insight = error < Math.abs(answer - MIDPOINT);
  return { answer, guess, error, accuracy, insight, points: accuracy + (insight ? INSIGHT_BONUS : 0) };
}

export interface RoundResult {
  round: Round;
  perGuesser: { player: number; scores: GuessScore[]; total: number }[];
  /** Guessers with the highest total this round. */
  bestKnowers: number[];
  predictionCorrect: boolean;
}

export function roundResult(round: Round, playerCount: number): RoundResult | null {
  if (!round.self) return null;
  const self = round.self;
  const perGuesser = guessersOf(round, playerCount)
    .filter((p) => round.guesses[p])
    .map((player) => {
      const scores = round.guesses[player].map((guess, i) => scoreGuess(self[i], guess));
      return { player, scores, total: scores.reduce((a, s) => a + s.points, 0) };
    });
  const top = Math.max(...perGuesser.map((g) => g.total));
  const bestKnowers = perGuesser.filter((g) => g.total === top).map((g) => g.player);
  return { round, perGuesser, bestKnowers, predictionCorrect: round.predictedBest !== null && bestKnowers.includes(round.predictedBest) };
}

export type Title = 'mindReader' | 'perceptive' | 'gettingToKnow';

/** Thresholds on the empathy score (0–100); see the simulation test. */
export const TITLE_THRESHOLDS = { mindReader: 70, perceptive: 55 };

export function titleFor(empathyScore: number): Title {
  if (empathyScore >= TITLE_THRESHOLDS.mindReader) return 'mindReader';
  if (empathyScore >= TITLE_THRESHOLDS.perceptive) return 'perceptive';
  return 'gettingToKnow';
}

export interface FinalStats {
  players: {
    player: number;
    guessPoints: number;
    bonusPoints: number;
    total: number;
    /** % of the maximum guess points (how well they read others). */
    empathyScore: number;
    title: Title;
  }[];
  /** closeness[guesser][target] = empathy score of that pair, null on the diagonal. */
  closeness: (number | null)[][];
  /** How well the group read each player as Target (average of the column). */
  readability: (number | null)[];
}

export function finalStats(state: GameState): FinalStats {
  const n = state.players.length;
  const guessPoints = Array(n).fill(0);
  const guessMax = Array(n).fill(0);
  const bonus = Array(n).fill(0);
  const pairPoints: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const pairMax: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (const round of state.rounds) {
    const result = roundResult(round, n);
    if (!result) continue;
    if (result.predictionCorrect) bonus[round.targetIndex] += BEST_KNOWER_BONUS;
    for (const g of result.perGuesser) {
      const max = g.scores.length * MAX_POINTS_PER_GUESS;
      guessPoints[g.player] += g.total;
      guessMax[g.player] += max;
      pairPoints[g.player][round.targetIndex] += g.total;
      pairMax[g.player][round.targetIndex] += max;
    }
  }

  const pct = (points: number, max: number) => (max > 0 ? Math.round((100 * points) / max) : 0);
  const closeness = pairPoints.map((row, g) => row.map((p, t) => (g === t || pairMax[g][t] === 0 ? null : pct(p, pairMax[g][t]))));
  const readability = Array.from({ length: n }, (_, t) => {
    const col = closeness.map((row) => row[t]).filter((v): v is number => v !== null);
    return col.length ? Math.round(col.reduce((a, b) => a + b, 0) / col.length) : null;
  });

  return {
    players: Array.from({ length: n }, (_, p) => {
      const empathyScore = pct(guessPoints[p], guessMax[p]);
      return { player: p, guessPoints: guessPoints[p], bonusPoints: bonus[p], total: guessPoints[p] + bonus[p], empathyScore, title: titleFor(empathyScore) };
    }).sort((a, b) => b.total - a.total),
    closeness,
    readability,
  };
}
