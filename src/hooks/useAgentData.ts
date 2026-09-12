import { useMemo, useState, useCallback } from 'react';
import { generateSampleDataset } from '@/agent/sampleData';
import { runAgent } from '@/agent/agent';
import {
  parseRequestsCSV,
  parseProfilesCSV,
  parseEventsCSV,
  parseExchangeRatesCSV,
  parsePaymentOptionsCSV,
  parseMessagesCSV,
  parseImagesCSV,
  type ParsedDataset,
} from '@/agent/csvParser';
import type { ProcessedRequest, AgentDecision } from '@/agent/types';

export interface AgentData {
  processedRequests: ProcessedRequest[];
  decisions: AgentDecision[];
  outputRows: Record<string, string | number | null>[];
  source: 'sample' | 'uploaded';
  fileName: string | null;
}

const EMPTY_DATASET: ParsedDataset = {
  requests: [],
  profiles: [],
  events: [],
  exchangeRates: [],
  paymentOptions: [],
  messages: [],
  images: [],
};

function detectAndParseFile(fileName: string, text: string, dataset: ParsedDataset): boolean {
  const lower = fileName.toLowerCase();
  if (lower === 'requests.csv' || lower.includes('request')) {
    dataset.requests = parseRequestsCSV(text);
    return true;
  }
  if (lower.includes('financial_profile') || lower === 'profiles.csv') {
    dataset.profiles = parseProfilesCSV(text);
    return true;
  }
  if (lower.includes('financial_event') || lower === 'events.csv') {
    dataset.events = parseEventsCSV(text);
    return true;
  }
  if (lower.includes('exchange_rate') || lower === 'exchange_rates.csv') {
    dataset.exchangeRates = parseExchangeRatesCSV(text);
    return true;
  }
  if (lower.includes('payment_option') || lower === 'request_payment_options.csv') {
    dataset.paymentOptions = parsePaymentOptionsCSV(text);
    return true;
  }
  if (lower === 'messages.csv' || lower.includes('message')) {
    dataset.messages = parseMessagesCSV(text);
    return true;
  }
  if (lower === 'images.csv' || lower.includes('image')) {
    dataset.images = parseImagesCSV(text);
    return true;
  }
  return false;
}

export function useAgentData() {
  const [uploadedDataset, setUploadedDataset] = useState<ParsedDataset | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const sampleData = useMemo<AgentData>(() => {
    const dataset = generateSampleDataset();
    const result = runAgent(dataset);
    return {
      processedRequests: result.processedRequests,
      decisions: result.decisions,
      outputRows: result.outputRows,
      source: 'sample',
      fileName: null,
    };
  }, []);

  const uploadedData = useMemo<AgentData | null>(() => {
    if (!uploadedDataset) return null;
    const result = runAgent(uploadedDataset);
    return {
      processedRequests: result.processedRequests,
      decisions: result.decisions,
      outputRows: result.outputRows,
      source: 'uploaded',
      fileName: uploadedFileName,
    };
  }, [uploadedDataset, uploadedFileName]);

  const data: AgentData = uploadedData ?? sampleData;

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setUploading(true);
    setUploadError(null);
    try {
      const dataset: ParsedDataset = { ...EMPTY_DATASET };
      const fileArray = Array.from(files);
      let matchedCount = 0;

      for (const file of fileArray) {
        const text = await file.text();
        const matched = detectAndParseFile(file.name, text, dataset);
        if (matched) matchedCount++;
      }

      if (matchedCount === 0) {
        setUploadError('No recognized CSV files found. Expected: requests.csv, financial_profiles.csv, financial_events.csv, exchange_rates.csv, request_payment_options.csv, messages.csv, images.csv');
        setUploading(false);
        return;
      }

      if (dataset.requests.length === 0) {
        setUploadError('requests.csv is required but was not found or contained no rows.');
        setUploading(false);
        return;
      }

      setUploadedDataset(dataset);
      setUploadedFileName(fileArray.length === 1 ? fileArray[0].name : `${fileArray.length} files`);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to read files.');
    }
    setUploading(false);
  }, []);

  const resetToSample = useCallback(() => {
    setUploadedDataset(null);
    setUploadedFileName(null);
    setUploadError(null);
  }, []);

  return {
    data,
    handleFiles,
    resetToSample,
    uploading,
    uploadError,
    isUploaded: uploadedDataset !== null,
  };
}
