/**
 * Procedural matrix-reasoning items (Raven-style), pure functions, no React.
 *
 * Each cell has four scalar attributes (shape, count, size, color) and a
 * "lines" feature (bitmask of 4 orange bars on the cell edges). Row rules follow the
 * taxonomy of Carpenter, Just & Shell (1990): constant (whole matrix or per
 * row), progression, distribution-of-three, and addition / XOR for the line
 * overlay.
 *
 * Quality safeguards:
 *  - Every item is checked by an independent solver that reads rows AND
 *    columns; items with more than one defensible answer are discarded.
 *  - The 8 answer options follow the I-RAVEN "attribute bisection" design
 *    (Hu et al., 2021): 3 attributes each take the correct or one wrong value,
 *    giving 2^3 = 8 options in which every value appears in exactly half of the
 *    options, so the answer cannot be found by comparing options alone.
 */

export type Attr = 'shape' | 'count' | 'size' | 'color';
export const ATTRS: Attr[] = ['shape', 'count', 'size', 'color'];

/**
 * shape: 0-3 = triangle, square, pentagon, hexagon (3-6 sides), 4 = circle
 * count: 0-3 = 1-4 shapes · size: 0-2 = small, medium, large
 * color: 0-3 = white, light gray, dark gray, black
 */
export const DOMAIN_SIZE: Record<Attr, number> = { shape: 5, count: 4, size: 3, color: 4 };
/** Values that form a meaningful ordered sequence (circle has no side count). */
const ORDERED_SIZE: Record<Attr, number> = { shape: 4, count: 4, size: 3, color: 4 };

export const LINE_BITS = 4;
const ALL_LINES = (1 << LINE_BITS) - 1;

export interface Cell {
  shape: number;
  count: number;
  size: number;
  color: number;
  /** Orange edge bars: bit 0 top, 1 right, 2 bottom, 3 left */
  lines: number;
}

export type AttrRule =
  | { kind: 'constant' }
  /** Same value across each row, a different value per row (background variety). */
  | { kind: 'rowConstant' }
  | { kind: 'progression'; step: 1 | -1 }
  | { kind: 'distribution' };
export type LinesRule = 'none' | 'constant' | 'add' | 'xor';

export interface MatrixItem {
  seed: number;
  level: number;
  rules: { attrs: Record<Attr, AttrRule>; lines: LinesRule };
  /** 9 cells row-major; grid[8] is the missing (correct) cell. */
  grid: Cell[];
  options: Cell[];
  answerIndex: number;
}

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 5;
export const OPTION_COUNT = 8;

// ==================== RNG ====================
/** mulberry32: small seeded PRNG so every item is reproducible from its seed. */
export function createRng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (n: number) => Math.floor(next() * n);
  const pick = <T,>(arr: readonly T[]) => arr[int(arr.length)];
  const shuffle = <T,>(arr: readonly T[]) => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = int(i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  return { next, int, pick, shuffle };
}
type Rng = ReturnType<typeof createRng>;

// ==================== LEVEL TEMPLATES ====================
type VaryingKind = 'progression' | 'distribution';
const TEMPLATES: Record<number, { attrs: VaryingKind[]; lines: LinesRule }[]> = {
  1: [{ attrs: ['progression'], lines: 'none' }],
  2: [
    { attrs: ['distribution'], lines: 'none' },
    { attrs: ['progression', 'progression'], lines: 'none' },
  ],
  3: [
    { attrs: ['progression', 'distribution'], lines: 'none' },
    { attrs: ['distribution', 'distribution'], lines: 'none' },
  ],
  4: [
    { attrs: ['progression', 'distribution', 'distribution'], lines: 'none' },
    { attrs: ['distribution', 'distribution'], lines: 'add' },
  ],
  5: [
    { attrs: ['progression', 'distribution', 'distribution'], lines: 'xor' },
    { attrs: ['distribution', 'distribution', 'distribution'], lines: 'add' },
  ],
};

// ==================== GENERATION ====================
function attrValues(rng: Rng, attr: Attr, rule: AttrRule): number[] {
  const values: number[] = [];
  if (rule.kind === 'constant') {
    const v = rng.int(DOMAIN_SIZE[attr]);
    return Array(9).fill(v);
  }
  if (rule.kind === 'rowConstant') {
    const vals = rng.shuffle(Array.from({ length: DOMAIN_SIZE[attr] }, (_, i) => i)).slice(0, 3);
    return vals.flatMap((v) => [v, v, v]);
  }
  if (rule.kind === 'progression') {
    const ordered = ORDERED_SIZE[attr];
    for (let r = 0; r < 3; r++) {
      // base keeps base + 2*step inside the ordered range
      const base = rule.step === 1 ? rng.int(ordered - 2) : 2 + rng.int(ordered - 2);
      for (let c = 0; c < 3; c++) values.push(base + c * rule.step);
    }
    return values;
  }
  // distribution-of-three as a Latin square: every row and column holds all three values
  const vals = rng.shuffle(Array.from({ length: DOMAIN_SIZE[attr] }, (_, i) => i)).slice(0, 3);
  const k = rng.pick([1, 2]);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) values.push(vals[(c + r * k) % 3]);
  return values;
}

function nonEmptyMask(rng: Rng) {
  return 1 + rng.int(ALL_LINES);
}

function lineValues(rng: Rng, rule: LinesRule): number[] {
  if (rule === 'none') return Array(9).fill(0);
  if (rule === 'constant') return Array(9).fill(nonEmptyMask(rng));
  const values: number[] = [];
  for (let r = 0; r < 3; r++) {
    let a = 0;
    let b = 0;
    if (rule === 'add') {
      // disjoint parts that are combined in the third column
      do { a = nonEmptyMask(rng); b = nonEmptyMask(rng); } while ((a & b) !== 0);
      values.push(a, b, a | b);
    } else {
      do { a = nonEmptyMask(rng); b = nonEmptyMask(rng); } while (a === b);
      values.push(a, b, a ^ b);
    }
  }
  return values;
}

function buildGrid(rng: Rng, level: number) {
  const template = rng.pick(TEMPLATES[level]);
  const varying = rng.shuffle(ATTRS).slice(0, template.attrs.length);
  const attrs = {} as Record<Attr, AttrRule>;
  for (const attr of ATTRS) {
    const i = varying.indexOf(attr);
    // Non-rule attributes are constant either across the whole matrix or per
    // row, so that lures on them are not simply "a value never seen before".
    if (i < 0) attrs[attr] = rng.next() < 0.5 ? { kind: 'rowConstant' } : { kind: 'constant' };
    else if (template.attrs[i] === 'progression') attrs[attr] = { kind: 'progression', step: rng.pick([1, -1] as const) };
    else attrs[attr] = { kind: 'distribution' };
  }
  const columns = Object.fromEntries(ATTRS.map((attr) => [attr, attrValues(rng, attr, attrs[attr])])) as Record<Attr, number[]>;
  const lines = lineValues(rng, template.lines);
  const grid: Cell[] = Array.from({ length: 9 }, (_, i) => ({
    shape: columns.shape[i],
    count: columns.count[i],
    size: columns.size[i],
    color: columns.color[i],
    lines: lines[i],
  }));
  return { rules: { attrs, lines: template.lines }, grid, varying };
}

type Slot = Attr | 'lines';

/**
 * Choose among candidates so that the expected frequency in the visible cells
 * equals `target`. Returns null when that is impossible (all on one side).
 */
function balancedPick(rng: Rng, candidates: number[], freq: (v: number) => number, target: number): number | null {
  const equal = candidates.filter((v) => freq(v) === target);
  if (equal.length > 0) return rng.pick(equal);
  const above = candidates.filter((v) => freq(v) > target);
  const below = candidates.filter((v) => freq(v) < target);
  if (above.length === 0 || below.length === 0) return null;
  const fAbove = Math.min(...above.map(freq));
  const fBelow = Math.max(...below.map(freq));
  const pAbove = (target - fBelow) / (fAbove - fBelow);
  return rng.next() < pAbove ? rng.pick(above.filter((v) => freq(v) === fAbove)) : rng.pick(below.filter((v) => freq(v) === fBelow));
}

/**
 * Pick a wrong value for one attribute whose "surface signature" resembles the
 * correct value's, so that superficial strategies do not beat chance:
 *  - how often the value appears in the 8 visible cells ("looks like the grid"),
 *  - whether it copies one of the two cells in the last row ("the answer never
 *    repeats its row-mates").
 * Under a distribution-of-three rule no single lure can match both (the answer
 * is seen twice and copies nothing; the other row values are seen three times
 * and are copies), so the two lure types are mixed to split the bias.
 */
function alternativeValue(rng: Rng, slot: Slot, grid: Cell[]): number {
  const visible = grid.slice(0, 8);
  const correct = grid[8][slot];
  const freq = (v: number) => visible.filter((cell) => cell[slot] === v).length;
  const rowCopies = (v: number) => [grid[6], grid[7]].filter((cell) => cell[slot] === v).length;

  let candidates: number[];
  if (slot === 'lines') {
    const flips = Array.from({ length: LINE_BITS }, (_, bit) => correct ^ (1 << bit));
    // The union of the last row's two cells is the classic lure for XOR items
    candidates = [...new Set([...flips, grid[6].lines | grid[7].lines])].filter((v) => v !== correct && v !== 0);
  } else {
    candidates = Array.from({ length: DOMAIN_SIZE[slot] }, (_, v) => v).filter((v) => v !== correct);
  }

  const target = freq(correct);
  const sameCopies = candidates.filter((v) => rowCopies(v) === rowCopies(correct));
  const exact = balancedPick(rng, sameCopies, freq, target);
  if (exact !== null) return exact;
  // Cannot match both features: alternate between the two kinds of imperfect lure
  const pool = sameCopies.length > 0 && rng.next() < 0.5 ? sameCopies : candidates;
  return balancedPick(rng, pool, freq, target) ?? rng.pick(pool);
}

function buildOptions(rng: Rng, grid: Cell[], rules: MatrixItem['rules'], varying: Attr[]) {
  const rowConstant = ATTRS.filter((attr) => rules.attrs[attr].kind === 'rowConstant');
  const constant = ATTRS.filter((attr) => rules.attrs[attr].kind === 'constant');
  const progression = varying.filter((attr) => rules.attrs[attr].kind === 'progression');
  const distribution = varying.filter((attr) => rules.attrs[attr].kind === 'distribution');
  // Attributes whose lures can be balanced best go first (see alternativeValue)
  const ordered: Slot[] = [
    ...rng.shuffle([...progression, ...(rules.lines !== 'none' ? (['lines'] as Slot[]) : [])]),
    ...rng.shuffle(distribution),
    ...rng.shuffle(rowConstant),
    ...rng.shuffle(constant),
  ];
  const slots = ordered.slice(0, 3);
  const alternatives = slots.map((slot) => alternativeValue(rng, slot, grid));
  const correct = grid[8];
  const combos: Cell[] = [];
  for (let mask = 0; mask < OPTION_COUNT; mask++) {
    const cell = { ...correct };
    slots.forEach((slot, i) => {
      if (mask & (1 << i)) cell[slot] = alternatives[i];
    });
    combos.push(cell);
  }
  const order = rng.shuffle(combos.map((_, i) => i));
  return { options: order.map((i) => combos[i]), answerIndex: order.indexOf(0) };
}

/**
 * Generate an item for a difficulty level (1–5). Deterministic for a given
 * seed; candidates that the solver finds ambiguous are skipped.
 */
export function generateItem(level: number, seed: number): MatrixItem {
  const lvl = Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.round(level)));
  const rng = createRng(seed);
  for (let attempt = 0; attempt < 500; attempt++) {
    const { rules, grid, varying } = buildGrid(rng, lvl);
    if (!isUnambiguous(grid)) continue;
    const { options, answerIndex } = buildOptions(rng, grid, rules, varying);
    return { seed, level: lvl, rules, grid, options, answerIndex };
  }
  throw new Error(`Could not generate an unambiguous level ${lvl} item for seed ${seed}`);
}

// ==================== INDEPENDENT SOLVER ====================
const ROWS = { full: [[0, 1, 2], [3, 4, 5]], partial: [6, 7] };
const COLS = { full: [[0, 3, 6], [1, 4, 7]], partial: [2, 5] };

function scalarPredictions(values: number[], domain: number): Set<number> {
  const out = new Set<number>();
  for (const { full, partial } of [ROWS, COLS]) {
    const lines = full.map((idx) => idx.map((i) => values[i]));
    const [p0, p1] = partial.map((i) => values[i]);
    // Each line constant (possibly a different value per line)
    if (lines.every((l) => l[0] === l[1] && l[1] === l[2]) && p0 === p1) out.add(p0);
    // Same arithmetic step in every line
    const step = lines[0][1] - lines[0][0];
    if (step !== 0 && lines.every((l) => l[1] - l[0] === step && l[2] - l[1] === step) && p1 - p0 === step) {
      const v = p1 + step;
      if (v >= 0 && v < domain) out.add(v);
    }
    // Same set of three distinct values in every line
    const set = new Set(lines[0]);
    if (set.size === 3 && lines.every((l) => new Set(l).size === 3 && l.every((v) => set.has(v))) && p0 !== p1 && set.has(p0) && set.has(p1)) {
      out.add([...set].find((v) => v !== p0 && v !== p1)!);
    }
  }
  return out;
}

function linePredictions(values: number[]): Set<number> {
  const out = new Set<number>();
  const ops: ((a: number, b: number) => number)[] = [(a, b) => a | b, (a, b) => a ^ b, (a, b) => a & ~b, (a, b) => a & b];
  for (const { full, partial } of [ROWS, COLS]) {
    const lines = full.map((idx) => idx.map((i) => values[i]));
    const [p0, p1] = partial.map((i) => values[i]);
    if (lines.every((l) => l[0] === l[1] && l[1] === l[2]) && p0 === p1) out.add(p0);
    for (const op of ops) {
      if (lines.every((l) => op(l[0], l[1]) === l[2])) out.add(op(p0, p1));
    }
  }
  return out;
}

/**
 * Predicts the missing cell from the 8 visible cells using every rule family a
 * solver might try, row-wise and column-wise. Returns one candidate value set
 * per attribute; an item is valid only when each set is exactly {answer}.
 */
export function solve(grid: Cell[]): Record<Attr | 'lines', Set<number>> {
  const visible = grid.slice(0, 8);
  const result = {} as Record<Attr | 'lines', Set<number>>;
  for (const attr of ATTRS) result[attr] = scalarPredictions(visible.map((c) => c[attr]), DOMAIN_SIZE[attr]);
  result.lines = linePredictions(visible.map((c) => c.lines));
  return result;
}

function isUnambiguous(grid: Cell[]): boolean {
  const predictions = solve(grid);
  return (Object.keys(predictions) as (Attr | 'lines')[]).every(
    (key) => predictions[key].size === 1 && predictions[key].has(grid[8][key])
  );
}

export function sameCell(a: Cell, b: Cell): boolean {
  return a.shape === b.shape && a.count === b.count && a.size === b.size && a.color === b.color && a.lines === b.lines;
}

// ==================== EXPLANATIONS ====================
type Localized = { en: string; id: string };

const ATTR_LABEL: Record<Attr, Localized> = {
  shape: { en: 'shape', id: 'bentuk' },
  count: { en: 'number of shapes', id: 'jumlah bentuk' },
  size: { en: 'size', id: 'ukuran' },
  color: { en: 'shade', id: 'warna' },
};

const PROGRESSION_TEXT: Record<Attr, { up: Localized; down: Localized }> = {
  shape: {
    up: { en: 'Each step to the right adds one side to the shape.', id: 'Setiap geser ke kanan, sisi bentuknya bertambah satu.' },
    down: { en: 'Each step to the right removes one side from the shape.', id: 'Setiap geser ke kanan, sisi bentuknya berkurang satu.' },
  },
  count: {
    up: { en: 'Each step to the right adds one shape.', id: 'Setiap geser ke kanan, jumlah bentuk bertambah satu.' },
    down: { en: 'Each step to the right removes one shape.', id: 'Setiap geser ke kanan, jumlah bentuk berkurang satu.' },
  },
  size: {
    up: { en: 'Shapes get bigger from left to right.', id: 'Bentuk makin besar dari kiri ke kanan.' },
    down: { en: 'Shapes get smaller from left to right.', id: 'Bentuk makin kecil dari kiri ke kanan.' },
  },
  color: {
    up: { en: 'Shapes get darker from left to right.', id: 'Warna bentuk makin gelap dari kiri ke kanan.' },
    down: { en: 'Shapes get lighter from left to right.', id: 'Warna bentuk makin terang dari kiri ke kanan.' },
  },
};

/** Human-readable description of the rules behind an item (used for practice feedback). */
export function explainItem(item: MatrixItem): Localized[] {
  const out: Localized[] = [];
  for (const attr of ATTRS) {
    const rule = item.rules.attrs[attr];
    if (rule.kind === 'rowConstant') {
      out.push({
        en: `Within each row the ${ATTR_LABEL[attr].en} stays the same; each row has its own.`,
        id: `Di dalam satu baris, ${ATTR_LABEL[attr].id} selalu sama; tiap baris punya ${ATTR_LABEL[attr].id} sendiri.`,
      });
    }
    if (rule.kind === 'progression') out.push(PROGRESSION_TEXT[attr][rule.step === 1 ? 'up' : 'down']);
    if (rule.kind === 'distribution') {
      out.push({
        en: `Every row contains the same three ${ATTR_LABEL[attr].en} values, each used once.`,
        id: `Setiap baris berisi tiga ${ATTR_LABEL[attr].id} yang sama, masing-masing muncul sekali.`,
      });
    }
  }
  if (item.rules.lines === 'add') {
    out.push({ en: 'The orange edge bars in column 3 = the bars of columns 1 and 2 combined.', id: 'Garis tepi oranye di kolom 3 = gabungan garis tepi kolom 1 dan kolom 2.' });
  }
  if (item.rules.lines === 'xor') {
    out.push({
      en: 'The orange edge bars in column 3 = bars that appear in only one of columns 1 and 2 (bars that appear in both disappear).',
      id: 'Garis tepi oranye di kolom 3 = garis yang hanya muncul di salah satu kolom 1 atau 2 (garis yang muncul di keduanya hilang).',
    });
  }
  out.push({ en: 'Everything else stays the same.', id: 'Hal lainnya tetap sama.' });
  return out;
}
