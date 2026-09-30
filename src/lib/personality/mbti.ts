/**
 * Oracle's Tavern scoring (pure functions, no React).
 *
 * Each answer (1–5) becomes a weight of -2..+2 toward the pole its statement is
 * keyed to. Per axis the score runs from -32 (second pole) to +32 (first pole).
 *
 * Ties (score 0) follow the MBTI manual convention and go to I, N, F, P.
 * Axes whose |score| is at most BORDERLINE_SCORE are flagged as "balanced",
 * because such a small margin is not a meaningful preference.
 */
import { ORACLE_ITEMS } from '@/data/mbti';

export type MbtiAxis = 'EI' | 'SN' | 'TF' | 'JP';
export type MbtiPole = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

export const MBTI_AXES: MbtiAxis[] = ['EI', 'SN', 'TF', 'JP'];

const LIKERT_TO_WEIGHT: Record<number, number> = { 1: -2, 2: -1, 3: 0, 4: 1, 5: 2 };

/** 4 of 32 points = one "agree a little" on four statements. */
export const BORDERLINE_SCORE = 4;

export interface MbtiResult {
  type: string;
  /** Signed axis scores, positive = first pole (E, S, T, J). */
  scores: Record<MbtiAxis, number>;
  percentages: Record<MbtiPole, number>;
  /** 0–100: how clearly the chosen pole was preferred. */
  clarity: Record<MbtiAxis, number>;
  balanced: Record<MbtiAxis, boolean>;
  language: 'en' | 'id';
}

export function maxAxisScore(axis: MbtiAxis): number {
  return ORACLE_ITEMS.filter((item) => item.axis === axis).length * 2;
}

/** answers[i] is the 1–5 response to ORACLE_ITEMS[i]. */
export function scoreOracle(answers: number[], language: 'en' | 'id'): MbtiResult {
  if (answers.length !== ORACLE_ITEMS.length) {
    throw new Error(`Expected ${ORACLE_ITEMS.length} answers, got ${answers.length}`);
  }
  const scores: Record<MbtiAxis, number> = { EI: 0, SN: 0, TF: 0, JP: 0 };
  ORACLE_ITEMS.forEach((item, i) => {
    const weight = LIKERT_TO_WEIGHT[answers[i]];
    scores[item.axis] += item.pole === item.axis[0] ? weight : -weight;
  });

  const percentages = {} as Record<MbtiPole, number>;
  const clarity = {} as Record<MbtiAxis, number>;
  const balanced = {} as Record<MbtiAxis, boolean>;
  let type = '';
  for (const axis of MBTI_AXES) {
    const [first, second] = axis.split('') as [MbtiPole, MbtiPole];
    const score = scores[axis];
    const max = maxAxisScore(axis);
    percentages[first] = 50 + (score / max) * 50;
    percentages[second] = 100 - percentages[first];
    clarity[axis] = Math.round((Math.abs(score) / max) * 100);
    balanced[axis] = Math.abs(score) <= BORDERLINE_SCORE;
    type += score > 0 ? first : second; // tie → second pole (I, N, F, P)
  }
  return { type, scores, percentages, clarity, balanced, language };
}

const STORAGE_KEY = 'oracle-tavern-result';

export function saveOracleResult(result: MbtiResult): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    // Storage may be unavailable (private mode); the result still travels via router state.
  }
}

export function loadOracleResult(): MbtiResult | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MbtiResult) : null;
  } catch {
    return null;
  }
}
