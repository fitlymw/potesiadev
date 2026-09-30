import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, Cpu, Palette, MonitorPlay, LineChart, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { playClick } from '@/lib/audio';

const getAssetUrl = (path: string) => {
  const base = '/potesiadev';
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

interface Service {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  benefit: string;
}

const playConfirmSoundFn = () => {
  try {
    const audio = new Audio(getAssetUrl('/bg song/slice_1.wav'));
    audio.volume = 0.3;
    audio.play().catch(() => {});
  } catch (e) {}
};

export function FreelancePage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { addButtonPress } = useGamification();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleBack = () => {
    playClick();
    navigate('/menu');
  };

  const services: Service[] = [
    {
      id: 'ai-cv',
      icon: <Cpu className="w-6 h-6 sm:w-8 sm:h-8 text-white/80" />,
      title: 'AI & Computer Vision',
      description: 'Pembuatan model Machine Learning kustom untuk prediction, classification, object detection, hingga deep face analysis.',
      benefit: 'BENEFIT: Penerapan Machine Learning dan Deep Learning memberikan keuntungan strategis yang signifikan bagi perusahaan maupun UMKM melalui kemampuan Forecasting dan Prediction yang akurat untuk mengoptimalkan stok barang serta memprediksi tren pasar masa depan.',
    },
    {
      id: 'design',
      icon: <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-white/80" />,
      title: 'Creative Design & Branding',
      description: 'Desain logo, identitas visual, UI/UX, dan material promosi dengan sentuhan estetika dari pengalaman memimpin agensi "Potesia".',
      benefit: 'BENEFIT: Membangun Market Authority melalui identitas visual profesional dari Potesia adalah kunci untuk memastikan bisnis Anda tidak sekadar terlihat estetis, tetapi juga memancarkan kesan trustworthy di mata publik.',
    },
    {
      id: 'web-dev',
      icon: <MonitorPlay className="w-6 h-6 sm:w-8 sm:h-8 text-white/80" />,
      title: 'Web & Interactive Dev',
      description: 'Pengembangan website modern dan instalasi game interaktif/pengontrol gestur menggunakan OpenCV dan MediaPipe.',
      benefit: 'BENEFIT:menghadirkan tingkat interaksi yang luar biasa melalui pengembangan website yang sepenuhnya adaptif dan responsif terhadap berbagai perangkat.',
    },
    {
      id: 'data',
      icon: <LineChart className="w-6 h-6 sm:w-8 sm:h-8 text-white/80" />,
      title: 'Data Analysis & Consulting',
      description: 'Konsultasi riset IT, evaluasi algoritma AI, dan visualisasi data untuk kebutuhan bisnis maupun penyelesaian jurnal akademik.',
      benefit: 'BENEFIT: Risk Mitigation. Don\'t guess your next move. menghadirkan layanan data-driven forecasting dan evaluasi AI berstandar akademik tinggi.',
    },
  ];

  const whyHireMe = [
    'Keahlian teknis bersertifikasi (Magister Sistem Informasi) dengan publikasi Scopus Q3 di bidang AI medis.',
    'Kombinasi langka: Mampu merancang logika algoritma yang rumit sekaligus mengeksekusi visual desain yang memetakan mata.',
    'Terlatih sebagai problem solver efisien dari pengalaman operasional manajemen acara dan pendirian komunitas.',
    'Mentalitas kompetitif dan disiplin yang terbangun dari rutinitas sports dan esports.',
  ];

  const handleServiceClick = useCallback((service: Service) => {
    playConfirmSoundFn();
    setSelectedService(service);
    addButtonPress();
  }, [addButtonPress]);

  const handleCloseDialogue = useCallback(() => {
    playConfirmSoundFn();
    setSelectedService(null);
    addButtonPress();
  }, [addButtonPress]);

  const handleHireClick = useCallback(() => {
    playConfirmSoundFn();
    addButtonPress();
  }, [addButtonPress]);

  return (
    <div className="relative min-h-screen overflow-hidden crt-flicker">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${getAssetUrl('/images/freelance.webp')})`,
        }}
      >
        <div className="absolute inset-0 bg-black/80" />
      </div>

      {/* CRT Effects */}
      <div className="scanlines" />
      <div className="vignette" />

      {/* Pixel Art Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleBack}
        className="absolute top-4 left-4 z-50 p-2 sm:p-3 bg-black/60 border-2 border-amber-500/50 hover:border-amber-400 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
      </motion.button>

      {/* Corner Decorations */}
      <div className="corner-decor top-left" />
      <div className="corner-decor top-right" />
      <div className="corner-decor bottom-left" />
      <div className="corner-decor bottom-right" />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
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

      <div className="relative min-h-screen pt-20 sm:pt-24 pb-16 sm:pb-20 px-3 sm:px-6 max-w-6xl mx-auto">
        {/* RPG Panel Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-hound-panel/80 border-2 border-amber-500/30 p-1 mb-8 sm:mb-12 md:text-center mx-2 sm:mx-4"
        >
          <div className="absolute -top-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-l-2 border-amber-500" />
          <div className="absolute -top-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-r-2 border-amber-500" />
          <div className="absolute -bottom-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-l-2 border-amber-500" />
          <div className="absolute -bottom-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-r-2 border-amber-500" />
          
          <div className="bg-hound-teal/20 px-4 sm:px-6 py-4 sm:py-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-white mb-3 sm:mb-4 retro-glow" style={{ fontFamily: '"Press Start 2P", cursive' }}>
              Freelance Services
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
              Membangun solusi cerdas melalui algoritma AI dan menyajikannya dalam balutan desain visual yang estetis.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-12 px-2 sm:px-4">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative bg-hound-panel/80 border-2 border-amber-500/30 p-1 mb-6">
              <div className="absolute -top-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-l-2 border-amber-500" />
              <div className="absolute -top-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-r-2 border-amber-500" />
              <div className="absolute -bottom-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-l-2 border-amber-500" />
              <div className="absolute -bottom-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-r-2 border-amber-500" />
              
              <div className="bg-hound-teal/20 px-3 sm:px-4 py-2 sm:py-2 mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl text-white font-medium tracking-wide">⚔️ What I Offer</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4">
                {services.map((service) => (
                  <motion.div
                    key={service.id}
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleServiceClick(service)}
                    className="p-3 sm:p-4 border border-white/10 bg-black/40 hover:bg-black/60 hover:border-amber-500/30 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="mb-2 sm:mb-3 bg-white/5 inline-block p-1.5 sm:p-2 rounded border border-white/10 group-hover:border-amber-500/50 transition-colors">
                      {service.icon}
                    </div>
                    <h3 className="text-white text-sm sm:text-base font-medium mb-1 sm:mb-2 group-hover:text-amber-400 transition-colors">{service.title}</h3>
                    <p className="text-white/50 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">
                      {service.description}
                    </p>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="text-amber-400/70 text-[10px] sm:text-xs mt-2 hidden sm:block"
                      style={{ fontFamily: '"Press Start 2P", cursive' }}
                    >
                      [CLICK FOR DETAILS]
                    </motion.p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col justify-between"
          >
            <div className="relative bg-hound-panel/80 border-2 border-amber-500/30 p-1">
              <div className="absolute -top-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-l-2 border-amber-500" />
              <div className="absolute -top-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-r-2 border-amber-500" />
              <div className="absolute -bottom-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-l-2 border-amber-500" />
              <div className="absolute -bottom-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-r-2 border-amber-500" />
              
              <div className="bg-hound-teal/20 px-3 sm:px-4 py-2 sm:py-2 mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl text-white font-medium tracking-wide">🛡️ Why Hire Me?</h2>
              </div>
              
              <div className="space-y-2 sm:space-y-3 p-3 sm:p-4">
                {whyHireMe.map((reason, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex gap-2 sm:gap-3 items-start p-2 sm:p-3 border border-white/5 bg-black/30"
                  >
                    <CheckCircle2 className="w-4 sm:w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                      {reason}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <motion.a
              href="mailto:mamuayafitly@gmail.com"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 sm:mt-8 group relative block"
            >
              <div className="absolute -top-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 border-t-2 border-l-2 border-amber-500" />
              <div className="absolute -top-1 -right-1 w-2 sm:w-3 h-2 sm:h-3 border-t-2 border-r-2 border-amber-500" />
              <div className="absolute -bottom-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 border-b-2 border-l-2 border-amber-500" />
              <div className="absolute -bottom-1 -right-1 w-2 sm:w-3 h-2 sm:h-3 border-b-2 border-r-2 border-amber-500" />
              
              <div className="flex items-center justify-between p-4 sm:p-6 bg-black border-2 border-amber-500/50 hover:border-amber-400 group-hover:bg-amber-500/10 transition-colors">
                <div>
                  <h3 className="text-lg sm:text-xl text-amber-400 font-bold mb-1 retro-glow">Start a Project</h3>
                  <p className="text-white/60 text-sm">Mari diskusikan ide Anda</p>
                </div>
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-amber-500 text-black flex items-center justify-center group-hover:translate-x-2 transition-transform">
                  <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6" />
                </div>
              </div>
            </motion.a>
          </motion.div>
        </div>
      </div>

      {/* Dialogue Box Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4"
            onClick={handleCloseDialogue}
          >
            <div className="absolute inset-0 bg-black/70" />
            
            <motion.div
              initial={{ scaleX: 0.8, scaleY: 0.8 }}
              animate={{ scaleX: 1, scaleY: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="relative w-full max-w-lg sm:max-w-2xl bg-black border-2 sm:border-4 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.5)] max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-1 sm:-top-2 -left-1 sm:-left-2 w-4 sm:w-6 h-4 sm:h-6 border-t-2 sm:border-t-4 border-l-2 sm:border-l-4 border-amber-400" />
              <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-4 sm:w-6 h-4 sm:h-6 border-t-2 sm:border-t-4 border-r-2 sm:border-r-4 border-amber-400" />
              <div className="absolute -bottom-1 sm:-bottom-2 -left-1 sm:-left-2 w-4 sm:w-6 h-4 sm:h-6 border-b-2 sm:border-b-4 border-l-2 sm:border-l-4 border-amber-400" />
              <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 w-4 sm:w-6 h-4 sm:h-6 border-b-2 sm:border-b-4 border-r-2 sm:border-r-4 border-amber-400" />
              
              <div className="bg-gradient-to-r from-amber-900/80 to-purple-900/80 px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between sticky top-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-amber-400 text-lg sm:text-xl">⚔️</span>
                  <h3 
                    className="text-amber-400 font-bold text-xs sm:text-sm" 
                    style={{ fontFamily: '"Press Start 2P", cursive' }}
                  >
                    {selectedService.title}
                  </h3>
                </div>
                <button
                  onClick={handleCloseDialogue}
                  className="p-1 hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 sm:w-5 h-4 sm:h-5 text-white/70" />
                </button>
              </div>
              
              <div className="p-4 sm:p-6 bg-black/90">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="bg-white/10 p-2 sm:p-3 rounded border border-amber-500/30">
                    {selectedService.icon}
                  </div>
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                    {selectedService.description}
                  </p>
                </div>
                
                <div className="border-t border-amber-500/30 my-4" />
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h4 
                    className="text-green-400 font-bold mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm"
                    style={{ fontFamily: '"Press Start 2P", cursive' }}
                  >
                    <span>💎</span> BUSINESS VALUE
                  </h4>
                  <p className="text-white/90 leading-relaxed bg-green-900/20 p-3 sm:p-4 border border-green-500/30 text-sm sm:text-base">
                    {selectedService.benefit}
                  </p>
                </motion.div>
                
                <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6">
                  <motion.a
                    href="mailto:mamuayafitly@gmail.com"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 text-center py-2 sm:py-3 bg-amber-500/20 border-2 border-amber-500 text-amber-400 hover:bg-amber-500/30 text-xs sm:text-sm"
                    style={{ fontFamily: '"Press Start 2P", cursive' }}
                    onClick={handleHireClick}
                  >
                    HIRE ME
                  </motion.a>
                  <motion.button
                    onClick={handleCloseDialogue}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 text-center py-2 sm:py-3 bg-white/5 border-2 border-white/20 text-white/70 hover:bg-white/10 text-xs sm:text-sm"
                    style={{ fontFamily: '"Press Start 2P", cursive' }}
                  >
                    CLOSE
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
