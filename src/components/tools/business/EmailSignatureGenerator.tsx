import React, { useState } from 'react';
import {
  Mail,
  Copy,
  Download,
  CheckCircle2,
  Phone,
  Globe,
  MapPin,
  Sparkles,
  Sliders,
  Eye,
  FileCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

type SignatureTemplate = 'modern' | 'compact' | 'stacked' | 'corporate' | 'minimal';

export const EmailSignatureGenerator: React.FC = () => {
  // Personal Info
  const [name, setName] = useState<string>('Sarah Jenkins');
  const [pronouns, setPronouns] = useState<string>('she/her');
  const [title, setTitle] = useState<string>('Head of Product & Growth');
  const [department, setDepartment] = useState<string>('Product Design');
  const [company, setCompany] = useState<string>('ToolBoxX Technologies');

  // Contact Info
  const [email, setEmail] = useState<string>('sarah@toolboxx.dev');
  const [phone, setPhone] = useState<string>('+1 (555) 234-5678');
  const [mobile, setMobile] = useState<string>('+1 (555) 876-5432');
  const [website, setWebsite] = useState<string>('https://toolboxx.dev');
  const [address, setAddress] = useState<string>('500 Howard St, San Francisco, CA');

  // Visual Assets
  const [avatarUrl, setAvatarUrl] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces&q=80'
  );
  const [avatarShape, setAvatarShape] = useState<'circle' | 'rounded' | 'square'>('circle');
  const [avatarSize, setAvatarSize] = useState<number>(80);

  // Social Links
  const [linkedin, setLinkedin] = useState<string>('https://linkedin.com/in/sarahjenkins');
  const [twitter, setTwitter] = useState<string>('https://twitter.com/sarah_j');
  const [github, setGithub] = useState<string>('https://github.com/sarahjenkins');
  const [calendly, setCalendly] = useState<string>('https://calendly.com/sarah-toolboxx');

  // CTA & Disclaimer
  const [ctaText, setCtaText] = useState<string>('📅 Book a 15-min product demo');
  const [ctaLink, setCtaLink] = useState<string>('https://calendly.com/sarah-toolboxx');
  const [disclaimer, setDisclaimer] = useState<string>(
    'The content of this email is confidential and intended solely for the recipient.'
  );

  // Styling
  const [template, setTemplate] = useState<SignatureTemplate>('modern');
  const [accentColor, setAccentColor] = useState<string>('#B79B70');
  const [textColor, setTextColor] = useState<string>('#1f2937');
  const [fontFamily, setFontFamily] = useState<string>('Arial, Helvetica, sans-serif');

  // Social Icons CDN Links for reliable email client rendering
  const SOCIAL_ICONS = {
    linkedin: 'https://cdn-icons-png.flaticon.com/512/3536/3536505.png',
    twitter: 'https://cdn-icons-png.flaticon.com/512/5969/5969020.png',
    github: 'https://cdn-icons-png.flaticon.com/512/733/733553.png',
    calendly: 'https://cdn-icons-png.flaticon.com/512/747/747310.png',
  };

  const getBorderRadius = () => {
    if (avatarShape === 'circle') return '50%';
    if (avatarShape === 'rounded') return '12px';
    return '0px';
  };

  // Generate Email-Safe HTML Signature (using <table> structure for universal Outlook/Gmail/Apple Mail compatibility)
  const generateSignatureHtml = (): string => {
    const radius = getBorderRadius();

    let socialLinksHtml = '';
    if (linkedin) socialLinksHtml += `<a href="${linkedin}" style="margin-right: 6px; display: inline-block;"><img src="${SOCIAL_ICONS.linkedin}" width="18" height="18" alt="LinkedIn" style="display: block; border: 0;" /></a>`;
    if (twitter) socialLinksHtml += `<a href="${twitter}" style="margin-right: 6px; display: inline-block;"><img src="${SOCIAL_ICONS.twitter}" width="18" height="18" alt="Twitter" style="display: block; border: 0;" /></a>`;
    if (github) socialLinksHtml += `<a href="${github}" style="margin-right: 6px; display: inline-block;"><img src="${SOCIAL_ICONS.github}" width="18" height="18" alt="GitHub" style="display: block; border: 0;" /></a>`;
    if (calendly) socialLinksHtml += `<a href="${calendly}" style="margin-right: 6px; display: inline-block;"><img src="${SOCIAL_ICONS.calendly}" width="18" height="18" alt="Calendar" style="display: block; border: 0;" /></a>`;

    if (template === 'modern') {
      return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: ${fontFamily}; color: ${textColor}; line-height: 1.4; max-width: 520px;">
  <tr>
    ${avatarUrl ? `
    <td valign="top" style="padding-right: 16px;">
      <img src="${avatarUrl}" width="${avatarSize}" height="${avatarSize}" style="border-radius: ${radius}; display: block; object-fit: cover;" alt="${name}" />
    </td>
    <td width="1" style="background-color: ${accentColor}; padding: 0;"></td>
    ` : ''}
    <td valign="top" style="padding-left: ${avatarUrl ? '16px' : '0'};">
      <div style="font-size: 16px; font-weight: bold; color: ${textColor};">
        ${name} ${pronouns ? `<span style="font-size: 11px; font-weight: normal; color: #6b7280;">(${pronouns})</span>` : ''}
      </div>
      <div style="font-size: 13px; font-weight: 600; color: ${accentColor}; margin-top: 2px;">
        ${title}${department ? ` · ${department}` : ''}
      </div>
      <div style="font-size: 13px; font-weight: bold; color: ${textColor}; margin-bottom: 8px;">
        ${company}
      </div>
      <div style="font-size: 12px; color: #4b5563; line-height: 1.6;">
        ${email ? `<div><span style="color: ${accentColor}; font-weight: bold;">E:</span> <a href="mailto:${email}" style="color: ${textColor}; text-decoration: none;">${email}</a></div>` : ''}
        ${phone ? `<div><span style="color: ${accentColor}; font-weight: bold;">P:</span> <a href="tel:${phone}" style="color: ${textColor}; text-decoration: none;">${phone}</a></div>` : ''}
        ${website ? `<div><span style="color: ${accentColor}; font-weight: bold;">W:</span> <a href="${website}" style="color: ${accentColor}; font-weight: 600; text-decoration: none;">${website.replace(/^https?:\/\//, '')}</a></div>` : ''}
        ${address ? `<div style="color: #6b7280; font-size: 11px; margin-top: 2px;">${address}</div>` : ''}
      </div>
      ${socialLinksHtml ? `<div style="margin-top: 10px; padding-top: 6px;">${socialLinksHtml}</div>` : ''}
      ${ctaText && ctaLink ? `<div style="margin-top: 10px;"><a href="${ctaLink}" style="display: inline-block; padding: 5px 12px; font-size: 11px; font-weight: bold; color: #ffffff; background-color: ${accentColor}; border-radius: 6px; text-decoration: none;">${ctaText}</a></div>` : ''}
    </td>
  </tr>
  ${disclaimer ? `<tr><td colspan="3" style="padding-top: 12px; font-size: 10px; color: #9ca3af; line-height: 1.3;">${disclaimer}</td></tr>` : ''}
</table>`;
    }

    if (template === 'compact') {
      return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: ${fontFamily}; color: ${textColor}; line-height: 1.4; border-left: 3px solid ${accentColor}; padding-left: 12px; max-width: 480px;">
  <tr>
    <td>
      <div style="font-size: 15px; font-weight: bold; color: ${textColor};">${name}</div>
      <div style="font-size: 12px; color: ${accentColor}; font-weight: 600;">${title} | ${company}</div>
      <div style="font-size: 11px; color: #4b5563; margin-top: 6px;">
        ${email ? `<a href="mailto:${email}" style="color: ${textColor}; text-decoration: none;">${email}</a> · ` : ''}
        ${phone ? `<a href="tel:${phone}" style="color: ${textColor}; text-decoration: none;">${phone}</a> · ` : ''}
        ${website ? `<a href="${website}" style="color: ${accentColor}; text-decoration: none;">${website.replace(/^https?:\/\//, '')}</a>` : ''}
      </div>
      ${socialLinksHtml ? `<div style="margin-top: 8px;">${socialLinksHtml}</div>` : ''}
    </td>
  </tr>
</table>`;
    }

    // Default Fallback
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: ${fontFamily}; color: ${textColor}; line-height: 1.4; max-width: 500px;">
  <tr>
    <td valign="middle" style="padding-right: 12px;">
      <img src="${avatarUrl}" width="64" height="64" style="border-radius: ${radius}; display: block;" alt="${name}" />
    </td>
    <td valign="middle">
      <div style="font-size: 15px; font-weight: bold; color: ${textColor};">${name}</div>
      <div style="font-size: 12px; color: ${accentColor}; font-weight: bold;">${title} · ${company}</div>
      <div style="font-size: 11px; color: #4b5563; margin-top: 4px;">
        ${email ? `<a href="mailto:${email}" style="color: ${textColor}; text-decoration: none;">${email}</a> | ` : ''}
        ${phone ? `<a href="tel:${phone}" style="color: ${textColor}; text-decoration: none;">${phone}</a>` : ''}
      </div>
      ${socialLinksHtml ? `<div style="margin-top: 6px;">${socialLinksHtml}</div>` : ''}
    </td>
  </tr>
</table>`;
  };

  // Copy Formatted Rich HTML (Direct paste into Gmail / Outlook / Apple Mail)
  const handleCopyRichHtml = async () => {
    const html = generateSignatureHtml();
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([html], { type: 'text/plain' });
        await navigator.clipboard.write([
          new window.ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText,
          }),
        ]);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        showToast({
          type: 'success',
          title: 'Signature Copied!',
          message: 'Formatted signature copied to clipboard. Press Ctrl+V (or Cmd+V) directly in Gmail/Outlook settings!',
        });
      } else {
        await navigator.clipboard.writeText(html);
        showToast({ type: 'success', title: 'HTML Copied', message: 'Signature code copied to clipboard.' });
      }
    } catch {
      // Fallback
      await navigator.clipboard.writeText(html);
      showToast({ type: 'info', title: 'Code Copied', message: 'Signature HTML code copied to clipboard.' });
    }
  };

  const handleDownloadHtml = () => {
    const html = generateSignatureHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    downloadBlob(blob, `email_signature_${name.toLowerCase().replace(/\s+/g, '_')}.html`);
    showToast({ type: 'success', title: 'Downloaded', message: 'Saved signature HTML file.' });
  };

  const TEMPLATES: { id: SignatureTemplate; name: string; desc: string }[] = [
    { id: 'modern', name: 'Modern Horizontal', desc: 'Avatar left, vertical divider line, contact & socials' },
    { id: 'compact', name: 'Clean Left Border', desc: 'Minimalist left accent border and inline details' },
    { id: 'corporate', name: 'Corporate Balanced', desc: 'Symmetrical layout with clean company branding' },
  ];

  return (
    <div className="space-y-8">
      {/* Template Chooser Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[var(--c-surface)] p-2.5 rounded-2xl border border-[var(--c-border)]">
        {TEMPLATES.map((t) => {
          const isActive = template === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplate(t.id)}
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

      {/* Main Grid: Form Inputs on Left, Live Outlook/Gmail Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Info */}
        <div className="lg:col-span-6 space-y-6">
          {/* Personal Details */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[var(--c-gold)]" />
              Personal & Professional Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Pronouns (optional)</label>
                <input
                  type="text"
                  value={pronouns}
                  onChange={(e) => setPronouns(e.target.value)}
                  placeholder="they/them, she/her, he/him"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <Phone className="w-4 h-4 text-[var(--c-gold)]" />
              Contact & Location
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Website URL</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Office Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>
            </div>
          </div>

          {/* Photo & Custom Styling */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--c-gold)]" />
              Photo, Shape & Accent Color
            </h4>

            <div>
              <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Profile Photo / Logo URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1.5">Avatar Shape</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['circle', 'rounded', 'square'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAvatarShape(s)}
                      className={`py-1 text-xs capitalize font-semibold rounded-lg border cursor-pointer ${
                        avatarShape === s
                          ? 'bg-[var(--c-text)] text-[var(--c-bg)] border-transparent'
                          : 'bg-[var(--c-card)] border-[var(--c-border)] text-[var(--c-muted)]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1.5">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-24 px-2 py-1 text-xs font-mono rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Profiles & CTA */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--c-gold)]" />
              Social Media & Call-To-Action Button
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Twitter / X URL</label>
                <input
                  type="url"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="📅 Schedule a call"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">CTA Destination URL</label>
                <input
                  type="url"
                  value={ctaLink}
                  onChange={(e) => setCtaLink(e.target.value)}
                  placeholder="https://calendly.com/your-name"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Simulated Mail Client Preview */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
                <Eye className="w-4 h-4 text-[var(--c-gold)]" />
                Live Email Client Preview
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Universal HTML
              </span>
            </div>

            {/* Email Client Mockup Window */}
            <div className="rounded-2xl border border-slate-300 dark:border-zinc-700 bg-white text-slate-900 shadow-xl overflow-hidden">
              {/* Window Bar */}
              <div className="bg-slate-100 dark:bg-zinc-800 px-4 py-2.5 border-b border-slate-200 dark:border-zinc-700 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 ml-2">
                  New Message – Re: ToolBoxX Project Update
                </span>
              </div>

              {/* Email Body Mockup */}
              <div className="p-6 space-y-4">
                <div className="text-xs text-slate-500 border-b border-slate-100 pb-3">
                  <div><strong>To:</strong> client@example.com</div>
                  <div><strong>Subject:</strong> Re: ToolBoxX Project Update</div>
                </div>

                <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
                  <p>Hi team,</p>
                  <p>
                    Please find the latest design assets attached. Looking forward to our call tomorrow morning.
                  </p>
                  <p>Best regards,</p>
                </div>

                {/* Rendered Signature Box */}
                <div
                  className="pt-4 border-t border-slate-200/80 overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: generateSignatureHtml() }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleCopyRichHtml}
                className="w-full py-3.5 px-4 rounded-2xl bg-[var(--c-text)] hover:opacity-90 text-[var(--c-bg)] font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                1-Click Copy HTML Signature (Paste in Gmail / Outlook)
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generateSignatureHtml());
                    showToast({ type: 'success', title: 'Source Code Copied', message: 'Raw HTML copied to clipboard.' });
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-[var(--c-gold)]" />
                  Copy Raw HTML
                </button>

                <button
                  type="button"
                  onClick={handleDownloadHtml}
                  className="py-2.5 px-3 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[var(--c-gold)]" />
                  Download .html
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations currentToolId="email-signature-generator" />
    </div>
  );
};

export default EmailSignatureGenerator;
