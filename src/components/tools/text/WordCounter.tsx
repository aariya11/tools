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
          className="bg-[var(--c-surface)] border-[var(--c-border)]"
        />
        <StatCard
          label="Characters"
          value={stats.characters.toLocaleString()}
          className="bg-[var(--c-surface)] border-[var(--c-border)]"
        />
        <StatCard
          label="Without Spaces"
          value={stats.charactersNoSpaces.toLocaleString()}
          className="bg-[var(--c-surface)] border-[var(--c-border)]"
        />
        <StatCard
          label="Sentences"
          value={stats.sentences.toLocaleString()}
          className="bg-[var(--c-surface)] border-[var(--c-border)]"
        />
        <StatCard
          label="Paragraphs"
          value={stats.paragraphs.toLocaleString()}
          className="bg-[var(--c-surface)] border-[var(--c-border)]"
        />
        <StatCard
          label="Reading Time"
          value={`${stats.readingTimeMinutes}m`}
          subValue={`Speak: ${stats.speakingTimeMinutes}m`}
          className="bg-[var(--c-surface)] border-[var(--c-border)]"
        />
      </div>

      {/* Main Workspace Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Text Area & Controls */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--c-text)] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--c-gold)]" />
              Live Text Editor
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLoadSample}
                className="text-xs text-[var(--c-gold)] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Sample Text
              </button>
              {text && (
                <button
                  onClick={handleClear}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
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
              className="w-full p-4 sm:p-5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] placeholder:text-[var(--c-subtle)] text-base leading-relaxed focus:ring-1 focus:ring-[var(--c-gold)] focus:border-[var(--c-gold)] shadow-inner resize-y font-sans outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[var(--c-subtle)]">
              Live updates as you type • Instant client-side calculation
            </span>

            <button
              onClick={handleCopy}
              disabled={!text}
              className="py-2.5 px-5 rounded-xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] disabled:opacity-40 text-[var(--c-bg)] text-xs font-bold shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
          </div>
        </div>

        {/* Right Column: Speed & Keyword Density */}
        <div className="lg:col-span-4 space-y-6">
          {/* Speaking vs Reading Time */}
          <div className="p-5 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-4">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--c-gold)]" />
              Estimated Duration
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)]">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[var(--c-gold)]" />
                  <div>
                    <div className="text-xs font-semibold text-[var(--c-text)]">Reading Time</div>
                    <div className="text-[10px] text-[var(--c-subtle)]">Avg 200 WPM</div>
                  </div>
                </div>
                <span className="text-base font-bold text-[var(--c-text)]">
                  {stats.readingTimeMinutes} min
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)]">
                <div className="flex items-center gap-2.5">
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-[var(--c-text)]">Speaking Time</div>
                    <div className="text-[10px] text-[var(--c-subtle)]">Avg 130 WPM</div>
                  </div>
                </div>
                <span className="text-base font-bold text-[var(--c-text)]">
                  {stats.speakingTimeMinutes} min
                </span>
              </div>
            </div>
          </div>

          {/* Top Keyword Density */}
          <div className="p-5 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[var(--c-gold)]" />
              Top Keywords Density
            </h4>

            {keywords.length === 0 ? (
              <p className="text-xs text-[var(--c-subtle)] py-3 text-center">
                Enter text above to analyze word frequency and SEO density.
              </p>
            ) : (
              <div className="space-y-2">
                {keywords.map((kw) => (
                  <div
                    key={kw.word}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--c-card)] border border-[var(--c-border)]"
                  >
                    <span className="font-medium text-[var(--c-text)]">
                      {kw.word}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--c-subtle)]">×{kw.count}</span>
                      <span className="font-semibold text-[var(--c-gold)] bg-[var(--c-surface)] border border-[var(--c-border)] px-1.5 py-0.5 rounded">
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
