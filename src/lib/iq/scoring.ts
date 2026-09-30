/**
 * Adaptive testing and scoring for Matrix Reasoning (pure functions, no React).
 *
 * Model: 3-parameter logistic IRT
 *   P(correct | θ, level) = c + (1 - c) / (1 + e^(-a(θ - b_level)))
 * with guessing c = 1/8 (eight options).
 *
 * IMPORTANT: the level difficulties (b) and discrimination (a) below are
 * PROVISIONAL design values, not estimates from real data. Until items are
 * calibrated on real responses and norms are collected, the reasoning score is
 * a provisional estimate on an IQ-like scale (mean 100, SD 15), not an IQ score.
 */
import { MAX_LEVEL, MIN_LEVEL, OPTION_COUNT } from '@/lib/iq/matrix';

export const LEVEL_DIFFICULTY: Record<number, number> = { 1: -2, 2: -1, 3: 0, 4: 1, 5: 2 };
export const DISCRIMINATION = 1.5;
export const GUESSING = 1 / OPTION_COUNT;

export const TEST_LENGTH = 16;
export const SECONDS_PER_ITEM = 60;
/** Prior mean slightly below average so the first item is not the hardest one. */
export const START_THETA = -0.5;

export interface Response {
  level: number;
  correct: boolean;
  timedOut: boolean;
  /** Response time in milliseconds. */
  rtMs: number;
}

export function probabilityCorrect(theta: number, level: number): number {
  const b = LEVEL_DIFFICULTY[level];
  return GUESSING + (1 - GUESSING) / (1 + Math.exp(-DISCRIMINATION * (theta - b)));
}

/** Fisher information of a 3PL item at θ. */
export function itemInformation(theta: number, level: number): number {
  const p = probabilityCorrect(theta, level);
  return DISCRIMINATION ** 2 * ((p - GUESSING) / (1 - GUESSING)) ** 2 * ((1 - p) / p);
}

const GRID = Array.from({ length: 161 }, (_, i) => -4 + i * 0.05);

/** Expected-a-posteriori ability estimate with a standard normal prior. */
export function estimateAbility(responses: Response[], priorMean = 0): { theta: number; se: number } {
  const weights = GRID.map((theta) => {
    let logLik = -((theta - priorMean) ** 2) / 2;
    for (const r of responses) {
      const p = probabilityCorrect(theta, r.level);
      logLik += Math.log(r.correct ? p : 1 - p);
    }
    return logLik;
  });
  const max = Math.max(...weights);
  const posterior = weights.map((w) => Math.exp(w - max));
  const total = posterior.reduce((a, b) => a + b, 0);
  const theta = GRID.reduce((acc, t, i) => acc + t * posterior[i], 0) / total;
  const variance = GRID.reduce((acc, t, i) => acc + (t - theta) ** 2 * posterior[i], 0) / total;
  return { theta, se: Math.sqrt(variance) };
}

/** Next level = the one that is most informative at the current ability estimate. */
export function nextLevel(responses: Response[]): number {
  const { theta } = estimateAbility(responses, START_THETA);
  let best = MIN_LEVEL;
  for (let level = MIN_LEVEL; level <= MAX_LEVEL; level++) {
    if (itemInformation(theta, level) > itemInformation(theta, best)) best = level;
  }
  return best;
}

export type ScoreBand = 'below' | 'lowAverage' | 'average' | 'highAverage' | 'above' | 'veryHigh';

export interface TestSummary {
  theta: number;
  se: number;
  /** Provisional score on an IQ-like scale (100 ± 15). */
  score: number;
  /** 90% uncertainty range. */
  range: [number, number];
  band: ScoreBand;
  correct: number;
  total: number;
  highestLevelSolved: number;
  perLevel: { level: number; correct: number; total: number }[];
  /** Median response time of correct answers, in seconds (null if none correct). */
  medianCorrectSeconds: number | null;
  timeouts: number;
}

function bandFor(score: number): ScoreBand {
  if (score < 80) return 'below';
  if (score < 90) return 'lowAverage';
  if (score < 110) return 'average';
  if (score < 120) return 'highAverage';
  if (score < 130) return 'above';
  return 'veryHigh';
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function summarize(responses: Response[]): TestSummary {
  // Final estimate uses the neutral N(0,1) prior
  const { theta, se } = estimateAbility(responses);
  const score = Math.round(100 + 15 * theta);
  const half = Math.round(1.645 * se * 15);
  const perLevel = Array.from({ length: MAX_LEVEL }, (_, i) => {
    const level = i + 1;
    const atLevel = responses.filter((r) => r.level === level);
    return { level, correct: atLevel.filter((r) => r.correct).length, total: atLevel.length };
  });
  return {
    theta,
    se,
    score,
    range: [score - half, score + half],
    band: bandFor(score),
    correct: responses.filter((r) => r.correct).length,
    total: responses.length,
    highestLevelSolved: Math.max(0, ...responses.filter((r) => r.correct).map((r) => r.level)),
    perLevel,
    medianCorrectSeconds: median(responses.filter((r) => r.correct).map((r) => r.rtMs / 1000)),
    timeouts: responses.filter((r) => r.timedOut).length,
  };
}
