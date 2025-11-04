"use client"
import React, { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NavBar() {
  const router = useRouter()

  function logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      router.push('/login')
    }
  }

  const role = typeof window !== 'undefined' ? (localStorage.getItem('role') || null) : null

  const links = useMemo(() => {
    const common = [
      { href: '/', label: 'Home' },
    ]

    if (role === 'ADMIN') {
      return common.concat([
        { href: '/admin/medicines', label: 'Medicines' },
        { href: '/admin/dashboard', label: 'Admin Dashboard' },
      ])
    }

    if (role === 'DOCTOR') {
      return common.concat([
        { href: '/doctor/schedule', label: 'Schedule' },
        { href: '/doctor/profile', label: 'Profile' },
      ])
    }

    // default / PATIENT
    return common.concat([
      { href: '/appointments', label: 'Appointments' },
      { href: '/profile', label: 'Profile' },
    ])
  }, [role])

  return (
    <nav className="w-full bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-semibold text-lg">Hospital</span>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-gray-700">{l.label}</Link>
          ))}
        </div>
        <div>
          <button onClick={logout} className="text-sm text-red-600">Logout</button>
        </div>
      </div>
    </nav>
  )
}
