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

      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
          Get in Touch
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Have an idea for a new browser tool or want to report an issue? We’d love to hear from you!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact info / FAQ shortcuts */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-500" />
              Direct Support
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We respond to tool inquiries, feature requests, and bug reports within 24–48 hours.
            </p>
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Official Email
              </span>
              <a
                href="mailto:support@toolboxx.dev"
                className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                support@toolboxx.dev
              </a>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-500" />
              Frequently Asked
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Before reaching out, check individual tool pages for common questions regarding file limits, supported formats, and privacy.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Message Received!
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Thank you for helping us make ToolBoxX even better. We'll be in touch soon.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setMessage('');
                  }}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Topic
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Feature Request">Request a New Tool</option>
                    <option value="Bug Report">Report a Bug / Issue</option>
                    <option value="General Feedback">General Feedback</option>
                    <option value="Partnership">Partnership / Advertising Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you need or what happened..."
                    className="w-full p-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
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
