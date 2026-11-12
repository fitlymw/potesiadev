import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// The site has two homes:
//  - GitHub Pages at /potesiadev/ (hash router, no SPA fallback)  → `npm run build`
//  - potesia.com/games/ served by Vercel (browser router)           → detected via VERCEL=1
// VITE_BASE_PATH and VITE_ROUTER override the detection.
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const onVercel = env.VERCEL === '1';
  const base = env.VITE_BASE_PATH || (onVercel ? '/games/' : '/potesiadev/');
  process.env.VITE_ROUTER = env.VITE_ROUTER || (onVercel ? 'browser' : 'hash');
  return {
    base,
    plugins: [inspectAttr(), react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // On Vercel the files must physically live under /games/ so the proxy from potesia.com finds them
      outDir: base === '/potesiadev/' ? 'dist' : path.posix.join('dist', base),
    },
  };
});
