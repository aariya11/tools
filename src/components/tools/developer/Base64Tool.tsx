import React, { useState, useMemo } from 'react';
import {
  Copy,
  Download,
  Trash2,
  Binary,
  Check,
  Upload,
  ArrowRightLeft,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob, formatFileSize } from '../../../utils/fileUtils';

export const Base64Tool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [textMode, setTextMode] = useState<'encode' | 'decode'>('encode');
  const [urlSafe, setUrlSafe] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>('ToolBoxX Developer Suite 🚀 — 100% Client Side Security & Fast Encoding!');
  
  // File mode state
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl: string;
    rawBase64: string;
  } | null>(null);
  const [fileOutputFormat, setFileOutputFormat] = useState<'dataUri' | 'raw' | 'html' | 'css'>('dataUri');
  const [copied, setCopied] = useState<boolean>(false);

  // UTF-8 safe encode/decode
  const textOutput = useMemo(() => {
    if (!textInput) return { result: '', error: null };
    try {
      if (textMode === 'encode') {
        const bytes = new TextEncoder().encode(textInput);
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        let encoded = btoa(binary);
        if (urlSafe) {
          encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
        return { result: encoded, error: null };
      } else {
        let clean = textInput.trim();
        if (urlSafe || clean.includes('-') || clean.includes('_')) {
          clean = clean.replace(/-/g, '+').replace(/_/g, '/');
          while (clean.length % 4) {
            clean += '=';
          }
        }
        const binary = atob(clean);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const decoded = new TextDecoder().decode(bytes);
        return { result: decoded, error: null };
      }
    } catch (err) {
      return {
        result: '',
        error: err instanceof Error ? err.message : 'Invalid Base64 string for decoding'
      };
    }
  }, [textInput, textMode, urlSafe]);

  // Statistics
  const stats = useMemo(() => {
    if (activeTab === 'text') {
      const inputBytes = new Blob([textInput]).size;
      const outputBytes = new Blob([textOutput.result]).size;
      const overhead = inputBytes > 0 && textMode === 'encode' ? `+${(((outputBytes - inputBytes) / inputBytes) * 100).toFixed(1)}%` : '-';
      return {
        inputSize: formatFileSize(inputBytes),
        outputSize: formatFileSize(outputBytes),
        ratio: overhead,
        mode: textMode === 'encode' ? 'Encode (UTF-8)' : 'Decode (UTF-8)'
      };
    } else {
      if (!uploadedFile) {
        return {
          inputSize: '0 B',
          outputSize: '0 B',
          ratio: '~ +33.3%',
          mode: 'File to Base64'
        };
      }
      const b64Bytes = uploadedFile.rawBase64.length;
      return {
        inputSize: formatFileSize(uploadedFile.size),
        outputSize: formatFileSize(b64Bytes),
        ratio: `+${(((b64Bytes - uploadedFile.size) / uploadedFile.size) * 100).toFixed(1)}%`,
        mode: uploadedFile.type || 'binary/data'
      };
    }
  }, [activeTab, textInput, textOutput, textMode, uploadedFile]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const rawBase64 = dataUrl.split(',')[1] || '';
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl,
        rawBase64
      });
      showToast({ type: 'success', title: 'File Encoded', message: `${file.name} converted to Base64` });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getFormattedFileOutput = (): string => {
    if (!uploadedFile) return '';
    if (fileOutputFormat === 'dataUri') return uploadedFile.dataUrl;
    if (fileOutputFormat === 'raw') return uploadedFile.rawBase64;
    if (fileOutputFormat === 'html') {
      return `<img src="${uploadedFile.dataUrl}" alt="${uploadedFile.name}" />`;
    }
    if (fileOutputFormat === 'css') {
      return `background-image: url('${uploadedFile.dataUrl}');`;
    }
    return uploadedFile.dataUrl;
  };

  const handleCopy = () => {
    const content = activeTab === 'text' ? textOutput.result : getFormattedFileOutput();
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    showToast({ type: 'success', title: 'Copied to Clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (activeTab === 'text') {
      if (!textOutput.result) return;
      const ext = textMode === 'encode' ? 'txt' : 'txt';
      const blob = new Blob([textOutput.result], { type: 'text/plain;charset=utf-8' });
      downloadBlob(blob, `toolboxx_${textMode}d.${ext}`);
      showToast({ type: 'success', title: 'Saved as text file' });
    } else {
      if (!uploadedFile) return;
      // Convert base64 back to binary blob and download
      try {
        const byteCharacters = atob(uploadedFile.rawBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: uploadedFile.type });
        downloadBlob(blob, `exported_${uploadedFile.name}`);
        showToast({ type: 'success', title: 'File Downloaded', message: uploadedFile.name });
      } catch {
        showToast({ type: 'error', title: 'Export Failed', message: 'Could not reconstruct binary file' });
      }
    }
  };

  const handleSwapModes = () => {
    if (textOutput.result && !textOutput.error) {
      setTextInput(textOutput.result);
      setTextMode(textMode === 'encode' ? 'decode' : 'encode');
    } else {
      setTextMode(textMode === 'encode' ? 'decode' : 'encode');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Active Mode"
          value={activeTab === 'text' ? (textMode === 'encode' ? 'Text Encode' : 'Text Decode') : 'File Encode'}
          badge={activeTab === 'text' ? (urlSafe ? 'URL-Safe' : 'Standard') : 'Binary'}
          badgeType="neutral"
        />
        <StatCard label="Input Size" value={stats.inputSize} />
        <StatCard label="Output Size" value={stats.outputSize} />
        <StatCard label="Overhead / Ratio" value={stats.ratio} subValue="~33% Base64 expansion" />
      </div>

      {/* Main Container */}
      <div className="p-5 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--c-border)]">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)]">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'text'
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Text Strings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('file')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'file'
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Binary File & Image
            </button>
          </div>

          {activeTab === 'text' && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={(e) => setUrlSafe(e.target.checked)}
                  className="rounded accent-[var(--c-gold)]"
                />
                URL-Safe Base64 (- and _)
              </label>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)]">
                <button
                  type="button"
                  onClick={() => setTextMode('encode')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    textMode === 'encode'
                      ? 'bg-[var(--c-card)] text-[var(--c-text)] shadow-sm'
                      : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
                  }`}
                >
                  Encode
                </button>
                <button
                  type="button"
                  onClick={() => setTextMode('decode')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    textMode === 'decode'
                      ? 'bg-[var(--c-card)] text-[var(--c-text)] shadow-sm'
                      : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
                  }`}
                >
                  Decode
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Text Mode */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Input Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--c-muted)]">
                  <span>{textMode === 'encode' ? 'Plain Text (UTF-8)' : 'Base64 Input'}</span>
                  <span>{textInput.length} chars</span>
                </div>
                <textarea
                  rows={10}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={textMode === 'encode' ? 'Type or paste text to encode...' : 'Paste Base64 string to decode...'}
                  className="w-full p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] font-mono text-xs leading-relaxed focus:ring-2 focus:ring-[var(--c-gold)] outline-none resize-y shadow-inner"
                  spellCheck={false}
                />
              </div>

              {/* Output Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--c-muted)]">
                  <span className="text-[var(--c-gold)]">
                    {textMode === 'encode' ? 'Base64 Encoded Output' : 'Decoded Plain Text'}
                  </span>
                  <span>{textOutput.result ? `${textOutput.result.length} chars` : '0 chars'}</span>
                </div>
                <textarea
                  rows={10}
                  readOnly
                  value={textOutput.error ? `Error: ${textOutput.error}` : textOutput.result}
                  placeholder="Output will appear here..."
                  className={`w-full p-4 rounded-2xl border ${
                    textOutput.error ? 'border-rose-700 bg-rose-950/20 text-rose-300' : 'border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]'
                  } font-mono text-xs leading-relaxed outline-none resize-y shadow-inner opacity-95`}
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Middle Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSwapModes}
                  className="px-3 py-1.5 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Swap & Reverse
                </button>
                {textInput && (
                  <button
                    type="button"
                    onClick={() => setTextInput('')}
                    className="px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!textOutput.result}
                  className="px-3 py-2 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!textOutput.result}
                  className="px-4 py-2 rounded-xl bg-[var(--c-gold)] hover:brightness-110 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-40 transition-all active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Output'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File & Image Mode */}
        {activeTab === 'file' && (
          <div className="space-y-6">
            {!uploadedFile ? (
              <label className="border-2 border-dashed border-[var(--c-border)] hover:border-[var(--c-gold)] rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[var(--c-surface)]">
                <Upload className="w-10 h-10 text-[var(--c-gold)] mb-3 animate-bounce" />
                <h3 className="font-bold text-sm text-[var(--c-text)] mb-1">
                  Upload any Image, Document, or Binary File
                </h3>
                <p className="text-xs text-[var(--c-muted)] max-w-sm mb-4">
                  PNG, JPG, SVG, WEBP, PDF, Audio, Video, ZIP, or fonts. Everything converts 100% locally in your browser.
                </p>
                <span className="px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-bold text-[var(--c-text)] shadow-sm">
                  Browse File
                </span>
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
            ) : (
              <div className="space-y-5">
                {/* File Metadata & Preview Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {uploadedFile.type.startsWith('image/') ? (
                      <img
                        src={uploadedFile.dataUrl}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-xl border border-[var(--c-border)] shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] flex items-center justify-center text-[var(--c-gold)] shrink-0">
                        <Binary className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-[var(--c-text)] break-all">{uploadedFile.name}</h4>
                      <p className="text-xs text-[var(--c-muted)] font-mono">
                        {formatFileSize(uploadedFile.size)} • {uploadedFile.type || 'application/octet-stream'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3 h-3" /> Change File
                      <input type="file" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-[var(--c-card)] transition-colors"
                      title="Remove File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Output Snippet Selector */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)]">
                      {(
                        [
                          { id: 'dataUri', label: 'Data URI' },
                          { id: 'raw', label: 'Raw Base64' },
                          { id: 'html', label: 'HTML <img>' },
                          { id: 'css', label: 'CSS Background' }
                        ] as const
                      ).map((fmt) => (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setFileOutputFormat(fmt.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            fileOutputFormat === fmt.id
                              ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                              : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="px-3 py-1.5 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Export File
                      </button>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="px-4 py-1.5 rounded-xl bg-[var(--c-gold)] hover:brightness-110 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy Code'}
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={8}
                    readOnly
                    value={getFormattedFileOutput()}
                    className="w-full p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] font-mono text-xs leading-relaxed outline-none resize-y shadow-inner"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <PostCompletionRecommendations
        currentToolId="base64-encoder"
        onReset={() => {
          setTextInput('');
          setUploadedFile(null);
        }}
      />
    </div>
  );
};
