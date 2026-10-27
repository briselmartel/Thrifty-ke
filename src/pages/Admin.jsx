import { useEffect, useState } from 'react'
import { supabase } from "../lib/supabaseClient";
import { Link } from 'react-router-dom'

// Replace with your exact Thrifty login email
const ADMIN_EMAIL = 'kaixaden6@gmail.com'

export default function Admin() {
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [usersList, setUsersList] = useState([])
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function initAdmin() {
      // 1. Get logged in user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      if (!user || user.email !== ADMIN_EMAIL) {
        setLoading(false)
        return
      }

      // 2. Fetch users/profiles from database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        // Fallback if table is named 'users' instead of 'profiles'
        const alt = await supabase.from('users').select('*')
        if (alt.error) {
          setErrorMsg(error.message)
        } else {
          setUsersList(alt.data || [])
        }
      } else {
        setUsersList(data || [])
      }

      setLoading(false)
    }

    initAdmin()
  }, [])

  if (loading) {
    return <div className="p-10 text-center text-gray-600">Verifying admin access...</div>
  }

  // Not signed in with admin email
  if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 border rounded-lg text-center bg-white shadow-sm">
        <h2 className="text-xl font-bold text-red-600 mb-2">Admin Access Required</h2>
        <p className="text-sm text-gray-600 mb-4">
          Please log in with the administrator account to view sign-ups.
        </p>
        <Link to="/login" className="inline-block bg-black text-white px-4 py-2 rounded text-sm font-medium">
          Go to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Thrifty Registered Members</p>
        </div>
        <div className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1.5 rounded-full font-semibold">
          Total Users: {usersList.length}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-amber-50 text-amber-800 rounded text-sm border border-amber-200">
          Notice: {errorMsg}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">User ID</th>
              <th className="p-4">Registered Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usersList.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-500">
                  No member records found yet.
                </td>
              </tr>
            ) : (
              usersList.map((u, i) => (
                <tr key={u.id || i} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">
                    {u.email || u.full_name || u.username || 'Registered Member'}
                  </td>
                  <td className="p-4 font-mono text-xs text-gray-500">{u.id}</td>
                  <td className="p-4 text-gray-500">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
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