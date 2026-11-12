import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Trophy } from 'lucide-react';

const getAssetUrl = (path: string) => {
  const base = import.meta.env.BASE_URL.slice(0, -1);
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

interface Monster {
  id: number;
  x: number;
  y: number;
  spawnTime: number;
  scale: number;
}

interface GameState {
  screen: 'intro' | 'countdown' | 'playing' | 'levelComplete' | 'result';
  hp: number;
  level: number;
  score: number;
  monsters: Monster[];
  slices: { reactionTime: number; timestamp: number }[];
  combo: number;
  maxCombo: number;
  monstersCleared: number;
  monstersToClear: number;
  timeRemaining: number;
}

interface ClickEffect {
  id: number;
  x: number;
  y: number;
  isCrit: boolean;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  isCrit: boolean;
}

const LEVEL_CONFIG = [
  { monstersToClear: 20, timeLimit: 60, spawnRate: 2000 },
  { monstersToClear: 30, timeLimit: 55, spawnRate: 1800 },
  { monstersToClear: 40, timeLimit: 50, spawnRate: 1600 },
  { monstersToClear: 50, timeLimit: 45, spawnRate: 1400 },
  { monstersToClear: 60, timeLimit: 40, spawnRate: 1200 },
  { monstersToClear: 70, timeLimit: 35, spawnRate: 1000 },
  { monstersToClear: 80, timeLimit: 30, spawnRate: 900 },
  { monstersToClear: 90, timeLimit: 28, spawnRate: 800 },
  { monstersToClear: 100, timeLimit: 25, spawnRate: 700 },
  { monstersToClear: 120, timeLimit: 20, spawnRate: 600 },
];

const TOTAL_LEVELS = LEVEL_CONFIG.length;

function getRank(score: number): { name: string; color: string; glow: string; textColor: string } {
  if (score >= 120000) return { name: 'IMMORTAL', color: '#ffffff', textColor: '#ffffff', glow: '0 0 30px #ff0000, 0 0 60px #ff4500, 0 0 90px #ff0000' };
  if (score >= 100000) return { name: 'ASCENDANT', color: '#ffffff', textColor: '#ffffff', glow: '0 0 20px #00ff88, 0 0 40px #0088ff' };
  if (score >= 80000) return { name: 'DIAMOND', color: '#ffffff', textColor: '#ffffff', glow: '0 0 15px #b9f2ff' };
  if (score >= 60000) return { name: 'PLATINUM', color: '#e5e4e2', textColor: '#e5e4e2', glow: '0 0 10px #e5e4e2' };
  if (score >= 50000) return { name: 'GOLD', color: '#ffffff', textColor: '#ffffff', glow: '0 0 10px #ffd700' };
  if (score >= 30000) return { name: 'SILVER', color: '#ffffff', textColor: '#ffffff', glow: '0 0 8px #c0c0c0' };
  return { name: 'BRONZE', color: '#cd7f32', textColor: '#cd7f32', glow: '0 0 5px #cd7f32' };
}

function FloatingTextDisplay({ text, x, y, isCrit }: { text: string; x: number; y: number; isCrit: boolean }) {
  return (
    <motion.span
      initial={{ opacity: 1, y: 0, scale: 0.5 }}
      animate={{ opacity: 0, y: -60, scale: 1.3 }}
      transition={{ duration: 0.8 }}
      className="absolute text-xl font-bold pointer-events-none z-50"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        fontFamily: '"Press Start 2P", cursive',
        textShadow: isCrit ? '2px 2px 0 #000, 0 0 20px #ff0000, 0 0 40px #ffff00' : '2px 2px 0 #000, 0 0 10px #00ff00',
        color: isCrit ? '#ffff00' : '#00ff00'
      }}
    >
      {text}
    </motion.span>
  );
}

function ClickEffectDisplay({ x, y, isCrit }: { x: number; y: number; isCrit: boolean }) {
  return (
    <>
      <motion.div
        initial={{ scale: 0.5, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute pointer-events-none"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          transform: 'translate(-50%, -50%)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: isCrit ? '4px solid #ffff00' : '3px solid #00ffff',
          boxShadow: isCrit ? '0 0 20px #ff0000, 0 0 40px #ffff00' : '0 0 10px #00ffff, 0 0 20px #00ffff',
        }}
      />
    </>
  );
}

export function ProtocolSlicePage() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>({
    screen: 'intro',
    hp: 3,
    level: 1,
    score: 0,
    monsters: [],
    slices: [],
    combo: 0,
    maxCombo: 0,
    monstersCleared: 0,
    monstersToClear: LEVEL_CONFIG[0].monstersToClear,
    timeRemaining: LEVEL_CONFIG[0].timeLimit,
  });

  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);
  const [shake, setShake] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const monsterIdRef = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const sliceSounds = [
    getAssetUrl('/bg song/slice_1.wav'), 
    getAssetUrl('/bg song/slice_2.wav'), 
    getAssetUrl('/bg song/slice_3.wav'), 
    getAssetUrl('/bg song/slice_4.wav')
  ];
  
  const playSliceSound = useCallback(() => {
    const audio = new Audio(sliceSounds[Math.floor(Math.random() * sliceSounds.length)]);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  }, [sliceSounds]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      screen: 'countdown',
      hp: 3,
      level: 1,
      score: 0,
      monsters: [],
      slices: [],
      combo: 0,
      maxCombo: 0,
      monstersCleared: 0,
      monstersToClear: LEVEL_CONFIG[0].monstersToClear,
      timeRemaining: LEVEL_CONFIG[0].timeLimit,
    }));
    setCountdown(3);
  }, []);

  useEffect(() => {
    if (gameState.screen !== 'countdown') return;
    if (countdown <= 0) {
      setGameState(prev => ({ 
        ...prev, 
        screen: 'playing', 
        timeRemaining: LEVEL_CONFIG[prev.level - 1].timeLimit 
      }));
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [gameState.screen, countdown]);

  useEffect(() => {
    if (gameState.screen !== 'playing') return;
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          return { ...prev, screen: 'result', timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState.screen]);

  useEffect(() => {
    if (gameState.screen !== 'playing') return;
    const config = LEVEL_CONFIG[gameState.level - 1];
    
    const getSpawnCount = (level: number): number => {
      if (level >= 7) return 3;
      if (level >= 3) return 2;
      return 1;
    };
    
    const spawnInterval = setInterval(() => {
      setGameState(prev => {
        const maxMonsters = 6 + (prev.level - 1);
        if (prev.monsters.length >= maxMonsters) return prev;
        
        const spawnCount = getSpawnCount(prev.level);
        const newMonsters: Monster[] = [];
        
        for (let i = 0; i < spawnCount; i++) {
          if (prev.monsters.length + newMonsters.length >= maxMonsters) break;
          
          newMonsters.push({
            id: ++monsterIdRef.current,
            x: 10 + Math.random() * 80,
            y: 15 + Math.random() * 55,
            spawnTime: Date.now(),
            scale: 0
          });
        }
        
        return { ...prev, monsters: [...prev.monsters, ...newMonsters].slice(-12) };
      });
    }, config.spawnRate);

    return () => clearInterval(spawnInterval);
  }, [gameState.screen, gameState.level]);

  useEffect(() => {
    if (gameState.screen !== 'playing') return;
    
    const pulseInterval = setInterval(() => {
      setGameState(prev => {
        const updatedMonsters = prev.monsters.map(m => {
          let newScale = m.scale + 0.08;
          if (newScale > 1.3) newScale = 0;
          return { ...m, scale: newScale };
        }).filter(m => m.scale > 0);
        
        return { ...prev, monsters: updatedMonsters };
      });
    }, 100);

    return () => clearInterval(pulseInterval);
  }, [gameState.screen]);

  useEffect(() => {
    if (gameState.screen !== 'playing') return;
    const checkInterval = setInterval(() => {
      setGameState(prev => {
        const missed = prev.monsters.filter(m => m.scale <= 0.05);
        if (missed.length > 0) {
          const newHp = prev.hp - missed.length;
          if (newHp <= 0) return { ...prev, screen: 'result', hp: 0 };
          return { ...prev, hp: newHp, combo: 0, monsters: prev.monsters.filter(m => m.scale > 0.05) };
        }
        return prev;
      });
    }, 200);
    return () => clearInterval(checkInterval);
  }, [gameState.screen]);

  useEffect(() => {
    if (gameState.screen !== 'playing') return;
    if (gameState.monstersCleared >= gameState.monstersToClear) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      
      if (gameState.level >= TOTAL_LEVELS) {
        setGameState(prev => ({ ...prev, screen: 'result' }));
      } else {
        setGameState(prev => ({
          ...prev,
          screen: 'levelComplete',
          level: prev.level + 1,
          monstersCleared: 0,
          monstersToClear: LEVEL_CONFIG[prev.level].monstersToClear,
          timeRemaining: LEVEL_CONFIG[prev.level].timeLimit
        }));
        setTimeout(() => {
          setCountdown(3);
          setGameState(prev => ({ ...prev, screen: 'countdown' }));
        }, 2000);
      }
    }
  }, [gameState.monstersCleared, gameState.screen, gameState.level]);

  const getComboMultiplier = (combo: number): number => {
    if (combo >= 11) return 3;
    if (combo >= 1) return 2;
    return 1;
  };

  const handleClick = useCallback((e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    if (gameState.screen !== 'playing') return;
    
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    let clientX: number, clientY: number;
    
    if ('pointerType' in e) {
      clientX = (e as React.PointerEvent).clientX;
      clientY = (e as React.PointerEvent).clientY;
    } else if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const now = Date.now();
    
    let hitMonster: Monster | null = null;
    // IMPROVED: Increased hit radius from 10 to 15 for better touch accuracy on mobile
    for (const monster of gameState.monsters) {
      const dx = x - monster.x;
      const dy = y - monster.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const hitRadius = 15 * monster.scale;
      
      if (distance <= hitRadius) {
        hitMonster = monster;
        break;
      }
    }
    
    const effectId = Date.now();
    const isCrit = gameState.combo >= 1;
    setClickEffects(prev => [...prev, { id: effectId, x, y, isCrit }]);
    setTimeout(() => {
      setClickEffects(prev => prev.filter(e => e.id !== effectId));
    }, 300);
    
    if (!hitMonster) {
      setGameState(prev => ({ ...prev, combo: 0 }));
      return;
    }
    
    playSliceSound();
    
    const reactionTime = now - hitMonster.spawnTime;
    const comboMultiplier = getComboMultiplier(gameState.combo);
    const reactionBonus = Math.max(0, 200 - Math.floor(reactionTime / 10));
    const basePoints = 100;
    const totalPoints = (basePoints + reactionBonus) * comboMultiplier;
    const newCombo = gameState.combo + 1;
    const cleared = gameState.monstersCleared + 1;
    
    let scoreText = `${totalPoints}`;
    if (comboMultiplier >= 2) scoreText += ` (${comboMultiplier}x)`;
    if (reactionBonus > 100) scoreText += `+${reactionBonus}`;
    
    setFloatingTexts(prev => [...prev, { 
      id: hitMonster!.id, 
      text: scoreText, 
      x: hitMonster!.x, 
      y: hitMonster!.y - 5,
      isCrit: comboMultiplier >= 3 
    }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== hitMonster!.id));
    }, 800);
    
    setGameState(prev => ({
      ...prev,
      score: prev.score + totalPoints,
      combo: newCombo,
      maxCombo: Math.max(prev.maxCombo, newCombo),
      monstersCleared: cleared,
      monsters: prev.monsters.filter(m => m.id !== hitMonster!.id),
      slices: [...prev.slices, { reactionTime, timestamp: now }]
    }));
  }, [gameState.screen, gameState.monsters, gameState.combo, playSliceSound]);

  if (gameState.screen === 'intro') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950 via-black to-purple-950" />
        <div className="scanlines" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6 w-32 sm:w-40">
            <img src={getAssetUrl('/images/protocol_slice.gif')} alt="Protocol Slice" className="w-full h-full object-contain" />
          </motion.div>
          <motion.h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-cyan-400 mb-2" style={{ fontFamily: '"Press Start 2P", cursive', textShadow: '3px 3px 0 #000' }}>CYBER-SYNAPSE</motion.h1>
          <motion.p className="text-cyan-300 text-xs sm:text-sm mb-8" style={{ fontFamily: '"Press Start 2P", cursive' }}>PROTOCOL SLICE</motion.p>
          <div className="text-center mb-8">
            <p className="text-white/70 text-xs mb-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>TAP TO DESTROY MONSTERS</p>
            <p className="text-yellow-400/70 text-xs" style={{ fontFamily: '"Press Start 2P", cursive' }}>COMBO FOR 2X-3X POINTS!</p>
          </div>
          <motion.button onClick={startGame} className="px-6 sm:px-8 py-3 sm:py-4 bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 text-xs sm:text-sm hover:bg-cyan-500/40" style={{ fontFamily: '"Press Start 2P", cursive' }}>START GAME</motion.button>
          <button onClick={() => navigate('/games')} className="absolute top-4 left-4 p-2 sm:p-3 border border-cyan-500/30 text-cyan-400/60 hover:text-cyan-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (gameState.screen === 'countdown') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950 via-black to-purple-950" />
        <div className="scanlines" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
          <motion.div key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <p className="text-7xl sm:text-8xl md:text-9xl font-bold text-cyan-400" style={{ fontFamily: '"Press Start 2P", cursive', textShadow: '0 0 40px #00f3ff, 0 0 80px #00f3ff' }}>{countdown > 0 ? countdown : 'GO!'}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (gameState.screen === 'levelComplete') {
    return (
      <motion.div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden" animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}>
        <div className="scanlines" />
        <div className="absolute inset-0 bg-gradient-to-b from-green-950 via-black to-cyan-950 opacity-50" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-green-400 mb-4" style={{ fontFamily: '"Press Start 2P", cursive', textShadow: '0 0 40px #00ff00' }}>SYSTEM OVERCLOCK!</h1>
          <p className="text-cyan-300 text-lg" style={{ fontFamily: '"Press Start 2P", cursive' }}>LEVEL {gameState.level - 1} COMPLETE</p>
        </div>
      </motion.div>
    );
  }

  if (gameState.screen === 'result') {
    const rank = getRank(gameState.score);
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950 via-black to-purple-950" />
        <div className="scanlines" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <Trophy className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4" style={{ color: rank.color, filter: `drop-shadow(${rank.glow})` }} />
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: '"Press Start 2P", cursive', color: rank.textColor, textShadow: rank.glow }}>{rank.name}</h1>
            <div className="bg-cyan-950/30 border-2 border-cyan-500/50 p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-cyan-400/60 text-xs mb-1" style={{ fontFamily: '"Press Start 2P", cursive' }}>SCORE</p>
                  <p className="text-xl sm:text-2xl text-white" style={{ fontFamily: '"Press Start 2P", cursive' }}>{gameState.score.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-cyan-400/60 text-xs mb-1" style={{ fontFamily: '"Press Start 2P", cursive' }}>MAX COMBO</p>
                  <p className="text-xl sm:text-2xl text-white" style={{ fontFamily: '"Press Start 2P", cursive' }}>{gameState.maxCombo}x</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={startGame} className="px-4 sm:px-6 py-2 sm:py-3 bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 text-xs" style={{ fontFamily: '"Press Start 2P", cursive' }}>RETRY</button>
              <button onClick={() => navigate('/games')} className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-500/20 border-2 border-purple-500 text-purple-400 text-xs" style={{ fontFamily: '"Press Start 2P", cursive' }}>EXIT</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // IMPROVED: Sync combo text color with pulse - cyan for normal, red for high combo
  const comboColor = gameState.combo >= 11 ? '#ff4444' : '#00ffff';
  const comboBg = gameState.combo >= 11 ? 'rgba(255, 68, 68, 0.3)' : 'rgba(255, 255, 0, 0.3)';
  const comboBorder = gameState.combo >= 11 ? '#ff4444' : '#ffff00';

  return (
    <motion.div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden" animate={shake ? { x: [-5, 5, -5, 5, 0] } : {}}>
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/30 via-black to-purple-900/30" />
      <div className="scanlines" />
      <div className="relative z-10 flex items-center justify-between p-2 sm:p-3 bg-black/40 border-b border-cyan-500/30">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* IMPROVED: Replaced heart icons with diamond symbols */}
          {[...Array(3)].map((_, i) => (
            <span 
              key={i} 
              className="text-xs sm:text-sm" 
              style={{ 
                fontFamily: '"Press Start 2P", cursive',
                color: i < gameState.hp ? '#00ffff' : '#333333'
              }}
            >
              {i < gameState.hp ? '◆' : '◇'}
            </span>
          ))}
        </div>
        <div className="text-center">
          <p className="text-cyan-400 text-[10px] sm:text-xs" style={{ fontFamily: '"Press Start 2P", cursive' }}>LEVEL {gameState.level}</p>
          <p className="text-white/60 text-[8px] sm:text-[10px]" style={{ fontFamily: '"Press Start 2P", cursive' }}>{gameState.monstersCleared}/{gameState.monstersToClear}</p>
        </div>
        <div className="text-right">
          <p className="text-white text-xs sm:text-sm" style={{ fontFamily: '"Press Start 2P", cursive' }}>{gameState.score.toLocaleString()}</p>
          <p className={`text-[10px] sm:text-xs ${gameState.timeRemaining <= 10 ? 'text-red-500' : 'text-yellow-400'}`} style={{ fontFamily: '"Press Start 2P", cursive' }}>{gameState.timeRemaining}s</p>
        </div>
      </div>
      <div ref={gameAreaRef} className="relative flex-1 cursor-pointer touch-none select-none" onPointerDown={handleClick}>
        {clickEffects.map(effect => (<ClickEffectDisplay key={effect.id} x={effect.x} y={effect.y} isCrit={effect.isCrit} />))}
        <AnimatePresence>
          {gameState.monsters.map(monster => (
            <motion.div key={monster.id} initial={{ scale: 0 }} animate={{ scale: monster.scale }} exit={{ scale: 0, opacity: 0 }} className="absolute cursor-pointer" style={{ left: `${monster.x}%`, top: `${monster.y}%`, transform: 'translate(-50%, -50%)' }}>
              <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center" style={{ boxShadow: `0 0 ${20 * monster.scale}px rgba(0, 243, 255, ${0.8 * monster.scale})` }}>
                <Zap className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {floatingTexts.map(ft => (<FloatingTextDisplay key={ft.id} text={ft.text} x={ft.x} y={ft.y} isCrit={ft.isCrit} />))}
      </div>
      {/* IMPROVED: Combo display with synced pulse color */}
      {gameState.combo > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="px-4 sm:px-6 py-2"
            style={{ 
              backgroundColor: comboBg, 
              border: `2px solid ${comboBorder}`,
              boxShadow: `0 0 20px ${comboColor}`
            }}
          >
            <p 
              className="text-sm sm:text-lg" 
              style={{ 
                fontFamily: '"Press Start 2P", cursive',
                color: comboColor,
                textShadow: `0 0 10px ${comboColor}`
              }}
            >
              {gameState.combo}x COMBO! {gameState.combo >= 11 ? '(3X)' : '(2X)'}
            </p>
          </motion.div>
        </div>
      )}
      <button onClick={(e) => { e.stopPropagation(); navigate('/games'); }} className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20 p-1 sm:p-2 border border-cyan-500/30 text-cyan-400/60 hover:text-cyan-400">
        <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
      </button>
    </motion.div>
  );
}
