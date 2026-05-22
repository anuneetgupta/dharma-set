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
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// Admin imports
import AdminRoute from './components/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import CourseManager from './pages/admin/CourseManager';
import HomepageCMS from './pages/admin/HomepageCMS';
import AnnouncementsManager from './pages/admin/AnnouncementsManager';
import UserManager from './pages/admin/UserManager';
import PaymentTracker from './pages/admin/PaymentTracker';
import SiteSettingsForm from './pages/admin/SiteSettingsForm';
import UserDashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AvatarPicker from './components/AvatarPicker';

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
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="courses" element={<CourseManager />} />
              <Route path="cms" element={<HomepageCMS />} />
              <Route path="announcements" element={<AnnouncementsManager />} />
              <Route path="users" element={<UserManager />} />
              <Route path="payments" element={<PaymentTracker />} />
              <Route path="settings" element={<SiteSettingsForm />} />
              <Route path="*" element={<div className="text-white p-8">Under Construction</div>} />
            </Route>
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-cosmic-900">
        <AnimatedRoutes />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-900 overflow-x-hidden">
      <div className="sticky top-0 z-50">
        <Navbar />
        <AnnouncementStrip />
      </div>
      <main>
        <AnimatedRoutes />
      </main>
      <Footer />
      <OmPageTransition />
      <AvatarPicker />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
