import { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, DollarSign, User, Clock, FileText, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ProcessedRequest } from '@/agent/types';
import { StatusBadge, MethodBadge } from './StatusBadge';

function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = { USD: '$', EUR: '€', INR: '₹', ZAR: 'R', IDR: 'Rp' };
  const symbol = symbols[currency] ?? '';
  return `${symbol}${amount.toLocaleString()}`;
}

function ForecastChart({ request }: { request: ProcessedRequest }) {
  const forecast = request.forecast;
  if (!forecast || forecast.days.length === 0) return null;

  const balances = forecast.days.map(d => d.balance);
  const maxBalance = Math.max(...balances);
  const minBalance = Math.min(...balances, request.profile.minimum_balance_to_keep);
  const range = maxBalance - minBalance || 1;

  const width = 600;
  const height = 160;
  const padding = 10;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = balances.map((b, i) => {
    const x = padding + (i / (balances.length - 1)) * chartWidth;
    const y = padding + (1 - (b - minBalance) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const minLineY = padding + (1 - (request.profile.minimum_balance_to_keep - minBalance) / range) * chartHeight;

  return (
    <div className="mt-4 bg-slate-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-slate-600" />
        <span className="text-sm font-semibold text-slate-700">90-Day Balance Forecast</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: '200px' }}>
        <line
          x1={padding}
          y1={minLineY}
          x2={width - padding}
          y2={minLineY}
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.5"
        />
        <text x={padding} y={minLineY - 4} fontSize="10" fill="#ef4444" opacity="0.7">
          Min Balance: {formatCurrency(request.profile.minimum_balance_to_keep, request.profile.home_currency)}
        </text>
        <polyline
          points={points}
          fill="none"
          stroke={forecast.ever_below_minimum ? '#ef4444' : '#10b981'}
          strokeWidth="2"
        />
        <polyline
          points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
          fill={forecast.ever_below_minimum ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.05)'}
          stroke="none"
        />
      </svg>
      <div className="flex justify-between text-xs text-slate-500 mt-2">
        <span>Day 0: {formatCurrency(request.profile.available_balance, request.profile.home_currency)}</span>
        <span>Min: {formatCurrency(forecast.min_balance, request.profile.home_currency)}</span>
        <span>Day 90: {formatCurrency(balances[balances.length - 1], request.profile.home_currency)}</span>
      </div>
    </div>
  );
}

function RequestCard({ request, index }: { request: ProcessedRequest; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const { request: req, profile, decision, paymentOptions, messages } = request;
  const currency = profile.home_currency;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-6 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono text-slate-400">{req.request_id}</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium capitalize">
                {req.request_type.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">"{req.request_text}"</h3>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> {req.user_id}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> {formatCurrency(req.requested_amount, currency)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {req.request_date}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <StatusBadge status={decision.affordability_status} />
            <MethodBadge method={decision.recommended_payment_method} />
            {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-6 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">Amount Safe to Pay</div>
              <div className="text-lg font-bold text-slate-900">{formatCurrency(decision.amount_safe_to_pay, currency)}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">Requested Amount</div>
              <div className="text-lg font-bold text-slate-900">{formatCurrency(req.requested_amount, currency)}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">Earliest Full Payment</div>
              <div className="text-lg font-bold text-slate-900">{decision.earliest_date_for_full_payment || 'N/A'}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">Desired Completion</div>
              <div className="text-lg font-bold text-slate-900">{req.desired_completion_date}</div>
            </div>
          </div>

          {decision.payment_plan.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-semibold text-slate-700">Payment Plan</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {decision.payment_plan.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                    <span className="text-xs font-mono text-blue-700">{p.date}</span>
                    <span className="text-sm font-bold text-blue-900">{formatCurrency(p.amount, currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {decision.spending_changes_needed.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-slate-700">Spending Changes Needed</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {decision.spending_changes_needed.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2">
                    {c.type === 'stop' ? (
                      <>
                        <Minus className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs font-mono text-amber-700">stop:{c.event_id}</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs font-mono text-amber-700">reduce_to:{c.event_id}:{c.new_amount}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Decision Explanation</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4">
              {decision.decision_explanation}
            </p>
          </div>

          <ForecastChart request={request} />

          {paymentOptions.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-2">Available Payment Options</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
                      <th className="pb-2 pr-4">Option ID</th>
                      <th className="pb-2 pr-4">Method</th>
                      <th className="pb-2 pr-4">First Payment</th>
                      <th className="pb-2 pr-4"># Payments</th>
                      <th className="pb-2 pr-4">Total Payable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentOptions.map((opt, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-2 pr-4 font-mono text-xs">{opt.payment_option_id}</td>
                        <td className="py-2 pr-4">{opt.payment_method}</td>
                        <td className="py-2 pr-4">{formatCurrency(opt.first_payment_amount, currency)}</td>
                        <td className="py-2 pr-4">{opt.number_of_payments}</td>
                        <td className="py-2 pr-4">{formatCurrency(opt.total_payable_amount, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-2">Related Messages</div>
              <div className="space-y-2">
                {messages.map((msg, i) => (
                  <div key={i} className="bg-blue-50 rounded-lg p-3 text-sm">
                    <span className="text-xs font-mono text-blue-600 mr-2">{msg.message_type}</span>
                    <span className="text-slate-700">{msg.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RequestBrowser({ requests }: { requests: ProcessedRequest[] }) {
  return (
    <section id="requests" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium mb-4">
            <FileText className="w-3.5 h-3.5" />
            Live Decisions
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Request Decisions</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Each card shows a user's affordability question and the agent's personalized recommendation.
            Click to expand for the full analysis including the 90-day balance forecast.
          </p>
        </div>

        <div className="space-y-4">
          {requests.map((req, i) => (
            <RequestCard key={req.request.request_id} request={req} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
