# 🚀 Smart README — AI README Generator

Transform any GitHub repository into professional documentation instantly. Smart README analyzes your codebase and generates comprehensive, well-structured READMEs using Google's Gemini AI.

🔗 **Live Demo:** https://smart-readme.vercel.app

---

## ✨ Features

- 🤖 **AI-Powered Generation** — Gemini 2.5 Flash analyzes your repo and writes accurate, detailed documentation
- 🎨 **Tone Control** — Choose from Professional, Beginner-friendly, Funny, or Corporate styles
- ✏️ **Special Instructions** — Add custom context like contributor names, university project details, or specific sections
- 😊 **Emoji Toggle** — Enable or disable emojis with one click to match your project's vibe
- 🖊️ **Live Editor** — Edit the generated README with syntax highlighting in real-time
- 👁️ **Instant Preview** — See the rendered markdown beside your editor as you type
- 💾 **Export Options** — Copy to clipboard or download as a .md file
- 🌧️ **Obsidian UI** — Cinematic dark theme with animated code rain background

---

## 📸 Screenshots

### Splash Screen
<!-- Add screenshot: splash screen with SMART README scanning animation -->
<img width="1909" height="854" alt="image" src="https://github.com/user-attachments/assets/a952a6ee-174f-4bc8-823f-03d5177c666b" />

### Main Editor
<!-- Add screenshot: split editor/render panel with syntax highlighting -->
<img width="1920" height="878" alt="image" src="https://github.com/user-attachments/assets/9dbcc246-e6af-4a90-b191-55a0e8c863f5" />

### Generated README
<!-- Add screenshot: a real generated README in the render panel -->
<img width="1920" height="866" alt="image" src="https://github.com/user-attachments/assets/06df908c-86f7-4491-bc73-9c3929fbd5d0" />

### Special Instructions
<!-- Add screenshot: special instructions panel open -->
<img width="1920" height="860" alt="image" src="https://github.com/user-attachments/assets/893a2ffa-fab0-42aa-ad45-ea27fbba707b" />



---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI Model:** Google Gemini 2.5 Flash
- **Analytics:** Vercel Analytics
- **Deployment:** Vercel

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

Create a `.env.local` file:
GEMINI_API_KEY=your_gemini_api_key_here

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚀 Usage

1. Paste any public GitHub repository URL into the search bar
2. Select your preferred tone (Professional, Funny, etc.)
3. Optionally toggle emojis on/off
4. Add special instructions if needed (contributor names, project context)
5. Click **Generate**
6. Edit the result in the live editor
7. Copy or download your README

---

## 📁 Project Structure

```
smart-readme/
├── app/
│   ├── api/generate/    # Gemini API route
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── CodeRain.tsx     # Animated background
│   ├── Editor.tsx       # Syntax-highlighted editor
│   └── Toolbar.tsx      # Emoji toggle + instructions
├── lib/
│   └── github.ts        # GitHub repo fetcher
└── public/
    └── screenshots/     # App screenshots
```
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
