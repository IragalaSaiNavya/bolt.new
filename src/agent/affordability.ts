import type {
  FinancialRequest,
  FinancialProfile,
  PaymentOption,
  AgentDecision,
  PaymentPlanEntry,
  SpendingChange,
  AffordabilityStatus,
  PaymentMethod,
  PaymentMethodPreference,
} from './types';
import type { FinancialState } from './financialState';
import {
  forecastBalance,
  isForecastSafe,
  findMaxSafePayment,
  findEarliestFullPaymentDate,
} from './forecast';
import { addDays } from './financialState';

interface PlanCandidate {
  method: PaymentMethod;
  status: AffordabilityStatus;
  plan: PaymentPlanEntry[];
  earliestFullDate: string | null;
  spendingChanges: SpendingChange[];
  totalPaid: number;
  paymentOptionId: string | null;
  safe: boolean;
}

function formatPaymentPlan(plan: PaymentPlanEntry[]): string {
  if (plan.length === 0) return 'none';
  return plan.map(p => `${p.date}:${p.amount}`).join('|');
}

function formatSpendingChanges(changes: SpendingChange[]): string {
  if (changes.length === 0) return 'none';
  return changes.map(c => {
    if (c.type === 'stop') return `stop:${c.event_id}`;
    return `reduce_to:${c.event_id}:${c.new_amount}`;
  }).join('|');
}

function generateInstallmentPlan(option: PaymentOption): PaymentPlanEntry[] {
  const plan: PaymentPlanEntry[] = [];
  plan.push({ date: option.first_payment_date, amount: option.first_payment_amount });

  let currentDate = option.first_payment_date;
  for (let i = 1; i < option.number_of_payments; i++) {
    currentDate = addDays(currentDate, option.days_between_payments);
    plan.push({ date: currentDate, amount: option.recurring_payment_amount });
  }

  return plan;
}

function generatePartialPlan(
  requestDate: string,
  amountSafeToday: number,
  remainingAmount: number,
  earliestFullDate: string
): PaymentPlanEntry[] {
  return [
    { date: requestDate, amount: amountSafeToday },
    { date: earliestFullDate, amount: remainingAmount },
  ];
}

function checkPlanSafety(
  state: FinancialState,
  startDate: string,
  initialBalance: number,
  payments: PaymentPlanEntry[],
  skipFlexible: Set<string> = new Set(),
  reducedFlexible: Map<string, number> = new Map(),
  forecastDays: number = 90
): boolean {
  const result = forecastBalance(
    state,
    startDate,
    initialBalance,
    payments.map(p => ({ date: p.date, amount: p.amount })),
    skipFlexible,
    reducedFlexible,
    forecastDays
  );
  return isForecastSafe(result);
}

function trySpendingChanges(
  state: FinancialState,
  startDate: string,
  initialBalance: number,
  payments: PaymentPlanEntry[],
  deadline: string
): SpendingChange[] | null {
  const flexibleExpenses = state.recurringExpenses
    .filter(e => e.is_flexible)
    .sort((a, b) => b.home_currency_amount - a.home_currency_amount);

  if (flexibleExpenses.length === 0) return null;

  const baseSafe = checkPlanSafety(state, startDate, initialBalance, payments);
  if (baseSafe) return [];

  const skipSet = new Set<string>();
  const reduceMap = new Map<string, number>();

  for (const flex of flexibleExpenses) {
    skipSet.add(flex.event_id);
    if (checkPlanSafety(state, startDate, initialBalance, payments, skipSet, reduceMap)) {
      return [{ type: 'stop', event_id: flex.event_id }];
    }
  }

  skipSet.clear();
  for (const flex of flexibleExpenses) {
    const halfAmount = Math.floor(flex.home_currency_amount / 2);
    reduceMap.set(flex.event_id, halfAmount);
    if (checkPlanSafety(state, startDate, initialBalance, payments, skipSet, reduceMap)) {
      return [{ type: 'reduce_to', event_id: flex.event_id, new_amount: halfAmount }];
    }
  }

  skipSet.clear();
  reduceMap.clear();
  const changes: SpendingChange[] = [];

  for (const flex of flexibleExpenses) {
    if (changes.length >= 3) break;
    skipSet.add(flex.event_id);
    changes.push({ type: 'stop', event_id: flex.event_id });
    if (checkPlanSafety(state, startDate, initialBalance, payments, skipSet, reduceMap)) {
      return changes;
    }
  }

  return null;
}

function rankCandidates(candidates: PlanCandidate[], request: FinancialRequest): PlanCandidate[] {
  return candidates.sort((a, b) => {
    const aBeforeDeadline = a.earliestFullDate && a.earliestFullDate <= request.desired_completion_date ? 1 : 0;
    const bBeforeDeadline = b.earliestFullDate && b.earliestFullDate <= request.desired_completion_date ? 1 : 0;
    if (aBeforeDeadline !== bBeforeDeadline) return bBeforeDeadline - aBeforeDeadline;

    const aChanges = a.spendingChanges.length;
    const bChanges = b.spendingChanges.length;
    if (aChanges !== bChanges) return aChanges - bChanges;

    if (a.totalPaid !== b.totalPaid) return a.totalPaid - b.totalPaid;

    const aStartDate = a.plan[0]?.date ?? '9999-12-31';
    const bStartDate = b.plan[0]?.date ?? '9999-12-31';
    if (aStartDate !== bStartDate) return aStartDate.localeCompare(bStartDate);

    if (a.plan.length !== b.plan.length) return a.plan.length - b.plan.length;

    if (a.paymentOptionId && b.paymentOptionId) {
      return a.paymentOptionId.localeCompare(b.paymentOptionId);
    }

    return 0;
  });
}

export function analyzeRequest(
  request: FinancialRequest,
  state: FinancialState,
  paymentOptions: PaymentOption[]
): AgentDecision {
  const { profile } = state;
  const startDate = request.request_date;
  const initialBalance = profile.available_balance;
  const requestedAmount = request.requested_amount;
  const deadline = request.desired_completion_date;
  const considerMethods = profile.payment_methods_user_will_consider;

  const maxSafeToday = findMaxSafePayment(state, startDate, initialBalance, requestedAmount);
  const earliestFullDate = findEarliestFullPaymentDate(state, startDate, initialBalance, requestedAmount);

  const candidates: PlanCandidate[] = [];

  if (considerMethods.includes('full_payment')) {
    if (maxSafeToday >= requestedAmount) {
      candidates.push({
        method: 'full_payment',
        status: 'affordable_now',
        plan: [{ date: startDate, amount: requestedAmount }],
        earliestFullDate: startDate,
        spendingChanges: [],
        totalPaid: requestedAmount,
        paymentOptionId: null,
        safe: true,
      });
    }
  }

  if (considerMethods.includes('installments')) {
    const sortedOptions = [...paymentOptions].sort((a, b) =>
      a.payment_option_id.localeCompare(b.payment_option_id)
    );

    for (const option of sortedOptions) {
      if (option.payment_method !== 'installments') continue;
      const plan = generateInstallmentPlan(option);
      const lastPaymentDate = plan[plan.length - 1]?.date ?? startDate;
      const beforeDeadline = lastPaymentDate <= deadline;
      if (!beforeDeadline) continue;

      const safe = checkPlanSafety(state, startDate, initialBalance, plan);

      if (safe) {
        candidates.push({
          method: 'installments',
          status: 'affordable_with_plan',
          plan,
          earliestFullDate,
          spendingChanges: [],
          totalPaid: option.total_payable_amount,
          paymentOptionId: option.payment_option_id,
          safe: true,
        });
      } else {
        const changes = trySpendingChanges(state, startDate, initialBalance, plan, deadline);
        if (changes !== null) {
          const skipSet = new Set<string>();
          const reduceMap = new Map<string, number>();
          for (const c of changes) {
            if (c.type === 'stop') skipSet.add(c.event_id);
            else if (c.new_amount !== undefined) reduceMap.set(c.event_id, c.new_amount);
          }
          const safeWithChanges = checkPlanSafety(state, startDate, initialBalance, plan, skipSet, reduceMap);
          if (safeWithChanges) {
            candidates.push({
              method: 'installments',
              status: 'affordable_with_plan',
              plan,
              earliestFullDate,
              spendingChanges: changes,
              totalPaid: option.total_payable_amount,
              paymentOptionId: option.payment_option_id,
              safe: true,
            });
          }
        }
      }
    }
  }

  if (considerMethods.includes('partial_payment') && request.allows_partial_payment) {
    if (maxSafeToday > 0 && maxSafeToday < requestedAmount && earliestFullDate) {
      if (earliestFullDate <= deadline) {
        const remaining = requestedAmount - maxSafeToday;
        const plan = generatePartialPlan(startDate, maxSafeToday, remaining, earliestFullDate);
        const safe = checkPlanSafety(state, startDate, initialBalance, plan);
        if (safe) {
          candidates.push({
            method: 'partial_payment',
            status: 'affordable_with_plan',
            plan,
            earliestFullDate,
            spendingChanges: [],
            totalPaid: requestedAmount,
            paymentOptionId: null,
            safe: true,
          });
        }
      }
    }
  }

  if (considerMethods.includes('wait') && earliestFullDate) {
    const safe = checkPlanSafety(state, startDate, initialBalance, [
      { date: earliestFullDate, amount: requestedAmount },
    ]);
    if (safe) {
      candidates.push({
        method: 'wait',
        status: 'affordable_later',
        plan: [{ date: earliestFullDate, amount: requestedAmount }],
        earliestFullDate,
        spendingChanges: [],
        totalPaid: requestedAmount,
        paymentOptionId: null,
        safe: true,
      });
    }
  }

  if (candidates.length > 0) {
    const ranked = rankCandidates(candidates, request);
    const best = ranked[0];

    return {
      request_id: request.request_id,
      amount_safe_to_pay: Math.min(maxSafeToday, requestedAmount),
      affordability_status: best.status,
      recommended_payment_method: best.method,
      payment_plan: best.plan,
      earliest_date_for_full_payment: best.earliestFullDate,
      spending_changes_needed: best.spendingChanges,
      decision_explanation: buildExplanation(request, best, state, maxSafeToday, earliestFullDate),
    };
  }

  if (earliestFullDate && considerMethods.includes('wait') && earliestFullDate <= deadline) {
    return {
      request_id: request.request_id,
      amount_safe_to_pay: Math.min(maxSafeToday, requestedAmount),
      affordability_status: 'affordable_later',
      recommended_payment_method: 'wait',
      payment_plan: [{ date: earliestFullDate, amount: requestedAmount }],
      earliest_date_for_full_payment: earliestFullDate,
      spending_changes_needed: [],
      decision_explanation: buildExplanation(request, {
        method: 'wait',
        status: 'affordable_later',
        plan: [{ date: earliestFullDate, amount: requestedAmount }],
        earliestFullDate,
        spendingChanges: [],
        totalPaid: requestedAmount,
        paymentOptionId: null,
        safe: true,
      }, state, maxSafeToday, earliestFullDate),
    };
  }

  return {
    request_id: request.request_id,
    amount_safe_to_pay: Math.min(maxSafeToday, requestedAmount),
    affordability_status: 'not_affordable',
    recommended_payment_method: 'not_recommended',
    payment_plan: [],
    earliest_date_for_full_payment: null,
    spending_changes_needed: [],
    decision_explanation: buildNotAffordableExplanation(request, state, maxSafeToday, earliestFullDate),
  };
}

function buildExplanation(
  request: FinancialRequest,
  plan: PlanCandidate,
  state: FinancialState,
  maxSafeToday: number,
  earliestFullDate: string | null
): string {
  const parts: string[] = [];
  const profile = state.profile;

  parts.push(`User has ${profile.home_currency} ${profile.available_balance} available (min: ${profile.minimum_balance_to_keep}).`);
  parts.push(`Safe to pay today: ${maxSafeToday} of ${request.requested_amount}.`);

  switch (plan.method) {
    case 'full_payment':
      parts.push('Full payment is safe on the request date while maintaining minimum balance.');
      break;
    case 'partial_payment':
      parts.push(`Partial payment of ${plan.plan[0].amount} today, remainder of ${plan.plan[1].amount} on ${plan.plan[1].date}.`);
      break;
    case 'installments':
      parts.push(`Installment plan with ${plan.plan.length} payments starting ${plan.plan[0].date}.`);
      break;
    case 'wait':
      parts.push(`Waiting until ${plan.earliestFullDate} when full payment becomes safe.`);
      break;
    case 'not_recommended':
      parts.push('No safe payment option found within the forecast period.');
      break;
  }

  if (plan.spendingChanges.length > 0) {
    const changeStr = plan.spendingChanges.map(c => {
      if (c.type === 'stop') return `stop ${c.event_id}`;
      return `reduce ${c.event_id} to ${c.new_amount}`;
    }).join(', ');
    parts.push(`Spending changes needed: ${changeStr}.`);
  } else {
    parts.push('No spending changes needed.');
  }

  if (earliestFullDate) {
    parts.push(`Earliest full payment date: ${earliestFullDate}.`);
  }

  return parts.join(' ');
}

function buildNotAffordableExplanation(
  request: FinancialRequest,
  state: FinancialState,
  maxSafeToday: number,
  earliestFullDate: string | null
): string {
  const parts: string[] = [];
  parts.push(`User has ${state.profile.available_balance} ${state.profile.home_currency} (min: ${state.profile.minimum_balance_to_keep}).`);
  parts.push(`Safe to pay today: ${maxSafeToday} of ${request.requested_amount}.`);

  if (earliestFullDate) {
    parts.push(`Full payment possible on ${earliestFullDate}, but exceeds desired completion date ${request.desired_completion_date}.`);
  } else {
    parts.push('Full payment not safe within 90-day forecast.');
  }

  parts.push('No eligible safe plan found.');

  return parts.join(' ');
}

export { formatPaymentPlan, formatSpendingChanges };
export type { PlanCandidate };
