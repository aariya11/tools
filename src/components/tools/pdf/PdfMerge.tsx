import React, { useState } from 'react';
import { Download, ArrowUp, ArrowDown, Trash2, FileText, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { mergePdfs } from '../../../utils/pdfUtils';
import { formatFileSize, downloadBlob } from '../../../utils/fileUtils';

export const PdfMerge: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setMergedBlob(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedBlob(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      showToast({ type: 'info', title: 'Add More Files', message: 'Please select at least 2 PDF files to merge.' });
      return;
    }

    setIsMerging(true);
    try {
      const mergedBytes = await mergePdfs(files);
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      setMergedBlob(blob);
      setIsMerging(false);

      showToast({
        type: 'success',
        title: 'PDFs Merged Successfully',
        message: `Combined ${files.length} documents into one (${formatFileSize(blob.size)})`,
      });
    } catch (err: any) {
      setIsMerging(false);
      showToast({
        type: 'error',
        title: 'Merge Failed',
        message: err.message || 'An error occurred while merging the PDF files.',
      });
    }
  };

  const handleDownload = () => {
    if (!mergedBlob) return;
    downloadBlob(mergedBlob, 'toolboxx-merged-document.pdf');
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    showToast({
      type: 'success',
      title: 'Downloaded PDF',
      message: 'Merged document saved to your device.',
    });
  };

  const handleReset = () => {
    setFiles([]);
    setMergedBlob(null);
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="space-y-8">
      {/* Upload Zone */}
      <FileUploader
        accept="application/pdf"
        multiple={true}
        allowedFormatsText="PDF"
        label="Drop PDF files here to merge"
        description="Select 2 or more PDF files. You can arrange their sequence before merging."
        onFilesSelected={handleFilesSelected}
      />

      {files.length > 0 && (
        <div className="space-y-6">
          {/* Top Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Selected Documents"
              value={`${files.length} Files`}
              className="bg-slate-50 dark:bg-slate-800/40"
            />
            <StatCard
              label="Combined Input Size"
              value={formatFileSize(totalSize)}
              className="bg-slate-50 dark:bg-slate-800/40"
            />
            <StatCard
              label="Merged Output"
              value={mergedBlob ? formatFileSize(mergedBlob.size) : 'Ready to merge'}
              badge={mergedBlob ? 'Ready' : undefined}
              badgeType="success"
              className="bg-slate-50 dark:bg-slate-800/40 border-indigo-200 dark:border-indigo-800"
            />
          </div>

          {/* Re-orderable File List */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Document Sequence ({files.length})
              </h3>
              <button
                onClick={handleReset}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>

            <div className="space-y-2.5">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <FileText className="w-5 h-5 text-rose-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  {/* Ordering Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === files.length - 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 dark:hover:text-rose-300"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-end">
              {!mergedBlob ? (
                <button
                  onClick={handleMerge}
                  disabled={files.length < 2 || isMerging}
                  className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-base shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <FileText className="w-5 h-5" />
                  {isMerging ? 'Merging PDF Documents...' : `Merge ${files.length} PDFs`}
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Merged PDF is ready!</span>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <Download className="w-5 h-5" />
                    Download Merged PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post Completion */}
      <PostCompletionRecommendations
        currentToolId="pdf-merge"
        onReset={handleReset}
      />
    </div>
  );
};
