import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, HelpCircle } from 'lucide-react';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';
import { showToast } from '../components/common/Toast';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Feature Request');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast({ type: 'error', title: 'Missing Information', message: 'Please fill in all required fields.' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast({
        type: 'success',
        title: 'Message Sent',
        message: 'Thank you! We will review your message shortly.',
      });
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-10">
      <SeoHead
        title="Contact & Feedback"
        description="Contact the ToolBoxX team for tool suggestions, bug reports, and partnership inquiries."
        canonicalPath="/contact"
      />

      <Breadcrumbs items={[{ label: 'Contact' }]} />

      <div className="text-center space-y-4 my-8">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif text-[var(--c-text)]">
          Get in Touch
        </h1>
        <p className="text-base text-[var(--c-muted)] max-w-xl mx-auto leading-relaxed font-normal">
          Have an idea for a new browser tool or want to report an issue? We’d love to hear from you!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact info / FAQ shortcuts */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-7 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-4 shadow-xl">
            <h3 className="text-lg font-bold font-serif text-[var(--c-text)] flex items-center gap-2.5">
              <Mail className="w-5 h-5 text-[var(--c-gold)]" />
              Direct Support
            </h3>
            <p className="text-xs sm:text-sm text-[var(--c-muted)] leading-relaxed font-normal">
              We respond to tool inquiries, feature requests, and bug reports within 24–48 hours.
            </p>
            <div className="pt-2">
              <span className="text-xs font-mono text-[var(--c-subtle)] uppercase tracking-wider block mb-1">
                Official Email
              </span>
              <a
                href="mailto:support@toolboxx.dev"
                className="text-sm font-semibold text-[var(--c-gold)] hover:text-[var(--c-accent)] transition-colors"
              >
                support@toolboxx.dev
              </a>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-3">
            <h4 className="font-bold font-serif text-base text-[var(--c-text)] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[var(--c-gold)]" />
              Frequently Asked
            </h4>
            <p className="text-xs text-[var(--c-muted)] leading-relaxed font-normal">
              Before reaching out, check individual tool pages for common questions regarding file limits, supported formats, and privacy.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-2xl">
            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-serif text-[var(--c-text)]">
                  Message Received!
                </h3>
                <p className="text-sm text-[var(--c-muted)] max-w-sm mx-auto">
                  Thank you for helping us make ToolBoxX even better. We'll be in touch soon.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setMessage('');
                  }}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-text)] hover:bg-[var(--c-surface)] cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--c-text)] block mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] placeholder:text-[var(--c-subtle)] focus:ring-1 focus:ring-[var(--c-gold)] focus:border-[var(--c-gold)] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--c-text)] block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] placeholder:text-[var(--c-subtle)] focus:ring-1 focus:ring-[var(--c-gold)] focus:border-[var(--c-gold)] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--c-text)] block mb-1.5">
                    Topic
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] focus:ring-1 focus:ring-[var(--c-gold)] focus:border-[var(--c-gold)] outline-none"
                  >
                    <option value="Feature Request">Request a New Tool</option>
                    <option value="Bug Report">Report a Bug / Issue</option>
                    <option value="General Feedback">General Feedback</option>
                    <option value="Partnership">Partnership / Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--c-text)] block mb-1.5">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you need or what happened..."
                    className="w-full p-4 text-sm rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] placeholder:text-[var(--c-subtle)] focus:ring-1 focus:ring-[var(--c-gold)] focus:border-[var(--c-gold)] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[var(--c-accent)] hover:bg-[var(--c-gold)] disabled:opacity-50 text-[var(--c-bg)] font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
