import { PLAYER_RADIUS, WALK_SPEED } from './constants';
import { WORLD_HALF, type AABB } from './town';

export interface Vec2 { x: number; z: number }

/**
 * Move a circle through axis-aligned boxes with sliding. The same function runs on the
 * server (authoritative) and on the client (prediction), so both agree on where a player ends up.
 * `dir` is the normalised input direction; a zero vector means standing still.
 */
export function step(pos: Vec2, dir: Vec2, dt: number, boxes: AABB[]): Vec2 {
  const len = Math.hypot(dir.x, dir.z);
  if (len < 0.01) return pos;
  const nx = (dir.x / len) * WALK_SPEED * dt;
  const nz = (dir.z / len) * WALK_SPEED * dt;
  let x = pos.x + nx;
  let z = pos.z;
  if (hits(x, z, boxes)) x = pos.x;
  z = pos.z + nz;
  if (hits(x, z, boxes)) z = pos.z;
  const lim = WORLD_HALF - PLAYER_RADIUS;
  return { x: Math.max(-lim, Math.min(lim, x)), z: Math.max(-lim, Math.min(lim, z)) };
}

function hits(x: number, z: number, boxes: AABB[]): boolean {
  for (const b of boxes) {
    const cx = Math.max(b.minX, Math.min(x, b.maxX));
    const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
    const dx = x - cx;
    const dz = z - cz;
    if (dx * dx + dz * dz < PLAYER_RADIUS * PLAYER_RADIUS) return true;
  }
  return false;
}

export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}
