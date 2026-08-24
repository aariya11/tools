import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';
import {
  FileText,
  Download,
  Printer,
  Trash2,
  DollarSign,
  Building,
  User,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  discount: number; // percentage
}

export const InvoiceGenerator: React.FC = () => {
  // Invoice Meta
  const [invoiceNumber, setInvoiceNumber] = useState<string>('INV-2026-042');
  const [invoiceDate, setInvoiceDate] = useState<string>('2026-08-24');
  const [dueDate, setDueDate] = useState<string>('2026-09-24');
  const [poNumber, setPoNumber] = useState<string>('PO-9912');
  const [status, setStatus] = useState<'Pending' | 'Paid' | 'Draft'>('Pending');

  // Currency
  const [currency, setCurrency] = useState<{ code: string; symbol: string }>({ code: 'USD', symbol: '$' });

  // Sender Details
  const [senderCompany, setSenderCompany] = useState<string>('ToolBoxX Digital Studio');
  const [senderName, setSenderName] = useState<string>('Marcus Vance');
  const [senderEmail, setSenderEmail] = useState<string>('billing@toolboxx.dev');
  const [senderPhone, setSenderPhone] = useState<string>('+1 (555) 392-1092');
  const [senderAddress, setSenderAddress] = useState<string>('100 Market St, Suite 400\nSan Francisco, CA 94105');
  const [senderTaxId, setSenderTaxId] = useState<string>('US-EIN 12-3456789');

  // Client Details
  const [clientCompany, setClientCompany] = useState<string>('Acme Global Enterprises');
  const [clientName, setClientName] = useState<string>('Eleanor Rigby');
  const [clientEmail, setClientEmail] = useState<string>('accounts@acmeglobal.com');
  const [clientAddress, setClientAddress] = useState<string>('742 Evergreen Terrace\nSeattle, WA 98101');

  // Line Items
  const [items, setItems] = useState<LineItem[]>([
    {
      id: '1',
      description: 'UI/UX Design System & Mobile Component Architecture',
      quantity: 40,
      rate: 125,
      discount: 0,
    },
    {
      id: '2',
      description: 'React TypeScript Frontend Implementation & API Integrations',
      quantity: 60,
      rate: 130,
      discount: 5,
    },
    {
      id: '3',
      description: 'Performance Optimization, Core Web Vitals & Accessibility Audit',
      quantity: 15,
      rate: 140,
      discount: 0,
    },
  ]);

  // Adjustments & Tax
  const [taxRate, setTaxRate] = useState<number>(8.5); // %
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);

  // Notes & Bank Details
  const [bankDetails, setBankDetails] = useState<string>(
    'Bank: Silicon Valley Bank\nAccount: 9876-5432-1098\nRouting / SWIFT: SVBUS6S'
  );
  const [notes, setNotes] = useState<string>(
    'Payment is due within 30 days of invoice date. Thank you for your business!'
  );

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const invoicePreviewRef = useRef<HTMLDivElement>(null);

  // Calculations
  const calculateItemTotal = (item: LineItem): number => {
    const raw = item.quantity * item.rate;
    const discountAmount = (raw * item.discount) / 100;
    return raw - discountAmount;
  };

  const subtotal = items.reduce((acc, item) => acc + calculateItemTotal(item), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount + shippingFee;
  const balanceDue = grandTotal - amountPaid;

  // Item Handlers
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 9),
        description: '',
        quantity: 1,
        rate: 100,
        discount: 0,
      },
    ]);
  };

  const updateItem = (id: string, updates: Partial<LineItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Load Sample Data
  const loadSample = () => {
    setInvoiceNumber('INV-2026-088');
    setSenderCompany('Apex Cloud Solutions LLC');
    setClientCompany('Nova FinTech Corp');
    setItems([
      { id: '1', description: 'Cloud Infrastructure Setup & Kubernetes Orchestration', quantity: 35, rate: 150, discount: 0 },
      { id: '2', description: 'Microservices Security Architecture & Penetration Testing', quantity: 20, rate: 160, discount: 10 },
      { id: '3', description: 'Monthly DevOps Retainer & SLA Support', quantity: 1, rate: 2500, discount: 0 },
    ]);
    showToast({ type: 'info', title: 'Sample Loaded', message: 'Demo invoice information loaded.' });
  };

  // PDF Export via html2canvas and pdf-lib
  const handleDownloadPdf = async () => {
    const element = invoicePreviewRef.current;
    if (!element) return;

    setIsExporting(true);
    showToast({ type: 'info', title: 'Generating PDF', message: 'Rendering high-resolution invoice document...' });

    try {
      // Capture HTML element onto canvas at 2x scale for crystal crisp print quality
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');

      // Create PDF Document using pdf-lib
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions in points
      const pngImage = await pdfDoc.embedPng(imgData);

      // Fit image onto A4 page with proportional aspect ratio
      const { width, height } = page.getSize();
      const imgAspect = canvas.width / canvas.height;
      const pageAspect = width / height;

      let drawWidth = width;
      let drawHeight = height;

      if (imgAspect > pageAspect) {
        drawHeight = width / imgAspect;
      } else {
        drawWidth = height * imgAspect;
      }

      page.drawImage(pngImage, {
        x: (width - drawWidth) / 2,
        y: height - drawHeight - 10,
        width: drawWidth,
        height: drawHeight,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `invoice_${invoiceNumber.toLowerCase()}.pdf`);

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      showToast({ type: 'success', title: 'Invoice Downloaded', message: `Saved ${invoiceNumber}.pdf` });
    } catch (err) {
      console.error('Invoice PDF error:', err);
      showToast({ type: 'error', title: 'Export Failed', message: 'Could not generate PDF.' });
    } finally {
      setIsExporting(false);
    }
  };

  // Browser Print
  const handlePrint = () => {
    window.print();
  };

  const CURRENCIES = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'CAD', symbol: 'C$' },
    { code: 'AUD', symbol: 'A$' },
    { code: 'INR', symbol: '₹' },
    { code: 'JPY', symbol: '¥' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="bg-[var(--c-surface)] p-4 rounded-2xl border border-[var(--c-border)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[var(--c-text)] flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-[var(--c-gold)]" /> Currency:
          </span>
          <div className="flex gap-1">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrency(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  currency.code === c.code
                    ? 'bg-[var(--c-text)] text-[var(--c-bg)] shadow-xs'
                    : 'bg-[var(--c-card)] text-[var(--c-muted)] border border-[var(--c-border)]'
                }`}
              >
                {c.symbol} {c.code}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSample}
            className="px-3 py-1.5 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Sample Data
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[var(--c-muted)]" /> Print
          </button>
        </div>
      </div>

      {/* Main Grid: Form Inputs on Left, Real-Time Invoice Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Invoice Form Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Metadata & Status */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--c-gold)]" />
              Invoice Header & Status
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Invoice #</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Issue Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sender & Client Information */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-5">
            {/* Sender */}
            <div className="space-y-3">
              <h5 className="font-bold text-xs text-[var(--c-text)] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Your Business (From)
              </h5>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your Company Name"
                  value={senderCompany}
                  onChange={(e) => setSenderCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Street address, City, Country..."
                value={senderAddress}
                onChange={(e) => setSenderAddress(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
              />
            </div>

            {/* Client */}
            <div className="space-y-3 pt-3 border-t border-[var(--c-border)]">
              <h5 className="font-bold text-xs text-[var(--c-text)] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[var(--c-gold)]" /> Client Details (Bill To)
              </h5>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Client Company Name"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
                <input
                  type="email"
                  placeholder="Client Email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Client billing address..."
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
              />
            </div>
          </div>

          {/* Line Items Builder */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
                Line Items
              </h4>
              <button
                type="button"
                onClick={addItem}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-gold)] border border-[var(--c-border)] cursor-pointer"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder="Item description or service..."
                      value={item.description}
                      onChange={(e) => updateItem(item.id, { description: e.target.value })}
                      className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]"
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-[var(--c-muted)] block mb-0.5">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                        className="w-full px-2 py-1 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--c-muted)] block mb-0.5">Rate ({currency.symbol})</label>
                      <input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, { rate: Number(e.target.value) })}
                        className="w-full px-2 py-1 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--c-muted)] block mb-0.5">Discount %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount}
                        onChange={(e) => updateItem(item.id, { discount: Number(e.target.value) })}
                        className="w-full px-2 py-1 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--c-muted)] block mb-0.5">Total</label>
                      <div className="px-2 py-1 text-xs font-bold text-[var(--c-gold)] text-right">
                        {currency.symbol}{calculateItemTotal(item).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tax & Adjustments */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--c-border)]">
              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Tax / VAT Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Shipping / Handling Fee</label>
                <input
                  type="number"
                  min="0"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Printable / Exportable Invoice Sheet */}
        <div className="lg:col-span-6 space-y-6">
          {/* Action Download Bar */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="w-full py-3.5 px-6 rounded-2xl bg-[var(--c-text)] hover:opacity-90 disabled:opacity-50 text-[var(--c-bg)] font-bold text-xs shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating PDF...' : '1-Click Download High-Res Invoice (PDF)'}
          </button>

          {/* Printable Sheet Preview Container (Rendered to PDF) */}
          <div
            ref={invoicePreviewRef}
            className="p-8 rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200 text-xs leading-relaxed space-y-6 min-h-[700px] flex flex-col justify-between"
          >
            {/* Header */}
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {senderCompany || 'Your Business Name'}
                  </h2>
                  <p className="text-[11px] text-slate-500 whitespace-pre-line mt-1">
                    {senderAddress || '100 Business Street, City, Country'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{senderEmail}</p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black tracking-widest text-slate-300 uppercase block mb-1">
                    INVOICE
                  </span>
                  <div className="font-mono text-sm font-bold text-slate-900">{invoiceNumber}</div>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bill To & Invoice Meta Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Billed To:
                  </span>
                  <div className="font-bold text-sm text-slate-900">{clientCompany || 'Client Name'}</div>
                  <div className="text-[11px] text-slate-600 whitespace-pre-line mt-0.5">
                    {clientAddress || 'Client Street Address'}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{clientEmail}</div>
                </div>

                <div className="space-y-1 text-right">
                  <div>
                    <span className="text-slate-500 text-[11px]">Issue Date: </span>
                    <strong className="text-slate-900">{invoiceDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Due Date: </span>
                    <strong className="text-rose-600">{dueDate}</strong>
                  </div>
                  {poNumber && (
                    <div>
                      <span className="text-slate-500 text-[11px]">PO Number: </span>
                      <strong className="text-slate-900 font-mono">{poNumber}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-[11px] font-bold text-slate-900">
                      <th className="py-2.5">Item Description</th>
                      <th className="py-2.5 text-center w-16">Qty</th>
                      <th className="py-2.5 text-right w-24">Unit Rate</th>
                      <th className="py-2.5 text-right w-20">Disc.</th>
                      <th className="py-2.5 text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <tr key={item.id} className="text-[11px]">
                        <td className="py-2.5 font-medium text-slate-900">{item.description || 'Service item'}</td>
                        <td className="py-2.5 text-center text-slate-600">{item.quantity}</td>
                        <td className="py-2.5 text-right text-slate-600">
                          {currency.symbol}{item.rate.toFixed(2)}
                        </td>
                        <td className="py-2.5 text-right text-slate-500">
                          {item.discount > 0 ? `${item.discount}%` : '—'}
                        </td>
                        <td className="py-2.5 text-right font-bold text-slate-900">
                          {currency.symbol}{calculateItemTotal(item).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <div className="w-64 space-y-1.5 text-right text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{currency.symbol}{subtotal.toFixed(2)}</span>
                  </div>

                  {taxRate > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Tax / VAT ({taxRate}%):</span>
                      <span>{currency.symbol}{taxAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {shippingFee > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping / Fee:</span>
                      <span>{currency.symbol}{shippingFee.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t-2 border-slate-900">
                    <span>Total Due:</span>
                    <span>{currency.symbol}{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Notes & Bank Details */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-[10px] text-slate-500">
              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Payment Instructions:</span>
                <p className="whitespace-pre-line leading-relaxed">{bankDetails}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-700 block mb-0.5">Notes:</span>
                <p className="leading-relaxed">{notes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations currentToolId="invoice-generator" />
    </div>
  );
};

export default InvoiceGenerator;
