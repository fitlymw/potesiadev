import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGamification } from '@/context/GamificationContext';
import { ArrowLeft, Brain, Timer, CheckCircle2, XCircle, RotateCcw, Grid3x3 } from 'lucide-react';
import { generateItem, explainItem, type MatrixItem } from '@/lib/iq/matrix';
import { CellView } from '@/components/games/MatrixCell';
import {
  nextLevel,
  summarize,
  TEST_LENGTH,
  SECONDS_PER_ITEM,
  type Response,
  type TestSummary,
  type ScoreBand,
} from '@/lib/iq/scoring';

// Isi VITE_IQ_LOG_URL (Google Apps Script, lihat IQ_LOG_APPS_SCRIPT.gs) untuk
// mengumpulkan jawaban anonim yang dibutuhkan untuk kalibrasi soal & norma.
const LOG_URL: string | undefined = import.meta.env.VITE_IQ_LOG_URL;
const ATTEMPTS_KEY = 'matrix-reasoning-attempts';
const PRACTICE_COUNT = 2;

type Lang = 'en' | 'id';
type Screen = 'intro' | 'practice' | 'test' | 'result';

const PIXEL = { fontFamily: '"Press Start 2P", cursive' };
const MONO = { fontFamily: '"Share Tech Mono", ui-monospace, monospace' };

const UI = {
  en: {
    subtitle: 'Visual pattern reasoning test',
    howTitle: 'How it works',
    how: [
      `Each puzzle is a 3×3 grid with the bottom-right piece missing.`,
      `Find the rule in each row, then pick the 1 of 8 options that completes the grid.`,
      `${TEST_LENGTH} puzzles, ${SECONDS_PER_ITEM} seconds each. Difficulty adapts to your answers.`,
      `Start with ${PRACTICE_COUNT} practice puzzles (not scored).`,
      `Work alone, without paper or help — otherwise the result is not meaningful.`,
    ],
    attempt: (n: number) => `You have taken this test ${n} time(s) before. Scores rise with practice, so your first attempt is the most accurate.`,
    consent: 'Send my answers anonymously to help calibrate this test (no personal data).',
    start: 'START',
    practice: 'PRACTICE',
    puzzle: 'PUZZLE',
    of: 'OF',
    correct: 'Correct!',
    wrong: 'Not quite — the correct answer is highlighted.',
    rule: 'The rule:',
    next: 'NEXT',
    beginTest: 'BEGIN TEST',
    resultTitle: 'YOUR RESULT',
    scoreLabel: 'Reasoning score',
    rangeLabel: (a: number, b: number) => `Likely range: ${a}–${b}`,
    bands: {
      below: 'Below average', lowAverage: 'Low average', average: 'Average',
      highAverage: 'High average', above: 'Above average', veryHigh: 'Very high',
    } as Record<ScoreBand, string>,
    accuracy: 'Correct answers',
    highest: 'Hardest level solved',
    speed: 'Median time (correct)',
    timeouts: 'Timed out',
    perLevel: 'Accuracy per difficulty level',
    level: 'Level',
    none: '—',
    disclaimer:
      'Provisional score on an IQ-like scale (average 100). The test has not yet been calibrated on real test-takers, so this is an estimate for self-reflection, not an official IQ score or a clinical assessment.',
    again: 'TRY AGAIN',
    back: 'BACK TO GAMES',
    timeUp: "Time's up",
  },
  id: {
    subtitle: 'Tes penalaran pola visual',
    howTitle: 'Cara bermain',
    how: [
      `Setiap soal berupa kisi 3×3 dengan satu kotak kanan bawah yang hilang.`,
      `Temukan aturan di setiap baris, lalu pilih 1 dari 8 opsi yang melengkapi kisi.`,
      `${TEST_LENGTH} soal, masing-masing ${SECONDS_PER_ITEM} detik. Tingkat kesulitan menyesuaikan jawabanmu.`,
      `Diawali ${PRACTICE_COUNT} soal latihan (tidak dinilai).`,
      `Kerjakan sendiri tanpa kertas atau bantuan — jika tidak, hasilnya tidak bermakna.`,
    ],
    attempt: (n: number) => `Kamu sudah mengerjakan tes ini ${n} kali sebelumnya. Skor cenderung naik karena latihan, jadi percobaan pertama adalah yang paling akurat.`,
    consent: 'Kirim jawabanku secara anonim untuk membantu kalibrasi tes ini (tanpa data pribadi).',
    start: 'MULAI',
    practice: 'LATIHAN',
    puzzle: 'SOAL',
    of: 'DARI',
    correct: 'Benar!',
    wrong: 'Belum tepat — jawaban yang benar ditandai.',
    rule: 'Aturannya:',
    next: 'LANJUT',
    beginTest: 'MULAI TES',
    resultTitle: 'HASILMU',
    scoreLabel: 'Skor penalaran',
    rangeLabel: (a: number, b: number) => `Rentang kemungkinan: ${a}–${b}`,
    bands: {
      below: 'Di bawah rata-rata', lowAverage: 'Rata-rata bawah', average: 'Rata-rata',
      highAverage: 'Rata-rata atas', above: 'Di atas rata-rata', veryHigh: 'Sangat tinggi',
    } as Record<ScoreBand, string>,
    accuracy: 'Jawaban benar',
    highest: 'Level tersulit yang terjawab',
    speed: 'Waktu tengah (jawaban benar)',
    timeouts: 'Waktu habis',
    perLevel: 'Ketepatan per level kesulitan',
    level: 'Level',
    none: '—',
    disclaimer:
      'Skor sementara pada skala seperti IQ (rata-rata 100). Tes ini belum dikalibrasi dengan data peserta sungguhan, jadi hasil ini adalah estimasi untuk refleksi diri, bukan skor IQ resmi atau asesmen klinis.',
    again: 'COBA LAGI',
    back: 'KEMBALI KE GAMES',
    timeUp: 'Waktu habis',
  },
};

function MatrixBoard({ item, reveal }: { item: MatrixItem; reveal: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-emerald-900/40 border-2 border-emerald-500/40 w-full max-w-[340px] mx-auto">
      {item.grid.map((cell, i) =>
        i < 8 || reveal ? (
          <div key={i} className={`aspect-square ${i === 8 ? 'ring-2 ring-emerald-400' : ''}`}><CellView cell={cell} /></div>
        ) : (
          <div key={i} className="aspect-square bg-emerald-950 border-2 border-dashed border-emerald-400/60 flex items-center justify-center">
            <span className="text-emerald-300 text-2xl" style={PIXEL}>?</span>
          </div>
        )
      )}
    </div>
  );
}

const LETTERS = 'ABCDEFGH';

function OptionsGrid({
  item,
  onPick,
  disabled,
  highlight,
}: {
  item: MatrixItem;
  onPick: (index: number) => void;
  disabled: boolean;
  highlight?: { picked: number; correct: number };
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full max-w-[420px] mx-auto">
      {item.options.map((cell, i) => {
        const isCorrect = highlight && i === highlight.correct;
        const isWrongPick = highlight && i === highlight.picked && i !== highlight.correct;
        return (
          <button
            key={i}
            disabled={disabled}
            onClick={() => onPick(i)}
            className={`relative p-0.5 sm:p-1 border-2 transition-colors bg-black/40 ${
              isCorrect ? 'border-emerald-400' : isWrongPick ? 'border-red-500' : 'border-emerald-700/50 hover:border-emerald-400'
            } disabled:cursor-default`}
          >
            <div className="aspect-square"><CellView cell={cell} /></div>
            <span className="block text-center text-emerald-300/80 text-[10px] mt-1" style={PIXEL}>{LETTERS[i]}</span>
          </button>
        );
      })}
    </div>
  );
}

// ==================== HELPERS ====================
function randomSeed() {
  return Math.floor(Math.random() * 2 ** 31);
}

function readAttempts(): number {
  try {
    return Number(localStorage.getItem(ATTEMPTS_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function writeAttempts(n: number) {
  try {
    localStorage.setItem(ATTEMPTS_KEY, String(n));
  } catch {
    // Storage unavailable (private mode) — attempt counting is best-effort
  }
}

interface LoggedResponse extends Response {
  seed: number;
}

function sendLog(payload: unknown) {
  if (!LOG_URL) return;
  // text/plain avoids a CORS preflight, which Apps Script web apps do not answer
  fetch(LOG_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) }).catch(
    (err) => console.warn('[MatrixReasoning] log failed', err)
  );
}

// ==================== MAIN COMPONENT ====================
export function MatrixReasoning() {
  const navigate = useNavigate();
  const { addExp } = useGamification();
  const [lang, setLang] = useState<Lang>('id');
  const t = UI[lang];
  const [screen, setScreen] = useState<Screen>('intro');
  const [consent, setConsent] = useState(false);
  const [previousAttempts, setPreviousAttempts] = useState(readAttempts);

  // Practice
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceItem, setPracticeItem] = useState<MatrixItem>(() => generateItem(1, randomSeed()));
  const [practicePick, setPracticePick] = useState<number | null>(null);

  // Test
  const [responses, setResponses] = useState<LoggedResponse[]>([]);
  const [item, setItem] = useState<MatrixItem | null>(null);
  const [answered, setAnswered] = useState(false);
  const [remaining, setRemaining] = useState(SECONDS_PER_ITEM);
  const startedAt = useRef(0);
  const [summary, setSummary] = useState<TestSummary | null>(null);

  const finish = useCallback(
    (all: LoggedResponse[]) => {
      const result = summarize(all);
      setSummary(result);
      setScreen('result');
      addExp(50);
      const attempt = previousAttempts + 1;
      writeAttempts(attempt);
      if (consent) {
        sendLog({
          version: 'matrix-v1',
          timestamp: new Date().toISOString(),
          attempt,
          lang,
          theta: result.theta,
          se: result.se,
          score: result.score,
          responses: all,
        });
      }
    },
    [addExp, consent, lang, previousAttempts]
  );

  /** Show a new test item and restart its timer (done here, not in an effect). */
  const showItem = useCallback((next: MatrixItem) => {
    startedAt.current = Date.now();
    setItem(next);
    setAnswered(false);
    setRemaining(SECONDS_PER_ITEM);
  }, []);

  const record = useCallback(
    (pickedIndex: number | null) => {
      if (!item || answered) return;
      setAnswered(true);
      const rtMs = Math.min(Date.now() - startedAt.current, SECONDS_PER_ITEM * 1000);
      const response: LoggedResponse = {
        level: item.level,
        correct: pickedIndex === item.answerIndex,
        timedOut: pickedIndex === null,
        rtMs,
        seed: item.seed,
      };
      const all = [...responses, response];
      setResponses(all);
      if (all.length >= TEST_LENGTH) {
        finish(all);
      } else {
        showItem(generateItem(nextLevel(all), randomSeed()));
      }
    },
    [answered, finish, item, responses, showItem]
  );

  // The interval below always calls the latest `record`
  const recordRef = useRef(record);
  useEffect(() => {
    recordRef.current = record;
  }, [record]);

  // Countdown for the current item; time up → recorded as a timed-out (wrong) answer
  useEffect(() => {
    if (screen !== 'test' || !item) return;
    const timer = setInterval(() => {
      const left = SECONDS_PER_ITEM - (Date.now() - startedAt.current) / 1000;
      setRemaining(Math.max(0, left));
      if (left <= 0) recordRef.current(null);
    }, 250);
    return () => clearInterval(timer);
  }, [item, screen]);

  // Keyboard: A–H or 1–8
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const index = LETTERS.indexOf(key) >= 0 ? LETTERS.indexOf(key) : Number(key) - 1;
      if (!(index >= 0 && index < 8)) return;
      if (screen === 'test') record(index);
      if (screen === 'practice' && practicePick === null) setPracticePick(index);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, record, practicePick]);

  const startPractice = () => {
    setPracticeIndex(0);
    setPracticeItem(generateItem(1, randomSeed()));
    setPracticePick(null);
    setScreen('practice');
  };

  const nextPractice = () => {
    if (practiceIndex + 1 < PRACTICE_COUNT) {
      setPracticeIndex(practiceIndex + 1);
      setPracticeItem(generateItem(2, randomSeed()));
      setPracticePick(null);
    } else {
      setResponses([]);
      showItem(generateItem(nextLevel([]), randomSeed()));
      setScreen('test');
    }
  };

  const restart = () => {
    setPreviousAttempts(readAttempts());
    setSummary(null);
    setResponses([]);
    setItem(null);
    setScreen('intro');
  };

  const shell = (children: React.ReactNode) => (
    <div className="fixed inset-0 z-50 bg-[#07110d] text-emerald-50 overflow-auto">
      <div className="absolute inset-0 pointer-events-none opacity-10"><div className="scanlines h-full w-full" /></div>
      <div className="relative z-10 min-h-full flex flex-col items-center p-4 pb-10">{children}</div>
    </div>
  );

  // ==================== INTRO ====================
  if (screen === 'intro') {
    return shell(
      <>
        <button onClick={() => navigate('/games')} className="self-start p-2 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"><ArrowLeft className="w-5 h-5" /></button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl w-full mt-4 flex flex-col items-center text-center">
          <Grid3x3 className="w-16 h-16 text-emerald-400 mb-4" strokeWidth={1.5} />
          <h1 className="text-2xl md:text-3xl text-emerald-300 mb-2" style={PIXEL}>MATRIX REASONING</h1>
          <p className="text-emerald-200/60 text-sm mb-6" style={MONO}>{t.subtitle}</p>
          <div className="flex gap-2 mb-6">
            {(['id', 'en'] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-4 py-2 border text-xs ${lang === l ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200' : 'border-emerald-700 text-emerald-500'}`} style={PIXEL}>
                {l === 'id' ? 'INDONESIA' : 'ENGLISH'}
              </button>
            ))}
          </div>
          <div className="w-full text-left border border-emerald-500/30 bg-emerald-950/30 p-4 mb-4">
            <h2 className="text-emerald-300 text-xs mb-3 flex items-center gap-2"><Brain className="w-4 h-4" />{t.howTitle}</h2>
            <ol className="space-y-2 text-sm text-emerald-100/80" style={MONO}>
              {t.how.map((line, i) => <li key={i} className="flex gap-2"><span className="text-emerald-500">{i + 1}.</span><span>{line}</span></li>)}
            </ol>
          </div>
          {previousAttempts > 0 && <p className="text-amber-300/80 text-xs mb-4" style={MONO}>{t.attempt(previousAttempts)}</p>}
          {LOG_URL && (
            <label className="flex items-start gap-2 text-left text-xs text-emerald-200/70 mb-4 cursor-pointer" style={MONO}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-emerald-500" />
              <span>{t.consent}</span>
            </label>
          )}
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={startPractice} className="px-10 py-4 border-2 border-emerald-400 bg-emerald-500/20 text-emerald-200" style={PIXEL}>
            {t.start}
          </motion.button>
        </motion.div>
      </>
    );
  }

  // ==================== PRACTICE ====================
  if (screen === 'practice') {
    const done = practicePick !== null;
    const correct = practicePick === practiceItem.answerIndex;
    return shell(
      <div className="max-w-xl w-full flex flex-col gap-4">
        <div className="flex items-center justify-between text-emerald-300 text-[10px] md:text-xs" style={PIXEL}>
          <span>{t.practice} {practiceIndex + 1}/{PRACTICE_COUNT}</span>
        </div>
        <MatrixBoard item={practiceItem} reveal={done} />
        <OptionsGrid item={practiceItem} onPick={setPracticePick} disabled={done} highlight={done ? { picked: practicePick, correct: practiceItem.answerIndex } : undefined} />
        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-emerald-500/30 bg-emerald-950/40 p-4">
              <p className={`flex items-center gap-2 text-sm mb-2 ${correct ? 'text-emerald-300' : 'text-red-300'}`} style={MONO}>
                {correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}{correct ? t.correct : t.wrong}
              </p>
              <p className="text-emerald-200/70 text-xs mb-1" style={MONO}>{t.rule}</p>
              <ul className="list-disc pl-5 text-emerald-100/80 text-sm space-y-1" style={MONO}>
                {explainItem(practiceItem).map((line, i) => <li key={i}>{line[lang]}</li>)}
              </ul>
              <button onClick={nextPractice} className="mt-4 w-full py-3 border-2 border-emerald-400 bg-emerald-500/20 text-emerald-200 text-xs" style={PIXEL}>
                {practiceIndex + 1 < PRACTICE_COUNT ? t.next : t.beginTest}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ==================== TEST ====================
  if (screen === 'test' && item) {
    const fraction = remaining / SECONDS_PER_ITEM;
    return shell(
      <div className="max-w-xl w-full flex flex-col gap-4">
        <div className="flex items-center justify-between text-emerald-300 text-[10px] md:text-xs" style={PIXEL}>
          <span>{t.puzzle} {responses.length + 1} {t.of} {TEST_LENGTH}</span>
          <span className={`flex items-center gap-1 ${remaining < 10 ? 'text-red-400' : ''}`}><Timer className="w-4 h-4" />{Math.ceil(remaining)}s</span>
        </div>
        <div className="h-2 bg-black/50 border border-emerald-800">
          <div className={`h-full transition-[width] duration-200 ${remaining < 10 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${fraction * 100}%` }} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={item.seed} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex flex-col gap-4">
            <MatrixBoard item={item} reveal={false} />
            <OptionsGrid item={item} onPick={record} disabled={answered} />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ==================== RESULT ====================
  if (screen === 'result' && summary) {
    const stats: [string, string][] = [
      [t.accuracy, `${summary.correct} / ${summary.total}`],
      [t.highest, summary.highestLevelSolved > 0 ? `${summary.highestLevelSolved} / 5` : t.none],
      [t.speed, summary.medianCorrectSeconds !== null ? `${summary.medianCorrectSeconds.toFixed(1)}s` : t.none],
      [t.timeouts, String(summary.timeouts)],
    ];
    return shell(
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl w-full flex flex-col gap-5">
        <h1 className="text-center text-emerald-300 text-lg mt-2" style={PIXEL}>{t.resultTitle}</h1>
        <div className="border-2 border-emerald-500/50 bg-emerald-950/30 p-6 text-center">
          <p className="text-emerald-200/60 text-xs mb-2" style={MONO}>{t.scoreLabel}</p>
          <p className="text-5xl md:text-6xl text-emerald-300 mb-2" style={PIXEL}>{summary.score}</p>
          <p className="text-emerald-100 text-lg mb-1" style={MONO}>{t.bands[summary.band]}</p>
          <p className="text-emerald-200/60 text-xs" style={MONO}>{t.rangeLabel(summary.range[0], summary.range[1])}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(([label, value]) => (
            <div key={label} className="border border-emerald-500/30 bg-black/30 p-3">
              <p className="text-emerald-200/60 text-[11px]" style={MONO}>{label}</p>
              <p className="text-emerald-100 text-lg" style={MONO}>{value}</p>
            </div>
          ))}
        </div>
        <div className="border border-emerald-500/30 bg-black/30 p-4">
          <p className="text-emerald-300 text-xs mb-3" style={MONO}>{t.perLevel}</p>
          <div className="space-y-2">
            {summary.perLevel.map(({ level, correct, total }) => (
              <div key={level} className="flex items-center gap-3 text-xs" style={MONO}>
                <span className="w-16 text-emerald-200/70">{t.level} {level}</span>
                <div className="flex-1 h-3 bg-black/50 border border-emerald-800">
                  <div className="h-full bg-emerald-500" style={{ width: total ? `${(correct / total) * 100}%` : '0%' }} />
                </div>
                <span className="w-12 text-right text-emerald-100/80">{total ? `${correct}/${total}` : t.none}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-emerald-200/50 text-xs text-center" style={MONO}>{t.disclaimer}</p>
        {previousAttempts > 0 && <p className="text-amber-300/70 text-xs text-center" style={MONO}>{t.attempt(previousAttempts)}</p>}
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={restart} className="flex items-center gap-2 px-6 py-3 border-2 border-emerald-400 bg-emerald-500/20 text-emerald-200 text-xs" style={PIXEL}><RotateCcw className="w-4 h-4" />{t.again}</button>
          <button onClick={() => navigate('/games')} className="flex items-center gap-2 px-6 py-3 border-2 border-emerald-700 text-emerald-300 text-xs" style={PIXEL}><ArrowLeft className="w-4 h-4" />{t.back}</button>
        </div>
      </motion.div>
    );
  }

  return null;
}
