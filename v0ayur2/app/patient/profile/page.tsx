"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/app/components/nav-bar"
import Sidebar from "@/app/components/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import apiClient from "@/lib/api-client"
import { toast } from "react-toastify"

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/patient/dashboard", icon: "🏠" },
  { label: "Appointments", href: "/patient/appointments", icon: "📅" },
  { label: "Book", href: "/patient/book-appointment", icon: "➕" },
  { label: "Profile", href: "/patient/profile", icon: "👤" },
]

export default function PatientProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [patient, setPatient] = useState<any | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchProfile = async () => {
    try {
      // Try user profile endpoint first
      const res = await apiClient.get("/user/profile")
      if (res?.data) {
        if (res.data.patientId) {
          const p = await apiClient.get(`/patient/${res.data.patientId}`)
          setPatient(p.data)
          return
        }
      }
    } catch (err) {
      // ignore and fallback
    }

    try {
      const p = await apiClient.get("/auth/register/patient")
      if (p?.data?.patient) setPatient(p.data.patient)
    } catch (e) {
      console.error("[v0] fetch profile error:", e)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: any) => {
    setPatient({ ...patient, [e.target.name]: e.target.value })
  }

  const handleSave = async (e: any) => {
    e.preventDefault()
    if (!patient?.patientId) {
      toast.error("Patient record not found")
      return
    }
    setSaving(true)
    try {
      const body: any = {
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth,
        bloodGroup: patient.bloodGroup,
        address: patient.address,
        city: patient.city,
        state: patient.state,
        zipCode: patient.zipCode,
        allergies: patient.allergies,
      }
      await apiClient.put(`/patient/${patient.patientId}`, body)
      toast.success("Profile updated")
      fetchProfile()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <div className="flex">
        <Sidebar links={SIDEBAR_LINKS} />

        <main className="flex-1 p-8 animate-fade-in">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-gray-600 mt-1">View and edit your personal details</p>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : !patient ? (
              <div className="bg-white border border-gray-100 rounded-lg p-6">
                <p className="text-sm text-gray-600">No patient profile found. Please complete your profile.</p>
                <div className="mt-4">
                  <Button onClick={() => router.push("/register/patient")}>Complete Profile</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6 bg-white border border-gray-100 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full name</label>
                    <Input name="name" value={patient.name || ""} onChange={handleChange} disabled className="bg-gray-50" />
                    <p className="text-xs text-slate-400 mt-1">Your registered name (not editable here)</p>
                  </div>
                  <div className="w-48">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Contact</label>
                    <Input name="contactNo" value={patient.contactNo || ""} onChange={handleChange} placeholder="Phone" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                    <select
                      name="gender"
                      value={patient.gender || ""}
                      onChange={handleChange}
                      className="block w-full rounded-md border px-3 py-2 bg-white"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date of birth</label>
                    <Input
                      name="dateOfBirth"
                      type="date"
                      value={patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().slice(0, 10) : ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Blood group</label>
                    <select name="bloodGroup" value={patient.bloodGroup || ""} onChange={handleChange} className="block w-full rounded-md border px-3 py-2 bg-white">
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                    <textarea
                      name="address"
                      value={patient.address || ""}
                      onChange={handleChange}
                      className="block w-full rounded-md border px-3 py-2 min-h-[72px] bg-white"
                      placeholder="Street address, building, landmark"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Input name="city" value={patient.city || ""} onChange={handleChange} placeholder="City" />
                  <Input name="state" value={patient.state || ""} onChange={handleChange} placeholder="State" />
                  <Input name="zipCode" value={patient.zipCode || ""} onChange={handleChange} placeholder="ZIP" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Allergies / Medical notes</label>
                  <textarea
                    name="allergies"
                    value={patient.allergies || ""}
                    onChange={handleChange}
                    className="block w-full rounded-md border px-3 py-2 min-h-[80px] bg-white"
                    placeholder="List any allergies or important medical notes"
                  />
                  <p className="text-xs text-slate-400 mt-1">This information will be visible to your doctors.</p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => router.push("/patient/dashboard")}>Cancel</Button>
                  <Button type="submit" disabled={saving} className="px-6">
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
