import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PixelCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  glowOnHover?: boolean;
}

export function PixelCard({
  children,
  className = '',
  onClick,
  glowOnHover = true,
}: PixelCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={`
        relative p-1
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      whileHover={
        glowOnHover
          ? {
              scale: 1.02,
              boxShadow: '0 0 30px rgba(212, 175, 55, 0.4)',
            }
          : {}
      }
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      {/* Pixel art border effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(to right, #D4AF37 4px, transparent 4px) top left,
            linear-gradient(to bottom, #D4AF37 4px, transparent 4px) top left,
            linear-gradient(to left, #D4AF37 4px, transparent 4px) top right,
            linear-gradient(to bottom, #D4AF37 4px, transparent 4px) top right,
            linear-gradient(to right, #D4AF37 4px, transparent 4px) bottom left,
            linear-gradient(to top, #D4AF37 4px, transparent 4px) bottom left,
            linear-gradient(to left, #D4AF37 4px, transparent 4px) bottom right,
            linear-gradient(to top, #D4AF37 4px, transparent 4px) bottom right
          `,
          backgroundSize: '20px 20px',
          backgroundRepeat: 'no-repeat',
          padding: '4px',
        }}
      />
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-hound-orange" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-hound-orange" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-hound-orange" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-hound-orange" />
      <div className="relative bg-gradient-to-br from-hound-purple/30 to-hound-panel/50">
        {children}
      </div>
    </motion.div>
  );
}
