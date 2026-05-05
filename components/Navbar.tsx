'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
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
  }, [])

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-blue-600 tracking-tight">
          Proposy
        </Link>
        
        {user && (
          <div className="flex items-center gap-6">
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
          </div>
        )}
      </div>
    </nav>
  )
}
