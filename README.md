# 🚀 Smart README — AI README Generator

Transform any GitHub repository into professional documentation instantly — or build a standout GitHub profile with handcrafted templates. Smart README analyzes your codebase and generates comprehensive, well-structured READMEs using Google's Gemini AI.

🔗 **Live Demo:** https://smart-readme.vercel.app

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [📸 Screenshots](#-screenshots)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚙️ Getting Started](#️-getting-started)
- [🚀 Usage](#-usage)
- [📁 Project Structure](#-project-structure)
- [🎨 Profile Templates](#-profile-templates)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### Repository README Generator
- 🤖 **AI-Powered Generation** — Gemini 2.5 Flash analyzes your repo and writes accurate, detailed documentation
- 🎨 **Tone Control** — Choose from Professional, Beginner-friendly, Funny, or Corporate styles
- ✏️ **Special Instructions** — Add custom context like contributor names, university project details, or specific sections
- 😊 **Emoji Toggle** — Enable or disable emojis with one click to match your project's vibe
- 🖊️ **Live Editor** — Edit the generated README with syntax highlighting in real-time
- 👁️ **Instant Preview** — See the rendered markdown beside your editor as you type
- 💾 **Copy to Clipboard** — Grab your README with one click

### Profile README Generator *(New!)*
- 🧑‍💻 **5 Handcrafted Templates** — Obsidian, Dawn, Minimal, Aurora, and Terminal styles
- 👀 **Live Preview** — Preview updates instantly as you type your details
- 🏷️ **GitHub Stats & Badges** — Auto-included stats cards, language charts, and social badges
- 📋 **One-Click Copy** — Copy the finished README and paste it into your GitHub profile repo

### UI & Experience
- 🌧️ **Cinematic Dark UI** — Obsidian theme with animated code rain background
- ⚡ **Splash Screen** — Scanning animation on load
- 📊 **Repo Stats Odometer** — Animated stars and forks counter after generation

---

## 📸 Screenshots

### Splash Screen
<img width="1909" height="854" alt="Splash screen with SMART README scanning animation" src="https://github.com/user-attachments/assets/a952a6ee-174f-4bc8-823f-03d5177c666b" />

---

### Landing Page
<img width="1920" height="876" alt="Landing page showing the two mode cards" src="https://github.com/user-attachments/assets/4c8ec566-be78-4085-a4e4-9ae80013bbdf" />

---

### Repository Mode — URL Input
<img width="1920" height="865" alt="Repo mode with the prominent URL input hero overlay" src="https://github.com/user-attachments/assets/f24be71e-bb0d-4c8f-ba91-e774dfe7668c" />

---

### Repository Mode — Editor, Preview & Special Instructions
<img width="1920" height="868" alt="Split editor and render panel with syntax highlighting and special instructions open" src="https://github.com/user-attachments/assets/e375531a-833a-4520-b039-10514175f6ab" />

---

### Profile Mode — Template Selection
<img width="1920" height="873" alt="Profile mode showing the 5 template cards in the left column" src="https://github.com/user-attachments/assets/cbe46902-d6a4-4a8f-98f8-4e5296240099" />

---

### Profile Mode — Form & Live Preview
<img width="1920" height="873" alt="Profile form filled in with live preview rendering on the right" src="https://github.com/user-attachments/assets/9e2835d4-15b3-49de-9652-c6feafa39bc6" />

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| AI Model | Google Gemini 2.5 Flash |
| Markdown | react-markdown + remark-gfm |
| Analytics | Vercel Analytics |
| Deployment | Vercel |

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (LTS)
- A Google Gemini API key — get one free at [aistudio.google.com](https://aistudio.google.com)

### Installation

```bash
git clone https://github.com/rauf17/smart-readme.git
cd smart-readme
npm install
```

### Environment Setup

Create a `.env.local` file in the root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚀 Usage

### Repository README
1. Click **Repository README** on the landing page
2. Paste any public GitHub repository URL into the search bar
3. Select your preferred tone (Professional, Funny, etc.)
4. Optionally toggle emojis on/off
5. Add special instructions if needed (contributor names, project context)
6. Click **Generate**
7. Edit the result in the live editor
8. Copy your README

### Profile README
1. Click **Profile README** on the landing page
2. Hover over templates to preview styles — click one to select it
3. Fill in your details (name, bio, skills, projects, social links)
4. Click **Generate README**
5. Copy and paste into your `<username>/<username>` GitHub repository's `README.md`

---

## 📁 Project Structure

```
smart-readme/
├── app/
│   ├── api/
│   │   ├── generate/        # Gemini AI generation route
│   │   └── github/          # GitHub repo data fetcher
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx             # Main app (landing, repo, profile modes)
├── components/
│   ├── CodeRain.tsx          # Animated code rain background
│   ├── LoadingOverlay.tsx    # Splash screen animation
│   ├── OdometerStats.tsx     # Animated stars/forks counter
│   └── Toast.tsx             # Copy confirmation toast
└── public/
    └── icon.png
```

---

## 🎨 Profile Templates

| Template | Style | Accent |
|---|---|---|
| 🌑 Obsidian | Dark, cinematic, dev-forward | Cyan |
| 🌅 Dawn | Warm, clean, approachable | Orange |
| ◻ Minimal | Type-first, no noise | Slate |
| 🌌 Aurora | Purple & teal, expressive | Violet |
| ⌨ Terminal | Green-on-black, hacker chic | Green |

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free to use and modify.

---

<div align="center">
  <p>Built by <a href="https://github.com/rauf17">rauf17</a></p>
  <p>⭐ Star this repo if it saved you time!</p>
</div>
