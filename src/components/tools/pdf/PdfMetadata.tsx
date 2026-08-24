import React, { useState } from 'react';
import {
  Download,
  FileText,
  Tag,
  Calendar,
  User,
  BookOpen,
  Cpu,
  Trash2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PDFDocument } from 'pdf-lib';

import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { formatFileSize, downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';

interface PdfMetadataState {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
}

export const PdfMetadata: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Metadata State
  const [metadata, setMetadata] = useState<PdfMetadataState>({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: '',
    producer: '',
    creationDate: '',
    modificationDate: '',
  });

  const [originalMetadata, setOriginalMetadata] = useState<PdfMetadataState>({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: '',
    producer: '',
    creationDate: '',
    modificationDate: '',
  });

  const formatDateForInput = (date: Date | undefined): string => {
    if (!date || isNaN(date.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  };

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);

    try {
      const buffer = await readFileAsArrayBuffer(selectedFile);
      const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });
      setTotalPages(pdfDoc.getPageCount());

      const rawKeywords = pdfDoc.getKeywords();
      let keywordsStr = '';
      if (Array.isArray(rawKeywords)) {
        keywordsStr = rawKeywords.join(', ');
      } else if (typeof rawKeywords === 'string') {
        keywordsStr = rawKeywords;
      }

      const initialData: PdfMetadataState = {
        title: pdfDoc.getTitle() || '',
        author: pdfDoc.getAuthor() || '',
        subject: pdfDoc.getSubject() || '',
        keywords: keywordsStr,
        creator: pdfDoc.getCreator() || '',
        producer: pdfDoc.getProducer() || '',
        creationDate: formatDateForInput(pdfDoc.getCreationDate()),
        modificationDate: formatDateForInput(pdfDoc.getModificationDate()),
      };

      setMetadata(initialData);
      setOriginalMetadata(initialData);

      showToast({
        type: 'success',
        title: 'Metadata Extracted',
        message: 'Successfully loaded document properties and metadata fields.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Metadata Read Error',
        message: err.message || 'Failed to read PDF metadata properties.',
      });
      setFile(null);
    }
  };

  const handleSetNow = (field: 'creationDate' | 'modificationDate') => {
    const nowStr = formatDateForInput(new Date());
    setMetadata((prev) => ({ ...prev, [field]: nowStr }));
  };

  const handleClearField = (field: keyof PdfMetadataState) => {
    setMetadata((prev) => ({ ...prev, [field]: '' }));
  };

  const handleWipeAll = () => {
    setMetadata({
      title: '',
      author: '',
      subject: '',
      keywords: '',
      creator: '',
      producer: '',
      creationDate: '',
      modificationDate: '',
    });
    showToast({
      type: 'info',
      title: 'Metadata Wiped',
      message: 'All metadata properties cleared for privacy.',
    });
  };

  const handleStandardize = () => {
    const nowStr = formatDateForInput(new Date());
    setMetadata((prev) => ({
      ...prev,
      creator: 'ToolBoxX Document Suite',
      producer: 'ToolBoxX PDF Engine',
      modificationDate: nowStr,
    }));
    showToast({
      type: 'info',
      title: 'Standardized',
      message: 'Creator and Producer set to ToolBoxX.',
    });
  };

  const handleRevert = () => {
    setMetadata(originalMetadata);
    showToast({
      type: 'info',
      title: 'Reverted',
      message: 'Restored original file metadata values.',
    });
  };

  const handleSaveAndDownload = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const buffer = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });

      // Apply metadata
      pdfDoc.setTitle(metadata.title);
      pdfDoc.setAuthor(metadata.author);
      pdfDoc.setSubject(metadata.subject);

      // Parse keywords into array
      const kwArray = metadata.keywords
        ? metadata.keywords
            .split(/[,;]+/)
            .map((k) => k.trim())
            .filter((k) => k.length > 0)
        : [];
      pdfDoc.setKeywords(kwArray);

      pdfDoc.setCreator(metadata.creator);
      pdfDoc.setProducer(metadata.producer);

      if (metadata.creationDate) {
        const cDate = new Date(metadata.creationDate);
        if (!isNaN(cDate.getTime())) pdfDoc.setCreationDate(cDate);
      }

      if (metadata.modificationDate) {
        const mDate = new Date(metadata.modificationDate);
        if (!isNaN(mDate.getTime())) pdfDoc.setModificationDate(mDate);
      } else {
        pdfDoc.setModificationDate(new Date());
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `updated_metadata_${file.name}`);

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast({
        type: 'success',
        title: 'Metadata Saved!',
        message: 'Your PDF with updated metadata properties has been downloaded.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Failed to save PDF metadata.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTotalPages(0);
    setMetadata({
      title: '',
      author: '',
      subject: '',
      keywords: '',
      creator: '',
      producer: '',
      creationDate: '',
      modificationDate: '',
    });
  };

  const activeFieldCount = Object.values(metadata).filter((val) => val.trim().length > 0).length;

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF documents"
        label="Drop PDF here to Edit & Inspect Metadata"
        description="Inspect, modify, or strip PDF Title, Author, Subject, Keywords, Creator, and Date properties."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Document Name"
          value={file.name}
          subValue={formatFileSize(file.size)}
          icon={<FileText className="w-5 h-5 text-[var(--c-gold)]" />}
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
        <StatCard
          label="Total Pages"
          value={`${totalPages} Pages`}
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
        <StatCard
          label="Active Metadata"
          value={`${activeFieldCount} of 8 Fields`}
          badge={activeFieldCount === 0 ? 'Anonymized' : 'Tagged'}
          badgeType={activeFieldCount === 0 ? 'warning' : 'success'}
          className="bg-[var(--c-card)] border-[var(--c-border)]"
        />
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-8 space-y-6">
          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)]">
            <span className="text-xs font-semibold text-[var(--c-muted)]">Quick Presets:</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleWipeAll}
                className="py-1.5 px-3 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-red-400 hover:border-red-500/50 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Wipe / Anonymize
              </button>
              <button
                type="button"
                onClick={handleStandardize}
                className="py-1.5 px-3 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-gold)] hover:border-[var(--c-gold)] text-xs font-medium flex items-center gap-1.5 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Standardize
              </button>
              <button
                type="button"
                onClick={handleRevert}
                className="py-1.5 px-3 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] text-xs font-medium flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Revert
              </button>
            </div>
          </div>

          {/* Core Info Fields */}
          <div className="p-6 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--c-text)] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--c-gold)]" />
              <span>Document Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div className="sm:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-[var(--c-muted)]">Document Title</label>
                  {metadata.title && (
                    <button
                      onClick={() => handleClearField('title')}
                      className="text-[10px] text-[var(--c-subtle)] hover:text-red-400"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={metadata.title}
                  onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                  placeholder="e.g. Q4 Financial & Operational Report"
                  className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-3.5 py-2.5 text-sm focus:border-[var(--c-gold)] outline-none"
                />
              </div>

              {/* Author */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-[var(--c-muted)] flex items-center gap-1">
                    <User className="w-3 h-3 text-[var(--c-gold)]" /> Author / Organization
                  </label>
                  {metadata.author && (
                    <button
                      onClick={() => handleClearField('author')}
                      className="text-[10px] text-[var(--c-subtle)] hover:text-red-400"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={metadata.author}
                  onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                  placeholder="e.g. John Doe or Acme Corp"
                  className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-3.5 py-2 text-sm focus:border-[var(--c-gold)] outline-none"
                />
              </div>

              {/* Subject */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-[var(--c-muted)]">Subject / Topic</label>
                  {metadata.subject && (
                    <button
                      onClick={() => handleClearField('subject')}
                      className="text-[10px] text-[var(--c-subtle)] hover:text-red-400"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={metadata.subject}
                  onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                  placeholder="e.g. Quarterly business metrics and forecasts"
                  className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-3.5 py-2 text-sm focus:border-[var(--c-gold)] outline-none"
                />
              </div>

              {/* Keywords */}
              <div className="sm:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-[var(--c-muted)] flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[var(--c-gold)]" /> Keywords (Comma separated)
                  </label>
                  {metadata.keywords && (
                    <button
                      onClick={() => handleClearField('keywords')}
                      className="text-[10px] text-[var(--c-subtle)] hover:text-red-400"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={metadata.keywords}
                  onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
                  placeholder="e.g. finance, quarterly, audit, 2026, profit"
                  className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-3.5 py-2 text-sm focus:border-[var(--c-gold)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Software & Timestamps */}
          <div className="p-6 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--c-text)] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[var(--c-gold)]" />
              <span>Software & Timestamps</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Creator Application */}
              <div>
                <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
                  Creator Application
                </label>
                <input
                  type="text"
                  value={metadata.creator}
                  onChange={(e) => setMetadata({ ...metadata, creator: e.target.value })}
                  placeholder="e.g. Adobe InDesign / Microsoft Word"
                  className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-3.5 py-2 text-sm focus:border-[var(--c-gold)] outline-none"
                />
              </div>

              {/* PDF Producer */}
              <div>
                <label className="block text-xs font-medium text-[var(--c-muted)] mb-1">
                  PDF Producer Engine
                </label>
                <input
                  type="text"
                  value={metadata.producer}
                  onChange={(e) => setMetadata({ ...metadata, producer: e.target.value })}
                  placeholder="e.g. ToolBoxX PDF Engine"
                  className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-3.5 py-2 text-sm focus:border-[var(--c-gold)] outline-none"
                />
              </div>

              {/* Creation Date */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-[var(--c-muted)] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[var(--c-gold)]" /> Creation Timestamp
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSetNow('creationDate')}
                    className="text-[10px] text-[var(--c-gold)] hover:underline flex items-center gap-0.5"
                  >
                    <Clock className="w-2.5 h-2.5" /> Now
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={metadata.creationDate}
                  onChange={(e) => setMetadata({ ...metadata, creationDate: e.target.value })}
                  className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-3.5 py-2 text-sm focus:border-[var(--c-gold)] outline-none"
                />
              </div>

              {/* Modification Date */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-[var(--c-muted)] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[var(--c-gold)]" /> Modification Timestamp
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSetNow('modificationDate')}
                    className="text-[10px] text-[var(--c-gold)] hover:underline flex items-center gap-0.5"
                  >
                    <Clock className="w-2.5 h-2.5" /> Now
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={metadata.modificationDate}
                  onChange={(e) => setMetadata({ ...metadata, modificationDate: e.target.value })}
                  className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] rounded-xl px-3.5 py-2 text-sm focus:border-[var(--c-gold)] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Inspector Card & Save Button */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-5">
            <h3 className="text-sm font-semibold text-[var(--c-text)] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--c-gold)]" />
              <span>Metadata Inspection</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-1">
                <span className="text-[11px] text-[var(--c-subtle)] uppercase tracking-wider block">
                  Title
                </span>
                <p className="font-semibold text-[var(--c-text)] truncate">
                  {metadata.title || <span className="text-[var(--c-subtle)] italic">None</span>}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-1">
                <span className="text-[11px] text-[var(--c-subtle)] uppercase tracking-wider block">
                  Author
                </span>
                <p className="font-semibold text-[var(--c-text)] truncate">
                  {metadata.author || <span className="text-[var(--c-subtle)] italic">None</span>}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-1">
                <span className="text-[11px] text-[var(--c-subtle)] uppercase tracking-wider block">
                  Keywords
                </span>
                <p className="font-semibold text-[var(--c-text)] truncate">
                  {metadata.keywords || <span className="text-[var(--c-subtle)] italic">None</span>}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-1">
                <span className="text-[11px] text-[var(--c-subtle)] uppercase tracking-wider block">
                  Producer / Engine
                </span>
                <p className="font-semibold text-[var(--c-text)] truncate">
                  {metadata.producer || <span className="text-[var(--c-subtle)] italic">None</span>}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleSaveAndDownload}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-xl bg-[var(--c-gold)] text-black text-xs font-bold shadow-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Writing Metadata...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <Download className="w-4 h-4" />
                    <span>Save & Download PDF</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="w-full py-2 text-center text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] transition"
              >
                Choose Another PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations currentToolId="edit-pdf" onReset={handleReset} />
    </div>
  );
};
