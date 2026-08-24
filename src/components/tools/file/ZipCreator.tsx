import React, { useState, useMemo } from 'react';
import JSZip from 'jszip';
import {
  Download,
  Trash2,
  File,
  FolderArchive,
  Zap,
  Sliders
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob, formatFileSize } from '../../../utils/fileUtils';
import { FileUploader } from '../../common/FileUploader';

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  path: string;
}

export const ZipCreator: React.FC = () => {
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [archiveName, setArchiveName] = useState<string>('toolboxx_archive.zip');
  const [compressionLevel, setCompressionLevel] = useState<number>(6); // 1-9
  const [compressionMethod, setCompressionMethod] = useState<'DEFLATE' | 'STORE'>('DEFLATE');
  const [isArchiving, setIsArchiving] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [generatedZipBlob, setGeneratedZipBlob] = useState<{ blob: Blob; size: number } | null>(null);

  // File stats
  const stats = useMemo(() => {
    const totalBytes = queuedFiles.reduce((acc, f) => acc + f.size, 0);
    const compressedBytes = generatedZipBlob ? generatedZipBlob.size : null;
    const savings =
      compressedBytes !== null && totalBytes > 0
        ? `${Math.max(0, (((totalBytes - compressedBytes) / totalBytes) * 100)).toFixed(1)}%`
        : '-';

    return {
      fileCount: queuedFiles.length,
      uncompressedSize: formatFileSize(totalBytes),
      compressedSize: compressedBytes ? formatFileSize(compressedBytes) : '-',
      savings
    };
  }, [queuedFiles, generatedZipBlob]);

  const handleFilesAdded = (files: File[]) => {
    const newItems: QueuedFile[] = files.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      path: (file as unknown as { webkitRelativePath?: string }).webkitRelativePath || file.name
    }));

    setQueuedFiles((prev) => [...prev, ...newItems]);
    setGeneratedZipBlob(null);
    showToast({ type: 'success', title: `${files.length} File(s) Added to Archive` });
  };

  const handleRemoveFile = (id: string) => {
    setQueuedFiles((prev) => prev.filter((f) => f.id !== id));
    setGeneratedZipBlob(null);
  };

  const handleClearAll = () => {
    setQueuedFiles([]);
    setGeneratedZipBlob(null);
    setProgress(0);
  };

  // Generate Zip
  const handleCreateZip = async () => {
    if (queuedFiles.length === 0) return;

    setIsArchiving(true);
    setProgress(5);

    try {
      const zip = new JSZip();

      for (let i = 0; i < queuedFiles.length; i++) {
        const item = queuedFiles[i];
        zip.file(item.path, item.file);
        setProgress(Math.round(((i + 1) / queuedFiles.length) * 40));
      }

      const zipBlob = await zip.generateAsync(
        {
          type: 'blob',
          compression: compressionMethod,
          ...(compressionMethod === 'DEFLATE' ? { compressionOptions: { level: compressionLevel } } : {})
        },
        (metadata) => {
          setProgress(40 + Math.round(metadata.percent * 0.6));
        }
      );

      const fileName = archiveName.endsWith('.zip') ? archiveName : `${archiveName}.zip`;
      setGeneratedZipBlob({ blob: zipBlob, size: zipBlob.size });
      setProgress(100);
      setIsArchiving(false);

      showToast({
        type: 'success',
        title: 'ZIP Archive Generated',
        message: `${fileName} (${formatFileSize(zipBlob.size)}) ready`
      });
    } catch (err) {
      setIsArchiving(false);
      setProgress(0);
      showToast({
        type: 'error',
        title: 'Archive Creation Failed',
        message: err instanceof Error ? err.message : 'Error generating ZIP'
      });
    }
  };

  const handleDownloadNow = () => {
    if (!generatedZipBlob) return;
    const fileName = archiveName.endsWith('.zip') ? archiveName : `${archiveName}.zip`;
    downloadBlob(generatedZipBlob.blob, fileName);
    showToast({ type: 'success', title: 'Archive Downloaded', message: fileName });
  };

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Files" value={stats.fileCount} subValue="Queued for archive" />
        <StatCard label="Uncompressed Size" value={stats.uncompressedSize} />
        <StatCard
          label="Compressed Archive Size"
          value={stats.compressedSize}
          badge={generatedZipBlob ? 'READY' : 'PENDING'}
          badgeType={generatedZipBlob ? 'success' : 'neutral'}
        />
        <StatCard label="Space Savings" value={stats.savings} />
      </div>

      {/* Main Workspace Card */}
      <div className="p-5 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
        {/* Upload Zone */}
        <FileUploader
          accept="*"
          onFilesSelected={handleFilesAdded}
          multiple={true}
          label="Drop files or click to add into ZIP archive"
          description="Supports all file types and folder hierarchies. Packaged 100% locally in your browser."
        />

        {/* Configuration Strip */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-4">
          <h4 className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[var(--c-border)]">
            <Sliders className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Archive Settings
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Archive Filename */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--c-muted)]">Archive Name</label>
              <input
                type="text"
                value={archiveName}
                onChange={(e) => setArchiveName(e.target.value)}
                placeholder="archive.zip"
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs focus:ring-1 focus:ring-[var(--c-gold)] outline-none"
              />
            </div>

            {/* Compression Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--c-muted)]">Compression Method</label>
              <select
                value={compressionMethod}
                onChange={(e) => setCompressionMethod(e.target.value as 'DEFLATE' | 'STORE')}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] text-xs focus:ring-1 focus:ring-[var(--c-gold)] outline-none"
              >
                <option value="DEFLATE">DEFLATE (Standard Compressed)</option>
                <option value="STORE">STORE (No Compression - Fastest)</option>
              </select>
            </div>

            {/* Compression Level Slider (1 to 9) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--c-muted)]">Compression Level</span>
                <span className="font-mono font-bold text-[var(--c-gold)]">
                  {compressionMethod === 'STORE' ? 'N/A' : `Level ${compressionLevel} ${compressionLevel === 9 ? '(Max)' : compressionLevel === 1 ? '(Fast)' : '(Normal)'}`}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="9"
                disabled={compressionMethod === 'STORE'}
                value={compressionLevel}
                onChange={(e) => setCompressionLevel(Number(e.target.value))}
                className="w-full accent-[var(--c-gold)] cursor-pointer h-2 bg-[var(--c-card)] rounded-lg disabled:opacity-30"
              />
            </div>
          </div>
        </div>

        {/* Queued Files List */}
        {queuedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider flex items-center gap-1.5">
                <FolderArchive className="w-4 h-4 text-[var(--c-gold)]" /> Files Included ({queuedFiles.length})
              </h4>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] max-h-[300px] overflow-y-auto divide-y divide-[var(--c-border)]">
              {queuedFiles.map((item) => (
                <div
                  key={item.id}
                  className="py-2.5 px-3 flex items-center justify-between gap-3 hover:bg-[var(--c-card)]/50 rounded-xl transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <File className="w-4 h-4 text-[var(--c-gold)] shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--c-text)] truncate">{item.path}</p>
                      <p className="text-[11px] text-[var(--c-muted)] font-mono">
                        {formatFileSize(item.size)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(item.id)}
                    className="p-1 text-[var(--c-muted)] hover:text-rose-400 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar during generation */}
        {isArchiving && (
          <div className="p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--c-text)]">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[var(--c-gold)] animate-pulse" /> Compressing Archive...
              </span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--c-card)] overflow-hidden">
              <div
                className="h-full bg-[var(--c-gold)] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Bottom Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-[var(--c-subtle)]">
            {queuedFiles.length} file{queuedFiles.length === 1 ? '' : 's'} ready to pack
          </div>

          <div className="flex items-center gap-2">
            {!generatedZipBlob ? (
              <button
                type="button"
                onClick={handleCreateZip}
                disabled={queuedFiles.length === 0 || isArchiving}
                className="px-5 py-2.5 rounded-xl bg-[var(--c-gold)] hover:brightness-110 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-40 transition-all active:scale-95"
              >
                <FolderArchive className="w-4 h-4" /> Create .ZIP Archive
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDownloadNow}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" /> Download {archiveName} ({formatFileSize(generatedZipBlob.size)})
              </button>
            )}
          </div>
        </div>
      </div>

      <PostCompletionRecommendations currentToolId="zip-creator" onReset={handleClearAll} />
    </div>
  );
};
