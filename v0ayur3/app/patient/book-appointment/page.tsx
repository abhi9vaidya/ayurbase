"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/app/components/nav-bar"
import Sidebar from "@/app/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import apiClient from "@/lib/api-client"
import { toast } from "react-toastify"

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/patient/dashboard", icon: "🏠" },
  { label: "Book Appointment", href: "/patient/book-appointment", icon: "📅" },
  { label: "My Appointments", href: "/patient/appointments", icon: "📋" },
  { label: "My Prescriptions", href: "/patient/prescriptions", icon: "💊" },
  { label: "Profile", href: "/patient/profile", icon: "👤" },
]

interface Doctor {
  doctorId: number
  name: string
  specialization: string
  experienceYrs: number
}

export default function BookAppointmentPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    apptDate: "",
    reason: "",
    durationMin: 30,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDoctor) {
      toast.error("Please select a doctor")
      return
    }

    if (!formData.apptDate) {
      toast.error("Please select appointment date")
      return
    }

    setSubmitting(true)

    try {
      await apiClient.post("/appointment", {
        doctorId: selectedDoctor,
        apptDate: formData.apptDate,
        durationMin: formData.durationMin,
        reason: formData.reason,
      })

      toast.success("Appointment booked successfully!")
      router.push("/patient/appointments")
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to book appointment"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <div className="flex">
        <Sidebar links={SIDEBAR_LINKS} />

        <main className="flex-1 p-8 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900">Book Appointment</h1>
              <p className="text-slate-600 mt-2">Schedule a consultation with a doctor</p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-6 animate-slide-in"
            >
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Select Doctor</h2>

                {loading ? (
                  <p className="text-slate-500">Loading doctors...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctors.map((doctor) => (
                      <button
                        key={doctor.doctorId}
                        type="button"
                        onClick={() => setSelectedDoctor(doctor.doctorId)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                          selectedDoctor === doctor.doctorId
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm"
                        }`}
                      >
                        <p className="font-semibold text-slate-900">{doctor.name}</p>
                        <p className="text-sm text-slate-600">{doctor.specialization}</p>
                        <p className="text-xs text-slate-500 mt-1">{doctor.experienceYrs} years experience</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedDoctor && (
                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Appointment Date & Time</label>
                    <Input
                      type="datetime-local"
                      name="apptDate"
                      value={formData.apptDate}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border-slate-300 bg-slate-50 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Duration (minutes)</label>
                    <select
                      name="durationMin"
                      value={formData.durationMin}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Reason for Visit</label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder="Describe your symptoms or reason for visit"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all duration-300"
                  >
                    {submitting ? "Booking..." : "Book Appointment"}
                  </Button>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
