import React, { useState, useMemo } from 'react';
import {
  Copy,
  Download,
  FileText,
  Eye,
  Columns,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code,
  Link,
  Table as TableIcon,
  Minus,
  Check,
  Code2
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob, formatFileSize } from '../../../utils/fileUtils';

const SAMPLE_MARKDOWN = `# ToolBoxX Developer Suite 🚀

> **Privacy-First Local Engineering Tools** — 100% Client-Side execution with zero tracking or telemetry.

---

## ⚡ Core Feature Highlights

Here is a summary of capabilities built directly into ToolBoxX:

- **Cryptographic Security**: MD5, SHA-256/512, and HMAC computed locally via Web Crypto API.
- **Client-Side File Processing**: Compress and unpack archives using \`JSZip\`.
- **Developer Utilities**: JSON Formatter, JWT Inspector, Regex Engine, and Base64 encoder.

### Quick Code Example

\`\`\`typescript
import { calculateHash } from './cryptoUtils';

async function verifyPayload(data: string) {
  const hash = await calculateHash('SHA-256', data);
  console.log("Computed SHA-256:", hash);
  return hash;
}
\`\`\`

---

## 📊 Performance Benchmarks

| Utility Module | Browser Processing Time | Memory Overhead |
| :--- | :--- | :--- |
| **JSON Tree Viewer** | < 2 ms | ~ 1.2 MB |
| **SHA-512 Digest** | < 5 ms | Zero Network |
| **ZIP File Archiver** | ~ 45 ms | Local RAM |

---

### Interactive Checklist
- [x] Full TypeScript Type Safety
- [x] Zero Hex Color Hardcoding (Theme-Aware CSS Variables)
- [ ] Export directly to Markdown or HTML

Visit the [ToolBoxX Documentation](https://toolboxx.dev) for API guides!
`;

// Pure Markdown to HTML parser
function parseMarkdownToHtml(md: string): string {
  let html = md;

  // Escape HTML entities to prevent XSS in raw preview
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Fenced Code blocks
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, _lang, code) => {
    return `<pre class="bg-[var(--c-surface)] p-4 rounded-xl border border-[var(--c-border)] font-mono text-xs overflow-x-auto my-3 text-[var(--c-text)]"><code>${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-[var(--c-surface)] border border-[var(--c-border)] font-mono text-xs text-[var(--c-gold)]">$1</code>');

  // Blockquotes
  html = html.replace(/^\s*&gt;\s*(.+)$/gm, '<blockquote class="border-l-4 border-[var(--c-gold)] pl-4 py-1.5 my-2 text-[var(--c-muted)] italic bg-[var(--c-surface)]/50 rounded-r-xl">$1</blockquote>');

  // Headers
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-base font-bold text-[var(--c-text)] mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold text-[var(--c-text)] mt-5 mb-2.5 pb-1 border-b border-[var(--c-border)]">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-xl font-extrabold text-[var(--c-gold)] mt-6 mb-3 pb-2 border-b border-[var(--c-border)]">$1</h1>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-4 border-[var(--c-border)]" />');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-[var(--c-text)]">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-[var(--c-muted)]">$1</em>');
  html = html.replace(/~~([^~]+)~~/g, '<del class="line-through text-[var(--c-subtle)]">$1</del>');

  // Checkboxes / Task lists
  html = html.replace(/^- \[x\] (.*$)/gm, '<li class="flex items-center gap-2 text-xs text-[var(--c-text)]"><input type="checkbox" checked disabled class="accent-[var(--c-gold)]" /> $1</li>');
  html = html.replace(/^- \[ \] (.*$)/gm, '<li class="flex items-center gap-2 text-xs text-[var(--c-muted)]"><input type="checkbox" disabled class="accent-[var(--c-gold)]" /> $1</li>');

  // Unordered list items
  html = html.replace(/^\s*-\s+(?!\[[ x]\])(.*$)/gm, '<li class="ml-4 list-disc text-xs leading-relaxed text-[var(--c-text)]">$1</li>');

  // Ordered list items
  html = html.replace(/^\s*\d+\.\s+(.*$)/gm, '<li class="ml-4 list-decimal text-xs leading-relaxed text-[var(--c-text)]">$1</li>');

  // Tables
  html = html.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (tableBlock) => {
    const rows = tableBlock.trim().split('\n').map((r) => r.trim());
    if (rows.length < 2) return tableBlock;

    const headerCols = rows[0].slice(1, -1).split('|').map((c) => c.trim());
    // row 1 is separator | :--- |
    const bodyRows = rows.slice(2);

    let tHtml = '<div class="overflow-x-auto my-3"><table class="w-full text-xs text-left border border-[var(--c-border)] rounded-xl overflow-hidden">';
    tHtml += '<thead class="bg-[var(--c-surface)] text-[var(--c-text)] border-b border-[var(--c-border)]"><tr>';
    headerCols.forEach((col) => {
      tHtml += `<th class="py-2 px-3 font-bold">${col}</th>`;
    });
    tHtml += '</tr></thead><tbody class="divide-y divide-[var(--c-border)]">';

    bodyRows.forEach((bRow) => {
      const cols = bRow.slice(1, -1).split('|').map((c) => c.trim());
      tHtml += '<tr class="hover:bg-[var(--c-card)]/50 transition-colors">';
      cols.forEach((col) => {
        tHtml += `<td class="py-2 px-3">${col}</td>`;
      });
      tHtml += '</tr>';
    });

    tHtml += '</tbody></table></div>';
    return tHtml;
  });

  // Links & Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl border border-[var(--c-border)] my-2 max-w-full" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[var(--c-gold)] underline font-medium">$1</a>');

  // Paragraph line breaks
  html = html.replace(/\n\n/g, '<p class="my-2.5 leading-relaxed text-xs sm:text-sm text-[var(--c-text)]"></p>');

  return html;
}

export const MarkdownEditor: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(SAMPLE_MARKDOWN);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [activeTab, setActiveTab] = useState<'rendered' | 'htmlSource'>('rendered');
  const [copied, setCopied] = useState<boolean>(false);

  // Parse HTML
  const rawHtml = useMemo(() => parseMarkdownToHtml(markdown), [markdown]);

  // Statistics
  const stats = useMemo(() => {
    const chars = markdown.length;
    const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const lines = markdown ? markdown.split('\n').length : 0;

    return {
      chars: chars.toLocaleString(),
      words: words.toLocaleString(),
      readingTime: `${readingTime} min read`,
      lines: lines.toLocaleString(),
      size: formatFileSize(new Blob([markdown]).size)
    };
  }, [markdown]);

  // Toolbar Insert Action
  const insertText = (before: string, after = '') => {
    const textarea = document.getElementById('md-textarea') as HTMLTextAreaElement | null;
    if (!textarea) {
      setMarkdown((prev) => `${prev}\n${before}${after}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = markdown.substring(start, end) || 'text';
    const replacement = `${before}${selection}${after}`;
    const nextMarkdown = markdown.substring(0, start) + replacement + markdown.substring(end);

    setMarkdown(nextMarkdown);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selection.length);
    }, 10);
  };

  const handleCopyMd = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    showToast({ type: 'success', title: 'Markdown Copied to Clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(rawHtml);
    showToast({ type: 'success', title: 'HTML Source Copied' });
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, 'document.md');
    showToast({ type: 'success', title: 'Saved as .md file' });
  };

  const handleDownloadHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Exported Markdown Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #111; }
    pre { background: #f4f4f4; padding: 16px; border-radius: 8px; overflow-x: auto; }
    code { font-family: monospace; background: #eee; padding: 2px 4px; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f9f9f9; }
    blockquote { border-left: 4px solid #ff4500; margin: 0; padding-left: 16px; color: #666; }
  </style>
</head>
<body>
${rawHtml}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    downloadBlob(blob, 'document.html');
    showToast({ type: 'success', title: 'Saved as .html file' });
  };

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Word Count" value={stats.words} subValue={`${stats.chars} characters`} />
        <StatCard label="Reading Time" value={stats.readingTime} />
        <StatCard label="Total Lines" value={stats.lines} />
        <StatCard label="Document Size" value={stats.size} />
      </div>

      {/* Main Workspace Card */}
      <div className="p-5 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-5">
        {/* Top Control Bar & View Modes */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--c-border)]">
          {/* View Mode Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)]">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'split'
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> Split Pane
            </button>
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'editor'
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Editor Only
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'preview'
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Preview Only
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export HTML
            </button>
            <button
              type="button"
              onClick={handleDownloadMd}
              className="px-3 py-1.5 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export .md
            </button>
            <button
              type="button"
              onClick={handleCopyMd}
              className="px-4 py-1.5 rounded-xl bg-[var(--c-gold)] hover:brightness-110 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Markdown'}
            </button>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="p-2 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => insertText('# ')}
            title="Heading 1"
            className="p-1.5 rounded-lg hover:bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('## ')}
            title="Heading 2"
            className="p-1.5 rounded-lg hover:bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('### ')}
            title="Heading 3"
            className="p-1.5 rounded-lg hover:bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <span className="w-px h-5 bg-[var(--c-border)] mx-1" />
          <button
            type="button"
            onClick={() => insertText('**', '**')}
            title="Bold"
            className="p-1.5 rounded-lg hover:bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('*', '*')}
            title="Italic"
            className="p-1.5 rounded-lg hover:bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('~~', '~~')}
            title="Strikethrough"
            className="p-1.5 rounded-lg hover:bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <span className="w-px h-5 bg-[var(--c-border)] mx-1" />
          <button
            type="button"
            onClick={() => insertText('- ')}
            title="Bullet List"
            className="p-1.5 rounded-lg hover:bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('1. ')}
            title="Numbered List"
            className="p-1.5 rounded-lg hover:bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('- [ ] ')}
            title="Task Checklist"
            className="p-1.5 rounded-lg hover:bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            <ListChecks className="w-4 h-4" />
          </button>
          <span className="w-px h-5 bg-[var(--c-border)] mx-1" />
          <button
            type="button"
            onClick={() => insertText('> ')}
            title="Quote"
            className="p-1.5 rounded-lg hover:bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('`', '`')}
            title="Inline Code"
            className="p-1.5 rounded-lg hover:bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('```typescript\n', '\n```')}
            title="Code Block"
            className="p-1.5 rounded-lg hover:bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            <Code2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('[Link Title](', 'https://)')}
            title="Add Link"
            className="p-1.5 rounded-lg hover:bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              insertText(
                '\n| Column 1 | Column 2 |\n| :--- | :--- |\n| Value 1 | Value 2 |\n'
              )
            }
            title="Insert Table"
            className="p-1.5 rounded-lg hover:bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('\n---\n')}
            title="Horizontal Divider"
            className="p-1.5 rounded-lg hover:bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Panes Layout */}
        <div
          className={`grid gap-5 ${
            viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {/* Editor Pane */}
          {viewMode !== 'preview' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--c-muted)]">
                <span>Markdown Editor</span>
                <span>{stats.lines} lines</span>
              </div>
              <textarea
                id="md-textarea"
                rows={18}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Type your markdown here..."
                className="w-full p-4 sm:p-5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] font-mono text-xs sm:text-sm leading-relaxed focus:ring-2 focus:ring-[var(--c-gold)] outline-none resize-y shadow-inner"
                spellCheck={false}
              />
            </div>
          )}

          {/* Preview Pane */}
          {viewMode !== 'editor' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--c-muted)]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('rendered')}
                    className={`font-bold transition-colors ${
                      activeTab === 'rendered' ? 'text-[var(--c-gold)]' : 'text-[var(--c-muted)]'
                    }`}
                  >
                    Visual Preview
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('htmlSource')}
                    className={`font-bold transition-colors ${
                      activeTab === 'htmlSource' ? 'text-[var(--c-gold)]' : 'text-[var(--c-muted)]'
                    }`}
                  >
                    HTML Source
                  </button>
                </div>
                {activeTab === 'htmlSource' && (
                  <button
                    type="button"
                    onClick={handleCopyHtml}
                    className="text-[11px] text-[var(--c-gold)] hover:underline"
                  >
                    Copy HTML
                  </button>
                )}
              </div>

              {activeTab === 'rendered' ? (
                <div
                  className="w-full p-4 sm:p-6 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] min-h-[400px] max-h-[500px] overflow-y-auto leading-relaxed shadow-inner"
                  dangerouslySetInnerHTML={{ __html: rawHtml }}
                />
              ) : (
                <textarea
                  rows={18}
                  readOnly
                  value={rawHtml}
                  className="w-full p-4 sm:p-5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] font-mono text-xs leading-relaxed outline-none resize-y shadow-inner"
                />
              )}
            </div>
          )}
        </div>
      </div>

      <PostCompletionRecommendations currentToolId="markdown-editor" onReset={() => setMarkdown('')} />
    </div>
  );
};
