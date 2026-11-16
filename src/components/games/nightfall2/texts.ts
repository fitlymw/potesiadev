import type { SystemEvent } from '../../../../shared/nightfall2/messages';

export type Lang = 'id' | 'en';

export const TEXT = {
  id: {
    title: 'NIGHTFALL 2',
    subtitle: 'Elf Town',
    tagline: 'Kota fantasi 3D, 6–15 pemain online. Jalan-jalan di siang hari; di malam hari semua diam dan hanya Penyeru Kota yang bicara.',
    earlyAccess: 'Versi awal: lobby, jalan-jalan, loncat, emote, chat jarak dekat, dan Penyeru Kota. Peran, voting, dan voice chat menyusul.',
    yourName: 'Namamu',
    namePlaceholder: 'maks. 16 huruf',
    pickColor: 'Warna nama',
    character: 'Karakter',
    random: 'Acak',
    parts: { head: 'Kepala', body: 'Badan', arms: 'Lengan', legs: 'Kaki', cape: 'Jubah', hat: 'Topi', tint: 'Warna', height: 'Tinggi' },
    classes: ['Ksatria', 'Pencuri', 'Penyihir', 'Barbar'],
    capes: ['Tanpa jubah', 'Jubah Ksatria', 'Jubah Pencuri', 'Jubah Penyihir', 'Jubah Barbar'],
    hats: ['Tanpa topi', 'Helm', 'Topi Penyihir', 'Topi Barbar', 'Tudung', 'Kerucut', 'Mahkota', 'Daun', 'Baret'],
    heights: ['Mungil', 'Pendek', 'Sedang', 'Tinggi', 'Jangkung'],
    mixHint: 'Campur bagian dari empat petualang: kepala Ksatria, badan Penyihir, kaki Barbar…',
    create: 'BUAT LOBBY',
    join: 'GABUNG',
    codePlaceholder: 'KODE',
    or: 'atau',
    langNote: 'Penyeru Kota akan bicara dalam bahasa yang dipilih saat lobby dibuat.',
    connecting: 'Menghubungkan ke server…',
    errors: {
      offline: 'Server game belum online. Minta host menyalakan server, lalu coba lagi.',
      not_found: 'Lobby dengan kode itu tidak ditemukan.',
      full: 'Lobby penuh atau sudah dikunci.',
      failed: 'Gagal terhubung. Coba lagi.',
      disconnected: 'Koneksi terputus.',
    },
    back: 'Kembali',
    lobbyCode: 'Kode lobby',
    lobbyLang: 'Bahasa Penyeru',
    shareHint: 'Bagikan kode ini ke temanmu. Mereka buka halaman yang sama → GABUNG → ketik kodenya.',
    players: (n: number, max: number) => `Pemain ${n}/${max}`,
    host: 'Host',
    you: 'kamu',
    start: 'MULAI PERMAINAN',
    startNoRoles: 'MULAI TANPA PERAN',
    botsNote: 'Kursi kosong diisi warga bot supaya ronde tetap jalan — cocok untuk mencoba sendiri.',
    sandboxLabel: 'Jalan-jalan saja (tanpa peran)',
    rolesNeed: 'Peran dibagikan kalau ada 5-10 pemain. Di bawah itu kota tetap jalan: siang-malam, chat, dan Penyeru.',
    waitingHost: 'Menunggu host memulai…',
    leave: 'Keluar',
    phase: { lobby: 'Lobby', day: 'SIANG', night: 'MALAM' } as Record<string, string>,
    dayN: (d: number) => `Hari ${d}`,
    skip: 'Lewati fase',
    toLobby: 'Kembali ke lobby',
    chatPlaceholderDay: 'Bicara (terdengar sampai 10 m)…',
    chatPlaceholderNight: 'Malam hari: semua diam. Hanya Penyeru Kota yang bicara.',
    send: 'Kirim',
    near: 'dekat',
    chatEmpty: 'Belum ada obrolan di sekitarmu. Hanya pemain yang dekat yang bisa membaca pesanmu.',
    emote: 'Emote',
    emoteHint: 'Tekan-tahan, geser ke emote, lepas',
    emoteNames: ['Lambai', 'Tertawa', 'Menangis', 'Marah', 'Berpikir', 'Menunjuk', 'Menari', 'Hati'],
    jump: 'Loncat',
    crier: 'Penyeru Kota',
    yourTurn: 'GILIRANMU',
    confirmAction: 'KIRIM',
    skipAction: 'LEWATI',
    suspectLabel: 'Siapa yang paling tidak kamu percaya?',
    askingNow: (name: string) => `Penyeru sedang bertanya kepada ${name}…`,
    reportTitle: 'YANG KAMU KETAHUI',
    gotIt: 'MENGERTI',
    yourRole: 'Peranmu',
    roleRevealTitle: 'PERANMU MALAM INI',
    roleRevealHint: 'Jangan tunjukkan ke siapa pun. Ketuk untuk menutup.',
    roleBook: 'Buku peran',
    close: 'Tutup',
    mix: (n: number, l: number, c: number, sh: number, b: number) => `${n} pemain · ${l} Luminary · ${c} Cursed · ${sh} Shadow · ${b} Nightbringer`,
    ready: 'Siap lanjut',
    readyCount: (n: number, total: number) => `Siap ${n}/${total}`,
    readyHint: 'Fase berganti kalau semua pemain menekan ini',
    needPlayers: (n: number) => `Butuh 5-10 pemain untuk memulai ronde (sekarang ${n})`,
    crierVoiceOn: 'Suara Penyeru: nyala',
    crierVoiceOff: 'Suara Penyeru: mati',
    voiceMissing: 'Perangkat ini belum punya suara Bahasa Indonesia, jadi Penyeru hanya menulis. Pasang suara Indonesia di pengaturan Text-to-speech HP/PC.',
    controlsMobile: 'Joystick kiri untuk jalan · geser layar untuk memutar kamera',
    controlsDesktop: 'WASD jalan · Spasi loncat · 1–8 emote · seret mouse untuk kamera · Enter untuk chat',
    nightBanner: 'Malam turun. Semua diam — dengarkan Penyeru Kota.',
    dayBanner: 'Pagi tiba. Kota kembali ramai.',
    notice(ev: SystemEvent): string {
      switch (ev.key) {
        case 'joined': return `${ev.name} masuk ke kota`;
        case 'left': return `${ev.name} meninggalkan kota`;
        case 'host': return `${ev.name} sekarang jadi host`;
        case 'started': return 'Permainan dimulai. Hari 1.';
        case 'day': return `Hari ${ev.day} dimulai`;
        case 'night': return 'Malam turun…';
        case 'lobby': return 'Kembali ke lobby';
        case 'hush': return 'Ssst. Tidak ada yang boleh bicara sampai fajar.';
        case 'needPlayers': return `Butuh 5-10 pemain untuk memulai ronde (sekarang ${ev.day}).`;
      }
    },
  },
  en: {
    title: 'NIGHTFALL 2',
    subtitle: 'Elf Town',
    tagline: 'A 3D fantasy town for 6–15 players online. Roam by day; at night everyone falls silent and only the Town Crier speaks.',
    earlyAccess: 'Early build: lobbies, roaming, jumping, emotes, proximity chat and the Town Crier. Roles, voting and voice chat come next.',
    yourName: 'Your name',
    namePlaceholder: 'max 16 letters',
    pickColor: 'Name colour',
    character: 'Character',
    random: 'Random',
    parts: { head: 'Head', body: 'Body', arms: 'Arms', legs: 'Legs', cape: 'Cape', hat: 'Hat', tint: 'Colour', height: 'Height' },
    classes: ['Knight', 'Rogue', 'Mage', 'Barbarian'],
    capes: ['No cape', 'Knight cape', 'Rogue cape', 'Mage cape', 'Barbarian cape'],
    hats: ['No hat', 'Helmet', 'Mage hat', 'Barbarian hat', 'Hood', 'Wizard', 'Crown', 'Leaf', 'Beret'],
    heights: ['Tiny', 'Short', 'Average', 'Tall', 'Towering'],
    mixHint: 'Mix parts from four adventurers: a Knight head, a Mage body, Barbarian legs…',
    create: 'CREATE LOBBY',
    join: 'JOIN',
    codePlaceholder: 'CODE',
    or: 'or',
    langNote: 'The Town Crier speaks the language selected when the lobby is created.',
    connecting: 'Connecting to the server…',
    errors: {
      offline: 'The game server is offline. Ask the host to start it, then try again.',
      not_found: 'No lobby with that code.',
      full: 'That lobby is full or locked.',
      failed: 'Could not connect. Try again.',
      disconnected: 'Connection lost.',
    },
    back: 'Back',
    lobbyCode: 'Lobby code',
    lobbyLang: 'Crier language',
    shareHint: 'Share this code. Friends open the same page → JOIN → type the code.',
    players: (n: number, max: number) => `Players ${n}/${max}`,
    host: 'Host',
    you: 'you',
    start: 'START GAME',
    startNoRoles: 'START WITHOUT ROLES',
    botsNote: 'Empty seats are filled with townsfolk so a round still runs — handy for trying it alone.',
    sandboxLabel: 'Just roam the town (no roles)',
    rolesNeed: 'Roles are dealt with 5-10 players. Below that the town still runs: day and night, chat and the Crier.',
    waitingHost: 'Waiting for the host to start…',
    leave: 'Leave',
    phase: { lobby: 'Lobby', day: 'DAY', night: 'NIGHT' } as Record<string, string>,
    dayN: (d: number) => `Day ${d}`,
    skip: 'Skip phase',
    toLobby: 'Back to lobby',
    chatPlaceholderDay: 'Say something (heard within 10 m)…',
    chatPlaceholderNight: 'Night: everyone is silent. Only the Town Crier speaks.',
    send: 'Send',
    near: 'near',
    chatEmpty: 'No chatter near you yet. Only players close to you can read your messages.',
    emote: 'Emote',
    emoteHint: 'Press and hold, slide to an emote, release',
    emoteNames: ['Wave', 'Laugh', 'Cry', 'Angry', 'Think', 'Point', 'Dance', 'Heart'],
    jump: 'Jump',
    crier: 'Town Crier',
    yourTurn: 'YOUR TURN',
    confirmAction: 'CONFIRM',
    skipAction: 'SKIP',
    suspectLabel: 'Who do you trust least?',
    askingNow: (name: string) => `The Crier is questioning ${name}…`,
    reportTitle: 'WHAT YOU LEARNED',
    gotIt: 'GOT IT',
    yourRole: 'Your role',
    roleRevealTitle: 'YOUR ROLE',
    roleRevealHint: 'Do not show this to anyone. Tap to close.',
    roleBook: 'Role book',
    close: 'Close',
    mix: (n: number, l: number, c: number, sh: number, b: number) => `${n} players · ${l} Luminary · ${c} Cursed · ${sh} Shadow · ${b} Nightbringer`,
    ready: 'Ready',
    readyCount: (n: number, total: number) => `Ready ${n}/${total}`,
    readyHint: 'The phase turns over once every player presses this',
    needPlayers: (n: number) => `A round needs 5-10 players (there are ${n})`,
    crierVoiceOn: 'Crier voice: on',
    crierVoiceOff: 'Crier voice: off',
    voiceMissing: 'This device has no English voice installed, so the Crier only writes. Add one in your text-to-speech settings.',
    controlsMobile: 'Left joystick to walk · drag the screen to turn the camera',
    controlsDesktop: 'WASD to walk · Space to jump · 1–8 emotes · drag the mouse for the camera · Enter to chat',
    nightBanner: 'Night falls. Silence — listen to the Town Crier.',
    dayBanner: 'Morning comes. The town wakes up.',
    notice(ev: SystemEvent): string {
      switch (ev.key) {
        case 'joined': return `${ev.name} entered the town`;
        case 'left': return `${ev.name} left the town`;
        case 'host': return `${ev.name} is now the host`;
        case 'started': return 'The game begins. Day 1.';
        case 'day': return `Day ${ev.day} begins`;
        case 'night': return 'Night falls…';
        case 'lobby': return 'Back to the lobby';
        case 'hush': return 'Hush. Nobody speaks until dawn.';
        case 'needPlayers': return `A round needs 5-10 players (there are ${ev.day}).`;
      }
    },
  },
};

export function detectLang(): Lang {
  try {
    return (localStorage.getItem('i18nextLng') || 'id').startsWith('en') ? 'en' : 'id';
  } catch {
    return 'id';
  }
}
