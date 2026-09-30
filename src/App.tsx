import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { CartProvider } from '@/hooks/useCart';
import { Layout } from '@/components/layout/Layout';
import { LandingPage } from '@/pages/LandingPage';
import { MenuPage } from '@/pages/MenuPage';
import { AboutMePage } from '@/pages/AboutMePage';
import { MyProjectPage } from '@/pages/MyProjectPage';
import { MinimalistPage } from '@/pages/MinimalistPage';
import { ModernPage } from '@/pages/ModernPage';
import { ThreeDPage } from '@/pages/ThreeDPage';
import { AIDataLabPage } from '@/pages/AIDataLabPage';
import { SenseAnalyticsPage } from '@/pages/SenseAnalyticsPage';
import { SocialMediaPage } from '@/pages/SocialMediaPage';
import { AcademicJournalPage } from '@/pages/AcademicJournalPage';
import { FreelancePage } from '@/pages/FreelancePage';
import { GamesPage } from '@/pages/GamesPage';
import { OracleTavernPage } from '@/pages/OracleTavernPage';
import { OracleResultPage } from '@/pages/OracleResultPage';
import { RetroAICameraPage } from '@/pages/RetroAICameraPage';
import { PersonaCorePage } from '@/pages/PersonaCorePage';
import { ProtocolSlicePage } from '@/pages/ProtocolSlicePage';
import { AudioProvider } from '@/components/common/AudioProvider';
import { GamificationProvider } from '@/context/GamificationContext';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { PageRouteWrapper } from '@/components/common/PageRouteWrapper';
import { LanguageGateway } from '@/components/LanguageGateway';

import { initAudio } from '@/lib/audio';

export const getAssetUrl = (path: string) => {
  const base = '/potesiadev';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

function App() {
  const [loadingDone, setLoadingDone] = useState(false);
  const [showLanguageGateway, setShowLanguageGateway] = useState(false);

  const handleLoadingComplete = useCallback(() => {
    setLoadingDone(true);
    initAudio();
  }, []);

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

              {/* 2. LOADING SCREEN */}
              {!loadingDone && (
                <LoadingScreen onComplete={handleLoadingComplete} />
              )}

              {/* 3. MAIN APPLICATION */}
              {!loadingDone ? (
                <Routes>
                  <Route path="*" element={
                    <PageRouteWrapper>
                      <Layout showNav={false} showFooter={false}>
                        <LandingPage setShowLanguageGateway={setShowLanguageGateway} />
                      </Layout>
                    </PageRouteWrapper>
                  } />
                </Routes>
              ) : (
                <Routes>
                  <Route path="/" element={
                    <PageRouteWrapper>
                      <Layout showNav={false} showFooter={false}>
                        <LandingPage setShowLanguageGateway={setShowLanguageGateway} />
                      </Layout>
                    </PageRouteWrapper>
                  } />

                  <Route path="/menu" element={
                    <PageRouteWrapper>
                      <Layout showNav={false} showFooter={false}>
                        <MenuPage />
                      </Layout>
                    </PageRouteWrapper>
                  } />

                  <Route path="/about-me" element={
                    <PageRouteWrapper>
                      <Layout><AboutMePage /></Layout>
                    </PageRouteWrapper>
                  } />

                  <Route path="/my-project" element={
                    <PageRouteWrapper>
                      <Layout><MyProjectPage /></Layout>
                    </PageRouteWrapper>
                  } />

                  <Route path="/my-project/minimalist" element={
                    <PageRouteWrapper>
                      <Layout showNav={false} showFooter={false}>
                        <MinimalistPage />
                      </Layout>
                    </PageRouteWrapper>
                  } />

                  <Route path="/my-project/modern" element={
                    <PageRouteWrapper>
                      <Layout showNav={false} showFooter={false}>
                        <ModernPage />
                      </Layout>
                    </PageRouteWrapper>
                  } />

                  <Route path="/my-project/3d-design" element={
                    <PageRouteWrapper>
                      <Layout showNav={false} showFooter={false}>
                        <ThreeDPage />
                      </Layout>
                    </PageRouteWrapper>
                  } />

                  <Route path="/my-project/ai-data-lab" element={
                    <PageRouteWrapper>
                      <Layout showNav={false} showFooter={false}>
                        <AIDataLabPage />
                      </Layout>
                    </PageRouteWrapper>
                  } />

                  <Route path="/my-project/sense-analytics" element={
                    <PageRouteWrapper>
                      <Layout showNav={false} showFooter={false}>
                        <SenseAnalyticsPage />
                      </Layout>
                    </PageRouteWrapper>
                  } />

                  <Route path="/social-media" element={
                    <PageRouteWrapper>
                      <Layout><SocialMediaPage /></Layout>
                    </PageRouteWrapper>
                  } />

                  <Route path="/academic-journal" element={
                    <PageRouteWrapper>
                      <Layout><AcademicJournalPage /></Layout>
                    </PageRouteWrapper>
                  } />

                  <Route path="/freelance" element={
                    <PageRouteWrapper>
                      <Layout><FreelancePage /></Layout>
                    </PageRouteWrapper>
                  } />

                  <Route path="/games" element={
                    <PageRouteWrapper>
                      <Layout showNav={false} showFooter={false}>
                        <GamesPage />
                      </Layout>
                    </PageRouteWrapper>
                  } />

                  <Route path="/games/oracle-tavern" element={
                    <PageRouteWrapper>
                      <Layout showNav={false} showFooter={false}>
                        <OracleTavernPage />
                      </Layout>
                    </PageRouteWrapper>
                  } />

                  <Route path="/games/oracle-tavern/result" element={
                    <PageRouteWrapper>
                      <Layout showNav={false} showFooter={false}>
                        <OracleResultPage />
                      </Layout>
                    </PageRouteWrapper>
                  } />

                  <Route path="/games/retro-ai-camera" element={
                    <PageRouteWrapper>
                      <Layout showNav={false} showFooter={false}>
                        <RetroAICameraPage />
                      </Layout>
                    </PageRouteWrapper>
                  } />

                  <Route path="/games/persona-core" element={
                    <PageRouteWrapper>
                      <Layout showNav={false} showFooter={false}>
                        <PersonaCorePage />
                      </Layout>
                    </PageRouteWrapper>
                  } />

                  <Route path="/games/protocol-slice" element={
                    <PageRouteWrapper>
                      <Layout showNav={false} showFooter={false}>
                        <ProtocolSlicePage />
                      </Layout>
                    </PageRouteWrapper>
                  } />
                </Routes>
              )}
            </AnimatePresence>
          </AudioProvider>
        </Router>
      </GamificationProvider>
    </CartProvider>
  );
}

export default App;

