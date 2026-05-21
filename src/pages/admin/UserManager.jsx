import { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function UserManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users] = useState([
    { id: '1', name: 'Seeker One', email: 'seeker@example.com', role: 'user', joined: '2026-05-20' },
  ]); // Stub data

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-white mb-1">User Management</h1>
          <p className="text-white/40 text-sm">View and manage registered users.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input 
            type="text" placeholder="Search by email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-cosmic-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-sm text-white/50">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-4 text-white font-medium">{u.name}</td>
                <td className="p-4 text-white/70 text-sm">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium ${u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-white/40'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 flex items-center justify-end gap-2">
                  <button className="text-xs text-white/40 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-1 transition-colors">
                    <ShieldCheck size={14}/> Grant Premium
                  </button>
                  <button className="text-xs text-red-400/60 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-400/10 flex items-center gap-1 transition-colors">
                    <ShieldAlert size={14}/> Ban
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
