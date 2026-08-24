import React, { useState, useMemo } from 'react';
import {
  Activity,
  Heart,
  Scale,
  Sparkles,
  Copy,
  Check,
  Flame,
  Utensils,
  Target,
  Info,
  TrendingDown,
  TrendingUp,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StatCard } from '../../common/StatCard';
import { SocialShareButtons } from '../../common/SocialShareButtons';
import { showToast } from '../../common/Toast';
import { PostCompletionRecommendations } from '../../common/RelatedTools';

type UnitSystem = 'metric' | 'imperial';
type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'extra';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { name: string; factor: number; desc: string }> = {
  sedentary: { name: 'Sedentary', factor: 1.2, desc: 'Little or no exercise, desk job' },
  light: { name: 'Light Active', factor: 1.375, desc: 'Light exercise 1–3 days/week' },
  moderate: { name: 'Moderately Active', factor: 1.55, desc: 'Moderate exercise 3–5 days/week' },
  active: { name: 'Very Active', factor: 1.725, desc: 'Hard exercise 6–7 days/week' },
  extra: { name: 'Extra Active', factor: 1.9, desc: 'Physical job or training 2x/day' },
};

export const BmiCalculator: React.FC = () => {
  const [unit, setUnit] = useState<UnitSystem>('metric');
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<number>(28);

  // Metric inputs
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(70);

  // Imperial inputs
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(9);
  const [weightLbs, setWeightLbs] = useState<number>(154);

  // Activity
  const [activity, setActivity] = useState<ActivityLevel>('moderate');

  const [copied, setCopied] = useState<boolean>(false);

  // Synchronized Calculations
  const calculations = useMemo(() => {
    let hMeters = 0;
    let wKg = 0;

    if (unit === 'metric') {
      hMeters = heightCm / 100;
      wKg = weightKg;
    } else {
      const totalInches = heightFeet * 12 + heightInches;
      hMeters = totalInches * 0.0254;
      wKg = weightLbs * 0.45359237;
    }

    if (hMeters <= 0 || wKg <= 0) return null;

    // BMI Formula: kg / m^2
    const bmi = wKg / (hMeters * hMeters);

    // WHO Classification
    let classification = 'Normal weight';
    let colorClass = 'text-emerald-400';
    let bgClass = 'bg-emerald-500/10 border-emerald-500/30';
    let isHealthy = false;

    if (bmi < 16.0) {
      classification = 'Severe Thinness';
      colorClass = 'text-rose-400';
      bgClass = 'bg-rose-500/10 border-rose-500/30';
    } else if (bmi < 17.0) {
      classification = 'Moderate Thinness';
      colorClass = 'text-amber-400';
      bgClass = 'bg-amber-500/10 border-amber-500/30';
    } else if (bmi < 18.5) {
      classification = 'Mild Thinness';
      colorClass = 'text-amber-300';
      bgClass = 'bg-amber-500/10 border-amber-500/30';
    } else if (bmi < 25.0) {
      classification = 'Normal / Healthy Weight';
      colorClass = 'text-emerald-400';
      bgClass = 'bg-emerald-500/10 border-emerald-500/30';
      isHealthy = true;
    } else if (bmi < 30.0) {
      classification = 'Overweight (Pre-obese)';
      colorClass = 'text-amber-400';
      bgClass = 'bg-amber-500/10 border-amber-500/30';
    } else if (bmi < 35.0) {
      classification = 'Obese Class I';
      colorClass = 'text-orange-400';
      bgClass = 'bg-orange-500/10 border-orange-500/30';
    } else if (bmi < 40.0) {
      classification = 'Obese Class II';
      colorClass = 'text-rose-400';
      bgClass = 'bg-rose-500/10 border-rose-500/30';
    } else {
      classification = 'Obese Class III (Severe)';
      colorClass = 'text-rose-500';
      bgClass = 'bg-rose-500/20 border-rose-500/40';
    }

    // Healthy Weight Range for this height (BMI 18.5 to 24.9)
    const minHealthyKg = 18.5 * (hMeters * hMeters);
    const maxHealthyKg = 24.9 * (hMeters * hMeters);
    const minHealthyLbs = minHealthyKg * 2.20462;
    const maxHealthyLbs = maxHealthyKg * 2.20462;

    // Weight delta to reach healthy range
    let weightDeltaKg = 0;
    let weightDeltaLbs = 0;
    let targetAction: 'maintain' | 'lose' | 'gain' = 'maintain';

    if (wKg > maxHealthyKg) {
      weightDeltaKg = wKg - maxHealthyKg;
      weightDeltaLbs = weightDeltaKg * 2.20462;
      targetAction = 'lose';
    } else if (wKg < minHealthyKg) {
      weightDeltaKg = minHealthyKg - wKg;
      weightDeltaLbs = weightDeltaKg * 2.20462;
      targetAction = 'gain';
    }

    // BMR using Mifflin-St Jeor equation:
    // Men: 10*weight(kg) + 6.25*height(cm) - 5*age + 5
    // Women: 10*weight(kg) + 6.25*height(cm) - 5*age - 161
    const hCm = hMeters * 100;
    const bmr =
      gender === 'male'
        ? 10 * wKg + 6.25 * hCm - 5 * age + 5
        : 10 * wKg + 6.25 * hCm - 5 * age - 161;

    // TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * ACTIVITY_MULTIPLIERS[activity].factor;
    const weightLossCalories = Math.max(1200, Math.round(tdee - 500));
    const weightGainCalories = Math.round(tdee + 500);

    // Ponderal Index (kg / m^3)
    const ponderalIndex = wKg / (hMeters * hMeters * hMeters);
    // BMI Prime (BMI / 25)
    const bmiPrime = bmi / 25;

    return {
      bmi,
      classification,
      colorClass,
      bgClass,
      isHealthy,
      minHealthyKg,
      maxHealthyKg,
      minHealthyLbs,
      maxHealthyLbs,
      weightDeltaKg,
      weightDeltaLbs,
      targetAction,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      weightLossCalories,
      weightGainCalories,
      ponderalIndex: ponderalIndex.toFixed(2),
      bmiPrime: bmiPrime.toFixed(2),
    };
  }, [
    unit,
    gender,
    age,
    heightCm,
    weightKg,
    heightFeet,
    heightInches,
    weightLbs,
    activity,
  ]);

  const handleCelebrate = () => {
    if (calculations?.isHealthy) {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      showToast({
        type: 'success',
        title: 'Healthy BMI Achieved!',
        message: `Your BMI of ${calculations.bmi.toFixed(1)} is in the optimal healthy weight range!`,
      });
    }
  };

  const handleCopy = async () => {
    if (!calculations) return;
    const text = `💪 Health & BMI Summary:\n` +
      `📊 BMI Score: ${calculations.bmi.toFixed(1)} (${calculations.classification})\n` +
      `⚖️ Healthy Weight Range: ${unit === 'metric' ? `${calculations.minHealthyKg.toFixed(1)} – ${calculations.maxHealthyKg.toFixed(1)} kg` : `${Math.round(calculations.minHealthyLbs)} – ${Math.round(calculations.maxHealthyLbs)} lbs`}\n` +
      `🔥 Basal Metabolic Rate (BMR): ${calculations.bmr} kcal/day\n` +
      `⚡ Daily Maintenance (TDEE): ${calculations.tdee} kcal/day\n` +
      `Calculated with ToolBoxX Free BMI & Calorie Calculator.`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast({ type: 'success', title: 'Health Card Copied!', message: 'BMI summary copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Could not copy to clipboard.' });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Input Configuration Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--c-border)] pb-5">
          <div>
            <h2 className="text-xl font-bold text-[var(--c-text)] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[var(--c-gold)]" />
              <span>BMI & Daily Calorie Calculator</span>
            </h2>
            <p className="text-xs text-[var(--c-muted)] mt-1">
              Calculate Body Mass Index, WHO health category, ideal weight range, and TDEE calorie guidance.
            </p>
          </div>

          {/* Unit System Toggle */}
          <div className="flex rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] p-1">
            <button
              onClick={() => setUnit('metric')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                unit === 'metric' ? 'bg-[var(--c-gold)] text-black shadow-sm' : 'text-[var(--c-muted)]'
              }`}
            >
              Metric (kg / cm)
            </button>
            <button
              onClick={() => setUnit('imperial')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                unit === 'imperial' ? 'bg-[var(--c-gold)] text-black shadow-sm' : 'text-[var(--c-muted)]'
              }`}
            >
              Imperial (lbs / ft-in)
            </button>
          </div>
        </div>

        {/* Gender & Age */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--c-text)]">Biological Sex</label>
            <div className="flex rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] p-1">
              <button
                onClick={() => setGender('male')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  gender === 'male' ? 'bg-[var(--c-gold)] text-black font-bold' : 'text-[var(--c-muted)]'
                }`}
              >
                Male
              </button>
              <button
                onClick={() => setGender('female')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  gender === 'female' ? 'bg-[var(--c-gold)] text-black font-bold' : 'text-[var(--c-muted)]'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--c-text)]">Age (Years)</label>
            <input
              type="number"
              min="2"
              max="120"
              value={age}
              onChange={(e) => setAge(Math.max(1, parseInt(e.target.value) || 25))}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
            />
          </div>
        </div>

        {/* Height & Weight Inputs */}
        {unit === 'metric' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-[var(--c-text)]">
                <span>Height</span>
                <span className="font-bold text-[var(--c-gold)]">{heightCm} cm</span>
              </div>
              <input
                type="range"
                min="100"
                max="230"
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg bg-[var(--c-card)] cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-[var(--c-text)]">
                <span>Weight</span>
                <span className="font-bold text-[var(--c-gold)]">{weightKg} kg</span>
              </div>
              <input
                type="range"
                min="30"
                max="200"
                value={weightKg}
                onChange={(e) => setWeightKg(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg bg-[var(--c-card)] cursor-pointer"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--c-text)]">Height (Feet & Inches)</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    min="3"
                    max="8"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(parseInt(e.target.value) || 5)}
                    className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm font-bold text-[var(--c-text)] outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--c-muted)]">ft</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={heightInches}
                    onChange={(e) => setHeightInches(parseInt(e.target.value) || 0)}
                    className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm font-bold text-[var(--c-text)] outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--c-muted)]">in</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--c-text)]">Weight (Pounds / lbs)</label>
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  max="500"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(parseInt(e.target.value) || 150)}
                  className="w-full pl-3 pr-12 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm font-bold text-[var(--c-text)] outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--c-muted)]">lbs</span>
              </div>
            </div>
          </div>
        )}

        {/* Activity Level Selector */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-semibold text-[var(--c-text)] flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-[var(--c-gold)]" />
            <span>Activity Level (for Daily TDEE Calories)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((lvl) => {
              const act = ACTIVITY_MULTIPLIERS[lvl];
              return (
                <button
                  key={lvl}
                  onClick={() => setActivity(lvl)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activity === lvl
                      ? 'border-[var(--c-gold)] bg-[var(--c-gold)]/10 text-[var(--c-gold)]'
                      : 'border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)]'
                  }`}
                >
                  <span className="text-xs font-bold block text-[var(--c-text)]">{act.name}</span>
                  <span className="text-[10px] text-[var(--c-muted)] block mt-0.5 line-clamp-2">{act.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {calculations && (
        <>
          {/* Hero BMI Score Banner */}
          <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface)] via-[var(--c-card)] to-[var(--c-surface)] shadow-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${calculations.bgClass} ${calculations.colorClass}`}>
                  <Award className="w-3.5 h-3.5" />
                  <span>{calculations.classification}</span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-5xl sm:text-6xl font-extrabold text-[var(--c-gold)] tracking-tight">
                    {calculations.bmi.toFixed(1)}
                  </span>
                  <span className="text-sm font-semibold text-[var(--c-muted)]">BMI Score</span>
                </div>

                <p className="text-xs sm:text-sm text-[var(--c-muted)]">
                  Healthy range for height: <strong className="text-[var(--c-text)]">{unit === 'metric' ? `${calculations.minHealthyKg.toFixed(1)} – ${calculations.maxHealthyKg.toFixed(1)} kg` : `${Math.round(calculations.minHealthyLbs)} – ${Math.round(calculations.maxHealthyLbs)} lbs`}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {calculations.isHealthy && (
                  <button
                    onClick={handleCelebrate}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[var(--c-gold)] text-black font-semibold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Celebrate Healthy Range</span>
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-text)] hover:border-[var(--c-gold)] transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy Health Card'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Visual BMI Gauge Bar */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-4">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-[var(--c-text)]">BMI Scale Spectrum</span>
              <span className={calculations.colorClass}>{calculations.classification} ({calculations.bmi.toFixed(1)})</span>
            </div>

            {/* Gradient Gauge */}
            <div className="space-y-1.5">
              <div className="h-5 w-full rounded-full overflow-hidden flex border border-[var(--c-border)]">
                <div className="h-full bg-blue-400" style={{ width: '18.5%' }} title="Underweight (<18.5)" />
                <div className="h-full bg-emerald-500" style={{ width: '25%' }} title="Normal (18.5-24.9)" />
                <div className="h-full bg-amber-400" style={{ width: '20%' }} title="Overweight (25-29.9)" />
                <div className="h-full bg-rose-500 flex-1" title="Obese (≥30)" />
              </div>
              <div className="flex justify-between text-[10px] text-[var(--c-muted)] font-mono">
                <span>16.0</span>
                <span>18.5 (Normal)</span>
                <span>25.0 (Overweight)</span>
                <span>30.0 (Obese)</span>
                <span>40.0+</span>
              </div>
            </div>

            {calculations.targetAction !== 'maintain' && (
              <div className="p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)] flex items-center gap-2">
                <Target className="w-4 h-4 text-[var(--c-gold)] shrink-0" />
                <span>
                  To reach a normal BMI of 24.9, you would need to <strong>{calculations.targetAction}</strong> approx{' '}
                  <strong className="text-[var(--c-gold)]">
                    {unit === 'metric' ? `${calculations.weightDeltaKg.toFixed(1)} kg` : `${Math.round(calculations.weightDeltaLbs)} lbs`}
                  </strong>.
                </span>
              </div>
            )}
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Basal Metabolic Rate"
              value={`${calculations.bmr} kcal`}
              subValue="Calories burned at complete rest"
              icon={<Flame className="w-4 h-4 text-orange-400" />}
            />
            <StatCard
              label="Maintenance TDEE"
              value={`${calculations.tdee} kcal`}
              subValue="Daily energy expenditure"
              icon={<Utensils className="w-4 h-4 text-[var(--c-gold)]" />}
            />
            <StatCard
              label="Mild Weight Loss"
              value={`${calculations.weightLossCalories} kcal`}
              subValue="~0.5 kg (1 lb) loss/week (-500 kcal)"
              icon={<TrendingDown className="w-4 h-4 text-emerald-400" />}
            />
            <StatCard
              label="Weight Gain Target"
              value={`${calculations.weightGainCalories} kcal`}
              subValue="Surplus for muscle/mass gain (+500 kcal)"
              icon={<TrendingUp className="w-4 h-4 text-sky-400" />}
            />
          </div>

          {/* Shareable Health Card Banner */}
          <div className="p-6 sm:p-8 rounded-3xl border-2 border-[var(--c-gold)]/40 bg-[var(--c-surface)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[var(--c-gold)] uppercase tracking-wider">Shareable Health Report</span>
                <h3 className="text-lg font-bold text-[var(--c-text)]">
                  BMI Score: {calculations.bmi.toFixed(1)} ({calculations.classification})
                </h3>
              </div>
            </div>

            <SocialShareButtons
              variant="banner"
              resultSummary={`Calculated my BMI: ${calculations.bmi.toFixed(1)} (${calculations.classification}) with daily TDEE of ${calculations.tdee} kcal. Check your BMI:`}
              title="Free BMI & Calorie Calculator Online | ToolBoxX"
            />
          </div>
        </>
      )}

      {/* Recommendations */}
      <PostCompletionRecommendations currentToolId="bmi-calculator" />
    </div>
  );
};

export default BmiCalculator;
