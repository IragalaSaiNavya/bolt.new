import type {
  FinancialRequest,
  FinancialProfile,
  FinancialEvent,
  ExchangeRate,
  PaymentOption,
  Message,
  ImageRecord,
  Currency,
  RequestType,
} from './types';
import type { ParsedDataset } from './csvParser';

export function generateSampleDataset(): ParsedDataset {
  const profiles: FinancialProfile[] = [
    {
      user_id: 'user_01',
      home_currency: 'USD',
      available_balance: 5000,
      minimum_balance_to_keep: 1000,
      financial_priorities: ['essential_expenses', 'debt_repayment', 'savings'],
      spending_preferences: 'prefers_full_payment_avoids_debt',
      payment_methods_user_will_consider: ['full_payment', 'partial_payment', 'installments'],
    },
    {
      user_id: 'user_02',
      home_currency: 'INR',
      available_balance: 45000,
      minimum_balance_to_keep: 10000,
      financial_priorities: ['family_support', 'education', 'essential_expenses'],
      spending_preferences: 'willing_to_reduce_entertainment',
      payment_methods_user_will_consider: ['installments', 'partial_payment', 'wait'],
    },
    {
      user_id: 'user_03',
      home_currency: 'EUR',
      available_balance: 3200,
      minimum_balance_to_keep: 800,
      financial_priorities: ['housing', 'savings', 'essential_expenses'],
      spending_preferences: 'conservative_spender',
      payment_methods_user_will_consider: ['full_payment', 'wait'],
    },
    {
      user_id: 'user_04',
      home_currency: 'ZAR',
      available_balance: 18000,
      minimum_balance_to_keep: 5000,
      financial_priorities: ['debt_repayment', 'essential_expenses'],
      spending_preferences: 'flexible_with_entertainment',
      payment_methods_user_will_consider: ['installments', 'full_payment', 'partial_payment', 'wait'],
    },
    {
      user_id: 'user_05',
      home_currency: 'IDR',
      available_balance: 15000000,
      minimum_balance_to_keep: 3000000,
      financial_priorities: ['education', 'savings', 'essential_expenses'],
      spending_preferences: 'prefers_installments',
      payment_methods_user_will_consider: ['installments', 'partial_payment'],
    },
  ];

  const requests: FinancialRequest[] = [
    {
      request_id: 'req_01',
      user_id: 'user_01',
      request_date: '2026-09-12',
      request_type: 'purchase',
      requested_amount: 1200,
      desired_completion_date: '2026-09-12',
      allows_partial_payment: true,
      request_text: 'Can I afford this laptop?',
    },
    {
      request_id: 'req_02',
      user_id: 'user_02',
      request_date: '2026-09-12',
      request_type: 'education',
      requested_amount: 35000,
      desired_completion_date: '2026-10-15',
      allows_partial_payment: true,
      request_text: 'Can I pay for my child\'s school fees?',
    },
    {
      request_id: 'req_03',
      user_id: 'user_03',
      request_date: '2026-09-12',
      request_type: 'travel',
      requested_amount: 2800,
      desired_completion_date: '2026-09-20',
      allows_partial_payment: false,
      request_text: 'Can I book a flight to visit family?',
    },
    {
      request_id: 'req_04',
      user_id: 'user_04',
      request_date: '2026-09-12',
      request_type: 'debt_repayment',
      requested_amount: 12000,
      desired_completion_date: '2026-12-01',
      allows_partial_payment: true,
      request_text: 'Can I pay off my credit card debt?',
    },
    {
      request_id: 'req_05',
      user_id: 'user_05',
      request_date: '2026-09-12',
      request_type: 'housing',
      requested_amount: 8000000,
      desired_completion_date: '2026-10-12',
      allows_partial_payment: true,
      request_text: 'Can I afford the down payment for an apartment?',
    },
  ];

  const events: FinancialEvent[] = [
    // user_01 events
    { event_id: 'ev_01', user_id: 'user_01', event_date: '2026-09-01', event_type: 'salary', amount: 4000, currency: 'USD', description: 'Monthly salary', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'income', linked_event_id: null, is_essential: true, is_flexible: false },
    { event_id: 'ev_02', user_id: 'user_01', event_date: '2026-09-05', event_type: 'expense', amount: 1500, currency: 'USD', description: 'Rent', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'housing', linked_event_id: null, is_essential: true, is_flexible: false },
    { event_id: 'ev_03', user_id: 'user_01', event_date: '2026-09-10', event_type: 'expense', amount: 300, currency: 'USD', description: 'Groceries', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'food', linked_event_id: null, is_essential: true, is_flexible: false },
    { event_id: 'ev_04', user_id: 'user_01', event_date: '2026-09-15', event_type: 'expense', amount: 120, currency: 'USD', description: 'Streaming subscriptions', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'entertainment', linked_event_id: null, is_essential: false, is_flexible: true },
    { event_id: 'ev_05', user_id: 'user_01', event_date: '2026-09-20', event_type: 'expense', amount: 200, currency: 'USD', description: 'Utilities', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'utilities', linked_event_id: null, is_essential: true, is_flexible: false },

    // user_02 events
    { event_id: 'ev_06', user_id: 'user_02', event_date: '2026-09-01', event_type: 'salary', amount: 60000, currency: 'INR', description: 'Monthly salary', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'income', linked_event_id: null, is_essential: true, is_flexible: false },
    { event_id: 'ev_07', user_id: 'user_02', event_date: '2026-09-05', event_type: 'expense', amount: 18000, currency: 'INR', description: 'Rent', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'housing', linked_event_id: null, is_essential: true, is_flexible: false },
    { event_id: 'ev_08', user_id: 'user_02', event_date: '2026-09-10', event_type: 'expense', amount: 5000, currency: 'INR', description: 'Groceries', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'food', linked_event_id: null, is_essential: true, is_flexible: false },
    { event_id: 'ev_09', user_id: 'user_02', event_date: '2026-09-15', event_type: 'expense', amount: 3000, currency: 'INR', description: 'Entertainment', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'entertainment', linked_event_id: null, is_essential: false, is_flexible: true },
    { event_id: 'ev_10', user_id: 'user_02', event_date: '2026-09-25', event_type: 'expense', amount: 2000, currency: 'INR', description: 'Phone bill', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'utilities', linked_event_id: null, is_essential: true, is_flexible: false },

    // user_03 events
    { event_id: 'ev_11', user_id: 'user_03', event_date: '2026-09-01', event_type: 'salary', amount: 2800, currency: 'EUR', description: 'Monthly salary', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'income', linked_event_id: null, is_essential: true, is_flexible: false },
    { event_id: 'ev_12', user_id: 'user_03', event_date: '2026-09-05', event_type: 'expense', amount: 900, currency: 'EUR', description: 'Rent', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'housing', linked_event_id: null, is_essential: true, is_flexible: false },
    { event_id: 'ev_13', user_id: 'user_03', event_date: '2026-09-10', event_type: 'expense', amount: 250, currency: 'EUR', description: 'Groceries', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'food', linked_event_id: null, is_essential: true, is_flexible: false },
    { event_id: 'ev_14', user_id: 'user_03', event_date: '2026-09-15', event_type: 'expense', amount: 80, currency: 'EUR', description: 'Gym membership', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'health', linked_event_id: null, is_essential: false, is_flexible: true },

    // user_04 events
    { event_id: 'ev_15', user_id: 'user_04', event_date: '2026-09-01', event_type: 'salary', amount: 25000, currency: 'ZAR', description: 'Monthly salary', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'income', linked_event_id: null, is_essential: true, is_flexible: false },
    { event_id: 'ev_16', user_id: 'user_04', event_date: '2026-09-05', event_type: 'expense', amount: 8000, currency: 'ZAR', description: 'Rent', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'housing', linked_event_id: null, is_essential: true, is_flexible: false },
    { event_id: 'ev_17', user_id: 'user_04', event_date: '2026-09-10', event_type: 'expense', amount: 3000, currency: 'ZAR', description: 'Groceries', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'food', linked_event_id: null, is_essential: true, is_flexible: false },
    { event_id: 'ev_18', user_id: 'user_04', event_date: '2026-09-15', event_type: 'expense', amount: 2000, currency: 'ZAR', description: 'Dining out', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'entertainment', linked_event_id: null, is_essential: false, is_flexible: true },
    { event_id: 'ev_19', user_id: 'user_04', event_date: '2026-09-20', event_type: 'expense', amount: 1500, currency: 'ZAR', description: 'Transport', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'transport', linked_event_id: null, is_essential: true, is_flexible: false },

    // user_05 events
    { event_id: 'ev_20', user_id: 'user_05', event_date: '2026-09-01', event_type: 'salary', amount: 25000000, currency: 'IDR', description: 'Monthly salary', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'income', linked_event_id: null, is_essential: true, is_flexible: false },
    { event_id: 'ev_21', user_id: 'user_05', event_date: '2026-09-05', event_type: 'expense', amount: 5000000, currency: 'IDR', description: 'Rent', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'housing', linked_event_id: null, is_essential: true, is_flexible: false },
    { event_id: 'ev_22', user_id: 'user_05', event_date: '2026-09-10', event_type: 'expense', amount: 2000000, currency: 'IDR', description: 'Groceries', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'food', linked_event_id: null, is_essential: true, is_flexible: false },
    { event_id: 'ev_23', user_id: 'user_05', event_date: '2026-09-15', event_type: 'expense', amount: 1000000, currency: 'IDR', description: 'Entertainment', recurring: true, recurring_frequency: 'monthly', status: 'confirmed', category: 'entertainment', linked_event_id: null, is_essential: false, is_flexible: true },
  ];

  const exchangeRates: ExchangeRate[] = [
    { rate_date: '2026-09-01', from_currency: 'USD', to_currency: 'EUR', rate: 0.92 },
    { rate_date: '2026-09-01', from_currency: 'EUR', to_currency: 'USD', rate: 1.09 },
    { rate_date: '2026-09-01', from_currency: 'USD', to_currency: 'INR', rate: 83 },
    { rate_date: '2026-09-01', from_currency: 'USD', to_currency: 'ZAR', rate: 18.5 },
    { rate_date: '2026-09-01', from_currency: 'USD', to_currency: 'IDR', rate: 15800 },
  ];

  const paymentOptions: PaymentOption[] = [
    {
      request_id: 'req_02',
      payment_option_id: 'po_01',
      payment_method: 'installments',
      first_payment_date: '2026-09-12',
      first_payment_amount: 12000,
      recurring_payment_amount: 12000,
      days_between_payments: 30,
      number_of_payments: 3,
      financing_fee: 1000,
      total_payable_amount: 37000,
    },
    {
      request_id: 'req_04',
      payment_option_id: 'po_02',
      payment_method: 'installments',
      first_payment_date: '2026-09-12',
      first_payment_amount: 4000,
      recurring_payment_amount: 4000,
      days_between_payments: 30,
      number_of_payments: 3,
      financing_fee: 0,
      total_payable_amount: 12000,
    },
    {
      request_id: 'req_05',
      payment_option_id: 'po_03',
      payment_method: 'installments',
      first_payment_date: '2026-09-12',
      first_payment_amount: 4000000,
      recurring_payment_amount: 4000000,
      days_between_payments: 30,
      number_of_payments: 2,
      financing_fee: 200000,
      total_payable_amount: 8200000,
    },
  ];

  const messages: Message[] = [
    {
      message_id: 'msg_01',
      user_id: 'user_02',
      request_id: 'req_02',
      related_event_id: null,
      message_date: '2026-09-10',
      message_type: 'clarification',
      content: 'The school fees are 35000 INR total, payable over 3 months.',
    },
    {
      message_id: 'msg_02',
      user_id: 'user_04',
      request_id: 'req_04',
      related_event_id: null,
      message_date: '2026-09-08',
      message_type: 'confirmation',
      content: 'I want to pay off the credit card debt in installments.',
    },
  ];

  const images: ImageRecord[] = [];

  return {
    requests,
    profiles,
    events,
    exchangeRates,
    paymentOptions,
    messages,
    images,
  };
}


