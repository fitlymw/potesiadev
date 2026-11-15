/**
 * Character customisation (KayKit Adventurers rig). All five classes share one skeleton, so a
 * look mixes parts across classes: head / body / arms / legs each pick a class, plus a cape, a hat,
 * a tint per part and a height. Travels as a short "k.…" string in the room state.
 */

export const CLASSES = ['Knight', 'Rogue', 'Mage', 'Barbarian'] as const;
export type ClassName = (typeof CLASSES)[number];

/** 0 = none, otherwise CLASSES[i-1]'s cape */
export const CAPES = ['none', ...CLASSES] as const;
/** KayKit hats, the hooded Rogue head, then primitive hats built in code */
export const HATS = ['none', 'helmet', 'mageHat', 'barbarianHat', 'hood', 'wizard', 'crown', 'leaf', 'beret'] as const;
/** First entry = the texture as painted; the rest are light tints that keep the detail. */
export const TINTS = ['#ffffff', '#ffd1d1', '#ffe2b8', '#fff3b0', '#d4f5c4', '#c8f0ea', '#cfe0ff', '#e0d2ff', '#ffd0ec', '#d9d9d9', '#a9a9a9', '#f3b56b', '#8ad0ff', '#9be3a8'];
export const HEIGHTS = 5; // 0.92 … 1.08 × base scale

export interface Look {
  head: number;
  body: number;
  arms: number;
  legs: number;
  cape: number;
  hat: number;
  tintHead: number;
  tintBody: number;
  tintArms: number;
  tintLegs: number;
  tintCape: number;
  tintHat: number;
  height: number;
}

const KEYS: (keyof Look)[] = ['head', 'body', 'arms', 'legs', 'cape', 'hat', 'tintHead', 'tintBody', 'tintArms', 'tintLegs', 'tintCape', 'tintHat', 'height'];
const LIMITS: Record<keyof Look, number> = {
  head: CLASSES.length, body: CLASSES.length, arms: CLASSES.length, legs: CLASSES.length, cape: CAPES.length, hat: HATS.length,
  tintHead: TINTS.length, tintBody: TINTS.length, tintArms: TINTS.length, tintLegs: TINTS.length, tintCape: TINTS.length, tintHat: TINTS.length,
  height: HEIGHTS,
};

export function defaultLook(): Look {
  return { head: 1, body: 1, arms: 1, legs: 1, cape: 0, hat: 0, tintHead: 0, tintBody: 0, tintArms: 0, tintLegs: 0, tintCape: 0, tintHat: 0, height: 2 };
}

export function randomLook(rnd: () => number = Math.random): Look {
  const pick = (n: number) => Math.floor(rnd() * n);
  const cls = pick(CLASSES.length);
  const mix = (p: number) => (rnd() < p ? pick(CLASSES.length) : cls); // mostly one class with a twist
  return {
    head: mix(0.35), body: cls, arms: mix(0.3), legs: mix(0.3),
    cape: rnd() < 0.5 ? 0 : pick(CAPES.length), hat: rnd() < 0.45 ? 0 : pick(HATS.length),
    tintHead: rnd() < 0.6 ? 0 : pick(TINTS.length), tintBody: pick(TINTS.length), tintArms: rnd() < 0.5 ? 0 : pick(TINTS.length), tintLegs: pick(TINTS.length),
    tintCape: pick(TINTS.length), tintHat: pick(TINTS.length), height: pick(HEIGHTS),
  };
}

/** Clamp anything that came over the wire into a valid Look. */
export function sanitizeLook(raw: unknown): Look {
  const out = defaultLook();
  if (raw && typeof raw === 'object') {
    for (const k of KEYS) {
      const v = (raw as Record<string, unknown>)[k];
      if (typeof v === 'number' && Number.isFinite(v)) out[k] = Math.max(0, Math.min(LIMITS[k] - 1, Math.floor(v)));
    }
  }
  return out;
}

/** "k.1.1.1.1.0.0.0.0.0.0.0.0.2.1" — short enough to live in the room state. */
export function encodeLook(l: Look): string {
  return 'k.' + KEYS.map((k) => l[k]).join('.');
}
export function decodeLook(s: string | undefined | null): Look {
  if (!s || !s.startsWith('k.')) return defaultLook();
  const parts = s.slice(2).split('.').map((x) => Number(x));
  const obj: Record<string, number> = {};
  KEYS.forEach((k, i) => { obj[k] = parts[i]; });
  return sanitizeLook(obj);
}
