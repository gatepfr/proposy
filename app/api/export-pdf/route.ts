import { NextResponse } from 'next/server'
import { marked } from 'marked'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export async function POST(req: Request) {
  try {
    const { content, branding } = await req.json()
    // Convert Markdown to HTML
    const htmlContent = marked(content)

    // Construct full HTML with branding styles and Tailwind for layout
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <link href="https://fonts.googleapis.com/css2?family=${branding?.font_family?.replace(' ', '+') || 'Inter'}:wght@400;700&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { margin: 0; }
            body { 
              font-family: '${branding?.font_family || 'Inter'}', sans-serif; 
              margin: 0;
              -webkit-print-color-adjust: exact;
            }
            .content-wrapper { padding: 50px; }
            h1 { color: ${branding?.primary_color || '#2563eb'}; font-size: 2.5rem; margin-bottom: 2rem; font-weight: 800; }
            h2 { color: ${branding?.primary_color || '#2563eb'}; font-size: 1.75rem; margin-top: 2.5rem; margin-bottom: 1rem; border-bottom: 2px solid ${branding?.primary_color || '#2563eb'}22; padding-bottom: 0.5rem; }
            h3 { color: ${branding?.secondary_color || '#64748b'}; font-size: 1.25rem; margin-top: 1.5rem; }
            p { margin-bottom: 1.25rem; line-height: 1.6; color: #374151; }
            strong { color: ${branding?.primary_color || '#2563eb'}; }
            ul { margin-bottom: 1.5rem; list-style-type: disc; padding-left: 1.5rem; }
            li { margin-bottom: 0.5rem; color: #374151; }
          </style>
        </head>
        <body class="bg-white">
          <div class="content-wrapper">
            ${branding?.logo_url ? `
              <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
                <img src="${branding.logo_url}" style="max-height: 80px; object-contain: contain;">
              </div>
            ` : ''}
            
            <div class="prose max-w-none">
              ${htmlContent}
            </div>

            <div style="margin-top: 80px; padding-top: 30px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; color: #9ca3af;">
              <div>
                <strong>${branding?.company_name || 'Consultor Independente'}</strong><br>
                ${branding?.full_name || ''}
              </div>
              <div>
                Gerado por Propostas AI • ${new Date().toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Launch puppeteer with chromium
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: (chromium as any).defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: (chromium as any).headless,
    })

    const page = await browser.newPage()
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' })
    
    const pdf = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    })
    
    await browser.close()

    return new NextResponse(pdf as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=proposta.pdf'
      }
    })
  } catch (error: any) {
    console.error('PDF Generation Error:', error)
    return NextResponse.json({ error: 'Erro ao gerar PDF: ' + error.message }, { status: 500 })
  }
}
