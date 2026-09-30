import { useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GothicLogo } from '@/components/common/GothicLogo';
import { playClick, playTransition } from '@/lib/audio';
import { useGamification } from '@/context/GamificationContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sparkles, Crown, Globe } from 'lucide-react';

/**
 * Fungsi Helper untuk memastikan jalur aset benar di GitHub Pages.
 */
const getAssetUrl = (path: string) => {
  const base = '/potesiadev';
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

// Interface Props untuk LandingPage
interface LandingPageProps {
  setShowLanguageGateway: (show: boolean) => void;
}

export function LandingPage({ setShowLanguageGateway }: LandingPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { level, exp, expProgress, isMaxLevel, expForNextLevel } = useGamification();
  const isMobile = useIsMobile();

  const [displayText, setDisplayText] = useState('');
  const [videoReady, setVideoReady] = useState(false);
  const fullText = isMobile ? t('landing.tap_to_start') : t('landing.press_start');
  const [showCursor, setShowCursor] = useState(true);

  // Efek Typewriter untuk teks Start
  useEffect(() => {
    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [fullText]);

  // Efek kedip kursor
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorTimer);
  }, []);

  const handleStart = useCallback(() => {
    playClick();
    playTransition();
    setTimeout(() => {
      navigate('/menu');
    }, 600);
  }, [navigate]);

  const handleLanguageClick = useCallback(() => {
    playClick();
    setShowLanguageGateway(true);
  }, [setShowLanguageGateway]);

  return (
    <div className="relative min-h-screen overflow-hidden crt-flicker">
      {/* Background: poster tampil instan, video di-stream lalu fade-in saat siap diputar */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${getAssetUrl('/images/landing-poster.jpg')})` }}
      />
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={getAssetUrl('/images/landing-poster.jpg')}
        onCanPlay={() => setVideoReady(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
      >
        <source src={getAssetUrl('/images/landing.mp4')} type="video/mp4" />
      </video>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      <div className="scanlines" />
      <div className="vignette" />

      {/* Decorative Elements */}
      <div className="corner-decor top-left" />
      <div className="corner-decor top-right" />
      <div className="corner-decor bottom-left" />
      <div className="corner-decor bottom-right" />

      {/* Max Level Visual Aura */}
      {isMaxLevel && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-radial from-amber-500/30 via-purple-500/20 to-transparent animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent" />
        </div>
      )}

      {/* Star Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
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

      {/* Language Selection Button — Top Right */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        whileHover={{ scale: 1.08, boxShadow: '0 0 25px rgba(212, 175, 55, 0.5)' }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLanguageClick}
        className="absolute top-6 right-6 z-30 group"
      >
        <div className="relative px-4 py-2 sm:px-5 sm:py-2.5 bg-black/60 border-2 border-amber-500/50 hover:border-amber-400 backdrop-blur-sm transition-all">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 retro-glow" />
            <span className="hidden sm:inline text-amber-400 text-xs sm:text-sm tracking-[0.15em] font-bold retro-glow font-pixel">
              {t('landing.select_language')}
            </span>
            <span className="sm:hidden text-amber-400 text-xs tracking-[0.15em] font-bold retro-glow font-pixel">
              LANG
            </span>
          </div>
        </div>
        {/* Button Corner Accents */}
        <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-amber-500" />
        <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-amber-500" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-amber-500" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-amber-500" />
      </motion.button>

      {/* Main UI Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pixel-frame mx-4">

        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut', type: 'spring', stiffness: 100 }}
          className={`mb-12 float-animation ${isMaxLevel ? 'animate-pulse' : ''}`}
        >
          <GothicLogo size="xl" animate />
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-4 sm:mb-6 md:mb-8 text-center"
        >
          <p className="text-amber-400 text-xs sm:text-sm tracking-[0.3em] uppercase retro-glow font-pixel">
            {t('landing.welcome')}
          </p>
        </motion.div>

        {/* Level & Progress Section */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mb-4 sm:mb-6 w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px]"
        >
          <div className="flex items-center justify-center mb-3">
            {isMaxLevel ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-purple-600 rounded-full border border-amber-400/50 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              >
                <Crown className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-sm sm:text-base font-pixel">{t('landing.max_level')}</span>
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </motion.div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-1 bg-black/60 border border-amber-500/50 rounded shadow-inner">
                <span className="text-amber-400 font-bold text-lg font-pixel">LVL {level}</span>
              </div>
            )}
          </div>

          {!isMaxLevel && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                <span className="text-purple-400 font-pixel">EXP</span>
                <span className="text-white/60 font-mono">{exp} / {expForNextLevel}</span>
              </div>
              <div className="h-4 bg-black/70 border-2 border-white/20 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${expProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </motion.div>
              </div>
            </div>
          )}

          {isMaxLevel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-2"
            >
              <p className="text-amber-400 text-[10px] sm:text-sm retro-glow animate-pulse font-pixel">
                {t('landing.max_level_msg')}
              </p>
              <p className="text-white/50 text-[8px] sm:text-xs mt-1 font-pixel">
                {t('landing.all_quests_completed')}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* PRESS START Button */}
        <motion.button
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(212, 175, 55, 0.6)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="mt-4 sm:mt-6 relative rpg-button-glow group"
        >
          <div className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 bg-black/60 border-2 border-amber-500/50 hover:border-amber-400 backdrop-blur-sm transition-all">
            <span className="text-amber-400 text-sm sm:text-lg md:text-xl tracking-[0.2em] font-bold retro-glow font-pixel">
              {displayText}
              {showCursor && <span className="typewriter-cursor ml-1" />}
            </span>
          </div>
          {/* Button Corner Accents */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-500" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-amber-500" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-amber-500" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-500" />
        </motion.button>

        {/* HUD Stats Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
          className="mt-4 sm:mt-6 md:mt-8 flex items-center gap-4 sm:gap-8"
        >
          {!isMaxLevel ? (
            <>
              <div className="text-center">
                <p className="text-white/50 text-[8px] sm:text-xs tracking-wider font-pixel">{t('landing.play_time')}</p>
                <p className="text-amber-400 text-lg sm:text-2xl font-bold font-mono">00:00</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-white/50 text-[8px] sm:text-xs tracking-wider font-pixel">{t('landing.status')}</p>
                <p className="text-green-400 text-sm sm:text-lg font-bold font-pixel">{t('landing.ready')}</p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-amber-400 text-sm sm:text-lg font-bold retro-glow font-pixel">{t('landing.legendary_hero')}</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Copyright Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-8 left-0 right-0 z-20 flex justify-center"
      >
        <p className="text-white/30 text-[8px] sm:text-xs tracking-wider font-pixel">
          {t('landing.copyright')}
        </p>
      </motion.div>
    </div>
  );
}

