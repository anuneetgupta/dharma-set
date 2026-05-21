import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function UserDashboard() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <div className="bg-cosmic-800/40 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-white mb-2">Welcome, {user.name}</h1>
            <p className="text-white/40">This is your personal dashboard.</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 px-4 py-2 rounded-xl transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <h3 className="text-lg font-medium text-white mb-2">My Courses</h3>
            <p className="text-white/50 text-sm">You haven't enrolled in any courses yet.</p>
          </div>
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <h3 className="text-lg font-medium text-white mb-2">My Journal</h3>
            <p className="text-white/50 text-sm">View and write your personal reflections.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
