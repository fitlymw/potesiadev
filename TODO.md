# i18n Flow Refactor - TODO

## Steps
- [x] 1. Read and understand all relevant files (App.tsx, LandingPage.tsx, LanguageGateway.tsx, i18n.ts)
- [x] 2. Brainstorm and confirm plan with user
- [x] 3. Edit `app/src/App.tsx` — Simplify state, remove language blocking, pass `setShowLanguageGateway` to LandingPage, render LanguageGateway as overlay
- [x] 4. Edit `app/src/pages/LandingPage.tsx` — Add visible language selection button (top-right, retro RPG style), accept new props, simplify PRESS START
- [x] 5. Verify `app/src/components/LanguageGateway.tsx` — z-index and close logic are correct
- [x] 6. Verify `app/src/i18n.ts` — loadPath is correct for GitHub Pages
- [x] 7. Add missing translation keys to `en` and `id` locale files
- [x] 8. Run TypeScript check (`npx tsc --noEmit`)
- [x] 9. Mark task complete

