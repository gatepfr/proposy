'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

import { User } from '@supabase/supabase-js'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans p-6 text-center">
      <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
        Propostas Comerciais <span className="text-blue-600">Inteligentes</span>
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mb-10">
        Gere propostas irresistíveis em segundos usando Inteligência Artificial.
        Personalize com sua marca, exporte em PDF e feche mais negócios.
      </p>
      
      <div className="flex gap-4">
        <Link 
          href={user ? "/dashboard" : "/auth"} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-transform hover:scale-105"
        >
          {user ? 'Acessar o Dashboard' : 'Começar Agora - Grátis'}
        </Link>
      </div>
    </div>
  );
}
