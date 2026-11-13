/** Where one copy of a kit piece goes (world metres, yaw in radians, per-axis scale). */
export interface Placement {
  x: number;
  y: number;
  z: number;
  rot: number;
  sx: number;
  sy: number;
  sz: number;
  /** House this piece belongs to, so it can be hidden while that house is entered. */
  owner?: number;
}

export const place = (x: number, y: number, z: number, rot: number, s: number, sy = s, sz = s): Placement => ({ x, y, z, rot, sx: s, sy, sz });

export const owned = (p: Placement, owner: number): Placement => ({ ...p, owner });
