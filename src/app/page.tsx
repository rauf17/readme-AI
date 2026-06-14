"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeRain from "@/components/CodeRain";
import Toast from "@/components/Toast";
import OdometerStats from "@/components/OdometerStats";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Download, Settings2, Sparkles, ChevronDown, ArrowRight, User, BookOpen, X, Check, ChevronLeft } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type AppMode = 'landing' | 'repo' | 'profile';
type ProfileStep = 'template' | 'form' | 'result';

interface ProfileTemplate {
  id: string;
  name: string;
  description: string;
  accent: string;
  bg: string;
  preview: string; // emoji/icon for quick visual
  style: 'dark' | 'light' | 'minimal' | 'colorful' | 'terminal';
}

interface ProfileFormData {
  name: string;
  title: string;
  bio: string;
  githubUser: string;
  location: string;
  email: string;
  website: string;
  skills: string;
  featuredProjects: string;
  currentWork: string;
  funFact: string;
  twitterUser: string;
  linkedinUser: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PROFILE_TEMPLATES: ProfileTemplate[] = [
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'Dark, cinematic. Tech-forward with glowing accents.',
    accent: '#00bcd4',
    bg: '#0d1117',
    preview: '🌑',
    style: 'dark',
  },
  {
    id: 'dawn',
    name: 'Dawn',
    description: 'Clean white with warm orange. Approachable and modern.',
    accent: '#f97316',
    bg: '#fafafa',
    preview: '🌅',
    style: 'light',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Typography-first. No badges, just clean prose.',
    accent: '#6b7280',
    bg: '#ffffff',
    preview: '◻️',
    style: 'minimal',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Purple & teal gradients. Vibrant and expressive.',
    accent: '#8b5cf6',
    bg: '#0f0c29',
    preview: '🌌',
    style: 'colorful',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Green-on-black. Pure hacker aesthetic.',
    accent: '#22c55e',
    bg: '#000000',
    preview: '⌨️',
    style: 'terminal',
  },
];

const TONES = ["Professional", "Beginner-friendly", "Funny", "Corporate"];

// ─── Markdown Syntax Highlighting ────────────────────────────────────────────
function highlightMarkdown(text: string): React.ReactNode[] {
  return text.split('\n').map((line, i) => {
    let content: React.ReactNode = line;

    if (line.startsWith('# ')) {
      content = <span className="syn-h1">{line}</span>;
    } else if (line.startsWith('## ')) {
      content = <span className="syn-h2">{line}</span>;
    } else if (line.startsWith('### ')) {
      content = <span className="syn-h3">{line}</span>;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      content = <span className="syn-list">{line}</span>;
    } else if (line.startsWith('> ')) {
      content = <span className="syn-blockquote">{line}</span>;
    } else if (line.startsWith('```')) {
      content = <span className="syn-code">{line}</span>;
    } else {
      const parts: React.ReactNode[] = [];
      let remaining = line;
      let key = 0;
      while (remaining.length > 0) {
        const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/);
        const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)/);
        let firstMatch: { type: 'bold' | 'code'; index: number; match: RegExpMatchArray } | null = null;
        if (boldMatch) firstMatch = { type: 'bold', index: boldMatch[1].length, match: boldMatch };
        if (codeMatch && (!firstMatch || codeMatch[1].length < firstMatch.index)) {
          firstMatch = { type: 'code', index: codeMatch[1].length, match: codeMatch };
        }
        if (firstMatch) {
          const m = firstMatch.match;
          if (m[1]) parts.push(<span key={key++} className="syn-text">{m[1]}</span>);
          if (firstMatch.type === 'bold') {
            parts.push(<span key={key++} className="syn-bold">**{m[2]}**</span>);
          } else {
            parts.push(<span key={key++} className="syn-code">`{m[2]}`</span>);
          }
          remaining = m[3];
        } else {
          parts.push(<span key={key++} className="syn-text">{remaining}</span>);
          remaining = '';
        }
      }
      content = <>{parts}</>;
    }
    return <div key={i}>{content}{'\n'}</div>;
  });
}

// ─── Profile README Generator ─────────────────────────────────────────────────
function generateProfileReadme(template: ProfileTemplate, form: ProfileFormData): string {
  const skills = form.skills.split(',').map(s => s.trim()).filter(Boolean);
  const projects = form.featuredProjects.split('\n').filter(Boolean);

  if (template.id === 'obsidian') {
    return `<div align="center">

# Hi there, I'm ${form.name || 'Your Name'} 👋

### ${form.title || 'Full-Stack Developer & Open Source Enthusiast'}

${form.bio || 'Passionate developer building things that matter.'}

${form.location ? `📍 **${form.location}**` : ''} ${form.website ? `· 🌐 **[${form.website}](https://${form.website})**` : ''}

---

</div>

## 🚀 About Me

${form.currentWork ? `- 🔭 Currently working on **${form.currentWork}**` : ''}
${form.funFact ? `- ⚡ Fun fact: ${form.funFact}` : ''}
${form.email ? `- 📫 Reach me at **${form.email}**` : ''}

## 🛠️ Tech Stack

\`\`\`
${skills.join('  ·  ') || 'TypeScript  ·  React  ·  Node.js  ·  Python'}
\`\`\`

## 📌 Featured Projects

${projects.map(p => `> **${p}**`).join('\n\n') || '> Add your featured projects above'}

## 📊 GitHub Stats

<div align="center">

![${form.githubUser || 'username'}'s GitHub stats](https://github-readme-stats.vercel.app/api?username=${form.githubUser || 'username'}&show_icons=true&theme=tokyonight&hide_border=true)

![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=${form.githubUser || 'username'}&layout=compact&theme=tokyonight&hide_border=true)

</div>

---

<div align="center">

${form.twitterUser ? `[![Twitter](https://img.shields.io/badge/Twitter-%231DA1F2.svg?style=flat&logo=Twitter&logoColor=white)](https://twitter.com/${form.twitterUser})` : ''}
${form.linkedinUser ? `[![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/${form.linkedinUser})` : ''}
${form.githubUser ? `[![GitHub](https://img.shields.io/badge/GitHub-%23121011.svg?style=flat&logo=github&logoColor=white)](https://github.com/${form.githubUser})` : ''}

*⭐ Star my repos if you find them useful!*

</div>`;
  }

  if (template.id === 'dawn') {
    return `# ${form.name || 'Your Name'} ☀️

**${form.title || 'Building things on the internet'}**

${form.bio || 'Welcome to my GitHub! I love creating tools and sharing knowledge.'}

${form.location ? `📍 ${form.location}` : ''} ${form.website ? `· [${form.website}](https://${form.website})` : ''}

---

### What I'm up to

${form.currentWork ? `🔭 **Currently:** ${form.currentWork}` : ''}

${form.funFact ? `💡 **Fun fact:** ${form.funFact}` : ''}

### Tools I work with

${skills.map(s => `\`${s}\``).join(' ') || '`JavaScript` `TypeScript` `React` `Node.js`'}

### Things I've built

${projects.map(p => `→ ${p}`).join('\n') || '→ Add your projects above'}

---

### Connect

${form.email ? `📧 [${form.email}](mailto:${form.email})` : ''}
${form.twitterUser ? `🐦 [@${form.twitterUser}](https://twitter.com/${form.twitterUser})` : ''}
${form.linkedinUser ? `💼 [LinkedIn](https://linkedin.com/in/${form.linkedinUser})` : ''}

![Profile views](https://komarev.com/ghpvc/?username=${form.githubUser || 'username'}&color=orange&style=flat)`;
  }

  if (template.id === 'minimal') {
    return `# ${form.name || 'Your Name'}

${form.title || 'Software Engineer'}

${form.bio || 'I write code, break things, and occasionally fix them.'}

---

${form.currentWork ? `Currently: ${form.currentWork}` : ''}
${form.location ? `Based in: ${form.location}` : ''}
${form.website ? `Web: ${form.website}` : ''}
${form.email ? `Mail: ${form.email}` : ''}

---

**Skills:** ${skills.join(', ') || 'JavaScript, TypeScript, React, Node.js'}

**Projects:**

${projects.map(p => `- ${p}`).join('\n') || '- Add your projects above'}

---

${form.twitterUser ? `[Twitter](https://twitter.com/${form.twitterUser})` : ''} ${form.linkedinUser ? `· [LinkedIn](https://linkedin.com/in/${form.linkedinUser})` : ''} ${form.githubUser ? `· [GitHub](https://github.com/${form.githubUser})` : ''}`;
  }

  if (template.id === 'aurora') {
    return `<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=${encodeURIComponent(form.name || 'Your Name')}&fontSize=70&fontColor=fff&animation=twinkling" />

### ✨ ${form.title || 'Creative Developer & Digital Dreamer'} ✨

> *${form.bio || 'Turning ideas into reality, one commit at a time'}*

</div>

---

<img align="right" src="https://github-readme-stats.vercel.app/api?username=${form.githubUser || 'username'}&show_icons=true&theme=midnight-purple&hide_border=true" />

### 🌈 About Me

${form.location ? `🌍 From **${form.location}**` : ''}
${form.currentWork ? `🚧 Building **${form.currentWork}**` : ''}
${form.funFact ? `🎲 ${form.funFact}` : ''}
${form.email ? `💌 ${form.email}` : ''}

<br/>

### 🛸 My Universe

${skills.map(s => `![${s}](https://img.shields.io/badge/${encodeURIComponent(s)}-blueviolet?style=for-the-badge)`).join('\n') || '![JavaScript](https://img.shields.io/badge/JavaScript-blueviolet?style=for-the-badge)'}

### 🌟 Constellations (Projects)

${projects.map(p => `🔮 **${p}**`).join('\n\n') || '🔮 **Add your featured projects above**'}

---

<div align="center">

${form.twitterUser ? `[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/${form.twitterUser})` : ''}
${form.linkedinUser ? `[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/${form.linkedinUser})` : ''}

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" />

</div>`;
  }

  // terminal
  return `\`\`\`bash
# whoami
> ${form.name || 'your_name'}

# cat about.txt
> ${form.title || 'Software Engineer'}
> ${form.bio || 'I build things that run on computers.'}
${form.location ? `> Location: ${form.location}` : ''}

# ls -la skills/
${skills.map(s => `> drwxr-xr-x  ${s}/`).join('\n') || `> drwxr-xr-x  javascript/\n> drwxr-xr-x  typescript/\n> drwxr-xr-x  react/`}

# cat projects.md
${projects.map(p => `> [*] ${p}`).join('\n') || `> [*] Add your projects above`}

# cat links.txt
${form.githubUser ? `> github  -> https://github.com/${form.githubUser}` : ''}
${form.twitterUser ? `> twitter -> https://twitter.com/${form.twitterUser}` : ''}
${form.email ? `> mail    -> ${form.email}` : ''}

# ./run --mode=github-stats
\`\`\`

![${form.githubUser || 'username'}'s GitHub stats](https://github-readme-stats.vercel.app/api?username=${form.githubUser || 'username'}&show_icons=true&theme=chartreuse-dark&hide_border=true)`;
}

// ─── Profile Form ─────────────────────────────────────────────────────────────
function ProfileForm({
  template,
  onGenerate,
  onBack,
}: {
  template: ProfileTemplate;
  onGenerate: (data: ProfileFormData) => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState<ProfileFormData>({
    name: '', title: '', bio: '', githubUser: '', location: '',
    email: '', website: '', skills: '', featuredProjects: '',
    currentWork: '', funFact: '', twitterUser: '', linkedinUser: '',
  });

  const set = (k: keyof ProfileFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const inputClass = "w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-[#e6edf3] focus:outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/5 transition-all placeholder:text-white/20 font-sans";

  return (
    <div className="flex flex-col h-full overflow-y-auto digital-vacuum-scroll">
      <div className="p-6 border-b border-white/[0.06] flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-md text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">{template.preview}</span>
          <div>
            <p className="text-[13px] font-semibold text-[#e6edf3]">{template.name} Template</p>
            <p className="text-[11px] text-white/30">{template.description}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5 flex-1">
        {/* Identity */}
        <div>
          <p className="text-[10px] tracking-[0.1em] uppercase text-white/30 font-bold mb-3">Identity</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">Full name *</label>
              <input className={inputClass} placeholder="Ada Lovelace" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">GitHub username *</label>
              <input className={inputClass} placeholder="ada-lovelace" value={form.githubUser} onChange={set('githubUser')} />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-[11px] text-white/40 mb-1 block">Title / tagline</label>
            <input className={inputClass} placeholder="Full-Stack Developer · Open Source Enthusiast" value={form.title} onChange={set('title')} />
          </div>
          <div className="mt-3">
            <label className="text-[11px] text-white/40 mb-1 block">Short bio</label>
            <textarea className={`${inputClass} resize-none`} rows={2} placeholder="I build tools that help developers ship faster." value={form.bio} onChange={set('bio')} />
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-[10px] tracking-[0.1em] uppercase text-white/30 font-bold mb-3">Details</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">Location</label>
              <input className={inputClass} placeholder="San Francisco, CA" value={form.location} onChange={set('location')} />
            </div>
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">Email</label>
              <input className={inputClass} placeholder="ada@example.com" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">Website</label>
              <input className={inputClass} placeholder="ada.dev" value={form.website} onChange={set('website')} />
            </div>
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">Currently working on</label>
              <input className={inputClass} placeholder="an open-source CLI tool" value={form.currentWork} onChange={set('currentWork')} />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-[11px] text-white/40 mb-1 block">Fun fact</label>
            <input className={inputClass} placeholder="I can solve a Rubik's cube in under 2 minutes" value={form.funFact} onChange={set('funFact')} />
          </div>
        </div>

        {/* Skills */}
        <div>
          <p className="text-[10px] tracking-[0.1em] uppercase text-white/30 font-bold mb-3">Skills</p>
          <label className="text-[11px] text-white/40 mb-1 block">Technologies (comma-separated)</label>
          <textarea className={`${inputClass} resize-none`} rows={2} placeholder="TypeScript, React, Node.js, PostgreSQL, Docker" value={form.skills} onChange={set('skills')} />
        </div>

        {/* Projects */}
        <div>
          <p className="text-[10px] tracking-[0.1em] uppercase text-white/30 font-bold mb-3">Featured Projects</p>
          <label className="text-[11px] text-white/40 mb-1 block">One project per line</label>
          <textarea className={`${inputClass} resize-none`} rows={3} placeholder={"smart-readme — AI README generator\ncli-kit — Developer CLI toolbox"} value={form.featuredProjects} onChange={set('featuredProjects')} />
        </div>

        {/* Social */}
        <div>
          <p className="text-[10px] tracking-[0.1em] uppercase text-white/30 font-bold mb-3">Social</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">Twitter / X handle</label>
              <input className={inputClass} placeholder="adalovelace" value={form.twitterUser} onChange={set('twitterUser')} />
            </div>
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">LinkedIn username</label>
              <input className={inputClass} placeholder="ada-lovelace" value={form.linkedinUser} onChange={set('linkedinUser')} />
            </div>
          </div>
        </div>

        <button
          onClick={() => onGenerate(form)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95 shadow-[0_2px_8px_rgba(0,188,212,0.25)] hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #00bcd4 0%, #7c3aed 100%)' }}
        >
          <Sparkles className="w-4 h-4" />
          Generate Profile README
        </button>
      </div>
    </div>
  );
}

// ─── Template Picker ──────────────────────────────────────────────────────────
function TemplatePicker({ onSelect }: { onSelect: (t: ProfileTemplate) => void }) {
  return (
    <div className="p-6 flex flex-col h-full overflow-y-auto digital-vacuum-scroll">
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-[#e6edf3] mb-1">Choose a template</h2>
        <p className="text-[12px] text-white/40">Each template generates a different visual style for your GitHub profile page.</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {PROFILE_TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className="group flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all text-left"
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 border border-white/10"
              style={{ background: t.bg }}
            >
              {t.preview}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[13px] font-semibold text-[#e6edf3]">{t.name}</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                  style={{ background: `${t.accent}22`, color: t.accent }}
                >
                  {t.style}
                </span>
              </div>
              <p className="text-[12px] text-white/40 truncate">{t.description}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Landing Hero ─────────────────────────────────────────────────────────────
function LandingHero({ onSelectMode }: { onSelectMode: (m: 'repo' | 'profile') => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
      {/* Hero text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center mb-12 max-w-2xl"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-400 text-[11px] font-mono mb-6">
          <Sparkles className="w-3 h-3" />
          AI-powered README generation
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#e6edf3] tracking-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
          Your README,{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #00bcd4, #7c3aed)' }}
          >
            written for you
          </span>
        </h1>
        <p className="text-[15px] text-white/40 leading-relaxed max-w-lg mx-auto">
          Paste a GitHub URL to document any repository — or build a standout profile README with hand-crafted templates.
        </p>
      </motion.div>

      {/* Mode cards */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-2xl"
      >
        {/* Repo README card */}
        <button
          onClick={() => onSelectMode('repo')}
          className="group relative p-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-cyan-400/30 transition-all text-left overflow-hidden"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'radial-gradient(circle at 30% 50%, rgba(0,188,212,0.05) 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#e6edf3] mb-2">Repository README</h3>
            <p className="text-[12px] text-white/40 leading-relaxed mb-4">
              Paste any public GitHub repo URL. AI analyzes the codebase and writes accurate, structured documentation.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Tone control', 'Live editor', 'Emoji toggle'].map(f => (
                <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 font-mono">{f}</span>
              ))}
            </div>
          </div>
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
            <ArrowRight className="w-4 h-4 text-cyan-400" />
          </div>
        </button>

        {/* Profile README card */}
        <button
          onClick={() => onSelectMode('profile')}
          className="group relative p-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-violet-400/30 transition-all text-left overflow-hidden"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'radial-gradient(circle at 70% 50%, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center mb-4">
              <User className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#e6edf3] mb-2">Profile README</h3>
            <p className="text-[12px] text-white/40 leading-relaxed mb-4">
              Pick from 5 handcrafted templates. Fill in your info and generate a GitHub profile page that actually stands out.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['5 templates', 'Badges & stats', 'One-click copy'].map(f => (
                <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-400/10 text-violet-400 font-mono">{f}</span>
              ))}
            </div>
          </div>
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
            <ArrowRight className="w-4 h-4 text-violet-400" />
          </div>
        </button>
      </motion.div>

      {/* Template previews */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="mt-10 flex items-center gap-3"
      >
        <span className="text-[11px] text-white/25">Profile templates:</span>
        <div className="flex gap-2">
          {PROFILE_TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => onSelectMode('profile')}
              title={t.name}
              className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-sm hover:scale-110 transition-transform"
              style={{ background: t.bg }}
            >
              {t.preview}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  // Global
  const [mode, setMode] = useState<AppMode>('landing');
  const [showSplash, setShowSplash] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("Copied to clipboard");

  // Repo mode
  const [markdown, setMarkdown] = useState("# Project Title\n\nWrite a brilliant README here...\n\n## Features\n\n- Beautiful design\n- Intelligent tone matching\n- Easy to use");
  const [tone, setTone] = useState("Professional");
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [repoStats, setRepoStats] = useState<{ stars: number; forks: number } | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [isToneOpen, setIsToneOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Profile mode
  const [profileStep, setProfileStep] = useState<ProfileStep>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ProfileTemplate | null>(null);
  const [profileMarkdown, setProfileMarkdown] = useState("");

  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const isSyncingLeft = useRef(false);
  const isSyncingRight = useRef(false);

  // Persist prefs
  useEffect(() => {
    try {
      const savedEmoji = localStorage.getItem("readme-emoji-pref");
      if (savedEmoji !== null) setIncludeEmojis(savedEmoji === "true");
      const savedInstructions = localStorage.getItem("readme-special-instructions");
      if (savedInstructions) { setSpecialInstructions(savedInstructions); setShowInstructions(true); }
    } catch { }
  }, []);
  useEffect(() => { try { localStorage.setItem("readme-emoji-pref", String(includeEmojis)); } catch { } }, [includeEmojis]);
  useEffect(() => { try { localStorage.setItem("readme-special-instructions", specialInstructions); } catch { } }, [specialInstructions]);

  // Click outside dropdown
  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsToneOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const highlightedMarkdown = useMemo(() => highlightMarkdown(markdown), [markdown]);
  const activeMarkdown = mode === 'profile' ? profileMarkdown : markdown;
  const highlightedProfileMarkdown = useMemo(() => highlightMarkdown(profileMarkdown), [profileMarkdown]);

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (overlayRef.current) { overlayRef.current.scrollTop = e.currentTarget.scrollTop; overlayRef.current.scrollLeft = e.currentTarget.scrollLeft; }
    if (!previewRef.current) return;
    if (isSyncingLeft.current) { isSyncingLeft.current = false; return; }
    isSyncingRight.current = true;
    const pct = e.currentTarget.scrollTop / (e.currentTarget.scrollHeight - e.currentTarget.clientHeight);
    previewRef.current.scrollTop = pct * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
  };

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!editorRef.current) return;
    if (isSyncingRight.current) { isSyncingRight.current = false; return; }
    isSyncingLeft.current = true;
    const pct = e.currentTarget.scrollTop / (e.currentTarget.scrollHeight - e.currentTarget.clientHeight);
    editorRef.current.scrollTop = pct * (editorRef.current.scrollHeight - editorRef.current.clientHeight);
  };

  const handleCopy = (text?: string) => {
    navigator.clipboard.writeText(text || activeMarkdown);
    setToastMsg("Copied to clipboard");
    setShowToast(true);
  };

  const handleGenerate = async () => {
    if (!url) { alert("Please enter a GitHub URL"); return; }
    setIsLoading(true);
    setMarkdown("Fetching repository data from GitHub...");
    setRepoStats(null);
    try {
      const githubRes = await fetch('/api/github', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const repoData = await githubRes.json();
      if (!githubRes.ok) { setMarkdown(`Error fetching GitHub data: ${repoData.error}`); return; }
      if (repoData.stars !== undefined && repoData.forks !== undefined) setRepoStats({ stars: repoData.stars, forks: repoData.forks });
      setMarkdown("GitHub data fetched. Generating README with AI...");
      const generateRes = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ repoData, tone, includeEmojis, specialInstructions: specialInstructions.trim() || undefined }) });
      const generateData = await generateRes.json();
      if (!generateRes.ok) { setMarkdown(`Error generating README: ${generateData.error}`); return; }
      setMarkdown(generateData.markdown);
    } catch { setMarkdown("Failed to process request. Please try again."); }
    finally { setIsLoading(false); }
  };

  const handleProfileGenerate = (form: ProfileFormData) => {
    if (!selectedTemplate) return;
    const result = generateProfileReadme(selectedTemplate, form);
    setProfileMarkdown(result);
    setProfileStep('result');
  };

  const hasActiveInstructions = specialInstructions.trim().length > 0;

  const goBack = () => {
    if (mode === 'profile' && profileStep === 'form') { setProfileStep('template'); return; }
    if (mode === 'profile' && profileStep === 'result') { setProfileStep('form'); return; }
    setMode('landing');
    if (mode === 'profile') { setProfileStep('template'); setSelectedTemplate(null); setProfileMarkdown(''); }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="relative h-screen w-screen flex flex-col font-geist-mono overflow-hidden selection:bg-blue-500/20 z-[1]" style={{ background: 'transparent' }}>
      <AnimatePresence>
        {showSplash && <LoadingOverlay onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {/* Ambient Orbs */}
      <div style={{ position: 'fixed', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,188,212,0.07) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0 }} />

      <CodeRain speedFactor={showSplash ? 0.2 : mode === 'landing' ? 0.6 : 1} />

      {/* ── Header ── */}
      <header
        className="relative z-40 w-full h-[48px] flex items-center justify-between px-6"
        style={{ background: 'rgba(10, 10, 10, 0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
      >
        {/* Left: logo + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode('landing')}
            className="flex items-center group gap-2"
          >
            <div className="inline-flex items-center justify-center transition-all duration-200 border bg-white/[0.08] hover:bg-cyan-400/12 hover:border-cyan-400/70" style={{ width: '30px', height: '30px', border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: '8px', marginRight: '2px' }}>
              <Sparkles className="w-4 h-4 text-accent-primary/60 transition-colors group-hover:text-cyan-400" />
            </div>
            <span className="text-sm font-semibold text-[#e6edf3] tracking-tight" style={{ letterSpacing: '-0.01em' }}>Smart README</span>
          </button>

          {mode !== 'landing' && (
            <div className="flex items-center gap-2 text-white/30">
              <span className="text-white/20">/</span>
              <span className="text-[12px]">
                {mode === 'repo' ? (
                  <span className="flex items-center gap-1.5"><BookOpen className="w-3 h-3 text-cyan-400" /><span className="text-cyan-400/80">Repository</span></span>
                ) : (
                  <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-violet-400" /><span className="text-violet-400/80">Profile {profileStep !== 'template' ? `· ${profileStep}` : ''}</span></span>
                )}
              </span>
            </div>
          )}

          {/* Repo URL input — only in repo mode */}
          {mode === 'repo' && (
            <div className="flex-1 max-w-md relative group mx-4">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isLoading ? "bg-accent-primary animate-pulse" : "bg-white/20"}`} />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="Paste a GitHub repo URL..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md pl-8 pr-4 py-1.5 text-[13px] text-[#e6edf3] focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-cyan-400/5 transition-all placeholder:text-white/20 font-sans"
              />
              {isLoading && <div className="absolute inset-y-0 right-3 flex items-center"><div className="w-3 h-3 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" /></div>}
            </div>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3">
          {mode === 'repo' && (
            <>
              {/* Tone dropdown */}
              <div className="relative z-[9999]" ref={dropdownRef}>
                <button onClick={() => setIsToneOpen(!isToneOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] text-[#e6edf3] border border-white/10 bg-white/[0.04] hover:border-cyan-400/30 transition-all">
                  <span>{tone}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${isToneOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isToneOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 w-48 bg-[#161b22] shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-1 z-[9999] backdrop-blur-xl"
                      style={{ top: '100%', marginTop: '2px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0 0 8px 8px' }}
                    >
                      {TONES.map(option => (
                        <button key={option} onClick={() => { setTone(option); setIsToneOpen(false); }} className={`w-full text-left px-3.5 py-2 rounded-md text-[13px] transition-all ${tone === option ? "text-cyan-400 bg-cyan-400/10" : "text-[#e6edf3] hover:bg-cyan-400/10 hover:text-cyan-400"}`}>
                          {option}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Generate button */}
              <div className="relative" title={hasActiveInstructions ? "Custom instructions active" : undefined}>
                <button onClick={handleGenerate} disabled={isLoading} className="flex items-center gap-2 px-5 py-1.5 rounded-full text-[11px] font-semibold text-white transition-all active:scale-95 shadow-[0_2px_8px_rgba(0,188,212,0.25)] hover:opacity-90 disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #00bcd4 0%, #7c3aed 100%)' }}>
                  <Sparkles className="w-3 h-3" />Generate
                </button>
                {hasActiveInstructions && <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full" />}
              </div>
            </>
          )}

          {mode === 'profile' && profileStep === 'result' && (
            <button onClick={() => handleCopy(profileMarkdown)} className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold text-white transition-all active:scale-95 hover:opacity-90" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #00bcd4 100%)' }}>
              <Download className="w-3 h-3" />Copy README
            </button>
          )}

          {/* Back button when not on landing */}
          {mode !== 'landing' && (
            <button onClick={goBack} className="text-[12px] text-white/30 hover:text-white/60 transition-colors px-2 py-1 flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" />
              {mode === 'profile' && profileStep !== 'template' ? 'Back' : 'Home'}
            </button>
          )}
        </div>

        {/* Repo stats badge */}
        {mode === 'repo' && repoStats && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50">
            <OdometerStats stars={repoStats.stars} forks={repoStats.forks} />
          </div>
        )}
      </header>

      {/* ── Toolbar (repo mode only) ── */}
      {!showSplash && mode === 'repo' && (
        <>
          <div className="toolbar-row">
            <div className="flex items-center gap-3">
              <span className={`pill-toggle-label ${includeEmojis ? 'active' : ''}`}>
                <span className="emoji-sparkle">✨</span>Emojis
              </span>
              <button type="button" className={`pill-toggle ${includeEmojis ? 'active' : ''}`} onClick={() => setIncludeEmojis(!includeEmojis)} aria-label="Toggle emojis">
                <div className="pill-toggle-dot" />
              </button>
            </div>
            <div className="toolbar-separator" />
            <button type="button" className={`instructions-trigger ${showInstructions ? 'open' : ''}`} onClick={() => setShowInstructions(!showInstructions)}>
              <span>⚙ Special Instructions</span>
              <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
          </div>
          <div className={`instructions-panel ${showInstructions ? 'open' : ''}`}>
            <div className="instructions-panel-inner">
              <textarea className="glass-textarea" value={specialInstructions} onChange={(e) => { if (e.target.value.length <= 300) setSpecialInstructions(e.target.value); }} maxLength={300} placeholder="e.g. Add contributor: Mr XYZ  ·  University project CS401  ·  Include Windows 11 setup" />
              <div className={`char-counter ${specialInstructions.length > 250 ? 'near-limit' : ''}`}>{specialInstructions.length}/300</div>
            </div>
          </div>
        </>
      )}

      {/* ── Main Content ── */}
      <AnimatePresence mode="wait">
        {/* Landing */}
        {!showSplash && mode === 'landing' && (
          <motion.div key="landing" className="flex-1 flex overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <LandingHero onSelectMode={(m) => { setMode(m); }} />
          </motion.div>
        )}

        {/* Repo README editor */}
        {!showSplash && mode === 'repo' && (
          <motion.main key="repo" className="flex-1 flex gap-6 p-6 overflow-hidden relative z-10" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            {/* Editor Pane */}
            <div className="flex-1 flex flex-col glass-panel relative group overflow-hidden">
              <div className="lume-wash" />
              {isLoading && <div className="scan-line" />}
              <div className="px-6 h-[36px] border-b flex items-center justify-between bg-white/[0.01]" style={{ borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-[10px] tracking-[0.12em] text-white/30 uppercase font-bold">EDITOR</span>
                <div className="flex gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-white/5" /><div className="w-1.5 h-1.5 rounded-full bg-white/5" /></div>
              </div>
              <div className="flex-1 relative overflow-hidden">
                <div ref={overlayRef} className="syntax-overlay editor-shared-styles digital-vacuum-scroll">{highlightedMarkdown}</div>
                <textarea ref={editorRef} value={markdown} onChange={(e) => setMarkdown(e.target.value)} onScroll={handleEditorScroll} className="absolute inset-0 w-full bg-transparent text-transparent resize-none focus:outline-none editor-shared-styles digital-vacuum-scroll z-10" spellCheck="false" style={{ caretColor: '#e6edf3', scrollbarColor: "rgba(255,255,255,0.03) transparent" }} />
              </div>
              <div className="absolute bottom-6 right-8 flex items-center gap-4 pointer-events-none opacity-40">
                <span className="text-[9px] font-mono text-teal-400/60 uppercase">UTF-8</span>
                <span className="text-[9px] font-mono text-pink-400/60 uppercase">Markdown</span>
              </div>
            </div>

            {/* Preview Pane */}
            <div className="flex-1 flex flex-col glass-panel relative overflow-hidden">
              <div className="lume-wash" />
              <div className="px-6 h-[36px] border-b flex items-center justify-between bg-white/[0.01]" style={{ borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-[10px] tracking-[0.12em] text-white/30 uppercase font-bold">RENDER</span>
                <div className="flex items-center gap-4">
                  <button onClick={() => handleCopy()} className="p-1 text-white/20 hover:text-white/60 transition-all hover:scale-110" title="Copy"><Download className="w-3.5 h-3.5" /></button>
                  <button className="p-1 text-white/20 hover:text-white/60 transition-all hover:scale-110"><Settings2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div ref={previewRef} onScroll={handlePreviewScroll} className="flex-1 p-[32px_40px] overflow-y-auto digital-vacuum-scroll">
                <div className="max-w-2xl mx-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                    h1: ({ node, ...props }) => <h1 className="text-[26px] font-bold mt-0 mb-3 tracking-tight text-[#e6edf3] border-b border-white/5 pb-2" style={{ borderBottomColor: 'rgba(255,255,255,0.08)' }} {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-medium mt-10 mb-4 pb-2 text-[#79c0ff]" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-medium mt-8 mb-3 text-[#79c0ff]" {...props} />,
                    p: ({ node, ...props }) => <p className="text-[#cdd9e5] leading-relaxed mb-4" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-4 text-[#cdd9e5]" {...props} />,
                    li: ({ node, ...props }) => <li className="leading-relaxed mb-1" {...props} />,
                    a: ({ node, ...props }) => <a className="text-[#00bcd4] hover:underline transition-colors" {...props} />,
                    strong: ({ node, ...props }) => <strong className="text-[#ffa657] font-semibold" {...props} />,
                    hr: ({ node, ...props }) => <hr className="my-8 border-t" style={{ borderColor: 'rgba(48,54,61,0.6)' }} {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="border-left border-l-3 border-[#00bcd4] pl-4 my-4 italic text-[#8b949e]" {...props} />,
                    code: ({ node, inline, className, children, ...props }: any) => inline
                      ? <code className="bg-[#6e7681]/15 text-[#ff7b72] px-1.5 py-0.5 rounded font-mono text-[12px]" {...props}>{children}</code>
                      : <pre className="bg-[#0d1117] p-6 rounded-md overflow-x-auto my-8 border border-white/5 shadow-inner" style={{ borderColor: 'rgba(48,54,61,0.8)' }}><code className="font-mono text-[12px] text-[#e6edf3]" {...props}>{children}</code></pre>,
                    table: ({ node, ...props }) => <div className="overflow-x-auto my-8 rounded-lg border border-white/5"><table className="w-full text-left border-collapse" {...props} /></div>,
                    th: ({ node, ...props }) => <th className="bg-white/5 border-b border-white/5 p-4 font-bold text-white/40 text-[10px] tracking-widest uppercase" {...props} />,
                    td: ({ node, ...props }) => <td className="border-b border-white/5 p-4 text-[13px] text-[#94A3B8]" {...props} />,
                  }}>{markdown}</ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.main>
        )}

        {/* Profile README */}
        {!showSplash && mode === 'profile' && (
          <motion.main key="profile" className="flex-1 flex gap-6 p-6 overflow-hidden relative z-10" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>

            {/* Left panel: template picker / form */}
            <div className="w-[380px] flex-shrink-0 flex flex-col glass-panel relative overflow-hidden">
              <div className="lume-wash" />
              <AnimatePresence mode="wait">
                {profileStep === 'template' && (
                  <motion.div key="tpl" className="flex-1 overflow-hidden" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.25 }}>
                    <TemplatePicker onSelect={(t) => { setSelectedTemplate(t); setProfileStep('form'); }} />
                  </motion.div>
                )}
                {profileStep === 'form' && selectedTemplate && (
                  <motion.div key="form" className="flex-1 overflow-hidden flex flex-col" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.25 }}>
                    <ProfileForm template={selectedTemplate} onGenerate={handleProfileGenerate} onBack={() => setProfileStep('template')} />
                  </motion.div>
                )}
                {profileStep === 'result' && (
                  <motion.div key="result-sidebar" className="flex-1 flex flex-col p-6 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <p className="text-[13px] font-semibold text-[#e6edf3]">Profile README ready</p>
                      </div>
                      <p className="text-[11px] text-white/40">Template: {selectedTemplate?.name}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                        <p className="text-[11px] text-white/30 mb-1">How to use this</p>
                        <p className="text-[12px] text-white/60 leading-relaxed">Create a repo named <code className="text-cyan-400 bg-cyan-400/10 px-1 rounded text-[11px]">{`<your-username>`}</code> on GitHub, then paste this markdown into its README.md file.</p>
                      </div>
                      <button onClick={() => { setProfileStep('template'); setSelectedTemplate(null); setProfileMarkdown(''); }} className="w-full text-[12px] text-white/40 hover:text-white/70 py-2 border border-white/[0.07] rounded-lg hover:bg-white/[0.03] transition-all">
                        ← Try another template
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right panel: preview */}
            <div className="flex-1 flex flex-col glass-panel relative overflow-hidden">
              <div className="lume-wash" />
              <div className="px-6 h-[36px] border-b flex items-center justify-between bg-white/[0.01]" style={{ borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-[10px] tracking-[0.12em] text-white/30 uppercase font-bold">
                  {profileStep === 'result' ? 'GENERATED README' : 'PREVIEW'}
                </span>
                {profileStep === 'result' && (
                  <button onClick={() => handleCopy(profileMarkdown)} className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold text-white hover:opacity-90 transition-all" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #00bcd4 100%)' }}>
                    <Download className="w-3 h-3" />Copy
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto digital-vacuum-scroll">
                {profileStep === 'result' && profileMarkdown ? (
                  <div className="flex h-full">
                    {/* Raw markdown */}
                    <div className="flex-1 relative overflow-hidden border-r border-white/[0.05]">
                      <div className="px-4 py-2 border-b border-white/[0.05]">
                        <span className="text-[9px] text-white/20 uppercase tracking-widest font-mono">Raw Markdown</span>
                      </div>
                      <div className="p-4 overflow-y-auto h-[calc(100%-36px)] digital-vacuum-scroll">
                        <div className="syntax-overlay-static">
                          {highlightedProfileMarkdown}
                        </div>
                      </div>
                    </div>
                    {/* Rendered */}
                    <div className="flex-1 overflow-y-auto digital-vacuum-scroll">
                      <div className="px-4 py-2 border-b border-white/[0.05]">
                        <span className="text-[9px] text-white/20 uppercase tracking-widest font-mono">Rendered</span>
                      </div>
                      <div className="p-6">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                          h1: ({ node, ...props }) => <h1 className="text-[22px] font-bold mt-0 mb-3 text-[#e6edf3]" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-lg font-medium mt-8 mb-3 text-[#79c0ff]" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-base font-medium mt-6 mb-2 text-[#79c0ff]" {...props} />,
                          p: ({ node, ...props }) => <p className="text-[#cdd9e5] leading-relaxed mb-3 text-[13px]" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mb-3 text-[#cdd9e5] text-[13px]" {...props} />,
                          li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                          a: ({ node, ...props }) => <a className="text-[#00bcd4] hover:underline transition-colors" {...props} />,
                          strong: ({ node, ...props }) => <strong className="text-[#ffa657] font-semibold" {...props} />,
                          hr: ({ node, ...props }) => <hr className="my-6 border-t border-white/10" {...props} />,
                          blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-[#00bcd4] pl-4 my-3 italic text-[#8b949e] text-[13px]" {...props} />,
                          code: ({ node, inline, className, children, ...props }: any) => inline
                            ? <code className="bg-[#6e7681]/15 text-[#ff7b72] px-1 py-0.5 rounded font-mono text-[11px]" {...props}>{children}</code>
                            : <pre className="bg-[#0d1117] p-4 rounded-md overflow-x-auto my-4 border border-white/5"><code className="font-mono text-[11px] text-[#e6edf3]" {...props}>{children}</code></pre>,
                          img: ({ node, ...props }) => <img className="max-w-full rounded-md my-2" {...props} alt={props.alt || ''} />,
                        }}>{profileMarkdown}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Empty state / hint
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-2xl border border-white/[0.07] bg-white/[0.02] flex items-center justify-center mb-4 text-3xl">
                      {selectedTemplate?.preview || '👤'}
                    </div>
                    <p className="text-[14px] font-medium text-white/30 mb-2">
                      {profileStep === 'template' ? 'Pick a template to get started' : 'Fill in your details and generate'}
                    </p>
                    <p className="text-[12px] text-white/20 max-w-xs">
                      {profileStep === 'template'
                        ? 'Choose from 5 distinct visual styles. Your profile README preview will appear here.'
                        : `Your ${selectedTemplate?.name} profile README will render here.`}
                    </p>
                    {selectedTemplate && profileStep === 'form' && (
                      <div className="mt-6 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] text-left max-w-xs">
                        <p className="text-[11px] text-white/30 mb-2 uppercase tracking-widest">Selected template</p>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{selectedTemplate.preview}</span>
                          <div>
                            <p className="text-[13px] font-semibold text-[#e6edf3]">{selectedTemplate.name}</p>
                            <p className="text-[11px] text-white/30">{selectedTemplate.style}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      <Toast message={toastMsg} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}