import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, RefreshCw, Trophy, Crown, Swords, Shield } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { useEffect } from 'react';
import { MBTI_TYPES } from '@/data/mbti';
import { loadOracleResult, type MbtiResult } from '@/lib/personality/mbti';

// ==================== HELPER ====================
/**
 * Fungsi Helper untuk memastikan jalur aset benar di GitHub Pages.
 */
const getAssetUrl = (path: string) => {
  const base = '/potesiadev';
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

const TEXT = {
  en: {
    noResult: 'No result data found',
    backToGames: 'BACK TO GAMES',
    revealed: 'Your Destiny Has Been Revealed',
    avatar: 'SPIRIT AVATAR',
    avatarSub: 'Your mystical representation',
    core: 'CORE PERSONALITY',
    attributes: 'ATTRIBUTES',
    challenges: 'CHALLENGES',
    wisdom: "THE ORACLE'S WISDOM",
    again: 'CONSULT AGAIN',
    balanced: 'BALANCED',
    balancedNote: 'BALANCED means your answers leaned only slightly (or not at all) to one side, so that letter is a weak preference.',
    labels: { I: 'Introvert', E: 'Extrovert', S: 'Sensing', N: 'Intuition', T: 'Thinking', F: 'Feeling', J: 'Judging', P: 'Perceiving' },
  },
  id: {
    noResult: 'Data hasil tidak ditemukan',
    backToGames: 'KEMBALI KE GAMES',
    revealed: 'Takdirmu Telah Terungkap',
    avatar: 'AVATAR ROH',
    avatarSub: 'Representasi mistismu',
    core: 'KEPRIBADIAN INTI',
    attributes: 'KEKUATAN',
    challenges: 'TANTANGAN',
    wisdom: 'KEBIJAKSANAAN SANG ORACLE',
    again: 'KONSULTASI LAGI',
    balanced: 'SEIMBANG',
    balancedNote: 'SEIMBANG berarti jawabanmu hanya sedikit (atau sama sekali tidak) condong ke salah satu sisi, jadi huruf tersebut adalah preferensi yang lemah.',
    labels: { I: 'Introvert', E: 'Ekstrovert', S: 'Sensing', N: 'Intuisi', T: 'Thinking', F: 'Feeling', J: 'Judging', P: 'Perceiving' },
  },
};

export function OracleResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Router state saat datang dari game; sessionStorage saat halaman di-refresh
  const resultData = (location.state as MbtiResult | null) ?? loadOracleResult();
  const lang = resultData?.language ?? 'en';
  const t = TEXT[lang];
  
  // PERBAIKAN: Menggunakan getAssetUrl dan nama file snake_case
  const { play: playWinner } = useAudio(getAssetUrl('/bg song/winner_sound.wav'), { volume: 0.6 });
  
  useEffect(() => {
    playWinner();
  }, [playWinner]);
  
  if (!resultData) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">{t.noResult}</p>
          <button 
            onClick={() => navigate('/games')}
            className="px-6 py-3 bg-amber-500 text-black font-bold"
          >
            {t.backToGames}
          </button>
        </div>
      </div>
    );
  }

  const { type, percentages } = resultData;
  const balanced = resultData.balanced ?? { EI: false, SN: false, TF: false, JP: false };
  const info = MBTI_TYPES[type] ?? MBTI_TYPES.INTJ;
  const data = {
    title: info.title[lang],
    core: info.core[lang],
    strengths: info.strengths[lang],
    weaknesses: info.weaknesses[lang],
    advice: info.advice[lang],
  };

  return (
    <div className="relative min-h-screen overflow-hidden crt-flicker">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          // PERBAIKAN: Menggunakan getAssetUrl dan nama file snake_case
          backgroundImage: `url(${getAssetUrl('/images/mbtigamebg.gif')})`,
        }}
      >
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-black/50 to-black/90" />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-amber-400 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -20,
              opacity: 0,
            }}
            animate={{ 
              y: window.innerHeight + 20,
              opacity: [0, 1, 1, 0],
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 scanlines pointer-events-none z-10" />
      <div className="absolute inset-0 vignette pointer-events-none z-20" />

      <div className="relative z-30 min-h-screen pt-16 pb-8 px-4 overflow-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/games')}
          className="fixed top-4 left-4 z-50 p-3 bg-black/50 border border-amber-500/50 hover:bg-amber-500/20 rounded transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-amber-400" />
        </motion.button>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: 360,
              }}
              transition={{ 
                scale: { duration: 2, repeat: Infinity },
                rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
              }}
              className="inline-block mb-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400 blur-xl opacity-50" />
                <Crown className="w-20 h-20 text-amber-400 relative z-10" />
              </div>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-amber-400 retro-glow mb-2" 
                style={{ fontFamily: '"Press Start 2P", cursive', textShadow: '0 0 30px #d4af37, 0 0 60px #d4af37' }}>
              {type}
            </h1>
            <p className="text-2xl md:text-3xl text-purple-400" style={{ fontFamily: 'Courier New, monospace' }}>
              {data.title}
            </p>
            <p className="text-white/60 mt-2">{t.revealed}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-hound-panel/80 border-4 border-amber-500/50 p-4 relative"
            >
              <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-amber-400" />
              <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-amber-400" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-amber-400" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-amber-400" />
              
              <div className="aspect-square bg-black/60 border-2 border-amber-500/30 flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-radial from-amber-500/20 via-transparent to-transparent" />
                <img
                  // PERBAIKAN: Menggunakan getAssetUrl dan nama file huruf besar sesuai folder MBTI Character
                  src={getAssetUrl(`/images/MBTI Character/${type.toUpperCase()}.png`)}
                  alt={type}
                  className="w-full h-full object-contain pixelated"
                />
              </div>
              
              <div className="text-center mt-3">
                <p className="text-amber-400 text-sm" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                  {t.avatar}
                </p>
                <p className="text-white/50 text-xs mt-1">{t.avatarSub}</p>
              </div>
            </motion.div>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <TraitBarWithIcon 
                  icon={<span className="text-blue-400">🌙</span>}
                  leftLabel={t.labels.I}
                  rightLabel={t.labels.E}
                  balancedLabel={balanced.EI ? t.balanced : undefined}
                  leftValue={percentages.I} 
                />
                <TraitBarWithIcon 
                  icon={<span className="text-green-400">👁️</span>}
                  leftLabel={t.labels.S}
                  rightLabel={t.labels.N}
                  balancedLabel={balanced.SN ? t.balanced : undefined}
                  leftValue={percentages.S} 
                />
                <TraitBarWithIcon 
                  icon={<span className="text-red-400">❤️</span>}
                  leftLabel={t.labels.T}
                  rightLabel={t.labels.F}
                  balancedLabel={balanced.TF ? t.balanced : undefined}
                  leftValue={percentages.T} 
                />
                <TraitBarWithIcon 
                  icon={<span className="text-purple-400">⚖️</span>}
                  leftLabel={t.labels.J}
                  rightLabel={t.labels.P}
                  balancedLabel={balanced.JP ? t.balanced : undefined}
                  leftValue={percentages.J} 
                />
                {Object.values(balanced).some(Boolean) && (
                  <p className="text-amber-300/60 text-xs">{t.balancedNote}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-hound-panel/60 border-2 border-purple-500/30 p-4"
              >
                <h3 className="text-purple-400 text-sm mb-2 flex items-center gap-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                  <Sparkles className="w-4 h-4" />
                  {t.core}
                </h3>
                <p className="text-white/80 text-sm">{data.core}</p>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-2 gap-4 mb-8"
          >
            <div className="bg-green-900/40 border-4 border-green-500/50 p-5 relative">
              <div className="absolute -top-3 left-4 bg-hound-panel px-3">
                <h4 className="text-green-400 text-sm flex items-center gap-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                  <Trophy className="w-4 h-4" />
                  {t.attributes}
                </h4>
              </div>
              <div className="mt-4 space-y-2">
                {data.strengths.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Swords className="w-4 h-4 text-green-400" />
                    <span className="text-white/80 text-sm">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-900/40 border-4 border-red-500/50 p-5 relative">
              <div className="absolute -top-3 left-4 bg-hound-panel px-3">
                <h4 className="text-red-400 text-sm flex items-center gap-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                  <Shield className="w-4 h-4" />
                  {t.challenges}
                </h4>
              </div>
              <div className="mt-4 space-y-2">
                {data.weaknesses.slice(0, 3).map((w, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-400" />
                    <span className="text-white/80 text-sm">{w}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-hound-panel/80 border-4 border-purple-500/50 p-6 relative mb-8"
          >
            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-4 border-l-4 border-purple-400" />
            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-4 border-r-4 border-purple-400" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-4 border-l-4 border-purple-400" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-4 border-r-4 border-purple-400" />
            
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                <span className="text-purple-400 text-sm" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                  {t.wisdom}
                </span>
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              </div>
            </div>
            
            <p className="text-white/90 text-center text-lg italic leading-relaxed" 
               style={{ fontFamily: 'Courier New, monospace' }}>
              "{data.advice}"
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/games/oracle-tavern')}
              className="px-8 py-4 bg-amber-500/20 border-4 border-amber-500/50 text-amber-400 hover:bg-amber-500/30 flex items-center gap-2"
              style={{ fontFamily: '"Press Start 2P", cursive' }}
            >
              <RefreshCw className="w-5 h-5" />
              {t.again}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/games')}
              className="px-8 py-4 bg-purple-500/20 border-4 border-purple-500/50 text-purple-400 hover:bg-purple-500/30 flex items-center gap-2"
              style={{ fontFamily: '"Press Start 2P", cursive' }}
            >
              <ArrowLeft className="w-5 h-5" />
              {t.backToGames}
            </motion.button>
          </motion.div>
        </div>

        <div className="corner-decor top-left" />
        <div className="corner-decor top-right" />
        <div className="corner-decor bottom-left" />
        <div className="corner-decor bottom-right" />
      </div>
    </div>
  );
}

function TraitBarWithIcon({ 
  icon, 
  leftLabel, 
  rightLabel, 
  leftValue,
  balancedLabel,
}: { 
  icon: React.ReactNode; 
  leftLabel: string; 
  rightLabel: string; 
  leftValue: number;
  balancedLabel?: string;
}) {
  const displayLeft = Math.max(0, Math.min(100, Math.round(leftValue)));
  // Kedua sisi selalu berjumlah 100% setelah pembulatan
  const displayRight = 100 - displayLeft;
  
  return (
    <div className="relative">
      <div className="flex justify-between items-center text-xs text-white/60 mb-1">
        <span className="flex items-center gap-1">{icon} {leftLabel}</span>
        {balancedLabel && (
          <span className="px-2 border border-amber-400/50 text-amber-300 text-[10px] tracking-wider">{balancedLabel}</span>
        )}
        <span>{rightLabel} {icon}</span>
      </div>
      <div className="h-8 bg-black/50 border-2 border-white/20 flex overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${displayLeft}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-blue-600 to-blue-500/70 flex items-center justify-end pr-2"
        >
          {displayLeft > 15 && (
            <span className="text-white/80 text-xs font-bold">{displayLeft}%</span>
          )}
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${displayRight}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400/70 flex items-center justify-start pl-2"
        >
          {displayRight > 15 && (
            <span className="text-white/80 text-xs font-bold">{displayRight}%</span>
          )}
        </motion.div>
      </div>
    </div>
  );
}