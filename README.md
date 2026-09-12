# Buy or Wait? — AI-Powered Financial Affordability Agent

An AI-powered financial agent that decides whether a user can safely afford a requested expense. It considers more than just the current balance — it accounts for recurring expenses, pending payments, essential spending, confirmed income, payment options, and relevant information found in messages or images.

## What It Does

For each user request ("Can I afford this laptop?"), the agent determines:

- **amount_safe_to_pay** — the maximum amount the user can safely pay today
- **affordability_status** — whether the request is affordable now, with a plan, later, or not at all
- **recommended_payment_method** — the safest way to proceed (full payment, partial, installments, wait, or not recommended)
- **payment_plan** — the dates and amounts of recommended payments
- **earliest_date_for_full_payment** — the earliest safe date for paying the full amount
- **spending_changes_needed** — flexible expenses that must be stopped or reduced
- **decision_explanation** — a short explanation supporting the recommendation

## Architecture

The agent runs a deterministic 5-stage pipeline:

1. **Data Ingestion** — Loads 7 CSV files (requests, profiles, events, exchange rates, payment options, messages, images) with type-safe parsing and currency normalization.
2. **Financial State Reconstruction** — Resolves events, applies message amendments/cancellations, extracts amounts from images, converts foreign currencies using provided exchange rates, and deduplicates records.
3. **90-Day Balance Forecast** — Projects the user's balance forward 90 days using recurring income and expenses. Uses binary search to find the maximum safe payment amount.
4. **Plan Generation & Ranking** — Generates eligible payment plans (full, partial, installments, wait), evaluates spending changes, and ranks candidates by deadline compliance, spending changes, total cost, payment start date, and number of payments.
5. **Decision Output** — Produces the final output row with all 8 required columns.

## Key Features

- **90-Day Safety Check**: Every plan is verified by forecasting 90 days of balance changes. A plan is safe only if the balance never drops below the user's minimum.
- **Multi-Currency Support**: Handles INR, ZAR, IDR, USD, and EUR with provided exchange rates.
- **Untrusted Message Handling**: Messages can amend, cancel, or clarify financial data, but embedded instructions never override the problem rules.
- **Image Amount Extraction**: When a financial event has a blank amount, the agent looks up the matching image record and uses its extracted amount.
- **Spending Changes**: Identifies flexible expenses that can be stopped or reduced to make a plan safe.
- **Personalized Recommendations**: Two users with the same balance may receive different recommendations based on their financial history, priorities, and payment preferences.

## Project Structure

```
src/
├── agent/
│   ├── types.ts            # All TypeScript types and interfaces
│   ├── csvParser.ts        # CSV parsing and serialization
│   ├── financialState.ts   # Financial state reconstruction engine
│   ├── forecast.ts         # 90-day balance forecast engine
│   ├── affordability.ts   # Affordability analysis and plan generation
│   ├── agent.ts            # Main orchestrator
│   └── sampleData.ts       # Sample dataset for demonstration
├── components/
│   ├── Navbar.tsx          # Navigation bar
│   ├── Hero.tsx            # Landing hero section
│   ├── Architecture.tsx    # Pipeline visualization
│   ├── RequestBrowser.tsx  # Interactive request cards with forecasts
│   ├── OutputTable.tsx     # Output CSV table and statistics
│   ├── StatusBadge.tsx     # Status and method badges
│   └── Footer.tsx          # Footer
├── hooks/
│   └── useAgentData.ts     # React hook for running the agent
└── App.tsx                 # Main application
```

## Running the Agent

### Web Dashboard

The dashboard runs automatically and displays live decisions for the sample dataset. Navigate between sections using the top navigation bar.

### Processing Real Data

To process the actual competition dataset:

1. Place CSV files in a `dataset/` directory
2. Import and run the agent:

```typescript
import { parseRequestsCSV, parseProfilesCSV, parseEventsCSV, parseExchangeRatesCSV, parsePaymentOptionsCSV, parseMessagesCSV, parseImagesCSV } from './agent/csvParser';
import { runAgent } from './agent/agent';
import { toCSV } from './agent/csvParser';
import * as fs from 'fs';

const dataset = {
  requests: parseRequestsCSV(fs.readFileSync('dataset/requests.csv', 'utf-8')),
  profiles: parseProfilesCSV(fs.readFileSync('dataset/financial_profiles.csv', 'utf-8')),
  events: parseEventsCSV(fs.readFileSync('dataset/financial_events.csv', 'utf-8')),
  exchangeRates: parseExchangeRatesCSV(fs.readFileSync('dataset/exchange_rates.csv', 'utf-8')),
  paymentOptions: parsePaymentOptionsCSV(fs.readFileSync('dataset/request_payment_options.csv', 'utf-8')),
  messages: parseMessagesCSV(fs.readFileSync('dataset/messages.csv', 'utf-8')),
  images: parseImagesCSV(fs.readFileSync('dataset/images.csv', 'utf-8')),
};

const result = runAgent(dataset);
const csv = toCSV(result.outputRows, [
  'request_id', 'amount_safe_to_pay', 'affordability_status',
  'recommended_payment_method', 'payment_plan', 'earliest_date_for_full_payment',
  'spending_changes_needed', 'decision_explanation',
]);
fs.writeFileSync('output.csv', csv);
```

## Evaluation

See `evaluation/usage_report.md` for the token usage and cost analysis.

## Submission

- **code.zip** — Full runnable solution with README and evaluation/ folder
- **output.csv** — Predictions for every row in requests.csv
- **chat_transcript** — Development conversation transcript
