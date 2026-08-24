import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Palette, Globe, ArrowUpRight } from 'lucide-react';
import { getToolsByCategory } from '../../data/toolsData';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { ThemeModal } from '../common/ThemeModal';
import { LanguageModal } from '../common/LanguageModal';

export const Footer: React.FC = () => {
  const { currentPresetConfig } = useTheme();
  const { currentLanguage } = useLanguage();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const imageTools = getToolsByCategory('images');
  const pdfTools = getToolsByCategory('pdf');
  const textTools = getToolsByCategory('text');
  const generatorTools = getToolsByCategory('generators');

  return (
    <>
      <footer className="mt-auto border-t border-[#2A2824] bg-[#11110F] text-[#B8B2A7] transition-colors">
        {/* Privacy Architecture Highlight Strip */}
        <div className="border-b border-[#2A2824]/70 bg-[#161513]/60 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#1B1A17] border border-[#2A2824] text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#F5F1E8]">
                  Privacy First Architecture
                </h4>
                <p className="text-xs text-[#B8B2A7]">
                  Your files stay private. Processed 100% locally in your browser with zero cloud storage.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLangOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2A2824] bg-[#1B1A17] text-xs font-semibold text-[#F5F1E8] hover:border-[#3D3A34] transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#B79B70]" />
                <span>{currentLanguage.flag} {currentLanguage.nativeName}</span>
              </button>

              <button
                onClick={() => setIsThemeOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2A2824] bg-[#1B1A17] text-xs font-semibold text-[#F5F1E8] hover:border-[#3D3A34] transition-colors cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5 text-[#B79B70]" />
                <span>Theme: {currentPresetConfig.name.split(' ')[0]}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Multi-Column Directory */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            {/* Col 1: Brand Wordmark & Mission */}
            <div className="col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1B1A17] border border-[#2A2824] text-[#E8DFCF] flex items-center justify-center">
                  <span className="font-serif font-bold text-base text-[#B79B70]">X</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-[#F5F1E8]">
                  ToolBox<span className="text-[#B79B70]">X</span>
                </span>
              </Link>
              <p className="text-sm text-[#B8B2A7] max-w-sm leading-relaxed font-normal">
                Simple online tools for everyday digital tasks. High-performance browser utilities for PDFs, images, text, and productivity.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-[#7A756D]">
                <span>100% Free</span>
                <span>•</span>
                <span>Zero File Uploads</span>
                <span>•</span>
                <span>No Accounts</span>
              </div>
            </div>

            {/* Col 2: PDF Tools */}
            <div>
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F1E8] mb-3.5">
                PDF Tools
              </h5>
              <ul className="space-y-2.5 text-xs text-[#B8B2A7]">
                <li>
                  <Link
                    to="/pdf-tools"
                    className="font-bold text-[#E8DFCF] hover:text-[#F5F1E8] transition-colors flex items-center gap-1"
                  >
                    PDF Hub (30 Tools) <ArrowUpRight className="w-3 h-3 text-[#B79B70]" />
                  </Link>
                </li>
                {pdfTools.filter(t => t.id !== 'pdf-tools').slice(0, 7).map((t) => (
                  <li key={t.id}>
                    <Link
                      to={t.path}
                      className="hover:text-[#F5F1E8] transition-colors"
                    >
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Image Tools */}
            <div>
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F1E8] mb-3.5">
                Image Tools
              </h5>
              <ul className="space-y-2.5 text-xs text-[#B8B2A7]">
                {imageTools.map((t) => (
                  <li key={t.id}>
                    <Link
                      to={t.path}
                      className="hover:text-[#F5F1E8] transition-colors"
                    >
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Text & Utilities */}
            <div>
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F1E8] mb-3.5">
                Text & Utilities
              </h5>
              <ul className="space-y-2.5 text-xs text-[#B8B2A7]">
                {textTools.map((t) => (
                  <li key={t.id}>
                    <Link
                      to={t.path}
                      className="hover:text-[#F5F1E8] transition-colors"
                    >
                      {t.name}
                    </Link>
                  </li>
                ))}
                {generatorTools.map((t) => (
                  <li key={t.id}>
                    <Link
                      to={t.path}
                      className="hover:text-[#F5F1E8] transition-colors"
                    >
                      {t.name}
                    </Link>
                  </li>
                ))}
                <li className="pt-2 border-t border-[#2A2824]/60">
                  <Link to="/about" className="hover:text-[#F5F1E8] transition-colors">
                    About ToolBoxX
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-[#F5F1E8] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-[#F5F1E8] transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-[#F5F1E8] transition-colors">
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-14 pt-8 border-t border-[#2A2824] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A756D]">
            <p>© {new Date().getFullYear()} ToolBoxX. All rights reserved. Built for private, fast productivity.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-[#B8B2A7] transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-[#B8B2A7] transition-colors">Terms</Link>
              <Link to="/contact" className="hover:text-[#B8B2A7] transition-colors">Contact</Link>
              <Link to="/all-tools" className="hover:text-[#B8B2A7] transition-colors">All Tools</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Theme Modal */}
      <ThemeModal isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />

      {/* Language Modal */}
      <LanguageModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />
    </>
  );
};
