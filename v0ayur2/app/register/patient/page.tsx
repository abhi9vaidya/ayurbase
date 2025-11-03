"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/api-client"
import { toast } from "react-toastify"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function RegisterPatientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    gender: "",
    dateOfBirth: "",
    bloodGroup: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    allergies: "",
  })

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value })

  useEffect(() => {
    // If user already has a patient record, go to dashboard
    const check = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        const response = await apiClient.get("/auth/register/patient")
        if (response.status === 200 && response.data?.patient) {
          router.push("/patient/dashboard")
        }
      } catch (err) {
        // no-op
      }
    }
    check()
  }, [router])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await apiClient.post("/auth/register/patient", form)
      const { token } = response.data
      if (token) {
        // update token and try to refresh stored user info
        localStorage.setItem("token", token)
        const oldUser = localStorage.getItem("user")
        if (oldUser) {
          const userObj = JSON.parse(oldUser)
          userObj.patientId = response.data.patientId
          localStorage.setItem("user", JSON.stringify(userObj))
        }
        // optionally fetch user profile - here we rely on existing local user
      }
      toast.success("Patient information saved")
      router.push("/patient/dashboard")
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to save patient data"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-semibold">Complete your profile</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-slate-700 mb-1">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} id="">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-1">Date of birth</label>
              <Input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-1">Blood Group</label>
              <Input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-1">Address</label>
              <Input name="address" value={form.address} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input name="city" value={form.city} onChange={handleChange} placeholder="City" />
              <Input name="state" value={form.state} onChange={handleChange} placeholder="State" />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-1">Zip Code</label>
              <Input name="zipCode" value={form.zipCode} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-1">Allergies</label>
              <Input name="allergies" value={form.allergies} onChange={handleChange} />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save & Continue"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
