import React, { useState, useMemo } from 'react';
import {
  Copy,
  Download,
  Trash2,
  Sparkles,
  Check,
  Upload,
  Minimize2,
  Maximize2,
  Settings2,
  Zap
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob, formatFileSize } from '../../../utils/fileUtils';

type LanguageType = 'javascript' | 'css' | 'html';

const SAMPLE_CODE: Record<LanguageType, string> = {
  javascript: `/**
 * Data Processing Engine & Analytics
 * @author Security Engineering
 */
function calculateMetrics(dataset, options = {}) {
  // Default configuration
  const threshold = options.threshold || 100;
  const isDebug = options.debug ?? false;

  console.log("Starting calculation for:", dataset.length, "items");
  console.debug("Configuration active:", options);

  let totalScore = 0;
  const validItems = [];

  for (let i = 0; i < dataset.length; i++) {
    const item = dataset[i];
    if (item.value >= threshold) {
      totalScore += item.value * 1.05;
      validItems.push({
        id: item.id,
        normalizedScore: totalScore / (i + 1)
      });
    }
  }

  /* Return structured response */
  return {
    success: true,
    total: totalScore,
    count: validItems.length,
    items: validItems
  };
}`,
  css: `/* Global Reset & Base Typography */
:root {
  --primary-accent: #ff4500;
  --secondary-accent: #0088cc;
  --font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --border-radius-sm: 8px;
}

body {
  margin: 0px 0px 0px 0px;
  padding: 0px;
  background-color: #ffffff;
  color: #111111;
  font-family: var(--font-family-base);
  line-height: 1.50;
}

/* Card Container Components */
.card-container {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--border-radius-sm);
  padding: 24px 16px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}

.card-container:hover {
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--primary-accent);
}`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Developer Analytics Portal</title>
  <!-- Main Stylesheet -->
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
  <!-- Header Navigation -->
  <header class="site-header">
    <div class="container">
      <h1 class="logo">ToolBoxX Suite</h1>
      <nav class="navigation">
        <ul class="nav-list">
          <li class="nav-item"><a href="#home">Home</a></li>
          <li class="nav-item"><a href="#tools">Tools</a></li>
          <li class="nav-item"><a href="#privacy">Privacy</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main id="main-content">
    <section class="hero-banner">
      <h2>Privacy-First Local Developer Utilities</h2>
      <p>100% Client side execution. Zero server uploads.</p>
    </section>
  </main>
</body>
</html>`
};

export const CodeMinifier: React.FC = () => {
  const [language, setLanguage] = useState<LanguageType>('javascript');
  const [inputCode, setInputCode] = useState<string>(SAMPLE_CODE.javascript);
  const [outputCode, setOutputCode] = useState<string>('');
  const [removeComments, setRemoveComments] = useState<boolean>(true);
  const [removeConsole, setRemoveConsole] = useState<boolean>(false);
  const [shortenHex, setShortenHex] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'minify' | 'format'>('minify');
  const [copied, setCopied] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number>(0);

  // Minify logic based on language
  const minifyCode = (code: string, lang: LanguageType): string => {
    const t0 = performance.now();
    let res = code;

    if (lang === 'javascript') {
      if (removeComments) {
        // Remove multi-line comments
        res = res.replace(/\/\*[\s\S]*?\*\//g, '');
        // Remove single-line comments
        res = res.replace(/(^|[^\\:])\/\/.*$/gm, '$1');
      }
      if (removeConsole) {
        // Strip console.* statements
        res = res.replace(/console\.(log|debug|info|warn|error|trace|table|dir)\([^)]*\);?/g, '');
      }
      // Collapse whitespace
      res = res
        .replace(/\s+/g, ' ')
        .replace(/\s*([{};:=+\-*/%&|^!<>?,()\[\]])\s*/g, '$1')
        .replace(/;\}/g, '}')
        .trim();
    } else if (lang === 'css') {
      if (removeComments) {
        res = res.replace(/\/\*[\s\S]*?\*\//g, '');
      }
      if (shortenHex) {
        // Shorten #ffffff -> #fff, #000000 -> #000
        res = res.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g, '#$1$2$3');
      }
      // Remove zero units (0px -> 0)
      res = res.replace(/(:|\s)0(px|em|rem|%|in|cm|mm|pt|pc)/gi, '$10');
      // Collapse whitespace
      res = res
        .replace(/\s+/g, ' ')
        .replace(/\s*([\{\}:;,>+~])\s*/g, '$1')
        .replace(/;}/g, '}')
        .trim();
    } else if (lang === 'html') {
      if (removeComments) {
        res = res.replace(/<!--[\s\S]*?-->/g, '');
      }
      // Collapse whitespace between tags
      res = res
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .trim();
    }

    const t1 = performance.now();
    setExecutionTime(Math.max(1, Math.round(t1 - t0)));
    return res;
  };

  // Beautify / Format logic
  const formatCode = (code: string, lang: LanguageType): string => {
    const t0 = performance.now();
    let res = code;

    if (lang === 'javascript' || lang === 'css') {
      let indent = 0;
      const tab = '  ';
      // Normalize tokens
      const cleaned = code
        .replace(/\{/g, '{\n')
        .replace(/\}/g, '\n}\n')
        .replace(/;/g, ';\n')
        .split('\n');

      const formattedLines: string[] = [];
      for (const rawLine of cleaned) {
        const line = rawLine.trim();
        if (!line) continue;
        if (line.startsWith('}') || line.endsWith('}')) {
          indent = Math.max(0, indent - 1);
        }
        formattedLines.push(tab.repeat(indent) + line);
        if (line.endsWith('{')) {
          indent++;
        }
      }
      res = formattedLines.join('\n');
    } else if (lang === 'html') {
      let indent = 0;
      const tab = '  ';
      const tokens = code.replace(/></g, '>\n<').split('\n');
      const formattedLines: string[] = [];

      for (const token of tokens) {
        const trimmed = token.trim();
        if (!trimmed) continue;
        const isClosing = /^<\/[^>]+>/.test(trimmed);
        const isSelfClosing = /<[^>]+\/>$/.test(trimmed) || /^<(meta|link|img|br|hr|input)/i.test(trimmed);
        const isOpening = /^<[^\/!][^>]*>/.test(trimmed) && !isSelfClosing;

        if (isClosing) {
          indent = Math.max(0, indent - 1);
        }
        formattedLines.push(tab.repeat(indent) + trimmed);
        if (isOpening) {
          indent++;
        }
      }
      res = formattedLines.join('\n');
    }

    const t1 = performance.now();
    setExecutionTime(Math.max(1, Math.round(t1 - t0)));
    return res;
  };

  const handleProcess = (action: 'minify' | 'format' = activeTab) => {
    if (!inputCode.trim()) {
      setOutputCode('');
      return;
    }
    if (action === 'minify') {
      const minified = minifyCode(inputCode, language);
      setOutputCode(minified);
      showToast({ type: 'success', title: 'Code Minified', message: `${language.toUpperCase()} compressed successfully` });
    } else {
      const formatted = formatCode(inputCode, language);
      setOutputCode(formatted);
      showToast({ type: 'success', title: 'Code Formatted', message: `${language.toUpperCase()} formatted with clean indentation` });
    }
  };

  const handleLanguageChange = (newLang: LanguageType) => {
    setLanguage(newLang);
    setInputCode(SAMPLE_CODE[newLang]);
    setOutputCode('');
  };

  // Stats calculation
  const stats = useMemo(() => {
    const origBytes = new Blob([inputCode]).size;
    const procBytes = new Blob([outputCode || inputCode]).size;
    const diff = origBytes - (outputCode ? procBytes : origBytes);
    const percent = origBytes > 0 && outputCode ? ((diff / origBytes) * 100).toFixed(1) : '0.0';

    return {
      originalSize: formatFileSize(origBytes),
      processedSize: outputCode ? formatFileSize(procBytes) : '-',
      bytesSaved: diff > 0 ? formatFileSize(diff) : '0 B',
      percentSaved: `${percent}%`,
      charReduction: `${Math.max(0, inputCode.length - (outputCode ? outputCode.length : inputCode.length))} chars`
    };
  }, [inputCode, outputCode]);

  const handleCopy = () => {
    const textToCopy = outputCode || inputCode;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast({ type: 'success', title: 'Copied to Clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = outputCode || inputCode;
    if (!text) return;
    const extMap: Record<LanguageType, string> = {
      javascript: 'min.js',
      css: 'min.css',
      html: 'min.html'
    };
    const mimeMap: Record<LanguageType, string> = {
      javascript: 'application/javascript',
      css: 'text/css',
      html: 'text/html'
    };
    const blob = new Blob([text], { type: `${mimeMap[language]};charset=utf-8` });
    downloadBlob(blob, `toolboxx_${language}.${extMap[language]}`);
    showToast({ type: 'success', title: 'File Downloaded', message: `Saved as .${extMap[language]}` });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (name.endsWith('.js') || name.endsWith('.mjs') || name.endsWith('.ts')) {
      setLanguage('javascript');
    } else if (name.endsWith('.css') || name.endsWith('.scss')) {
      setLanguage('css');
    } else if (name.endsWith('.html') || name.endsWith('.htm')) {
      setLanguage('html');
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputCode(content);
      setOutputCode('');
      showToast({ type: 'success', title: 'File Loaded', message: file.name });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Size Reduction"
          value={outputCode ? stats.percentSaved : '0%'}
          subValue={outputCode ? `${stats.bytesSaved} saved` : 'Ready to process'}
          badge={outputCode ? 'SAVED' : 'IDLE'}
          badgeType={outputCode ? 'success' : 'neutral'}
        />
        <StatCard label="Original Size" value={stats.originalSize} subValue={`${inputCode.length} chars`} />
        <StatCard label="Output Size" value={stats.processedSize} subValue={outputCode ? stats.charReduction : '-'} />
        <StatCard label="Processing Time" value={executionTime > 0 ? `${executionTime} ms` : '< 1 ms'} />
      </div>

      {/* Main Workspace */}
      <div className="p-5 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
        {/* Language Selection & Mode Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--c-border)]">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)]">
            {(['javascript', 'css', 'html'] as LanguageType[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLanguageChange(lang)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                  language === lang
                    ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                    : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
                }`}
              >
                {lang === 'javascript' ? 'JavaScript' : lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Mode Tabs: Minify vs Beautify */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('minify');
                  handleProcess('minify');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'minify'
                    ? 'bg-[var(--c-card)] text-[var(--c-text)] shadow-sm'
                    : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
                }`}
              >
                <Minimize2 className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Minify
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('format');
                  handleProcess('format');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'format'
                    ? 'bg-[var(--c-card)] text-[var(--c-text)] shadow-sm'
                    : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Beautify
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleProcess()}
              className="px-4 py-2 rounded-xl bg-[var(--c-gold)] hover:brightness-110 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" /> Execute
            </button>
          </div>
        </div>

        {/* Compression Options Strip */}
        <div className="p-3 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] flex flex-wrap items-center gap-4 text-xs text-[var(--c-muted)]">
          <span className="font-semibold text-[var(--c-text)] flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Options:
          </span>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--c-text)]">
            <input
              type="checkbox"
              checked={removeComments}
              onChange={(e) => setRemoveComments(e.target.checked)}
              className="rounded accent-[var(--c-gold)]"
            />
            Strip Comments
          </label>
          {language === 'javascript' && (
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--c-text)]">
              <input
                type="checkbox"
                checked={removeConsole}
                onChange={(e) => setRemoveConsole(e.target.checked)}
                className="rounded accent-[var(--c-gold)]"
              />
              Remove console.log
            </label>
          )}
          {language === 'css' && (
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--c-text)]">
              <input
                type="checkbox"
                checked={shortenHex}
                onChange={(e) => setShortenHex(e.target.checked)}
                className="rounded accent-[var(--c-gold)]"
              />
              Shorten HEX Colors
            </label>
          )}
        </div>

        {/* Split Editor Panes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Input Code Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--c-muted)]">
              <span>Source Code ({language.toUpperCase()})</span>
              <span>{inputCode.length} characters</span>
            </div>
            <textarea
              rows={14}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={`Paste your ${language.toUpperCase()} code here...`}
              className="w-full p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] font-mono text-xs leading-relaxed focus:ring-2 focus:ring-[var(--c-gold)] outline-none resize-y shadow-inner"
              spellCheck={false}
            />
          </div>

          {/* Output Code Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--c-muted)]">
              <span className="text-[var(--c-gold)]">
                {activeTab === 'minify' ? 'Minified Result' : 'Formatted Result'}
              </span>
              <span>{outputCode ? `${outputCode.length} characters` : 'Not processed yet'}</span>
            </div>
            <textarea
              rows={14}
              readOnly
              value={outputCode || (inputCode ? 'Click "Execute" or switch tabs to view compressed output...' : '')}
              placeholder="Result will appear here..."
              className="w-full p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] font-mono text-xs leading-relaxed outline-none resize-y shadow-inner opacity-95"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Bottom Actions Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--c-border)]">
          {/* Sample Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--c-subtle)] font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Sample:
            </span>
            <button
              type="button"
              onClick={() => {
                setInputCode(SAMPLE_CODE[language]);
                setOutputCode('');
              }}
              className="px-2.5 py-1 rounded-lg text-xs bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors"
            >
              Reset to {language.toUpperCase()} Sample
            </button>
            {inputCode && (
              <button
                type="button"
                onClick={() => {
                  setInputCode('');
                  setOutputCode('');
                }}
                className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <label className="cursor-pointer px-3 py-2 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <Upload className="w-3.5 h-3.5" /> Upload File
              <input type="file" accept=".js,.ts,.css,.html,.htm,.txt" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!inputCode.trim()}
              className="px-3 py-2 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!inputCode.trim()}
              className="px-4 py-2 rounded-xl bg-[var(--c-gold)] hover:brightness-110 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-40 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Result'}
            </button>
          </div>
        </div>
      </div>

      <PostCompletionRecommendations currentToolId="code-minifier" onReset={() => { setInputCode(''); setOutputCode(''); }} />
    </div>
  );
};
