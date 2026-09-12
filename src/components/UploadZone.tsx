import { useRef, useState, useCallback } from 'react';
import { Upload, FileCheck, X, AlertCircle, RotateCcw, Loader2 } from 'lucide-react';

interface UploadZoneProps {
  onFiles: (files: FileList | File[]) => void;
  onReset: () => void;
  uploading: boolean;
  error: string | null;
  isUploaded: boolean;
  fileName: string | null;
  requestCount: number;
}

const EXPECTED_FILES = [
  'requests.csv',
  'financial_profiles.csv',
  'financial_events.csv',
  'exchange_rates.csv',
  'request_payment_options.csv',
  'messages.csv',
  'images.csv',
];

export function UploadZone({
  onFiles,
  onReset,
  uploading,
  error,
  isUploaded,
  fileName,
  requestCount,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length > 0) {
        onFiles(e.dataTransfer.files);
      }
    },
    [onFiles]
  );

  return (
    <section id="upload" className="py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium mb-4">
            <Upload className="w-3.5 h-3.5" />
            Upload Your Dataset
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Process Your Own CSV Files</h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm">
            Drag and drop your competition dataset files here, or click to browse.
            The agent will process them instantly and show live decisions below.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {isUploaded ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-emerald-900 text-sm mb-1">Dataset Loaded Successfully</h3>
                <p className="text-sm text-emerald-700">
                  <span className="font-medium">{fileName}</span> — {requestCount} request{requestCount !== 1 ? 's' : ''} processed.
                </p>
              </div>
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Use Sample Data
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              dragging
                ? 'border-blue-400 bg-blue-50 scale-[1.01]'
                : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onFiles(e.target.files);
                  e.target.value = '';
                }
              }}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-sm text-slate-600">Processing files...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  dragging ? 'bg-blue-100' : 'bg-slate-100'
                }`}>
                  <Upload className={`w-7 h-7 transition-colors ${
                    dragging ? 'text-blue-500' : 'text-slate-400'
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {dragging ? 'Drop files here' : 'Click to browse or drag CSV files'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload all 7 dataset files at once, or just requests.csv to start
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <p className="text-xs font-medium text-slate-500 mb-3 text-center">Expected files (auto-detected by name):</p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXPECTED_FILES.map((file) => (
              <span key={file} className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-mono">
                {file}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
