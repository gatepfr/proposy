import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const asaasApiKey = process.env.ASAAS_API_KEY
const asaasUrl = 'https://sandbox.asaas.com/api/v3'

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
    }

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    let asaasCustomerId = profile.asaas_customer_id

    // Se não tiver ID do Asaas, criar cliente
    if (!asaasCustomerId) {
      const customerResponse = await fetch(`${asaasUrl}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': asaasApiKey || ''
        },
        body: JSON.stringify({
          name: profile.full_name || user.email,
          email: user.email,
          externalReference: user.id
        })
      })

      const customerData = await customerResponse.json()
      if (customerData.errors) {
        throw new Error('Erro ao criar cliente no Asaas: ' + JSON.stringify(customerData.errors))
      }

      asaasCustomerId = customerData.id

      // Atualizar perfil com o ID do Asaas
      await supabase
        .from('profiles')
        .update({ asaas_customer_id: asaasCustomerId })
        .eq('id', user.id)
    }

    // Criar cobrança (Plano Pro - R$ 29,90)
    const paymentResponse = await fetch(`${asaasUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': asaasApiKey || ''
      },
      body: JSON.stringify({
        customer: asaasCustomerId,
        billingType: 'UNDEFINED', // Permite Cartão ou Pix
        value: 29.90,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0], // Amanhã
        description: 'Assinatura Plano Pro - Gerador de Propostas',
        externalReference: user.id
      })
    })

    const paymentData = await paymentResponse.json()
    if (paymentData.errors) {
      throw new Error('Erro ao criar cobrança no Asaas: ' + JSON.stringify(paymentData.errors))
    }

    return NextResponse.json({
      invoiceUrl: paymentData.invoiceUrl,
      paymentId: paymentData.id
    })

  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
