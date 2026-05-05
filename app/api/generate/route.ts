import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
    }

    // Fetch user profile to check usage limits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan_status, proposal_count')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    // Enforce limit: Free plan users can only generate 1 proposal
    if (profile.plan_status === 'free' && profile.proposal_count >= 1) {
      return NextResponse.json(
        { error: 'Limite do plano gratuito atingido. Faça o upgrade para o plano Pro.' },
        { status: 403 }
      )
    }

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

    const proposalContent = response.choices[0].message.content

    // Increment usage using service role to bypass RLS/triggers restriction on users
    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: incrementError } = await supabaseService
      .rpc('increment_proposal_count', { user_id: user.id })

    if (incrementError) {
      console.error('Error incrementing proposal count:', incrementError)
    }

    return NextResponse.json({ content: proposalContent })
  } catch (error: any) {
    console.error('Error in generate route:', error)
    return NextResponse.json({ error: 'Erro ao gerar proposta: ' + error.message }, { status: 500 })
  }
}
