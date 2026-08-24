import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { showToast } from './Toast';

interface SocialShareButtonsProps {
  title?: string;
  url?: string;
  description?: string;
  variant?: 'compact' | 'expanded' | 'banner';
  className?: string;
  resultSummary?: string;
}

export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  title = 'ToolBoxX — Free, Private Online Tools',
  url,
  description = 'Process PDFs, images, and files 100% locally in your browser with zero cloud storage.',
  variant = 'compact',
  className = '',
  resultSummary,
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://ai-studio-applet-webapp-f4409.web.app');
  const fullText = resultSummary ? `${resultSummary} via @ToolBoxX: ${shareUrl}` : `${title} — ${description} ${shareUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast({ type: 'success', title: 'Link copied to clipboard!' });
      setTimeout(() => setCopied(false), 2000);
      recordShare('copy');
    } catch {
      showToast({ type: 'error', title: 'Failed to copy link' });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: resultSummary || description,
          url: shareUrl,
        });
        recordShare('native');
      } catch (err) {
        // User dismissed
      }
    } else {
      handleCopy();
    }
  };

  const recordShare = (platform: string) => {
    try {
      const existing = JSON.parse(localStorage.getItem('toolboxx_social_shares') || '[]');
      existing.unshift({ platform, url: shareUrl, timestamp: new Date().toISOString() });
      localStorage.setItem('toolboxx_social_shares', JSON.stringify(existing.slice(0, 100)));
    } catch {}
  };

  const openShare = (platformUrl: string, platformName: string) => {
    window.open(platformUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
    recordShare(platformName);
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(fullText);

  const platforms = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'hover:bg-emerald-600 hover:text-white',
      textColor: 'text-emerald-500',
      action: () => openShare(`https://api.whatsapp.com/send?text=${encodedText}`, 'whatsapp'),
    },
    {
      name: 'X (Twitter)',
      icon: Share2,
      color: 'hover:bg-sky-500 hover:text-white',
      textColor: 'text-sky-400',
      action: () => openShare(`https://twitter.com/intent/tweet?text=${encodeURIComponent(resultSummary || title)}&url=${encodedUrl}`, 'twitter'),
    },
    {
      name: 'LinkedIn',
      icon: ExternalLink,
      color: 'hover:bg-blue-600 hover:text-white',
      textColor: 'text-blue-500',
      action: () => openShare(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, 'linkedin'),
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'hover:bg-sky-600 hover:text-white',
      textColor: 'text-sky-400',
      action: () => openShare(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, 'telegram'),
    },
    {
      name: 'Facebook',
      icon: Share2,
      color: 'hover:bg-blue-700 hover:text-white',
      textColor: 'text-blue-600',
      action: () => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, 'facebook'),
    },
    {
      name: 'Reddit',
      icon: ExternalLink,
      color: 'hover:bg-orange-600 hover:text-white',
      textColor: 'text-orange-500',
      action: () => openShare(`https://reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(title)}`, 'reddit'),
    },
  ];

  if (variant === 'banner') {
    return (
      <div className={`p-4 sm:p-5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] space-y-3 ${className}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--c-text)]">
            <Share2 className="w-4 h-4 text-[var(--c-gold)]" />
            <span>Found this useful? Share with your friends or team</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--c-card)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap pt-1">
          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.name}
                onClick={p.action}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-medium text-[var(--c-muted)] transition-all cursor-pointer ${p.color}`}
              >
                <Icon className={`w-3.5 h-3.5 ${p.textColor}`} />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <span className="text-xs font-semibold text-[var(--c-muted)] mr-1 flex items-center gap-1">
        <Share2 className="w-3.5 h-3.5 text-[var(--c-gold)]" />
        <span>Share:</span>
      </span>

      {platforms.slice(0, 4).map((p) => {
        const Icon = p.icon;
        return (
          <button
            key={p.name}
            onClick={p.action}
            title={`Share on ${p.name}`}
            className={`p-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)] transition-all cursor-pointer ${p.color}`}
          >
            <Icon className={`w-4 h-4 ${p.textColor}`} />
          </button>
        );
      })}

      <button
        onClick={handleCopy}
        title="Copy Link"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-medium text-[var(--c-muted)] hover:text-[var(--c-text)] hover:border-[var(--c-border-hover)] transition-all cursor-pointer"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>

      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          onClick={handleNativeShare}
          title="More Share Options"
          className="p-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)] transition-all cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-[var(--c-gold)]" />
        </button>
      )}
    </div>
  );
};
