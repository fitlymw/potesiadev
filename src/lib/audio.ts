// Module-level singleton
let bgMusic: HTMLAudioElement | null = null;
let clickSound: HTMLAudioElement | null = null;
let transitionSound: HTMLAudioElement | null = null;
let isInitialized = false;
let hasUserInteracted = false;
/** A game (e.g. Nightfall) has paused the background music to play its own. */
let pausedByGame = false;

// Site-wide mute for the background music only (click sounds and game audio are unaffected)
const BG_MUTE_KEY = 'potesia-bg-muted';
let bgMuted = (() => {
  try {
    return localStorage.getItem(BG_MUTE_KEY) === '1';
  } catch {
    return false;
  }
})();
const muteListeners = new Set<() => void>();

export function isBgMuted(): boolean {
  return bgMuted;
}

export function setBgMuted(muted: boolean): void {
  bgMuted = muted;
  try {
    localStorage.setItem(BG_MUTE_KEY, muted ? '1' : '0');
  } catch {
    // Storage unavailable: the choice lasts for this visit only
  }
  if (muted) bgMusic?.pause();
  else attemptPlayBgMusic();
  muteListeners.forEach((fn) => fn());
}

export function subscribeBgMuted(fn: () => void): () => void {
  muteListeners.add(fn);
  return () => {
    muteListeners.delete(fn);
  };
}

// Helper untuk jalur GitHub Pages agar mencari di folder /potesiadev/
const getAssetUrl = (path: string) => {
  const base = import.meta.env.BASE_URL.slice(0, -1);
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

export function initAudio() {
  if (isInitialized) return;
  isInitialized = true;

  try {
    // 1. Musik Latar: MP3 128 kbps (~4 MB) yang di-stream, bukan WAV 52 MB
    bgMusic = new Audio(getAssetUrl('/bg song/bg_song.mp3'));
    bgMusic.preload = 'auto';
    bgMusic.loop = true;
    bgMusic.volume = 0.4;

    // 2. Klik: Sesuai dengan properti di image_08723b.png (old_retro_games_click_sound_effect.wav)
    clickSound = new Audio(getAssetUrl('/bg song/old_retro_games_click_sound_effect.wav')); 
    clickSound.volume = 0.6;

    // 3. Transisi: Sesuai dengan Wind_rising.wav (Huruf W besar)
    transitionSound = new Audio(getAssetUrl('/bg song/Wind_rising.wav'));
    transitionSound.volume = 0.5;

    attemptPlayBgMusic();

    const handleFirstInteraction = () => {
      if (!hasUserInteracted) {
        hasUserInteracted = true;
        attemptPlayBgMusic();
      }
    };

    // Gunakan 'once: true' agar event listener langsung terhapus setelah sekali klik
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });
  } catch (e) {
    console.error('Failed to initialize audio:', e);
  }
}

function attemptPlayBgMusic() {
  if (bgMusic && !bgMuted && !pausedByGame) {
    bgMusic.play().catch(() => {
      console.log("Menunggu interaksi user untuk memutar musik...");
    });
  }
}

export function playClick(): void {
  if (clickSound) {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
  }
}

export function playTransition(): void {
  if (transitionSound) {
    transitionSound.currentTime = 0;
    transitionSound.play().catch(() => {});
  }
}

export function stopBgMusic(): void {
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
}

export function pauseBgMusic(): void {
  pausedByGame = true;
  if (bgMusic) bgMusic.pause();
}

export function resumeBgMusic(): void {
  pausedByGame = false;
  attemptPlayBgMusic();
}
