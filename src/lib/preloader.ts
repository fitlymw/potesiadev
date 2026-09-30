/**
 * Asset Preloader untuk POTESIA
 *
 * Strategi:
 * 1. Initial Load:  CRITICAL_ASSETS saja — file kecil (poster, gif menu, SFX klik).
 *    Video & musik latar TIDAK ditunggu; keduanya di-stream oleh browser saat dipakai.
 * 2. Per-Page Load: PAGE_ASSETS[route] dimuat paralel, dengan batas waktu tunggu
 *    maksimum. Setelah batas itu halaman tetap ditampilkan dan sisa asset lanjut
 *    dimuat di background.
 * 3. Asset yang sudah pernah dimuat dicatat, sehingga membuka halaman yang sama
 *    lagi tidak memunculkan loader.
 */

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function assetUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return encodeURI(`${BASE}${cleanPath}`);
}

// ============================================================================
// PHASE 1: CRITICAL ASSETS — kecil, dimuat sekali saat website pertama dibuka
// ============================================================================
export const CRITICAL_ASSETS: string[] = [
  '/images/landing-poster.jpg',                      // Frame pertama video landing (tampil sebelum video siap)
  '/images/castle_retro.gif',                        // Menu background (dipakai banyak halaman)
  '/bg song/old_retro_games_click_sound_effect.wav', // Click SFX
];

// ============================================================================
// PHASE 2: PAGE-SPECIFIC ASSETS — dimuat saat navigasi ke halaman tersebut.
// Video tidak dimasukkan di sini: <video> men-stream sendiri tanpa perlu diunduh penuh.
// ============================================================================
export const PAGE_ASSETS: Record<string, string[]> = {
  '/': ['/images/landing-poster.jpg'],
  '/menu': ['/images/castle_retro.gif'],
  '/about-me': ['/images/about_me.webp', '/images/3x4_blue.jpg'],
  '/my-project': ['/images/projects.gif'],
  '/social-media': [
    '/images/freelance.webp',
    '/images/logo_spotify.png',
    '/images/LOGO_Roboflow.png',
    '/images/Logo_Pinterest.png',
    '/images/logo_youtube.png',
    '/images/logo_TIKTOK.png',
    '/images/logo_INSTAGRAM.png',
    '/images/LOGO_EMAIL.png',
    '/images/LOGO_FACEBOOK.png',
  ],
  '/academic-journal': ['/images/journal.gif'],
  '/freelance': ['/images/freelance.webp', '/bg song/slice_1.wav'],
  '/games': [
    '/images/mbti-icon.webp',
    '/images/big5.gif',
    '/images/protocol_slice.gif',
    '/images/camera_logo.png',
    '/images/matrix-icon.svg',
    '/images/mind-reader-icon.svg',
    '/images/castle_retro.gif',
  ],
  '/games/oracle-tavern': ['/images/mbtigamebg.gif'],
  // Gambar karakter MBTI diprefetch oleh game saat tipe sudah diketahui
  '/games/oracle-tavern/result': ['/images/mbtigamebg.gif', '/bg song/winner_sound.wav'],
  '/games/retro-ai-camera': ['/images/castle_retro.gif'],
  '/games/persona-core': ['/bg song/winner_sound.wav'],
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
  if (PAGE_ASSETS[pathname]) {
    return PAGE_ASSETS[pathname];
  }
  // Fallback: prefix match terpanjang (untuk nested routes yang belum terdaftar),
  // tanpa '/' supaya route tak dikenal tidak ikut memuat asset landing.
  const keys = Object.keys(PAGE_ASSETS)
    .filter((key) => key !== '/')
    .sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (pathname.startsWith(`${key}/`)) {
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
  if (['mp4', 'webm'].includes(ext)) return 'video';
  if (['wav', 'mp3', 'ogg', 'aac', 'm4a'].includes(ext)) return 'audio';
  return 'image';
}

function getAssetName(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

// ============================================================================
// CACHE — asset yang sudah selesai (berhasil/gagal) & yang sedang dimuat
// ============================================================================
const settled = new Set<string>();
const inflight = new Map<string, Promise<void>>();

export function isPageReady(pathname: string): boolean {
  return getPageAssets(pathname).every((path) => settled.has(assetUrl(path)));
}

// ============================================================================
// LOW-LEVEL PRELOADERS
// ============================================================================

function preloadImage(url: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => reject(new Error(`Timeout loading ${url}`)), timeoutMs);
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

/**
 * Audio/video kecil: cukup sampai browser bisa mulai memutar (canplaythrough),
 * bukan sampai seluruh file terunduh.
 */
function preloadMedia(url: string, type: 'audio' | 'video', timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = type === 'video' ? document.createElement('video') : new Audio();
    el.preload = 'auto';
    el.muted = true;
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout loading ${url}`));
    }, timeoutMs);
    const cleanup = () => {
      clearTimeout(timer);
      el.oncanplaythrough = null;
      el.onerror = null;
    };
    el.oncanplaythrough = () => {
      cleanup();
      resolve();
    };
    el.onerror = () => {
      cleanup();
      reject(new Error(`Failed to load ${url}`));
    };
    el.src = url;
    el.load();
  });
}

function preloadAsset(url: string, timeoutMs = 8000): Promise<void> {
  const existing = inflight.get(url);
  if (existing) return existing;
  if (settled.has(url)) return Promise.resolve();

  const type = detectAssetType(url);
  const task = (type === 'image' ? preloadImage(url, timeoutMs) : preloadMedia(url, type, timeoutMs))
    .catch((err) => {
      console.warn(`[Preloader] ${err instanceof Error ? err.message : err}`);
    })
    .finally(() => {
      settled.add(url);
      inflight.delete(url);
    });
  inflight.set(url, task);
  return task;
}

// ============================================================================
// BATCH PRELOADER (paralel)
// ============================================================================

async function preloadAssets(
  assets: string[],
  phaseName: 'critical' | 'page' | 'background',
  onProgress: (progress: PreloadProgress) => void
): Promise<void> {
  const total = assets.length;
  let loaded = 0;
  const report = (currentAsset: string) =>
    onProgress({
      loaded,
      total,
      percentage: total === 0 ? 100 : Math.round((loaded / total) * 100),
      currentAsset,
      phase: phaseName,
    });

  report(total > 0 ? getAssetName(assets[0]) : '');
  await Promise.all(
    assets.map((rawPath) =>
      preloadAsset(assetUrl(rawPath)).then(() => {
        loaded += 1;
        report(loaded < total ? getAssetName(rawPath) : '');
      })
    )
  );
}

function withMaxWait(task: Promise<void>, maxWaitMs: number): Promise<void> {
  return Promise.race([task, new Promise<void>((resolve) => setTimeout(resolve, maxWaitMs))]);
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Preload critical assets (landing page). Semuanya kecil, dan loading screen
 * tidak akan menunggu lebih dari maxWaitMs.
 */
export function preloadCritical(
  onProgress: (progress: PreloadProgress) => void,
  maxWaitMs = 6000
): Promise<void> {
  return withMaxWait(preloadAssets(CRITICAL_ASSETS, 'critical', onProgress), maxWaitMs);
}

/**
 * Preload asset untuk halaman tertentu. Dipanggil oleh PageRouteWrapper.
 * Resolve saat semua asset siap atau setelah maxWaitMs — mana yang lebih dulu.
 */
export function preloadPageAssets(
  pathname: string,
  onProgress: (progress: PreloadProgress) => void,
  maxWaitMs = 2500
): Promise<void> {
  return withMaxWait(preloadAssets(getPageAssets(pathname), 'page', onProgress), maxWaitMs);
}

/** Prefetch asset tanpa menunggu (mis. gambar hasil yang baru diketahui di akhir game). */
export function prefetchAsset(path: string): void {
  void preloadAsset(assetUrl(path));
}
