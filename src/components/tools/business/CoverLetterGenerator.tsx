import React, { useState } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import {
  FileText,
  Copy,
  Download,
  Printer,
  Sparkles,
  User,
  Building,
  Briefcase,
  CheckCircle2,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

type ToneType = 'professional' | 'confident' | 'passionate' | 'technical';

export const CoverLetterGenerator: React.FC = () => {
  // Applicant details
  const [applicantName, setApplicantName] = useState<string>('Jordan Rivera');
  const [applicantEmail, setApplicantEmail] = useState<string>('jordan.rivera@email.com');
  const [applicantPhone, setApplicantPhone] = useState<string>('+1 (555) 789-0123');
  const [applicantLocation, setApplicantLocation] = useState<string>('Austin, TX');

  // Target Company details
  const [jobTitle, setJobTitle] = useState<string>('Lead Product Designer');
  const [companyName, setCompanyName] = useState<string>('Stripe');
  const [hiringManager, setHiringManager] = useState<string>('Hiring Team');
  const [companyLocation, setCompanyLocation] = useState<string>('San Francisco, CA');

  // Background & Strengths
  const [yearsExperience, setYearsExperience] = useState<string>('6');
  const [coreSkills, setCoreSkills] = useState<string>('Design Systems, User Research, Figma, Interactive Prototyping');
  const [topAchievement, setTopAchievement] = useState<string>(
    'Redesigned global checkout flow, increasing onboarding conversion by 34% across 1.2M users.'
  );
  const [companyAdmiration, setCompanyAdmiration] = useState<string>(
    'your relentless focus on developer experience, elegance in financial infrastructure, and design-first culture.'
  );

  // Tone
  const [tone, setTone] = useState<ToneType>('confident');

  // Editable Letter Paragraphs
  const [salutation, setSalutation] = useState<string>('Dear Stripe Hiring Team,');
  const [openingPara, setOpeningPara] = useState<string>(
    'I am writing to express my enthusiastic interest in the Lead Product Designer position at Stripe. With over 6 years of dedicated experience crafting intuitive, scalable user interfaces and scalable design systems, I have long admired your relentless focus on developer experience, elegance in financial infrastructure, and design-first culture.'
  );
  const [bodyPara1, setBodyPara1] = useState<string>(
    'Throughout my career, I have specialized in transforming complex workflows into seamless, delightful digital experiences. In my previous role, I spearheaded the redesign of our global checkout flow, increasing onboarding conversion by 34% across 1.2M users. My core strengths in Design Systems, User Research, Figma, and Interactive Prototyping allow me to bridge the gap between user needs and measurable business impact.'
  );
  const [bodyPara2, setBodyPara2] = useState<string>(
    'What excites me most about Stripe is your commitment to high-craft execution at global scale. I thrive in collaborative environments where design and engineering work hand-in-hand to ship products that empower millions of businesses worldwide. I am eager to bring my expertise in systematic design thinking and cross-functional leadership to your product design organization.'
  );
  const [closingPara, setClosingPara] = useState<string>(
    'Thank you for your time and consideration. I would welcome the opportunity to discuss how my design leadership and track record of driving conversions can contribute to Stripe’s continued success. I look forward to hearing from you.'
  );
  const [signOff, setSignOff] = useState<string>('Sincerely,');

  // Regenerate paragraphs based on inputs & tone
  const handleRegenerate = () => {
    const manager = hiringManager.trim() || 'Hiring Team';
    const comp = companyName.trim() || 'your company';
    const role = jobTitle.trim() || 'this role';
    const yrs = yearsExperience.trim() || '5+';
    const skills = coreSkills.trim() || 'Product Design, UI/UX, Leadership';
    const ach = topAchievement.trim() || 'led key initiatives that substantially boosted performance.';
    const why = companyAdmiration.trim() || 'your innovative product ecosystem and industry leadership.';

    setSalutation(`Dear ${manager},`);

    if (tone === 'professional') {
      setOpeningPara(
        `I am writing to formally submit my application for the ${role} position at ${comp}. With ${yrs} years of progressive experience in the industry and deep expertise in ${skills}, I am confident in my ability to deliver immediate value to your organization.`
      );
      setBodyPara1(
        `In my recent roles, I have consistently demonstrated a commitment to operational excellence and tangible outcomes. Notably, I ${ach} My background in ${skills} has prepared me to effectively execute strategic initiatives and collaborate across multidisciplinary teams.`
      );
      setBodyPara2(
        `I have followed ${comp}'s growth with great respect, particularly ${why}. I am eager to contribute my structured problem-solving approach and professional dedication to your team's upcoming milestones.`
      );
      setClosingPara(
        `Thank you for reviewing my application. I look forward to the opportunity to discuss my qualifications and how my background aligns with ${comp}'s objectives in greater detail.`
      );
      setSignOff('Respectfully yours,');
    } else if (tone === 'confident') {
      setOpeningPara(
        `I am thrilled to apply for the ${role} opening at ${comp}. Backed by ${yrs} years of proven success delivering high-impact results, I specialize in ${skills} and thrive on taking complex challenges from ideation to scale.`
      );
      setBodyPara1(
        `Throughout my career, I have focused on driving measurable velocity and business growth. For instance, I ${ach} Leveraging my mastery of ${skills}, I excel at aligning product strategy with rigorous execution.`
      );
      setBodyPara2(
        `${comp} stands out to me because of ${why}. I am energized by your vision and eager to bring my creative leadership and track record of delivery to your high-performing team.`
      );
      setClosingPara(
        `I would love the opportunity to connect and share more about how my skillset can accelerate ${comp}'s roadmap. Thank you for your consideration.`
      );
      setSignOff('Best regards,');
    } else if (tone === 'passionate') {
      setOpeningPara(
        `Ever since discovering ${comp}, I have been deeply inspired by ${why}. As a dedicated professional with ${yrs} years of hands-on experience, I could not be more excited to apply for the ${role} position.`
      );
      setBodyPara1(
        `My career has been fueled by a passion for building remarkable experiences. Most recently, I ${ach} Bringing deep competence in ${skills}, I enjoy working alongside talented creators to push boundaries.`
      );
      setBodyPara2(
        `Joining ${comp} would be an extraordinary opportunity to channel my energy toward mission-driven projects that make a lasting difference for our users.`
      );
      setClosingPara(
        `Thank you for taking the time to review my letter. I would be thrilled to speak further about how we can build something incredible together at ${comp}.`
      );
      setSignOff('Warmly,');
    } else {
      // technical
      setOpeningPara(
        `I am writing to apply for the ${role} position at ${comp}. With ${yrs} years of experience specializing in ${skills}, I focus on scalable architecture, measurable performance metrics, and reliable execution.`
      );
      setBodyPara1(
        `My technical background includes deep hands-on expertise in ${skills}. In my previous role, I ${ach} I apply data-driven methodologies and best engineering practices to solve complex domain problems.`
      );
      setBodyPara2(
        `I admire ${comp} for ${why}. I am eager to apply my technical rigor and systems-level mindset to support ${comp}'s core infrastructure and product scale.`
      );
      setClosingPara(
        `I welcome the chance to discuss technical requirements and how my background fits your team's roadmap. Thank you for your time.`
      );
      setSignOff('Sincerely,');
    }

    showToast({ type: 'success', title: 'Letter Generated', message: `Crafted a ${tone} cover letter.` });
  };

  // 1-Click Copy
  const handleCopyText = async () => {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const fullText = `${applicantName}\n${applicantEmail} | ${applicantPhone} | ${applicantLocation}\n\n${today}\n\n${salutation}\n\n${openingPara}\n\n${bodyPara1}\n\n${bodyPara2}\n\n${closingPara}\n\n${signOff}\n${applicantName}`;

    try {
      await navigator.clipboard.writeText(fullText);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      showToast({ type: 'success', title: 'Letter Copied', message: 'Cover letter copied to clipboard!' });
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Could not access clipboard.' });
    }
  };

  // 1-Click DOCX Export via docx npm library
  const handleDownloadDocx = async () => {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Header
              new Paragraph({
                text: applicantName.toUpperCase(),
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.LEFT,
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `${applicantEmail} | ${applicantPhone} | ${applicantLocation}`, color: '666666' }),
                ],
                spacing: { after: 300 },
              }),
              new Paragraph({
                text: today,
                spacing: { after: 300 },
              }),
              new Paragraph({
                text: salutation,
                spacing: { after: 200 },
              }),
              new Paragraph({
                text: openingPara,
                spacing: { after: 200 },
              }),
              new Paragraph({
                text: bodyPara1,
                spacing: { after: 200 },
              }),
              new Paragraph({
                text: bodyPara2,
                spacing: { after: 200 },
              }),
              new Paragraph({
                text: closingPara,
                spacing: { after: 300 },
              }),
              new Paragraph({
                text: signOff,
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: applicantName,
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, `cover_letter_${companyName.toLowerCase().replace(/\s+/g, '_')}.docx`);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      showToast({ type: 'success', title: 'Word Doc Saved', message: 'Downloaded professional .docx file.' });
    } catch (err) {
      console.error('Docx export error:', err);
      showToast({ type: 'error', title: 'Export Failed', message: 'Could not generate Word document.' });
    }
  };

  const TONES: { id: ToneType; name: string; desc: string }[] = [
    { id: 'confident', name: 'Confident & Dynamic', desc: 'Direct, impact-oriented, metrics-driven' },
    { id: 'professional', name: 'Formal & Executive', desc: 'Traditional, polite, structured corporate tone' },
    { id: 'passionate', name: 'Passionate & Creative', desc: 'Mission-driven, authentic storytelling' },
    { id: 'technical', name: 'Technical / Engineering', desc: 'Rigorous, architecture & problem-solving focus' },
  ];

  return (
    <div className="space-y-8">
      {/* Tone Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[var(--c-surface)] p-2.5 rounded-2xl border border-[var(--c-border)]">
        {TONES.map((t) => {
          const isActive = tone === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTone(t.id);
              }}
              className={`p-3 rounded-xl text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--c-card)] border border-[var(--c-gold)] shadow-md text-[var(--c-text)]'
                  : 'text-[var(--c-muted)] hover:bg-[var(--c-card)] hover:text-[var(--c-text)] border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[var(--c-text)]">{t.name}</span>
                {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--c-gold)]" />}
              </div>
              <p className="text-[10px] text-[var(--c-muted)] mt-0.5">{t.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Inputs on Left, Live Letterhead on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-6 space-y-6">
          {/* Target Role & Company */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <Building className="w-4 h-4 text-[var(--c-gold)]" /> Target Role & Company
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Target Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Hiring Manager / Team</label>
                <input
                  type="text"
                  value={hiringManager}
                  onChange={(e) => setHiringManager(e.target.value)}
                  placeholder="e.g. Stripe Design Team or Jane Smith"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Years Experience</label>
                <input
                  type="text"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Core Skills & Strengths</label>
              <input
                type="text"
                value={coreSkills}
                onChange={(e) => setCoreSkills(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Top Key Achievement / Metric</label>
              <textarea
                rows={2}
                value={topAchievement}
                onChange={(e) => setTopAchievement(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Why do you admire this company?</label>
              <textarea
                rows={2}
                value={companyAdmiration}
                onChange={(e) => setCompanyAdmiration(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
              />
            </div>

            <button
              type="button"
              onClick={handleRegenerate}
              className="w-full py-3 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-gold)] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              Re-Craft Letter with Selected Tone
            </button>
          </div>

          {/* Applicant Info */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-3">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--c-gold)]" /> Your Contact Info
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Full Name"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={applicantEmail}
                onChange={(e) => setApplicantEmail(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={applicantPhone}
                onChange={(e) => setApplicantPhone(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
              />
              <input
                type="text"
                placeholder="Location"
                value={applicantLocation}
                onChange={(e) => setApplicantLocation(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Formatted Letter Preview */}
        <div className="lg:col-span-6 space-y-6">
          {/* Action Bar */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="py-3 px-3 rounded-xl bg-[var(--c-text)] hover:opacity-90 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-4 h-4" /> Copy Text
            </button>

            <button
              type="button"
              onClick={handleDownloadDocx}
              className="py-3 px-3 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[var(--c-gold)]" /> Word (.docx)
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="py-3 px-3 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[var(--c-gold)]" /> Print / PDF
            </button>
          </div>

          {/* Formatted Letter Paper Preview */}
          <div className="p-8 rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200 text-xs leading-relaxed space-y-5 min-h-[700px]">
            {/* Letterhead */}
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                {applicantName || 'Your Name'}
              </h2>
              <div className="text-[11px] text-slate-600 mt-1">
                {applicantEmail} · {applicantPhone} · {applicantLocation}
              </div>
            </div>

            {/* Date */}
            <div className="text-[11px] text-slate-500 font-medium">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>

            {/* Editable Paragraphs */}
            <div className="space-y-4">
              <input
                type="text"
                value={salutation}
                onChange={(e) => setSalutation(e.target.value)}
                className="w-full font-bold text-slate-900 outline-none border-b border-transparent focus:border-slate-300 py-0.5 bg-transparent"
              />

              <textarea
                rows={3}
                value={openingPara}
                onChange={(e) => setOpeningPara(e.target.value)}
                className="w-full text-slate-800 leading-relaxed outline-none border border-transparent focus:border-slate-300 rounded p-1 bg-transparent resize-y"
              />

              <textarea
                rows={4}
                value={bodyPara1}
                onChange={(e) => setBodyPara1(e.target.value)}
                className="w-full text-slate-800 leading-relaxed outline-none border border-transparent focus:border-slate-300 rounded p-1 bg-transparent resize-y"
              />

              <textarea
                rows={3}
                value={bodyPara2}
                onChange={(e) => setBodyPara2(e.target.value)}
                className="w-full text-slate-800 leading-relaxed outline-none border border-transparent focus:border-slate-300 rounded p-1 bg-transparent resize-y"
              />

              <textarea
                rows={3}
                value={closingPara}
                onChange={(e) => setClosingPara(e.target.value)}
                className="w-full text-slate-800 leading-relaxed outline-none border border-transparent focus:border-slate-300 rounded p-1 bg-transparent resize-y"
              />
            </div>

            {/* Sign Off */}
            <div className="pt-2 space-y-1">
              <input
                type="text"
                value={signOff}
                onChange={(e) => setSignOff(e.target.value)}
                className="font-medium text-slate-800 outline-none border-b border-transparent focus:border-slate-300 py-0.5 bg-transparent"
              />
              <div className="font-bold text-sm text-slate-900 pt-3">
                {applicantName || 'Your Name'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations currentToolId="cover-letter-generator" />
    </div>
  );
};

export default CoverLetterGenerator;
