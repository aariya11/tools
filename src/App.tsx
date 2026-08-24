import React, { Suspense, useEffect, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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

// Lazy-loaded Editorial, Social & Curated Hub Pages
const BlogPage = lazy(() => import('./pages/BlogPage').then((m) => ({ default: m.BlogPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage })));
const SocialHubPage = lazy(() => import('./pages/SocialHubPage').then((m) => ({ default: m.SocialHubPage })));
const SocialAnalyticsPage = lazy(() => import('./pages/SocialAnalyticsPage').then((m) => ({ default: m.SocialAnalyticsPage })));
const StudentToolsPage = lazy(() => import('./pages/StudentToolsPage').then((m) => ({ default: m.StudentToolsPage })));
const ProductivityToolsPage = lazy(() => import('./pages/ProductivityToolsPage').then((m) => ({ default: m.ProductivityToolsPage })));
const SocialMediaToolsPage = lazy(() => import('./pages/SocialMediaToolsPage').then((m) => ({ default: m.SocialMediaToolsPage })));
const FreePdfToolsPage = lazy(() => import('./pages/FreePdfToolsPage').then((m) => ({ default: m.FreePdfToolsPage })));
const FreeImageToolsPage = lazy(() => import('./pages/FreeImageToolsPage').then((m) => ({ default: m.FreeImageToolsPage })));

// Lazy-loaded Image Tools
const ImageCompressor = lazy(() => import('./components/tools/image/ImageCompressor').then((m) => ({ default: m.ImageCompressor })));
const JpgToPng = lazy(() => import('./components/tools/image/JpgToPng').then((m) => ({ default: m.JpgToPng })));
const PngToWebp = lazy(() => import('./components/tools/image/PngToWebp').then((m) => ({ default: m.PngToWebp })));
const ImageCropper = lazy(() => import('./components/tools/image/ImageCropper').then((m) => ({ default: m.ImageCropper })));
const BackgroundRemover = lazy(() => import('./components/tools/image/BackgroundRemover').then((m) => ({ default: m.BackgroundRemover })));
const ImageUpscaler = lazy(() => import('./components/tools/image/ImageUpscaler').then((m) => ({ default: m.ImageUpscaler })));
const ImageEnhancer = lazy(() => import('./components/tools/image/ImageEnhancer').then((m) => ({ default: m.ImageEnhancer })));
const ImageConverter = lazy(() => import('./components/tools/image/ImageConverter').then((m) => ({ default: m.ImageConverter })));
const ImageMetadataRemover = lazy(() => import('./components/tools/image/ImageMetadataRemover').then((m) => ({ default: m.ImageMetadataRemover })));
const ImageWatermark = lazy(() => import('./components/tools/image/ImageWatermark').then((m) => ({ default: m.ImageWatermark })));
const ImageBlurPixelate = lazy(() => import('./components/tools/image/ImageBlurPixelate').then((m) => ({ default: m.ImageBlurPixelate })));
const ImageColorPicker = lazy(() => import('./components/tools/image/ImageColorPicker').then((m) => ({ default: m.ImageColorPicker })));
const FaviconGenerator = lazy(() => import('./components/tools/image/FaviconGenerator').then((m) => ({ default: m.FaviconGenerator })));

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

// Lazy-loaded AI Tools
const AiSummarizer = lazy(() => import('./components/tools/ai/AiSummarizer').then((m) => ({ default: m.AiSummarizer })));
const AiRewriter = lazy(() => import('./components/tools/ai/AiRewriter').then((m) => ({ default: m.AiRewriter })));
const AiGrammarChecker = lazy(() => import('./components/tools/ai/AiGrammarChecker').then((m) => ({ default: m.AiGrammarChecker })));
const AiEmailWriter = lazy(() => import('./components/tools/ai/AiEmailWriter').then((m) => ({ default: m.AiEmailWriter })));
const AiTitleGenerator = lazy(() => import('./components/tools/ai/AiTitleGenerator').then((m) => ({ default: m.AiTitleGenerator })));
const AiBlogOutline = lazy(() => import('./components/tools/ai/AiBlogOutline').then((m) => ({ default: m.AiBlogOutline })));
// Lazy-loaded Business & Marketing Tools
const BarcodeGenerator = lazy(() => import('./components/tools/business/BarcodeGenerator').then((m) => ({ default: m.BarcodeGenerator })));
const UtmBuilder = lazy(() => import('./components/tools/business/UtmBuilder').then((m) => ({ default: m.UtmBuilder })));
const MetaTagGenerator = lazy(() => import('./components/tools/business/MetaTagGenerator').then((m) => ({ default: m.MetaTagGenerator })));
const RobotsTxtGenerator = lazy(() => import('./components/tools/business/RobotsTxtGenerator').then((m) => ({ default: m.RobotsTxtGenerator })));
const SchemaGenerator = lazy(() => import('./components/tools/business/SchemaGenerator').then((m) => ({ default: m.SchemaGenerator })));
const EmailSignatureGenerator = lazy(() => import('./components/tools/business/EmailSignatureGenerator').then((m) => ({ default: m.EmailSignatureGenerator })));
const InvoiceGenerator = lazy(() => import('./components/tools/business/InvoiceGenerator').then((m) => ({ default: m.InvoiceGenerator })));
const ResumeBuilder = lazy(() => import('./components/tools/business/ResumeBuilder').then((m) => ({ default: m.ResumeBuilder })));
const CoverLetterGenerator = lazy(() => import('./components/tools/business/CoverLetterGenerator').then((m) => ({ default: m.CoverLetterGenerator })));
const BusinessNameGenerator = lazy(() => import('./components/tools/business/BusinessNameGenerator').then((m) => ({ default: m.BusinessNameGenerator })));
const PasswordGenerator = lazy(() => import('./components/tools/business/PasswordGenerator').then((m) => ({ default: m.PasswordGenerator })));
const UuidGenerator = lazy(() => import('./components/tools/business/UuidGenerator').then((m) => ({ default: m.UuidGenerator })));

// Lazy-loaded Developer Tools
const JsonTools = lazy(() => import('./components/tools/developer/JsonTools').then((m) => ({ default: m.JsonTools })));
const CodeMinifier = lazy(() => import('./components/tools/developer/CodeMinifier').then((m) => ({ default: m.CodeMinifier })));
const Base64Tool = lazy(() => import('./components/tools/developer/Base64Tool').then((m) => ({ default: m.Base64Tool })));
const UrlEncoder = lazy(() => import('./components/tools/developer/UrlEncoder').then((m) => ({ default: m.UrlEncoder })));
const JwtDecoder = lazy(() => import('./components/tools/developer/JwtDecoder').then((m) => ({ default: m.JwtDecoder })));
const HashGenerator = lazy(() => import('./components/tools/developer/HashGenerator').then((m) => ({ default: m.HashGenerator })));
const RegexTester = lazy(() => import('./components/tools/developer/RegexTester').then((m) => ({ default: m.RegexTester })));
const TimestampConverter = lazy(() => import('./components/tools/developer/TimestampConverter').then((m) => ({ default: m.TimestampConverter })));
const ColorConverter = lazy(() => import('./components/tools/developer/ColorConverter').then((m) => ({ default: m.ColorConverter })));

// Lazy-loaded Text Tools (Extended)
const TextCleaner = lazy(() => import('./components/tools/text/TextCleaner').then((m) => ({ default: m.TextCleaner })));
const MarkdownEditor = lazy(() => import('./components/tools/text/MarkdownEditor').then((m) => ({ default: m.MarkdownEditor })));
const CsvConverter = lazy(() => import('./components/tools/text/CsvConverter').then((m) => ({ default: m.CsvConverter })));

// Lazy-loaded File & Archive Tools
const ZipCreator = lazy(() => import('./components/tools/file/ZipCreator').then((m) => ({ default: m.ZipCreator })));
const ZipExtractor = lazy(() => import('./components/tools/file/ZipExtractor').then((m) => ({ default: m.ZipExtractor })));
const BulkRenamer = lazy(() => import('./components/tools/file/BulkRenamer').then((m) => ({ default: m.BulkRenamer })));
const FileSizeConverter = lazy(() => import('./components/tools/file/FileSizeConverter').then((m) => ({ default: m.FileSizeConverter })));

// Lazy-loaded Unit & Calculator Tools
const UnitConverter = lazy(() => import('./components/tools/converter/UnitConverter').then((m) => ({ default: m.UnitConverter })));
const AgeCalculator = lazy(() => import('./components/tools/calculator/AgeCalculator').then((m) => ({ default: m.AgeCalculator })));
const PercentageCalculator = lazy(() => import('./components/tools/calculator/PercentageCalculator').then((m) => ({ default: m.PercentageCalculator })));
const GpaCalculator = lazy(() => import('./components/tools/calculator/GpaCalculator').then((m) => ({ default: m.GpaCalculator })));
const EmiCalculator = lazy(() => import('./components/tools/calculator/EmiCalculator').then((m) => ({ default: m.EmiCalculator })));
const DiscountCalculator = lazy(() => import('./components/tools/calculator/DiscountCalculator').then((m) => ({ default: m.DiscountCalculator })));
const SalaryCalculator = lazy(() => import('./components/tools/calculator/SalaryCalculator').then((m) => ({ default: m.SalaryCalculator })));
const DateCalculator = lazy(() => import('./components/tools/calculator/DateCalculator').then((m) => ({ default: m.DateCalculator })));
const TimeZoneConverter = lazy(() => import('./components/tools/calculator/TimeZoneConverter').then((m) => ({ default: m.TimeZoneConverter })));
const BmiCalculator = lazy(() => import('./components/tools/calculator/BmiCalculator').then((m) => ({ default: m.BmiCalculator })));
const TipLoanCalculator = lazy(() => import('./components/tools/calculator/TipLoanCalculator').then((m) => ({ default: m.TipLoanCalculator })));

// Lazy-loaded Additional Generators & Text Tools
const TextDiffChecker = lazy(() => import('./components/tools/text/TextDiffChecker').then((m) => ({ default: m.TextDiffChecker })));
const LoremIpsumGenerator = lazy(() => import('./components/tools/text/LoremIpsumGenerator').then((m) => ({ default: m.LoremIpsumGenerator })));
const QrCodeScanner = lazy(() => import('./components/tools/generator/QrCodeScanner').then((m) => ({ default: m.QrCodeScanner })));
const RandomNumberGenerator = lazy(() => import('./components/tools/generator/RandomNumberGenerator').then((m) => ({ default: m.RandomNumberGenerator })));
const ColorPaletteGenerator = lazy(() => import('./components/tools/generator/ColorPaletteGenerator').then((m) => ({ default: m.ColorPaletteGenerator })));
const SitemapGenerator = lazy(() => import('./components/tools/generator/SitemapGenerator').then((m) => ({ default: m.SitemapGenerator })));

// Lazy-loaded Social Media & Creator Tools
const SocialContentGenerator = lazy(() => import('./components/tools/social/SocialContentGenerator').then((m) => ({ default: m.SocialContentGenerator })));
const SocialImageGenerator = lazy(() => import('./components/tools/social/SocialImageGenerator').then((m) => ({ default: m.SocialImageGenerator })));
const SocialMediaResizer = lazy(() => import('./components/tools/social/SocialMediaResizer').then((m) => ({ default: m.SocialMediaResizer })));
const ShortVideoScriptGenerator = lazy(() => import('./components/tools/social/ShortVideoScriptGenerator').then((m) => ({ default: m.ShortVideoScriptGenerator })));
const ContentCalendar = lazy(() => import('./components/tools/social/ContentCalendar').then((m) => ({ default: m.ContentCalendar })));
const SocialBioGenerator = lazy(() => import('./components/tools/social/SocialBioGenerator').then((m) => ({ default: m.SocialBioGenerator })));
const LinkInBioBuilder = lazy(() => import('./components/tools/social/LinkInBioBuilder').then((m) => ({ default: m.LinkInBioBuilder })));
const YouTubeTagGenerator = lazy(() => import('./components/tools/social/YouTubeTagGenerator').then((m) => ({ default: m.YouTubeTagGenerator })));

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
                <Route path="/tools" element={<Navigate to="/all-tools" replace />} />
                <Route path="/category/:id" element={<CategoryPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Editorial, Social & Analytics Hubs */}
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/social" element={<SocialHubPage />} />
                <Route path="/social-analytics" element={<SocialAnalyticsPage />} />

                {/* Curated High-Intent Landing Pages */}
                <Route path="/student-tools" element={<StudentToolsPage />} />
                <Route path="/productivity-tools" element={<ProductivityToolsPage />} />
                <Route path="/social-media-tools" element={<SocialMediaToolsPage />} />
                <Route path="/free-pdf-tools" element={<FreePdfToolsPage />} />
                <Route path="/free-image-tools" element={<FreeImageToolsPage />} />

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
                  element={<Navigate to="/image-cropper" replace />}
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
                <Route
                  path="/image-cropper"
                  element={
                    <ToolWrapper toolId="image-cropper">
                      <ImageCropper />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/background-remover"
                  element={
                    <ToolWrapper toolId="background-remover">
                      <BackgroundRemover />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/image-upscaler"
                  element={
                    <ToolWrapper toolId="image-upscaler">
                      <ImageUpscaler />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/image-enhancer"
                  element={
                    <ToolWrapper toolId="image-enhancer">
                      <ImageEnhancer />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/image-converter"
                  element={
                    <ToolWrapper toolId="image-converter">
                      <ImageConverter />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/image-metadata-remover"
                  element={
                    <ToolWrapper toolId="image-metadata-remover">
                      <ImageMetadataRemover />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/image-watermark"
                  element={
                    <ToolWrapper toolId="image-watermark">
                      <ImageWatermark />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/image-blur-pixelate"
                  element={
                    <ToolWrapper toolId="image-blur-pixelate">
                      <ImageBlurPixelate />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/image-color-picker"
                  element={
                    <ToolWrapper toolId="image-color-picker">
                      <ImageColorPicker />
                    </ToolWrapper>
                  }
                />
                <Route
                  path="/favicon-generator"
                  element={
                    <ToolWrapper toolId="favicon-generator">
                      <FaviconGenerator />
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

                {/* AI Tools */}
                <Route path="/ai-summarizer" element={<ToolWrapper toolId="ai-summarizer"><AiSummarizer /></ToolWrapper>} />
                <Route path="/ai-rewriter" element={<ToolWrapper toolId="ai-rewriter"><AiRewriter /></ToolWrapper>} />
                <Route path="/ai-grammar-checker" element={<ToolWrapper toolId="ai-grammar-checker"><AiGrammarChecker /></ToolWrapper>} />
                <Route path="/ai-email-writer" element={<ToolWrapper toolId="ai-email-writer"><AiEmailWriter /></ToolWrapper>} />
                <Route path="/ai-title-generator" element={<ToolWrapper toolId="ai-title-generator"><AiTitleGenerator /></ToolWrapper>} />
                {/* Business & Marketing Tools */}
                <Route path="/barcode-generator" element={<ToolWrapper toolId="barcode-generator"><BarcodeGenerator /></ToolWrapper>} />
                <Route path="/utm-builder" element={<ToolWrapper toolId="utm-builder"><UtmBuilder /></ToolWrapper>} />
                <Route path="/meta-tag-generator" element={<ToolWrapper toolId="meta-tag-generator"><MetaTagGenerator /></ToolWrapper>} />
                <Route path="/robots-txt-generator" element={<ToolWrapper toolId="robots-txt-generator"><RobotsTxtGenerator /></ToolWrapper>} />
                <Route path="/schema-generator" element={<ToolWrapper toolId="schema-generator"><SchemaGenerator /></ToolWrapper>} />
                <Route path="/email-signature-generator" element={<ToolWrapper toolId="email-signature-generator"><EmailSignatureGenerator /></ToolWrapper>} />
                <Route path="/invoice-generator" element={<ToolWrapper toolId="invoice-generator"><InvoiceGenerator /></ToolWrapper>} />
                <Route path="/resume-builder" element={<ToolWrapper toolId="resume-builder"><ResumeBuilder /></ToolWrapper>} />
                <Route path="/cover-letter-generator" element={<ToolWrapper toolId="cover-letter-generator"><CoverLetterGenerator /></ToolWrapper>} />
                <Route path="/business-name-generator" element={<ToolWrapper toolId="business-name-generator"><BusinessNameGenerator /></ToolWrapper>} />
                <Route path="/password-generator" element={<ToolWrapper toolId="password-generator"><PasswordGenerator /></ToolWrapper>} />
                <Route path="/uuid-generator" element={<ToolWrapper toolId="uuid-generator"><UuidGenerator /></ToolWrapper>} />

                {/* Developer Tools */}
                <Route path="/json-formatter" element={<ToolWrapper toolId="json-formatter"><JsonTools /></ToolWrapper>} />
                <Route path="/code-minifier" element={<ToolWrapper toolId="code-minifier"><CodeMinifier /></ToolWrapper>} />
                <Route path="/base64-tool" element={<ToolWrapper toolId="base64-tool"><Base64Tool /></ToolWrapper>} />
                <Route path="/url-encoder" element={<ToolWrapper toolId="url-encoder"><UrlEncoder /></ToolWrapper>} />
                <Route path="/jwt-decoder" element={<ToolWrapper toolId="jwt-decoder"><JwtDecoder /></ToolWrapper>} />
                <Route path="/hash-generator" element={<ToolWrapper toolId="hash-generator"><HashGenerator /></ToolWrapper>} />
                <Route path="/regex-tester" element={<ToolWrapper toolId="regex-tester"><RegexTester /></ToolWrapper>} />
                <Route path="/timestamp-converter" element={<ToolWrapper toolId="timestamp-converter"><TimestampConverter /></ToolWrapper>} />
                <Route path="/color-converter" element={<ToolWrapper toolId="color-converter"><ColorConverter /></ToolWrapper>} />

                {/* Additional Generators & Business Tools */}
                <Route path="/sitemap-generator" element={<ToolWrapper toolId="sitemap-generator"><SitemapGenerator /></ToolWrapper>} />
                <Route path="/qr-code-scanner" element={<ToolWrapper toolId="qr-code-scanner"><QrCodeScanner /></ToolWrapper>} />
                <Route path="/random-number-generator" element={<ToolWrapper toolId="random-number-generator"><RandomNumberGenerator /></ToolWrapper>} />
                <Route path="/color-palette-generator" element={<ToolWrapper toolId="color-palette-generator"><ColorPaletteGenerator /></ToolWrapper>} />

                {/* Text Tools (Extended) */}
                <Route path="/text-cleaner" element={<ToolWrapper toolId="text-cleaner"><TextCleaner /></ToolWrapper>} />
                <Route path="/markdown-editor" element={<ToolWrapper toolId="markdown-editor"><MarkdownEditor /></ToolWrapper>} />
                <Route path="/csv-converter" element={<ToolWrapper toolId="csv-converter"><CsvConverter /></ToolWrapper>} />
                <Route path="/text-diff" element={<ToolWrapper toolId="text-diff"><TextDiffChecker /></ToolWrapper>} />
                <Route path="/text-compare" element={<Navigate to="/text-diff" replace />} />
                <Route path="/lorem-ipsum-generator" element={<ToolWrapper toolId="lorem-ipsum-generator"><LoremIpsumGenerator /></ToolWrapper>} />

                {/* File & Archive Tools */}
                <Route path="/zip-creator" element={<ToolWrapper toolId="zip-creator"><ZipCreator /></ToolWrapper>} />
                <Route path="/zip-extractor" element={<ToolWrapper toolId="zip-extractor"><ZipExtractor /></ToolWrapper>} />
                <Route path="/bulk-renamer" element={<ToolWrapper toolId="bulk-renamer"><BulkRenamer /></ToolWrapper>} />
                <Route path="/file-size-converter" element={<ToolWrapper toolId="file-size-converter"><FileSizeConverter /></ToolWrapper>} />

                {/* Converter & Calculator Tools */}
                <Route path="/unit-converter" element={<ToolWrapper toolId="unit-converter"><UnitConverter /></ToolWrapper>} />
                <Route path="/calculator" element={<Navigate to="/percentage-calculator" replace />} />
                <Route path="/age-calculator" element={<ToolWrapper toolId="age-calculator"><AgeCalculator /></ToolWrapper>} />
                <Route path="/percentage-calculator" element={<ToolWrapper toolId="percentage-calculator"><PercentageCalculator /></ToolWrapper>} />
                <Route path="/gpa-calculator" element={<ToolWrapper toolId="gpa-calculator"><GpaCalculator /></ToolWrapper>} />
                <Route path="/emi-calculator" element={<ToolWrapper toolId="emi-calculator"><EmiCalculator /></ToolWrapper>} />
                <Route path="/discount-calculator" element={<ToolWrapper toolId="discount-calculator"><DiscountCalculator /></ToolWrapper>} />
                <Route path="/salary-calculator" element={<ToolWrapper toolId="salary-calculator"><SalaryCalculator /></ToolWrapper>} />
                <Route path="/date-calculator" element={<ToolWrapper toolId="date-calculator"><DateCalculator /></ToolWrapper>} />
                <Route path="/timezone-converter" element={<ToolWrapper toolId="timezone-converter"><TimeZoneConverter /></ToolWrapper>} />
                <Route path="/bmi-calculator" element={<ToolWrapper toolId="bmi-calculator"><BmiCalculator /></ToolWrapper>} />
                <Route path="/tip-calculator" element={<ToolWrapper toolId="tip-calculator"><TipLoanCalculator /></ToolWrapper>} />

                {/* Social Media & Creator Tools */}
                <Route path="/social-content-generator" element={<ToolWrapper toolId="social-content-generator"><SocialContentGenerator /></ToolWrapper>} />
                <Route path="/social-image-generator" element={<ToolWrapper toolId="social-image-generator"><SocialImageGenerator /></ToolWrapper>} />
                <Route path="/social-media-resizer" element={<ToolWrapper toolId="social-media-resizer"><SocialMediaResizer /></ToolWrapper>} />
                <Route path="/short-video-script-generator" element={<ToolWrapper toolId="short-video-script-generator"><ShortVideoScriptGenerator /></ToolWrapper>} />
                <Route path="/content-calendar" element={<ToolWrapper toolId="content-calendar"><ContentCalendar /></ToolWrapper>} />
                <Route path="/social-bio-generator" element={<ToolWrapper toolId="social-bio-generator"><SocialBioGenerator /></ToolWrapper>} />
                <Route path="/link-in-bio-builder" element={<ToolWrapper toolId="link-in-bio-builder"><LinkInBioBuilder /></ToolWrapper>} />
                <Route path="/youtube-tag-generator" element={<ToolWrapper toolId="youtube-tag-generator"><YouTubeTagGenerator /></ToolWrapper>} />

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
