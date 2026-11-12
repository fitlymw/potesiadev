import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft } from 'lucide-react';
import { GothicLogo } from '@/components/common/GothicLogo';
import { playClick, playTransition } from '@/lib/audio';

const getAssetUrl = (path: string) => {
  const base = import.meta.env.BASE_URL.slice(0, -1);
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

const navItems = [
  { labelKey: 'menu.games', path: '/games', icon: '🎮' },
  { labelKey: 'menu.about_me', path: '/about-me', icon: '⚔️' },
  { labelKey: 'menu.my_project', path: '/my-project', icon: '🗡️' },
  { labelKey: 'menu.social_media', path: '/social-media', icon: '🛡️' },
  { labelKey: 'menu.academic_journal', path: '/academic-journal', icon: '📜' },
  { labelKey: 'menu.freelance', path: '/freelance', icon: '💎' },
];

export function MenuPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  
  const handleClick = () => {
    playClick();
    playTransition();
  };

  const handleBack = () => {
    playClick();
    navigate('/');
  };

  return (
    <div className="relative min-h-screen overflow-hidden crt-flicker">
      <img
        src={getAssetUrl('/images/castle_retro.gif')}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
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

      <div className="corner-decor top-left" />
      <div className="corner-decor top-right" />
      <div className="corner-decor bottom-left" />
      <div className="corner-decor bottom-right" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
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

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pixel-frame mx-2 sm:mx-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="mb-6 sm:mb-8"
        >
          <GothicLogo size="xl" animate />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-amber-400 text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.5em] uppercase retro-glow mb-6 sm:mb-8"
        >
          {t('menu.title')}
        </motion.p>

        <div className="flex flex-col items-center gap-3 sm:gap-4">
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.15, duration: 0.5 }}
            >
              <Link
                to={item.path}
                onClick={handleClick}
                className="group relative flex items-center gap-4"
              >
                <div className="relative px-6 sm:px-8 py-3 sm:py-4 bg-black/60 border-2 border-white/20 hover:border-amber-500/60 backdrop-blur-sm transition-all duration-300">
                  <span className="text-lg sm:text-xl mr-2">{item.icon}</span>
                  
                  <span 
                    className="text-white/90 group-hover:text-white text-base sm:text-xl tracking-[0.2em] uppercase transition-all duration-300"
                    style={{
                      textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.6)',
                    }}
                  >
                    {t(item.labelKey)}
                  </span>

                  <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/10 transition-colors duration-300" />
                </div>

                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 0, x: 0 }}
                  whileHover={{ opacity: 1, x: 5 }}
                  className="absolute right-[-30px] text-amber-400"
                >
                  ▶
                </motion.span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* RPG HUD - Scale down 50% on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className={`mt-8 sm:mt-12 flex items-center gap-4 sm:gap-6 ${isMobile ? 'transform scale-50 origin-center' : ''}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-xs font-pixel">{t('menu.hp')}</span>
            <div className="w-24 sm:w-32 h-2 sm:h-3 bg-black/50 border border-white/20">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="h-full hp-bar" 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-xs font-pixel">{t('menu.mp')}</span>
            <div className="w-24 sm:w-32 h-2 sm:h-3 bg-black/50 border border-white/20">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                transition={{ delay: 1.7, duration: 0.8 }}
                className="h-full mp-bar" 
              />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-4 sm:bottom-8 left-0 right-0 z-20 flex flex-col items-center"
      >
        <p className="text-white/30 text-xs tracking-wider">
          {t('menu.copyright')}
        </p>
      </motion.div>
    </div>
  );
}