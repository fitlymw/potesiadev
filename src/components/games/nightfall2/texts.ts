import type { SystemEvent } from '../../../../shared/nightfall2/messages';

export type Lang = 'id' | 'en';

export const TEXT = {
  id: {
    title: 'NIGHTFALL 2',
    subtitle: 'Elf Town',
    tagline: 'Kota fantasi 3D, 6–15 pemain online. Jalan-jalan di siang hari, berbisik dalam gelap di malam hari.',
    earlyAccess: 'Versi awal: jalan-jalan, lobby, dan chat jarak dekat. Peran, voting, dan voice chat menyusul.',
    yourName: 'Namamu',
    namePlaceholder: 'maks. 16 huruf',
    pickColor: 'Warna',
    create: 'BUAT LOBBY',
    join: 'GABUNG',
    codePlaceholder: 'KODE',
    or: 'atau',
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
    shareHint: 'Bagikan kode ini ke temanmu. Mereka buka halaman yang sama → GABUNG → ketik kodenya.',
    players: (n: number, max: number) => `Pemain ${n}/${max}`,
    host: 'Host',
    you: 'kamu',
    start: 'MULAI PERMAINAN',
    waitingHost: 'Menunggu host memulai…',
    leave: 'Keluar',
    phase: { lobby: 'Lobby', day: 'SIANG', night: 'MALAM' } as Record<string, string>,
    dayN: (d: number) => `Hari ${d}`,
    skip: 'Lewati fase',
    toLobby: 'Kembali ke lobby',
    chatPlaceholderDay: 'Bicara (terdengar sampai 10 m)…',
    chatPlaceholderNight: 'Berbisik (hanya 4 m)…',
    send: 'Kirim',
    whisper: 'bisik',
    near: 'dekat',
    chatEmpty: 'Belum ada obrolan di sekitarmu. Hanya pemain yang dekat yang bisa membaca pesanmu.',
    controlsMobile: 'Joystick kiri untuk jalan · geser layar untuk memutar kamera',
    controlsDesktop: 'WASD / panah untuk jalan · seret mouse untuk memutar kamera · Enter untuk chat',
    nightBanner: 'Malam turun. Suaramu hanya terdengar oleh yang paling dekat.',
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
      }
    },
  },
  en: {
    title: 'NIGHTFALL 2',
    subtitle: 'Elf Town',
    tagline: 'A 3D fantasy town for 6–15 players online. Roam by day, whisper in the dark by night.',
    earlyAccess: 'Early build: roaming, lobbies and proximity chat. Roles, voting and voice chat come next.',
    yourName: 'Your name',
    namePlaceholder: 'max 16 letters',
    pickColor: 'Colour',
    create: 'CREATE LOBBY',
    join: 'JOIN',
    codePlaceholder: 'CODE',
    or: 'or',
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
    shareHint: 'Share this code. Friends open the same page → JOIN → type the code.',
    players: (n: number, max: number) => `Players ${n}/${max}`,
    host: 'Host',
    you: 'you',
    start: 'START GAME',
    waitingHost: 'Waiting for the host to start…',
    leave: 'Leave',
    phase: { lobby: 'Lobby', day: 'DAY', night: 'NIGHT' } as Record<string, string>,
    dayN: (d: number) => `Day ${d}`,
    skip: 'Skip phase',
    toLobby: 'Back to lobby',
    chatPlaceholderDay: 'Say something (heard within 10 m)…',
    chatPlaceholderNight: 'Whisper (4 m only)…',
    send: 'Send',
    whisper: 'whisper',
    near: 'near',
    chatEmpty: 'No chatter near you yet. Only players close to you can read your messages.',
    controlsMobile: 'Left joystick to walk · drag the screen to turn the camera',
    controlsDesktop: 'WASD / arrows to walk · drag the mouse to turn the camera · Enter to chat',
    nightBanner: 'Night falls. Only the closest players can hear you.',
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
