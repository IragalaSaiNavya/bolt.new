import type { AffordabilityStatus, PaymentMethod } from '@/agent/types';

const statusConfig: Record<AffordabilityStatus, { label: string; color: string; bg: string; dot: string }> = {
  affordable_now: { label: 'Affordable Now', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  affordable_with_plan: { label: 'Affordable with Plan', color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  affordable_later: { label: 'Affordable Later', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  not_affordable: { label: 'Not Affordable', color: 'text-rose-700', bg: 'bg-rose-50', dot: 'bg-rose-500' },
};

const methodConfig: Record<PaymentMethod, { label: string; color: string; bg: string }> = {
  full_payment: { label: 'Full Payment', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  partial_payment: { label: 'Partial Payment', color: 'text-amber-700', bg: 'bg-amber-100' },
  installments: { label: 'Installments', color: 'text-blue-700', bg: 'bg-blue-100' },
  wait: { label: 'Wait', color: 'text-slate-700', bg: 'bg-slate-100' },
  not_recommended: { label: 'Not Recommended', color: 'text-rose-700', bg: 'bg-rose-100' },
};

export function StatusBadge({ status }: { status: AffordabilityStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function MethodBadge({ method }: { method: PaymentMethod }) {
  const config = methodConfig[method];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
      {config.label}
    </span>
  );
}
