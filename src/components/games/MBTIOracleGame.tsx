import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '@/context/GamificationContext';
import { prefetchAsset } from '@/lib/preloader';
import { ORACLE_ITEMS } from '@/data/mbti';
import { scoreOracle, saveOracleResult, type MbtiResult } from '@/lib/personality/mbti';
import { Sparkles, RefreshCw, ArrowLeft } from 'lucide-react';

interface GameState {
  screen: 'language' | 'playing';
  language: 'en' | 'id' | null;
  answers: number[];
}

interface MBTIOracleGameProps {
  onComplete?: (result: MbtiResult) => void;
  onBack?: () => void;
}

// Likert to Weight mapping: 1=-2, 2=-1, 3=0, 4=1, 5=2
const LIKERT_TO_WEIGHT: Record<number, number> = {
  1: -2,
  2: -1,
  3: 0,
  4: 1,
  5: 2,
};

const LIKERT_OPTIONS = [
  { value: 1, label: { en: 'Strongly Disagree', id: 'Sangat Tidak Setuju' } },
  { value: 2, label: { en: 'Disagree', id: 'Tidak Setuju' } },
  { value: 3, label: { en: 'Neutral', id: 'Netral' } },
  { value: 4, label: { en: 'Agree', id: 'Setuju' } },
  { value: 5, label: { en: 'Strongly Agree', id: 'Sangat Setuju' } },
];

export function MBTIOracleGame({ onComplete, onBack }: MBTIOracleGameProps) {
  const { addExp, isMaxLevel } = useGamification();
  const [gameState, setGameState] = useState<GameState>({
    screen: 'language',
    language: null,
    answers: [],
  });

  const lang = gameState.language ?? 'en';
  const currentIndex = gameState.answers.length;
  const currentItem = ORACLE_ITEMS[currentIndex];
  const totalQuestions = ORACLE_ITEMS.length;

  const handleAnswer = (likertValue: number) => {
    if (!currentItem) return;
    const answers = [...gameState.answers, likertValue];

    if (answers.length >= totalQuestions) {
      const result = scoreOracle(answers, lang);
      saveOracleResult(result);
      prefetchAsset(`/images/MBTI Character/${result.type}.png`);
      addExp(50);
      onComplete?.(result);
    }
    setGameState(prev => ({ ...prev, answers }));
  };

  const handlePreviousQuestion = () => {
    setGameState(prev => ({ ...prev, answers: prev.answers.slice(0, -1) }));
  };

  const handleRestart = () => {
    setGameState({ screen: 'language', language: null, answers: [] });
  };

  const handleLanguageSelect = (language: 'en' | 'id') => {
    setGameState({ screen: 'playing', language, answers: [] });
  };

  // Language Selection Screen with enhanced animations
  if (gameState.screen === 'language') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0806] flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-purple-900/10 to-amber-900/20" />
          {/* Floating particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/60 rounded-full"
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
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            />
          ))}
          {/* Torch light effects */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full relative z-10"
        >
          <div className="text-center mb-8">
            <motion.div 
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity },
              }} 
              className="inline-block mb-4"
            >
              <Sparkles className="w-16 h-16 text-amber-500" />
            </motion.div>
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-amber-500 mb-2 drop-shadow-lg" 
              style={{ fontFamily: '"Press Start 2P", cursive', textShadow: '2px 2px 0px #000' }}
            >
              THE ORACLE'S TAVERN
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-amber-200/60 text-sm" 
              style={{ fontFamily: 'Courier New, monospace' }}
            >
              MBTI Destiny Awaits
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#1a1510] border-4 border-amber-600 p-6 relative shadow-2xl"
          >
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-amber-400" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-amber-400" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-amber-400" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-amber-400" />
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-amber-100/80 text-center mb-6 text-sm" 
              style={{ fontFamily: 'Courier New, monospace' }}
            >
              "Welcome, traveler. The ancient spirits await your presence. Choose your tongue to begin the ritual..."
            </motion.p>
            
            <div className="flex flex-col gap-4">
              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' }} 
                whileTap={{ scale: 0.98 }} 
                onClick={() => handleLanguageSelect('en')} 
                className="w-full py-4 bg-amber-700/30 border-2 border-amber-500 text-amber-400 font-bold hover:bg-amber-600/40 transition-all"
                style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '0.7rem' }}
              >
                🏴󠁧󠁢󠁥󠁮󠁧󠁿 ENGLISH
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' }} 
                whileTap={{ scale: 0.98 }} 
                onClick={() => handleLanguageSelect('id')} 
                className="w-full py-4 bg-purple-700/30 border-2 border-purple-500 text-purple-400 font-bold hover:bg-purple-600/40 transition-all"
                style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '0.7rem' }}
              >
                🇮🇩 BAHASA INDONESIA
              </motion.button>
            </div>
          </motion.div>
          
          {isMaxLevel && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-6 text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-purple-700 rounded-lg border border-amber-400/50">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span className="text-amber-100 font-bold text-xs" style={{ fontFamily: '"Press Start 2P", cursive' }}>MAX LEVEL</span>
              </span>
            </motion.div>
          )}

          {/* Back Button */}
          {onBack && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="absolute top-4 left-4 z-50 p-3 bg-black/50 border-2 border-amber-500/50 hover:bg-amber-500/20 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-amber-400" />
            </motion.button>
          )}
        </motion.div>
      </div>
    );
  }

  const progress = (Math.min(currentIndex + 1, totalQuestions) / totalQuestions) * 100;
  
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0806] flex flex-col overflow-hidden"
         style={{ backgroundImage: 'radial-gradient(circle at center, #1a1510 0%, #0a0806 100%)' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/40 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -10,
              opacity: 0,
            }}
            animate={{ 
              y: window.innerHeight + 10,
              opacity: [0, 0.8, 0],
            }}
            transition={{ 
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#1a1510]/90 border-b-4 border-amber-700 shadow-lg relative z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 hover:bg-amber-900/50 rounded border border-amber-700/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-amber-400" />
            </button>
          )}
          <Sparkles className="w-6 h-6 text-amber-500" />
          <span className="text-amber-500 font-bold text-sm md:text-base" 
                style={{ fontFamily: '"Press Start 2P", cursive', textShadow: '1px 1px 0px #000' }}>
            ORACLE'S TAVERN
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-amber-200/60 text-xs md:text-sm" style={{ fontFamily: 'Courier New, monospace' }}>
            {Math.min(currentIndex + 1, totalQuestions)} / {totalQuestions}
          </span>
          <button onClick={handleRestart} className="p-2 hover:bg-amber-900/50 rounded border border-amber-700/50 transition-colors">
            <RefreshCw className="w-5 h-5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-black/50 border-b-2 border-amber-900/50 relative z-10">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${progress}%` }} 
          className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentItem?.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
            className="max-w-3xl w-full"
          >
            {/* Question Card */}
            <div className="bg-[#1a1510] border-4 border-amber-700 p-6 md:p-10 relative mb-8 shadow-2xl">
              {/* Decorative corners */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-amber-500" />
              <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-amber-500" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-amber-500" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-amber-500" />
              
              <div className="text-amber-500/70 text-xs mb-4 tracking-widest" 
                   style={{ fontFamily: '"Press Start 2P", cursive' }}>
                ⚔️ {lang === 'en' ? 'QUESTION' : 'PERTANYAAN'} {Math.min(currentIndex + 1, totalQuestions)} {lang === 'en' ? 'OF' : 'DARI'} {totalQuestions}
              </div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
                className="text-amber-100 text-lg md:text-2xl text-center leading-relaxed font-medium"
                style={{ fontFamily: 'Courier New, monospace', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                "{currentItem?.text[lang]}"
              </motion.p>
            </div>

            {/* Likert Scale */}
            <div className="grid grid-cols-5 gap-2 md:gap-4">
              {LIKERT_OPTIONS.map((option) => (
                <motion.button 
                  key={option.value}
                  whileHover={{ scale: 1.05, y: -2, boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)' }} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => handleAnswer(option.value)} 
                  className="py-4 md:py-6 px-2 bg-[#0a0806] border-2 border-amber-700/50 text-amber-200 text-xs md:text-sm hover:bg-amber-900/40 hover:border-amber-500 transition-all flex flex-col items-center gap-2 group"
                  style={{ fontFamily: '"Press Start 2P", cursive' }}
                >
                  <span className="block text-amber-500 text-lg md:text-xl font-bold group-hover:text-amber-400 transition-colors">
                    {option.value}
                  </span>
                  <span className="hidden md:block text-[0.6rem] leading-tight text-center text-amber-300/70 group-hover:text-amber-200">
                    {option.label[lang]}
                  </span>
                  <span className="md:hidden text-[0.5rem] text-amber-400/50">
                    {LIKERT_TO_WEIGHT[option.value] > 0 ? '+' : ''}{LIKERT_TO_WEIGHT[option.value]}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Scale Labels */}
            <div className="flex justify-between mt-3 text-xs text-amber-400/50 px-2">
              <span style={{ fontFamily: 'Courier New, monospace' }}>
                {gameState.language === 'en' ? '← Strongly Disagree' : '← Sangat Tidak Setuju'}
              </span>
              <span style={{ fontFamily: 'Courier New, monospace' }}>
                {gameState.language === 'en' ? 'Strongly Agree →' : 'Sangat Setuju →'}
              </span>
            </div>

            {/* Back Button */}
            {currentIndex > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePreviousQuestion}
                className="w-full mt-6 py-3 bg-purple-900/30 border-2 border-purple-600/50 text-purple-400 text-xs flex items-center justify-center gap-2 hover:bg-purple-800/40 transition-all rounded"
                style={{ fontFamily: '"Press Start 2P", cursive' }}
              >
                <ArrowLeft className="w-4 h-4" />
                {lang === 'en' ? 'REVERSE PREVIOUS MOVE' : 'KEMBALI KE SOAL SEBELUMNYA'}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
