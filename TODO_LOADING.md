# Loading Screen Implementation TODO

## Phase 1: Basic Loading Screen (DONE)
- [x] Step 1: Create `src/lib/preloader.ts` — asset preloader utility with Phase 1 & 2
- [x] Step 2: Create `src/components/common/LoadingScreen.tsx` — retro RPG loading UI
- [x] Step 3: Modify `src/App.tsx` — integrate preloader + LoadingScreen
- [x] Step 4: Modify `index.html` — dark flash prevention + preload hints
- [x] Step 5: Verify build succeeds

## Phase 2: Comprehensive Asset Preloading (DONE)
- [x] Step 6: Expand `CRITICAL_ASSETS` to include ALL videos (5) and ALL audio files (9)
- [x] Step 7: Expand `BACKGROUND_ASSETS` to include ALL images used across the site
  - Background GIFs (9)
  - Key images / logos / portraits (~20)
  - MBTI Character PNGs (16)
  - Product images (5)
- [x] Step 8: Update `App.tsx` to use `preloadAll` instead of `preloadCritical`
  - Loading screen now waits for ALL assets before letting user in
- [x] Step 9: Update `LoadingScreen.tsx` to call `preloadAll`
- [x] Step 10: Update `index.html` preload hints for all videos & audio
- [x] Step 11: Improve `preloadVideo` and `preloadAudio` with deduplication guards
- [x] Step 12: Verify build succeeds



