import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RPGButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'nav' | 'pixel';
  className?: string;
  disabled?: boolean;
}

export function RPGButton({
  children,
  onClick,
  variant = 'default',
  className = '',
  disabled = false,
}: RPGButtonProps) {
  const baseStyles =
    'relative font-medium tracking-wider transition-all duration-200';

  const variants = {
    default:
      'px-6 py-3 border border-white/30 text-white hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] bg-transparent',
    nav: 'px-4 py-2 text-white/70 hover:text-white text-sm tracking-widest uppercase',
    pixel:
      'px-4 py-3 bg-hound-panel border-2 border-hound-orange text-white font-pixel text-xs hover:bg-hound-teal',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {children}
    </motion.button>
  );
}
