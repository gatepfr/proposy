'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

import { User } from '@supabase/supabase-js'

export default function Navbar() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        if (data?.is_admin) {
          setIsAdmin(true)
        }
      }
    }
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) setIsAdmin(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-blue-600 tracking-tight">
          Proposy
        </Link>
        
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/settings" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Branding
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1">
                  Admin
                </Link>
              )}
              <button 
                onClick={handleSignOut}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <Link 
              href="/auth" 
              className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
