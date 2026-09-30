import { motion } from 'framer-motion';

interface ItemSlotProps {
  empty?: boolean;
  item?: {
    image: string;
    name: string;
  };
  onClick?: () => void;
  selected?: boolean;
}

export function ItemSlot({
  empty = true,
  item,
  onClick,
  selected = false,
}: ItemSlotProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        relative w-20 h-20 md:w-24 md:h-24
        bg-hound-panel/80
        border-2
        ${selected ? 'border-hound-gold' : 'border-hound-purple/50'}
        transition-colors duration-200
      `}
      whileHover={{
        borderColor: '#D4AF37',
        boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)',
      }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Corner accents */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-hound-orange" />
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-hound-orange" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-hound-orange" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-hound-orange" />

      {empty ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-dashed border-hound-purple/30 rounded-sm" />
        </div>
      ) : item ? (
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      ) : null}
    </motion.button>
  );
}
