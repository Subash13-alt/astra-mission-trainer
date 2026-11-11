import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import StarField from './components/StarField.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Home from './pages/Home.jsx';
import HowToPlay from './pages/HowToPlay.jsx';
import Profile from './pages/Profile.jsx';
import PlanetSelection from './pages/PlanetSelection.jsx';
import MissionBriefing from './pages/MissionBriefing.jsx';
import MissionControl from './pages/MissionControl.jsx';
import ScienceCenter from './pages/ScienceCenter.jsx';
import MissionReport from './pages/MissionReport.jsx';
import About from './pages/About.jsx';
import NotFound from './pages/NotFound.jsx';
import { useApp } from './hooks/useApp.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { settings } = useApp();
  return (
    <MotionConfig reducedMotion={settings.reducedMotion ? 'always' : 'user'}>
      <a href="#main" className="skip-link">Skip to main content</a>
      <StarField />
      <Navbar />
      <ScrollToTop />
      <ErrorBoundary>
        <main id="main" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/how-to-play" element={<HowToPlay />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/planets" element={<PlanetSelection />} />
            <Route path="/briefing" element={<MissionBriefing />} />
            <Route path="/mission" element={<MissionControl />} />
            <Route path="/science" element={<ScienceCenter />} />
            <Route path="/report" element={<MissionReport />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </ErrorBoundary>
      <footer className="mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-slate-400 sm:px-6">
        ASTRA is an independent educational game and is not affiliated with NASA. Game values are simulated. NASA data is credited on the{' '}
        <a href="/about" className="underline">About page</a>.
      </footer>
    </MotionConfig>
  );
}
