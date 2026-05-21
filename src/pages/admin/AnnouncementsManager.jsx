import { useState } from 'react';
import { Megaphone, Plus, Trash2, Edit3 } from 'lucide-react';

export default function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Summer Retreat 2026', type: 'banner', isActive: true, content: 'Join our exclusive 7-day silent retreat in the Himalayas.' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-white mb-1">Announcements</h1>
          <p className="text-white/40 text-sm">Manage top banners and popup notices.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded-xl transition-colors">
          <Plus size={18} /> New Notice
        </button>
      </div>

      <div className="grid gap-4">
        {announcements.map(item => (
          <div key={item.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-4">
            <div className={`p-3 rounded-xl ${item.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
              <Megaphone size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-medium text-lg">{item.title}</h3>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/60">{item.type}</span>
              </div>
              <p className="text-white/50 text-sm mb-3">{item.content}</p>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={item.isActive} readOnly className="rounded border-white/20 bg-transparent accent-indigo-500" />
                  <span className="text-xs text-white/60">Active on site</span>
                </label>
                <div className="h-4 w-px bg-white/10" />
                <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Edit3 size={12}/> Edit</button>
                <button className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><Trash2 size={12}/> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
