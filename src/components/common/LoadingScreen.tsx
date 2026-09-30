import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { preloadCritical, type PreloadProgress } from '@/lib/preloader';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LOADING_MESSAGES = [
  'Initializing Realm...',
  'Summoning Pixel Spirits...',
  'Loading Background Realms...',
  'Tuning Retro Synthwaves...',
  'Polishing the Crystal Ball...',
  'Sharpening the Blade...',
  'Invoking Ancient Spells...',
  'Charging Mana Crystals...',
  'Aligning Star Constellations...',
  'Almost there, Hero...',
];

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState<PreloadProgress>({
    loaded: 0,
    total: 1,
    percentage: 0,
    currentAsset: '',
    phase: 'critical',
  });
  const [isReady, setIsReady] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Start preloading critical assets on mount
  useEffect(() => {
    let cancelled = false;

    preloadCritical((p) => {
      if (!cancelled) setProgress(p);
    })
      .then(() => {
        if (!cancelled) setIsReady(true);
      })
      .catch(() => {
        // Even on error, allow user to proceed (fail-safe)
        if (!cancelled) setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Cursor blink effect
  useEffect(() => {
    const timer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(timer);
  }, []);

  // Cycle loading messages
  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const handleStart = useCallback(() => {
    setIsExiting(true);
    // Give time for exit animation before unmounting
    setTimeout(() => {
      onComplete();
    }, 800);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="loading-screen"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-hound-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          {/* Scanlines & Vignette for retro feel */}
          <div className="scanlines" />
          <div className="vignette" />

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="star-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: Math.random() * 0.5 + 0.3,
                }}
              />
            ))}
          </div>

          {/* Content container */}
          <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 px-4 max-w-lg w-full">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1
                className="text-amber-400 text-lg sm:text-xl md:text-2xl tracking-[0.3em] uppercase retro-glow"
                style={{ fontFamily: '"Press Start 2P", cursive' }}
              >
                Potesia
              </h1>
              <p
                className="text-white/50 text-[10px] sm:text-xs tracking-[0.5em] mt-2"
                style={{ fontFamily: '"Press Start 2P", cursive' }}
              >
                {isReady ? 'SYSTEM READY' : 'LOADING...'}
              </p>
            </motion.div>

            {/* Pixel art loading icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative w-16 h-16 sm:w-20 sm:h-20"
            >
              {/* Rotating retro loader */}
              <div className="absolute inset-0 border-4 border-amber-500/30 rounded-sm" />
              <motion.div
                className="absolute inset-0 border-t-4 border-l-4 border-amber-400 rounded-sm"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-amber-400 text-xl sm:text-2xl"
                  style={{ fontFamily: '"Press Start 2P", cursive' }}
                >
                  {isReady ? '✓' : '◎'}
                </span>
              </div>
            </motion.div>

            {/* Progress Bar - RPG HP Bar Style */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-[320px] sm:max-w-[400px] space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-400 font-pixel">LOADING</span>
                <span className="text-white/60">
                  {isReady ? '100%' : `${progress.percentage}%`}
                </span>
              </div>

              {/* Bar container */}
              <div className="h-4 sm:h-5 bg-black/70 border-2 border-white/20 relative overflow-hidden">
                {/* Fill */}
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${isReady ? 100 : progress.percentage}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  {/* Shimmer effect inside bar */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </motion.div>

                {/* Segmented overlay for pixel look */}
                <div className="absolute inset-0 flex">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 border-r border-black/30"
                    />
                  ))}
                </div>
              </div>

              {/* File name display */}
              <motion.p
                key={progress.currentAsset || messageIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white/40 text-[10px] sm:text-xs text-center truncate font-mono"
              >
                {isReady
                  ? 'All assets loaded successfully.'
                  : progress.currentAsset
                  ? `> ${progress.currentAsset}`
                  : LOADING_MESSAGES[messageIndex]}
                {showCursor && !isReady && (
                  <span className="typewriter-cursor ml-1" />
                )}
              </motion.p>
            </motion.div>

            {/* PRESS START Button */}
            <AnimatePresence>
              {isReady && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.08, boxShadow: '0 0 30px rgba(212, 175, 55, 0.6)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStart}
                  className="relative mt-4 rpg-button-glow group"
                >
                  <div className="px-6 sm:px-8 py-3 sm:py-4 bg-black/60 border-2 border-amber-500/50 hover:border-amber-400 backdrop-blur-sm">
                    <span
                      className="text-amber-400 text-sm sm:text-base tracking-[0.2em] uppercase font-bold retro-glow group-hover:text-amber-300 transition-colors"
                      style={{ fontFamily: '"Press Start 2P", cursive' }}
                    >
                      PRESS START
                      {showCursor && <span className="typewriter-cursor ml-1" />}
                    </span>
                  </div>
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-500" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-amber-500" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-amber-500" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-500" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Hint text when loading */}
            {!isReady && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-white/20 text-[10px] text-center mt-2"
              >
                Please wait while we prepare your adventure...
              </motion.p>
            )}
          </div>

          {/* Bottom decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-0 right-0 text-center"
          >
            <p className="text-white/20 text-[10px] tracking-wider">
              © 2026 POTESIA™. All Rights Reserved.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

