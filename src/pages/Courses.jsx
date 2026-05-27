import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, BookOpen, GraduationCap, Flame, Wind, Heart, Moon, CheckCircle, ArrowRight, Lock } from 'lucide-react';
import CoursePurchaseModal from '../components/CoursePurchaseModal';
import { useAuth } from '../context/AuthContext';

const cardVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  visible: (i = 0) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.23, 1, 0.32, 1] }
  })
};

const courses = [
  {
    icon: Flame,
    title: 'Bhagavad Gita Masterclass',
    subtitle: 'All 18 Chapters Decoded for Modern Life',
    description: 'A deep-dive into the Bhagavad Gita — from Arjuna\'s crisis on the battlefield to Krishna\'s timeless answers. Learn how each chapter applies to career, relationships, and inner peace.',
    duration: '12 weeks',
    lessons: 36,
    students: '2.4k+',
    price: '₹2,999',
    originalPrice: '₹5,999',
    level: 'Beginner–Advanced',
    color: 'text-gold-400',
    bg: 'bg-gold-500/10',
    border: 'border-gold-500/25',
    badge: 'Most Popular',
    badgeColor: 'bg-gold-500/20 text-gold-400 border-gold-500/30',
    includes: ['18 chapter deep-dives', 'Sanskrit shloka explanations', 'Modern life application exercises', 'Downloadable study notes', 'Live Q&A sessions'],
  },
  {
    icon: Wind,
    title: 'Pranayama & Breathwork',
    subtitle: 'Ancient Breathing Science for Mental Clarity',
    description: 'Master 12 classical pranayama techniques from Hatha Yoga Pradipika. Includes Anulom Vilom, Bhramari, Kapalabhati and their scientific benefits for stress, sleep, and focus.',
    duration: '6 weeks',
    lessons: 18,
    students: '1.1k+',
    price: '₹1,499',
    originalPrice: '₹2,999',
    level: 'Beginner',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/25',
    badge: 'Beginner Friendly',
    badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    includes: ['12 pranayama techniques', 'Daily practice routines', 'Science behind each technique', 'Guided audio sessions', 'Progress tracking'],
  },
  {
    icon: Moon,
    title: 'Vedantic Philosophy',
    subtitle: 'Advaita Vedanta — The Non-Dual Path',
    description: 'Explore the Upanishads, Adi Shankaracharya\'s teachings, and the core doctrine of Advaita Vedanta. Understand Brahman, Atman, Maya, and how non-duality dissolves suffering.',
    duration: '8 weeks',
    lessons: 24,
    students: '870+',
    price: '₹1,999',
    originalPrice: '₹3,499',
    level: 'Intermediate',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/25',
    badge: 'Philosophy',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    includes: ['10 principal Upanishads', 'Shankaracharya commentaries', 'Neti Neti meditation practice', 'Philosophical debate sessions', 'Reading list & resources'],
  },
  {
    icon: Heart,
    title: 'Bhakti Yoga & Devotion',
    subtitle: 'The Path of Love, Surrender & Grace',
    description: 'From Mirabai\'s songs to the Narada Bhakti Sutras — explore the nine forms of devotion. Learn how bhakti transforms emotional suffering into divine love and inner joy.',
    duration: '5 weeks',
    lessons: 15,
    students: '1.6k+',
    price: '₹1,299',
    originalPrice: '₹2,499',
    level: 'All Levels',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/25',
    badge: 'Heart-Centered',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    includes: ['9 forms of bhakti explained', 'Bhajan & kirtan practices', 'Stories of great bhaktas', 'Daily devotional rituals', 'Community prayer sessions'],
  },
  {
    icon: GraduationCap,
    title: 'Karma Yoga in Daily Life',
    subtitle: 'Act Without Attachment — The Science of Action',
    description: 'Practical application of Karma Yoga principles in work, family, and society. Learn how to perform your duties with full effort yet zero ego — and transform daily life into spiritual practice.',
    duration: '4 weeks',
    lessons: 12,
    students: '980+',
    price: '₹999',
    originalPrice: '₹1,999',
    level: 'Beginner',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    badge: 'Quick Start',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    includes: ['Nishkama karma framework', 'Workplace dharma practices', 'Family duty & boundaries', 'Weekly reflection exercises', 'Action journal templates'],
  },
];

export default function Courses() {
  const { user, authFetch } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollments, setEnrollments] = useState({});

  useEffect(() => {
    if (!user) return;
    const fetchEnrollments = async () => {
      try {
        const res = await authFetch('/courses/my-enrollments');
        const data = await res.json();
        if (data.success) {
          const enrollMap = {};
          data.data.forEach(e => {
            enrollMap[e.courseId] = e.status;
          });
          setEnrollments(enrollMap);
        }
      } catch (err) {
        // silent fail
      }
    };
    fetchEnrollments();
  }, [user, authFetch]);

  const handleEnroll = (course) => {
    const courseId = course.title.toLowerCase().replace(/\s+/g, '-');
    if (enrollments[courseId]) return; // Do nothing if already enrolled/pending
    setSelectedCourse(course);
  };

  return (
    <div className="min-h-screen py-20 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-cosmic-gradient pointer-events-none" />
      <div className="ambient-orb w-[40vw] h-[40vw] bg-gold-600/5 top-[-10%] left-[-10%]" />
      <div className="ambient-orb w-[50vw] h-[50vw] bg-indigo-600/4 bottom-[-20%] right-[-10%]" style={{ animationDelay: '-5s' }} />

      <div className="page-container relative">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs mb-4">
            <GraduationCap size={12} />
            Sacred Learning Paths
          </div>
          <h1 className="section-title mb-4">Spiritual Courses</h1>
          <p className="section-subtitle mx-auto">
            Structured journeys into ancient wisdom — taught simply, practiced daily,<br className="hidden sm:block" /> and designed for the modern seeker.
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-10">
            {[
              { value: '5', label: 'Courses' },
              { value: '7k+', label: 'Students Enrolled' },
              { value: '105', label: 'Total Lessons' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="font-serif text-2xl text-gold-400">{stat.value}</div>
                <div className="text-xs text-white/30 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Course Cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course, i) => {
            const courseId = course.title.toLowerCase().replace(/\s+/g, '-');
            const status = enrollments[courseId];

            return (
              <motion.div
                key={course.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                className={`glass-card border ${course.border} p-7 flex flex-col gap-5 hover:shadow-card transition-all duration-300 group relative overflow-hidden`}
              >
                {/* Top accent line */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${course.bg} to-transparent opacity-80`} />

                {/* Icon + Badge */}
                <div className="flex items-start justify-between">
                  <div className={`w-13 h-13 w-12 h-12 rounded-2xl ${course.bg} border ${course.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <course.icon size={22} className={course.color} />
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${course.badgeColor}`}>
                    {course.badge}
                  </span>
                </div>

                {/* Title + Description */}
                <div>
                  <h2 className={`font-serif text-2xl ${course.color} mb-1`}>{course.title}</h2>
                  <p className="text-xs text-white/40 font-medium uppercase tracking-widest mb-3">{course.subtitle}</p>
                  <p className="text-sm text-white/55 leading-relaxed">{course.description}</p>
                </div>

                {/* What's included */}
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-2">What's included</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {course.includes.map(item => (
                      <li key={item} className="flex items-center gap-2 text-xs text-white/50">
                        <CheckCircle size={12} className={course.color} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-4 text-xs text-white/40 border-t border-white/[0.06] pt-4">
                  <span className="flex items-center gap-1.5"><Clock size={12} className={course.color} />{course.duration}</span>
                  <span className="flex items-center gap-1.5"><BookOpen size={12} className={course.color} />{course.lessons} lessons</span>
                  <span className="flex items-center gap-1.5"><Users size={12} className={course.color} />{course.students} enrolled</span>
                  <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs ${course.bg} ${course.color} border ${course.border}`}>{course.level}</span>
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className={`font-serif text-3xl font-semibold ${course.color}`}>{course.price}</span>
                    <span className="text-sm text-white/25 line-through">{course.originalPrice}</span>
                    <span className="text-xs text-emerald-400 font-medium">
                      {Math.round((1 - parseInt(course.price.replace(/[^0-9]/g, '')) / parseInt(course.originalPrice.replace(/[^0-9]/g, ''))) * 100)}% off
                    </span>
                  </div>
                  
                  {status === 'confirmed' ? (
                    <Link
                      to={`/courses/${courseId}`}
                      id={`enroll-btn-${courseId}`}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-300 border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:scale-105 hover:shadow-lg cursor-pointer"
                    >
                      <CheckCircle size={14} /> Access Granted <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <button
                      id={`enroll-btn-${courseId}`}
                      onClick={() => handleEnroll(course)}
                      disabled={status === 'pending'}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-300 ${
                        status === 'pending' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' :
                        `${course.border} ${course.color} ${course.bg} hover:scale-105 hover:shadow-lg`
                      }`}
                    >
                      {status === 'pending' ? <><Clock size={14} /> Pending Approval</> :
                       !user ? <><Lock size={12} /> Enroll Now <ArrowRight size={14} /></> : 
                       <>Enroll Now <ArrowRight size={14} /></>}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Footer note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-14 py-8 border-t border-white/[0.06]"
        >
          <p className="text-white/30 text-sm">
            All courses include <span className="text-white/50">lifetime access</span> · <span className="text-white/50">Certificate of completion</span> · <span className="text-white/50">Community support</span>
          </p>
        </motion.div>
      </div>

      {/* ── Purchase Modal ── */}
      <AnimatePresence>
        {selectedCourse && (
          <CoursePurchaseModal
            course={selectedCourse}
            onClose={() => setSelectedCourse(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
