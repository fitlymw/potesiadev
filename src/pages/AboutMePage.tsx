import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { playClick } from '@/lib/audio';

const getAssetUrl = (path: string) => {
  const base = import.meta.env.BASE_URL.slice(0, -1);
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

export function AboutMePage() {
  const { t } = useTranslation();
  const { level } = useGamification();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleBack = () => {
    playClick();
    navigate('/menu');
  };
  
  return (
    <div className="relative min-h-screen overflow-hidden crt-flicker">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${getAssetUrl('/images/about_me.webp')})`,
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="scanlines" />
      <div className="vignette" />

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

      <div className="corner-decor top-left" />
      <div className="corner-decor top-right" />
      <div className="corner-decor bottom-left" />
      <div className="corner-decor bottom-right" />

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

      <div className="relative min-h-screen pt-20 sm:pt-24 pb-16 sm:pb-20 px-3 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* H1 HEADER PANEL */}
            <div className="relative bg-hound-panel/80 border-2 border-amber-500/30 p-1 mb-6 sm:mb-8">
              <div className="absolute -top-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-l-2 border-amber-500" />
              <div className="absolute -top-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-r-2 border-amber-500" />
              <div className="absolute -bottom-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-l-2 border-amber-500" />
              <div className="absolute -bottom-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-r-2 border-amber-500" />
              
              <div className="bg-hound-teal/20 px-4 sm:px-6 py-2 sm:py-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-white retro-glow">
                  {t('about.title')}
                </h1>
              </div>
            </div>

            {/* CHARACTER STATS PANEL */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-black/50 border border-white/10 p-3 sm:p-4 mb-6 sm:mb-8 flex flex-col md:flex-row gap-4 sm:gap-6 items-center md:items-start"
            >
              <div className="relative w-24 sm:w-32 h-32 sm:h-40 border-2 border-amber-500/50 bg-black overflow-hidden flex-shrink-0">
                <img 
                  src={getAssetUrl('/images/3x4_blue.jpg')} 
                  alt="Fitly Character" 
                  className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />
              </div>

              <div className="flex-1 w-full">
                <h2 className="text-amber-400 text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-3 sm:mb-4 text-center md:text-left">
                  {t('about.character_stats')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                  <div className="text-center">
                    <p className="text-white/50 text-[10px] sm:text-xs">{t('about.class')}</p>
                    <p className="text-purple-400 text-xs sm:text-sm">{t('about.ai_engineer')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/50 text-[10px] sm:text-xs">{t('about.level')}</p>
                    <p className="text-amber-400 text-xs sm:text-sm">{level}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/50 text-[10px] sm:text-xs">{t('about.title_label')}</p>
                    <p className="text-blue-400 text-xs sm:text-sm">{t('about.scholar')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/50 text-[10px] sm:text-xs">{t('about.guild')}</p>
                    <p className="text-green-400 text-xs sm:text-sm">{t('about.potesia')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* BIO & SKILLS PANEL */}
            <div className="space-y-6 sm:space-y-8 text-white/70 leading-relaxed">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="border-l-4 border-amber-500/50 pl-4 sm:pl-6 py-2 bg-black/30"
              >
                <p className="text-amber-400 text-base sm:text-lg italic">
                  "{t('about.greeting')}"
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm sm:text-base"
              >
                {t('about.bio_1')}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-sm sm:text-base"
              >
                {t('about.bio_2')}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-sm sm:text-base"
              >
                {t('about.bio_3')}
              </motion.p>
                    
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-sm sm:text-base"
              >
                {t('about.bio_4')}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="text-sm sm:text-base"
              >
                {t('about.bio_5')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-black/50 border border-white/10 p-3 sm:p-4 mt-6 sm:mt-8"
              >
                <h2 className="text-amber-400 text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-3 sm:mb-4">
                  {t('about.skills_title')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {['Machine Learning', 'Computer Vision', 'Design Grafis', 'UI/UX', 'Data Analysis', 'OpenCV', 'COBIT 5', 'Photoshop', 'Premiere Pro', 'After Effect'].map((skill, index) => (
                    <span 
                      key={index}
                      className="px-2 sm:px-3 py-1 bg-hound-teal/20 border border-hound-teal/30 text-white/80 text-xs sm:text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="border-l-2 border-hound-gold pl-4 sm:pl-6 py-2"
              >
                <p className="italic text-white/50 text-sm sm:text-base">
                  {t('about.quote')}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}