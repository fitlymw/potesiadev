import { useEffect, useMemo, useReducer, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, X, Plus, Trash2, EyeOff, Eye, Star, Trophy, Users, Lightbulb, RotateCcw, Drama, Timer, Play, Pause, Vote, AlertTriangle } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { RoundTable } from '@/components/games/party/RoundTable';
import { PLAYER_COLORS } from '@/components/games/party/colors';
import { EMOTION_SCENARIOS, CATEGORY_LABEL, type EmotionScenario } from '@/data/emotionScenarios';
import {
  reducer,
  initialState,
  currentRound,
  pendingPlayer,
  speakingOrder,
  tally,
  roundResult,
  finalStats,
  scenarioPool,
  lastChanceOptions,
  validatePlayers,
  shuffleSeats,
  shuffle,
  MIN_PLAYERS,
  MAX_PLAYERS,
  ROUND_OPTIONS,
  DIFFICULTY_OPTIONS,
  CORRECT_VOTE_POINTS,
  ESCAPE_POINTS,
  LAST_GUESS_POINTS,
  BEST_CLUE_POINTS,
  type DifficultySetting,
  type GameState,
  type Lang,
} from '@/lib/party/emotionImpostor';

const STORAGE_KEY = 'emotion-impostor-game';
const SCENARIO_BY_ID = Object.fromEntries(EMOTION_SCENARIOS.map((s) => [s.id, s])) as Record<string, EmotionScenario>;
const PIXEL = { fontFamily: '"Press Start 2P", cursive' };
const DISCUSSION_SECONDS = 90;

const UI = {
  en: {
    title: 'EMOTION IMPOSTOR',
    tagline: 'Everyone feels it — except one.',
    howTitle: 'How to play',
    howIntro: `A social deduction party game for ${MIN_PLAYERS}–${MAX_PLAYERS} players with one phone that gets passed around.`,
    steps: [
      'Enter everyone’s name, then choose rounds and difficulty. The app shuffles you into a random seating order — sit around the table as shown.',
      'Roles: the phone goes to the left. Each player presses and holds to see their role in secret. Citizens see a situation and the emotion it causes. One player is the Impostor and only sees the category.',
      'Clues: put the phone on the table. Going around the table, everyone says ONE sentence about how they would react or feel — without naming the emotion or the situation.',
      'Discuss who seems to be guessing. The Impostor tries to blend in using the others’ clues.',
      'Vote: the phone goes to the left again and everyone secretly votes for a suspect. The player with the most votes is accused; a tie means the Impostor escapes.',
      'If the Impostor is caught, they get one last chance: pick the real situation out of four. A correct pick still wins the round!',
      'Everyone gets a turn as the Impostor before anyone goes twice.',
    ],
    pointsTitle: 'Points',
    points: [
      `Citizens: +${CORRECT_VOTE_POINTS} for voting for the Impostor.`,
      `Impostor: +${ESCAPE_POINTS} for escaping, +${LAST_GUESS_POINTS} for guessing the situation after being caught.`,
      `Best clue (chosen together after the round): +${BEST_CLUE_POINTS}.`,
    ],
    cluesTitle: 'Good clues',
    clueRules: [
      'Too obvious and the Impostor learns the situation; too vague and you look suspicious.',
      'Describe a reaction, an action or a feeling — e.g. “I’d smile, then go quiet for the rest of the day.”',
      'Don’t say the emotion word or details of the situation.',
    ],
    note: 'This is a party game for practising reading emotions in context, not an EQ test. Situations are everyday and light. Everything stays on this phone.',
    toSetup: 'SET UP PLAYERS',
    setupTitle: 'Players',
    setupHint: `Enter ${MIN_PLAYERS}–${MAX_PLAYERS} names.`,
    playerPlaceholder: (i: number) => `Player ${i + 1}`,
    addPlayer: 'Add player',
    roundsLabel: 'Number of rounds',
    difficultyLabel: 'Difficulty',
    difficulty: { easy: 'Easy', medium: 'Medium', hard: 'Hard', mixed: 'Mixed' } as Record<DifficultySetting, string>,
    difficultyHint: {
      easy: 'One clear emotion.',
      medium: 'A nuanced emotion, or one being held back.',
      hard: 'Two mixed emotions at once.',
      mixed: 'A mix of all levels.',
    } as Record<DifficultySetting, string>,
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
    passTo: 'Hand the phone to',
    passRoleHint: 'Your turn to see your secret role.',
    passVoteHint: 'Your turn to vote — in secret.',
    imReady: (name: string) => `I’m ${name} — continue`,
    holdToSee: 'PRESS & HOLD TO SEE YOUR ROLE',
    releaseToHide: 'Release to hide',
    youAreCitizen: 'You are a CITIZEN',
    youAreImpostor: 'You are the IMPOSTOR',
    situation: 'Situation',
    emotion: 'Emotion',
    category: 'Category',
    citizenTip: 'Give a clue about your reaction without saying the emotion or the situation directly.',
    impostorTip: 'You don’t know the situation. Listen to the others’ clues and give one that sounds convincing. If you are caught, you can still win by guessing the situation.',
    seenPass: 'GOT IT — HIDE & PASS',
    holdFirst: 'Press and hold the box above first.',
    cluesTitle2: 'Clue round',
    cluesIntro: 'Put the phone in the middle of the table. Each player says ONE sentence, in this order:',
    discussion: 'Discussion',
    start: 'Start',
    pause: 'Pause',
    reset: 'Reset',
    beginVoting: (name: string) => `START VOTING — PHONE TO ${name.toUpperCase()}`,
    voteTitle: 'Who is the Impostor?',
    voteHint: 'Tap one player. Your vote is secret.',
    voteConfirm: 'VOTE — HIDE & PASS',
    tallyTitle: 'Voting results',
    votes: (n: number) => `${n} vote${n === 1 ? '' : 's'}`,
    accused: (name: string) => `Most votes: ${name}`,
    tie: 'It’s a tie — nobody is accused.',
    revealRole: (name: string) => `REVEAL ${name.toUpperCase()}’S ROLE`,
    revealImpostor: 'REVEAL THE IMPOSTOR',
    caughtTitle: (name: string) => `Caught! ${name} is the Impostor.`,
    lastChanceHint: (name: string) => `${name}, one last chance: which situation did the citizens have? Pick it to still win the round.`,
    outcome: {
      caught: 'Citizens win! The Impostor was caught.',
      caughtButGuessed: 'The Impostor was caught — but guessed the situation and still wins!',
      escapedTie: 'The Impostor escapes — the vote was a tie.',
      escapedWrong: (name: string) => `The Impostor escapes — ${name} was innocent.`,
    },
    theImpostor: 'The Impostor',
    theSituation: 'The situation',
    lastGuessWas: (s: string) => `Last guess: “${s}”`,
    whoVoted: 'Votes',
    roundPoints: 'Round points',
    bestClueTitle: 'Who gave the best clue? (decide together)',
    skip: 'Skip',
    didYouKnow: 'Did you know?',
    nextRound: 'NEXT ROUND',
    seeFinal: 'SEE FINAL RESULTS',
    finalTitle: 'FINAL RESULTS',
    stats: (votes: number, wins: number) => `${votes} correct vote${votes === 1 ? '' : 's'} · ${wins} Impostor win${wins === 1 ? '' : 's'}`,
    awards: { detective: 'Emotion detective', actor: 'Best actor', clue: 'Best clue giver' },
    none: '—',
    playAgain: 'PLAY AGAIN (SAME PLAYERS)',
    newPlayers: 'NEW PLAYERS',
    backToGames: 'Back to games',
    confirmExit: 'Leave the game? Progress will be lost.',
  },
  id: {
    title: 'EMOTION IMPOSTOR',
    tagline: 'Semua merasakannya — kecuali satu orang.',
    howTitle: 'Cara bermain',
    howIntro: `Party game tebak-tebakan sosial untuk ${MIN_PLAYERS}–${MAX_PLAYERS} pemain dengan satu HP yang dioper bergantian.`,
    steps: [
      'Masukkan nama semua pemain, lalu pilih jumlah ronde dan tingkat kesulitan. Aplikasi akan mengacak urutan duduk — duduklah melingkar sesuai gambar.',
      'Peran: HP dioper ke kiri. Setiap pemain menekan dan menahan layar untuk melihat perannya secara rahasia. Warga melihat sebuah situasi dan emosi yang muncul. Satu pemain adalah Impostor dan hanya melihat kategorinya.',
      'Petunjuk: taruh HP di tengah meja. Bergiliran mengelilingi meja, setiap pemain mengucapkan SATU kalimat tentang reaksi atau perasaannya — tanpa menyebut emosi atau situasinya.',
      'Diskusikan siapa yang kelihatannya menebak-nebak. Impostor berusaha membaur dengan memanfaatkan petunjuk pemain lain.',
      'Voting: HP dioper ke kiri lagi dan setiap pemain memilih tersangka secara rahasia. Pemain dengan suara terbanyak tertuduh; jika seri, Impostor lolos.',
      'Jika Impostor tertangkap, ia mendapat satu kesempatan terakhir: memilih situasi yang benar dari empat pilihan. Kalau tepat, ia tetap memenangkan ronde!',
      'Setiap pemain mendapat giliran menjadi Impostor sebelum ada yang mendapat giliran kedua.',
    ],
    pointsTitle: 'Poin',
    points: [
      `Warga: +${CORRECT_VOTE_POINTS} kalau memilih Impostor.`,
      `Impostor: +${ESCAPE_POINTS} kalau lolos, +${LAST_GUESS_POINTS} kalau tertangkap tapi menebak situasinya dengan benar.`,
      `Petunjuk terbaik (dipilih bersama setelah ronde): +${BEST_CLUE_POINTS}.`,
    ],
    cluesTitle: 'Petunjuk yang bagus',
    clueRules: [
      'Terlalu jelas, Impostor jadi tahu situasinya; terlalu samar, kamu malah dicurigai.',
      'Ceritakan reaksi, tindakan, atau perasaan — misalnya "Aku bakal senyum, terus diam seharian."',
      'Jangan sebut kata emosinya atau detail situasinya.',
    ],
    note: 'Ini party game untuk berlatih membaca emosi sesuai konteks, bukan tes EQ. Situasinya sehari-hari dan ringan. Semua data hanya tersimpan di HP ini.',
    toSetup: 'ATUR PEMAIN',
    setupTitle: 'Pemain',
    setupHint: `Masukkan ${MIN_PLAYERS}–${MAX_PLAYERS} nama.`,
    playerPlaceholder: (i: number) => `Pemain ${i + 1}`,
    addPlayer: 'Tambah pemain',
    roundsLabel: 'Jumlah ronde',
    difficultyLabel: 'Tingkat kesulitan',
    difficulty: { easy: 'Mudah', medium: 'Sedang', hard: 'Sulit', mixed: 'Campur' } as Record<DifficultySetting, string>,
    difficultyHint: {
      easy: 'Satu emosi yang jelas.',
      medium: 'Emosi yang lebih halus, atau yang sedang ditahan.',
      hard: 'Dua emosi campur aduk sekaligus.',
      mixed: 'Campuran semua tingkat.',
    } as Record<DifficultySetting, string>,
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
    passTo: 'Serahkan HP ke',
    passRoleHint: 'Giliranmu melihat peran rahasiamu.',
    passVoteHint: 'Giliranmu memilih — secara rahasia.',
    imReady: (name: string) => `Saya ${name} — lanjut`,
    holdToSee: 'TEKAN & TAHAN UNTUK MELIHAT PERANMU',
    releaseToHide: 'Lepas untuk menyembunyikan',
    youAreCitizen: 'Kamu WARGA',
    youAreImpostor: 'Kamu IMPOSTOR',
    situation: 'Situasi',
    emotion: 'Emosi',
    category: 'Kategori',
    citizenTip: 'Beri petunjuk tentang reaksimu tanpa menyebut emosi atau situasinya secara langsung.',
    impostorTip: 'Kamu tidak tahu situasinya. Dengarkan petunjuk pemain lain, lalu beri petunjuk yang terdengar meyakinkan. Kalau tertangkap, kamu masih bisa menang dengan menebak situasinya.',
    seenPass: 'SUDAH — SEMBUNYIKAN & OPER',
    holdFirst: 'Tekan dan tahan kotak di atas dulu.',
    cluesTitle2: 'Putaran petunjuk',
    cluesIntro: 'Taruh HP di tengah meja. Setiap pemain mengucapkan SATU kalimat, dengan urutan:',
    discussion: 'Diskusi',
    start: 'Mulai',
    pause: 'Jeda',
    reset: 'Ulang',
    beginVoting: (name: string) => `MULAI VOTING — HP KE ${name.toUpperCase()}`,
    voteTitle: 'Siapa Impostor-nya?',
    voteHint: 'Ketuk satu pemain. Pilihanmu rahasia.',
    voteConfirm: 'PILIH — SEMBUNYIKAN & OPER',
    tallyTitle: 'Hasil voting',
    votes: (n: number) => `${n} suara`,
    accused: (name: string) => `Suara terbanyak: ${name}`,
    tie: 'Hasilnya seri — tidak ada yang tertuduh.',
    revealRole: (name: string) => `UNGKAP PERAN ${name.toUpperCase()}`,
    revealImpostor: 'UNGKAP IMPOSTOR',
    caughtTitle: (name: string) => `Tertangkap! ${name} adalah Impostor.`,
    lastChanceHint: (name: string) => `${name}, kesempatan terakhir: situasi apa yang dimiliki warga? Pilih yang benar untuk tetap memenangkan ronde.`,
    outcome: {
      caught: 'Warga menang! Impostor tertangkap.',
      caughtButGuessed: 'Impostor tertangkap — tapi menebak situasinya dengan benar dan tetap menang!',
      escapedTie: 'Impostor lolos — hasil voting seri.',
      escapedWrong: (name: string) => `Impostor lolos — ${name} ternyata warga biasa.`,
    },
    theImpostor: 'Impostor-nya',
    theSituation: 'Situasinya',
    lastGuessWas: (s: string) => `Tebakan terakhir: "${s}"`,
    whoVoted: 'Pilihan suara',
    roundPoints: 'Poin ronde ini',
    bestClueTitle: 'Siapa yang memberi petunjuk terbaik? (putuskan bersama)',
    skip: 'Lewati',
    didYouKnow: 'Tahukah kamu?',
    nextRound: 'RONDE BERIKUTNYA',
    seeFinal: 'LIHAT HASIL AKHIR',
    finalTitle: 'HASIL AKHIR',
    stats: (votes: number, wins: number) => `${votes} tebakan benar · ${wins} kali menang sebagai Impostor`,
    awards: { detective: 'Detektor emosi', actor: 'Aktor terbaik', clue: 'Pemberi petunjuk terbaik' },
    none: '—',
    playAgain: 'MAIN LAGI (PEMAIN SAMA)',
    newPlayers: 'PEMAIN BARU',
    backToGames: 'Kembali ke games',
    confirmExit: 'Keluar dari permainan? Progres akan hilang.',
  },
};

/** Short emotion-science notes shown on the reveal screen (one per round). */
const FACTS: { en: string; id: string }[] = [
  {
    en: 'People who can name their feelings precisely (“disappointed” rather than just “bad”) tend to regulate emotions better. Psychologists call this emotional granularity (Lisa Feldman Barrett and colleagues).',
    id: 'Orang yang bisa menamai perasaannya dengan tepat ("kecewa", bukan sekadar "tidak enak") cenderung lebih baik mengelola emosinya. Psikolog menyebutnya emotional granularity (Lisa Feldman Barrett dan rekan).',
  },
  {
    en: 'We can feel happy and sad at the same time — research on mixed emotions (Larsen, McGraw & Cacioppo, 2001) found exactly that in bittersweet moments like graduations.',
    id: 'Kita bisa merasa senang dan sedih sekaligus — penelitian tentang emosi campuran (Larsen, McGraw & Cacioppo, 2001) menemukan hal ini pada momen haru seperti wisuda.',
  },
  {
    en: 'Rethinking a situation (“maybe they’re just busy”) usually works better than simply hiding a feeling. Gross & John (2003) call these reappraisal and suppression.',
    id: 'Memaknai ulang situasi ("mungkin dia sedang sibuk") biasanya lebih efektif daripada sekadar menyembunyikan perasaan. Gross & John (2003) menyebutnya reappraisal dan suppression.',
  },
  {
    en: 'Putting a feeling into words can make it less intense — “affect labeling” (Lieberman and colleagues, 2007). Saying “I’m anxious” is already a small step.',
    id: 'Mengungkapkan perasaan dengan kata-kata bisa meredakan intensitasnya — disebut "affect labeling" (Lieberman dan rekan, 2007). Mengatakan "aku cemas" sudah merupakan langkah kecil.',
  },
  {
    en: 'The same face can look angry or triumphant depending on the context around it (Aviezer and colleagues, 2008). That is exactly why the Impostor struggles without the situation.',
    id: 'Wajah yang sama bisa terlihat marah atau bangga tergantung konteks di sekitarnya (Aviezer dan rekan, 2008). Itulah sebabnya Impostor kesulitan tanpa mengetahui situasinya.',
  },
  {
    en: 'Empathy has two sides: understanding what someone feels (cognitive empathy) and feeling it with them (affective empathy). Good clues need the first one.',
    id: 'Empati punya dua sisi: memahami apa yang dirasakan orang lain (empati kognitif) dan ikut merasakannya (empati afektif). Petunjuk yang bagus membutuhkan sisi yang pertama.',
  },
];

function HowToContent({ lang }: { lang: Lang }) {
  const t = UI[lang];
  return (
    <div className="space-y-4 text-left">
      <p className="text-rose-100/90 text-sm">{t.howIntro}</p>
      <ol className="space-y-3">
        {t.steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-rose-50/90 leading-relaxed">
            <span className="shrink-0 w-7 h-7 flex items-center justify-center border border-orange-400/60 text-orange-300 text-xs" style={PIXEL}>{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="border border-rose-500/30 bg-rose-950/40 p-3">
        <p className="text-orange-300 text-xs mb-2 flex items-center gap-2"><Star className="w-4 h-4" />{t.pointsTitle}</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-rose-100/85">{t.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
      </div>
      <div className="border border-rose-500/30 bg-rose-950/40 p-3">
        <p className="text-orange-300 text-xs mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4" />{t.cluesTitle}</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-rose-100/85">{t.clueRules.map((r, i) => <li key={i}>{r}</li>)}</ul>
      </div>
      <p className="text-rose-200/60 text-xs leading-relaxed">{t.note}</p>
    </div>
  );
}

function DiscussionTimer({ label, startLabel, pauseLabel, resetLabel }: { label: string; startLabel: string; pauseLabel: string; resetLabel: string }) {
  const [remaining, setRemaining] = useState(DISCUSSION_SECONDS);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);
  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, '0');
  return (
    <div className="border border-rose-500/30 bg-black/30 p-3 flex items-center gap-3">
      <Timer className="w-5 h-5 text-orange-300" />
      <div className="flex-1">
        <p className="text-rose-200/70 text-xs">{label}</p>
        <p className={`text-2xl font-bold ${remaining === 0 ? 'text-red-400' : 'text-rose-50'}`}>{mm}:{ss}</p>
      </div>
      <button onClick={() => setRunning((r) => !r)} disabled={remaining === 0} className="px-3 py-2 border border-orange-400/60 text-orange-200 text-sm flex items-center gap-1 disabled:opacity-40">
        {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}{running ? pauseLabel : startLabel}
      </button>
      <button onClick={() => { setRunning(false); setRemaining(DISCUSSION_SECONDS); }} className="px-3 py-2 border border-rose-600/50 text-rose-200 text-sm">{resetLabel}</button>
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
export function EmotionImpostor() {
  const navigate = useNavigate();
  const { addExp } = useGamification();
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [showHelp, setShowHelp] = useState(false);
  const [names, setNames] = useState<string[]>(() => (state.players.length ? state.players : Array(MIN_PLAYERS).fill('')));
  const [roundsTotal, setRoundsTotal] = useState<number>(state.roundsTotal);
  const [difficulty, setDifficulty] = useState<DifficultySetting>(state.difficulty);
  const [holding, setHolding] = useState(false);
  const [seenOnce, setSeenOnce] = useState(false);
  const [suspect, setSuspect] = useState<number | null>(null);
  const [expAwarded, setExpAwarded] = useState(false);
  const t = UI[state.lang];
  const round = currentRound(state);
  const n = state.players.length;
  const scenario = round ? SCENARIO_BY_ID[round.scenarioId] : undefined;
  const inGame = ['pass', 'role', 'clues', 'vote', 'tally', 'lastChance', 'reveal'].includes(state.phase);

  useEffect(() => {
    try {
      if (state.phase === 'howto' || state.phase === 'setup') sessionStorage.removeItem(STORAGE_KEY);
      else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable: the game still works, it just cannot be resumed
    }
  }, [state]);

  useEffect(() => {
    if (!inGame) return;
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> } };
    nav.wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => {});
    return () => { lock?.release().catch(() => {}); };
  }, [inGame]);

  const result = useMemo(() => (round && state.phase === 'reveal' ? roundResult(round, n) : null), [round, state.phase, n]);
  const stats = useMemo(() => (state.phase === 'final' ? finalStats(state) : null), [state]);

  const nextScenario = () => {
    const pool = scenarioPool(EMOTION_SCENARIOS, state.difficulty).map((s) => s.id);
    const fresh = pool.filter((id) => !state.usedScenarioIds.includes(id));
    return shuffle(fresh.length ? fresh : pool)[0];
  };

  const arrangeSeats = (list: string[], rounds: number, level: DifficultySetting) => {
    if (validatePlayers(list) !== null) return;
    const seats = shuffleSeats(list);
    dispatch({ type: 'ARRANGE', players: seats, roundsTotal: rounds, difficulty: level, impostorOrder: shuffle(seats.map((_, i) => i)) });
  };

  const openSecretScreen = () => {
    setHolding(false);
    setSeenOnce(false);
    setSuspect(null);
    dispatch({ type: 'CONFIRM_PASS' });
  };

  const exit = () => {
    if (inGame && !window.confirm(t.confirmExit)) return;
    dispatch({ type: 'RESET' });
    navigate('/games');
  };

  const shell = (children: React.ReactNode) => (
    <div className="fixed inset-0 z-50 bg-[#160a0e] text-rose-50 overflow-auto font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-10"><div className="scanlines h-full w-full" /></div>
      <div className="relative z-10 min-h-full flex flex-col items-center px-4 pt-4 pb-12">
        <div className="w-full max-w-xl flex items-center justify-between mb-4">
          <button onClick={exit} className="p-2 border border-rose-500/40 text-rose-300 hover:bg-rose-500/10" aria-label={t.backToGames}><ArrowLeft className="w-5 h-5" /></button>
          <span className="text-orange-300 text-[10px] sm:text-xs" style={PIXEL}>{t.title}</span>
          {state.phase !== 'howto' ? (
            <button onClick={() => setShowHelp(true)} className="p-2 border border-rose-500/40 text-rose-300 hover:bg-rose-500/10" aria-label={t.howAgain}><HelpCircle className="w-5 h-5" /></button>
          ) : (
            <span className="w-9" />
          )}
        </div>
        <div className="w-full max-w-xl">{children}</div>
      </div>
      <AnimatePresence>
        {showHelp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/85 overflow-auto p-4 flex justify-center">
            <div className="w-full max-w-xl bg-[#221016] border border-orange-500/40 p-5 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-orange-300 text-xs" style={PIXEL}>{t.howTitle}</h2>
                <button onClick={() => setShowHelp(false)} className="p-1 text-rose-300" aria-label="close"><X className="w-5 h-5" /></button>
              </div>
              <HowToContent lang={state.lang} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const primaryBtn = 'w-full py-4 border-2 border-orange-400 bg-orange-500/15 text-orange-100 text-[10px] sm:text-xs disabled:opacity-40';

  // ==================== HOW TO PLAY ====================
  if (state.phase === 'howto') {
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
        <Drama className="w-14 h-14 text-orange-400 mb-3" strokeWidth={1.5} />
        <h1 className="text-lg sm:text-2xl text-orange-300 mb-2 text-center" style={PIXEL}>{t.title}</h1>
        <p className="text-rose-200/70 text-sm mb-4 text-center">{t.tagline}</p>
        <div className="flex gap-2 mb-5">
          {(['id', 'en'] as Lang[]).map((l) => (
            <button key={l} onClick={() => dispatch({ type: 'SET_LANG', lang: l })} className={`px-4 py-2 border text-[10px] ${state.lang === l ? 'border-orange-400 bg-orange-500/20 text-orange-100' : 'border-rose-700 text-rose-400'}`} style={PIXEL}>
              {l === 'id' ? 'INDONESIA' : 'ENGLISH'}
            </button>
          ))}
        </div>
        <div className="w-full border border-orange-500/30 bg-rose-950/30 p-4 sm:p-5 mb-5">
          <h2 className="text-orange-300 text-xs mb-4" style={PIXEL}>{t.howTitle}</h2>
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
        <h1 className="text-orange-300 text-sm mb-1 flex items-center gap-2" style={PIXEL}><Users className="w-5 h-5" />{t.setupTitle}</h1>
        <p className="text-rose-200/70 text-sm mb-4">{t.setupHint}</p>
        <div className="space-y-2 mb-3">
          {names.map((name, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={name}
                maxLength={16}
                onChange={(e) => { const value = e.target.value; setNames((prev) => prev.map((x, j) => (j === i ? value : x))); }}
                placeholder={t.playerPlaceholder(i)}
                className="flex-1 min-w-0 bg-black/40 border border-rose-600/50 px-3 py-2.5 text-rose-50 outline-none focus:border-orange-400"
              />
              {names.length > MIN_PLAYERS && (
                <button onClick={() => setNames((prev) => prev.filter((_, j) => j !== i))} className="p-2 text-rose-400 hover:text-red-400" aria-label="remove"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          ))}
        </div>
        {names.length < MAX_PLAYERS && (
          <button onClick={() => setNames((prev) => [...prev, ''])} className="flex items-center gap-2 text-sm text-orange-300 mb-4"><Plus className="w-4 h-4" />{t.addPlayer}</button>
        )}
        <p className="text-rose-200/80 text-sm mb-2">{t.roundsLabel}</p>
        <div className="flex gap-2 mb-4">
          {ROUND_OPTIONS.map((r) => (
            <button key={r} onClick={() => setRoundsTotal(r)} className={`flex-1 py-2.5 border text-sm ${roundsTotal === r ? 'border-orange-400 bg-orange-500/20 text-orange-100 font-bold' : 'border-rose-600/50 text-rose-200'}`}>{r}</button>
          ))}
        </div>
        <p className="text-rose-200/80 text-sm mb-2">{t.difficultyLabel}</p>
        <div className="grid grid-cols-4 gap-2 mb-1">
          {DIFFICULTY_OPTIONS.map((d) => (
            <button key={d} onClick={() => setDifficulty(d)} className={`py-2.5 border text-sm ${difficulty === d ? 'border-orange-400 bg-orange-500/20 text-orange-100 font-bold' : 'border-rose-600/50 text-rose-200'}`}>{t.difficulty[d]}</button>
          ))}
        </div>
        <p className="text-rose-200/60 text-xs mb-4">{t.difficultyHint[difficulty]}</p>
        {showError && <p className="text-amber-300 text-sm mb-3">{t.errors[error]}</p>}
        <button disabled={error !== null} onClick={() => arrangeSeats(names, roundsTotal, difficulty)} className={primaryBtn} style={PIXEL}>{t.shuffleSeats}</button>
        <button onClick={() => dispatch({ type: 'SHOW_HOWTO' })} className="w-full mt-3 py-2 text-sm text-rose-300 flex items-center justify-center gap-2"><HelpCircle className="w-4 h-4" />{t.howAgain}</button>
      </motion.div>
    );
  }

  // ==================== ROUND TABLE ====================
  if (state.phase === 'seating') {
    const first = state.players[0];
    return shell(
      <motion.div key={state.players.join('|')} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h1 className="text-orange-300 text-sm flex items-center gap-2" style={PIXEL}><Users className="w-5 h-5" />{t.seatingTitle}</h1>
        <p className="text-rose-100/90 text-sm leading-relaxed">{t.seatingIntro(first)}</p>
        <div className="border border-rose-500/30 bg-black/30 p-3">
          <RoundTable players={state.players} startsLabel={t.seatingStarts} />
          <p className="text-center text-rose-300/50 text-[11px] mt-1">{t.seatingView}</p>
        </div>
        <ol className="space-y-1.5">
          {state.players.map((name, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-bold text-[#160a0e]" style={{ background: PLAYER_COLORS[i] }}>{i + 1}</span>
              <span className="text-rose-50">{i === 0 ? <><b>{name}</b> — {t.seatingStarts}</> : t.seatingLeftOf(name, state.players[i - 1])}</span>
            </li>
          ))}
        </ol>
        <p className="text-rose-200/70 text-sm">{t.seatingPass}</p>
        <button onClick={() => { setExpAwarded(false); dispatch({ type: 'START', scenarioId: nextScenario() }); }} className={primaryBtn} style={PIXEL}>{t.seated}</button>
        <button onClick={() => arrangeSeats(state.players, state.roundsTotal, state.difficulty)} className="w-full py-3 border border-rose-500/50 text-rose-200 text-[10px] flex items-center justify-center gap-2" style={PIXEL}><RotateCcw className="w-4 h-4" />{t.reshuffle}</button>
      </motion.div>
    );
  }

  if (!round || !scenario) return shell(null);
  const roundLabel = t.round(state.rounds.length, state.roundsTotal);
  const impostorName = state.players[round.impostor];

  // ==================== BLIND PASS ====================
  if (state.phase === 'pass') {
    const player = pendingPlayer(state)!;
    return shell(
      <motion.div key={`${state.lap}-${player}`} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center pt-6">
        <p className="text-rose-300/70 text-xs mb-6" style={PIXEL}>{roundLabel}</p>
        <p className="text-rose-200 mb-2">{t.passTo}</p>
        <p className="text-3xl sm:text-4xl font-bold mb-4 break-all" style={{ color: PLAYER_COLORS[player] }}>{state.players[player]}</p>
        <p className="text-rose-200/80 text-sm mb-10 max-w-sm">{state.lap === 'role' ? t.passRoleHint : t.passVoteHint}</p>
        <EyeOff className="w-12 h-12 text-rose-500/60 mb-10" />
        <button onClick={openSecretScreen} className="w-full py-4 border-2 text-sm font-bold" style={{ borderColor: PLAYER_COLORS[player], color: PLAYER_COLORS[player] }}>{t.imReady(state.players[player])}</button>
      </motion.div>
    );
  }

  // ==================== SECRET ROLE (press & hold) ====================
  if (state.phase === 'role') {
    const player = pendingPlayer(state)!;
    const isImpostor = player === round.impostor;
    const show = () => { setHolding(true); setSeenOnce(true); };
    const hide = () => setHolding(false);
    return shell(
      <motion.div key={`role-${player}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: PLAYER_COLORS[player] }} className="font-bold">{state.players[player]}</span>
          <span className="text-rose-300/60">{roundLabel}</span>
        </div>
        <div
          role="button"
          tabIndex={0}
          aria-label={t.holdToSee}
          onPointerDown={show}
          onPointerUp={hide}
          onPointerLeave={hide}
          onPointerCancel={hide}
          onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') show(); }}
          onKeyUp={hide}
          onContextMenu={(e) => e.preventDefault()}
          className="min-h-[300px] border-2 border-dashed border-orange-400/60 bg-black/40 p-5 flex flex-col items-center justify-center text-center select-none touch-none cursor-pointer"
        >
          {holding ? (
            isImpostor ? (
              <div className="space-y-4">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
                <p className="text-2xl font-bold text-red-300">{t.youAreImpostor}</p>
                <p className="text-rose-100"><span className="text-rose-300/70 text-sm">{t.category}:</span><br /><span className="text-xl font-bold">{CATEGORY_LABEL[scenario.category][state.lang]}</span></p>
                <p className="text-rose-200/80 text-sm leading-relaxed">{t.impostorTip}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-2xl font-bold text-emerald-300">{t.youAreCitizen}</p>
                <div>
                  <p className="text-rose-300/70 text-sm">{t.situation}</p>
                  <p className="text-rose-50 text-lg leading-snug">{scenario.text[state.lang]}</p>
                </div>
                <div>
                  <p className="text-rose-300/70 text-sm">{t.emotion}</p>
                  <p className="text-orange-200 text-2xl font-bold">{scenario.emotion[state.lang]}</p>
                </div>
                <p className="text-rose-200/80 text-sm leading-relaxed">{t.citizenTip}</p>
              </div>
            )
          ) : (
            <>
              <Eye className="w-12 h-12 text-orange-300 mb-4" />
              <p className="text-orange-200 text-[10px] sm:text-xs leading-relaxed" style={PIXEL}>{t.holdToSee}</p>
            </>
          )}
        </div>
        <p className="text-rose-300/60 text-xs text-center">{holding ? t.releaseToHide : !seenOnce ? t.holdFirst : ' '}</p>
        <button disabled={!seenOnce || holding} onClick={() => dispatch({ type: 'ROLE_SEEN' })} className={primaryBtn} style={PIXEL}>{t.seenPass}</button>
      </motion.div>
    );
  }

  // ==================== CLUES (table) ====================
  if (state.phase === 'clues') {
    const order = speakingOrder(round, n);
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <p className="text-rose-300/70 text-xs text-center" style={PIXEL}>{roundLabel}</p>
        <h2 className="text-orange-300 text-sm flex items-center gap-2" style={PIXEL}><Drama className="w-5 h-5" />{t.cluesTitle2}</h2>
        <p className="text-rose-100/90 text-sm">{t.cluesIntro}</p>
        <ol className="space-y-1.5">
          {order.map((p, i) => (
            <li key={p} className="flex items-center gap-3 text-sm">
              <span className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-bold text-[#160a0e]" style={{ background: PLAYER_COLORS[p] }}>{i + 1}</span>
              <span className="text-rose-50">{state.players[p]}</span>
            </li>
          ))}
        </ol>
        <div className="border border-rose-500/30 bg-rose-950/30 p-3">
          <ul className="list-disc pl-5 space-y-1 text-sm text-rose-100/85">{t.clueRules.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
        <DiscussionTimer label={t.discussion} startLabel={t.start} pauseLabel={t.pause} resetLabel={t.reset} />
        <button onClick={() => dispatch({ type: 'BEGIN_VOTING' })} className={primaryBtn} style={PIXEL}>{t.beginVoting(state.players[round.starter])}</button>
      </motion.div>
    );
  }

  // ==================== SECRET VOTE ====================
  if (state.phase === 'vote') {
    const voter = pendingPlayer(state)!;
    return shell(
      <motion.div key={`vote-${voter}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: PLAYER_COLORS[voter] }} className="font-bold">{state.players[voter]}</span>
          <span className="text-rose-300/60">{roundLabel}</span>
        </div>
        <h2 className="text-lg font-bold flex items-center gap-2"><Vote className="w-5 h-5 text-orange-300" />{t.voteTitle}</h2>
        <p className="text-rose-200/70 text-sm">{t.voteHint}</p>
        <div className="grid grid-cols-2 gap-2">
          {state.players.map((name, p) =>
            p === voter ? null : (
              <button
                key={p}
                onClick={() => setSuspect(p)}
                className={`py-3 px-2 border text-sm truncate ${suspect === p ? 'text-black font-bold' : 'border-rose-600/50 text-rose-100'}`}
                style={suspect === p ? { background: PLAYER_COLORS[p], borderColor: PLAYER_COLORS[p] } : undefined}
              >
                {name}
              </button>
            )
          )}
        </div>
        <button disabled={suspect === null} onClick={() => suspect !== null && dispatch({ type: 'SUBMIT_VOTE', suspect })} className={primaryBtn} style={PIXEL}>{t.voteConfirm}</button>
      </motion.div>
    );
  }

  // ==================== TALLY (table) ====================
  if (state.phase === 'tally') {
    const tl = tally(round, n);
    const max = Math.max(1, ...tl.counts);
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <p className="text-rose-300/70 text-xs text-center" style={PIXEL}>{roundLabel}</p>
        <h2 className="text-orange-300 text-sm text-center" style={PIXEL}>{t.tallyTitle}</h2>
        <div className="space-y-2">
          {tl.counts.map((c, p) => ({ c, p })).sort((a, b) => b.c - a.c).map(({ c, p }) => (
            <div key={p} className="flex items-center gap-3 text-sm">
              <span className="w-24 truncate" style={{ color: PLAYER_COLORS[p] }}>{state.players[p]}</span>
              <div className="flex-1 h-4 bg-black/40 border border-rose-800/50">
                <div className="h-full" style={{ width: `${(c / max) * 100}%`, background: PLAYER_COLORS[p] }} />
              </div>
              <span className="w-16 text-right text-rose-200/80">{t.votes(c)}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-lg font-bold">{tl.accused !== null ? t.accused(state.players[tl.accused]) : t.tie}</p>
        {tl.caught ? (
          <button onClick={() => dispatch({ type: 'OPEN_LAST_CHANCE', options: lastChanceOptions(EMOTION_SCENARIOS, round.scenarioId) })} className={primaryBtn} style={PIXEL}>{t.revealRole(state.players[tl.accused!])}</button>
        ) : (
          <button onClick={() => dispatch({ type: 'FINISH_TALLY' })} className={primaryBtn} style={PIXEL}>{tl.accused !== null ? t.revealRole(state.players[tl.accused]) : t.revealImpostor}</button>
        )}
      </motion.div>
    );
  }

  // ==================== IMPOSTOR'S LAST CHANCE (table) ====================
  if (state.phase === 'lastChance') {
    return shell(
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
        <p className="text-rose-300/70 text-xs text-center" style={PIXEL}>{roundLabel}</p>
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-center text-red-300">{t.caughtTitle(impostorName)}</h2>
        <p className="text-rose-100/90 text-sm text-center">{t.lastChanceHint(impostorName)}</p>
        <div className="space-y-2">
          {round.lastChanceOptions.map((id) => (
            <button key={id} onClick={() => dispatch({ type: 'SUBMIT_LAST_GUESS', scenarioId: id })} className="w-full text-left px-3 py-3 border border-rose-600/50 text-rose-50 text-sm hover:border-orange-400">
              {SCENARIO_BY_ID[id].text[state.lang]}
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  // ==================== REVEAL ====================
  if (state.phase === 'reveal' && result) {
    const isLast = state.rounds.length >= state.roundsTotal;
    const fact = FACTS[(state.rounds.length - 1) % FACTS.length];
    const banner =
      result.outcome === 'caught'
        ? t.outcome.caught
        : result.outcome === 'caughtButGuessed'
          ? t.outcome.caughtButGuessed
          : result.tally.accused === null
            ? t.outcome.escapedTie
            : t.outcome.escapedWrong(state.players[result.tally.accused]);
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <p className="text-rose-300/70 text-xs text-center" style={PIXEL}>{roundLabel}</p>
        <div className={`border-2 p-4 text-center ${result.citizensWin ? 'border-emerald-400 bg-emerald-500/10' : 'border-red-400 bg-red-500/10'}`}>
          <p className="text-lg font-bold">{banner}</p>
        </div>
        <div className="border border-rose-500/30 bg-black/30 p-4 space-y-3">
          <p className="text-sm"><span className="text-rose-300/70">{t.theImpostor}: </span><b style={{ color: PLAYER_COLORS[round.impostor] }}>{impostorName}</b></p>
          <div>
            <p className="text-rose-300/70 text-sm">{t.theSituation} · {CATEGORY_LABEL[scenario.category][state.lang]}</p>
            <p className="text-rose-50">{scenario.text[state.lang]}</p>
          </div>
          <p><span className="text-rose-300/70 text-sm">{t.emotion}: </span><span className="text-orange-200 font-bold">{scenario.emotion[state.lang]}</span></p>
          {round.lastGuess && (
            <p className={`text-sm ${round.lastGuess === round.scenarioId ? 'text-red-300' : 'text-emerald-300'}`}>{t.lastGuessWas(SCENARIO_BY_ID[round.lastGuess].text[state.lang])}</p>
          )}
        </div>
        <div className="border border-rose-500/30 bg-black/30 p-3">
          <p className="text-orange-300 text-xs mb-2">{t.whoVoted}</p>
          <ul className="space-y-1 text-sm">
            {Object.entries(round.votes).map(([voter, s]) => (
              <li key={voter}>
                <span style={{ color: PLAYER_COLORS[Number(voter)] }}>{state.players[Number(voter)]}</span>
                <span className="text-rose-300/60"> → </span>
                <span className={s === round.impostor ? 'font-bold text-emerald-300' : 'text-rose-100'}>{state.players[s]}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-rose-500/30 bg-black/30 p-3">
          <p className="text-rose-50 text-sm mb-2">{t.bestClueTitle}</p>
          <div className="flex flex-wrap gap-1.5">
            {state.players.map((name, p) => (
              <button
                key={p}
                onClick={() => dispatch({ type: 'PICK_BEST_CLUE', player: round.bestClue === p ? null : p })}
                className={`px-2.5 py-1.5 text-xs border ${round.bestClue === p ? 'text-black font-bold' : 'text-rose-100 border-rose-600/50'}`}
                style={round.bestClue === p ? { background: PLAYER_COLORS[p], borderColor: PLAYER_COLORS[p] } : undefined}
              >
                {name}
              </button>
            ))}
            {round.bestClue !== null && (
              <button onClick={() => dispatch({ type: 'PICK_BEST_CLUE', player: null })} className="px-2.5 py-1.5 text-xs border border-rose-700 text-rose-300">{t.skip}</button>
            )}
          </div>
        </div>
        <div className="border border-rose-500/30 bg-black/30 p-3">
          <p className="text-orange-300 text-xs mb-2 flex items-center gap-2"><Trophy className="w-4 h-4" />{t.roundPoints}</p>
          <ul className="space-y-1 text-sm">
            {result.points.map((pts, p) => ({ pts, p })).sort((a, b) => b.pts - a.pts).map(({ pts, p }) => (
              <li key={p} className="flex justify-between"><span style={{ color: PLAYER_COLORS[p] }}>{state.players[p]}</span><b>+{pts}</b></li>
            ))}
          </ul>
        </div>
        <div className="border border-amber-400/30 bg-amber-500/5 p-3">
          <p className="text-amber-300 text-xs mb-1 flex items-center gap-2"><Lightbulb className="w-4 h-4" />{t.didYouKnow}</p>
          <p className="text-rose-50/85 text-sm leading-relaxed">{fact[state.lang]}</p>
        </div>
        <button
          onClick={() => {
            if (isLast && !expAwarded) {
              addExp(50);
              setExpAwarded(true);
            }
            dispatch({ type: 'NEXT_ROUND', scenarioId: nextScenario() });
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
    const nameList = (ids: number[]) => (ids.length ? ids.map((i) => state.players[i]).join(', ') : t.none);
    const awards: [string, number[]][] = [
      [t.awards.detective, stats.emotionDetective],
      [t.awards.actor, stats.bestActor],
      [t.awards.clue, stats.bestClue],
    ];
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-center text-orange-300 text-sm" style={PIXEL}>{t.finalTitle}</h2>
        <div className="space-y-2">
          {stats.players.map((p, rank) => (
            <div key={p.player} className={`flex items-center gap-3 border p-3 ${rank === 0 ? 'border-orange-400 bg-orange-500/10' : 'border-rose-600/40 bg-black/30'}`}>
              <span className="w-6 text-center text-rose-300" style={PIXEL}>{rank + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate" style={{ color: PLAYER_COLORS[p.player] }}>{state.players[p.player]}</p>
                <p className="text-xs text-rose-200/80">{t.stats(p.correctVotes, p.impostorWins)}</p>
              </div>
              <span className="text-lg font-bold">{p.total}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {awards.map(([label, ids]) => (
            <div key={label} className="border border-rose-600/40 bg-black/30 p-3">
              <p className="text-rose-300/70 text-xs">{label}</p>
              <p className="font-bold text-sm">{nameList(ids)}</p>
            </div>
          ))}
        </div>
        <button onClick={() => arrangeSeats(state.players, state.roundsTotal, state.difficulty)} className={`${primaryBtn} flex items-center justify-center gap-2`} style={PIXEL}>
          <RotateCcw className="w-4 h-4" />{t.playAgain}
        </button>
        <button onClick={() => { setNames(state.players); setRoundsTotal(state.roundsTotal); setDifficulty(state.difficulty); dispatch({ type: 'SHOW_SETUP' }); }} className="w-full py-3 border border-rose-500/50 text-rose-200 text-[10px]" style={PIXEL}>{t.newPlayers}</button>
      </motion.div>
    );
  }

  return shell(null);
}
