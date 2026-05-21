import { useState, useEffect } from 'react';
import { Users, BookOpen, CreditCard, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await authFetch('/admin/overview');
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [authFetch]);

  if (loading) {
    return <div className="text-white/50 animate-pulse">Loading dashboard...</div>;
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Courses', value: stats?.totalCourses || 0, icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Total Revenue', value: `$${stats?.totalRevenue || 0}`, icon: CreditCard, color: 'text-gold-400', bg: 'bg-gold-500/10' },
    { label: 'Active Sessions', value: '12', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' }, // Dummy active sessions
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-white mb-2">Admin Overview</h1>
        <p className="text-white/40 text-sm">Welcome back. Here is what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <h3 className="text-white/50 text-sm font-medium mb-1">{stat.label}</h3>
            <p className="text-3xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
          <h3 className="text-lg font-medium text-white mb-6">Recent Users</h3>
          <div className="space-y-4">
            {stats?.recentUsers?.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{user.name}</p>
                    <p className="text-white/40 text-xs">{user.email}</p>
                  </div>
                </div>
                <span className="text-xs text-white/30">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
          <h3 className="text-lg font-medium text-white mb-6">Recent Activity</h3>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            {/* Dummy activity stream for visual completeness */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-cosmic-800 text-gold-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                <BookOpen size={16} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/10 bg-white/[0.02] shadow">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white text-sm font-bold">Course Published</h4>
                  <time className="text-xs text-white/40">1hr ago</time>
                </div>
                <div className="text-xs text-white/60">"Introduction to Bhagavad Gita" is now live.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
