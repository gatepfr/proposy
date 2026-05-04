'use client'

import React, { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'

type Branding = {
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  font_family?: string
  company_name?: string
}

interface MarkdownPreviewProps {
  content: string
  branding?: Branding | null
}

const MarkdownPreview = React.memo(function MarkdownPreview({ content, branding }: MarkdownPreviewProps) {
  const styles = {
    fontFamily: branding?.font_family || 'Inter, sans-serif',
  }

  const components = useMemo(() => ({
    h1: ({ children }: any) => <h1 style={{ color: branding?.primary_color || '#2563eb' }} className="mb-6">{children}</h1>,
    h2: ({ children }: any) => <h2 style={{ color: branding?.primary_color || '#2563eb' }} className="mt-8 mb-4 border-b pb-2">{children}</h2>,
    h3: ({ children }: any) => <h3 style={{ color: branding?.secondary_color || '#64748b' }} className="mt-6 mb-3">{children}</h3>,
    strong: ({ children }: any) => <strong style={{ color: branding?.primary_color || '#2563eb' }}>{children}</strong>,
    a: ({ href, children }: any) => <a href={href} style={{ color: branding?.primary_color || '#2563eb' }} className="underline hover:opacity-80 transition-opacity">{children}</a>,
  }), [branding])

  return (
    <div className="bg-white p-8 shadow-inner min-h-full overflow-y-auto rounded-lg border border-gray-200" style={styles}>
      {branding?.logo_url && (
        <div className="mb-8 flex justify-end">
          <img src={branding.logo_url} alt="Logo" className="max-h-16 object-contain" />
        </div>
      )}
      
      <div className="prose prose-blue max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-p:text-gray-700 prose-p:leading-relaxed">
        <ReactMarkdown components={components}>
          {content}
        </ReactMarkdown>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-500 flex justify-between items-center">
        <p>© {new Date().getFullYear()} {branding?.company_name || 'Consultor Independente'}</p>
        <p>Gerado por Propostas AI</p>
      </div>
    </div>
  )
})

export default MarkdownPreview
