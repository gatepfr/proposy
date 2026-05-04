'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import MarkdownPreview from './MarkdownPreview'

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
  const [refinementInput, setRefinementInput] = useState('')
  const [branding, setBranding] = useState<any>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState<ProposalData>({
    clientName: '',
    serviceType: '',
    value: '',
    deadline: '',
    diagnosis: '',
  })

  useEffect(() => {
    async function fetchBranding() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setBranding(data)
      }
    }
    fetchBranding()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const generateInitialProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStep(2)

    try {
      const prompt = `Gere uma proposta para o cliente ${formData.clientName}, serviço ${formData.serviceType}, valor ${formData.value}, prazo ${formData.deadline}. O problema do cliente é ${formData.diagnosis}.`

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
      setChatHistory([{ role: 'assistant', content: 'Aqui está a primeira versão da sua proposta. O que gostaria de ajustar?' }])
    } catch (error: any) {
      alert('Erro ao gerar proposta: ' + error.message)
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  const refineProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!refinementInput.trim() || loading) return

    const userMessage = refinementInput
    setRefinementInput('')
    setLoading(true)

    // Update history with user message
    const newHistory: Message[] = [
      ...chatHistory,
      { role: 'user', content: userMessage }
    ]
    setChatHistory(newHistory)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Ajuste a proposta atual baseada neste pedido: ${userMessage}. Retorne a proposta completa atualizada.`,
          branding,
          history: [
            { role: 'assistant', content: `PROPOSTA ATUAL:\n${proposal}` },
            ...newHistory.filter(m => m.content !== 'Aqui está a primeira versão da sua proposta. O que gostaria de ajustar?')
          ],
        }),
      })

      const result = await response.json()
      if (result.error) throw new Error(result.error)

      setProposal(result.content)
      setChatHistory([
        ...newHistory,
        { role: 'assistant', content: 'Proposta atualizada! Deseja mais alguma alteração?' }
      ])
    } catch (error: any) {
      alert('Erro ao refinar proposta: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6">
      {step === 1 ? (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-100">
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
        <div className="flex flex-col h-[calc(100vh-120px)] bg-gray-50 rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Refinando Proposta</h2>
              <p className="text-sm text-gray-500">Cliente: {formData.clientName}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Voltar
              </button>
              <button
                className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-all"
                onClick={() => window.print()}
              >
                Finalizar e PDF
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Pane: Chat */}
            <div className="w-full md:w-[400px] flex flex-col bg-white border-r border-gray-200">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-2xl border border-gray-100 rounded-tl-none shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={refineProposal} className="p-4 border-t bg-white">
                <div className="relative">
                  <input
                    value={refinementInput}
                    onChange={(e) => setRefinementInput(e.target.value)}
                    placeholder="Peça ajustes (ex: 'mude o tom', 'adicione garantia')..."
                    className="w-full p-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !refinementInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-2-9-18-9 18 9 2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Pane: Preview */}
            <div className="hidden md:block flex-1 bg-gray-200 p-8 overflow-y-auto">
              <div className="max-w-[800px] mx-auto min-h-full">
                {proposal ? (
                  <MarkdownPreview content={proposal} branding={branding} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <p className="animate-pulse">Gerando prévia...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

