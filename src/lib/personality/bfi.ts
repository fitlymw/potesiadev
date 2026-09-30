/**
 * BFI-44 scoring and PersonaCore archetype matching (pure functions, no React).
 *
 * Scoring follows the standard BFI procedure: reverse-score keyed items
 * (6 - answer) and average the items of each trait → a 1–5 scale score.
 *
 *  - `pomp`  (0–100): Percent Of Maximum Possible = (mean - 1) / 4 * 100.
 *                     This is a score, NOT a percentile.
 *  - `z`             : standing relative to REFERENCE_NORMS, used for the
 *                     Low / Moderate / High level and for archetype matching.
 */
import { BFI_ITEMS } from '@/data/bfi44';
import { ARCHETYPES, type Archetype } from '@/data/archetypes';

export type Trait = 'E' | 'A' | 'C' | 'N' | 'O';
export type TraitLevel = 'low' | 'moderate' | 'high';

export const TRAITS: Trait[] = ['O', 'C', 'E', 'A', 'N'];

/**
 * Approximate adult reference means/SDs for BFI scale scores (1–5), in line with
 * large English-language samples (e.g. Srivastava, John, Gosling & Potter, 2003).
 * Replace with exact published norms — ideally from an Indonesian sample —
 * before citing results formally.
 */
export const REFERENCE_NORMS: Record<Trait, { mean: number; sd: number }> = {
  E: { mean: 3.25, sd: 0.9 },
  A: { mean: 3.64, sd: 0.72 },
  C: { mean: 3.45, sd: 0.73 },
  N: { mean: 3.32, sd: 0.82 },
  O: { mean: 3.92, sd: 0.66 },
};

/** |z| above this marks a trait as High / Low (≈ top / bottom 31%). */
export const LEVEL_Z_THRESHOLD = 0.5;

export interface TraitScore {
  mean: number;
  pomp: number;
  z: number;
  level: TraitLevel;
}

export type BfiProfile = Record<Trait, TraitScore>;

export interface ArchetypeMatch {
  archetype: Archetype;
  /** Root-mean-square distance between the user's z-scores and the archetype prototype. */
  distance: number;
  /** 0–100, 100 = the profile sits exactly on the prototype. */
  similarity: number;
}

function levelFromZ(z: number): TraitLevel {
  if (z > LEVEL_Z_THRESHOLD) return 'high';
  if (z < -LEVEL_Z_THRESHOLD) return 'low';
  return 'moderate';
}

/** answers[i] is the 1–5 response to BFI_ITEMS[i]. */
export function scoreBfi(answers: number[]): BfiProfile {
  if (answers.length !== BFI_ITEMS.length) {
    throw new Error(`Expected ${BFI_ITEMS.length} answers, got ${answers.length}`);
  }
  const sums: Record<Trait, number> = { E: 0, A: 0, C: 0, N: 0, O: 0 };
  const counts: Record<Trait, number> = { E: 0, A: 0, C: 0, N: 0, O: 0 };
  BFI_ITEMS.forEach((item, i) => {
    const raw = answers[i];
    sums[item.trait] += item.reversed ? 6 - raw : raw;
    counts[item.trait] += 1;
  });

  const profile = {} as BfiProfile;
  for (const trait of TRAITS) {
    const mean = sums[trait] / counts[trait];
    const { mean: refMean, sd } = REFERENCE_NORMS[trait];
    const z = (mean - refMean) / sd;
    profile[trait] = { mean, pomp: ((mean - 1) / 4) * 100, z, level: levelFromZ(z) };
  }
  return profile;
}

/**
 * Nearest-prototype matching. Each archetype formula becomes a target vector in
 * z-space (High = +1, Low = -1, Moderate = 0); only the traits named in the
 * formula count. Distances are averaged per trait, so archetypes with longer
 * formulas are not favoured.
 */
export function matchArchetypes(profile: BfiProfile): ArchetypeMatch[] {
  return ARCHETYPES.map((archetype) => {
    const entries = Object.entries(archetype.targets) as [Trait, number][];
    const squared = entries.reduce((acc, [trait, target]) => {
      const z = Math.max(-2.5, Math.min(2.5, profile[trait].z));
      return acc + (z - target) ** 2;
    }, 0);
    const distance = Math.sqrt(squared / entries.length);
    return { archetype, distance, similarity: Math.round(100 * Math.exp(-(distance ** 2) / 2)) };
  }).sort((a, b) => a.distance - b.distance);
}
