"use client"

import { useState, useCallback } from "react"
import apiClient from "@/lib/api-client"

interface Medicine {
  medicineId: number
  name: string
  dose: string
  duration: string
  instructions?: string
}

interface Prescription {
  prescriptionId: number
  appointmentId: number
  doctorName: string
  notes: string
  createdOn: string
  medicines: Medicine[]
}

export function usePrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get("/prescription")
      const basicPrescriptions = response.data.prescriptions || []

      // Fetch detailed information for each prescription
      const detailed = await Promise.all(
        basicPrescriptions.map((presc: any) =>
          apiClient
            .get(`/prescription/${presc.prescriptionId}`)
            .then((res) => res.data)
            .catch(() => null),
        ),
      )

      setPrescriptions(detailed.filter(Boolean))
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch prescriptions"
      setError(message)
      console.error("[v0] Fetch prescriptions error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createPrescription = useCallback(async (appointmentId: number, notes?: string) => {
    try {
      setError(null)
      const response = await apiClient.post("/prescription", {
        appointmentId,
        notes,
      })
      return response.data.prescriptionId
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to create prescription"
      setError(message)
      throw err
    }
  }, [])

  const addMedicines = useCallback(async (prescriptionId: number, medicines: Medicine[]) => {
    try {
      setError(null)
      await apiClient.post("/prescription-medicine", {
        prescriptionId,
        medicines: medicines.map((m) => ({
          medicineId: m.medicineId,
          dose: m.dose,
          duration: m.duration,
          instructions: m.instructions,
        })),
      })
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to add medicines"
      setError(message)
      throw err
    }
  }, [])

  const removeMedicine = useCallback(async (prescriptionId: number, medicineId: number) => {
    try {
      setError(null)
      await apiClient.delete("/prescription-medicine", {
        params: { prescriptionId, medicineId },
      })
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to remove medicine"
      setError(message)
      throw err
    }
  }, [])

  const updatePrescription = useCallback(async (prescriptionId: number, notes: string) => {
    try {
      setError(null)
      await apiClient.put(`/prescription/${prescriptionId}`, { notes })
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update prescription"
      setError(message)
      throw err
    }
  }, [])

  return {
    prescriptions,
    loading,
    error,
    fetchPrescriptions,
    createPrescription,
    addMedicines,
    removeMedicine,
    updatePrescription,
  }
}
