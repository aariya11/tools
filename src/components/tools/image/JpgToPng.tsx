import React, { useState } from 'react';
import { Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileUploader } from '../../common/FileUploader';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { convertImage } from '../../../utils/imageUtils';
import { formatFileSize, downloadBlob } from '../../../utils/fileUtils';

export const JpgToPng: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [convertedResult, setConvertedResult] = useState<{
    blob: Blob;
    dataUrl: string;
    width: number;
    height: number;
  } | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setIsConverting(true);

    try {
      const result = await convertImage(selected, 'image/png');
      setConvertedResult(result);
      setIsConverting(false);
      showToast({
        type: 'success',
        title: 'Conversion Complete',
        message: `Converted "${selected.name}" to PNG lossless format.`,
      });
    } catch (err: any) {
      setIsConverting(false);
      showToast({
        type: 'error',
        title: 'Conversion Failed',
        message: err.message || 'Could not convert image to PNG.',
      });
    }
  };

  const handleDownload = () => {
    if (!convertedResult || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}.png`;

    downloadBlob(convertedResult.blob, filename);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    showToast({
      type: 'success',
      title: 'PNG Downloaded',
      message: `Saved ${filename} (${formatFileSize(convertedResult.blob.size)})`,
    });
  };

  const handleReset = () => {
    setFile(null);
    setConvertedResult(null);
  };

  if (!file) {
    return (
      <FileUploader
        accept="image/jpeg,image/jpg"
        allowedFormatsText="JPG, JPEG"
        label="Drop your JPG image here"
        description="Convert JPG or JPEG photographs to lossless PNG format instantly inside your browser."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Original JPG Size"
          value={formatFileSize(file.size)}
          className="bg-slate-50 dark:bg-slate-800/40"
        />
        <StatCard
          label="Converted PNG Size"
          value={convertedResult ? formatFileSize(convertedResult.blob.size) : 'Converting...'}
          badge="Lossless"
          badgeType="success"
          className="bg-slate-50 dark:bg-slate-800/40 border-indigo-200 dark:border-indigo-800"
        />
        <StatCard
          label="Dimensions"
          value={convertedResult ? `${convertedResult.width} × ${convertedResult.height}` : '...'}
          className="bg-slate-50 dark:bg-slate-800/40"
        />
      </div>

      {/* Main Workspace */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-6">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span>Image ready in PNG format</span>
        </div>

        {convertedResult && (
          <div className="max-h-80 max-w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-md">
            <img
              src={convertedResult.dataUrl}
              alt="Converted PNG preview"
              className="max-h-72 object-contain rounded-lg"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md justify-center">
          <button
            onClick={handleDownload}
            disabled={!convertedResult || isConverting}
            className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-base shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Download className="w-5 h-5" />
            Download PNG File
          </button>

          <button
            onClick={handleReset}
            className="w-full sm:w-auto py-3.5 px-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Convert Another
          </button>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations
        currentToolId="jpg-to-png"
        onReset={handleReset}
      />
    </div>
  );
};
