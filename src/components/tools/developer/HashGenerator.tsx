import React, { useState, useEffect } from 'react';
import {
  Copy,
  FileCheck,
  Check,
  Key,
  Layers,
  FileCode
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import {
  calculateHash,
  bufferToHex,
  bufferToBase64,
  md5,
  hmacMd5,
  calculateHmac
} from '../../../utils/cryptoUtils';

type SupportedAlgo = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

interface HashItem {
  algo: SupportedAlgo;
  label: string;
  bitLength: number;
  hex: string;
  base64: string;
}

export const HashGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [textInput, setTextInput] = useState<string>('ToolBoxX Web Suite 2026');
  const [hmacKey, setHmacKey] = useState<string>('');
  const [isUppercase, setIsUppercase] = useState<boolean>(false);
  const [copiedAlgo, setCopiedAlgo] = useState<string | null>(null);

  // File hashing state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileProgress, setFileProgress] = useState<number>(0);
  const [expectedHash, setExpectedHash] = useState<string>('');

  // Results
  const [hashes, setHashes] = useState<HashItem[]>([]);

  // Compute text hashes
  useEffect(() => {
    let isCancelled = false;

    async function computeAll() {
      if (!textInput && !hmacKey) {
        setHashes([]);
        return;
      }

      const results: HashItem[] = [];

      // MD5
      const md5Hex = hmacKey ? hmacMd5(hmacKey, textInput) : md5(textInput);
      const md5Base64 = btoa(
        md5Hex.match(/\w{2}/g)?.map((a) => String.fromCharCode(parseInt(a, 16))).join('') || ''
      );
      results.push({ algo: 'MD5', label: 'MD5 (128-bit)', bitLength: 128, hex: md5Hex, base64: md5Base64 });

      // Web Crypto API Algorithms
      const webCryptoAlgos: ('SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512')[] = [
        'SHA-1',
        'SHA-256',
        'SHA-384',
        'SHA-512'
      ];

      for (const algo of webCryptoAlgos) {
        let buffer: ArrayBuffer;
        if (hmacKey) {
          buffer = await calculateHmac(algo, hmacKey, textInput);
        } else {
          buffer = await calculateHash(algo, textInput);
        }

        const hex = bufferToHex(buffer);
        const b64 = bufferToBase64(buffer);
        const bitLength = algo === 'SHA-1' ? 160 : algo === 'SHA-256' ? 256 : algo === 'SHA-384' ? 384 : 512;

        results.push({ algo, label: `${algo} (${bitLength}-bit)`, bitLength, hex, base64: b64 });
      }

      if (!isCancelled) {
        setHashes(results);
      }
    }

    if (activeTab === 'text') {
      computeAll();
    }

    return () => {
      isCancelled = true;
    };
  }, [textInput, hmacKey, activeTab]);

  // Compute file hashes
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFileProgress(20);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      setFileProgress(60);

      const results: HashItem[] = [];

      // MD5
      const uint8 = new Uint8Array(buffer);
      let binaryStr = '';
      for (let i = 0; i < uint8.length; i++) {
        binaryStr += String.fromCharCode(uint8[i]);
      }
      const md5Hex = md5(binaryStr);
      results.push({ algo: 'MD5', label: 'MD5 (128-bit)', bitLength: 128, hex: md5Hex, base64: '' });

      // SHA digests
      const shaAlgos: ('SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512')[] = [
        'SHA-1',
        'SHA-256',
        'SHA-384',
        'SHA-512'
      ];

      for (const algo of shaAlgos) {
        const hashBuf = await calculateHash(algo, buffer);
        const hex = bufferToHex(hashBuf);
        const bitLength = algo === 'SHA-1' ? 160 : algo === 'SHA-256' ? 256 : algo === 'SHA-384' ? 384 : 512;
        results.push({ algo, label: `${algo} (${bitLength}-bit)`, bitLength, hex, base64: bufferToBase64(hashBuf) });
      }

      setHashes(results);
      setFileProgress(100);
      showToast({ type: 'success', title: 'File Hashes Calculated', message: file.name });
    };

    reader.readAsArrayBuffer(file);
  };

  const handleCopy = (val: string, algo: string) => {
    const output = isUppercase ? val.toUpperCase() : val.toLowerCase();
    navigator.clipboard.writeText(output);
    setCopiedAlgo(algo);
    showToast({ type: 'success', title: `Copied ${algo} Digest` });
    setTimeout(() => setCopiedAlgo(null), 2000);
  };

  // Match check for file integrity
  const isMatch = (hashHex: string) => {
    if (!expectedHash.trim()) return null;
    return hashHex.toLowerCase() === expectedHash.trim().toLowerCase();
  };

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Active Engine"
          value={hmacKey ? 'HMAC Mode' : 'Standard Digest'}
          badge={hashes.length > 0 ? `${hashes.length} Hashes` : 'Idle'}
          badgeType="neutral"
        />
        <StatCard label="Strongest Algorithm" value="SHA-512" subValue="512-bit military grade" />
        <StatCard
          label="SHA-256 Digest"
          value={hashes.find((h) => h.algo === 'SHA-256') ? 'Calculated' : 'Waiting'}
          badge={hashes.find((h) => h.algo === 'SHA-256') ? 'READY' : 'PENDING'}
          badgeType={hashes.find((h) => h.algo === 'SHA-256') ? 'success' : 'neutral'}
        />
        <StatCard label="Casing Standard" value={isUppercase ? 'UPPERCASE' : 'lowercase'} />
      </div>

      {/* Main Workspace Card */}
      <div className="p-5 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
        {/* Navigation Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--c-border)]">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)]">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'text'
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" /> Text String Hash
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('file')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'file'
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" /> File Checksum
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--c-text)]">
            <input
              type="checkbox"
              checked={isUppercase}
              onChange={(e) => setIsUppercase(e.target.checked)}
              className="rounded accent-[var(--c-gold)]"
            />
            UPPERCASE Hex Output
          </label>
        </div>

        {/* Text Mode */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--c-muted)]">Input Text String</label>
              <textarea
                rows={4}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type or paste text to generate cryptographic hashes..."
                className="w-full p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] font-mono text-xs leading-relaxed focus:ring-2 focus:ring-[var(--c-gold)] outline-none resize-y"
              />
            </div>

            {/* Optional HMAC Secret Key */}
            <div className="p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--c-text)] shrink-0">
                <Key className="w-4 h-4 text-[var(--c-gold)]" />
                <span>HMAC Secret Key (Optional):</span>
              </div>
              <input
                type="text"
                value={hmacKey}
                onChange={(e) => setHmacKey(e.target.value)}
                placeholder="Leave empty for standard hash, or enter key for HMAC..."
                className="flex-1 px-3.5 py-1.5 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs focus:ring-1 focus:ring-[var(--c-gold)] outline-none min-w-[200px]"
              />
              {hmacKey && (
                <button
                  type="button"
                  onClick={() => setHmacKey('')}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Clear Key
                </button>
              )}
            </div>
          </div>
        )}

        {/* File Mode */}
        {activeTab === 'file' && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl border-2 border-dashed border-[var(--c-border)] bg-[var(--c-surface)] text-center space-y-3">
              <input
                type="file"
                id="file-hash-input"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-hash-input"
                className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--c-gold)] text-[var(--c-bg)] font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <FileCheck className="w-4 h-4" /> Select Any File to Calculate Checksums
              </label>
              {selectedFile && (
                <div className="space-y-2">
                  <p className="text-xs font-mono text-[var(--c-text)]">
                    Selected: <strong>{selectedFile.name}</strong> ({selectedFile.size.toLocaleString()} bytes)
                  </p>
                  {fileProgress > 0 && fileProgress < 100 && (
                    <div className="w-full bg-[var(--c-card)] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[var(--c-gold)] h-full transition-all duration-300" style={{ width: `${fileProgress}%` }} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Checksum Matching Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--c-muted)]">Verify Against Expected Checksum (Optional)</label>
              <input
                type="text"
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
                placeholder="Paste expected MD5/SHA-256 hash to verify file integrity..."
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs focus:ring-1 focus:ring-[var(--c-gold)] outline-none"
              />
            </div>
          </div>
        )}

        {/* Hash Results Strip */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[var(--c-gold)]" /> Computed Hash Digests ({hashes.length})
          </h4>

          <div className="space-y-3">
            {hashes.map((item) => {
              const hexVal = isUppercase ? item.hex.toUpperCase() : item.hex.toLowerCase();
              const matchStatus = isMatch(item.hex);

              return (
                <div
                  key={item.algo}
                  className={`p-4 rounded-2xl border transition-all ${
                    matchStatus === true
                      ? 'bg-emerald-950/20 border-emerald-600'
                      : matchStatus === false
                      ? 'bg-[var(--c-surface)] border-[var(--c-border)]'
                      : 'bg-[var(--c-surface)] border-[var(--c-border)] hover:border-[var(--c-gold)]/40'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[var(--c-text)]">{item.label}</span>
                      {matchStatus === true && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1">
                          <Check className="w-3 h-3" /> MATCH
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.hex, item.algo)}
                      className="px-3 py-1 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-xs font-semibold flex items-center gap-1 text-[var(--c-text)]"
                    >
                      {copiedAlgo === item.algo ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedAlgo === item.algo ? 'Copied' : 'Copy Hex'}
                    </button>
                  </div>

                  <p className="font-mono text-xs font-semibold text-[var(--c-gold)] break-all select-all pt-1">
                    {hexVal}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <PostCompletionRecommendations
        currentToolId="hash-generator"
        onReset={() => {
          setTextInput('');
          setHmacKey('');
          setSelectedFile(null);
        }}
      />
    </div>
  );
};
