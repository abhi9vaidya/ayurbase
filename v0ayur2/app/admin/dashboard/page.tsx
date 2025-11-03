"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/app/components/nav-bar"
import Sidebar from "@/app/components/sidebar"
import apiClient from "@/lib/api-client"
import { toast } from "react-toastify"

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "🏠" },
  { label: "Doctors", href: "/admin/doctors", icon: "👨‍⚕️" },
  { label: "Patients", href: "/admin/patients", icon: "🧑‍🤝‍🧑" },
  { label: "Appointments", href: "/admin/appointments", icon: "📅" },
  { label: "Reports", href: "/admin/reports", icon: "📊" },
]

interface DashboardStats {
  totalDoctors: number
  totalPatients: number
  totalAppointments: number
  scheduledAppointments: number
  completedAppointments: number
  appointmentsThisWeek: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (!token || !user) {
      router.push("/login")
      return
    }

    fetchStats()
  }, [router])

  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/admin/dashboard")
      setStats(response.data.statistics)
    } catch (error: any) {
      toast.error("Failed to load dashboard data")
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
              <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600 mt-2">System overview and management</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-slate-500">Loading dashboard data...</p>
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md gradient-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium">Total Doctors</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalDoctors}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
                        👨‍⚕️
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md gradient-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium">Total Patients</p>
                        <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalPatients}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-xl">
                        🧑‍🤝‍🧑
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md gradient-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium">Total Appointments</p>
                        <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.totalAppointments}</p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">
                        📅
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md gradient-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium">Scheduled</p>
                        <p className="text-3xl font-bold text-amber-600 mt-2">{stats.scheduledAppointments}</p>
                      </div>
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-xl">
                        ⏳
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md gradient-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium">Completed</p>
                        <p className="text-3xl font-bold text-cyan-600 mt-2">{stats.completedAppointments}</p>
                      </div>
                      <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center text-xl">
                        ✅
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md gradient-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium">This Week</p>
                        <p className="text-3xl font-bold text-pink-600 mt-2">{stats.appointmentsThisWeek}</p>
                      </div>
                      <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-xl">
                        📈
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}
