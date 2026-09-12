import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Buy or Wait?</div>
              <div className="text-slate-400 text-xs">AI-Powered Financial Affordability Agent</div>
            </div>
          </div>
          <div className="text-slate-400 text-sm text-center md:text-right">
            Deterministic 90-day safety forecast · Multi-currency support · Untrusted message handling
          </div>
        </div>
      </div>
    </footer>
  );
}
