# Gerador de Propostas Implementation Plan - Phase 3: PDF Engine

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement professional PDF export using Puppeteer.

**Architecture:** A Next.js Route Handler that receives Markdown and Branding, renders it to HTML, and uses Puppeteer to generate a PDF buffer.

**Tech Stack:** Puppeteer (or `@sparticuz/chromium` for serverless), `marked` (for MD to HTML).

---

### Task 1: PDF Generation Route

**Files:**
- Create: `app/api/export-pdf/route.ts`

- [ ] **Step 1: Install PDF dependencies**
Run: `npm install puppeteer-core @sparticuz/chromium marked`

- [ ] **Step 2: Create export endpoint**
```typescript
import { NextResponse } from 'next/server'
import { marked } from 'marked'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export async function POST(req: Request) {
  try {
    const { content, branding } = await req.json()
    const htmlContent = marked(content)

    const fullHtml = `
      <html>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=${branding?.font_family || 'Inter'}:wght@400;700&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { font-family: '${branding?.font_family || 'Inter'}', sans-serif; }
            h1, h2, h3 { color: ${branding?.primary_color || '#2563eb'}; }
            .content { padding: 40px; }
          </style>
        </head>
        <body class="bg-white">
          <div class="content">
            ${branding?.logo_url ? `<div class="text-right mb-8"><img src="${branding.logo_url}" style="max-height: 60px;"></div>` : ''}
            <div class="prose max-w-none">
              ${htmlContent}
            </div>
          </div>
        </body>
      </html>
    `

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })

    const page = await browser.newPage()
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({ format: 'A4', printBackground: true })
    await browser.close()

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=proposta.pdf'
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

- [ ] **Step 3: Commit**
```bash
git add app/api/export-pdf/route.ts
git commit -m "feat: setup puppeteer-based pdf export route"
```

### Task 2: UI Integration & Trigger

**Files:**
- Modify: `components/ProposalGenerator.tsx`

- [ ] **Step 1: Add download logic**
```typescript
const downloadPdf = async () => {
  setLoading(true)
  try {
    const response = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: proposal, branding }),
    })
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Proposta-${formData.clientName}.pdf`
    a.click()
  } catch (error) {
    alert('Erro ao baixar PDF')
  } finally {
    setLoading(false)
  }
}
```

- [ ] **Step 2: Update "Finalizar e PDF" button**
Change the `onClick={() => window.print()}` to `onClick={downloadPdf}`.

- [ ] **Step 3: Commit**
```bash
git add components/ProposalGenerator.tsx
git commit -m "feat: integrate pdf download trigger in ui"
```
