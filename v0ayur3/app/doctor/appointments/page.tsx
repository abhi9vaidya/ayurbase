"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/app/components/nav-bar"
import Sidebar from "@/app/components/sidebar"
import { Button } from "@/components/ui/button"
import apiClient from "@/lib/api-client"
import { toast } from "react-toastify"
import { formatDateTime } from "@/lib/utils"
import PrescriptionForm from "@/components/prescription-form"

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
  const [prescriptioningId, setPrescriptioningId] = useState<number | null>(null)
  const [prescriptionData, setPrescriptionData] = useState<any>(null)
  const [fetchingPrescription, setFetchingPrescription] = useState(false)
  // map appointmentId -> prescriptionId (or null)
  const [prescriptionMap, setPrescriptionMap] = useState<Record<number, number | null>>({})

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
      const appts = response.data.appointments || []
      setAppointments(appts)
      // populate prescription map so UI can show Add vs Edit
      fetchPrescriptionMapFor(appts)
    } catch (error: any) {
      toast.error("Failed to load appointments")
      console.error("[v0] Fetch appointments error:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrescriptionMapFor = async (appts: Appointment[]) => {
    const map: Record<number, number | null> = {}
    await Promise.all(
      appts.map(async (a) => {
        try {
          const resp = await apiClient.get("/prescription", { params: { appointmentId: a.appointmentId } })
          const pres = resp.data.prescriptions
          map[a.appointmentId] = pres?.length > 0 ? pres[0].prescriptionId : null
        } catch (err) {
          map[a.appointmentId] = null
        }
      }),
    )
    setPrescriptionMap(map)
  }

  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    try {
      await apiClient.put(`/appointment/${appointmentId}`, { status: newStatus })
      toast.success("Appointment status updated")
      fetchAppointments()
    } catch (error: any) {
      toast.error("Failed to update appointment")
      console.error("[v0] Update appointment error:", error)
    }
  }

  const handleCreatePrescription = async (appointmentId: number) => {
    try {
      setFetchingPrescription(true)

      // If we already know the prescriptionId from the map, use it.
      let prescriptionId = prescriptionMap[appointmentId] ?? null

      if (!prescriptionId) {
        // double-check in case map is stale
        try {
          const existing = await apiClient.get("/prescription", { params: { appointmentId } })
          if (existing.data.prescriptions?.length > 0) {
            prescriptionId = existing.data.prescriptions[0].prescriptionId
            setPrescriptionMap((prev) => ({ ...prev, [appointmentId]: prescriptionId }))
          }
        } catch (err) {
          // ignore and continue to create
        }
      }

      if (!prescriptionId) {
        // Create new prescription
        const createResponse = await apiClient.post("/prescription", { appointmentId })
        prescriptionId = createResponse.data.prescriptionId
        setPrescriptionMap((prev) => ({ ...prev, [appointmentId]: prescriptionId }))
      }

      // Fetch prescription details
      const response = await apiClient.get(`/prescription/${prescriptionId}`)
      setPrescriptionData(response.data)
      setPrescriptioningId(appointmentId)
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create prescription"
      toast.error(message)
      console.error("[v0] Create prescription error:", error)
    } finally {
      setFetchingPrescription(false)
    }
  }

  const handlePrescriptionSaved = () => {
    setPrescriptioningId(null)
    setPrescriptionData(null)
    fetchAppointments()
    toast.success("Prescription created/updated successfully")
  }

  const filteredAppointments = filter === "ALL" ? appointments : appointments.filter((a) => a.status === filter)

  if (prescriptioningId && prescriptionData) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />

        <div className="flex">
          <Sidebar links={SIDEBAR_LINKS} />

          <main className="flex-1 p-8 animate-fade-in">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <button
                  onClick={() => {
                    setPrescriptioningId(null)
                    setPrescriptionData(null)
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-2"
                >
                  ← Back to Appointments
                </button>
                <h1 className="text-4xl font-bold text-gray-900">Create/Edit Prescription</h1>
                <p className="text-gray-600 mt-2">Manage prescription for appointment #{prescriptioningId}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <PrescriptionForm
                  prescriptionId={prescriptionData.prescriptionId}
                  initialNotes={prescriptionData.notes}
                  initialMedicines={prescriptionData.medicines || []}
                  onSave={handlePrescriptionSaved}
                  onCancel={() => {
                    setPrescriptioningId(null)
                    setPrescriptionData(null)
                  }}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

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
                        {appointment.status === "COMPLETED" && (
                          <Button
                            onClick={() => handleCreatePrescription(appointment.appointmentId)}
                            disabled={fetchingPrescription}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm whitespace-nowrap"
                          >
                            {fetchingPrescription
                              ? "Loading..."
                              : prescriptionMap[appointment.appointmentId]
                              ? "Edit Prescription"
                              : "Add Prescription"}
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
