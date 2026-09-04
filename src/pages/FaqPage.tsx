import React, { useState } from 'react';
import { HelpCircle, Search, ShieldCheck, FileText, Image as ImageIcon, Zap, Lock } from 'lucide-react';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';
import { Accordion } from '../components/common/Accordion';

interface FaqCategory {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  faqs: { question: string; answer: string }[];
}

export const FaqPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const FAQ_CATEGORIES: FaqCategory[] = [
    {
      id: 'general',
      name: 'General & Pricing',
      icon: HelpCircle,
      faqs: [
        {
          question: 'Is ToolBoxX really 100% free?',
          answer: 'Yes. All tools on ToolBoxX are completely free to use. There are no paid subscriptions, credit card prompts, usage caps, or watermarks applied to your files.',
        },
        {
          question: 'Do I need to create an account or log in?',
          answer: 'No registration or account creation is required. All utilities are immediately accessible directly in your web browser with zero friction.',
        },
        {
          question: 'Can I use ToolBoxX for commercial and business work?',
          answer: 'Yes! ToolBoxX is fully authorized for personal, academic, freelance, and commercial business use.',
        },
      ],
    },
    {
      id: 'privacy',
      name: 'Privacy & Security',
      icon: Lock,
      faqs: [
        {
          question: 'Are my confidential files uploaded to any servers?',
          answer: 'No. Where technically supported (including all PDF manipulations, image conversions, compression, text counting, code formatting, and QR generation), processing executes 100% locally in your browser using modern WebAssembly, JavaScript, and Canvas APIs. Your files are never transmitted to cloud servers.',
        },
        {
          question: 'How long do files stay in browser memory?',
          answer: 'Your files exist only in your browser’s temporary volatile memory (RAM) while you are actively working with them. As soon as you navigate away, download the output, or close your browser tab, the data is automatically discarded.',
        },
        {
          question: 'Is ToolBoxX safe for sensitive legal and financial documents?',
          answer: 'Yes. Because your byte streams never traverse public internet networks to remote cloud servers, ToolBoxX provides superior privacy compared to traditional server-upload converter websites.',
        },
      ],
    },
    {
      id: 'pdf',
      name: 'PDF Tools',
      icon: FileText,
      faqs: [
        {
          question: 'How does client-side PDF compression work?',
          answer: 'ToolBoxX analyzes the internal PDF object stream, cleans up redundant document layers, compresses unoptimized embedded images, and removes unnecessary font duplication without degrading the clarity of vector text.',
        },
        {
          question: 'Can I merge PDFs with different page sizes or orientations?',
          answer: 'Yes. You can combine A4, US Letter, landscape presentation slides, and portrait documents in any custom order.',
        },
        {
          question: 'How can I password-protect or unlock a PDF?',
          answer: 'Use ToolBoxX Protect PDF to set user permissions and password flags, or Unlock PDF to remove protection when you have authorization.',
        },
      ],
    },
    {
      id: 'images',
      name: 'Image Tools',
      icon: ImageIcon,
      faqs: [
        {
          question: 'What image formats can I convert between?',
          answer: 'ToolBoxX supports bidirectional conversion between JPG, PNG, WebP, GIF, BMP, SVG, and ICO favicon formats.',
        },
        {
          question: 'How much file size can image compression save?',
          answer: 'Most JPEG and PNG images can be reduced by 50% to 85% with virtually zero perceptible visual difference on high-DPI displays.',
        },
        {
          question: 'How does the background remover tool work?',
          answer: 'The background remover analyzes edge luminance and color tolerance directly on an HTML5 canvas to cleanly segment foreground objects and produce an anti-aliased 32-bit PNG with an alpha transparency channel.',
        },
      ],
    },
    {
      id: 'compatibility',
      name: 'Mobile & Technical',
      icon: Zap,
      faqs: [
        {
          question: 'What browsers and devices are supported?',
          answer: 'ToolBoxX is optimized for all modern web browsers including Google Chrome, Apple Safari (iOS & macOS), Mozilla Firefox, Microsoft Edge, Opera, and Brave. It runs smoothly on desktop, laptop, iPad, iPhone, and Android smartphones.',
        },
        {
          question: 'What is the maximum file size limit?',
          answer: 'Because processing is browser-native rather than server-bound, file limits depend on your device’s available RAM. Most devices handle files up to 200MB+ effortlessly.',
        },
      ],
    },
  ];

  const allFaqs = FAQ_CATEGORIES.flatMap((c) => c.faqs);

  const filteredFaqs = allFaqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-12">
      <SeoHead
        title="Frequently Asked Questions (FAQ) — ToolBoxX"
        description="Find answers to common questions about free online PDF editing, image compression, privacy, client-side processing, and file formats on ToolBoxX."
        canonicalPath="/faq"
      />

      <Breadcrumbs items={[{ label: 'FAQ' }]} />

      <div className="text-center space-y-4 my-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>Support & Help Center</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif text-[var(--c-text)]">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-[var(--c-muted)] leading-relaxed max-w-2xl mx-auto font-normal">
          Everything you need to know about our browser-based utilities, file security, format conversions, and privacy architecture.
        </p>

        {/* Search input */}
        <div className="pt-4 max-w-lg mx-auto relative">
          <Search className="w-4 h-4 text-[var(--c-gold)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. are files uploaded, compression)..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] text-xs sm:text-sm text-[var(--c-text)] placeholder:text-[var(--c-subtle)] focus:ring-2 focus:ring-[var(--c-gold)]/30 focus:border-[var(--c-gold)] shadow-sm outline-none transition-all"
          />
        </div>
      </div>

      {searchQuery.trim() ? (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[var(--c-text)] font-mono uppercase tracking-wider">
            Search Results ({filteredFaqs.length})
          </h2>
          {filteredFaqs.length > 0 ? (
            <Accordion items={filteredFaqs} />
          ) : (
            <div className="p-8 text-center rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] text-xs text-[var(--c-muted)]">
              No matching questions found for "{searchQuery}". Browse categories below.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {FAQ_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <section key={cat.id} className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-bold font-serif text-[var(--c-text)]">
                    {cat.name}
                  </h2>
                </div>
                <Accordion items={cat.faqs} />
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
