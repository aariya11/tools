import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Download,
  Trash2,
  RefreshCw,
  Check,
  Briefcase,
  Smile,
  GraduationCap,
  Zap,
  Palette,
  Coffee,
  SplitSquareVertical,
  Sliders,
  ArrowRight,
  Loader2,
  FileText,
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { GeminiBanner } from './GeminiKeyModal';
import { callGeminiApi, hasGeminiApiKey } from '../../../utils/geminiClient';
import { calculateTextStats } from '../../../utils/textUtils';
import { downloadBlob } from '../../../utils/fileUtils';

export type ToneMode = 'professional' | 'friendly' | 'formal' | 'concise' | 'creative' | 'casual';

interface ToneConfig {
  id: ToneMode;
  name: string;
  desc: string;
  icon: React.ElementType;
  badge: string;
}

const TONE_CONFIGS: ToneConfig[] = [
  { id: 'professional', name: 'Professional', desc: 'Clear, confident, and business-ready', icon: Briefcase, badge: 'Business' },
  { id: 'friendly', name: 'Friendly', desc: 'Warm, empathetic, and approachable', icon: Smile, badge: 'Warm' },
  { id: 'formal', name: 'Formal', desc: 'Academic, structured, and authoritative', icon: GraduationCap, badge: 'Academic' },
  { id: 'concise', name: 'Concise', desc: 'Punchy, direct, and zero-fluff', icon: Zap, badge: 'High-Signal' },
  { id: 'creative', name: 'Creative', desc: 'Vivid, expressive, and engaging flair', icon: Palette, badge: 'Engaging' },
  { id: 'casual', name: 'Casual', desc: 'Relaxed, conversational, and effortless', icon: Coffee, badge: 'Social' },
];

const SAMPLE_TEXTS = {
  business: 'I am writing this email to let you know that we need to finish the quarterly budget report as soon as possible because the executive board will be reviewing the numbers next Monday morning.',
  casual: 'Hey guys, just wanted to check in and see if anyone has some free time today to hop on a quick call and talk about the new website design ideas we brainstormed yesterday.',
  marketing: 'Our product is super good and helps people save a lot of time every single day so they do not have to do boring manual tasks over and over again.',
  formal: 'It is widely believed that the implementation of contemporary distributed architecture results in significant performance improvements across diverse web deployment environments.',
};

export const AiRewriter: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<ToneMode>('professional');
  const [variations, setVariations] = useState<string[]>([]);
  const [activeVariationIndex, setActiveVariationIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'single'>('split');

  const inputStats = calculateTextStats(inputText);
  const currentOutput = variations[activeVariationIndex] || '';
  const outputStats = calculateTextStats(currentOutput);

  // Client-Side Smart Heuristic NLP Rewriting Engine
  const generateOfflineVariations = (text: string, tone: ToneMode): string[] => {
    if (!text.trim()) return [];

    const trim = text.trim();

    // Dictionaries for tone-specific phrasing
    const formalMap: Record<string, string> = {
      'help': 'facilitate',
      'helps': 'facilitates',
      'use': 'utilize',
      'uses': 'utilizes',
      'get': 'obtain',
      'gets': 'acquires',
      'buy': 'purchase',
      'show': 'demonstrate',
      'shows': 'illustrates',
      'make sure': 'ensure',
      'need to': 'must',
      'good': 'advantageous',
      'bad': 'unfavorable',
      'start': 'commence',
      'stop': 'cease',
      'big': 'substantial',
      'a lot of': 'a considerable volume of',
      'check': 'verify',
      'fix': 'rectify',
      'think': 'surmise',
      'ask': 'inquire',
    };

    const casualMap: Record<string, string> = {
      'utilize': 'use',
      'facilitate': 'help with',
      'commence': 'kick off',
      'demonstrate': 'show',
      'purchase': 'grab',
      'inquire': 'ask',
      'furthermore': 'also',
      'nevertheless': 'anyway',
      'consequently': 'so',
      'subsequently': 'then',
      'do not': "don't",
      'cannot': "can't",
      'will not': "won't",
      'would not': "wouldn't",
      'should not': "shouldn't",
      'it is': "it's",
      'that is': "that's",
      'we are': "we're",
      'they are': "they're",
    };

    const conciseFluffReplacements: [RegExp, string][] = [
      [/\bin order to\b/gi, 'to'],
      [/\bdue to the fact that\b/gi, 'because'],
      [/\bat this point in time\b/gi, 'now'],
      [/\bfor the purpose of\b/gi, 'to'],
      [/\bwith regard to\b/gi, 'regarding'],
      [/\bin the event that\b/gi, 'if'],
      [/\bhas the ability to\b/gi, 'can'],
      [/\ba large number of\b/gi, 'many'],
      [/\bas a matter of fact\b/gi, 'actually'],
      [/\bit is important to note that\b/gi, ''],
      [/\bneedless to say\b/gi, ''],
      [/\ball of a sudden\b/gi, 'suddenly'],
      [/\beach and every\b/gi, 'every'],
      [/\bfirst and foremost\b/gi, 'first'],
      [/\bat an early date\b/gi, 'soon'],
      [/\bas soon as possible\b/gi, 'promptly'],
    ];

    const replaceWords = (str: string, map: Record<string, string>) => {
      let res = str;
      Object.entries(map).forEach(([orig, repl]) => {
        const regex = new RegExp(`\\b${orig}\\b`, 'gi');
        res = res.replace(regex, (match) => {
          if (match.charAt(0) === match.charAt(0).toUpperCase()) {
            return repl.charAt(0).toUpperCase() + repl.slice(1);
          }
          return repl;
        });
      });
      return res;
    };

    const removeFluff = (str: string) => {
      let res = str;
      conciseFluffReplacements.forEach(([pattern, repl]) => {
        res = res.replace(pattern, repl);
      });
      return res.replace(/\s{2,}/g, ' ').trim();
    };

    let var1 = '';
    let var2 = '';
    let var3 = '';

    switch (tone) {
      case 'professional':
        var1 = replaceWords(removeFluff(trim), {
          'let you know': 'inform you',
          'tell you': 'advise you',
          'talk about': 'discuss',
          'get in touch': 'coordinate',
          'hop on a call': 'schedule a brief discussion',
          'check in': 'follow up',
          'super good': 'highly effective',
          'a lot of time': 'significant time',
        });
        var2 = `Please note: ${var1.charAt(0).toLowerCase() + var1.slice(1)}`;
        var3 = `To ensure seamless alignment, ${var1.charAt(0).toLowerCase() + var1.slice(1)}`;
        break;

      case 'friendly':
        var1 = replaceWords(trim, {
          'I am writing this email to': 'Just reaching out to',
          'we need to': 'it would be wonderful if we could',
          'inform you': 'let you know',
          'as soon as possible': 'whenever you get a chance',
          'reviewing the numbers': 'taking a look at everything together',
          'super good': 'fantastic and helpful',
        });
        var1 = `Hi there! ${var1}`;
        var2 = `${var1} Looking forward to connecting soon! 😊`;
        var3 = `Hope you're having a great week! ${replaceWords(trim, casualMap)}`;
        break;

      case 'formal':
        var1 = replaceWords(trim, formalMap);
        var1 = removeFluff(var1);
        var2 = `It is respectfully submitted that ${var1.charAt(0).toLowerCase() + var1.slice(1)}`;
        var3 = `In accordance with strategic protocol, ${var1.charAt(0).toLowerCase() + var1.slice(1)}`;
        break;

      case 'concise':
        var1 = removeFluff(trim);
        var1 = var1.replace(/\b(I am writing this email to let you know that|just wanted to check in and see if|I would like to take this opportunity to)\b/gi, '');
        var1 = var1.trim();
        var1 = var1.charAt(0).toUpperCase() + var1.slice(1);
        var2 = `Key update: ${var1}`;
        var3 = `Action item: ${var1}`;
        break;

      case 'creative':
        var1 = trim
          .replace(/\b(good|super good|great)\b/gi, 'remarkable')
          .replace(/\b(save a lot of time)\b/gi, 'unlock effortless productivity')
          .replace(/\b(finish|complete)\b/gi, 'bring to life')
          .replace(/\b(ideas)\b/gi, 'visionary concepts');
        var2 = `Imagine a workflow where ${var1.charAt(0).toLowerCase() + var1.slice(1)}`;
        var3 = `Elevating our approach: ${var1}`;
        break;

      case 'casual':
        var1 = replaceWords(trim, casualMap);
        var1 = var1.replace(/^(I am writing this email to let you know that|Please be advised that)/i, 'Hey, just heads up:');
        var2 = `Quick note — ${var1.charAt(0).toLowerCase() + var1.slice(1)}`;
        var3 = `Hey! ${var1}`;
        break;

      default:
        var1 = trim;
        var2 = trim;
        var3 = trim;
    }

    return [var1.trim(), var2.trim(), var3.trim()].filter(Boolean);
  };

  const handleRewrite = async () => {
    if (!inputText.trim()) {
      showToast({ type: 'error', title: 'Input Required', message: 'Please enter text to rephrase.' });
      return;
    }

    setIsProcessing(true);

    try {
      if (hasGeminiApiKey()) {
        const tonePromptDescriptions: Record<ToneMode, string> = {
          professional: 'Professional, articulate, polished, respectful, and workplace-appropriate.',
          friendly: 'Warm, positive, encouraging, empathetic, and approachable with light conversational warmth.',
          formal: 'Academic, elevated vocabulary, structured, objective, and authoritative.',
          concise: 'Ultra-crisp, high signal-to-noise ratio, zero fluff, direct, and compact.',
          creative: 'Engaging, vivid phrasing, compelling storytelling rhythm, and memorable language.',
          casual: 'Relaxed, modern conversational tone with natural idioms, contractions, and easygoing flow.',
        };

        const systemInstruction = `You are a world-class stylistic editor. Rewrite the user's input text into 3 distinct, high-quality variations adhering strictly to the requested tone (${selectedTone}: ${tonePromptDescriptions[selectedTone]}). Separate each variation with the exact delimiter: '---VARIATION---'. Do not include meta-commentary, markdown preamble, or numbering. Only output the 3 rewritten variations separated by '---VARIATION---'.`;

        const geminiOutput = await callGeminiApi({
          prompt: `Text to rewrite:\n"""\n${inputText}\n"""`,
          systemInstruction,
          temperature: 0.7,
        });

        const splitResults = geminiOutput
          .split(/---VARIATION---/i)
          .map((v) => v.trim())
          .filter((v) => v.length > 0);

        if (splitResults.length > 0) {
          setVariations(splitResults);
          setActiveVariationIndex(0);
          showToast({ type: 'success', title: 'Rewritten with Gemini AI', message: `Generated 3 ${selectedTone} options.` });
        } else {
          setVariations([geminiOutput]);
          setActiveVariationIndex(0);
        }
      } else {
        const results = generateOfflineVariations(inputText, selectedTone);
        setVariations(results);
        setActiveVariationIndex(0);
        showToast({ type: 'success', title: 'Content Rephrased', message: `Generated ${results.length} ${selectedTone} options offline.` });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Rewriting Failed', message: err.message || 'Error executing rewrite.' });
      const fallback = generateOfflineVariations(inputText, selectedTone);
      setVariations(fallback);
      setActiveVariationIndex(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!currentOutput) return;
    navigator.clipboard.writeText(currentOutput);
    showToast({ type: 'success', title: 'Copied to Clipboard', message: 'Rephrased text copied.' });
  };

  const handleDownload = () => {
    if (!currentOutput) return;
    const blob = new Blob([currentOutput], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `toolboxx_${selectedTone}_rewrite.txt`);
    showToast({ type: 'success', title: 'Downloaded', message: 'Saved text file.' });
  };

  const handleClear = () => {
    setInputText('');
    setVariations([]);
    setActiveVariationIndex(0);
  };

  const handleLoadSample = (key: keyof typeof SAMPLE_TEXTS) => {
    setInputText(SAMPLE_TEXTS[key]);
    setVariations([]);
  };

  return (
    <div className="space-y-6">
      {/* Gemini Connection Status & Toggle */}
      <GeminiBanner />

      {/* Tone Mode Selector Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
            Select Desired Tone & Persona
          </label>
          <span className="text-xs" style={{ color: 'var(--c-gold)' }}>
            6 Stylistic Modes
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {TONE_CONFIGS.map((tone) => {
            const Icon = tone.icon;
            const isSelected = selectedTone === tone.id;
            return (
              <button
                key={tone.id}
                type="button"
                onClick={() => {
                  setSelectedTone(tone.id);
                  if (inputText && variations.length > 0) {
                    // Re-run for instant responsiveness
                    setTimeout(handleRewrite, 50);
                  }
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected ? 'shadow-md scale-101' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--c-card)' : 'var(--c-surface)',
                  borderColor: isSelected ? 'var(--c-gold)' : 'var(--c-border)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center border text-xs"
                    style={{
                      backgroundColor: 'var(--c-bg)',
                      borderColor: 'var(--c-border)',
                      color: isSelected ? 'var(--c-gold)' : 'var(--c-muted)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                    style={{
                      backgroundColor: 'var(--c-bg)',
                      borderColor: 'var(--c-border)',
                      color: 'var(--c-muted)',
                    }}
                  >
                    {tone.badge}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-xs" style={{ color: isSelected ? 'var(--c-gold)' : 'var(--c-text)' }}>
                    {tone.name}
                  </h4>
                  <p className="text-[10px] line-clamp-1 mt-0.5" style={{ color: 'var(--c-muted)' }}>
                    {tone.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Original Words"
          value={inputStats.words}
          subValue={`${inputStats.characters} chars`}
        />
        <StatCard
          label="Rewritten Words"
          value={currentOutput ? outputStats.words : 0}
          subValue={currentOutput ? `${outputStats.characters} chars` : 'Pending'}
        />
        <StatCard
          label="Tone Alignment"
          value={selectedTone.charAt(0).toUpperCase() + selectedTone.slice(1)}
          badge="Active"
          badgeType="success"
        />
        <StatCard
          label="Variations Ready"
          value={variations.length}
          subValue={variations.length > 0 ? `Option ${activeVariationIndex + 1} of ${variations.length}` : 'Click rewrite'}
        />
      </div>

      {/* Workspace Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Original Text Input */}
        <div
          className="lg:col-span-6 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 shadow-sm"
          style={{
            backgroundColor: 'var(--c-surface)',
            borderColor: 'var(--c-border)',
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--c-text)' }}>
                <FileText className="w-3.5 h-3.5" style={{ color: 'var(--c-gold)' }} /> Original Content
              </span>

              {inputText && (
                <button
                  onClick={handleClear}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              <span className="text-[11px] font-medium mr-1" style={{ color: 'var(--c-muted)' }}>
                Samples:
              </span>
              <button
                type="button"
                onClick={() => handleLoadSample('business')}
                className="px-2 py-1 rounded-lg text-[11px] border hover:opacity-80 transition-opacity cursor-pointer"
                style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
              >
                💼 Business Email
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('casual')}
                className="px-2 py-1 rounded-lg text-[11px] border hover:opacity-80 transition-opacity cursor-pointer"
                style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
              >
                💬 Casual Chat
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('marketing')}
                className="px-2 py-1 rounded-lg text-[11px] border hover:opacity-80 transition-opacity cursor-pointer"
                style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
              >
                🚀 Value Prop
              </button>
            </div>

            <textarea
              rows={11}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type content here to rewrite in your chosen tone..."
              className="w-full p-4 rounded-2xl border text-sm leading-relaxed focus:outline-none transition-colors resize-y font-sans"
              style={{
                backgroundColor: 'var(--c-bg)',
                borderColor: 'var(--c-border)',
                color: 'var(--c-text)',
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleRewrite}
            disabled={isProcessing || !inputText.trim()}
            className="w-full py-3 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 disabled:opacity-40 cursor-pointer"
            style={{
              backgroundColor: 'var(--c-gold)',
              color: 'var(--c-bg)',
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Rephrasing Content...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Rewrite in {TONE_CONFIGS.find((t) => t.id === selectedTone)?.name} Tone
              </>
            )}
          </button>
        </div>

        {/* Right Column: Rewritten Output */}
        <div
          className="lg:col-span-6 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 shadow-sm"
          style={{
            backgroundColor: 'var(--c-surface)',
            borderColor: 'var(--c-border)',
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--c-text)' }}>
                  <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--c-gold)' }} />
                  Rephrased Output
                </span>
              </div>

              {currentOutput && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleRewrite}
                    className="p-2 rounded-xl border text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                    title="Regenerate alternatives"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl border text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                    title="Copy to clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-xl border text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                    title="Download as Text"
                  >
                    <Download className="w-3.5 h-3.5" /> .TXT
                  </button>
                </div>
              )}
            </div>

            {/* Variation Selection Tabs */}
            {variations.length > 1 && (
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-[11px] font-medium" style={{ color: 'var(--c-muted)' }}>
                  Options:
                </span>
                {variations.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveVariationIndex(idx)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeVariationIndex === idx ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: activeVariationIndex === idx ? 'var(--c-card)' : 'var(--c-bg)',
                      borderColor: 'var(--c-border)',
                      color: activeVariationIndex === idx ? 'var(--c-gold)' : 'var(--c-text)',
                    }}
                  >
                    Variation {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Text Preview Display */}
            {currentOutput ? (
              <div
                className="w-full p-4 sm:p-5 rounded-2xl border text-sm leading-relaxed max-h-[420px] overflow-y-auto font-sans whitespace-pre-wrap select-text"
                style={{
                  backgroundColor: 'var(--c-bg)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-text)',
                }}
              >
                {currentOutput}
              </div>
            ) : (
              <div
                className="w-full h-72 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center p-6 space-y-2"
                style={{
                  backgroundColor: 'var(--c-bg)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-subtle)',
                }}
              >
                <Sliders className="w-8 h-8 opacity-40 mb-1" />
                <p className="text-sm font-semibold" style={{ color: 'var(--c-muted)' }}>
                  Awaiting text input
                </p>
                <p className="text-xs max-w-xs leading-relaxed">
                  Enter your draft on the left, pick a tone persona, and click <strong>Rewrite</strong>.
                </p>
              </div>
            )}
          </div>

          {currentOutput && (
            <div className="pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Polished for {selectedTone} tone
              </span>
              <span>{outputStats.words} words ({outputStats.characters} characters)</span>
            </div>
          )}
        </div>
      </div>

      {/* Post Completion Recommendations */}
      <PostCompletionRecommendations currentToolId="ai-rewriter" onReset={handleClear} />
    </div>
  );
};
