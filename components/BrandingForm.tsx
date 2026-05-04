'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function BrandingForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    logo_url: '',
    primary_color: '#2563eb',
    secondary_color: '#64748b',
    font_family: 'Inter',
    bio: ''
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (data) setFormData(data)
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = event.target.files?.[0]
      if (!file) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      setFormData({ ...formData, logo_url: publicUrl })
    } catch (error: any) {
      alert('Erro no upload: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('Você precisa estar logado.')
      setSaving(false)
      return
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      ...formData,
      updated_at: new Date().toISOString()
    })
    
    setSaving(false)
    if (error) alert(error.message)
    else alert('Perfil salvo com sucesso!')
  }

  if (loading) return <div className="text-center py-10">Carregando perfil...</div>

  return (
    <div className="space-y-6 p-8 border rounded-xl bg-white shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Seu Perfil de Marca</h2>
      
      <div className="flex flex-col items-center mb-6">
        <div 
          className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {formData.logo_url ? (
            <img src={formData.logo_url} alt="Logo Preview" className="w-full h-full object-contain" />
          ) : (
            <span className="text-xs text-gray-500 text-center px-2">{uploading ? 'Enviando...' : 'Clique para subir o Logo'}</span>
          )}
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          className="hidden" 
        />
        {formData.logo_url && (
           <button 
             onClick={() => setFormData({...formData, logo_url: ''})}
             className="text-xs text-red-500 mt-2 hover:underline"
           >
             Remover Logo
           </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
          <input 
            value={formData.full_name || ''} 
            onChange={e => setFormData({...formData, full_name: e.target.value})}
            placeholder="Seu nome"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nome da Empresa</label>
          <input 
            value={formData.company_name || ''} 
            onChange={e => setFormData({...formData, company_name: e.target.value})}
            placeholder="Sua empresa"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Cor Primária</label>
          <input 
            type="color" 
            value={formData.primary_color || '#2563eb'} 
            onChange={e => setFormData({...formData, primary_color: e.target.value})}
            className="h-10 w-full border rounded cursor-pointer p-1"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Cor Secundária</label>
          <input 
            type="color" 
            value={formData.secondary_color || '#64748b'} 
            onChange={e => setFormData({...formData, secondary_color: e.target.value})}
            className="h-10 w-full border rounded cursor-pointer p-1"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Fonte</label>
          <select 
            value={formData.font_family || 'Inter'} 
            onChange={e => setFormData({...formData, font_family: e.target.value})}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Bio / Diferenciais</label>
        <textarea 
          value={formData.bio || ''} 
          onChange={e => setFormData({...formData, bio: e.target.value})}
          placeholder="O que te diferencia no mercado?"
          className="w-full p-2 border rounded-md h-28 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <button 
        onClick={handleSave} 
        disabled={saving || uploading} 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md disabled:opacity-50"
      >
        {saving ? 'Salvando...' : 'Salvar Configurações'}
      </button>
    </div>
  )
}
