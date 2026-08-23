import React, { Suspense, useEffect, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ToolLayout } from './components/layout/ToolLayout';
import { ToastContainer } from './components/common/Toast';
import { getToolById } from './data/toolsData';

// Lazy-loaded Pages
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const AllToolsPage = lazy(() => import('./pages/AllToolsPage').then((m) => ({ default: m.AllToolsPage })));
const CategoryPage = lazy(() => import('./pages/CategoryPage').then((m) => ({ default: m.CategoryPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Lazy-loaded Image Tools
const ImageCompressor = lazy(() => import('./components/tools/image/ImageCompressor').then((m) => ({ default: m.ImageCompressor })));
const ImageResizer = lazy(() => import('./components/tools/image/ImageResizer').then((m) => ({ default: m.ImageResizer })));
const JpgToPng = lazy(() => import('./components/tools/image/JpgToPng').then((m) => ({ default: m.JpgToPng })));
const PngToWebp = lazy(() => import('./components/tools/image/PngToWebp').then((m) => ({ default: m.PngToWebp })));

// Lazy-loaded PDF Tools
const PdfToolsHub = lazy(() => import('./components/tools/pdf/PdfToolsHub').then((m) => ({ default: m.PdfToolsHub })));
const PdfMerge = lazy(() => import('./components/tools/pdf/PdfMerge').then((m) => ({ default: m.PdfMerge })));
const PdfSplit = lazy(() => import('./components/tools/pdf/PdfSplit').then((m) => ({ default: m.PdfSplit })));
const PdfCompress = lazy(() => import('./components/tools/pdf/PdfCompress').then((m) => ({ default: m.PdfCompress })));
const PdfToJpg = lazy(() => import('./components/tools/pdf/PdfToJpg').then((m) => ({ default: m.PdfToJpg })));
const JpgToPdf = lazy(() => import('./components/tools/pdf/JpgToPdf').then((m) => ({ default: m.JpgToPdf })));
const PdfExtract = lazy(() => import('./components/tools/pdf/PdfExtract').then((m) => ({ default: m.PdfExtract })));
const RotatePdf = lazy(() => import('./components/tools/pdf/RotatePdf').then((m) => ({ default: m.RotatePdf })));
const AddPageNumbers = lazy(() => import('./components/tools/pdf/AddPageNumbers').then((m) => ({ default: m.AddPageNumbers })));
const AddWatermark = lazy(() => import('./components/tools/pdf/AddWatermark').then((m) => ({ default: m.AddWatermark })));
const RemovePages = lazy(() => import('./components/tools/pdf/RemovePages').then((m) => ({ default: m.RemovePages })));
const OrganizePdf = lazy(() => import('./components/tools/pdf/OrganizePdf').then((m) => ({ default: m.OrganizePdf })));
const RepairPdf = lazy(() => import('./components/tools/pdf/RepairPdf').then((m) => ({ default: m.RepairPdf })));
const UnlockPdf = lazy(() => import('./components/tools/pdf/UnlockPdf').then((m) => ({ default: m.UnlockPdf })));
const ProtectPdf = lazy(() => import('./components/tools/pdf/ProtectPdf').then((m) => ({ default: m.ProtectPdf })));
const PdfToPdfa = lazy(() => import('./components/tools/pdf/PdfToPdfa').then((m) => ({ default: m.PdfToPdfa })));
const CropPdf = lazy(() => import('./components/tools/pdf/CropPdf').then((m) => ({ default: m.CropPdf })));
const EditPdf = lazy(() => import('./components/tools/pdf/EditPdf').then((m) => ({ default: m.EditPdf })));
const SignPdf = lazy(() => import('./components/tools/pdf/SignPdf').then((m) => ({ default: m.SignPdf })));
const RedactPdf = lazy(() => import('./components/tools/pdf/RedactPdf').then((m) => ({ default: m.RedactPdf })));
const HtmlToPdf = lazy(() => import('./components/tools/pdf/HtmlToPdf').then((m) => ({ default: m.HtmlToPdf })));
const ScanToPdf = lazy(() => import('./components/tools/pdf/ScanToPdf').then((m) => ({ default: m.ScanToPdf })));
const ComparePdf = lazy(() => import('./components/tools/pdf/ComparePdf').then((m) => ({ default: m.ComparePdf })));
const PdfForms = lazy(() => import('./components/tools/pdf/PdfForms').then((m) => ({ default: m.PdfForms })));
const WordToPdf = lazy(() => import('./components/tools/pdf/WordToPdf').then((m) => ({ default: m.WordToPdf })));
const ExcelToPdf = lazy(() => import('./components/tools/pdf/ExcelToPdf').then((m) => ({ default: m.ExcelToPdf })));
const PowerpointToPdf = lazy(() => import('./components/tools/pdf/PowerpointToPdf').then((m) => ({ default: m.PowerpointToPdf })));
const PdfToWord = lazy(() => import('./components/tools/pdf/PdfToWord').then((m) => ({ default: m.PdfToWord })));
const PdfToExcel = lazy(() => import('./components/tools/pdf/PdfToExcel').then((m) => ({ default: m.PdfToExcel })));
const PdfToPowerpoint = lazy(() => import('./components/tools/pdf/PdfToPowerpoint').then((m) => ({ default: m.PdfToPowerpoint })));
const OcrPdf = lazy(() => import('./components/tools/pdf/OcrPdf').then((m) => ({ default: m.OcrPdf })));

// Lazy-loaded Text Tools
const WordCounter = lazy(() => import('./components/tools/text/WordCounter').then((m) => ({ default: m.WordCounter })));
const CharacterCounter = lazy(() => import('./components/tools/text/CharacterCounter').then((m) => ({ default: m.CharacterCounter })));
const CaseConverter = lazy(() => import('./components/tools/text/CaseConverter').then((m) => ({ default: m.CaseConverter })));
const TextToHandwriting = lazy(() => import('./components/tools/text/TextToHandwriting').then((m) => ({ default: m.TextToHandwriting })));

// Lazy-loaded Generators
const QrCodeGenerator = lazy(() => import('./components/tools/generator/QrCodeGenerator').then((m) => ({ default: m.QrCodeGenerator })));

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Tool wrapper helper
function ToolWrapper({ toolId, children }: { toolId: string; children: React.ReactNode }) {
  const tool = getToolById(toolId);
  if (!tool) return <NotFoundPage />;
  return <ToolLayout tool={tool}>{children}</ToolLayout>;
}

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 flex flex-col">
              <Suspense
                fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                }
              >
              <Routes>
                {/* Platform Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/all-tools" element={<AllToolsPage />} />
                <Route path="/category/:id" element={<CategoryPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Image Tools */}
                <Route
                  path="/image-compressor"
                  element={
                    <ToolWrapper toolId="image-compressor">
                      <ImageCompressor />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/image-resizer"
                  element={
                    <ToolWrapper toolId="image-resizer">
                      <ImageResizer />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/jpg-to-png"
                  element={
                    <ToolWrapper toolId="jpg-to-png">
                      <JpgToPng />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/png-to-webp"
                  element={
                    <ToolWrapper toolId="png-to-webp">
                      <PngToWebp />
                    </ToolWrapper>
                  }
                />

                {/* PDF Tools */}
                <Route
                  path="/pdf-tools"
                  element={
                    <ToolWrapper toolId="pdf-tools">
                      <PdfToolsHub />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/pdf-merge"
                  element={
                    <ToolWrapper toolId="pdf-merge">
                      <PdfMerge />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/pdf-split"
                  element={
                    <ToolWrapper toolId="pdf-split">
                      <PdfSplit />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/pdf-compress"
                  element={
                    <ToolWrapper toolId="pdf-compress">
                      <PdfCompress />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/pdf-to-jpg"
                  element={
                    <ToolWrapper toolId="pdf-to-jpg">
                      <PdfToJpg />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/jpg-to-pdf"
                  element={
                    <ToolWrapper toolId="jpg-to-pdf">
                      <JpgToPdf />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/pdf-extract"
                  element={
                    <ToolWrapper toolId="pdf-extract">
                      <PdfExtract />
                    </ToolWrapper>
                  }
                />
                <Route path="/rotate-pdf" element={<ToolWrapper toolId="rotate-pdf"><RotatePdf /></ToolWrapper>} />
                <Route path="/add-page-numbers" element={<ToolWrapper toolId="add-page-numbers"><AddPageNumbers /></ToolWrapper>} />
                <Route path="/add-watermark" element={<ToolWrapper toolId="add-watermark"><AddWatermark /></ToolWrapper>} />
                <Route path="/remove-pages" element={<ToolWrapper toolId="remove-pages"><RemovePages /></ToolWrapper>} />
                <Route path="/organize-pdf" element={<ToolWrapper toolId="organize-pdf"><OrganizePdf /></ToolWrapper>} />
                <Route path="/repair-pdf" element={<ToolWrapper toolId="repair-pdf"><RepairPdf /></ToolWrapper>} />
                <Route path="/unlock-pdf" element={<ToolWrapper toolId="unlock-pdf"><UnlockPdf /></ToolWrapper>} />
                <Route path="/protect-pdf" element={<ToolWrapper toolId="protect-pdf"><ProtectPdf /></ToolWrapper>} />
                <Route path="/pdf-to-pdfa" element={<ToolWrapper toolId="pdf-to-pdfa"><PdfToPdfa /></ToolWrapper>} />
                <Route path="/crop-pdf" element={<ToolWrapper toolId="crop-pdf"><CropPdf /></ToolWrapper>} />
                <Route path="/edit-pdf" element={<ToolWrapper toolId="edit-pdf"><EditPdf /></ToolWrapper>} />
                <Route path="/sign-pdf" element={<ToolWrapper toolId="sign-pdf"><SignPdf /></ToolWrapper>} />
                <Route path="/redact-pdf" element={<ToolWrapper toolId="redact-pdf"><RedactPdf /></ToolWrapper>} />
                <Route path="/html-to-pdf" element={<ToolWrapper toolId="html-to-pdf"><HtmlToPdf /></ToolWrapper>} />
                <Route path="/scan-to-pdf" element={<ToolWrapper toolId="scan-to-pdf"><ScanToPdf /></ToolWrapper>} />
                <Route path="/compare-pdf" element={<ToolWrapper toolId="compare-pdf"><ComparePdf /></ToolWrapper>} />
                <Route path="/pdf-forms" element={<ToolWrapper toolId="pdf-forms"><PdfForms /></ToolWrapper>} />
                <Route path="/word-to-pdf" element={<ToolWrapper toolId="word-to-pdf"><WordToPdf /></ToolWrapper>} />
                <Route path="/excel-to-pdf" element={<ToolWrapper toolId="excel-to-pdf"><ExcelToPdf /></ToolWrapper>} />
                <Route path="/powerpoint-to-pdf" element={<ToolWrapper toolId="powerpoint-to-pdf"><PowerpointToPdf /></ToolWrapper>} />
                <Route path="/pdf-to-word" element={<ToolWrapper toolId="pdf-to-word"><PdfToWord /></ToolWrapper>} />
                <Route path="/pdf-to-excel" element={<ToolWrapper toolId="pdf-to-excel"><PdfToExcel /></ToolWrapper>} />
                <Route path="/pdf-to-powerpoint" element={<ToolWrapper toolId="pdf-to-powerpoint"><PdfToPowerpoint /></ToolWrapper>} />
                <Route path="/ocr-pdf" element={<ToolWrapper toolId="ocr-pdf"><OcrPdf /></ToolWrapper>} />

                {/* Text Tools */}
                <Route
                  path="/word-counter"
                  element={
                    <ToolWrapper toolId="word-counter">
                      <WordCounter />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/character-counter"
                  element={
                    <ToolWrapper toolId="character-counter">
                      <CharacterCounter />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/case-converter"
                  element={
                    <ToolWrapper toolId="case-converter">
                      <CaseConverter />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/text-to-handwriting"
                  element={
                    <ToolWrapper toolId="text-to-handwriting">
                      <TextToHandwriting />
                    </ToolWrapper>
                  }
                />

                {/* Generator Tools */}
                <Route
                  path="/qr-code-generator"
                  element={
                    <ToolWrapper toolId="qr-code-generator">
                      <QrCodeGenerator />
                    </ToolWrapper>
                  }
                />

                {/* Fallback 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  </ThemeProvider>
  );
}

export default App;
