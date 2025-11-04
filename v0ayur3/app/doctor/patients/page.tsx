"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/app/components/nav-bar"
import Sidebar from "@/app/components/sidebar"
import apiClient from "@/lib/api-client"
import { toast } from "react-toastify"

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/doctor/dashboard", icon: "🏠" },
  { label: "My Appointments", href: "/doctor/appointments", icon: "📅" },
  { label: "Patients", href: "/doctor/patients", icon: "👥" },
  { label: "Schedule", href: "/doctor/schedule", icon: "⏰" },
  { label: "Profile", href: "/doctor/profile", icon: "👤" },
]

interface PatientHistory {
  patientName: string
  specialization: string
}

export default function DoctorPatientsPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<PatientHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchPatients()
  }, [router])

  const fetchPatients = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const response = await apiClient.get(`/doctor/${user.doctorId}/appointments`)
      const appointments = response.data.appointments || []

      const uniquePatients = Array.from(new Map(appointments.map((a: any) => [a.patientName, a])).values())

      setPatients(uniquePatients)
    } catch (error: any) {
      toast.error("Failed to load patients")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <div className="flex">
        <Sidebar links={SIDEBAR_LINKS} />

        <main className="flex-1 p-8 animate-fade-in">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900">My Patients</h1>
              <p className="text-gray-600 mt-2">View your patient list</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <div className="text-center py-12 col-span-full">
                  <p className="text-gray-500">Loading patients...</p>
                </div>
              ) : patients.length === 0 ? (
                <div className="text-center py-12 col-span-full bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-gray-500">No patients yet</p>
                </div>
              ) : (
                patients.map((patient, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-in"
                  >
                    <h3 className="text-lg font-bold text-gray-900">{patient.patientName}</h3>
                    <p className="text-sm text-gray-600 mt-2">Doctor appointments managed</p>
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
