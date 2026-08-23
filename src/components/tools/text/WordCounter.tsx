import React, { useState } from 'react';
import { Copy, Trash2, FileText, Clock, Mic, BarChart2, Check, Sparkles } from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { calculateTextStats, calculateKeywordDensity } from '../../../utils/textUtils';

const SAMPLE_TEXT = `Welcome to ToolBoxX! We believe powerful, privacy-first developer and creator utilities should be accessible to everyone for free directly in the browser. 

Whether you need to compress high-resolution images, merge multi-page PDF documents, count words with exact reading times, or generate customized Wi-Fi QR codes, ToolBoxX executes everything entirely on your local device. 

No files or text are ever uploaded to cloud servers or logged in databases. Experience blazing-fast speed and uncompromised privacy.`;

export const WordCounter: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const stats = calculateTextStats(text);
  const keywords = calculateKeywordDensity(text, 6);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast({ type: 'success', title: 'Copied to Clipboard', message: `${stats.words} words copied.` });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText('');
  };

  const handleLoadSample = () => {
    setText(SAMPLE_TEXT);
  };

  return (
    <div className="space-y-8">
      {/* Top Real-Time Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Words"
          value={stats.words.toLocaleString()}
          className="bg-slate-50 dark:bg-slate-800/40 border-indigo-200 dark:border-indigo-800"
        />
        <StatCard
          label="Characters"
          value={stats.characters.toLocaleString()}
          className="bg-slate-50 dark:bg-slate-800/40"
        />
        <StatCard
          label="Without Spaces"
          value={stats.charactersNoSpaces.toLocaleString()}
          className="bg-slate-50 dark:bg-slate-800/40"
        />
        <StatCard
          label="Sentences"
          value={stats.sentences.toLocaleString()}
          className="bg-slate-50 dark:bg-slate-800/40"
        />
        <StatCard
          label="Paragraphs"
          value={stats.paragraphs.toLocaleString()}
          className="bg-slate-50 dark:bg-slate-800/40"
        />
        <StatCard
          label="Reading Time"
          value={`${stats.readingTimeMinutes}m`}
          subValue={`Speak: ${stats.speakingTimeMinutes}m`}
          className="bg-slate-50 dark:bg-slate-800/40"
        />
      </div>

      {/* Main Workspace Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Text Area & Controls */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              Live Text Editor
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLoadSample}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" /> Sample Text
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

          <div className="relative">
            <textarea
              rows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here to get real-time statistics..."
              className="w-full p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-base leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner resize-y font-sans"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">
              Live updates as you type • Instant calculation
            </span>

            <button
              onClick={handleCopy}
              disabled={!text}
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
          </div>
        </div>

        {/* Right Column: Speed & Keyword Density */}
        <div className="lg:col-span-4 space-y-6">
          {/* Speaking vs Reading Time */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              Estimated Duration
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-sky-500" />
                  <div>
                    <div className="text-xs font-semibold">Reading Time</div>
                    <div className="text-[10px] text-slate-400">Avg 200 WPM</div>
                  </div>
                </div>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {stats.readingTimeMinutes} min
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Mic className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="text-xs font-semibold">Speaking Time</div>
                    <div className="text-[10px] text-slate-400">Avg 130 WPM</div>
                  </div>
                </div>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {stats.speakingTimeMinutes} min
                </span>
              </div>
            </div>
          </div>

          {/* Top Keyword Density */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" />
              Top Keywords Density
            </h4>

            {keywords.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Enter text above to analyze word frequency and SEO density.
              </p>
            ) : (
              <div className="space-y-2">
                {keywords.map((kw) => (
                  <div
                    key={kw.word}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {kw.word}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">×{kw.count}</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                        {kw.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations
        currentToolId="word-counter"
        onReset={handleClear}
      />
    </div>
  );
};
