import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

/** A number that counts up from 0 to `value` (e.g. points on a results screen). */
export function CountUp({ value, duration = 0.9, delay = 0, prefix = '' }: { value: number; duration?: number; delay?: number; prefix?: string }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${prefix}${Math.round(v)}`);
  useEffect(() => {
    const controls = animate(mv, value, { duration, delay, ease: 'easeOut' });
    return () => controls.stop();
  }, [mv, value, duration, delay]);
  return <motion.span>{text}</motion.span>;
}
