import React from 'react'
import dynamic from 'next/dynamic'
import DoctorProfileForm from '@/components/DoctorProfileForm'
import NavBar from '@/app/components/nav-bar'
import Sidebar from '@/components/Sidebar'

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/doctor/dashboard", icon: "🏠" },
  { label: "My Appointments", href: "/doctor/appointments", icon: "📅" },
  { label: "Patients", href: "/doctor/patients", icon: "👥" },
  { label: "Schedule", href: "/doctor/schedule", icon: "⏰" },
  { label: "Profile", href: "/doctor/profile", icon: "👤" },
]

export default function ProfilePage() {
  return (
    <div>
      <NavBar />
      <div className="flex">
        <Sidebar links={SIDEBAR_LINKS} />
        <main className="flex-1 p-8">
          <DoctorProfileForm />
        </main>
      </div>
    </div>

  )
}
