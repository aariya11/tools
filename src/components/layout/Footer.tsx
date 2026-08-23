import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, Palette, Globe } from 'lucide-react';
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
      <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 transition-colors">
        {/* Privacy Guarantee Banner */}
        <div className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Privacy First Architecture
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Your files stay on your device whenever possible. Zero server uploads. Zero logs.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLangOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{currentLanguage.flag} {currentLanguage.nativeName}</span>
              </button>

              <button
                onClick={() => setIsThemeOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 transition-colors"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Theme: {currentPresetConfig.name.split(' ')[0]}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            {/* Col 1: Brand */}
            <div className="col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-md">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                  ToolBox<span className="text-zinc-500 dark:text-zinc-400">X</span>
                </span>
              </Link>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
                Fast, free, and privacy-focused online utility platform. Transform images, edit PDFs, analyze text, and generate QR codes directly in your browser.
              </p>
              <div className="text-xs text-zinc-400 dark:text-zinc-500">
                Free • Fast • 100% Client-Side
              </div>
            </div>

            {/* Col 2: Image Tools */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
                Image Tools
              </h5>
              <ul className="space-y-2 text-sm">
                {imageTools.map((t) => (
                  <li key={t.id}>
                    <Link
                      to={t.path}
                      className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: PDF Tools */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
                PDF Tools
              </h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/pdf-tools"
                    className="font-medium text-zinc-900 dark:text-zinc-200 hover:underline transition-colors"
                  >
                    PDF Hub (30 Tools)
                  </Link>
                </li>
                {pdfTools.filter(t => t.id !== 'pdf-tools').slice(0, 7).map((t) => (
                  <li key={t.id}>
                    <Link
                      to={t.path}
                      className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Text & Platform */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
                Text & Platform
              </h5>
              <ul className="space-y-2 text-sm">
                {textTools.map((t) => (
                  <li key={t.id}>
                    <Link
                      to={t.path}
                      className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      {t.name}
                    </Link>
                  </li>
                ))}
                {generatorTools.map((t) => (
                  <li key={t.id}>
                    <Link
                      to={t.path}
                      className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      {t.name}
                    </Link>
                  </li>
                ))}
                <li className="pt-2">
                  <Link
                    to="/about"
                    className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  >
                    About ToolBoxX
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  >
                    Contact & Feedback
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <p>© {new Date().getFullYear()} ToolBoxX. All rights reserved. Free browser utility platform.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:underline">Privacy</Link>
              <Link to="/terms" className="hover:underline">Terms</Link>
              <Link to="/contact" className="hover:underline">Support</Link>
              <Link to="/all-tools" className="hover:underline">Sitemap</Link>
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
