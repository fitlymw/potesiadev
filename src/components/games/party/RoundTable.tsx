/**
 * Shared round-table drawing for the pass-the-phone party games.
 */

import { PLAYER_COLORS } from '@/components/games/party/colors';

/**
 * Round table seen from above. Seat 1 is at the bottom (nearest to whoever
 * holds the phone); "to the left" of a seated player is clockwise from above.
 */
export function RoundTable({ players, startsLabel }: { players: string[]; startsLabel: string }) {
  const n = players.length;
  const c = 160;
  const angle = (k: number) => ((90 + (360 / n) * k) * Math.PI) / 180;
  const at = (k: number, r: number) => [c + r * Math.cos(angle(k)), c + r * Math.sin(angle(k))];
  const short = (name: string) => (name.length > 9 ? `${name.slice(0, 8)}…` : name);
  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-[320px] mx-auto block" role="img" aria-label={players.map((p, i) => `${i + 1}. ${p}`).join(', ')}>
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
        return (
          <g key={k}>
            <circle cx={sx} cy={sy} r={17} fill={PLAYER_COLORS[k]} stroke={k === 0 ? '#fff' : 'none'} strokeWidth={3} />
            <text x={sx} y={sy + 5} textAnchor="middle" fontSize="15" fontWeight="bold" fill="#0e0716">{k + 1}</text>
            <text x={lx} y={ly} textAnchor="middle" fontSize="12" fill="#f5f3ff">{short(name)}</text>
          </g>
        );
      })}
      <text x={c} y={c - 3} textAnchor="middle" fontSize="11" fill="#e9d5ff">1 → 2 → 3</text>
      <text x={c} y={c + 12} textAnchor="middle" fontSize="9" fill="#c4b5fd">★ {players[0] ? short(players[0]) : ''} {startsLabel}</text>
    </svg>
  );
}
