import { useState } from 'react';
import { Table, Download, Copy, Check, BarChart3 } from 'lucide-react';
import type { AgentData } from '@/hooks/useAgentData';
import { toCSV } from '@/agent/csvParser';

const OUTPUT_HEADERS = [
  'request_id',
  'amount_safe_to_pay',
  'affordability_status',
  'recommended_payment_method',
  'payment_plan',
  'earliest_date_for_full_payment',
  'spending_changes_needed',
  'decision_explanation',
];

export function OutputTable({ data }: { data: AgentData }) {
  const [copied, setCopied] = useState(false);

  const csvText = toCSV(data.outputRows, OUTPUT_HEADERS);

  const handleCopy = () => {
    navigator.clipboard.writeText(csvText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([csvText], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusCounts = data.decisions.reduce((acc, d) => {
    acc[d.affordability_status] = (acc[d.affordability_status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const methodCounts = data.decisions.reduce((acc, d) => {
    acc[d.recommended_payment_method] = (acc[d.recommended_payment_method] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <section id="output" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium mb-4">
            <Table className="w-3.5 h-3.5" />
            Output & Evaluation
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Generated Output</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            The agent produces one output row per request with all 8 required columns, ready for submission as output.csv.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(statusCounts).map(([status, count]) => {
            const colors: Record<string, string> = {
              affordable_now: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              affordable_with_plan: 'bg-amber-50 text-amber-700 border-amber-200',
              affordable_later: 'bg-blue-50 text-blue-700 border-blue-200',
              not_affordable: 'bg-rose-50 text-rose-700 border-rose-200',
            };
            return (
              <div key={status} className={`rounded-xl p-4 border ${colors[status] ?? 'bg-slate-50 border-slate-200'}`}>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs font-medium capitalize mt-1">{status.replace(/_/g, ' ')}</div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">output.csv — {data.outputRows.length} rows</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy CSV'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs text-slate-500 border-b border-slate-200">
                  {OUTPUT_HEADERS.map(h => (
                    <th key={h} className="px-3 py-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.outputRows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3 font-mono text-xs text-slate-700">{row.request_id}</td>
                    <td className="px-3 py-3 font-semibold text-slate-900">{String(row.amount_safe_to_pay)}</td>
                    <td className="px-3 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {String(row.affordability_status)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{String(row.recommended_payment_method)}</td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-600 max-w-xs truncate">
                      {String(row.payment_plan)}
                    </td>
                    <td className="px-3 py-3 text-slate-700">{String(row.earliest_date_for_full_payment)}</td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-600 max-w-xs truncate">
                      {String(row.spending_changes_needed)}
                    </td>
                    <td className="px-3 py-3 text-slate-600 max-w-md truncate text-xs">
                      {String(row.decision_explanation)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Payment Method Distribution</h3>
            <div className="space-y-3">
              {Object.entries(methodCounts).map(([method, count]) => {
                const pct = (count / data.decisions.length) * 100;
                const colors: Record<string, string> = {
                  full_payment: 'bg-emerald-500',
                  partial_payment: 'bg-amber-500',
                  installments: 'bg-blue-500',
                  wait: 'bg-slate-400',
                  not_recommended: 'bg-rose-500',
                };
                return (
                  <div key={method}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span className="capitalize">{method.replace(/_/g, ' ')}</span>
                      <span>{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[method] ?? 'bg-slate-400'} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Submission Requirements</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span><strong>code.zip</strong> — Full runnable solution with evaluation/ folder</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span><strong>output.csv</strong> — Predictions for every row in requests.csv</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span><strong>chat_transcript</strong> — Development conversation transcript</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span><strong>evaluation/usage_report.md</strong> — Token usage and cost analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
