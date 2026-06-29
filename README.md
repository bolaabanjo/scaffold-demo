# Basecamp — AI Assistant

Basecamp is a modern, premium AI chatbot built on **Next.js** using the **Cencori SDK** for AI models. It offers a dual-tier system (Standard/Pro) with different model selections, all within a sleek dark-themed UI.

---

## Key Features

1. **Dual-Tier AI Capabilities**:
   - **Standard Tier (Free)**: Fast, efficient models (Llama).
   - **Pro Tier**: Premium models (GPT-4o, Claude Sonnet, Grok).
2. **Rich UI & Aesthetics**:
   - Fully formatted Markdown rendering for AI responses.
   - Premium icons powered by **Hugeicons**.
   - Mobile-friendly responsive design.

---

## Tech Stack

* **Frontend Framework**: Next.js 15 (App Router)
* **AI Engine**: Cencori SDK & Vercel AI SDK
* **Markdown Parser**: React Markdown
* **Icons**: Hugeicons

---

## Quick Start

### 1. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
CENCORI_API_KEY=csk_...
```

### 2. Start the Application

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Project Structure

* `/components/chat.tsx` — Main chat user interface.
* `/components/tier-toggle.tsx` — Selector for switching between Standard and Pro tiers.
* `/app/api/chat/route.ts` — Edge Chat API route that streams AI responses.
* `/cencori.config.ts` — Model configuration and system prompt.
