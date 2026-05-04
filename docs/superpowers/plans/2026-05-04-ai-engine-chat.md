# Gerador de Propostas Implementation Plan - Phase 2: AI Engine & Chat

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the AI-driven proposal generation and the interactive chat refinement system.

**Architecture:** Next.js Route Handlers for OpenAI communication, local React state for proposal content, and a dual-pane UI for Chat vs. Preview.

**Tech Stack:** OpenAI API (GPT-4o), Next.js, Tailwind CSS.

---

### Task 1: OpenAI Integration & Route Handler

**Files:**
- Create: `app/api/generate/route.ts`
- Modify: `.env.local` (add OPENAI_API_KEY)

- [ ] **Step 1: Install OpenAI SDK**
Run: `npm install openai`

- [ ] **Step 2: Create generation endpoint**
```typescript
import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  const { prompt, history, branding } = await req.json()
  
  const systemPrompt = `Você é um consultor comercial sênior. 
  Gere ou ajuste uma proposta comercial profissional baseada nos dados do usuário.
  Use a estrutura: Abertura, Diagnóstico, Solução, Metodologia, Investimento, CTA.
  Branding do profissional: ${branding.company_name}, Diferenciais: ${branding.bio}.
  Retorne APENAS o conteúdo da proposta em Markdown.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: prompt }
    ]
  })

  return NextResponse.json({ content: response.choices[0].message.content })
}
```

- [ ] **Step 3: Commit**
```bash
git add package.json app/api/generate/route.ts
git commit -m "feat: setup openai route handler for proposal generation"
```

### Task 2: Proposal State & Initial Form

**Files:**
- Create: `components/ProposalGenerator.tsx`
- Create: `app/dashboard/page.tsx`

- [ ] **Step 1: Implement basic generator state**
Create a component that holds the `proposal` string and the `chatHistory` array.

- [ ] **Step 2: Create initial 5-question form**
Add a simple UI to collect: Cliente, Serviço, Valor, Prazo, Diagnóstico.

- [ ] **Step 3: Commit**
```bash
git add components/ProposalGenerator.tsx app/dashboard/page.tsx
git commit -m "feat: add proposal generator state and initial form"
```

### Task 3: Dual-Pane Chat & Preview UI

**Files:**
- Modify: `components/ProposalGenerator.tsx`
- Create: `components/MarkdownPreview.tsx`

- [ ] **Step 1: Install Markdown renderer**
Run: `npm install react-markdown`

- [ ] **Step 2: Implement Layout**
Create a split-screen view: Left side (Chat/Form), Right side (Live Markdown Preview with branding colors).

- [ ] **Step 3: Connect Chat to API**
Add a chat input that sends messages to `/api/generate` and updates the live preview.

- [ ] **Step 4: Commit**
```bash
git add components/ProposalGenerator.tsx components/MarkdownPreview.tsx
git commit -m "feat: implement dual-pane chat and live preview UI"
```
