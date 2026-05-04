'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function BrandingForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(initialData || {
    company_name: '',
    primary_color: '#2563eb',
    secondary_color: '#64748b',
    font_family: 'Inter',
    bio: ''
  })

  const handleSave = async () => {
    setLoading(true)
    // Get the current user session
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('You must be logged in to save branding.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      ...formData,
      updated_at: new Date().toISOString()
    })
    
    setLoading(false)
    if (error) alert(error.message)
    else alert('Branding saved!')
  }

  return (
    <div className="space-y-4 p-6 border rounded-lg bg-white shadow-sm max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Sua Marca</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
        <input 
          value={formData.company_name} 
          onChange={e => setFormData({...formData, company_name: e.target.value})}
          placeholder="Ex: Minha Agência"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cor Primária</label>
          <input 
            type="color" 
            value={formData.primary_color} 
            onChange={e => setFormData({...formData, primary_color: e.target.value})}
            className="h-10 w-full border rounded cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cor Secundária</label>
          <input 
            type="color" 
            value={formData.secondary_color} 
            onChange={e => setFormData({...formData, secondary_color: e.target.value})}
            className="h-10 w-full border rounded cursor-pointer"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Diferenciais</label>
        <textarea 
          value={formData.bio} 
          onChange={e => setFormData({...formData, bio: e.target.value})}
          placeholder="Conte um pouco sobre seu diferencial..."
          className="w-full p-2 border rounded-md h-24 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <button 
        onClick={handleSave} 
        disabled={loading} 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'Salvar Branding'}
      </button>
    </div>
  )
}
