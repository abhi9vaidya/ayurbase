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

export default function AdminPatientPage() {
  const router = useRouter()
  const pathname = usePathname()
  const id = Number(pathname.split("/").pop())

  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    if (isNaN(id)) {
      toast.error("Invalid patient id")
      router.push("/admin/patients")
      return
    }
    fetchPatient()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchPatient = async () => {
    try {
      const res = await apiClient.get(`/patient/${id}`)
      setPatient(res.data)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to fetch patient")
      router.push("/admin/patients")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const form = e.target as HTMLFormElement
      const data = Object.fromEntries(new FormData(form).entries())
      await apiClient.put(`/patient/${id}`, data)
      toast.success("Patient updated")
      fetchPatient()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Update failed")
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <div className="flex">
        <Sidebar links={SIDEBAR_LINKS} />

        <main className="flex-1 p-8 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Patient</h1>
              <p className="text-gray-600 mt-2">View and edit patient profile</p>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : !patient ? (
              <p className="text-red-500">Patient not found</p>
            ) : (
              <form onSubmit={handleSave} className="space-y-4 bg-white border border-gray-100 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input name="name" defaultValue={patient.name} className="mt-1 block w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input name="email" defaultValue={patient.email} className="mt-1 block w-full" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <input name="gender" defaultValue={patient.gender} className="mt-1 block w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                    <input name="bloodGroup" defaultValue={patient.bloodGroup} className="mt-1 block w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input name="city" defaultValue={patient.city} className="mt-1 block w-full" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input name="address" defaultValue={patient.address} className="mt-1 block w-full" />
                </div>

                <div className="flex items-center justify-end gap-3">
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
