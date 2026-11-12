import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { MBTIOracleGame } from '@/components/games/MBTIOracleGame';
import type { MbtiResult } from '@/lib/personality/mbti';

// ==================== HELPER ====================
/**
 * Fungsi Helper untuk memastikan jalur aset benar di GitHub Pages.
 */
const getAssetUrl = (path: string) => {
  const base = import.meta.env.BASE_URL.slice(0, -1);
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

export function OracleTavernPage() {
  const navigate = useNavigate();
  const [showGame, setShowGame] = useState(false);

  const handleGameComplete = (result: MbtiResult) => {
    navigate('/games/oracle-tavern/result', { state: result });
  };

  const handleBack = () => {
    setShowGame(false);
  };

  if (showGame) {
    return <MBTIOracleGame onComplete={handleGameComplete} onBack={handleBack} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden crt-flicker">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          // PERBAIKAN: Menggunakan getAssetUrl dan nama file mbtigamebg.gif sesuai folder images
          backgroundImage: `url(${getAssetUrl('/images/mbtigamebg.gif')})`,
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* CRT Overlay Effects */}
      <div className="absolute inset-0 scanlines pointer-events-none z-10" />
      <div className="absolute inset-0 vignette pointer-events-none z-20" />

      {/* Content */}
      <div className="relative z-30 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-hound-panel/50 border-b border-amber-500/30">
          <button
            onClick={() => navigate('/games')}
            className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span style={{ fontFamily: '"Press Start 2P", cursive' }} className="text-sm">
              BACK TO GAMES
            </span>
          </button>
          
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 font-bold" style={{ fontFamily: '"Press Start 2P", cursive' }}>
              THE ORACLE'S TAVERN
            </span>
          </div>
          
          <div className="w-24" /> {/* Spacer for balance */}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full"
          >
            {/* Game Title */}
            <div className="text-center mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="inline-block mb-4"
              >
                <Sparkles className="w-16 h-16 text-amber-400" />
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-amber-400 retro-glow mb-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                THE ORACLE'S TAVERN
              </h1>
              <p className="text-white/60 text-sm">MBTI Destiny</p>
            </div>

            {/* Start Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGame(true)}
              className="w-full py-4 bg-amber-500/20 border-2 border-amber-500/50 text-amber-400 font-bold hover:bg-amber-500/30 transition-colors"
              style={{ fontFamily: '"Press Start 2P", cursive' }}
            >
              START GAME
            </motion.button>

            {/* Description */}
            <div className="mt-6 bg-hound-panel/50 border border-amber-500/20 p-4">
              <p className="text-white/60 text-center text-sm" style={{ fontFamily: 'Courier New, monospace' }}>
                Discover your RPG class through ancient wisdom. Answer 64 questions to unveil your destiny.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Corner Decorations */}
        <div className="corner-decor top-left" />
        <div className="corner-decor top-right" />
        <div className="corner-decor bottom-left" />
        <div className="corner-decor bottom-right" />
      </div>
    </div>
  );
}