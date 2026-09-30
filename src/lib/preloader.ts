/**
 * Asset Preloader untuk POTESIA
 *
 * Strategi:
 * 1. Initial Load:  CRITICAL_ASSETS saja (cepat, landing page ready)
 * 2. Per-Page Load: PAGE_ASSETS[route] diload saat navigasi ke halaman tersebut
 */

const BASE = '/potesiadev';

function assetUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${cleanPath}`;
}

// ============================================================================
// PHASE 1: CRITICAL ASSETS — Dimuat sekali saat website pertama dibuka
// ============================================================================
export const CRITICAL_ASSETS: string[] = [
  '/images/Wisuda_old_retro.mp4',                    // Landing video background
  '/images/castle_retro.gif',                        // Menu background (dipakai banyak halaman)
  '/bg song/bg_song.wav',                            // Background music
  '/bg song/old_retro_games_click_sound_effect.wav', // Click SFX
];

// ============================================================================
// PHASE 2: PAGE-SPECIFIC ASSETS — Dimuat saat navigasi ke halaman tersebut
// ============================================================================
export const PAGE_ASSETS: Record<string, string[]> = {
  // --- Landing ---
  '/': [], // Sudah ada di CRITICAL_ASSETS

  // --- Menu ---
  '/menu': [], // castle_retro.gif sudah di CRITICAL_ASSETS

  // --- About Me ---
  '/about-me': [
    '/images/about_me.gif',
    '/images/3x4_blue.jpg',
  ],

  // --- My Project ---
  '/my-project': [
    '/images/projects.gif',
    '/bg song/objectdetection_yolo.mp4',
    '/bg song/absensi_arcface.mp4',
  ],

  // --- Social Media ---
  '/social-media': [
    '/images/social_media.gif',
    '/images/logo_spotify.png',
    '/images/LOGO_Roboflow.png',
    '/images/Logo_Pinterest.png',
    '/images/logo_youtube.png',
    '/images/logo_TIKTOK.png',
    '/images/logo_INSTAGRAM.png',
    '/images/LOGO_EMAIL.png',
    '/images/LOGO_FACEBOOK.png',
  ],

  // --- Academic Journal ---
  '/academic-journal': [
    '/images/journal.gif',
  ],

  // --- Freelance ---
  '/freelance': [
    '/images/freelance.gif',
    '/bg song/slice_1.wav',
  ],

  // --- Games Hub ---
  '/games': [
    '/images/mbti-bg.gif',
    '/images/big5.gif',
    '/images/protocol_slice.gif',
    '/images/camera_logo.png',
    // castle_retro.gif sudah di CRITICAL_ASSETS
  ],

  // --- Oracle Tavern ---
  '/games/oracle-tavern': [
    '/images/mbtigamebg.gif',
    '/bg song/slice_1.wav',
    '/bg song/slice_2.wav',
    '/bg song/slice_3.wav',
    '/bg song/slice_4.wav',
  ],

  // --- Oracle Result ---
  '/games/oracle-tavern/result': [
    '/images/mbtigamebg.gif',
    '/bg song/winner_sound.wav',
    '/images/MBTI Character/ENFJ.png',
    '/images/MBTI Character/ENFP.png',
    '/images/MBTI Character/ENTJ.png',
    '/images/MBTI Character/ENTP.png',
    '/images/MBTI Character/ESFJ.png',
    '/images/MBTI Character/ESFP.png',
    '/images/MBTI Character/ESTJ.png',
    '/images/MBTI Character/ESTP.png',
    '/images/MBTI Character/INFJ.png',
    '/images/MBTI Character/INFP.png',
    '/images/MBTI Character/INTJ.png',
    '/images/MBTI Character/INTP.png',
    '/images/MBTI Character/ISFJ.png',
    '/images/MBTI Character/ISFP.png',
    '/images/MBTI Character/ISTJ.png',
    '/images/MBTI Character/ISTP.png',
  ],

  // --- Retro AI Camera ---
  '/games/retro-ai-camera': [
    // castle_retro.gif sudah di CRITICAL_ASSETS
  ],

  // --- Persona Core ---
  '/games/persona-core': [
    '/bg song/winner_sound.wav',
  ],

  // --- Protocol Slice ---
  '/games/protocol-slice': [
    '/images/protocol_slice.gif',
    '/bg song/slice_1.wav',
    '/bg song/slice_2.wav',
    '/bg song/slice_3.wav',
    '/bg song/slice_4.wav',
  ],
};

/**
 * Ambil daftar asset untuk suatu route.
 * Mengembalikan array kosong jika route tidak dikenal.
 */
export function getPageAssets(pathname: string): string[] {
  // Exact match
  if (PAGE_ASSETS[pathname]) {
    return PAGE_ASSETS[pathname];
  }
  // Fallback: cari prefix match (untuk nested routes yang belum terdaftar)
  const keys = Object.keys(PAGE_ASSETS).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (pathname.startsWith(key)) {
      return PAGE_ASSETS[key];
    }
  }
  return [];
}

export type AssetType = 'image' | 'video' | 'audio';

export interface PreloadProgress {
  loaded: number;
  total: number;
  percentage: number; // 0 - 100
  currentAsset: string;
  phase: 'critical' | 'page' | 'background' | 'complete';
}

function detectAssetType(url: string): AssetType {
  const ext = url.split('.').pop()?.toLowerCase() || '';
  if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
  if (['wav', 'mp3', 'ogg', 'aac'].includes(ext)) return 'audio';
  return 'image';
}

function getAssetName(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

// ============================================================================
// MEDIA CACHE — Menyimpan referensi elemen video/audio agar tidak di-GC
// ============================================================================
const mediaCache = new Map<string, HTMLVideoElement | HTMLAudioElement>();

function cacheMedia(url: string, el: HTMLVideoElement | HTMLAudioElement) {
  mediaCache.set(url, el);
}

export function getCachedMedia(url: string): HTMLVideoElement | HTMLAudioElement | undefined {
  return mediaCache.get(url);
}

// ============================================================================
// LOW-LEVEL PRELOADERS
// ============================================================================

function preloadImage(url: string, timeoutMs = 15000): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => {
      img.src = '';
      reject(new Error(`Timeout loading ${url}`));
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error(`Failed to load ${url}`));
    };
    img.src = url;
  });
}

function preloadVideo(url: string, timeoutMs = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    // Cek cache dulu
    const cached = mediaCache.get(url) as HTMLVideoElement | undefined;
    if (cached && cached.readyState >= 3) {
      resolve();
      return;
    }

    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'auto';
    video.playsInline = true;

    let resolved = false;

    const timer = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      video.src = '';
      reject(new Error(`Timeout loading ${url}`));
    }, timeoutMs);

    const onReady = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      // Simpan ke cache agar tidak di-GC
      cacheMedia(url, video);
      setTimeout(() => resolve(), 300);
    };

    video.oncanplaythrough = onReady;
    video.onloadeddata = () => {
      setTimeout(() => {
        if (!resolved) onReady();
      }, 500);
    };
    video.onerror = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      reject(new Error(`Failed to load ${url}`));
    };

    video.src = url;
    video.load();
  });
}

function preloadAudio(url: string, timeoutMs = 20000): Promise<void> {
  return new Promise((resolve, reject) => {
    // Cek cache dulu
    const cached = mediaCache.get(url) as HTMLAudioElement | undefined;
    if (cached && cached.readyState >= 3) {
      resolve();
      return;
    }

    const audio = new Audio();
    audio.preload = 'auto';

    let resolved = false;

    const timer = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      audio.src = '';
      reject(new Error(`Timeout loading ${url}`));
    }, timeoutMs);

    const onReady = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      // Simpan ke cache agar tidak di-GC
      cacheMedia(url, audio);
      resolve();
    };

    audio.oncanplaythrough = onReady;
    audio.onloadeddata = () => {
      setTimeout(() => {
        if (!resolved) onReady();
      }, 500);
    };
    audio.onerror = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      reject(new Error(`Failed to load ${url}`));
    };

    audio.src = url;
    audio.load();
  });
}

function preloadAsset(url: string): Promise<void> {
  const type = detectAssetType(url);
  switch (type) {
    case 'video':
      return preloadVideo(url);
    case 'audio':
      return preloadAudio(url);
    default:
      return preloadImage(url);
  }
}

// ============================================================================
// BATCH PRELOADER
// ============================================================================

async function preloadAssets(
  assets: string[],
  phaseName: 'critical' | 'page' | 'background',
  onProgress: (progress: PreloadProgress) => void
): Promise<{ success: string[]; failed: string[] }> {
  const success: string[] = [];
  const failed: string[] = [];
  const total = assets.length;

  for (let i = 0; i < assets.length; i++) {
    const rawPath = assets[i];
    const url = assetUrl(rawPath);
    const name = getAssetName(rawPath);

    onProgress({
      loaded: i,
      total,
      percentage: Math.round((i / total) * 100),
      currentAsset: name,
      phase: phaseName,
    });

    try {
      await preloadAsset(url);
      success.push(rawPath);
    } catch (err) {
      console.warn(`[Preloader] Failed to load: ${rawPath}`, err);
      failed.push(rawPath);
    }
  }

  onProgress({
    loaded: total,
    total,
    percentage: 100,
    currentAsset: '',
    phase: phaseName,
  });

  return { success, failed };
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Preload semua asset (critical + background).
 * Berguna jika ingin loading screen tunggu semua asset.
 */
export async function preloadAll(
  onProgress: (progress: PreloadProgress) => void
): Promise<void> {
  await preloadAssets(CRITICAL_ASSETS, 'critical', onProgress);
  onProgress({ loaded: 0, total: 0, percentage: 100, currentAsset: '', phase: 'complete' });
}

/**
 * Preload hanya critical assets (landing page).
 * Cepat — hanya 4 file.
 */
export async function preloadCritical(
  onProgress: (progress: PreloadProgress) => void
): Promise<{ success: string[]; failed: string[] }> {
  return preloadAssets(CRITICAL_ASSETS, 'critical', onProgress);
}

/**
 * Preload asset untuk halaman tertentu.
 * Dipanggil oleh PageTransitionLoader saat user navigasi.
 */
export async function preloadPageAssets(
  pathname: string,
  onProgress: (progress: PreloadProgress) => void
): Promise<{ success: string[]; failed: string[] }> {
  const assets = getPageAssets(pathname);
  if (assets.length === 0) {
    // Tidak ada asset khusus untuk halaman ini
    onProgress({ loaded: 0, total: 0, percentage: 100, currentAsset: '', phase: 'page' });
    return { success: [], failed: [] };
  }
  return preloadAssets(assets, 'page', onProgress);
}

