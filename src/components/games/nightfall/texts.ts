/**
 * Texts for Nightfall Deception: UI labels, the full rulebook, the private
 * morning-report sentences and the end-of-game chronicle (EN + ID).
 */
import { ROLES, type RoleId } from '@/data/nightfallRoles';
import { NF_MIN_PLAYERS, NF_MAX_PLAYERS, SETUP_TABLE, TIMING, TIDE_USES, setupFor, type Lang, type Mode, type ReportItem, type ChronItem, type Quality, type AttackResult, type Guard } from '@/lib/party/nightfall';

type ModeText = { name: string; desc: string };

export const UI = {
  en: {
    title: 'NIGHTFALL DECEPTION',
    tagline: 'When night falls, someone at this table is not who they claim to be.',
    intro: `A hidden-role game for ${NF_MIN_PLAYERS}–${NF_MAX_PLAYERS} players around a round table, with one phone passed to the left. The app is The Oracle: it deals roles, runs the night and keeps every secret.`,
    viewRoles: 'VIEW ALL ROLES',
    viewRules: 'FULL RULES',
    toSetup: 'SET UP PLAYERS',
    roleBook: 'Role book',
    rules: 'Rules',
    mute: 'Mute',
    unmute: 'Sound on',
    modeTitle: 'Game mode',
    modes: {
      standard: { name: 'Standard', desc: 'A Nightbringer boss with Shadow helpers. The classic.' },
      joker: { name: 'Joker', desc: 'A lone boss who never kills: it lends a crown and moves seats. For true manipulators.' },
      zombie: { name: 'Zombie', desc: 'A lone boss who secretly infects players and grows a horde.' },
    } as Record<Mode, ModeText>,
    setupTitle: 'Players',
    setupHint: `Enter ${NF_MIN_PLAYERS}–${NF_MAX_PLAYERS} names.`,
    playerPlaceholder: (i: number) => `Player ${i + 1}`,
    addPlayer: 'Add player',
    composition: (n: number, mode: Mode) => {
      const [l, c, s] = setupFor(n, mode);
      const boss = mode === 'standard' ? '1 Nightbringer' : `1 ${mode === 'joker' ? 'Joker' : 'Zombie'}`;
      return `${n} players: ${l} Luminary · ${c} Cursed · ${s ? `${s} Shadow · ` : ''}${boss}`;
    },
    errors: {
      tooFew: `At least ${NF_MIN_PLAYERS} players are needed.`,
      tooMany: `At most ${NF_MAX_PLAYERS} players.`,
      empty: 'Fill in every name (or remove empty rows).',
      duplicate: 'Each name must be different.',
    },
    shuffleSeats: 'SHUFFLE SEATS',
    seatingTitle: 'Round table',
    seatingIntro: (first: string) => `Sit in a circle in the order below. The game starts with ${first}, then continues to the left of ${first}. Remember your seat number!`,
    seatingView: 'Seen from above the table',
    seatingStarts: 'starts',
    seatingLeftOf: (name: string, prev: string) => `${name} — to the left of ${prev}`,
    seatingPass: 'The phone is always passed to the player on your left.',
    reshuffle: 'SHUFFLE AGAIN',
    beginNight: 'WE’RE SEATED — NIGHT FALLS',
    night: (n: number) => `Night ${n}`,
    morningTitle: (n: number) => `Morning ${n}`,
    day: (n: number) => `Day ${n}`,
    passTo: 'Hand the phone to',
    passNightHint: 'Everyone takes a secret turn at night — even players without an ability.',
    passDawnHint: 'Read your private report, then choose whether to share it.',
    imReady: (name: string) => `I’m ${name} — show me`,
    yesterday: 'Yesterday',
    yourRole: 'Your role',
    keepSecret: 'Keep it secret! Read your role hint any time during your turn.',
    roleHint: 'ROLE HINT',
    prompt: {
      aura: 'Choose 2 players. At dawn you learn whether the Dark side is among them.',
      protect: 'Choose 1 other player to protect from tonight’s attacks.',
      poison: 'Choose 1 player to poison. Their ability fails tonight and tomorrow.',
      kill: (count: number, self: boolean): string => (count === 2 ? 'The Void was executed: choose 2 players to kill.' : `Choose 1 player to kill.${self ? ' Choose yourself to pass the title to a Shadow.' : ''}`),
      gouge: (count: number): string => (count === 2 ? 'The Void was executed: choose 2 players to gouge. They die next night.' : 'Choose 1 player to gouge. They die next night; until then their information is false.'),
      bane: 'Choose up to 2 players in order: 1st is attacked; if they die and were a Cursed, the 2nd dies too.',
      revive: 'You may bring 1 dead player back to life (once per game) — or skip.',
      revenge: 'Choose 1 player to take with you if you are killed tonight — or skip.',
      tide: (left: number) => `Choose 2 players to swap seats and shield tonight (${left} use${left === 1 ? '' : 's'} left) — or skip.`,
      infect: (count: number): string => (count === 2 ? 'The Void was executed: choose 2 players to infect.' : 'Choose 1 player to infect.'),
      frenzy: 'The Zombie is dead. Choose 1 player for the horde to kill — the most chosen target dies.',
      crownKill: 'Choose a SEAT NUMBER to attack. Whoever sits there after tonight’s seat swaps is hit. If you skip, you die in the morning.',
      dummy: 'No action for you tonight. Tap the player you trust the least (this only disguises your turn).',
      dead: 'You are dead. Tap any player to disguise your turn.',
    },
    order: (i: number): string => (i === 0 ? '1st' : '2nd'),
    skipAbility: 'SKIP — DON’T USE',
    selected: (a: number, b: number) => `${a}/${b} chosen`,
    minWait: (s: number) => `Wait ${s}s…`,
    hideAndPass: 'DONE — HIDE & PASS',
    timeLeft: (s: number) => `${s}s`,
    crownBadge: '👑 You hold the Joker’s crown',
    crownNote: 'While you hold the crown your role’s ability does not work — at night or during the day (no Nova shot, no Echo double vote, no Apex…). You keep your side — and you do not know who the Joker is.',
    yourSeat: (k: number) => `You sit in seat ${k}.`,
    seatChosen: (k: number | null): string => (k === null ? 'No seat chosen yet.' : `Target: seat ${k}`),
    infectedBadge: '🧟 Infected — you are on the Dark side',
    joker: {
      swapTitle: 'Glitch: swap 2 players’ seats (optional)',
      crownTitle: 'The crown',
      holderNow: (name: string | null): string => (name ? `Crown holder now: ${name}` : 'The crown is with you.'),
      give: 'Give / move the crown',
      recall: 'Take the crown back',
      keep: 'Leave it as it is',
      giveHint: 'The new holder learns it at dawn and must attack a seat every night from tomorrow night.',
      recallHint: 'Cancels the current holder’s attack tonight.',
    },
    lastPlayerTitle: 'You were the last player tonight',
    lastPlayerHint: 'Put the phone in the middle of the table now. Everyone, keep your eyes on it…',
    dawnIn: (s: number) => `Dawn in ${s}…`,
    deathsNone: 'Everyone survived the night.',
    deathsSome: (names: string) => `${names} did not wake up this morning.`,
    highlights: 'Last night',
    currentSeating: 'Seating now',
    seatsChanged: 'Seats were swapped during the night!',
    before: 'Before',
    after: 'Now',
    swapNow: (a: string, b: string) => `${a} ⇄ ${b}: swap chairs now.`,
    startDawnLap: (name: string) => `START MORNING REPORTS — PHONE TO ${name.toUpperCase()}`,
    seeResult: 'SEE THE RESULT',
    reportTitle: (n: number) => `Your report · Morning ${n}`,
    shareQuestion: 'Read your information aloud to everyone, or keep it to yourself? Everyone gets this same choice.',
    shareRead: 'I’LL READ IT ALOUD',
    shareKeep: 'KEEP IT — PASS',
    speakingTitle: 'Read aloud now',
    speakingHint: 'Tell the table what you learned — all of it, part of it, or a clever lie.',
    doneSpeaking: 'DONE — HIDE & PASS',
    discussion: 'Discussion',
    discussionHint: 'Everyone may stand up, walk around and talk in small groups. Share who you trust and who you don’t — and remember that anyone can lie.',
    testimonyShared: 'Read their information aloud',
    testimonyKept: 'Kept quiet',
    backToSeats: 'Back to your seats!',
    nomination: 'Nominations & voting',
    nominationHint: (need: number) => `Each living player may nominate once (not themselves) and each player can be nominated once per day. Voting is by show of hands. An execution needs at least ${need} votes. Highest valid vote (no tie) is executed when the day ends.`,
    pause: 'Pause',
    resume: 'Resume',
    addMinute: '+1 min',
    skip: 'Skip',
    toNominations: 'START NOMINATIONS',
    newNomination: 'NEW NOMINATION',
    dayAbility: 'DAY ABILITY (NOVA)',
    endDay: 'END THE DAY',
    confirmEndDay: 'End the day now? The leading nomination will be executed.',
    nominator: 'Who nominates?',
    nominee: 'Who is nominated?',
    voters: 'Who raises their hand? (dead players use their one ghost vote)',
    votesCount: (v: number, need: number) => `${v} vote(s) · needs ${need}`,
    confirmNomination: 'CONFIRM VOTE',
    cancel: 'Cancel',
    valid: 'enough votes',
    notValid: 'not enough',
    leading: (name: string) => `On the block: ${name}`,
    noLeader: 'Nobody is on the block yet.',
    shooter: 'Who shoots (claims to be Nova)?',
    target: 'Who is the target?',
    shoot: 'SHOOT',
    events: {
      executed: (name: string) => `${name} was executed.`,
      shielded: (name: string) => `The execution of ${name} failed mysteriously…`,
      noExecution: 'Nobody was executed.',
      novaHit: (s: string, t: string) => `${s} shot ${t} — ${t} falls! ${s} gave their life for the shot.`,
      novaMiss: (s: string, t: string, died: boolean) => (died ? `${s} shot ${t}… and missed. ${s} gave their life for nothing.` : `${s} shot ${t}… nothing happened.`),
      saved: (name: string, by: Guard, what: 'attack' | 'infect') =>
        `${name} was ${what === 'infect' ? 'nearly infected' : 'attacked'} last night — but ${by === 'aegis' ? 'the Aegis protected them' : 'the Tide’s seat swap shielded them'}!`,
      pyre: (by: string, t: string) => `The Pyre’s fire flares: ${t} burned together with ${by}.`,
      pactDeath: (t: string, partner: string) => `${t} died too — bound by a Pact to ${partner}.`,
      crownBurden: (name: string) => `${name} collapsed under the weight of the Joker’s crown.`,
      revived: (name: string) => `${name} has risen from the dead!`,
      apex: 'A tied vote with three players left — the Apex secures the win for the Light side!',
    },
    alive: 'alive',
    dead: 'dead',
    ghost: 'ghost vote',
    finalTitle: 'THE ORACLE HAS SPOKEN',
    winGood: 'The Light side wins!',
    winEvil: 'The Dark side wins!',
    reasons: {
      nbExecuted: 'The boss was executed.',
      nbShot: 'Nova shot the boss.',
      nbGone: 'The Nightbringer is dead.',
      jokerGone: 'The Joker is dead.',
      hiveGone: 'The Zombie and its whole horde are gone.',
      parity: 'The Dark side now matches (or outnumbers) the Light side.',
      apex: 'The Apex survived to the final three and the vote was tied.',
    },
    grimoire: 'Who was who',
    chronicle: 'Chronicle — everything that happened',
    stage: { night: 'Night', morning: 'Morning', day: 'Day' },
    quietNight: 'A quiet night.',
    playAgain: 'PLAY AGAIN (SAME PLAYERS)',
    newPlayers: 'NEW PLAYERS',
    backToGames: 'Back to games',
    confirmExit: 'Leave the game? Progress will be lost.',
    teamWord: { good: 'Light', evil: 'Dark' },
    infectedTag: 'infected',
    notes: 'My secret notes',
    noNotes: 'No information yet.',
    goal: 'Goal',
    ability: 'Ability',
    tips: 'Tips',
    close: 'Close',
    roleBookTitle: 'Role book — all modes',
    roleBookHint: 'Take a screenshot to share with the group. Every game uses only some of these roles.',
    setupLegend: 'Players: Luminary · Cursed · Shadow · Boss',
    seatMap: 'Seat map',
    statusAlive: 'Alive',
    statusGhost: 'Dead · ghost vote not used yet',
    statusUsed: 'Dead · ghost vote already used',
    statusGone: 'Dead completely (Nova) · cannot vote',
    seatMapHint: 'Seat numbers go to the left from seat 1. Only public information is shown here.',
    soloBosses: 'Solo bosses · Joker & Zombie modes (no Shadows)',
    goals: {
      standard: { good: 'Execute the Nightbringer.', evil: 'Become as many as the living Light players.' },
      joker: { good: 'Find and kill the Joker — by vote, Nova, or a crown holder’s seat attack.', evil: 'Survive until only 2 players remain.' },
      zombie: { good: 'Eliminate the Zombie and every infected player.', evil: 'Make the horde (Zombie + infected) outnumber the healthy players.' },
    } as Record<Mode, { good: string; evil: string }>,
  },
  id: {
    title: 'NIGHTFALL DECEPTION',
    tagline: 'Saat malam tiba, seseorang di meja ini bukan seperti yang ia akui.',
    intro: `Game peran rahasia untuk ${NF_MIN_PLAYERS}–${NF_MAX_PLAYERS} pemain di meja bundar, dengan satu HP yang dioper ke kiri. Aplikasi ini adalah The Oracle: membagikan peran, menjalankan malam, dan menjaga semua rahasia.`,
    viewRoles: 'LIHAT SEMUA PERAN',
    viewRules: 'ATURAN LENGKAP',
    toSetup: 'ATUR PEMAIN',
    roleBook: 'Buku peran',
    rules: 'Aturan',
    mute: 'Bisukan',
    unmute: 'Suara nyala',
    modeTitle: 'Mode permainan',
    modes: {
      standard: { name: 'Standar', desc: 'Bos Nightbringer dengan pembantu Shadow. Mode klasik.' },
      joker: { name: 'Joker', desc: 'Bos tunggal yang tidak pernah membunuh: meminjamkan mahkota dan memindahkan kursi. Untuk manipulator sejati.' },
      zombie: { name: 'Zombie', desc: 'Bos tunggal yang diam-diam menginfeksi pemain dan membangun gerombolan.' },
    } as Record<Mode, ModeText>,
    setupTitle: 'Pemain',
    setupHint: `Masukkan ${NF_MIN_PLAYERS}–${NF_MAX_PLAYERS} nama.`,
    playerPlaceholder: (i: number) => `Pemain ${i + 1}`,
    addPlayer: 'Tambah pemain',
    composition: (n: number, mode: Mode) => {
      const [l, c, s] = setupFor(n, mode);
      const boss = mode === 'standard' ? '1 Nightbringer' : `1 ${mode === 'joker' ? 'Joker' : 'Zombie'}`;
      return `${n} pemain: ${l} Luminary · ${c} Cursed · ${s ? `${s} Shadow · ` : ''}${boss}`;
    },
    errors: {
      tooFew: `Minimal ${NF_MIN_PLAYERS} pemain.`,
      tooMany: `Maksimal ${NF_MAX_PLAYERS} pemain.`,
      empty: 'Isi semua nama (atau hapus baris yang kosong).',
      duplicate: 'Setiap nama harus berbeda.',
    },
    shuffleSeats: 'ACAK TEMPAT DUDUK',
    seatingTitle: 'Meja bundar',
    seatingIntro: (first: string) => `Duduklah melingkar sesuai urutan di bawah. Permainan dimulai dari ${first}, lalu berlanjut ke sebelah kiri ${first}. Ingat nomor kursimu!`,
    seatingView: 'Dilihat dari atas meja',
    seatingStarts: 'mulai',
    seatingLeftOf: (name: string, prev: string) => `${name} — di sebelah kiri ${prev}`,
    seatingPass: 'HP selalu dioper ke pemain di sebelah kirimu.',
    reshuffle: 'ACAK ULANG',
    beginNight: 'KAMI SUDAH DUDUK — MALAM TIBA',
    night: (n: number) => `Malam ${n}`,
    morningTitle: (n: number) => `Pagi ${n}`,
    day: (n: number) => `Siang ${n}`,
    passTo: 'Serahkan HP ke',
    passNightHint: 'Semua pemain mendapat giliran rahasia di malam hari — termasuk yang tidak punya kemampuan.',
    passDawnHint: 'Baca laporan rahasiamu, lalu pilih apakah akan membagikannya.',
    imReady: (name: string) => `Saya ${name} — tampilkan`,
    yesterday: 'Kemarin',
    yourRole: 'Peranmu',
    keepSecret: 'Rahasiakan! Baca petunjuk peranmu kapan saja selama giliranmu.',
    roleHint: 'PETUNJUK PERAN',
    prompt: {
      aura: 'Pilih 2 pemain. Saat fajar kamu tahu apakah ada Kubu Gelap di antara mereka.',
      protect: 'Pilih 1 pemain lain untuk dilindungi dari serangan malam ini.',
      poison: 'Pilih 1 pemain untuk diracun. Kemampuannya gagal malam ini dan besok.',
      kill: (count: number, self: boolean): string => (count === 2 ? 'Void telah dieksekusi: pilih 2 pemain untuk dibunuh.' : `Pilih 1 pemain untuk dibunuh.${self ? ' Pilih dirimu sendiri untuk mengoper gelar ke Shadow.' : ''}`),
      gouge: (count: number): string => (count === 2 ? 'Void telah dieksekusi: pilih 2 pemain untuk dicakar. Mereka mati malam berikutnya.' : 'Pilih 1 pemain untuk dicakar. Ia mati malam berikutnya; sampai saat itu informasinya palsu.'),
      bane: 'Pilih hingga 2 pemain secara berurutan: ke-1 diserang; jika ia mati dan ternyata Cursed, ke-2 ikut mati.',
      revive: 'Kamu boleh menghidupkan kembali 1 pemain yang mati (sekali per permainan) — atau lewati.',
      revenge: 'Pilih 1 pemain yang ikut mati jika kamu terbunuh malam ini — atau lewati.',
      tide: (left: number) => `Pilih 2 pemain untuk ditukar kursinya dan dilindungi malam ini (sisa ${left} kali) — atau lewati.`,
      infect: (count: number): string => (count === 2 ? 'Void telah dieksekusi: pilih 2 pemain untuk diinfeksi.' : 'Pilih 1 pemain untuk diinfeksi.'),
      frenzy: 'Zombie sudah mati. Pilih 1 pemain untuk dibunuh gerombolan — target yang paling banyak dipilih akan mati.',
      crownKill: 'Pilih NOMOR KURSI yang akan diserang. Siapa pun yang duduk di sana setelah pertukaran kursi malam ini akan terkena. Jika kamu melewati, kamu mati saat pagi.',
      dummy: 'Tidak ada aksi untukmu malam ini. Ketuk pemain yang paling tidak kamu percaya (hanya untuk menyamarkan giliranmu).',
      dead: 'Kamu sudah mati. Ketuk pemain mana saja untuk menyamarkan giliranmu.',
    },
    order: (i: number): string => (i === 0 ? 'ke-1' : 'ke-2'),
    skipAbility: 'LEWATI — TIDAK DIPAKAI',
    selected: (a: number, b: number) => `${a}/${b} dipilih`,
    minWait: (s: number) => `Tunggu ${s} dtk…`,
    hideAndPass: 'SELESAI — SEMBUNYIKAN & OPER',
    timeLeft: (s: number) => `${s} dtk`,
    crownBadge: '👑 Kamu memegang mahkota Joker',
    crownNote: 'Selama memegang mahkota, kemampuan peranmu tidak berlaku — malam maupun siang (tanpa tembakan Nova, tanpa suara ganda Echo, tanpa Apex…). Kamu tetap di kubumu — dan kamu tidak tahu siapa Joker.',
    yourSeat: (k: number) => `Kamu duduk di kursi ${k}.`,
    seatChosen: (k: number | null): string => (k === null ? 'Belum ada kursi yang dipilih.' : `Target: kursi ${k}`),
    infectedBadge: '🧟 Terinfeksi — kamu di Kubu Gelap',
    joker: {
      swapTitle: 'Glitch: tukar kursi 2 pemain (opsional)',
      crownTitle: 'Mahkota',
      holderNow: (name: string | null): string => (name ? `Pemegang mahkota sekarang: ${name}` : 'Mahkota ada padamu.'),
      give: 'Berikan / pindahkan mahkota',
      recall: 'Tarik kembali mahkota',
      keep: 'Biarkan seperti sekarang',
      giveHint: 'Pemegang baru tahu saat fajar dan wajib menyerang satu kursi setiap malam mulai besok malam.',
      recallHint: 'Membatalkan serangan pemegang mahkota malam ini.',
    },
    lastPlayerTitle: 'Kamu pemain terakhir malam ini',
    lastPlayerHint: 'Taruh HP di tengah meja sekarang. Semua pemain, perhatikan HP-nya…',
    dawnIn: (s: number) => `Fajar dalam ${s}…`,
    deathsNone: 'Semua pemain selamat malam ini.',
    deathsSome: (names: string) => `${names} tidak bangun pagi ini.`,
    highlights: 'Tadi malam',
    currentSeating: 'Posisi duduk sekarang',
    seatsChanged: 'Ada kursi yang ditukar tadi malam!',
    before: 'Sebelum',
    after: 'Sekarang',
    swapNow: (a: string, b: string) => `${a} ⇄ ${b}: tukar kursi sekarang.`,
    startDawnLap: (name: string) => `MULAI LAPORAN PAGI — HP KE ${name.toUpperCase()}`,
    seeResult: 'LIHAT HASIL',
    reportTitle: (n: number) => `Laporanmu · Pagi ${n}`,
    shareQuestion: 'Bacakan informasimu ke semua pemain, atau simpan sendiri? Semua pemain mendapat pilihan yang sama.',
    shareRead: 'SAYA AKAN MEMBACAKAN',
    shareKeep: 'SIMPAN — OPER',
    speakingTitle: 'Bacakan sekarang',
    speakingHint: 'Ceritakan ke semua pemain apa yang kamu ketahui — semuanya, sebagian, atau kebohongan yang cerdik.',
    doneSpeaking: 'SELESAI — SEMBUNYIKAN & OPER',
    discussion: 'Diskusi',
    discussionHint: 'Semua boleh berdiri, berkeliling, dan berbicara dalam kelompok kecil. Ceritakan siapa yang kamu percaya dan siapa yang tidak — dan ingat, siapa pun bisa berbohong.',
    testimonyShared: 'Membacakan informasinya',
    testimonyKept: 'Memilih diam',
    backToSeats: 'Kembali ke kursi masing-masing!',
    nomination: 'Nominasi & voting',
    nominationHint: (need: number) => `Setiap pemain hidup boleh menominasikan sekali (tidak boleh dirinya sendiri) dan setiap pemain hanya bisa dinominasikan sekali per hari. Voting dengan angkat tangan. Eksekusi butuh minimal ${need} suara. Nominasi dengan suara sah terbanyak (tidak seri) dieksekusi saat hari berakhir.`,
    pause: 'Jeda',
    resume: 'Lanjut',
    addMinute: '+1 menit',
    skip: 'Lewati',
    toNominations: 'MULAI NOMINASI',
    newNomination: 'NOMINASI BARU',
    dayAbility: 'KEMAMPUAN SIANG (NOVA)',
    endDay: 'AKHIRI HARI',
    confirmEndDay: 'Akhiri hari sekarang? Nominasi teratas akan dieksekusi.',
    nominator: 'Siapa yang menominasikan?',
    nominee: 'Siapa yang dinominasikan?',
    voters: 'Siapa yang mengangkat tangan? (pemain mati memakai satu suara hantunya)',
    votesCount: (v: number, need: number) => `${v} suara · butuh ${need}`,
    confirmNomination: 'KONFIRMASI VOTING',
    cancel: 'Batal',
    valid: 'suara cukup',
    notValid: 'kurang suara',
    leading: (name: string) => `Calon tereksekusi: ${name}`,
    noLeader: 'Belum ada calon tereksekusi.',
    shooter: 'Siapa yang menembak (mengaku Nova)?',
    target: 'Siapa targetnya?',
    shoot: 'TEMBAK',
    events: {
      executed: (name: string) => `${name} telah dieksekusi.`,
      shielded: (name: string) => `Eksekusi terhadap ${name} gagal secara misterius…`,
      noExecution: 'Tidak ada yang dieksekusi.',
      novaHit: (s: string, t: string) => `${s} menembak ${t} — ${t} tumbang! ${s} gugur setelah melepaskan tembakannya.`,
      novaMiss: (s: string, t: string, died: boolean) => (died ? `${s} menembak ${t}… meleset. ${s} gugur sia-sia.` : `${s} menembak ${t}… tidak terjadi apa-apa.`),
      saved: (name: string, by: Guard, what: 'attack' | 'infect') =>
        `${name} ${what === 'infect' ? 'hampir terinfeksi' : 'berusaha dibunuh'} tadi malam — tetapi ${by === 'aegis' ? 'Aegis melindunginya' : 'pertukaran kursi Tide menyelamatkannya'}!`,
      pyre: (by: string, t: string) => `Api Pyre menyala: ${t} ikut terbakar bersama ${by}.`,
      pactDeath: (t: string, partner: string) => `${t} ikut mati — terikat Pact dengan ${partner}.`,
      crownBurden: (name: string) => `${name} runtuh di bawah beban mahkota Joker.`,
      revived: (name: string) => `${name} bangkit kembali dari kematian!`,
      apex: 'Voting seri saat tersisa tiga pemain — Apex memastikan kemenangan Kubu Terang!',
    },
    alive: 'hidup',
    dead: 'mati',
    ghost: 'suara hantu',
    finalTitle: 'THE ORACLE TELAH BERSABDA',
    winGood: 'Kubu Terang menang!',
    winEvil: 'Kubu Gelap menang!',
    reasons: {
      nbExecuted: 'Bos berhasil dieksekusi.',
      nbShot: 'Nova menembak sang bos.',
      nbGone: 'Nightbringer telah mati.',
      jokerGone: 'Joker telah mati.',
      hiveGone: 'Zombie dan seluruh gerombolannya telah musnah.',
      parity: 'Jumlah Kubu Gelap kini menyamai (atau melebihi) Kubu Terang.',
      apex: 'Apex bertahan hingga tiga besar dan voting berakhir seri.',
    },
    grimoire: 'Siapa sebenarnya siapa',
    chronicle: 'Kronik — semua yang terjadi',
    stage: { night: 'Malam', morning: 'Pagi', day: 'Siang' },
    quietNight: 'Malam yang tenang.',
    playAgain: 'MAIN LAGI (PEMAIN SAMA)',
    newPlayers: 'PEMAIN BARU',
    backToGames: 'Kembali ke games',
    confirmExit: 'Keluar dari permainan? Progres akan hilang.',
    teamWord: { good: 'Terang', evil: 'Gelap' },
    infectedTag: 'terinfeksi',
    notes: 'Catatan rahasiaku',
    noNotes: 'Belum ada informasi.',
    goal: 'Tujuan',
    ability: 'Kemampuan',
    tips: 'Tips',
    close: 'Tutup',
    roleBookTitle: 'Buku peran — semua mode',
    roleBookHint: 'Ambil screenshot untuk dibagikan ke grup. Setiap permainan hanya memakai sebagian dari peran-peran ini.',
    setupLegend: 'Pemain: Luminary · Cursed · Shadow · Bos',
    seatMap: 'Peta kursi',
    statusAlive: 'Hidup',
    statusGhost: 'Mati · suara hantu belum dipakai',
    statusUsed: 'Mati · suara hantu sudah dipakai',
    statusGone: 'Mati total (Nova) · tidak bisa voting',
    seatMapHint: 'Nomor kursi berurutan ke kiri mulai dari kursi 1. Hanya informasi publik yang ditampilkan di sini.',
    soloBosses: 'Bos tunggal · mode Joker & Zombie (tanpa Shadow)',
    goals: {
      standard: { good: 'Eksekusi Nightbringer.', evil: 'Jumlah Kubu Gelap menyamai Kubu Terang yang masih hidup.' },
      joker: { good: 'Temukan dan bunuh Joker — lewat voting, Nova, atau serangan kursi pemegang mahkota.', evil: 'Bertahan hidup sampai hanya tersisa 2 pemain.' },
      zombie: { good: 'Singkirkan Zombie dan semua pemain yang terinfeksi.', evil: 'Buat gerombolan (Zombie + yang terinfeksi) lebih banyak dari pemain yang sehat.' },
    } as Record<Mode, { good: string; evil: string }>,
  },
};

export type UIText = (typeof UI)['en'];

const table = Object.entries(SETUP_TABLE).map(([n, t]) => `${n}p ${t.join('/')}`).join(' · ');

/** Full rulebook, shown from the start screen and the "Rules" button. */
export const RULES: Record<Lang, { title: string; items: string[] }[]> = {
  en: [
    { title: 'Modes & goals', items: ['Standard — Light side (Luminaries + Cursed) must execute the Nightbringer; the Dark side (Shadows + Nightbringer) wins by matching the living Light players.', 'Joker — no Shadows. The Joker never kills; the Light side wins when the Joker dies, the Joker wins when only 2 players remain. The hardest role in the game.', 'Zombie — no Shadows. The Light side must eliminate the Zombie and every infected player; the horde wins when it outnumbers the healthy players.'] },
    { title: 'Setup', items: [`${NF_MIN_PLAYERS}–${NF_MAX_PLAYERS} players sit around a round table in a random order shown by the app. Remember your seat number.`, `Role mix by player count (Standard): ${table} (Luminary/Cursed/Shadow/boss). In Joker and Zombie modes the Shadow seats become Luminaries.`, `A Blight in play replaces 2 Luminaries with 2 Cursed. Spark, Gaze and Glyph are not used in the solo modes.`, 'The phone is always passed to the player on the left.'] },
    { title: 'Night', items: [`Every player — alive or dead — takes a secret turn: ${TIMING.nightTurn}s (${TIMING.nightTurnFirst}s on the first night).`, `The “done” button unlocks after ${TIMING.minTurn}s so fast turns don’t reveal who has no ability. Players without an action tap a player to disguise their turn.`, 'If time runs out, a complete selection still counts; otherwise that player does nothing tonight, and the phone moves to the left automatically.', `The last player puts the phone in the middle of the table. ${TIMING.phoneToCenter}s later a sunrise sound announces the morning, followed by a death bell if someone died or calm chimes if nobody did. Whenever the day ends (timer, Skip or End the day) a nightfall sound plays so everyone gathers.`, 'On the first night the Dark side learns its team, and the boss gets 3 bluff roles that are not in the game. In Joker and Zombie modes the first night is a blackout: information is unreliable.'] },
    { title: 'Seats & swaps', items: [`The Joker (every night) and the Tide (${TIDE_USES}× per game) can swap two players’ seats. Swaps happen before any seat attack that night.`, 'Seats matter: Rune counts neighbours, the Viper counts the last voter in seat order, and the phone follows the seats.', 'Every morning shows the current seating. When seats changed, a before/after picture tells who must swap chairs.'] },
    { title: 'Morning', items: ['Deaths and highlights are announced: players saved by Aegis or Tide, revivals, Pyre revenge, Pact deaths.', `Then the phone goes around again (${TIMING.dawnTurn}s, ${TIMING.dawnTurnFirst}s on the first morning): each player privately reads their report and chooses to read it aloud or keep it. Everyone gets the same choice, so nobody is exposed — but staying quiet can look suspicious.`, 'Everything you learn is saved in “My secret notes” under the Role hint button, available on every private turn.'] },
    { title: 'Day', items: [`Discussion (${TIMING.discussion / 60} min): everyone may stand up, walk around and form small groups to share who they trust — or to lie.`, 'When the bell rings, return to your own seat.', `Nominations & voting (${TIMING.nomination / 60} min): each living player nominates at most once, each player can be nominated at most once per day. Vote by raising hands; the app records who voted.`, 'An execution needs more than half of the living players. When the day ends, the nomination with the most valid votes is executed; a tie means nobody is executed.', 'Nova uses the “Day ability” button in public, once per game. If the target is the boss, the boss dies. Hit or miss, the real Nova dies at once and completely (no ghost vote). A pretender survives — and is exposed.'] },
    { title: 'Joker mode', items: ['The Joker cannot kill. Each night it may give the crown to another player, take it back, or leave it — and swap two players’ seats (itself included).', 'The crown holder learns it at dawn and, from the next night, must attack a SEAT NUMBER every night (numbers only, no names) or die in the morning. Their own role ability does not work while they hold it — neither at night nor during the day (no Nova shot, no Echo double vote…). They keep their side and do not know who the Joker is.', 'The attack hits whoever sits in that seat after the night’s swaps. Taking the crown away cancels that night’s attack.'] },
    { title: 'Zombie mode', items: ['On odd nights (1, 3, 5…) the Zombie infects a player: they join the Dark side, keep their ability and learn who the Zombie is. Aegis and Tide block infections.', 'If the Zombie dies, the horde enters a Frenzy: on odd nights each infected player picks a kill and the most chosen target dies.'] },
    { title: 'Death', items: ['Dead players stay at the table and may keep talking, but lose their normal vote.', 'Each dead player has one ghost vote to use once for the rest of the game. A Nova who fired is dead completely and has no ghost vote.', 'The seat-map button shows who is alive, who still has a ghost vote and who can no longer vote.'] },
    { title: 'Poison & false information', items: ['A poisoned player’s ability fails that night and the next day: information becomes false, protection and shots fail. A Gouge victim’s information is false until they die.', 'Baiter always reads as Dark; Snare always reads as Light. Trust, but verify.'] },
    { title: 'After the game', items: ['The chronicle tells the whole story, round by round: every night action, every report, every vote.'] },
  ],
  id: [
    { title: 'Mode & tujuan', items: ['Standar — Kubu Terang (Luminary + Cursed) harus mengeksekusi Nightbringer; Kubu Gelap (Shadow + Nightbringer) menang jika jumlahnya menyamai Kubu Terang yang hidup.', 'Joker — tanpa Shadow. Joker tidak pernah membunuh; Kubu Terang menang jika Joker mati, Joker menang jika hanya tersisa 2 pemain. Peran tersulit dalam permainan.', 'Zombie — tanpa Shadow. Kubu Terang harus menyingkirkan Zombie dan semua pemain terinfeksi; gerombolan menang jika jumlahnya lebih banyak dari pemain yang sehat.'] },
    { title: 'Persiapan', items: [`${NF_MIN_PLAYERS}–${NF_MAX_PLAYERS} pemain duduk di meja bundar sesuai urutan acak dari aplikasi. Ingat nomor kursimu.`, `Komposisi peran per jumlah pemain (Standar): ${table} (Luminary/Cursed/Shadow/bos). Di mode Joker dan Zombie, jatah Shadow menjadi Luminary.`, 'Blight yang ikut bermain mengganti 2 Luminary dengan 2 Cursed. Spark, Gaze, dan Glyph tidak dipakai di mode bos tunggal.', 'HP selalu dioper ke pemain di sebelah kiri.'] },
    { title: 'Malam', items: [`Setiap pemain — hidup maupun mati — mendapat giliran rahasia: ${TIMING.nightTurn} detik (${TIMING.nightTurnFirst} detik di malam pertama).`, `Tombol selesai baru aktif setelah ${TIMING.minTurn} detik supaya giliran yang cepat tidak membocorkan siapa yang tidak punya kemampuan. Pemain tanpa aksi mengetuk satu pemain untuk menyamarkan gilirannya.`, 'Jika waktu habis, pilihan yang sudah lengkap tetap dihitung; jika belum, pemain itu tidak beraksi malam ini, dan HP otomatis pindah ke kiri.', `Pemain terakhir menaruh HP di tengah meja. ${TIMING.phoneToCenter} detik kemudian terdengar suara matahari terbit menandai pagi, disusul lonceng kematian jika ada yang mati atau denting tenang jika tidak ada. Setiap kali siang berakhir (waktu habis, Lewati, atau Akhiri hari) terdengar suara malam tiba agar semua pemain berkumpul.`, 'Di malam pertama Kubu Gelap saling mengenal, dan bos mendapat 3 peran samaran yang tidak ada dalam permainan. Di mode Joker dan Zombie, malam pertama adalah blackout: informasi tidak bisa dipercaya.'] },
    { title: 'Kursi & pertukaran', items: [`Joker (setiap malam) dan Tide (${TIDE_USES}× per permainan) bisa menukar kursi dua pemain. Pertukaran terjadi sebelum serangan kursi malam itu.`, 'Kursi itu penting: Rune menghitung tetangga, Viper menghitung pemilih terakhir sesuai urutan kursi, dan HP mengikuti urutan kursi.', 'Setiap pagi ditampilkan posisi duduk sekarang. Jika ada kursi yang berubah, gambar sebelum/sesudah menunjukkan siapa yang harus bertukar kursi.'] },
    { title: 'Pagi', items: ['Kematian dan sorotan diumumkan: pemain yang diselamatkan Aegis atau Tide, kebangkitan, balas dendam Pyre, kematian karena Pact.', `Lalu HP berkeliling lagi (${TIMING.dawnTurn} detik, ${TIMING.dawnTurnFirst} detik di pagi pertama): setiap pemain membaca laporan rahasianya dan memilih membacakannya atau menyimpannya. Semua pemain mendapat pilihan yang sama sehingga tidak ada yang ketahuan — tapi memilih diam bisa terlihat mencurigakan.`, 'Semua yang kamu ketahui tersimpan di "Catatan rahasiaku" pada tombol Petunjuk Peran, dan bisa dibuka di setiap giliran rahasiamu.'] },
    { title: 'Siang', items: [`Diskusi (${TIMING.discussion / 60} menit): semua boleh berdiri, berkeliling, dan membentuk kelompok kecil untuk berbagi siapa yang dipercaya — atau untuk berbohong.`, 'Saat bel berbunyi, kembali ke kursi masing-masing.', `Nominasi & voting (${TIMING.nomination / 60} menit): setiap pemain hidup menominasikan paling banyak sekali, dan setiap pemain paling banyak dinominasikan sekali per hari. Voting dengan angkat tangan; aplikasi mencatat siapa yang memilih.`, 'Eksekusi butuh lebih dari setengah pemain yang hidup. Saat hari berakhir, nominasi dengan suara sah terbanyak dieksekusi; jika seri, tidak ada yang dieksekusi.', 'Nova memakai tombol "Kemampuan siang" secara terbuka, sekali per permainan. Jika targetnya bos, bos itu mati. Kena atau meleset, Nova asli langsung mati total (tanpa suara hantu). Yang berpura-pura tetap hidup — dan ketahuan.'] },
    { title: 'Mode Joker', items: ['Joker tidak bisa membunuh. Setiap malam ia boleh memberikan mahkota ke pemain lain, menariknya kembali, atau membiarkannya — dan menukar kursi dua pemain (termasuk dirinya).', 'Pemegang mahkota tahu saat fajar dan, mulai malam berikutnya, wajib menyerang satu NOMOR KURSI setiap malam (hanya angka, tanpa nama) atau ia mati saat pagi. Kemampuan perannya tidak berlaku selama memegangnya — baik malam maupun siang (tanpa tembakan Nova, tanpa suara ganda Echo…). Ia tetap di kubunya dan tidak tahu siapa Joker.', 'Serangan mengenai siapa pun yang duduk di kursi itu setelah pertukaran kursi malam itu. Menarik mahkota membatalkan serangan malam itu.'] },
    { title: 'Mode Zombie', items: ['Di malam ganjil (1, 3, 5…) Zombie menginfeksi satu pemain: ia pindah ke Kubu Gelap, tetap punya kemampuannya, dan tahu siapa Zombie. Aegis dan Tide memblokir infeksi.', 'Jika Zombie mati, gerombolan mengamuk (Frenzy): di malam ganjil setiap pemain terinfeksi memilih target, dan target yang paling banyak dipilih mati.'] },
    { title: 'Kematian', items: ['Pemain yang mati tetap di meja dan boleh terus berbicara, tapi kehilangan hak suara biasa.', 'Setiap pemain mati punya satu suara hantu yang bisa dipakai sekali sampai akhir permainan. Nova yang sudah menembak mati total dan tidak punya suara hantu.', 'Tombol peta kursi menunjukkan siapa yang hidup, siapa yang masih punya suara hantu, dan siapa yang sudah tidak bisa voting.'] },
    { title: 'Racun & info palsu', items: ['Kemampuan pemain yang diracun gagal malam itu dan siang berikutnya: informasinya palsu, perlindungan dan tembakannya gagal. Informasi korban Gouge palsu sampai ia mati.', 'Baiter selalu terbaca Gelap; Snare selalu terbaca Terang. Percaya boleh, tapi tetap periksa.'] },
    { title: 'Setelah permainan', items: ['Kronik menceritakan seluruh kisah ronde demi ronde: setiap aksi malam, setiap laporan, setiap voting.'] },
  ],
};

/** Private morning-report sentence for one item (second person). */
export function reportLine(item: ReportItem, names: string[], lang: Lang): string {
  const n = (p: number | null) => (p === null ? '—' : names[p]);
  const role = (r: RoleId) => ROLES[r].name;
  const id = lang === 'id';
  switch (item.k) {
    case 'evilTeam': {
      const team = id
        ? `Tim Gelapmu — Nightbringer: ${n(item.nightbringer)}. Shadow: ${item.shadows.map(n).join(', ') || '—'}.`
        : `Your Dark team — Nightbringer: ${n(item.nightbringer)}. Shadows: ${item.shadows.map(n).join(', ') || '—'}.`;
      if (!item.bluffs) return team;
      const bluffs = item.bluffs.map(role).join(', ');
      return `${team} ${id ? `Peran samaranmu (tidak ada dalam permainan): ${bluffs}.` : `Your bluff roles (not in the game): ${bluffs}.`}`;
    }
    case 'bossBluffs':
      return id ? `Kamu bermain sendirian. Peran samaranmu (tidak ada dalam permainan): ${item.bluffs.map(role).join(', ')}.` : `You play alone. Your bluff roles (not in the game): ${item.bluffs.map(role).join(', ')}.`;
    case 'nightBlind':
      return id ? 'Blackout malam pertama: informasi malam ini tidak bisa dipercaya.' : 'First-night blackout: tonight’s information cannot be trusted.';
    case 'aura':
      return id
        ? `Aura: ${n(item.a)} & ${n(item.b)} → ${item.yes ? 'YA, ada Kubu Gelap di antara mereka.' : 'TIDAK ada Kubu Gelap di antara mereka.'}`
        : `Aura: ${n(item.a)} & ${n(item.b)} → ${item.yes ? 'YES, the Dark side is among them.' : 'NO Dark player among them.'}`;
    case 'noChoice':
      return id ? 'Kamu tidak memilih siapa pun tadi malam.' : 'You did not choose anyone last night.';
    case 'rune':
      return id ? `Rune: ${item.count} dari tetangga hidupmu adalah Kubu Gelap.` : `Rune: ${item.count} of your living neighbours are Dark.`;
    case 'trace':
      return item.target === null
        ? id ? 'Trace: tidak ada yang didatangi malam ini.' : 'Trace: nobody was visited tonight.'
        : id ? `Trace: ${n(item.target)} didatangi malam ini.` : `Trace: ${n(item.target)} was visited tonight.`;
    case 'pair':
      return id ? `Salah satu dari ${n(item.a)} atau ${n(item.b)} adalah ${role(item.role)}.` : `One of ${n(item.a)} or ${n(item.b)} is the ${role(item.role)}.`;
    case 'pairNone':
      return item.source === 'gaze'
        ? id ? 'Tidak ada Cursed dalam permainan ini.' : 'There is no Cursed in this game.'
        : id ? 'Tidak ada Shadow yang terdeteksi.' : 'No Shadow could be detected.';
    case 'snare':
      return id
        ? `Tetangga kirimu ${n(item.left)} adalah ${role(item.leftRole)}; tetangga kananmu ${n(item.right)} adalah ${role(item.rightRole)}.`
        : `Your left neighbour ${n(item.left)} is the ${role(item.leftRole)}; your right neighbour ${n(item.right)} is the ${role(item.rightRole)}.`;
    case 'dirge': {
      const inf = item.infected ? (id ? ' (terinfeksi)' : ' (infected)') : '';
      return id ? `${n(item.player)} yang dieksekusi kemarin adalah ${role(item.role)}${inf}.` : `${n(item.player)}, executed yesterday, was the ${role(item.role)}${inf}.`;
    }
    case 'dirgeNone':
      return id ? 'Kemarin tidak ada yang dieksekusi.' : 'Nobody was executed yesterday.';
    case 'pact':
      return id ? `Kamu terikat Pact dengan ${n(item.partner)}. Kalian berdua Kubu Terang — jika salah satu mati, yang lain ikut mati.` : `You are bound by a Pact to ${n(item.partner)}. You are both on the Light side — if one of you dies, so does the other.`;
    case 'protectSaved':
      return id ? `Perlindunganmu berhasil! ${n(item.target)} diserang, tetapi kamu menyelamatkannya.` : `Your protection worked! ${n(item.target)} was attacked, but you saved them.`;
    case 'tideDone':
      return item.ok
        ? id ? `Kamu menukar kursi ${n(item.a)} dan ${n(item.b)}.` : `You swapped the seats of ${n(item.a)} and ${n(item.b)}.`
        : id ? 'Gelombangmu tidak bergerak… pertukaran kursi gagal.' : 'Your tide did not move… the swap failed.';
    case 'tideSaved':
      return id ? `Pertukaran kursimu menyelamatkan ${n(item.target)} dari serangan!` : `Your seat swap saved ${n(item.target)} from an attack!`;
    case 'revived':
      return item.ok
        ? id ? `Kamu menghidupkan kembali ${n(item.target)}.` : `You brought ${n(item.target)} back to life.`
        : id ? `Benangmu putus… kebangkitan ${n(item.target)} gagal.` : `Your thread snapped… reviving ${n(item.target)} failed.`;
    case 'wasRevived':
      return id ? 'Kamu hidup kembali! Kamu kembali memiliki hak suara biasa.' : 'You are alive again! You have a normal vote again.';
    case 'pyreFired':
      return id ? `Kamu terbunuh — dan apimu membawa ${n(item.target)} ikut mati.` : `You were killed — and your fire took ${n(item.target)} with you.`;
    case 'baneReset':
      return id ? `${n(item.target)} adalah Cursed — seranganmu ter-reset dan target keduamu ikut diserang.` : `${n(item.target)} was a Cursed — your attack reset and your second target was attacked too.`;
    case 'crowned':
      return id
        ? 'Kamu menerima MAHKOTA Joker! Mulai malam berikutnya kamu wajib menyerang satu nomor kursi setiap malam, atau kamu mati saat pagi. Selama memegangnya, kemampuan peranmu tidak berlaku, malam maupun siang. Kamu tetap di kubumu dan tidak tahu siapa Joker.'
        : 'You received the Joker’s CROWN! From the next night you must attack a seat number every night, or you die in the morning. While you hold it, your role’s ability does not work, day or night. You keep your side and do not know who the Joker is.';
    case 'crownTaken':
      return id ? 'Mahkota telah diambil darimu. Kamu bebas lagi.' : 'The crown was taken from you. You are free again.';
    case 'crownGiven':
      return id ? `Mahkotamu kini dipegang ${n(item.target)}.` : `${n(item.target)} now holds your crown.`;
    case 'crownReturned':
      return id ? `Kamu menarik mahkota dari ${n(item.target)}.` : `You took the crown back from ${n(item.target)}.`;
    case 'infected':
      return id
        ? `Kamu TERINFEKSI! Sekarang kamu Kubu Gelap. Zombie: ${n(item.zombie)}.${item.hive.length ? ` Gerombolan lain: ${item.hive.map(n).join(', ')}.` : ''} Kemampuanmu tetap ada.`
        : `You are INFECTED! You are now on the Dark side. Zombie: ${n(item.zombie)}.${item.hive.length ? ` Other horde members: ${item.hive.map(n).join(', ')}.` : ''} You keep your ability.`;
    case 'infectResult':
      return item.ok
        ? id ? `${n(item.target)} berhasil diinfeksi.` : `${n(item.target)} is now infected.`
        : id ? `Infeksi terhadap ${n(item.target)} gagal.` : `Infecting ${n(item.target)} failed.`;
    case 'hiveGrew':
      return id ? `${n(item.target)} bergabung dengan gerombolan.` : `${n(item.target)} joined the horde.`;
    case 'died':
      return id ? 'Kamu mati malam ini. Kamu tetap boleh berbicara dan punya 1 suara hantu.' : 'You died tonight. You may keep talking and you have 1 ghost vote.';
    case 'becameBoss':
      return id ? `Abyss mengoper gelarnya: KAMU sekarang Nightbringer (${role(item.role)})!` : `The Abyss passed the title: YOU are now the Nightbringer (${role(item.role)})!`;
    case 'nothing':
      return id ? 'Tidak ada informasi untukmu pagi ini.' : 'No information for you this morning.';
  }
}

// ==================== CHRONICLE ====================
const FALSE_TAG: Record<Lang, Record<Exclude<Quality, 'true'>, string>> = {
  en: { poison: ' (false — poisoned)', gouge: ' (false — dying from a Gouge)', blind: ' (unreliable — blackout)' },
  id: { poison: ' (palsu — diracun)', gouge: ' (palsu — sekarat karena Gouge)', blind: ' (tidak bisa dipercaya — blackout)' },
};

/** One sentence of the end-of-game chronicle, in plain third-person language. */
export function chronicleLine(item: ChronItem, names: string[], roles: RoleId[], lang: Lang): string {
  const id = lang === 'id';
  const n = (p: number | null) => (p === null ? '—' : names[p]);
  const who = (p: number) => `${names[p]} (${ROLES[roles[p]].name})`;
  const role = (r: RoleId) => ROLES[r].name;
  const hit = (target: number, result: AttackResult) => {
    if (result === 'killed') return id ? `${n(target)} tewas.` : `${n(target)} died.`;
    if (result === 'aegis') return id ? `tetapi Aegis melindungi ${n(target)}.` : `but the Aegis protected ${n(target)}.`;
    if (result === 'tide') return id ? `tetapi pertukaran kursi Tide melindungi ${n(target)}.` : `but the Tide’s swap shielded ${n(target)}.`;
    return id ? `tapi ${n(target)} sudah mati.` : `but ${n(target)} was already dead.`;
  };
  switch (item.k) {
    case 'darkMeet':
      return id
        ? `Kubu Gelap saling mengenal: Nightbringer ${who(item.boss)}${item.shadows.length ? `, Shadow ${item.shadows.map(who).join(', ')}` : ''}.`
        : `The Dark side met: Nightbringer ${who(item.boss)}${item.shadows.length ? `, Shadows ${item.shadows.map(who).join(', ')}` : ''}.`;
    case 'poison':
      return id ? `${who(item.by)} meracuni ${n(item.target)}.` : `${who(item.by)} poisoned ${n(item.target)}.`;
    case 'protect':
      return item.ok
        ? id ? `${who(item.by)} melindungi ${n(item.target)}.` : `${who(item.by)} protected ${n(item.target)}.`
        : id ? `${who(item.by)} mencoba melindungi ${n(item.target)}, tapi sedang diracun.` : `${who(item.by)} tried to protect ${n(item.target)}, but was poisoned.`;
    case 'attack':
      return id ? `${who(item.by)} menyerang ${n(item.target)} — ${hit(item.target, item.result)}` : `${who(item.by)} attacked ${n(item.target)} — ${hit(item.target, item.result)}`;
    case 'bossPoisoned':
      return id ? `${who(item.by)} diracun — serangannya gagal.` : `${who(item.by)} was poisoned — the attack failed.`;
    case 'titlePassed':
      return item.to === null
        ? id ? `${who(item.from)} mengorbankan diri, tapi tidak ada Shadow yang mewarisi gelarnya.` : `${who(item.from)} sacrificed itself, but no Shadow could inherit the title.`
        : id ? `${who(item.from)} mengorbankan diri; ${n(item.to)} menjadi Abyss yang baru.` : `${who(item.from)} sacrificed itself; ${n(item.to)} became the new Abyss.`;
    case 'gouge':
      return item.result === 'marked'
        ? id ? `${who(item.by)} mencakar ${n(item.target)} — ia akan mati malam berikutnya.` : `${who(item.by)} gouged ${n(item.target)} — they will die next night.`
        : id ? `${who(item.by)} mencoba mencakar ${n(item.target)}, tetapi ${item.result === 'aegis' ? 'Aegis' : 'Tide'} melindunginya.` : `${who(item.by)} tried to gouge ${n(item.target)}, but the ${item.result === 'aegis' ? 'Aegis' : 'Tide'} protected them.`;
    case 'gougeDeath':
      return id ? `${n(item.target)} tewas akibat cakaran Gouge.` : `${n(item.target)} died from the Gouge’s wound.`;
    case 'baneReset':
      return id ? `Korban pertama ${who(item.by)}, ${n(item.first)}, adalah Cursed — serangannya ter-reset!` : `${who(item.by)}’s first victim, ${n(item.first)}, was a Cursed — the attack reset!`;
    case 'tide':
      return item.ok
        ? id ? `${who(item.by)} menukar kursi ${n(item.a)} dan ${n(item.b)} serta melindungi mereka.` : `${who(item.by)} swapped ${n(item.a)} and ${n(item.b)} and shielded them.`
        : id ? `${who(item.by)} mencoba menukar kursi ${n(item.a)} dan ${n(item.b)}, tapi gagal karena diracun.` : `${who(item.by)} tried to swap ${n(item.a)} and ${n(item.b)}, but was poisoned.`;
    case 'glitch':
      return id ? `${who(item.by)} menukar kursi ${n(item.a)} dan ${n(item.b)}.` : `${who(item.by)} swapped the seats of ${n(item.a)} and ${n(item.b)}.`;
    case 'crown':
      return id ? `${who(item.by)} memberikan mahkota kepada ${n(item.target)}.` : `${who(item.by)} gave the crown to ${n(item.target)}.`;
    case 'recall':
      return id ? `${who(item.by)} menarik kembali mahkota dari ${n(item.target)}.` : `${who(item.by)} took the crown back from ${n(item.target)}.`;
    case 'crownBurden':
      return id ? `${n(item.target)} tidak menyerang siapa pun dan runtuh di bawah beban mahkota.` : `${n(item.target)} attacked no one and collapsed under the crown.`;
    case 'seatAttack':
      return id
        ? `${n(item.by)} (pemegang mahkota) menyerang kursi ${item.seat + 1} — di sana duduk ${n(item.target)}: ${hit(item.target, item.result)}`
        : `${n(item.by)} (crown holder) attacked seat ${item.seat + 1} — ${n(item.target)} sat there: ${hit(item.target, item.result)}`;
    case 'infect':
      if (item.result === 'ok') return id ? `${who(item.by)} menginfeksi ${n(item.target)}.` : `${who(item.by)} infected ${n(item.target)}.`;
      if (item.result === 'already') return id ? `${who(item.by)} mencoba menginfeksi ${n(item.target)}, tapi tidak berhasil.` : `${who(item.by)} tried to infect ${n(item.target)}, without effect.`;
      return id ? `${who(item.by)} mencoba menginfeksi ${n(item.target)}, tetapi ${item.result === 'aegis' ? 'Aegis' : 'Tide'} memblokirnya.` : `${who(item.by)} tried to infect ${n(item.target)}, but the ${item.result === 'aegis' ? 'Aegis' : 'Tide'} blocked it.`;
    case 'frenzy':
      return id ? `Gerombolan yang mengamuk menyerang ${n(item.target)} — ${hit(item.target, item.result)}` : `The frenzied horde attacked ${n(item.target)} — ${hit(item.target, item.result)}`;
    case 'revive':
      return item.ok
        ? id ? `${who(item.by)} menghidupkan kembali ${n(item.target)}.` : `${who(item.by)} brought ${n(item.target)} back to life.`
        : id ? `${who(item.by)} mencoba menghidupkan ${n(item.target)}, tapi gagal karena diracun.` : `${who(item.by)} tried to revive ${n(item.target)}, but was poisoned.`;
    case 'pyre':
      return id ? `${who(item.by)} terbunuh dan membawa ${n(item.target)} ikut mati.` : `${who(item.by)} was killed and took ${n(item.target)} along.`;
    case 'pactDeath':
      return id ? `${n(item.target)} ikut mati karena terikat Pact dengan ${n(item.partner)}.` : `${n(item.target)} died too, bound by a Pact to ${n(item.partner)}.`;
    case 'echoDoom':
      return id ? `${who(item.target)} mati karena eksekusi yang salah kemarin.` : `${who(item.target)} died because of yesterday’s wrong execution.`;
    case 'viperDeath':
      return id ? `${n(item.target)} mati karena racun Viper.` : `${n(item.target)} died from the Viper’s venom.`;
    case 'info': {
      const tag = item.quality === 'true' ? '' : FALSE_TAG[lang][item.quality];
      const i = item.item;
      let body: string;
      switch (i.k) {
        case 'aura':
          body = id ? `memeriksa ${n(i.a)} & ${n(i.b)} → ${i.yes ? 'YA, ada Kubu Gelap' : 'TIDAK ada Kubu Gelap'}` : `checked ${n(i.a)} & ${n(i.b)} → ${i.yes ? 'YES, Dark among them' : 'NO Dark among them'}`;
          break;
        case 'noChoice':
          body = id ? 'tidak memilih siapa pun' : 'chose nobody';
          break;
        case 'rune':
          body = id ? `mengetahui ${i.count} tetangga hidupnya Kubu Gelap` : `learned ${i.count} living neighbour(s) are Dark`;
          break;
        case 'trace':
          body = i.target === null ? (id ? 'melihat tidak ada yang didatangi' : 'saw that nobody was visited') : id ? `melihat ${n(i.target)} didatangi` : `saw that ${n(i.target)} was visited`;
          break;
        case 'pair':
          body = id ? `diberi tahu: salah satu dari ${n(i.a)} atau ${n(i.b)} adalah ${role(i.role)}` : `was told: one of ${n(i.a)} or ${n(i.b)} is the ${role(i.role)}`;
          break;
        case 'pairNone':
          body = id ? (i.source === 'gaze' ? 'diberi tahu tidak ada Cursed' : 'tidak mendeteksi Shadow') : i.source === 'gaze' ? 'was told there is no Cursed' : 'detected no Shadow';
          break;
        case 'snare':
          body = id ? `melihat ${n(i.left)} = ${role(i.leftRole)} dan ${n(i.right)} = ${role(i.rightRole)}` : `saw ${n(i.left)} = ${role(i.leftRole)} and ${n(i.right)} = ${role(i.rightRole)}`;
          break;
        case 'dirge':
          body = id ? `mengetahui ${n(i.player)} adalah ${role(i.role)}${i.infected ? ' (terinfeksi)' : ''}` : `learned ${n(i.player)} was the ${role(i.role)}${i.infected ? ' (infected)' : ''}`;
          break;
        case 'dirgeNone':
          body = id ? 'tidak mendapat info (tidak ada eksekusi)' : 'learned nothing (no execution)';
          break;
        case 'pact':
          body = id ? `terikat Pact dengan ${n(i.partner)}` : `was bound by a Pact to ${n(i.partner)}`;
          break;
        default:
          body = reportLine(i, names, lang);
      }
      return `${who(item.p)} ${body}${tag}.`;
    }
    case 'testimony':
      return id
        ? `Kesaksian pagi — membacakan info: ${item.shared.map(n).join(', ') || '—'}; memilih diam: ${item.kept.map(n).join(', ') || '—'}.`
        : `Morning testimony — read aloud: ${item.shared.map(n).join(', ') || '—'}; kept quiet: ${item.kept.map(n).join(', ') || '—'}.`;
    case 'nomination':
      return id
        ? `${n(item.nominator)} menominasikan ${n(item.nominee)}: ${item.votes} suara${item.voters.length ? ` (${item.voters.map(n).join(', ')})` : ''} — ${item.valid ? 'cukup' : 'kurang'}.`
        : `${n(item.nominator)} nominated ${n(item.nominee)}: ${item.votes} vote(s)${item.voters.length ? ` (${item.voters.map(n).join(', ')})` : ''} — ${item.valid ? 'enough' : 'not enough'}.`;
    case 'executed':
      return id ? `${who(item.target)} dieksekusi.` : `${who(item.target)} was executed.`;
    case 'shielded':
      return id ? `Eksekusi ${who(item.target)} gagal — perisai Fang menahannya.` : `The execution of ${who(item.target)} failed — the Fang’s shield held.`;
    case 'noExecution':
      return id ? 'Tidak ada yang dieksekusi.' : 'Nobody was executed.';
    case 'nova':
      if (item.hit) return id ? `${who(item.shooter)} menembak ${who(item.target)} — tepat sasaran! Nova gugur bersama tembakannya.` : `${who(item.shooter)} shot ${who(item.target)} — a direct hit! The Nova died with the shot.`;
      if (item.real) return id ? `${who(item.shooter)} menembak ${n(item.target)} — meleset, dan Nova gugur sia-sia.` : `${who(item.shooter)} shot ${n(item.target)} — a miss, and the Nova died for nothing.`;
      return id ? `${who(item.shooter)} berpura-pura menembak ${n(item.target)}.` : `${who(item.shooter)} pretended to shoot ${n(item.target)}.`;
    case 'apex':
      return id ? `${who(item.by)} bertahan hingga tiga besar — voting seri memenangkan Kubu Terang!` : `${who(item.by)} survived to the final three — the tied vote won it for the Light side!`;
  }
}
