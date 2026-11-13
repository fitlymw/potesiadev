import { useGLTF } from '@react-three/drei';

/** KayKit Adventurers (CC0, Kay Lousberg): five bodies on one rig, animations kept in Knight.glb. */
export const CHAR_BASE = `${import.meta.env.BASE_URL}models/nf2/char/`;
export const CHAR_FILES = { Knight: 'Knight.glb', Rogue: 'Rogue.glb', Mage: 'Mage.glb', Barbarian: 'Barbarian.glb', Hooded: 'Rogue_Hooded.glb' } as const;
export type CharFile = keyof typeof CHAR_FILES;
export const CHARACTER_URLS = Object.values(CHAR_FILES).map((f) => CHAR_BASE + f);

export function preloadCharacters() {
  CHARACTER_URLS.forEach((u) => useGLTF.preload(u));
}
