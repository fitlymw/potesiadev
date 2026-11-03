import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, X, Plus, Trash2, EyeOff, Eye, Star, Trophy, Users, Lightbulb, RotateCcw, Drama, Timer, Play, Pause, Vote, AlertTriangle } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { RoundTable } from '@/components/games/party/RoundTable';
import { PLAYER_COLORS } from '@/components/games/party/colors';
import { Confetti } from '@/components/games/party/Confetti';
import { CountUp } from '@/components/games/party/CountUp';
import { SfxMuteButton } from '@/components/games/party/SfxMuteButton';
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
  type ImpostorRound,
  type RoundResult,
  type FinalStats,
} from '@/lib/party/emotionImpostor';
import {
  buzz,
  sfxBar,
  sfxCardFlip,
  sfxCardHide,
  sfxCaught,
  sfxCitizensWin,
  sfxCoins,
  sfxDrop,
  sfxDrumroll,
  sfxDunDun,
  sfxFinale,
  sfxHeartbeat,
  sfxImpostorWins,
  sfxLockIn,
  sfxMiss,
  sfxPop,
  sfxSelect,
  sfxShuffle,
  sfxSparkle,
  sfxSpotlight,
  sfxStartGame,
  sfxTick,
  sfxTimeUp,
  sfxTimerStart,
  sfxWhoosh,
} from '@/lib/emotionSound';

const STORAGE_KEY = 'emotion-impostor-game';
const SCENARIO_BY_ID = Object.fromEntries(EMOTION_SCENARIOS.map((s) => [s.id, s])) as Record<string, EmotionScenario>;
const PIXEL = { fontFamily: '"Press Start 2P", cursive' };
const DISCUSSION_SECONDS = 90;
const CONFETTI_COLORS = ['#fb923c', '#f472b6', '#facc15', '#34d399', '#60a5fa', '#c084fc'];

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
    sfxMute: 'Mute sound effects',
    sfxUnmute: 'Turn sound effects on',
    speaking: 'speaking',
    nextSpeaker: 'NEXT SPEAKER ▶',
    lastSpeakerDone: 'DONE — START THE DISCUSSION',
    allSpoke: 'Everyone gave a clue — time to discuss!',
    counting: 'Counting the votes…',
    voteSent: 'VOTED ✓',
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
    sfxMute: 'Matikan efek suara',
    sfxUnmute: 'Nyalakan efek suara',
    speaking: 'bicara',
    nextSpeaker: 'PEMBICARA BERIKUTNYA ▶',
    lastSpeakerDone: 'SELESAI — MULAI DISKUSI',
    allSpoke: 'Semua sudah memberi petunjuk — saatnya diskusi!',
    counting: 'Menghitung suara…',
    voteSent: 'TERPILIH ✓',
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

const EMOJI_MASKS = ['🎭', '😊', '😢', '😡', '😱', '🥹', '😏'];

/** Decorative emotion faces drifting behind the start screen. */
function FloatingMasks() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {EMOJI_MASKS.map((m, i) => (
        <motion.span
          key={i}
          className="absolute text-3xl opacity-20 select-none"
          style={{ left: `${6 + i * 13}%`, top: `${8 + ((i * 37) % 70)}%` }}
          animate={{ y: [0, -18, 0], rotate: [0, i % 2 ? 12 : -12, 0] }}
          transition={{ duration: 3 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
        >
          {m}
        </motion.span>
      ))}
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
  useEffect(() => {
    if (running && remaining <= 10 && remaining > 0) sfxTick(remaining <= 5);
  }, [remaining, running]);
  useEffect(() => {
    if (remaining === 0) {
      sfxTimeUp();
      buzz([200, 100, 200]);
    }
  }, [remaining]);
  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, '0');
  const urgent = remaining <= 10;
  return (
    <motion.div
      className={`border p-3 ${remaining === 0 ? 'border-red-500 bg-red-500/10' : 'border-rose-500/30 bg-black/30'}`}
      animate={remaining === 0 ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3">
        <motion.span animate={running ? { rotate: [0, 15, -15, 0] } : { rotate: 0 }} transition={{ duration: 1, repeat: running ? Infinity : 0 }}>
          <Timer className="w-5 h-5 text-orange-300" />
        </motion.span>
        <div className="flex-1">
          <p className="text-rose-200/70 text-xs">{label}</p>
          <motion.p
            key={urgent && running ? remaining : 'calm'}
            initial={urgent && running ? { scale: 1.25 } : false}
            animate={{ scale: 1 }}
            className={`text-2xl font-bold ${remaining === 0 || urgent ? 'text-red-400' : 'text-rose-50'}`}
          >
            {mm}:{ss}
          </motion.p>
        </div>
        <button
          onClick={() => {
            if (!running) sfxTimerStart();
            setRunning((r) => !r);
          }}
          disabled={remaining === 0}
          className="px-3 py-2 border border-orange-400/60 text-orange-200 text-sm flex items-center gap-1 disabled:opacity-40"
        >
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}{running ? pauseLabel : startLabel}
        </button>
        <button onClick={() => { setRunning(false); setRemaining(DISCUSSION_SECONDS); }} className="px-3 py-2 border border-rose-600/50 text-rose-200 text-sm">{resetLabel}</button>
      </div>
      <div className="h-1.5 mt-3 bg-black/50">
        <motion.div className={`h-full ${urgent ? 'bg-red-500' : 'bg-orange-400'}`} animate={{ width: `${(remaining / DISCUSSION_SECONDS) * 100}%` }} transition={{ duration: 0.9, ease: 'linear' }} />
      </div>
    </motion.div>
  );
}

/** The secret role card: it flips over while pressed. The back is only rendered while held. */
function RoleCard({ holding, front, back, impostor }: { holding: boolean; front: React.ReactNode; back: React.ReactNode; impostor: boolean }) {
  const face = { gridArea: '1 / 1', backfaceVisibility: 'hidden' as const, WebkitBackfaceVisibility: 'hidden' as const };
  return (
    <div style={{ perspective: 1200 }}>
      <motion.div className="grid" style={{ transformStyle: 'preserve-3d' }} animate={{ rotateY: holding ? 180 : 0 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
        <div style={face} className="min-h-[300px] border-2 border-dashed border-orange-400/60 bg-black/40 p-5 flex flex-col items-center justify-center text-center">
          {front}
        </div>
        <motion.div
          style={{ ...face, rotateY: 180 }}
          className={`min-h-[300px] border-2 p-5 flex flex-col items-center justify-center text-center ${impostor ? 'border-red-500 bg-red-950/40 shadow-[0_0_30px_rgba(239,68,68,0.35)]' : 'border-emerald-400 bg-emerald-950/30 shadow-[0_0_30px_rgba(52,211,153,0.3)]'}`}
          animate={holding && impostor ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }}
          transition={{ duration: 0.4, repeat: holding && impostor ? Infinity : 0, repeatDelay: 1.4 }}
        >
          {holding ? back : null}
        </motion.div>
      </motion.div>
    </div>
  );
}

/** Speaking order with a spotlight that moves to the next speaker. */
function SpeakerSpotlight({ order, players, t }: { order: number[]; players: string[]; t: (typeof UI)['en'] }) {
  const [speaker, setSpeaker] = useState(0);
  const done = speaker >= order.length;
  return (
    <div className="space-y-2">
      <ol className="space-y-1.5">
        {order.map((p, i) => (
          <motion.li
            key={p}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: i < speaker ? 0.45 : 1, x: 0, scale: i === speaker ? 1.03 : 1 }}
            transition={{ delay: i * 0.06 }}
            className="relative flex items-center gap-3 text-sm px-2 py-1.5"
          >
            {i === speaker && (
              <motion.span layoutId="ei-spotlight" className="absolute inset-0 border-2 border-orange-300 bg-orange-500/15 shadow-[0_0_18px_rgba(251,146,60,0.45)]" transition={{ type: 'spring', stiffness: 300, damping: 28 }} />
            )}
            <span className="relative w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-bold text-[#160a0e]" style={{ background: PLAYER_COLORS[p] }}>{i < speaker ? '✓' : i + 1}</span>
            <span className="relative text-rose-50">{players[p]}</span>
            {i === speaker && (
              <motion.span className="relative ml-auto text-orange-300 text-xs" animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>🎤 {t.speaking}</motion.span>
            )}
          </motion.li>
        ))}
      </ol>
      {done ? (
        <motion.p initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center text-emerald-300 text-sm font-bold">{t.allSpoke}</motion.p>
      ) : (
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => { sfxSpotlight(); setSpeaker((s) => s + 1); }} className="w-full py-2.5 border border-orange-400/60 text-orange-200 text-sm">
          {speaker === order.length - 1 ? t.lastSpeakerDone : t.nextSpeaker}
        </motion.button>
      )}
    </div>
  );
}

/**
 * Plays timed cues once a screen shows; leaving the screen cancels the ones still
 * pending (even the instant ones go through a timer, so StrictMode's double mount
 * plays them once).
 */
function scheduleCues(cues: [number, () => void][]): () => void {
  const ids = cues.map(([ms, play]) => window.setTimeout(play, ms));
  return () => ids.forEach((id) => window.clearTimeout(id));
}

/** Voting results with a drum roll, growing bars and a dramatic verdict. */
function TallyScreen({ round, n, players, t, roundLabel, primaryBtn, onReveal }: { round: ImpostorRound; n: number; players: string[]; t: (typeof UI)['en']; roundLabel: string; primaryBtn: string; onReveal: () => void }) {
  const tl = tally(round, n);
  const rows = tl.counts.map((c, p) => ({ c, p })).sort((a, b) => b.c - a.c);
  const max = Math.max(1, ...tl.counts);
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const result = tally(round, n);
    const bars = result.counts.length;
    const cues: [number, () => void][] = [[0, () => sfxDrumroll(1.6)], [1700, () => setStage(1)]];
    for (let i = 0; i < bars; i++) cues.push([1750 + i * 220, () => sfxBar(i)]);
    cues.push([
      1900 + bars * 220,
      () => {
        setStage(2);
        if (result.accused === null) sfxMiss();
        else {
          sfxDunDun();
          buzz([80, 60, 160]);
        }
      },
    ]);
    return scheduleCues(cues);
  }, [round, n]);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <p className="text-rose-300/70 text-xs text-center" style={PIXEL}>{roundLabel}</p>
      <h2 className="text-orange-300 text-sm text-center" style={PIXEL}>{t.tallyTitle}</h2>
      {stage === 0 ? (
        <motion.div className="py-12 text-center" animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 0.4, repeat: Infinity }}>
          <p className="text-5xl mb-3">🥁</p>
          <p className="text-rose-100">{t.counting}</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {rows.map(({ c, p }, i) => (
            <motion.div key={p} className="flex items-center gap-3 text-sm" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.22 }}>
              <span className="w-24 truncate" style={{ color: PLAYER_COLORS[p] }}>{players[p]}</span>
              <div className="flex-1 h-4 bg-black/40 border border-rose-800/50 overflow-hidden">
                <motion.div className="h-full" style={{ background: PLAYER_COLORS[p] }} initial={{ width: 0 }} animate={{ width: `${(c / max) * 100}%` }} transition={{ delay: i * 0.22, duration: 0.5, ease: 'easeOut' }} />
              </div>
              <span className="w-16 text-right text-rose-200/80">{t.votes(c)}</span>
            </motion.div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {stage === 2 && (
          <motion.div key="verdict" className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.p initial={{ scale: 1.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }} className="text-center text-lg font-bold">
              {tl.accused !== null ? t.accused(players[tl.accused]) : t.tie}
            </motion.p>
            <motion.button whileTap={{ scale: 0.97 }} animate={{ boxShadow: ['0 0 0 rgba(251,146,60,0)', '0 0 22px rgba(251,146,60,0.55)', '0 0 0 rgba(251,146,60,0)'] }} transition={{ duration: 1.6, repeat: Infinity }} onClick={onReveal} className={primaryBtn} style={PIXEL}>
              {tl.accused !== null ? t.revealRole(players[tl.accused]) : t.revealImpostor}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** The caught Impostor's last chance: heartbeat, red pulse, four options. */
function LastChanceScreen({ round, lang, t, roundLabel, impostorName, onPick }: { round: ImpostorRound; lang: Lang; t: (typeof UI)['en']; roundLabel: string; impostorName: string; onPick: (id: string) => void }) {
  useEffect(() => {
    const stopFirst = scheduleCues([[0, sfxHeartbeat]]);
    const id = window.setInterval(sfxHeartbeat, 1100);
    return () => {
      stopFirst();
      window.clearInterval(id);
    };
  }, []);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
      <motion.div className="fixed inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 140px rgba(239,68,68,0.5)' }} animate={{ opacity: [0.25, 0.9, 0.25] }} transition={{ duration: 1.1, repeat: Infinity }} aria-hidden="true" />
      <p className="text-rose-300/70 text-xs text-center" style={PIXEL}>{roundLabel}</p>
      <motion.div className="w-fit mx-auto" animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 1.1, repeat: Infinity }}>
        <AlertTriangle className="w-12 h-12 text-red-400" />
      </motion.div>
      <motion.h2 initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 240, damping: 15 }} className="text-xl font-bold text-center text-red-300">{t.caughtTitle(impostorName)}</motion.h2>
      <p className="text-rose-100/90 text-sm text-center">{t.lastChanceHint(impostorName)}</p>
      <div className="space-y-2">
        {round.lastChanceOptions.map((id, i) => (
          <motion.button
            key={id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.12 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { sfxLockIn(); buzz(40); onPick(id); }}
            className="w-full text-left px-3 py-3 border border-rose-600/50 text-rose-50 text-sm hover:border-orange-400 bg-black/30"
          >
            {SCENARIO_BY_ID[id].text[lang]}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function RevealScreen(props: {
  state: GameState;
  round: ImpostorRound;
  scenario: EmotionScenario;
  result: RoundResult;
  t: (typeof UI)['en'];
  roundLabel: string;
  impostorName: string;
  primaryBtn: string;
  onBestClue: (player: number | null) => void;
  onNext: () => void;
}) {
  const { state, round, scenario, result, t, roundLabel, impostorName, primaryBtn, onBestClue, onNext } = props;
  const isLast = state.rounds.length >= state.roundsTotal;
  const fact = FACTS[(state.rounds.length - 1) % FACTS.length];
  // The outcome is fixed for this screen (picking a best clue only changes the points)
  const firstResult = useRef(result);
  useEffect(() => {
    const r = firstResult.current;
    const coins: [number, () => void] = [0, () => sfxCoins(r.points.filter((x) => x > 0).length, 2)];
    if (r.citizensWin) {
      return scheduleCues([[0, () => { sfxCaught(); buzz([60, 40, 60, 40, 200]); }], [450, sfxCitizensWin], coins]);
    }
    return scheduleCues([
      [0, () => { if (r.outcome === 'escaped') sfxMiss(); buzz([300, 120, 300]); }],
      [r.outcome === 'escaped' ? 1200 : 150, sfxImpostorWins],
      coins,
    ]);
  }, []);
  const banner =
    result.outcome === 'caught'
      ? t.outcome.caught
      : result.outcome === 'caughtButGuessed'
        ? t.outcome.caughtButGuessed
        : result.tally.accused === null
          ? t.outcome.escapedTie
          : t.outcome.escapedWrong(state.players[result.tally.accused]);
  const pointRows = result.points.map((pts, p) => ({ pts, p })).sort((a, b) => b.pts - a.pts);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {result.citizensWin && <Confetti key={`round-${state.rounds.length}`} colors={CONFETTI_COLORS} />}
      <p className="text-rose-300/70 text-xs text-center" style={PIXEL}>{roundLabel}</p>
      <motion.div
        initial={{ scale: 1.7, opacity: 0, rotate: result.citizensWin ? 0 : -3 }}
        animate={result.citizensWin ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 1, opacity: 1, rotate: 0, x: [0, -6, 6, -4, 4, 0] }}
        transition={{ type: 'spring', stiffness: 220, damping: 14, x: { delay: 0.5, duration: 0.5 } }}
        className={`border-2 p-4 text-center ${result.citizensWin ? 'border-emerald-400 bg-emerald-500/10' : 'border-red-400 bg-red-500/10'}`}
      >
        <p className="text-3xl mb-1">{result.citizensWin ? '🎉' : '😈'}</p>
        <p className="text-lg font-bold">{banner}</p>
      </motion.div>
      <div className="border border-rose-500/30 bg-black/30 p-4 space-y-3">
        <p className="text-sm flex items-center gap-2">
          <span className="text-rose-300/70">{t.theImpostor}: </span>
          <span style={{ perspective: 600 }} className="inline-block">
            <motion.b className="inline-block" style={{ color: PLAYER_COLORS[round.impostor] }} initial={{ rotateX: 90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
              🎭 {impostorName}
            </motion.b>
          </span>
        </p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <p className="text-rose-300/70 text-sm">{t.theSituation} · {CATEGORY_LABEL[scenario.category][state.lang]}</p>
          <p className="text-rose-50">{scenario.text[state.lang]}</p>
        </motion.div>
        <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}>
          <span className="text-rose-300/70 text-sm">{t.emotion}: </span><span className="text-orange-200 font-bold">{scenario.emotion[state.lang]}</span>
        </motion.p>
        {round.lastGuess && (
          <p className={`text-sm ${round.lastGuess === round.scenarioId ? 'text-red-300' : 'text-emerald-300'}`}>{t.lastGuessWas(SCENARIO_BY_ID[round.lastGuess].text[state.lang])}</p>
        )}
      </div>
      <div className="border border-rose-500/30 bg-black/30 p-3">
        <p className="text-orange-300 text-xs mb-2">{t.whoVoted}</p>
        <ul className="space-y-1 text-sm">
          {Object.entries(round.votes).map(([voter, s], i) => (
            <motion.li key={voter} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 + i * 0.08 }}>
              <span style={{ color: PLAYER_COLORS[Number(voter)] }}>{state.players[Number(voter)]}</span>
              <span className="text-rose-300/60"> → </span>
              <span className={s === round.impostor ? 'font-bold text-emerald-300' : 'text-rose-100'}>{state.players[s]}{s === round.impostor ? ' ✓' : ''}</span>
            </motion.li>
          ))}
        </ul>
      </div>
      <div className="border border-rose-500/30 bg-black/30 p-3">
        <p className="text-rose-50 text-sm mb-2">{t.bestClueTitle}</p>
        <div className="flex flex-wrap gap-1.5">
          {state.players.map((name, p) => (
            <motion.button
              key={p}
              whileTap={{ scale: 0.92 }}
              animate={round.bestClue === p ? { scale: [1, 1.18, 1] } : { scale: 1 }}
              onClick={() => {
                if (round.bestClue !== p) sfxSparkle();
                onBestClue(round.bestClue === p ? null : p);
              }}
              className={`px-2.5 py-1.5 text-xs border ${round.bestClue === p ? 'text-black font-bold' : 'text-rose-100 border-rose-600/50'}`}
              style={round.bestClue === p ? { background: PLAYER_COLORS[p], borderColor: PLAYER_COLORS[p] } : undefined}
            >
              {round.bestClue === p ? '⭐ ' : ''}{name}
            </motion.button>
          ))}
          {round.bestClue !== null && (
            <button onClick={() => onBestClue(null)} className="px-2.5 py-1.5 text-xs border border-rose-700 text-rose-300">{t.skip}</button>
          )}
        </div>
      </div>
      <div className="border border-rose-500/30 bg-black/30 p-3">
        <p className="text-orange-300 text-xs mb-2 flex items-center gap-2"><Trophy className="w-4 h-4" />{t.roundPoints}</p>
        <ul className="space-y-1 text-sm">
          {pointRows.map(({ pts, p }, i) => (
            <motion.li key={p} className="flex justify-between" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 + i * 0.14 }}>
              <span style={{ color: PLAYER_COLORS[p] }}>{state.players[p]}</span>
              <b><CountUp value={pts} prefix="+" delay={2 + i * 0.14} duration={0.6} /></b>
            </motion.li>
          ))}
        </ul>
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.4 }} className="border border-amber-400/30 bg-amber-500/5 p-3">
        <p className="text-amber-300 text-xs mb-1 flex items-center gap-2"><Lightbulb className="w-4 h-4" />{t.didYouKnow}</p>
        <p className="text-rose-50/85 text-sm leading-relaxed">{fact[state.lang]}</p>
      </motion.div>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onNext} className={primaryBtn} style={PIXEL}>
        {isLast ? t.seeFinal : t.nextRound}
      </motion.button>
    </motion.div>
  );
}

function FinalScreen({ state, stats, t, primaryBtn, onPlayAgain, onNewPlayers }: { state: GameState; stats: FinalStats; t: (typeof UI)['en']; primaryBtn: string; onPlayAgain: () => void; onNewPlayers: () => void }) {
  useEffect(() => scheduleCues([[0, () => { sfxFinale(); buzz([100, 80, 100, 80, 300]); }]]), []);
  const nameList = (ids: number[]) => (ids.length ? ids.map((i) => state.players[i]).join(', ') : t.none);
  const awards: [string, string, number[]][] = [
    ['🕵️', t.awards.detective, stats.emotionDetective],
    ['🎭', t.awards.actor, stats.bestActor],
    ['💡', t.awards.clue, stats.bestClue],
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Confetti key="final" colors={CONFETTI_COLORS} count={90} />
      <motion.h2 initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} className="text-center text-orange-300 text-sm" style={PIXEL}>{t.finalTitle}</motion.h2>
      <div className="space-y-2">
        {stats.players.map((p, rank) => (
          <motion.div
            key={p.player}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + rank * 0.15, type: 'spring', stiffness: 220, damping: 20 }}
            className={`flex items-center gap-3 border p-3 ${rank === 0 ? 'border-orange-400 bg-orange-500/10' : 'border-rose-600/40 bg-black/30'}`}
          >
            {rank === 0 ? (
              <motion.span animate={{ y: [0, -5, 0], rotate: [0, -8, 8, 0] }} transition={{ duration: 1.4, repeat: Infinity }} className="w-6 text-center">
                <Trophy className="w-5 h-5 text-amber-300" />
              </motion.span>
            ) : (
              <span className="w-6 text-center text-rose-300" style={PIXEL}>{rank + 1}</span>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate" style={{ color: PLAYER_COLORS[p.player] }}>{state.players[p.player]}</p>
              <p className="text-xs text-rose-200/80">{t.stats(p.correctVotes, p.impostorWins)}</p>
            </div>
            <span className="text-lg font-bold"><CountUp value={p.total} delay={0.4 + rank * 0.15} /></span>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {awards.map(([icon, label, ids], i) => (
          <motion.div key={label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 + i * 0.15, type: 'spring', stiffness: 260, damping: 18 }} className="border border-rose-600/40 bg-black/30 p-3">
            <p className="text-rose-300/70 text-xs">{icon} {label}</p>
            <p className="font-bold text-sm">{nameList(ids)}</p>
          </motion.div>
        ))}
      </div>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onPlayAgain} className={`${primaryBtn} flex items-center justify-center gap-2`} style={PIXEL}>
        <RotateCcw className="w-4 h-4" />{t.playAgain}
      </motion.button>
      <button onClick={onNewPlayers} className="w-full py-3 border border-rose-500/50 text-rose-200 text-[10px]" style={PIXEL}>{t.newPlayers}</button>
    </motion.div>
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
  const [stamping, setStamping] = useState(false);
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

  // Screen-change sounds (skipped on the very first render, e.g. after a reload)
  const screenKey = `${state.phase}-${state.lap}-${state.turn}`;
  const firstScreen = useRef(true);
  useEffect(() => {
    if (firstScreen.current) {
      firstScreen.current = false;
      return;
    }
    if (state.phase === 'pass') sfxWhoosh();
    else if (state.phase === 'clues') sfxSpotlight();
  }, [screenKey, state.phase]);

  const result = useMemo(() => (round && state.phase === 'reveal' ? roundResult(round, n) : null), [round, state.phase, n]);
  const stats = useMemo(() => (state.phase === 'final' ? finalStats(state) : null), [state]);

  const nextScenario = () => {
    const pool = scenarioPool(EMOTION_SCENARIOS, state.difficulty).map((s) => s.id);
    const fresh = pool.filter((id) => !state.usedScenarioIds.includes(id));
    return shuffle(fresh.length ? fresh : pool)[0];
  };

  const arrangeSeats = (list: string[], rounds: number, level: DifficultySetting) => {
    if (validatePlayers(list) !== null) return;
    sfxShuffle();
    const seats = shuffleSeats(list);
    dispatch({ type: 'ARRANGE', players: seats, roundsTotal: rounds, difficulty: level, impostorOrder: shuffle(seats.map((_, i) => i)) });
  };

  const openSecretScreen = () => {
    sfxPop();
    setHolding(false);
    setSeenOnce(false);
    setSuspect(null);
    setStamping(false);
    dispatch({ type: 'CONFIRM_PASS' });
  };

  const exit = () => {
    if (inGame && !window.confirm(t.confirmExit)) return;
    dispatch({ type: 'RESET' });
    navigate('/games');
  };

  const shell = (children: React.ReactNode) => (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 z-50 bg-[#160a0e] text-rose-50 overflow-auto font-sans">
        <div className="absolute inset-0 pointer-events-none opacity-10"><div className="scanlines h-full w-full" /></div>
        <div className="relative z-10 min-h-full flex flex-col items-center px-4 pt-4 pb-12">
          <div className="w-full max-w-xl flex items-center justify-between mb-4">
            <button onClick={exit} className="p-2 border border-rose-500/40 text-rose-300 hover:bg-rose-500/10" aria-label={t.backToGames}><ArrowLeft className="w-5 h-5" /></button>
            <span className="text-orange-300 text-[10px] sm:text-xs" style={PIXEL}>{t.title}</span>
            <div className="flex gap-1.5">
              <SfxMuteButton className="p-2 border border-rose-500/40 text-rose-300 hover:bg-rose-500/10" labels={{ mute: t.sfxMute, unmute: t.sfxUnmute }} />
              {state.phase !== 'howto' && (
                <button onClick={() => setShowHelp(true)} className="p-2 border border-rose-500/40 text-rose-300 hover:bg-rose-500/10" aria-label={t.howAgain}><HelpCircle className="w-5 h-5" /></button>
              )}
            </div>
          </div>
          <div className="w-full max-w-xl">{children}</div>
        </div>
        <AnimatePresence>
          {showHelp && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/85 overflow-auto p-4 flex justify-center">
              <motion.div initial={{ y: 30, scale: 0.96 }} animate={{ y: 0, scale: 1 }} className="w-full max-w-xl bg-[#221016] border border-orange-500/40 p-5 h-fit">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-orange-300 text-xs" style={PIXEL}>{t.howTitle}</h2>
                  <button onClick={() => setShowHelp(false)} className="p-1 text-rose-300" aria-label="close"><X className="w-5 h-5" /></button>
                </div>
                <HowToContent lang={state.lang} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {stamping && (
            <motion.div key="stamp" className="fixed inset-0 z-[58] flex items-center justify-center pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.span initial={{ scale: 2.4, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: -8, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }} className="border-4 border-orange-300 bg-[#160a0e]/90 text-orange-200 px-6 py-3 text-lg" style={PIXEL}>
                {t.voteSent}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );

  const primaryBtn = 'w-full py-4 border-2 border-orange-400 bg-orange-500/15 text-orange-100 text-[10px] sm:text-xs disabled:opacity-40';

  // ==================== HOW TO PLAY ====================
  if (state.phase === 'howto') {
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative flex flex-col items-center">
        <FloatingMasks />
        <motion.div animate={{ rotate: [0, -10, 10, -5, 0], scale: [1, 1.08, 1] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.2 }}>
          <Drama className="w-14 h-14 text-orange-400 mb-3" strokeWidth={1.5} />
        </motion.div>
        <motion.h1 initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }} className="text-lg sm:text-2xl text-orange-300 mb-2 text-center" style={PIXEL}>{t.title}</motion.h1>
        <p className="text-rose-200/70 text-sm mb-4 text-center">{t.tagline}</p>
        <div className="flex gap-2 mb-5">
          {(['id', 'en'] as Lang[]).map((l) => (
            <motion.button whileTap={{ scale: 0.92 }} key={l} onClick={() => { sfxSelect(); dispatch({ type: 'SET_LANG', lang: l }); }} className={`px-4 py-2 border text-[10px] ${state.lang === l ? 'border-orange-400 bg-orange-500/20 text-orange-100' : 'border-rose-700 text-rose-400'}`} style={PIXEL}>
              {l === 'id' ? 'INDONESIA' : 'ENGLISH'}
            </motion.button>
          ))}
        </div>
        <div className="relative w-full border border-orange-500/30 bg-rose-950/60 p-4 sm:p-5 mb-5">
          <h2 className="text-orange-300 text-xs mb-4" style={PIXEL}>{t.howTitle}</h2>
          <HowToContent lang={state.lang} />
        </div>
        <motion.button whileTap={{ scale: 0.97 }} animate={{ boxShadow: ['0 0 0 rgba(251,146,60,0)', '0 0 20px rgba(251,146,60,0.5)', '0 0 0 rgba(251,146,60,0)'] }} transition={{ duration: 2, repeat: Infinity }} onClick={() => { sfxPop(); dispatch({ type: 'SHOW_SETUP' }); }} className={`relative ${primaryBtn}`} style={PIXEL}>{t.toSetup}</motion.button>
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
          <AnimatePresence initial={false}>
            {names.map((name, i) => (
              <motion.div key={i} layout initial={{ opacity: 0, x: -20, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }} exit={{ opacity: 0, x: 30, height: 0 }} className="flex gap-2 items-center">
                <span className="w-6 h-6 shrink-0 rounded-full text-[10px] font-bold flex items-center justify-center text-[#160a0e]" style={{ background: PLAYER_COLORS[i] }}>{i + 1}</span>
                <input
                  value={name}
                  maxLength={16}
                  onChange={(e) => { const value = e.target.value; setNames((prev) => prev.map((x, j) => (j === i ? value : x))); }}
                  placeholder={t.playerPlaceholder(i)}
                  className="flex-1 min-w-0 bg-black/40 border border-rose-600/50 px-3 py-2.5 text-rose-50 outline-none focus:border-orange-400"
                />
                {names.length > MIN_PLAYERS && (
                  <button onClick={() => { sfxDrop(); setNames((prev) => prev.filter((_, j) => j !== i)); }} className="p-2 text-rose-400 hover:text-red-400" aria-label="remove"><Trash2 className="w-4 h-4" /></button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {names.length < MAX_PLAYERS && (
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => { sfxPop(); setNames((prev) => [...prev, '']); }} className="flex items-center gap-2 text-sm text-orange-300 mb-4"><Plus className="w-4 h-4" />{t.addPlayer}</motion.button>
        )}
        <p className="text-rose-200/80 text-sm mb-2">{t.roundsLabel}</p>
        <div className="flex gap-2 mb-4">
          {ROUND_OPTIONS.map((r) => (
            <motion.button whileTap={{ scale: 0.94 }} key={r} onClick={() => { sfxSelect(); setRoundsTotal(r); }} className={`flex-1 py-2.5 border text-sm ${roundsTotal === r ? 'border-orange-400 bg-orange-500/20 text-orange-100 font-bold' : 'border-rose-600/50 text-rose-200'}`}>{r}</motion.button>
          ))}
        </div>
        <p className="text-rose-200/80 text-sm mb-2">{t.difficultyLabel}</p>
        <div className="grid grid-cols-4 gap-2 mb-1">
          {DIFFICULTY_OPTIONS.map((d) => (
            <motion.button whileTap={{ scale: 0.94 }} key={d} onClick={() => { sfxSelect(); setDifficulty(d); }} className={`py-2.5 border text-sm ${difficulty === d ? 'border-orange-400 bg-orange-500/20 text-orange-100 font-bold' : 'border-rose-600/50 text-rose-200'}`}>{t.difficulty[d]}</motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.p key={difficulty} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-rose-200/60 text-xs mb-4">{t.difficultyHint[difficulty]}</motion.p>
        </AnimatePresence>
        {showError && <motion.p initial={{ x: -6 }} animate={{ x: 0 }} className="text-amber-300 text-sm mb-3">{t.errors[error]}</motion.p>}
        <motion.button whileTap={{ scale: 0.97 }} disabled={error !== null} onClick={() => arrangeSeats(names, roundsTotal, difficulty)} className={primaryBtn} style={PIXEL}>{t.shuffleSeats}</motion.button>
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
        <motion.div initial={{ scale: 0.8, rotate: -25, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 16 }} className="border border-rose-500/30 bg-black/30 p-3">
          <RoundTable players={state.players} startsLabel={t.seatingStarts} />
          <p className="text-center text-rose-300/50 text-[11px] mt-1">{t.seatingView}</p>
        </motion.div>
        <ol className="space-y-1.5">
          {state.players.map((name, i) => (
            <motion.li key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }} className="flex items-center gap-3 text-sm">
              <span className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-bold text-[#160a0e]" style={{ background: PLAYER_COLORS[i] }}>{i + 1}</span>
              <span className="text-rose-50">{i === 0 ? <><b>{name}</b> — {t.seatingStarts}</> : t.seatingLeftOf(name, state.players[i - 1])}</span>
            </motion.li>
          ))}
        </ol>
        <p className="text-rose-200/70 text-sm">{t.seatingPass}</p>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => { sfxStartGame(); buzz([40, 30, 80]); setExpAwarded(false); dispatch({ type: 'START', scenarioId: nextScenario() }); }} className={primaryBtn} style={PIXEL}>{t.seated}</motion.button>
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
      <motion.div key={`${state.lap}-${player}`} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }} className="flex flex-col items-center text-center pt-6">
        <p className="text-rose-300/70 text-xs mb-6" style={PIXEL}>{roundLabel}</p>
        <p className="text-rose-200 mb-2">{t.passTo}</p>
        <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 14 }} className="text-3xl sm:text-4xl font-bold mb-4 break-all" style={{ color: PLAYER_COLORS[player] }}>{state.players[player]}</motion.p>
        <p className="text-rose-200/80 text-sm mb-10 max-w-sm">{state.lap === 'role' ? t.passRoleHint : t.passVoteHint}</p>
        <motion.div animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <EyeOff className="w-12 h-12 text-rose-500/70 mb-10" />
        </motion.div>
        <motion.button whileTap={{ scale: 0.96 }} onClick={openSecretScreen} className="w-full py-4 border-2 text-sm font-bold" style={{ borderColor: PLAYER_COLORS[player], color: PLAYER_COLORS[player] }}>{t.imReady(state.players[player])}</motion.button>
      </motion.div>
    );
  }

  // ==================== SECRET ROLE (press & hold) ====================
  if (state.phase === 'role') {
    const player = pendingPlayer(state)!;
    const isImpostor = player === round.impostor;
    // Same sound and vibration for every role, so the table cannot hear who is the Impostor
    const show = () => {
      if (!holding) {
        sfxCardFlip();
        buzz(15);
      }
      setHolding(true);
      setSeenOnce(true);
    };
    const hide = () => {
      if (holding) sfxCardHide();
      setHolding(false);
    };
    const front = (
      <>
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <Eye className="w-12 h-12 text-orange-300 mb-4" />
        </motion.div>
        <p className="text-orange-200 text-[10px] sm:text-xs leading-relaxed" style={PIXEL}>{t.holdToSee}</p>
      </>
    );
    const back = isImpostor ? (
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
    );
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
          className="select-none touch-none cursor-pointer"
        >
          <RoleCard holding={holding} front={front} back={back} impostor={isImpostor} />
        </div>
        <p className="text-rose-300/60 text-xs text-center">{holding ? t.releaseToHide : !seenOnce ? t.holdFirst : ' '}</p>
        <motion.button whileTap={{ scale: 0.97 }} disabled={!seenOnce || holding} onClick={() => { sfxLockIn(); buzz(25); dispatch({ type: 'ROLE_SEEN' }); }} className={primaryBtn} style={PIXEL}>{t.seenPass}</motion.button>
      </motion.div>
    );
  }

  // ==================== CLUES (table) ====================
  if (state.phase === 'clues') {
    const order = speakingOrder(round, n);
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <p className="text-rose-300/70 text-xs text-center" style={PIXEL}>{roundLabel}</p>
        <motion.h2 initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 15 }} className="text-orange-300 text-sm flex items-center gap-2" style={PIXEL}><Drama className="w-5 h-5" />{t.cluesTitle2}</motion.h2>
        <p className="text-rose-100/90 text-sm">{t.cluesIntro}</p>
        <SpeakerSpotlight key={`spot-${state.rounds.length}`} order={order} players={state.players} t={t} />
        <div className="border border-rose-500/30 bg-rose-950/30 p-3">
          <ul className="list-disc pl-5 space-y-1 text-sm text-rose-100/85">{t.clueRules.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
        <DiscussionTimer label={t.discussion} startLabel={t.start} pauseLabel={t.pause} resetLabel={t.reset} />
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => dispatch({ type: 'BEGIN_VOTING' })} className={primaryBtn} style={PIXEL}>{t.beginVoting(state.players[round.starter])}</motion.button>
      </motion.div>
    );
  }

  // ==================== SECRET VOTE ====================
  if (state.phase === 'vote') {
    const voter = pendingPlayer(state)!;
    const confirmVote = () => {
      if (suspect === null || stamping) return;
      // Same stamp, sound and vibration for every vote
      sfxLockIn();
      buzz(30);
      setStamping(true);
      const choice = suspect;
      window.setTimeout(() => {
        setStamping(false);
        dispatch({ type: 'SUBMIT_VOTE', suspect: choice });
      }, 650);
    };
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
              <motion.button
                key={p}
                whileTap={{ scale: 0.93 }}
                animate={suspect === p ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                onClick={() => { sfxSelect(); setSuspect(p); }}
                className={`py-3 px-2 border text-sm truncate ${suspect === p ? 'text-black font-bold' : 'border-rose-600/50 text-rose-100'}`}
                style={suspect === p ? { background: PLAYER_COLORS[p], borderColor: PLAYER_COLORS[p] } : undefined}
              >
                {name}
              </motion.button>
            )
          )}
        </div>
        <motion.button whileTap={{ scale: 0.97 }} disabled={suspect === null || stamping} onClick={confirmVote} className={primaryBtn} style={PIXEL}>{t.voteConfirm}</motion.button>
      </motion.div>
    );
  }

  // ==================== TALLY (table) ====================
  if (state.phase === 'tally') {
    const tl = tally(round, n);
    const reveal = () => {
      sfxPop();
      if (tl.caught) dispatch({ type: 'OPEN_LAST_CHANCE', options: lastChanceOptions(EMOTION_SCENARIOS, round.scenarioId) });
      else dispatch({ type: 'FINISH_TALLY' });
    };
    return shell(<TallyScreen key={`tally-${state.rounds.length}`} round={round} n={n} players={state.players} t={t} roundLabel={roundLabel} primaryBtn={primaryBtn} onReveal={reveal} />);
  }

  // ==================== IMPOSTOR'S LAST CHANCE (table) ====================
  if (state.phase === 'lastChance') {
    return shell(<LastChanceScreen round={round} lang={state.lang} t={t} roundLabel={roundLabel} impostorName={impostorName} onPick={(id) => dispatch({ type: 'SUBMIT_LAST_GUESS', scenarioId: id })} />);
  }

  // ==================== REVEAL ====================
  if (state.phase === 'reveal' && result) {
    const isLast = state.rounds.length >= state.roundsTotal;
    return shell(
      <RevealScreen
        key={`reveal-${state.rounds.length}`}
        state={state}
        round={round}
        scenario={scenario}
        result={result}
        t={t}
        roundLabel={roundLabel}
        impostorName={impostorName}
        primaryBtn={primaryBtn}
        onBestClue={(player) => dispatch({ type: 'PICK_BEST_CLUE', player })}
        onNext={() => {
          if (isLast && !expAwarded) {
            addExp(50);
            setExpAwarded(true);
          }
          dispatch({ type: 'NEXT_ROUND', scenarioId: nextScenario() });
        }}
      />
    );
  }

  // ==================== FINAL ====================
  if (state.phase === 'final' && stats) {
    return shell(
      <FinalScreen
        state={state}
        stats={stats}
        t={t}
        primaryBtn={primaryBtn}
        onPlayAgain={() => arrangeSeats(state.players, state.roundsTotal, state.difficulty)}
        onNewPlayers={() => { setNames(state.players); setRoundsTotal(state.roundsTotal); setDifficulty(state.difficulty); dispatch({ type: 'SHOW_SETUP' }); }}
      />
    );
  }

  return shell(null);
}
