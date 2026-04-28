import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark-base": "rgb(var(--bg-obsidian) / <alpha-value>)",
        "dark-surface": "rgb(var(--bg-surface) / <alpha-value>)",
        "dark-surface-elevated": "rgb(var(--bg-surface-elevated) / <alpha-value>)",
        "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
        "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
        "accent-primary": "rgb(var(--accent-primary) / <alpha-value>)",
        "success": "rgb(var(--success) / <alpha-value>)",
        "warning": "rgb(var(--warning) / <alpha-value>)",
        "error": "rgb(var(--error) / <alpha-value>)",
        "border-default": "rgba(255, 255, 255, 0.05)",
        "border-hover": "rgba(255, 255, 255, 0.1)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "Fira Code", "monospace"],
      },
      boxShadow: {
        'float': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
        'lift': '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px 0 rgba(59, 130, 246, 0.5)',
      },
      lineHeight: {
        'tight-heading': '1.10',
        'heading': '1.20',
        'relaxed-body': '1.50',
      },
      letterSpacing: {
        'label': '0px',
        'overline': '0.5px',
        'micro': '0.5px',
        'code': '0px',
        'tight-heading': '-1px',
        'heading': '-0.5px',
      },
      borderRadius: {
        'subtle': '4px',
        'comfortable': '6px',
        'generous': '8px',
        'glass': '12px',
      },
      animation: {
        'breathe': 'breathe 3s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.8', boxShadow: '0 0 10px 0 rgba(59, 130, 246, 0.5)' },
          '50%': { opacity: '1', boxShadow: '0 0 25px 0 rgba(59, 130, 246, 0.5)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
