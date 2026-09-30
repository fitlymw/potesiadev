import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, X, Layers, Globe, Box, BarChart3 } from 'lucide-react';
import { playClick } from '@/lib/audio';
import { useTranslation } from 'react-i18next';

const getAssetUrl = (path: string) => {
  const base = '/potesiadev';
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

const aiProjects = [
  {
    id: 'object-detection',
    title: 'Object Detection',
    videoPath: '/bg song/objectdetection_yolo.mp4',
    description: 'Teknologi YOLO untuk deteksi objek real-time. Keuntungan: Otomasi inventaris bagi UMKM (misal: hitung stok otomatis) dan peningkatan keamanan perusahaan. Contoh: Deteksi pelanggaran APD di area proyek atau penghitungan pengunjung toko secara otomatis.',
  },
  {
    id: 'absensi-wajah',
    title: 'Absensi Wajah',
    videoPath: '/bg song/absensi_arcface.mp4',
    description: 'Sistem biometrik ArcFace tanpa kontak. Keuntungan: Efisiensi operasional bagi UMKM (bebas biaya kartu/fingerprint) dan keamanan data bagi perusahaan besar. Contoh: Absensi karyawan yang akurat, anti-titip absen, dan higienis karena tidak perlu menyentuh alat.',
  },
  {
    id: 'ai-car-counter',
    title: 'AI Car Counter System',
    videoPath: '/images/car counter.mp4',
    description: 'Advanced traffic analysis using Computer Vision. This system tracks and counts vehicles in real-time, providing crucial traffic flow data for Smart City planning and high-value billboard placement auditing.',
  },
  {
    id: 'hand-gesture-control',
    title: 'Hand Gesture Control Interface',
    videoPath: '/images/Hand Gesture Control System.mp4',
    description: 'Next-gen Human-Computer Interaction (HCI). Utilizing hand-landmark detection to control system interfaces without physical contact, ideal for sterile medical environments or interactive public displays.',
  },
];

export function MyProjectPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const [showWebsiteOverlay, setShowWebsiteOverlay] = useState(false);

  const openOverlay = () => {
    playClick();
    setShowWebsiteOverlay(true);
  };

  const closeOverlay = () => {
    playClick();
    setShowWebsiteOverlay(false);
  };

  const navigateTo = (path: string) => {
    playClick();
    setShowWebsiteOverlay(false);
    navigate(path);
  };
  
  const handleBack = () => {
    playClick();
    navigate('/menu');
  };

  return (
    <div className="relative min-h-screen overflow-hidden crt-flicker">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${getAssetUrl('/images/projects.gif')})`,
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
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

      <div className="relative min-h-screen pt-20 sm:pt-24 pb-16 sm:pb-20 px-3 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* RPG Panel Header */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative bg-hound-panel/80 border-2 border-amber-500/30 p-1 mb-6 sm:mb-12"
          >
            {/* Corner decorations */}
            <div className="absolute -top-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-l-2 border-amber-500" />
            <div className="absolute -top-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-r-2 border-amber-500" />
            <div className="absolute -bottom-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-l-2 border-amber-500" />
            <div className="absolute -bottom-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-r-2 border-amber-500" />
            
            <div className="bg-hound-teal/20 px-4 sm:px-6 py-3 sm:py-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-white retro-glow" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                My Project
              </h1>
            </div>
          </motion.div>

          {/* AI Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {aiProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
              >
                {/* Project Card */}
                <div className="relative bg-hound-panel/90 border-2 border-amber-500/30 p-1 group">
                  {/* Corner decorations */}
                  <div className="absolute -top-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-l-2 border-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -top-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-r-2 border-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -bottom-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-l-2 border-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -bottom-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-r-2 border-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Video Container */}
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      <source src={getAssetUrl(project.videoPath)} type="video/mp4" />
                    </video>
                    
                    {/* Video overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <h2 className="text-amber-400 text-sm sm:text-base md:text-lg font-bold" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                        {project.title}
                      </h2>
                    </div>
                    
                    {/* Glowing border effect */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-500/50 transition-colors" />
                  </div>
                  
                  {/* Description */}
                  <div className="p-3 sm:p-4 bg-black/80">
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed" style={{ fontFamily: '"Share Tech Mono", monospace' }}>
                      {project.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Website Samples Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-8 sm:mt-12"
          >
            <div
              onClick={openOverlay}
              className="relative bg-hound-panel/90 border-2 border-amber-500/30 p-1 group cursor-pointer hover:border-amber-400/60 transition-colors"
            >
              {/* Corner decorations */}
              <div className="absolute -top-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-l-2 border-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -top-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-r-2 border-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -bottom-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-l-2 border-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -bottom-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-r-2 border-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative aspect-[21/9] bg-black overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-black to-teal-900/30" />
                <div className="relative text-center px-4">
                  <Layers className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 mx-auto mb-3 sm:mb-4" />
                  <h2 className="text-amber-400 text-sm sm:text-base md:text-lg font-bold mb-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                    Website Samples
                  </h2>
                  <p className="text-white/60 text-xs sm:text-sm" style={{ fontFamily: '"Share Tech Mono", monospace' }}>
                    Click to explore showcase templates
                  </p>
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-500/50 transition-colors" />
              </div>
            </div>
          </motion.div>

          {/* Data Analyst Visualization System */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 sm:mt-12"
          >
            <div
              onClick={() => {
                playClick();
                navigate('/my-project/ai-data-lab');
              }}
              className="relative bg-hound-panel/90 border-2 border-amber-500/30 p-1 group cursor-pointer hover:border-amber-400/60 transition-colors"
            >
              {/* Corner decorations */}
              <div className="absolute -top-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-l-2 border-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -top-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-r-2 border-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -bottom-2 -left-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-l-2 border-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -bottom-2 -right-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-r-2 border-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative aspect-[21/9] bg-black overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-black to-purple-900/30" />
                <div className="relative text-center px-4">
                  <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 mx-auto mb-3 sm:mb-4" />
                  <h2 className="text-cyan-400 text-sm sm:text-base md:text-lg font-bold mb-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                    Data Analyst Visualization System
                  </h2>
                  <p className="text-white/60 text-xs sm:text-sm" style={{ fontFamily: '"Share Tech Mono", monospace' }}>
                    Upload Excel/CSV → Auto-Analyze → Visualize
                  </p>
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-500/50 transition-colors" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Website Showcase Overlay */}
      <AnimatePresence>
        {showWebsiteOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center"
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.2 }}
              onClick={closeOverlay}
              className="absolute top-6 right-6 z-10 p-3 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-center px-6 max-w-2xl w-full"
            >
              <h2
                className="text-2xl sm:text-3xl md:text-4xl text-amber-400 mb-3 retro-glow"
                style={{ fontFamily: '"Press Start 2P", cursive' }}
              >
                Website Showcase
              </h2>
              <p className="text-white/60 mb-10 sm:mb-14 text-sm sm:text-base" style={{ fontFamily: '"Share Tech Mono", monospace' }}>
                Select a design style to preview
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {/* Minimalist */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateTo('/my-project/minimalist')}
                  className="group p-6 bg-white/5 border-2 border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/10 transition-all rounded-lg"
                >
                  <Layers className="w-8 h-8 text-amber-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-bold text-sm mb-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                    Minimalist
                  </h3>
                  <p className="text-white/50 text-xs" style={{ fontFamily: '"Share Tech Mono", monospace' }}>
                    Clean & architectural
                  </p>
                </motion.button>

                {/* Modern */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateTo('/my-project/modern')}
                  className="group p-6 bg-white/5 border-2 border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/10 transition-all rounded-lg"
                >
                  <Globe className="w-8 h-8 text-amber-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-bold text-sm mb-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                    Modern
                  </h3>
                  <p className="text-white/50 text-xs" style={{ fontFamily: '"Share Tech Mono", monospace' }}>
                    Corporate & bold
                  </p>
                </motion.button>

                {/* 3D Experience */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateTo('/my-project/3d-design')}
                  className="group p-6 bg-white/5 border-2 border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/10 transition-all rounded-lg"
                >
                  <Box className="w-8 h-8 text-amber-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-bold text-sm mb-2" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                    3D Experience
                  </h3>
                  <p className="text-white/50 text-xs" style={{ fontFamily: '"Share Tech Mono", monospace' }}>
                    Futuristic & immersive
                  </p>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
