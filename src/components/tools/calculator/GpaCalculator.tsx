import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Plus,
  Trash2,
  Award,
  BookOpen,
  Sparkles,
  Copy,
  Check,
  Download,
  Target,
  FileSpreadsheet,
  Printer,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StatCard } from '../../common/StatCard';
import { SocialShareButtons } from '../../common/SocialShareButtons';
import { showToast } from '../../common/Toast';
import { PostCompletionRecommendations } from '../../common/RelatedTools';

type ScaleType = 'college' | 'highschool';
type CourseWeight = 'regular' | 'honors' | 'ap';

interface Course {
  id: string;
  name: string;
  grade: string;
  credits: number;
  weight: CourseWeight;
}

interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'F': 0.0,
};

const WEIGHT_BONUS: Record<CourseWeight, number> = {
  regular: 0.0,
  honors: 0.5,
  ap: 1.0,
};

export const GpaCalculator: React.FC = () => {
  const [scaleType, setScaleType] = useState<ScaleType>('college');
  const [studentName, setStudentName] = useState<string>('Jordan Lee');
  const [schoolName, setSchoolName] = useState<string>('Stanford University');

  // Prior cumulative data (optional)
  const [usePriorGpa, setUsePriorGpa] = useState<boolean>(false);
  const [priorGpa, setPriorGpa] = useState<string>('3.70');
  const [priorCredits, setPriorCredits] = useState<string>('30');

  // Target GPA Planner
  const [targetGpa, setTargetGpa] = useState<string>('3.80');
  const [upcomingCredits, setTargetUpcomingCredits] = useState<string>('15');

  const [copied, setCopied] = useState<boolean>(false);

  // Semesters state
  const [semesters, setSemesters] = useState<Semester[]>([
    {
      id: 'sem-1',
      name: 'Fall Semester',
      courses: [
        { id: 'c-1', name: 'Computer Science 106A', grade: 'A', credits: 4, weight: 'regular' },
        { id: 'c-2', name: 'Calculus III & Linear Algebra', grade: 'A-', credits: 4, weight: 'ap' },
        { id: 'c-3', name: 'Academic Writing & Rhetoric', grade: 'B+', credits: 3, weight: 'honors' },
        { id: 'c-4', name: 'Physics Mechanics Lab', grade: 'A', credits: 4, weight: 'regular' },
      ],
    },
  ]);

  // Helpers to add/remove courses & semesters
  const addCourse = (semesterId: string) => {
    setSemesters((prev) =>
      prev.map((sem) => {
        if (sem.id !== semesterId) return sem;
        return {
          ...sem,
          courses: [
            ...sem.courses,
            {
              id: 'c-' + Math.random().toString(36).slice(2, 7),
              name: `Course ${sem.courses.length + 1}`,
              grade: 'A',
              credits: 3,
              weight: 'regular',
            },
          ],
        };
      })
    );
  };

  const removeCourse = (semesterId: string, courseId: string) => {
    setSemesters((prev) =>
      prev.map((sem) => {
        if (sem.id !== semesterId) return sem;
        if (sem.courses.length <= 1) {
          showToast({ type: 'info', title: 'Minimum 1 Course', message: 'A semester must have at least one course.' });
          return sem;
        }
        return {
          ...sem,
          courses: sem.courses.filter((c) => c.id !== courseId),
        };
      })
    );
  };

  const updateCourse = (semesterId: string, courseId: string, fields: Partial<Course>) => {
    setSemesters((prev) =>
      prev.map((sem) => {
        if (sem.id !== semesterId) return sem;
        return {
          ...sem,
          courses: sem.courses.map((c) => (c.id === courseId ? { ...c, ...fields } : c)),
        };
      })
    );
  };

  const addSemester = () => {
    setSemesters((prev) => [
      ...prev,
      {
        id: 'sem-' + Math.random().toString(36).slice(2, 7),
        name: `Semester ${prev.length + 1}`,
        courses: [
          { id: 'c-' + Math.random().toString(36).slice(2, 7), name: 'Course 1', grade: 'A', credits: 3, weight: 'regular' },
          { id: 'c-' + Math.random().toString(36).slice(2, 7), name: 'Course 2', grade: 'B+', credits: 3, weight: 'regular' },
        ],
      },
    ]);
  };

  const removeSemester = (semesterId: string) => {
    if (semesters.length <= 1) {
      showToast({ type: 'info', title: 'Cannot Delete', message: 'You must have at least one semester.' });
      return;
    }
    setSemesters((prev) => prev.filter((s) => s.id !== semesterId));
  };

  // Cumulative & Semester calculations
  const calculations = useMemo(() => {
    let totalUnweightedPoints = 0;
    let totalWeightedPoints = 0;
    let totalCredits = 0;

    const semesterResults = semesters.map((sem) => {
      let semUnweighted = 0;
      let semWeighted = 0;
      let semCredits = 0;

      sem.courses.forEach((c) => {
        const basePoint = GRADE_POINTS[c.grade] ?? 0;
        const bonus = scaleType === 'highschool' ? WEIGHT_BONUS[c.weight] : 0;
        const unweightedPoint = basePoint * c.credits;
        const weightedPoint = (basePoint + bonus) * c.credits;

        semUnweighted += unweightedPoint;
        semWeighted += weightedPoint;
        semCredits += c.credits;
      });

      const semGpaUnweighted = semCredits > 0 ? semUnweighted / semCredits : 0;
      const semGpaWeighted = semCredits > 0 ? semWeighted / semCredits : 0;

      totalUnweightedPoints += semUnweighted;
      totalWeightedPoints += semWeighted;
      totalCredits += semCredits;

      return {
        id: sem.id,
        name: sem.name,
        credits: semCredits,
        gpaUnweighted: semGpaUnweighted,
        gpaWeighted: semGpaWeighted,
      };
    });

    // Account for prior cumulative GPA
    let cumulativeCredits = totalCredits;
    let cumulativeUnweightedPoints = totalUnweightedPoints;
    let cumulativeWeightedPoints = totalWeightedPoints;

    if (usePriorGpa) {
      const pGpa = parseFloat(priorGpa);
      const pCredits = parseFloat(priorCredits);
      if (!isNaN(pGpa) && !isNaN(pCredits) && pCredits > 0) {
        cumulativeCredits += pCredits;
        cumulativeUnweightedPoints += pGpa * pCredits;
        cumulativeWeightedPoints += pGpa * pCredits;
      }
    }

    const cumulativeGpaUnweighted = cumulativeCredits > 0 ? cumulativeUnweightedPoints / cumulativeCredits : 0;
    const cumulativeGpaWeighted = cumulativeCredits > 0 ? cumulativeWeightedPoints / cumulativeCredits : 0;

    // Honors Distinction
    let distinction = 'Good Standing';
    let distinctionBadge = 'neutral';
    const primaryGpa = scaleType === 'highschool' ? cumulativeGpaWeighted : cumulativeGpaUnweighted;

    if (primaryGpa >= 3.9) {
      distinction = 'Summa Cum Laude (Highest Honors)';
      distinctionBadge = 'success';
    } else if (primaryGpa >= 3.7) {
      distinction = 'Magna Cum Laude (High Honors)';
      distinctionBadge = 'success';
    } else if (primaryGpa >= 3.5) {
      distinction = 'Cum Laude (Dean’s Honor Roll)';
      distinctionBadge = 'success';
    } else if (primaryGpa < 2.0 && cumulativeCredits > 0) {
      distinction = 'Academic Warning / Probation';
      distinctionBadge = 'warning';
    }

    // Letter grade equivalent
    let letterEquivalent = 'F';
    if (primaryGpa >= 3.85) letterEquivalent = 'A+ / Outstanding';
    else if (primaryGpa >= 3.7) letterEquivalent = 'A / Excellent';
    else if (primaryGpa >= 3.3) letterEquivalent = 'A- / Very Good';
    else if (primaryGpa >= 3.0) letterEquivalent = 'B+ / Good';
    else if (primaryGpa >= 2.7) letterEquivalent = 'B / Above Average';
    else if (primaryGpa >= 2.0) letterEquivalent = 'C / Satisfactory';
    else if (primaryGpa >= 1.0) letterEquivalent = 'D / Passing';

    // Target Planner calculation
    const tGpa = parseFloat(targetGpa);
    const upCredits = parseFloat(upcomingCredits);
    let requiredTargetGpa: number | null = null;

    if (!isNaN(tGpa) && !isNaN(upCredits) && upCredits > 0) {
      const targetTotalCredits = cumulativeCredits + upCredits;
      const targetRequiredPoints = tGpa * targetTotalCredits;
      const currentPoints = cumulativeUnweightedPoints;
      const neededPoints = targetRequiredPoints - currentPoints;
      requiredTargetGpa = neededPoints / upCredits;
    }

    return {
      totalCredits,
      cumulativeCredits,
      cumulativeGpaUnweighted,
      cumulativeGpaWeighted,
      primaryGpa,
      distinction,
      distinctionBadge,
      letterEquivalent,
      totalQualityPoints: cumulativeUnweightedPoints,
      semesterResults,
      requiredTargetGpa,
    };
  }, [semesters, scaleType, usePriorGpa, priorGpa, priorCredits, targetGpa, upcomingCredits]);

  const handleCelebrateHonors = () => {
    if (calculations.primaryGpa >= 3.5) {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
      showToast({
        type: 'success',
        title: 'Academic Achievement Unlocked!',
        message: `Congratulations on achieving ${calculations.distinction}!`,
      });
    } else {
      showToast({
        type: 'info',
        title: 'GPA Calculated',
        message: `Your current cumulative GPA is ${calculations.primaryGpa.toFixed(2)}.`,
      });
    }
  };

  const handleCopySummary = async () => {
    const summaryText = `🎓 Academic Report for ${studentName} (${schoolName}):\n` +
      `📊 Cumulative GPA: ${calculations.primaryGpa.toFixed(2)} (${scaleType === 'highschool' ? 'Weighted 5.0' : '4.0 Scale'})\n` +
      `⭐ Grade Equivalent: ${calculations.letterEquivalent}\n` +
      `🎖️ Academic Standing: ${calculations.distinction}\n` +
      `📚 Total Completed Credits: ${calculations.cumulativeCredits}\n` +
      `Calculated with ToolBoxX Free GPA Calculator.`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      showToast({
        type: 'success',
        title: 'Academic Card Copied!',
        message: 'Summary copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast({
        type: 'error',
        title: 'Copy Failed',
        message: 'Could not copy to clipboard.',
      });
    }
  };

  const exportCsv = () => {
    let csv = 'Semester,Course Name,Grade,Credits,Weight,Grade Points,Quality Points\n';
    semesters.forEach((sem) => {
      sem.courses.forEach((c) => {
        const basePoint = GRADE_POINTS[c.grade] ?? 0;
        const qp = basePoint * c.credits;
        csv += `"${sem.name}","${c.name}","${c.grade}",${c.credits},"${c.weight}",${basePoint},${qp}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${studentName.replace(/\s+/g, '_')}_GPA_Transcript.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast({ type: 'success', title: 'CSV Exported', message: 'Transcript exported as CSV.' });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Configuration Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--c-border)] pb-5">
          <div>
            <h2 className="text-xl font-bold text-[var(--c-text)] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[var(--c-gold)]" />
              <span>GPA & Academic Honors Calculator</span>
            </h2>
            <p className="text-xs text-[var(--c-muted)] mt-1">
              Calculate semester & cumulative GPA for College (4.0) or High School weighted (5.0 scale).
            </p>
          </div>

          {/* Scale Type Toggle */}
          <div className="flex rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] p-1">
            <button
              onClick={() => setScaleType('college')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                scaleType === 'college' ? 'bg-[var(--c-gold)] text-black shadow-sm' : 'text-[var(--c-muted)]'
              }`}
            >
              College (4.0)
            </button>
            <button
              onClick={() => setScaleType('highschool')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                scaleType === 'highschool' ? 'bg-[var(--c-gold)] text-black shadow-sm' : 'text-[var(--c-muted)]'
              }`}
            >
              High School (5.0)
            </button>
          </div>
        </div>

        {/* Student & School Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--c-text)]">Student Name</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--c-text)]">School / University</label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Institution Name"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
            />
          </div>
        </div>

        {/* Prior GPA Toggle Accordion */}
        <div className="p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="priorGpaToggle"
                checked={usePriorGpa}
                onChange={(e) => setUsePriorGpa(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--c-gold)] cursor-pointer"
              />
              <label htmlFor="priorGpaToggle" className="text-xs font-semibold text-[var(--c-text)] cursor-pointer">
                Include Prior Cumulative GPA & Credits (for continuing / transfer students)
              </label>
            </div>
          </div>

          {usePriorGpa && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[var(--c-muted)]">Prior Cumulative GPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="5.0"
                  value={priorGpa}
                  onChange={(e) => setPriorGpa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-xs text-[var(--c-text)] outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[var(--c-muted)]">Prior Completed Credits</label>
                <input
                  type="number"
                  min="0"
                  value={priorCredits}
                  onChange={(e) => setPriorCredits(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-xs text-[var(--c-text)] outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hero GPA Results Card */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-gradient-to-br from-[var(--c-surface)] via-[var(--c-card)] to-[var(--c-surface)] shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-gold)]/10 text-[var(--c-gold)] text-xs font-semibold border border-[var(--c-gold)]/20">
              <Award className="w-3.5 h-3.5" />
              <span>{calculations.distinction}</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-extrabold text-[var(--c-gold)] tracking-tight">
                {calculations.primaryGpa.toFixed(2)}
              </span>
              <div className="flex flex-col text-xs text-[var(--c-muted)]">
                <span className="font-bold text-[var(--c-text)]">
                  {scaleType === 'highschool' ? 'Weighted GPA (5.0)' : 'Cumulative GPA (4.0)'}
                </span>
                <span>Unweighted: {calculations.cumulativeGpaUnweighted.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--c-muted)]">
              Equivalent: <strong className="text-[var(--c-text)]">{calculations.letterEquivalent}</strong> • Total Credits: <strong className="text-[var(--c-text)]">{calculations.cumulativeCredits}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCelebrateHonors}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--c-gold)] text-black font-semibold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Celebrate</span>
            </button>
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Cumulative GPA"
          value={calculations.primaryGpa.toFixed(2)}
          subValue={scaleType === 'highschool' ? '5.0 Weighted Scale' : '4.0 Standard Scale'}
          icon={<GraduationCap className="w-4 h-4" />}
        />
        <StatCard
          label="Unweighted GPA"
          value={calculations.cumulativeGpaUnweighted.toFixed(2)}
          subValue="Standard 4.0 basis"
          icon={<Award className="w-4 h-4" />}
        />
        <StatCard
          label="Total Credits"
          value={calculations.cumulativeCredits}
          subValue="Units earned"
          icon={<BookOpen className="w-4 h-4" />}
        />
        <StatCard
          label="Quality Points"
          value={calculations.totalQualityPoints.toFixed(1)}
          subValue="Credits × Points"
          icon={<Target className="w-4 h-4" />}
        />
      </div>

      {/* Semesters & Courses List */}
      <div className="space-y-6">
        {semesters.map((sem, sIdx) => {
          const semCalc = calculations.semesterResults.find((r) => r.id === sem.id);
          return (
            <div key={sem.id} className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--c-border)] pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] flex items-center justify-center text-xs font-bold text-[var(--c-gold)]">
                    {sIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={sem.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSemesters((prev) => prev.map((s) => (s.id === sem.id ? { ...s, name: val } : s)));
                    }}
                    className="text-base font-bold text-[var(--c-text)] bg-transparent border-b border-transparent hover:border-[var(--c-border)] focus:border-[var(--c-gold)] outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  {semCalc && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)]">
                      Term GPA: {semCalc.gpaUnweighted.toFixed(2)} ({semCalc.credits} cr)
                    </span>
                  )}
                  {semesters.length > 1 && (
                    <button
                      onClick={() => removeSemester(sem.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Semester"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Course Rows */}
              <div className="space-y-2.5">
                {sem.courses.map((course) => (
                  <div
                    key={course.id}
                    className="grid grid-cols-12 gap-2 sm:gap-3 p-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] items-center"
                  >
                    <div className="col-span-12 sm:col-span-5">
                      <input
                        type="text"
                        value={course.name}
                        onChange={(e) => updateCourse(sem.id, course.id, { name: e.target.value })}
                        placeholder="Course title"
                        className="w-full px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-xs font-semibold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <select
                        value={course.grade}
                        onChange={(e) => updateCourse(sem.id, course.id, { grade: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-xs font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none cursor-pointer"
                      >
                        {Object.keys(GRADE_POINTS).map((g) => (
                          <option key={g} value={g}>
                            {g} ({GRADE_POINTS[g].toFixed(1)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="10"
                          value={course.credits}
                          onChange={(e) => updateCourse(sem.id, course.id, { credits: parseFloat(e.target.value) || 0 })}
                          className="w-full pl-3 pr-8 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-xs font-semibold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--c-muted)] font-bold">
                          CR
                        </span>
                      </div>
                    </div>

                    {scaleType === 'highschool' && (
                      <div className="col-span-3 sm:col-span-2">
                        <select
                          value={course.weight}
                          onChange={(e) => updateCourse(sem.id, course.id, { weight: e.target.value as CourseWeight })}
                          className="w-full px-2.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[11px] font-semibold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none cursor-pointer"
                        >
                          <option value="regular">Regular (+0.0)</option>
                          <option value="honors">Honors (+0.5)</option>
                          <option value="ap">AP/IB (+1.0)</option>
                        </select>
                      </div>
                    )}

                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => removeCourse(sem.id, course.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => addCourse(sem.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-semibold text-[var(--c-gold)] hover:border-[var(--c-gold)] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Course</span>
                </button>
              </div>
            </div>
          );
        })}

        <div className="flex justify-center pt-2">
          <button
            onClick={addSemester}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-dashed border-[var(--c-border)] hover:border-[var(--c-gold)] text-xs font-bold text-[var(--c-text)] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[var(--c-gold)]" />
            <span>+ Add Another Semester / Term</span>
          </button>
        </div>
      </div>

      {/* Target GPA Planner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[var(--c-gold)]" />
          <h3 className="text-base font-bold text-[var(--c-text)]">Target GPA Planner</h3>
        </div>
        <p className="text-xs text-[var(--c-muted)]">
          Calculate the GPA you need in your upcoming credits to reach your dream cumulative GPA.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--c-text)]">Target Cumulative GPA</label>
            <input
              type="number"
              step="0.05"
              min="0"
              max="4.0"
              value={targetGpa}
              onChange={(e) => setTargetGpa(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--c-text)]">Upcoming Credit Load</label>
            <input
              type="number"
              min="1"
              max="60"
              value={upcomingCredits}
              onChange={(e) => setTargetUpcomingCredits(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm font-bold text-[var(--c-text)] focus:border-[var(--c-gold)] outline-none"
            />
          </div>

          <div className="p-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] flex flex-col justify-center">
            <span className="text-[11px] font-semibold text-[var(--c-muted)]">Required Upcoming GPA:</span>
            {calculations.requiredTargetGpa !== null ? (
              calculations.requiredTargetGpa <= 4.0 ? (
                <span className="text-lg font-bold text-[var(--c-gold)]">
                  {calculations.requiredTargetGpa.toFixed(2)} GPA needed
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-400">
                  Requires {calculations.requiredTargetGpa.toFixed(2)} (exceeds 4.0 max — take more credits)
                </span>
              )
            ) : (
              <span className="text-xs text-[var(--c-muted)]">Enter valid targets</span>
            )}
          </div>
        </div>
      </div>

      {/* Shareable Achievement Card */}
      <div className="p-6 sm:p-8 rounded-3xl border-2 border-[var(--c-gold)]/40 bg-[var(--c-surface)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[var(--c-gold)] uppercase tracking-wider">Shareable Academic Card</span>
            <h3 className="text-lg font-bold text-[var(--c-text)]">
              {studentName ? `${studentName}'s Academic Standing` : 'My Academic Standing'}
            </h3>
          </div>
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-text)] hover:border-[var(--c-gold)] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Card'}</span>
          </button>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--c-muted)]">Institution:</span>
            <span className="font-semibold text-[var(--c-text)]">{schoolName || 'University'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--c-muted)]">Cumulative GPA:</span>
            <span className="font-bold text-[var(--c-gold)]">{calculations.primaryGpa.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--c-muted)]">Academic Distinction:</span>
            <span className="font-semibold text-[var(--c-text)]">{calculations.distinction}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--c-muted)]">Letter Grade:</span>
            <span className="font-semibold text-[var(--c-text)]">{calculations.letterEquivalent}</span>
          </div>
        </div>

        <SocialShareButtons
          variant="banner"
          resultSummary={`I achieved a ${calculations.primaryGpa.toFixed(2)} Cumulative GPA (${calculations.distinction})! Calculate your GPA:`}
          title="Free College & High School GPA Calculator | ToolBoxX"
        />
      </div>

      {/* Recommendations */}
      <PostCompletionRecommendations currentToolId="gpa-calculator" />
    </div>
  );
};

export default GpaCalculator;
