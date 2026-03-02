# 📄 AI Resume Analyzer

AI Resume Analyzer is a modern, blazing-fast web application designed to help job seekers optimize their resumes. By leveraging the power of AI (via Puter.js) and modern web technologies, the app analyzes uploaded resumes, calculates an ATS (Applicant Tracking System) compatibility score, and provides actionable feedback to improve your chances of landing an interview.

---

## ✨ Features

- 🤖 **AI-Powered Analysis:** Uses advanced AI (Claude 3.7 Sonnet via Puter.js) to read, understand, and evaluate your resume against industry standards.
- 📊 **ATS Scoring & Visualization:** Dynamic UI components including Score Gauges, Score Circles, and Score Badges to visualize resume strength.
- 📄 **Local PDF Processing:** Secure PDF uploads and content extraction using `pdfjs-dist`.
- ☁️ **Cloud & Auth Integration:** Powered by Puter.js for authentication, storage, and persistence.
- ⚡ **Blazing Fast:** Built using React Router v7, React 19, and Vite.
- 🎨 **Modern UI/UX:** Responsive UI styled with Tailwind CSS v4 and custom animations.

---

## 🛠️ Tech Stack

### Frontend
- React 19
- React Router v7
- Tailwind CSS v4
- Zustand (State Management)
- react-dropzone
- pdfjs-dist

### Backend & AI as a Service
- Puter.js (Authentication, File System, KV Storage, AI Generation)

### Build & Tooling
- Vite
- TypeScript

---

## 🚀 Getting Started

### Prerequisites
Ensure you have **Node.js v20+** installed.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/nithishkesavarapu-code/ai-resume-analyzer.git
cd ai-resume-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open browser:
```bash
http://localhost:5173
```

---

## 📁 Project Structure
```
├── app/
│   ├── components/
│   ├── lib/
│   ├── routes/
│   ├── app.css
│   ├── routes.ts
│   └── root.tsx
├── constants/
├── public/
│   ├── icons/
│   ├── images/
│   └── readme/
├── react-router.config.ts
├── vite.config.ts
└── package.json

```
---

## 🧠 How It Works

### 🔐 Authentication
Users securely sign in using **Puter.js Authentication**.

### 📄 Upload
Users upload their PDF resume through the **FileUploader** component.

### ⚙️ Parsing
`pdfjs-dist` processes the uploaded PDF locally and extracts text/images directly in the browser.

### 🤖 AI Analysis
The extracted resume content is sent to **Puter AI (Claude 3.7 Sonnet)** to generate:

- ATS compatibility score  
- Resume feedback  
- Strength & improvement suggestions

Displays ResumeCard, ATS score, summary, strengths, and improvement suggestions.