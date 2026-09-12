import type {
  FinancialProfile,
  FinancialEvent,
  ExchangeRate,
  Message,
  ImageRecord,
  Currency,
  EventStatus,
} from './types';

const CANCELLED_STATUSES: EventStatus[] = ['failed', 'cancelled'];

export interface ResolvedEvent {
  event_id: string;
  event_date: string;
  event_type: FinancialEvent['event_type'];
  amount: number;
  currency: Currency;
  description: string;
  recurring: boolean;
  recurring_frequency: FinancialEvent['recurring_frequency'];
  status: EventStatus;
  category: string;
  is_essential: boolean;
  is_flexible: boolean;
  linked_event_id: string | null;
  home_currency_amount: number;
  is_credit: boolean;
  is_recurring_income: boolean;
  is_recurring_expense: boolean;
  is_pending_credit: boolean;
  is_cancelled: boolean;
  is_investment: boolean;
  is_salary: boolean;
  next_occurrence_date: string | null;
}

export interface FinancialState {
  profile: FinancialProfile;
  events: ResolvedEvent[];
  activeEvents: ResolvedEvent[];
  recurringIncome: ResolvedEvent[];
  recurringExpenses: ResolvedEvent[];
  confirmedIncome: ResolvedEvent[];
  confirmedExpenses: ResolvedEvent[];
  pendingCredits: ResolvedEvent[];
  cancelledEvents: ResolvedEvent[];
  investments: ResolvedEvent[];
  nextSalary: ResolvedEvent | null;
  exchangeRates: ExchangeRate[];
  messages: Message[];
  images: ImageRecord[];
  amendments: Map<string, Message[]>;
  cancellations: Set<string>;
  imageAmounts: Map<string, number>;
}

function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: ExchangeRate[],
  rateDate: string
): number {
  if (fromCurrency === toCurrency) return amount;

  const direct = rates.find(
    r => r.from_currency === fromCurrency && r.to_currency === toCurrency && r.rate_date <= rateDate
  );
  if (direct) return amount * direct.rate;

  const reverse = rates.find(
    r => r.from_currency === toCurrency && r.to_currency === fromCurrency && r.rate_date <= rateDate
  );
  if (reverse && reverse.rate !== 0) return amount / reverse.rate;

  const fromUSD = rates.find(
    r => r.from_currency === 'USD' && r.to_currency === fromCurrency && r.rate_date <= rateDate
  );
  const toUSD = rates.find(
    r => r.from_currency === 'USD' && r.to_currency === toCurrency && r.rate_date <= rateDate
  );
  if (fromUSD && toUSD) {
    const usdAmount = amount / fromUSD.rate;
    return usdAmount * toUSD.rate;
  }

  return amount;
}

function resolveAmountFromImage(
  event: FinancialEvent,
  images: ImageRecord[]
): number | null {
  const matchingImage = images.find(img => img.related_event_id === event.event_id);
  if (matchingImage) {
    if (matchingImage.extracted_amount !== null && matchingImage.extracted_amount !== undefined) {
      return matchingImage.extracted_amount;
    }
  }
  return null;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function addYears(dateStr: string, years: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

export function nextOccurrence(eventDate: string, frequency: string, fromDate: string): string | null {
  if (!frequency || frequency === 'one_time') return null;
  let next = eventDate;
  while (next < fromDate) {
    switch (frequency) {
      case 'daily': next = addDays(next, 1); break;
      case 'weekly': next = addDays(next, 7); break;
      case 'monthly': next = addMonths(next, 1); break;
      case 'yearly': next = addYears(next, 1); break;
      default: return null;
    }
  }
  return next;
}

function processMessages(messages: Message[]): {
  amendments: Map<string, Message[]>;
  cancellations: Set<string>;
} {
  const amendments = new Map<string, Message[]>();
  const cancellations = new Set<string>();

  for (const msg of messages) {
    if (msg.message_type === 'cancellation' && msg.related_event_id) {
      cancellations.add(msg.related_event_id);
    }
    if (msg.related_event_id && (msg.message_type === 'amendment' || msg.message_type === 'clarification' || msg.message_type === 'confirmation')) {
      const existing = amendments.get(msg.related_event_id) ?? [];
      existing.push(msg);
      amendments.set(msg.related_event_id, existing);
    }
  }

  return { amendments, cancellations };
}

function deduplicateEvents(events: ResolvedEvent[]): ResolvedEvent[] {
  const seen = new Map<string, ResolvedEvent>();
  for (const ev of events) {
    const key = `${ev.event_id}`;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, ev);
    } else {
      if (ev.event_date > existing.event_date) {
        seen.set(key, ev);
      }
    }
  }
  return Array.from(seen.values());
}

export function buildFinancialState(
  profile: FinancialProfile,
  rawEvents: FinancialEvent[],
  exchangeRates: ExchangeRate[],
  messages: Message[],
  images: ImageRecord[],
  requestDate: string
): FinancialState {
  const { amendments, cancellations } = processMessages(messages);
  const imageAmounts = new Map<string, number>();

  for (const img of images) {
    if (img.related_event_id && img.extracted_amount !== null) {
      imageAmounts.set(img.related_event_id, img.extracted_amount);
    }
  }

  const resolved: ResolvedEvent[] = [];

  for (const ev of rawEvents) {
    if (ev.user_id !== profile.user_id) continue;

    let amount = ev.amount;
    if (amount === null || amount === undefined) {
      const imgAmount = resolveAmountFromImage(ev, images);
      if (imgAmount !== null) {
        amount = imgAmount;
      } else {
        continue;
      }
    }

    if (cancellations.has(ev.event_id)) continue;
    if (CANCELLED_STATUSES.includes(ev.status)) continue;

    const homeAmount = convertCurrency(
      amount,
      ev.currency,
      profile.home_currency,
      exchangeRates,
      ev.event_date
    );

    const isCredit =
      ev.event_type === 'income' || ev.event_type === 'refund' || ev.event_type === 'salary';
    const isRecurringIncome = ev.recurring && isCredit;
    const isRecurringExpense = ev.recurring && !isCredit && ev.event_type !== 'investment';
    const isPendingCredit = ev.status === 'pending' && isCredit;
    const isInvestment = ev.event_type === 'investment';
    const isSalary = ev.event_type === 'salary';

    const nextOcc = ev.recurring
      ? nextOccurrence(ev.event_date, ev.recurring_frequency ?? 'one_time', requestDate)
      : null;

    resolved.push({
      event_id: ev.event_id,
      event_date: ev.event_date,
      event_type: ev.event_type,
      amount,
      currency: ev.currency,
      description: ev.description,
      recurring: ev.recurring,
      recurring_frequency: ev.recurring_frequency,
      status: ev.status,
      category: ev.category,
      is_essential: ev.is_essential,
      is_flexible: ev.is_flexible,
      linked_event_id: ev.linked_event_id,
      home_currency_amount: homeAmount,
      is_credit: isCredit,
      is_recurring_income: isRecurringIncome,
      is_recurring_expense: isRecurringExpense,
      is_pending_credit: isPendingCredit,
      is_cancelled: false,
      is_investment: isInvestment,
      is_salary: isSalary,
      next_occurrence_date: nextOcc,
    });
  }

  const deduped = deduplicateEvents(resolved);

  const activeEvents = deduped.filter(e => !e.is_pending_credit && !e.is_investment);
  const recurringIncome = deduped.filter(e => e.is_recurring_income);
  const recurringExpenses = deduped.filter(e => e.is_recurring_expense);
  const confirmedIncome = deduped.filter(e => e.is_credit && !e.is_pending_credit && e.status !== 'forecast');
  const confirmedExpenses = deduped.filter(e => !e.is_credit && !e.is_investment && e.status !== 'forecast' && !e.is_pending_credit);
  const pendingCredits = deduped.filter(e => e.is_pending_credit);
  const cancelledEvents = deduped.filter(e => e.is_cancelled);
  const investments = deduped.filter(e => e.is_investment);

  const salaryEvents = deduped.filter(e => e.is_salary && e.status === 'confirmed');
  const nextSalary = salaryEvents.length > 0
    ? salaryEvents.sort((a, b) => a.event_date.localeCompare(b.event_date))[0]
    : null;

  return {
    profile,
    events: deduped,
    activeEvents,
    recurringIncome,
    recurringExpenses,
    confirmedIncome,
    confirmedExpenses,
    pendingCredits,
    cancelledEvents,
    investments,
    nextSalary,
    exchangeRates,
    messages,
    images,
    amendments,
    cancellations,
    imageAmounts,
  };
}

export { addDays, addMonths, addYears };
