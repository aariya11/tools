import React, { useState, useMemo } from 'react';
import {
  Copy,
  Download,
  Trash2,
  FileCode,
  AlertCircle,
  Wrench,
  Minimize2,
  Maximize2,
  Search,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Check,
  Upload
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

const SAMPLES: Record<string, string> = {
  simple: JSON.stringify(
    {
      name: 'ToolBoxX Developer Suite',
      version: '2.4.0',
      isPrivate: true,
      features: ['Client-Side Only', 'Zero Tracking', 'Fast Performance'],
      author: {
        name: 'Security Engineering',
        verified: true
      }
    },
    null,
    2
  ),
  ecommerce: JSON.stringify(
    {
      orderId: 'ORD-928471-2026',
      status: 'delivered',
      customer: {
        id: 'usr_8271',
        email: 'alex.taylor@example.com',
        tier: 'enterprise',
        ordersCompleted: 42
      },
      lineItems: [
        { sku: 'DEV-KEY-01', item: 'Titanium FIDO2 Key', qty: 2, unitPrice: 89.99 },
        { sku: 'SFT-LIC-PRO', item: 'Enterprise Dev License', qty: 1, unitPrice: 499.00 }
      ],
      pricing: {
        subtotal: 678.98,
        tax: 54.32,
        shipping: 0.00,
        currency: 'USD',
        paid: true
      }
    },
    null,
    2
  ),
  malformed: `{
  // Invalid JSON with comments, single quotes and trailing comma
  'service': 'Analytics Engine',
  'port': 8080,
  'debug': true,
  'allowedOrigins': [
    'https://toolboxx.dev',
    'http://localhost:3000',
  ],
}`
};

interface JsonTreeNodeProps {
  keyName?: string;
  value: unknown;
  path: string;
  searchTerm: string;
  depth: number;
}

const JsonTreeNode: React.FC<JsonTreeNodeProps> = ({
  keyName,
  value,
  path,
  searchTerm,
  depth
}) => {
  const [isOpen, setIsOpen] = useState(depth < 3);

  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isContainer = isObject || isArray;

  const matchesSearch = useMemo(() => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    if (keyName && keyName.toLowerCase().includes(term)) return true;
    if (!isContainer && String(value).toLowerCase().includes(term)) return true;
    if (isContainer) {
      try {
        return JSON.stringify(value).toLowerCase().includes(term);
      } catch {
        return false;
      }
    }
    return false;
  }, [keyName, value, searchTerm, isContainer]);

  if (!matchesSearch) return null;

  const copyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(path || '$');
    showToast({ type: 'success', title: 'Path Copied', message: path || '$' });
  };

  const copyValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    const str = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    navigator.clipboard.writeText(str);
    showToast({ type: 'success', title: 'Value Copied' });
  };

  const renderValue = () => {
    if (value === null) {
      return <span className="text-amber-500 font-mono italic text-xs">null</span>;
    }
    if (typeof value === 'boolean') {
      return (
        <span className="text-rose-400 font-mono font-semibold text-xs">
          {value ? 'true' : 'false'}
        </span>
      );
    }
    if (typeof value === 'number') {
      return <span className="text-cyan-400 font-mono font-medium text-xs">{value}</span>;
    }
    if (typeof value === 'string') {
      return (
        <span className="text-emerald-400 font-mono text-xs break-all">
          "{value}"
        </span>
      );
    }
    return null;
  };

  return (
    <div className="text-xs leading-relaxed select-text py-0.5">
      <div
        className={`flex items-start gap-1.5 py-1 px-2 rounded-lg hover:bg-[var(--c-surface)] group transition-colors ${
          isContainer ? 'cursor-pointer' : ''
        }`}
        onClick={() => isContainer && setIsOpen(!isOpen)}
      >
        {isContainer ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="mt-0.5 text-[var(--c-subtle)] hover:text-[var(--c-text)] p-0.5 rounded"
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        {keyName !== undefined && (
          <span className="font-mono font-semibold text-[var(--c-accent)] shrink-0">
            "{keyName}":
          </span>
        )}

        {isContainer ? (
          <span className="text-[var(--c-subtle)] font-mono flex items-center gap-1.5">
            <span>{isArray ? `Array(${(value as unknown[]).length}) [` : `Object {`}</span>
            {!isOpen && (
              <span className="text-[var(--c-muted)] text-[11px] bg-[var(--c-surface)] px-1.5 py-0.5 rounded border border-[var(--c-border)]">
                ...
              </span>
            )}
            <span>{isArray ? ']' : '}'}</span>
          </span>
        ) : (
          renderValue()
        )}

        <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
          <button
            type="button"
            onClick={copyPath}
            title={`Copy JSON path: ${path || '$'}`}
            className="px-1.5 py-0.5 text-[10px] rounded bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            path
          </button>
          <button
            type="button"
            onClick={copyValue}
            title="Copy Value"
            className="px-1.5 py-0.5 text-[10px] rounded bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
          >
            val
          </button>
        </div>
      </div>

      {isContainer && isOpen && (
        <div className="pl-4 sm:pl-6 border-l border-[var(--c-border)] ml-2.5 my-0.5 space-y-0.5">
          {isArray
            ? (value as unknown[]).map((item, idx) => (
                <JsonTreeNode
                  key={idx}
                  keyName={String(idx)}
                  value={item}
                  path={path ? `${path}[${idx}]` : `$[${idx}]`}
                  searchTerm={searchTerm}
                  depth={depth + 1}
                />
              ))
            : Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                <JsonTreeNode
                  key={k}
                  keyName={k}
                  value={v}
                  path={path ? `${path}.${k}` : `$.${k}`}
                  searchTerm={searchTerm}
                  depth={depth + 1}
                />
              ))}
        </div>
      )}
    </div>
  );
};

export const JsonTools: React.FC = () => {
  const [inputJson, setInputJson] = useState<string>(SAMPLES.simple);
  const [indentSpaces, setIndentSpaces] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<'editor' | 'tree'>('editor');
  const [treeSearch, setTreeSearch] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Validation analysis
  const validationResult = useMemo(() => {
    if (!inputJson.trim()) {
      return { isValid: null, error: null, parsed: null, line: null, col: null };
    }
    try {
      const parsed = JSON.parse(inputJson);
      return { isValid: true, error: null, parsed, line: null, col: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      let line: number | null = null;
      let col: number | null = null;
      
      const posMatch = msg.match(/position\s+(\d+)/i);
      if (posMatch && posMatch[1]) {
        const pos = parseInt(posMatch[1], 10);
        const upToPos = inputJson.slice(0, pos);
        const lines = upToPos.split('\n');
        line = lines.length;
        col = (lines[lines.length - 1]?.length || 0) + 1;
      }
      
      const lineMatch = msg.match(/line\s+(\d+)\s+column\s+(\d+)/i);
      if (lineMatch && lineMatch[1] && lineMatch[2]) {
        line = parseInt(lineMatch[1], 10);
        col = parseInt(lineMatch[2], 10);
      }

      return { isValid: false, error: msg, parsed: null, line, col };
    }
  }, [inputJson]);

  // Statistics calculation
  const stats = useMemo(() => {
    const rawBytes = new Blob([inputJson]).size;
    let keysCount = 0;
    let maxDepth = 0;

    const countNodes = (obj: unknown, currentDepth: number) => {
      if (currentDepth > maxDepth) maxDepth = currentDepth;
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          obj.forEach((item) => countNodes(item, currentDepth + 1));
        } else {
          const keys = Object.keys(obj as Record<string, unknown>);
          keysCount += keys.length;
          keys.forEach((k) => countNodes((obj as Record<string, unknown>)[k], currentDepth + 1));
        }
      }
    };

    if (validationResult.parsed) {
      countNodes(validationResult.parsed, 1);
    }

    return {
      sizeFormatted: rawBytes > 1024 ? `${(rawBytes / 1024).toFixed(2)} KB` : `${rawBytes} B`,
      lines: inputJson ? inputJson.split('\n').length : 0,
      keysCount,
      maxDepth,
      isValid: validationResult.isValid
    };
  }, [inputJson, validationResult]);

  const handleFormat = (spaces: number = indentSpaces) => {
    if (!inputJson.trim()) return;
    try {
      const parsed = JSON.parse(inputJson);
      setInputJson(JSON.stringify(parsed, null, spaces));
      showToast({ type: 'success', title: 'JSON Formatted', message: `Indented with ${spaces} spaces` });
    } catch {
      showToast({ type: 'error', title: 'Invalid JSON', message: 'Please fix syntax errors before formatting' });
    }
  };

  const handleMinify = () => {
    if (!inputJson.trim()) return;
    try {
      const parsed = JSON.parse(inputJson);
      setInputJson(JSON.stringify(parsed));
      showToast({ type: 'success', title: 'JSON Minified', message: 'All whitespace removed' });
    } catch {
      showToast({ type: 'error', title: 'Invalid JSON', message: 'Please fix syntax errors before minifying' });
    }
  };

  const handleRepair = () => {
    if (!inputJson.trim()) return;
    try {
      let cleaned = inputJson
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^\\:])\/\/.*$/gm, '$1');

      cleaned = cleaned.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
      cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');
      cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

      const parsed = JSON.parse(cleaned);
      setInputJson(JSON.stringify(parsed, null, indentSpaces));
      showToast({ type: 'success', title: 'JSON Repaired', message: 'Cleaned quotes, comments, and trailing commas' });
    } catch {
      showToast({
        type: 'error',
        title: 'Auto-Repair Failed',
        message: 'Could not automatically recover valid JSON. Check the error markers.'
      });
    }
  };

  const handleCopy = () => {
    if (!inputJson) return;
    navigator.clipboard.writeText(inputJson);
    setCopied(true);
    showToast({ type: 'success', title: 'Copied to Clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!inputJson) return;
    const blob = new Blob([inputJson], { type: 'application/json;charset=utf-8' });
    downloadBlob(blob, 'toolboxx_formatted.json');
    showToast({ type: 'success', title: 'File Downloaded', message: 'Saved as .json file' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputJson(content);
      showToast({ type: 'success', title: 'File Loaded', message: file.name });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    setInputJson('');
  };

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Validation Status"
          value={
            stats.isValid === true ? 'Valid JSON' : stats.isValid === false ? 'Syntax Error' : 'Empty'
          }
          badge={stats.isValid === true ? 'PASS' : stats.isValid === false ? 'ERROR' : 'IDLE'}
          badgeType={stats.isValid === true ? 'success' : stats.isValid === false ? 'warning' : 'neutral'}
        />
        <StatCard label="Data Size" value={stats.sizeFormatted} subValue={`${stats.lines} lines`} />
        <StatCard label="Total Object Keys" value={stats.keysCount.toLocaleString()} />
        <StatCard label="Max Nesting Depth" value={stats.maxDepth > 0 ? stats.maxDepth : '-'} />
      </div>

      {/* Main Workspace Card */}
      <div className="p-5 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-5">
        {/* Action Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--c-border)]">
          {/* Tabs: Text Editor vs Tree Viewer */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)]">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'editor'
                  ? 'bg-[var(--c-card)] text-[var(--c-text)] shadow-sm'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-[var(--c-gold)]" />
              Editor & Formatter
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tree')}
              disabled={!validationResult.isValid}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 ${
                activeTab === 'tree'
                  ? 'bg-[var(--c-card)] text-[var(--c-text)] shadow-sm'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5 text-[var(--c-gold)]" />
              Visual Tree Viewer
            </button>
          </div>

          {/* Quick Transformation Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Indent Selector */}
            <div className="flex items-center gap-1 text-xs text-[var(--c-muted)]">
              <span>Indent:</span>
              <select
                value={indentSpaces}
                onChange={(e) => {
                  const s = Number(e.target.value);
                  setIndentSpaces(s);
                  handleFormat(s);
                }}
                className="px-2 py-1 rounded-lg bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] text-xs focus:ring-1 focus:ring-[var(--c-gold)]"
              >
                <option value={2}>2 Spaces</option>
                <option value={4}>4 Spaces</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => handleFormat()}
              className="px-3 py-1.5 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold transition-colors"
            >
              Format
            </button>
            <button
              type="button"
              onClick={handleMinify}
              className="px-3 py-1.5 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Minimize2 className="w-3 h-3" /> Minify
            </button>
            <button
              type="button"
              onClick={handleRepair}
              className="px-3 py-1.5 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-semibold transition-colors flex items-center gap-1"
              title="Fix single quotes, unquoted keys, and trailing commas"
            >
              <Wrench className="w-3 h-3" /> Repair JSON
            </button>
            {inputJson && (
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                title="Clear Workspace"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Error Warning Banner if invalid */}
        {validationResult.isValid === false && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-2">
                <span>JSON Syntax Error</span>
                {validationResult.line && (
                  <span className="px-2 py-0.5 rounded bg-rose-900/60 border border-rose-700 text-[11px] font-mono">
                    Line {validationResult.line} : Col {validationResult.col}
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-rose-300">{validationResult.error}</p>
            </div>
          </div>
        )}

        {/* Editor View */}
        {activeTab === 'editor' && (
          <div className="space-y-3">
            <div className="relative">
              <textarea
                rows={16}
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                placeholder="Paste your JSON here or select a sample preset..."
                className="w-full p-4 sm:p-5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] placeholder:text-[var(--c-subtle)] font-mono text-xs sm:text-sm leading-relaxed focus:ring-2 focus:ring-[var(--c-gold)] focus:border-transparent outline-none resize-y shadow-inner"
                spellCheck={false}
              />
            </div>

            {/* Bottom Bar: Sample Presets & File Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {/* Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[var(--c-subtle)] font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Samples:
                </span>
                <button
                  type="button"
                  onClick={() => setInputJson(SAMPLES.simple)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors"
                >
                  Simple Object
                </button>
                <button
                  type="button"
                  onClick={() => setInputJson(SAMPLES.ecommerce)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors"
                >
                  E-Commerce Order
                </button>
                <button
                  type="button"
                  onClick={() => setInputJson(SAMPLES.malformed)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Malformed (Fix Me)
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-3 py-2 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5" /> Upload .json
                  <input type="file" accept=".json,application/json,text/plain" onChange={handleFileUpload} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!inputJson.trim()}
                  className="px-3 py-2 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!inputJson.trim()}
                  className="px-4 py-2 rounded-xl bg-[var(--c-gold)] hover:brightness-110 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-40 transition-all active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visual Tree View */}
        {activeTab === 'tree' && validationResult.parsed !== null && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--c-subtle)]" />
                <input
                  type="text"
                  value={treeSearch}
                  onChange={(e) => setTreeSearch(e.target.value)}
                  placeholder="Search keys or values in JSON tree..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] text-xs focus:ring-1 focus:ring-[var(--c-gold)] outline-none"
                />
              </div>
              <span className="text-xs text-[var(--c-muted)] font-mono shrink-0">
                {stats.keysCount} keys
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] overflow-x-auto max-h-[600px] overflow-y-auto">
              <JsonTreeNode
                value={validationResult.parsed}
                path="$"
                searchTerm={treeSearch}
                depth={0}
              />
            </div>
          </div>
        )}
      </div>

      <PostCompletionRecommendations currentToolId="json-formatter" onReset={handleClear} />
    </div>
  );
};
