import { CreditCard, Download } from 'lucide-react';

export default function PaymentTracker() {
  const payments = [
    // Stub
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-white mb-1">Payment Tracker</h1>
          <p className="text-white/40 text-sm">Monitor revenue and purchase history.</p>
        </div>
        <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium px-4 py-2 rounded-xl transition-colors">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-12 text-center">
        <div className="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/30 mb-4">
          <CreditCard size={32} />
        </div>
        <h3 className="text-white font-medium text-lg mb-1">No payments yet</h3>
        <p className="text-white/40 text-sm">When users purchase courses, transactions will appear here.</p>
      </div>
    </div>
  );
}
