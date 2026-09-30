import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

// ==================== TYPES ====================
interface GamificationState {
  exp: number;
  level: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  isMaxLevel: boolean;
  isPlaying: boolean;
  playTime: number;
  sessionStartTime: number;
  isHudVisible: boolean;
}

interface GamificationContextType extends GamificationState {
  addExp: (amount: number) => void;
  addLevels: (amount: number) => void;
  consumeMana: (amount: number) => void;
  replenishMana: () => void;
  startPlaying: () => void;
  stopPlaying: () => void;
  resetProgress: () => void;
  expForNextLevel: number;
  expProgress: number;
  hpProgress: number;
  manaProgress: number;
  isGameOver: boolean;
  addButtonPress: () => void;
  toggleHud: () => void;
  showGameOverText: boolean;
}

// ==================== CONSTANTS ====================
const MAX_LEVEL = 100;
const MAX_HP = 100;
const MAX_MANA = 100;
const HP_DURATION = 60 * 60 * 1000;
const MANA_REGEN_INTERVAL = 20 * 1000;
const MANA_PER_BUTTON = 5;
const MIN_EXP_PER_BUTTON = 30;
const MAX_EXP_PER_BUTTON = 60;
const GAME_OVER_DISPLAY_DURATION = 5000;

const calculateExpForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.15, level - 1));
};

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [exp, setExp] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [hp, setHp] = useState<number>(MAX_HP);
  const [mana, setMana] = useState<number>(MAX_MANA);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playTime, setPlayTime] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [showLevelUpEffect, setShowLevelUpEffect] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [showGameOverText, setShowGameOverText] = useState<boolean>(false);
  const [isHudVisible, setIsHudVisible] = useState<boolean>(false);
  
  const playTimeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const manaRegenRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameOverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonPressCountRef = useRef<number>(0);

  const isMaxLevel = level >= MAX_LEVEL;
  const expForNextLevel = isMaxLevel ? 1 : calculateExpForLevel(level);
  const expProgress = isMaxLevel ? 100 : Math.min((exp / expForNextLevel) * 100, 100);
  const hpProgress = Math.max(0, (hp / MAX_HP) * 100);
  const manaProgress = Math.max(0, (mana / MAX_MANA) * 100);

  const toggleHud = useCallback(() => {
    setIsHudVisible(prev => !prev);
  }, []);

  useEffect(() => {
    const storedStartTime = localStorage.getItem('rpg_session_start');
    if (storedStartTime) {
      setSessionStartTime(parseInt(storedStartTime, 10));
    } else {
      setSessionStartTime(Date.now());
      localStorage.setItem('rpg_session_start', Date.now().toString());
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - sessionStartTime;
      setPlayTime(Math.floor(elapsed / 1000));
      
      if (elapsed >= HP_DURATION && hp > 0) {
        setHp(0);
        setIsGameOver(true);
        setShowGameOverText(true);
        
        gameOverTimeoutRef.current = setTimeout(() => {
          setShowGameOverText(false);
        }, GAME_OVER_DISPLAY_DURATION);
        
        setTimeout(() => {
          setLevel(1);
          setExp(0);
          setHp(MAX_HP);
          setIsGameOver(false);
          setSessionStartTime(Date.now());
          localStorage.setItem('rpg_session_start', Date.now().toString());
        }, GAME_OVER_DISPLAY_DURATION);
      } else if (hp > 0) {
        const hpLoss = Math.floor(elapsed / (HP_DURATION / MAX_HP));
        setHp(Math.max(0, MAX_HP - hpLoss));
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      if (gameOverTimeoutRef.current) {
        clearTimeout(gameOverTimeoutRef.current);
      }
    };
  }, [sessionStartTime, hp]);

  useEffect(() => {
    manaRegenRef.current = setInterval(() => {
      if (mana < MAX_MANA) {
        setMana(prev => Math.min(MAX_MANA, prev + 20));
      }
    }, MANA_REGEN_INTERVAL);

    return () => {
      if (manaRegenRef.current) {
        clearInterval(manaRegenRef.current);
      }
    };
  }, [mana]);

  const addExp = useCallback((amount: number) => {
    if (isMaxLevel || isGameOver) return;

    setExp((prevExp) => {
      let newExp = prevExp + amount;
      let newLevel = level;

      while (newExp >= expForNextLevel && newLevel < MAX_LEVEL) {
        newExp -= expForNextLevel;
        newLevel++;
        setShowLevelUpEffect(true);
        setTimeout(() => setShowLevelUpEffect(false), 5000);
        setLevel(newLevel);
      }

      if (newLevel >= MAX_LEVEL) {
        newExp = 0;
        setLevel(MAX_LEVEL);
      }

      return newExp;
    });
  }, [level, expForNextLevel, isMaxLevel, isGameOver]);

  const addLevels = useCallback((amount: number) => {
    if (isGameOver) return;
    
    setLevel(prev => {
      const newLevel = Math.min(prev + amount, MAX_LEVEL);
      setShowLevelUpEffect(true);
      setTimeout(() => setShowLevelUpEffect(false), 5000);
      return newLevel;
    });
  }, [isGameOver]);

  const consumeMana = useCallback((amount: number) => {
    if (isGameOver) return;
    setMana(prev => Math.max(0, prev - amount));
  }, [isGameOver]);

  const replenishMana = useCallback(() => {
    if (isGameOver) return;
    setMana(MAX_MANA);
  }, [isGameOver]);

  const addButtonPress = useCallback(() => {
    if (isGameOver) return;
    
    buttonPressCountRef.current += 1;
    const expGain = Math.floor(Math.random() * (MAX_EXP_PER_BUTTON - MIN_EXP_PER_BUTTON + 1)) + MIN_EXP_PER_BUTTON;
    addExp(expGain);
    consumeMana(MANA_PER_BUTTON);
  }, [addExp, consumeMana, isGameOver]);

  const startPlaying = useCallback(() => {
    if (isMaxLevel || isPlaying || isGameOver) return;
    setIsPlaying(true);
    playTimeRef.current = setInterval(() => {
      setPlayTime((prev) => prev + 1);
    }, 1000);
  }, [isMaxLevel, isPlaying, isGameOver]);

  const stopPlaying = useCallback(() => {
    setIsPlaying(false);
    if (playTimeRef.current) {
      clearInterval(playTimeRef.current);
      playTimeRef.current = null;
    }
  }, []);

  const resetProgress = useCallback(() => {
    setExp(0);
    setLevel(1);
    setHp(MAX_HP);
    setMana(MAX_MANA);
    setPlayTime(0);
    setIsPlaying(false);
    setIsGameOver(false);
    setShowGameOverText(false);
    setSessionStartTime(Date.now());
    localStorage.setItem('rpg_session_start', Date.now().toString());
    if (playTimeRef.current) {
      clearInterval(playTimeRef.current);
      playTimeRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (playTimeRef.current) clearInterval(playTimeRef.current);
      if (manaRegenRef.current) clearInterval(manaRegenRef.current);
      if (gameOverTimeoutRef.current) clearTimeout(gameOverTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (showLevelUpEffect) {
      document.body.classList.add('level-up-effect');
    } else {
      document.body.classList.remove('level-up-effect');
    }
  }, [showLevelUpEffect]);

  const value: GamificationContextType = {
    exp,
    level,
    hp,
    maxHp: MAX_HP,
    mana,
    maxMana: MAX_MANA,
    isMaxLevel,
    isPlaying,
    playTime,
    sessionStartTime,
    isHudVisible,
    addExp,
    addLevels,
    consumeMana,
    replenishMana,
    startPlaying,
    stopPlaying,
    resetProgress,
    expForNextLevel,
    expProgress,
    hpProgress,
    manaProgress,
    isGameOver,
    addButtonPress,
    toggleHud,
    showGameOverText,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}

export function RPGHud() {
  const { 
    level, 
    exp, 
    expForNextLevel, 
    expProgress,
    hp, 
    maxHp, 
    hpProgress,
    mana, 
    maxMana, 
    manaProgress,
    isGameOver,
    playTime,
    isHudVisible,
    toggleHud,
    showGameOverText
  } = useGamification();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isHudVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleHud}
          className="w-12 h-12 bg-black/90 border-2 border-amber-500/70 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]"
        >
          <span className="text-amber-400 text-xs" style={{ fontFamily: '"Press Start 2P", cursive' }}>RPG</span>
        </motion.button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative bg-black/90 border-2 border-amber-500/70 p-4 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.4)]">
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-500" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-amber-500" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-amber-500" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-500" />

        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleHud}
          className="absolute -top-3 -right-3 w-6 h-6 bg-black border border-amber-500 rounded-full flex items-center justify-center text-amber-400 text-xs"
        >
          −
        </motion.button>

        <div className="flex items-center justify-between mb-3 border-b border-amber-500/30 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-xs" style={{ fontFamily: '"Press Start 2P", cursive' }}>LVL</span>
            <span className="text-white text-lg font-bold" style={{ fontFamily: '"Press Start 2P", cursive' }}>{level}</span>
          </div>
          <div className="text-white/60 text-xs" style={{ fontFamily: '"Press Start 2P", cursive' }}>
            {formatTime(playTime)}
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-red-400 text-xs" style={{ fontFamily: '"Press Start 2P", cursive' }}>HP</span>
            <span className="text-white/60 text-xs">{hp}/{maxHp}</span>
          </div>
          <div className="w-40 h-3 bg-black/80 border border-red-500/50">
            <div 
              className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-500"
              style={{ width: `${hpProgress}%` }}
            />
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-blue-400 text-xs" style={{ fontFamily: '"Press Start 2P", cursive' }}>MANA</span>
            <span className="text-white/60 text-xs">{mana}/{maxMana}</span>
          </div>
          <div className="w-40 h-3 bg-black/80 border border-blue-500/50">
            <div 
              className="h-full bg-gradient-to-r from-blue-700 to-blue-500 transition-all duration-300"
              style={{ width: `${manaProgress}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-green-400 text-xs" style={{ fontFamily: '"Press Start 2P", cursive' }}>EXP</span>
            <span className="text-white/60 text-xs">{exp}/{expForNextLevel}</span>
          </div>
          <div className="w-40 h-3 bg-black/80 border border-green-500/50">
            <div 
              className="h-full bg-gradient-to-r from-green-700 to-green-500 transition-all duration-300"
              style={{ width: `${expProgress}%` }}
            />
          </div>
        </div>

        {showGameOverText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 flex items-center justify-center rounded-lg"
          >
            <div className="text-center p-2">
              <span className="text-red-500 text-xs block mb-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                GAME OVER
              </span>
              <span className="text-white/60 text-xs block" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                Time's Up!
              </span>
              <span className="text-amber-400 text-xs block mt-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                Resetting...
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
