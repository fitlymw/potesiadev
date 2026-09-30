import { useEffect, useMemo, useReducer, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, X, Plus, Trash2, Eye, EyeOff, Star, Trophy, Users, Lightbulb, RotateCcw } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { RoundTable } from '@/components/games/party/RoundTable';
import { PLAYER_COLORS } from '@/components/games/party/colors';
import { MIND_READER_QUESTIONS, CATEGORY_LABEL, type MindReaderQuestion } from '@/data/mindReaderQuestions';
import {
  reducer,
  initialState,
  currentRound,
  guessersOf,
  pendingPlayer,
  pickQuestions,
  shuffleSeats,
  roundResult,
  finalStats,
  validatePlayers,
  MIN_PLAYERS,
  MAX_PLAYERS,
  QUESTIONS_PER_ROUND,
  SCALE_MIN,
  SCALE_MAX,
  BEST_KNOWER_BONUS,
  TITLE_THRESHOLDS,
  type GameState,
  type Lang,
  type Title,
} from '@/lib/party/mindReader';

const STORAGE_KEY = 'mind-reader-game';
const QUESTION_IDS = MIND_READER_QUESTIONS.map((q) => q.id);
const QUESTION_BY_ID = Object.fromEntries(MIND_READER_QUESTIONS.map((q) => [q.id, q])) as Record<string, MindReaderQuestion>;
const PIXEL = { fontFamily: '"Press Start 2P", cursive' };

const UI = {
  en: {
    title: 'MIND READER',
    tagline: 'How well do you really know your friends?',
    howTitle: 'How to play',
    howIntro: `A party game for ${MIN_PLAYERS}–${MAX_PLAYERS} players with one phone that gets passed around.`,
    steps: [
      'Enter everyone’s name. The app shuffles you into a random seating order — sit around the table as shown on the round-table screen.',
      `Seat 1 is the first Target. In secret, the Target rates themselves honestly on ${QUESTIONS_PER_ROUND} questions (scale ${SCALE_MIN}–${SCALE_MAX}), then picks the friend they think knows them best.`,
      'The phone is always passed to the left. One by one, every other player guesses the Target’s answers in secret — no talking, no peeking.',
      'When everyone has guessed, put the phone in the middle of the table. The Target’s real answers and all guesses are revealed together — now you can discuss!',
      'Next round, the Target role moves one seat to the left. When everyone has been the Target once, you see the final ranking and a map of who knows whom best.',
    ],
    pointsTitle: 'Points per guess',
    points: [
      'Exact: 10 · off by 1: 7 · off by 2: 4 · off by 3: 1',
      '+5 bonus when your guess is closer than the “safe” middle guess — so always guessing 5 or 6 does not pay off.',
      `The Target gets +${BEST_KNOWER_BONUS} if the friend they picked really scored highest that round.`,
    ],
    rulesTitle: 'House rules',
    rules: [
      'Target: answer how you really are, not how you would like to be.',
      'Look away while someone else is answering.',
      'Save the discussion for the reveal screen.',
    ],
    note: 'This is a game for fun and getting to know each other, not a psychological test. The Target’s answer shows how they see themselves — friends may see them differently, and both views can be valid. Everything stays on this phone.',
    toSetup: 'SET UP PLAYERS',
    setupTitle: 'Players',
    setupHint: `Enter ${MIN_PLAYERS}–${MAX_PLAYERS} names, in seating order.`,
    playerPlaceholder: (i: number) => `Player ${i + 1}`,
    addPlayer: 'Add player',
    errors: {
      tooFew: `At least ${MIN_PLAYERS} players are needed.`,
      tooMany: `At most ${MAX_PLAYERS} players.`,
      empty: 'Fill in every name (or remove empty rows).',
      duplicate: 'Each name must be different.',
    },
    start: 'SHUFFLE SEATS',
    seatingTitle: 'Round table',
    seatingIntro: (first: string) => `Sit in a circle in the order below. The game starts with ${first}, then continues to the left of ${first}.`,
    seatingView: 'Seen from above the table',
    seatingStarts: 'starts',
    seatingLeftOf: (name: string, prev: string) => `${name} — to the left of ${prev}`,
    seatingPass: 'The phone is always passed to the player on your left.',
    reshuffle: 'SHUFFLE AGAIN',
    seated: 'WE’RE SEATED — START',
    howAgain: 'How to play',
    round: (r: number, total: number) => `Round ${r} of ${total}`,
    passTo: 'Hand the phone to',
    passTargetHint: 'You are the Target this round. Answer about yourself — honestly.',
    passGuessHint: (target: string) => `Your turn to guess ${target}’s answers.`,
    imReady: (name: string) => `I’m ${name} — show me`,
    targetTitle: 'Rate yourself honestly',
    guessTitle: (target: string) => `How would ${target} answer?`,
    bestKnower: 'Who do you think knows you best?',
    hideAndPass: 'DONE — HIDE & PASS',
    answerAll: 'Answer every question first.',
    revealTitle: (target: string) => `${target}’s answers`,
    revealHint: 'Put the phone in the middle of the table.',
    realAnswer: 'Real answer',
    roundScores: 'Round points',
    total: 'Total',
    knowsBest: (name: string) => `Knows the Target best this round: ${name}`,
    prediction: (target: string, picked: string, ok: boolean) =>
      ok ? `${target} predicted ${picked} — correct! +${BEST_KNOWER_BONUS}` : `${target} predicted ${picked} — not this time.`,
    didYouKnow: 'Did you know?',
    nextRound: (name: string) => `NEXT: ${name} IS THE TARGET`,
    seeFinal: 'SEE FINAL RESULTS',
    finalTitle: 'FINAL RESULTS',
    empathyScore: 'reading score',
    titles: {
      mindReader: 'Mind Reader',
      perceptive: 'Perceptive Friend',
      gettingToKnow: 'Still Getting to Know You',
    } as Record<Title, string>,
    titleLegend: `Reading score = how close your guesses were (${TITLE_THRESHOLDS.mindReader}+: Mind Reader, ${TITLE_THRESHOLDS.perceptive}+: Perceptive Friend).`,
    openBook: 'Easiest to read',
    fullOfSurprises: 'Full of surprises',
    mapTitle: 'Who knows whom?',
    mapHint: 'Row = the guesser, column = the Target. Higher = guessed that person better.',
    playAgain: 'PLAY AGAIN (SAME PLAYERS)',
    newPlayers: 'NEW PLAYERS',
    backToGames: 'Back to games',
    confirmExit: 'Leave the game? Progress will be lost.',
  },
  id: {
    title: 'MIND READER',
    tagline: 'Seberapa kenal kamu dengan teman-temanmu?',
    howTitle: 'Cara bermain',
    howIntro: `Party game untuk ${MIN_PLAYERS}–${MAX_PLAYERS} pemain dengan satu HP yang dioper bergantian.`,
    steps: [
      'Masukkan nama semua pemain. Aplikasi akan mengacak urutan duduk — duduklah melingkar sesuai gambar di layar meja bundar.',
      `Pemain di kursi nomor 1 menjadi Target pertama. Secara rahasia, Target menilai dirinya sendiri dengan jujur pada ${QUESTIONS_PER_ROUND} pertanyaan (skala ${SCALE_MIN}–${SCALE_MAX}), lalu memilih teman yang menurutnya paling mengenal dirinya.`,
      'HP selalu dioper ke pemain di sebelah kiri. Satu per satu, pemain lain menebak jawaban Target secara rahasia — tanpa diskusi dan tanpa mengintip.',
      'Setelah semua menebak, taruh HP di tengah meja. Jawaban asli Target dan semua tebakan dibuka bersama — sekarang boleh diskusi!',
      'Di ronde berikutnya, peran Target pindah satu kursi ke kiri. Setelah semua pemain pernah menjadi Target, kalian melihat peringkat akhir dan peta siapa yang paling mengenal siapa.',
    ],
    pointsTitle: 'Poin per tebakan',
    points: [
      'Tepat: 10 · meleset 1: 7 · meleset 2: 4 · meleset 3: 1',
      '+5 bonus kalau tebakanmu lebih dekat daripada tebakan "aman" di tengah skala — jadi menebak 5 atau 6 terus tidak menguntungkan.',
      `Target mendapat +${BEST_KNOWER_BONUS} kalau teman yang dipilihnya benar-benar mendapat poin tertinggi di ronde itu.`,
    ],
    rulesTitle: 'Aturan main',
    rules: [
      'Target: jawab sesuai dirimu yang sebenarnya, bukan dirimu yang ideal.',
      'Jangan melihat layar saat pemain lain sedang menjawab.',
      'Simpan diskusi sampai layar hasil dibuka.',
    ],
    note: 'Ini game untuk seru-seruan dan saling mengenal, bukan tes psikologi. Jawaban Target menunjukkan cara ia melihat dirinya — teman bisa melihatnya berbeda, dan keduanya bisa sama-sama benar. Semua data hanya tersimpan di HP ini.',
    toSetup: 'ATUR PEMAIN',
    setupTitle: 'Pemain',
    setupHint: `Masukkan ${MIN_PLAYERS}–${MAX_PLAYERS} nama, sesuai urutan duduk.`,
    playerPlaceholder: (i: number) => `Pemain ${i + 1}`,
    addPlayer: 'Tambah pemain',
    errors: {
      tooFew: `Minimal ${MIN_PLAYERS} pemain.`,
      tooMany: `Maksimal ${MAX_PLAYERS} pemain.`,
      empty: 'Isi semua nama (atau hapus baris yang kosong).',
      duplicate: 'Setiap nama harus berbeda.',
    },
    start: 'ACAK TEMPAT DUDUK',
    seatingTitle: 'Meja bundar',
    seatingIntro: (first: string) => `Duduklah melingkar sesuai urutan di bawah. Permainan dimulai dari ${first}, lalu berlanjut ke sebelah kiri ${first}.`,
    seatingView: 'Dilihat dari atas meja',
    seatingStarts: 'mulai',
    seatingLeftOf: (name: string, prev: string) => `${name} — di sebelah kiri ${prev}`,
    seatingPass: 'HP selalu dioper ke pemain di sebelah kirimu.',
    reshuffle: 'ACAK ULANG',
    seated: 'KAMI SUDAH DUDUK — MULAI',
    howAgain: 'Cara bermain',
    round: (r: number, total: number) => `Ronde ${r} dari ${total}`,
    passTo: 'Serahkan HP ke',
    passTargetHint: 'Kamu Target ronde ini. Jawab tentang dirimu sendiri — dengan jujur.',
    passGuessHint: (target: string) => `Giliranmu menebak jawaban ${target}.`,
    imReady: (name: string) => `Saya ${name} — tampilkan`,
    targetTitle: 'Nilai dirimu dengan jujur',
    guessTitle: (target: string) => `Bagaimana ${target} akan menjawab?`,
    bestKnower: 'Menurutmu, siapa yang paling mengenalmu?',
    hideAndPass: 'SELESAI — SEMBUNYIKAN & OPER',
    answerAll: 'Jawab semua pertanyaan dulu.',
    revealTitle: (target: string) => `Jawaban ${target}`,
    revealHint: 'Taruh HP di tengah meja.',
    realAnswer: 'Jawaban asli',
    roundScores: 'Poin ronde ini',
    total: 'Total',
    knowsBest: (name: string) => `Paling mengenal Target di ronde ini: ${name}`,
    prediction: (target: string, picked: string, ok: boolean) =>
      ok ? `${target} memilih ${picked} — tepat! +${BEST_KNOWER_BONUS}` : `${target} memilih ${picked} — kali ini meleset.`,
    didYouKnow: 'Tahukah kamu?',
    nextRound: (name: string) => `LANJUT: ${name} JADI TARGET`,
    seeFinal: 'LIHAT HASIL AKHIR',
    finalTitle: 'HASIL AKHIR',
    empathyScore: 'skor membaca',
    titles: {
      mindReader: 'Pembaca Pikiran',
      perceptive: 'Teman yang Peka',
      gettingToKnow: 'Masih Perlu Kenalan',
    } as Record<Title, string>,
    titleLegend: `Skor membaca = seberapa dekat tebakanmu (${TITLE_THRESHOLDS.mindReader}+: Pembaca Pikiran, ${TITLE_THRESHOLDS.perceptive}+: Teman yang Peka).`,
    openBook: 'Paling mudah ditebak',
    fullOfSurprises: 'Paling penuh kejutan',
    mapTitle: 'Siapa paling kenal siapa?',
    mapHint: 'Baris = penebak, kolom = Target. Makin tinggi = makin tepat menebak orang itu.',
    playAgain: 'MAIN LAGI (PEMAIN SAMA)',
    newPlayers: 'PEMAIN BARU',
    backToGames: 'Kembali ke games',
    confirmExit: 'Keluar dari permainan? Progres akan hilang.',
  },
};

/** Short psychology notes shown on the reveal screen (one per round). */
const FACTS: { en: string; id: string }[] = [
  {
    en: 'Psychologists call the ability to infer what others think and feel “empathic accuracy” (William Ickes). It is a skill that varies between people and relationships.',
    id: 'Psikolog menyebut kemampuan menebak isi pikiran dan perasaan orang lain sebagai "empathic accuracy" (William Ickes). Kemampuan ini berbeda-beda antarorang dan antarhubungan.',
  },
  {
    en: 'We tend to assume others are more like us than they really are — the “false consensus effect” (Ross, Greene & House, 1977). Did anyone guess with their own answer?',
    id: 'Kita cenderung mengira orang lain lebih mirip dengan kita daripada kenyataannya — disebut "false consensus effect" (Ross, Greene & House, 1977). Adakah yang menebak pakai jawabannya sendiri?',
  },
  {
    en: 'Friends often read visible traits (like social energy) better than inner ones (like anxiety), which the person knows best themselves — Simine Vazire’s “self–other knowledge asymmetry”.',
    id: 'Teman sering lebih tepat menebak sifat yang terlihat (seperti energi sosial) daripada sifat "dalam" (seperti kecemasan) yang paling diketahui oleh diri sendiri — disebut "self–other knowledge asymmetry" (Simine Vazire).',
  },
  {
    en: 'Guessing “the average person” can look accurate without knowing anyone — Cronbach (1955) warned about this. That is why this game only gives a bonus for beating the safe middle guess.',
    id: 'Menebak "rata-rata orang" bisa terlihat akurat tanpa benar-benar mengenal seseorang — Cronbach (1955) sudah mengingatkan hal ini. Karena itu game ini hanya memberi bonus untuk tebakan yang mengalahkan tebakan aman di tengah.',
  },
  {
    en: 'How we see ourselves and how others see us can both be right: each side notices things the other misses. Big gaps are a good conversation starter, not a mistake.',
    id: 'Cara kita melihat diri sendiri dan cara orang lain melihat kita bisa sama-sama benar: masing-masing melihat hal yang tidak dilihat pihak lain. Selisih besar adalah bahan obrolan yang bagus, bukan kesalahan.',
  },
];

// ==================== SMALL COMPONENTS ====================
function HowToContent({ lang }: { lang: Lang }) {
  const t = UI[lang];
  return (
    <div className="space-y-4 text-left">
      <p className="text-violet-100/90 text-sm">{t.howIntro}</p>
      <ol className="space-y-3">
        {t.steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-violet-50/90 leading-relaxed">
            <span className="shrink-0 w-7 h-7 flex items-center justify-center border border-fuchsia-400/60 text-fuchsia-300 text-xs" style={PIXEL}>{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="border border-violet-500/30 bg-violet-950/40 p-3">
        <p className="text-fuchsia-300 text-xs mb-2 flex items-center gap-2"><Star className="w-4 h-4" />{t.pointsTitle}</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-violet-100/85">{t.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
      </div>
      <div className="border border-violet-500/30 bg-violet-950/40 p-3">
        <p className="text-fuchsia-300 text-xs mb-2 flex items-center gap-2"><EyeOff className="w-4 h-4" />{t.rulesTitle}</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-violet-100/85">{t.rules.map((r, i) => <li key={i}>{r}</li>)}</ul>
      </div>
      <p className="text-violet-200/60 text-xs leading-relaxed">{t.note}</p>
    </div>
  );
}

function ScaleQuestion({
  question,
  lang,
  value,
  onChange,
  index,
}: {
  question: MindReaderQuestion;
  lang: Lang;
  value: number | null;
  onChange: (v: number) => void;
  index: number;
}) {
  return (
    <div className="border border-violet-500/30 bg-black/30 p-3 sm:p-4">
      <p className="text-fuchsia-300/80 text-[11px] uppercase tracking-wider mb-1">{index + 1}. {CATEGORY_LABEL[question.category][lang]}</p>
      <p className="text-violet-50 text-sm sm:text-base mb-3 leading-snug">{question.text[lang]}</p>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: SCALE_MAX - SCALE_MIN + 1 }, (_, i) => SCALE_MIN + i).map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`h-10 text-sm border transition-colors ${value === v ? 'bg-fuchsia-500 border-fuchsia-300 text-white font-bold' : 'bg-violet-950/60 border-violet-600/50 text-violet-200 hover:border-fuchsia-400'}`}
            aria-label={`${v}`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="flex justify-between gap-2 mt-1.5 text-[11px] text-violet-200/70">
        <span>1 = {question.low[lang]}</span>
        <span className="text-right">10 = {question.high[lang]}</span>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

function loadState(): GameState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GameState;
      if (parsed && typeof parsed.phase === 'string' && Array.isArray(parsed.players) && Array.isArray(parsed.rounds)) {
        return reducer(parsed, { type: 'RESUME_AT_PASS' });
      }
    }
  } catch {
    // Corrupt or unavailable storage: start fresh
  }
  return initialState('id');
}

// ==================== MAIN ====================
export function MindReader() {
  const navigate = useNavigate();
  const { addExp } = useGamification();
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [showHelp, setShowHelp] = useState(false);
  const [names, setNames] = useState<string[]>(() => (state.players.length ? state.players : Array(MIN_PLAYERS).fill('')));
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [predicted, setPredicted] = useState<number | null>(null);
  const [expAwarded, setExpAwarded] = useState(false);
  const t = UI[state.lang];
  const round = currentRound(state);
  const inGame = ['pass', 'target', 'guess', 'reveal'].includes(state.phase);

  // Persist progress so a locked screen or reload does not end the game
  useEffect(() => {
    try {
      if (state.phase === 'howto' || state.phase === 'setup') sessionStorage.removeItem(STORAGE_KEY);
      else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable: the game still works, it just cannot be resumed
    }
  }, [state]);

  // Keep the screen awake while the phone is being passed around
  useEffect(() => {
    if (!inGame) return;
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> } };
    nav.wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => {});
    return () => { lock?.release().catch(() => {}); };
  }, [inGame]);

  const questions = useMemo(() => (round ? round.questionIds.map((id) => QUESTION_BY_ID[id]) : []), [round]);
  const result = useMemo(() => (round && state.phase === 'reveal' ? roundResult(round, state.players.length) : null), [round, state.phase, state.players.length]);
  const stats = useMemo(() => (state.phase === 'final' ? finalStats(state) : null), [state]);

  const openSecretScreen = () => {
    setAnswers(Array(QUESTIONS_PER_ROUND).fill(null));
    setPredicted(null);
    dispatch({ type: 'CONFIRM_PASS' });
  };

  const exit = () => {
    if (inGame && !window.confirm(t.confirmExit)) return;
    dispatch({ type: 'RESET' });
    navigate('/games');
  };

  const nextQuestions = () => pickQuestions(QUESTION_IDS, state.usedQuestionIds, QUESTIONS_PER_ROUND);

  const arrangeSeats = (list: string[]) => {
    if (validatePlayers(list) !== null) return;
    dispatch({ type: 'ARRANGE', players: shuffleSeats(list) });
  };

  const startGame = () => {
    setExpAwarded(false);
    dispatch({ type: 'START', questionIds: pickQuestions(QUESTION_IDS, state.usedQuestionIds, QUESTIONS_PER_ROUND) });
  };

  const shell = (children: React.ReactNode) => (
    <div className="fixed inset-0 z-50 bg-[#0e0716] text-violet-50 overflow-auto font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-10"><div className="scanlines h-full w-full" /></div>
      <div className="relative z-10 min-h-full flex flex-col items-center px-4 pt-4 pb-12">
        <div className="w-full max-w-xl flex items-center justify-between mb-4">
          <button onClick={exit} className="p-2 border border-violet-500/40 text-violet-300 hover:bg-violet-500/10" aria-label={t.backToGames}><ArrowLeft className="w-5 h-5" /></button>
          <span className="text-fuchsia-300 text-[10px] sm:text-xs" style={PIXEL}>{t.title}</span>
          {state.phase !== 'howto' ? (
            <button onClick={() => setShowHelp(true)} className="p-2 border border-violet-500/40 text-violet-300 hover:bg-violet-500/10" aria-label={t.howAgain}><HelpCircle className="w-5 h-5" /></button>
          ) : (
            <span className="w-9" />
          )}
        </div>
        <div className="w-full max-w-xl">{children}</div>
      </div>
      <AnimatePresence>
        {showHelp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/85 overflow-auto p-4 flex justify-center">
            <div className="w-full max-w-xl bg-[#140a20] border border-fuchsia-500/40 p-5 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-fuchsia-300 text-xs" style={PIXEL}>{t.howTitle}</h2>
                <button onClick={() => setShowHelp(false)} className="p-1 text-violet-300" aria-label="close"><X className="w-5 h-5" /></button>
              </div>
              <HowToContent lang={state.lang} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ==================== HOW TO PLAY (before anything else) ====================
  if (state.phase === 'howto') {
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
        <Eye className="w-14 h-14 text-fuchsia-400 mb-3" strokeWidth={1.5} />
        <h1 className="text-xl sm:text-2xl text-fuchsia-300 mb-2 text-center" style={PIXEL}>{t.title}</h1>
        <p className="text-violet-200/70 text-sm mb-4 text-center">{t.tagline}</p>
        <div className="flex gap-2 mb-5">
          {(['id', 'en'] as Lang[]).map((l) => (
            <button key={l} onClick={() => dispatch({ type: 'SET_LANG', lang: l })} className={`px-4 py-2 border text-[10px] ${state.lang === l ? 'border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-100' : 'border-violet-700 text-violet-400'}`} style={PIXEL}>
              {l === 'id' ? 'INDONESIA' : 'ENGLISH'}
            </button>
          ))}
        </div>
        <div className="w-full border border-fuchsia-500/30 bg-violet-950/30 p-4 sm:p-5 mb-5">
          <h2 className="text-fuchsia-300 text-xs mb-4" style={PIXEL}>{t.howTitle}</h2>
          <HowToContent lang={state.lang} />
        </div>
        <button onClick={() => dispatch({ type: 'SHOW_SETUP' })} className="w-full py-4 border-2 border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-100 text-xs" style={PIXEL}>{t.toSetup}</button>
      </motion.div>
    );
  }

  // ==================== SETUP ====================
  if (state.phase === 'setup') {
    const error = validatePlayers(names);
    const showError = error !== null && !(error === 'empty' && names.every((n) => n.trim() === ''));
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-fuchsia-300 text-sm mb-1 flex items-center gap-2" style={PIXEL}><Users className="w-5 h-5" />{t.setupTitle}</h1>
        <p className="text-violet-200/70 text-sm mb-4">{t.setupHint}</p>
        <div className="space-y-2 mb-3">
          {names.map((name, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={name}
                maxLength={16}
                onChange={(e) => { const value = e.target.value; setNames((prev) => prev.map((n, j) => (j === i ? value : n))); }}
                placeholder={t.playerPlaceholder(i)}
                className="flex-1 min-w-0 bg-black/40 border border-violet-600/50 px-3 py-2.5 text-violet-50 outline-none focus:border-fuchsia-400"
              />
              {names.length > MIN_PLAYERS && (
                <button onClick={() => setNames((prev) => prev.filter((_, j) => j !== i))} className="p-2 text-violet-400 hover:text-red-400" aria-label="remove"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          ))}
        </div>
        {names.length < MAX_PLAYERS && (
          <button onClick={() => setNames((prev) => [...prev, ''])} className="flex items-center gap-2 text-sm text-fuchsia-300 mb-4"><Plus className="w-4 h-4" />{t.addPlayer}</button>
        )}
        {showError && <p className="text-amber-300 text-sm mb-3">{t.errors[error]}</p>}
        <button disabled={error !== null} onClick={() => arrangeSeats(names)} className="w-full py-4 border-2 border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-100 text-xs disabled:opacity-40" style={PIXEL}>{t.start}</button>
        <button onClick={() => dispatch({ type: 'SHOW_HOWTO' })} className="w-full mt-3 py-2 text-sm text-violet-300 flex items-center justify-center gap-2"><HelpCircle className="w-4 h-4" />{t.howAgain}</button>
      </motion.div>
    );
  }

  // ==================== ROUND TABLE (random seating) ====================
  if (state.phase === 'seating') {
    const first = state.players[0];
    return shell(
      <motion.div key={state.players.join('|')} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h1 className="text-fuchsia-300 text-sm flex items-center gap-2" style={PIXEL}><Users className="w-5 h-5" />{t.seatingTitle}</h1>
        <p className="text-violet-100/90 text-sm leading-relaxed">{t.seatingIntro(first)}</p>
        <div className="border border-violet-500/30 bg-black/30 p-3">
          <RoundTable players={state.players} startsLabel={t.seatingStarts} />
          <p className="text-center text-violet-300/50 text-[11px] mt-1">{t.seatingView}</p>
        </div>
        <ol className="space-y-1.5">
          {state.players.map((name, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-bold text-[#0e0716]" style={{ background: PLAYER_COLORS[i] }}>{i + 1}</span>
              <span className="text-violet-50">
                {i === 0 ? <><b>{name}</b> — {t.seatingStarts}</> : t.seatingLeftOf(name, state.players[i - 1])}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-violet-200/70 text-sm">{t.seatingPass}</p>
        <button onClick={startGame} className="w-full py-4 border-2 border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-100 text-[10px] sm:text-xs" style={PIXEL}>{t.seated}</button>
        <button onClick={() => arrangeSeats(state.players)} className="w-full py-3 border border-violet-500/50 text-violet-200 text-[10px] flex items-center justify-center gap-2" style={PIXEL}><RotateCcw className="w-4 h-4" />{t.reshuffle}</button>
      </motion.div>
    );
  }

  if (!round) return shell(null);
  const target = state.players[round.targetIndex];
  const roundLabel = t.round(state.rounds.length, state.players.length);

  // ==================== BLIND PASS ====================
  if (state.phase === 'pass') {
    const player = pendingPlayer(state)!;
    const isTarget = player === round.targetIndex;
    return shell(
      <motion.div key={`${state.rounds.length}-${player}`} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center pt-6">
        <p className="text-violet-300/70 text-xs mb-6" style={PIXEL}>{roundLabel}</p>
        <p className="text-violet-200 mb-2">{t.passTo}</p>
        <p className="text-3xl sm:text-4xl font-bold mb-4 break-all" style={{ color: PLAYER_COLORS[player] }}>{state.players[player]}</p>
        <p className="text-violet-200/80 text-sm mb-10 max-w-sm">{isTarget ? t.passTargetHint : t.passGuessHint(target)}</p>
        <EyeOff className="w-12 h-12 text-violet-500/60 mb-10" />
        <button onClick={openSecretScreen} className="w-full py-4 border-2 text-sm font-bold" style={{ borderColor: PLAYER_COLORS[player], color: PLAYER_COLORS[player] }}>
          {t.imReady(state.players[player])}
        </button>
      </motion.div>
    );
  }

  // ==================== SECRET INPUT (Target or guesser) ====================
  if (state.phase === 'target' || state.phase === 'guess') {
    const isTarget = state.phase === 'target';
    const player = pendingPlayer(state)!;
    const others = guessersOf(round, state.players.length);
    const complete = answers.length === QUESTIONS_PER_ROUND && answers.every((a) => a !== null) && (!isTarget || predicted !== null);
    const submit = () => {
      if (!complete) return;
      const values = answers as number[];
      if (isTarget) dispatch({ type: 'SUBMIT_TARGET', answers: values, predictedBest: predicted! });
      else dispatch({ type: 'SUBMIT_GUESS', answers: values });
    };
    return shell(
      <motion.div key={`${state.phase}-${player}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: PLAYER_COLORS[player] }} className="font-bold">{state.players[player]}</span>
          <span className="text-violet-300/60">{roundLabel}</span>
        </div>
        <h2 className="text-lg font-bold text-violet-50">{isTarget ? t.targetTitle : t.guessTitle(target)}</h2>
        {questions.map((question, i) => (
          <ScaleQuestion key={question.id} question={question} lang={state.lang} index={i} value={answers[i] ?? null} onChange={(v) => setAnswers((prev) => prev.map((a, j) => (j === i ? v : a)))} />
        ))}
        {isTarget && (
          <div className="border border-violet-500/30 bg-black/30 p-3 sm:p-4">
            <p className="text-violet-50 text-sm sm:text-base mb-3">{t.bestKnower}</p>
            <div className="grid grid-cols-2 gap-2">
              {others.map((p) => (
                <button key={p} onClick={() => setPredicted(p)} className={`py-2.5 px-2 border text-sm truncate ${predicted === p ? 'bg-fuchsia-500/30 border-fuchsia-300 text-white' : 'border-violet-600/50 text-violet-200'}`}>
                  {state.players[p]}
                </button>
              ))}
            </div>
          </div>
        )}
        {!complete && <p className="text-violet-300/60 text-xs text-center">{t.answerAll}</p>}
        <button disabled={!complete} onClick={submit} className="w-full py-4 border-2 border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-100 text-[10px] sm:text-xs disabled:opacity-40" style={PIXEL}>{t.hideAndPass}</button>
      </motion.div>
    );
  }

  // ==================== REVEAL (table screen) ====================
  if (state.phase === 'reveal' && result && round.self) {
    const isLast = state.rounds.length >= state.players.length;
    const fact = FACTS[(state.rounds.length - 1) % FACTS.length];
    const self = round.self;
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="text-center">
          <p className="text-violet-300/60 text-xs mb-1">{roundLabel} · {t.revealHint}</p>
          <h2 className="text-xl font-bold" style={{ color: PLAYER_COLORS[round.targetIndex] }}>{t.revealTitle(target)}</h2>
        </div>
        {questions.map((question, qi) => (
          <div key={question.id} className="border border-violet-500/30 bg-black/30 p-3">
            <p className="text-violet-50 text-sm mb-2 leading-snug">{qi + 1}. {question.text[state.lang]}</p>
            <div className="grid grid-cols-10 gap-0.5">
              {Array.from({ length: SCALE_MAX }, (_, i) => i + 1).map((v) => {
                const here = result.perGuesser.filter((g) => g.scores[qi].guess === v);
                const isAnswer = self[qi] === v;
                return (
                  <div key={v} className={`min-h-[64px] flex flex-col items-center justify-end gap-0.5 pb-1 border ${isAnswer ? 'border-fuchsia-300 bg-fuchsia-500/20' : 'border-violet-800/40'}`}>
                    {here.map((g) => (
                      <span key={g.player} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[8px] sm:text-[9px] font-bold flex items-center justify-center text-black" style={{ background: PLAYER_COLORS[g.player] }}>
                        {initials(state.players[g.player])}
                      </span>
                    ))}
                    {isAnswer && <Star className="w-4 h-4 text-fuchsia-300 fill-fuchsia-300" />}
                    <span className={`text-[10px] ${isAnswer ? 'text-fuchsia-200 font-bold' : 'text-violet-400/70'}`}>{v}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-violet-300/60 mt-1">
              <span>{question.low[state.lang]}</span>
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-fuchsia-300 fill-fuchsia-300" />{t.realAnswer}: {self[qi]}</span>
              <span>{question.high[state.lang]}</span>
            </div>
          </div>
        ))}
        <div className="border border-violet-500/30 bg-black/30 p-3">
          <p className="text-fuchsia-300 text-xs mb-2 flex items-center gap-2"><Trophy className="w-4 h-4" />{t.roundScores}</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-violet-300/60 text-[11px]">
                <th className="text-left font-normal">&nbsp;</th>
                {questions.map((_, i) => <th key={i} className="font-normal">Q{i + 1}</th>)}
                <th className="text-right font-normal">{t.total}</th>
              </tr>
            </thead>
            <tbody>
              {[...result.perGuesser].sort((a, b) => b.total - a.total).map((g) => (
                <tr key={g.player} className="border-t border-violet-800/40">
                  <td className="py-1.5 truncate max-w-[110px]" style={{ color: PLAYER_COLORS[g.player] }}>{state.players[g.player]}</td>
                  {g.scores.map((s, i) => <td key={i} className="text-center text-violet-100/80">{s.points}</td>)}
                  <td className="text-right font-bold">{g.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-violet-100 text-sm mt-3">{t.knowsBest(result.bestKnowers.map((p) => state.players[p]).join(', '))}</p>
          {round.predictedBest !== null && (
            <p className={`text-sm mt-1 ${result.predictionCorrect ? 'text-emerald-300' : 'text-violet-300/70'}`}>
              {t.prediction(target, state.players[round.predictedBest], result.predictionCorrect)}
            </p>
          )}
        </div>
        <div className="border border-amber-400/30 bg-amber-500/5 p-3">
          <p className="text-amber-300 text-xs mb-1 flex items-center gap-2"><Lightbulb className="w-4 h-4" />{t.didYouKnow}</p>
          <p className="text-violet-50/85 text-sm leading-relaxed">{fact[state.lang]}</p>
        </div>
        <button
          onClick={() => {
            if (isLast && !expAwarded) {
              addExp(50);
              setExpAwarded(true);
            }
            dispatch({ type: 'NEXT_ROUND', questionIds: isLast ? [] : nextQuestions() });
          }}
          className="w-full py-4 border-2 border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-100 text-[10px] sm:text-xs"
          style={PIXEL}
        >
          {isLast ? t.seeFinal : t.nextRound(state.players[state.rounds.length])}
        </button>
      </motion.div>
    );
  }

  // ==================== FINAL ====================
  if (state.phase === 'final' && stats) {
    const readable = stats.readability.map((v, i) => ({ v, i })).filter((x): x is { v: number; i: number } => x.v !== null);
    const openBook = readable.reduce((a, b) => (b.v > a.v ? b : a), readable[0]);
    const surprising = readable.reduce((a, b) => (b.v < a.v ? b : a), readable[0]);
    const cellColor = (v: number) => `rgba(217, 70, 239, ${0.12 + (v / 100) * 0.7})`;
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-center text-fuchsia-300 text-sm" style={PIXEL}>{t.finalTitle}</h2>
        <div className="space-y-2">
          {stats.players.map((p, rank) => (
            <div key={p.player} className={`flex items-center gap-3 border p-3 ${rank === 0 ? 'border-fuchsia-400 bg-fuchsia-500/10' : 'border-violet-600/40 bg-black/30'}`}>
              <span className="w-6 text-center text-violet-300" style={PIXEL}>{rank + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate" style={{ color: PLAYER_COLORS[p.player] }}>{state.players[p.player]}</p>
                <p className="text-xs text-violet-200/80">{t.titles[p.title]} · {t.empathyScore} {p.empathyScore}%</p>
              </div>
              <span className="text-lg font-bold">{p.total}</span>
            </div>
          ))}
        </div>
        <p className="text-violet-300/60 text-xs">{t.titleLegend}</p>
        {openBook && surprising && openBook.i !== surprising.i && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="border border-violet-600/40 bg-black/30 p-3">
              <p className="text-violet-300/70 text-xs">{t.openBook}</p>
              <p className="font-bold" style={{ color: PLAYER_COLORS[openBook.i] }}>{state.players[openBook.i]} · {openBook.v}%</p>
            </div>
            <div className="border border-violet-600/40 bg-black/30 p-3">
              <p className="text-violet-300/70 text-xs">{t.fullOfSurprises}</p>
              <p className="font-bold" style={{ color: PLAYER_COLORS[surprising.i] }}>{state.players[surprising.i]} · {surprising.v}%</p>
            </div>
          </div>
        )}
        <div className="border border-violet-500/30 bg-black/30 p-3 overflow-x-auto">
          <p className="text-fuchsia-300 text-xs mb-1">{t.mapTitle}</p>
          <p className="text-violet-300/60 text-[11px] mb-3">{t.mapHint}</p>
          <table className="text-[11px] mx-auto border-separate" style={{ borderSpacing: 2 }}>
            <thead>
              <tr>
                <th />
                {state.players.map((name, i) => <th key={i} className="px-1 font-bold" style={{ color: PLAYER_COLORS[i] }}>{initials(name)}</th>)}
              </tr>
            </thead>
            <tbody>
              {stats.closeness.map((row, g) => (
                <tr key={g}>
                  <th className="pr-1 text-right font-bold" style={{ color: PLAYER_COLORS[g] }}>{initials(state.players[g])}</th>
                  {row.map((v, tIdx) => (
                    <td key={tIdx} className="w-9 h-8 text-center text-white" style={{ background: v === null ? 'transparent' : cellColor(v) }}>{v === null ? '—' : v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => arrangeSeats(state.players)}
          className="w-full py-4 border-2 border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-100 text-[10px] sm:text-xs flex items-center justify-center gap-2"
          style={PIXEL}
        >
          <RotateCcw className="w-4 h-4" />{t.playAgain}
        </button>
        <button onClick={() => { setNames(state.players); dispatch({ type: 'SHOW_SETUP' }); }} className="w-full py-3 border border-violet-500/50 text-violet-200 text-[10px]" style={PIXEL}>{t.newPlayers}</button>
      </motion.div>
    );
  }

  return shell(null);
}
