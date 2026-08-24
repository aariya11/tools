import React, { useState, useMemo } from 'react';
import JSZip from 'jszip';
import {
  FolderOpen,
  Download,
  Trash2,
  File,
  Search,
  Eye,
  PackageCheck
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob, formatFileSize } from '../../../utils/fileUtils';
import { FileUploader } from '../../common/FileUploader';

interface ExtractedEntry {
  path: string;
  name: string;
  isDir: boolean;
  size: number;
  date: Date;
  zipObject: JSZip.JSZipObject;
}

export const ZipExtractor: React.FC = () => {
  const [zipFileName, setZipFileName] = useState<string>('');
  const [zipFileSize, setZipFileSize] = useState<number>(0);
  const [entries, setEntries] = useState<ExtractedEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [selectedFilePreview, setSelectedFilePreview] = useState<{
    path: string;
    type: 'text' | 'image' | 'binary';
    content: string;
    size: number;
  } | null>(null);

  // File stats
  const stats = useMemo(() => {
    const filesOnly = entries.filter((e) => !e.isDir);
    const totalUncompressed = filesOnly.reduce((acc, e) => acc + e.size, 0);
    const ratio =
      zipFileSize > 0 && totalUncompressed > 0
        ? `${(((totalUncompressed - zipFileSize) / totalUncompressed) * 100).toFixed(1)}%`
        : '-';

    return {
      totalEntries: entries.length,
      filesCount: filesOnly.length,
      uncompressedSize: formatFileSize(totalUncompressed),
      archiveSize: formatFileSize(zipFileSize),
      compressionRatio: ratio
    };
  }, [entries, zipFileSize]);

  // Filtered files
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter((e) => e.path.toLowerCase().includes(q));
  }, [entries, searchQuery]);

  const handleZipFileUploaded = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setIsExtracting(true);
    setZipFileName(file.name);
    setZipFileSize(file.size);
    setSelectedFilePreview(null);

    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);
      const parsedEntries: ExtractedEntry[] = [];

      loadedZip.forEach((relativePath, zipEntry) => {
        parsedEntries.push({
          path: relativePath,
          name: relativePath.split('/').filter(Boolean).pop() || relativePath,
          isDir: zipEntry.dir,
          size: (zipEntry as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize || 0,
          date: zipEntry.date,
          zipObject: zipEntry
        });
      });

      setEntries(parsedEntries);
      setIsExtracting(false);
      showToast({
        type: 'success',
        title: 'ZIP Archive Parsed',
        message: `Extracted ${parsedEntries.length} items from ${file.name}`
      });
    } catch (err) {
      setIsExtracting(false);
      showToast({
        type: 'error',
        title: 'Corrupted Archive',
        message: err instanceof Error ? err.message : 'Could not parse ZIP file'
      });
    }
  };

  // Preview file content
  const handlePreviewEntry = async (entry: ExtractedEntry) => {
    if (entry.isDir) return;

    try {
      const ext = entry.name.split('.').pop()?.toLowerCase() || '';
      const isImage = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif', 'bmp', 'ico'].includes(ext);
      const isText = [
        'txt',
        'json',
        'csv',
        'tsv',
        'md',
        'js',
        'ts',
        'jsx',
        'tsx',
        'html',
        'css',
        'xml',
        'log',
        'env',
        'yml',
        'yaml',
        'sql',
        'py',
        'sh',
        'c',
        'cpp',
        'java'
      ].includes(ext);

      if (isImage) {
        const base64 = await entry.zipObject.async('base64');
        const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
        setSelectedFilePreview({
          path: entry.path,
          type: 'image',
          content: `data:${mime};base64,${base64}`,
          size: entry.size
        });
      } else if (isText) {
        const text = await entry.zipObject.async('text');
        setSelectedFilePreview({
          path: entry.path,
          type: 'text',
          content: text,
          size: entry.size
        });
      } else {
        setSelectedFilePreview({
          path: entry.path,
          type: 'binary',
          content: 'Binary file — click download to save to your device.',
          size: entry.size
        });
      }
    } catch {
      showToast({ type: 'error', title: 'Could not read file preview' });
    }
  };

  // Download individual entry
  const handleDownloadEntry = async (entry: ExtractedEntry) => {
    if (entry.isDir) return;
    try {
      const blob = await entry.zipObject.async('blob');
      downloadBlob(blob, entry.name);
      showToast({ type: 'success', title: 'File Downloaded', message: entry.name });
    } catch {
      showToast({ type: 'error', title: 'Extraction Failed' });
    }
  };

  // Unpack and download all files
  const handleDownloadAll = async () => {
    const filesOnly = entries.filter((e) => !e.isDir);
    if (filesOnly.length === 0) return;

    for (const entry of filesOnly) {
      try {
        const blob = await entry.zipObject.async('blob');
        downloadBlob(blob, entry.name);
      } catch {
        // Skip failed
      }
    }
    showToast({ type: 'success', title: `Unpacked and saved ${filesOnly.length} files` });
  };

  const handleReset = () => {
    setEntries([]);
    setZipFileName('');
    setZipFileSize(0);
    setSelectedFilePreview(null);
  };

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Files Inside"
          value={stats.filesCount.toLocaleString()}
          subValue={entries.length > 0 ? `${entries.length} items total` : undefined}
          badge={entries.length > 0 ? 'LOADED' : 'IDLE'}
          badgeType={entries.length > 0 ? 'success' : 'neutral'}
        />
        <StatCard label="Uncompressed Size" value={stats.uncompressedSize} />
        <StatCard label="Archive Size" value={stats.archiveSize} />
        <StatCard label="Compression Ratio" value={stats.compressionRatio} subValue="Space saved" />
      </div>

      {/* Main Container */}
      <div className="p-5 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
        {entries.length === 0 ? (
          <div className="space-y-4">
            <FileUploader
              onFilesSelected={handleZipFileUploaded}
              accept=".zip,application/zip,application/x-zip-compressed"
              label="Upload .ZIP Archive to Inspect & Extract"
              description="Inspect file trees, preview images and code files in-browser, and download unpacked assets."
            />
            {isExtracting && (
              <p className="text-center text-xs font-bold text-[var(--c-gold)] animate-pulse">
                Unpacking archive in browser memory...
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--c-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] flex items-center justify-center text-[var(--c-gold)]">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--c-text)]">{zipFileName}</h3>
                  <p className="text-xs text-[var(--c-muted)] font-mono">
                    {formatFileSize(zipFileSize)} • {stats.filesCount} files
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  className="px-4 py-2 rounded-xl bg-[var(--c-gold)] hover:brightness-110 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" /> Download All Files
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Close
                </button>
              </div>
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--c-subtle)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search archive file path, name, or extension..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] text-xs focus:ring-1 focus:ring-[var(--c-gold)] outline-none"
              />
            </div>

            {/* Split View: File Tree + Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* File List Table (7 cols) */}
              <div className="lg:col-span-7 p-3 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] max-h-[420px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[var(--c-subtle)] font-medium border-b border-[var(--c-border)]">
                    <tr>
                      <th className="py-2 px-2.5">File / Path</th>
                      <th className="py-2 px-2.5 w-24">Size</th>
                      <th className="py-2 px-2.5 w-20 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--c-border)] font-mono">
                    {filteredEntries.map((item, idx) => (
                      <tr
                        key={idx}
                        onClick={() => handlePreviewEntry(item)}
                        className={`hover:bg-[var(--c-card)]/60 cursor-pointer transition-colors ${
                          selectedFilePreview?.path === item.path ? 'bg-[var(--c-card)] font-bold' : ''
                        }`}
                      >
                        <td className="py-2.5 px-2.5 flex items-center gap-2 text-[var(--c-text)]">
                          {item.isDir ? (
                            <FolderOpen className="w-3.5 h-3.5 text-[var(--c-gold)] shrink-0" />
                          ) : (
                            <File className="w-3.5 h-3.5 text-[var(--c-subtle)] shrink-0" />
                          )}
                          <span className="truncate">{item.path}</span>
                        </td>
                        <td className="py-2.5 px-2.5 text-[var(--c-muted)] text-[11px]">
                          {item.isDir ? '-' : formatFileSize(item.size)}
                        </td>
                        <td className="py-2.5 px-2.5 text-right">
                          {!item.isDir && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadEntry(item);
                              }}
                              className="p-1 rounded hover:bg-[var(--c-surface)] text-[var(--c-gold)]"
                              title="Download File"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Preview Panel (5 cols) */}
              <div className="lg:col-span-5 p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--c-border)]">
                    <span className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[var(--c-gold)]" /> In-Browser Preview
                    </span>
                    {selectedFilePreview && (
                      <span className="text-[11px] font-mono text-[var(--c-muted)]">
                        {formatFileSize(selectedFilePreview.size)}
                      </span>
                    )}
                  </div>

                  {!selectedFilePreview ? (
                    <div className="text-center py-16 text-xs text-[var(--c-subtle)] italic">
                      Click any file from the table to preview content.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-mono text-xs font-bold text-[var(--c-gold)] truncate">
                        {selectedFilePreview.path}
                      </p>

                      {selectedFilePreview.type === 'image' && (
                        <div className="p-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] flex items-center justify-center">
                          <img
                            src={selectedFilePreview.content}
                            alt="Preview"
                            className="max-h-[240px] object-contain rounded-lg shadow-sm"
                          />
                        </div>
                      )}

                      {selectedFilePreview.type === 'text' && (
                        <pre className="p-3 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs max-h-[250px] overflow-y-auto whitespace-pre-wrap">
                          {selectedFilePreview.content}
                        </pre>
                      )}

                      {selectedFilePreview.type === 'binary' && (
                        <div className="p-6 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-center text-xs text-[var(--c-muted)]">
                          {selectedFilePreview.content}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <PostCompletionRecommendations currentToolId="zip-extractor" onReset={handleReset} />
    </div>
  );
};
