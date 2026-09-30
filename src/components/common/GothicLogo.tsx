import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface GothicLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'text-4xl',
  md: 'text-6xl',
  lg: 'text-8xl',
  xl: 'text-[120px]',
};

const mobileSizeMap = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-5xl',
  xl: 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[100px]',
};

export function GothicLogo({
  size = 'xl',
  animate = true,
  className = '',
}: GothicLogoProps) {
  const isMobile = useIsMobile();
  
  const LogoContent = (
    <span
      className={`
        font-gothic text-white
        ${isMobile ? mobileSizeMap[size] : sizeMap[size]}
        ${className}
      `}
      style={{
        textShadow: '0 0 30px rgba(255,255,255,0.3)',
      }}
    >
      Potesia
    </span>
  );

  if (animate) {
    return (
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {LogoContent}
      </motion.div>
    );
  }

  return <div>{LogoContent}</div>;
}
