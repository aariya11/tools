import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Download,
  Trash2,
  Check,
  ChevronDown,
  ChevronRight,
  Plus,
  Layers,
  BookOpen,
  ListTree,
  FileCode,
  HelpCircle,
  Clock,
  Loader2,
  Target,
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { GeminiBanner } from './GeminiKeyModal';
import { callGeminiApi, hasGeminiApiKey } from '../../../utils/geminiClient';
import { downloadBlob } from '../../../utils/fileUtils';

export interface OutlineSubSection {
  h3: string;
  points: string[];
}

export interface OutlineSection {
  id: string;
  h2: string;
  targetWords: number;
  subsections: OutlineSubSection[];
}

export interface OutlineFAQ {
  question: string;
  answerHint: string;
}

export interface CompleteBlogOutline {
  h1: string;
  metaDescription: string;
  targetAudience: string;
  estimatedTotalWords: number;
  introHook: string;
  sections: OutlineSection[];
  keyTakeaways: string[];
  faqs: OutlineFAQ[];
  conclusionCta: string;
}

export type ContentFormat = 'guide' | 'tutorial' | 'comparison' | 'deepdive' | 'case_study';

const FORMAT_OPTIONS = [
  { id: 'guide', name: 'Comprehensive Guide', desc: 'A-to-Z mastery & foundational overview' },
  { id: 'tutorial', name: 'Step-by-Step Tutorial', desc: 'Actionable instructions & code/examples' },
  { id: 'comparison', name: 'Comparison / Review', desc: 'Pros, cons, benchmarks & alternatives' },
  { id: 'deepdive', name: 'Technical Deep-Dive', desc: 'Architecture, internals & performance' },
  { id: 'case_study', name: 'Case Study', desc: 'Real-world problem, strategy & metrics' },
];

export const AiBlogOutline: React.FC = () => {
  const [topic, setTopic] = useState<string>('The Complete Guide to Next.js 15 Server Components and Performance Optimization');
  const [audience, setAudience] = useState<string>('Senior Frontend Engineers & React Developers');
  const [targetWordCount, setTargetWordCount] = useState<number>(2500);
  const [format, setFormat] = useState<ContentFormat>('guide');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<string>>(new Set());

  const [outline, setOutline] = useState<CompleteBlogOutline>({
    h1: 'The Complete Guide to Next.js 15 Server Components & Performance Optimization (2026)',
    metaDescription: 'Master Next.js 15 React Server Components (RSC), asynchronous request handling, PPR caching, and bundle optimization with real-world architecture examples.',
    targetAudience: 'Senior Frontend Engineers & React Developers',
    estimatedTotalWords: 2500,
    introHook: 'Modern web applications require instantaneous initial page loads without sacrificing dynamic client interactivity. Discover how Next.js 15 Server Components fundamentally shift data fetching to the server.',
    sections: [
      {
        id: 'sec-1',
        h2: '1. Understanding React Server Components Architecture in Next.js 15',
        targetWords: 450,
        subsections: [
          {
            h3: '1.1 The Server-Client Component Boundary',
            points: [
              'Demarcating "use client" vs default server components',
              'Serialization rules for component props and async boundaries',
              'Eliminating client runtime JavaScript for non-interactive widgets',
            ],
          },
          {
            h3: '1.2 Asynchronous Request Handling in Next.js 15',
            points: [
              'Async cookies(), headers(), and params APIs',
              'Streaming UI with Suspense boundaries and skeleton loaders',
            ],
          },
        ],
      },
      {
        id: 'sec-2',
        h2: '2. Deep Dive into Partial Prerendering (PPR) and Caching Models',
        targetWords: 550,
        subsections: [
          {
            h3: '2.1 Static Shell vs Dynamic Content Holes',
            points: [
              'Combining static generation with dynamic edge streaming',
              'Enabling experimental.ppr configuration flag',
            ],
          },
          {
            h3: '2.2 Mastering the "use cache" Directive and Tag Revalidation',
            points: [
              'Configuring revalidateTag and cacheLife profiles',
              'Preventing stale data leaks across multi-tenant deployments',
            ],
          },
        ],
      },
      {
        id: 'sec-3',
        h2: '3. Data Fetching Patterns and Eliminating Client-Side Waterfalls',
        targetWords: 500,
        subsections: [
          {
            h3: '3.1 Parallel vs Sequential Data Fetching',
            points: [
              'Leveraging Promise.all in Server Component layouts',
              'Colocating database queries with UI components without ORM bloat',
            ],
          },
          {
            h3: '3.2 Server Actions for Mutation and Optimistic UI Updates',
            points: [
              'Form submission validation using Zod and useActionState',
              'Optimistic feedback with useOptimistic hook',
            ],
          },
        ],
      },
      {
        id: 'sec-4',
        h2: '4. Bundle Size Optimization and Core Web Vitals Benchmarking',
        targetWords: 500,
        subsections: [
          {
            h3: '4.1 Analyzing Bundle Treemaps with @next/bundle-analyzer',
            points: [
              'Detecting inadvertent heavy client imports',
              'Dynamic imports and code-splitting strategies',
            ],
          },
          {
            h3: '4.2 Achieving Sub-1.5s Largest Contentful Paint (LCP)',
            points: [
              'Next.js Image component optimization and priority preloading',
              'Self-hosting web fonts with next/font',
            ],
          },
        ],
      },
      {
        id: 'sec-5',
        h2: '5. Production Deployment, Edge Middleware, and Monitoring',
        targetWords: 500,
        subsections: [
          {
            h3: '5.1 Zero-Downtime Deployment on Edge Runtimes',
            points: [
              'Configuring standalone output mode in next.config.ts',
              'Edge middleware routing and geo-location header caching',
            ],
          },
          {
            h3: '5.2 Observability and OpenTelemetry Tracing',
            points: [
              'Injecting OpenTelemetry instrumentation for server component execution times',
              'Monitoring real user metrics (INP and CLS)',
            ],
          },
        ],
      },
    ],
    keyTakeaways: [
      'Server components eliminate client-side JavaScript bundle weight for static data views.',
      'Partial Prerendering (PPR) combines instantaneous static CDN delivery with dynamic real-time streaming.',
      'Always colocate async data fetching inside server components to eradicate client waterfall latency.',
      'Use Server Actions paired with useOptimistic for instant user feedback and resilient validation.',
    ],
    faqs: [
      {
        question: 'What is the main difference between "use client" and Server Components?',
        answerHint: 'Server Components execute exclusively on the Node/Edge server and ship 0KB JS. "use client" components hydrate in the browser to handle events and state.',
      },
      {
        question: 'How does Next.js 15 handle un-cached fetch requests by default?',
        answerHint: 'Next.js 15 defaults fetch requests to un-cached (cache: "no-store") to ensure fresh data unless explicitly opted into caching via "use cache" or fetch options.',
      },
      {
        question: 'Can Server Components be nested inside Client Components?',
        answerHint: 'Yes, but only by passing them as children or props, not by importing them directly into client component source files.',
      },
    ],
    conclusionCta: 'By mastering React Server Components and Next.js 15 caching primitives, your web applications will achieve sub-second page loads and superior Core Web Vitals. Start auditing your component boundaries today!',
  });

  // Client-Side Structural Outline Synthesizer
  const generateOfflineOutline = (
    topicStr: string,
    targetAud: string,
    words: number,
    fmt: ContentFormat
  ): CompleteBlogOutline => {
    const cleanTopic = topicStr.trim() || 'Modern Technology Architecture';
    const year = new Date().getFullYear();

    const sections: OutlineSection[] = [
      {
        id: 'sec-1',
        h2: `1. Introduction to ${cleanTopic}: Fundamentals & Core Value Proposition`,
        targetWords: Math.round(words * 0.18),
        subsections: [
          {
            h3: `1.1 Defining ${cleanTopic} and Why It Matters in ${year}`,
            points: [
              'Core definition, key concepts, and industry drivers',
              'The historical progression and problems with legacy approaches',
              'Who benefits most from adopting this methodology',
            ],
          },
          {
            h3: '1.2 Key Architectural Principles and High-Level Workflow',
            points: [
              'Essential terminology and mental models',
              'Foundational mechanics and prerequisites before getting started',
            ],
          },
        ],
      },
      {
        id: 'sec-2',
        h2: `2. Strategic Setup, Configuration & Essential Prerequisites`,
        targetWords: Math.round(words * 0.2),
        subsections: [
          {
            h3: '2.1 Recommended Environment Setup and Tooling',
            points: [
              'Initial toolchain selection and installation walkthrough',
              'Best practices for configuration and secret management',
            ],
          },
          {
            h3: '2.2 Architecture Blueprint & Project Structure',
            points: [
              'Organizing directories, modules, and separation of concerns',
              'Standard conventions to avoid technical debt early',
            ],
          },
        ],
      },
      {
        id: 'sec-3',
        h2: `3. Step-by-Step Implementation Guide & Practical Examples`,
        targetWords: Math.round(words * 0.26),
        subsections: [
          {
            h3: '3.1 Core Workflow Execution and Hands-on Walkthrough',
            points: [
              'Phase 1: Initial baseline build and verification',
              'Phase 2: Integrating advanced parameters and dynamic features',
              'Phase 3: Error handling, edge cases, and fallback patterns',
            ],
          },
          {
            h3: '3.2 Real-World Code / Concrete Implementation Examples',
            points: [
              'Realistic scenario demonstrating end-to-end functionality',
              'Common pitfalls during implementation and how to troubleshoot them',
            ],
          },
        ],
      },
      {
        id: 'sec-4',
        h2: `4. Advanced Optimization, Security & Scaling Strategies`,
        targetWords: Math.round(words * 0.2),
        subsections: [
          {
            h3: '4.1 Performance Tuning and Bottleneck Elimination',
            points: [
              'Benchmarking metrics, profiling tools, and latency reduction',
              'Caching layers and asynchronous workload delegation',
            ],
          },
          {
            h3: '4.2 Security Hardening and Compliance Best Practices',
            points: [
              'Access control, encryption, and threat modeling',
              'Automated testing strategies to guarantee reliability',
            ],
          },
        ],
      },
      {
        id: 'sec-5',
        h2: `5. Future Trends, Industry Benchmarks & Long-Term Roadmap`,
        targetWords: Math.round(words * 0.16),
        subsections: [
          {
            h3: `5.1 Emerging Trends Shaping ${cleanTopic} Beyond ${year}`,
            points: [
              'Next-generation updates and community developments',
              'Predictions for enterprise adoption and tooling maturation',
            ],
          },
        ],
      },
    ];

    return {
      h1: `The Ultimate Guide to ${cleanTopic} (${year})`,
      metaDescription: `A comprehensive, step-by-step editorial guide covering ${cleanTopic}, best practices, architectural blueprints, and actionable tips for ${targetAud}.`,
      targetAudience: targetAud,
      estimatedTotalWords: words,
      introHook: `In today's fast-evolving landscape, understanding ${cleanTopic} is essential for forward-thinking teams. This guide breaks down the core architecture, practical implementations, and scaling strategies.`,
      sections,
      keyTakeaways: [
        `${cleanTopic} provides significant operational and architectural advantages when implemented correctly.`,
        'Focus on strong foundation setup and clear modular boundaries to prevent technical debt.',
        'Always establish automated testing and performance benchmarks early in the adoption lifecycle.',
        'Continuous monitoring and security audits ensure long-term stability and compliance.',
      ],
      faqs: [
        {
          question: `What are the primary benefits of ${cleanTopic}?`,
          answerHint: `Delivers improved efficiency, predictable scalability, robust security, and faster development cycles.`,
        },
        {
          question: `How steep is the learning curve for ${targetAud}?`,
          answerHint: `Teams with foundational knowledge can become productive within a few weeks following this structured roadmap.`,
        },
        {
          question: `What common mistakes should teams avoid when implementing ${cleanTopic}?`,
          answerHint: `Avoid over-engineering initial architectures, neglecting automated tests, or bypassing security configurations.`,
        },
      ],
      conclusionCta: `Ready to elevate your workflow? Apply these ${cleanTopic} best practices to your next project and share this guide with your engineering team!`,
    };
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast({ type: 'error', title: 'Topic Required', message: 'Please enter a blog topic or title.' });
      return;
    }

    setIsGenerating(true);

    try {
      if (hasGeminiApiKey()) {
        const formatName = FORMAT_OPTIONS.find((f) => f.id === format)?.name || format;
        const systemInstruction = `You are a world-class content director, SEO editor-in-chief, and curriculum designer.
Generate a complete, exhaustive, structured blog outline in valid JSON matching this exact TypeScript structure:
{
  "h1": "string (Compelling SEO Master Title)",
  "metaDescription": "string (150-160 chars SEO description)",
  "targetAudience": "string",
  "estimatedTotalWords": number,
  "introHook": "string",
  "sections": [
    {
      "id": "sec-1",
      "h2": "string",
      "targetWords": number,
      "subsections": [
        {
          "h3": "string",
          "points": ["string", "string", "string"]
        }
      ]
    }
  ],
  "keyTakeaways": ["string", "string", "string", "string"],
  "faqs": [
    {
      "question": "string",
      "answerHint": "string"
    }
  ],
  "conclusionCta": "string"
}
Return ONLY pure JSON. Do not include markdown code block formatting or preamble.`;

        const geminiOutput = await callGeminiApi({
          prompt: `Topic: ${topic}\nTarget Audience: ${audience}\nTarget Word Count: ${targetWordCount}\nFormat: ${formatName}`,
          systemInstruction,
          temperature: 0.6,
        });

        // Clean json if wrapped in ```json ... ```
        const cleanJson = geminiOutput.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(cleanJson);
        setOutline(parsed);
        showToast({ type: 'success', title: 'Outline Generated', message: 'Created deep structured outline with Gemini AI.' });
      } else {
        const res = generateOfflineOutline(topic, audience, targetWordCount, format);
        setOutline(res);
        showToast({ type: 'success', title: 'Outline Generated', message: 'Synthesized editorial outline offline.' });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Generation Error', message: err.message || 'Falling back to offline outline synthesis.' });
      const res = generateOfflineOutline(topic, audience, targetWordCount, format);
      setOutline(res);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSectionCollapse = (secId: string) => {
    setCollapsedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(secId)) next.delete(secId);
      else next.add(secId);
      return next;
    });
  };

  const getMarkdownRepresentation = (): string => {
    if (!outline) return '';

    let md = `# ${outline.h1}\n\n`;
    md += `> **Meta Description:** ${outline.metaDescription}\n`;
    md += `> **Target Audience:** ${outline.targetAudience} | **Word Count Goal:** ~${outline.estimatedTotalWords} words\n\n`;

    md += `## Introduction\n${outline.introHook}\n\n`;

    outline.sections.forEach((sec) => {
      md += `## ${sec.h2} (~${sec.targetWords} words)\n\n`;
      sec.subsections.forEach((sub) => {
        md += `### ${sub.h3}\n`;
        sub.points.forEach((pt) => {
          md += `- ${pt}\n`;
        });
        md += `\n`;
      });
    });

    md += `## 📌 Key Takeaways\n`;
    outline.keyTakeaways.forEach((item) => {
      md += `- ${item}\n`;
    });
    md += `\n`;

    md += `## ❓ Frequently Asked Questions (FAQ)\n`;
    outline.faqs.forEach((faq) => {
      md += `### Q: ${faq.question}\n**A:** ${faq.answerHint}\n\n`;
    });

    md += `## Conclusion & Next Steps\n${outline.conclusionCta}\n`;

    return md;
  };

  const handleCopyMarkdown = () => {
    const md = getMarkdownRepresentation();
    navigator.clipboard.writeText(md);
    showToast({ type: 'success', title: 'Copied Markdown', message: 'Complete outline copied formatted as Markdown.' });
  };

  const handleDownloadMarkdown = () => {
    const md = getMarkdownRepresentation();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, 'toolboxx_blog_outline.md');
    showToast({ type: 'success', title: 'Downloaded Outline', message: 'Saved as .md file.' });
  };

  const totalH3Count = outline.sections.reduce((acc, s) => acc + s.subsections.length, 0);

  return (
    <div className="space-y-6">
      {/* Gemini Banner */}
      <GeminiBanner />

      {/* Top Stat Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Target Word Count"
          value={`~${outline.estimatedTotalWords.toLocaleString()}`}
          subValue="Estimated final article"
        />
        <StatCard
          label="H2 Main Sections"
          value={outline.sections.length}
          subValue={`${totalH3Count} H3 subtopics`}
        />
        <StatCard
          label="Key Takeaways"
          value={outline.keyTakeaways.length}
          subValue="Executive bullet summary"
        />
        <StatCard
          label="FAQs Planned"
          value={outline.faqs.length}
          subValue="Rich SEO snippets"
        />
      </div>

      {/* Configuration Input Strip */}
      <div
        className="p-5 sm:p-6 rounded-3xl border shadow-sm space-y-4"
        style={{
          backgroundColor: 'var(--c-surface)',
          borderColor: 'var(--c-border)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
              Blog Topic / Working Headline
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Complete Guide to Kubernetes in 2026, How to Scale B2B Sales"
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--c-bg)',
                borderColor: 'var(--c-border)',
                color: 'var(--c-text)',
              }}
            />
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
              Target Audience Persona
            </label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g., Senior Engineers, Marketers"
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--c-bg)',
                borderColor: 'var(--c-border)',
                color: 'var(--c-text)',
              }}
            />
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
              Article Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as ContentFormat)}
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--c-bg)',
                borderColor: 'var(--c-border)',
                color: 'var(--c-text)',
              }}
            >
              {FORMAT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id} style={{ backgroundColor: 'var(--c-surface)', color: 'var(--c-text)' }}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Word count target selector & generate button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t" style={{ borderColor: 'var(--c-border)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--c-muted)' }}>
              Word Count Goal:
            </span>
            <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
              {[1200, 2000, 3000, 4500].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setTargetWordCount(w)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    targetWordCount === w ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: targetWordCount === w ? 'var(--c-card)' : 'transparent',
                    color: targetWordCount === w ? 'var(--c-gold)' : 'var(--c-text)',
                  }}
                >
                  {w >= 1000 ? `${(w / 1000).toFixed(1)}k` : w}w
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full sm:w-auto py-3 px-8 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 disabled:opacity-40 cursor-pointer"
            style={{
              backgroundColor: 'var(--c-gold)',
              color: '#11110F',
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Structuring Outline Architecture...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate Complete Blog Outline
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Outline Interactive Viewer */}
      <div
        className="p-5 sm:p-8 rounded-3xl border shadow-sm space-y-6"
        style={{
          backgroundColor: 'var(--c-surface)',
          borderColor: 'var(--c-border)',
        }}
      >
        {/* Top Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border" style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-gold)' }}>
              Master Editorial Outline
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif mt-1.5" style={{ color: 'var(--c-text)' }}>
              {outline.h1}
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--c-muted)' }}>
              SEO Meta Description: {outline.metaDescription}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyMarkdown}
              className="py-2 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
              style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
            >
              <Copy className="w-3.5 h-3.5" /> Copy Markdown
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              style={{ backgroundColor: 'var(--c-gold)', color: '#11110F' }}
            >
              <Download className="w-3.5 h-3.5" /> Download .MD
            </button>
          </div>
        </div>

        {/* Introduction Overview Box */}
        <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
          <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1" style={{ color: 'var(--c-gold)' }}>
            <BookOpen className="w-3.5 h-3.5" /> Introduction & Hook
          </h4>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--c-text)' }}>
            {outline.introHook}
          </p>
        </div>

        {/* H2 Sections List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
            <ListTree className="w-4 h-4" style={{ color: 'var(--c-gold)' }} />
            Core Content Sections ({outline.sections.length})
          </h3>

          <div className="space-y-3">
            {outline.sections.map((section, sIndex) => {
              const isCollapsed = collapsedSectionIds.has(section.id);
              return (
                <div
                  key={section.id || sIndex}
                  className="rounded-2xl border transition-all overflow-hidden"
                  style={{
                    backgroundColor: 'var(--c-bg)',
                    borderColor: 'var(--c-border)',
                  }}
                >
                  {/* Section Accordion Header */}
                  <div
                    onClick={() => toggleSectionCollapse(section.id)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--c-card)' }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--c-gold)' }} />
                      ) : (
                        <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--c-gold)' }} />
                      )}
                      <h4 className="font-bold text-sm tracking-tight truncate" style={{ color: 'var(--c-text)' }}>
                        {section.h2}
                      </h4>
                    </div>

                    <span
                      className="text-[11px] font-mono px-2 py-0.5 rounded border shrink-0"
                      style={{
                        backgroundColor: 'var(--c-bg)',
                        borderColor: 'var(--c-border)',
                        color: 'var(--c-muted)',
                      }}
                    >
                      ~{section.targetWords} words
                    </span>
                  </div>

                  {/* Section Content & H3s */}
                  {!isCollapsed && (
                    <div className="p-4 sm:p-5 space-y-4">
                      {section.subsections.map((sub, subIdx) => (
                        <div key={subIdx} className="pl-3 border-l-2 space-y-1.5" style={{ borderColor: 'var(--c-border-hover)' }}>
                          <h5 className="font-semibold text-xs" style={{ color: 'var(--c-text)' }}>
                            {sub.h3}
                          </h5>
                          <ul className="space-y-1 text-xs list-disc list-inside" style={{ color: 'var(--c-muted)' }}>
                            {sub.points.map((pt, ptIdx) => (
                              <li key={ptIdx} className="leading-relaxed">
                                {pt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Takeaways & FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Key Takeaways */}
          <div className="p-5 rounded-2xl border space-y-2.5" style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--c-gold)' }}>
              <Sparkles className="w-3.5 h-3.5" /> Key Takeaways Box
            </h4>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--c-muted)' }}>
              {outline.keyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Frequently Asked Questions */}
          <div className="p-5 rounded-2xl border space-y-2.5" style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--c-gold)' }}>
              <HelpCircle className="w-3.5 h-3.5" /> Schema FAQ Section ({outline.faqs.length})
            </h4>
            <div className="space-y-2.5 text-xs">
              {outline.faqs.map((faq, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="font-semibold" style={{ color: 'var(--c-text)' }}>
                    Q: {faq.question}
                  </p>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--c-muted)' }}>
                    {faq.answerHint}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conclusion & CTA */}
        <div className="p-4 rounded-2xl border text-xs" style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
          <span className="font-bold block mb-1" style={{ color: 'var(--c-gold)' }}>
            Conclusion & Call-to-Action:
          </span>
          <p style={{ color: 'var(--c-text)' }}>{outline.conclusionCta}</p>
        </div>
      </div>

      {/* Post Completion Recommendations */}
      <PostCompletionRecommendations currentToolId="ai-blog-outline" onReset={() => setTopic('')} />
    </div>
  );
};
