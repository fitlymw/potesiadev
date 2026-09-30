import { useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { playClick } from '@/lib/audio';
import {
  ArrowLeft,
  Upload,
  BarChart3,
  PieChart as PieChartIcon,
  ScatterChart as ScatterChartIcon,
  FileSpreadsheet,
  Database,
  Activity,
  Trash2,
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  Line,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────
interface RawRow {
  [key: string]: string | number;
}

interface ScatterPoint {
  x: number;
  y: number;
}

interface PieDatum {
  name: string;
  value: number;
}

interface BarDatum {
  name: string;
  count: number;
}

interface AnalyzedData {
  columns: string[];
  rows: RawRow[];
  numericPairs: ScatterPoint[];
  trendLine: ScatterPoint[];
  sentimentData: PieDatum[];
  categoricalData: BarDatum[];
  summary: {
    totalRows: number;
    totalCols: number;
    numericCols: string[];
    textCols: string[];
    catCols: string[];
  };
}

// ─── Colors ──────────────────────────────────────────────
const CYBER_COLORS = {
  bg: '#0a0a0f',
  panel: '#111118',
  border: '#d4af37',
  borderGlow: 'rgba(212, 175, 55, 0.4)',
  text: '#e0e0e0',
  textMuted: '#888899',
  accent: '#00f0ff',
  accent2: '#ff00a0',
  accent3: '#39ff14',
  grid: '#22222e',
};

const CHART_COLORS = [
  '#00f0ff',
  '#ff00a0',
  '#39ff14',
  '#ffd700',
  '#ff6b35',
  '#b967ff',
  '#00d4aa',
  '#ff4757',
];

// ─── Helpers ─────────────────────────────────────────────
function isNumeric(value: unknown): boolean {
  if (typeof value === 'number') return true;
  if (typeof value !== 'string') return false;
  return !isNaN(parseFloat(value)) && isFinite(Number(value));
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  return 0;
}

function computeLinearRegression(points: ScatterPoint[]): ScatterPoint[] {
  const n = points.length;
  if (n < 2) return points;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));
  return [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept },
  ];
}

function analyzeSentiment(texts: string[]): PieDatum[] {
  const positive = ['good', 'great', 'excellent', 'happy', 'love', 'best', 'awesome', 'amazing', 'perfect', 'nice', 'positive', 'success', 'win', 'like', 'joy'];
  const negative = ['bad', 'terrible', 'worst', 'hate', 'awful', 'poor', 'sad', 'angry', 'fail', 'error', 'negative', 'horrible', 'disappointing', 'wrong', 'issue'];
  const neutral = ['ok', 'fine', 'average', 'normal', 'standard', 'regular', 'typical', 'usual', 'common', 'moderate'];

  let pos = 0, neg = 0, neu = 0;
  for (const text of texts) {
    const lower = String(text).toLowerCase();
    let scored = false;
    for (const word of positive) {
      if (lower.includes(word)) { pos++; scored = true; break; }
    }
    if (!scored) {
      for (const word of negative) {
        if (lower.includes(word)) { neg++; scored = true; break; }
      }
    }
    if (!scored) {
      for (const word of neutral) {
        if (lower.includes(word)) { neu++; scored = true; break; }
      }
    }
    if (!scored) neu++;
  }
  return [
    { name: 'Positive', value: pos },
    { name: 'Negative', value: neg },
    { name: 'Neutral', value: neu },
  ].filter((d) => d.value > 0);
}

function computeCategoricalFrequency(rows: RawRow[], col: string): BarDatum[] {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const val = String(row[col] ?? 'Unknown');
    counts[val] = (counts[val] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

function processData(rows: RawRow[]): AnalyzedData | null {
  if (!rows.length) return null;
  const columns = Object.keys(rows[0]);
  const numericCols = columns.filter((c) => rows.every((r) => isNumeric(r[c])));
  const textCols = columns.filter((c) =>
    rows.every((r) => typeof r[c] === 'string' || r[c] === undefined || r[c] === null)
  );
  const catCols = columns.filter((c) => {
    const unique = new Set(rows.map((r) => String(r[c] ?? '')));
    return unique.size <= Math.min(rows.length * 0.3, 20) && !numericCols.includes(c);
  });

  let numericPairs: ScatterPoint[] = [];
  let trendLine: ScatterPoint[] = [];
  if (numericCols.length >= 2) {
    const xCol = numericCols[0];
    const yCol = numericCols[1];
    numericPairs = rows
      .map((r) => ({ x: toNumber(r[xCol]), y: toNumber(r[yCol]) }))
      .filter((p) => !isNaN(p.x) && !isNaN(p.y));
    trendLine = computeLinearRegression(numericPairs);
  } else if (numericCols.length === 1) {
    const col = numericCols[0];
    numericPairs = rows.map((r, i) => ({ x: i + 1, y: toNumber(r[col]) }));
    trendLine = computeLinearRegression(numericPairs);
  }

  let sentimentData: PieDatum[] = [];
  if (textCols.length > 0) {
    const texts = rows.map((r) => String(r[textCols[0]] ?? ''));
    sentimentData = analyzeSentiment(texts);
  }

  let categoricalData: BarDatum[] = [];
  if (catCols.length > 0) {
    categoricalData = computeCategoricalFrequency(rows, catCols[0]);
  } else if (textCols.length > 0) {
    categoricalData = computeCategoricalFrequency(rows, textCols[0]);
  }

  return {
    columns,
    rows,
    numericPairs,
    trendLine,
    sentimentData,
    categoricalData,
    summary: {
      totalRows: rows.length,
      totalCols: columns.length,
      numericCols,
      textCols,
      catCols,
    },
  };
}

// ─── Component ───────────────────────────────────────────
export function AIDataLabPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [data, setData] = useState<AnalyzedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleBack = () => {
    playClick();
    navigate('/my-project');
  };

  const parseFile = useCallback((file: File) => {
    setLoading(true);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const binary = e.target?.result;
        const workbook = XLSX.read(binary, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<RawRow>(worksheet, { defval: '' });
        const analyzed = processData(jsonData);
        setData(analyzed);
      } catch (err) {
        console.error('Parse error:', err);
        alert('Failed to parse file. Please upload a valid Excel or CSV file.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    playClick();
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    playClick();
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleClear = () => {
    playClick();
    setData(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadClick = () => {
    playClick();
    fileInputRef.current?.click();
  };

  // Pixel border style
  const pixelBorder = {
    boxShadow:
      '0 0 0 2px #0a0a0f, 0 0 0 4px #d4af37, 0 0 15px rgba(212, 175, 55, 0.3)',
  };

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden relative"
      style={{ backgroundColor: CYBER_COLORS.bg, color: CYBER_COLORS.text }}
    >
      {/* CRT overlay */}
      <div className="scanlines pointer-events-none fixed inset-0 z-[100]" />
      <div className="vignette pointer-events-none fixed inset-0 z-[99]" />

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleBack}
        className="fixed top-4 left-4 z-50 p-2 sm:p-3 border-2 border-amber-500/50 hover:border-amber-400 transition-colors"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
      </motion.button>

      {/* Corner Decorations */}
      <div className="corner-decor top-left" />
      <div className="corner-decor top-right" />
      <div className="corner-decor bottom-left" />
      <div className="corner-decor bottom-right" />

      <div className="relative z-10 pt-20 sm:pt-24 pb-16 sm:pb-20 px-3 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative p-1 mb-8 sm:mb-12"
            style={{ backgroundColor: 'rgba(17,17,24,0.8)', border: '2px solid rgba(212,175,55,0.3)' }}
          >
            <div className="absolute -top-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-l-2 border-amber-500" />
            <div className="absolute -top-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-r-2 border-amber-500" />
            <div className="absolute -bottom-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-l-2 border-amber-500" />
            <div className="absolute -bottom-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-r-2 border-amber-500" />
            <div
              className="px-4 sm:px-6 py-3 sm:py-4"
              style={{ backgroundColor: 'rgba(0,128,128,0.2)' }}
            >
              <h1
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-white retro-glow"
                style={{ fontFamily: '"Press Start 2P", cursive' }}
              >
                Data Analyst Visualization System
              </h1>
              <p
                className="text-amber-400/70 text-xs sm:text-sm mt-2"
                style={{ fontFamily: '"Share Tech Mono", monospace' }}
              >
                Upload Excel/CSV → Auto-Analyze → Visualize
              </p>
            </div>
          </motion.div>

          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 sm:mb-12"
          >
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className="relative border-2 border-dashed p-1 transition-all cursor-pointer"
              style={{
                borderColor: dragOver ? '#00f0ff' : 'rgba(212,175,55,0.4)',
                backgroundColor: dragOver ? 'rgba(0,240,255,0.05)' : 'rgba(17,17,24,0.6)',
              }}
              onClick={handleUploadClick}
            >
              <div
                className="flex flex-col items-center justify-center py-10 sm:py-14 px-4"
                style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
              >
                <Upload
                  className="w-10 h-10 sm:w-12 sm:h-12 mb-4"
                  style={{ color: CYBER_COLORS.accent }}
                />
                <p
                  className="text-sm sm:text-base mb-2 text-center"
                  style={{
                    fontFamily: '"Press Start 2P", cursive',
                    color: CYBER_COLORS.accent,
                  }}
                >
                  {dragOver ? 'Drop file here' : 'Click or Drag to Upload'}
                </p>
                <p
                  className="text-xs text-center"
                  style={{
                    fontFamily: '"Share Tech Mono", monospace',
                    color: CYBER_COLORS.textMuted,
                  }}
                >
                  Supports .xlsx, .xls, .csv files
                </p>
                {fileName && (
                  <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded" style={{ backgroundColor: 'rgba(0,240,255,0.1)' }}>
                    <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-cyan-400" style={{ fontFamily: '"Share Tech Mono", monospace' }}>{fileName}</span>
                  </div>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <Activity className="w-8 h-8 text-amber-400 animate-spin mb-4" />
              <p className="text-amber-400 text-sm" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                Processing Data...
              </p>
            </motion.div>
          )}

          {/* Data Summary */}
          {data && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-amber-400" />
                  <h2
                    className="text-sm sm:text-base text-amber-400"
                    style={{ fontFamily: '"Press Start 2P", cursive' }}
                  >
                    Analysis Results
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClear}
                  className="flex items-center gap-2 px-4 py-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors text-xs"
                  style={{ fontFamily: '"Share Tech Mono", monospace' }}
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Data
                </motion.button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
                {[
                  { label: 'Rows', value: data.summary.totalRows },
                  { label: 'Columns', value: data.summary.totalCols },
                  { label: 'Numeric', value: data.summary.numericCols.length },
                  { label: 'Categorical', value: data.summary.catCols.length },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-3 sm:p-4 border border-amber-500/20 text-center"
                    style={{ backgroundColor: 'rgba(17,17,24,0.8)' }}
                  >
                    <p className="text-xl sm:text-2xl font-bold text-cyan-400 mb-1">{stat.value}</p>
                    <p className="text-xs text-amber-400/60" style={{ fontFamily: '"Share Tech Mono", monospace' }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Scatter Plot with Trend Line */}
                <ChartCard
                  title="Regression Analysis"
                  icon={<ScatterChartIcon className="w-5 h-5 text-cyan-400" />}
                  subtitle={data.summary.numericCols.length >= 2 ? `${data.summary.numericCols[0]} vs ${data.summary.numericCols[1]}` : data.summary.numericCols.length === 1 ? `${data.summary.numericCols[0]} (Index)` : 'No numeric columns found'}
                >
                  {data.numericPairs.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={CYBER_COLORS.grid} />
                        <XAxis
                          type="number"
                          dataKey="x"
                          stroke={CYBER_COLORS.textMuted}
                          tick={{ fill: CYBER_COLORS.textMuted, fontSize: 12 }}
                        />
                        <YAxis
                          type="number"
                          dataKey="y"
                          stroke={CYBER_COLORS.textMuted}
                          tick={{ fill: CYBER_COLORS.textMuted, fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: CYBER_COLORS.panel,
                            border: `1px solid ${CYBER_COLORS.border}`,
                            color: CYBER_COLORS.text,
                          }}
                        />
                        <Scatter
                          name="Data Points"
                          data={data.numericPairs}
                          fill={CYBER_COLORS.accent}
                          fillOpacity={0.7}
                        />
                        {data.trendLine.length === 2 && (
                          <Line
                            type="linear"
                            dataKey="y"
                            data={data.trendLine}
                            stroke={CYBER_COLORS.accent2}
                            strokeWidth={2}
                            dot={false}
                            name="Trend Line"
                          />
                        )}
                      </ScatterChart>
                    </ResponsiveContainer>
                  ) : (
                    <NoData message="Upload a file with at least 2 numeric columns for regression analysis." />
                  )}
                </ChartCard>

                {/* Pie Chart - Sentiment Analysis */}
                <ChartCard
                  title="Sentiment Distribution"
                  icon={<PieChartIcon className="w-5 h-5 text-pink-400" />}
                  subtitle={data.summary.textCols.length > 0 ? `Analyzed: ${data.summary.textCols[0]}` : 'No text columns found'}
                >
                  {data.sentimentData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={data.sentimentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }: { name: string; percent: number }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {data.sentimentData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: CYBER_COLORS.panel,
                            border: `1px solid ${CYBER_COLORS.border}`,
                            color: CYBER_COLORS.text,
                          }}
                        />
                        <Legend
                          wrapperStyle={{ color: CYBER_COLORS.text }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <NoData message="Upload a file with text columns for sentiment analysis." />
                  )}
                </ChartCard>

                {/* Bar Chart - Categorical Frequency */}
                <ChartCard
                  title="Categorical Frequency"
                  icon={<BarChart3 className="w-5 h-5 text-green-400" />}
                  subtitle={data.summary.catCols.length > 0 ? `Column: ${data.summary.catCols[0]}` : data.summary.textCols.length > 0 ? `Column: ${data.summary.textCols[0]}` : 'No categorical columns found'}
                >
                  {data.categoricalData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={data.categoricalData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={CYBER_COLORS.grid} />
                        <XAxis
                          dataKey="name"
                          stroke={CYBER_COLORS.textMuted}
                          tick={{ fill: CYBER_COLORS.textMuted, fontSize: 11 }}
                          angle={-30}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          stroke={CYBER_COLORS.textMuted}
                          tick={{ fill: CYBER_COLORS.textMuted, fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: CYBER_COLORS.panel,
                            border: `1px solid ${CYBER_COLORS.border}`,
                            color: CYBER_COLORS.text,
                          }}
                        />
                        <Bar dataKey="count" fill={CYBER_COLORS.accent3} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <NoData message="Upload a file with categorical data for frequency analysis." />
                  )}
                </ChartCard>

                {/* Data Preview Table */}
                <ChartCard
                  title="Data Preview"
                  icon={<Database className="w-5 h-5 text-amber-400" />}
                  subtitle={`First ${Math.min(5, data.rows.length)} of ${data.rows.length} rows`}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs" style={{ fontFamily: '"Share Tech Mono", monospace' }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${CYBER_COLORS.border}` }}>
                          {data.columns.slice(0, 5).map((col) => (
                            <th key={col} className="text-left p-2 text-amber-400 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.rows.slice(0, 5).map((row, i) => (
                          <tr
                            key={i}
                            style={{
                              borderBottom: '1px solid rgba(212,175,55,0.1)',
                              backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(0,240,255,0.03)',
                            }}
                          >
                            {data.columns.slice(0, 5).map((col) => (
                              <td key={col} className="p-2 text-cyan-100/70 whitespace-nowrap">
                                {String(row[col] ?? '').slice(0, 30)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ChartCard>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────
function ChartCard({
  title,
  icon,
  subtitle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative p-1"
      style={{
        backgroundColor: 'rgba(17,17,24,0.8)',
        border: '2px solid rgba(212,175,55,0.3)',
      }}
    >
      <div className="absolute -top-2 -left-2 w-3 h-3 border-t-2 border-l-2 border-amber-500 opacity-50" />
      <div className="absolute -top-2 -right-2 w-3 h-3 border-t-2 border-r-2 border-amber-500 opacity-50" />
      <div className="absolute -bottom-2 -left-2 w-3 h-3 border-b-2 border-l-2 border-amber-500 opacity-50" />
      <div className="absolute -bottom-2 -right-2 w-3 h-3 border-b-2 border-r-2 border-amber-500 opacity-50" />
      <div className="p-4 sm:p-5" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h3
            className="text-xs sm:text-sm text-amber-400"
            style={{ fontFamily: '"Press Start 2P", cursive' }}
          >
            {title}
          </h3>
        </div>
        <p
          className="text-xs mb-4"
          style={{ fontFamily: '"Share Tech Mono", monospace', color: CYBER_COLORS.textMuted }}
        >
          {subtitle}
        </p>
        {children}
      </div>
    </div>
  );
}

function NoData({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[320px] text-center px-4">
      <BarChart3 className="w-10 h-10 mb-3" style={{ color: CYBER_COLORS.textMuted }} />
      <p className="text-sm" style={{ color: CYBER_COLORS.textMuted, fontFamily: '"Share Tech Mono", monospace' }}>
        {message}
      </p>
    </div>
  );
}

