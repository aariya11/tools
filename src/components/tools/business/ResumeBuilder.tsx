import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';
import {
  FileText,
  Download,
  Printer,
  Trash2,
  Briefcase,
  Code
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob } from '../../../utils/fileUtils';

interface WorkExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  year: string;
  honors?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string;
  link?: string;
}

export const ResumeBuilder: React.FC = () => {
  // Personal Info
  const [fullName, setFullName] = useState<string>('Alex Morgan');
  const [jobTitle, setJobTitle] = useState<string>('Senior Full-Stack Engineer');
  const [email, setEmail] = useState<string>('alex.morgan@email.com');
  const [phone, setPhone] = useState<string>('+1 (555) 432-8901');
  const [location, setLocation] = useState<string>('San Francisco, CA');
  const [portfolio, setPortfolio] = useState<string>('https://alexmorgan.dev');
  const [linkedin, setLinkedin] = useState<string>('linkedin.com/in/alexmorgan');

  // Summary
  const [summary, setSummary] = useState<string>(
    'Innovative Senior Full-Stack Engineer with 7+ years of experience architecting high-scale distributed systems and responsive React web applications. Proven track record of reducing latency by 45% and leading cross-functional engineering teams.'
  );

  // Work Experience
  const [experiences, setExperiences] = useState<WorkExperience[]>([
    {
      id: '1',
      role: 'Staff Software Engineer',
      company: 'TechFlow Systems',
      location: 'San Francisco, CA',
      startDate: '2022',
      endDate: 'Present',
      current: true,
      bullets: [
        'Architected a high-throughput microservices pipeline handling 50M+ daily events using Node.js, TypeScript, and Kafka.',
        'Spearheaded frontend migration to React 19 and Tailwind CSS, improving Core Web Vitals LCP by 60%.',
        'Mentored 8 mid-level engineers and established automated CI/CD deployment pipelines with Docker.',
      ],
    },
    {
      id: '2',
      role: 'Senior Frontend Developer',
      company: 'Nova Digital Agency',
      location: 'New York, NY',
      startDate: '2019',
      endDate: '2022',
      current: false,
      bullets: [
        'Built enterprise analytics dashboards for Fortune 500 clients using React, TypeScript, and D3.js.',
        'Engineered client-side offline capabilities using Service Workers and IndexedDB, boosting retention by 22%.',
      ],
    },
  ]);

  // Education
  const [educations, setEducations] = useState<Education[]>([
    {
      id: '1',
      degree: 'B.S. in Computer Science',
      institution: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      year: '2015 – 2019',
      honors: 'Magna Cum Laude (GPA: 3.88)',
    },
  ]);

  // Skills
  const [skills, setSkills] = useState<string[]>([
    'React 19',
    'TypeScript',
    'Node.js',
    'Next.js',
    'Tailwind CSS',
    'PostgreSQL',
    'Docker',
    'Kubernetes',
    'AWS',
    'GraphQL',
    'CI/CD',
    'System Architecture',
  ]);
  const [skillInput, setSkillInput] = useState<string>('');

  // Projects
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'DevMetrics – Cloud Monitoring Platform',
      description: 'Open-source real-time application monitoring tool with custom alerting and zero-overhead instrumentation.',
      technologies: 'React, Go, Prometheus, Docker',
      link: 'https://github.com/alexmorgan/devmetrics',
    },
  ]);

  // Template design
  const [template, setTemplate] = useState<'classic' | 'modern'>('modern');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Skill Handlers
  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills((prev) => [...prev, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  // Experience Handlers
  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 9),
        role: 'Software Engineer',
        company: 'Company Name',
        location: 'City, State',
        startDate: '2023',
        endDate: 'Present',
        current: true,
        bullets: ['Led development of core features resulting in measurable performance improvement.'],
      },
    ]);
  };

  const updateExperience = (id: string, updates: Partial<WorkExperience>) => {
    setExperiences((prev) => prev.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp)));
  };

  const removeExperience = (id: string) => {
    setExperiences((prev) => prev.filter((exp) => exp.id !== id));
  };

  const addBullet = (expId: string) => {
    setExperiences((prev) =>
      prev.map((exp) =>
        exp.id === expId ? { ...exp, bullets: [...exp.bullets, 'New achievement or key responsibility...'] } : exp
      )
    );
  };

  const updateBullet = (expId: string, bulletIndex: number, text: string) => {
    setExperiences((prev) =>
      prev.map((exp) => {
        if (exp.id !== expId) return exp;
        const newBullets = [...exp.bullets];
        newBullets[bulletIndex] = text;
        return { ...exp, bullets: newBullets };
      })
    );
  };

  const removeBullet = (expId: string, bulletIndex: number) => {
    setExperiences((prev) =>
      prev.map((exp) => {
        if (exp.id !== expId) return exp;
        return { ...exp, bullets: exp.bullets.filter((_, i) => i !== bulletIndex) };
      })
    );
  };

  // Education Handlers
  const addEducation = () => {
    setEducations((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 9),
        degree: 'Degree / Certificate',
        institution: 'University / Institute',
        location: 'City, Country',
        year: '2020 – 2024',
      },
    ]);
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    setEducations((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const removeEducation = (id: string) => {
    setEducations((prev) => prev.filter((e) => e.id !== id));
  };

  // Project Handlers
  const addProject = () => {
    setProjects((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 9),
        title: 'Project Title',
        description: 'Key deliverable and impact description...',
        technologies: 'Technologies Used',
      },
    ]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const removeProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // PDF Export via html2canvas and pdf-lib
  const handleDownloadPdf = async () => {
    const element = resumeRef.current;
    if (!element) return;

    setIsExporting(true);
    showToast({ type: 'info', title: 'Exporting Resume', message: 'Generating ATS-compliant PDF document...' });

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions
      const pngImage = await pdfDoc.embedPng(imgData);

      const { width, height } = page.getSize();
      const imgAspect = canvas.width / canvas.height;
      const pageAspect = width / height;

      let drawWidth = width;
      let drawHeight = height;

      if (imgAspect > pageAspect) {
        drawHeight = width / imgAspect;
      } else {
        drawWidth = height * imgAspect;
      }

      page.drawImage(pngImage, {
        x: (width - drawWidth) / 2,
        y: height - drawHeight - 10,
        width: drawWidth,
        height: drawHeight,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `resume_${fullName.toLowerCase().replace(/\s+/g, '_')}.pdf`);

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      showToast({ type: 'success', title: 'Resume Downloaded', message: 'Ready for job applications!' });
    } catch (err) {
      console.error('Resume PDF error:', err);
      showToast({ type: 'error', title: 'Export Error', message: 'Failed to generate PDF.' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-[var(--c-surface)] p-4 rounded-2xl border border-[var(--c-border)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[var(--c-text)] flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[var(--c-gold)]" /> Template Style:
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setTemplate('modern')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                template === 'modern'
                  ? 'bg-[var(--c-text)] text-[var(--c-bg)]'
                  : 'bg-[var(--c-card)] text-[var(--c-muted)] border border-[var(--c-border)]'
              }`}
            >
              Modern Sidebar
            </button>
            <button
              type="button"
              onClick={() => setTemplate('classic')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                template === 'classic'
                  ? 'bg-[var(--c-text)] text-[var(--c-bg)]'
                  : 'bg-[var(--c-card)] text-[var(--c-muted)] border border-[var(--c-border)]'
              }`}
            >
              Classic Executive (ATS)
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-3 py-1.5 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-text)] text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-[var(--c-muted)]" /> Print / System PDF
        </button>
      </div>

      {/* Main Grid: Builder Inputs on Left, Live Resume Sheet on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Builder */}
        <div className="lg:col-span-6 space-y-6">
          {/* Personal Info */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              Personal Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Job Headline / Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">Portfolio / Website</label>
                <input
                  type="url"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[var(--c-muted)] block mb-1">LinkedIn Profile</label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-3">
            <h4 className="font-bold text-sm text-[var(--c-text)]">Professional Summary</h4>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Highlight your key background, years of experience, core skills, and leadership impact..."
              className="w-full p-3 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
            />
          </div>

          {/* Work Experience */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[var(--c-gold)]" /> Work Experience
              </h4>
              <button
                type="button"
                onClick={addExperience}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-gold)] border border-[var(--c-border)] cursor-pointer"
              >
                + Add Role
              </button>
            </div>

            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="p-4 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--c-text)]">{exp.role || 'New Job Position'}</span>
                    {experiences.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExperience(exp.id)}
                        className="text-rose-500 hover:bg-rose-500/10 p-1 rounded-md cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={exp.role}
                      onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]"
                    />
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]"
                    />
                    <input
                      type="text"
                      placeholder="Dates (e.g. 2022 – Present)"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[var(--c-border)]">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--c-muted)]">
                      <span>Key Achievements & Responsibilities:</span>
                      <button
                        type="button"
                        onClick={() => addBullet(exp.id)}
                        className="text-[var(--c-gold)] hover:underline cursor-pointer"
                      >
                        + Add Bullet
                      </button>
                    </div>
                    {exp.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-1.5">
                        <span className="text-[var(--c-subtle)] text-xs">•</span>
                        <input
                          type="text"
                          value={b}
                          onChange={(e) => updateBullet(exp.id, bIdx, e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs rounded-md border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]"
                        />
                        {exp.bullets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBullet(exp.id, bIdx)}
                            className="text-rose-500 hover:bg-rose-500/10 p-1 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education Section */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[var(--c-text)]">Education</h4>
              <button
                type="button"
                onClick={addEducation}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-gold)] border border-[var(--c-border)] cursor-pointer"
              >
                + Add Education
              </button>
            </div>

            <div className="space-y-3">
              {educations.map((edu) => (
                <div key={edu.id} className="p-3.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="Degree (e.g. B.S. in Computer Science)"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                      className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]"
                    />
                    {educations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEducation(edu.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Institution / University"
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                      className="px-3 py-1 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]"
                    />
                    <input
                      type="text"
                      placeholder="Year (e.g. 2015 – 2019)"
                      value={edu.year}
                      onChange={(e) => updateEducation(edu.id, { year: e.target.value })}
                      className="px-3 py-1 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Section */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[var(--c-text)]">Projects</h4>
              <button
                type="button"
                onClick={addProject}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] text-[var(--c-gold)] border border-[var(--c-border)] cursor-pointer"
              >
                + Add Project
              </button>
            </div>

            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="p-3.5 rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={proj.title}
                      onChange={(e) => updateProject(proj.id, { title: e.target.value })}
                      className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]"
                    />
                    {projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProject(proj.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Description & impact"
                    value={proj.description}
                    onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                    className="w-full px-3 py-1 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]"
                  />
                  <input
                    type="text"
                    placeholder="Tech Stack (e.g. React, Node, Docker)"
                    value={proj.technologies}
                    onChange={(e) => updateProject(proj.id, { technologies: e.target.value })}
                    className="w-full px-3 py-1 text-xs rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Skills Builder */}
          <div className="bg-[var(--c-surface)] p-6 rounded-3xl border border-[var(--c-border)] space-y-4">
            <h4 className="font-bold text-sm text-[var(--c-text)] flex items-center gap-2">
              <Code className="w-4 h-4 text-[var(--c-gold)]" /> Skills & Competencies
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type skill & press Enter (e.g. React, Docker, Python)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[var(--c-card)] hover:bg-[var(--c-border)] border border-[var(--c-border)] text-[var(--c-gold)] cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s}
                  onClick={() => handleRemoveSkill(s)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text)] hover:border-rose-500 hover:text-rose-500 cursor-pointer flex items-center gap-1 group transition-colors"
                >
                  <span>{s}</span>
                  <span className="text-[10px] text-[var(--c-subtle)] group-hover:text-rose-500">×</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live A4 Resume Preview Sheet */}
        <div className="lg:col-span-6 space-y-6">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="w-full py-3.5 px-6 rounded-2xl bg-[var(--c-text)] hover:opacity-90 disabled:opacity-50 text-[var(--c-bg)] font-bold text-xs shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating PDF Document...' : '1-Click Export Resume (ATS PDF)'}
          </button>

          {/* Formatted A4 Paper Preview */}
          <div
            ref={resumeRef}
            className="p-8 rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200 text-xs leading-relaxed space-y-5 min-h-[750px]"
          >
            {/* Header */}
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                {fullName || 'Your Name'}
              </h1>
              <div className="text-sm font-semibold text-slate-700 mt-0.5">
                {jobTitle || 'Professional Title'}
              </div>

              {/* Contact Pill Bar */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600 mt-2">
                {email && <span>✉ {email}</span>}
                {phone && <span>☎ {phone}</span>}
                {location && <span>📍 {location}</span>}
                {portfolio && <span>🔗 {portfolio.replace(/^https?:\/\//, '')}</span>}
                {linkedin && <span>💼 {linkedin}</span>}
              </div>
            </div>

            {/* Summary */}
            {summary && (
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-1.5">
                  Professional Summary
                </h3>
                <p className="text-[11px] text-slate-700 leading-relaxed">{summary}</p>
              </div>
            )}

            {/* Experience */}
            {experiences.length > 0 && (
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
                  Work Experience
                </h3>
                <div className="space-y-3">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900 text-xs">{exp.role}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{exp.startDate}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                        <span>{exp.company}</span>
                        <span>{exp.location}</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700 pl-1">
                        {exp.bullets.map((b, i) => (
                          <li key={i} className="leading-normal">{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-1.5">
                  Core Skills & Technologies
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-medium text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {educations.length > 0 && (
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-1.5">
                  Education
                </h3>
                <div className="space-y-2">
                  {educations.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-baseline text-[11px]">
                      <div>
                        <div className="font-bold text-slate-900">{edu.degree}</div>
                        <div className="text-slate-600">{edu.institution} {edu.honors && `· ${edu.honors}`}</div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-1.5">
                  Featured Projects
                </h3>
                <div className="space-y-2">
                  {projects.map((proj) => (
                    <div key={proj.id} className="text-[11px]">
                      <div className="font-bold text-slate-900">{proj.title}</div>
                      <div className="text-slate-700 leading-normal">{proj.description}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">Stack: {proj.technologies}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Completion */}
      <PostCompletionRecommendations currentToolId="resume-builder" />
    </div>
  );
};

export default ResumeBuilder;
