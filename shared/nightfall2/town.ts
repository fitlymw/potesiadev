/**
 * Elf Town layout. One source of truth: the server uses the colliders, the client draws it.
 * Everything is built from primitives in code (no asset downloads); the positions are what
 * matter — a prettier kit later only changes the meshes.
 *
 * Coordinates: x east, z south, metres. The plaza (voting circle) is at the origin. A river
 * runs east–west south of the plaza; three bridges are the only ways across.
 */

export type District = 'plaza' | 'market' | 'grove' | 'lanternRow' | 'oldQuarter';
export type WallStyle = 'stone' | 'wood';

export interface Building {
  x: number;
  z: number;
  /** footprint width (x) and depth (z) */
  w: number;
  d: number;
  h: number;
  color: string;
  roof: string;
  /** 'hip' = pyramid, 'gable' = long ridge */
  roofKind: 'hip' | 'gable';
  style: WallStyle;
  district: District;
}

export interface Tree { x: number; z: number; s: number; kind: 'pine' | 'oak' }
export interface Lantern { x: number; z: number }
export interface AABB { minX: number; maxX: number; minZ: number; maxZ: number }
export interface Bridge { x: number; width: number }

export const WORLD_HALF = 42; // playable square is [-42, 42]
export const PLAZA_RADIUS = 9;
/** The river band (z range) and where it can be crossed. */
export const RIVER = { z0: 10.6, z1: 13.6 };
export const BRIDGES: Bridge[] = [{ x: 0, width: 4.6 }, { x: -15, width: 3.6 }, { x: 15, width: 3.6 }];

const STONE = ['#e8d8b8', '#d9c7a1', '#f1e4c8', '#cdb892', '#e3cfae'];
const WOOD = ['#8b5a2b', '#a0632f', '#6f4426', '#9c6a3c', '#7b4b26'];
const ROOF = ['#7a4a3a', '#5c6b4a', '#8a5a44', '#4a5d6b', '#6b4a5c'];

function b(x: number, z: number, w: number, d: number, h: number, i: number, district: District, roofKind: 'hip' | 'gable' = 'gable'): Building {
  const style: WallStyle = district === 'grove' || district === 'lanternRow' ? 'wood' : 'stone';
  return { x, z, w, d, h, color: (style === 'wood' ? WOOD : STONE)[i % 5], roof: ROOF[i % ROOF.length], roofKind, style, district };
}

export const BUILDINGS: Building[] = [
  // Market (east): stalls and a tavern around a small square
  b(18, -4, 6, 5, 3.2, 0, 'market'), b(18, 4, 6, 5, 3.2, 1, 'market'), b(26, 0, 7, 9, 4.5, 2, 'market', 'hip'),
  b(24, -10, 5, 4, 2.8, 3, 'market'), b(24, 10, 5, 4, 2.8, 4, 'market'), b(32, -8, 6, 6, 3.6, 0, 'market', 'hip'), b(32, 8, 6, 6, 3.6, 1, 'market', 'hip'),
  // Grove (north): wooden cottages among giant trees
  b(-6, -20, 5, 5, 3, 2, 'grove', 'hip'), b(6, -22, 5, 4, 3, 3, 'grove'), b(0, -30, 7, 6, 4, 4, 'grove', 'hip'),
  b(-14, -28, 5, 5, 3, 0, 'grove', 'hip'), b(14, -30, 5, 5, 3, 1, 'grove', 'hip'),
  // Lantern Row (south of the river): a straight street of tall narrow wooden houses
  b(-12, 20, 4, 6, 5, 2, 'lanternRow'), b(-6, 20, 4, 6, 5.5, 3, 'lanternRow'), b(0, 20, 4, 6, 5, 4, 'lanternRow'),
  b(6, 20, 4, 6, 5.5, 0, 'lanternRow'), b(12, 20, 4, 6, 5, 1, 'lanternRow'),
  b(-9, 30, 5, 5, 4, 2, 'lanternRow', 'hip'), b(0, 31, 8, 6, 4.5, 3, 'lanternRow'), b(9, 30, 5, 5, 4, 4, 'lanternRow', 'hip'),
  // Old Quarter (west): a tight maze of small stone houses
  b(-18, -6, 5, 5, 3.4, 0, 'oldQuarter', 'hip'), b(-18, 6, 5, 5, 3.4, 1, 'oldQuarter', 'hip'),
  b(-25, -11, 5, 4, 3, 2, 'oldQuarter'), b(-25, 0, 4, 6, 3.8, 3, 'oldQuarter'), b(-25, 11, 5, 4, 3, 4, 'oldQuarter'),
  b(-32, -6, 6, 5, 3.4, 0, 'oldQuarter'), b(-32, 6, 6, 5, 3.4, 1, 'oldQuarter'), b(-36, 0, 3, 3, 7, 2, 'oldQuarter', 'hip'), // the old tower
];

/** Ancient oaks: landmarks you can navigate by. */
const GIANTS: Tree[] = [
  { x: -11, z: -13, s: 3.4, kind: 'oak' }, { x: 12, z: -15, s: 3.1, kind: 'oak' },
  { x: -30, z: -31, s: 3.8, kind: 'oak' }, { x: 31, z: -27, s: 3.5, kind: 'oak' },
  { x: -22, z: 26, s: 2.9, kind: 'oak' }, { x: 24, z: 27, s: 3.0, kind: 'oak' },
];

/** Deterministic tree scatter (no RNG needed at runtime; both sides get the same list). */
export const TREES: Tree[] = (() => {
  const out: Tree[] = [...GIANTS];
  let seed = 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < 170; i++) {
    const x = (rnd() * 2 - 1) * (WORLD_HALF - 2);
    const z = (rnd() * 2 - 1) * (WORLD_HALF - 2);
    const grove = z < -12; // denser and bigger in the north
    const s = grove ? 1.1 + rnd() * 1.5 : 0.8 + rnd() * 0.7;
    const kind: Tree['kind'] = rnd() < (grove ? 0.45 : 0.25) ? 'oak' : 'pine';
    // keep the plaza, the river banks, the market square and the streets clear
    if (Math.hypot(x, z) < PLAZA_RADIUS + 3) continue;
    if (z > RIVER.z0 - 2 && z < RIVER.z1 + 2) continue;
    if (Math.abs(x) < 3 || Math.abs(z) < 3) continue; // the two main streets
    if (z > 16 && z < 24) continue; // Lantern Row street
    if (BUILDINGS.some((bb) => Math.abs(x - bb.x) < bb.w / 2 + 1.5 + s && Math.abs(z - bb.z) < bb.d / 2 + 1.5 + s)) continue;
    if (out.some((t) => Math.hypot(t.x - x, t.z - z) < (t.s + s) * 0.9)) continue;
    if (!grove && rnd() < 0.5) continue;
    out.push({ x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10, s: Math.round(s * 100) / 100, kind });
  }
  return out;
})();

export const LANTERNS: Lantern[] = [
  { x: 6, z: 6 }, { x: -6, z: 6 }, { x: 6, z: -6 }, { x: -6, z: -6 }, // plaza corners
  { x: -2.8, z: 9.8 }, { x: 2.8, z: 9.8 }, { x: -2.8, z: 14.4 }, { x: 2.8, z: 14.4 }, // main bridge ends
  { x: -9, z: 16.5 }, { x: 9, z: 16.5 }, // Lantern Row
  { x: 21, z: 0 }, { x: 29, z: -4 }, { x: 29, z: 4 }, // market
  { x: -21, z: 0 }, { x: -29, z: 0 }, // old quarter
  { x: 0, z: -16 }, { x: 0, z: -26 }, // grove path
];

/** Where players appear: a ring around the plaza well. */
export function spawnPoint(index: number): { x: number; z: number; rot: number } {
  const n = 15;
  const a = (index % n) / n * Math.PI * 2;
  return { x: Math.cos(a) * 5, z: Math.sin(a) * 5, rot: Math.atan2(-Math.cos(a), -Math.sin(a)) };
}

/** Where the Town Crier stands at night: on the plaza, by the well, facing the bridge. */
export const CRIER_SPOT = { x: 0, z: 3.2, rot: Math.PI };

export const WELL: AABB = { minX: -1.2, maxX: 1.2, minZ: -1.2, maxZ: 1.2 };

/** River colliders: the band minus the bridge gaps. */
export function riverColliders(): AABB[] {
  const edges = [-WORLD_HALF - 5, ...BRIDGES.flatMap((br) => [br.x - br.width / 2, br.x + br.width / 2]).sort((a, c) => a - c), WORLD_HALF + 5];
  const out: AABB[] = [];
  for (let i = 0; i < edges.length; i += 2) out.push({ minX: edges[i], maxX: edges[i + 1], minZ: RIVER.z0, maxZ: RIVER.z1 });
  return out;
}

export function colliders(): AABB[] {
  const list: AABB[] = BUILDINGS.map((bb) => ({ minX: bb.x - bb.w / 2, maxX: bb.x + bb.w / 2, minZ: bb.z - bb.d / 2, maxZ: bb.z + bb.d / 2 }));
  list.push(WELL, ...riverColliders());
  for (const t of TREES) {
    const r = (t.kind === 'oak' ? 0.3 : 0.25) * t.s;
    list.push({ minX: t.x - r, maxX: t.x + r, minZ: t.z - r, maxZ: t.z + r });
  }
  return list;
}
