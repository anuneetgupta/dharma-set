import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { LogOut, BookOpen, Clock, CheckCircle, XCircle, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ENROLLMENT_STATUS = {
  pending:   { label: 'Pending Verification', color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: Clock },
  confirmed: { label: 'Access Granted',       color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
  rejected:  { label: 'Payment Rejected',     color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     icon: XCircle },
};

export default function UserDashboard() {
  const { user, logout, authFetch } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchEnrollments = async () => {
      try {
        const res = await authFetch('/courses/my-enrollments');
        const data = await res.json();
        if (data.success) setEnrollments(data.data);
      } catch (_) {
        // silently ignore — user may have no enrollments
      } finally {
        setLoadingEnrollments(false);
      }
    };
    fetchEnrollments();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-cosmic-800/40 border border-white/10 rounded-3xl p-8 backdrop-blur-md mb-6"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-white mb-2">Welcome, {user.name} 🙏</h1>
            <p className="text-white/40">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 px-4 py-2 rounded-xl transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* My Journal quick link */}
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
              <BookOpen size={18} className="text-amber-400/70" /> My Journal
            </h3>
            <p className="text-white/50 text-sm mb-3">Write and view your personal spiritual reflections.</p>
            <Link
              to="/journal"
              className="inline-flex items-center gap-1.5 text-xs text-amber-400/70 hover:text-amber-400 transition-colors"
            >
              Open Journal <ArrowRight size={12} />
            </Link>
          </div>

          {/* Stats */}
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <GraduationCap size={18} className="text-amber-400/70" /> Enrollment Summary
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total', value: enrollments.length, color: 'text-white' },
                { label: 'Confirmed', value: enrollments.filter(e => e.status === 'confirmed').length, color: 'text-emerald-400' },
                { label: 'Pending', value: enrollments.filter(e => e.status === 'pending').length, color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className={`font-serif text-2xl font-semibold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-white/30 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* My Courses Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-cosmic-800/40 border border-white/10 rounded-3xl p-8 backdrop-blur-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif text-white flex items-center gap-2">
            <GraduationCap size={22} className="text-amber-400/70" /> My Courses
          </h2>
          <Link
            to="/courses"
            className="flex items-center gap-1.5 text-xs text-amber-400/70 hover:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full transition-all"
          >
            Browse Courses <ArrowRight size={11} />
          </Link>
        </div>

        {loadingEnrollments ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-white/30" />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={28} className="text-white/20" />
            </div>
            <p className="text-white/40 text-sm mb-4">You haven't enrolled in any courses yet.</p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-5 py-2.5 rounded-full hover:bg-amber-500/20 transition-all"
            >
              Explore Courses <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map((enrollment) => {
              const statusCfg = ENROLLMENT_STATUS[enrollment.status] || ENROLLMENT_STATUS.pending;
              const StatusIcon = statusCfg.icon;
              return (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between p-4 rounded-2xl border ${statusCfg.bg} ${statusCfg.border} transition-all`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5`}>
                      <GraduationCap size={18} className={statusCfg.color} />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{enrollment.courseTitle}</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        Enrolled on {new Date(enrollment.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className={`font-serif text-lg font-semibold ${statusCfg.color}`}>
                        ₹{parseFloat(enrollment.coursePrice || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.color} bg-white/5 border ${statusCfg.border}`}>
                      <StatusIcon size={11} /> {statusCfg.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info note for pending */}
        {enrollments.some(e => e.status === 'pending') && (
          <div className="mt-4 flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3 text-xs text-amber-300/80">
            <Clock size={14} className="flex-shrink-0 mt-0.5" />
            <span>
              Pending courses are awaiting payment verification by our team. You'll receive access once confirmed. This usually takes a few hours.
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
