"use client"
import React, { useEffect, useState, useCallback } from 'react'
import apiClient from '@/lib/api-client'
import NavBar from '@/app/components/nav-bar'
import Sidebar from '@/components/Sidebar'

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/doctor/dashboard", icon: "🏠" },
  { label: "My Appointments", href: "/doctor/appointments", icon: "📅" },
  { label: "Patients", href: "/doctor/patients", icon: "👥" },
  { label: "Schedule", href: "/doctor/schedule", icon: "⏰" },
  { label: "Profile", href: "/doctor/profile", icon: "👤" },
]

type Appt = {
  appointmentId: number
  apptDate: string
  durationMin: number
  status: string
  patientId: number
  patientName: string
}

export default function DoctorSchedulePage() {
  const [schedule, setSchedule] = useState<Appt[]>([])
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await apiClient.get('/doctor/schedule')
      setSchedule(res.data.schedule || [])
    } catch (err) {
      console.error('Failed to fetch schedule', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSchedule()
    const id = setInterval(fetchSchedule, 30000) // refresh every 30s
    return () => clearInterval(id)
  }, [fetchSchedule])

  async function updateAvailability() {
    try {
      await apiClient.put('/doctor/schedule', { availableFrom: from, availableTo: to })
      await fetchSchedule()
      alert('Availability updated')
    } catch (err) {
      console.error(err)
      alert('Failed to update')
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div>
      <NavBar />
      <div className="flex">
        <Sidebar links={SIDEBAR_LINKS} />
           <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Schedule</h1>

        <div className="mb-6 border p-4 rounded">
          <h2 className="font-medium mb-2">Set Availability</h2>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Available from (ISO)" value={from} onChange={(e) => setFrom(e.target.value)} className="border p-2 rounded" />
            <input placeholder="Available to (ISO)" value={to} onChange={(e) => setTo(e.target.value)} className="border p-2 rounded" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={updateAvailability}>Update</button>
            <button className="px-3 py-1 border rounded" onClick={fetchSchedule}>Refresh</button>
          </div>
        </div>

        <div>
          <h2 className="font-medium mb-2">Upcoming Appointments</h2>
          <div className="space-y-2">
            {schedule.length === 0 && <div>No appointments</div>}
            {schedule.map((s) => (
              <div key={s.appointmentId} className="border p-3 rounded flex justify-between">
                <div>
                  <div className="font-medium">{s.patientName}</div>
                  <div className="text-sm text-gray-600">{new Date(s.apptDate).toLocaleString()}</div>
                </div>
                <div className="text-sm">{s.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
        </div>
    </div>
  )
}
