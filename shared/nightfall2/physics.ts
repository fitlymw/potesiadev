import { PLAYER_RADIUS, WALK_SPEED } from './constants';
import { JUMP_STEP, STEP_MAX, WORLD_HALF, groundHeight, type AABB } from './town';

export interface Vec2 { x: number; z: number }
export interface Vec3 extends Vec2 { y: number }

/**
 * Move a circle through axis-aligned boxes with sliding, then settle it on the ground.
 * The same function runs on the server (authoritative) and on the client (prediction), so
 * both agree on where a player ends up. `dir` is the normalised input direction; a zero
 * vector means standing still. A rise steeper than STEP_MAX blocks like a wall unless the
 * player is mid-jump (then up to JUMP_STEP); dropping down is always allowed.
 */
export function step(pos: Vec3, dir: Vec2, dt: number, boxes: AABB[], jumping = false): Vec3 {
  const len = Math.hypot(dir.x, dir.z);
  if (len < 0.01) return pos;
  const nx = (dir.x / len) * WALK_SPEED * dt;
  const nz = (dir.z / len) * WALK_SPEED * dt;
  const lim = WORLD_HALF - PLAYER_RADIUS;
  const climb = jumping ? JUMP_STEP : STEP_MAX;
  let x = Math.max(-lim, Math.min(lim, pos.x + nx));
  let z = pos.z;
  if (hits(x, z, boxes) || groundHeight(x, z) - pos.y > climb) x = pos.x;
  z = Math.max(-lim, Math.min(lim, pos.z + nz));
  if (hits(x, z, boxes) || groundHeight(x, z) - pos.y > climb) z = pos.z;
  return { x, z, y: groundHeight(x, z) };
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

/**
 * How far a ray from (ox, oz) travels before it meets a box, capped at `maxDist`.
 * Used for the camera: it stops short of a wall instead of ending up behind it.
 */
export function rayDistance(ox: number, oz: number, dx: number, dz: number, maxDist: number, boxes: AABB[]): number {
  let best = maxDist;
  for (const b of boxes) {
    let tmin = 0;
    let tmax = best;
    if (Math.abs(dx) < 1e-6) {
      if (ox < b.minX || ox > b.maxX) continue;
    } else {
      let t1 = (b.minX - ox) / dx;
      let t2 = (b.maxX - ox) / dx;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
    }
    if (Math.abs(dz) < 1e-6) {
      if (oz < b.minZ || oz > b.maxZ) continue;
    } else {
      let t1 = (b.minZ - oz) / dz;
      let t2 = (b.maxZ - oz) / dz;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
    }
    if (tmax >= tmin && tmin < best) best = Math.max(0, tmin);
  }
  return best;
}

/** 3D distance: standing on the hill counts as being further away. */
export function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a.x - b.x, a.z - b.z, a.y - b.y);
}
