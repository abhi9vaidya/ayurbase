"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import NavBar from "@/components/NavBar"
import Sidebar from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import apiClient from "@/lib/api-client"
import { toast } from "react-toastify"

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "🏠" },
  { label: "Doctors", href: "/admin/doctors", icon: "👨‍⚕️" },
  { label: "Patients", href: "/admin/patients", icon: "🧑‍🤝‍🧑" },
  { label: "Appointments", href: "/admin/appointments", icon: "📅" },
  { label: "Medicines", href: "/admin/medicines", icon: "💊" },
  { label: "Reports", href: "/admin/reports", icon: "📊" },
]

interface Medicine {
  medicineId: number
  name: string
  form: string
  details: string
}

export default function AdminMedicinesPage() {
  const router = useRouter()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: "", form: "Tablet", details: "" })
  const [submitting, setSubmitting] = useState(false)

  const MEDICINE_FORMS = ["Tablet", "Capsule", "Syrup", "Injection", "Cream", "Ointment", "Powder", "Liquid"]

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchMedicines()
  }, [router])

  const fetchMedicines = async (searchQuery = "") => {
    try {
      setLoading(true)
      const params = searchQuery ? { search: searchQuery } : {}
      const response = await apiClient.get("/medicine", { params })
      setMedicines(response.data.medicines || [])
    } catch (error: any) {
      toast.error("Failed to load medicines")
      console.error("[v0] Fetch medicines error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    fetchMedicines(value)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.form.trim()) {
      toast.error("Medicine name and form are required")
      return
    }

    try {
      setSubmitting(true)
      if (editingId) {
        await apiClient.put(`/medicine/${editingId}`, formData)
        toast.success("Medicine updated successfully")
      } else {
        await apiClient.post("/medicine", formData)
        toast.success("Medicine created successfully")
      }
      setFormData({ name: "", form: "Tablet", details: "" })
      setEditingId(null)
      setShowForm(false)
      fetchMedicines(search)
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to save medicine"
      toast.error(message)
      console.error("[v0] Save medicine error:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (medicine: Medicine) => {
    setFormData({
      name: medicine.name,
      form: medicine.form,
      details: medicine.details || "",
    })
    setEditingId(medicine.medicineId)
    setShowForm(true)
  }

  const handleDelete = async (medicineId: number) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return

    try {
      await apiClient.delete(`/medicine/${medicineId}`)
      toast.success("Medicine deleted successfully")
      fetchMedicines(search)
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete medicine"
      toast.error(message)
      console.error("[v0] Delete medicine error:", error)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: "", form: "Tablet", details: "" })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <div className="flex">
        <Sidebar links={SIDEBAR_LINKS} />

        <main className="flex-1 p-8 animate-fade-in">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-slate-900">Medicines</h1>
                <p className="text-slate-600 mt-2">Manage hospital medicines inventory</p>
              </div>
              <Button
                onClick={() => {
                  setShowForm(true)
                  setEditingId(null)
                  setFormData({ name: "", form: "Tablet", details: "" })
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Add Medicine
              </Button>
            </div>

            {showForm && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  {editingId ? "Edit Medicine" : "Add New Medicine"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Medicine Name</label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Aspirin"
                      className="w-full rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Form</label>
                    <select
                      value={formData.form}
                      onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {MEDICINE_FORMS.map((form) => (
                        <option key={form} value={form}>
                          {form}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Details (Optional)</label>
                    <textarea
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      placeholder="e.g., Strength, side effects, warnings..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={submitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      {submitting ? "Saving..." : editingId ? "Update" : "Create"}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border-slate-300 rounded-lg bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <Input
                type="text"
                placeholder="Search medicines by name..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="rounded-lg"
              />
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-slate-500">Loading medicines...</p>
              </div>
            ) : medicines.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500">No medicines found</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Form</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Details</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {medicines.map((medicine) => (
                        <tr key={medicine.medicineId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-900 font-medium">{medicine.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {medicine.form}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{medicine.details || "-"}</td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEdit(medicine)}
                                variant="outline"
                                className="text-blue-600 hover:text-blue-700 border-slate-300 rounded-lg text-xs"
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleDelete(medicine.medicineId)}
                                variant="outline"
                                className="text-red-600 hover:text-red-700 border-slate-300 rounded-lg text-xs"
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
