import { motion } from 'framer-motion';

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-50 py-4 text-center"
    >
      <p className="text-white/40 text-xs tracking-wider">
        © 2025 POTESIA™. All Rights Reserved.
      </p>
    </motion.footer>
  );
}
