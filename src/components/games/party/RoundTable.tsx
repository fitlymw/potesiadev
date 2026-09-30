/**
 * Shared round-table drawing for the pass-the-phone party games.
 */

import { PLAYER_COLORS } from '@/components/games/party/colors';

export interface RoundTableProps {
  /** Names in seat order (seat 1 first). */
  players: string[];
  startsLabel: string;
  /** Seat colours (defaults to the player palette by seat). */
  colors?: string[];
  /** Hide names and show seat numbers only (e.g. for the crown holder's seat picker). */
  hideNames?: boolean;
  /** Seats drawn greyed out (dead players). */
  dim?: boolean[];
  /** Seats with a highlight ring (moved or selected). */
  ring?: (string | null)[];
  /** Two lines in the middle of the table (replaces the default legend). */
  center?: [string, string];
  /** Makes seats tappable. */
  onSeat?: (seat: number) => void;
  disabledSeats?: boolean[];
}

/**
 * Round table seen from above. Seat 1 is at the bottom (nearest to whoever
 * holds the phone); "to the left" of a seated player is clockwise from above.
 */
export function RoundTable({ players, startsLabel, colors, hideNames, dim, ring, center, onSeat, disabledSeats }: RoundTableProps) {
  const n = players.length;
  const c = 160;
  const angle = (k: number) => ((90 + (360 / n) * k) * Math.PI) / 180;
  const at = (k: number, r: number) => [c + r * Math.cos(angle(k)), c + r * Math.sin(angle(k))];
  const short = (name: string) => (name.length > 9 ? `${name.slice(0, 8)}…` : name);
  const label = hideNames ? players.map((_, i) => `${i + 1}`).join(', ') : players.map((p, i) => `${i + 1}. ${p}`).join(', ');
  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-[320px] mx-auto block" role="img" aria-label={label}>
      <circle cx={c} cy={c} r={56} fill="#2a1438" stroke="#7c3aed" strokeWidth={2} />
      <circle cx={c} cy={c} r={80} fill="none" stroke="#4c1d95" strokeWidth={1} strokeDasharray="3 5" />
      {players.map((_, k) => {
        // Arrow half-way to the next seat, pointing clockwise (= to the left)
        const mid = angle(k + 0.5);
        const [x, y] = [c + 80 * Math.cos(mid), c + 80 * Math.sin(mid)];
        const deg = (mid * 180) / Math.PI + 90;
        return <polygon key={`a${k}`} points="-5,-4 5,0 -5,4" fill="#e879f9" transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)})`} />;
      })}
      {players.map((name, k) => {
        const [sx, sy] = at(k, 104);
        // Names sit above seats in the top half and below the others, always
        // centred on the seat so they never run off the sides of the drawing
        const above = Math.sin(angle(k)) < -0.3;
        const [lx, ly] = [sx, above ? sy - 24 : sy + 31];
        const fill = dim?.[k] ? '#52525b' : colors?.[k] ?? PLAYER_COLORS[k];
        const disabled = disabledSeats?.[k] ?? false;
        const seat = (
          <>
            {ring?.[k] && <circle cx={sx} cy={sy} r={22} fill="none" stroke={ring[k]!} strokeWidth={3} />}
            <circle cx={sx} cy={sy} r={17} fill={fill} opacity={disabled ? 0.35 : 1} stroke={k === 0 && !onSeat ? '#fff' : 'none'} strokeWidth={3} />
            <text x={sx} y={sy + 5} textAnchor="middle" fontSize="15" fontWeight="bold" fill="#0e0716">{k + 1}</text>
            {!hideNames && <text x={lx} y={ly} textAnchor="middle" fontSize="12" fill={dim?.[k] ? '#a1a1aa' : '#f5f3ff'} textDecoration={dim?.[k] ? 'line-through' : undefined}>{short(name)}</text>}
          </>
        );
        return onSeat ? (
          <g key={k} role="button" aria-label={`${k + 1}`} aria-disabled={disabled} tabIndex={disabled ? -1 : 0} className={disabled ? '' : 'cursor-pointer'} onClick={() => !disabled && onSeat(k)} onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) onSeat(k); }}>
            <circle cx={sx} cy={sy} r={24} fill="transparent" />
            {seat}
          </g>
        ) : (
          <g key={k}>{seat}</g>
        );
      })}
      <text x={c} y={c - 3} textAnchor="middle" fontSize="11" fill="#e9d5ff">{center ? center[0] : '1 → 2 → 3'}</text>
      <text x={c} y={c + 12} textAnchor="middle" fontSize="9" fill="#c4b5fd">{center ? center[1] : `★ ${players[0] ? short(players[0]) : ''} ${startsLabel}`}</text>
    </svg>
  );
}
