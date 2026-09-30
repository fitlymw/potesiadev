import { motion } from 'framer-motion';

interface PassiveStatProps {
  stat: string;
  value: string;
}

export function PassiveStat({ stat, value }: PassiveStatProps) {
  return (
    <motion.div
      className="inline-flex items-center gap-2 px-4 py-2 bg-hound-gold/10 border border-hound-gold/30 rounded"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
    >
      <span className="text-hound-gold text-sm uppercase tracking-wider">
        Passive
      </span>
      <span className="text-white/50">|</span>
      <span className="text-white font-medium">{stat}</span>
      {value && (
        <span className="text-hound-gold font-bold">{value}</span>
      )}
    </motion.div>
  );
}
