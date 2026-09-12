import { ShieldCheck, Brain, TrendingUp, AlertTriangle, Upload } from 'lucide-react';

export function Hero({ onNavigate }: { onNavigate: (section: string) => void }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl tracking-tight">Buy or Wait?</h1>
            <p className="text-slate-400 text-sm">AI-Powered Financial Affordability Agent</p>
          </div>
        </div>

        <div className="max-w-3xl">
          <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
            Can I safely afford<br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              this expense?
            </span>
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-2xl">
            An AI agent that analyzes your full financial picture — recurring expenses, pending payments,
            confirmed income, payment options, and message context — to recommend whether to pay in full,
            use installments, wait, or not proceed.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('upload')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <Upload className="w-4 h-4" />
              Upload Your Dataset
            </button>
            <button
              onClick={() => onNavigate('requests')}
              className="px-6 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
            >
              View Live Decisions
            </button>
            <button
              onClick={() => onNavigate('architecture')}
              className="px-6 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
            >
              How It Works
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {[
            { icon: Brain, label: 'Multi-Source Analysis', value: '7 data files', color: 'text-blue-400' },
            { icon: TrendingUp, label: '90-Day Forecast', value: 'Balance projection', color: 'text-emerald-400' },
            { icon: ShieldCheck, label: 'Safety First', value: 'Min balance enforced', color: 'text-cyan-400' },
            { icon: AlertTriangle, label: '5 Decision Types', value: 'Full / Partial / Install / Wait / No', color: 'text-amber-400' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10">
              <item.icon className={`w-6 h-6 ${item.color} mb-3`} />
              <div className="text-white font-semibold text-sm">{item.label}</div>
              <div className="text-slate-400 text-xs mt-1">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
