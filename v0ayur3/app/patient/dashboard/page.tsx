"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/app/components/nav-bar"
import Sidebar from "@/app/components/sidebar"
import { Button } from "@/components/ui/button"
import apiClient from "@/lib/api-client"
import { toast } from "react-toastify"
import { formatDateTime } from "@/lib/utils"

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/patient/dashboard", icon: "🏠" },
  { label: "Book Appointment", href: "/patient/book-appointment", icon: "📅" },
  { label: "My Appointments", href: "/patient/appointments", icon: "📋" },
  { label: "Profile", href: "/patient/profile", icon: "👤" },
]

interface Appointment {
  appointmentId: number
  apptDate: string
  status: string
  reason: string
  doctorName: string
  specialization: string
}

export default function PatientDashboard() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState({ total: 0, scheduled: 0, completed: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (!token || !user) {
      router.push("/login")
      return
    }

    fetchAppointments()
  }, [router])

  const fetchAppointments = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const response = await apiClient.get(`/patient/${user.patientId}/appointments`)
      const appointments = response.data.appointments || []
      setAppointments(appointments.slice(0, 5))

      const scheduled = appointments.filter((a: Appointment) => a.status === "SCHEDULED").length
      const completed = appointments.filter((a: Appointment) => a.status === "COMPLETED").length

      setStats({
        total: appointments.length,
        scheduled,
        completed,
      })
    } catch (error: any) {
      console.error("[v0] Fetch error:", error)
      toast.error("Failed to load appointments")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <div className="flex">
        <Sidebar links={SIDEBAR_LINKS} />

        <main className="flex-1 p-8 animate-fade-in">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Patient Dashboard</h1>
              <p className="text-slate-600 mt-2">Welcome back! Manage your appointments</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md gradient-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Appointments</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl">📅</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md gradient-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Scheduled</p>
                    <p className="text-3xl font-bold text-cyan-600 mt-2">{stats.scheduled}</p>
                  </div>
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center text-xl">✓</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md gradient-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.completed}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">✔️</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 animate-slide-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Recent Appointments</h2>
                <Button
                  onClick={() => router.push("/patient/book-appointment")}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all duration-300"
                >
                  Book New Appointment
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">Loading appointments...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No appointments yet</p>
                  <Button
                    onClick={() => router.push("/patient/book-appointment")}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Book Your First Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.appointmentId}
                      className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{appointment.doctorName}</p>
                        <p className="text-sm text-slate-600">{appointment.specialization}</p>
                        <p className="text-sm text-slate-500 mt-1">{formatDateTime(appointment.apptDate)}</p>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          appointment.status === "SCHEDULED"
                            ? "bg-amber-100 text-amber-800"
                            : appointment.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {appointment.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
