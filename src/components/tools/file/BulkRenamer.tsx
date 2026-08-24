import React, { useState, useMemo } from 'react';
import JSZip from 'jszip';
import {
  Trash2,
  Sliders,
  AlertTriangle,
  ArrowRight,
  Layers,
  Archive
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob, formatFileSize } from '../../../utils/fileUtils';
import { FileUploader } from '../../common/FileUploader';

interface UploadedItem {
  id: string;
  file: File;
  originalName: string;
  extension: string;
  nameWithoutExt: string;
  size: number;
}

export const BulkRenamer: React.FC = () => {
  const [files, setFiles] = useState<UploadedItem[]>([]);
  const [prefix, setPrefix] = useState<string>('');
  const [suffix, setSuffix] = useState<string>('');
  const [searchPattern, setSearchPattern] = useState<string>('');
  const [replaceWith, setReplaceWith] = useState<string>('');
  const [useRegex, setUseRegex] = useState<boolean>(false);
  const [caseMode, setCaseMode] = useState<'none' | 'lower' | 'upper' | 'title' | 'kebab' | 'snake'>('none');
  const [useNumbering, setUseNumbering] = useState<boolean>(false);
  const [numberPrefix, setNumberPrefix] = useState<string>('file_');
  const [startIndex, setStartIndex] = useState<number>(1);
  const [paddingDigits, setPaddingDigits] = useState<number>(2); // 01, 001
  const [spaceReplacement, setSpaceReplacement] = useState<'none' | 'dash' | 'underscore'>('none');
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const handleFilesAdded = (uploadedFiles: File[]) => {
    const newItems: UploadedItem[] = uploadedFiles.map((file) => {
      const parts = file.name.split('.');
      const ext = parts.length > 1 ? `.${parts.pop()}` : '';
      const nameWithoutExt = parts.join('.');
      return {
        id: Math.random().toString(36).slice(2),
        file,
        originalName: file.name,
        extension: ext,
        nameWithoutExt,
        size: file.size
      };
    });

    setFiles((prev) => [...prev, ...newItems]);
    showToast({ type: 'success', title: `${uploadedFiles.length} Files Added for Renaming` });
  };

  // Compute renamed preview for each file
  const renamedList = useMemo(() => {
    return files.map((item, idx) => {
      let baseName = item.nameWithoutExt;

      // 1. Sequential numbering mode
      if (useNumbering) {
        const numStr = String(startIndex + idx).padStart(paddingDigits, '0');
        baseName = `${numberPrefix}${numStr}`;
      } else {
        // 2. Search & Replace
        if (searchPattern) {
          try {
            if (useRegex) {
              const re = new RegExp(searchPattern, 'g');
              baseName = baseName.replace(re, replaceWith);
            } else {
              baseName = baseName.split(searchPattern).join(replaceWith);
            }
          } catch {
            // Fallback on regex error
          }
        }

        // 3. Space replacements
        if (spaceReplacement === 'dash') {
          baseName = baseName.replace(/\s+/g, '-');
        } else if (spaceReplacement === 'underscore') {
          baseName = baseName.replace(/\s+/g, '_');
        }

        // 4. Case conversion
        if (caseMode === 'lower') baseName = baseName.toLowerCase();
        else if (caseMode === 'upper') baseName = baseName.toUpperCase();
        else if (caseMode === 'title') {
          baseName = baseName.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
        } else if (caseMode === 'kebab') {
          baseName = baseName.trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '').toLowerCase();
        } else if (caseMode === 'snake') {
          baseName = baseName.trim().replace(/\s+/g, '_').replace(/[^\w_]/g, '').toLowerCase();
        }

        // 5. Prefix & Suffix
        baseName = `${prefix}${baseName}${suffix}`;
      }

      const newFullName = `${baseName}${item.extension}`;
      return {
        ...item,
        newName: newFullName,
        isChanged: newFullName !== item.originalName
      };
    });
  }, [
    files,
    prefix,
    suffix,
    searchPattern,
    replaceWith,
    useRegex,
    caseMode,
    useNumbering,
    numberPrefix,
    startIndex,
    paddingDigits,
    spaceReplacement
  ]);

  // Check duplicate names
  const duplicateWarnings = useMemo(() => {
    const counts = new Map<string, number>();
    renamedList.forEach((f) => counts.set(f.newName, (counts.get(f.newName) || 0) + 1));
    return renamedList.filter((f) => (counts.get(f.newName) || 0) > 1);
  }, [renamedList]);

  // Export all renamed files in ZIP
  const handleDownloadRenamedZip = async () => {
    if (renamedList.length === 0) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      renamedList.forEach((item) => {
        zip.file(item.newName, item.file);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      downloadBlob(zipBlob, 'renamed_files.zip');
      setIsZipping(false);
      showToast({ type: 'success', title: 'Renamed ZIP Downloaded' });
    } catch {
      setIsZipping(false);
      showToast({ type: 'error', title: 'Could not create ZIP archive' });
    }
  };

  const handleClear = () => {
    setFiles([]);
    setPrefix('');
    setSuffix('');
    setSearchPattern('');
    setReplaceWith('');
  };

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Uploaded Files" value={files.length.toLocaleString()} />
        <StatCard
          label="Renamed Files"
          value={renamedList.filter((f) => f.isChanged).length.toLocaleString()}
          badge={renamedList.filter((f) => f.isChanged).length > 0 ? 'MODIFIED' : 'ORIGINAL'}
          badgeType="neutral"
        />
        <StatCard
          label="Name Collisions"
          value={duplicateWarnings.length > 0 ? `${duplicateWarnings.length} duplicates` : '0 Collisions'}
          badge={duplicateWarnings.length > 0 ? 'WARNING' : 'SAFE'}
          badgeType={duplicateWarnings.length > 0 ? 'warning' : 'success'}
        />
        <StatCard
          label="Total Payload Size"
          value={formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}
        />
      </div>

      {/* Main Workspace Card */}
      <div className="p-5 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
        {files.length === 0 ? (
          <FileUploader
            accept="*"
            onFilesSelected={handleFilesAdded}
            multiple={true}
            label="Upload Files to Bulk Rename"
            description="Add prefix, suffix, sequential numbering, search & replace, or change letter case in real time."
          />
        ) : (
          <div className="space-y-6">
            {/* Rules Configuration Panel */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--c-border)]">
                <span className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Renaming Rules & Modifiers
                </span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Files
                </button>
              </div>

              {/* Sequential Numbering Mode Toggle */}
              <div className="p-3.5 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] flex flex-wrap items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[var(--c-text)]">
                  <input
                    type="checkbox"
                    checked={useNumbering}
                    onChange={(e) => setUseNumbering(e.target.checked)}
                    className="rounded accent-[var(--c-gold)]"
                  />
                  Sequential Numbering Template (e.g. file_01.ext, file_02.ext)
                </label>

                {useNumbering && (
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[var(--c-muted)]">Base Name:</span>
                      <input
                        type="text"
                        value={numberPrefix}
                        onChange={(e) => setNumberPrefix(e.target.value)}
                        placeholder="photo_"
                        className="px-2 py-1 rounded-lg bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs w-28"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[var(--c-muted)]">Start:</span>
                      <input
                        type="number"
                        min="0"
                        value={startIndex}
                        onChange={(e) => setStartIndex(Number(e.target.value))}
                        className="px-2 py-1 rounded-lg bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs w-16"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[var(--c-muted)]">Digits:</span>
                      <select
                        value={paddingDigits}
                        onChange={(e) => setPaddingDigits(Number(e.target.value))}
                        className="px-2 py-1 rounded-lg bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] text-xs"
                      >
                        <option value={1}>1, 2, 3</option>
                        <option value={2}>01, 02, 03</option>
                        <option value={3}>001, 002, 003</option>
                        <option value={4}>0001, 0002</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {!useNumbering && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Prefix / Suffix */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--c-muted)]">Prefix & Suffix</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        placeholder="Prefix (e.g. IMG_)"
                        className="w-1/2 px-3 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs outline-none"
                      />
                      <input
                        type="text"
                        value={suffix}
                        onChange={(e) => setSuffix(e.target.value)}
                        placeholder="Suffix (e.g. _v2)"
                        className="w-1/2 px-3 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Search & Replace */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[var(--c-muted)]">Search & Replace</span>
                      <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useRegex}
                          onChange={(e) => setUseRegex(e.target.checked)}
                          className="rounded accent-[var(--c-gold)]"
                        />
                        Regex
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={searchPattern}
                        onChange={(e) => setSearchPattern(e.target.value)}
                        placeholder="Search text"
                        className="w-1/2 px-3 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs outline-none"
                      />
                      <input
                        type="text"
                        value={replaceWith}
                        onChange={(e) => setReplaceWith(e.target.value)}
                        placeholder="Replace with"
                        className="w-1/2 px-3 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Case Transformation & Spaces */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--c-muted)]">Case & Formatting</label>
                    <div className="flex items-center gap-2">
                      <select
                        value={caseMode}
                        onChange={(e) => setCaseMode(e.target.value as typeof caseMode)}
                        className="w-1/2 px-2.5 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] text-xs outline-none"
                      >
                        <option value="none">Preserve Case</option>
                        <option value="lower">lowercase</option>
                        <option value="upper">UPPERCASE</option>
                        <option value="title">Title Case</option>
                        <option value="kebab">kebab-case</option>
                        <option value="snake">snake_case</option>
                      </select>
                      <select
                        value={spaceReplacement}
                        onChange={(e) => setSpaceReplacement(e.target.value as typeof spaceReplacement)}
                        className="w-1/2 px-2.5 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] text-xs outline-none"
                      >
                        <option value="none">Spaces (Normal)</option>
                        <option value="dash">Spaces to -</option>
                        <option value="underscore">Spaces to _</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Duplicate Warning Notification */}
            {duplicateWarnings.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/50 text-amber-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Warning: Multiple files will resolve to the same name (
                  <strong className="font-mono">{duplicateWarnings[0].newName}</strong>). Adjust numbering or rules to prevent overwriting.
                </span>
              </div>
            )}

            {/* Live Before & After Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Live Before / After Comparison ({files.length} Files)
              </h4>

              <div className="p-3 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] max-h-[380px] overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[var(--c-subtle)] font-sans font-medium border-b border-[var(--c-border)]">
                    <tr>
                      <th className="py-2 px-3">Original Filename</th>
                      <th className="py-2 px-3 w-8 text-center"></th>
                      <th className="py-2 px-3">New Proposed Filename</th>
                      <th className="py-2 px-3 w-24 text-right">Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--c-border)]">
                    {renamedList.map((item) => (
                      <tr key={item.id} className="hover:bg-[var(--c-card)]/50 transition-colors">
                        <td className="py-2.5 px-3 text-[var(--c-muted)] truncate max-w-[200px]">
                          {item.originalName}
                        </td>
                        <td className="py-2.5 px-3 text-center text-[var(--c-subtle)]">
                          <ArrowRight className="w-3.5 h-3.5 inline" />
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[var(--c-gold)] truncate max-w-[240px]">
                          {item.newName}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[11px] text-[var(--c-subtle)]">
                          {formatFileSize(item.size)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Download Bottom Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-[var(--c-subtle)]">
                {renamedList.filter((f) => f.isChanged).length} of {files.length} files modified
              </span>

              <button
                type="button"
                onClick={handleDownloadRenamedZip}
                disabled={files.length === 0 || isZipping}
                className="px-5 py-2.5 rounded-xl bg-[var(--c-gold)] hover:brightness-110 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-40 transition-all active:scale-95"
              >
                <Archive className="w-4 h-4" /> Download Renamed Files (.ZIP)
              </button>
            </div>
          </div>
        )}
      </div>

      <PostCompletionRecommendations currentToolId="bulk-renamer" onReset={handleClear} />
    </div>
  );
};
