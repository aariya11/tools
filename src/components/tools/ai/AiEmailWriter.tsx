import React, { useState } from 'react';
import {
  Mail,
  Send,
  Copy,
  Download,
  Trash2,
  Sparkles,
  Check,
  Zap,
  Clock,
  ExternalLink,
  User,
  Building,
  Target,
  ListOrdered,
  FileCheck,
  RefreshCw,
  Loader2,
  Briefcase,
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { GeminiBanner } from './GeminiKeyModal';
import { callGeminiApi, hasGeminiApiKey } from '../../../utils/geminiClient';
import { calculateTextStats } from '../../../utils/textUtils';
import { downloadBlob } from '../../../utils/fileUtils';

export type EmailTone = 'Formal' | 'Casual' | 'Urgent' | 'Follow-up' | 'Pitch';

interface EmailPreset {
  id: string;
  name: string;
  purpose: string;
  recipient: string;
  tone: EmailTone;
  points: string;
  cta: string;
}

const EMAIL_PRESETS: EmailPreset[] = [
  {
    id: 'meeting',
    name: '📅 Schedule Meeting',
    purpose: 'Request a 20-minute product demo and workflow alignment discussion',
    recipient: 'Alex Rivera (VP of Engineering)',
    tone: 'Formal',
    points: '• Discuss cloud scalability bottlenecks in current setup\n• Showcase our real-time analytics engine demo\n• Share benchmark metrics from our latest enterprise case study',
    cta: 'Are you available for a 20-minute discussion next Tuesday or Wednesday afternoon?',
  },
  {
    id: 'followup',
    name: '🔔 Project Follow-Up',
    purpose: 'Follow up on the submitted Q3 proposal and next milestone approvals',
    recipient: 'Sarah Jenkins (Project Director)',
    tone: 'Follow-up',
    points: '• Sent updated contract terms and timeline revisions last Thursday\n• Confirmed implementation team is fully resourced for a Sept 1 start\n• Need finalized budget sign-off to proceed with vendor provisioning',
    cta: 'Could you please confirm if the revisions look good on your end by Friday?',
  },
  {
    id: 'pitch',
    name: '🚀 Sales Pitch',
    purpose: 'Introduce ToolBoxX Enterprise Workspace to eliminate manual document processing',
    recipient: 'David Chen (Chief Operations Officer)',
    tone: 'Pitch',
    points: '• Modern teams spend 4.5 hours weekly converting and compressing assets\n• ToolBoxX runs 100% in-browser with zero cloud data retention\n• Reduces digital asset turnaround times by 80%',
    cta: 'Would you be open to a 10-minute preview call to see how this fits your workflow?',
  },
  {
    id: 'update',
    name: '📊 Team Sprint Update',
    purpose: 'Weekly milestone progress report to core stakeholders',
    recipient: 'Engineering & Product Teams',
    tone: 'Casual',
    points: '• 100% of P0 sprint tickets merged and deployed to staging\n• Beta testing session scheduled with 15 pilot users on Thursday\n• Zero critical security vulnerabilities detected in automated scans',
    cta: 'Please review staging environment release notes and drop comments in Slack by 3 PM.',
  },
];

export const AiEmailWriter: React.FC = () => {
  const [purpose, setPurpose] = useState<string>('Request a collaboration meeting to explore strategic channel partnership');
  const [recipient, setRecipient] = useState<string>('Michael Vance (Head of Growth)');
  const [senderName, setSenderName] = useState<string>('Alex Johnson');
  const [senderTitle, setSenderTitle] = useState<string>('Strategic Partnerships Lead');
  const [tone, setTone] = useState<EmailTone>('Formal');
  const [talkingPoints, setTalkingPoints] = useState<string>(
    '• Observed your impressive quarterly expansion in EMEA markets\n• Our tool ecosystem complements your current product suite seamlessly\n• Potential co-marketing webinar and mutual referral integration'
  );
  const [cta, setCta] = useState<string>('Would you have 15 minutes next week for a brief introductory call?');

  const [subjectLines, setSubjectLines] = useState<string[]>([
    'Exploring Strategic Partnership Opportunities with ToolBoxX',
    'Quick question regarding your EMEA expansion & mutual synergies',
    'Partnership idea: Scaling customer acquisition together in Q4',
  ]);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState<number>(0);
  const [emailBody, setEmailBody] = useState<string>(
    `Hi Michael,\n\nI hope this email finds you well.\n\nI have been following your impressive growth and recent expansion in EMEA markets with great interest. Given your focus on empowering modern digital teams, I believe there is an exceptional opportunity for our organizations to collaborate.\n\nSpecifically, I would love to explore:\n• Joint integration synergies between our tool suite and your platform\n• Co-marketing initiatives including an educational webinar series\n• Mutual referral incentives to accelerate user acquisition\n\nWould you have 15 minutes next week for a brief introductory call to discuss if this aligns with your Q4 roadmap?\n\nBest regards,\n\nAlex Johnson\nStrategic Partnerships Lead`
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const bodyStats = calculateTextStats(emailBody);

  // Client-Side Smart Email Synthesizer
  const generateOfflineEmail = (
    currPurpose: string,
    currRecipient: string,
    currTone: EmailTone,
    currPoints: string,
    currCta: string,
    currSender: string,
    currTitle: string
  ) => {
    const rawRecipientName = currRecipient.split(/[\(\-,]/)[0].trim() || 'Colleague';
    const cleanSender = currSender.trim() || 'Alex Johnson';
    const cleanTitle = currTitle.trim();

    // Subject Lines Generation
    let subjects: string[] = [];
    switch (currTone) {
      case 'Formal':
        subjects = [
          `Regarding ${currPurpose.slice(0, 45)} – Partnership Inquiry`,
          `Formal Update: ${currPurpose.slice(0, 50)}`,
          `Strategic Alignment: Collaboration with ${rawRecipientName}`,
        ];
        break;
      case 'Urgent':
        subjects = [
          `[Action Required] ${currPurpose.slice(0, 45)}`,
          `Time-Sensitive: Urgent update regarding ${currPurpose.slice(0, 40)}`,
          `Immediate review needed: ${rawRecipientName}`,
        ];
        break;
      case 'Follow-up':
        subjects = [
          `Following up: ${currPurpose.slice(0, 45)}`,
          `Quick follow-up regarding our previous discussion`,
          `Re: Next steps on ${currPurpose.slice(0, 40)}`,
        ];
        break;
      case 'Pitch':
        subjects = [
          `Accelerating your workflow: Quick idea for ${rawRecipientName}`,
          `How we help teams achieve 80% faster asset turnarounds`,
          `Quick intro & value proposition for ${currRecipient.split(' ')[0] || 'your team'}`,
        ];
        break;
      case 'Casual':
      default:
        subjects = [
          `Quick note regarding ${currPurpose.slice(0, 40)}`,
          `Hey ${rawRecipientName.split(' ')[0] || ''} – Quick question for you`,
          `Ideas on ${currPurpose.slice(0, 45)}`,
        ];
        break;
    }

    // Body Assembly
    let salutation = `Dear ${rawRecipientName},`;
    let opening = `I am writing to you regarding ${currPurpose.toLowerCase()}.`;
    let closing = 'Sincerely,';

    if (currTone === 'Casual') {
      salutation = `Hi ${rawRecipientName.split(' ')[0] || rawRecipientName},`;
      opening = `Hope you're having a great week! Wanted to reach out quickly about ${currPurpose.toLowerCase()}.`;
      closing = 'Best,';
    } else if (currTone === 'Urgent') {
      salutation = `Hello ${rawRecipientName},`;
      opening = `I am writing to bring your immediate attention to ${currPurpose.toLowerCase()}.`;
      closing = 'Thank you for your prompt attention,';
    } else if (currTone === 'Follow-up') {
      salutation = `Hi ${rawRecipientName},`;
      opening = `I wanted to follow up on our previous conversation regarding ${currPurpose.toLowerCase()}.`;
      closing = 'Looking forward to your update,';
    } else if (currTone === 'Pitch') {
      salutation = `Hi ${rawRecipientName},`;
      opening = `I noticed your ongoing focus on operational excellence, and wanted to share how we are helping teams tackle ${currPurpose.toLowerCase()}.`;
      closing = 'Best regards,';
    }

    // Format bullet points
    const formattedPoints = currPoints
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => (p.startsWith('•') || p.startsWith('-') ? p : `• ${p}`))
      .join('\n');

    const bodyParagraphs = [
      salutation,
      '',
      opening,
      '',
      formattedPoints ? `Here are the key details:\n${formattedPoints}` : '',
      '',
      currCta || 'Please let me know your thoughts.',
      '',
      closing,
      '',
      cleanSender + (cleanTitle ? `\n${cleanTitle}` : ''),
    ]
      .filter((p, i) => p !== '' || (i > 0 && i < 10))
      .join('\n');

    return {
      subjects,
      body: bodyParagraphs.replace(/\n{3,}/g, '\n\n'),
    };
  };

  const handleGenerate = async () => {
    if (!purpose.trim()) {
      showToast({ type: 'error', title: 'Purpose Required', message: 'Please enter the email purpose or objective.' });
      return;
    }

    setIsGenerating(true);

    try {
      if (hasGeminiApiKey()) {
        const systemInstruction = `You are an elite corporate communications specialist and executive copywriter. 
Generate a high-converting, polished email based on the user's parameters.
Adhere strictly to this output format:
SUBJECT 1: [Subject option 1]
SUBJECT 2: [Subject option 2]
SUBJECT 3: [Subject option 3]
---BODY---
[Complete formatted email body including greeting, context, bullet points, call to action, and sign-off]`;

        const prompt = `Email Parameters:
- Purpose / Goal: ${purpose}
- Recipient: ${recipient}
- Tone: ${tone}
- Key Talking Points:
${talkingPoints}
- Call to Action: ${cta}
- Sender Name: ${senderName}
- Sender Title: ${senderTitle}`;

        const geminiOutput = await callGeminiApi({
          prompt,
          systemInstruction,
          temperature: 0.6,
        });

        const bodyParts = geminiOutput.split(/---BODY---/i);
        const subjectsBlock = bodyParts[0] || '';
        const rawBody = bodyParts[1] || geminiOutput;

        const subjectMatches = subjectsBlock.match(/SUBJECT \d+:\s*(.+)/gi);
        if (subjectMatches && subjectMatches.length > 0) {
          const parsedSubjects = subjectMatches.map((s) => s.replace(/SUBJECT \d+:\s*/i, '').trim());
          setSubjectLines(parsedSubjects);
          setSelectedSubjectIndex(0);
        }

        setEmailBody(rawBody.trim());
        showToast({ type: 'success', title: 'Email Generated', message: 'Tailored email created with Google Gemini AI.' });
      } else {
        const result = generateOfflineEmail(purpose, recipient, tone, talkingPoints, cta, senderName, senderTitle);
        setSubjectLines(result.subjects);
        setSelectedSubjectIndex(0);
        setEmailBody(result.body);
        showToast({ type: 'success', title: 'Email Generated', message: 'Created using smart client-side synthesis.' });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Generation Error', message: err.message || 'Falling back to offline template.' });
      const result = generateOfflineEmail(purpose, recipient, tone, talkingPoints, cta, senderName, senderTitle);
      setSubjectLines(result.subjects);
      setSelectedSubjectIndex(0);
      setEmailBody(result.body);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyPreset = (preset: EmailPreset) => {
    setPurpose(preset.purpose);
    setRecipient(preset.recipient);
    setTone(preset.tone);
    setTalkingPoints(preset.points);
    setCta(preset.cta);

    const result = generateOfflineEmail(
      preset.purpose,
      preset.recipient,
      preset.tone,
      preset.points,
      preset.cta,
      senderName,
      senderTitle
    );
    setSubjectLines(result.subjects);
    setSelectedSubjectIndex(0);
    setEmailBody(result.body);
    showToast({ type: 'info', title: 'Preset Loaded', message: `Applied ${preset.name}` });
  };

  const handleCopyFullEmail = () => {
    const activeSubject = subjectLines[selectedSubjectIndex] || 'Email';
    const fullText = `Subject: ${activeSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(fullText);
    showToast({ type: 'success', title: 'Copied Full Email', message: 'Subject and body copied to clipboard.' });
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(emailBody);
    showToast({ type: 'success', title: 'Copied Email Body', message: 'Email body copied.' });
  };

  const handleCopySubject = () => {
    const activeSubject = subjectLines[selectedSubjectIndex] || '';
    navigator.clipboard.writeText(activeSubject);
    showToast({ type: 'success', title: 'Copied Subject', message: 'Subject line copied.' });
  };

  const handleOpenMailClient = () => {
    const activeSubject = encodeURIComponent(subjectLines[selectedSubjectIndex] || '');
    const encodedBody = encodeURIComponent(emailBody);
    window.location.href = `mailto:?subject=${activeSubject}&body=${encodedBody}`;
  };

  const handleDownload = () => {
    const activeSubject = subjectLines[selectedSubjectIndex] || 'Email';
    const content = `Subject: ${activeSubject}\n\n${emailBody}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, 'toolboxx_generated_email.txt');
    showToast({ type: 'success', title: 'Downloaded', message: 'Saved email draft as text file.' });
  };

  const handleClear = () => {
    setPurpose('');
    setRecipient('');
    setTalkingPoints('');
    setCta('');
    setEmailBody('');
    setSubjectLines([]);
  };

  return (
    <div className="space-y-6">
      {/* Gemini Banner */}
      <GeminiBanner />

      {/* Preset Quick Selectors */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
          Quick Email Templates & Scenarios
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {EMAIL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="p-3 rounded-2xl border text-left transition-all hover:opacity-100 opacity-80 cursor-pointer flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--c-surface)',
                borderColor: 'var(--c-border)',
              }}
            >
              <span className="font-bold text-xs" style={{ color: 'var(--c-text)' }}>
                {preset.name}
              </span>
              <span className="text-[10px] line-clamp-1 mt-1" style={{ color: 'var(--c-muted)' }}>
                {preset.tone} • {preset.recipient}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Email Configuration Form */}
        <div
          className="lg:col-span-6 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 shadow-sm"
          style={{
            backgroundColor: 'var(--c-surface)',
            borderColor: 'var(--c-border)',
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--c-text)' }}>
                <Mail className="w-3.5 h-3.5" style={{ color: 'var(--c-gold)' }} />
                Email Builder Parameters
              </span>

              <button
                onClick={handleClear}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Purpose Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
                Core Purpose / Objective
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g., Request a 15-minute introductory meeting, Project timeline update"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--c-bg)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-text)',
                }}
              />
            </div>

            {/* Recipient & Tone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
                  Recipient Name & Title
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g., Sarah Jenkins (VP Marketing)"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--c-bg)',
                    borderColor: 'var(--c-border)',
                    color: 'var(--c-text)',
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
                  Tone of Voice
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as EmailTone)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--c-bg)',
                    borderColor: 'var(--c-border)',
                    color: 'var(--c-text)',
                  }}
                >
                  {(['Formal', 'Casual', 'Urgent', 'Follow-up', 'Pitch'] as EmailTone[]).map((t) => (
                    <option key={t} value={t} style={{ backgroundColor: 'var(--c-surface)', color: 'var(--c-text)' }}>
                      {t} Tone
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Talking Points */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
                Key Talking Points (One per line)
              </label>
              <textarea
                rows={4}
                value={talkingPoints}
                onChange={(e) => setTalkingPoints(e.target.value)}
                placeholder="• Met at the conference last week&#10;• Would love to demo our new API&#10;• Free pilot program available"
                className="w-full p-3.5 rounded-xl border text-sm leading-relaxed focus:outline-none transition-colors resize-y font-sans"
                style={{
                  backgroundColor: 'var(--c-bg)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-text)',
                }}
              />
            </div>

            {/* Call to Action & Sign-off */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
                  Call to Action (CTA)
                </label>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="e.g., Let's schedule a 15-min call"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--c-bg)',
                    borderColor: 'var(--c-border)',
                    color: 'var(--c-text)',
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
                  Sender Name & Title
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--c-bg)',
                    borderColor: 'var(--c-border)',
                    color: 'var(--c-text)',
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !purpose.trim()}
            className="w-full py-3 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 disabled:opacity-40 cursor-pointer mt-4"
            style={{
              backgroundColor: 'var(--c-gold)',
              color: 'var(--c-bg)',
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Drafting Professional Email...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate Subject & Email Body
              </>
            )}
          </button>
        </div>

        {/* Right Column: Output Email Workspace */}
        <div
          className="lg:col-span-6 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 shadow-sm"
          style={{
            backgroundColor: 'var(--c-surface)',
            borderColor: 'var(--c-border)',
          }}
        >
          <div className="space-y-4">
            {/* Header & Quick Action Buttons */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--c-text)' }}>
                <Send className="w-3.5 h-3.5" style={{ color: 'var(--c-gold)' }} />
                Generated Output
              </span>

              {emailBody && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleOpenMailClient}
                    className="p-2 rounded-xl border text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                    title="Open in default Email Client"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-sky-400" /> Mail App
                  </button>
                  <button
                    onClick={handleCopyFullEmail}
                    className="p-2 rounded-xl border text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                    title="Copy full email (Subject + Body)"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Full
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-xl border text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                    title="Download Text File"
                  >
                    <Download className="w-3.5 h-3.5" /> .TXT
                  </button>
                </div>
              )}
            </div>

            {/* Subject Line Options Picker */}
            {subjectLines.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
                    Subject Line Variations (Select One)
                  </label>
                  <button
                    onClick={handleCopySubject}
                    className="text-[11px] hover:underline cursor-pointer"
                    style={{ color: 'var(--c-gold)' }}
                  >
                    Copy Selected Subject
                  </button>
                </div>

                <div className="space-y-1.5">
                  {subjectLines.map((subj, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedSubjectIndex(idx)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        selectedSubjectIndex === idx ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: selectedSubjectIndex === idx ? 'var(--c-card)' : 'var(--c-bg)',
                        borderColor: selectedSubjectIndex === idx ? 'var(--c-gold)' : 'var(--c-border)',
                        color: selectedSubjectIndex === idx ? 'var(--c-text)' : 'var(--c-muted)',
                      }}
                    >
                      <span className="line-clamp-1 flex-1 font-mono">{subj}</span>
                      {selectedSubjectIndex === idx && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email Body Output */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>
                  Email Body
                </label>
                {emailBody && (
                  <button
                    onClick={handleCopyBody}
                    className="text-[11px] hover:underline cursor-pointer"
                    style={{ color: 'var(--c-gold)' }}
                  >
                    Copy Body Only
                  </button>
                )}
              </div>

              {emailBody ? (
                <textarea
                  rows={10}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full p-4 rounded-2xl border text-sm leading-relaxed focus:outline-none transition-colors resize-y font-sans"
                  style={{
                    backgroundColor: 'var(--c-bg)',
                    borderColor: 'var(--c-border)',
                    color: 'var(--c-text)',
                  }}
                />
              ) : (
                <div
                  className="w-full h-64 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center p-6 space-y-2"
                  style={{
                    backgroundColor: 'var(--c-bg)',
                    borderColor: 'var(--c-border)',
                    color: 'var(--c-subtle)',
                  }}
                >
                  <Mail className="w-8 h-8 opacity-40 mb-1" />
                  <p className="text-sm font-semibold" style={{ color: 'var(--c-muted)' }}>
                    No email drafted yet
                  </p>
                  <p className="text-xs max-w-xs leading-relaxed">
                    Fill out the parameters on the left or select a template preset, then click <strong>Generate Subject & Email Body</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>

          {emailBody && (
            <div className="pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Formatted for {tone} delivery
              </span>
              <span>{bodyStats.words} words • ~{bodyStats.readingTimeMinutes} min read</span>
            </div>
          )}
        </div>
      </div>

      {/* Post Completion Recommendations */}
      <PostCompletionRecommendations currentToolId="ai-email-writer" onReset={handleClear} />
    </div>
  );
};
