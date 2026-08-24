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

      <div className="text-center space-y-4 my-8">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif text-[#F5F1E8]">
          About ToolBox<span className="text-[#B79B70]">X</span>
        </h1>
        <p className="text-base sm:text-lg text-[#B8B2A7] max-w-2xl mx-auto leading-relaxed font-normal">
          We built ToolBoxX with a straightforward philosophy: everyday file and text utilities should be fast, completely free, and strictly private.
        </p>
      </div>

      <div className="space-y-8 leading-relaxed text-[#B8B2A7]">
        <section className="bg-[#161513] p-8 sm:p-10 rounded-3xl border border-[#2A2824] shadow-xl space-y-4">
          <h2 className="text-2xl font-bold font-serif text-[#F5F1E8] flex items-center gap-3">
            <ServerOff className="w-6 h-6 text-[#B79B70]" />
            The Client-Side Philosophy
          </h2>
          <p className="font-normal text-sm sm:text-base">
            Traditional utility websites require you to upload sensitive files — tax documents, contracts, personal photos, and confidential reports — to remote servers. This introduces security vulnerabilities, privacy compromises, and annoying bandwidth delays.
          </p>
          <p className="font-normal text-sm sm:text-base">
            ToolBoxX takes a radically different approach. By harnessing modern web technologies like <strong className="text-[#F5F1E8]">WebAssembly</strong>, <strong className="text-[#F5F1E8]">HTML5 Canvas</strong>, and client-side processing engines, our tools execute calculations entirely inside your browser sandbox on your device.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-7 rounded-2xl bg-[#161513] border border-[#2A2824] space-y-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h3 className="font-bold text-base text-[#F5F1E8]">Zero Cloud Storage</h3>
            <p className="text-xs sm:text-sm text-[#B8B2A7] font-normal">
              We never save, inspect, or log your files or text. When you close your browser tab, everything disappears from temporary memory.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-[#161513] border border-[#2A2824] space-y-2.5">
            <Zap className="w-6 h-6 text-[#B79B70]" />
            <h3 className="font-bold text-base text-[#F5F1E8]">Instant Browser Execution</h3>
            <p className="text-xs sm:text-sm text-[#B8B2A7] font-normal">
              Without network transfer bottlenecks and remote server queues, image compression, PDF operations, and text statistics happen in milliseconds.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-[#161513] border border-[#2A2824] space-y-2.5">
            <Heart className="w-6 h-6 text-[#B79B70]" />
            <h3 className="font-bold text-base text-[#F5F1E8]">No Paywalls or Sign-Ups</h3>
            <p className="text-xs sm:text-sm text-[#B8B2A7] font-normal">
              All tools are available without intrusive sign-up prompts, hidden paywalls, or restrictive daily file quotas.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-[#161513] border border-[#2A2824] space-y-2.5">
            <Code className="w-6 h-6 text-[#B79B70]" />
            <h3 className="font-bold text-base text-[#F5F1E8]">Open Web Standards</h3>
            <p className="text-xs sm:text-sm text-[#B8B2A7] font-normal">
              Built using industry-standard libraries including PDF-Lib, PDF.js, and TypeScript for robust reliability and precision.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
