import React, { useState } from 'react';
import { Copy, Trash2, Download, Undo, Type, Check } from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { CaseConverters, calculateTextStats } from '../../../utils/textUtils';
import { downloadBlob } from '../../../utils/fileUtils';

const CONVERSION_BUTTONS = [
  { id: 'uppercase', label: 'UPPERCASE', fn: CaseConverters.uppercase, example: 'HELLO WORLD' },
  { id: 'lowercase', label: 'lowercase', fn: CaseConverters.lowercase, example: 'hello world' },
  { id: 'titleCase', label: 'Title Case', fn: CaseConverters.titleCase, example: 'Hello World' },
  { id: 'sentenceCase', label: 'Sentence case', fn: CaseConverters.sentenceCase, example: 'Hello world.' },
  { id: 'capitalizedCase', label: 'Capitalized Case', fn: CaseConverters.capitalizedCase, example: 'Hello World' },
  { id: 'camelCase', label: 'camelCase', fn: CaseConverters.camelCase, example: 'helloWorld' },
  { id: 'pascalCase', label: 'PascalCase', fn: CaseConverters.pascalCase, example: 'HelloWorld' },
  { id: 'snakeCase', label: 'snake_case', fn: CaseConverters.snakeCase, example: 'hello_world' },
  { id: 'kebabCase', label: 'kebab-case', fn: CaseConverters.kebabCase, example: 'hello-world' },
  { id: 'constantCase', label: 'CONSTANT_CASE', fn: CaseConverters.constantCase, example: 'HELLO_WORLD' },
  { id: 'dotCase', label: 'dot.case', fn: CaseConverters.dotCase, example: 'hello.world' },
  { id: 'alternatingCase', label: 'aLtErNaTiNg cAsE', fn: CaseConverters.alternatingCase, example: 'hElLo wOrLd' },
  { id: 'inverseCase', label: 'InVeRsE CaSe', fn: CaseConverters.inverseCase, example: 'hELLO wORLD' },
];

export const CaseConverter: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [copied, setCopied] = useState<boolean>(false);

  const stats = calculateTextStats(text);

  const applyTransformation = (fn: (str: string) => string, name: string) => {
    if (!text.trim()) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(text);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    const transformed = fn(text);
    setText(transformed);
    showToast({ type: 'success', title: 'Case Converted', message: `Converted to ${name}` });
  };

  const handleUndo = () => {
    if (historyIndex >= 0) {
      const prev = history[historyIndex];
      setHistoryIndex(historyIndex - 1);
      setText(prev);
    }
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast({ type: 'success', title: 'Copied to Clipboard', message: 'Text copied.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, 'toolboxx_converted_text.txt');
    showToast({ type: 'success', title: 'Downloaded Text', message: 'Saved as .txt file.' });
  };

  const handleClear = () => {
    if (text) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(text);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setText('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Characters"
          value={stats.characters.toLocaleString()}
          className="bg-slate-50 dark:bg-slate-800/40 border-indigo-200 dark:border-indigo-800"
        />
        <StatCard
          label="Words"
          value={stats.words.toLocaleString()}
          className="bg-slate-50 dark:bg-slate-800/40"
        />
        <StatCard
          label="Sentences"
          value={stats.sentences.toLocaleString()}
          className="bg-slate-50 dark:bg-slate-800/40"
        />
        <StatCard
          label="Lines"
          value={stats.paragraphs.toLocaleString()}
          className="bg-slate-50 dark:bg-slate-800/40"
        />
      </div>

      {/* Main Workspace */}
      <div className="space-y-6">
        {/* Buttons Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Select Target Case
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {CONVERSION_BUTTONS.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => applyTransformation(btn.fn, btn.label)}
                disabled={!text.trim()}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md disabled:opacity-40 text-left transition-all active:scale-98 group"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {btn.label}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                  {btn.example}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Text Area with Action Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Type className="w-4 h-4 text-indigo-500" />
              Text Workspace
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={handleUndo}
                disabled={historyIndex < 0}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 flex items-center gap-1"
                title="Undo last conversion"
              >
                <Undo className="w-3.5 h-3.5" /> Undo
              </button>

              {text && (
                <button
                  onClick={handleClear}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter or paste text here to convert between uppercase, lowercase, camelCase, snake_case, Title Case, etc..."
            className="w-full p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-base leading-relaxed focus:ring-2 focus:ring-indigo-500 shadow-inner resize-y font-sans"
          />

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-xs text-slate-400">
              Instant conversion • Zero lag
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadTxt}
                disabled={!text}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" /> Download .txt
              </button>

              <button
                onClick={handleCopy}
                disabled={!text}
                className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Result'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations
        currentToolId="case-converter"
        onReset={handleClear}
      />
    </div>
  );
};
