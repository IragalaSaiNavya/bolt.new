import type {
  FinancialRequest,
  FinancialProfile,
  FinancialEvent,
  ExchangeRate,
  PaymentOption,
  Message,
  ImageRecord,
  AgentDecision,
  ProcessedRequest,
} from './types';
import type { ParsedDataset } from './csvParser';
import { buildFinancialState } from './financialState';
import { analyzeRequest } from './affordability';
import { formatPaymentPlan, formatSpendingChanges } from './affordability';
import { forecastBalance } from './forecast';

export interface AgentRunResult {
  decisions: AgentDecision[];
  processedRequests: ProcessedRequest[];
  outputRows: Record<string, string | number | null>[];
}

export function runAgent(dataset: ParsedDataset): AgentRunResult {
  const decisions: AgentDecision[] = [];
  const processedRequests: ProcessedRequest[] = [];

  const profilesByUser = new Map<string, FinancialProfile>();
  for (const p of dataset.profiles) profilesByUser.set(p.user_id, p);

  const eventsByUser = new Map<string, FinancialEvent[]>();
  for (const e of dataset.events) {
    const arr = eventsByUser.get(e.user_id) ?? [];
    arr.push(e);
    eventsByUser.set(e.user_id, arr);
  }

  const optionsByRequest = new Map<string, PaymentOption[]>();
  for (const o of dataset.paymentOptions) {
    const arr = optionsByRequest.get(o.request_id) ?? [];
    arr.push(o);
    optionsByRequest.set(o.request_id, arr);
  }

  const messagesByUser = new Map<string, Message[]>();
  for (const m of dataset.messages) {
    const arr = messagesByUser.get(m.user_id) ?? [];
    arr.push(m);
    messagesByUser.set(m.user_id, arr);
  }

  const imagesByUser = new Map<string, ImageRecord[]>();
  for (const img of dataset.images) {
    const arr = imagesByUser.get(img.user_id) ?? [];
    arr.push(img);
    imagesByUser.set(img.user_id, arr);
  }

  for (const request of dataset.requests) {
    const profile = profilesByUser.get(request.user_id);
    if (!profile) {
      decisions.push({
        request_id: request.request_id,
        amount_safe_to_pay: 0,
        affordability_status: 'not_affordable',
        recommended_payment_method: 'not_recommended',
        payment_plan: [],
        earliest_date_for_full_payment: null,
        spending_changes_needed: [],
        decision_explanation: 'No financial profile found for user.',
      });
      continue;
    }

    const userEvents = eventsByUser.get(request.user_id) ?? [];
    const userMessages = messagesByUser.get(request.user_id) ?? [];
    const userImages = imagesByUser.get(request.user_id) ?? [];
    const requestOptions = optionsByRequest.get(request.request_id) ?? [];

    const state = buildFinancialState(
      profile,
      userEvents,
      dataset.exchangeRates,
      userMessages,
      userImages,
      request.request_date
    );

    const decision = analyzeRequest(request, state, requestOptions);

    const forecast = forecastBalance(state, request.request_date, profile.available_balance);

    decisions.push(decision);
    processedRequests.push({
      request,
      profile,
      events: userEvents,
      paymentOptions: requestOptions,
      messages: userMessages,
      images: userImages,
      decision,
      forecast,
    });
  }

  const outputRows = decisions.map(d => ({
    request_id: d.request_id,
    amount_safe_to_pay: d.amount_safe_to_pay,
    affordability_status: d.affordability_status,
    recommended_payment_method: d.recommended_payment_method,
    payment_plan: formatPaymentPlan(d.payment_plan),
    earliest_date_for_full_payment: d.earliest_date_for_full_payment ?? '',
    spending_changes_needed: d.spending_changes_needed.length > 0
      ? formatSpendingChanges(d.spending_changes_needed)
      : 'none',
    decision_explanation: d.decision_explanation,
  }));

  return { decisions, processedRequests, outputRows };
}
