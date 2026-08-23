import React from 'react';
import { ShieldCheck, Zap, Heart, ServerOff, Code } from 'lucide-react';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-12">
      <SeoHead
        title="About ToolBoxX — Private, Fast Online Utilities"
        description="Learn about the ToolBoxX mission: empowering developers, creators, and individuals with fast, 100% private, browser-based tools."
        canonicalPath="/about"
      />

      <Breadcrumbs items={[{ label: 'About' }]} />

      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
          About ToolBox<span className="text-indigo-600 dark:text-indigo-400">X</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          We built ToolBoxX with a straightforward philosophy: everyday file and text utilities should be fast, completely free, and strictly private.
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-8 leading-relaxed">
        <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ServerOff className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            The Client-Side Revolution
          </h2>
          <p>
            Traditional utility websites require you to upload your sensitive files — tax forms, confidential contracts, personal photos, and proprietary documents — to remote servers. This introduces security vulnerabilities, privacy concerns, and annoying upload delays.
          </p>
          <p>
            ToolBoxX takes a radically different approach. By harnessing modern web technologies like <strong>WebAssembly</strong>, <strong>HTML5 Canvas</strong>, and <strong>OffscreenCanvas APIs</strong>, our tools execute calculations entirely inside your browser sandbox on your device.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Zero Cloud Storage</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              We never save, inspect, or log your files or text. When you close your browser tab, everything disappears from temporary memory.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <Zap className="w-6 h-6 text-indigo-500" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Blazing Fast Execution</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Without the overhead of network transfers and remote server queues, image compression, PDF operations, and text statistics happen in milliseconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <Heart className="w-6 h-6 text-rose-500" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Paywalls or Sign-Ups</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              All tools are available without annoying sign-up prompts, hidden paywalls, or restrictive daily file quotas.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <Code className="w-6 h-6 text-purple-500" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Modern Open Standards</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Built using industry-standard libraries including PDF-Lib, PDF.js, and TypeScript for robust reliability and precision.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
