/**
 * Character customisation. A Look is a handful of palette indices, so it travels as a short
 * string and both the editor preview and the in-world character build the same body from it.
 */

export const SKIN = ['#f6d7c3', '#e8b998', '#c68e63', '#9c6b45', '#6b4530', '#b9e3c6', '#cbb6ea'];
export const HAIR_COLORS = ['#2b2118', '#5a3a22', '#b5651d', '#e3c16f', '#e8e8e8', '#7a3b8f', '#2f6fb0', '#3aa35b', '#d94f7a'];
export const CLOTH = ['#b91c1c', '#1d4ed8', '#047857', '#7c3aed', '#b45309', '#0e7490', '#be185d', '#374151', '#f5f5f4', '#1f2937', '#65a30d', '#f59e0b'];

export const HAIR_STYLES = ['bald', 'short', 'long', 'bun', 'spiky', 'ponytail', 'bob'] as const;
export const HATS = ['none', 'wizard', 'hood', 'crown', 'leaf', 'beret', 'helmet'] as const;
export const EYES = ['round', 'happy', 'sleepy', 'wide'] as const;
export const MOUTHS = ['smile', 'flat', 'open'] as const;
export const ACCESSORIES = ['none', 'cape', 'backpack', 'scarf', 'wings'] as const;

export interface Look {
  skin: number;
  hair: number;
  hairColor: number;
  hat: number;
  hatColor: number;
  top: number;
  bottom: number;
  shoes: number;
  eyes: number;
  mouth: number;
  acc: number;
  accColor: number;
}

const KEYS: (keyof Look)[] = ['skin', 'hair', 'hairColor', 'hat', 'hatColor', 'top', 'bottom', 'shoes', 'eyes', 'mouth', 'acc', 'accColor'];
const LIMITS: Record<keyof Look, number> = {
  skin: SKIN.length, hair: HAIR_STYLES.length, hairColor: HAIR_COLORS.length, hat: HATS.length, hatColor: CLOTH.length,
  top: CLOTH.length, bottom: CLOTH.length, shoes: CLOTH.length, eyes: EYES.length, mouth: MOUTHS.length, acc: ACCESSORIES.length, accColor: CLOTH.length,
};

export function defaultLook(): Look {
  return { skin: 0, hair: 1, hairColor: 1, hat: 0, hatColor: 3, top: 2, bottom: 9, shoes: 4, eyes: 0, mouth: 0, acc: 0, accColor: 0 };
}

export function randomLook(rnd: () => number = Math.random): Look {
  const pick = (n: number) => Math.floor(rnd() * n);
  return {
    skin: pick(SKIN.length), hair: pick(HAIR_STYLES.length), hairColor: pick(HAIR_COLORS.length),
    hat: rnd() < 0.55 ? 0 : pick(HATS.length), hatColor: pick(CLOTH.length),
    top: pick(CLOTH.length), bottom: pick(CLOTH.length), shoes: pick(CLOTH.length),
    eyes: pick(EYES.length), mouth: pick(MOUTHS.length),
    acc: rnd() < 0.5 ? 0 : pick(ACCESSORIES.length), accColor: pick(CLOTH.length),
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

/** "0.1.1.0.3.2.9.4.0.0.0.0" — short enough to live in the room state. */
export function encodeLook(l: Look): string {
  return KEYS.map((k) => l[k]).join('.');
}
export function decodeLook(s: string | undefined | null): Look {
  if (!s) return defaultLook();
  const parts = s.split('.').map((x) => Number(x));
  const obj: Record<string, number> = {};
  KEYS.forEach((k, i) => { obj[k] = parts[i]; });
  return sanitizeLook(obj);
}
