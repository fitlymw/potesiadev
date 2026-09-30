import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { preloadPageAssets, type PreloadProgress } from '@/lib/preloader';

const LOADING_MESSAGES = [
  'Warping to new sector...',
  'Loading sector data...',
  'Buffering textures...',
  'Syncing audio channels...',
  'Rendering polygons...',
  'Compiling shaders...',
  'Establishing uplink...',
  'Decrypting assets...',
  'Calibrating display...',
  'Almost there...',
];

export function PageTransitionLoader() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<PreloadProgress>({
    loaded: 0,
    total: 1,
    percentage: 0,
    currentAsset: '',
    phase: 'page',
  });
  const [messageIndex, setMessageIndex] = useState(0);
  const prevPathRef = useRef(location.pathname);

  // Detect route changes
  useEffect(() => {
    const newPath = location.pathname;
    const prevPath = prevPathRef.current;

    // Skip on first mount (initial load handled by LoadingScreen)
    if (prevPath === newPath) {
      return;
    }

    prevPathRef.current = newPath;

    let cancelled = false;
    setIsLoading(true);
    setProgress({
      loaded: 0,
      total: 1,
      percentage: 0,
      currentAsset: '',
      phase: 'page',
    });

    preloadPageAssets(newPath, (p) => {
      if (!cancelled) setProgress(p);
    })
      .then(() => {
        if (!cancelled) {
          // Small delay so the 100% bar is visible briefly
          setTimeout(() => {
            if (!cancelled) setIsLoading(false);
          }, 300);
        }
      })
      .catch(() => {
        // Fail-safe: always allow navigation
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  // Cycle loading messages
  useEffect(() => {
    if (!isLoading) return;
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="page-loader"
          className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Scanlines */}
          <div className="scanlines opacity-30" />

          <div className="relative z-10 flex flex-col items-center gap-5 px-4 max-w-md w-full">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p
                className="text-amber-400 text-xs tracking-[0.3em] uppercase"
                style={{ fontFamily: '"Press Start 2P", cursive' }}
              >
                LOADING SECTOR
              </p>
            </motion.div>

            {/* Spinner */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-400 rounded-sm"
            />

            {/* Progress Bar */}
            <div className="w-full max-w-[280px] space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-green-400 font-pixel">PROGRESS</span>
                <span className="text-white/60">{progress.percentage}%</span>
              </div>

              <div className="h-3 bg-black/70 border border-white/20 relative overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
                {/* Segmented overlay */}
                <div className="absolute inset-0 flex">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="flex-1 border-r border-black/30" />
                  ))}
                </div>
              </div>

              {/* File name / message */}
              <motion.p
                key={progress.currentAsset || messageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/40 text-[10px] text-center truncate font-mono"
              >
                {progress.currentAsset
                  ? `> ${progress.currentAsset}`
                  : LOADING_MESSAGES[messageIndex]}
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

