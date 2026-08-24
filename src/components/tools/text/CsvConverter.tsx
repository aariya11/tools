import React, { useState, useMemo } from 'react';
import {
  Copy,
  Download,
  Table,
  Upload,
  ArrowRightLeft,
  Sparkles,
  Check,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob, formatFileSize } from '../../../utils/fileUtils';

const SAMPLE_CSV = `id,name,email,role,tier,balance
USR-01,Alex Taylor,alex@toolboxx.dev,Lead Architect,Enterprise,12450.00
USR-02,Sarah Jenkins,sarah.j@startup.io,Security Engineer,Pro,820.50
USR-03,David Chen,dchen@enterprise.com,DevOps Manager,Enterprise,5420.00
USR-04,Elena Rostova,elena@cloudops.org,Staff Engineer,Enterprise,9800.25
USR-05,Marcus Vance,m.vance@techcorp.co,Backend Developer,Standard,150.00`;

const SAMPLE_JSON = JSON.stringify(
  [
    { id: 'SKU-101', item: 'Titanium Security Key', category: 'Hardware', qty: 45, price: 89.99 },
    { id: 'SKU-102', item: 'Enterprise Dev License', category: 'Software', qty: 12, price: 499.00 },
    { id: 'SKU-103', item: 'Encrypted Flash Drive 1TB', category: 'Hardware', qty: 80, price: 129.50 },
    { id: 'SKU-104', item: 'Cloud Backup Storage Tier', category: 'Cloud', qty: 250, price: 49.00 }
  ],
  null,
  2
);

// Robust CSV Line parser with quotes and commas support
function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      if (inQuotes && line[i + 1] === char) {
        current += char;
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export const CsvConverter: React.FC = () => {
  const [mode, setMode] = useState<'csvToJson' | 'jsonToCsv'>('csvToJson');
  const [delimiter, setDelimiter] = useState<string>(',');
  const [hasHeader, setHasHeader] = useState<boolean>(true);
  const [rawInput, setRawInput] = useState<string>(SAMPLE_CSV);
  const [activeTab, setActiveTab] = useState<'output' | 'table'>('output');
  const [copied, setCopied] = useState<boolean>(false);

  // Conversion logic
  const conversion = useMemo(() => {
    if (!rawInput.trim()) {
      return { outputText: '', parsedRows: [], headers: [], error: null };
    }

    try {
      if (mode === 'csvToJson') {
        const lines = rawInput.trim().split('\n').filter((l) => l.trim().length > 0);
        if (lines.length === 0) return { outputText: '[]', parsedRows: [], headers: [], error: null };

        const firstLineCols = parseCsvLine(lines[0], delimiter);
        let headers = firstLineCols;
        let dataLines = lines.slice(1);

        if (!hasHeader) {
          headers = firstLineCols.map((_, idx) => `col_${idx + 1}`);
          dataLines = lines;
        }

        const parsedRows: Record<string, string | number | boolean>[] = [];
        const tableRows: string[][] = [];

        dataLines.forEach((line) => {
          const cols = parseCsvLine(line, delimiter);
          tableRows.push(cols);
          const rowObj: Record<string, string | number | boolean> = {};

          headers.forEach((header, idx) => {
            const val = cols[idx] !== undefined ? cols[idx] : '';
            // Auto typecast numeric & boolean
            if (val.toLowerCase() === 'true') rowObj[header] = true;
            else if (val.toLowerCase() === 'false') rowObj[header] = false;
            else if (!isNaN(Number(val)) && val.trim() !== '') rowObj[header] = Number(val);
            else rowObj[header] = val;
          });

          parsedRows.push(rowObj);
        });

        return {
          outputText: JSON.stringify(parsedRows, null, 2),
          parsedRows,
          tableRows,
          headers,
          error: null
        };
      } else {
        // JSON to CSV
        const parsedJson = JSON.parse(rawInput);
        if (!Array.isArray(parsedJson)) {
          throw new Error('JSON input must be an array of objects (e.g. [ { "col1": "val1" } ])');
        }

        if (parsedJson.length === 0) {
          return { outputText: '', parsedRows: [], headers: [], error: null };
        }

        // Collect all distinct headers across objects
        const headerSet = new Set<string>();
        parsedJson.forEach((item) => {
          if (item && typeof item === 'object') {
            Object.keys(item).forEach((k) => headerSet.add(k));
          }
        });
        const headers = Array.from(headerSet);

        const csvLines: string[] = [];
        if (hasHeader) {
          csvLines.push(headers.map((h) => (h.includes(delimiter) ? `"${h}"` : h)).join(delimiter));
        }

        const tableRows: string[][] = [];

        parsedJson.forEach((item) => {
          const rowCols: string[] = [];
          headers.forEach((h) => {
            let val = item[h];
            if (val === undefined || val === null) val = '';
            else if (typeof val === 'object') val = JSON.stringify(val);
            else val = String(val);

            // Escape quotes and delimiters
            if (val.includes(delimiter) || val.includes('"') || val.includes('\n')) {
              val = `"${val.replace(/"/g, '""')}"`;
            }
            rowCols.push(val);
          });
          tableRows.push(rowCols);
          csvLines.push(rowCols.join(delimiter));
        });

        return {
          outputText: csvLines.join('\n'),
          parsedRows: parsedJson,
          tableRows,
          headers,
          error: null
        };
      }
    } catch (err) {
      return {
        outputText: '',
        parsedRows: [],
        tableRows: [],
        headers: [],
        error: err instanceof Error ? err.message : 'Invalid data format'
      };
    }
  }, [rawInput, mode, delimiter, hasHeader]);

  // Statistics
  const stats = useMemo(() => {
    const inputBytes = new Blob([rawInput]).size;
    const outputBytes = new Blob([conversion.outputText]).size;
    const rowCount = conversion.tableRows ? conversion.tableRows.length : 0;
    const colCount = conversion.headers.length;

    return {
      rows: rowCount.toLocaleString(),
      cols: colCount.toLocaleString(),
      cells: (rowCount * colCount).toLocaleString(),
      inputSize: formatFileSize(inputBytes),
      outputSize: formatFileSize(outputBytes)
    };
  }, [rawInput, conversion]);

  const handleSwap = () => {
    if (conversion.outputText && !conversion.error) {
      setRawInput(conversion.outputText);
      setMode(mode === 'csvToJson' ? 'jsonToCsv' : 'csvToJson');
    } else {
      setMode(mode === 'csvToJson' ? 'jsonToCsv' : 'csvToJson');
      setRawInput(mode === 'csvToJson' ? SAMPLE_JSON : SAMPLE_CSV);
    }
  };

  const handleCopy = () => {
    if (!conversion.outputText) return;
    navigator.clipboard.writeText(conversion.outputText);
    setCopied(true);
    showToast({ type: 'success', title: 'Copied to Clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!conversion.outputText) return;
    const isJson = mode === 'csvToJson';
    const ext = isJson ? 'json' : 'csv';
    const mime = isJson ? 'application/json' : 'text/csv';
    const blob = new Blob([conversion.outputText], { type: `${mime};charset=utf-8` });
    downloadBlob(blob, `converted_data.${ext}`);
    showToast({ type: 'success', title: `Downloaded .${ext} file` });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (name.endsWith('.json')) {
      setMode('jsonToCsv');
    } else if (name.endsWith('.csv') || name.endsWith('.tsv') || name.endsWith('.txt')) {
      setMode('csvToJson');
      if (name.endsWith('.tsv')) setDelimiter('\t');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawInput(content);
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
          label="Mode"
          value={mode === 'csvToJson' ? 'CSV → JSON' : 'JSON → CSV'}
          badge={delimiter === ',' ? 'Comma' : delimiter === '\t' ? 'TSV' : delimiter === ';' ? 'Semicolon' : 'Pipe'}
          badgeType="neutral"
        />
        <StatCard label="Total Data Rows" value={stats.rows} />
        <StatCard label="Columns Count" value={stats.cols} />
        <StatCard label="Total Cells" value={stats.cells} subValue={`Size: ${stats.outputSize}`} />
      </div>

      {/* Main Workspace Card */}
      <div className="p-5 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
        {/* Navigation & Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--c-border)]">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)]">
            <button
              type="button"
              onClick={() => {
                setMode('csvToJson');
                if (rawInput === SAMPLE_JSON) setRawInput(SAMPLE_CSV);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                mode === 'csvToJson'
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> CSV to JSON
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('jsonToCsv');
                if (rawInput === SAMPLE_CSV) setRawInput(SAMPLE_JSON);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                mode === 'jsonToCsv'
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" /> JSON to CSV
            </button>
          </div>

          {/* Delimiter & Options */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--c-muted)]">
            <div className="flex items-center gap-1.5">
              <span>Delimiter:</span>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)] text-xs focus:ring-1 focus:ring-[var(--c-gold)]"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="&#9;">Tab (\t / TSV)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--c-text)]">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="rounded accent-[var(--c-gold)]"
              />
              First Row as Headers
            </label>
          </div>
        </div>

        {/* Panes Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Input Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--c-muted)]">
              <span>{mode === 'csvToJson' ? 'Source CSV / TSV Data' : 'Source JSON Array'}</span>
              <span>{rawInput.length} chars</span>
            </div>
            <textarea
              rows={14}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={mode === 'csvToJson' ? 'Paste CSV text here...' : 'Paste JSON array here...'}
              className="w-full p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] font-mono text-xs leading-relaxed focus:ring-2 focus:ring-[var(--c-gold)] outline-none resize-y shadow-inner"
              spellCheck={false}
            />
          </div>

          {/* Output / Table View Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--c-muted)]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('output')}
                  className={`font-bold transition-colors ${
                    activeTab === 'output' ? 'text-[var(--c-gold)]' : 'text-[var(--c-muted)]'
                  }`}
                >
                  {mode === 'csvToJson' ? 'JSON Result' : 'CSV Result'}
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('table')}
                  className={`font-bold transition-colors flex items-center gap-1 ${
                    activeTab === 'table' ? 'text-[var(--c-gold)]' : 'text-[var(--c-muted)]'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" /> Table Preview ({stats.rows})
                </button>
              </div>
              <span>{conversion.outputText ? `${conversion.outputText.length} chars` : ''}</span>
            </div>

            {activeTab === 'output' ? (
              <textarea
                rows={14}
                readOnly
                value={
                  conversion.error
                    ? `Error: ${conversion.error}`
                    : conversion.outputText || 'Converted output will appear here...'
                }
                className={`w-full p-4 rounded-2xl border ${
                  conversion.error
                    ? 'border-rose-700 bg-rose-950/20 text-rose-300'
                    : 'border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]'
                } font-mono text-xs leading-relaxed outline-none resize-y shadow-inner opacity-95`}
                spellCheck={false}
              />
            ) : (
              <div className="w-full p-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] max-h-[350px] overflow-auto shadow-inner">
                {conversion.tableRows && conversion.tableRows.length > 0 ? (
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[var(--c-card)] text-[var(--c-text)] sticky top-0 border-b border-[var(--c-border)]">
                      <tr>
                        {conversion.headers.map((h, i) => (
                          <th key={i} className="py-2 px-3 font-bold whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--c-border)]">
                      {conversion.tableRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-[var(--c-card)]/50 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-1.5 px-3 whitespace-nowrap text-[var(--c-text)]">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-xs text-[var(--c-subtle)] text-center py-10 italic">
                    No table rows available. Enter valid CSV or JSON to view table preview.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--c-subtle)] font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Presets:
            </span>
            <button
              type="button"
              onClick={() => {
                setMode('csvToJson');
                setRawInput(SAMPLE_CSV);
              }}
              className="px-2.5 py-1 rounded-lg text-xs bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors"
            >
              Customer CSV
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('jsonToCsv');
                setRawInput(SAMPLE_JSON);
              }}
              className="px-2.5 py-1 rounded-lg text-xs bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors"
            >
              Inventory JSON
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSwap}
              className="px-3 py-2 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Swap & Reverse
            </button>

            <label className="cursor-pointer px-3 py-2 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <Upload className="w-3.5 h-3.5" /> Upload File
              <input type="file" accept=".csv,.tsv,.json,.txt" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!conversion.outputText}
              className="px-3 py-2 rounded-xl bg-[var(--c-surface)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!conversion.outputText}
              className="px-4 py-2 rounded-xl bg-[var(--c-gold)] hover:brightness-110 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-40 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Output'}
            </button>
          </div>
        </div>
      </div>

      <PostCompletionRecommendations currentToolId="csv-converter" onReset={() => setRawInput('')} />
    </div>
  );
};
