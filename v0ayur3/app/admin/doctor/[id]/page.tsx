"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
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

export default function AdminDoctorPage() {
  const router = useRouter()
  const pathname = usePathname()
  const id = Number(pathname.split("/").pop())

  const [loading, setLoading] = useState(true)
  const [doctor, setDoctor] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    if (isNaN(id)) {
      toast.error("Invalid doctor id")
      router.push("/admin/doctors")
      return
    }
    fetchDoctor()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchDoctor = async () => {
    try {
      const res = await apiClient.get(`/doctor/${id}`)
      setDoctor(res.data)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to fetch doctor")
      router.push("/admin/doctors")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const form = e.target as HTMLFormElement
      const data = Object.fromEntries(new FormData(form).entries())
      await apiClient.put(`/doctor/${id}`, data)
      toast.success("Doctor updated")
      fetchDoctor()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Update failed")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <div className="flex">
        <Sidebar links={SIDEBAR_LINKS} />

        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Doctor</h1>
              <p className="text-slate-600 mt-1">View and edit doctor profile</p>
            </div>

            {loading ? (
              <p className="text-slate-500">Loading...</p>
            ) : !doctor ? (
              <p className="text-red-500">Doctor not found</p>
            ) : (
              <form onSubmit={handleSave} className="space-y-4 bg-white border border-slate-100 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Name</label>
                    <input name="name" defaultValue={doctor.name} className="mt-1 block w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Email</label>
                    <input name="email" defaultValue={doctor.email} className="mt-1 block w-full" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Specialization</label>
                    <input name="specialization" defaultValue={doctor.specialization} className="mt-1 block w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Experience (yrs)</label>
                    <input name="experienceYrs" type="number" defaultValue={doctor.experienceYrs} className="mt-1 block w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Qualification</label>
                    <input name="qualification" defaultValue={doctor.qualification} className="mt-1 block w-full" />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
