"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/components/NavBar"
import Sidebar from "@/components/Sidebar"
import apiClient from "@/lib/api-client"
import { toast } from "react-toastify"
import { formatDateTime } from "@/lib/utils"

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "🏠" },
  { label: "Doctors", href: "/admin/doctors", icon: "👨‍⚕️" },
  { label: "Patients", href: "/admin/patients", icon: "🧑‍🤝‍🧑" },
  { label: "Appointments", href: "/admin/appointments", icon: "📅" },
  { label: "Medicines", href: "/admin/medicines", icon: "💊" },
  { label: "Reports", href: "/admin/reports", icon: "📊" },
]

interface Appointment {
  appointmentId: number
  apptDate: string
  status: string
  reason: string
  patientName: string
  doctorName: string
}

export default function AdminAppointmentsPage() {
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
      const response = await apiClient.get("/appointment")
      setAppointments(response.data.appointments || [])
    } catch (error: any) {
      toast.error("Failed to load appointments")
    } finally {
      setLoading(false)
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
              <h1 className="text-4xl font-bold text-gray-900">All Appointments</h1>
              <p className="text-gray-600 mt-2">Manage all system appointments</p>
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

            <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Patient</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Doctor</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reason</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <p className="text-gray-500">Loading appointments...</p>
                      </td>
                    </tr>
                  ) : filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <p className="text-gray-500">No appointments found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <tr
                        key={appointment.appointmentId}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-300"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{appointment.patientName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{appointment.doctorName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(appointment.apptDate)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{appointment.reason || "-"}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              appointment.status === "SCHEDULED"
                                ? "bg-yellow-100 text-yellow-800"
                                : appointment.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
