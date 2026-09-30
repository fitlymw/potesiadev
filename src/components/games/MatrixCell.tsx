/**
 * SVG rendering of one Matrix Reasoning cell (shared by the game and audits).
 *
 * Perceptual rules (checked by the geometry audit):
 *  - A size level means the same AREA for every shape, so a "large" triangle
 *    is never smaller than a "medium" hexagon.
 *  - Line features are drawn on the cell's edges, never across the shapes.
 *  - Shades are evenly spaced in lightness (CIE L* ≈ 100, 70, 40, 7).
 */
import type { Cell } from '@/lib/iq/matrix';

const FILLS = ['#ffffff', '#ababab', '#5e5e5e', '#141414'];
/** Shape area (in 100×100 viewBox units²) for size levels small, medium, large. */
const AREAS = [220, 400, 640];
const POSITIONS: [number, number][][] = [
  [[50, 50]],
  [[28, 50], [72, 50]],
  [[50, 28], [28, 72], [72, 72]],
  [[28, 28], [72, 28], [28, 72], [72, 72]],
];
/** Edge bars: bit 0 top, 1 right, 2 bottom, 3 left. */
const LINE_COORDS = [
  [12, 4, 88, 4],
  [96, 12, 96, 88],
  [12, 96, 88, 96],
  [4, 12, 4, 88],
];

/** Regular polygon with the given area, centred on its bounding box. */
function polygonPoints(sides: number, cx: number, cy: number, area: number) {
  // Triangle & pentagon point up; square & hexagon sit flat
  const offset = sides % 2 === 0 ? -90 + 180 / sides : -90;
  const unitArea = (sides / 2) * Math.sin((2 * Math.PI) / sides);
  const r = Math.sqrt(area / unitArea);
  const pts = Array.from({ length: sides }, (_, i) => {
    const a = ((offset + (360 / sides) * i) * Math.PI) / 180;
    return [r * Math.cos(a), r * Math.sin(a)];
  });
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const dx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const dy = (Math.min(...ys) + Math.max(...ys)) / 2;
  return pts.map(([x, y]) => `${(cx + x - dx).toFixed(2)},${(cy + y - dy).toFixed(2)}`).join(' ');
}

export function CellView({ cell }: { cell: Cell }) {
  const area = AREAS[cell.size];
  const fill = FILLS[cell.color];
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full block" aria-hidden>
      <rect x="0" y="0" width="100" height="100" fill="#efe9dc" />
      {LINE_COORDS.map(([x1, y1, x2, y2], bit) =>
        cell.lines & (1 << bit) ? (
          <line key={bit} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d9480f" strokeWidth={4} strokeLinecap="round" />
        ) : null
      )}
      {POSITIONS[cell.count].map(([cx, cy], i) =>
        cell.shape === 4 ? (
          <circle key={i} cx={cx} cy={cy} r={Math.sqrt(area / Math.PI).toFixed(2)} fill={fill} stroke="#141414" strokeWidth={2.2} />
        ) : (
          <polygon key={i} points={polygonPoints(cell.shape + 3, cx, cy, area)} fill={fill} stroke="#141414" strokeWidth={2.2} strokeLinejoin="round" />
        )
      )}
    </svg>
  );
}
