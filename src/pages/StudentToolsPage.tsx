import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Zap,
  Award,
  Layers,
  Wrench,
  Search,
} from 'lucide-react';
import { getToolById, TOOLS_DATA } from '../data/toolsData';
import { ToolCard } from '../components/common/ToolCard';
import { SeoHead } from '../components/common/SeoHead';
import { SocialShareButtons } from '../components/common/SocialShareButtons';

const STUDENT_TOOL_IDS = [
  'pdf-compress',
  'text-to-handwriting',
  'ocr-pdf',
  'ai-summarizer',
  'word-counter',
  'pdf-merge',
  'pdf-to-word',
  'ai-grammar-checker',
  'case-converter',
  'markdown-editor',
  'ai-rewriter',
  'pdf-split',
];

const STUDENT_WORKFLOWS = [
  {
    title: 'Portal Submissions (Canvas, Blackboard, Moodle)',
    problem: 'Uploads rejected because your assignment or lab PDF exceeds 5MB.',
    solution: 'Compress document by up to 80% without losing text sharpness or formula clarity.',
    toolId: 'pdf-compress',
  },
  {
    title: 'Handwritten Assignment Requirements',
    problem: 'Professors requiring homework submitted in handwritten format.',
    solution: 'Type your answers and convert to realistic human handwriting on ruled notebook paper.',
    toolId: 'text-to-handwriting',
  },
  {
    title: 'Lecture Slide & Whiteboard Notes',
    problem: 'Typing out long quotes or diagrams from whiteboard photos and lecture decks.',
    solution: 'Extract clean selectable text in seconds with on-device OCR.',
    toolId: 'ocr-pdf',
  },
  {
    title: 'Thesis & Project Portfolio Assembly',
    problem: 'Fragmented chapters, cover sheets, lab data, and bibliographies.',
    solution: 'Merge multiple PDFs in exact sequential order and stamp uniform page numbers.',
    toolId: 'pdf-merge',
  },
];

const STUDENT_FAQS = [
  {
    question: 'Are all these student tools really 100% free with no hidden charges?',
    answer: 'Yes! ToolBoxX is completely free forever. There are no subscriptions, no credit card requirements, and no daily usage limits. You don?t even need a .edu email address.',
  },
  {
    question: 'Will my thesis, essay, or lab report be uploaded to any remote server?',
    answer: 'No. All processing occurs 100% locally inside your web browser using HTML5, WebAssembly, and PDF-Lib memory buffers. Your academic research and private assignments never leave your device.',
  },
  {
    question: 'Can I use ToolBoxX on school Chromebooks and iPad tablets?',
    answer: 'Yes. Since all tools are lightweight and browser-native, they run smoothly on Chromebooks, MacBooks, Windows laptops, iPads, and Android smartphones without installing any software.',
  },
];
export const StudentToolsPage: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const studentTools = useMemo(() => {
    return STUDENT_TOOL_IDS.map((id) => getToolById(id)).filter(
      (t): t is NonNullable<typeof t> => Boolean(t)
    );
  }, []);

  const filteredTools = useMemo(() => {
    if (!searchFilter.trim()) return studentTools;
    const q = searchFilter.toLowerCase();
    return studentTools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [studentTools, searchFilter]);

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-28 transition-colors">
      <SeoHead
        title="Free Online Tools for Students & Researchers ? PDF, OCR, Essay, Handwriting"
        description="Curated suite of 100% free student utilities: PDF compress for Canvas uploads, Text to Handwriting converter, Optical Character Recognition (OCR), AI summarizer, and essay word counter."
        canonicalPath="/student-tools"
        faqs={STUDENT_FAQS}
      />

      {/* Hero Section */}
      <section className="pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-[var(--c-border)] bg-[var(--c-surface)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-mono text-[var(--c-gold)] uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student & Academic Toolkit</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--c-text)] leading-tight">
                Ace Your Assignments with <br className="hidden sm:inline" />
                <span className="text-[var(--c-gold)]">100% Free, Private</span> Student Tools.
              </h1>

              <p className="text-base sm:text-lg text-[var(--c-muted)] leading-relaxed font-normal">
                Bypass upload portal file size limits, turn typed essays into handwriting, extract whiteboard notes with OCR, and summarize heavy research papers?all inside your browser.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--c-subtle)] pt-2">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  No .edu Email Required
                </span>
                <span>?</span>
                <span>Zero File Limits</span>
                <span>?</span>
                <span>100% Client-Side Privacy</span>
              </div>
            </div>

            {/* Quick Student Banner */}
            <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-4 min-w-[280px]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[var(--c-gold)]">
                <Award className="w-4 h-4" />
                <span>Student Survival Stack</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-extrabold text-[var(--c-text)]">12 Curated Tools</div>
                <p className="text-xs text-[var(--c-muted)]">Built specifically for high school & university coursework</p>
              </div>
              <Link
                to="/blog/7-secret-productivity-tools-every-student-needs"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--c-gold)] hover:underline"
              >
                <span>Read 7 Secret Student Productivity Hacks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-16">
        {/* Curated Tool Grid */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--c-text)]">
                Essential Student & Academic Tools
              </h2>
              <p className="text-xs sm:text-sm text-[var(--c-muted)] mt-1">
                Click any tool to launch directly in your browser with zero logins.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-[var(--c-subtle)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter student tools..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs sm:text-sm text-[var(--c-text)] placeholder-[var(--c-subtle)] focus:outline-none focus:border-[var(--c-gold)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        {/* Student Workflow Solutions */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[var(--c-gold)]" />
            <h2 className="text-2xl font-extrabold text-[var(--c-text)]">
              Common Student Workflows & Instant Fixes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STUDENT_WORKFLOWS.map((wf, idx) => {
              const tool = getToolById(wf.toolId);
              return (
                <div
                  key={idx}
                  className="p-6 sm:p-7 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] hover:bg-[var(--c-card)] hover:border-[var(--c-gold)]/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <h3 className="text-base font-bold text-[var(--c-text)]">{wf.title}</h3>
                    <div className="text-xs text-rose-400/90 font-medium">
                      Problem: <span className="text-[var(--c-muted)]">{wf.problem}</span>
                    </div>
                    <div className="text-xs text-emerald-400 font-medium">
                      Solution: <span className="text-[var(--c-text)]">{wf.solution}</span>
                    </div>
                  </div>

                  {tool && (
                    <div className="pt-3 border-t border-[var(--c-border)]/60 flex items-center justify-between text-xs font-semibold text-[var(--c-gold)]">
                      <span>Launch {tool.name}</span>
                      <Link to={tool.path} className="flex items-center gap-1 hover:underline">
                        <span>Open Tool</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-[var(--c-text)]">
            Student FAQs
          </h2>
          <div className="space-y-3">
            {STUDENT_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-[var(--c-text)] cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[var(--c-gold)] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[var(--c-muted)] leading-relaxed border-t border-[var(--c-border)]/60 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Global Share Banner */}
        <SocialShareButtons
          variant="banner"
          title="Free Online Tools for Students & Researchers ? ToolBoxX"
          description="Compress PDFs for Canvas, convert text to handwriting, and run free browser OCR."
        />
      </div>
    </div>
  );
};
