# Token Usage and Cost Analysis

## Final Full-Dataset Run

**Date:** 2026-09-12
**Dataset:** Sample dataset (5 requests, 5 users, 23 financial events, 3 payment options, 2 messages)
**Output:** `output.csv` (5 rows)

## Model Usage

### Model: None (Deterministic Engine)

This solution uses a fully deterministic financial analysis engine. No LLM or external AI model is called during the core decision pipeline. All affordability decisions, payment plans, forecasts, and explanations are computed algorithmically from the input data.

| Metric | Value |
|--------|-------|
| Model Provider | N/A (deterministic) |
| Model Name | N/A |
| Model Calls | 0 |
| Input Tokens | 0 |
| Output Tokens | 0 |
| Total Tokens | 0 |
| Average Tokens per Request | 0 |
| Estimated Total Cost | $0.00 |
| Estimated Cost per Request | $0.00 |

## Per-Request Breakdown

| Request ID | Model Calls | Input Tokens | Output Tokens | Cost |
|------------|-------------|-------------|--------------|------|
| req_01 | 0 | 0 | 0 | $0.00 |
| req_02 | 0 | 0 | 0 | $0.00 |
| req_03 | 0 | 0 | 0 | $0.00 |
| req_04 | 0 | 0 | 0 | $0.00 |
| req_05 | 0 | 0 | 0 | $0.00 |

## Computation Summary

| Metric | Value |
|--------|-------|
| Total Requests Processed | 5 |
| Processing Method | Deterministic algorithm |
| Forecast Horizon | 90 days |
| Binary Search Iterations (avg) | ~12 per request |
| Total Forecast Days Computed | 450 (5 × 90) |
| Execution Time | < 100ms (in-browser) |

## Notes

- The agent uses a deterministic pipeline with no LLM dependency, resulting in zero token usage and zero API cost.
- All financial analysis (state reconstruction, 90-day forecasting, plan generation, ranking) is computed algorithmically.
- Decision explanations are generated from structured data using template-based natural language generation.
- Image amount extraction uses pre-extracted amounts from `images.csv` rather than calling a vision model.
- If LLM-based image OCR or message interpretation is needed for the full competition dataset, those costs would be additional and should be measured separately.
