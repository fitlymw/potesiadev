# Asset Fix Plan - React Vite GitHub Pages Project

## Task Summary
Fix asset loading issues caused by filenames with spaces in public/images/ and public/bg song/ folders.

## ✅ COMPLETED: Source Code Fixes

### 1. MBTIOracleGame.tsx ✅
- **Before**: `useAudio('/bg song/winner sound.wav', { volume: 0.6 })`
- **After**: `useAudio('/bg song/winner_sound.wav', { volume: 0.6 })`

### 2. PersonaCore.tsx ✅
- **Before**: `useAudio('/bg song/winner sound.wav', { volume: 0.6 })`
- **After**: `useAudio('/bg song/winner_sound.wav', { volume: 0.6 })`

## ⚠️ Manual Action Required: Physical File Rename

### Files to Rename in public/bg song/:
| Current Name | New Name |
|-------------|----------|
| slice 2.wav | slice_2.wav |
| slice 3.wav | slice_3.wav |
| slice 4.wav | slice_4.wav |

### How to Run the Rename Script
1. Open VS Code terminal
2. Navigate to the app folder: `cd app`
3. Run the PowerShell script: `powershell -ExecutionPolicy Bypass -File rename_assets.ps1`

The script is located at: `app/rename_assets.ps1`

## Files Already Correct (No Changes Needed)
- App.css - Uses `/potesiadev/images/castle_retro.gif` (already snake_case)
- index.css - No asset references
- ProtocolSlicePage.tsx - Already uses slice_1.wav, slice_2.wav, etc.
- OracleResultPage.tsx - Already uses winner_sound.wav
- lib/audio.ts - Already uses snake_case names

## After Running the Script
1. Run `npm run build` to rebuild your project
2. The dist folder will now have properly named assets
3. Deploy to GitHub Pages with `npm run deploy`
