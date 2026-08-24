import React, { useState } from 'react';
import {
  Code,
  Copy,
  Download,
  ExternalLink,
  Trash2,
  BookOpen,
  HelpCircle,
  ShoppingBag,
  Building2,
  MapPin,
  ListOrdered,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

type SchemaType = 'Article' | 'FAQPage' | 'Product' | 'Organization' | 'LocalBusiness' | 'HowTo';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface HowToStep {
  id: string;
  name: string;
  text: string;
  url?: string;
  image?: string;
}

export const SchemaGenerator: React.FC = () => {
  const [schemaType, setSchemaType] = useState<SchemaType>('Article');

  // Article State
  const [articleHeadline, setArticleHeadline] = useState<string>('How to Optimize Web Performance with React 19');
  const [articleDescription, setArticleDescription] = useState<string>(
    'Discover the top performance techniques in React 19 including compiler optimizations, server components, and asset preloading.'
  );
  const [articleImage, setArticleImage] = useState<string>('https://example.com/images/react19.jpg');
  const [articleAuthor, setArticleAuthor] = useState<string>('Alex Morgan');
  const [articlePublisher, setArticlePublisher] = useState<string>('TechFlow Blog');
  const [articleUrl, setArticleUrl] = useState<string>('https://example.com/blog/react-19-optimization');

  // FAQPage State
  const [faqs, setFaqs] = useState<FaqItem[]>([
    {
      id: '1',
      question: 'What is structured JSON-LD data?',
      answer: 'JSON-LD is a JavaScript notation for embedding Linked Data into HTML to help search engines understand content and qualify for rich search results.',
    },
    {
      id: '2',
      question: 'How do I add schema markup to my website?',
      answer: 'Insert the generated <script type="application/ld+json"> tag into the <head> or <body> section of your HTML page.',
    },
  ]);

  // Product State
  const [productName, setProductName] = useState<string>('Ergonomic Wireless Mechanical Keyboard');
  const [productDesc, setProductDesc] = useState<string>(
    'Premium hot-swappable mechanical keyboard with Bluetooth 5.2 and custom RGB backlight.'
  );
  const [productSku, setProductSku] = useState<string>('KB-PRO-99');
  const [productBrand, setProductBrand] = useState<string>('KeyCraft');
  const [productPrice, setProductPrice] = useState<string>('129.99');
  const [productCurrency, setProductCurrency] = useState<string>('USD');
  const [productAvailability, setProductAvailability] = useState<string>('https://schema.org/InStock');

  // Organization State
  const [orgName, setOrgName] = useState<string>('ToolBoxX Technologies Inc.');
  const [orgUrl, setOrgUrl] = useState<string>('https://toolboxx.dev');
  const [orgLogo, setOrgLogo] = useState<string>('https://toolboxx.dev/logo.png');
  const [orgSameAs, setOrgSameAs] = useState<string>('https://twitter.com/toolboxx\nhttps://github.com/toolboxx');

  // LocalBusiness State
  const [bizName, setBizName] = useState<string>('Downtown Artisan Coffee');
  const [bizType, setBizType] = useState<string>('CoffeeShop');
  const [bizStreet, setBizStreet] = useState<string>('123 Market Street');
  const [bizCity, setBizCity] = useState<string>('San Francisco');
  const [bizPostal, setBizPostal] = useState<string>('94105');
  const [bizPhone, setBizPhone] = useState<string>('+1-415-555-0199');

  // HowTo State
  const [howToName, setHowToName] = useState<string>('How to Create a QR Code Online');
  const [howToTime, setHowToTime] = useState<string>('PT2M');
  const [howToSteps, setHowToSteps] = useState<HowToStep[]>([
    { id: '1', name: 'Open Generator', text: 'Navigate to the ToolBoxX QR Code Generator.' },
    { id: '2', name: 'Enter Destination URL', text: 'Paste your target link or Wi-Fi network details into the input.' },
    { id: '3', name: 'Download Code', text: 'Click Download PNG or SVG to save the scannable code.' },
  ]);

  // Dynamic Handlers
  const addFaq = () => {
    setFaqs((prev) => [...prev, { id: Math.random().toString(36).slice(2, 9), question: '', answer: '' }]);
  };

  const updateFaq = (id: string, field: 'question' | 'answer', val: string) => {
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: val } : f)));
  };

  const removeFaq = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  const addHowToStep = () => {
    setHowToSteps((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2, 9), name: `Step ${prev.length + 1}`, text: '' },
    ]);
  };

  const updateHowToStep = (id: string, field: 'name' | 'text', val: string) => {
    setHowToSteps((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
  };

  const removeHowToStep = (id: string) => {
    setHowToSteps((prev) => prev.filter((s) => s.id !== id));
  };

  // Generate JSON-LD schema
  const generateSchemaObject = (): object => {
    switch (schemaType) {
      case 'Article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: articleHeadline,
          description: articleDescription,
          image: articleImage ? [articleImage] : undefined,
          author: {
            '@type': 'Person',
            name: articleAuthor,
          },
          publisher: {
            '@type': 'Organization',
            name: articlePublisher,
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': articleUrl,
          },
        };

      case 'FAQPage':
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs
            .filter((f) => f.question.trim())
            .map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
              },
            })),
        };

      case 'Product':
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: productName,
          description: productDesc,
          sku: productSku || undefined,
          brand: productBrand
            ? {
                '@type': 'Brand',
                name: productBrand,
              }
            : undefined,
          offers: {
            '@type': 'Offer',
            price: productPrice,
            priceCurrency: productCurrency,
            availability: productAvailability,
          },
        };

      case 'Organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: orgName,
          url: orgUrl,
          logo: orgLogo || undefined,
          sameAs: orgSameAs
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        };

      case 'LocalBusiness':
        return {
          '@context': 'https://schema.org',
          '@type': bizType,
          name: bizName,
          telephone: bizPhone || undefined,
          address: {
            '@type': 'PostalAddress',
            streetAddress: bizStreet,
            addressLocality: bizCity,
            postalCode: bizPostal,
          },
        };

      case 'HowTo':
        return {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: howToName,
          totalTime: howToTime || undefined,
          step: howToSteps
            .filter((s) => s.name.trim() || s.text.trim())
            .map((s, idx) => ({
              '@type': 'HowToStep',
              position: idx + 1,
              name: s.name,
              text: s.text,
            })),
        };

      default:
        return {};
    }
  };

  const schemaJson = JSON.stringify(generateSchemaObject(), null, 2);
  const fullHtmlSnippet = `<script type="application/ld+json">\n${schemaJson}\n</script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullHtmlSnippet);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      showToast({ type: 'success', title: 'JSON-LD Copied', message: 'Script tag copied to clipboard.' });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to copy to clipboard.' });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([fullHtmlSnippet], { type: 'text/html;charset=utf-8' });
    downloadBlob(blob, `schema_${schemaType.toLowerCase()}.html`);
    showToast({ type: 'success', title: 'Downloaded', message: 'Saved schema markup file.' });
  };

  const SCHEMA_TABS: { id: SchemaType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'Article', label: 'Article / Blog', icon: BookOpen },
    { id: 'FAQPage', label: 'FAQ Page', icon: HelpCircle },
    { id: 'Product', label: 'Product & Offers', icon: ShoppingBag },
    { id: 'Organization', label: 'Organization', icon: Building2 },
    { id: 'LocalBusiness', label: 'Local Business', icon: MapPin },
    { id: 'HowTo', label: 'How-To Guide', icon: ListOrdered },
  ];

  return (
    <div className="space-y-8">
      {/* Schema Type Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-[var(--c-surface)] p-2 rounded-2xl border border-[var(--c-border)]">
        {SCHEMA_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = schemaType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSchemaType(tab.id)}
              className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--c-card)] border border-[var(--c-gold)] text-[var(--c-text)] shadow-md'
                  : 'text-[var(--c-muted)] hover:bg-[var(--c-card)] hover:text-[var(--c-text)] border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--c-gold)]' : ''}`} />
              <span className="font-bold text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Form on Left, Live JSON-LD on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Specific Schema Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <Code className="w-4 h-4 text-[var(--c-gold)]" />
              {schemaType} Properties
            </h4>

            {/* ARTICLE */}
            {schemaType === 'Article' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Headline</label>
                  <input
                    type="text"
                    value={articleHeadline}
                    onChange={(e) => setArticleHeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={articleDescription}
                    onChange={(e) => setArticleDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Author Name</label>
                    <input
                      type="text"
                      value={articleAuthor}
                      onChange={(e) => setArticleAuthor(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Publisher</label>
                    <input
                      type="text"
                      value={articlePublisher}
                      onChange={(e) => setArticlePublisher(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Featured Image URL</label>
                  <input
                    type="url"
                    value={articleImage}
                    onChange={(e) => setArticleImage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Page URL</label>
                  <input
                    type="url"
                    value={articleUrl}
                    onChange={(e) => setArticleUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                  />
                </div>
              </div>
            )}

            {/* FAQ */}
            {schemaType === 'FAQPage' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-[var(--c-muted)]">Questions & Answers</span>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="text-xs font-bold text-[var(--c-gold)] hover:underline cursor-pointer"
                  >
                    + Add Question
                  </button>
                </div>
                <div className="space-y-3">
                  {faqs.map((f, idx) => (
                    <div key={f.id} className="p-3.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[var(--c-gold)]">Q{idx + 1}:</span>
                        {faqs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFaq(f.id)}
                            className="p-1 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Enter Question..."
                        value={f.question}
                        onChange={(e) => updateFaq(f.id, 'question', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]"
                      />
                      <textarea
                        rows={2}
                        placeholder="Enter Answer..."
                        value={f.answer}
                        onChange={(e) => updateFaq(f.id, 'answer', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PRODUCT */}
            {schemaType === 'Product' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Product Name</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={productDesc}
                    onChange={(e) => setProductDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">SKU / Identifier</label>
                    <input
                      type="text"
                      value={productSku}
                      onChange={(e) => setProductSku(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={productBrand}
                      onChange={(e) => setProductBrand(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Price</label>
                    <input
                      type="text"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Currency</label>
                    <input
                      type="text"
                      value={productCurrency}
                      onChange={(e) => setProductCurrency(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Stock</label>
                    <select
                      value={productAvailability}
                      onChange={(e) => setProductAvailability(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                    >
                      <option value="https://schema.org/InStock">In Stock</option>
                      <option value="https://schema.org/OutOfStock">Out of Stock</option>
                      <option value="https://schema.org/PreOrder">Pre-Order</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ORGANIZATION */}
            {schemaType === 'Organization' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Website URL</label>
                  <input
                    type="url"
                    value={orgUrl}
                    onChange={(e) => setOrgUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={orgLogo}
                    onChange={(e) => setOrgLogo(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">
                    Social Profiles (sameAs - one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={orgSameAs}
                    onChange={(e) => setOrgSameAs(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                  />
                </div>
              </div>
            )}

            {/* LOCAL BUSINESS */}
            {schemaType === 'LocalBusiness' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Business Name</label>
                    <input
                      type="text"
                      value={bizName}
                      onChange={(e) => setBizName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Business Category</label>
                    <select
                      value={bizType}
                      onChange={(e) => setBizType(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                    >
                      <option value="LocalBusiness">General Local Business</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="CoffeeShop">Coffee Shop / Cafe</option>
                      <option value="MedicalBusiness">Medical Clinic / Dental</option>
                      <option value="AutomotiveBusiness">Auto Repair</option>
                      <option value="RealEstateAgent">Real Estate Agency</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={bizStreet}
                    onChange={(e) => setBizStreet(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">City</label>
                    <input
                      type="text"
                      value={bizCity}
                      onChange={(e) => setBizCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={bizPostal}
                      onChange={(e) => setBizPostal(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Phone</label>
                    <input
                      type="tel"
                      value={bizPhone}
                      onChange={(e) => setBizPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* HOW-TO */}
            {schemaType === 'HowTo' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Guide Name</label>
                    <input
                      type="text"
                      value={howToName}
                      onChange={(e) => setHowToName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Total Time (ISO 8601)</label>
                    <input
                      type="text"
                      value={howToTime}
                      onChange={(e) => setHowToTime(e.target.value)}
                      placeholder="e.g. PT2M (2 mins), PT1H (1 hour)"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-[var(--c-border)]">
                  <span className="text-xs font-semibold text-[var(--c-muted)]">Step-by-Step Instructions</span>
                  <button
                    type="button"
                    onClick={addHowToStep}
                    className="text-xs font-bold text-[var(--c-gold)] hover:underline cursor-pointer"
                  >
                    + Add Step
                  </button>
                </div>

                <div className="space-y-3">
                  {howToSteps.map((s, idx) => (
                    <div key={s.id} className="p-3.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[var(--c-gold)]">Step {idx + 1}:</span>
                        {howToSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeHowToStep(s.id)}
                            className="p-1 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Step Name / Heading"
                        value={s.name}
                        onChange={(e) => updateHowToStep(s.id, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]"
                      />
                      <textarea
                        rows={2}
                        placeholder="Step details & description..."
                        value={s.text}
                        onChange={(e) => updateHowToStep(s.id, 'text', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Syntax Highlighted JSON-LD & Validation */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[var(--c-gold)]" />
                <h4 className="font-bold text-sm text-[var(--c-text)]">JSON-LD Output</h4>
              </div>
              <a
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[var(--c-gold)] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Google Rich Results Test</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <pre className="p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] font-mono text-xs text-emerald-400 max-h-96 overflow-y-auto leading-relaxed select-all">
              {fullHtmlSnippet}
            </pre>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="py-3 px-4 rounded-xl bg-[var(--c-text)] hover:opacity-90 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                Copy JSON-LD Script
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="py-3 px-4 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-[var(--c-gold)]" />
                Download .html
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations currentToolId="schema-generator" />
    </div>
  );
};

export default SchemaGenerator;
