"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeRain from "@/components/CodeRain";
import Toast from "@/components/Toast";
import OdometerStats from "@/components/OdometerStats";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Download, Settings2, Sparkles, Send, ChevronDown } from "lucide-react";

// ── Syntax highlighting logic ──
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
      // Inline patterns
      const parts: React.ReactNode[] = [];
      let remaining = line;
      let key = 0;

      while (remaining.length > 0) {
        // Simple regex-like matching for bold and inline code
        const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/);
        const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)/);

        let firstMatch: { type: 'bold' | 'code'; index: number; match: RegExpMatchArray } | null = null;

        if (boldMatch) {
          firstMatch = { type: 'bold', index: boldMatch[1].length, match: boldMatch };
        }
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

    return (
      <div key={i}>
        {content}
        {'\n'}
      </div>
    );
  });
}

export default function Home() {
  const [markdown, setMarkdown] = useState("# Project Title\n\nWrite a brilliant README here...\n\n## Features\n\n- Beautiful design\n- Intelligent tone matching\n- Easy to use");
  const [tone, setTone] = useState("Professional");
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [repoStats, setRepoStats] = useState<{ stars: number; forks: number } | null>(null);

  // UI States
  const [showSplash, setShowSplash] = useState(true);
  const [showToast, setShowToast] = useState(false);

  // New feature states
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [isToneOpen, setIsToneOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Refs for synced scrolling
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const isSyncingLeft = useRef(false);
  const isSyncingRight = useRef(false);

  // ── localStorage persistence ──
  useEffect(() => {
    try {
      const savedEmoji = localStorage.getItem("readme-emoji-pref");
      if (savedEmoji !== null) {
        setIncludeEmojis(savedEmoji === "true");
      }
      const savedInstructions = localStorage.getItem("readme-special-instructions");
      if (savedInstructions) {
        setSpecialInstructions(savedInstructions);
        setShowInstructions(true); // re-open panel if content exists
      }
    } catch { }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("readme-emoji-pref", String(includeEmojis));
    } catch { }
  }, [includeEmojis]);

  useEffect(() => {
    try {
      localStorage.setItem("readme-special-instructions", specialInstructions);
    } catch { }
  }, [specialInstructions]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsToneOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const highlightedMarkdown = useMemo(() => highlightMarkdown(markdown), [markdown]);

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    // Sync overlay
    if (overlayRef.current) {
      overlayRef.current.scrollTop = e.currentTarget.scrollTop;
      overlayRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    if (!previewRef.current) return;
    if (isSyncingLeft.current) {
      isSyncingLeft.current = false;
      return;
    }
    isSyncingRight.current = true;

    const editor = e.currentTarget;
    const preview = previewRef.current;
    const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
    preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
  };

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!editorRef.current) return;
    if (isSyncingRight.current) {
      isSyncingRight.current = false;
      return;
    }
    isSyncingLeft.current = true;

    const preview = e.currentTarget;
    const editor = editorRef.current;
    const percentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
    editor.scrollTop = percentage * (editor.scrollHeight - editor.clientHeight);
  };

  const handleExport = () => {
    navigator.clipboard.writeText(markdown);
    setShowToast(true);
  };

  const handleGenerate = async () => {
    if (!url) {
      alert("Please enter a GitHub URL");
      return;
    }

    // Vercel Analytics tracking
    try { (window as any).va?.track?.('emoji_toggle', { enabled: includeEmojis }); } catch { }
    try { (window as any).va?.track?.('special_instructions_used', { length: specialInstructions.length }); } catch { }
    try { (window as any).va?.track?.('readme_generated', { hasInstructions: !!specialInstructions }); } catch { }

    setIsLoading(true);
    setMarkdown("Fetching repository data from GitHub...");
    setRepoStats(null);

    try {
      const githubRes = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const repoData = await githubRes.json();
      if (!githubRes.ok) {
        setMarkdown(`Error fetching GitHub data: ${repoData.error}`);
        return;
      }

      if (repoData.stars !== undefined && repoData.forks !== undefined) {
        setRepoStats({ stars: repoData.stars, forks: repoData.forks });
      }

      setMarkdown("GitHub data fetched successfully. Generating README with Gemini AI...");

      const generateRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoData,
          tone,
          includeEmojis,
          specialInstructions: specialInstructions.trim() || undefined,
        }),
      });

      const generateData = await generateRes.json();
      if (!generateRes.ok) {
        setMarkdown(`Error generating README: ${generateData.error}`);
        return;
      }

      setMarkdown(generateData.markdown);
    } catch (error) {
      setMarkdown("Failed to process request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const hasActiveInstructions = specialInstructions.trim().length > 0;

  return (
    <div className="relative h-screen w-screen flex flex-col font-geist-mono overflow-hidden selection:bg-blue-500/20 z-[1]" style={{ background: 'transparent' }}>
      <AnimatePresence>
        {showSplash && (
          <LoadingOverlay onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* Ambient Orbs */}
      <div style={{
        position: 'fixed', top: -100, left: -100,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,188,212,0.07) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'fixed', bottom: -100, right: -100,
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0
      }} />

      <CodeRain speedFactor={showSplash ? 0.2 : 1} />

      {/* Refined macOS-style Header */}
      <header
        className="relative z-40 w-full h-[48px] border-b flex items-center justify-between px-6"
        style={{
          background: 'rgba(10, 10, 10, 0.9)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center group">
            <div
              className="inline-flex items-center justify-center transition-all duration-200 border bg-white/[0.08] hover:bg-cyan-400/12 hover:border-cyan-400/70"
              style={{
                width: '30px',
                height: '30px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '8px',
                marginRight: '8px'
              }}
            >
              <Sparkles className="w-4 h-4 text-accent-primary/60 transition-colors group-hover:text-cyan-400" />
            </div>
            <span
              className="text-sm font-semibold text-[#e6edf3] tracking-tight"
              style={{ letterSpacing: '-0.01em' }}
            >
              Smart README
            </span>
          </div>

          <div className="flex-1 max-w-md relative group mx-auto">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isLoading ? "bg-accent-primary animate-pulse" : "bg-white/20"
                }`} />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Search or enter GitHub URL..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md pl-8 pr-4 py-1.5 text-[13px] text-[#e6edf3] focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-cyan-400/5 transition-all placeholder:text-white/20 font-sans"
            />
            {isLoading && (
              <div className="absolute inset-y-0 right-3 flex items-center">
                <div className="w-3 h-3 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="relative z-[9999]" ref={dropdownRef}>
            <button
              onClick={() => setIsToneOpen(!isToneOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] text-[#e6edf3] border border-white/10 bg-white/[0.04] hover:border-cyan-400/30 transition-all"
            >
              <span>{tone}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${isToneOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isToneOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 0, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 w-48 bg-[#161b22] shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-1 z-[9999] backdrop-blur-xl"
                  style={{
                    top: '100%',
                    marginTop: '2px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0 0 8px 8px'
                  }}
                >
                  {["Professional", "Beginner-friendly", "Funny", "Corporate"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setTone(option);
                        setIsToneOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 rounded-md text-[13px] transition-all duration-150 ${tone === option
                          ? "text-cyan-400 bg-cyan-400/10"
                          : "text-[#e6edf3] hover:bg-cyan-400/10 hover:text-cyan-400"
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="generate-btn-wrapper" title={hasActiveInstructions ? "Custom instructions active" : undefined}>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-1.5 rounded-full text-[11px] font-semibold text-white transition-all active:scale-95 shadow-[0_2px_8px_rgba(0,188,212,0.25)] hover:opacity-90 hover:shadow-[0_4px_16px_rgba(0,188,212,0.3)]"
              style={{ background: 'linear-gradient(135deg, #00bcd4 0%, #7c3aed 100%)' }}
            >
              Generate
            </button>
            {hasActiveInstructions && <span className="generate-dot" />}
          </div>
        </div>

        {repoStats && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50">
            <OdometerStats stars={repoStats.stars} forks={repoStats.forks} />
          </div>
        )}
      </header>

      {/* ── Toolbar Row ── */}
      {!showSplash && (
        <>
          <div className="toolbar-row">
            {/* Left: Emoji Toggle */}
            <div className="flex items-center gap-3">
              <span className={`pill-toggle-label ${includeEmojis ? 'active' : ''}`}>
                <span className="emoji-sparkle">✨</span>
                Emojis
              </span>
              <button
                type="button"
                className={`pill-toggle ${includeEmojis ? 'active' : ''}`}
                onClick={() => setIncludeEmojis(!includeEmojis)}
                aria-label="Toggle emojis"
              >
                <div className="pill-toggle-dot" />
              </button>
            </div>

            {/* Separator */}
            <div className="toolbar-separator" />

            {/* Right: Special Instructions Trigger */}
            <button
              type="button"
              className={`instructions-trigger ${showInstructions ? 'open' : ''}`}
              onClick={() => setShowInstructions(!showInstructions)}
            >
              <span>⚙ Special Instructions</span>
              <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {/* ── Collapsible Instructions Panel ── */}
          <div className={`instructions-panel ${showInstructions ? 'open' : ''}`}>
            <div className="instructions-panel-inner">
              <textarea
                className="glass-textarea"
                value={specialInstructions}
                onChange={(e) => {
                  if (e.target.value.length <= 300) {
                    setSpecialInstructions(e.target.value);
                  }
                }}
                maxLength={300}
                placeholder="e.g. Add contributor: Mr XYZ  ·  University project CS401  ·  Include Windows 11 setup  ·  Add Arabic translation section"
              />
              <div className={`char-counter ${specialInstructions.length > 250 ? 'near-limit' : ''}`}>
                {specialInstructions.length}/300
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Workspace Overhaul */}
      {!showSplash && (
        <main className="flex-1 flex gap-6 p-6 overflow-hidden relative z-10">

          {/* Editor Pane */}
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex-1 flex flex-col glass-panel relative group overflow-hidden"
          >
            {/* Lume Effects */}
            <div className="lume-wash" />
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {isLoading && <div className="scan-line" />}

            <div className="px-6 h-[36px] border-b flex items-center justify-between bg-white/[0.01]" style={{ borderBottomColor: 'rgba(255, 255, 255, 0.05)' }}>
              <span className="text-[10px] tracking-[0.12em] text-white/30 uppercase font-bold">EDITOR</span>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
              {/* Highlight div (background) */}
              <div
                ref={overlayRef}
                className="syntax-overlay editor-shared-styles digital-vacuum-scroll"
              >
                {highlightedMarkdown}
              </div>

              {/* Input textarea (foreground) */}
              <textarea
                ref={editorRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                onScroll={handleEditorScroll}
                className="absolute inset-0 w-full bg-transparent text-transparent resize-none focus:outline-none editor-shared-styles digital-vacuum-scroll z-10"
                spellCheck="false"
                style={{
                  caretColor: '#e6edf3',
                  scrollbarColor: "rgba(255, 255, 255, 0.03) transparent",
                }}
              />
            </div>

            {/* Syntax Metadata */}
            <div className="absolute bottom-6 right-8 flex items-center gap-4 pointer-events-none opacity-40">
              <span className="text-[9px] font-mono text-teal-400/60 uppercase">UTF-8</span>
              <span className="text-[9px] font-mono text-pink-400/60 uppercase">Markdown</span>
            </div>
          </motion.div>

          {/* Preview Pane */}
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className="flex-1 flex flex-col glass-panel relative overflow-hidden"
          >
            {/* Lume Effects */}
            <div className="lume-wash" />
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <div className="px-6 h-[36px] border-b flex items-center justify-between bg-white/[0.01]" style={{ borderBottomColor: 'rgba(255, 255, 255, 0.05)' }}>
              <span className="text-[10px] tracking-[0.12em] text-white/30 uppercase font-bold">RENDER</span>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleExport}
                  className="p-1 text-white/20 hover:text-white/60 transition-all hover:scale-110"
                  title="Export"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 text-white/20 hover:text-white/60 transition-all hover:scale-110">
                  <Settings2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div
              ref={previewRef}
              onScroll={handlePreviewScroll}
              className="flex-1 p-[32px_40px] overflow-y-auto digital-vacuum-scroll"
            >
              <div className="max-w-2xl mx-auto">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-[26px] font-bold mt-0 mb-3 tracking-tight text-[#e6edf3] border-b border-white/5 pb-2" style={{ borderBottomColor: 'rgba(255,255,255,0.08)' }} {...props} />
                    ),
                    h2: ({ node, ...props }) => <h2 className="text-xl font-medium mt-10 mb-4 pb-2 text-[#79c0ff]" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-medium mt-8 mb-3 text-[#79c0ff]" {...props} />,
                    p: ({ node, ...props }) => <p className="text-[#cdd9e5] leading-relaxed mb-4" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-4 text-[#cdd9e5]" {...props} />,
                    li: ({ node, ...props }) => <li className="leading-relaxed mb-1" {...props} />,
                    a: ({ node, ...props }) => <a className="text-[#00bcd4] hover:underline transition-colors" {...props} />,
                    strong: ({ node, ...props }) => <strong className="text-[#ffa657] font-semibold" {...props} />,
                    hr: ({ node, ...props }) => <hr className="my-8 border-t" style={{ borderColor: 'rgba(48,54,61,0.6)' }} {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="border-left border-l-3 border-[#00bcd4] pl-4 my-4 italic text-[#8b949e]" {...props} />,
                    code: ({ node, inline, className, children, ...props }: any) => {
                      return inline ? (
                        <code className="bg-[#6e7681]/15 text-[#ff7b72] px-1.5 py-0.5 rounded font-mono text-[12px]" {...props}>{children}</code>
                      ) : (
                        <pre className="bg-[#0d1117] p-6 rounded-md overflow-x-auto my-8 border border-white/5 shadow-inner" style={{ borderColor: 'rgba(48,54,61,0.8)' }}>
                          <code className="font-mono text-[12px] text-[#e6edf3]" {...props}>{children}</code>
                        </pre>
                      )
                    },
                    table: ({ node, ...props }) => <div className="overflow-x-auto my-8 rounded-lg border border-white/5"><table className="w-full text-left border-collapse" {...props} /></div>,
                    th: ({ node, ...props }) => <th className="bg-white/5 border-b border-white/5 p-4 font-bold text-white/40 text-[10px] tracking-widest uppercase" {...props} />,
                    td: ({ node, ...props }) => <td className="border-b border-white/5 p-4 text-[13px] text-[#94A3B8]" {...props} />,
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>

        </main>
      )}

      <Toast
        message="Copied to clipboard"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
