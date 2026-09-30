/**
 * Texts for Nightfall Deception: UI labels, the full rulebook and the private
 * morning-report sentences (EN + ID).
 */
import { ROLES, type RoleId } from '@/data/nightfallRoles';
import { NF_MIN_PLAYERS, NF_MAX_PLAYERS, SETUP_TABLE, TIMING, type Lang, type ReportItem } from '@/lib/party/nightfall';

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
    setupTitle: 'Players',
    setupHint: `Enter ${NF_MIN_PLAYERS}–${NF_MAX_PLAYERS} names.`,
    playerPlaceholder: (i: number) => `Player ${i + 1}`,
    addPlayer: 'Add player',
    composition: (n: number) => {
      const [l, c, s, b] = SETUP_TABLE[n] ?? [0, 0, 0, 0];
      return `${n} players: ${l} Luminary · ${c} Cursed · ${s} Shadow · ${b} Nightbringer`;
    },
    errors: {
      tooFew: `At least ${NF_MIN_PLAYERS} players are needed.`,
      tooMany: `At most ${NF_MAX_PLAYERS} players.`,
      empty: 'Fill in every name (or remove empty rows).',
      duplicate: 'Each name must be different.',
    },
    shuffleSeats: 'SHUFFLE SEATS',
    seatingTitle: 'Round table',
    seatingIntro: (first: string) => `Sit in a circle in the order below. The game starts with ${first}, then continues to the left of ${first}.`,
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
    passDawnHint: 'Time to read your private morning report.',
    imReady: (name: string) => `I’m ${name} — show me`,
    yesterday: 'Yesterday',
    yourRole: 'Your role',
    keepSecret: 'Keep it secret! Read your role hint any time during your turn.',
    roleHint: 'ROLE HINT',
    prompt: {
      aura: 'Choose 2 players. At dawn you learn whether the Dark side is among them.',
      protect: 'Choose 1 other player to protect from tonight’s attack.',
      poison: 'Choose 1 player to poison. Their ability fails tonight and tomorrow.',
      kill: (count: number, self: boolean) => (count === 2 ? 'The Void was executed: choose 2 players to kill.' : `Choose 1 player to kill.${self ? ' Choose yourself to pass the title to a Shadow.' : ''}`),
      dummy: 'No action for you tonight. Tap the player you trust the least (this only disguises your turn).',
      dead: 'You are dead. Tap any player to disguise your turn.',
    },
    selected: (a: number, b: number) => `${a}/${b} chosen`,
    minWait: (s: number) => `Wait ${s}s…`,
    hideAndPass: 'DONE — HIDE & PASS',
    timeLeft: (s: number) => `${s}s`,
    lastPlayerTitle: 'You were the last player tonight',
    lastPlayerHint: 'Put the phone in the middle of the table now. Everyone, keep your eyes on it…',
    dawnIn: (s: number) => `Dawn in ${s}…`,
    deathsNone: 'Everyone survived the night.',
    deathsSome: (names: string) => `${names} did not wake up this morning.`,
    startDawnLap: (name: string) => `START MORNING REPORTS — PHONE TO ${name.toUpperCase()}`,
    seeResult: 'SEE THE RESULT',
    reportTitle: (n: number) => `Your report · Morning ${n}`,
    readPass: 'READ — HIDE & PASS',
    discussion: 'Discussion',
    discussionHint: 'Everyone may stand up, walk around and talk in small groups. Share who you trust and who you don’t — and remember that anyone can lie.',
    backToSeats: 'Back to your seats!',
    nomination: 'Nominations & voting',
    nominationHint: (need: number) => `Each living player may nominate once and each player can be nominated once per day. Voting is by show of hands. An execution needs at least ${need} votes. Highest valid vote (no tie) is executed when the day ends.`,
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
      novaHit: (s: string, t: string) => `${s} shot ${t} — ${t} falls!`,
      novaMiss: (s: string, t: string) => `${s} shot ${t}… nothing happened.`,
    },
    alive: 'alive',
    dead: 'dead',
    ghost: 'ghost vote',
    finalTitle: 'THE ORACLE HAS SPOKEN',
    winGood: 'The Light side wins!',
    winEvil: 'The Dark side wins!',
    reasons: {
      nbExecuted: 'The Nightbringer was executed.',
      nbShot: 'Nova shot the Nightbringer.',
      nbGone: 'The Nightbringer is dead.',
      parity: 'The Dark side now equals the Light side in number.',
    },
    grimoire: 'Who was who',
    playAgain: 'PLAY AGAIN (SAME PLAYERS)',
    newPlayers: 'NEW PLAYERS',
    backToGames: 'Back to games',
    confirmExit: 'Leave the game? Progress will be lost.',
    teamWord: { good: 'Light', evil: 'Dark' },
    notes: 'My secret notes',
    noNotes: 'No information yet.',
    goal: 'Goal',
    ability: 'Ability',
    tips: 'Tips',
    close: 'Close',
    roleBookTitle: 'Role book — Standard mode',
    roleBookHint: 'Take a screenshot to share with the group. Every game uses only some of these roles.',
    setupLegend: 'Players: Luminary · Cursed · Shadow · Nightbringer',
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
    setupTitle: 'Pemain',
    setupHint: `Masukkan ${NF_MIN_PLAYERS}–${NF_MAX_PLAYERS} nama.`,
    playerPlaceholder: (i: number) => `Pemain ${i + 1}`,
    addPlayer: 'Tambah pemain',
    composition: (n: number) => {
      const [l, c, s, b] = SETUP_TABLE[n] ?? [0, 0, 0, 0];
      return `${n} pemain: ${l} Luminary · ${c} Cursed · ${s} Shadow · ${b} Nightbringer`;
    },
    errors: {
      tooFew: `Minimal ${NF_MIN_PLAYERS} pemain.`,
      tooMany: `Maksimal ${NF_MAX_PLAYERS} pemain.`,
      empty: 'Isi semua nama (atau hapus baris yang kosong).',
      duplicate: 'Setiap nama harus berbeda.',
    },
    shuffleSeats: 'ACAK TEMPAT DUDUK',
    seatingTitle: 'Meja bundar',
    seatingIntro: (first: string) => `Duduklah melingkar sesuai urutan di bawah. Permainan dimulai dari ${first}, lalu berlanjut ke sebelah kiri ${first}.`,
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
    passDawnHint: 'Saatnya membaca laporan pagi rahasiamu.',
    imReady: (name: string) => `Saya ${name} — tampilkan`,
    yesterday: 'Kemarin',
    yourRole: 'Peranmu',
    keepSecret: 'Rahasiakan! Baca petunjuk peranmu kapan saja selama giliranmu.',
    roleHint: 'PETUNJUK PERAN',
    prompt: {
      aura: 'Pilih 2 pemain. Saat fajar kamu tahu apakah ada Kubu Gelap di antara mereka.',
      protect: 'Pilih 1 pemain lain untuk dilindungi dari serangan malam ini.',
      poison: 'Pilih 1 pemain untuk diracun. Kemampuannya gagal malam ini dan besok.',
      kill: (count: number, self: boolean) => (count === 2 ? 'Void telah dieksekusi: pilih 2 pemain untuk dibunuh.' : `Pilih 1 pemain untuk dibunuh.${self ? ' Pilih dirimu sendiri untuk mengoper gelar ke Shadow.' : ''}`),
      dummy: 'Tidak ada aksi untukmu malam ini. Ketuk pemain yang paling tidak kamu percaya (hanya untuk menyamarkan giliranmu).',
      dead: 'Kamu sudah mati. Ketuk pemain mana saja untuk menyamarkan giliranmu.',
    },
    selected: (a: number, b: number) => `${a}/${b} dipilih`,
    minWait: (s: number) => `Tunggu ${s} dtk…`,
    hideAndPass: 'SELESAI — SEMBUNYIKAN & OPER',
    timeLeft: (s: number) => `${s} dtk`,
    lastPlayerTitle: 'Kamu pemain terakhir malam ini',
    lastPlayerHint: 'Taruh HP di tengah meja sekarang. Semua pemain, perhatikan HP-nya…',
    dawnIn: (s: number) => `Fajar dalam ${s}…`,
    deathsNone: 'Semua pemain selamat malam ini.',
    deathsSome: (names: string) => `${names} tidak bangun pagi ini.`,
    startDawnLap: (name: string) => `MULAI LAPORAN PAGI — HP KE ${name.toUpperCase()}`,
    seeResult: 'LIHAT HASIL',
    reportTitle: (n: number) => `Laporanmu · Pagi ${n}`,
    readPass: 'SUDAH DIBACA — SEMBUNYIKAN & OPER',
    discussion: 'Diskusi',
    discussionHint: 'Semua boleh berdiri, berkeliling, dan berbicara dalam kelompok kecil. Ceritakan siapa yang kamu percaya dan siapa yang tidak — dan ingat, siapa pun bisa berbohong.',
    backToSeats: 'Kembali ke kursi masing-masing!',
    nomination: 'Nominasi & voting',
    nominationHint: (need: number) => `Setiap pemain hidup boleh menominasikan sekali dan setiap pemain hanya bisa dinominasikan sekali per hari. Voting dengan angkat tangan. Eksekusi butuh minimal ${need} suara. Nominasi dengan suara sah terbanyak (tidak seri) dieksekusi saat hari berakhir.`,
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
      novaHit: (s: string, t: string) => `${s} menembak ${t} — ${t} tumbang!`,
      novaMiss: (s: string, t: string) => `${s} menembak ${t}… tidak terjadi apa-apa.`,
    },
    alive: 'hidup',
    dead: 'mati',
    ghost: 'suara hantu',
    finalTitle: 'THE ORACLE TELAH BERSABDA',
    winGood: 'Kubu Terang menang!',
    winEvil: 'Kubu Gelap menang!',
    reasons: {
      nbExecuted: 'Nightbringer berhasil dieksekusi.',
      nbShot: 'Nova menembak Nightbringer.',
      nbGone: 'Nightbringer telah mati.',
      parity: 'Jumlah Kubu Gelap kini sama dengan Kubu Terang.',
    },
    grimoire: 'Siapa sebenarnya siapa',
    playAgain: 'MAIN LAGI (PEMAIN SAMA)',
    newPlayers: 'PEMAIN BARU',
    backToGames: 'Kembali ke games',
    confirmExit: 'Keluar dari permainan? Progres akan hilang.',
    teamWord: { good: 'Terang', evil: 'Gelap' },
    notes: 'Catatan rahasiaku',
    noNotes: 'Belum ada informasi.',
    goal: 'Tujuan',
    ability: 'Kemampuan',
    tips: 'Tips',
    close: 'Tutup',
    roleBookTitle: 'Buku peran — Mode Standar',
    roleBookHint: 'Ambil screenshot untuk dibagikan ke grup. Setiap permainan hanya memakai sebagian dari peran-peran ini.',
    setupLegend: 'Pemain: Luminary · Cursed · Shadow · Nightbringer',
  },
};

export type UIText = (typeof UI)['en'];

/** Full rulebook, shown from the start screen and the "Rules" button. */
export const RULES: Record<Lang, { title: string; items: string[] }[]> = {
  en: [
    { title: 'Goal', items: ['Light side (Luminaries + Cursed): execute the Nightbringer.', 'Dark side (Shadows + Nightbringer): become as many as the living Light players.'] },
    { title: 'Setup', items: [`${NF_MIN_PLAYERS}–${NF_MAX_PLAYERS} players sit around a round table in a random order shown by the app.`, 'Role mix by player count: ' + Object.entries(SETUP_TABLE).map(([n, t]) => `${n}p ${t.join('/')}`).join(' · ') + ' (Luminary/Cursed/Shadow/Nightbringer).', 'The phone is always passed to the player on the left.'] },
    { title: 'Night', items: [`Every player — alive or dead — takes a secret turn: ${TIMING.nightTurn}s (${TIMING.nightTurnFirst}s on the first night).`, `The “done” button unlocks after ${TIMING.minTurn}s so fast turns don’t reveal who has no ability. Players without an action tap a player to disguise their turn.`, 'If time runs out, a complete selection still counts; otherwise that player does nothing tonight, and the phone moves to the left automatically.', `The last player puts the phone in the middle of the table. ${TIMING.phoneToCenter}s later a sound plays: a death bell if someone died, or a calm morning sound if nobody did.`, 'On the first night the Dark side learns its team, and the Nightbringer gets 3 bluff roles that are not in the game.'] },
    { title: 'Morning', items: ['Deaths are announced. Then the phone goes around again and everyone privately reads their morning report' + ` (${TIMING.dawnTurn}s, ${TIMING.dawnTurnFirst}s on the first morning).`, 'Everything you learn is saved in “My secret notes” under the Role hint button, available on every private turn.'] },
    { title: 'Day', items: [`Discussion (${TIMING.discussion / 60} min): everyone may stand up, walk around and form small groups to share who they trust — or to lie.`, 'When the bell rings, return to your own seat: seats matter for abilities and passing the phone.', `Nominations & voting (${TIMING.nomination / 60} min): each living player nominates at most once, each player can be nominated at most once per day. Vote by raising hands; the app records who voted.`, 'An execution needs more than half of the living players. When the day ends, the nomination with the most valid votes is executed; a tie means nobody is executed.', 'Nova uses the “Day ability” button in public. Anyone can pretend — only the real Nova’s shot works.'] },
    { title: 'Death', items: ['Dead players stay at the table and may keep talking, but lose their normal vote.', 'Each dead player has one ghost vote to use once for the rest of the game.'] },
    { title: 'Poison & false information', items: ['A poisoned player’s ability fails that night and the next day: information becomes false, protection and shots fail.', 'Baiter always reads as Dark; Snare always reads as Light. Trust, but verify.'] },
  ],
  id: [
    { title: 'Tujuan', items: ['Kubu Terang (Luminary + Cursed): eksekusi Nightbringer.', 'Kubu Gelap (Shadow + Nightbringer): jumlahnya menyamai Kubu Terang yang masih hidup.'] },
    { title: 'Persiapan', items: [`${NF_MIN_PLAYERS}–${NF_MAX_PLAYERS} pemain duduk di meja bundar sesuai urutan acak dari aplikasi.`, 'Komposisi peran per jumlah pemain: ' + Object.entries(SETUP_TABLE).map(([n, t]) => `${n}p ${t.join('/')}`).join(' · ') + ' (Luminary/Cursed/Shadow/Nightbringer).', 'HP selalu dioper ke pemain di sebelah kiri.'] },
    { title: 'Malam', items: [`Setiap pemain — hidup maupun mati — mendapat giliran rahasia: ${TIMING.nightTurn} detik (${TIMING.nightTurnFirst} detik di malam pertama).`, `Tombol selesai baru aktif setelah ${TIMING.minTurn} detik supaya giliran yang cepat tidak membocorkan siapa yang tidak punya kemampuan. Pemain tanpa aksi mengetuk satu pemain untuk menyamarkan gilirannya.`, 'Jika waktu habis, pilihan yang sudah lengkap tetap dihitung; jika belum, pemain itu tidak beraksi malam ini, dan HP otomatis pindah ke kiri.', `Pemain terakhir menaruh HP di tengah meja. ${TIMING.phoneToCenter} detik kemudian terdengar suara: lonceng kematian jika ada yang mati, atau suara pagi yang tenang jika tidak ada.`, 'Di malam pertama Kubu Gelap saling mengenal, dan Nightbringer mendapat 3 peran samaran yang tidak ada dalam permainan.'] },
    { title: 'Pagi', items: [`Kematian diumumkan. Lalu HP berkeliling lagi dan setiap pemain membaca laporan pagi rahasianya (${TIMING.dawnTurn} detik, ${TIMING.dawnTurnFirst} detik di pagi pertama).`, 'Semua yang kamu ketahui tersimpan di "Catatan rahasiaku" pada tombol Petunjuk Peran, dan bisa dibuka di setiap giliran rahasiamu.'] },
    { title: 'Siang', items: [`Diskusi (${TIMING.discussion / 60} menit): semua boleh berdiri, berkeliling, dan membentuk kelompok kecil untuk berbagi siapa yang dipercaya — atau untuk berbohong.`, 'Saat bel berbunyi, kembali ke kursi masing-masing: posisi duduk penting untuk kemampuan dan urutan oper HP.', `Nominasi & voting (${TIMING.nomination / 60} menit): setiap pemain hidup menominasikan paling banyak sekali, dan setiap pemain paling banyak dinominasikan sekali per hari. Voting dengan angkat tangan; aplikasi mencatat siapa yang memilih.`, 'Eksekusi butuh lebih dari setengah pemain yang hidup. Saat hari berakhir, nominasi dengan suara sah terbanyak dieksekusi; jika seri, tidak ada yang dieksekusi.', 'Nova memakai tombol "Kemampuan siang" secara terbuka. Siapa pun bisa berpura-pura — hanya tembakan Nova asli yang berpengaruh.'] },
    { title: 'Kematian', items: ['Pemain yang mati tetap di meja dan boleh terus berbicara, tapi kehilangan hak suara biasa.', 'Setiap pemain mati punya satu suara hantu yang bisa dipakai sekali sampai akhir permainan.'] },
    { title: 'Racun & info palsu', items: ['Kemampuan pemain yang diracun gagal malam itu dan siang berikutnya: informasinya palsu, perlindungan dan tembakannya gagal.', 'Baiter selalu terbaca Gelap; Snare selalu terbaca Terang. Percaya boleh, tapi tetap periksa.'] },
  ],
};

/** Private morning-report sentence for one item. */
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
        ? id ? 'Trace: Kubu Gelap tidak mendatangi siapa pun malam ini.' : 'Trace: the Dark side visited nobody tonight.'
        : id ? `Trace: Kubu Gelap mendatangi ${n(item.target)} malam ini.` : `Trace: the Dark side visited ${n(item.target)} tonight.`;
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
    case 'dirge':
      return id ? `${n(item.player)} yang dieksekusi kemarin adalah ${role(item.role)}.` : `${n(item.player)}, executed yesterday, was the ${role(item.role)}.`;
    case 'dirgeNone':
      return id ? 'Kemarin tidak ada yang dieksekusi.' : 'Nobody was executed yesterday.';
    case 'died':
      return id ? 'Kamu mati malam ini. Kamu tetap boleh berbicara dan punya 1 suara hantu.' : 'You died tonight. You may keep talking and you have 1 ghost vote.';
    case 'becameBoss':
      return id ? `Abyss mengoper gelarnya: KAMU sekarang Nightbringer (${role(item.role)})!` : `The Abyss passed the title: YOU are now the Nightbringer (${role(item.role)})!`;
    case 'nothing':
      return id ? 'Tidak ada informasi untukmu pagi ini.' : 'No information for you this morning.';
  }
}
