import type {
  FinancialRequest,
  FinancialProfile,
  FinancialEvent,
  ExchangeRate,
  PaymentOption,
  Message,
  ImageRecord,
  Currency,
  EventType,
  EventStatus,
  PaymentMethodPreference,
} from './types';

function parseNumber(val: string | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  const trimmed = val.trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'nan') return null;
  const num = Number(trimmed);
  return isNaN(num) ? null : num;
}

function parseBoolean(val: string | null | undefined): boolean {
  if (val === null || val === undefined) return false;
  const trimmed = val.trim().toLowerCase();
  return trimmed === 'true' || trimmed === '1' || trimmed === 'yes' || trimmed === 't';
}

function parseString(val: string | null | undefined): string {
  if (val === null || val === undefined) return '';
  return val.trim();
}

function parseStringArray(val: string | null | undefined): string[] {
  if (!val) return [];
  return val.split('|').map(s => s.trim()).filter(s => s.length > 0);
}

function parseEnumArray<T extends string>(val: string | null | undefined, allowed: T[]): T[] {
  const raw = parseStringArray(val);
  return raw.filter((r): r is T => (allowed as string[]).includes(r));
}

const CURRENCIES: Currency[] = ['INR', 'ZAR', 'IDR', 'USD', 'EUR'];
const EVENT_TYPES: EventType[] = ['income', 'expense', 'transfer', 'refund', 'investment', 'purchase', 'payment', 'salary', 'other'];
const EVENT_STATUSES: EventStatus[] = ['confirmed', 'pending', 'failed', 'cancelled', 'settled', 'forecast'];
const PAYMENT_PREFS: PaymentMethodPreference[] = ['full_payment', 'partial_payment', 'installments', 'wait'];

export interface ParsedDataset {
  requests: FinancialRequest[];
  profiles: FinancialProfile[];
  events: FinancialEvent[];
  exchangeRates: ExchangeRate[];
  paymentOptions: PaymentOption[];
  messages: Message[];
  images: ImageRecord[];
}

export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? '';
    }
    rows.push(row);
  }
  return rows;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function parseRequestsCSV(text: string): FinancialRequest[] {
  const rows = parseCSV(text);
  return rows.map(r => ({
    request_id: parseString(r.request_id),
    user_id: parseString(r.user_id),
    request_date: parseString(r.request_date),
    request_type: parseString(r.request_type) as FinancialRequest['request_type'],
    requested_amount: parseNumber(r.requested_amount) ?? 0,
    desired_completion_date: parseString(r.desired_completion_date),
    allows_partial_payment: parseBoolean(r.allows_partial_payment),
    request_text: parseString(r.request_text),
  }));
}

export function parseProfilesCSV(text: string): FinancialProfile[] {
  const rows = parseCSV(text);
  return rows.map(r => ({
    user_id: parseString(r.user_id),
    home_currency: (CURRENCIES.includes(parseString(r.home_currency) as Currency) ? parseString(r.home_currency) : 'USD') as Currency,
    available_balance: parseNumber(r.available_balance) ?? 0,
    minimum_balance_to_keep: parseNumber(r.minimum_balance_to_keep) ?? 0,
    financial_priorities: parseStringArray(r.financial_priorities),
    spending_preferences: parseString(r.spending_preferences),
    payment_methods_user_will_consider: parseEnumArray(r.payment_methods_user_will_consider, PAYMENT_PREFS),
  }));
}

export function parseEventsCSV(text: string): FinancialEvent[] {
  const rows = parseCSV(text);
  return rows.map(r => ({
    event_id: parseString(r.event_id),
    user_id: parseString(r.user_id),
    event_date: parseString(r.event_date),
    event_type: (EVENT_TYPES.includes(parseString(r.event_type) as EventType) ? parseString(r.event_type) : 'other') as EventType,
    amount: parseNumber(r.amount),
    currency: (CURRENCIES.includes(parseString(r.currency) as Currency) ? parseString(r.currency) : 'USD') as Currency,
    description: parseString(r.description),
    recurring: parseBoolean(r.recurring),
    recurring_frequency: parseString(r.recurring_frequency) as FinancialEvent['recurring_frequency'],
    status: (EVENT_STATUSES.includes(parseString(r.status) as EventStatus) ? parseString(r.status) : 'confirmed') as EventStatus,
    category: parseString(r.category),
    linked_event_id: parseString(r.linked_event_id) || null,
    is_essential: parseBoolean(r.is_essential),
    is_flexible: parseBoolean(r.is_flexible),
  }));
}

export function parseExchangeRatesCSV(text: string): ExchangeRate[] {
  const rows = parseCSV(text);
  return rows.map(r => ({
    rate_date: parseString(r.rate_date),
    from_currency: parseString(r.from_currency) as Currency,
    to_currency: parseString(r.to_currency) as Currency,
    rate: parseNumber(r.rate) ?? 1,
  }));
}

export function parsePaymentOptionsCSV(text: string): PaymentOption[] {
  const rows = parseCSV(text);
  return rows.map(r => ({
    request_id: parseString(r.request_id),
    payment_option_id: parseString(r.payment_option_id),
    payment_method: parseString(r.payment_method) as PaymentOption['payment_method'],
    first_payment_date: parseString(r.first_payment_date),
    first_payment_amount: parseNumber(r.first_payment_amount) ?? 0,
    recurring_payment_amount: parseNumber(r.recurring_payment_amount) ?? 0,
    days_between_payments: parseNumber(r.days_between_payments) ?? 0,
    number_of_payments: parseNumber(r.number_of_payments) ?? 1,
    financing_fee: parseNumber(r.financing_fee) ?? 0,
    total_payable_amount: parseNumber(r.total_payable_amount) ?? 0,
  }));
}

export function parseMessagesCSV(text: string): Message[] {
  const rows = parseCSV(text);
  return rows.map(r => ({
    message_id: parseString(r.message_id),
    user_id: parseString(r.user_id),
    request_id: parseString(r.request_id) || null,
    related_event_id: parseString(r.related_event_id) || null,
    message_date: parseString(r.message_date),
    message_type: parseString(r.message_type) as Message['message_type'],
    content: parseString(r.content),
  }));
}

export function parseImagesCSV(text: string): ImageRecord[] {
  const rows = parseCSV(text);
  return rows.map(r => ({
    image_id: parseString(r.image_id),
    user_id: parseString(r.user_id),
    request_id: parseString(r.request_id) || null,
    related_event_id: parseString(r.related_event_id) || null,
    description: parseString(r.description),
    extracted_amount: parseNumber(r.extracted_amount),
    extracted_text: parseString(r.extracted_text) || null,
  }));
}

export function toCSV(rows: Record<string, string | number | null>[], headers: string[]): string {
  const headerLine = headers.join(',');
  const dataLines = rows.map(row =>
    headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  );
  return [headerLine, ...dataLines].join('\n');
}
