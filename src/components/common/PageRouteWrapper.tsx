import { useState, useEffect } from 'react';
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

interface PageRouteWrapperProps {
  children: React.ReactNode;
}

export function PageRouteWrapper({ children }: PageRouteWrapperProps) {
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState<PreloadProgress>({
    loaded: 0,
    total: 1,
    percentage: 0,
    currentAsset: '',
    phase: 'page',
  });
  const [messageIndex, setMessageIndex] = useState(0);

  // Preload assets on mount and pathname change
  useEffect(() => {
    let cancelled = false;
    setIsReady(false);
    setProgress({
      loaded: 0,
      total: 1,
      percentage: 0,
      currentAsset: '',
      phase: 'page',
    });

    preloadPageAssets(location.pathname, (p) => {
      if (!cancelled) setProgress(p);
    })
      .then(() => {
        if (!cancelled) {
          // Small delay so 100% is briefly visible
          setTimeout(() => {
            if (!cancelled) setIsReady(true);
          }, 300);
        }
      })
      .catch(() => {
        // Fail-safe: always render children
        if (!cancelled) setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  // Cycle loading messages
  useEffect(() => {
    if (isReady) return;
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [isReady]);

  return (
    <AnimatePresence mode="wait">
      {!isReady ? (
        <motion.div
          key="page-loader"
          className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-hound-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Scanlines & Vignette */}
          <div className="scanlines" />
          <div className="vignette" />

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
      ) : (
        <motion.div
          key="page-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="w-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

