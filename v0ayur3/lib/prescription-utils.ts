import apiClient from "@/lib/api-client"

export interface PrescriptionStats {
  totalPrescriptions: number
  pendingMedicines: number
  recentPrescriptions: number
}

// Get prescription statistics for patients
export async function getPrescriptionStats(): Promise<PrescriptionStats | null> {
  try {
    const response = await apiClient.get("/prescription")
    const prescriptions = response.data.prescriptions || []

    return {
      totalPrescriptions: prescriptions.length,
      pendingMedicines: prescriptions.filter((p: any) => !p.medicines || p.medicines.length === 0).length,
      recentPrescriptions: prescriptions.filter((p: any) => {
        const createdDate = new Date(p.createdOn)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return createdDate >= sevenDaysAgo
      }).length,
    }
  } catch (error) {
    console.error("[v0] Get prescription stats error:", error)
    return null
  }
}

// Format prescription for display
export function formatPrescriptionForDisplay(prescription: any) {
  return {
    ...prescription,
    createdOn: new Date(prescription.createdOn).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  }
}

// Validate medicine data
export function validateMedicineData(medicine: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!medicine.medicineId || medicine.medicineId <= 0) {
    errors.push("Invalid medicine ID")
  }

  if (!medicine.dose || medicine.dose.trim() === "") {
    errors.push("Dose is required")
  }

  if (!medicine.duration || medicine.duration.trim() === "") {
    errors.push("Duration is required")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Export prescription as CSV
export function exportPrescriptionAsCSV(prescription: any): string {
  const headers = ["Medicine Name", "Dose", "Duration", "Instructions"]
  const rows = prescription.medicines.map((med: any) => [med.name, med.dose, med.duration, med.instructions || ""])

  const csvContent = [
    `Prescription #${prescription.prescriptionId}`,
    `Doctor: ${prescription.doctorName}`,
    `Date: ${prescription.createdOn}`,
    "",
    headers.join(","),
    ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(",")),
  ].join("\n")

  return csvContent
}

// Download prescription as CSV
export function downloadPrescriptionAsCSV(prescription: any) {
  const csv = exportPrescriptionAsCSV(prescription)
  const blob = new Blob([csv], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `prescription-${prescription.prescriptionId}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}
