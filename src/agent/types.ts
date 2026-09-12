export type Currency = 'INR' | 'ZAR' | 'IDR' | 'USD' | 'EUR';

export type RequestType =
  | 'purchase'
  | 'travel'
  | 'education'
  | 'family_transfer'
  | 'debt_repayment'
  | 'investment'
  | 'housing'
  | 'emergency_expense'
  | 'other';

export type AffordabilityStatus =
  | 'affordable_now'
  | 'affordable_with_plan'
  | 'affordable_later'
  | 'not_affordable';

export type PaymentMethod =
  | 'full_payment'
  | 'partial_payment'
  | 'installments'
  | 'wait'
  | 'not_recommended';

export type PaymentMethodPreference =
  | 'full_payment'
  | 'partial_payment'
  | 'installments'
  | 'wait';

export interface FinancialRequest {
  request_id: string;
  user_id: string;
  request_date: string;
  request_type: RequestType;
  requested_amount: number;
  desired_completion_date: string;
  allows_partial_payment: boolean;
  request_text: string;
}

export interface FinancialProfile {
  user_id: string;
  home_currency: Currency;
  available_balance: number;
  minimum_balance_to_keep: number;
  financial_priorities: string[];
  spending_preferences: string;
  payment_methods_user_will_consider: PaymentMethodPreference[];
}

export type EventType =
  | 'income'
  | 'expense'
  | 'transfer'
  | 'refund'
  | 'investment'
  | 'purchase'
  | 'payment'
  | 'salary'
  | 'other';

export type EventStatus = 'confirmed' | 'pending' | 'failed' | 'cancelled' | 'settled' | 'forecast';

export interface FinancialEvent {
  event_id: string;
  user_id: string;
  event_date: string;
  event_type: EventType;
  amount: number | null;
  currency: Currency;
  description: string;
  recurring: boolean;
  recurring_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'one_time' | null;
  status: EventStatus;
  category: string;
  linked_event_id: string | null;
  is_essential: boolean;
  is_flexible: boolean;
}

export interface ExchangeRate {
  rate_date: string;
  from_currency: Currency;
  to_currency: Currency;
  rate: number;
}

export interface PaymentOption {
  request_id: string;
  payment_option_id: string;
  payment_method: 'installments' | 'full_payment' | 'partial_payment';
  first_payment_date: string;
  first_payment_amount: number;
  recurring_payment_amount: number;
  days_between_payments: number;
  number_of_payments: number;
  financing_fee: number;
  total_payable_amount: number;
}

export interface Message {
  message_id: string;
  user_id: string;
  request_id: string | null;
  related_event_id: string | null;
  message_date: string;
  message_type: 'instruction' | 'clarification' | 'amendment' | 'cancellation' | 'confirmation' | 'reminder' | 'other';
  content: string;
}

export interface ImageRecord {
  image_id: string;
  user_id: string;
  request_id: string | null;
  related_event_id: string | null;
  description: string;
  extracted_amount: number | null;
  extracted_text: string | null;
}

export interface PaymentPlanEntry {
  date: string;
  amount: number;
}

export interface SpendingChange {
  type: 'stop' | 'reduce_to';
  event_id: string;
  new_amount?: number;
}

export interface AgentDecision {
  request_id: string;
  amount_safe_to_pay: number;
  affordability_status: AffordabilityStatus;
  recommended_payment_method: PaymentMethod;
  payment_plan: PaymentPlanEntry[];
  earliest_date_for_full_payment: string | null;
  spending_changes_needed: SpendingChange[];
  decision_explanation: string;
}

export interface ForecastDay {
  date: string;
  balance: number;
  events: FinancialEvent[];
  below_minimum: boolean;
}

export interface ForecastResult {
  days: ForecastDay[];
  min_balance: number;
  min_balance_date: string;
  ever_below_minimum: boolean;
}

export interface ProcessedRequest {
  request: FinancialRequest;
  profile: FinancialProfile;
  events: FinancialEvent[];
  paymentOptions: PaymentOption[];
  messages: Message[];
  images: ImageRecord[];
  decision: AgentDecision;
  forecast: ForecastResult | null;
}
