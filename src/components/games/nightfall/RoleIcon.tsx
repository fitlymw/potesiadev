/**
 * Emblems for the Nightfall Deception roles. Each role has its own symbol,
 * framed in its team colour (gold = Luminary, violet = Cursed,
 * crimson = Shadow, black-red = Nightbringer).
 */
import type { ReactNode } from 'react';
import { ROLES, type RoleId } from '@/data/nightfallRoles';
import { PALETTE } from '@/components/games/nightfall/palette';

const stroke = { fill: 'none', strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** Symbols drawn in a 64×64 box; `c` is the ink colour. */
const SYMBOLS: Record<RoleId, (c: string) => ReactNode> = {
  aura: (c) => (
    <>
      <path d="M12 34 Q32 16 52 34 Q32 52 12 34Z" stroke={c} {...stroke} />
      <circle cx="32" cy="34" r="6" fill={c} />
      <path d="M32 10 V15 M20 13 L22.5 17.5 M44 13 L41.5 17.5" stroke={c} {...stroke} />
    </>
  ),
  aegis: (c) => (
    <>
      <path d="M32 13 L47 19 V31 Q47 44 32 51 Q17 44 17 31 V19Z" stroke={c} {...stroke} />
      <path d="M32 21 V43 M24 30 H40" stroke={c} {...stroke} />
    </>
  ),
  glyph: (c) => (
    <>
      <path d="M21 16 H43 Q46 16 46 19 V46 Q46 49 43 49 H21 Q18 49 18 46 V19 Q18 16 21 16Z" stroke={c} {...stroke} />
      <path d="M27 24 L36 32 L27 40 M37 24 V40" stroke={c} {...stroke} />
    </>
  ),
  rune: (c) => (
    <>
      <circle cx="32" cy="32" r="6" fill={c} />
      <path d="M11 32 L21 25 V39Z M53 32 L43 25 V39Z" fill={c} />
      <path d="M21 32 H25 M39 32 H43" stroke={c} {...stroke} />
    </>
  ),
  trace: (c) => (
    <>
      <ellipse cx="24" cy="41" rx="5" ry="7" fill={c} />
      <circle cx="21" cy="31" r="1.8" fill={c} /><circle cx="25" cy="30" r="1.8" fill={c} /><circle cx="28.5" cy="32" r="1.6" fill={c} />
      <ellipse cx="40" cy="27" rx="5" ry="7" fill={c} />
      <circle cx="37" cy="17" r="1.8" fill={c} /><circle cx="41" cy="16" r="1.8" fill={c} /><circle cx="44.5" cy="18" r="1.6" fill={c} />
    </>
  ),
  dirge: (c) => (
    <>
      <path d="M20 42 Q20 22 32 19 Q44 22 44 42 Z" stroke={c} {...stroke} />
      <path d="M17 42 H47 M32 14 V19" stroke={c} {...stroke} />
      <circle cx="32" cy="47" r="3" fill={c} />
    </>
  ),
  nova: (c) => (
    <>
      <circle cx="32" cy="32" r="13" stroke={c} {...stroke} />
      <path d="M32 11 V22 M32 42 V53 M11 32 H22 M42 32 H53" stroke={c} {...stroke} />
      <circle cx="32" cy="32" r="3.5" fill={c} />
    </>
  ),
  spark: (c) => <path d="M35 11 L20 35 H31 L27 53 L45 27 H34 L38 11Z" fill={c} />,
  gaze: (c) => (
    <>
      <circle cx="28" cy="28" r="11" stroke={c} {...stroke} />
      <path d="M36 36 L48 48" stroke={c} strokeWidth={5} strokeLinecap="round" />
      <circle cx="28" cy="28" r="3.5" fill={c} />
    </>
  ),
  echo: (c) => (
    <>
      <circle cx="20" cy="32" r="4" fill={c} />
      <path d="M28 22 Q34 32 28 42 M36 16 Q46 32 36 48 M44 11 Q57 32 44 53" stroke={c} {...stroke} />
    </>
  ),
  baiter: (c) => (
    <>
      <path d="M36 12 V38 Q36 49 27 49 Q18 49 18 40" stroke={c} {...stroke} />
      <path d="M18 40 L14 45 M18 40 L23 44" stroke={c} {...stroke} />
      <circle cx="36" cy="12" r="3" fill={c} />
    </>
  ),
  void: (c) => (
    <>
      <path d="M32 32 m0 -3 a3 3 0 1 1 -3 3 a6 6 0 0 1 6 -6 a9 9 0 0 1 9 9 a12 12 0 0 1 -12 12 a15 15 0 0 1 -15 -15 a18 18 0 0 1 18 -18" stroke={c} {...stroke} />
    </>
  ),
  mirage: (c) => (
    <>
      <path d="M27 13 H37 M28.5 13 V22 L19 40 Q17 49 26 49 H38 Q47 49 45 40 L35.5 22 V13" stroke={c} {...stroke} />
      <path d="M22 38 H42 L44.5 43 Q45 47 40 47 H24 Q19 47 19.5 43Z" fill={c} />
      <circle cx="30" cy="32" r="1.8" fill={c} /><circle cx="35" cy="28" r="1.4" fill={c} />
    </>
  ),
  snare: (c) => (
    <>
      <path d="M32 12 V52 M12 32 H52 M18 18 L46 46 M46 18 L18 46" stroke={c} strokeWidth={2} strokeLinecap="round" />
      <path d="M32 19 L41 23 L45 32 L41 41 L32 45 L23 41 L19 32 L23 23Z M32 26 L36 28 L38 32 L36 36 L32 38 L28 36 L26 32 L28 28Z" stroke={c} {...stroke} strokeWidth={2} />
    </>
  ),
  viper: (c) => (
    <>
      <path d="M14 48 Q22 40 30 44 Q40 49 42 38 Q44 28 34 28 Q24 28 26 20 Q28 13 38 14" stroke={c} {...stroke} strokeWidth={4} />
      <circle cx="41" cy="14" r="4.5" fill={c} />
      <path d="M44 17 L47 22 M40 18 L41 23" stroke={c} strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  abyss: (c) => (
    <>
      <path d="M32 12 Q48 12 48 28 Q48 36 42 39 V46 H22 V39 Q16 36 16 28 Q16 12 32 12Z" fill={c} />
      <circle cx="25.5" cy="28" r="4.5" fill="#0b0306" /><circle cx="38.5" cy="28" r="4.5" fill="#0b0306" />
      <path d="M32 33 L29.5 38 H34.5Z" fill="#0b0306" />
      <path d="M27 42 V46 M32 42 V46 M37 42 V46" stroke="#0b0306" strokeWidth={2} />
    </>
  ),
  fang: (c) => (
    <>
      <path d="M13 20 Q32 30 51 20 Q48 28 32 30 Q16 28 13 20Z" fill={c} />
      <path d="M22 27 L25.5 47 L30 29Z M42 27 L38.5 47 L34 29Z" fill={c} />
      <circle cx="25.5" cy="50" r="1.8" fill={c} /><circle cx="38.5" cy="50" r="1.8" fill={c} />
    </>
  ),
};

export function RoleIcon({ role, size = 48, className = '' }: { role: RoleId; size?: number; className?: string }) {
  const team = ROLES[role].team;
  const p = PALETTE[team];
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} role="img" aria-label={ROLES[role].name}>
      <circle cx="32" cy="32" r="30" fill={p.bg} stroke={p.ring} strokeWidth={3} />
      {team === 'nightbringer' && <circle cx="32" cy="32" r="26" fill="none" stroke={p.ring} strokeWidth={1} strokeDasharray="3 3" />}
      {SYMBOLS[role](p.ink)}
    </svg>
  );
}
