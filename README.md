# Prompt Architect 🧠

![Prompt Architect Banner](./Prompt_architect__1_.png)

> **From vague ideas to executable prompts.**

An AI-powered prompt engineering tool that takes your rough project idea, identifies missing context through intelligent gap analysis, and generates a fully structured, production-ready XML prompt — ready to use in Claude, GPT-4o, Gemini, or any LLM.

---

## ✨ What It Does

Most people struggle to write good prompts. They're either too vague ("build me an app") or missing critical context that the AI needs to do its job well.

**Prompt Architect solves this in 3 steps:**

| Step | What happens |
|------|-------------|
| 1️⃣ Describe | You describe your project idea — as vague or detailed as you like |
| 2️⃣ Fill gaps | AI detects what context is missing and asks targeted questions |
| 3️⃣ Get your prompt | Generates a fully structured XML prompt with role, context, task, constraints, and examples |

---

## 📸 Screenshots

### Step 1 — Describe your goal
![Step 1](./public/screenshots/step1.png)

### Step 2 — AI detects missing context
![Step 2](./public/screenshots/step2.png)

### Step 3 — Your engineered XML prompt
![Step 3](./public/screenshots/step3.png)

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js
- **AI:** Claude API (Anthropic) — `claude-haiku-4-5`
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Architecture:** REST API with server-side Claude integration

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) installed
- An [Anthropic API key](https://console.anthropic.com) with credits

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/fariamoazzam/prompt-architect.git
cd prompt-architect
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up your API key**

Create a `.env` file in the root folder:
```
ANTHROPIC_API_KEY=your_api_key_here
```

**4. Run the app**
```bash
node server.js
```

**5. Open in browser**
```
http://localhost:3000
```

---

## 📁 Project Structure

```
prompt-architect/
├── public/
│   ├── index.html      # Frontend UI
│   ├── app.js          # Frontend logic
│   └── style.css       # Styling
├── server.js           # Express backend + Claude API
├── package.json
├── .env                # Your API key (never committed)
└── .gitignore
```

---

## 🧠 How the AI Works

The app makes two Claude API calls:

1. **Gap Analysis** — Claude reads your project description and returns 3–5 critical missing context questions as JSON
2. **Prompt Builder** — Claude takes your goal + your answers and generates a complete XML-structured prompt with:
   - `<role>` — Who the AI should be
   - `<context>` — Background the AI needs
   - `<project_knowledge>` — Key facts about your project
   - `<task>` — Exactly what to do
   - `<constraints>` — Rules and limits
   - `<output_format>` — How to structure the response
   - `<examples>` — Sample inputs and outputs

---

## 💡 Example Output

```xml
<prompt>
  <role>You are an expert full-stack engineer...</role>
  <context>The user wants to build...</context>
  <project_knowledge>Key requirements: ...</project_knowledge>
  <task>Generate a complete implementation...</task>
  <constraints>Production-grade code only...</constraints>
  <output_format>Structured with file tree...</output_format>
  <examples>Example 1: ...</examples>
</prompt>
```

---

## 🔐 Security

- API key is stored in `.env` and never exposed to the frontend
- `.env` is excluded from Git via `.gitignore`
- All Claude API calls happen server-side only

---

## 👩‍💻 Author

**Faria Moazzam**
- GitHub: [@fariamoazzam](https://github.com/fariamoazzam)
- Built as part of an AI development portfolio

---

## 📄 License

MIT License — feel free to use, modify, and build on this project.
