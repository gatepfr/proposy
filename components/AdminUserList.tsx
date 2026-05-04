'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  full_name: string | null
  company_name: string | null
  plan_status: string
  proposal_count: number
  is_admin: boolean
}

export default function AdminUserList() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, company_name, plan_status, proposal_count, is_admin')
        .order('full_name', { ascending: true })

      if (error) throw error
      setProfiles(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function togglePlan(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'pro' ? 'free' : 'pro'
    const { error } = await supabase
      .from('profiles')
      .update({ plan_status: newStatus })
      .eq('id', id)

    if (error) {
      alert(error.message)
    } else {
      setProfiles(profiles.map(p => p.id === id ? { ...p, plan_status: newStatus } : p))
    }
  }

  async function toggleAdmin(id: string, currentAdmin: boolean) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !currentAdmin })
      .eq('id', id)

    if (error) {
      alert(error.message)
    } else {
      setProfiles(profiles.map(p => p.id === id ? { ...p, is_admin: !currentAdmin } : p))
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center p-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="ml-3 text-gray-600">Loading users...</span>
    </div>
  )

  if (error) return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-center">
      Error: {error}
    </div>
  )

  return (
    <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Proposals</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {profile.full_name || (
                      <span className="text-gray-400 italic">No name</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {profile.company_name || (
                      <span className="text-gray-400 italic">No company</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${
                      profile.plan_status === 'pro' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {profile.plan_status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {profile.proposal_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {profile.is_admin ? (
                      <span className="px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        Admin
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">User</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => togglePlan(profile.id, profile.plan_status)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      {profile.plan_status === 'pro' ? 'Downgrade' : 'Upgrade'}
                    </button>
                    <button
                      onClick={() => toggleAdmin(profile.id, profile.is_admin)}
                      className={`inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm transition-colors ${
                        profile.is_admin 
                          ? 'text-red-700 bg-white hover:bg-red-50' 
                          : 'text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {profile.is_admin ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
