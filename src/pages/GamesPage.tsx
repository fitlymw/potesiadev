import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';

// ==================== HELPER ====================
/**
 * Fungsi Helper untuk memastikan jalur aset benar di GitHub Pages.
 */
const getAssetUrl = (path: string) => {
  const base = '/potesiadev';
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

// ==================== TYPES ====================
interface GameCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  path: string;
}

// ==================== GAMES LIST ====================
const GAMES: GameCard[] = [
  {
    id: 'mbti-oracle',
    title: "The Oracle's Tavern",
    description: 'MBTI-64 Discover your RPG class!',
    // PERBAIKAN: Menggunakan nama file tanpa spasi
    icon: getAssetUrl('/images/mbti-icon.webp'),
    color: 'purple',
    path: '/games/oracle-tavern',
  },
  {
    id: 'persona-core',
    title: 'PersonaCore',
    description: 'BFI-44 Professional Personality Assessment',
    icon: getAssetUrl('/images/big5.gif'),
    color: 'violet',
    path: '/games/persona-core',
  },
  {
    id: 'protocol-slice',
    title: 'CYBER-SYNAPSE',
    description: 'Protocol Slice - Test your reaction speed!',
    // PERBAIKAN: Spasi diganti garis bawah
    icon: getAssetUrl('/images/protocol_slice.gif'),
    color: 'cyan',
    path: '/games/protocol-slice',
  },
  {
    id: 'retro-ai-camera',
    title: 'Retro AI Camera',
    description: 'Capture moments with retro 8-bit AI style!',
    // PERBAIKAN: Spasi diganti garis bawah
    icon: getAssetUrl('/images/camera_logo.png'),
    color: 'amber',
    path: '/games/retro-ai-camera',
  },
];

// ==================== MAIN GAMES PAGE ====================
export function GamesPage() {
  const navigate = useNavigate();
  const { addLevels } = useGamification();

  const handleBack = () => {
    navigate('/menu');
  };

  const handleGameClick = (path: string) => {
    // Add 10 levels when clicking to play a game
    addLevels(10);
    navigate(path);
  };

  return (
    <div className="relative min-h-screen overflow-hidden crt-flicker">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          // PERBAIKAN: Menggunakan jalur absolut /potesiadev/ dan nama file snake_case
          backgroundImage: `url(${getAssetUrl('/images/castle_retro.gif')})`,
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* CRT Effects */}
      <div className="scanlines" />
      <div className="vignette" />

      {/* Corner Decorations */}
      <div className="corner-decor top-left" />
      <div className="corner-decor top-right" />
      <div className="corner-decor bottom-left" />
      <div className="corner-decor bottom-right" />

      {/* Main Content */}
      <div className="relative min-h-screen pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleBack}
          className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20 p-2 sm:p-3 bg-black/50 border border-amber-500/50 hover:bg-amber-500/20 rounded transition-colors"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
        </motion.button>

        <div className="max-w-4xl mx-auto">
          {/* RPG Panel Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative bg-hound-panel/80 border-2 border-amber-500/30 p-1 mb-8 sm:mb-12"
          >
            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500" />
            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500" />
            
            <div className="bg-hound-teal/20 px-4 sm:px-6 py-3 sm:py-4 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-white retro-glow mb-1 sm:mb-2">
                🎮 Games
              </h1>
              <p className="text-white/60 text-sm sm:text-base">Select a game to play!</p>
            </div>
          </motion.div>

          {/* Game Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 px-0 sm:px-4">
            {GAMES.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => handleGameClick(game.path)}
                className="relative group cursor-pointer"
              >
                {/* RPG Card Frame */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-amber-500" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-amber-500" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-amber-500" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-amber-500" />
                
                <div className="bg-hound-panel/80 border-2 border-amber-500/30 p-4 sm:p-6 group-hover:border-amber-400 transition-colors">
                  {/* Game Icon */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 bg-black/50 border-2 border-hound-teal/50 p-2 flex items-center justify-center">
                    <img
                      src={game.icon}
                      alt={game.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Game Info */}
                  <h3 className="text-lg sm:text-xl text-white text-center mb-2 font-bold retro-glow">
                    {game.title}
                  </h3>
                  <p className="text-white/60 text-center text-sm">
                    {game.description}
                  </p>
                  
                  {/* Play Button */}
                  <div className="mt-3 sm:mt-4 flex justify-center">
                    <span className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/50 text-amber-400 text-sm group-hover:bg-amber-500/30 transition-colors">
                      <Sparkles className="w-4 h-4" />
                      PLAY
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}