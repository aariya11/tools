export interface BlogAuthor {
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
}

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogSection {
  id: string;
  title: string;
  content: string;
  subsections?: {
    id: string;
    title: string;
    content: string;
  }[];
  callout?: {
    type: 'tip' | 'note' | 'warning' | 'info';
    title: string;
    message: string;
  };
  steps?: {
    stepNumber: number;
    title: string;
    description: string;
  }[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  readingTime: string;
  date: string;
  updatedDate?: string;
  author: BlogAuthor;
  category: 'PDF' | 'Image' | 'Productivity' | 'Developer' | 'Security';
  tags: string[];
  relatedToolIds: string[];
  primaryToolId: string;
  featured?: boolean;
  sections: BlogSection[];
  keyTakeaways: string[];
  faqs: BlogFaq[];
}

export const BLOG_AUTHORS: Record<string, BlogAuthor> = {
  alex: {
    name: 'Alex Rivera',
    role: 'Senior Web Performance Engineer',
    bio: 'Specializing in browser-native processing, canvas optimization, and client-side privacy architecture.',
  },
  elena: {
    name: 'Elena Rostova',
    role: 'Digital Privacy & Security Researcher',
    bio: 'Passionate about zero-knowledge web tools, metadata hygiene, and open standards.',
  },
  marcus: {
    name: 'Marcus Chen',
    role: 'Productivity & Workflow Architect',
    bio: 'Designing high-leverage workflows for students, engineers, and digital content creators.',
  },
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-compress-pdf-without-losing-quality',
    title: 'How to Compress PDF Files Without Losing Text & Image Quality (2026 Guide)',
    excerpt: 'Discover the exact techniques to slash PDF file sizes by up to 85% for email attachments, university submissions, and job applications while preserving crisp text and high-res visuals.',
    readingTime: '5 min read',
    date: 'Aug 18, 2026',
    author: BLOG_AUTHORS.alex,
    category: 'PDF',
    tags: ['PDF Compression', 'File Size', 'Email Limits', 'Client-Side'],
    relatedToolIds: ['pdf-compress', 'pdf-merge', 'pdf-split', 'pdf-to-pdfa'],
    primaryToolId: 'pdf-compress',
    featured: true,
    keyTakeaways: [
      'PDF bloat is primarily caused by unoptimized raster images, embedded font subsets, and redundant metadata.',
      'Lossless and smart lossy compression can reduce file size by 60%–85% without perceptible visual degradation.',
      'Browser-based client-side compression protects confidential contracts and academic papers by never uploading them to third-party servers.',
      'Most email providers enforce a strict 25 MB limit; portal uploads often require under 2 MB or 5 MB.',
    ],
    sections: [
      {
        id: 'why-pdf-files-become-huge',
        title: 'Why Do PDF Files Get So Massive?',
        content: 'Have you ever tried sending a PDF proposal or university assignment only to be blocked by an annoying attachment limit error? PDF file bloat usually happens for three primary reasons: uncompressed high-DPI scans, duplicate embedded fonts, and hidden revision history inside document layers.',
        callout: {
          type: 'info',
          title: 'Understanding Perceptual Resolution',
          message: 'Standard computer screens and smartphone displays render at 72 to 144 PPI. A 600 DPI embedded image adds pure file bloat with zero visual benefit on normal screens or standard office printers.',
        },
      },
      {
        id: 'step-by-step-compression',
        title: 'Step-by-Step: How to Compress PDFs in 3 Simple Steps',
        content: 'Using modern client-side compression tools like ToolBoxX PDF Compress, you can optimize any document directly inside your browser memory without uploading sensitive files to cloud servers.',
        steps: [
          {
            stepNumber: 1,
            title: 'Select or Drag Your PDF Document',
            description: 'Open ToolBoxX PDF Compress and drop your PDF into the upload area. The file is read instantaneously via the browser FileReader API.',
          },
          {
            stepNumber: 2,
            title: 'Choose Your Optimization Target',
            description: 'Pick between Balanced Compression (recommended for resumes and emails, ~60-75% reduction) or Maximum Compression (for strict upload portals like government or job sites requiring under 1MB).',
          },
          {
            stepNumber: 3,
            title: 'Preview and Download Your Optimized PDF',
            description: 'Compare the original size versus the newly compressed size in real-time, then click Download to save the private file directly to your disk.',
          },
        ],
      },
      {
        id: 'privacy-considerations',
        title: 'Why Cloud Upload Compressors Are a Massive Privacy Risk',
        content: 'Traditional online PDF tools force you to upload your files to their remote servers. When you upload financial statements, tax forms, medical records, or company NDAs, your sensitive data sits on unfamiliar servers where it could be stored, indexed, or breached. ToolBoxX runs 100% client-side WebAssembly and PDF-Lib algorithms in your browser local sandbox. The byte stream never leaves your computer.',
        callout: {
          type: 'warning',
          title: 'Enterprise Safety Tip',
          message: 'Never upload legal contracts, passports, or proprietary code to unknown cloud conversion websites.',
        },
      },
    ],
    faqs: [
      {
        question: 'Will compressing my PDF make text blurry or pixelated?',
        answer: 'No. Vector text and font glyphs remain 100% razor sharp at any zoom level. Compression specifically optimizes heavy embedded image streams and strips redundant internal objects.',
      },
      {
        question: 'What is the maximum PDF file size I can compress on ToolBoxX?',
        answer: 'Because processing happens on your local machine using browser memory, you can compress files of 100MB, 200MB, or even larger without cloud timeouts.',
      },
      {
        question: 'Can I compress password-protected PDFs?',
        answer: 'You should unlock the PDF first using the ToolBoxX Unlock PDF utility, run compression, and optionally re-apply password encryption afterwards.',
      },
    ],
  },
  {
    slug: 'how-to-reduce-image-size-for-instagram-and-web',
    title: 'How to Reduce Image Size for Instagram, Web Speed, and Social Media',
    excerpt: 'Learn the optimal dimensions, compression ratios, and file formats (WebP vs JPG vs PNG) to make your social graphics and website images load lightning fast without pixelation.',
    readingTime: '6 min read',
    date: 'Aug 17, 2026',
    author: BLOG_AUTHORS.alex,
    category: 'Image',
    tags: ['Image Compression', 'Web Performance', 'Instagram Size', 'WebP'],
    relatedToolIds: ['image-compressor', 'image-resizer', 'png-to-webp', 'jpg-to-png'],
    primaryToolId: 'image-compressor',
    featured: false,
    keyTakeaways: [
      'Instagram feeds compress images automatically if they exceed 1080px width or 30MB file size, often introducing ugly compression artifacts.',
      'Pre-compressing your image to under 1 MB at exact 1080x1350px (4:5) preserves maximum sharpness on mobile screens.',
      'WebP format delivers 25%–35% smaller file size than comparable JPEG at identical visual quality.',
      'Google Core Web Vitals heavily penalize websites with Largest Contentful Paint (LCP) images exceeding 200 KB.',
    ],
    sections: [
      {
        id: 'the-social-compression-trap',
        title: 'The Social Media Compression Trap: Why Photos Look Blurry',
        content: 'When you upload a 15 megabyte photo directly from your DSLR or modern iPhone to Instagram or Twitter/X, their backend algorithms aggressively re-encode the image. This automated batch re-compression creates fuzzy edges, color banding, and pixelation. To beat the algorithm, you must pre-optimize by resizing to exact dimensions, compressing to under 800KB, and stripping metadata.',
      },
      {
        id: 'format-showdown',
        title: 'WebP vs JPEG vs PNG: Which Should You Use?',
        content: 'WebP is the modern standard for web with 30% smaller size than JPEG and full transparency support. JPEG is best for high-res photography without transparency. PNG is required when transparent cutouts or razor-sharp vectors/logos are needed.',
        callout: {
          type: 'tip',
          title: 'SEO Pro Tip',
          message: 'Converting your website PNG hero images to WebP can boost Google PageSpeed scores by up to 25 points.',
        },
      },
      {
        id: 'social-media-dimension-cheat-sheet',
        title: 'Essential 2026 Social Media Aspect Ratios',
        content: 'Instagram Portrait: 1080 x 1350 px (4:5 ratio). Instagram / TikTok Stories & Reels: 1080 x 1920 px (9:16 ratio). Twitter / X Posts: 1200 x 675 px (16:9 ratio). LinkedIn Single Post: 1200 x 627 px. YouTube Thumbnail: 1280 x 720 px (under 2MB).',
      },
    ],
    faqs: [
      {
        question: 'Does ToolBoxX Image Compressor support bulk batch compression?',
        answer: 'Yes! You can drop multiple images into the tool, adjust the global quality slider or configure individual files, and download the entire batch instantly.',
      },
      {
        question: 'Will converting from PNG to WebP reduce image clarity?',
        answer: 'No. Modern WebP compression maintains 98%+ perceptual visual fidelity (SSIM index) while reducing bytes by up to 80%.',
      },
    ],
  },
  {
    slug: 'how-to-convert-jpg-to-png-transparent-background',
    title: 'How to Convert JPG to PNG & Make Backgrounds Transparent',
    excerpt: 'Step-by-step tutorial on converting JPEG images into crisp transparent PNG graphics for logos, signatures, product thumbnails, and graphic design without Photoshop.',
    readingTime: '4 min read',
    date: 'Aug 15, 2026',
    author: BLOG_AUTHORS.marcus,
    category: 'Image',
    tags: ['JPG to PNG', 'Transparent Background', 'Logo Design', 'Graphics'],
    relatedToolIds: ['jpg-to-png', 'background-remover', 'image-cropper', 'favicon-generator'],
    primaryToolId: 'jpg-to-png',
    featured: false,
    keyTakeaways: [
      'JPG files do not support alpha transparency channels; every JPG has a solid background color (usually white or black).',
      'Converting to PNG-24 unlocks 8-bit alpha transparency with smooth anti-aliased edge blending.',
      'You can easily remove solid white backgrounds from signatures and logos using browser-based color thresholding.',
    ],
    sections: [
      {
        id: 'why-jpg-cannot-be-transparent',
        title: 'Why Can JPG Never Have a Transparent Background?',
        content: 'The JPEG compression specification was engineered exclusively for photographic color data. It lacks an Alpha Channel to encode opacity. When saved as JPG, graphic editors automatically fill transparent pixels with solid white. To achieve true transparency, convert to PNG or WebP.',
      },
      {
        id: 'making-transparent-logos',
        title: 'How to Create Transparent Logos & Signatures in 30 Seconds',
        content: 'Whether you have a scanned handwritten signature or a corporate logo on a solid background, here is how to make it transparent:',
        steps: [
          {
            stepNumber: 1,
            title: 'Load Image in Background Remover or JPG to PNG',
            description: 'Drag your image into ToolBoxX Background Remover or JPG to PNG converter.',
          },
          {
            stepNumber: 2,
            title: 'Auto-Detect & Knock Out Background',
            description: 'The client-side edge detection algorithm identifies the solid background color and calculates smooth alpha gradients around logos, text, or human hair.',
          },
          {
            stepNumber: 3,
            title: 'Download as 32-bit PNG',
            description: 'Save your file with complete transparency ready to place over any website, PDF contract, or presentation slide deck.',
          },
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I use this to make a transparent signature for PDF signing?',
        answer: 'Yes! Take a photo of your signature on white paper, remove the white background using ToolBoxX Background Remover, and paste the transparent PNG directly into your PDF contracts using ToolBoxX Sign PDF.',
      },
    ],
  },
  {
    slug: 'how-to-merge-pdf-files-in-order',
    title: 'How to Merge Multiple PDF Files in Exact Sequential Order',
    excerpt: 'Learn how to combine bank statements, homework sheets, invoices, and legal exhibits into a single polished document with custom page re-ordering.',
    readingTime: '4 min read',
    date: 'Aug 14, 2026',
    author: BLOG_AUTHORS.elena,
    category: 'PDF',
    tags: ['PDF Merge', 'Combine PDF', 'Document Workflow', 'Productivity'],
    relatedToolIds: ['pdf-merge', 'organize-pdf', 'add-page-numbers', 'pdf-split'],
    primaryToolId: 'pdf-merge',
    featured: false,
    keyTakeaways: [
      'Merging PDFs simplifies document management by consolidating fragmented receipts, chapters, and certificates.',
      'Visual drag-and-drop tile sorting ensures pages and chapters remain in flawless numerical sequence.',
      'You can combine PDF files with different orientations (portrait and landscape) without distortion.',
    ],
    sections: [
      {
        id: 'common-pdf-merge-scenarios',
        title: 'When Should You Merge PDF Documents?',
        content: 'Consolidating PDFs into a single binder file is essential for Job Applications (combining cover letter, resume, and diplomas), Tax & Accounting (grouping monthly expense receipts), Academic Theses, and Legal Filings.',
      },
      {
        id: 'step-by-step-merging',
        title: 'How to Merge and Re-Order PDFs with Zero Quality Loss',
        content: 'ToolBoxX PDF Merge allows you to visually organize and join unlimited PDF documents:',
        steps: [
          {
            stepNumber: 1,
            title: 'Upload All Target Documents',
            description: 'Select all the PDF files you want to combine. You can add more files at any point.',
          },
          {
            stepNumber: 2,
            title: 'Drag and Drop to Reorder',
            description: 'Use the interactive visual cards to drag files or individual pages into your desired reading order.',
          },
          {
            stepNumber: 3,
            title: 'Generate Merged Document',
            description: 'Click Merge PDFs to instantly stitch all document streams and font tables together into one fast-loading master PDF.',
          },
        ],
        callout: {
          type: 'tip',
          title: 'Pro Tip: Add Page Numbers',
          message: 'After merging multiple documents with disparate pagination, use ToolBoxX Add Page Numbers to stamp unified Page X of Y headers or footers across the entire file.',
        },
      },
    ],
    faqs: [
      {
        question: 'Does merging PDFs reduce the quality of the embedded vector text?',
        answer: 'Not at all. The underlying PDF-Lib engine merges the internal PDF document object model (DOM) losslessly, preserving all vector paths and high-res graphics.',
      },
    ],
  },
  {
    slug: 'how-to-remove-metadata-from-images-exif-privacy',
    title: 'How to Remove EXIF Metadata from Photos to Protect Your Privacy',
    excerpt: 'Smartphone photos quietly embed your GPS coordinates, device serial numbers, camera settings, and timestamps. Here is how to strip image metadata before posting online.',
    readingTime: '6 min read',
    date: 'Aug 12, 2026',
    author: BLOG_AUTHORS.elena,
    category: 'Security',
    tags: ['EXIF Metadata', 'Privacy', 'GPS Geolocation', 'OSINT Security'],
    relatedToolIds: ['image-metadata-remover', 'image-compressor', 'password-generator'],
    primaryToolId: 'image-metadata-remover',
    featured: false,
    keyTakeaways: [
      'Digital photos contain Exchangeable Image File Format (EXIF) tags that can reveal your exact home GPS coordinates.',
      'EXIF tags also store camera model, timestamp, lens focal length, owner name, and editing software history.',
      'Stripping metadata reduces file weight and prevents cyberstalking, doxxing, and location tracking.',
    ],
    sections: [
      {
        id: 'what-is-exif-data',
        title: 'What Hidden Information Is Lurking Inside Your Photos?',
        content: 'Every photo taken on an iPhone, Android, or digital camera writes a hidden metadata header called EXIF. This includes GPS coordinates (accurate to 3 meters), exact capture timestamps, hardware serial numbers, and thumbnail previews that might contain uncropped sensitive areas.',
        callout: {
          type: 'warning',
          title: 'Privacy Alert',
          message: 'Sharing raw photos taken at home or school on forums, Discord, Craigslist, or marketplace websites can easily expose your physical address.',
        },
      },
      {
        id: 'how-to-clean-metadata',
        title: 'How to Strip Metadata in 1-Click with ToolBoxX',
        content: 'ToolBoxX Image Metadata Remover reads your image locally on an HTML5 canvas and re-encodes pure pixel data into a brand new sanitized file with zero EXIF, IPTC, or XMP bloat.',
        steps: [
          {
            stepNumber: 1,
            title: 'Drop Your Photos',
            description: 'Select one or multiple photos to inspect their hidden EXIF tags.',
          },
          {
            stepNumber: 2,
            title: 'Review Detected Geolocation & Camera Tags',
            description: 'View the exact map location and hardware metadata currently embedded inside your file.',
          },
          {
            stepNumber: 3,
            title: 'Download Sanitized Clean Photos',
            description: 'Click Clean & Download to get a 100% anonymized photo safe to share anywhere.',
          },
        ],
      },
    ],
    faqs: [
      {
        question: 'Do social media platforms like Twitter/X and Instagram remove EXIF data?',
        answer: 'While some major platforms strip GPS data upon upload, many messaging apps (like email attachments, Telegram in uncompressed mode, Discord, and file sharing drives) transmit the raw untouched file with full GPS coordinates intact.',
      },
    ],
  },
  {
    slug: 'how-to-convert-pdf-to-word-doc',
    title: 'How to Convert PDF to Editable Word DOCX Documents',
    excerpt: 'Convert locked PDF files, scanned contracts, and formatted brochures into editable Microsoft Word documents with preserved tables, styling, and typography.',
    readingTime: '5 min read',
    date: 'Aug 10, 2026',
    author: BLOG_AUTHORS.marcus,
    category: 'PDF',
    tags: ['PDF to Word', 'DOCX', 'Document Conversion', 'Office Workflow'],
    relatedToolIds: ['pdf-to-word', 'word-to-pdf', 'ocr-pdf', 'edit-pdf'],
    primaryToolId: 'pdf-to-word',
    featured: false,
    keyTakeaways: [
      'Converting PDF to DOCX enables full editing of text, tables, bullet points, and headers in Microsoft Word, Google Docs, and LibreOffice.',
      'Native digital PDFs can be parsed directly into structured XML document schemas.',
      'Scanned paper PDFs require Optical Character Recognition (OCR) to convert image pixels into selectable text.',
    ],
    sections: [
      {
        id: 'why-convert-pdf-to-docx',
        title: 'Why Is PDF Editing So Difficult Without Word Conversion?',
        content: 'PDF files were designed as digital electronic paper to look identical across every printer and operating system. As a result, PDFs do not think in terms of flowing sentences or paragraphs — they store individual character glyphs positioned at rigid X/Y coordinates. Converting to DOCX reconstructs structural paragraphs and tables, allowing you to freely re-edit content.',
      },
      {
        id: 'conversion-process',
        title: 'How to Convert PDFs to Word for Free',
        content: 'Follow these straightforward steps to convert your PDF files into editable Microsoft Word documents with zero cloud uploads:',
        steps: [
          {
            stepNumber: 1,
            title: 'Upload PDF Document',
            description: 'Drop your PDF into ToolBoxX PDF to Word Converter.',
          },
          {
            stepNumber: 2,
            title: 'Select OCR Options if Scanned',
            description: 'If your document was scanned from a paper scanner or camera, enable OCR to detect text in 50+ languages.',
          },
          {
            stepNumber: 3,
            title: 'Download .DOCX File',
            description: 'Open the resulting DOCX directly in Word, Google Docs, or Apple Pages with fully editable formatting.',
          },
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I convert Word DOCX back to PDF after making my edits?',
        answer: 'Yes! Simply use the ToolBoxX Word to PDF converter to re-lock your finished document into a pristine, shareable PDF.',
      },
    ],
  },
  {
    slug: '7-secret-productivity-tools-every-student-needs',
    title: '7 Secret Productivity Tools Every College & High School Student Needs in 2026',
    excerpt: 'From bypassing portal upload limits to turning typed essays into realistic handwriting and extracting text from lecture slides, here are 7 free student tools that save dozens of hours.',
    readingTime: '7 min read',
    date: 'Aug 08, 2026',
    author: BLOG_AUTHORS.marcus,
    category: 'Productivity',
    tags: ['Student Tools', 'Study Hacks', 'University', 'Productivity', 'Writing'],
    relatedToolIds: ['text-to-handwriting', 'pdf-compress', 'ai-summarizer', 'word-counter', 'ocr-pdf', 'case-converter', 'markdown-editor'],
    primaryToolId: 'text-to-handwriting',
    featured: true,
    keyTakeaways: [
      'University submission portals (Canvas, Blackboard, Moodle) frequently fail on oversized PDFs; smart compression solves this instantly.',
      'Text-to-handwriting converters let students generate authentic handwritten assignment sheets without wrist fatigue.',
      'Browser-based OCR extracts text from whiteboard photos and textbook scans in seconds.',
      'Zero-login, 100% free client-side tools protect academic research without subscription fees or paywalls.',
    ],
    sections: [
      {
        id: 'the-modern-student-tech-stack',
        title: 'Supercharge Your Study Workflow Without Expensive Subscriptions',
        content: 'Between textbook fees, software subscriptions, and tuition, student budgets are stretched thin. Yet students waste hours every week wrestling with document formatting, transcription, and file conversion. Here are the 7 indispensable free utilities every student should bookmark right now:',
      },
      {
        id: 'tool-1-text-to-handwriting',
        title: '1. Text to Handwriting Generator',
        content: 'Have a professor who demands homework assignments submitted in handwritten format? The ToolBoxX Text to Handwriting tool converts typed digital notes into human-like handwriting on ruled notebook paper or blank legal pads with customizable ink color, margins, and paper textures.',
        callout: {
          type: 'tip',
          title: 'Assignment Hack',
          message: 'Export your handwritten notes directly to PDF with realistic paper shadows and scanner effects.',
        },
      },
      {
        id: 'tool-2-pdf-compressor',
        title: '2. PDF Compressor for Canvas & Blackboard Portals',
        content: 'University upload portals routinely have strict file upload caps (often 5 MB or 10 MB). Submitting a multi-page presentation or lab report with high-res diagram scans can cause submission failures right at the deadline. Using ToolBoxX PDF Compress, you can instantly squeeze 40 MB lab reports down to 2 MB without losing the clarity of diagrams or formulas.',
      },
      {
        id: 'tool-3-browser-ocr',
        title: '3. Instant OCR Scanner for Whiteboards & Slide Decks',
        content: 'Stop typing out long quotes from library books or blurry classroom lecture slides. The ToolBoxX OCR Tool extracts clean editable text from any photo or scanned PDF in seconds using on-device optical character recognition.',
      },
      {
        id: 'tool-4-ai-summarizer',
        title: '4. Research Paper Summarizer & Key Points Extractor',
        content: 'When reviewing 50-page academic journal papers for literature reviews, use the ToolBoxX AI Summarizer to generate concise bullet-point executive summaries, methodology overviews, and core conclusions.',
      },
      {
        id: 'tool-5-word-and-character-counter',
        title: '5. Detailed Essay Word & Character Counter',
        content: 'Track sentence complexity, reading time, speaking duration, paragraph counts, and keyword density for college admissions essays, lab reports, and scholarship applications.',
      },
      {
        id: 'tool-6-pdf-merger-and-page-numberer',
        title: '6. PDF Merge & Page Numberer for Lab Portfolios',
        content: 'Stitch together your cover sheet, syllabus, weekly lab assignments, and appendices into one single unified portfolio with consecutive bottom-center page numbering.',
      },
      {
        id: 'tool-7-markdown-editor',
        title: '7. Distraction-Free Markdown Editor & Formatter',
        content: 'Draft assignments in clean, lightning-fast Markdown with live split-screen preview, math equation support, and instant 1-click export to clean HTML or PDF.',
      },
    ],
    faqs: [
      {
        question: 'Are all these student tools really free without an account?',
        answer: 'Yes! ToolBoxX requires no signup, no credit card, and has zero daily limits. All tools run directly in your web browser.',
      },
      {
        question: 'Do these tools work on Chromebooks, iPads, and smartphones?',
        answer: 'Yes. Because all processing is browser-native, ToolBoxX works seamlessly across Mac, Windows, Linux, Chromebooks, iPads, iPhones, and Android devices.',
      },
    ],
  },
];

export function getAllBlogPosts(): BlogPost[] {
  return BLOG_POSTS;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getFeaturedBlogPost(): BlogPost {
  return BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  if (!category || category === 'All') return BLOG_POSTS;
  return BLOG_POSTS.filter((p) => p.category.toLowerCase() === category.toLowerCase());
}

export function getRelatedBlogPosts(currentSlug: string, limit = 3): BlogPost[] {
  const current = getBlogPostBySlug(currentSlug);
  if (!current) return BLOG_POSTS.slice(0, limit);

  return BLOG_POSTS.filter((p) => p.slug !== currentSlug && (p.category === current.category || p.tags.some(t => current.tags.includes(t))))
    .slice(0, limit);
}
