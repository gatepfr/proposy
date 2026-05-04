'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type ProposalData = {
  clientName: string
  serviceType: string
  value: string
  deadline: string
  diagnosis: string
}

export default function ProposalGenerator() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [proposal, setProposal] = useState('')
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [formData, setFormData] = useState<ProposalData>({
    clientName: '',
    serviceType: '',
    value: '',
    deadline: '',
    diagnosis: '',
  })

  const generateInitialProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStep(2)

    try {
      // 1. Fetch Branding
      const { data: { user } } = await supabase.auth.getUser()
      let branding = null
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        branding = data
      }

      // 2. Format Prompt
      const prompt = `Gere uma proposta para o cliente ${formData.clientName}, serviço ${formData.serviceType}, valor ${formData.value}, prazo ${formData.deadline}. O problema do cliente é ${formData.diagnosis}.`

      // 3. Call API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          branding,
          history: [],
        }),
      })

      const result = await response.json()
      if (result.error) throw new Error(result.error)

      setProposal(result.content)
      setChatHistory([{ role: 'assistant', content: result.content }])
    } catch (error: any) {
      alert('Erro ao gerar proposta: ' + error.message)
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {step === 1 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Nova Proposta Comercial</h2>
          <form onSubmit={generateInitialProposal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Cliente</label>
                <input
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Ex: ACME Corp"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Serviço</label>
                <input
                  required
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  placeholder="Ex: Consultoria de Marketing"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Valor Estimado</label>
                <input
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="Ex: R$ 5.000,00"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Prazo de Entrega</label>
                <input
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  placeholder="Ex: 30 dias"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Diagnóstico / Dor do Cliente</label>
              <textarea
                required
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                placeholder="Descreva o problema que o cliente está enfrentando..."
                className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'Gerando...' : 'Gerar Proposta Inteligente'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 min-h-[600px] flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">Sua Proposta</h2>
            <button
              onClick={() => setStep(1)}
              className="text-sm text-gray-500 hover:text-blue-600 font-medium"
            >
              ← Voltar e editar dados
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 font-medium">Nossa IA está redigindo sua proposta...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                  {proposal}
                </pre>
              </div>
            </div>
          )}
          
          {!loading && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800 text-center">
                A IA terminou a primeira versão. No próximo passo você poderá refinar via chat.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
