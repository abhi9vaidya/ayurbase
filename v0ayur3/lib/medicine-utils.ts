import apiClient from "@/lib/api-client"

export const MEDICINE_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Cream",
  "Ointment",
  "Powder",
  "Liquid",
  "Spray",
  "Drop",
]

export interface Medicine {
  medicineId: number
  name: string
  form: string
  details?: string
}

// Get all medicines with optional filtering
export async function fetchMedicines(filters?: { search?: string }): Promise<Medicine[]> {
  try {
    const params = filters?.search ? { search: filters.search } : {}
    const response = await apiClient.get("/medicine", { params })
    return response.data.medicines || []
  } catch (error) {
    console.error("[v0] Fetch medicines error:", error)
    return []
  }
}

// Get single medicine
export async function fetchMedicine(medicineId: number): Promise<Medicine | null> {
  try {
    const response = await apiClient.get(`/medicine/${medicineId}`)
    return response.data
  } catch (error) {
    console.error("[v0] Fetch medicine error:", error)
    return null
  }
}

// Create new medicine
export async function createMedicine(medicineData: Omit<Medicine, "medicineId">): Promise<boolean> {
  try {
    await apiClient.post("/medicine", medicineData)
    return true
  } catch (error) {
    console.error("[v0] Create medicine error:", error)
    return false
  }
}

// Update medicine
export async function updateMedicine(medicineId: number, medicineData: Partial<Medicine>): Promise<boolean> {
  try {
    await apiClient.put(`/medicine/${medicineId}`, medicineData)
    return true
  } catch (error) {
    console.error("[v0] Update medicine error:", error)
    return false
  }
}

// Delete medicine
export async function deleteMedicine(medicineId: number): Promise<boolean> {
  try {
    await apiClient.delete(`/medicine/${medicineId}`)
    return true
  } catch (error) {
    console.error("[v0] Delete medicine error:", error)
    return false
  }
}

// Get medicine statistics
export async function getMedicineStats(): Promise<{ total: number; byForm: Record<string, number> } | null> {
  try {
    const medicines = await fetchMedicines()

    const byForm: Record<string, number> = {}
    medicines.forEach((med: Medicine) => {
      byForm[med.form] = (byForm[med.form] || 0) + 1
    })

    return {
      total: medicines.length,
      byForm,
    }
  } catch (error) {
    console.error("[v0] Get medicine stats error:", error)
    return null
  }
}

// Validate medicine form
export function isValidMedicineForm(form: string): boolean {
  return MEDICINE_FORMS.includes(form)
}

// Get medicine by name
export async function searchMedicineByName(name: string): Promise<Medicine[]> {
  return fetchMedicines({ search: name })
}
