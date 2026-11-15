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

/** Kenney Fantasy Town tiles are 1 unit; scaled so a wall is 3 m tall and a doorway ~2.3 m. */
export const TILE = 3;
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
/** The well sits off to one side so the middle of the plaza stays clear for the night circle. */
export const WELL_AT = { x: -5.5, z: -5.5 };
export const WELL: AABB = { minX: WELL_AT.x - 1.2, maxX: WELL_AT.x + 1.2, minZ: WELL_AT.z - 1.2, maxZ: WELL_AT.z + 1.2 };
/** At night the Crier stands in the very middle of the plaza, with the town seated around it. */
export const CRIER_SPOT = { x: 0, z: 0, rot: Math.PI };

/**
 * Where each player sits when night falls: a ring around the Crier, everyone facing inwards,
 * wide enough that a full table of 15 still has elbow room.
 */
export function nightSeat(index: number, total: number): { x: number; z: number; rot: number } {
  const n = Math.max(1, total);
  const radius = Math.max(3.6, n * 0.42);
  const a = (index / n) * Math.PI * 2;
  const x = Math.cos(a) * radius;
  const z = Math.sin(a) * radius;
  return { x, z, rot: Math.atan2(-x, -z) }; // look towards the middle
}

/** A step this high is walked up; while jumping the limit is JUMP_STEP. */
export const STEP_MAX = 0.55;
export const JUMP_STEP = 1.3;
export const WALL_THICK = 0.3;

// ---------------------------------------------------------------- houses

/** /** KayKit Furniture Bits are chunky (a bed is 1.6 x 3 units); drawn at this scale. */
export const FURNITURE_SCALE = 0.6;

/**
 * Rooms are big enough for a whole group, so furniture hugs the walls and leaves the middle
 * clear — that is where players stand to talk. Colliders are in metres at FURNITURE_SCALE.
 */
function furnishings(w: number, d: number): Furniture[] {
  const hw = (w * TILE) / 2, hd = (d * TILE) / 2;
  const out: Furniture[] = [
    { name: 'bed_single_A', dx: -hw + 0.9, dz: -hd + 1.3, rot: 0, hw: 0.5, hd: 0.9 },
    { name: 'cabinet_medium', dx: hw - 0.5, dz: -hd + 1.2, rot: -Math.PI / 2, hw: 0.6, hd: 0.3 },
    { name: 'table_medium', dx: hw - 1.6, dz: hd - 1.6, rot: 0, hw: 0.6, hd: 0.6 },
    { name: 'chair_A', dx: hw - 1.6, dz: hd - 0.6, rot: Math.PI, hw: 0.23, hd: 0.23 },
    { name: 'chair_A', dx: hw - 2.6, dz: hd - 1.6, rot: -Math.PI / 2, hw: 0.23, hd: 0.23 },
    { name: 'shelf_B_large', dx: -hw + 0.35, dz: hd - 2.0, rot: Math.PI / 2, hw: 0.6, hd: 0.3 },
  ];
  if (w >= 5 || d >= 5) {
    out.push({ name: 'bed_single_A', dx: -hw + 0.9, dz: -hd + 3.4, rot: 0, hw: 0.5, hd: 0.9 });
    out.push({ name: 'table_medium', dx: -hw + 2.4, dz: hd - 1.6, rot: 0, hw: 0.6, hd: 0.6 });
  }
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
  // Market (north-east): the tavern closes off the east street, two shops behind it
  h(28, -4, 5, 4, 2, 'market', 'gable', 'W'),
  h(16, -19, 4, 4, 1, 'market'),
  h(33, -20, 4, 4, 1, 'market', 'point'),
  // Old Quarter (north-west): a long hall and two stone houses
  h(-28, -4, 5, 4, 2, 'oldQuarter', 'gable', 'E'),
  h(-16, -19, 4, 4, 1, 'oldQuarter'),
  h(-33, -20, 4, 4, 1, 'oldQuarter', 'point'),
  // Grove (north): wooden cottages among the giant oaks
  h(0, -32, 4, 4, 1, 'grove', 'point'),
  h(-14, -34, 4, 3, 1, 'grove'),
  h(14, -34, 4, 3, 1, 'grove'),
  // Lantern Row (south of the river): three big halls facing the bridge, one behind
  h(-16, 24, 4, 4, 2, 'lanternRow'),
  h(0, 24, 4, 4, 2, 'lanternRow'),
  h(16, 24, 4, 4, 2, 'lanternRow'),
  h(0, 37, 4, 3, 1, 'lanternRow', 'point', 'E'), // tucked behind the row, entered from the side lane
];

export function houseBounds(hs: House): AABB {
  const hw = (hs.w * TILE) / 2, hd = (hs.d * TILE) / 2;
  return { minX: hs.x - hw, maxX: hs.x + hw, minZ: hs.z - hd, maxZ: hs.z + hd };
}

/** Walls as thin boxes with a one-tile gap where the doorway is. */
export function houseWalls(hs: House): AABB[] {
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
  return out;
}

/** The walls plus the furniture standing in the room. */
export function houseColliders(hs: House): AABB[] {
  const out = houseWalls(hs);
  for (const f of hs.furniture) {
    const swap = Math.abs(Math.sin(f.rot)) > 0.5;
    const hw = swap ? f.hd : f.hw, hd = swap ? f.hw : f.hd;
    out.push({ minX: hs.x + f.dx - hw, maxX: hs.x + f.dx + hw, minZ: hs.z + f.dz - hd, maxZ: hs.z + f.dz + hd });
  }
  return out;
}

/**
 * Only the house walls: tall enough to hide a player, so they are what the camera must stay on
 * this side of. Furniture and bushes are below the camera and are ignored on purpose.
 */
export function wallColliders(): AABB[] {
  return HOUSES.flatMap(houseWalls);
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

/** Watchtower hill (far north-west, 2 m) with a ramp on its east side; lookout rock (south-east, 1 m) with steps. */
export const PLATFORMS: Platform[] = [
  { minX: -40, maxX: -32, minZ: -40, maxZ: -32, h: 2 },
  { minX: 31, maxX: 37, minZ: 20, maxZ: 26, h: 1 },
];
export const RAMPS: Ramp[] = [
  { minX: -32, maxX: -28, minZ: -38, maxZ: -34, h0: 2, h1: 0, axis: 'x' }, // down towards +x
  { minX: 27, maxX: 31, minZ: 22, maxZ: 25, h0: 0, h1: 1, axis: 'x' }, // up towards +x
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
  { x: -3.2, z: 9.6 }, { x: 3.2, z: 9.6 }, { x: -3.2, z: 14.6 }, { x: 3.2, z: 14.6 }, // main bridge ends
  { x: -9, z: 17 }, { x: 9, z: 17 }, { x: 0, z: 17 }, // the row's street
  { x: 14, z: 0 }, { x: 19, z: -6 }, // market street
  { x: -14, z: 0 }, { x: -19, z: -6 }, // old quarter street
  { x: 0, z: -14 }, { x: 0, z: -24 }, // grove path
  { x: -26, z: -32 }, { x: 24, z: 20 }, // foot of each climb
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
