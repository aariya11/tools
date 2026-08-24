import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Trash2,
  Sparkles,
  Check,
  Zap,
  Wand2,
  RotateCcw,
  ShieldCheck,
  FileText,
  HelpCircle,
  Info,
  Loader2,
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { GeminiBanner } from './GeminiKeyModal';
import { callGeminiApi, hasGeminiApiKey } from '../../../utils/geminiClient';
import { calculateTextStats } from '../../../utils/textUtils';
import { downloadBlob } from '../../../utils/fileUtils';

export type IssueCategory = 'spelling' | 'grammar' | 'wordiness' | 'passive';

export interface GrammarIssue {
  id: string;
  category: IssueCategory;
  original: string;
  replacement: string;
  explanation: string;
  index: number;
  length: number;
}

const COMMON_SPELLING_RULES: Record<string, string> = {
  'recieve': 'receive',
  'recieved': 'received',
  'recieving': 'receiving',
  'seperate': 'separate',
  'seperated': 'separated',
  'definately': 'definitely',
  'occured': 'occurred',
  'occuring': 'occurring',
  'untill': 'until',
  'beleive': 'believe',
  'goverment': 'government',
  'enviroment': 'environment',
  'truely': 'truly',
  'tommorrow': 'tomorrow',
  'calender': 'calendar',
  'acheive': 'achieve',
  'acheived': 'achieved',
  'arguement': 'argument',
  'begining': 'beginning',
  'collaegue': 'colleague',
  'completly': 'completely',
  'dissapoint': 'disappoint',
  'embarass': 'embarrass',
  'existance': 'existence',
  'explaination': 'explanation',
  'facinating': 'fascinating',
  'foriegn': 'foreign',
  'fourty': 'forty',
  'freind': 'friend',
  'guarentee': 'guarantee',
  'heigth': 'height',
  'hierarchy': 'hierarchy',
  'imediately': 'immediately',
  'independant': 'independent',
  'maintainance': 'maintenance',
  'neccessary': 'necessary',
  'noticeable': 'noticeable',
  'occassion': 'occasion',
  'prefered': 'preferred',
  'priviledge': 'privilege',
  'probaly': 'probably',
  'refered': 'referred',
  'relevent': 'relevant',
  'suceed': 'succeed',
  'suprise': 'surprise',
  'tendancy': 'tendency',
  'thier': 'their',
  'unfortunatly': 'unfortunately',
  'usefull': 'useful',
  'wierd': 'weird',
  'writting': 'writing',
  'teh': 'the',
};

const COMMON_WORDINESS_RULES: [RegExp, string, string][] = [
  [/\bin order to\b/gi, 'to', 'Simplify wordy phrase'],
  [/\bat this point in time\b/gi, 'now', 'Use concise time reference'],
  [/\bdue to the fact that\b/gi, 'because', 'Simplify causal phrase'],
  [/\bfor the purpose of\b/gi, 'to', 'Eliminate redundant wording'],
  [/\bbasic fundamentals\b/gi, 'fundamentals', '"Fundamentals" already implies basic knowledge'],
  [/\bend result\b/gi, 'result', '"Result" already implies the end outcome'],
  [/\bfuture plans\b/gi, 'plans', 'Plans are inherently for the future'],
  [/\bfree gift\b/gi, 'gift', 'Gifts are inherently free'],
  [/\bunexpected surprise\b/gi, 'surprise', 'Surprises are inherently unexpected'],
  [/\bclose proximity\b/gi, 'proximity', '"Proximity" means closeness'],
  [/\bcollaborate together\b/gi, 'collaborate', '"Collaborate" means working together'],
  [/\bfirst and foremost\b/gi, 'first', 'Avoid cliché redundancy'],
  [/\beach and every\b/gi, 'every', 'Use single concise modifier'],
  [/\bsum total\b/gi, 'total', 'Use single concise noun'],
];

const SAMPLE_TEXT_WITH_ERRORS = `We definately need to recieve the updated quarterly report in order to make our future plans. The team has collaborated together for the purpose of finishing the project, but their are still several basic fundamentals that were overlooked by the committee. 

At this point in time, it is clear that each and every department has a seperate calender for deadlines. We truely believe that this will suceed if the enviroment is managed properly.`;

export const AiGrammarChecker: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<IssueCategory | 'all'>('all');
  const [isProcessingAi, setIsProcessingAi] = useState<boolean>(false);
  const [ignoredIssueIds, setIgnoredIssueIds] = useState<Set<string>>(new Set());

  const stats = calculateTextStats(text);

  // Client-Side Rule Engine
  const detectedIssues: GrammarIssue[] = useMemo(() => {
    if (!text.trim()) return [];

    const issues: GrammarIssue[] = [];
    let issueCounter = 0;

    // 1. Check Spelling Rules
    const wordRegex = /\b[a-zA-Z']+\b/g;
    let match: RegExpExecArray | null;
    while ((match = wordRegex.exec(text)) !== null) {
      const lower = match[0].toLowerCase();
      if (COMMON_SPELLING_RULES[lower]) {
        const rep = match[0].charAt(0) === match[0].charAt(0).toUpperCase()
          ? COMMON_SPELLING_RULES[lower].charAt(0).toUpperCase() + COMMON_SPELLING_RULES[lower].slice(1)
          : COMMON_SPELLING_RULES[lower];
        
        const id = `spell-${match.index}-${match[0]}`;
        if (!ignoredIssueIds.has(id)) {
          issues.push({
            id,
            category: 'spelling',
            original: match[0],
            replacement: rep,
            explanation: `Possible spelling mistake. Suggested correction: "${rep}".`,
            index: match.index,
            length: match[0].length,
          });
        }
      }
    }

    // 2. Check Grammar: Repeated Words ("the the", "in in", "to to")
    const doubleWordRegex = /\b([a-zA-Z]+)\s+\1\b/gi;
    while ((match = doubleWordRegex.exec(text)) !== null) {
      const id = `double-${match.index}`;
      if (!ignoredIssueIds.has(id)) {
        issues.push({
          id,
          category: 'grammar',
          original: match[0],
          replacement: match[1],
          explanation: `Repeated word: "${match[1]}" appears twice consecutively.`,
          index: match.index,
          length: match[0].length,
        });
      }
    }

    // 3. Check Grammar: Homophones (their vs there vs they're in common context)
    const theirAreRegex = /\btheir\s+(are|is|were|was)\b/gi;
    while ((match = theirAreRegex.exec(text)) !== null) {
      const id = `homophone-${match.index}`;
      if (!ignoredIssueIds.has(id)) {
        const rep = match[0].replace(/their/i, (m) => (m.charAt(0) === 'T' ? 'There' : 'there'));
        issues.push({
          id,
          category: 'grammar',
          original: match[0],
          replacement: rep,
          explanation: `Use "there" instead of possessive "their" before "${match[1]}".`,
          index: match.index,
          length: match[0].length,
        });
      }
    }

    const yourWelcomeRegex = /\byour\s+welcome\b/gi;
    while ((match = yourWelcomeRegex.exec(text)) !== null) {
      const id = `your-welcome-${match.index}`;
      if (!ignoredIssueIds.has(id)) {
        issues.push({
          id,
          category: 'grammar',
          original: match[0],
          replacement: "you're welcome",
          explanation: `Use contraction "you're" (you are) instead of possessive "your".`,
          index: match.index,
          length: match[0].length,
        });
      }
    }

    // 4. Check Grammar: Isolated Lowercase 'i'
    const lowerIRegex = /(^|\s)i(\s|[.,!?;]|$)/g;
    while ((match = lowerIRegex.exec(text)) !== null) {
      const id = `lower-i-${match.index}`;
      if (!ignoredIssueIds.has(id)) {
        const offset = match[1].length;
        issues.push({
          id,
          category: 'grammar',
          original: 'i',
          replacement: 'I',
          explanation: 'The pronoun "I" should always be capitalized.',
          index: match.index + offset,
          length: 1,
        });
      }
    }

    // 5. Check Wordiness & Redundancy Rules
    COMMON_WORDINESS_RULES.forEach(([regex, repl, reason]) => {
      let rMatch: RegExpExecArray | null;
      while ((rMatch = regex.exec(text)) !== null) {
        const id = `wordy-${rMatch.index}-${rMatch[0]}`;
        if (!ignoredIssueIds.has(id)) {
          const formattedRepl = rMatch[0].charAt(0) === rMatch[0].charAt(0).toUpperCase()
            ? repl.charAt(0).toUpperCase() + repl.slice(1)
            : repl;
          issues.push({
            id,
            category: 'wordiness',
            original: rMatch[0],
            replacement: formattedRepl,
            explanation: reason,
            index: rMatch.index,
            length: rMatch[0].length,
          });
        }
      }
    });

    // 6. Check Passive Voice constructs ("was/were [verb]ed by")
    const passiveRegex = /\b(was|were|is being|are being|has been|have been)\s+([a-zA-Z]+ed)\s+by\b/gi;
    while ((match = passiveRegex.exec(text)) !== null) {
      const id = `passive-${match.index}`;
      if (!ignoredIssueIds.has(id)) {
        issues.push({
          id,
          category: 'passive',
          original: match[0],
          replacement: match[0],
          explanation: `Passive voice detected. Consider restructuring into active voice for stronger impact.`,
          index: match.index,
          length: match[0].length,
        });
      }
    }

    // Sort issues chronologically by index
    return issues.sort((a, b) => a.index - b.index);
  }, [text, ignoredIssueIds]);

  const filteredIssues = useMemo(() => {
    if (activeCategoryFilter === 'all') return detectedIssues;
    return detectedIssues.filter((i) => i.category === activeCategoryFilter);
  }, [detectedIssues, activeCategoryFilter]);

  // Overall Health Score Calculation (0-100%)
  const healthScore = useMemo(() => {
    if (stats.words === 0) return 100;
    const penaltyPerIssue = {
      spelling: 12,
      grammar: 10,
      wordiness: 4,
      passive: 3,
    };
    const totalPenalty = detectedIssues.reduce((acc, curr) => acc + penaltyPerIssue[curr.category], 0);
    return Math.max(20, Math.min(100, Math.round(100 - (totalPenalty / Math.max(1, stats.words / 15)))));
  }, [detectedIssues, stats.words]);

  const handleFixIssue = (issue: GrammarIssue) => {
    if (issue.replacement === issue.original) {
      // Passive voice warning or advisory
      setIgnoredIssueIds((prev) => new Set([...prev, issue.id]));
      return;
    }

    const before = text.substring(0, issue.index);
    const after = text.substring(issue.index + issue.length);
    const newText = before + issue.replacement + after;
    setText(newText);
    setSelectedIssueId(null);
    showToast({ type: 'success', title: 'Fixed Issue', message: `Replaced "${issue.original}" with "${issue.replacement}"` });
  };

  const handleFixAll = () => {
    if (detectedIssues.length === 0) return;

    let updatedText = text;
    // Apply fixes from back to front to preserve string indices
    const fixableIssues = [...detectedIssues]
      .filter((i) => i.replacement !== i.original)
      .sort((a, b) => b.index - a.index);

    fixableIssues.forEach((issue) => {
      const before = updatedText.substring(0, issue.index);
      const after = updatedText.substring(issue.index + issue.length);
      updatedText = before + issue.replacement + after;
    });

    setText(updatedText);
    setSelectedIssueId(null);
    showToast({ type: 'success', title: 'All Fixes Applied', message: `Resolved ${fixableIssues.length} issues successfully.` });
  };

  const handleIgnore = (id: string) => {
    setIgnoredIssueIds((prev) => new Set([...prev, id]));
    if (selectedIssueId === id) setSelectedIssueId(null);
  };

  const handleGeminiDeepScan = async () => {
    if (!text.trim()) {
      showToast({ type: 'error', title: 'Empty Text', message: 'Please enter text for deep scan.' });
      return;
    }

    setIsProcessingAi(true);

    try {
      if (hasGeminiApiKey()) {
        const systemInstruction = `You are a master copy editor and grammarian. Fix all grammar, spelling, punctuation, syntax, wordiness, and awkward phrasing errors in the provided text. Return ONLY the fully polished, corrected text without adding meta-commentary, lists of changes, or markdown code blocks.`;

        const fixed = await callGeminiApi({
          prompt: `Proofread and correct the following text:\n"""\n${text}\n"""`,
          systemInstruction,
          temperature: 0.2,
        });

        setText(fixed.trim());
        showToast({ type: 'success', title: 'Deep Proofread Completed', message: 'All errors resolved using Google Gemini AI.' });
      } else {
        handleFixAll();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Deep Scan Failed', message: err.message || 'Error running proofread.' });
    } finally {
      setIsProcessingAi(false);
    }
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast({ type: 'success', title: 'Copied to Clipboard', message: 'Clean text copied.' });
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, 'toolboxx_grammar_checked.txt');
    showToast({ type: 'success', title: 'Report Downloaded', message: 'Saved text file.' });
  };

  const handleClear = () => {
    setText('');
    setSelectedIssueId(null);
    setIgnoredIssueIds(new Set());
  };

  const handleLoadSample = () => {
    setText(SAMPLE_TEXT_WITH_ERRORS);
    setIgnoredIssueIds(new Set());
    setSelectedIssueId(null);
  };

  const getCategoryColor = (cat: IssueCategory) => {
    switch (cat) {
      case 'spelling':
        return 'text-rose-400 border-rose-800/60 bg-rose-950/30';
      case 'grammar':
        return 'text-amber-400 border-amber-800/60 bg-amber-950/30';
      case 'wordiness':
        return 'text-sky-400 border-sky-800/60 bg-sky-950/30';
      case 'passive':
        return 'text-purple-400 border-purple-800/60 bg-purple-950/30';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Gemini Banner */}
      <GeminiBanner />

      {/* Real-time Health Metric Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Writing Health Score"
          value={`${healthScore}%`}
          badge={healthScore >= 90 ? 'Excellent' : healthScore >= 70 ? 'Good' : 'Needs Review'}
          badgeType={healthScore >= 80 ? 'success' : healthScore >= 60 ? 'warning' : 'neutral'}
        />
        <StatCard
          label="Total Issues Detected"
          value={detectedIssues.length}
          subValue={`${detectedIssues.filter((i) => i.category === 'spelling').length} spelling • ${detectedIssues.filter((i) => i.category === 'grammar').length} grammar`}
        />
        <StatCard
          label="Words & Characters"
          value={`${stats.words} words`}
          subValue={`${stats.characters} characters`}
        />
        <StatCard
          label="Reading Ease"
          value={`${stats.readingTimeMinutes} min`}
          subValue={`${stats.sentences} sentences analyzed`}
        />
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Interactive Editor */}
        <div
          className="lg:col-span-7 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 shadow-sm"
          style={{
            backgroundColor: 'var(--c-surface)',
            borderColor: 'var(--c-border)',
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--c-text)' }}>
                <FileText className="w-3.5 h-3.5" style={{ color: 'var(--c-gold)' }} />
                Interactive Grammar Editor
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs flex items-center gap-1 hover:underline cursor-pointer"
                  style={{ color: 'var(--c-gold)' }}
                >
                  <Sparkles className="w-3 h-3" /> Load Sample with Typos
                </button>
                {text && (
                  <button
                    onClick={handleClear}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Editor Area */}
            <textarea
              rows={13}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setIgnoredIssueIds(new Set());
              }}
              placeholder="Paste or write your essay, blog, email, or manuscript here to analyze spelling, grammar, redundancy, and passive voice..."
              className="w-full p-4 rounded-2xl border text-sm leading-relaxed focus:outline-none transition-colors resize-y font-sans"
              style={{
                backgroundColor: 'var(--c-bg)',
                borderColor: 'var(--c-border)',
                color: 'var(--c-text)',
              }}
            />
          </div>

          {/* Quick Action Toolbar */}
          <div className="pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: 'var(--c-border)' }}>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleFixAll}
                disabled={detectedIssues.length === 0}
                className="py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98 disabled:opacity-40 cursor-pointer flex-1 sm:flex-initial"
                style={{
                  backgroundColor: 'var(--c-gold)',
                  color: '#11110F',
                }}
              >
                <Wand2 className="w-3.5 h-3.5" /> Fix All Issues ({detectedIssues.length})
              </button>

              <button
                type="button"
                onClick={handleGeminiDeepScan}
                disabled={isProcessingAi || !text.trim()}
                className="py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-80 active:scale-98 disabled:opacity-40 cursor-pointer flex-1 sm:flex-initial"
                style={{
                  backgroundColor: 'var(--c-bg)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-text)',
                }}
              >
                {isProcessingAi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deep Scanning...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Deep AI Polish
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={handleCopy}
                disabled={!text}
                className="p-2 rounded-xl border text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity disabled:opacity-40 cursor-pointer"
                style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                title="Copy Clean Text"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
              <button
                onClick={handleDownload}
                disabled={!text}
                className="p-2 rounded-xl border text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity disabled:opacity-40 cursor-pointer"
                style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                title="Download Text File"
              >
                <Download className="w-3.5 h-3.5" /> .TXT
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Detected Issues Sidebar */}
        <div
          className="lg:col-span-5 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between shadow-sm space-y-4"
          style={{
            backgroundColor: 'var(--c-surface)',
            borderColor: 'var(--c-border)',
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--c-text)' }}>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Issues & Suggestions ({detectedIssues.length})
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="grid grid-cols-5 gap-1 p-1 rounded-xl border mb-3" style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'spelling', label: 'Spelling' },
                { id: 'grammar', label: 'Grammar' },
                { id: 'wordiness', label: 'Clarity' },
                { id: 'passive', label: 'Voice' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategoryFilter(tab.id as any)}
                  className={`py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    activeCategoryFilter === tab.id ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: activeCategoryFilter === tab.id ? 'var(--c-card)' : 'transparent',
                    color: activeCategoryFilter === tab.id ? 'var(--c-gold)' : 'var(--c-text)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Issues List Container */}
            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-3.5 rounded-2xl border transition-all ${getCategoryColor(issue.category)}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border border-current">
                        {issue.category}
                      </span>
                      <button
                        onClick={() => handleIgnore(issue.id)}
                        className="text-[10px] opacity-70 hover:opacity-100 underline cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>

                    <p className="text-xs mb-2 leading-relaxed opacity-90">{issue.explanation}</p>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-current/20">
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <span className="line-through opacity-60">{issue.original}</span>
                        {issue.replacement !== issue.original && (
                          <>
                            <span>→</span>
                            <span className="font-bold underline">{issue.replacement}</span>
                          </>
                        )}
                      </div>

                      {issue.replacement !== issue.original && (
                        <button
                          type="button"
                          onClick={() => handleFixIssue(issue)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-zinc-950 hover:bg-zinc-200 transition-all active:scale-95 cursor-pointer shadow-sm"
                        >
                          Apply Fix
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="p-8 rounded-2xl border border-dashed text-center flex flex-col items-center justify-center space-y-2"
                  style={{
                    backgroundColor: 'var(--c-bg)',
                    borderColor: 'var(--c-border)',
                    color: 'var(--c-subtle)',
                  }}
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-60" />
                  <p className="text-xs font-bold" style={{ color: 'var(--c-text)' }}>
                    No issues found in this category!
                  </p>
                  <p className="text-[11px] max-w-xs" style={{ color: 'var(--c-muted)' }}>
                    Your writing appears clean, grammatically accurate, and concise.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t flex items-center justify-between text-[11px]" style={{ borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}>
            <span>Client-side grammar engine active</span>
            <span>100% Private</span>
          </div>
        </div>
      </div>

      {/* Post Completion Recommendations */}
      <PostCompletionRecommendations currentToolId="ai-grammar-checker" onReset={handleClear} />
    </div>
  );
};
