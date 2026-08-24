import React, { useState, useEffect, useCallback } from 'react';
import {
  KeyRound,
  Copy,
  RefreshCw,
  ShieldCheck,
  Download,
  Sliders,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  History
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

type PasswordMode = 'random' | 'passphrase' | 'pin';

const WORD_LIST = [
  'apple', 'banana', 'bridge', 'castle', 'cloud', 'dragon', 'eagle', 'forest',
  'galaxy', 'harbor', 'island', 'jungle', 'knight', 'lemon', 'matrix', 'neon',
  'ocean', 'planet', 'quantum', 'river', 'shadow', 'tiger', 'unity', 'valley',
  'wizard', 'zenith', 'anchor', 'breeze', 'canyon', 'dawn', 'ember', 'falcon',
  'glacier', 'horizon', 'impact', 'jupiter', 'kinetic', 'lotus', 'mystic', 'nexus',
  'orbit', 'phoenix', 'quasar', 'radar', 'safari', 'thunder', 'ultra', 'vortex',
];

export const PasswordGenerator: React.FC = () => {
  const [mode, setMode] = useState<PasswordMode>('random');

  // Random mode options
  const [length, setLength] = useState<number>(18);
  const [useUpper, setUseUpper] = useState<boolean>(true);
  const [useLower, setUseLower] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);

  // Passphrase options
  const [wordCount, setWordCount] = useState<number>(4);
  const [wordSeparator, setWordSeparator] = useState<string>('-');
  const [capitalizeWords, setCapitalizeWords] = useState<boolean>(true);
  const [appendNumber, setAppendNumber] = useState<boolean>(true);

  // PIN options
  const [pinLength, setPinLength] = useState<number>(6);

  // Primary output & bulk
  const [password, setPassword] = useState<string>('');
  const [bulkCount, setBulkCount] = useState<number>(5);
  const [bulkList, setBulkList] = useState<string[]>([]);
  const [showBulk, setShowBulk] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState<boolean>(true);

  // Cryptographically Secure Character Pool Generator
  const generateSinglePassword = useCallback((): string => {
    if (mode === 'pin') {
      const buffer = new Uint32Array(pinLength);
      window.crypto.getRandomValues(buffer);
      let pin = '';
      for (let i = 0; i < pinLength; i++) {
        pin += (buffer[i] % 10).toString();
      }
      return pin;
    }

    if (mode === 'passphrase') {
      const buffer = new Uint32Array(wordCount);
      window.crypto.getRandomValues(buffer);
      const chosenWords: string[] = [];
      for (let i = 0; i < wordCount; i++) {
        let w = WORD_LIST[buffer[i] % WORD_LIST.length];
        if (capitalizeWords) {
          w = w.charAt(0).toUpperCase() + w.slice(1);
        }
        chosenWords.push(w);
      }
      let res = chosenWords.join(wordSeparator);
      if (appendNumber) {
        const numBuf = new Uint32Array(1);
        window.crypto.getRandomValues(numBuf);
        res += `${wordSeparator}${(numBuf[0] % 900) + 100}`;
      }
      return res;
    }

    // Random Characters
    let chars = '';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (useUpper) chars += upper;
    if (useLower) chars += lower;
    if (useNumbers) chars += numbers;
    if (useSymbols) chars += symbols;

    if (excludeAmbiguous) {
      chars = chars.replace(/[0OolI1|\\]/g, '');
    }

    if (!chars) chars = lower;

    const buffer = new Uint32Array(length);
    window.crypto.getRandomValues(buffer);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[buffer[i] % chars.length];
    }
    return result;
  }, [
    mode,
    length,
    useUpper,
    useLower,
    useNumbers,
    useSymbols,
    excludeAmbiguous,
    wordCount,
    wordSeparator,
    capitalizeWords,
    appendNumber,
    pinLength,
  ]);

  // Regenerate primary password
  const regenerate = useCallback(() => {
    const newPass = generateSinglePassword();
    setPassword(newPass);
    setHistory((prev) => [newPass, ...prev.filter((p) => p !== newPass).slice(0, 9)]);

    if (showBulk) {
      const bulk: string[] = [];
      for (let i = 0; i < bulkCount; i++) {
        bulk.push(generateSinglePassword());
      }
      setBulkList(bulk);
    }
  }, [generateSinglePassword, showBulk, bulkCount]);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  // Calculate Entropy & Crack Time
  const calculateEntropy = (): { bits: number; crackTime: string; strength: string; score: number } => {
    if (!password) return { bits: 0, crackTime: 'Instant', strength: 'None', score: 0 };

    let poolSize = 0;
    if (mode === 'pin') {
      poolSize = 10;
    } else if (mode === 'passphrase') {
      poolSize = WORD_LIST.length;
    } else {
      if (useUpper) poolSize += 26;
      if (useLower) poolSize += 26;
      if (useNumbers) poolSize += 10;
      if (useSymbols) poolSize += 28;
    }

    const bits = Math.round(password.length * (Math.log2(poolSize || 26)));

    let crackTime = 'Instant';
    let strength = 'Very Weak';
    let score = 10;

    if (bits < 40) {
      crackTime = 'A few seconds';
      strength = 'Weak';
      score = 25;
    } else if (bits < 60) {
      crackTime = '2 months';
      strength = 'Fair';
      score = 50;
    } else if (bits < 80) {
      crackTime = '4,500 years';
      strength = 'Strong';
      score = 80;
    } else {
      crackTime = '12 billion years (Quantum-Resistant)';
      strength = 'Unbreakable';
      score = 100;
    }

    return { bits, crackTime, strength, score };
  };

  const { bits, crackTime, strength, score } = calculateEntropy();

  // Copy
  const handleCopy = async (textToCopy: string = password) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      confetti({ particleCount: 35, spread: 45, origin: { y: 0.8 } });
      showToast({ type: 'success', title: 'Password Copied', message: 'Copied secure password to clipboard.' });
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Could not copy to clipboard.' });
    }
  };

  const handleDownloadBulk = () => {
    if (bulkList.length === 0) return;
    const text = bulkList.join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, 'passwords.txt');
    showToast({ type: 'success', title: 'Downloaded', message: `Saved ${bulkList.length} passwords.` });
  };

  return (
    <div className="space-y-8">
      {/* Mode Selector */}
      <div className="grid grid-cols-3 gap-2 bg-[var(--c-surface)] p-2 rounded-2xl border border-[var(--c-border)]">
        {(
          [
            { id: 'random', label: 'Random Characters', icon: Lock },
            { id: 'passphrase', label: 'Memorable Passphrase', icon: Sparkles },
            { id: 'pin', label: 'Numeric PIN', icon: KeyRound },
          ] as const
        ).map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--c-card)] border border-[var(--c-gold)] text-[var(--c-text)] shadow-md'
                  : 'text-[var(--c-muted)] hover:bg-[var(--c-card)] hover:text-[var(--c-text)] border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 text-[var(--c-gold)]" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Generator Display on Top / Left, Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Password Display & Security Analysis */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Password Showcase Box */}
          <div className="bg-[var(--c-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] space-y-5 text-center flex flex-col items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-mono text-[var(--c-muted)] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                CSPRNG High-Entropy Output
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded-lg bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-muted)] cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={regenerate}
                  className="p-1.5 rounded-lg bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-gold)] cursor-pointer"
                  title="Generate new password"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Generated Password Box */}
            <div className="w-full p-5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] select-all font-mono text-lg sm:text-xl font-bold tracking-wider text-[var(--c-text)] break-all min-h-[72px] flex items-center justify-center">
              {showPassword ? password : '•'.repeat(password.length)}
            </div>

            {/* Strength Meter Bar */}
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[var(--c-muted)]">Entropy Score: <strong className="text-[var(--c-text)] font-mono">{bits} bits</strong></span>
                <span
                  className={`font-bold ${
                    score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'
                  }`}
                >
                  {strength}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--c-border)] overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <p className="text-[11px] text-[var(--c-subtle)] text-left">
                Estimated brute force crack time: <strong className="text-[var(--c-text)]">{crackTime}</strong>
              </p>
            </div>

            {/* 1-Click Copy Button */}
            <button
              type="button"
              onClick={() => handleCopy(password)}
              className="w-full py-3.5 px-6 rounded-2xl bg-[var(--c-text)] hover:opacity-90 text-[var(--c-bg)] font-bold text-xs shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Copy className="w-4 h-4" /> Copy Secure Password
            </button>
          </div>

          {/* History / Bulk Drawer */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
                <History className="w-4 h-4 text-[var(--c-gold)]" />
                Recently Generated Passwords
              </h4>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                >
                  Clear History
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {history.map((hPass, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] flex items-center justify-between gap-2"
                >
                  <span className="font-mono text-xs text-[var(--c-text)] truncate">{hPass}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(hPass)}
                    className="p-1.5 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-text)] cursor-pointer"
                    title="Copy password"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-5">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--c-gold)]" />
              Generator Options
            </h4>

            {/* Random Mode Options */}
            {mode === 'random' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[var(--c-muted)] mb-1">
                    <span>Password Length</span>
                    <span className="text-[var(--c-text)] font-mono">{length} characters</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2.5 pt-2 border-t border-[var(--c-border)]">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-[var(--c-text)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useUpper}
                      onChange={(e) => setUseUpper(e.target.checked)}
                      className="rounded border-[var(--c-border)]"
                    />
                    <span>Uppercase Letters (A-Z)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold text-[var(--c-text)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useLower}
                      onChange={(e) => setUseLower(e.target.checked)}
                      className="rounded border-[var(--c-border)]"
                    />
                    <span>Lowercase Letters (a-z)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold text-[var(--c-text)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useNumbers}
                      onChange={(e) => setUseNumbers(e.target.checked)}
                      className="rounded border-[var(--c-border)]"
                    />
                    <span>Numbers (0-9)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold text-[var(--c-text)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useSymbols}
                      onChange={(e) => setUseSymbols(e.target.checked)}
                      className="rounded border-[var(--c-border)]"
                    />
                    <span>Symbols (!@#$%^&*)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold text-[var(--c-muted)] cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={excludeAmbiguous}
                      onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                      className="rounded border-[var(--c-border)]"
                    />
                    <span>Exclude Ambiguous (0, O, o, 1, l, I)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Passphrase Mode Options */}
            {mode === 'passphrase' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[var(--c-muted)] mb-1">
                    <span>Number of Words</span>
                    <span className="text-[var(--c-text)] font-mono">{wordCount} words</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="8"
                    value={wordCount}
                    onChange={(e) => setWordCount(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Separator</label>
                    <select
                      value={wordSeparator}
                      onChange={(e) => setWordSeparator(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                    >
                      <option value="-">Hyphen (-)</option>
                      <option value="_">Underscore (_)</option>
                      <option value=".">Period (.)</option>
                      <option value=" ">Space ( )</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end gap-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-[var(--c-text)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={capitalizeWords}
                        onChange={(e) => setCapitalizeWords(e.target.checked)}
                        className="rounded border-[var(--c-border)]"
                      />
                      <span>Capitalize</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-[var(--c-text)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appendNumber}
                        onChange={(e) => setAppendNumber(e.target.checked)}
                        className="rounded border-[var(--c-border)]"
                      />
                      <span>Append Number</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* PIN Mode Options */}
            {mode === 'pin' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[var(--c-muted)] mb-1">
                    <span>PIN Length</span>
                    <span className="text-[var(--c-text)] font-mono">{pinLength} digits</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="12"
                    value={pinLength}
                    onChange={(e) => setPinLength(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Bulk Generation Toggle */}
            <div className="pt-4 border-t border-[var(--c-border)] space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold text-[var(--c-text)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBulk}
                    onChange={(e) => {
                      setShowBulk(e.target.checked);
                      if (e.target.checked) regenerate();
                    }}
                    className="rounded border-[var(--c-border)]"
                  />
                  <span>Bulk Generation Mode</span>
                </label>

                {showBulk && (
                  <select
                    value={bulkCount}
                    onChange={(e) => setBulkCount(Number(e.target.value))}
                    className="px-2 py-1 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                  >
                    <option value="5">5 passwords</option>
                    <option value="10">10 passwords</option>
                    <option value="20">20 passwords</option>
                  </select>
                )}
              </div>

              {showBulk && bulkList.length > 0 && (
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] max-h-48 overflow-y-auto space-y-1 font-mono text-xs text-[var(--c-text)]">
                    {bulkList.map((bp, bidx) => (
                      <div key={bidx} className="flex justify-between items-center py-0.5 hover:text-[var(--c-gold)]">
                        <span className="truncate">{bp}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(bp)}
                          className="p-1 hover:text-[var(--c-text)] text-[var(--c-muted)] cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadBulk}
                    className="w-full py-2.5 px-3 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[var(--c-gold)]" />
                    Download Bulk Passwords (.txt)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations currentToolId="password-generator" />
    </div>
  );
};

export default PasswordGenerator;
