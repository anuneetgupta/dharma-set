import { useState } from 'react';
import { Save, Settings } from 'lucide-react';

export default function SiteSettingsForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    logoUrl: '',
    whatsappNumber: '+91 98765 43210',
    instagramUrl: 'https://instagram.com/dharmasetu',
    contactEmail: 'support@dharmasetu.com',
  });

  const handleChange = (e) => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-serif text-white mb-1">Site Settings</h1>
        <p className="text-white/40 text-sm">Configure global website properties and contact info.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Settings size={18} className="text-gold-400" /> General Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">WhatsApp Number</label>
              <input 
                type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange}
                className="w-full bg-cosmic-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Support Email</label>
              <input 
                type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange}
                className="w-full bg-cosmic-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/70 mb-2">Instagram URL</label>
              <input 
                type="url" name="instagramUrl" value={formData.instagramUrl} onChange={handleChange}
                className="w-full bg-cosmic-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" disabled={loading}
            className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-cosmic-900 font-medium px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-cosmic-900/40 border-t-cosmic-900 rounded-full animate-spin" /> : <Save size={18} />}
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
