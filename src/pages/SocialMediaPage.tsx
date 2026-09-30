import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { playClick } from '@/lib/audio';

const getAssetUrl = (path: string) => {
  const base = '/potesiadev';
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

export function SocialMediaPage() {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleBack = () => {
    playClick();
    navigate('/menu');
  };

  const socials = [
    {
      id: 'spotify',
      platform: 'Spotify',
      name: 'Fitly Tjong Mamuaya',
      link: 'https://open.spotify.com/user/fitlymw',
      icon: getAssetUrl('/images/logo_spotify.png'),
    },
    {
      id: 'roboflow universe',
      platform: 'Roboflow Universe',
      name: 'Fitly Tjong Mamuaya',
      link: 'https://universe.roboflow.com/fitly-tjong-mamuaya',
      icon: getAssetUrl('/images/LOGO_Roboflow.png'),
    },
    {
      id: 'pinterest',
      platform: 'Pinterest',
      name: 'Fitlymw',
      link: 'https://id.pinterest.com/Fitlymw',
      icon: getAssetUrl('/images/Logo_Pinterest.png'),
    },
    {
      id: 'youtube',
      platform: 'YouTube',
      name: 'myself7y',
      link: 'https://www.youtube.com/@myself7Y',
      icon: getAssetUrl('/images/logo_youtube.png'),
    },
    {
      id: 'tiktok',
      platform: 'TikTok',
      name: 'fiwont7',
      link: 'https://www.tiktok.com/@fiwont7',
      icon: getAssetUrl('/images/logo_TIKTOK.png'),
    },
    {
      id: 'instagram',
      platform: 'Instagram',
      name: 'fitlymw',
      link: 'https://www.instagram.com/fitlymw/',
      icon: getAssetUrl('/images/logo_INSTAGRAM.png'),
    },
    {
      id: 'gmail',
      platform: 'Gmail',
      name: 'mamuayafitly@gmail.com',
      link: 'mailto:mamuayafitly@gmail.com',
      icon: getAssetUrl('/images/LOGO_EMAIL.png'),
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden crt-flicker">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${getAssetUrl('/images/social_media.gif')})`,
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
        {[...Array(10)].map((_, i) => (
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

      <div className="relative min-h-screen pt-20 sm:pt-24 pb-16 sm:pb-20 px-3 sm:px-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* RPG Panel Header */}
            <div className="relative bg-hound-panel/80 border-2 border-amber-500/30 p-1 mb-8 sm:mb-12 mx-2 sm:mx-4">
              <div className="absolute -top-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-l-2 border-amber-500" />
              <div className="absolute -top-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-r-2 border-amber-500" />
              <div className="absolute -bottom-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-l-2 border-amber-500" />
              <div className="absolute -bottom-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-r-2 border-amber-500" />
              
              <div className="text-center bg-hound-teal/20 px-4 sm:px-6 py-4 sm:py-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-white mb-3 sm:mb-4 retro-glow" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                  Let's Connect
                </h1>
                <p className="text-white/60 text-sm sm:text-lg">
                  Temukan karya dan keseharian Fitly Tjong Mamuaya
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 px-2 sm:px-4">
              {socials.map((social, index) => {
                const isHovered = hoveredIndex === index;
                const isOthersHovered = hoveredIndex !== null && hoveredIndex !== index;

                return (
                  <motion.a
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={social.id}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ 
                      opacity: isOthersHovered ? 0.4 : 1,
                      scale: isHovered ? 1.05 : isOthersHovered ? 0.95 : 1,
                      x: 0 
                    }}
                    transition={{ 
                      duration: 0.3,
                      delay: hoveredIndex === null ? 0.2 + index * 0.1 : 0
                    }}
                    className={`group relative block p-3 sm:p-4 md:p-6 rounded-none border-2 bg-black/60 backdrop-blur-sm cursor-pointer
                      transition-all duration-300 ease-out
                      ${isHovered 
                        ? 'border-amber-500 shadow-[0_0_20px_rgba(212,175,55,0.3)]' 
                        : 'border-white/20 hover:border-white/40'
                      }
                    `}
                  >
                    <div className="absolute -top-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 border-t-2 border-l-2 border-amber-500/50" />
                    <div className="absolute -top-1 -right-1 w-2 sm:w-3 h-2 sm:h-3 border-t-2 border-r-2 border-amber-500/50" />
                    <div className="absolute -bottom-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 border-b-2 border-l-2 border-amber-500/50" />
                    <div className="absolute -bottom-1 -right-1 w-2 sm:w-3 h-2 sm:h-3 border-b-2 border-r-2 border-amber-500/50" />

                    <div className="flex items-center gap-3 sm:gap-6">
                      <div className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 flex-shrink-0 flex items-center justify-center bg-hound-panel border-2 border-hound-teal/50 p-1 sm:p-2">
                        <img 
                          src={social.icon} 
                          alt={`${social.platform} Logo`} 
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div>
                        <h3 className="text-white text-base sm:text-xl font-medium mb-1">
                          {social.name}
                        </h3>
                        <p className="text-white/50 text-xs sm:text-sm uppercase tracking-wider">
                          {social.platform}
                        </p>
                      </div>
                      
                      <div className={`ml-auto transform transition-transform duration-300 ${isHovered ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
                        <span className="text-amber-400">▶</span>
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
