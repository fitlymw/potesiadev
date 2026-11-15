/** Mutable per-character animation inputs; the scene updates them, the character reads them every frame. */
export interface AnimState {
  moving: boolean;
  /** performance.now() when the jump started (−∞ = none) */
  jumpStart: number;
  emote: number;
  emoteStart: number;
  /** performance.now() until which this character is making a sound, so the mouth moves. */
  speakingUntil: number;
}
export const newAnim = (): AnimState => ({ moving: false, jumpStart: -1e9, emote: -1, emoteStart: -1e9, speakingUntil: 0 });

export function lerpAngle(a: number, b: number, k: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
}
