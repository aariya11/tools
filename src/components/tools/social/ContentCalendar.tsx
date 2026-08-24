import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Download,
  Upload,
  Search,
  Filter,
  Layers,
  Sparkles,
  Clock,
  Send,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  Share2,
  Grid,
  List,
  Kanban,
  FileSpreadsheet,
  FileJson,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StatCard } from '../../common/StatCard';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { SocialShareButtons } from '../../common/SocialShareButtons';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

export type CalendarPlatform = 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'youtube' | 'facebook' | 'pinterest' | 'reddit' | 'threads';
export type PostStatus = 'draft' | 'review' | 'ready' | 'scheduled' | 'published';
export type PostPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ContentPillar = 'educational' | 'showcase' | 'behind_scenes' | 'meme' | 'case_study';
export type ViewMode = 'month' | 'week' | 'kanban' | 'list';

export interface CalendarPost {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  platform: CalendarPlatform;
  toolTopic: string;
  title: string;
  caption: string;
  hashtags: string[];
  mediaType: 'image' | 'carousel' | 'video' | 'text' | 'link';
  status: PostStatus;
  priority: PostPriority;
  pillar: ContentPillar;
  notes?: string;
}

const INITIAL_SAMPLE_POSTS: CalendarPost[] = [
  {
    id: 'post-1',
    date: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
    time: '10:00',
    platform: 'twitter',
    toolTopic: 'PDF Compressor',
    title: 'Stop paying Adobe $20/mo to compress PDFs 🧵',
    caption: '🧵 Stop uploading private client PDFs to random cloud websites. ToolBoxX PDF Compressor runs 100% in your browser using WebAssembly. Up to 90% size reduction with zero server uploads: https://toolboxx.dev/pdf-compressor',
    hashtags: ['#webdev', '#freepdf', '#privacy', '#devtools'],
    mediaType: 'video',
    status: 'scheduled',
    priority: 'high',
    pillar: 'showcase',
  },
  {
    id: 'post-2',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '14:30',
    platform: 'linkedin',
    toolTopic: '100% Client-Side Architecture',
    title: 'Why we built web tools with ZERO cloud storage',
    caption: 'Earlier this year, we analyzed 50+ online converter sites. 94% of them upload your files to remote servers without explicit retention policies.\n\nWe built ToolBoxX to prove that high-performance PDF manipulation, image upscaling, and developer utilities can run 100% locally in browser memory.\n\nNo subscriptions. No file tracking. Pure client-side execution.',
    hashtags: ['#SoftwareEngineering', '#DataPrivacy', '#WebAssembly', '#TechTrends'],
    mediaType: 'carousel',
    status: 'ready',
    priority: 'urgent',
    pillar: 'behind_scenes',
  },
  {
    id: 'post-3',
    date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    time: '18:00',
    platform: 'instagram',
    toolTopic: 'Background Remover',
    title: 'Cut out any product photo in 1 click ⚡',
    caption: 'No Photoshop needed! Drop any photo and watch AI remove the background in under 2 seconds. Export crisp transparent PNGs for your eCommerce store or thumbnails.\n\n👉 Try it free: link in bio!',
    hashtags: ['#designhacks', '#ecommercing', '#graphicdesign', '#creativetools', '#toolboxx'],
    mediaType: 'carousel',
    status: 'ready',
    priority: 'medium',
    pillar: 'educational',
  },
  {
    id: 'post-4',
    date: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
    time: '11:00',
    platform: 'tiktok',
    toolTopic: 'ATS Resume Builder',
    title: 'Secret website that beats recruiter resume bots',
    caption: 'Stop getting your resume automatically rejected by ATS screening bots. Use clean semantic formatting with zero paywalls! Link in bio.',
    hashtags: ['#resumetips', '#jobhunt', '#careertips', '#techjobs', '#gethired'],
    mediaType: 'video',
    status: 'draft',
    priority: 'high',
    pillar: 'educational',
  },
  {
    id: 'post-5',
    date: new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0],
    time: '15:00',
    platform: 'youtube',
    toolTopic: 'JSON Formatter & Validator',
    title: 'Format Messy JSON in 3 Seconds (Developer Tutorial)',
    caption: 'How to validate, beautify, and inspect complex JSON payloads with collapsible tree view directly in your browser. Zero data sent to server.',
    hashtags: ['#coding', '#webdevelopment', '#javascript', '#api'],
    mediaType: 'video',
    status: 'review',
    priority: 'medium',
    pillar: 'educational',
  },
  {
    id: 'post-6',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    time: '09:00',
    platform: 'reddit',
    toolTopic: 'QR Code Studio',
    title: '[Show Reddit] Free branded QR Code Generator without expiring links',
    caption: 'Built a permanent, vector-sharp QR code tool that does not redirect through spammy tracker domains. Embed custom logos and export SVG/PNG.',
    hashtags: ['#r/webdev', '#r/SideProject'],
    mediaType: 'text',
    status: 'published',
    priority: 'low',
    pillar: 'case_study',
  },
];

const PLATFORM_COLORS: Record<CalendarPlatform, { bg: string; text: string; border: string; label: string; icon: string }> = {
  instagram: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30', label: 'Instagram', icon: '📸' },
  linkedin: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', label: 'LinkedIn', icon: '💼' },
  twitter: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30', label: 'X (Twitter)', icon: '🐦' },
  tiktok: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', label: 'TikTok', icon: '🎵' },
  youtube: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', label: 'YouTube', icon: '▶️' },
  facebook: { bg: 'bg-blue-600/10', text: 'text-blue-500', border: 'border-blue-600/30', label: 'Facebook', icon: '📘' },
  pinterest: { bg: 'bg-red-600/10', text: 'text-red-400', border: 'border-red-600/30', label: 'Pinterest', icon: '📌' },
  reddit: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Reddit', icon: '🔴' },
  threads: { bg: 'bg-zinc-500/10', text: 'text-zinc-300', border: 'border-zinc-500/30', label: 'Threads', icon: '🧵' },
};

const STATUS_CONFIG: Record<PostStatus, { label: string; color: string; badge: string }> = {
  draft: { label: 'Draft', color: 'text-zinc-400 bg-zinc-800 border-zinc-700', badge: '📝 Draft' },
  review: { label: 'In Review', color: 'text-amber-300 bg-amber-950/60 border-amber-800', badge: '🔍 Review' },
  ready: { label: 'Ready to Post', color: 'text-sky-300 bg-sky-950/60 border-sky-800', badge: '🚀 Ready' },
  scheduled: { label: 'Scheduled', color: 'text-purple-300 bg-purple-950/60 border-purple-800', badge: '⏳ Scheduled' },
  published: { label: 'Published', color: 'text-emerald-300 bg-emerald-950/60 border-emerald-800', badge: '✅ Published' },
};

export const ContentCalendar: React.FC = () => {
  // Posts database in localStorage
  const [posts, setPosts] = useState<CalendarPost[]>(() => {
    try {
      const saved = localStorage.getItem('toolboxx_content_calendar');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SAMPLE_POSTS;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('toolboxx_content_calendar', JSON.stringify(posts));
    } catch {}
  }, [posts]);

  // View & Filter States
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Form Fields
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState<string>('12:00');
  const [formPlatform, setFormPlatform] = useState<CalendarPlatform>('twitter');
  const [formTool, setFormTool] = useState<string>('PDF Compressor');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCaption, setFormCaption] = useState<string>('');
  const [formHashtags, setFormHashtags] = useState<string>('#toolboxx #productivity #webtools');
  const [formMediaType, setFormMediaType] = useState<CalendarPost['mediaType']>('image');
  const [formStatus, setFormStatus] = useState<PostStatus>('scheduled');
  const [formPriority, setFormPriority] = useState<PostPriority>('medium');
  const [formPillar, setFormPillar] = useState<ContentPillar>('showcase');
  const [formNotes, setFormNotes] = useState<string>('');

  // Open Create Modal
  const openCreateModal = (prefilledDate?: string) => {
    setEditingPostId(null);
    setFormDate(prefilledDate || new Date().toISOString().split('T')[0]);
    setFormTime('12:00');
    setFormPlatform('twitter');
    setFormTool('PDF Compressor');
    setFormTitle('');
    setFormCaption('');
    setFormHashtags('#toolboxx #freewebtools #productivity');
    setFormMediaType('image');
    setFormStatus('scheduled');
    setFormPriority('medium');
    setFormPillar('showcase');
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (post: CalendarPost) => {
    setEditingPostId(post.id);
    setFormDate(post.date);
    setFormTime(post.time);
    setFormPlatform(post.platform);
    setFormTool(post.toolTopic);
    setFormTitle(post.title);
    setFormCaption(post.caption);
    setFormHashtags(post.hashtags.join(' '));
    setFormMediaType(post.mediaType);
    setFormStatus(post.status);
    setFormPriority(post.priority);
    setFormPillar(post.pillar);
    setFormNotes(post.notes || '');
    setIsModalOpen(true);
  };

  // Save Post
  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast({ type: 'error', title: 'Title Required', message: 'Please enter a post hook or headline.' });
      return;
    }

    const cleanHashtags = formHashtags
      .split(/\s+/)
      .map((h) => (h.startsWith('#') ? h : `#${h}`))
      .filter((h) => h.length > 1);

    if (editingPostId) {
      // Update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPostId
            ? {
                ...p,
                date: formDate,
                time: formTime,
                platform: formPlatform,
                toolTopic: formTool,
                title: formTitle,
                caption: formCaption,
                hashtags: cleanHashtags,
                mediaType: formMediaType,
                status: formStatus,
                priority: formPriority,
                pillar: formPillar,
                notes: formNotes,
              }
            : p
        )
      );
      showToast({ type: 'success', title: 'Post Updated', message: `Saved changes to "${formTitle}".` });
    } else {
      // Create new
      const newPost: CalendarPost = {
        id: `post-${Date.now()}`,
        date: formDate,
        time: formTime,
        platform: formPlatform,
        toolTopic: formTool,
        title: formTitle,
        caption: formCaption,
        hashtags: cleanHashtags,
        mediaType: formMediaType,
        status: formStatus,
        priority: formPriority,
        pillar: formPillar,
        notes: formNotes,
      };
      setPosts((prev) => [newPost, ...prev]);
      showToast({ type: 'success', title: 'Post Scheduled!', message: `Added to ${formDate} on ${formPlatform}.` });
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
    }

    setIsModalOpen(false);
  };

  // Delete Post
  const handleDeletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    showToast({ type: 'info', title: 'Post Deleted', message: 'Removed from calendar.' });
  };

  // 1-Click Status Advance
  const handleAdvanceStatus = (post: CalendarPost) => {
    const sequence: PostStatus[] = ['draft', 'review', 'ready', 'scheduled', 'published'];
    const currentIndex = sequence.indexOf(post.status);
    const nextStatus = sequence[(currentIndex + 1) % sequence.length];

    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, status: nextStatus } : p))
    );

    if (nextStatus === 'published') {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
      showToast({ type: 'success', title: '🎉 Post Published!', message: `Marked "${post.title}" as published.` });
    } else {
      showToast({ type: 'info', title: 'Status Changed', message: `Moved to ${STATUS_CONFIG[nextStatus].label}` });
    }
  };

  // Copy Post Copy to Clipboard
  const handleCopyPost = async (post: CalendarPost) => {
    const textToCopy = `${post.title}\n\n${post.caption}\n\n${post.hashtags.join(' ')}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast({ type: 'success', title: 'Caption Copied!', message: 'Ready to paste into your social publisher.' });
      confetti({ particleCount: 20, spread: 50, origin: { y: 0.8 } });
    } catch {
      showToast({ type: 'error', title: 'Copy Failed', message: 'Please copy manually.' });
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Date', 'Time', 'Platform', 'Tool', 'Title', 'Caption', 'Hashtags', 'Status', 'Priority', 'Pillar'];
    const rows = posts.map((p) => [
      p.id,
      p.date,
      p.time,
      p.platform,
      `"${p.toolTopic.replace(/"/g, '""')}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.caption.replace(/"/g, '""')}"`,
      `"${p.hashtags.join(' ')}"`,
      p.status,
      p.priority,
      p.pillar,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `toolboxx-social-calendar-${new Date().toISOString().split('T')[0]}.csv`);
    showToast({ type: 'success', title: 'CSV Exported', message: 'Compatible with Notion, Sheets & Excel.' });
  };

  // Export to JSON Backup
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(posts, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    downloadBlob(blob, `toolboxx-calendar-backup-${Date.now()}.json`);
    showToast({ type: 'success', title: 'JSON Backup Saved', message: 'Full calendar data exported.' });
  };

  // Reset to Default Sample Data
  const handleResetSampleData = () => {
    setPosts(INITIAL_SAMPLE_POSTS);
    showToast({ type: 'info', title: 'Calendar Reset', message: 'Restored sample 30-day campaign.' });
  };

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.toolTopic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.hashtags.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchPlatform = filterPlatform === 'all' || p.platform === filterPlatform;
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;

      return matchSearch && matchPlatform && matchStatus;
    });
  }, [posts, searchQuery, filterPlatform, filterStatus]);

  // Month Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Month Grid Calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun

  const calendarDays = useMemo(() => {
    const days: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNumber: d, isCurrentMonth: false });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dateStr, dayNumber: i, isCurrentMonth: true });
    }

    // Next month padding to fill complete 35 or 42 grid cells
    const totalSlots = Math.ceil(days.length / 7) * 7;
    const nextDaysNeeded = totalSlots - days.length;
    for (let i = 1; i <= nextDaysNeeded; i++) {
      const m = month + 2 > 12 ? 1 : month + 2;
      const y = month + 2 > 12 ? year + 1 : year;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dateStr, dayNumber: i, isCurrentMonth: false });
    }

    return days;
  }, [year, month, daysInMonth, firstDayIndex]);

  // Stats calculation
  const totalCount = posts.length;
  const scheduledCount = posts.filter((p) => p.status === 'scheduled' || p.status === 'ready').length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;

  return (
    <div className="w-full space-y-8">
      {/* Top Header Controls Bar */}
      <div className="p-6 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-lg space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--c-border)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-gold)] text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Omnichannel Campaign Planner</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-[var(--c-text)]">
              Social Content Calendar
            </h2>
            <p className="text-sm text-[var(--c-muted)] mt-1">
              Plan, schedule, and organize multi-platform content with local persistence and CSV export.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => openCreateModal()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--c-accent)] text-[var(--c-bg)] text-xs font-bold shadow-md hover:bg-[var(--c-text)] transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Post</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-gold)] text-xs font-semibold text-[var(--c-text)] transition-all cursor-pointer"
              title="Export to Notion / Google Sheets CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJson}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] hover:text-[var(--c-text)] text-xs font-medium text-[var(--c-muted)] transition-all cursor-pointer"
              title="Export JSON Backup"
            >
              <FileJson className="w-4 h-4" />
              <span>Backup</span>
            </button>
            <button
              onClick={handleResetSampleData}
              className="p-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors cursor-pointer"
              title="Reset to Sample 30-Day Campaign"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter and View Mode Switcher Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[var(--c-subtle)] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, tools, hashtags..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)] focus:border-[var(--c-gold)] placeholder-[var(--c-subtle)]"
            />
          </div>

          {/* Filters & View Switchers */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Platform Filter */}
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)] focus:border-[var(--c-gold)] cursor-pointer"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">X / Twitter</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="facebook">Facebook</option>
              <option value="pinterest">Pinterest</option>
              <option value="reddit">Reddit</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)] focus:border-[var(--c-gold)] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Drafts</option>
              <option value="review">In Review</option>
              <option value="ready">Ready to Post</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>

            {/* View Mode Buttons */}
            <div className="flex items-center border border-[var(--c-border)] rounded-xl bg-[var(--c-card)] p-0.5">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-[var(--c-gold)] text-[var(--c-bg)]'
                    : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Month</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-[var(--c-gold)] text-[var(--c-bg)]'
                    : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[var(--c-gold)] text-[var(--c-bg)]'
                    : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Content Planned"
          value={`${totalCount} Posts`}
          subValue="Across 9 channels"
        />
        <StatCard
          label="Ready & Scheduled"
          value={`${scheduledCount} Active`}
          subValue="Queued for launch"
          badge="Scheduled"
          badgeType="success"
        />
        <StatCard
          label="Published Live"
          value={`${publishedCount} Posts`}
          subValue="Historical log"
        />
        <StatCard
          label="Top Tool Featured"
          value="PDF Suite"
          subValue="Highest engagement topic"
        />
      </div>

      {/* VIEW 1: MONTH CALENDAR GRID */}
      {viewMode === 'month' && (
        <div className="rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-xl overflow-hidden">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--c-border)] bg-[var(--c-card)]">
            <h3 className="text-xl font-bold font-serif text-[var(--c-text)] flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[var(--c-gold)]" />
              <span>{monthName} {year}</span>
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-muted)] hover:text-[var(--c-text)] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-xs font-semibold text-[var(--c-text)] hover:border-[var(--c-gold)] cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-muted)] hover:text-[var(--c-text)] cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-[var(--c-border)] text-center text-xs font-bold uppercase tracking-wider text-[var(--c-muted)] py-3 bg-[var(--c-surface)]">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 auto-rows-fr gap-px bg-[var(--c-border)]">
            {calendarDays.map((day, idx) => {
              const dayPosts = filteredPosts.filter((p) => p.date === day.dateStr);
              const isToday = day.dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={idx}
                  onClick={() => openCreateModal(day.dateStr)}
                  className={`min-h-[120px] p-2 bg-[var(--c-surface)] transition-all cursor-pointer flex flex-col justify-between hover:bg-[var(--c-card)] group ${
                    !day.isCurrentMonth ? 'opacity-40' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-[var(--c-gold)] text-[var(--c-bg)]'
                          : 'text-[var(--c-text)] group-hover:text-[var(--c-gold)]'
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCreateModal(day.dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[var(--c-gold)] hover:bg-[var(--c-surface)] rounded-md transition-opacity"
                      title="Add Post to this day"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Day Posts List */}
                  <div className="space-y-1.5 mt-1 flex-1 overflow-y-auto max-h-[100px] pr-0.5">
                    {dayPosts.map((post) => {
                      const plat = PLATFORM_COLORS[post.platform];
                      return (
                        <div
                          key={post.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(post);
                          }}
                          className={`p-1.5 rounded-lg border text-[11px] font-medium leading-tight flex items-center justify-between gap-1 shadow-2xs hover:scale-[1.02] transition-transform ${plat.bg} ${plat.border} ${plat.text}`}
                        >
                          <span className="truncate flex items-center gap-1">
                            <span>{plat.icon}</span>
                            <span className="truncate">{post.title}</span>
                          </span>
                          <span className="text-[9px] font-mono shrink-0 opacity-80">{post.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {(['draft', 'review', 'ready', 'scheduled', 'published'] as PostStatus[]).map((colStatus) => {
            const colConfig = STATUS_CONFIG[colStatus];
            const colPosts = filteredPosts.filter((p) => p.status === colStatus);

            return (
              <div
                key={colStatus}
                className="p-4 rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-md space-y-3 flex flex-col min-h-[500px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[var(--c-border)]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--c-text)]">
                    {colConfig.badge}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-muted)]">
                    {colPosts.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colPosts.map((post) => {
                    const plat = PLATFORM_COLORS[post.platform];
                    return (
                      <div
                        key={post.id}
                        onClick={() => openEditModal(post)}
                        className="p-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-gold)] transition-all cursor-pointer space-y-2.5 shadow-sm group"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${plat.bg} ${plat.border} ${plat.text}`}>
                            {plat.icon} {plat.label}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--c-muted)]">{post.date}</span>
                        </div>

                        <h4 className="text-xs font-bold text-[var(--c-text)] group-hover:text-[var(--c-gold)] transition-colors line-clamp-2">
                          {post.title}
                        </h4>

                        <p className="text-[11px] text-[var(--c-muted)] line-clamp-2 leading-relaxed">
                          {post.caption}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-[var(--c-border)] text-[10px]">
                          <span className="text-[var(--c-subtle)] font-mono">{post.toolTopic}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdvanceStatus(post);
                            }}
                            className="px-2 py-1 rounded bg-[var(--c-surface)] hover:bg-[var(--c-gold)] hover:text-black font-semibold text-[var(--c-muted)] transition-colors"
                            title="Advance to next status"
                          >
                            Advance ➔
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: TABLE / LIST VIEW */}
      {viewMode === 'list' && (
        <div className="rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--c-card)] border-b border-[var(--c-border)] text-[var(--c-muted)] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Platform</th>
                  <th className="p-4">Tool / Topic</th>
                  <th className="p-4">Headline & Caption Preview</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--c-border)]">
                {filteredPosts.map((post) => {
                  const plat = PLATFORM_COLORS[post.platform];
                  const st = STATUS_CONFIG[post.status];

                  return (
                    <tr key={post.id} className="hover:bg-[var(--c-card)]/50 transition-colors">
                      <td className="p-4 font-mono whitespace-nowrap text-[var(--c-text)]">
                        <div>{post.date}</div>
                        <div className="text-[10px] text-[var(--c-subtle)]">{post.time}</div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1.5 ${plat.bg} ${plat.border} ${plat.text}`}>
                          <span>{plat.icon}</span>
                          <span>{plat.label}</span>
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap font-semibold text-[var(--c-gold)]">
                        {post.toolTopic}
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="font-bold text-[var(--c-text)] truncate">{post.title}</div>
                        <div className="text-[11px] text-[var(--c-muted)] truncate">{post.caption}</div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <button
                          onClick={() => handleAdvanceStatus(post)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all ${st.color}`}
                        >
                          {st.badge}
                        </button>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleCopyPost(post)}
                          className="p-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] hover:text-[var(--c-text)] text-[var(--c-muted)] cursor-pointer"
                          title="Copy Caption"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(post)}
                          className="p-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] hover:text-[var(--c-gold)] text-[var(--c-muted)] cursor-pointer"
                          title="Edit Post"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] hover:text-rose-400 text-[var(--c-muted)] cursor-pointer"
                          title="Delete Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT POST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--c-border)]">
              <h3 className="text-lg font-bold font-serif text-[var(--c-text)] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--c-gold)]" />
                <span>{editingPostId ? 'Edit Scheduled Post' : 'Create New Social Post'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-[var(--c-muted)] hover:text-[var(--c-text)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">Time</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">Platform</label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as CalendarPlatform)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)]"
                  >
                    <option value="twitter">X / Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="pinterest">Pinterest</option>
                    <option value="reddit">Reddit</option>
                    <option value="threads">Threads</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">Featured Tool / Topic</label>
                  <input
                    type="text"
                    value={formTool}
                    onChange={(e) => setFormTool(e.target.value)}
                    placeholder="e.g. PDF Compressor"
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">Content Pillar</label>
                  <select
                    value={formPillar}
                    onChange={(e) => setFormPillar(e.target.value as ContentPillar)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)]"
                  >
                    <option value="showcase">Product Feature Showcase</option>
                    <option value="educational">Educational / Tutorial</option>
                    <option value="behind_scenes">Behind the Scenes / Architecture</option>
                    <option value="meme">Meme / Relatable Humor</option>
                    <option value="case_study">Case Study / User Feedback</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">Headline / Hook Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Stop paying Adobe $20/mo to compress PDFs"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-sm text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">Full Caption Copy</label>
                <textarea
                  rows={4}
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  placeholder="Write full post copy..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">Hashtags</label>
                <input
                  type="text"
                  value={formHashtags}
                  onChange={(e) => setFormHashtags(e.target.value)}
                  placeholder="#toolboxx #privacy #freewebtools"
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-sky-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">Workflow Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as PostStatus)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)]"
                  >
                    <option value="draft">📝 Draft</option>
                    <option value="review">🔍 In Review</option>
                    <option value="ready">🚀 Ready to Post</option>
                    <option value="scheduled">⏳ Scheduled</option>
                    <option value="published">✅ Published</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--c-muted)] block mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as PostPriority)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs text-[var(--c-text)]"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Launch</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--c-border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--c-border)] text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[var(--c-accent)] text-[var(--c-bg)] text-xs font-bold shadow-md hover:bg-[var(--c-text)] transition-all cursor-pointer"
                >
                  {editingPostId ? 'Save Changes' : 'Schedule Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share and Next Steps */}
      <SocialShareButtons
        title={`Plan and schedule all your social content with ToolBoxX Content Calendar!`}
        variant="banner"
      />
      <PostCompletionRecommendations currentToolId="content-calendar" />
    </div>
  );
};
