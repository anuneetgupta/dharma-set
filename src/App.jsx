import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnnouncementStrip from './components/AnnouncementStrip';
import OmPageTransition from './components/OmPageTransition';
import Home from './pages/Home';
import Guidance from './pages/Guidance';
import Stories from './pages/Stories';
import Shloka from './pages/Shloka';
import Journal from './pages/Journal';
import Auth from './pages/Auth';
import About from './pages/About';
import Contact from './pages/Contact';
import Courses from './pages/Courses';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, delay: 0.18, ease: [0.23, 1, 0.32, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.1, ease: 'easeIn' } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/guidance" element={<Guidance />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/shloka" element={<Shloka />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-cosmic-900 overflow-x-hidden">
          {/* Sticky header — Navbar first, strip below. Sticks as a unit, no overlap. */}
          <div className="sticky top-0 z-50">
            <Navbar />
            <AnnouncementStrip />
          </div>
          <main>
            <AnimatedRoutes />
          </main>
          <Footer />
          <OmPageTransition />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
