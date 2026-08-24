import React, { useState, useMemo } from 'react';
import { Copy, Check, Sparkles, RefreshCw, Type, FileText } from 'lucide-react';
import { showToast } from '../../common/Toast';

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod',
  'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim',
  'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea',
  'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse',
  'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident',
  'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'placerat',
  'vestibulum', 'lectus', 'mauris', 'ultrices', 'eros', 'curabitur', 'gravida', 'dictum', 'fusce', 'ut',
];

export const LoremIpsumGenerator: React.FC = () => {
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words' | 'lists'>('paragraphs');
  const [count, setCount] = useState<number>(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [includeHtml, setIncludeHtml] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateSentence = (isFirst: boolean): string => {
    const len = Math.floor(Math.random() * 10) + 8;
    const words: string[] = [];
    for (let i = 0; i < len; i++) {
      const w = LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
      words.push(w);
    }
    if (isFirst && startWithLorem) {
      words[0] = 'lorem';
      words[1] = 'ipsum';
      words[2] = 'dolor';
      words[3] = 'sit';
      words[4] = 'amet';
    }
    const sentence = words.join(' ');
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  };

  const generateParagraph = (isFirst: boolean): string => {
    const sentenceCount = Math.floor(Math.random() * 3) + 4;
    const sentences: string[] = [];
    for (let s = 0; s < sentenceCount; s++) {
      sentences.push(generateSentence(isFirst && s === 0));
    }
    return sentences.join(' ');
  };

  const generatedText = useMemo(() => {
    if (type === 'paragraphs') {
      const paras: string[] = [];
      for (let p = 0; p < count; p++) {
        const text = generateParagraph(p === 0);
        paras.push(includeHtml ? `<p>${text}</p>` : text);
      }
      return paras.join(includeHtml ? '\n\n' : '\n\n');
    }

    if (type === 'sentences') {
      const sentences: string[] = [];
      for (let s = 0; s < count; s++) {
        sentences.push(generateSentence(s === 0));
      }
      return sentences.join(' ');
    }

    if (type === 'words') {
      const words: string[] = [];
      for (let w = 0; w < count; w++) {
        if (w === 0 && startWithLorem) words.push('Lorem');
        else if (w === 1 && startWithLorem) words.push('ipsum');
        else words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
      }
      return words.join(' ');
    }

    if (type === 'lists') {
      const items: string[] = [];
      for (let l = 0; l < count; l++) {
        const text = generateSentence(l === 0);
        items.push(includeHtml ? `<li>${text}</li>` : `• ${text}`);
      }
      return includeHtml ? `<ul>\n  ${items.join('\n  ')}\n</ul>` : items.join('\n');
    }

    return '';
  }, [type, count, startWithLorem, includeHtml]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    showToast('Lorem ipsum copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const wordsCount = generatedText.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;
  const charsCount = generatedText.replace(/<[^>]*>/g, '').length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Configuration Controls Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-6 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Unit Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--c-muted)] uppercase tracking-wider">Generate</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full p-3.5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] text-sm font-semibold outline-none focus:border-[var(--c-gold)]"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
              <option value="lists">Bullet List</option>
            </select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--c-muted)] uppercase tracking-wider">Quantity</label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-full p-3.5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] text-sm font-bold font-mono outline-none focus:border-[var(--c-gold)]"
            />
          </div>

          {/* Options: Start with Lorem */}
          <div className="space-y-2 flex flex-col justify-end">
            <label className="flex items-center gap-2 p-3.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs text-[var(--c-text)] font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="accent-[var(--c-accent)] rounded"
              />
              <span>Start with "Lorem ipsum"</span>
            </label>
          </div>

          {/* Options: Include HTML */}
          <div className="space-y-2 flex flex-col justify-end">
            <label className="flex items-center gap-2 p-3.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs text-[var(--c-text)] font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={includeHtml}
                onChange={(e) => setIncludeHtml(e.target.checked)}
                className="accent-[var(--c-accent)] rounded"
              />
              <span>Include HTML &lt;tags&gt;</span>
            </label>
          </div>
        </div>
      </div>

      {/* Output Content Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-[var(--c-muted)]">
            <span><strong>{wordsCount}</strong> words</span>
            <span>•</span>
            <span><strong>{charsCount}</strong> characters</span>
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--c-accent)] text-[var(--c-bg)] text-xs font-bold hover:bg-[var(--c-gold)] transition-all cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-sm text-[var(--c-text)] font-mono leading-relaxed whitespace-pre-wrap max-h-[420px] overflow-y-auto">
          {generatedText}
        </div>
      </div>
    </div>
  );
};
