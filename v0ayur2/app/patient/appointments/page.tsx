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
  doctorContact: string
}

export default function AppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchAppointments()
  }, [router])

  const fetchAppointments = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const response = await apiClient.get(`/patient/${user.patientId}/appointments`)
      setAppointments(response.data.appointments || [])
    } catch (error: any) {
      toast.error("Failed to load appointments")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (appointmentId: number) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return

    try {
      await apiClient.delete(`/appointment/${appointmentId}`)
      toast.success("Appointment cancelled successfully")
      fetchAppointments()
    } catch (error: any) {
      toast.error("Failed to cancel appointment")
    }
  }

  const filteredAppointments = filter === "ALL" ? appointments : appointments.filter((a) => a.status === filter)

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <div className="flex">
        <Sidebar links={SIDEBAR_LINKS} />

        <main className="flex-1 p-8 animate-fade-in">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900">My Appointments</h1>
              <p className="text-slate-600 mt-2">View and manage your appointments</p>
            </div>

            <div className="flex gap-3 mb-6 flex-wrap">
              {["ALL", "SCHEDULED", "COMPLETED", "CANCELLED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    filter === status
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-700 hover:shadow-sm"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">Loading appointments...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-500 mb-4">No appointments found</p>
                  <Button
                    onClick={() => router.push("/patient/book-appointment")}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg"
                  >
                    Book New Appointment
                  </Button>
                </div>
              ) : (
                filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.appointmentId}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-in"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900">{appointment.doctorName}</h3>
                        <p className="text-slate-600">{appointment.specialization}</p>
                        <p className="text-sm text-slate-500 mt-2">{formatDateTime(appointment.apptDate)}</p>
                        {appointment.reason && (
                          <p className="text-sm text-slate-600 mt-2">Reason: {appointment.reason}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div
                          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                            appointment.status === "SCHEDULED"
                              ? "bg-amber-100 text-amber-800"
                              : appointment.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {appointment.status}
                        </div>
                        {appointment.status === "SCHEDULED" && (
                          <Button
                            onClick={() => handleCancel(appointment.appointmentId)}
                            variant="outline"
                            className="text-red-600 hover:text-red-700 border-slate-200 rounded-lg"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
