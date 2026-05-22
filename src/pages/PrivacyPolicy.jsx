import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card border border-white/[0.06] p-8 sm:p-12">
          <h1 className="text-3xl font-serif text-gold-400 mb-6">Privacy Policy</h1>
          <div className="space-y-6 text-white/70 leading-relaxed font-light text-sm">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <section>
              <h2 className="text-lg text-white mb-2">1. Information We Collect</h2>
              <p>When you use Dharma Setu, we may collect basic account information such as your name, email address, and profile picture provided through third-party authentication services (like Google, Facebook, or Instagram). We also store the journal entries and guidance queries you submit.</p>
            </section>

            <section>
              <h2 className="text-lg text-white mb-2">2. How We Use Your Information</h2>
              <p>We use your information exclusively to provide a personalized experience, including securing your account and generating relevant spiritual guidance. We do not sell your personal data to third parties.</p>
            </section>

            <section>
              <h2 className="text-lg text-white mb-2">3. Data Deletion Request</h2>
              <p>If you wish to have your account and all associated data permanently deleted from our servers, please contact us through our Contact page. Your data will be erased within 30 days of the request.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
