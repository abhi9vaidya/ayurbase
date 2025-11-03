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

interface Doctor {
  doctorId: number
  name: string
  email: string
  specialization: string
  experienceYrs: number
  qualification: string
}

export default function AdminDoctorsPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchDoctors()
  }, [router])

  const fetchDoctors = async () => {
    try {
      const response = await apiClient.get("/doctor")
      setDoctors(response.data.doctors || [])
    } catch (error: any) {
      toast.error("Failed to load doctors")
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
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-slate-900">Manage Doctors</h1>
                <p className="text-slate-600 mt-2">View and manage doctor accounts</p>
              </div>
              <Button
                onClick={() => router.push("/admin/add-doctor")}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-lg"
              >
                Add New Doctor
              </Button>
            </div>

            <div className="border border-slate-200 rounded-2xl shadow-sm overflow-hidden bg-white">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Specialization</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Experience</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Qualification</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <p className="text-slate-500">Loading doctors...</p>
                      </td>
                    </tr>
                  ) : doctors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <p className="text-slate-500">No doctors found</p>
                      </td>
                    </tr>
                  ) : (
                    doctors.map((doctor) => (
                      <tr
                        key={doctor.doctorId}
                        className="border-b border-slate-200 hover:bg-slate-50 transition-all duration-300"
                      >
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">{doctor.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{doctor.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{doctor.specialization}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{doctor.experienceYrs} years</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{doctor.qualification}</td>
                        <td className="px-6 py-4 text-sm">
                          <Button
                            onClick={() => router.push(`/admin/doctor/${doctor.doctorId}`)}
                            variant="outline"
                            className="text-blue-600 hover:text-blue-700 border-slate-200 rounded-lg"
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
