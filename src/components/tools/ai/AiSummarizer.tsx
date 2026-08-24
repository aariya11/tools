import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Copy,
  Download,
  Trash2,
  Sparkles,
  Check,
  AlignLeft,
  ListFilter,
  FileCheck,
  Loader2,
  Scissors,
} from 'lucide-react';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { GeminiBanner } from './GeminiKeyModal';
import { callGeminiApi, hasGeminiApiKey } from '../../../utils/geminiClient';
import { calculateTextStats } from '../../../utils/textUtils';
import { downloadBlob } from '../../../utils/fileUtils';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

type SummaryLength = 'short' | 'medium' | 'detailed';
type SummaryFormat = 'bullets' | 'paragraph' | 'structured';

const SAMPLE_TEXTS = {
  business: `Quarterly Business Performance Review - Q3 Strategy & Operational Execution:
Over the past quarter, the organization achieved a 28% year-over-year revenue increase, exceeding analysts' projections across major enterprise product categories. This acceleration was largely propelled by the rollout of our cloud-native automation suite and strategic channel partnerships in EMEA and APAC markets. Customer acquisition cost (CAC) dropped by 14% as organic inbound referral loops strengthened, while gross margins expanded to 74.2%.

However, operational overhead and infrastructure hosting expenses increased by 19% due to rapid server provisioning and legacy database migrations. In addition, customer churn in the mid-market segment ticked up slightly to 2.8%, highlighting the need for enhanced customer success onboarding and faster feature resolution turnaround.

Moving into Q4, the management team will focus on three core strategic pillars. First, optimizing cloud infrastructure through automated workload scaling to reduce cloud compute expenditures by at least 15%. Second, restructuring enterprise client success tiers to address churn before annual renewal cycles. Third, accelerating the beta launch of the AI-assisted enterprise analytics workspace to expand average contract value across tier-1 accounts.`,
  tech: `Understanding WebAssembly, Zero-Cost Abstractions, and Next-Gen Browser Architecture:
WebAssembly (Wasm) has revolutionized client-side web computing by introducing a portable, low-level binary format that executes at near-native speed inside standard sandboxed browser environments. Historically, JavaScript was the sole execution runtime in web browsers, which posed severe CPU bottlenecks for computationally intensive tasks like computer vision, cryptographic hashing, 3D graphics rendering, and heavy audio synthesis.

By compiling languages like Rust, C++, and Go into compact Wasm bytecode, developers can run mission-critical subroutines with deterministic execution characteristics and predictable memory consumption. Modern browser engines parse and compile WebAssembly bytecode significantly faster than JavaScript source text because the binary format directly mirrors hardware instructions without requiring expensive dynamic type speculation or complex JIT deoptimizations.

Furthermore, the introduction of the WebAssembly Component Model and WebAssembly System Interface (WASI) enables modular code reuse across both browser clients and serverless edge runtimes. As web applications increasingly migrate desktop-grade creative tooling and on-device machine learning models to the client, WebAssembly serves as the foundational substrate for zero-compromise browser engineering.`,
  research: `Artificial Intelligence in Clinical Diagnostics: Efficacy, Generalizability, and Clinical Workflow Integration:
Recent advancements in deep convolutional neural networks and vision transformers have demonstrated clinical-grade diagnostic precision across dermatology, radiology, and histopathology. Multicenter clinical evaluations show that modern ensemble algorithms can identify early-stage malignant melanoma and pulmonary nodules with sensitivity and specificity matching or exceeding board-certified specialists.

Despite these promising benchmark scores, significant roadblocks remain before wide-scale clinical adoption can occur. A major concern is out-of-distribution dataset shift, where neural networks trained on specific hospital imaging hardware experience drastic performance degradation when deployed in community clinics with different scanner calibrations or patient demographics. Additionally, the lack of interpretable feature attribution makes it challenging for healthcare practitioners to validate the underlying clinical rationale for model predictions.

To successfully integrate AI tools into healthcare workflows, future research must prioritize multimodal federated learning, standardized algorithmic stress testing across diverse demographic cohorts, and transparent uncertainty quantification frameworks that empower physicians to act as definitive decision-makers.`,
};

export const AiSummarizer: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
  const [summaryFormat, setSummaryFormat] = useState<SummaryFormat>('bullets');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const inputStats = calculateTextStats(inputText);
  const outputStats = calculateTextStats(summary);

  const compressionRate =
    inputStats.words > 0 && outputStats.words > 0
      ? Math.max(0, Math.round(((inputStats.words - outputStats.words) / inputStats.words) * 100))
      : 0;

  // Smart Extractive NLP Algorithm (100% Client-Side)
  const generateOfflineSummary = (text: string, length: SummaryLength, format: SummaryFormat): string => {
    if (!text.trim()) return '';

    const cleanText = text.trim();
    const rawSentences = cleanText
      .split(/(?<=[.?!])\s+(?=[A-Z0-9"'])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20 && s.split(/\s+/).length >= 4);

    if (rawSentences.length <= 2) {
      return cleanText;
    }

    const stopWords = new Set([
      'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
      'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
      'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
      'have', 'having', 'he', 'her', 'here', 'hers', 'him', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its',
      'itself', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
      'other', 'ought', 'our', 'ours', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
      'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those',
      'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which',
      'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours'
    ]);

    const words = cleanText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));
    const wordFreq: Record<string, number> = {};
    words.forEach((w) => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });

    const maxFreq = Math.max(...Object.values(wordFreq), 1);

    const highValueCues = [
      'in conclusion', 'in summary', 'overall', 'crucial', 'importantly', 'significant',
      'key finding', 'results show', 'demonstrates', 'accelerate', 'primarily',
      'notably', 'concluded', 'proves', 'vital', 'essential', 'strategic', 'reveals'
    ];

    const scoredSentences = rawSentences.map((sentence, index) => {
      const sentenceWords = sentence.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2);
      let score = 0;

      sentenceWords.forEach((w) => {
        if (wordFreq[w]) {
          score += (wordFreq[w] / maxFreq);
        }
      });

      if (sentenceWords.length > 0) {
        score = score / Math.pow(sentenceWords.length, 0.7);
      }

      if (index === 0) score += 2.2;
      if (index === 1) score += 1.2;
      if (index === rawSentences.length - 1) score += 1.4;

      const lower = sentence.toLowerCase();
      highValueCues.forEach((cue) => {
        if (lower.includes(cue)) {
          score += 1.6;
        }
      });

      if (sentenceWords.length > 45) {
        score *= 0.8;
      }

      return {
        text: sentence,
        index,
        score,
      };
    });

    let targetCount = 3;
    if (length === 'short') {
      targetCount = Math.max(1, Math.min(2, Math.ceil(rawSentences.length * 0.25)));
    } else if (length === 'medium') {
      targetCount = Math.max(3, Math.min(5, Math.ceil(rawSentences.length * 0.45)));
    } else {
      targetCount = Math.max(5, Math.min(8, Math.ceil(rawSentences.length * 0.65)));
    }

    const sortedByScore = [...scoredSentences].sort((a, b) => b.score - a.score);
    const selected = sortedByScore.slice(0, targetCount);
    selected.sort((a, b) => a.index - b.index);

    if (format === 'bullets') {
      return selected.map((item) => `• ${item.text}`).join('\n\n');
    } else if (format === 'structured') {
      const topSentence = selected[0]?.text || '';
      const bullets = selected.slice(1).map((item) => `  - ${item.text}`).join('\n\n');
      return `📌 Executive Overview:\n${topSentence}\n\n🔍 Key Takeaways:\n${bullets}`;
    } else {
      return selected.map((item) => item.text).join(' ');
    }
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      showToast({ type: 'error', title: 'Empty Input', message: 'Please enter or upload text to summarize.' });
      return;
    }

    setIsProcessing(true);

    try {
      if (hasGeminiApiKey()) {
        const lengthPromptMap = {
          short: 'Create a punchy TL;DR summary in 1-2 core sentences with bullet takeaways.',
          medium: 'Create a balanced 3-5 point summary highlighting essential findings, context, and outcomes.',
          detailed: 'Create a comprehensive, in-depth executive brief with an overview, organized key points, and strategic conclusions.',
        };

        const formatPromptMap = {
          bullets: 'Format the output strictly as clean bullet points with bullet markers.',
          paragraph: 'Format the output as coherent, well-structured prose paragraphs.',
          structured: 'Format with clean Markdown headings (e.g. ## Executive Overview, ## Key Takeaways, ## Strategic Implications).',
        };

        const systemInstruction = `You are a world-class executive research assistant. Summarize the provided document accurately, eliminating conversational filler, jargon, and repetition. Maintain absolute factual fidelity to the source text.`;
        const prompt = `${lengthPromptMap[summaryLength]}\n${formatPromptMap[summaryFormat]}\n\nSource Document:\n"""\n${inputText}\n"""`;

        const geminiOutput = await callGeminiApi({
          prompt,
          systemInstruction,
          temperature: 0.3,
        });

        setSummary(geminiOutput);
        showToast({ type: 'success', title: 'Gemini Summary Ready', message: 'Generated via Google Gemini AI.' });
      } else {
        const offlineResult = generateOfflineSummary(inputText, summaryLength, summaryFormat);
        setSummary(offlineResult);
        showToast({ type: 'success', title: 'Summary Generated', message: 'Extracted using local smart NLP engine.' });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Summarization Failed', message: err.message || 'Error processing summary.' });
      const fallback = generateOfflineSummary(inputText, summaryLength, summaryFormat);
      setSummary(fallback);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadedFileName(file.name);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'txt' || ext === 'md' || ext === 'json' || ext === 'csv') {
        const text = await file.text();
        setInputText(text);
        showToast({ type: 'success', title: 'File Loaded', message: `Extracted ${text.split(/\s+/).length} words from ${file.name}` });
      } else if (ext === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setInputText(result.value);
        showToast({ type: 'success', title: 'DOCX Loaded', message: `Extracted text from ${file.name}` });
      } else if (ext === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        let extracted = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(' ');
          extracted += `${pageText}\n\n`;
        }
        setInputText(extracted.trim());
        showToast({ type: 'success', title: 'PDF Loaded', message: `Extracted ${pdf.numPages} pages from ${file.name}` });
      } else {
        throw new Error('Unsupported file format. Please upload .txt, .md, .docx, .pdf, .json, or .csv');
      }
      setActiveTab('paste');
    } catch (err: any) {
      showToast({ type: 'error', title: 'Upload Failed', message: err.message || 'Unable to read file contents.' });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    showToast({ type: 'success', title: 'Copied to Clipboard', message: 'Summary copied successfully.' });
  };

  const handleDownload = (formatType: 'md' | 'txt') => {
    if (!summary) return;
    const mime = formatType === 'md' ? 'text/markdown' : 'text/plain';
    const blob = new Blob([summary], { type: `${mime};charset=utf-8` });
    downloadBlob(blob, `toolboxx_summary.${formatType}`);
    showToast({ type: 'success', title: 'File Downloaded', message: `Saved summary as .${formatType}` });
  };

  const handleClear = () => {
    setInputText('');
    setSummary('');
    setUploadedFileName('');
  };

  const handleLoadSample = (key: keyof typeof SAMPLE_TEXTS) => {
    setInputText(SAMPLE_TEXTS[key]);
    setSummary('');
    setActiveTab('paste');
  };

  return (
    <div className="space-y-6">
      {/* Gemini Banner */}
      <GeminiBanner />

      {/* Real-Time Stats Top Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Original Length"
          value={`${inputStats.words} words`}
          subValue={`${inputStats.sentences} sentences`}
        />
        <StatCard
          label="Summary Length"
          value={summary ? `${outputStats.words} words` : '0 words'}
          subValue={summary ? `${outputStats.sentences} sentences` : 'Ready to generate'}
        />
        <StatCard
          label="Compression Ratio"
          value={summary ? `${compressionRate}%` : '0%'}
          badge={summary ? 'Reduced' : undefined}
          badgeType="success"
          subValue={summary ? `${inputStats.words - outputStats.words} words saved` : 'Compact output'}
        />
        <StatCard
          label="Reading Time"
          value={summary ? `${outputStats.readingTimeMinutes} min` : `${inputStats.readingTimeMinutes} min`}
          subValue={`Orig: ${inputStats.readingTimeMinutes} min`}
        />
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Panel */}
        <div
          className="lg:col-span-6 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 shadow-sm"
          style={{
            backgroundColor: 'var(--c-surface)',
            borderColor: 'var(--c-border)',
          }}
        >
          <div>
            {/* Header & Tabs */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'paste' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'paste' ? 'var(--c-card)' : 'transparent',
                    color: 'var(--c-text)',
                  }}
                >
                  <FileText className="w-3.5 h-3.5" /> Paste Text
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'upload' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'upload' ? 'var(--c-card)' : 'transparent',
                    color: 'var(--c-text)',
                  }}
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Document
                </button>
              </div>

              {inputText && (
                <button
                  onClick={handleClear}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Presets Bar */}
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              <span className="text-[11px] font-medium mr-1" style={{ color: 'var(--c-muted)' }}>
                Load Sample:
              </span>
              <button
                type="button"
                onClick={() => handleLoadSample('business')}
                className="px-2 py-1 rounded-lg text-[11px] border hover:opacity-80 transition-opacity cursor-pointer"
                style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
              >
                📊 Business Report
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('tech')}
                className="px-2 py-1 rounded-lg text-[11px] border hover:opacity-80 transition-opacity cursor-pointer"
                style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
              >
                ⚡ Tech Architecture
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('research')}
                className="px-2 py-1 rounded-lg text-[11px] border hover:opacity-80 transition-opacity cursor-pointer"
                style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
              >
                🔬 Clinical Study
              </button>
            </div>

            {/* Text Area / Upload Area */}
            {activeTab === 'paste' ? (
              <textarea
                rows={12}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your article, meeting notes, essay, research paper, or report here to summarize..."
                className="w-full p-4 rounded-2xl border text-sm leading-relaxed focus:outline-none transition-colors resize-y font-sans"
                style={{
                  backgroundColor: 'var(--c-bg)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-text)',
                }}
              />
            ) : (
              <div
                className="p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center space-y-3 cursor-pointer hover:opacity-90 transition-all"
                style={{
                  backgroundColor: 'var(--c-bg)',
                  borderColor: 'var(--c-border-hover)',
                }}
                onClick={() => document.getElementById('summarizer-file-input')?.click()}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border"
                  style={{
                    backgroundColor: 'var(--c-card)',
                    borderColor: 'var(--c-border)',
                    color: 'var(--c-gold)',
                  }}
                >
                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                </div>

                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--c-text)' }}>
                    {uploadedFileName || 'Drop document or click to browse'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--c-muted)' }}>
                    Supports PDF, DOCX, TXT, Markdown, CSV, JSON (Up to 50MB)
                  </p>
                </div>

                <input
                  id="summarizer-file-input"
                  type="file"
                  accept=".txt,.md,.docx,.pdf,.json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Controls: Length & Format */}
          <div className="space-y-4 pt-2 border-t" style={{ borderColor: 'var(--c-border)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Length Selection */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--c-muted)' }}>
                  Summary Depth
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl border" style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                  {[
                    { id: 'short', label: 'Short', desc: 'TL;DR' },
                    { id: 'medium', label: 'Medium', desc: 'Key Points' },
                    { id: 'detailed', label: 'Detailed', desc: 'In-Depth' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setSummaryLength(lvl.id as SummaryLength)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer ${
                        summaryLength === lvl.id ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: summaryLength === lvl.id ? 'var(--c-card)' : 'transparent',
                        color: summaryLength === lvl.id ? 'var(--c-gold)' : 'var(--c-text)',
                      }}
                    >
                      <span>{lvl.label}</span>
                      <span className="text-[9px] opacity-75 font-normal">{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--c-muted)' }}>
                  Output Format
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl border" style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                  {[
                    { id: 'bullets', label: 'Bullets', icon: ListFilter },
                    { id: 'paragraph', label: 'Prose', icon: AlignLeft },
                    { id: 'structured', label: 'Brief', icon: FileCheck },
                  ].map((fmt) => {
                    const Icon = fmt.icon;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setSummaryFormat(fmt.id as SummaryFormat)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer ${
                          summaryFormat === fmt.id ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor: summaryFormat === fmt.id ? 'var(--c-card)' : 'transparent',
                          color: summaryFormat === fmt.id ? 'var(--c-gold)' : 'var(--c-text)',
                        }}
                      >
                        <Icon className="w-3.5 h-3.5 mb-0.5" />
                        <span>{fmt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Summarize CTA Button */}
            <button
              type="button"
              onClick={handleSummarize}
              disabled={isProcessing || !inputText.trim()}
              className="w-full py-3 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 disabled:opacity-40 cursor-pointer"
              style={{
                backgroundColor: 'var(--c-gold)',
                color: 'var(--c-bg)',
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing & Synthesizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Executive Summary
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output Summary Panel */}
        <div
          className="lg:col-span-6 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between shadow-sm space-y-4"
          style={{
            backgroundColor: 'var(--c-surface)',
            borderColor: 'var(--c-border)',
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center border text-xs font-bold"
                  style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-gold)' }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif" style={{ color: 'var(--c-text)' }}>
                    Executive Summary
                  </h3>
                  <span className="text-[11px]" style={{ color: 'var(--c-muted)' }}>
                    {summary ? `${outputStats.words} words • ${outputStats.sentences} key points` : 'Awaiting input'}
                  </span>
                </div>
              </div>

              {summary && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl border text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                    title="Copy to clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  <button
                    onClick={() => handleDownload('md')}
                    className="p-2 rounded-xl border text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                    title="Download as Markdown"
                  >
                    <Download className="w-3.5 h-3.5" /> .MD
                  </button>
                  <button
                    onClick={() => handleDownload('txt')}
                    className="p-2 rounded-xl border text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                    title="Download as Text"
                  >
                    .TXT
                  </button>
                </div>
              )}
            </div>

            {/* Output Display Area */}
            {summary ? (
              <div
                className="w-full p-4 sm:p-5 rounded-2xl border text-sm leading-relaxed max-h-[480px] overflow-y-auto font-sans whitespace-pre-wrap select-text"
                style={{
                  backgroundColor: 'var(--c-bg)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-text)',
                }}
              >
                {summary}
              </div>
            ) : (
              <div
                className="w-full h-80 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center p-6 space-y-2"
                style={{
                  backgroundColor: 'var(--c-bg)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-subtle)',
                }}
              >
                <Scissors className="w-8 h-8 opacity-40 mb-1" />
                <p className="text-sm font-semibold" style={{ color: 'var(--c-muted)' }}>
                  No summary generated yet
                </p>
                <p className="text-xs max-w-xs leading-relaxed">
                  Paste text or upload a document on the left, then click <strong>Generate Executive Summary</strong>.
                </p>
              </div>
            )}
          </div>

          {summary && (
            <div className="pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Cleaned & distilled
              </span>
              <span>Saved {Math.max(0, inputStats.readingTimeMinutes - outputStats.readingTimeMinutes).toFixed(1)} mins reading time</span>
            </div>
          )}
        </div>
      </div>

      {/* Post Completion Recommendations */}
      <PostCompletionRecommendations currentToolId="ai-summarizer" onReset={handleClear} />
    </div>
  );
};
