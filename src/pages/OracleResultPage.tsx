import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, RefreshCw, Trophy, Crown, Swords, Shield } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { useEffect } from 'react';

// ==================== HELPER ====================
/**
 * Fungsi Helper untuk memastikan jalur aset benar di GitHub Pages.
 */
const getAssetUrl = (path: string) => {
  const base = '/potesiadev';
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

interface MBTIResultData {
  type: string;
  percentages: {
    E: number;
    I: number;
    S: number;
    N: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };
  data: {
    title: string;
    core: string;
    strengths: string[];
    weaknesses: string[];
    advice: string;
  };
}

const MBTI_DATA: Record<string, { title: string; core: string; strengths: string[]; weaknesses: string[]; advice: string }> = {
  'INTJ': { title: 'The Architect', core: 'Imaginative and strategic thinkers, with a plan for everything.', strengths: ['Strategic Thinking', 'Independent Mind', 'High Standards', 'Analytical', 'Driven'], weaknesses: ['Overly Critical', 'Impatient', 'Emotionally Reserved', 'Perfectionist'], advice: 'Trust your strategic vision, but remember to value the perspectives of others. Your analytical mind is your greatest gift, but compassion is your missing piece.' },
  'INTP': { title: 'The Logician', core: 'Innovative inventors with an unquenchable thirst for knowledge.', strengths: ['Analytical Thinking', 'Creativity', 'Open-Minded', 'Objective', 'Theoretical'], weaknesses: ['Socially Awkward', 'Absent-Minded', 'Difficulty Expressing', 'Procrastination'], advice: 'Share your brilliant ideas with the world. Your theoretical insights can change reality, but only if you bring them to life.' },
  'ENTJ': { title: 'The Commander', core: 'Bold, imaginative, and strong-willed leaders, always finding a way forward.', strengths: ['Natural Leader', 'Efficient', 'Strategic', 'Confident', 'Decisive'], weaknesses: ['Intolerant', 'Impatient', 'Aggressive', 'Arrogant'], advice: 'Lead with empathy as well as efficiency. Your commanding presence inspires, but compassion creates true loyalty.' },
  'ENTP': { title: 'The Debater', core: 'Smart and curious thinkers who cannot resist an intellectual challenge.', strengths: ['Quick Thinker', 'Inventive', 'Enthusiastic', 'Verbal Skill', 'Creative'], weaknesses: ['Argumentative', 'Disorganized', 'Insensitive', 'Easily Bored'], advice: 'Channel your brilliant debates into constructive dialogue. Your ideas are valuable, but timing matters as much as content.' },
  'INFJ': { title: 'The Advocate', core: 'Quiet and mystical, yet very inspiring and tireless idealists.', strengths: ['Insightful', 'Principled', 'Passionate', 'Altruistic', 'Creative'], weaknesses: ['Sensitive', 'Perfectionist', 'Reserved', 'Hard to Please'], advice: 'Your vision of a better world is needed. Protect your energy while changing the world, and remember to nurture yourself.' },
  'INFP': { title: 'The Mediator', core: 'Poetic, kind and altruistic people, always eager to help a good cause.', strengths: ['Empathetic', 'Creative', 'Idealistic', 'Passionate', 'Curious'], weaknesses: ['Self-Critical', 'Overly Idealistic', 'Unpractical', 'Emotionally Vulnerable'], advice: 'Your ideals are beautiful, but the world needs your grounded action too. Balance dreams with practical steps.' },
  'ENFJ': { title: 'The Protagonist', core: 'Charismatic and inspiring leaders, able to mesmerize their listeners.', strengths: ['Charismatic', 'Reliable', 'Natural Leader', 'Generous', 'Cooperative'], weaknesses: ['Overly Idealistic', 'Overbearing', 'Self-Sacrificing', 'Manipulative'], advice: 'Your ability to inspire is legendary. Lead others to their own truth rather than your vision of it.' },
  'ENFP': { title: 'The Campaigner', core: 'Enthusiastic and creative free spirits, who can always find a reason to smile.', strengths: ['Fun', 'Enthusiastic', 'Spontaneous', 'Inventive', 'Affectionate'], weaknesses: ['Unfocused', 'Overly Optimistic', 'Poor Routine', 'Difficulty Concentrating'], advice: 'Your energy lights up every room. Channel your boundless enthusiasm into projects that truly matter.' },
  'ISTJ': { title: 'The Logistician', core: 'Practical and fact-minded individuals, whose reliability cannot be doubted.', strengths: ['Reliable', 'Practical', 'Honest', 'Detail-Oriented', 'Responsible'], weaknesses: ['Inflexible', 'Reserved', 'Judgmental', 'By the Book'], advice: 'Your reliability is your strength. Be open to new approaches while maintaining your valuable attention to detail.' },
  'ISFJ': { title: 'The Defender', core: 'Very dedicated and warm protectors, always ready to defend their loved ones.', strengths: ['Devoted', 'Warm', 'Reliable', 'Observant', 'Caring'], weaknesses: ['Self-Sacrificing', 'Repressed', 'Overburdened', 'Passive'], advice: 'You are the backbone of everyone around you. Let others support you as much as you support them.' },
  'ESTJ': { title: 'The Executive', core: 'Excellent administrators, unsurpassed at managing things — or people.', strengths: ['Organized', 'Direct', 'Confident', 'Responsible', 'Traditional'], weaknesses: ['Inflexible', 'Uncompromising', 'Impatient', 'Insensitive'], advice: 'Your leadership keeps the world running. Remember that not everyone shares your need for structure and efficiency.' },
  'ESFJ': { title: 'The Consul', core: 'Extraordinarily caring, social and popular people, always eager to help.', strengths: ['Social', 'Cooperative', 'Practical', 'Empathetic', 'Reliable'], weaknesses: ['Overly Caring', 'Insecure', 'Self-Sacrificing', 'Approval-Seeking'], advice: 'Your care for others is beautiful. Trust that you are enough exactly as you are, without seeking external validation.' },
  'ISTP': { title: 'The Virtuoso', core: 'Bold and practical experimenters, masters of all kinds of tools.', strengths: ['Practical', 'Spontaneous', 'Logical', 'Handy', 'Versatile'], weaknesses: ['Reserved', 'Stubborn', 'Insensitive', 'Risk-Taking'], advice: 'Your hands-on approach solves problems others cannot see. Balance your love of action with reflection.' },
  'ISFP': { title: 'The Adventurer', core: 'Flexible and charming artists, always ready to explore and experience something new.', strengths: ['Artistic', 'Adaptable', 'Charming', 'Observant', 'Enthusiastic'], weaknesses: ['Unpredictable', 'Indecisive', 'Easily Stressed', 'Self-Isolating'], advice: 'Your artistic spirit brings beauty to the world. Share your unique perspective, even when it feels vulnerable.' },
  'ESTP': { title: 'The Entrepreneur', core: 'Smart, energetic and very perceptive people, who truly enjoy living on the edge.', strengths: ['Energetic', 'Pragmatic', 'Risk-Taker', 'Social', 'Direct'], weaknesses: ['Impatient', 'Unstructured', 'Insensitive', 'Dislike Commitment'], advice: 'Your energy and courage inspire others. Channel your boldness into meaningful pursuits that create lasting impact.' },
  'ESFP': { title: 'The Entertainer', core: 'Spontaneous, energetic and enthusiastic people — life is never boring around them.', strengths: ['Fun', 'Enthusiastic', 'Spontaneous', 'Observant', 'Performing'], weaknesses: ['Unfocused', 'Sensitive', 'Unstructured', 'Attention-Seeking'], advice: 'You bring joy wherever you go. Let your performances inspire others while honoring your own emotional journey.' },
};

export function OracleResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const resultData = location.state as MBTIResultData | undefined;
  
  // PERBAIKAN: Menggunakan getAssetUrl dan nama file snake_case
  const { play: playWinner } = useAudio(getAssetUrl('/bg song/winner_sound.wav'), { volume: 0.6 });
  
  useEffect(() => {
    playWinner();
  }, [playWinner]);
  
  if (!resultData) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">No result data found</p>
          <button 
            onClick={() => navigate('/games')}
            className="px-6 py-3 bg-amber-500 text-black font-bold"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  const { type, percentages, data = MBTI_DATA[type] || MBTI_DATA['INTJ'] } = resultData;

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
            <p className="text-white/60 mt-2">Your Destiny Has Been Revealed</p>
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
                  SPIRIT AVATAR
                </p>
                <p className="text-white/50 text-xs mt-1">Your mystical representation</p>
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
                  leftLabel="Introvert" 
                  rightLabel="Extrovert" 
                  leftValue={percentages.I} 
                  rightValue={percentages.E}
                />
                <TraitBarWithIcon 
                  icon={<span className="text-green-400">👁️</span>}
                  leftLabel="Sensing" 
                  rightLabel="Intuition" 
                  leftValue={percentages.S} 
                  rightValue={percentages.N}
                />
                <TraitBarWithIcon 
                  icon={<span className="text-red-400">❤️</span>}
                  leftLabel="Thinking" 
                  rightLabel="Feeling" 
                  leftValue={percentages.T} 
                  rightValue={percentages.F}
                />
                <TraitBarWithIcon 
                  icon={<span className="text-purple-400">⚖️</span>}
                  leftLabel="Judging" 
                  rightLabel="Perceiving" 
                  leftValue={percentages.J} 
                  rightValue={percentages.P}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-hound-panel/60 border-2 border-purple-500/30 p-4"
              >
                <h3 className="text-purple-400 text-sm mb-2 flex items-center gap-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                  <Sparkles className="w-4 h-4" />
                  CORE PERSONALITY
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
                  ATTRIBUTES
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
                  CHALLENGES
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
                  THE ORACLE'S WISDOM
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
              CONSULT AGAIN
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/games')}
              className="px-8 py-4 bg-purple-500/20 border-4 border-purple-500/50 text-purple-400 hover:bg-purple-500/30 flex items-center gap-2"
              style={{ fontFamily: '"Press Start 2P", cursive' }}
            >
              <ArrowLeft className="w-5 h-5" />
              BACK TO GAMES
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
  rightValue 
}: { 
  icon: React.ReactNode; 
  leftLabel: string; 
  rightLabel: string; 
  leftValue: number; 
  rightValue: number;
}) {
  const displayLeft = Math.max(0, Math.min(100, Math.round(leftValue)));
  const displayRight = Math.max(0, Math.min(100, Math.round(rightValue)));
  
  return (
    <div className="relative">
      <div className="flex justify-between items-center text-xs text-white/60 mb-1">
        <span className="flex items-center gap-1">{icon} {leftLabel}</span>
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