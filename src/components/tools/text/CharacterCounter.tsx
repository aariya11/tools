import React, { useState } from 'react';
import { Copy, Trash2, Hash, Check, Sparkles } from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { calculateTextStats } from '../../../utils/textUtils';

const SOCIAL_LIMITS = [
  { platform: 'Twitter / X Post', max: 280, icon: '𝕏' },
  { platform: 'Instagram Caption', max: 2200, icon: '📸' },
  { platform: 'LinkedIn Post', max: 3000, icon: '💼' },
  { platform: 'SMS Segment', max: 160, icon: '💬' },
  { platform: 'Pinterest Pin Description', max: 500, icon: '📌' },
  { platform: 'YouTube Video Title', max: 100, icon: '▶️' },
  { platform: 'SEO Meta Description', max: 160, icon: '🔍' },
  { platform: 'Facebook Post', max: 63206, icon: '👥' },
];

export const CharacterCounter: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const stats = calculateTextStats(text);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast({
      type: 'success',
      title: 'Copied to Clipboard',
      message: `${stats.characters} characters copied.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Characters (with spaces)"
          value={stats.characters.toLocaleString()}
          className="bg-[var(--c-surface)] border-[var(--c-border)]"
        />
        <StatCard
          label="Characters (no spaces)"
          value={stats.charactersNoSpaces.toLocaleString()}
          className="bg-[var(--c-surface)] border-[var(--c-border)]"
        />
        <StatCard
          label="Total Words"
          value={stats.words.toLocaleString()}
          className="bg-[var(--c-surface)] border-[var(--c-border)]"
        />
        <StatCard
          label="Sentences & Paragraphs"
          value={`${stats.sentences} / ${stats.paragraphs}`}
          className="bg-[var(--c-surface)] border-[var(--c-border)]"
        />
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Text Input */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--c-text)] flex items-center gap-2">
              <Hash className="w-4 h-4 text-[var(--c-gold)]" />
              Real-Time Character Editor
            </span>

            {text && (
              <button
                onClick={handleClear}
                className="text-xs text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Text
              </button>
            )}
          </div>

          <textarea
            rows={12}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your social post, headline, or copy here..."
            className="w-full p-4 sm:p-5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] placeholder:text-[var(--c-subtle)] text-base leading-relaxed focus:ring-1 focus:ring-[var(--c-gold)] focus:border-[var(--c-gold)] shadow-inner resize-y outline-none"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[var(--c-subtle)]">
              {stats.characters} chars • {stats.words} words
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

        {/* Right: Social Media Limits Meters */}
        <div className="lg:col-span-5 space-y-4 bg-[var(--c-surface)] p-6 rounded-2xl border border-[var(--c-border)]">
          <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2 pb-2 border-b border-[var(--c-border)]">
            <Sparkles className="w-4 h-4 text-[var(--c-gold)]" />
            Social Media Character Limits
          </h4>

          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {SOCIAL_LIMITS.map((item) => {
              const current = stats.characters;
              const remaining = item.max - current;
              const percentage = Math.min(100, Math.round((current / item.max) * 100));
              const isOver = current > item.max;

              return (
                <div
                  key={item.platform}
                  className="p-3 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--c-text)] flex items-center gap-1.5">
                      <span>{item.icon}</span>
                      <span>{item.platform}</span>
                    </span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        isOver
                          ? 'text-rose-400'
                          : remaining <= 20 && remaining >= 0
                          ? 'text-amber-400'
                          : 'text-[var(--c-muted)]'
                      }`}
                    >
                      {isOver ? `+${Math.abs(remaining)} over` : `${remaining} left`}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[var(--c-surface)] h-2 rounded-full overflow-hidden border border-[var(--c-border)]">
                    <div
                      className={`h-full transition-all duration-150 ${
                        isOver
                          ? 'bg-rose-500'
                          : percentage > 85
                          ? 'bg-amber-500'
                          : 'bg-[var(--c-gold)]'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[var(--c-subtle)]">
                    <span>
                      {current} / {item.max.toLocaleString()}
                    </span>
                    <span>{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations
        currentToolId="character-counter"
        onReset={handleClear}
      />
    </div>
  );
};
