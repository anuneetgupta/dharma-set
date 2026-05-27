import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { PlayCircle, CheckCircle, Lock, BookOpen, Download, ArrowLeft, Loader2 } from 'lucide-react';

// Hardcoded course catalog (same as Courses.jsx)
const COURSE_CATALOG = {
  'bhagavad-gita-masterclass': {
    title: 'Bhagavad Gita Masterclass',
    description: 'A deep-dive into the Bhagavad Gita — from Arjuna\'s crisis on the battlefield to Krishna\'s timeless answers.',
    modules: [
      { id: 1, title: 'Chapter 1: The Yoga of Dejection', duration: '45 mins', isCompleted: true },
      { id: 2, title: 'Chapter 2: Sankhya Yoga', duration: '1 hr 10 mins', isCompleted: false },
      { id: 3, title: 'Chapter 3: Karma Yoga', duration: '55 mins', isCompleted: false },
    ],
    resources: [
      { name: 'Chapter 1-3 Study Guide', size: '2.4 MB' },
      { name: 'Sanskrit Pronunciation Audio', size: '15 MB' },
    ]
  },
  'pranayama-&-breathwork': {
    title: 'Pranayama & Breathwork',
    description: 'Master 12 classical pranayama techniques from Hatha Yoga Pradipika.',
    modules: [
      { id: 1, title: 'Introduction to Prana', duration: '30 mins', isCompleted: false },
      { id: 2, title: 'Anulom Vilom Practice', duration: '40 mins', isCompleted: false },
    ],
    resources: [
      { name: 'Breath Tracking Journal', size: '1.1 MB' },
    ]
  },
  'vedantic-philosophy': {
    title: 'Vedantic Philosophy',
    description: 'Explore the Upanishads, Adi Shankaracharya\'s teachings, and the core doctrine of Advaita Vedanta.',
    modules: [
      { id: 1, title: 'What is Advaita?', duration: '50 mins', isCompleted: false },
    ],
    resources: []
  },
  'bhakti-yoga-&-devotion': {
    title: 'Bhakti Yoga & Devotion',
    description: 'From Mirabai\'s songs to the Narada Bhakti Sutras — explore the nine forms of devotion.',
    modules: [
      { id: 1, title: 'The Nine Forms of Devotion', duration: '45 mins', isCompleted: false },
    ],
    resources: []
  },
  'karma-yoga-in-daily-life': {
    title: 'Karma Yoga in Daily Life',
    description: 'Practical application of Karma Yoga principles in work, family, and society.',
    modules: [
      { id: 1, title: 'Nishkama Karma', duration: '35 mins', isCompleted: false },
    ],
    resources: []
  }
};

export default function CourseViewer() {
  const { courseId } = useParams();
  const { user, authFetch } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [activeModule, setActiveModule] = useState(null);

  const courseData = COURSE_CATALOG[courseId];

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkAccess = async () => {
      try {
        const res = await authFetch('/courses/my-enrollments');
        const data = await res.json();
        if (data.success) {
          const enrollment = data.data.find(e => e.courseId === courseId && e.status === 'confirmed');
          if (enrollment) {
            setHasAccess(true);
            if (courseData?.modules?.length > 0) {
              setActiveModule(courseData.modules[0]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to verify access', err);
      } finally {
        setLoading(false);
      }
    };
    checkAccess();
  }, [user, courseId, authFetch, courseData]);

  if (!courseData) {
    return (
      <div className="min-h-screen py-20 flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-serif mb-4">Course not found</h2>
        <Link to="/courses" className="text-amber-400 hover:underline">Back to Courses</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-amber-400" />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return (
      <div className="min-h-screen py-32 px-6 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
          <Lock size={32} className="text-red-400" />
        </div>
        <h1 className="text-3xl font-serif text-white mb-4">Access Denied</h1>
        <p className="text-white/50 max-w-md mx-auto mb-8">
          You have not enrolled in this course or your payment is still pending approval.
        </p>
        <Link to="/courses" className="bg-amber-500 hover:bg-amber-600 text-cosmic-900 font-semibold px-6 py-3 rounded-full transition-colors">
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-900 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="text-3xl md:text-4xl font-serif text-white mb-2">{courseData.title}</h1>
        <p className="text-white/50 mb-8 max-w-3xl">{courseData.description}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area (Video Player) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-black rounded-2xl border border-white/10 overflow-hidden relative group flex items-center justify-center shadow-2xl">
              {/* Placeholder Video Player */}
              <div className="absolute inset-0 bg-gradient-to-t from-cosmic-900 via-transparent to-transparent opacity-60 pointer-events-none" />
              <div className="text-center z-10">
                <button className="w-16 h-16 bg-amber-500/90 hover:bg-amber-400 text-cosmic-900 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-110 shadow-lg shadow-amber-500/30">
                  <PlayCircle size={32} />
                </button>
                <p className="text-white font-medium text-lg">{activeModule?.title || 'Select a module'}</p>
                <p className="text-white/50 text-sm mt-1">Video lesson coming soon</p>
              </div>
            </div>

            {/* Resources / Notes */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-serif text-white mb-4 flex items-center gap-2">
                <BookOpen size={18} className="text-amber-400" /> Module Resources
              </h3>
              {courseData.resources.length === 0 ? (
                <p className="text-white/40 text-sm">No downloadable resources for this module.</p>
              ) : (
                <div className="space-y-3">
                  {courseData.resources.map((res, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Download size={14} className="text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{res.name}</p>
                          <p className="text-xs text-white/40">{res.size} · PDF</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar (Curriculum) */}
          <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-serif text-white mb-4">Course Curriculum</h3>
              <div className="space-y-2">
                {courseData.modules.map((mod, idx) => (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(mod)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                      activeModule?.id === mod.id 
                        ? 'bg-amber-500/10 border-amber-500/30' 
                        : 'bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {mod.isCompleted ? (
                        <CheckCircle size={18} className="text-emerald-400" />
                      ) : (
                        <div className="w-[18px] h-[18px] rounded-full border-2 border-white/20" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${activeModule?.id === mod.id ? 'text-amber-400' : 'text-white'}`}>
                        {idx + 1}. {mod.title}
                      </p>
                      <p className="text-xs text-white/40 mt-1 flex items-center gap-1.5">
                        <PlayCircle size={12} /> {mod.duration}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
