import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Share2,
  TrendingUp,
  ShieldCheck,
  Download,
  Trash2,
  Clock,
  ExternalLink,
  MessageCircle,
  Send,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Globe,
  PieChart,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { SeoHead } from '../components/common/SeoHead';
import { SocialShareButtons } from '../components/common/SocialShareButtons';
import { showToast } from '../components/common/Toast';

interface ShareRecord {
  platform: string;
  url: string;
  timestamp: string;
}

export const SocialAnalyticsPage: React.FC = () => {
  const [shareRecords, setShareRecords] = useState<ShareRecord[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Load from localStorage
  const loadAnalytics = () => {
    try {
      const data = JSON.parse(localStorage.getItem('toolboxx_social_shares') || '[]');
      setShareRecords(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch {
      setShareRecords([]);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Compute Platform Counts
  const platformStats = useMemo(() => {
    const counts: Record<string, number> = {
      whatsapp: 0,
      twitter: 0,
      linkedin: 0,
      telegram: 0,
      facebook: 0,
      reddit: 0,
      copy: 0,
      native: 0,
    };

    shareRecords.forEach((r) => {
      const p = (r.platform || 'copy').toLowerCase();
      if (counts[p] !== undefined) {
        counts[p] += 1;
      } else {
        counts[p] = (counts[p] || 0) + 1;
      }
    });

    return counts;
  }, [shareRecords]);

  const totalShares = shareRecords.length;

  // Most active platform
  const topPlatform = useMemo(() => {
    let top = 'copy';
    let max = 0;
    Object.entries(platformStats).forEach(([platform, count]) => {
      if (count > max) {
        max = count;
        top = platform;
      }
    });
    return { platform: top, count: max };
  }, [platformStats]);

  // Page / Tool popularity breakdown
  const popularUrls = useMemo(() => {
    const counts: Record<string, number> = {};
    shareRecords.forEach((r) => {
      try {
        const path = new URL(r.url).pathname || r.url;
        counts[path] = (counts[path] || 0) + 1;
      } catch {
        counts[r.url] = (counts[r.url] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [shareRecords]);

  // Simulate a Share action for interactive demonstration
  const handleSimulateShare = (platform: string) => {
    try {
      const existing = JSON.parse(localStorage.getItem('toolboxx_social_shares') || '[]');
      const newRecord = {
        platform,
        url: window.location.origin + '/image-compressor',
        timestamp: new Date().toISOString(),
      };
      existing.unshift(newRecord);
      localStorage.setItem('toolboxx_social_shares', JSON.stringify(existing.slice(0, 100)));
      loadAnalytics();
      showToast({ type: 'success', title: `Simulated share on ${platform}!` });
    } catch {}
  };

  // Export Analytics JSON
  const handleExportData = () => {
    const dataStr = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        totalShares,
        platformStats,
        shares: shareRecords,
      },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolboxx_analytics_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ type: 'success', title: 'Exported privacy analytics JSON!' });
  };

  // Clear analytics
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear your on-device share history?')) {
      localStorage.removeItem('toolboxx_social_shares');
      setShareRecords([]);
      showToast({ type: 'success', title: 'Cleared on-device history' });
    }
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      showToast({ type: 'success', title: 'Copied URL!' });
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {}
  };
  const platformsDisplay = [
    { key: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'bg-emerald-500' },
    { key: 'twitter', name: 'X (Twitter)', icon: Share2, color: 'bg-sky-400' },
    { key: 'linkedin', name: 'LinkedIn', icon: ExternalLink, color: 'bg-blue-600' },
    { key: 'telegram', name: 'Telegram', icon: Send, color: 'bg-sky-500' },
    { key: 'facebook', name: 'Facebook', icon: Share2, color: 'bg-blue-700' },
    { key: 'copy', name: 'Clipboard Copy', icon: Copy, color: 'bg-[var(--c-gold)]' },
  ];

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-28 transition-colors">
      <SeoHead
        title="Privacy-First Social Analytics ? On-Device Insights"
        description="View your local on-device sharing stats, tool executions, and platform reach without cookies, tracking pixels, or third-party cloud trackers."
        canonicalPath="/social-analytics"
      />

      {/* Hero Header */}
      <section className="pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-[var(--c-border)] bg-[var(--c-surface)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-mono text-[var(--c-gold)] uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% On-Device Privacy Architecture</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--c-text)] leading-tight">
                Social & Tool <br className="hidden sm:inline" />
                <span className="text-[var(--c-gold)]">Privacy Analytics</span> Dashboard.
              </h1>

              <p className="text-base sm:text-lg text-[var(--c-muted)] leading-relaxed font-normal">
                Real-time insights on your shared utilities and workflows computed directly from your browser's local sandbox storage with zero telemetry and zero cookies.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={loadAnalytics}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-semibold text-[var(--c-text)] hover:border-[var(--c-gold)] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExportData}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-semibold text-[var(--c-text)] hover:border-[var(--c-gold)] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={handleClearData}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-950/20 text-xs font-semibold text-red-400 hover:border-red-500 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-12">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Shares Recorded"
            value={totalShares}
            subValue="On-device lifetime shares"
            badge="Client Local"
            badgeType="success"
            icon={<Share2 className="w-5 h-5 text-[var(--c-gold)]" />}
          />
          <StatCard
            label="Top Sharing Channel"
            value={topPlatform.platform.toUpperCase()}
            subValue={`${topPlatform.count} events logged`}
            badge="Dominant"
            badgeType="neutral"
            icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          />
          <StatCard
            label="Privacy Tracking Status"
            value="0 Cookies"
            subValue="100% localStorage sandbox"
            badge="Compliant"
            badgeType="success"
            icon={<ShieldCheck className="w-5 h-5 text-blue-400" />}
          />
          <StatCard
            label="Supported Platforms"
            value="6 Channels"
            subValue="WhatsApp, X, LinkedIn, Telegram, etc."
            icon={<Globe className="w-5 h-5 text-purple-400" />}
          />
        </div>

        {/* Platform Breakdown & Popular URLs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Platform Share Progress (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--c-text)] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[var(--c-gold)]" />
                <span>Share Distribution by Platform</span>
              </h3>
              <span className="text-xs font-mono text-[var(--c-subtle)]">{totalShares} Total</span>
            </div>

            <div className="space-y-4">
              {platformsDisplay.map((p) => {
                const count = platformStats[p.key] || 0;
                const percentage = totalShares > 0 ? Math.round((count / totalShares) * 100) : 0;
                const Icon = p.icon;
                return (
                  <div key={p.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-semibold text-[var(--c-text)]">
                        <Icon className="w-3.5 h-3.5 text-[var(--c-gold)]" />
                        <span>{p.name}</span>
                      </span>
                      <span className="font-mono text-[var(--c-muted)]">
                        {count} shares ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[var(--c-surface)] overflow-hidden border border-[var(--c-border)]">
                      <div
                        className={`h-full ${p.color} transition-all duration-500 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Simulation Tester */}
            <div className="pt-6 border-t border-[var(--c-border)] space-y-3">
              <div className="text-xs font-mono font-bold uppercase text-[var(--c-gold)]">
                Test / Simulate Share Event
              </div>
              <p className="text-xs text-[var(--c-muted)]">
                Click any channel below to simulate a share event and watch live on-device stats update in real time:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {['whatsapp', 'twitter', 'linkedin', 'telegram', 'copy'].map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSimulateShare(p)}
                    className="px-3 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] hover:border-[var(--c-gold)] text-xs font-medium text-[var(--c-text)] transition-colors cursor-pointer capitalize"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Tools / Leaderboard (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-[var(--c-text)] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--c-gold)]" />
              <span>Most Shared Pages & Tools</span>
            </h3>

            {popularUrls.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--c-subtle)] space-y-2">
                <Share2 className="w-8 h-8 mx-auto text-[var(--c-muted)] opacity-50" />
                <p>No share events recorded yet.</p>
                <p>Use the simulator above or share any tool to generate stats!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {popularUrls.map(([path, count], idx) => (
                  <div
                    key={path}
                    className="p-3.5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="w-6 h-6 rounded-lg bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-mono font-semibold text-[var(--c-text)] truncate">
                        {path}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] shrink-0">
                      {count} {count === 1 ? 'share' : 'shares'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Privacy Architecture Notice */}
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-200 text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Cloud Tracking Guarantee</span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                All metrics on this page are stored strictly in your local browser's <code className="font-mono bg-black/40 px-1 py-0.5 rounded">localStorage</code>. No IP addresses, device fingerprints, or browsing history are ever transmitted to any remote analytics server.
              </p>
            </div>
          </div>
        </div>

        {/* Live Recent Share Log Timeline */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--c-gold)]" />
              <h2 className="text-xl font-bold text-[var(--c-text)]">
                Recent On-Device Share Activity Feed
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--c-subtle)]">
              Last {shareRecords.slice(0, 10).length} records
            </span>
          </div>

          {shareRecords.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-[var(--c-border)] bg-[var(--c-surface)] text-xs text-[var(--c-subtle)]">
              Your share timeline is currently empty. Click the "+ Share" simulator buttons above to test logging!
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--c-border)] text-[var(--c-subtle)] font-mono uppercase">
                    <th className="py-3.5 px-5">Platform</th>
                    <th className="py-3.5 px-5">Shared URL</th>
                    <th className="py-3.5 px-5">Timestamp</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--c-border)]/60 text-[var(--c-muted)]">
                  {shareRecords.slice(0, 15).map((r, i) => (
                    <tr key={i} className="hover:bg-[var(--c-surface)] transition-colors">
                      <td className="py-3.5 px-5 font-bold capitalize text-[var(--c-gold)]">
                        {r.platform}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[var(--c-text)] max-w-xs truncate">
                        {r.url}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[var(--c-subtle)]">
                        {new Date(r.timestamp).toLocaleTimeString()} ? {new Date(r.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleCopy(r.url)}
                          className="px-2.5 py-1 rounded-md bg-[var(--c-surface)] border border-[var(--c-border)] hover:border-[var(--c-gold)] text-[var(--c-text)] transition-colors cursor-pointer text-[11px]"
                        >
                          {copiedUrl === r.url ? 'Copied' : 'Copy URL'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Global Share Banner */}
        <SocialShareButtons
          variant="banner"
          title="ToolBoxX Privacy Analytics ? 100% On-Device Insights"
          description="View private analytics without trackers or cloud servers."
        />
      </div>
    </div>
  );
};
