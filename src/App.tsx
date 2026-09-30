import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState, useCallback, lazy, Suspense, type ReactNode } from 'react';
import { CartProvider } from '@/hooks/useCart';
import { Layout } from '@/components/layout/Layout';
import { LandingPage } from '@/pages/LandingPage';
import { AudioProvider } from '@/components/common/AudioProvider';
import { GamificationProvider } from '@/context/GamificationContext';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { PageRouteWrapper } from '@/components/common/PageRouteWrapper';
import { LanguageGateway } from '@/components/LanguageGateway';

import { initAudio } from '@/lib/audio';

// Halaman selain landing dipecah per-chunk agar bundle awal kecil
const MenuPage = lazy(() => import('@/pages/MenuPage').then((m) => ({ default: m.MenuPage })));
const AboutMePage = lazy(() => import('@/pages/AboutMePage').then((m) => ({ default: m.AboutMePage })));
const MyProjectPage = lazy(() => import('@/pages/MyProjectPage').then((m) => ({ default: m.MyProjectPage })));
const MinimalistPage = lazy(() => import('@/pages/MinimalistPage').then((m) => ({ default: m.MinimalistPage })));
const ModernPage = lazy(() => import('@/pages/ModernPage').then((m) => ({ default: m.ModernPage })));
const ThreeDPage = lazy(() => import('@/pages/ThreeDPage').then((m) => ({ default: m.ThreeDPage })));
const AIDataLabPage = lazy(() => import('@/pages/AIDataLabPage').then((m) => ({ default: m.AIDataLabPage })));
const SenseAnalyticsPage = lazy(() => import('@/pages/SenseAnalyticsPage').then((m) => ({ default: m.SenseAnalyticsPage })));
const SocialMediaPage = lazy(() => import('@/pages/SocialMediaPage').then((m) => ({ default: m.SocialMediaPage })));
const AcademicJournalPage = lazy(() => import('@/pages/AcademicJournalPage').then((m) => ({ default: m.AcademicJournalPage })));
const FreelancePage = lazy(() => import('@/pages/FreelancePage').then((m) => ({ default: m.FreelancePage })));
const GamesPage = lazy(() => import('@/pages/GamesPage').then((m) => ({ default: m.GamesPage })));
const OracleTavernPage = lazy(() => import('@/pages/OracleTavernPage').then((m) => ({ default: m.OracleTavernPage })));
const OracleResultPage = lazy(() => import('@/pages/OracleResultPage').then((m) => ({ default: m.OracleResultPage })));
const RetroAICameraPage = lazy(() => import('@/pages/RetroAICameraPage').then((m) => ({ default: m.RetroAICameraPage })));
const PersonaCorePage = lazy(() => import('@/pages/PersonaCorePage').then((m) => ({ default: m.PersonaCorePage })));
const EmotionImpostorPage = lazy(() => import('@/pages/EmotionImpostorPage').then((m) => ({ default: m.EmotionImpostorPage })));
const ProfilerPage = lazy(() => import('@/pages/ProfilerPage').then((m) => ({ default: m.ProfilerPage })));
const MindReaderPage = lazy(() => import('@/pages/MindReaderPage').then((m) => ({ default: m.MindReaderPage })));
const MatrixReasoningPage = lazy(() => import('@/pages/MatrixReasoningPage').then((m) => ({ default: m.MatrixReasoningPage })));
const ProtocolSlicePage = lazy(() => import('@/pages/ProtocolSlicePage').then((m) => ({ default: m.ProtocolSlicePage })));

/** Halaman tanpa nav/footer (full-screen) */
function Fullscreen({ children }: { children: ReactNode }) {
  return (
    <PageRouteWrapper>
      <Layout showNav={false} showFooter={false}>{children}</Layout>
    </PageRouteWrapper>
  );
}

/** Halaman dengan nav & footer */
function WithNav({ children }: { children: ReactNode }) {
  return (
    <PageRouteWrapper>
      <Layout>{children}</Layout>
    </PageRouteWrapper>
  );
}

function App() {
  const [loadingDone, setLoadingDone] = useState(false);
  const [showLanguageGateway, setShowLanguageGateway] = useState(false);

  const handleLoadingComplete = useCallback(() => {
    setLoadingDone(true);
    initAudio();
  }, []);

  const landing = (
    <Fullscreen>
      <LandingPage setShowLanguageGateway={setShowLanguageGateway} />
    </Fullscreen>
  );

  return (
    <CartProvider>
      <GamificationProvider>
        <Router>
          <AudioProvider>
            <AnimatePresence mode="wait">
              {/* 1. LANGUAGE GATEWAY OVERLAY */}
              {showLanguageGateway && (
                <LanguageGateway onComplete={() => setShowLanguageGateway(false)} />
              )}

              {/* 2. LOADING SCREEN (overlay; halaman di bawahnya sudah mulai memuat) */}
              {!loadingDone && (
                <LoadingScreen onComplete={handleLoadingComplete} />
              )}
            </AnimatePresence>

            {/* 3. MAIN APPLICATION — satu pohon Routes yang sama sebelum & sesudah
                loading, jadi halaman di bawah loading screen (poster & video landing)
                sudah mulai dimuat dan tidak di-mount ulang saat PRESS START. */}
            <Suspense fallback={<div className="fixed inset-0 bg-hound-black" />}>
              <Routes>
                <Route path="/" element={landing} />
                <Route path="/menu" element={<Fullscreen><MenuPage /></Fullscreen>} />
                <Route path="/about-me" element={<WithNav><AboutMePage /></WithNav>} />
                <Route path="/my-project" element={<WithNav><MyProjectPage /></WithNav>} />
                <Route path="/my-project/minimalist" element={<Fullscreen><MinimalistPage /></Fullscreen>} />
                <Route path="/my-project/modern" element={<Fullscreen><ModernPage /></Fullscreen>} />
                <Route path="/my-project/3d-design" element={<Fullscreen><ThreeDPage /></Fullscreen>} />
                <Route path="/my-project/ai-data-lab" element={<Fullscreen><AIDataLabPage /></Fullscreen>} />
                <Route path="/my-project/sense-analytics" element={<Fullscreen><SenseAnalyticsPage /></Fullscreen>} />
                <Route path="/social-media" element={<WithNav><SocialMediaPage /></WithNav>} />
                <Route path="/academic-journal" element={<WithNav><AcademicJournalPage /></WithNav>} />
                <Route path="/freelance" element={<WithNav><FreelancePage /></WithNav>} />
                <Route path="/games" element={<Fullscreen><GamesPage /></Fullscreen>} />
                <Route path="/games/oracle-tavern" element={<Fullscreen><OracleTavernPage /></Fullscreen>} />
                <Route path="/games/oracle-tavern/result" element={<Fullscreen><OracleResultPage /></Fullscreen>} />
                <Route path="/games/retro-ai-camera" element={<Fullscreen><RetroAICameraPage /></Fullscreen>} />
                <Route path="/games/persona-core" element={<Fullscreen><PersonaCorePage /></Fullscreen>} />
                <Route path="/games/emotion-impostor" element={<Fullscreen><EmotionImpostorPage /></Fullscreen>} />
                <Route path="/games/profiler" element={<Fullscreen><ProfilerPage /></Fullscreen>} />
                <Route path="/games/mind-reader" element={<Fullscreen><MindReaderPage /></Fullscreen>} />
                <Route path="/games/matrix-reasoning" element={<Fullscreen><MatrixReasoningPage /></Fullscreen>} />
                <Route path="/games/protocol-slice" element={<Fullscreen><ProtocolSlicePage /></Fullscreen>} />
                <Route path="*" element={landing} />
              </Routes>
            </Suspense>
          </AudioProvider>
        </Router>
      </GamificationProvider>
    </CartProvider>
  );
}

export default App;
