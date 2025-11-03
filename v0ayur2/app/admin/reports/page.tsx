"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/app/components/nav-bar"
import Sidebar from "@/app/components/sidebar"
import apiClient from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "🏠" },
  { label: "Doctors", href: "/admin/doctors", icon: "👨‍⚕️" },
  { label: "Patients", href: "/admin/patients", icon: "🧑‍🤝‍🧑" },
  { label: "Appointments", href: "/admin/appointments", icon: "📅" },
  { label: "Reports", href: "/admin/reports", icon: "📊" },
]

type TopDoctor = { name: string; specialization: string; appointmentCount: number }
type StatusCount = { status: string; count: number }
type SpecCount = { specialization: string; doctorCount: number }

export default function AdminReportsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<{
    topDoctors: TopDoctor[]
    appointmentsByStatus: StatusCount[]
    specializations: SpecCount[]
  } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchReports = async () => {
    try {
      const res = await apiClient.get("/admin/reports")
      setReports(res.data.reports)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  const downloadJSON = () => {
    if (!reports) return
    const blob = new Blob([JSON.stringify(reports, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "reports.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const maxAppointments = Math.max(1, ...(reports?.topDoctors.map((d) => d.appointmentCount) || [0]))
  const maxStatus = Math.max(1, ...(reports?.appointmentsByStatus.map((s) => s.count) || [0]))

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="flex">
        <Sidebar links={SIDEBAR_LINKS} />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">Reports</h1>
                <p className="text-slate-600 mt-1">Overview of appointments, doctors and specializations</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => router.push("/admin/dashboard")}>Back</Button>
                <Button onClick={downloadJSON}>Export JSON</Button>
              </div>
            </div>

            {loading ? (
              <div className="text-slate-500">Loading reports...</div>
            ) : !reports ? (
              <div className="text-red-500">No report data available</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Doctors */}
                <section className="lg:col-span-2 bg-white border border-slate-100 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Top Doctors</h2>
                    <p className="text-sm text-slate-500">Top 10 by appointments</p>
                  </div>
                  <div className="space-y-3">
                    {reports.topDoctors.length === 0 ? (
                      <p className="text-slate-500">No data</p>
                    ) : (
                      reports.topDoctors.map((d, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-10 text-sm font-medium text-slate-700">#{i + 1}</div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <div className="text-sm font-medium text-slate-900">{d.name}</div>
                                <div className="text-xs text-slate-500">{d.specialization}</div>
                              </div>
                              <div className="text-sm font-semibold text-slate-800">{d.appointmentCount}</div>
                            </div>
                            <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400"
                                style={{ width: `${(d.appointmentCount / maxAppointments) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Side panels */}
                <div className="space-y-6">
                  <section className="bg-white border border-slate-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-3">Appointments by Status</h3>
                    {reports.appointmentsByStatus.length === 0 ? (
                      <p className="text-slate-500">No data</p>
                    ) : (
                      <div className="space-y-3">
                        {reports.appointmentsByStatus.map((s, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between mb-1">
                              <div className="text-sm text-slate-700">{s.status}</div>
                              <div className="text-sm font-medium">{s.count}</div>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-2 bg-emerald-400"
                                style={{ width: `${(s.count / maxStatus) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="bg-white border border-slate-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-3">Specializations</h3>
                    {reports.specializations.length === 0 ? (
                      <p className="text-slate-500">No data</p>
                    ) : (
                      <ul className="space-y-2">
                        {reports.specializations.map((sp, idx) => (
                          <li key={idx} className="flex items-center justify-between">
                            <div className="text-sm text-slate-700">{sp.specialization}</div>
                            <div className="text-sm font-medium text-slate-800">{sp.doctorCount}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
