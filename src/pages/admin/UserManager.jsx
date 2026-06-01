import { useState, useEffect } from 'react';
import { Search, ShieldAlert, ShieldCheck, Users, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UserManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { authFetch } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      // authFetch returns a Response object — must call .json()
      // URL is relative to API_BASE (already includes /api), so use /admin/users NOT /api/admin/users
      const response = await authFetch('/admin/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.message || 'Failed to load users.');
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [authFetch]);

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-white mb-1 flex items-center gap-3">
            <Users size={26} className="text-indigo-400" />
            User Management
            {!loading && users.length > 0 && (
              <span className="text-sm font-sans font-normal text-white/30 bg-white/[0.05] border border-white/10 rounded-full px-3 py-0.5">
                {users.length} registered
              </span>
            )}
          </h1>
          <p className="text-white/40 text-sm">View and manage all registered users.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 w-full sm:w-72 placeholder-white/25 transition-all"
            />
          </div>
          <button
            onClick={fetchUsers}
            title="Refresh"
            className="p-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-sm text-white/50">
              <th className="p-4 font-medium">#</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="border-b border-white/5">
                  <td colSpan={6} className="p-4">
                    <div className="h-5 bg-white/[0.04] rounded-lg animate-pulse" />
                  </td>
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-white/30">
                  <Users size={32} className="mx-auto mb-3 opacity-30" />
                  <p>{searchTerm ? `No users matching "${searchTerm}"` : 'No users found.'}</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((u, idx) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-white/30 text-sm">{idx + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className="text-white font-medium text-sm">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-white/60 text-sm">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium ${
                      u.role === 'admin'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'bg-white/5 text-white/40 border border-white/10'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-white/30 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button className="text-xs text-white/40 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-1 transition-colors">
                      <ShieldCheck size={14} /> Grant Premium
                    </button>
                    <button className="text-xs text-red-400/60 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-400/10 flex items-center gap-1 transition-colors">
                      <ShieldAlert size={14} /> Ban
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

