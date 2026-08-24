import React, { useState, useMemo } from 'react';
import {
  Copy,
  Trash2,
  Check,
  Search,
  Sparkles,
  Layers,
  BookOpen,
  Replace,
  AlertCircle,
  Hash
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';

interface MatchGroup {
  index: number;
  match: string;
  start: number;
  end: number;
  groups: string[];
  namedGroups?: Record<string, string>;
}

const REGEX_PRESETS = [
  {
    name: 'Email Address',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    testString: 'Contact admin@toolboxx.dev or support@company.co.uk for inquiries. Invalid: test@.com'
  },
  {
    name: 'URL / Web Links',
    pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
    flags: 'g',
    testString: 'Visit https://toolboxx.dev/docs or check http://localhost:3000/api/v1?ref=test for details.'
  },
  {
    name: 'IPv4 Address',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    testString: 'Server listening on 192.168.1.1 and 10.0.0.254. DNS configured to 8.8.8.8 and 1.1.1.1'
  },
  {
    name: 'Hex Color Codes',
    pattern: '#(?:[0-9a-fA-F]{3,4}){1,2}\\b',
    flags: 'gi',
    testString: 'Theme colors: Primary #ff4500, Secondary #0088cc, Background #111111, Accent #FAFAFA, Alpha #33333380'
  },
  {
    name: 'ISO Date (YYYY-MM-DD)',
    pattern: '\\b(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b',
    flags: 'g',
    testString: 'Events scheduled for 2026-08-24, 2026-12-31, and release on 2027-01-15.'
  },
  {
    name: 'UUID v4',
    pattern: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}',
    flags: 'gi',
    testString: 'Generated session IDs: 550e8400-e29b-41d4-a716-446655440000 and 6ba7b810-9dad-11d1-80b4-00c04fd430c8'
  }
];

const CHEAT_SHEET = [
  { syntax: '.', desc: 'Any character except newline' },
  { syntax: '\\d / \\D', desc: 'Digit (0-9) / Non-digit' },
  { syntax: '\\w / \\W', desc: 'Word character [a-zA-Z0-9_] / Non-word' },
  { syntax: '\\s / \\S', desc: 'Whitespace (space, tab, newline) / Non-whitespace' },
  { syntax: '^ / $', desc: 'Start of line / End of line' },
  { syntax: '\\b / \\B', desc: 'Word boundary / Non-word boundary' },
  { syntax: '[abc] / [^abc]', desc: 'Character set / Negated character set' },
  { syntax: '[a-z]', desc: 'Character range from a to z' },
  { syntax: 'a|b', desc: 'Match either a or b' },
  { syntax: '?', desc: '0 or 1 occurrences (optional)' },
  { syntax: '*', desc: '0 or more occurrences' },
  { syntax: '+', desc: '1 or more occurrences' },
  { syntax: '{3} / {2,5}', desc: 'Exactly 3 / Between 2 and 5 occurrences' },
  { syntax: '(abc)', desc: 'Capture group' },
  { syntax: '(?:abc)', desc: 'Non-capturing group' },
  { syntax: '(?<name>abc)', desc: 'Named capture group' }
];

export const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState<string>(REGEX_PRESETS[0].pattern);
  const [flags, setFlags] = useState<string>('g');
  const [testString, setTestString] = useState<string>(REGEX_PRESETS[0].testString);
  const [replaceString, setReplaceString] = useState<string>('[MATCH]');
  const [activeTab, setActiveTab] = useState<'matches' | 'replace' | 'cheatsheet'>('matches');
  const [copied, setCopied] = useState<boolean>(false);

  // Toggle flag
  const toggleFlag = (flagChar: string) => {
    if (flags.includes(flagChar)) {
      setFlags(flags.replace(flagChar, ''));
    } else {
      setFlags(flags + flagChar);
    }
  };

  // Compile Regex & Evaluate matches
  const regexEvaluation = useMemo(() => {
    if (!pattern) {
      return { isValid: true, error: null, matches: [], regex: null };
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matches: MatchGroup[] = [];

      if (flags.includes('g')) {
        let match: RegExpExecArray | null;
        let count = 0;
        // Prevent infinite loops with zero-length matches
        while ((match = regex.exec(testString)) !== null && count < 2000) {
          count++;
          matches.push({
            index: count,
            match: match[0],
            start: match.index,
            end: match.index + match[0].length,
            groups: match.slice(1),
            namedGroups: match.groups ? { ...match.groups } : undefined
          });
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          matches.push({
            index: 1,
            match: match[0],
            start: match.index,
            end: match.index + match[0].length,
            groups: match.slice(1),
            namedGroups: match.groups ? { ...match.groups } : undefined
          });
        }
      }

      return { isValid: true, error: null, matches, regex };
    } catch (err) {
      return {
        isValid: false,
        error: err instanceof Error ? err.message : 'Invalid Regular Expression syntax',
        matches: [],
        regex: null
      };
    }
  }, [pattern, flags, testString]);

  // Substitution result
  const replacedOutput = useMemo(() => {
    if (!regexEvaluation.regex || !regexEvaluation.isValid) return testString;
    try {
      return testString.replace(regexEvaluation.regex, replaceString);
    } catch {
      return testString;
    }
  }, [testString, regexEvaluation.regex, regexEvaluation.isValid, replaceString]);

  // Render Highlighted Matches inside Test String
  const renderHighlightedText = () => {
    if (!regexEvaluation.isValid || regexEvaluation.matches.length === 0) {
      return <span>{testString}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort matches by start position
    const sortedMatches = [...regexEvaluation.matches].sort((a, b) => a.start - b.start);

    sortedMatches.forEach((m, i) => {
      // Unmatched prefix text
      if (m.start > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>{testString.substring(lastIndex, m.start)}</span>
        );
      }

      // Highlighted match
      const isEven = i % 2 === 0;
      elements.push(
        <mark
          key={`match-${m.start}-${i}`}
          title={`Match #${m.index}: [${m.start}-${m.end}]`}
          className={`px-1 py-0.5 rounded font-mono font-semibold transition-all ${
            isEven
              ? 'bg-amber-400/30 text-amber-300 border-b-2 border-amber-400'
              : 'bg-cyan-400/30 text-cyan-300 border-b-2 border-cyan-400'
          }`}
        >
          {m.match}
        </mark>
      );
      lastIndex = m.end;
    });

    // Unmatched suffix text
    if (lastIndex < testString.length) {
      elements.push(
        <span key={`text-${lastIndex}`}>{testString.substring(lastIndex)}</span>
      );
    }

    return elements;
  };

  const handleCopyReplaced = () => {
    navigator.clipboard.writeText(replacedOutput);
    setCopied(true);
    showToast({ type: 'success', title: 'Replaced String Copied' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyPreset = (p: (typeof REGEX_PRESETS)[0]) => {
    setPattern(p.pattern);
    setFlags(p.flags);
    setTestString(p.testString);
    showToast({ type: 'success', title: 'Preset Loaded', message: p.name });
  };

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Regex Status"
          value={regexEvaluation.isValid ? 'Valid Expression' : 'Syntax Error'}
          badge={regexEvaluation.isValid ? 'READY' : 'ERROR'}
          badgeType={regexEvaluation.isValid ? 'success' : 'warning'}
        />
        <StatCard
          label="Total Matches"
          value={regexEvaluation.matches.length.toLocaleString()}
          subValue={flags.includes('g') ? 'Global mode (all matches)' : 'First match only'}
        />
        <StatCard
          label="Capture Groups"
          value={
            regexEvaluation.matches[0]
              ? `${regexEvaluation.matches[0].groups.length} captured`
              : '0'
          }
        />
        <StatCard label="Active Flags" value={`/${flags}/` || '/none/'} />
      </div>

      {/* Main Workspace Card */}
      <div className="p-5 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
        {/* Preset Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--c-border)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--c-subtle)] font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Presets:
            </span>
            {REGEX_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1 rounded-lg text-xs bg-[var(--c-surface)] hover:bg-[var(--c-border)] text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPattern('');
                setTestString('');
              }}
              className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* Regular Expression Pattern & Flags Input Bar */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--c-text)] uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Regular Expression Pattern
          </label>
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] focus-within:ring-2 focus-within:ring-[var(--c-gold)]">
            <span className="text-base font-mono text-[var(--c-subtle)] pl-2">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. [a-z0-9]+@[a-z]+\.[a-z]{2,}"
              className="flex-1 bg-transparent text-[var(--c-text)] font-mono text-sm outline-none placeholder:text-[var(--c-subtle)]"
              spellCheck={false}
            />
            <span className="text-base font-mono text-[var(--c-subtle)]">/</span>

            {/* Flags Selector Pills */}
            <div className="flex items-center gap-1 pr-1">
              {[
                { flag: 'g', label: 'g', title: 'Global match (find all matches)' },
                { flag: 'i', label: 'i', title: 'Case-insensitive' },
                { flag: 'm', label: 'm', title: 'Multiline (^ and $ match each line)' },
                { flag: 's', label: 's', title: 'dotAll (. matches newlines)' },
                { flag: 'u', label: 'u', title: 'Unicode support' }
              ].map((f) => (
                <button
                  key={f.flag}
                  type="button"
                  onClick={() => toggleFlag(f.flag)}
                  title={f.title}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                    flags.includes(f.flag)
                      ? 'bg-[var(--c-gold)] text-[var(--c-bg)] shadow-sm'
                      : 'bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)] border border-[var(--c-border)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {!regexEvaluation.isValid && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold">Invalid Regular Expression</h4>
              <p className="font-mono text-xs text-rose-300 mt-0.5">{regexEvaluation.error}</p>
            </div>
          </div>
        )}

        {/* Test String Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--c-muted)]">
            <span>Test String</span>
            <span>{testString.length} characters</span>
          </div>
          <textarea
            rows={5}
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter test string to execute regex against..."
            className="w-full p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] font-mono text-xs leading-relaxed focus:ring-2 focus:ring-[var(--c-gold)] outline-none resize-y shadow-inner"
            spellCheck={false}
          />
        </div>

        {/* Live Match Highlights Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--c-muted)]">
            <span className="text-[var(--c-gold)] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Live Highlighted Matches
            </span>
            <span>{regexEvaluation.matches.length} matches found</span>
          </div>
          <div className="w-full p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] font-mono text-xs leading-relaxed min-h-[90px] whitespace-pre-wrap select-text shadow-inner">
            {renderHighlightedText()}
          </div>
        </div>

        {/* Bottom Workspace Navigation Tabs */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('matches')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'matches'
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
            >
              <Hash className="w-3.5 h-3.5" /> Match Group Details ({regexEvaluation.matches.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('replace')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'replace'
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
            >
              <Replace className="w-3.5 h-3.5" /> Substitution / Replace
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cheatsheet')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'cheatsheet'
                  ? 'bg-[var(--c-card)] text-[var(--c-gold)] shadow-sm'
                  : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Syntax Cheat Sheet
            </button>
          </div>

          {/* Tab 1: Match Group Details Table */}
          {activeTab === 'matches' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)]">
              {regexEvaluation.matches.length === 0 ? (
                <p className="text-xs text-[var(--c-subtle)] text-center py-4 italic">
                  No regex matches found in test string.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[var(--c-border)] text-[var(--c-subtle)] font-sans font-medium">
                        <th className="py-2 px-3 w-16">#</th>
                        <th className="py-2 px-3 w-28">Range</th>
                        <th className="py-2 px-3">Full Matched Text</th>
                        <th className="py-2 px-3">Captured Groups</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--c-border)]">
                      {regexEvaluation.matches.map((m) => (
                        <tr key={m.index} className="hover:bg-[var(--c-card)]/40 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-[var(--c-gold)]">#{m.index}</td>
                          <td className="py-2.5 px-3 text-[var(--c-subtle)] text-[11px]">
                            [{m.start} - {m.end}]
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-[var(--c-text)] break-all">{m.match}</td>
                          <td className="py-2.5 px-3 space-y-1">
                            {m.groups.length === 0 && !m.namedGroups && (
                              <span className="text-[var(--c-subtle)] font-sans italic text-[11px]">
                                No groups
                              </span>
                            )}
                            {m.groups.map((grp, gIdx) => (
                              <div key={gIdx} className="flex items-center gap-1.5 text-[11px]">
                                <span className="px-1.5 py-0.5 rounded bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-subtle)]">
                                  ${gIdx + 1}:
                                </span>
                                <span className="text-emerald-400 break-all">{grp ?? 'undefined'}</span>
                              </div>
                            ))}
                            {m.namedGroups &&
                              Object.entries(m.namedGroups).map(([n, val]) => (
                                <div key={n} className="flex items-center gap-1.5 text-[11px]">
                                  <span className="px-1.5 py-0.5 rounded bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)]">
                                    ?&lt;{n}&gt;:
                                  </span>
                                  <span className="text-emerald-400 break-all">{val}</span>
                                </div>
                              ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Substitution */}
          {activeTab === 'replace' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--c-text)] flex items-center gap-1.5">
                  <Replace className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Replacement String
                </label>
                <input
                  type="text"
                  value={replaceString}
                  onChange={(e) => setReplaceString(e.target.value)}
                  placeholder="e.g. [REDACTED] or $1-$2"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] font-mono text-xs focus:ring-1 focus:ring-[var(--c-gold)] outline-none"
                />
                <span className="text-[11px] text-[var(--c-subtle)]">
                  Supports capture variables $1, $2, $& (entire match), $` (before match), $' (after match).
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--c-muted)]">
                  <span>Replaced Output Preview</span>
                  <button
                    type="button"
                    onClick={handleCopyReplaced}
                    className="px-3 py-1 rounded-lg bg-[var(--c-gold)] text-[var(--c-bg)] font-bold text-xs flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy Result'}
                  </button>
                </div>
                <textarea
                  rows={5}
                  readOnly
                  value={replacedOutput}
                  className="w-full p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] font-mono text-xs leading-relaxed outline-none resize-y"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {/* Tab 3: Cheat Sheet */}
          {activeTab === 'cheatsheet' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CHEAT_SHEET.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] flex items-center justify-between gap-3 text-xs"
                  >
                    <code className="px-2 py-0.5 rounded bg-[var(--c-surface)] border border-[var(--c-border)] font-mono font-bold text-[var(--c-gold)]">
                      {item.syntax}
                    </code>
                    <span className="text-[var(--c-muted)] text-right">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <PostCompletionRecommendations
        currentToolId="regex-tester"
        onReset={() => {
          setPattern('');
          setTestString('');
        }}
      />
    </div>
  );
};
