import type { FinancialState, ResolvedEvent } from './financialState';
import type { ForecastDay, ForecastResult } from './types';
import { addDays, addMonths, nextOccurrence } from './financialState';

function generateRecurringDates(
  event: ResolvedEvent,
  startDate: string,
  endDate: string
): string[] {
  const dates: string[] = [];
  if (!event.recurring || !event.recurring_frequency || event.recurring_frequency === 'one_time') {
    if (event.event_date >= startDate && event.event_date <= endDate) {
      dates.push(event.event_date);
    }
    return dates;
  }

  let next = nextOccurrence(event.event_date, event.recurring_frequency, startDate);
  if (!next && event.event_date >= startDate && event.event_date <= endDate) {
    next = event.event_date;
  }

  let guard = 0;
  while (next && next <= endDate && guard < 500) {
    dates.push(next);
    switch (event.recurring_frequency) {
      case 'daily': next = addDays(next, 1); break;
      case 'weekly': next = addDays(next, 7); break;
      case 'monthly': next = addMonths(next, 1); break;
      case 'yearly':
        const d = new Date(next + 'T00:00:00');
        d.setFullYear(d.getFullYear() + 1);
        next = d.toISOString().slice(0, 10);
        break;
      default: next = null;
    }
    guard++;
  }

  return dates;
}

export function forecastBalance(
  state: FinancialState,
  startDate: string,
  initialBalance: number,
  extraPayments: { date: string; amount: number }[] = [],
  skipFlexibleEvents: Set<string> = new Set(),
  reducedFlexibleEvents: Map<string, number> = new Map(),
  forecastDays: number = 90
): ForecastResult {
  const { profile, activeEvents } = state;
  const endDate = addDays(startDate, forecastDays);
  const minBalance = profile.minimum_balance_to_keep;

  const dailyDeltas = new Map<string, number>();

  for (const ev of activeEvents) {
    if (ev.is_pending_credit) continue;
    if (ev.status === 'forecast') continue;

    if (skipFlexibleEvents.has(ev.event_id)) continue;

    let amount = ev.home_currency_amount;
    if (reducedFlexibleEvents.has(ev.event_id)) {
      amount = reducedFlexibleEvents.get(ev.event_id)!;
    }

    const delta = ev.is_credit ? amount : -amount;

    const dates = generateRecurringDates(ev, startDate, endDate);
    for (const date of dates) {
      dailyDeltas.set(date, (dailyDeltas.get(date) ?? 0) + delta);
    }
  }

  for (const payment of extraPayments) {
    if (payment.date >= startDate && payment.date <= endDate) {
      dailyDeltas.set(payment.date, (dailyDeltas.get(payment.date) ?? 0) - payment.amount);
    }
  }

  const days: ForecastDay[] = [];
  let balance = initialBalance;
  let minBalanceSeen = balance;
  let minBalanceDate = startDate;
  let everBelow = false;

  for (let i = 0; i <= forecastDays; i++) {
    const date = addDays(startDate, i);
    const delta = dailyDeltas.get(date) ?? 0;
    balance += delta;

    const below = balance < minBalance;
    if (below) everBelow = true;
    if (balance < minBalanceSeen) {
      minBalanceSeen = balance;
      minBalanceDate = date;
    }

    days.push({ date, balance, events: [], below_minimum: below });
  }

  return {
    days,
    min_balance: minBalanceSeen,
    min_balance_date: minBalanceDate,
    ever_below_minimum: everBelow,
  };
}

export function isForecastSafe(result: ForecastResult): boolean {
  return !result.ever_below_minimum;
}

export function findMaxSafePayment(
  state: FinancialState,
  startDate: string,
  initialBalance: number,
  cap: number,
  forecastDays: number = 90
): number {
  const test = (amount: number) => {
    const result = forecastBalance(
      state,
      startDate,
      initialBalance,
      [{ date: startDate, amount }],
      new Set(),
      new Map(),
      forecastDays
    );
    return isForecastSafe(result);
  };

  if (!test(0)) return 0;

  let low = 0;
  let high = cap;
  let best = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (test(mid)) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return best;
}

export function findEarliestFullPaymentDate(
  state: FinancialState,
  startDate: string,
  initialBalance: number,
  fullAmount: number,
  forecastDays: number = 90
): string | null {
  for (let i = 0; i <= forecastDays; i++) {
    const date = addDays(startDate, i);
    const result = forecastBalance(
      state,
      startDate,
      initialBalance,
      [{ date, amount: fullAmount }],
      new Set(),
      new Map(),
      forecastDays
    );
    if (isForecastSafe(result)) return date;
  }
  return null;
}
