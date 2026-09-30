/**
 * Shared rules for the pass-the-phone party games (pure functions, no React).
 */

export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 8;

export function validatePlayers(names: string[]): 'tooFew' | 'tooMany' | 'empty' | 'duplicate' | null {
  const trimmed = names.map((n) => n.trim());
  if (trimmed.some((n) => n === '')) return 'empty';
  if (trimmed.length < MIN_PLAYERS) return 'tooFew';
  if (trimmed.length > MAX_PLAYERS) return 'tooMany';
  if (new Set(trimmed.map((n) => n.toLowerCase())).size !== trimmed.length) return 'duplicate';
  return null;
}

/** Small seeded PRNG (mulberry32) so a game can be replayed exactly in tests. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Random seating order for the entered names (seat 1 first, then to the left). */
export function shuffleSeats(names: string[], random: () => number = Math.random): string[] {
  return shuffle(names.map((n) => n.trim()), random);
}

/** Pick `count` unused question ids; recycles the bank once it runs out. */
export function pickQuestions(allIds: string[], used: string[], count: number, random: () => number = Math.random): string[] {
  let pool = allIds.filter((id) => !used.includes(id));
  if (pool.length < count) pool = [...allIds];
  return shuffle(pool, random).slice(0, count);
}
