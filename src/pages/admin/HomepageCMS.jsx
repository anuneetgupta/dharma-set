import { useState } from 'react';
import { Save, Image as ImageIcon } from 'lucide-react';

export default function HomepageCMS() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    heroTitle: 'Ancient Wisdom for Modern Minds',
    heroSubtitle: 'Discover the timeless teachings of the Bhagavad Gita.',
    featuredCourseId: '',
    footerText: '© 2026 Dharma Setu. All rights reserved.'
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
        <h1 className="text-3xl font-serif text-white mb-1">Homepage CMS</h1>
        <p className="text-white/40 text-sm">Update the content on your main landing page without touching code.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Hero Section */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <ImageIcon size={18} className="text-gold-400" /> Hero Section
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Main Headline</label>
            <input 
              type="text" name="heroTitle" value={formData.heroTitle} onChange={handleChange}
              className="w-full bg-cosmic-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Subtitle</label>
            <textarea 
              name="heroSubtitle" value={formData.heroSubtitle} onChange={handleChange} rows={3}
              className="w-full bg-cosmic-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 resize-y"
            />
          </div>
        </div>

        {/* Global Footer */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-medium text-white">Global Footer</h2>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Copyright Text</label>
            <input 
              type="text" name="footerText" value={formData.footerText} onChange={handleChange}
              className="w-full bg-cosmic-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500/50"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" disabled={loading}
            className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-cosmic-900 font-medium px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-cosmic-900/40 border-t-cosmic-900 rounded-full animate-spin" /> : <Save size={18} />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
