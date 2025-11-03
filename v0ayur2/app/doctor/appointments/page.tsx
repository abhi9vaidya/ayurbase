"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/app/components/nav-bar"
import Sidebar from "@/app/components/sidebar"
import apiClient from "@/lib/api-client"
import { toast } from "react-toastify"
import { formatDateTime } from "@/lib/utils"

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/doctor/dashboard", icon: "🏠" },
  { label: "My Appointments", href: "/doctor/appointments", icon: "📅" },
  { label: "Patients", href: "/doctor/patients", icon: "👥" },
  { label: "Schedule", href: "/doctor/schedule", icon: "⏰" },
  { label: "Profile", href: "/doctor/profile", icon: "👤" },
]

interface Appointment {
  appointmentId: number
  apptDate: string
  status: string
  reason: string
  patientName: string
  patientEmail: string
}

export default function DoctorAppointmentsPage() {
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
      const response = await apiClient.get(`/doctor/${user.doctorId}/appointments`)
      setAppointments(response.data.appointments || [])
    } catch (error: any) {
      toast.error("Failed to load appointments")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    try {
      await apiClient.put(`/appointment/${appointmentId}`, { status: newStatus })
      toast.success("Appointment status updated")
      fetchAppointments()
    } catch (error: any) {
      toast.error("Failed to update appointment")
    }
  }

  const filteredAppointments = filter === "ALL" ? appointments : appointments.filter((a) => a.status === filter)

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <div className="flex">
        <Sidebar links={SIDEBAR_LINKS} />

        <main className="flex-1 p-8 animate-fade-in">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-600 mt-2">View and manage patient appointments</p>
            </div>

            <div className="flex gap-3 mb-6">
              {["ALL", "SCHEDULED", "COMPLETED", "CANCELLED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    filter === status ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading appointments...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-gray-500">No appointments found</p>
                </div>
              ) : (
                filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.appointmentId}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-in"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{appointment.patientName}</h3>
                        <p className="text-sm text-gray-600">{appointment.patientEmail}</p>
                        <p className="text-sm text-gray-500 mt-2">{formatDateTime(appointment.apptDate)}</p>
                        {appointment.reason && (
                          <p className="text-sm text-gray-600 mt-2">Reason: {appointment.reason}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <select
                          value={appointment.status}
                          onChange={(e) => handleStatusChange(appointment.appointmentId, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium border ${
                            appointment.status === "SCHEDULED"
                              ? "border-yellow-200 bg-yellow-50 text-yellow-800"
                              : appointment.status === "COMPLETED"
                                ? "border-green-200 bg-green-50 text-green-800"
                                : "border-gray-200 bg-gray-50 text-gray-800"
                          }`}
                        >
                          <option value="SCHEDULED">Scheduled</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
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
