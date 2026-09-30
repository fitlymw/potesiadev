import type { Team } from '@/data/nightfallRoles';

/** Team colours for Nightfall Deception (frames, badges, text accents). */
export const PALETTE: Record<Team, { ring: string; bg: string; ink: string }> = {
  luminary: { ring: '#f5c542', bg: '#2a2110', ink: '#fde9a8' },
  cursed: { ring: '#a78bfa', bg: '#1e1533', ink: '#e4dcff' },
  shadow: { ring: '#ef4444', bg: '#2a0e10', ink: '#fecaca' },
  nightbringer: { ring: '#dc2626', bg: '#0b0306', ink: '#f87171' },
};

export const TEAM_COLOR: Record<Team, string> = {
  luminary: PALETTE.luminary.ring,
  cursed: PALETTE.cursed.ring,
  shadow: PALETTE.shadow.ring,
  nightbringer: PALETTE.nightbringer.ring,
};

/** Tile outline: glowing white for whose turn it is, yellow while the player can still vote. */
export function seatTileClass(canVote: boolean, isTurn: boolean): string {
  const border = canVote ? 'border-2 border-yellow-400' : 'border-2 border-zinc-800';
  const glow = isTurn ? ' outline outline-2 outline-offset-2 outline-white shadow-[0_0_14px_3px_rgba(255,255,255,0.55)]' : '';
  return `flex items-center px-2 py-1.5 text-sm ${border}${glow}`;
}
