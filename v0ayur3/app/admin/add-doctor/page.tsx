"use client"

import { useState, useEffect } from "react"
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

export default function AdminAddDoctorPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) router.push("/login")
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const form = e.target as HTMLFormElement
      const data = Object.fromEntries(new FormData(form).entries())
      await apiClient.post("/doctor", data)
      toast.success("Doctor created")
      router.push("/admin/doctors")
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to create doctor")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <div className="flex">
        <Sidebar links={SIDEBAR_LINKS} />

        <main className="flex-1 p-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Add Doctor</h1>
              <p className="text-slate-600 mt-1">Create a doctor account (creates both user and doctor records)</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-slate-100 rounded-lg p-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input name="name" required className="mt-1 block w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input name="email" type="email" required className="mt-1 block w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input name="password" type="password" required className="mt-1 block w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Contact No</label>
                <input name="contactNo" required className="mt-1 block w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Specialization</label>
                <input name="specialization" required className="mt-1 block w-full" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Experience (yrs)</label>
                  <input name="experienceYrs" type="number" className="mt-1 block w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Qualification</label>
                  <input name="qualification" className="mt-1 block w-full" />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Doctor"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
