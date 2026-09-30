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
