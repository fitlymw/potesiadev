import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import i18n from '@/i18n';
import { playClick } from '@/lib/audio';

interface LanguageGatewayProps {
  onComplete: () => void;
}

const languages = [
  { code: 'id', label: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'en', label: 'English', native: 'English' },
];

export function LanguageGateway({ onComplete }: LanguageGatewayProps) {
  const [exiting, setExiting] = useState(false);

  const handleSelect = (code: string) => {
    playClick();
    // Mengubah bahasa secara global
    i18n.changeLanguage(code);
    // Menyimpan preferensi agar user tidak perlu memilih lagi saat refresh
    localStorage.setItem('i18nextLng', code);
    
    // Memicu animasi keluar
    setExiting(true);

    // Memberikan waktu untuk animasi Framer Motion selesai sebelum pindah state di App.tsx
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="language-gateway"
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-hound-black overflow-hidden pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Efek CRT & Vignette */}
          <div className="scanlines z-10" />
          <div className="vignette z-10" />

          {/* Partikel Bintang Melayang */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="star-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: Math.random() * 0.5 + 0.3,
                }}
              />
            ))}
          </div>

          {/* Konten Utama */}
          <div className="relative z-20 flex flex-col items-center gap-6 sm:gap-10 px-4 w-full max-w-5xl overflow-y-auto max-h-screen py-10">
            {/* Judul dengan Efek Glow */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <h1
                className="text-amber-400 text-lg sm:text-2xl md:text-3xl tracking-[0.2em] uppercase retro-glow mb-3"
                style={{ fontFamily: '"Press Start 2P", cursive' }}
              >
                Select Your Language
              </h1>
              <p
                className="text-white/50 text-[10px] sm:text-xs tracking-wider uppercase"
                style={{ fontFamily: '"Share Tech Mono", monospace' }}
              >
                Choose your preferred tongue to enter the realm
              </p>
            </motion.div>

            {/* Grid Tombol Bahasa */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 w-full max-w-xl"
            >
              {languages.map((lang, index) => (
                <motion.button
                  key={lang.code}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(212, 175, 55, 0.1)",
                    borderColor: "#d4af37",
                    boxShadow: '0 0 25px rgba(212, 175, 55, 0.3)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect(lang.code)}
                  className="group relative flex flex-col items-center justify-center gap-2 p-5 sm:p-6 bg-black/40 border-2 border-white/10 transition-all duration-300 backdrop-blur-sm"
                >
                  {/* Dekorasi Pojok (Muncul saat hover) */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <span
                    className="text-white group-hover:text-amber-400 text-sm sm:text-base md:text-lg font-bold transition-colors"
                    style={{ fontFamily: '"Press Start 2P", cursive' }}
                  >
                    {lang.native}
                  </span>
                  <span
                    className="text-white/30 group-hover:text-white/60 text-[9px] sm:text-[10px] tracking-widest uppercase transition-colors"
                    style={{ fontFamily: '"Share Tech Mono", monospace' }}
                  >
                    {lang.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>

            {/* Dekorasi Bawah */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center"
            >
              <div className="h-px w-24 bg-white/10 mx-auto mb-4" />
              <p className="text-white/20 text-[9px] tracking-[0.3em] uppercase font-pixel">
                System Interface v2.0.26 // Potesia OS
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}