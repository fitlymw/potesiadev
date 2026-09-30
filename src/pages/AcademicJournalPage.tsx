import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft } from 'lucide-react';
import { ItemSlot } from '@/components/common/ItemSlot';
import { playClick } from '@/lib/audio';

const getAssetUrl = (path: string) => {
  const base = '/potesiadev';
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

export function AcademicJournalPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleBack = () => {
    playClick();
    navigate('/menu');
  };

  return (
    <div className="relative min-h-screen overflow-hidden crt-flicker">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${getAssetUrl('/images/journal.gif')})`,
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* CRT Effects */}
      <div className="scanlines" />
      <div className="vignette" />

      {/* Pixel Art Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleBack}
        className="absolute top-4 left-4 z-50 p-2 sm:p-3 bg-black/60 border-2 border-amber-500/50 hover:border-amber-400 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
      </motion.button>

      {/* Corner Decorations */}
      <div className="corner-decor top-left" />
      <div className="corner-decor top-right" />
      <div className="corner-decor bottom-left" />
      <div className="corner-decor bottom-right" />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
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

      <div className="relative min-h-screen flex items-center justify-center px-3 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-md"
        >
          {/* RPG Panel */}
          <div className="relative bg-hound-panel/90 border-2 border-hound-teal p-1">
            {/* Corner decorations */}
            <div className="absolute -top-2 -left-2 w-4 sm:w-6 h-4 sm:h-6 border-t-2 sm:border-t-4 border-l-2 sm:border-l-4 border-hound-teal" />
            <div className="absolute -top-2 -right-2 w-4 sm:w-6 h-4 sm:h-6 border-t-2 sm:border-t-4 border-r-2 sm:border-r-4 border-hound-teal" />
            <div className="absolute -bottom-2 -left-2 w-4 sm:w-6 h-4 sm:h-6 border-b-2 sm:border-b-4 border-l-2 sm:border-l-4 border-hound-teal" />
            <div className="absolute -bottom-2 -right-2 w-4 sm:w-6 h-4 sm:h-6 border-b-2 sm:border-b-4 border-r-2 sm:border-r-4 border-hound-teal" />

            {/* Header - Responsive */}
            <div className="bg-hound-teal/20 px-3 sm:px-6 py-2 sm:py-3 mb-3 sm:mb-4">
              <h1 className="font-pixel text-hound-gold text-xs sm:text-sm md:text-base tracking-wider">
                📜 Academic Journal
              </h1>
            </div>

            {/* Item Slots Grid */}
            <div className="p-3 sm:p-6">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                {[0, 1, 2, 3].map((index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <ItemSlot empty />
                  </motion.div>
                ))}
              </div>

              {/* Empty state message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center text-white/40 text-xs sm:text-sm mt-4 sm:mt-6 font-pixel"
              >
                No entries found...
              </motion.p>
            </div>
          </div>

          {/* Floating animation for the whole panel */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
