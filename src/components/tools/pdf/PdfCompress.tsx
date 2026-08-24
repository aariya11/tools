import React, { useState } from 'react';
import { Download, Minimize, RefreshCw, CheckCircle2, Sliders } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { compressPdfDocument } from '../../../utils/pdfUtils';
import { formatFileSize, calculateSavings, downloadBlob } from '../../../utils/fileUtils';

export const PdfCompress: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressedBytes, setCompressedBytes] = useState<Uint8Array | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setCompressedBytes(null);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsCompressing(true);

    try {
      const result = await compressPdfDocument(file, level);
      setCompressedBytes(result);
      setIsCompressing(false);

      showToast({
        type: 'success',
        title: 'PDF Compressed',
        message: `Optimized "${file.name}" successfully.`,
      });
    } catch (err: any) {
      setIsCompressing(false);
      showToast({
        type: 'error',
        title: 'Optimization Failed',
        message: err.message || 'Could not compress PDF.',
      });
    }
  };

  const handleDownload = () => {
    if (!compressedBytes || !file) return;
    const blob = new Blob([compressedBytes], { type: 'application/pdf' });
    const baseName = file.name.replace(/\.pdf$/i, '');
    const filename = `${baseName}_optimized.pdf`;

    downloadBlob(blob, filename);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    showToast({
      type: 'success',
      title: 'PDF Downloaded',
      message: `Saved as ${filename}`,
    });
  };

  const handleReset = () => {
    setFile(null);
    setCompressedBytes(null);
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop PDF file here to compress"
        description="Reduce PDF file size by optimizing document streams and stripping redundant metadata."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  const savings = compressedBytes
    ? calculateSavings(file.size, compressedBytes.byteLength)
    : { savedBytes: 0, percentage: 0, isReduced: true };

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Original PDF Size"
          value={formatFileSize(file.size)}
          className="bg-[var(--c-surface)] border-[var(--c-border)]"
        />
        <StatCard
          label="Optimized PDF Size"
          value={compressedBytes ? formatFileSize(compressedBytes.byteLength) : 'Ready'}
          badge={savings.percentage > 0 ? `${savings.percentage}% Saved` : undefined}
          badgeType="success"
          className="bg-[var(--c-surface)] border-[var(--c-border)]"
        />
        <StatCard
          label="File Name"
          value={file.name}
          className="bg-[var(--c-surface)] border-[var(--c-border)] truncate text-base"
        />
      </div>

      {/* Main Workspace */}
      <div className="bg-[var(--c-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--c-border)] max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--c-border)]">
          <h3 className="font-bold text-base text-[var(--c-text)] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--c-gold)]" />
            Compression Level
          </h3>
          <button
            onClick={handleReset}
            className="text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Change File
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'low', title: 'Basic', desc: 'Slight reduction, highest compatibility' },
            { id: 'medium', title: 'Recommended', desc: 'Best balance of size and quality' },
            { id: 'high', title: 'Extreme', desc: 'Maximum compression for emailing' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLevel(item.id as any)}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                level === item.id
                  ? 'bg-[var(--c-gold)] text-[var(--c-bg)] border-[var(--c-gold)] shadow-md'
                  : 'bg-[var(--c-card)] text-[var(--c-text)] border-[var(--c-border)] hover:border-[var(--c-border-hover)]'
              }`}
            >
              <div className="font-bold text-xs">{item.title}</div>
              <div
                className={`text-[10px] mt-1 line-clamp-2 ${
                  level === item.id ? 'opacity-90 font-medium' : 'text-[var(--c-subtle)]'
                }`}
              >
                {item.desc}
              </div>
            </button>
          ))}
        </div>

        {compressedBytes ? (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              <span>PDF compressed successfully!</span>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-3.5 px-6 rounded-2xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] text-[var(--c-bg)] font-bold text-base shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              Download Compressed PDF
            </button>
          </div>
        ) : (
          <button
            onClick={handleCompress}
            disabled={isCompressing}
            className="w-full py-3.5 px-6 rounded-2xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] disabled:opacity-50 text-[var(--c-bg)] font-bold text-base shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            {isCompressing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Optimizing PDF streams...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Compress PDF Now
              </>
            )}
          </button>
        )}
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations
        currentToolId="pdf-compress"
        onReset={handleReset}
      />
    </div>
  );
};
