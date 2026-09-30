# Loading Screen Implementation Plan

## Information Gathered
- LoadingScreen.tsx exists with a retro RPG UI and progress bar
- preloader.ts exists with CRITICAL_ASSETS (4 items) and BACKGROUND_ASSETS (9 GIFs)
- App.tsx only waits for preloadCritical before showing the site
- index.html has only 4 preload hints
- MANY assets are NOT preloaded: videos, sounds, and images across pages

## Edits to Make
1. **src/lib/preloader.ts** - Expand CRITICAL_ASSETS to ALL videos + ALL audio. Expand BACKGROUND_ASSETS to ALL images.
2. **src/App.tsx** - Change preloadCritical -> preloadAll to wait for everything.
3. **src/components/common/LoadingScreen.tsx** - Use preloadAll, show total count.
4. **index.html** - Add preload hints for ALL videos and audio files.
5. **TODO_LOADING.md** - Update checklist.

