import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const { prompt, history, branding } = await req.json()
    
    const systemPrompt = `Você é um consultor comercial sênior especializado em propostas de alto impacto. 
    Gere ou ajuste uma proposta comercial profissional baseada nos dados fornecidos.
    
    ESTRUTURA OBRIGATÓRIA:
    1. Abertura Personalizada
    2. Diagnóstico do Problema (dor do cliente e custo da inação)
    3. Solução Proposta
    4. Metodologia e Etapas
    5. Investimento e Condições
    6. Call to Action (CTA)
    
    DADOS DE BRANDING DO PROFISSIONAL:
    - Empresa: ${branding?.company_name || 'Consultor Independente'}
    - Diferenciais: ${branding?.bio || 'Excelência e entrega de valor.'}
    
    REGRAS:
    - Retorne APENAS o conteúdo da proposta em Markdown.
    - Não inclua saudações iniciais ou comentários fora do Markdown.
    - Use um tom profissional e persuasivo.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...(history || []),
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })

    return NextResponse.json({ content: response.choices[0].message.content })
  } catch (error: any) {
    console.error('Error in generate route:', error)
    return NextResponse.json({ error: 'Erro ao gerar proposta: ' + error.message }, { status: 500 })
  }
}
