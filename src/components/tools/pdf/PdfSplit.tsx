import React, { useState } from 'react';
import { Download, Scissors, RefreshCw, Archive, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { splitPdfByRanges } from '../../../utils/pdfUtils';
import { readFileAsArrayBuffer, formatFileSize, downloadBlob } from '../../../utils/fileUtils';

export const PdfSplit: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<'ranges' | 'all'>('ranges');
  const [customRangeText, setCustomRangeText] = useState<string>('1-2');
  const [isSplitting, setIsSplitting] = useState<boolean>(false);
  const [splitResults, setSplitResults] = useState<{ name: string; bytes: Uint8Array }[]>([]);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setSplitResults([]);

    try {
      const buffer = await readFileAsArrayBuffer(selected);
      const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();
      setTotalPages(count);

      if (count > 1) {
        setCustomRangeText(`1-${Math.ceil(count / 2)}, ${Math.ceil(count / 2) + 1}-${count}`);
      } else {
        setCustomRangeText('1');
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Invalid PDF', message: 'Failed to read PDF pages.' });
    }
  };

  const parseRanges = (text: string, max: number): { start: number; end: number }[] => {
    const parts = text.split(',');
    const ranges: { start: number; end: number }[] = [];

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          ranges.push({
            start: Math.max(1, Math.min(start, max)),
            end: Math.max(1, Math.min(end, max)),
          });
        }
      } else {
        const page = parseInt(trimmed, 10);
        if (!isNaN(page)) {
          ranges.push({
            start: Math.max(1, Math.min(page, max)),
            end: Math.max(1, Math.min(page, max)),
          });
        }
      }
    }

    return ranges;
  };

  const handleSplit = async () => {
    if (!file || totalPages === 0) return;

    setIsSplitting(true);
    try {
      let rangesToSplit: { start: number; end: number }[] = [];

      if (splitMode === 'all') {
        for (let i = 1; i <= totalPages; i++) {
          rangesToSplit.push({ start: i, end: i });
        }
      } else {
        rangesToSplit = parseRanges(customRangeText, totalPages);
      }

      if (rangesToSplit.length === 0) {
        throw new Error('Please enter valid page ranges (e.g. 1-2, 3-5).');
      }

      const results = await splitPdfByRanges(file, rangesToSplit);
      setSplitResults(results);
      setIsSplitting(false);

      showToast({
        type: 'success',
        title: 'PDF Split Successfully',
        message: `Created ${results.length} separate documents.`,
      });
    } catch (err: any) {
      setIsSplitting(false);
      showToast({
        type: 'error',
        title: 'Split Failed',
        message: err.message || 'Failed to split PDF.',
      });
    }
  };

  const handleDownloadSingle = (res: { name: string; bytes: Uint8Array }) => {
    const blob = new Blob([res.bytes], { type: 'application/pdf' });
    downloadBlob(blob, res.name);
  };

  const handleDownloadZip = async () => {
    if (splitResults.length === 0 || !file) return;

    const zip = new JSZip();
    splitResults.forEach((res) => {
      zip.file(res.name, res.bytes);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipName = `${file.name.replace(/\.pdf$/i, '')}_split_documents.zip`;
    downloadBlob(zipBlob, zipName);

    confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    showToast({
      type: 'success',
      title: 'ZIP Archive Downloaded',
      message: `Saved all ${splitResults.length} files.`,
    });
  };

  const handleReset = () => {
    setFile(null);
    setTotalPages(0);
    setSplitResults([]);
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop PDF file here to split"
        description="Extract specific page ranges or break down a document into individual PDF pages."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Document Name"
          value={file.name}
          subValue={formatFileSize(file.size)}
          className="bg-[var(--c-surface)] border-[var(--c-border)] truncate"
        />
        <StatCard
          label="Total Pages"
          value={`${totalPages} Pages`}
          className="bg-[var(--c-surface)] border-[var(--c-border)]"
        />
        <StatCard
          label="Generated Files"
          value={splitResults.length > 0 ? `${splitResults.length} Files` : 'Pending'}
          badge={splitResults.length > 0 ? 'Ready' : undefined}
          badgeType="success"
          className="bg-[var(--c-surface)] border-[var(--c-border)]"
        />
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration */}
        <div className="lg:col-span-5 space-y-6 bg-[var(--c-surface)] p-6 rounded-2xl border border-[var(--c-border)]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--c-border)]">
            <h3 className="font-bold text-base text-[var(--c-text)] flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[var(--c-gold)]" />
              Split Settings
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Change File
            </button>
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--c-subtle)] block">
              Split Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSplitMode('ranges')}
                className={`p-3 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer ${
                  splitMode === 'ranges'
                    ? 'bg-[var(--c-gold)] text-[var(--c-bg)] border-[var(--c-gold)] shadow-xs'
                    : 'bg-[var(--c-card)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
                }`}
              >
                Custom Ranges
              </button>
              <button
                type="button"
                onClick={() => setSplitMode('all')}
                className={`p-3 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer ${
                  splitMode === 'all'
                    ? 'bg-[var(--c-gold)] text-[var(--c-bg)] border-[var(--c-gold)] shadow-xs'
                    : 'bg-[var(--c-card)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
                }`}
              >
                Split Every Page ({totalPages})
              </button>
            </div>
          </div>

          {/* Custom Range Input */}
          {splitMode === 'ranges' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--c-text)]">
                Specify Page Ranges:
              </label>
              <input
                type="text"
                value={customRangeText}
                onChange={(e) => setCustomRangeText(e.target.value)}
                placeholder="e.g. 1-2, 3-5, 6"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] focus:ring-1 focus:ring-[var(--c-gold)] font-mono outline-none"
              />
              <p className="text-xs text-[var(--c-subtle)]">
                Enter comma-separated ranges (1-{totalPages}). E.g., "1-2, 3-{totalPages}".
              </p>
            </div>
          )}

          <button
            onClick={handleSplit}
            disabled={isSplitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] disabled:opacity-50 text-[var(--c-bg)] font-bold text-base shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Scissors className="w-5 h-5" />
            {isSplitting ? 'Splitting Pages...' : 'Split PDF Document'}
          </button>
        </div>

        {/* Right: Output Files */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--c-text)]">
              Output Documents ({splitResults.length})
            </span>
            {splitResults.length > 1 && (
              <button
                onClick={handleDownloadZip}
                className="px-3.5 py-1.5 rounded-xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5" /> Download All (ZIP)
              </button>
            )}
          </div>

          <div className="min-h-[300px] max-h-[420px] overflow-y-auto rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-4 space-y-2.5">
            {splitResults.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[var(--c-subtle)]">
                <Scissors className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm font-medium">Click "Split PDF Document" to generate files.</p>
              </div>
            ) : (
              splitResults.map((res, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] shadow-xs"
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-semibold text-[var(--c-text)] truncate">
                      {res.name}
                    </span>
                    <span className="text-[11px] text-[var(--c-subtle)] shrink-0">
                      ({formatFileSize(res.bytes.byteLength)})
                    </span>
                  </div>

                  <button
                    onClick={() => handleDownloadSingle(res)}
                    className="p-1.5 rounded-lg bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-gold)] hover:bg-[var(--c-gold)] hover:text-[var(--c-bg)] transition-colors shrink-0 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations
        currentToolId="pdf-split"
        onReset={handleReset}
      />
    </div>
  );
};
