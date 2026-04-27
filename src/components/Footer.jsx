import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-16 sm:mt-24 py-8 sm:py-12">
      <div className="page-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center text-cosmic-900 font-serif font-bold text-sm">
              ॐ
            </div>
            <div>
              <div className="font-serif text-lg text-gold-400">Dharma Setu</div>
              <div className="text-xs text-white/30">Ancient Wisdom · Modern Life</div>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-white/40">
            <Link to="/guidance" className="hover:text-gold-400 transition-colors">AI Guidance</Link>
            <Link to="/stories" className="hover:text-gold-400 transition-colors">Stories</Link>
            <Link to="/shloka" className="hover:text-gold-400 transition-colors">Shlokas</Link>
            <Link to="/journal" className="hover:text-gold-400 transition-colors">Journal</Link>
          </div>

          {/* Credit */}
          <div className="flex items-center gap-1.5 text-sm text-white/30">
            <span>Made with</span>
            <Heart size={12} className="text-gold-500 fill-gold-500" />
            <span>for seekers</span>
          </div>
        </div>

        {/* Sanskrit quote */}
        <div className="sacred-divider my-6 sm:my-8">
          <span className="font-serif text-gold-500/50 text-sm italic">सर्वे भवन्तु सुखिनः</span>
        </div>
        <p className="text-center text-xs text-white/20">
          May all beings be happy. May all beings be free from suffering.
        </p>
      </div>
    </footer>
  );
}
