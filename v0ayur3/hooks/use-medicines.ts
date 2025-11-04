"use client"

import { useState, useCallback } from "react"
import apiClient from "@/lib/api-client"

interface Medicine {
  medicineId: number
  name: string
  form: string
  details?: string
}

export function useMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMedicines = useCallback(async (search?: string) => {
    try {
      setLoading(true)
      setError(null)
      const params = search ? { search } : {}
      const response = await apiClient.get("/medicine", { params })
      setMedicines(response.data.medicines || [])
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch medicines"
      setError(message)
      console.error("[v0] Fetch medicines error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createMedicine = useCallback(
    async (medicineData: Omit<Medicine, "medicineId">) => {
      try {
        setError(null)
        const response = await apiClient.post("/medicine", medicineData)
        await fetchMedicines()
        return response.data
      } catch (err: any) {
        const message = err.response?.data?.message || "Failed to create medicine"
        setError(message)
        throw err
      }
    },
    [fetchMedicines],
  )

  const updateMedicine = useCallback(
    async (medicineId: number, medicineData: Partial<Medicine>) => {
      try {
        setError(null)
        const response = await apiClient.put(`/medicine/${medicineId}`, medicineData)
        await fetchMedicines()
        return response.data
      } catch (err: any) {
        const message = err.response?.data?.message || "Failed to update medicine"
        setError(message)
        throw err
      }
    },
    [fetchMedicines],
  )

  const deleteMedicine = useCallback(
    async (medicineId: number) => {
      try {
        setError(null)
        await apiClient.delete(`/medicine/${medicineId}`)
        await fetchMedicines()
      } catch (err: any) {
        const message = err.response?.data?.message || "Failed to delete medicine"
        setError(message)
        throw err
      }
    },
    [fetchMedicines],
  )

  return {
    medicines,
    loading,
    error,
    fetchMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
  }
}
