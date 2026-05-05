import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: Request) {
  try {
    // Verificar token do webhook para segurança
    const webhookToken = req.headers.get('asaas-access-token')
    if (webhookToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
      console.warn('Webhook: Tentativa de acesso não autorizado')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { event, payment } = body

    console.log(`Webhook recebido: ${event}`, payment)

    // Eventos de sucesso no pagamento
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      const userId = payment.externalReference
      const asaasCustomerId = payment.customer

      if (!userId) {
        console.error('Webhook: externalReference (userId) não encontrado no pagamento')
        // Retornamos 200 para o Asaas não tentar reenviar um payload permanentemente inválido
        return NextResponse.json({ received: true, warning: 'Missing externalReference' })
      }

      // Usar service role key para atualizar o perfil independente de RLS
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          plan_status: 'pro',
          asaas_customer_id: asaasCustomerId // Garantir que esteja atualizado
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Erro ao atualizar plano do usuário:', updateError)
        return NextResponse.json({ error: 'Erro ao atualizar plano' }, { status: 500 })
      }

      console.log(`Usuário ${userId} atualizado para Plano Pro com sucesso!`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
