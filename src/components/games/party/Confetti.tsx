import { motion, useReducedMotion } from 'framer-motion';

/** Deterministic pseudo-random in [0, 1) so the pieces are stable across renders. */
const rand = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** A one-shot confetti burst over the whole screen (mount it with a new `key` to replay). */
export function Confetti({ colors, count = 70 }: { colors: string[]; count?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[55] overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const left = rand(i, 1) * 100;
        const drift = (rand(i, 2) - 0.5) * 160;
        const size = 6 + rand(i, 3) * 8;
        const delay = rand(i, 4) * 0.5;
        const duration = 2.2 + rand(i, 5) * 1.6;
        const spin = (rand(i, 6) - 0.5) * 900;
        return (
          <motion.span
            key={i}
            className="absolute top-0 block"
            style={{ left: `${left}%`, width: size, height: size * (rand(i, 7) > 0.5 ? 0.45 : 1), background: colors[i % colors.length], borderRadius: rand(i, 8) > 0.7 ? '50%' : 2 }}
            initial={{ y: '-10vh', x: 0, rotate: 0, opacity: 1 }}
            animate={{ y: '110vh', x: drift, rotate: spin, opacity: [1, 1, 0.8, 0] }}
            transition={{ duration, delay, ease: 'easeIn' }}
          />
        );
      })}
    </div>
  );
}
