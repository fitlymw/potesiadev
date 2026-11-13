/**
 * Elf Town layout, v3 — built from the Kenney Fantasy Town / Nature kits (CC0).
 * One source of truth: the server uses the colliders and ground heights, the client draws it.
 *
 * Coordinates: x east, z south, metres. The plaza (voting circle) is at the origin. A river
 * runs east–west south of the plaza; three bridges are the only ways across.
 *
 * Houses are real rooms: four walls on a 2.5 m tile grid with a doorway gap (no door leaf), a
 * plank floor and a few pieces of furniture. High ground is made of 1 m cliff blocks with ramps.
 */

export type District = 'plaza' | 'market' | 'grove' | 'lanternRow' | 'oldQuarter';
export type WallStyle = 'stone' | 'wood';
export type Side = 'N' | 'S' | 'E' | 'W';

/** Kenney Fantasy Town tiles are 1 unit; scaled so a wall is 2.5 m tall and a doorway ~1.9 m. */
export const TILE = 2.5;
/** Kenney Nature trees are tiny; scaled so an oak is ~4.7 m. */
export const TREE_SCALE = 4;

export interface House {
  x: number;
  z: number;
  /** footprint in tiles */
  w: number;
  d: number;
  floors: number;
  style: WallStyle;
  roof: 'gable' | 'point';
  /** which wall has the doorway (its centre tile) */
  door: Side;
  district: District;
  /** interior pieces: KayKit furniture name, position relative to the house centre, rotation (rad) */
  furniture: Furniture[];
}
export interface Furniture { name: string; dx: number; dz: number; rot: number; /** collider half-size */ hw: number; hd: number }

export interface Tree { x: number; z: number; s: number; kind: 'pine' | 'oak' }
export interface Lantern { x: number; z: number }
export interface AABB { minX: number; maxX: number; minZ: number; maxZ: number }
export interface Bridge { x: number; width: number }
/** Raised ground made of cliff blocks (h metres above the plain). */
export interface Platform extends AABB { h: number }
/** A slope: height goes from h0 at the `from` edge to h1 at the opposite edge, along `axis`. */
export interface Ramp extends AABB { h0: number; h1: number; axis: 'x' | 'z' }

export const WORLD_HALF = 42; // playable square is [-42, 42]
export const PLAZA_RADIUS = 9;
export const RIVER = { z0: 10.6, z1: 13.6 };
export const BRIDGES: Bridge[] = [{ x: 0, width: 4.6 }, { x: -15, width: 3.6 }, { x: 15, width: 3.6 }];
export const WELL: AABB = { minX: -1.2, maxX: 1.2, minZ: -1.2, maxZ: 1.2 };
/** Where the Town Crier stands at night: on the plaza, by the well, facing the bridge. */
export const CRIER_SPOT = { x: 0, z: 3.2, rot: Math.PI };

/** A step this high is walked up; while jumping the limit is JUMP_STEP. */
export const STEP_MAX = 0.55;
export const JUMP_STEP = 1.3;
export const WALL_THICK = 0.3;

// ---------------------------------------------------------------- houses

/** KayKit Furniture Bits are chunky (a bed is 1.6 × 3 units); drawn at this scale. */
export const FURNITURE_SCALE = 0.6;

/** Colliders are in metres at FURNITURE_SCALE: bed 1.0 × 1.8, cabinet 1.2 × 0.6, table 1.2 × 1.2, chair 0.45. */
function furnishings(w: number, d: number): Furniture[] {
  const hw = (w * TILE) / 2, hd = (d * TILE) / 2;
  const out: Furniture[] = [
    { name: 'bed_single_A', dx: -hw + 0.85, dz: -hd + 1.25, rot: 0, hw: 0.5, hd: 0.9 },
    { name: 'cabinet_medium', dx: hw - 0.5, dz: -hd + 1.0, rot: -Math.PI / 2, hw: 0.6, hd: 0.3 },
  ];
  if (w >= 3 || d >= 3) {
    out.push({ name: 'table_medium', dx: 0.4, dz: 0.3, rot: 0, hw: 0.6, hd: 0.6 });
    out.push({ name: 'chair_A', dx: 0.4, dz: 1.3, rot: Math.PI, hw: 0.23, hd: 0.23 });
    out.push({ name: 'chair_A', dx: 0.4, dz: -0.7, rot: 0, hw: 0.23, hd: 0.23 });
  }
  if (w >= 3 && d >= 3) out.push({ name: 'shelf_B_large', dx: -hw + 0.35, dz: hd - 1.6, rot: Math.PI / 2, hw: 0.6, hd: 0.3 });
  return out;
}

/** Door on the side that faces the town centre, so streets lead to doors. */
function doorToward(x: number, z: number): Side {
  return Math.abs(x) > Math.abs(z) ? (x > 0 ? 'W' : 'E') : z > 0 ? 'N' : 'S';
}

function h(x: number, z: number, w: number, d: number, floors: number, district: District, roof: 'gable' | 'point' = 'gable', door?: Side): House {
  const style: WallStyle = district === 'grove' || district === 'lanternRow' ? 'wood' : 'stone';
  return { x, z, w, d, floors, style, roof, door: door ?? doorToward(x, z), district, furniture: furnishings(w, d) };
}

export const HOUSES: House[] = [
  // Market (east): stalls and a two-storey tavern around a small square
  h(18, -5, 2, 2, 1, 'market'), h(18, 5, 2, 2, 1, 'market'), h(27, 0, 3, 4, 2, 'market', 'gable', 'W'),
  h(24, -11, 2, 2, 1, 'market', 'point'), h(24, 11, 2, 2, 1, 'market', 'point'), h(33, -8, 2, 2, 1, 'market', 'point'), h(33, 8, 2, 2, 1, 'market', 'point'),
  // Grove (north): wooden cottages among giant trees
  h(-7, -20, 2, 2, 1, 'grove', 'point'), h(7, -22, 2, 2, 1, 'grove'), h(0, -31, 3, 2, 2, 'grove', 'gable', 'N'),
  h(-15, -29, 2, 2, 1, 'grove', 'point'), h(15, -31, 2, 2, 1, 'grove', 'point'),
  // Lantern Row (south of the river): a straight street of tall narrow wooden houses
  h(-12, 21, 2, 2, 2, 'lanternRow'), h(-6, 21, 2, 2, 2, 'lanternRow'), h(0, 21, 2, 2, 2, 'lanternRow'),
  h(6, 21, 2, 2, 2, 'lanternRow'), h(12, 21, 2, 2, 2, 'lanternRow'),
  h(-9, 31, 2, 2, 1, 'lanternRow', 'point', 'N'), h(0, 32, 3, 2, 2, 'lanternRow', 'gable', 'N'), h(9, 31, 2, 2, 1, 'lanternRow', 'point', 'N'),
  // Old Quarter (west): a tight maze of small stone houses and the old tower
  h(-18, -6, 2, 2, 1, 'oldQuarter', 'point'), h(-18, 6, 2, 2, 1, 'oldQuarter', 'point'),
  h(-25, -12, 2, 2, 1, 'oldQuarter'), h(-25, 0, 2, 3, 2, 'oldQuarter', 'gable', 'E'), h(-25, 12, 2, 2, 1, 'oldQuarter'),
  h(-33, -6, 2, 2, 1, 'oldQuarter'), h(-33, 6, 2, 2, 1, 'oldQuarter'), h(-37, 0, 2, 2, 3, 'oldQuarter', 'point', 'E'), // the old tower
];

export function houseBounds(hs: House): AABB {
  const hw = (hs.w * TILE) / 2, hd = (hs.d * TILE) / 2;
  return { minX: hs.x - hw, maxX: hs.x + hw, minZ: hs.z - hd, maxZ: hs.z + hd };
}

/** Walls as thin boxes with a one-tile gap where the doorway is, plus the furniture. */
export function houseColliders(hs: House): AABB[] {
  const b = houseBounds(hs);
  const t = WALL_THICK;
  const out: AABB[] = [];
  const gap = (side: Side) => side === hs.door;
  // the doorway is the centre tile of its wall (for even widths: the tile just left/above the centre)
  const doorX0 = hs.x + (Math.floor(hs.w / 2) - hs.w / 2) * TILE; // start of the door tile along x
  const doorZ0 = hs.z + (Math.floor(hs.d / 2) - hs.d / 2) * TILE;
  const seg = (minX: number, maxX: number, minZ: number, maxZ: number) => out.push({ minX, maxX, minZ, maxZ });
  // north (−z) and south (+z) walls
  for (const [side, z0, z1] of [['N', b.minZ, b.minZ + t], ['S', b.maxZ - t, b.maxZ]] as const) {
    if (gap(side)) {
      seg(b.minX, doorX0, z0, z1);
      seg(doorX0 + TILE, b.maxX, z0, z1);
    } else seg(b.minX, b.maxX, z0, z1);
  }
  for (const [side, x0, x1] of [['W', b.minX, b.minX + t], ['E', b.maxX - t, b.maxX]] as const) {
    if (gap(side)) {
      seg(x0, x1, b.minZ, doorZ0);
      seg(x0, x1, doorZ0 + TILE, b.maxZ);
    } else seg(x0, x1, b.minZ, b.maxZ);
  }
  for (const f of hs.furniture) {
    const swap = Math.abs(Math.sin(f.rot)) > 0.5;
    const hw = swap ? f.hd : f.hw, hd = swap ? f.hw : f.hd;
    out.push({ minX: hs.x + f.dx - hw, maxX: hs.x + f.dx + hw, minZ: hs.z + f.dz - hd, maxZ: hs.z + f.dz + hd });
  }
  return out;
}

/** Index of the house whose footprint contains (x, z), or -1. */
export function houseAt(x: number, z: number): number {
  for (let i = 0; i < HOUSES.length; i++) {
    const b = houseBounds(HOUSES[i]);
    if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ) return i;
  }
  return -1;
}

// ---------------------------------------------------------------- high ground

/** Watchtower hill (NW, 2 m) with a ramp on its east side; Lookout rock (SE, 1 m) with steps north. */
export const PLATFORMS: Platform[] = [
  { minX: -34, maxX: -27, minZ: -35, maxZ: -28, h: 2 },
  { minX: 24, maxX: 30, minZ: 23, maxZ: 27, h: 1 },
];
export const RAMPS: Ramp[] = [
  { minX: -27, maxX: -24, minZ: -33, maxZ: -30, h0: 2, h1: 0, axis: 'x' }, // down towards +x
  { minX: 25, maxX: 29, minZ: 21.5, maxZ: 23, h0: 0, h1: 1, axis: 'z' }, // up towards +z (steps)
];

/** Height of the walkable ground at (x, z). */
export function groundHeight(x: number, z: number): number {
  let best = 0;
  for (const p of PLATFORMS) if (x >= p.minX && x <= p.maxX && z >= p.minZ && z <= p.maxZ) best = Math.max(best, p.h);
  for (const r of RAMPS) {
    if (x < r.minX || x > r.maxX || z < r.minZ || z > r.maxZ) continue;
    const t = r.axis === 'x' ? (x - r.minX) / (r.maxX - r.minX) : (z - r.minZ) / (r.maxZ - r.minZ);
    best = Math.max(best, r.h0 + (r.h1 - r.h0) * t);
  }
  return best;
}

// ---------------------------------------------------------------- nature

const GIANTS: Tree[] = [
  { x: -11, z: -13, s: 2.6, kind: 'oak' }, { x: 12, z: -15, s: 2.4, kind: 'oak' },
  { x: -22, z: -22, s: 2.8, kind: 'oak' }, { x: 31, z: -27, s: 2.6, kind: 'oak' },
  { x: -22, z: 26, s: 2.2, kind: 'oak' }, { x: 33, z: 31, s: 2.3, kind: 'oak' },
];

/** Deterministic tree scatter (no RNG needed at runtime; both sides get the same list). `s` multiplies TREE_SCALE. */
export const TREES: Tree[] = (() => {
  const out: Tree[] = [...GIANTS];
  let seed = 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const blocked = (x: number, z: number, pad: number) =>
    HOUSES.some((hs) => { const b = houseBounds(hs); return x > b.minX - pad && x < b.maxX + pad && z > b.minZ - pad && z < b.maxZ + pad; }) ||
    PLATFORMS.some((p) => x > p.minX - pad && x < p.maxX + pad && z > p.minZ - pad && z < p.maxZ + pad) ||
    RAMPS.some((p) => x > p.minX - pad && x < p.maxX + pad && z > p.minZ - pad && z < p.maxZ + pad);
  for (let i = 0; i < 190; i++) {
    const x = (rnd() * 2 - 1) * (WORLD_HALF - 2);
    const z = (rnd() * 2 - 1) * (WORLD_HALF - 2);
    const grove = z < -12;
    const s = grove ? 0.9 + rnd() * 0.8 : 0.7 + rnd() * 0.5;
    const kind: Tree['kind'] = rnd() < (grove ? 0.45 : 0.25) ? 'oak' : 'pine';
    if (Math.hypot(x, z) < PLAZA_RADIUS + 3) continue;
    if (z > RIVER.z0 - 2 && z < RIVER.z1 + 2) continue;
    if (Math.abs(x) < 3 || Math.abs(z) < 3) continue; // the two main streets
    if (z > 16 && z < 24) continue; // Lantern Row street
    if (blocked(x, z, 2.5)) continue;
    if (out.some((t) => Math.hypot(t.x - x, t.z - z) < (t.s + s) * 1.6)) continue;
    if (!grove && rnd() < 0.5) continue;
    out.push({ x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10, s: Math.round(s * 100) / 100, kind });
  }
  return out;
})();

export const LANTERNS: Lantern[] = [
  { x: 6, z: 6 }, { x: -6, z: 6 }, { x: 6, z: -6 }, { x: -6, z: -6 }, // plaza corners
  { x: -2.8, z: 9.8 }, { x: 2.8, z: 9.8 }, { x: -2.8, z: 14.4 }, { x: 2.8, z: 14.4 }, // main bridge ends
  { x: -9, z: 16.5 }, { x: 9, z: 16.5 }, // Lantern Row
  { x: 21, z: 0 }, { x: 30, z: -4.5 }, { x: 30, z: 4.5 }, // market
  { x: -21, z: 0 }, { x: -29, z: -3 }, // old quarter
  { x: 0, z: -16 }, { x: 0, z: -26 }, // grove path
];

/** Where players appear: a ring around the plaza well. */
export function spawnPoint(index: number): { x: number; z: number; rot: number } {
  const n = 15;
  const a = (index % n) / n * Math.PI * 2;
  return { x: Math.cos(a) * 5, z: Math.sin(a) * 5, rot: Math.atan2(-Math.cos(a), -Math.sin(a)) };
}

/** River colliders: the band minus the bridge gaps. */
export function riverColliders(): AABB[] {
  const edges = [-WORLD_HALF - 5, ...BRIDGES.flatMap((br) => [br.x - br.width / 2, br.x + br.width / 2]).sort((a, c) => a - c), WORLD_HALF + 5];
  const out: AABB[] = [];
  for (let i = 0; i < edges.length; i += 2) out.push({ minX: edges[i], maxX: edges[i + 1], minZ: RIVER.z0, maxZ: RIVER.z1 });
  return out;
}

export function colliders(): AABB[] {
  const list: AABB[] = [WELL, ...riverColliders()];
  for (const hs of HOUSES) list.push(...houseColliders(hs));
  for (const t of TREES) {
    const r = 0.3 * t.s;
    list.push({ minX: t.x - r, maxX: t.x + r, minZ: t.z - r, maxZ: t.z + r });
  }
  return list;
}
