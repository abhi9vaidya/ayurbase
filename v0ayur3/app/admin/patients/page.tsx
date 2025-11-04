"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/app/components/nav-bar"
import Sidebar from "@/app/components/sidebar"
import { Button } from "@/components/ui/button"
import apiClient from "@/lib/api-client"
import { toast } from "react-toastify"

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "🏠" },
  { label: "Doctors", href: "/admin/doctors", icon: "👨‍⚕️" },
  { label: "Patients", href: "/admin/patients", icon: "🧑‍🤝‍🧑" },
  { label: "Appointments", href: "/admin/appointments", icon: "📅" },
  { label: "Reports", href: "/admin/reports", icon: "📊" },
]

interface Patient {
  patientId: number
  name: string
  email: string
  gender: string
  bloodGroup: string
  city: string
  state: string
}

export default function AdminPatientsPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
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
      const response = await apiClient.get("/patient")
      setPatients(response.data.patients || [])
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
              <h1 className="text-4xl font-bold text-gray-900">Manage Patients</h1>
              <p className="text-gray-600 mt-2">View and manage patient accounts ({patients.length} total)</p>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Gender</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Blood Group</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">City</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <p className="text-gray-500">Loading patients...</p>
                      </td>
                    </tr>
                  ) : patients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <p className="text-gray-500">No patients found</p>
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient) => (
                      <tr
                        key={patient.patientId}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-300"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{patient.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{patient.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{patient.gender}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{patient.bloodGroup}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{patient.city}</td>
                        <td className="px-6 py-4 text-sm">
                          <Button
                            onClick={() => router.push(`/admin/patient/${patient.patientId}`)}
                            variant="outline"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            View
                          </Button>
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
