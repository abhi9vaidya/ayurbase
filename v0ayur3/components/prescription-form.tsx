"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import apiClient from "@/lib/api-client"
import { toast } from "react-toastify"

interface Medicine {
  medicineId: number
  name: string
  form: string
}

interface PrescriptionMedicine {
  medicineId: number
  name: string
  form: string
  dose: string
  duration: string
  instructions: string
}

interface PrescriptionFormProps {
  prescriptionId: number
  initialNotes?: string
  initialMedicines?: PrescriptionMedicine[]
  onSave?: () => void
  onCancel?: () => void
}

export default function PrescriptionForm({
  prescriptionId,
  initialNotes = "",
  initialMedicines = [],
  onSave,
  onCancel,
}: PrescriptionFormProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [notes, setNotes] = useState(initialNotes)
  const [selectedMedicines, setSelectedMedicines] = useState<PrescriptionMedicine[]>(initialMedicines)
  const [loading, setLoading] = useState(false)
  const [savingMeds, setSavingMeds] = useState(false)
  const [addingMedicine, setAddingMedicine] = useState(false)
  const [newMedicine, setNewMedicine] = useState({
    medicineId: "",
    dose: "",
    duration: "",
    instructions: "",
  })

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get("/medicine", { params: { limit: 1000 } })
      setMedicines(response.data.medicines || [])
    } catch (error: any) {
      toast.error("Failed to load medicines")
      console.error("[v0] Fetch medicines error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMedicine = () => {
    if (!newMedicine.medicineId || !newMedicine.dose || !newMedicine.duration) {
      toast.error("Please fill in all required fields")
      return
    }

    const medicineId = Number(newMedicine.medicineId)
    const selectedMed = medicines.find((m) => m.medicineId === medicineId)

    if (!selectedMed) {
      toast.error("Invalid medicine selected")
      return
    }

    // Check if already added
    if (selectedMedicines.some((m) => m.medicineId === medicineId)) {
      toast.error("This medicine is already added to the prescription")
      return
    }

    const medicineToAdd: PrescriptionMedicine = {
      medicineId,
      name: selectedMed.name,
      form: selectedMed.form,
      dose: newMedicine.dose,
      duration: newMedicine.duration,
      instructions: newMedicine.instructions,
    }

    setSelectedMedicines([...selectedMedicines, medicineToAdd])
    setNewMedicine({ medicineId: "", dose: "", duration: "", instructions: "" })
    setAddingMedicine(false)
  }

  const handleRemoveMedicine = (medicineId: number) => {
    setSelectedMedicines(selectedMedicines.filter((m) => m.medicineId !== medicineId))
  }

  const handleSave = async () => {
    try {
      setSavingMeds(true)

      // Update prescription notes
      if (initialNotes !== notes) {
        await apiClient.put(`/prescription/${prescriptionId}`, { notes })
      }

      // Add/update medicines
      if (selectedMedicines.length > 0) {
        await apiClient.post("/prescription-medicine", {
          prescriptionId,
          medicines: selectedMedicines.map((m) => ({
            medicineId: m.medicineId,
            dose: m.dose,
            duration: m.duration,
            instructions: m.instructions,
          })),
        })
      }

      toast.success("Prescription saved successfully")
      onSave?.()
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to save prescription"
      toast.error(message)
      console.error("[v0] Save prescription error:", error)
    } finally {
      setSavingMeds(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading medicines...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Doctor's notes about the prescription..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Medicines</h3>

        {selectedMedicines.length > 0 && (
          <div className="mb-6 space-y-2">
            {selectedMedicines.map((med) => (
              <div
                key={med.medicineId}
                className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{med.name}</p>
                  <p className="text-sm text-slate-600">
                    {med.form} • Dose: {med.dose} • Duration: {med.duration}
                  </p>
                  {med.instructions && <p className="text-sm text-slate-600">Instructions: {med.instructions}</p>}
                </div>
                <button
                  onClick={() => handleRemoveMedicine(med.medicineId)}
                  className="text-red-600 hover:text-red-700 font-medium text-sm ml-4"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {addingMedicine ? (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Medicine</label>
              <select
                value={newMedicine.medicineId}
                onChange={(e) => setNewMedicine({ ...newMedicine, medicineId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a medicine --</option>
                {medicines.map((med) => (
                  <option key={med.medicineId} value={med.medicineId}>
                    {med.name} ({med.form})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Dose</label>
                <Input
                  type="text"
                  value={newMedicine.dose}
                  onChange={(e) => setNewMedicine({ ...newMedicine, dose: e.target.value })}
                  placeholder="e.g., 500mg"
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
                <Input
                  type="text"
                  value={newMedicine.duration}
                  onChange={(e) => setNewMedicine({ ...newMedicine, duration: e.target.value })}
                  placeholder="e.g., 7 days"
                  className="rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Instructions (Optional)</label>
              <Input
                type="text"
                value={newMedicine.instructions}
                onChange={(e) => setNewMedicine({ ...newMedicine, instructions: e.target.value })}
                placeholder="e.g., Take with food"
                className="rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddMedicine}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
              >
                Add Medicine
              </Button>
              <Button
                onClick={() => {
                  setAddingMedicine(false)
                  setNewMedicine({ medicineId: "", dose: "", duration: "", instructions: "" })
                }}
                variant="outline"
                className="border-slate-300 rounded-lg text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setAddingMedicine(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg w-full"
          >
            Add Medicine to Prescription
          </Button>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleSave}
          disabled={savingMeds || selectedMedicines.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          {savingMeds ? "Saving..." : "Save Prescription"}
        </Button>
        {onCancel && (
          <Button onClick={onCancel} variant="outline" className="border-slate-300 rounded-lg bg-transparent">
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
