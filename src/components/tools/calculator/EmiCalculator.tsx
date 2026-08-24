import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  DollarSign,
  Percent,
  Calendar,
  Download,
  Copy,
  Check,
  PieChart as PieIcon,
  Table as TableIcon,
  TrendingDown,
  Sparkles,
  Layers,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { StatCard } from '../../common/StatCard';
import { SocialShareButtons } from '../../common/SocialShareButtons';
import { showToast } from '../../common/Toast';
import { PostCompletionRecommendations } from '../../common/RelatedTools';

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
  { code: 'JPY', symbol: '¥' },
  { code: 'CAD', symbol: 'CA$' },
  { code: 'AUD', symbol: 'A$' },
];

export const EmiCalculator: React.FC = () => {
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [loanAmount, setLoanAmount] = useState<number>(250000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [tenureYears, setTenureYears] = useState<number>(15);
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years');
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(0);
  const [scheduleView, setScheduleView] = useState<'yearly' | 'monthly'>('yearly');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // EMI & Schedule Calculations
  const calculations = useMemo(() => {
    const P = loanAmount;
    const annualR = interestRate;
    const r = annualR / 12 / 100; // monthly rate
    const totalMonths = tenureType === 'years' ? tenureYears * 12 : tenureYears;

    if (P <= 0 || r <= 0 || totalMonths <= 0) {
      return null;
    }

    // Standard EMI formula: [P * r * (1+r)^n] / [(1+r)^n - 1]
    const emi = (P * r * Math.pow(1 + r, totalMonths)) / (Math.pow(1 + r, totalMonths) - 1);
    const totalPayment = emi * totalMonths;
    const totalInterest = totalPayment - P;
    const interestRatio = (totalInterest / totalPayment) * 100;
    const principalRatio = (P / totalPayment) * 100;

    // Monthly & Yearly Amortization Schedule
    const monthlySchedule = [];
    let balance = P;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;

    const effectiveMonthlyPayment = emi + extraMonthlyPayment;
    let actualMonthsTaken = 0;

    for (let m = 1; m <= totalMonths && balance > 0; m++) {
      actualMonthsTaken = m;
      const interestForMonth = balance * r;
      let principalForMonth = effectiveMonthlyPayment - interestForMonth;

      if (principalForMonth > balance) {
        principalForMonth = balance;
      }

      balance = Math.max(0, balance - principalForMonth);
      totalInterestPaid += interestForMonth;
      totalPrincipalPaid += principalForMonth;

      monthlySchedule.push({
        month: m,
        year: Math.ceil(m / 12),
        payment: principalForMonth + interestForMonth,
        principal: principalForMonth,
        interest: interestForMonth,
        totalInterestToDate: totalInterestPaid,
        remainingBalance: balance,
      });

      if (balance <= 0) break;
    }

    // Aggregate into Yearly Schedule
    const yearlySchedule = [];
    let currentYear = 1;
    let yearPrincipal = 0;
    let yearInterest = 0;
    let yearPayment = 0;
    let endBalance = P;

    for (let i = 0; i < monthlySchedule.length; i++) {
      const item = monthlySchedule[i];
      yearPrincipal += item.principal;
      yearInterest += item.interest;
      yearPayment += item.payment;
      endBalance = item.remainingBalance;

      if (item.month % 12 === 0 || i === monthlySchedule.length - 1) {
        yearlySchedule.push({
          year: currentYear,
          payment: yearPayment,
          principal: yearPrincipal,
          interest: yearInterest,
          remainingBalance: endBalance,
        });
        currentYear++;
        yearPrincipal = 0;
        yearInterest = 0;
        yearPayment = 0;
      }
    }

    // Prepayment Savings
    const interestSaved = Math.max(0, totalInterest - totalInterestPaid);
    const monthsSaved = Math.max(0, totalMonths - actualMonthsTaken);

    return {
      emi,
      totalPayment,
      totalInterest,
      interestRatio,
      principalRatio,
      totalMonths,
      actualMonthsTaken,
      interestSaved,
      monthsSaved,
      monthlySchedule,
      yearlySchedule,
    };
  }, [loanAmount, interestRate, tenureYears, tenureType, extraMonthlyPayment]);

  const handleCopySummary = async () => {
    if (!calculations) return;
    const summary = `📊 Loan EMI Breakdown (${currency.code}):\n` +
      `💰 Loan Amount: ${currency.symbol}${loanAmount.toLocaleString()}\n` +
      `📈 Interest Rate: ${interestRate}% p.a.\n` +
      `📅 Tenure: ${tenureYears} ${tenureType}\n` +
      `💳 Monthly EMI: ${currency.symbol}${Math.round(calculations.emi).toLocaleString()}/mo\n` +
      `💸 Total Interest: ${currency.symbol}${Math.round(calculations.totalInterest).toLocaleString()}\n` +
      `💵 Total Payment: ${currency.symbol}${Math.round(calculations.totalPayment).toLocaleString()}\n` +
      `Calculated with ToolBoxX Free Loan EMI Calculator.`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      showToast({ type: 'success', title: 'Copied!', message: 'Loan breakdown copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Could not copy to clipboard.' });
    }
  };

  const exportCsv = () => {
    if (!calculations) return;
    let csv = `Year,Principal Paid (${currency.symbol}),Interest Paid (${currency.symbol}),Total Payment (${currency.symbol}),Remaining Balance (${currency.symbol})\n`;
    calculations.yearlySchedule.forEach((y) => {
      csv += `${y.year},${y.principal.toFixed(2)},${y.interest.toFixed(2)},${y.payment.toFixed(2)},${y.remainingBalance.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Loan_Amortization_Schedule_${currency.code}_${loanAmount}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast({ type: 'success', title: 'CSV Exported', message: 'Amortization schedule downloaded.' });
  };

  const exportPdf = async () => {
    if (!calculations) return;
    setIsExportingPdf(true);
    try {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([595.28, 841.89]); // A4
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Header
      page.drawText('Loan EMI & Amortization Statement', { x: 50, y: 800, size: 18, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText(`Generated via ToolBoxX — ${new Date().toLocaleDateString()}`, { x: 50, y: 782, size: 9, font, color: rgb(0.5, 0.5, 0.5) });

      // Summary Grid
      page.drawRectangle({
        x: 50,
        y: 660,
        width: 495,
        height: 105,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
        color: rgb(0.97, 0.97, 0.97),
      });

      page.drawText('LOAN SUMMARY', { x: 65, y: 745, size: 10, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
      page.drawText(`Principal Loan Amount: ${currency.symbol}${loanAmount.toLocaleString()}`, { x: 65, y: 725, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(`Interest Rate: ${interestRate}% per annum`, { x: 65, y: 705, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(`Loan Tenure: ${tenureYears} ${tenureType}`, { x: 65, y: 685, size: 10, font, color: rgb(0.2, 0.2, 0.2) });

      page.drawText(`Monthly EMI: ${currency.symbol}${Math.round(calculations.emi).toLocaleString()}`, { x: 310, y: 725, size: 10, font: fontBold, color: rgb(0.7, 0.5, 0.1) });
      page.drawText(`Total Interest: ${currency.symbol}${Math.round(calculations.totalInterest).toLocaleString()}`, { x: 310, y: 705, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(`Total Amount: ${currency.symbol}${Math.round(calculations.totalPayment).toLocaleString()}`, { x: 310, y: 685, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

      // Table Header
      page.drawText('Yearly Amortization Schedule', { x: 50, y: 635, size: 12, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

      let currentY = 610;
      page.drawRectangle({ x: 50, y: currentY - 5, width: 495, height: 20, color: rgb(0.9, 0.9, 0.9) });
      page.drawText('Year', { x: 60, y: currentY, size: 9, font: fontBold });
      page.drawText('Principal', { x: 130, y: currentY, size: 9, font: fontBold });
      page.drawText('Interest', { x: 230, y: currentY, size: 9, font: fontBold });
      page.drawText('Total Payment', { x: 330, y: currentY, size: 9, font: fontBold });
      page.drawText('Balance', { x: 440, y: currentY, size: 9, font: fontBold });

      currentY -= 20;

      // Table Rows
      for (const row of calculations.yearlySchedule) {
        if (currentY < 60) {
          page = pdfDoc.addPage([595.28, 841.89]);
          currentY = 780;
        }

        page.drawText(`Year ${row.year}`, { x: 60, y: currentY, size: 8, font });
        page.drawText(`${currency.symbol}${Math.round(row.principal).toLocaleString()}`, { x: 130, y: currentY, size: 8, font });
        page.drawText(`${currency.symbol}${Math.round(row.interest).toLocaleString()}`, { x: 230, y: currentY, size: 8, font });
        page.drawText(`${currency.symbol}${Math.round(row.payment).toLocaleString()}`, { x: 330, y: currentY, size: 8, font });
        page.drawText(`${currency.symbol}${Math.round(row.remainingBalance).toLocaleString()}`, { x: 440, y: currentY, size: 8, font });

        currentY -= 18;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Loan_Amortization_${currency.code}_${loanAmount}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      showToast({ type: 'success', title: 'PDF Exported', message: 'Loan amortization statement downloaded.' });
    } catch (err) {
      showToast({ type: 'error', title: 'Export Failed', message: 'Could not generate PDF.' });
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Input Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--c-border)] pb-5">
          <div>
            <h2 className="text-xl font-bold text-[var(--c-text)] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[var(--c-gold)]" />
              <span>Loan & EMI Calculator</span>
            </h2>
            <p className="text-xs text-[var(--c-muted)] mt-1">
              Calculate monthly installment, total interest, and amortization schedule with PDF & CSV export.
            </p>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--c-muted)]">Currency:</span>
            <select
              value={currency.code}
              onChange={(e) => {
                const found = CURRENCIES.find((c) => c.code === e.target.value);
                if (found) setCurrency(found);
              }}
              className="px-3 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3 Core Inputs */}
        <div className="space-y-6">
          {/* Loan Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--c-text)]">Loan Amount</label>
              <div className="flex items-center gap-1 font-bold text-sm text-[var(--c-gold)]">
                <span>{currency.symbol}</span>
                <input
                  type="number"
                  min="1000"
                  max="10000000"
                  step="5000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-32 px-2 py-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-right text-xs font-bold text-[var(--c-text)] outline-none focus:border-[var(--c-gold)]"
                />
              </div>
            </div>
            <input
              type="range"
              min="10000"
              max="2000000"
              step="10000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg bg-[var(--c-card)] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--c-muted)]">
              <span>{currency.symbol}10,000</span>
              <span>{currency.symbol}1,000,000</span>
              <span>{currency.symbol}2,000,000+</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--c-text)]">Annual Interest Rate (%)</label>
              <div className="flex items-center gap-1 font-bold text-sm text-[var(--c-gold)]">
                <input
                  type="number"
                  min="0.1"
                  max="30"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  className="w-20 px-2 py-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-right text-xs font-bold text-[var(--c-text)] outline-none focus:border-[var(--c-gold)]"
                />
                <span>%</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg bg-[var(--c-card)] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--c-muted)]">
              <span>1%</span>
              <span>10%</span>
              <span>20%</span>
            </div>
          </div>

          {/* Loan Tenure */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-[var(--c-text)]">Loan Tenure</label>
                <div className="flex rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] p-0.5 text-[10px]">
                  <button
                    onClick={() => setTenureType('years')}
                    className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                      tenureType === 'years' ? 'bg-[var(--c-gold)] text-black' : 'text-[var(--c-muted)]'
                    }`}
                  >
                    Years
                  </button>
                  <button
                    onClick={() => setTenureType('months')}
                    className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                      tenureType === 'months' ? 'bg-[var(--c-gold)] text-black' : 'text-[var(--c-muted)]'
                    }`}
                  >
                    Months
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1 font-bold text-sm text-[var(--c-gold)]">
                <input
                  type="number"
                  min="1"
                  max={tenureType === 'years' ? 40 : 480}
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-20 px-2 py-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-right text-xs font-bold text-[var(--c-text)] outline-none focus:border-[var(--c-gold)]"
                />
                <span className="text-xs text-[var(--c-muted)]">{tenureType}</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max={tenureType === 'years' ? 30 : 360}
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg bg-[var(--c-card)] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--c-muted)]">
              <span>{tenureType === 'years' ? '1 Year' : '12 Mo'}</span>
              <span>{tenureType === 'years' ? '15 Years' : '180 Mo'}</span>
              <span>{tenureType === 'years' ? '30 Years' : '360 Mo'}</span>
            </div>
          </div>

          {/* Optional Prepayment */}
          <div className="p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--c-text)] flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                <span>Extra Monthly Prepayment (Optional)</span>
              </label>
              <div className="flex items-center gap-1 font-bold text-xs text-emerald-400">
                <span>{currency.symbol}</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={extraMonthlyPayment}
                  onChange={(e) => setExtraMonthlyPayment(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                  className="w-24 px-2 py-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-right text-xs font-bold text-[var(--c-text)] outline-none focus:border-emerald-400"
                />
              </div>
            </div>
            {extraMonthlyPayment > 0 && calculations && calculations.interestSaved > 0 && (
              <p className="text-[11px] text-emerald-400 font-medium">
                💡 Paying {currency.symbol}{extraMonthlyPayment}/mo extra saves {currency.symbol}{Math.round(calculations.interestSaved).toLocaleString()} in interest and finishes your loan {Math.floor(calculations.monthsSaved / 12)} years {calculations.monthsSaved % 12} months earlier!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* EMI Results Hero Card */}
      {calculations && (
        <>
          <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface)] via-[var(--c-card)] to-[var(--c-surface)] shadow-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[var(--c-gold)] uppercase tracking-wider">
                  Monthly Equated Installment (EMI)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[var(--c-text)] tracking-tight">
                    {currency.symbol}{Math.round(calculations.emi).toLocaleString()}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[var(--c-muted)]">/ month</span>
                </div>
                <p className="text-xs text-[var(--c-muted)]">
                  Total Loan Repayment: <strong className="text-[var(--c-text)]">{currency.symbol}{Math.round(calculations.totalPayment).toLocaleString()}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={exportPdf}
                  disabled={isExportingPdf}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[var(--c-gold)] text-black font-semibold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>{isExportingPdf ? 'Generating...' : 'Download PDF'}</span>
                </button>
                <button
                  onClick={exportCsv}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3 Metric Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Principal Loan Amount"
              value={`${currency.symbol}${loanAmount.toLocaleString()}`}
              subValue={`${calculations.principalRatio.toFixed(1)}% of total payment`}
              icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
            />
            <StatCard
              label="Total Interest Payable"
              value={`${currency.symbol}${Math.round(calculations.totalInterest).toLocaleString()}`}
              subValue={`${calculations.interestRatio.toFixed(1)}% of total payment`}
              icon={<Percent className="w-4 h-4 text-amber-400" />}
            />
            <StatCard
              label="Total Amount (Principal + Int)"
              value={`${currency.symbol}${Math.round(calculations.totalPayment).toLocaleString()}`}
              subValue={`Over ${tenureYears} ${tenureType}`}
              icon={<CreditCard className="w-4 h-4 text-[var(--c-gold)]" />}
            />
          </div>

          {/* Principal vs Interest Donut & Breakdown */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--c-text)] flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[var(--c-gold)]" />
                <span>Principal vs. Interest Breakdown</span>
              </h3>
              <span className="text-xs font-semibold text-[var(--c-muted)]">
                Ratio: {(loanAmount / Math.max(1, calculations.totalInterest)).toFixed(2)} : 1
              </span>
            </div>

            {/* Visual Bar Comparison */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[var(--c-muted)] font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Principal: {currency.symbol}{loanAmount.toLocaleString()} ({calculations.principalRatio.toFixed(1)}%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[var(--c-gold)]" />
                  <span>Interest: {currency.symbol}{Math.round(calculations.totalInterest).toLocaleString()} ({calculations.interestRatio.toFixed(1)}%)</span>
                </span>
              </div>

              <div className="h-5 w-full rounded-full bg-[var(--c-card)] border border-[var(--c-border)] overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${calculations.principalRatio}%` }}
                />
                <div
                  className="h-full bg-[var(--c-gold)] transition-all duration-500"
                  style={{ width: `${calculations.interestRatio}%` }}
                />
              </div>
            </div>
          </div>

          {/* Amortization Schedule Table */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--c-border)] pb-4">
              <div className="flex items-center gap-2">
                <TableIcon className="w-5 h-5 text-[var(--c-gold)]" />
                <h3 className="text-base font-bold text-[var(--c-text)]">Amortization Schedule</h3>
              </div>

              {/* View Toggle */}
              <div className="flex rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] p-1 text-xs">
                <button
                  onClick={() => setScheduleView('yearly')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    scheduleView === 'yearly' ? 'bg-[var(--c-gold)] text-black' : 'text-[var(--c-muted)]'
                  }`}
                >
                  Yearly Schedule
                </button>
                <button
                  onClick={() => setScheduleView('monthly')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    scheduleView === 'monthly' ? 'bg-[var(--c-gold)] text-black' : 'text-[var(--c-muted)]'
                  }`}
                >
                  Monthly Breakdown
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] font-bold text-[var(--c-muted)] uppercase bg-[var(--c-card)] sticky top-0 border-b border-[var(--c-border)]">
                  <tr>
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3">Principal Paid</th>
                    <th className="py-2.5 px-3">Interest Paid</th>
                    <th className="py-2.5 px-3">Total Payment</th>
                    <th className="py-2.5 px-3">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--c-border)]">
                  {scheduleView === 'yearly'
                    ? calculations.yearlySchedule.map((row) => (
                        <tr key={row.year} className="hover:bg-[var(--c-card)] transition-colors">
                          <td className="py-2 px-3 font-bold text-[var(--c-text)]">Year {row.year}</td>
                          <td className="py-2 px-3 text-emerald-400">{currency.symbol}{Math.round(row.principal).toLocaleString()}</td>
                          <td className="py-2 px-3 text-amber-400">{currency.symbol}{Math.round(row.interest).toLocaleString()}</td>
                          <td className="py-2 px-3 font-semibold text-[var(--c-text)]">{currency.symbol}{Math.round(row.payment).toLocaleString()}</td>
                          <td className="py-2 px-3 text-[var(--c-muted)]">{currency.symbol}{Math.round(row.remainingBalance).toLocaleString()}</td>
                        </tr>
                      ))
                    : calculations.monthlySchedule.slice(0, 120).map((row) => (
                        <tr key={row.month} className="hover:bg-[var(--c-card)] transition-colors">
                          <td className="py-2 px-3 font-bold text-[var(--c-text)]">Month {row.month} (Yr {row.year})</td>
                          <td className="py-2 px-3 text-emerald-400">{currency.symbol}{Math.round(row.principal).toLocaleString()}</td>
                          <td className="py-2 px-3 text-amber-400">{currency.symbol}{Math.round(row.interest).toLocaleString()}</td>
                          <td className="py-2 px-3 font-semibold text-[var(--c-text)]">{currency.symbol}{Math.round(row.payment).toLocaleString()}</td>
                          <td className="py-2 px-3 text-[var(--c-muted)]">{currency.symbol}{Math.round(row.remainingBalance).toLocaleString()}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
              {scheduleView === 'monthly' && calculations.monthlySchedule.length > 120 && (
                <p className="text-[11px] text-[var(--c-muted)] text-center py-3">
                  Showing first 120 months. Export full CSV for complete schedule.
                </p>
              )}
            </div>
          </div>

          {/* Shareable Loan Card */}
          <div className="p-6 sm:p-8 rounded-3xl border-2 border-[var(--c-gold)]/40 bg-[var(--c-surface)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[var(--c-gold)] uppercase tracking-wider">Shareable Loan Estimate</span>
                <h3 className="text-lg font-bold text-[var(--c-text)]">
                  {currency.symbol}{loanAmount.toLocaleString()} Loan at {interestRate}% for {tenureYears} {tenureType}
                </h3>
              </div>
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-text)] hover:border-[var(--c-gold)] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Loan Quote'}</span>
              </button>
            </div>

            <SocialShareButtons
              variant="banner"
              resultSummary={`Loan Quote: ${currency.symbol}${loanAmount.toLocaleString()} at ${interestRate}% = ${currency.symbol}${Math.round(calculations.emi).toLocaleString()}/mo. Calculate loan EMI:`}
              title="Free Loan & Mortgage EMI Calculator | ToolBoxX"
            />
          </div>
        </>
      )}

      {/* Recommendations */}
      <PostCompletionRecommendations currentToolId="emi-calculator" />
    </div>
  );
};

export default EmiCalculator;
