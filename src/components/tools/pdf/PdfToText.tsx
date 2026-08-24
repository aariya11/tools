import React, { useState, useMemo } from 'react';
import {
  Download,
  FileText,
  Copy,
  Check,
  Search,
  BookOpen,
  RefreshCw,
  Clock,
  Layers,
  FileJson,
  Edit3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

interface PageTextData {
  pageNumber: number;
  text: string;
  wordCount: number;
  charCount: number;
}

export const PdfToText: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [pagesData, setPagesData] = useState<PageTextData[]>([]);
  const [selectedPageView, setSelectedPageView] = useState<number | 'all'>('all');

  // Search & Edit Mode
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editedText, setEditedText] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
    setPagesData([]);
    setIsExtracting(true);
    setSearchQuery('');
    setSelectedPageView('all');
    setIsEditMode(false);

    try {
      const buffer = await readFileAsArrayBuffer(selectedFile);
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      const total = pdf.numPages;
      setProgress({ current: 0, total });

      const extractedPages: PageTextData[] = [];

      for (let i = 1; i <= total; i++) {
        setProgress({ current: i, total });
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Sort and assemble text lines intelligently
        const items = textContent.items as any[];
        if (items.length === 0) {
          extractedPages.push({
            pageNumber: i,
            text: '',
            wordCount: 0,
            charCount: 0,
          });
          continue;
        }

        // Group by vertical Y position (item.transform[5])
        const lineGroups: { [y: number]: any[] } = {};
        const yTolerance = 4;

        items.forEach((item) => {
          if (!item.str || item.str.trim() === '') return;
          const y = item.transform ? Math.round(item.transform[5]) : 0;
          let matchedKey = Object.keys(lineGroups).find(
            (k) => Math.abs(Number(k) - y) <= yTolerance
          );

          if (!matchedKey) {
            matchedKey = String(y);
            lineGroups[Number(matchedKey)] = [];
          }
          lineGroups[Number(matchedKey)].push(item);
        });

        // Sort lines from top of page to bottom (descending Y)
        const sortedYKeys = Object.keys(lineGroups)
          .map(Number)
          .sort((a, b) => b - a);

        const pageLines: string[] = [];

        sortedYKeys.forEach((yKey) => {
          const lineItems = lineGroups[yKey];
          // Sort items on the same line from left to right (ascending X: item.transform[4])
          lineItems.sort((a, b) => {
            const xA = a.transform ? a.transform[4] : 0;
            const xB = b.transform ? b.transform[4] : 0;
            return xA - xB;
          });

          const lineStr = lineItems.map((item) => item.str).join(' ');
          if (lineStr.trim()) {
            pageLines.push(lineStr.trim());
          }
        });

        const pageText = pageLines.join('\n');
        const words = pageText.trim().length > 0 ? pageText.trim().split(/\s+/).length : 0;

        extractedPages.push({
          pageNumber: i,
          text: pageText,
          wordCount: words,
          charCount: pageText.length,
        });
      }

      setPagesData(extractedPages);
      const combined = extractedPages.map((p) => `--- PAGE ${p.pageNumber} ---\n${p.text}`).join('\n\n');
      setEditedText(combined);

      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      showToast({
        type: 'success',
        title: 'Text Extracted',
        message: `Extracted text from ${total} pages successfully.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Extraction Error',
        message: err.message || 'Failed to extract text from PDF.',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const combinedText = useMemo(() => {
    if (selectedPageView === 'all') {
      return pagesData.map((p) => `--- PAGE ${p.pageNumber} ---\n${p.text}`).join('\n\n');
    } else {
      const p = pagesData.find((page) => page.pageNumber === selectedPageView);
      return p ? p.text : '';
    }
  }, [pagesData, selectedPageView]);

  const totalWords = useMemo(() => {
    return pagesData.reduce((acc, p) => acc + p.wordCount, 0);
  }, [pagesData]);

  const totalChars = useMemo(() => {
    return pagesData.reduce((acc, p) => acc + p.charCount, 0);
  }, [pagesData]);

  const readingTimeMin = useMemo(() => {
    return Math.max(1, Math.ceil(totalWords / 225));
  }, [totalWords]);

  const searchMatchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = combinedText.match(regex);
    return matches ? matches.length : 0;
  }, [searchQuery, combinedText]);

  const handleCopyText = async () => {
    const textToCopy = isEditMode ? editedText : combinedText;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      showToast({
        type: 'success',
        title: 'Copied to Clipboard',
        message: 'Extracted text copied to your clipboard.',
      });
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      showToast({
        type: 'error',
        title: 'Copy Failed',
        message: 'Could not access clipboard.',
      });
    }
  };

  const handleDownloadTxt = () => {
    if (!file) return;
    const textToDownload = isEditMode ? editedText : combinedText;
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const baseName = file.name.replace(/\.pdf$/i, '');
    const suffix = selectedPageView === 'all' ? 'full_document' : `page_${selectedPageView}`;
    downloadBlob(blob, `${baseName}_${suffix}.txt`);
  };

  const handleDownloadJson = () => {
    if (!file || pagesData.length === 0) return;
    const data = {
      fileName: file.name,
      extractedAt: new Date().toISOString(),
      totalPages: pagesData.length,
      totalWords,
      totalChars,
      pages: pagesData,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const baseName = file.name.replace(/\.pdf$/i, '');
    downloadBlob(blob, `${baseName}_extracted.json`);
  };

  const handleReset = () => {
    setFile(null);
    setPagesData([]);
    setEditedText('');
    setSearchQuery('');
    setSelectedPageView('all');
    setProgress({ current: 0, total: 0 });
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF documents"
        label="Drop PDF here to Extract Text"
        description="Extract all searchable text content from your PDF documents with page breakdown, search highlighting, and TXT/JSON export."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          label="Document Name"
          value={file.name}
          subValue={formatFileSize(file.size)}
          icon={<FileText className="w-5 h-5 text-[var(--c-gold)]" />}
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
        <StatCard
          label="Total Words"
          value={isExtracting ? '...' : totalWords.toLocaleString()}
          icon={<BookOpen className="w-5 h-5 text-[var(--c-gold)]" />}
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
        <StatCard
          label="Total Characters"
          value={isExtracting ? '...' : totalChars.toLocaleString()}
          subValue={`~${readingTimeMin} min read`}
          icon={<Clock className="w-5 h-5 text-[var(--c-gold)]" />}
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
        <StatCard
          label="Total Pages"
          value={isExtracting ? `${progress.current}/${progress.total}` : `${pagesData.length} Pages`}
          badge={pagesData.length > 0 ? 'Extracted' : 'Analyzing'}
          badgeType="success"
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
      </div>

      {/* Main Workspace */}
      <div className="space-y-4">
        {/* Toolbar Header */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)]">
          {/* Page Selector & Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedPageView('all')}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold shrink-0 transition border ${
                selectedPageView === 'all'
                  ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)]'
                  : 'bg-[var(--c-surface)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
              }`}
            >
              All Pages ({pagesData.length})
            </button>

            {pagesData.map((p) => (
              <button
                key={p.pageNumber}
                onClick={() => setSelectedPageView(p.pageNumber)}
                className={`py-1.5 px-3 rounded-xl text-xs font-medium shrink-0 transition border ${
                  selectedPageView === p.pageNumber
                    ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)]'
                    : 'bg-[var(--c-surface)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
                }`}
              >
                Page {p.pageNumber}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-subtle)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search extracted text..."
                className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl pl-9 pr-3 py-1.5 text-xs focus:border-[var(--c-gold)] outline-none"
              />
              {searchQuery && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--c-gold)] font-mono">
                  {searchMatchCount} found
                </span>
              )}
            </div>

            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`py-1.5 px-3 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition ${
                isEditMode
                  ? 'bg-[var(--c-gold)] text-black border-[var(--c-gold)]'
                  : 'bg-[var(--c-surface)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditMode ? 'Editing' : 'Edit Text'}</span>
            </button>
          </div>
        </div>

        {/* Loading Progress State */}
        {isExtracting && (
          <div className="p-12 text-center bg-[var(--c-card)] rounded-2xl border border-[var(--c-border)] space-y-4">
            <div className="w-10 h-10 border-3 border-[var(--c-gold)] border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <h4 className="font-bold text-sm text-[var(--c-text)]">Extracting Text from PDF...</h4>
              <p className="text-xs text-[var(--c-muted)] mt-1">
                Processing page {progress.current} of {progress.total}
              </p>
            </div>
          </div>
        )}

        {/* Text Viewer / Editor */}
        {!isExtracting && (
          <div className="rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] overflow-hidden">
            {isEditMode ? (
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={18}
                className="w-full p-5 bg-[var(--c-surface)] text-[var(--c-text)] font-mono text-xs leading-relaxed outline-none resize-y border-0 focus:ring-0"
                placeholder="Extracted text will appear here for direct editing..."
              />
            ) : (
              <div className="p-6 max-h-[500px] overflow-y-auto font-mono text-xs leading-relaxed text-[var(--c-text)] whitespace-pre-wrap selection:bg-[var(--c-gold)] selection:text-black">
                {combinedText ? (
                  searchQuery.trim() ? (
                    // Highlight search query matches
                    combinedText.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')).map((part, i) =>
                      part.toLowerCase() === searchQuery.toLowerCase() ? (
                        <mark key={i} className="bg-[var(--c-gold)] text-black px-0.5 rounded font-bold">
                          {part}
                        </mark>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )
                  ) : (
                    combinedText
                  )
                ) : (
                  <p className="text-center py-12 text-[var(--c-subtle)] italic">
                    No searchable text found on this page. (Scanned image PDFs can be converted via OCR PDF tool).
                  </p>
                )}
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[var(--c-surface)] border-t border-[var(--c-border)]">
              <div className="flex items-center gap-2 text-xs text-[var(--c-muted)]">
                <Layers className="w-3.5 h-3.5 text-[var(--c-gold)]" />
                <span>
                  Viewing {selectedPageView === 'all' ? 'Combined Document' : `Page ${selectedPageView}`}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopyText}
                  className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] hover:border-[var(--c-gold)] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[var(--c-gold)]" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadJson}
                  className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] hover:border-[var(--c-gold)] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <FileJson className="w-3.5 h-3.5 text-[var(--c-gold)]" />
                  <span>JSON</span>
                </button>

                <button
                  onClick={handleDownloadTxt}
                  className="flex-1 sm:flex-initial py-2 px-4 rounded-xl bg-[var(--c-gold)] text-black text-xs font-bold shadow-md hover:opacity-90 flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .TXT</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleReset}
            className="text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] flex items-center gap-1 py-1 px-2"
          >
            <RefreshCw className="w-3 h-3" /> Process Another Document
          </button>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations currentToolId="ocr-pdf" onReset={handleReset} />
    </div>
  );
};
