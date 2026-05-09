"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeRain from "@/components/CodeRain";
import Toast from "@/components/Toast";
import OdometerStats from "@/components/OdometerStats";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Download, Settings2, Sparkles, Send, ChevronDown } from "lucide-react";

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

  // Refs for synced scrolling
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
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
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("readme-emoji-pref", String(includeEmojis));
    } catch {}
  }, [includeEmojis]);

  useEffect(() => {
    try {
      localStorage.setItem("readme-special-instructions", specialInstructions);
    } catch {}
  }, [specialInstructions]);

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
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
    try { (window as any).va?.track?.('emoji_toggle', { enabled: includeEmojis }); } catch {}
    try { (window as any).va?.track?.('special_instructions_used', { length: specialInstructions.length }); } catch {}
    try { (window as any).va?.track?.('readme_generated', { hasInstructions: !!specialInstructions }); } catch {}

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
    <div className="relative h-screen w-screen bg-[#050505] flex flex-col font-geist-mono overflow-hidden selection:bg-blue-500/20">
      <AnimatePresence>
        {showSplash && (
          <LoadingOverlay onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      <CodeRain speedFactor={showSplash ? 0.2 : 1} />
      
      {/* Refined macOS-style Header */}
      <header className="relative z-40 w-full h-14 bg-black/40 backdrop-blur-lg border-b border-white/5 flex items-center justify-between px-6">
        <div className="flex items-center gap-4 flex-1">
          <Sparkles className="w-4 h-4 text-accent-primary/60" />
          
          <div className="flex-1 max-w-md relative group mx-auto">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                isLoading ? "bg-accent-primary animate-pulse" : "bg-white/20"
              }`} />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Search or enter GitHub URL..."
              className="w-full bg-white/5 border border-white/5 rounded-lg pl-8 pr-4 py-1.5 text-xs text-text-primary focus:outline-none focus:border-white/10 focus:bg-white/10 transition-all placeholder:text-text-muted/30 font-mono"
            />
            {isLoading && (
              <div className="absolute inset-y-0 right-3 flex items-center">
                <div className="w-3 h-3 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="relative group">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="appearance-none bg-white/5 border border-white/5 text-[11px] text-text-muted rounded-full px-4 py-1.5 pr-8 focus:outline-none cursor-pointer hover:bg-white/10 hover:text-text-primary transition-all font-medium"
            >
              <option value="Professional" className="bg-[#111] text-white">Professional</option>
              <option value="Beginner-friendly" className="bg-[#111] text-white">Beginner-friendly</option>
              <option value="Funny" className="bg-[#111] text-white">Funny</option>
              <option value="Corporate" className="bg-[#111] text-white">Corporate</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none group-hover:text-text-primary transition-colors" />
          </div>

          <div className="generate-btn-wrapper" title={hasActiveInstructions ? "Custom instructions active" : undefined}>
            <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-1.5 bg-accent-primary/10 border border-accent-primary/20 rounded-full text-[11px] font-medium text-accent-primary hover:bg-accent-primary/20 transition-all active:scale-95"
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
                placeholder="e.g. Add contributor: Muhammad Umair  ·  University project CS401  ·  Include Windows 11 setup  ·  Add Arabic translation section"
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
            
            <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-bold">EDITOR</span>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
              </div>
            </div>
            
            <textarea
              ref={editorRef}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              onScroll={handleEditorScroll}
              className="flex-1 w-full bg-transparent p-10 font-mono text-[13px] leading-relaxed text-[#94A3B8] resize-none focus:outline-none digital-vacuum-scroll transition-colors duration-500 hover:text-[#CBD5E1]"
              spellCheck="false"
              style={{
                scrollbarColor: "rgba(255, 255, 255, 0.03) transparent",
              }}
            />
            
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

            <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-bold">RENDER</span>
              
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
              className="flex-1 p-12 overflow-y-auto digital-vacuum-scroll"
            >
              <div className="max-w-2xl mx-auto">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => (
                      <h1 className="text-3xl font-light mt-10 mb-8 tracking-tight bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent" {...props} />
                    ),
                    h2: ({node, ...props}) => <h2 className="text-xl font-medium mt-10 mb-4 border-b border-white/5 pb-2 text-teal-400/90" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-medium mt-8 mb-3 text-pink-400/80" {...props} />,
                    p: ({node, ...props}) => <p className="text-[#94A3B8] leading-relaxed mb-4" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 mb-4 text-[#94A3B8]" {...props} />,
                    a: ({node, ...props}) => <a className="text-amber-400/80 hover:text-amber-400 transition-colors underline underline-offset-4 decoration-amber-400/30" {...props} />,
                    code: ({node, inline, className, children, ...props}: any) => {
                      return inline ? (
                        <code className="bg-white/5 text-amber-400 px-1.5 py-0.5 rounded font-mono text-[12px] border border-white/5" {...props}>{children}</code>
                      ) : (
                        <pre className="bg-black/40 p-6 rounded-xl overflow-x-auto my-8 border border-white/5 shadow-inner">
                          <code className="font-mono text-[12px] text-teal-400/80" {...props}>{children}</code>
                        </pre>
                      )
                    },
                    table: ({node, ...props}) => <div className="overflow-x-auto my-8 rounded-lg border border-white/5"><table className="w-full text-left border-collapse" {...props} /></div>,
                    th: ({node, ...props}) => <th className="bg-white/5 border-b border-white/5 p-4 font-bold text-white/40 text-[10px] tracking-widest uppercase" {...props} />,
                    td: ({node, ...props}) => <td className="border-b border-white/5 p-4 text-[13px] text-[#94A3B8]" {...props} />,
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
