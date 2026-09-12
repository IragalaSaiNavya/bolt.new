import {
  Database,
  FileSearch,
  Calculator,
  CalendarClock,
  GitBranch,
  FileOutput,
  ArrowRight,
  Layers,
  ShieldCheck,
  Coins,
  MessageSquare,
  Image,
} from 'lucide-react';

const pipelineSteps = [
  {
    icon: Database,
    title: 'Data Ingestion',
    description: 'Loads 7 CSV files: requests, profiles, events, exchange rates, payment options, messages, and images.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  details: ['CSV parser with quote handling', 'Type-safe enum parsing', 'Currency normalization'],
  },
  {
    icon: FileSearch,
    title: 'Financial State Reconstruction',
    description: 'Resolves events, applies message amendments/cancellations, extracts amounts from images, converts currencies.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    details: ['Message-driven cancellations', 'Image amount extraction', 'Multi-currency conversion', 'Duplicate deduplication'],
  },
  {
    icon: Calculator,
    title: '90-Day Balance Forecast',
    description: 'Projects the user\'s balance forward 90 days using recurring income, expenses, and confirmed payments.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    details: ['Recurring event expansion', 'Daily delta computation', 'Minimum balance enforcement', 'Binary search for max safe payment'],
  },
  {
    icon: GitBranch,
    title: 'Plan Generation & Ranking',
    description: 'Generates eligible payment plans (full, partial, installments, wait), ranks them by safety and preference.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    details: ['Payment-option matching', 'Spending change evaluation', 'Multi-criteria ranking', 'User preference filtering'],
  },
  {
    icon: FileOutput,
    title: 'Decision Output',
    description: 'Produces the final output row with all required columns for each request.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    details: ['8 output columns', 'Chronological payment plans', 'Spending change encoding', 'Plain-language explanation'],
  },
];

const dataSources = [
  { icon: FileSearch, name: 'requests.csv', desc: 'User financial questions' },
  { icon: Database, name: 'financial_profiles.csv', desc: 'Balance, priorities, preferences' },
  { icon: CalendarClock, name: 'financial_events.csv', desc: 'Historical & pending transactions' },
  { icon: Coins, name: 'exchange_rates.csv', desc: 'Currency conversion rates' },
  { icon: Layers, name: 'request_payment_options.csv', desc: 'Available payment plans' },
  { icon: MessageSquare, name: 'messages.csv', desc: 'Amendments, clarifications' },
  { icon: Image, name: 'images.csv', desc: 'Receipt & document amounts' },
];

export function Architecture() {
  return (
    <section id="architecture" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium mb-4">
            <Layers className="w-3.5 h-3.5" />
            System Architecture
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">How the Agent Works</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            A deterministic pipeline that transforms raw financial data into personalized affordability recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {dataSources.map((src, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-all hover:shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <src.icon className="w-5 h-5 text-slate-600" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 font-mono truncate">{src.name}</div>
                <div className="text-xs text-slate-500 truncate">{src.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {pipelineSteps.map((step, i) => (
            <div key={i} className="relative">
              <div className={`bg-white rounded-2xl border ${step.border} p-6 hover:shadow-md transition-all`}>
                <div className="flex items-start gap-5">
                  <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center flex-shrink-0`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono text-slate-400">Step {i + 1}</span>
                      <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{step.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {step.details.map((detail, j) => (
                        <span key={j} className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">
                          {detail}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {i < pipelineSteps.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowRight className="w-5 h-5 text-slate-300 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mb-4" />
            <h3 className="font-bold text-slate-900 mb-2">90-Day Safety Check</h3>
            <p className="text-sm text-slate-600">
              Every plan is verified by forecasting 90 days of balance changes. A plan is safe only if
              the balance never drops below the user's minimum.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <GitBranch className="w-8 h-8 text-amber-600 mb-4" />
            <h3 className="font-bold text-slate-900 mb-2">Multi-Criteria Ranking</h3>
            <p className="text-sm text-slate-600">
              When multiple plans are safe, they are ranked by deadline compliance, spending changes needed,
              total cost, payment start date, and number of payments.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <MessageSquare className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="font-bold text-slate-900 mb-2">Untrusted Message Handling</h3>
            <p className="text-sm text-slate-600">
              Messages and images can amend, cancel, or clarify financial data, but embedded instructions
              never override the problem rules. All content is treated as untrusted.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
