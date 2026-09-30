import { useEffect, useMemo, useReducer, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, X, Plus, Trash2, EyeOff, Star, Trophy, Users, Lightbulb, RotateCcw, Search, RefreshCw, MessageCircle, Check } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { RoundTable } from '@/components/games/party/RoundTable';
import { PLAYER_COLORS } from '@/components/games/party/colors';
import { PROFILER_QUESTIONS, TEXT_ANSWER_MAX, type ProfilerQuestion } from '@/data/profilerQuestions';
import {
  reducer,
  initialState,
  currentRound,
  pendingPlayer,
  roundResult,
  finalStats,
  validatePlayers,
  shuffleSeats,
  pickQuestions,
  shuffle,
  MIN_PLAYERS,
  MAX_PLAYERS,
  ROUND_OPTIONS,
  DETECT_POINTS,
  JOHARI_EXACT_POINTS,
  JOHARI_CLOSE_POINTS,
  type GameState,
  type Lang,
} from '@/lib/party/profiler';

const STORAGE_KEY = 'profiler-game';
const QUESTION_IDS = PROFILER_QUESTIONS.map((q) => q.id);
const QUESTION_BY_ID = Object.fromEntries(PROFILER_QUESTIONS.map((q) => [q.id, q])) as Record<string, ProfilerQuestion>;
const PIXEL = { fontFamily: '"Press Start 2P", cursive' };
const LETTERS = 'ABCDEFGH';

const UI = {
  en: {
    title: 'THE PROFILER',
    tagline: 'Who wrote which answer?',
    howTitle: 'How to play',
    howIntro: `A party game for ${MIN_PLAYERS}–${MAX_PLAYERS} players with one phone that gets passed around.`,
    steps: [
      'Enter everyone’s name and choose the number of rounds. The app shuffles you into a random seating order — sit around the table as shown.',
      'Each round starts with a question everyone can see. Don’t like it? Swap it before anyone answers.',
      'Answer lap: the phone goes to the left. Each player answers in secret and guesses how many friends will recognise their answer.',
      'When everyone has answered, put the phone in the middle of the table and open the answers. They are shuffled and anonymous — discuss who might have written each one, but don’t confess!',
      'Guess lap: the phone goes to the left again. Each player matches every anonymous answer to a friend, all in one turn.',
      'Reveal: see who wrote what, who recognised whom, and whose prediction was right. The next round starts one seat further to the left.',
    ],
    pointsTitle: 'Points',
    points: [
      `+${DETECT_POINTS} for every friend whose answer you match correctly.`,
      `How many friends will recognise you? Exact: +${JOHARI_EXACT_POINTS} · off by one: +${JOHARI_CLOSE_POINTS}.`,
      'There are no points for being hard to guess — so just answer honestly.',
      'If two people give the same answer, either of them counts as correct.',
    ],
    rulesTitle: 'House rules',
    rules: [
      'Answer honestly — the game only works if the answers are really yours.',
      'Look away while someone else is answering or guessing.',
      'Don’t say which answer is yours until the reveal.',
    ],
    note: 'This is a game for fun and getting to know each other, not a psychological test. Questions are kept light because every answer is shown with its owner at the end. Everything stays on this phone.',
    toSetup: 'SET UP PLAYERS',
    setupTitle: 'Players',
    setupHint: `Enter ${MIN_PLAYERS}–${MAX_PLAYERS} names.`,
    playerPlaceholder: (i: number) => `Player ${i + 1}`,
    addPlayer: 'Add player',
    roundsLabel: 'Number of rounds',
    errors: {
      tooFew: `At least ${MIN_PLAYERS} players are needed.`,
      tooMany: `At most ${MAX_PLAYERS} players.`,
      empty: 'Fill in every name (or remove empty rows).',
      duplicate: 'Each name must be different.',
    },
    shuffleSeats: 'SHUFFLE SEATS',
    howAgain: 'How to play',
    seatingTitle: 'Round table',
    seatingIntro: (first: string) => `Sit in a circle in the order below. The game starts with ${first}, then continues to the left of ${first}.`,
    seatingView: 'Seen from above the table',
    seatingStarts: 'starts',
    seatingLeftOf: (name: string, prev: string) => `${name} — to the left of ${prev}`,
    seatingPass: 'The phone is always passed to the player on your left.',
    reshuffle: 'SHUFFLE AGAIN',
    seated: 'WE’RE SEATED — START',
    round: (r: number, total: number) => `Round ${r} of ${total}`,
    questionForAll: 'This round’s question — everyone can read it:',
    swap: 'Swap question',
    beginAnswers: (name: string) => `START ANSWERING — PHONE TO ${name.toUpperCase()}`,
    passTo: 'Hand the phone to',
    passAnswerHint: 'Your turn to answer — in secret.',
    passGuessHint: 'Your turn to match the answers to their owners.',
    imReady: (name: string) => `I’m ${name} — show me`,
    yourAnswer: 'Your answer',
    typeHere: 'Type your answer',
    predictTitle: 'How many friends will recognise your answer?',
    predictHint: (n: number) => `out of ${n}`,
    hideAndPass: 'DONE — HIDE & PASS',
    completeFirst: 'Answer and choose a number first.',
    collectedTitle: 'Everyone has answered!',
    collectedHint: 'Put the phone in the middle of the table so everyone can see it, then open the anonymous answers.',
    openAnswers: 'OPEN THE ANSWERS',
    tableTitle: 'Anonymous answers',
    tableHint: 'Discuss: who might have written each one? Don’t reveal your own!',
    beginGuesses: (name: string) => `START GUESSING — PHONE TO ${name.toUpperCase()}`,
    guessTitle: 'Who wrote which answer?',
    guessHint: 'Tap a name under each answer. Each name can be used once.',
    mine: 'Your answer',
    completeGuess: 'Give every answer an owner first.',
    revealTitle: 'Who wrote what',
    writtenBy: 'Written by',
    recognisedBy: 'Recognised by',
    nobody: 'nobody',
    predicted: (p: number, a: number) => `Predicted ${p}, actually ${a}`,
    roundPoints: 'Round points',
    detectCol: 'Matches',
    johariCol: 'Prediction',
    total: 'Total',
    didYouKnow: 'Did you know?',
    nextRound: 'NEXT ROUND',
    seeFinal: 'SEE FINAL RESULTS',
    finalTitle: 'FINAL RESULTS',
    detectRate: 'matched',
    recognisedRate: 'recognised by friends',
    awards: {
      detective: 'Best detective',
      selfAware: 'Knows themselves best',
      openBook: 'Open book',
      surprises: 'Full of surprises',
    },
    playAgain: 'PLAY AGAIN (SAME PLAYERS)',
    newPlayers: 'NEW PLAYERS',
    backToGames: 'Back to games',
    confirmExit: 'Leave the game? Progress will be lost.',
  },
  id: {
    title: 'THE PROFILER',
    tagline: 'Siapa menulis jawaban yang mana?',
    howTitle: 'Cara bermain',
    howIntro: `Party game untuk ${MIN_PLAYERS}–${MAX_PLAYERS} pemain dengan satu HP yang dioper bergantian.`,
    steps: [
      'Masukkan nama semua pemain dan pilih jumlah ronde. Aplikasi akan mengacak urutan duduk — duduklah melingkar sesuai gambar.',
      'Setiap ronde dimulai dengan satu pertanyaan yang boleh dibaca semua pemain. Kurang cocok? Ganti pertanyaannya sebelum ada yang menjawab.',
      'Putaran menjawab: HP dioper ke kiri. Setiap pemain menjawab secara rahasia dan menebak berapa teman yang akan mengenali jawabannya.',
      'Setelah semua menjawab, taruh HP di tengah meja lalu buka jawabannya. Jawaban diacak dan tanpa nama — diskusikan siapa kira-kira penulisnya, tapi jangan mengaku!',
      'Putaran menebak: HP dioper ke kiri lagi. Setiap pemain mencocokkan semua jawaban anonim dengan nama teman, sekaligus dalam satu giliran.',
      'Pembukaan: lihat siapa menulis apa, siapa berhasil mengenali siapa, dan tebakan siapa yang tepat. Ronde berikutnya dimulai satu kursi ke kiri.',
    ],
    pointsTitle: 'Poin',
    points: [
      `+${DETECT_POINTS} untuk setiap teman yang jawabannya berhasil kamu cocokkan.`,
      `Berapa teman yang akan mengenalimu? Tepat: +${JOHARI_EXACT_POINTS} · meleset satu: +${JOHARI_CLOSE_POINTS}.`,
      'Tidak ada poin untuk "sulit ditebak" — jadi jawablah dengan jujur.',
      'Kalau dua orang menjawab sama, menebak salah satunya tetap dihitung benar.',
    ],
    rulesTitle: 'Aturan main',
    rules: [
      'Jawab dengan jujur — game ini hanya seru kalau jawabannya benar-benar milikmu.',
      'Jangan melihat layar saat pemain lain sedang menjawab atau menebak.',
      'Jangan bilang jawaban mana yang milikmu sampai pembukaan.',
    ],
    note: 'Ini game untuk seru-seruan dan saling mengenal, bukan tes psikologi. Pertanyaannya dibuat ringan karena setiap jawaban akan ditampilkan bersama nama pemiliknya di akhir ronde. Semua data hanya tersimpan di HP ini.',
    toSetup: 'ATUR PEMAIN',
    setupTitle: 'Pemain',
    setupHint: `Masukkan ${MIN_PLAYERS}–${MAX_PLAYERS} nama.`,
    playerPlaceholder: (i: number) => `Pemain ${i + 1}`,
    addPlayer: 'Tambah pemain',
    roundsLabel: 'Jumlah ronde',
    errors: {
      tooFew: `Minimal ${MIN_PLAYERS} pemain.`,
      tooMany: `Maksimal ${MAX_PLAYERS} pemain.`,
      empty: 'Isi semua nama (atau hapus baris yang kosong).',
      duplicate: 'Setiap nama harus berbeda.',
    },
    shuffleSeats: 'ACAK TEMPAT DUDUK',
    howAgain: 'Cara bermain',
    seatingTitle: 'Meja bundar',
    seatingIntro: (first: string) => `Duduklah melingkar sesuai urutan di bawah. Permainan dimulai dari ${first}, lalu berlanjut ke sebelah kiri ${first}.`,
    seatingView: 'Dilihat dari atas meja',
    seatingStarts: 'mulai',
    seatingLeftOf: (name: string, prev: string) => `${name} — di sebelah kiri ${prev}`,
    seatingPass: 'HP selalu dioper ke pemain di sebelah kirimu.',
    reshuffle: 'ACAK ULANG',
    seated: 'KAMI SUDAH DUDUK — MULAI',
    round: (r: number, total: number) => `Ronde ${r} dari ${total}`,
    questionForAll: 'Pertanyaan ronde ini — boleh dibaca semua:',
    swap: 'Ganti pertanyaan',
    beginAnswers: (name: string) => `MULAI MENJAWAB — HP KE ${name.toUpperCase()}`,
    passTo: 'Serahkan HP ke',
    passAnswerHint: 'Giliranmu menjawab — secara rahasia.',
    passGuessHint: 'Giliranmu mencocokkan jawaban dengan pemiliknya.',
    imReady: (name: string) => `Saya ${name} — tampilkan`,
    yourAnswer: 'Jawabanmu',
    typeHere: 'Tulis jawabanmu',
    predictTitle: 'Berapa teman yang akan mengenali jawabanmu?',
    predictHint: (n: number) => `dari ${n} teman`,
    hideAndPass: 'SELESAI — SEMBUNYIKAN & OPER',
    completeFirst: 'Jawab dan pilih angka dulu.',
    collectedTitle: 'Semua sudah menjawab!',
    collectedHint: 'Taruh HP di tengah meja supaya semua bisa melihat, lalu buka jawaban anonim.',
    openAnswers: 'BUKA JAWABAN',
    tableTitle: 'Jawaban anonim',
    tableHint: 'Diskusikan: kira-kira siapa penulis tiap jawaban? Jangan bocorkan jawabanmu sendiri!',
    beginGuesses: (name: string) => `MULAI MENEBAK — HP KE ${name.toUpperCase()}`,
    guessTitle: 'Siapa menulis jawaban yang mana?',
    guessHint: 'Ketuk satu nama di bawah setiap jawaban. Setiap nama hanya bisa dipakai sekali.',
    mine: 'Jawabanmu',
    completeGuess: 'Beri pemilik untuk setiap jawaban dulu.',
    revealTitle: 'Siapa menulis apa',
    writtenBy: 'Ditulis oleh',
    recognisedBy: 'Dikenali oleh',
    nobody: 'tidak ada',
    predicted: (p: number, a: number) => `Menebak ${p}, nyatanya ${a}`,
    roundPoints: 'Poin ronde ini',
    detectCol: 'Cocok',
    johariCol: 'Prediksi',
    total: 'Total',
    didYouKnow: 'Tahukah kamu?',
    nextRound: 'RONDE BERIKUTNYA',
    seeFinal: 'LIHAT HASIL AKHIR',
    finalTitle: 'HASIL AKHIR',
    detectRate: 'tebakan cocok',
    recognisedRate: 'dikenali teman',
    awards: {
      detective: 'Detektif terbaik',
      selfAware: 'Paling kenal diri sendiri',
      openBook: 'Buku terbuka',
      surprises: 'Penuh kejutan',
    },
    playAgain: 'MAIN LAGI (PEMAIN SAMA)',
    newPlayers: 'PEMAIN BARU',
    backToGames: 'Kembali ke games',
    confirmExit: 'Keluar dari permainan? Progres akan hilang.',
  },
};

/** Short psychology notes shown on the reveal screen (one per round). */
const FACTS: { en: string; id: string }[] = [
  {
    en: 'The Johari Window (Luft & Ingham, 1955) splits what we know about ourselves into four areas: open (known to you and others), blind (others see it, you don’t), hidden (you know, others don’t) and unknown. Your prediction just now was a small test of these areas.',
    id: 'Johari Window (Luft & Ingham, 1955) membagi pengetahuan tentang diri menjadi empat area: terbuka (kamu dan orang lain tahu), buta (orang lain melihatnya, kamu tidak), tersembunyi (kamu tahu, orang lain tidak), dan tidak diketahui. Tebakanmu tadi adalah tes kecil untuk area-area ini.',
  },
  {
    en: 'People tend to think their inner thoughts are easier for others to read than they really are — the “illusion of transparency” (Gilovich, Savitsky & Medvec, 1998). Was your prediction too high?',
    id: 'Orang cenderung mengira isi pikirannya lebih mudah dibaca orang lain daripada kenyataannya — disebut "illusion of transparency" (Gilovich, Savitsky & Medvec, 1998). Apakah tebakanmu tadi terlalu tinggi?',
  },
  {
    en: 'We also overestimate how much others notice us — the “spotlight effect” (Gilovich, Medvec & Savitsky, 2000).',
    id: 'Kita juga cenderung melebih-lebihkan seberapa diperhatikan kita oleh orang lain — disebut "spotlight effect" (Gilovich, Medvec & Savitsky, 2000).',
  },
  {
    en: 'Sharing small things about yourself, step by step, is how friendships grow closer — a classic idea from social penetration theory (Altman & Taylor, 1973).',
    id: 'Berbagi hal-hal kecil tentang diri secara bertahap membuat pertemanan makin dekat — gagasan klasik dari teori penetrasi sosial (Altman & Taylor, 1973).',
  },
  {
    en: 'Guessing who wrote an answer often relies on our picture of a friend (“she’s the frugal one”). A surprising owner may show a side of them you haven’t met yet.',
    id: 'Menebak pemilik jawaban sering bergantung pada gambaran kita tentang teman ("dia kan orangnya hemat"). Pemilik yang mengejutkan bisa jadi menunjukkan sisi dirinya yang belum kamu kenal.',
  },
];

function answerText(question: ProfilerQuestion, value: string, lang: Lang): string {
  if (question.kind === 'choice' && value.startsWith('opt:')) return question.options[Number(value.slice(4))]?.[lang] ?? value;
  return value;
}

function HowToContent({ lang }: { lang: Lang }) {
  const t = UI[lang];
  return (
    <div className="space-y-4 text-left">
      <p className="text-sky-100/90 text-sm">{t.howIntro}</p>
      <ol className="space-y-3">
        {t.steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-sky-50/90 leading-relaxed">
            <span className="shrink-0 w-7 h-7 flex items-center justify-center border border-amber-400/60 text-amber-300 text-xs" style={PIXEL}>{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="border border-sky-500/30 bg-sky-950/40 p-3">
        <p className="text-amber-300 text-xs mb-2 flex items-center gap-2"><Star className="w-4 h-4" />{t.pointsTitle}</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-sky-100/85">{t.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
      </div>
      <div className="border border-sky-500/30 bg-sky-950/40 p-3">
        <p className="text-amber-300 text-xs mb-2 flex items-center gap-2"><EyeOff className="w-4 h-4" />{t.rulesTitle}</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-sky-100/85">{t.rules.map((r, i) => <li key={i}>{r}</li>)}</ul>
      </div>
      <p className="text-sky-200/60 text-xs leading-relaxed">{t.note}</p>
    </div>
  );
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
export function Profiler() {
  const navigate = useNavigate();
  const { addExp } = useGamification();
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [showHelp, setShowHelp] = useState(false);
  const [names, setNames] = useState<string[]>(() => (state.players.length ? state.players : Array(MIN_PLAYERS).fill('')));
  const [roundsTotal, setRoundsTotal] = useState<number>(state.roundsTotal);
  const [answer, setAnswer] = useState('');
  const [prediction, setPrediction] = useState<number | null>(null);
  const [assignment, setAssignment] = useState<(number | null)[]>([]);
  const [expAwarded, setExpAwarded] = useState(false);
  const t = UI[state.lang];
  const round = currentRound(state);
  const n = state.players.length;
  const question = round ? QUESTION_BY_ID[round.questionId] : undefined;
  const inGame = ['question', 'pass', 'answer', 'collected', 'table', 'guess', 'reveal'].includes(state.phase);

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

  const result = useMemo(() => (round && state.phase === 'reveal' ? roundResult(round, n) : null), [round, state.phase, n]);
  const stats = useMemo(() => (state.phase === 'final' ? finalStats(state) : null), [state]);

  const nextQuestion = () => pickQuestions(QUESTION_IDS, state.usedQuestionIds, 1)[0];

  const arrangeSeats = (list: string[], rounds: number) => {
    if (validatePlayers(list) !== null) return;
    dispatch({ type: 'ARRANGE', players: shuffleSeats(list), roundsTotal: rounds });
  };

  const openSecretScreen = () => {
    setAnswer('');
    setPrediction(null);
    if (round) setAssignment(round.cardOwners.map((owner) => (owner === pendingPlayer(state) ? owner : null)));
    dispatch({ type: 'CONFIRM_PASS' });
  };

  const exit = () => {
    if (inGame && !window.confirm(t.confirmExit)) return;
    dispatch({ type: 'RESET' });
    navigate('/games');
  };

  const shell = (children: React.ReactNode) => (
    <div className="fixed inset-0 z-50 bg-[#06121c] text-sky-50 overflow-auto font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-10"><div className="scanlines h-full w-full" /></div>
      <div className="relative z-10 min-h-full flex flex-col items-center px-4 pt-4 pb-12">
        <div className="w-full max-w-xl flex items-center justify-between mb-4">
          <button onClick={exit} className="p-2 border border-sky-500/40 text-sky-300 hover:bg-sky-500/10" aria-label={t.backToGames}><ArrowLeft className="w-5 h-5" /></button>
          <span className="text-amber-300 text-[10px] sm:text-xs" style={PIXEL}>{t.title}</span>
          {state.phase !== 'howto' ? (
            <button onClick={() => setShowHelp(true)} className="p-2 border border-sky-500/40 text-sky-300 hover:bg-sky-500/10" aria-label={t.howAgain}><HelpCircle className="w-5 h-5" /></button>
          ) : (
            <span className="w-9" />
          )}
        </div>
        <div className="w-full max-w-xl">{children}</div>
      </div>
      <AnimatePresence>
        {showHelp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/85 overflow-auto p-4 flex justify-center">
            <div className="w-full max-w-xl bg-[#0a1a28] border border-amber-500/40 p-5 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-amber-300 text-xs" style={PIXEL}>{t.howTitle}</h2>
                <button onClick={() => setShowHelp(false)} className="p-1 text-sky-300" aria-label="close"><X className="w-5 h-5" /></button>
              </div>
              <HowToContent lang={state.lang} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const primaryBtn = 'w-full py-4 border-2 border-amber-400 bg-amber-500/15 text-amber-100 text-[10px] sm:text-xs disabled:opacity-40';

  // ==================== HOW TO PLAY (before anything else) ====================
  if (state.phase === 'howto') {
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
        <Search className="w-14 h-14 text-amber-400 mb-3" strokeWidth={1.5} />
        <h1 className="text-xl sm:text-2xl text-amber-300 mb-2 text-center" style={PIXEL}>{t.title}</h1>
        <p className="text-sky-200/70 text-sm mb-4 text-center">{t.tagline}</p>
        <div className="flex gap-2 mb-5">
          {(['id', 'en'] as Lang[]).map((l) => (
            <button key={l} onClick={() => dispatch({ type: 'SET_LANG', lang: l })} className={`px-4 py-2 border text-[10px] ${state.lang === l ? 'border-amber-400 bg-amber-500/20 text-amber-100' : 'border-sky-700 text-sky-400'}`} style={PIXEL}>
              {l === 'id' ? 'INDONESIA' : 'ENGLISH'}
            </button>
          ))}
        </div>
        <div className="w-full border border-amber-500/30 bg-sky-950/30 p-4 sm:p-5 mb-5">
          <h2 className="text-amber-300 text-xs mb-4" style={PIXEL}>{t.howTitle}</h2>
          <HowToContent lang={state.lang} />
        </div>
        <button onClick={() => dispatch({ type: 'SHOW_SETUP' })} className={primaryBtn} style={PIXEL}>{t.toSetup}</button>
      </motion.div>
    );
  }

  // ==================== SETUP ====================
  if (state.phase === 'setup') {
    const error = validatePlayers(names);
    const showError = error !== null && !(error === 'empty' && names.every((x) => x.trim() === ''));
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-amber-300 text-sm mb-1 flex items-center gap-2" style={PIXEL}><Users className="w-5 h-5" />{t.setupTitle}</h1>
        <p className="text-sky-200/70 text-sm mb-4">{t.setupHint}</p>
        <div className="space-y-2 mb-3">
          {names.map((name, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={name}
                maxLength={16}
                onChange={(e) => { const value = e.target.value; setNames((prev) => prev.map((x, j) => (j === i ? value : x))); }}
                placeholder={t.playerPlaceholder(i)}
                className="flex-1 min-w-0 bg-black/40 border border-sky-600/50 px-3 py-2.5 text-sky-50 outline-none focus:border-amber-400"
              />
              {names.length > MIN_PLAYERS && (
                <button onClick={() => setNames((prev) => prev.filter((_, j) => j !== i))} className="p-2 text-sky-400 hover:text-red-400" aria-label="remove"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          ))}
        </div>
        {names.length < MAX_PLAYERS && (
          <button onClick={() => setNames((prev) => [...prev, ''])} className="flex items-center gap-2 text-sm text-amber-300 mb-4"><Plus className="w-4 h-4" />{t.addPlayer}</button>
        )}
        <p className="text-sky-200/80 text-sm mb-2">{t.roundsLabel}</p>
        <div className="flex gap-2 mb-4">
          {ROUND_OPTIONS.map((r) => (
            <button key={r} onClick={() => setRoundsTotal(r)} className={`flex-1 py-2.5 border text-sm ${roundsTotal === r ? 'border-amber-400 bg-amber-500/20 text-amber-100 font-bold' : 'border-sky-600/50 text-sky-200'}`}>{r}</button>
          ))}
        </div>
        {showError && <p className="text-amber-300 text-sm mb-3">{t.errors[error]}</p>}
        <button disabled={error !== null} onClick={() => arrangeSeats(names, roundsTotal)} className={primaryBtn} style={PIXEL}>{t.shuffleSeats}</button>
        <button onClick={() => dispatch({ type: 'SHOW_HOWTO' })} className="w-full mt-3 py-2 text-sm text-sky-300 flex items-center justify-center gap-2"><HelpCircle className="w-4 h-4" />{t.howAgain}</button>
      </motion.div>
    );
  }

  // ==================== ROUND TABLE ====================
  if (state.phase === 'seating') {
    const first = state.players[0];
    return shell(
      <motion.div key={state.players.join('|')} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h1 className="text-amber-300 text-sm flex items-center gap-2" style={PIXEL}><Users className="w-5 h-5" />{t.seatingTitle}</h1>
        <p className="text-sky-100/90 text-sm leading-relaxed">{t.seatingIntro(first)}</p>
        <div className="border border-sky-500/30 bg-black/30 p-3">
          <RoundTable players={state.players} startsLabel={t.seatingStarts} />
          <p className="text-center text-sky-300/50 text-[11px] mt-1">{t.seatingView}</p>
        </div>
        <ol className="space-y-1.5">
          {state.players.map((name, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-bold text-[#06121c]" style={{ background: PLAYER_COLORS[i] }}>{i + 1}</span>
              <span className="text-sky-50">{i === 0 ? <><b>{name}</b> — {t.seatingStarts}</> : t.seatingLeftOf(name, state.players[i - 1])}</span>
            </li>
          ))}
        </ol>
        <p className="text-sky-200/70 text-sm">{t.seatingPass}</p>
        <button onClick={() => { setExpAwarded(false); dispatch({ type: 'START', questionId: nextQuestion() }); }} className={primaryBtn} style={PIXEL}>{t.seated}</button>
        <button onClick={() => arrangeSeats(state.players, state.roundsTotal)} className="w-full py-3 border border-sky-500/50 text-sky-200 text-[10px] flex items-center justify-center gap-2" style={PIXEL}><RotateCcw className="w-4 h-4" />{t.reshuffle}</button>
      </motion.div>
    );
  }

  if (!round || !question) return shell(null);
  const roundLabel = t.round(state.rounds.length, state.roundsTotal);
  const QuestionCard = (
    <div className="border border-amber-500/30 bg-black/30 p-4">
      <p className="text-sky-50 text-base leading-snug">{question.text[state.lang]}</p>
      {question.kind === 'choice' && (
        <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm text-sky-200/80">
          {question.options.map((o, i) => <li key={i} className="border border-sky-700/40 px-2 py-1.5">{o[state.lang]}</li>)}
        </ul>
      )}
    </div>
  );

  // ==================== SHARED QUESTION ====================
  if (state.phase === 'question') {
    return shell(
      <motion.div key={round.questionId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <p className="text-sky-300/70 text-xs text-center" style={PIXEL}>{roundLabel}</p>
        <p className="text-sky-200/80 text-sm">{t.questionForAll}</p>
        {QuestionCard}
        <button onClick={() => dispatch({ type: 'SWAP_QUESTION', questionId: nextQuestion() })} className="w-full py-2.5 border border-sky-500/50 text-sky-200 text-sm flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" />{t.swap}</button>
        <button onClick={() => dispatch({ type: 'BEGIN_ANSWERS' })} className={primaryBtn} style={PIXEL}>{t.beginAnswers(state.players[round.starter])}</button>
      </motion.div>
    );
  }

  // ==================== BLIND PASS ====================
  if (state.phase === 'pass') {
    const player = pendingPlayer(state)!;
    return shell(
      <motion.div key={`${state.lap}-${player}`} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center pt-6">
        <p className="text-sky-300/70 text-xs mb-6" style={PIXEL}>{roundLabel}</p>
        <p className="text-sky-200 mb-2">{t.passTo}</p>
        <p className="text-3xl sm:text-4xl font-bold mb-4 break-all" style={{ color: PLAYER_COLORS[player] }}>{state.players[player]}</p>
        <p className="text-sky-200/80 text-sm mb-10 max-w-sm">{state.lap === 'answer' ? t.passAnswerHint : t.passGuessHint}</p>
        <EyeOff className="w-12 h-12 text-sky-500/60 mb-10" />
        <button onClick={openSecretScreen} className="w-full py-4 border-2 text-sm font-bold" style={{ borderColor: PLAYER_COLORS[player], color: PLAYER_COLORS[player] }}>{t.imReady(state.players[player])}</button>
      </motion.div>
    );
  }

  // ==================== SECRET ANSWER ====================
  if (state.phase === 'answer') {
    const player = pendingPlayer(state)!;
    const complete = answer.trim() !== '' && prediction !== null;
    return shell(
      <motion.div key={`answer-${player}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: PLAYER_COLORS[player] }} className="font-bold">{state.players[player]}</span>
          <span className="text-sky-300/60">{roundLabel}</span>
        </div>
        <p className="text-sky-50 text-lg font-bold leading-snug">{question.text[state.lang]}</p>
        {question.kind === 'choice' ? (
          <div className="grid grid-cols-1 gap-2">
            {question.options.map((o, i) => (
              <button key={i} onClick={() => setAnswer(`opt:${i}`)} className={`text-left px-3 py-3 border text-sm ${answer === `opt:${i}` ? 'bg-amber-500/25 border-amber-300 text-white' : 'border-sky-600/50 text-sky-100'}`}>{o[state.lang]}</button>
            ))}
          </div>
        ) : (
          <div>
            <input
              value={answer}
              maxLength={TEXT_ANSWER_MAX}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={question.placeholder[state.lang]}
              aria-label={t.typeHere}
              className="w-full bg-black/40 border border-sky-600/50 px-3 py-3 text-sky-50 outline-none focus:border-amber-400"
            />
            <p className="text-right text-[11px] text-sky-300/50 mt-1">{answer.length}/{TEXT_ANSWER_MAX}</p>
          </div>
        )}
        <div className="border border-sky-500/30 bg-black/30 p-3">
          <p className="text-sky-50 text-sm mb-1">{t.predictTitle}</p>
          <p className="text-sky-300/60 text-xs mb-2">{t.predictHint(n - 1)}</p>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {Array.from({ length: n }, (_, k) => (
              <button key={k} onClick={() => setPrediction(k)} className={`h-10 border text-sm ${prediction === k ? 'bg-amber-500 border-amber-300 text-black font-bold' : 'border-sky-600/50 text-sky-200'}`}>{k}</button>
            ))}
          </div>
        </div>
        {!complete && <p className="text-sky-300/60 text-xs text-center">{t.completeFirst}</p>}
        <button disabled={!complete} onClick={() => complete && dispatch({ type: 'SUBMIT_ANSWER', value: answer, predicted: prediction! })} className={primaryBtn} style={PIXEL}>{t.hideAndPass}</button>
      </motion.div>
    );
  }

  // ==================== EVERYONE ANSWERED → PHONE TO THE TABLE ====================
  if (state.phase === 'collected') {
    return shell(
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center pt-6">
        <p className="text-sky-300/70 text-xs mb-6" style={PIXEL}>{roundLabel}</p>
        <Check className="w-14 h-14 text-emerald-400 mb-4" />
        <h2 className="text-xl font-bold mb-3">{t.collectedTitle}</h2>
        <p className="text-sky-200/80 text-sm mb-10 max-w-sm">{t.collectedHint}</p>
        <button onClick={() => dispatch({ type: 'SHOW_TABLE', cardOwners: shuffle(Array.from({ length: n }, (_, i) => i)) })} className={primaryBtn} style={PIXEL}>{t.openAnswers}</button>
      </motion.div>
    );
  }

  // ==================== ANONYMOUS ANSWERS ON THE TABLE ====================
  if (state.phase === 'table') {
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <p className="text-sky-300/70 text-xs text-center" style={PIXEL}>{roundLabel}</p>
        <p className="text-sky-50 font-bold leading-snug">{question.text[state.lang]}</p>
        <h2 className="text-amber-300 text-xs flex items-center gap-2" style={PIXEL}><MessageCircle className="w-4 h-4" />{t.tableTitle}</h2>
        <div className="space-y-2">
          {round.cardOwners.map((owner, c) => (
            <div key={c} className="flex items-start gap-3 border border-sky-500/30 bg-black/30 p-3">
              <span className="w-8 h-8 shrink-0 flex items-center justify-center border border-amber-400/60 text-amber-300 text-xs" style={PIXEL}>{LETTERS[c]}</span>
              <p className="text-sky-50 text-base pt-1 break-words min-w-0">{answerText(question, round.answers[owner].value, state.lang)}</p>
            </div>
          ))}
        </div>
        <p className="text-sky-200/80 text-sm">{t.tableHint}</p>
        <button onClick={() => dispatch({ type: 'BEGIN_GUESSES' })} className={primaryBtn} style={PIXEL}>{t.beginGuesses(state.players[round.starter])}</button>
      </motion.div>
    );
  }

  // ==================== SECRET MATCHING ====================
  if (state.phase === 'guess') {
    const player = pendingPlayer(state)!;
    const complete = assignment.length === n && assignment.every((a) => a !== null);
    const assign = (card: number, who: number) =>
      setAssignment((prev) => prev.map((a, c) => (c === card ? who : a === who && prev[card] !== who ? null : a)));
    return shell(
      <motion.div key={`guess-${player}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: PLAYER_COLORS[player] }} className="font-bold">{state.players[player]}</span>
          <span className="text-sky-300/60">{roundLabel}</span>
        </div>
        <h2 className="text-lg font-bold">{t.guessTitle}</h2>
        <p className="text-sky-200/70 text-sm">{t.guessHint}</p>
        {round.cardOwners.map((owner, c) => {
          const own = owner === player;
          return (
            <div key={c} className={`border p-3 ${own ? 'border-sky-700/40 bg-sky-950/30 opacity-70' : 'border-sky-500/30 bg-black/30'}`}>
              <div className="flex items-start gap-3 mb-2">
                <span className="w-7 h-7 shrink-0 flex items-center justify-center border border-amber-400/60 text-amber-300 text-[10px]" style={PIXEL}>{LETTERS[c]}</span>
                <p className="text-sky-50 pt-0.5 break-words min-w-0">{answerText(question, round.answers[owner].value, state.lang)}</p>
              </div>
              {own ? (
                <p className="text-xs text-sky-300/70 pl-10">{t.mine}</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pl-10">
                  {state.players.map((name, p) =>
                    p === player ? null : (
                      <button
                        key={p}
                        onClick={() => assign(c, p)}
                        className={`px-2.5 py-1.5 text-xs border ${assignment[c] === p ? 'text-black font-bold' : 'text-sky-100 border-sky-600/50'}`}
                        style={assignment[c] === p ? { background: PLAYER_COLORS[p], borderColor: PLAYER_COLORS[p] } : undefined}
                      >
                        {name}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
        {!complete && <p className="text-sky-300/60 text-xs text-center">{t.completeGuess}</p>}
        <button disabled={!complete} onClick={() => complete && dispatch({ type: 'SUBMIT_GUESS', assignment: assignment as number[] })} className={primaryBtn} style={PIXEL}>{t.hideAndPass}</button>
      </motion.div>
    );
  }

  // ==================== REVEAL ====================
  if (state.phase === 'reveal' && result) {
    const isLast = state.rounds.length >= state.roundsTotal;
    const fact = FACTS[(state.rounds.length - 1) % FACTS.length];
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <p className="text-sky-300/70 text-xs text-center" style={PIXEL}>{roundLabel}</p>
        <h2 className="text-amber-300 text-sm text-center" style={PIXEL}>{t.revealTitle}</h2>
        <p className="text-sky-50 font-bold leading-snug">{question.text[state.lang]}</p>
        {round.cardOwners.map((owner, c) => {
          const o = result.owners[owner];
          return (
            <div key={c} className="border border-sky-500/30 bg-black/30 p-3">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 shrink-0 flex items-center justify-center border border-amber-400/60 text-amber-300 text-[10px]" style={PIXEL}>{LETTERS[c]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sky-50 break-words">{answerText(question, round.answers[owner].value, state.lang)}</p>
                  <p className="text-sm mt-1">{t.writtenBy} <b style={{ color: PLAYER_COLORS[owner] }}>{state.players[owner]}</b></p>
                  <p className="text-xs text-sky-200/70 mt-1">
                    {t.recognisedBy}: {o.identifiedBy.length ? o.identifiedBy.map((p) => state.players[p]).join(', ') : t.nobody}
                  </p>
                  <p className={`text-xs mt-0.5 ${o.johari === JOHARI_EXACT_POINTS ? 'text-emerald-300' : o.johari ? 'text-amber-200' : 'text-sky-300/60'}`}>
                    {t.predicted(o.predicted, o.actual)}{o.johari ? ` · +${o.johari}` : ''}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div className="border border-sky-500/30 bg-black/30 p-3">
          <p className="text-amber-300 text-xs mb-2 flex items-center gap-2"><Trophy className="w-4 h-4" />{t.roundPoints}</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-sky-300/60 text-[11px]">
                <th className="text-left font-normal">&nbsp;</th>
                <th className="font-normal">{t.detectCol}</th>
                <th className="font-normal">{t.johariCol}</th>
                <th className="text-right font-normal">{t.total}</th>
              </tr>
            </thead>
            <tbody>
              {[...result.players].sort((a, b) => b.total - a.total).map((p) => (
                <tr key={p.player} className="border-t border-sky-800/40">
                  <td className="py-1.5 truncate max-w-[120px]" style={{ color: PLAYER_COLORS[p.player] }}>{state.players[p.player]}</td>
                  <td className="text-center">{p.detectPoints}</td>
                  <td className="text-center">{p.johari}</td>
                  <td className="text-right font-bold">{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border border-amber-400/30 bg-amber-500/5 p-3">
          <p className="text-amber-300 text-xs mb-1 flex items-center gap-2"><Lightbulb className="w-4 h-4" />{t.didYouKnow}</p>
          <p className="text-sky-50/85 text-sm leading-relaxed">{fact[state.lang]}</p>
        </div>
        <button
          onClick={() => {
            if (isLast && !expAwarded) {
              addExp(50);
              setExpAwarded(true);
            }
            dispatch({ type: 'NEXT_ROUND', questionId: nextQuestion() });
          }}
          className={primaryBtn}
          style={PIXEL}
        >
          {isLast ? t.seeFinal : t.nextRound}
        </button>
      </motion.div>
    );
  }

  // ==================== FINAL ====================
  if (state.phase === 'final' && stats) {
    const nameList = (ids: number[]) => ids.map((i) => state.players[i]).join(', ');
    const awards: [string, number[]][] = [
      [t.awards.detective, stats.bestDetective],
      [t.awards.selfAware, stats.mostSelfAware],
      [t.awards.openBook, stats.openBook],
      [t.awards.surprises, stats.fullOfSurprises],
    ];
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-center text-amber-300 text-sm" style={PIXEL}>{t.finalTitle}</h2>
        <div className="space-y-2">
          {stats.players.map((p, rank) => (
            <div key={p.player} className={`flex items-center gap-3 border p-3 ${rank === 0 ? 'border-amber-400 bg-amber-500/10' : 'border-sky-600/40 bg-black/30'}`}>
              <span className="w-6 text-center text-sky-300" style={PIXEL}>{rank + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate" style={{ color: PLAYER_COLORS[p.player] }}>{state.players[p.player]}</p>
                <p className="text-xs text-sky-200/80">{p.detectRate}% {t.detectRate} · {p.recognisedRate}% {t.recognisedRate}</p>
              </div>
              <span className="text-lg font-bold">{p.total}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {awards.map(([label, ids]) => (
            <div key={label} className="border border-sky-600/40 bg-black/30 p-3">
              <p className="text-sky-300/70 text-xs">{label}</p>
              <p className="font-bold text-sm">{nameList(ids)}</p>
            </div>
          ))}
        </div>
        <button onClick={() => arrangeSeats(state.players, state.roundsTotal)} className={`${primaryBtn} flex items-center justify-center gap-2`} style={PIXEL}>
          <RotateCcw className="w-4 h-4" />{t.playAgain}
        </button>
        <button onClick={() => { setNames(state.players); setRoundsTotal(state.roundsTotal); dispatch({ type: 'SHOW_SETUP' }); }} className="w-full py-3 border border-sky-500/50 text-sky-200 text-[10px]" style={PIXEL}>{t.newPlayers}</button>
      </motion.div>
    );
  }

  return shell(null);
}
