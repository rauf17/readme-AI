"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeRain from "@/components/CodeRain";
import Toast from "@/components/Toast";
import OdometerStats from "@/components/OdometerStats";
import LoadingOverlay from "@/components/LoadingOverlay";
import {
  Download, Settings2, Sparkles, ChevronDown,
  ArrowRight, User, BookOpen, ChevronLeft, Copy, Check, Globe, MapPin, Mail, Zap
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type AppMode = 'landing' | 'repo' | 'profile';
type ProfileStep = 'select' | 'fill';

interface ProfileTemplate {
  id: string;
  name: string;
  tagline: string;
  accent: string;
  bg: string;
  emoji: string;
  style: string;
}

interface ProfileForm {
  name: string;
  title: string;
  bio: string;
  github: string;
  location: string;
  email: string;
  website: string;
  skills: string;
  projects: string;
  currentWork: string;
  funFact: string;
  twitter: string;
  linkedin: string;
}

// ─── Templates ────────────────────────────────────────────────────────────────
const TEMPLATES: ProfileTemplate[] = [
  { id: 'obsidian', name: 'Obsidian', tagline: 'Dark, cinematic, dev-forward', accent: '#00bcd4', bg: '#0d1117', emoji: '🌑', style: 'dark' },
  { id: 'dawn',     name: 'Dawn',     tagline: 'Warm, clean, approachable',    accent: '#f97316', bg: '#fffbf5', emoji: '🌅', style: 'light' },
  { id: 'minimal',  name: 'Minimal',  tagline: 'Type-first, no noise',         accent: '#64748b', bg: '#ffffff', emoji: '◻',  style: 'minimal' },
  { id: 'aurora',   name: 'Aurora',   tagline: 'Purple & teal, expressive',    accent: '#8b5cf6', bg: '#0f0c29', emoji: '🌌', style: 'colorful' },
  { id: 'terminal', name: 'Terminal', tagline: 'Green-on-black, hacker chic',  accent: '#22c55e', bg: '#000000', emoji: '⌨',  style: 'terminal' },
];

const TONES = ["Professional", "Beginner-friendly", "Funny", "Corporate"];

const DEFAULT_FORM: ProfileForm = {
  name: '', title: '', bio: '', github: '', location: '',
  email: '', website: '', skills: '', projects: '',
  currentWork: '', funFact: '', twitter: '', linkedin: '',
};

// ─── README Generator ─────────────────────────────────────────────────────────
function buildReadme(template: ProfileTemplate, f: ProfileForm): string {
  const skills = f.skills.split(',').map(s => s.trim()).filter(Boolean);
  const projects = f.projects.split('\n').map(s => s.trim()).filter(Boolean);
  const name = f.name || 'Your Name';
  const title = f.title || 'Developer & Open Source Enthusiast';
  const bio = f.bio || 'Passionate about building things that matter.';
  const gh = f.github || 'username';

  if (template.id === 'obsidian') return `<div align="center">

# Hi, I'm ${name} 👋

**${title}**

*${bio}*

${f.location ? `📍 ${f.location}` : ''} ${f.website ? `· 🌐 [${f.website}](https://${f.website})` : ''}

---

</div>

## 🚀 About Me

${f.currentWork ? `- 🔭 Currently working on **${f.currentWork}**` : '- 🔭 Building something amazing'}
${f.funFact ? `- ⚡ Fun fact: ${f.funFact}` : ''}
${f.email ? `- 📫 Reach me at **${f.email}**` : ''}

## 🛠️ Tech Stack

\`\`\`
${skills.length ? skills.join('  ·  ') : 'TypeScript  ·  React  ·  Node.js  ·  Python'}
\`\`\`

## 📌 Featured Projects

${projects.length ? projects.map(p => `> **${p}**`).join('\n\n') : '> Add your featured projects'}

## 📊 GitHub Stats

<div align="center">

![GitHub stats](https://github-readme-stats.vercel.app/api?username=${gh}&show_icons=true&theme=tokyonight&hide_border=true)

![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=${gh}&layout=compact&theme=tokyonight&hide_border=true)

</div>

---

<div align="center">

${f.twitter ? `[![Twitter](https://img.shields.io/badge/Twitter-%231DA1F2.svg?style=flat&logo=Twitter&logoColor=white)](https://twitter.com/${f.twitter})` : ''}
${f.linkedin ? `[![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/${f.linkedin})` : ''}
${f.github ? `[![GitHub](https://img.shields.io/badge/GitHub-%23121011.svg?style=flat&logo=github&logoColor=white)](https://github.com/${gh})` : ''}

*⭐ Star my repos if you find them useful!*

</div>`;

  if (template.id === 'dawn') return `# ${name} ☀️

**${title}**

${bio}

${f.location ? `📍 ${f.location}` : ''} ${f.website ? `· [${f.website}](https://${f.website})` : ''}

---

### What I'm up to

${f.currentWork ? `🔭 **Currently:** ${f.currentWork}` : '🔭 **Currently:** Working on exciting projects'}

${f.funFact ? `💡 **Fun fact:** ${f.funFact}` : ''}

### Tools I work with

${skills.length ? skills.map(s => `\`${s}\``).join(' ') : '`JavaScript` `TypeScript` `React` `Node.js`'}

### Things I've built

${projects.length ? projects.map(p => `→ ${p}`).join('\n') : '→ Add your projects above'}

---

### Connect with me

${f.email ? `📧 [${f.email}](mailto:${f.email})` : ''}
${f.twitter ? `🐦 [@${f.twitter}](https://twitter.com/${f.twitter})` : ''}
${f.linkedin ? `💼 [LinkedIn](https://linkedin.com/in/${f.linkedin})` : ''}

![Profile views](https://komarev.com/ghpvc/?username=${gh}&color=orange&style=flat)`;

  if (template.id === 'minimal') return `# ${name}

${title}

${bio}

---

${f.location ? `Location: ${f.location}` : ''}
${f.currentWork ? `Currently: ${f.currentWork}` : ''}
${f.website ? `Web: ${f.website}` : ''}
${f.email ? `Mail: ${f.email}` : ''}

---

**Skills:** ${skills.length ? skills.join(', ') : 'JavaScript, TypeScript, React, Node.js'}

**Projects:**

${projects.length ? projects.map(p => `- ${p}`).join('\n') : '- Add your projects above'}

---

${f.twitter ? `[Twitter](https://twitter.com/${f.twitter})` : ''} ${f.linkedin ? `· [LinkedIn](https://linkedin.com/in/${f.linkedin})` : ''} ${f.github ? `· [GitHub](https://github.com/${gh})` : ''}`;

  if (template.id === 'aurora') return `<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=${encodeURIComponent(name)}&fontSize=70&fontColor=fff&animation=twinkling" />

### ✨ ${title} ✨

> *${bio}*

${f.location ? `🌍 ${f.location}` : ''} ${f.website ? `· 🌐 [${f.website}](https://${f.website})` : ''}

</div>

---

### 🌈 About Me

${f.currentWork ? `🚧 Building **${f.currentWork}**` : '🚧 Building something amazing'}
${f.funFact ? `🎲 ${f.funFact}` : ''}
${f.email ? `💌 ${f.email}` : ''}

### 🛸 My Stack

${skills.length ? skills.map(s => `![${s}](https://img.shields.io/badge/${encodeURIComponent(s)}-blueviolet?style=for-the-badge)`).join(' ') : '![JavaScript](https://img.shields.io/badge/JavaScript-blueviolet?style=for-the-badge)'}

### 🌟 Featured Projects

${projects.length ? projects.map(p => `🔮 **${p}**`).join('\n\n') : '🔮 **Add your featured projects**'}

---

<div align="center">

${f.twitter ? `[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/${f.twitter})` : ''}
${f.linkedin ? `[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/${f.linkedin})` : ''}

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" />

</div>`;

  // terminal
  return `\`\`\`bash
# whoami
> ${name}

# cat about.txt
> ${title}
> ${bio}
${f.location ? `> location :: ${f.location}` : ''}
${f.currentWork ? `> status   :: ${f.currentWork}` : ''}

# ls -la skills/
${skills.length ? skills.map(s => `> drwxr-xr-x  ${s}/`).join('\n') : `> drwxr-xr-x  javascript/\n> drwxr-xr-x  typescript/\n> drwxr-xr-x  react/`}

# cat projects.md
${projects.length ? projects.map(p => `> [*] ${p}`).join('\n') : `> [*] Add your projects`}

# cat links.txt
${f.github ? `> github  -> https://github.com/${gh}` : ''}
${f.twitter ? `> twitter -> https://twitter.com/${f.twitter}` : ''}
${f.email ? `> mail    -> ${f.email}` : ''}
\`\`\`

![GitHub stats](https://github-readme-stats.vercel.app/api?username=${gh}&show_icons=true&theme=chartreuse-dark&hide_border=true)`;
}

// ─── Markdown Syntax Highlight ────────────────────────────────────────────────
function highlightMarkdown(text: string): React.ReactNode[] {
  return text.split('\n').map((line, i) => {
    let content: React.ReactNode = line;
    if (line.startsWith('# ')) content = <span className="syn-h1">{line}</span>;
    else if (line.startsWith('## ')) content = <span className="syn-h2">{line}</span>;
    else if (line.startsWith('### ')) content = <span className="syn-h3">{line}</span>;
    else if (line.startsWith('- ') || line.startsWith('* ')) content = <span className="syn-list">{line}</span>;
    else if (line.startsWith('> ')) content = <span className="syn-blockquote">{line}</span>;
    else if (line.startsWith('```')) content = <span className="syn-code">{line}</span>;
    else {
      const parts: React.ReactNode[] = [];
      let remaining = line; let key = 0;
      while (remaining.length > 0) {
        const bold = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/);
        const code = remaining.match(/^(.*?)`([^`]+)`(.*)/);
        let first: { type: 'bold' | 'code'; index: number; match: RegExpMatchArray } | null = null;
        if (bold) first = { type: 'bold', index: bold[1].length, match: bold };
        if (code && (!first || code[1].length < first.index)) first = { type: 'code', index: code[1].length, match: code };
        if (first) {
          const m = first.match;
          if (m[1]) parts.push(<span key={key++} className="syn-text">{m[1]}</span>);
          parts.push(first.type === 'bold'
            ? <span key={key++} className="syn-bold">**{m[2]}**</span>
            : <span key={key++} className="syn-code">`{m[2]}`</span>);
          remaining = m[3];
        } else { parts.push(<span key={key++} className="syn-text">{remaining}</span>); remaining = ''; }
      }
      content = <>{parts}</>;
    }
    return <div key={i}>{content}{'\n'}</div>;
  });
}

// ─── Markdown Renderer (shared) ───────────────────────────────────────────────
const MD_COMPONENTS = {
  h1: ({ node, ...props }: any) => <h1 className="text-[22px] font-bold mt-0 mb-3 tracking-tight text-[#e6edf3] border-b border-white/[0.08] pb-2" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="text-lg font-semibold mt-8 mb-3 text-[#79c0ff]" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="text-base font-medium mt-6 mb-2 text-[#79c0ff]" {...props} />,
  p: ({ node, ...props }: any) => <p className="text-[#cdd9e5] leading-relaxed mb-3 text-[13px]" {...props} />,
  ul: ({ node, ...props }: any) => <ul className="list-disc list-inside space-y-1.5 mb-3 text-[#cdd9e5] text-[13px]" {...props} />,
  ol: ({ node, ...props }: any) => <ol className="list-decimal list-inside space-y-1.5 mb-3 text-[#cdd9e5] text-[13px]" {...props} />,
  li: ({ node, ...props }: any) => <li className="leading-relaxed" {...props} />,
  a: ({ node, ...props }: any) => <a className="text-[#00bcd4] hover:underline transition-colors" {...props} />,
  strong: ({ node, ...props }: any) => <strong className="text-[#ffa657] font-semibold" {...props} />,
  em: ({ node, ...props }: any) => <em className="text-[#cdd9e5]/80 italic" {...props} />,
  hr: ({ node, ...props }: any) => <hr className="my-6 border-t border-white/10" {...props} />,
  blockquote: ({ node, ...props }: any) => <blockquote className="border-l-2 border-[#00bcd4] pl-4 my-3 italic text-[#8b949e] text-[13px]" {...props} />,
  code: ({ node, inline, children, ...props }: any) => inline
    ? <code className="bg-[#6e7681]/15 text-[#ff7b72] px-1.5 py-0.5 rounded font-mono text-[11px]" {...props}>{children}</code>
    : <pre className="bg-[#0d1117] p-4 rounded-lg overflow-x-auto my-4 border border-white/[0.06]"><code className="font-mono text-[11px] text-[#e6edf3] leading-relaxed" {...props}>{children}</code></pre>,
  img: ({ node, ...props }: any) => <img className="max-w-full rounded-lg my-3" {...props} alt={props.alt || ''} />,
  table: ({ node, ...props }: any) => <div className="overflow-x-auto my-4 rounded-lg border border-white/[0.06]"><table className="w-full text-left border-collapse text-[12px]" {...props} /></div>,
  th: ({ node, ...props }: any) => <th className="bg-white/[0.04] border-b border-white/[0.06] px-4 py-2.5 font-semibold text-white/50 text-[10px] tracking-widest uppercase" {...props} />,
  td: ({ node, ...props }: any) => <td className="border-b border-white/[0.04] px-4 py-2.5 text-[#94A3B8]" {...props} />,
};

// ─── Live Profile Preview ─────────────────────────────────────────────────────
function ProfilePreview({
  template,
  form,
  isSample,
}: {
  template: ProfileTemplate | null;
  form: ProfileForm;
  isSample: boolean;
}) {
  const readme = useMemo(() => {
    if (!template) return null;
    const sampleForm: ProfileForm = isSample ? {
      name: 'Alex Chen', title: 'Full-Stack Developer & Open Source Builder',
      bio: 'Shipping fast, breaking things, fixing them faster.',
      github: 'alexchen', location: 'San Francisco, CA',
      email: 'alex@example.com', website: 'alexchen.dev',
      skills: 'TypeScript, React, Node.js, PostgreSQL, Docker',
      projects: 'smart-readme — AI README generator\ndevkit — CLI productivity tools',
      currentWork: 'a real-time collab editor', funFact: "I've contributed to 40+ OSS projects",
      twitter: 'alexchen', linkedin: 'alex-chen',
    } : form;
    return buildReadme(template, sampleForm);
  }, [template, form, isSample]);

  if (!template) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-10">
        <div className="w-20 h-20 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
          <User className="w-8 h-8 text-white/20" />
        </div>
        <div className="text-center">
          <p className="text-[14px] font-medium text-white/30 mb-1.5">Hover a template to preview</p>
          <p className="text-[12px] text-white/20 max-w-[240px] leading-relaxed">
            Pick a style from the left — your profile README will appear here, live.
          </p>
        </div>
        <div className="flex gap-2 mt-2">
          {TEMPLATES.map(t => (
            <div key={t.id} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-base"
              style={{ background: t.bg }}>
              {t.emoji}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto digital-vacuum-scroll">
      {/* Template badge */}
      <div className="sticky top-0 z-10 flex items-center gap-2 px-5 py-2.5 border-b border-white/[0.05]"
        style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="w-5 h-5 rounded-md flex items-center justify-center text-xs flex-shrink-0"
          style={{ background: template.bg, border: `1px solid ${template.accent}33` }}>
          {template.emoji}
        </div>
        <span className="text-[11px] text-white/40 font-mono">{template.name}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full ml-1 font-mono"
          style={{ background: `${template.accent}18`, color: template.accent }}>
          {template.style}
        </span>
        {isSample && (
          <span className="ml-auto text-[10px] text-white/25 italic">sample preview</span>
        )}
      </div>

      {/* Rendered markdown */}
      <div className="p-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
          {readme || ''}
        </ReactMarkdown>
      </div>
    </div>
  );
}

// ─── Profile Form ─────────────────────────────────────────────────────────────
function ProfileFormPanel({
  template,
  form,
  onChange,
  onGenerate,
  generated,
  onCopy,
  copied,
}: {
  template: ProfileTemplate;
  form: ProfileForm;
  onChange: (k: keyof ProfileForm, v: string) => void;
  onGenerate: () => void;
  generated: boolean;
  onCopy: () => void;
  copied: boolean;
}) {
  const input = (k: keyof ProfileForm, placeholder: string, label: string) => (
    <div>
      <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 block font-mono">{label}</label>
      <input
        value={form[k]}
        onChange={e => onChange(k, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.12] focus:border-white/[0.2] rounded-lg px-3 py-2 text-[13px] text-[#e6edf3] focus:outline-none transition-all placeholder:text-white/[0.15] font-sans"
      />
    </div>
  );

  const textarea = (k: keyof ProfileForm, placeholder: string, label: string, rows = 2) => (
    <div>
      <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 block font-mono">{label}</label>
      <textarea
        value={form[k]}
        onChange={e => onChange(k, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.12] focus:border-white/[0.2] rounded-lg px-3 py-2 text-[13px] text-[#e6edf3] focus:outline-none transition-all placeholder:text-white/[0.15] font-sans resize-none"
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto digital-vacuum-scroll">
      {/* Template indicator strip */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.05]"
        style={{ background: `${template.accent}08` }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
          style={{ background: template.bg, border: `1px solid ${template.accent}40` }}>
          {template.emoji}
        </div>
        <div>
          <p className="text-[12px] font-semibold text-[#e6edf3]">{template.name}</p>
          <p className="text-[10px] text-white/30">{template.tagline}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: template.accent }} />
          <span className="text-[10px] font-mono" style={{ color: template.accent }}>live preview →</span>
        </div>
      </div>

      <div className="flex-1 p-5 space-y-5 overflow-y-auto digital-vacuum-scroll">
        {/* Identity */}
        <section>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/20 mb-3">Identity</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {input('name', 'Ada Lovelace', 'Full name')}
              {input('github', 'ada-lovelace', 'GitHub username')}
            </div>
            {input('title', 'Full-Stack Developer · Open Source Enthusiast', 'Title / tagline')}
            {textarea('bio', 'I build tools that help developers ship faster.', 'Short bio')}
          </div>
        </section>

        {/* Details */}
        <section>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/20 mb-3">Details</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {input('location', 'San Francisco, CA', 'Location')}
              {input('email', 'ada@example.com', 'Email')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {input('website', 'ada.dev', 'Website')}
              {input('currentWork', 'an open-source CLI tool', 'Currently working on')}
            </div>
            {input('funFact', "I've contributed to 40+ OSS projects", 'Fun fact')}
          </div>
        </section>

        {/* Tech */}
        <section>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/20 mb-3">Tech Stack</p>
          {textarea('skills', 'TypeScript, React, Node.js, PostgreSQL, Docker, Rust', 'Skills (comma-separated)')}
        </section>

        {/* Projects */}
        <section>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/20 mb-3">Featured Projects</p>
          {textarea('projects', 'smart-readme — AI README generator\ncli-kit — Developer CLI toolbox', 'One project per line', 3)}
        </section>

        {/* Social */}
        <section>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/20 mb-3">Social Links</p>
          <div className="grid grid-cols-2 gap-3">
            {input('twitter', 'adalovelace', 'Twitter / X')}
            {input('linkedin', 'ada-lovelace', 'LinkedIn')}
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-3 pt-2 pb-1">
          <button
            onClick={onGenerate}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-[0.97] hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${template.accent} 0%, #7c3aed 100%)` }}
          >
            <Sparkles className="w-4 h-4" />
            {generated ? 'Regenerate' : 'Generate README'}
          </button>
          {generated && (
            <button
              onClick={onCopy}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-[0.97] border"
              style={{
                borderColor: copied ? '#22c55e40' : 'rgba(255,255,255,0.1)',
                color: copied ? '#22c55e' : '#e6edf3',
                background: copied ? '#22c55e10' : 'rgba(255,255,255,0.03)',
              }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>

        {generated && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]"
          >
            <p className="text-[11px] text-white/30 leading-relaxed">
              Create a GitHub repo named{' '}
              <code className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                style={{ background: `${template.accent}18`, color: template.accent }}>
                {form.github || 'your-username'}
              </code>
              {' '}and paste this into its <span className="text-white/50">README.md</span>.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Template List ─────────────────────────────────────────────────────────────
function TemplateList({
  selected,
  hovered,
  onSelect,
  onHover,
  onHoverEnd,
}: {
  selected: ProfileTemplate | null;
  hovered: ProfileTemplate | null;
  onSelect: (t: ProfileTemplate) => void;
  onHover: (t: ProfileTemplate) => void;
  onHoverEnd: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-white/[0.05]">
        <p className="text-[13px] font-semibold text-[#e6edf3] mb-0.5">Choose a template</p>
        <p className="text-[11px] text-white/30">Hover to preview · Click to fill in your details</p>
      </div>
      <div className="flex-1 overflow-y-auto digital-vacuum-scroll p-3 space-y-1.5">
        {TEMPLATES.map((t) => {
          const isActive = selected?.id === t.id;
          const isHov = hovered?.id === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              onMouseEnter={() => onHover(t)}
              onMouseLeave={onHoverEnd}
              className="group w-full flex items-center gap-3.5 p-3.5 rounded-xl text-left transition-all duration-200"
              style={{
                background: isActive ? `${t.accent}12` : isHov ? 'rgba(255,255,255,0.04)' : 'transparent',
                border: `1px solid ${isActive ? `${t.accent}35` : isHov ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)'}`,
              }}
            >
              {/* Template swatch */}
              <div
                className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-lg transition-transform duration-200"
                style={{
                  background: t.bg,
                  border: `1px solid ${t.accent}33`,
                  transform: isHov || isActive ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {t.emoji}
              </div>

              {/* Labels */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#e6edf3] leading-none">{t.name}</span>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold"
                      style={{ background: `${t.accent}22`, color: t.accent }}
                    >
                      selected
                    </motion.span>
                  )}
                </div>
                <p className="text-[11px] text-white/35 mt-0.5 leading-snug truncate">{t.tagline}</p>
              </div>

              {/* Arrow */}
              <ArrowRight
                className="w-3.5 h-3.5 flex-shrink-0 transition-all duration-200"
                style={{
                  color: isActive ? t.accent : 'rgba(255,255,255,0.2)',
                  opacity: isHov || isActive ? 1 : 0,
                  transform: isHov || isActive ? 'translateX(0)' : 'translateX(-4px)',
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Bottom hint */}
      <div className="px-5 py-4 border-t border-white/[0.05]">
        <p className="text-[10px] text-white/20 leading-relaxed">
          All templates include GitHub stats, badges, and social links. Preview updates live as you type.
        </p>
      </div>
    </div>
  );
}

// ─── Landing Hero ─────────────────────────────────────────────────────────────
function LandingHero({ onMode }: { onMode: (m: 'repo' | 'profile') => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: "easeOut" }} className="text-center mb-12 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-400 text-[11px] font-mono mb-6">
          <Sparkles className="w-3 h-3" />AI-powered README generation
        </div>
        <h1 className="text-4xl md:text-[52px] font-bold text-[#e6edf3] tracking-tight mb-4" style={{ letterSpacing: '-0.025em', lineHeight: 1.1 }}>
          Your README,{' '}
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #00bcd4, #7c3aed)' }}>
            written for you
          </span>
        </h1>
        <p className="text-[15px] text-white/40 leading-relaxed max-w-lg mx-auto">
          Paste a GitHub URL to document any repository — or build a standout profile README with hand-crafted templates.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: "easeOut", delay: 0.12 }} className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-2xl">
        <button onClick={() => onMode('repo')} className="group relative p-6 rounded-2xl text-left overflow-hidden transition-all duration-300 hover:translate-y-[-2px]" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,188,212,0.3)'; (e.currentTarget as HTMLElement).style.background = 'rgba(0,188,212,0.04)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}>
          <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center mb-4 transition-colors group-hover:border-cyan-400/30 group-hover:bg-cyan-400/5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="text-[15px] font-semibold text-[#e6edf3] mb-2">Repository README</h3>
          <p className="text-[12px] text-white/40 leading-relaxed mb-4">Paste any public GitHub URL. AI analyzes the codebase and writes accurate, structured docs.</p>
          <div className="flex flex-wrap gap-1.5">
            {['Tone control', 'Live editor', 'Emoji toggle'].map(f => (
              <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 font-mono">{f}</span>
            ))}
          </div>
          <div className="absolute bottom-5 right-5 translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200">
            <ArrowRight className="w-4 h-4 text-cyan-400" />
          </div>
        </button>

        <button onClick={() => onMode('profile')} className="group relative p-6 rounded-2xl text-left overflow-hidden transition-all duration-300 hover:translate-y-[-2px]" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.3)'; (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.04)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}>
          <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center mb-4 transition-colors group-hover:border-violet-400/30 group-hover:bg-violet-400/5">
            <User className="w-5 h-5 text-violet-400" />
          </div>
          <h3 className="text-[15px] font-semibold text-[#e6edf3] mb-2">Profile README</h3>
          <p className="text-[12px] text-white/40 leading-relaxed mb-4">5 handcrafted templates. Fill in your info and generate a GitHub profile that actually stands out.</p>
          <div className="flex flex-wrap gap-1.5">
            {['5 templates', 'Live preview', 'One-click copy'].map(f => (
              <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-400/10 text-violet-400 font-mono">{f}</span>
            ))}
          </div>
          <div className="absolute bottom-5 right-5 translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200">
            <ArrowRight className="w-4 h-4 text-violet-400" />
          </div>
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.65, delay: 0.3 }} className="mt-10 flex items-center gap-3">
        <span className="text-[11px] text-white/20">Profile templates:</span>
        <div className="flex gap-2">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => onMode('profile')} title={t.name}
              className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-sm hover:scale-110 transition-transform"
              style={{ background: t.bg }}>{t.emoji}</button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Home() {
  // App state
  const [mode, setMode] = useState<AppMode>('landing');
  const [showSplash, setShowSplash] = useState(true);
  const [showToast, setShowToast] = useState(false);

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
  const [profileStep, setProfileStep] = useState<ProfileStep>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<ProfileTemplate | null>(null);
  const [hoveredTemplate, setHoveredTemplate] = useState<ProfileTemplate | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>(DEFAULT_FORM);
  const [profileGenerated, setProfileGenerated] = useState(false);
  const [profileCopied, setProfileCopied] = useState(false);

  // What to show in the preview pane
  const previewTemplate = profileStep === 'select'
    ? (hoveredTemplate ?? selectedTemplate)
    : selectedTemplate;
  const previewIsSample = profileStep === 'select' || !profileGenerated;

  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const isSyncingLeft = useRef(false);
  const isSyncingRight = useRef(false);

  // Persist prefs
  useEffect(() => {
    try {
      const e = localStorage.getItem("readme-emoji-pref");
      if (e !== null) setIncludeEmojis(e === "true");
      const i = localStorage.getItem("readme-special-instructions");
      if (i) { setSpecialInstructions(i); setShowInstructions(true); }
    } catch { }
  }, []);
  useEffect(() => { try { localStorage.setItem("readme-emoji-pref", String(includeEmojis)); } catch { } }, [includeEmojis]);
  useEffect(() => { try { localStorage.setItem("readme-special-instructions", specialInstructions); } catch { } }, [specialInstructions]);

  // Close dropdown
  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsToneOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const highlightedMarkdown = useMemo(() => highlightMarkdown(markdown), [markdown]);

  // Repo scrolling
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (overlayRef.current) { overlayRef.current.scrollTop = e.currentTarget.scrollTop; overlayRef.current.scrollLeft = e.currentTarget.scrollLeft; }
    if (!previewRef.current || isSyncingLeft.current) { isSyncingLeft.current = false; return; }
    isSyncingRight.current = true;
    const pct = e.currentTarget.scrollTop / (e.currentTarget.scrollHeight - e.currentTarget.clientHeight);
    previewRef.current.scrollTop = pct * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
  };
  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!editorRef.current || isSyncingRight.current) { isSyncingRight.current = false; return; }
    isSyncingLeft.current = true;
    const pct = e.currentTarget.scrollTop / (e.currentTarget.scrollHeight - e.currentTarget.clientHeight);
    editorRef.current.scrollTop = pct * (editorRef.current.scrollHeight - editorRef.current.clientHeight);
  };

  const handleGenerate = async () => {
    if (!url) { alert("Please enter a GitHub URL"); return; }
    setIsLoading(true);
    setMarkdown("Fetching repository data from GitHub...");
    setRepoStats(null);
    try {
      const githubRes = await fetch('/api/github', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const repoData = await githubRes.json();
      if (!githubRes.ok) { setMarkdown(`Error: ${repoData.error}`); return; }
      if (repoData.stars !== undefined) setRepoStats({ stars: repoData.stars, forks: repoData.forks });
      setMarkdown("Generating README with AI...");
      const genRes = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ repoData, tone, includeEmojis, specialInstructions: specialInstructions.trim() || undefined }) });
      const genData = await genRes.json();
      if (!genRes.ok) { setMarkdown(`Error: ${genData.error}`); return; }
      setMarkdown(genData.markdown);
    } catch { setMarkdown("Failed. Please try again."); }
    finally { setIsLoading(false); }
  };

  const handleProfileFormChange = useCallback((k: keyof ProfileForm, v: string) => {
    setProfileForm(prev => ({ ...prev, [k]: v }));
  }, []);

  const handleProfileGenerate = () => {
    setProfileGenerated(true);
  };

  const handleProfileCopy = () => {
    if (!selectedTemplate) return;
    const text = buildReadme(selectedTemplate, profileForm);
    navigator.clipboard.writeText(text);
    setProfileCopied(true);
    setTimeout(() => setProfileCopied(false), 2000);
  };

  const hasActiveInstructions = specialInstructions.trim().length > 0;

  const goHome = () => {
    setMode('landing');
    setProfileStep('select');
    setSelectedTemplate(null);
    setHoveredTemplate(null);
    setProfileGenerated(false);
    setProfileForm(DEFAULT_FORM);
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="relative h-screen w-screen flex flex-col font-geist-mono overflow-hidden z-[1]" style={{ background: 'transparent' }}>
      <AnimatePresence>
        {showSplash && <LoadingOverlay onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {/* Orbs */}
      <div style={{ position: 'fixed', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,188,212,0.07) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0 }} />
      <CodeRain speedFactor={showSplash ? 0.2 : mode === 'landing' ? 0.5 : 1} />

      {/* ── Header ── */}
      <header className="relative z-40 w-full h-[48px] flex items-center px-5 gap-4 flex-shrink-0" style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Logo */}
        <button onClick={goHome} className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-[30px] h-[30px] rounded-[8px] border border-white/50 bg-white/[0.08] hover:bg-cyan-400/12 hover:border-cyan-400/70 flex items-center justify-center transition-all">
            <Sparkles className="w-4 h-4 text-cyan-400/70 group-hover:text-cyan-400 transition-colors" />
          </div>
          <span className="text-[13px] font-semibold text-[#e6edf3]" style={{ letterSpacing: '-0.01em' }}>Smart README</span>
        </button>

        {/* Breadcrumb */}
        {mode !== 'landing' && (
          <div className="flex items-center gap-1.5 text-white/20">
            <span>/</span>
            <span className="text-[12px]" style={{ color: mode === 'repo' ? '#00bcd4' : '#8b5cf6' }}>
              {mode === 'repo' ? 'Repository' : 'Profile'}
            </span>
          </div>
        )}

        {/* Repo URL bar */}
        {mode === 'repo' && (
          <div className="flex-1 max-w-md relative mx-2">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <div className={`w-1.5 h-1.5 rounded-full transition-all ${isLoading ? "bg-cyan-400 animate-pulse" : "bg-white/20"}`} />
            </div>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder="github.com/user/repo"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md pl-7 pr-4 py-1.5 text-[13px] text-[#e6edf3] focus:outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/5 transition-all placeholder:text-white/20 font-sans" />
            {isLoading && <div className="absolute inset-y-0 right-3 flex items-center"><div className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2.5">
          {/* Tone (repo) */}
          {mode === 'repo' && (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsToneOpen(!isToneOpen)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] text-[#e6edf3] border border-white/10 bg-white/[0.04] hover:border-white/20 transition-all">
                {tone}<ChevronDown className={`w-3 h-3 text-white/30 transition-transform ${isToneOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isToneOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-1 w-44 bg-[#161b22] border border-white/10 rounded-lg shadow-xl p-1 z-[9999]">
                    {TONES.map(t => (
                      <button key={t} onClick={() => { setTone(t); setIsToneOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-md text-[12px] transition-all ${tone === t ? "text-cyan-400 bg-cyan-400/10" : "text-[#e6edf3] hover:bg-white/5"}`}>
                        {t}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Generate (repo) */}
          {mode === 'repo' && (
            <div className="relative">
              <button onClick={handleGenerate} disabled={isLoading}
                className="flex items-center gap-1.5 px-5 py-1.5 rounded-full text-[12px] font-semibold text-white transition-all active:scale-95 hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #00bcd4 0%, #7c3aed 100%)' }}>
                <Sparkles className="w-3.5 h-3.5" />Generate
              </button>
              {hasActiveInstructions && <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full" />}
            </div>
          )}

          {/* Back (not landing) */}
          {mode !== 'landing' && (
            <button onClick={goHome} className="text-[11px] text-white/25 hover:text-white/50 transition-colors flex items-center gap-1 px-2 py-1">
              <ChevronLeft className="w-3 h-3" />Home
            </button>
          )}
        </div>

        {/* Repo stats */}
        {mode === 'repo' && repoStats && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50">
            <OdometerStats stars={repoStats.stars} forks={repoStats.forks} />
          </div>
        )}
      </header>

      {/* ── Repo toolbar ── */}
      {!showSplash && mode === 'repo' && (
        <>
          <div className="toolbar-row flex-shrink-0">
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
              <textarea className="glass-textarea" value={specialInstructions}
                onChange={e => { if (e.target.value.length <= 300) setSpecialInstructions(e.target.value); }}
                maxLength={300} placeholder="e.g. Add contributor: Mr XYZ  ·  University project CS401  ·  Include Windows 11 setup" />
              <div className={`char-counter ${specialInstructions.length > 250 ? 'near-limit' : ''}`}>{specialInstructions.length}/300</div>
            </div>
          </div>
        </>
      )}

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {/* Landing */}
        {!showSplash && mode === 'landing' && (
          <motion.div key="landing" className="flex-1 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <LandingHero onMode={m => setMode(m)} />
          </motion.div>
        )}

        {/* Repo */}
        {!showSplash && mode === 'repo' && (
          <motion.main key="repo" className="flex-1 flex gap-5 p-5 overflow-hidden relative z-10" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.05 }} className="flex-1 flex flex-col glass-panel relative group overflow-hidden">
              <div className="lume-wash" />
              {isLoading && <div className="scan-line" />}
              <div className="px-5 h-[36px] border-b flex items-center justify-between bg-white/[0.01]" style={{ borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-[9px] tracking-[0.15em] text-white/25 uppercase font-bold">EDITOR</span>
                <div className="flex gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-white/5" /><div className="w-1.5 h-1.5 rounded-full bg-white/5" /></div>
              </div>

              {/* ── Prominent URL hero — shown when no URL entered yet ── */}
              <AnimatePresence>
                {!url && !isLoading && (
                  <motion.div
                    key="url-hero"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8"
                    style={{ background: 'rgba(8,10,14,0.82)', backdropFilter: 'blur(2px)' }}
                  >
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                      style={{ background: 'rgba(0,188,212,0.08)', border: '1px solid rgba(0,188,212,0.2)' }}>
                      <Sparkles className="w-6 h-6 text-cyan-400" />
                    </div>

                    {/* Heading */}
                    <h2 className="text-[22px] font-bold text-[#e6edf3] mb-2 text-center" style={{ letterSpacing: '-0.02em' }}>
                      Paste a GitHub repo URL
                    </h2>
                    <p className="text-[13px] text-white/35 mb-8 text-center max-w-xs leading-relaxed">
                      AI will read the code and write a complete, accurate README in seconds.
                    </p>

                    {/* Big input */}
                    <div className="w-full max-w-md relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <span className="text-white/20 font-mono text-[13px]">github.com/</span>
                      </div>
                      <input
                        type="url"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                        placeholder="user/repository"
                        autoFocus
                        className="w-full rounded-xl pl-[108px] pr-14 py-3.5 text-[14px] text-[#e6edf3] font-sans focus:outline-none transition-all placeholder:text-white/20"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(0,188,212,0.3)',
                          boxShadow: '0 0 0 3px rgba(0,188,212,0.06)',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,188,212,0.55)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0,188,212,0.1)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,188,212,0.3)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,188,212,0.06)'; }}
                      />
                      <button
                        onClick={handleGenerate}
                        className="absolute inset-y-0 right-2 my-1.5 px-3 rounded-lg flex items-center justify-center transition-all hover:opacity-90 active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #00bcd4 0%, #7c3aed 100%)' }}
                      >
                        <ArrowRight className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* Example URLs */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                      <span className="text-[10px] text-white/20 font-mono">try:</span>
                      {[
                        'vercel/next.js',
                        'facebook/react',
                        'tailwindlabs/tailwindcss',
                      ].map(example => (
                        <button
                          key={example}
                          onClick={() => setUrl(`https://github.com/${example}`)}
                          className="text-[10px] font-mono px-2.5 py-1 rounded-full transition-all hover:text-cyan-400"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 relative overflow-hidden">
                <div ref={overlayRef} className="syntax-overlay editor-shared-styles digital-vacuum-scroll">{highlightedMarkdown}</div>
                <textarea ref={editorRef} value={markdown} onChange={e => setMarkdown(e.target.value)} onScroll={handleEditorScroll}
                  className="absolute inset-0 w-full bg-transparent text-transparent resize-none focus:outline-none editor-shared-styles digital-vacuum-scroll z-10"
                  spellCheck={false} style={{ caretColor: '#e6edf3' }} />
              </div>
              <div className="absolute bottom-5 right-6 flex items-center gap-3 pointer-events-none opacity-40">
                <span className="text-[9px] font-mono text-teal-400/60 uppercase">UTF-8</span>
                <span className="text-[9px] font-mono text-pink-400/60 uppercase">Markdown</span>
              </div>
            </motion.div>

            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex-1 flex flex-col glass-panel relative overflow-hidden">
              <div className="lume-wash" />
              <div className="px-5 h-[36px] border-b flex items-center justify-between bg-white/[0.01]" style={{ borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-[9px] tracking-[0.15em] text-white/25 uppercase font-bold">RENDER</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => { navigator.clipboard.writeText(markdown); setShowToast(true); }} className="p-1 text-white/20 hover:text-white/60 transition-all hover:scale-110" title="Copy markdown"><Copy className="w-3.5 h-3.5" /></button>
                  <button className="p-1 text-white/20 hover:text-white/60 transition-all hover:scale-110"><Settings2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div ref={previewRef} onScroll={handlePreviewScroll} className="flex-1 p-8 overflow-y-auto digital-vacuum-scroll">
                <div className="max-w-2xl mx-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>{markdown}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </motion.main>
        )}

        {/* Profile — 3 column layout */}
        {!showSplash && mode === 'profile' && (
          <motion.main key="profile" className="flex-1 flex gap-0 overflow-hidden relative z-10" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

            {/* COL 1: Template list — fixed width, clean */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-[240px] flex-shrink-0 flex flex-col border-r"
              style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(8,8,8,0.6)' }}
            >
              <TemplateList
                selected={selectedTemplate}
                hovered={hoveredTemplate}
                onSelect={t => { setSelectedTemplate(t); setProfileStep('fill'); setProfileGenerated(false); }}
                onHover={t => setHoveredTemplate(t)}
                onHoverEnd={() => setHoveredTemplate(null)}
              />
            </motion.div>

            {/* COL 2: Form — only visible after template selected */}
            <AnimatePresence>
              {profileStep === 'fill' && selectedTemplate && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-[320px] flex-shrink-0 flex flex-col border-r"
                  style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(10,10,10,0.55)' }}
                >
                  <ProfileFormPanel
                    template={selectedTemplate}
                    form={profileForm}
                    onChange={handleProfileFormChange}
                    onGenerate={handleProfileGenerate}
                    generated={profileGenerated}
                    onCopy={handleProfileCopy}
                    copied={profileCopied}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* COL 3: Live Preview — always right, fills remaining space */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex-1 flex flex-col glass-panel relative overflow-hidden m-5 ml-5"
            >
              <div className="lume-wash" />

              {/* Header bar */}
              <div className="px-5 h-[36px] border-b flex items-center justify-between bg-white/[0.01] flex-shrink-0" style={{ borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-[9px] tracking-[0.15em] text-white/25 uppercase font-bold">LIVE PREVIEW</span>
                <div className="flex items-center gap-3">
                  {profileGenerated && selectedTemplate && (
                    <button
                      onClick={handleProfileCopy}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold transition-all active:scale-95"
                      style={{
                        background: profileCopied ? '#22c55e18' : 'rgba(255,255,255,0.04)',
                        color: profileCopied ? '#22c55e' : '#e6edf3',
                        border: `1px solid ${profileCopied ? '#22c55e40' : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      {profileCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {profileCopied ? 'Copied!' : 'Copy README'}
                    </button>
                  )}
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                  </div>
                </div>
              </div>

              {/* Preview content */}
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={previewTemplate?.id ?? 'empty'}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="h-full flex flex-col"
                  >
                    <ProfilePreview
                      template={previewTemplate}
                      form={profileGenerated ? profileForm : DEFAULT_FORM}
                      isSample={previewIsSample}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

          </motion.main>
        )}
      </AnimatePresence>

      <Toast message="Copied to clipboard" isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}