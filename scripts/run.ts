import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseRequestsCSV,
  parseProfilesCSV,
  parseEventsCSV,
  parseExchangeRatesCSV,
  parsePaymentOptionsCSV,
  parseMessagesCSV,
  parseImagesCSV,
  toCSV,
  type ParsedDataset,
} from '../src/agent/csvParser';
import { runAgent } from '../src/agent/agent';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const datasetDir = join(projectRoot, 'dataset');

function readCSV(name: string): string {
  const filePath = join(datasetDir, name);
  if (!existsSync(filePath)) {
    console.warn(`Warning: ${name} not found in dataset/, skipping.`);
    return '';
  }
  return readFileSync(filePath, 'utf-8');
}

function main() {
  console.log('=== Buy or Wait? — Agent Runner ===\n');
  console.log('Loading dataset files from dataset/...');

  const dataset: ParsedDataset = {
    requests: parseRequestsCSV(readCSV('requests.csv')),
    profiles: parseProfilesCSV(readCSV('financial_profiles.csv')),
    events: parseEventsCSV(readCSV('financial_events.csv')),
    exchangeRates: parseExchangeRatesCSV(readCSV('exchange_rates.csv')),
    paymentOptions: parsePaymentOptionsCSV(readCSV('request_payment_options.csv')),
    messages: parseMessagesCSV(readCSV('messages.csv')),
    images: parseImagesCSV(readCSV('images.csv')),
  };

  console.log(`  requests.csv:        ${dataset.requests.length} rows`);
  console.log(`  financial_profiles:  ${dataset.profiles.length} rows`);
  console.log(`  financial_events:    ${dataset.events.length} rows`);
  console.log(`  exchange_rates:      ${dataset.exchangeRates.length} rows`);
  console.log(`  payment_options:     ${dataset.paymentOptions.length} rows`);
  console.log(`  messages:            ${dataset.messages.length} rows`);
  console.log(`  images:              ${dataset.images.length} rows`);

  if (dataset.requests.length === 0) {
    console.error('\nError: No requests found in dataset/requests.csv');
    process.exit(1);
  }

  console.log('\nRunning agent...\n');

  const result = runAgent(dataset);

  const OUTPUT_HEADERS = [
    'request_id',
    'amount_safe_to_pay',
    'affordability_status',
    'recommended_payment_method',
    'payment_plan',
    'earliest_date_for_full_payment',
    'spending_changes_needed',
    'decision_explanation',
  ];

  const csv = toCSV(result.outputRows, OUTPUT_HEADERS);
  const outputPath = join(projectRoot, 'output.csv');
  writeFileSync(outputPath, csv);

  console.log(`Output written to output.csv (${result.decisions.length} rows)\n`);

  console.log('=== Decision Summary ===');
  for (const d of result.decisions) {
    console.log(`  ${d.request_id}: ${d.affordability_status} via ${d.recommended_payment_method} (safe: ${d.amount_safe_to_pay})`);
  }

  const statusCounts = result.decisions.reduce((acc, d) => {
    acc[d.affordability_status] = (acc[d.affordability_status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n=== Status Distribution ===');
  for (const [status, count] of Object.entries(statusCounts)) {
    console.log(`  ${status}: ${count}`);
  }

  console.log('\nDone.');
}

main();
