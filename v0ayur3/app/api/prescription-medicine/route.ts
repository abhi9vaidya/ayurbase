import type { NextRequest } from "next/server"
import { executeQuery, executeQuerySingle } from "@/lib/db"
import {
  successResponse,
  errorResponse,
  verifyAuth,
  forbiddenResponse,
  hasRole,
  unauthorizedResponse,
} from "@/lib/auth"
import { validateRequired } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) return unauthorizedResponse()

    if (!hasRole(user, "DOCTOR") && !hasRole(user, "ADMIN")) {
      return forbiddenResponse()
    }

    const body = await request.json()
    const { prescriptionId, medicines } = body

    if (!validateRequired(body, ["prescriptionId", "medicines"])) {
      return errorResponse("Prescription ID and medicines are required")
    }

    // Verify prescription exists
    const prescription = await executeQuerySingle(
      `SELECT pr.PRESCRIPTION_ID, pr.PRESCRIBED_BY
       FROM PRESCRIPTIONS pr
       WHERE pr.PRESCRIPTION_ID = :prescriptionId`,
      [prescriptionId],
    )

    if (!prescription) {
      return errorResponse("Prescription not found", 404)
    }

    // If doctor, verify they own this prescription
    if (hasRole(user, "DOCTOR")) {
      const doctorId = await executeQuerySingle("SELECT DOCTOR_ID FROM DOCTORS WHERE USER_ID = :userId", [user.userId])
      if (doctorId && doctorId[0] !== prescription[1]) {
        return forbiddenResponse()
      }
    }

    // Validate and add medicines
    for (const medicine of medicines) {
      const { medicineId, dose, duration, instructions } = medicine

      if (!validateRequired(medicine, ["medicineId", "dose", "duration"])) {
        return errorResponse("Medicine ID, dose, and duration are required for each medicine")
      }

      // Verify medicine exists
      const medicineExists = await executeQuerySingle(
        "SELECT MEDICINE_ID FROM MEDICINE WHERE MEDICINE_ID = :medicineId",
        [medicineId],
      )

      if (!medicineExists) {
        return errorResponse(`Medicine with ID ${medicineId} not found`, 404)
      }

      // Check if already exists
      const existing = await executeQuerySingle(
        `SELECT PRESCRIPTION_ID FROM PRESCRIPTION_MED
         WHERE PRESCRIPTION_ID = :prescriptionId AND MEDICINE_ID = :medicineId`,
        [prescriptionId, medicineId],
      )

      if (!existing) {
        await executeQuery(
          `INSERT INTO PRESCRIPTION_MED (PRESCRIPTION_ID, MEDICINE_ID, DOSE, DURATION, INSTRUCTIONS)
           VALUES (:prescriptionId, :medicineId, :dose, :duration, :instructions)`,
          [prescriptionId, medicineId, dose, duration, instructions || null],
        )
      } else {
        // Update existing
        await executeQuery(
          `UPDATE PRESCRIPTION_MED
           SET DOSE = :dose, DURATION = :duration, INSTRUCTIONS = :instructions
           WHERE PRESCRIPTION_ID = :prescriptionId AND MEDICINE_ID = :medicineId`,
          [dose, duration, instructions || null, prescriptionId, medicineId],
        )
      }
    }

    return successResponse({ message: "Medicines added to prescription successfully" }, 201)
  } catch (error) {
    console.error("[v0] Add prescription medicines error:", error)
    return errorResponse("Failed to add medicines to prescription", 500)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) return unauthorizedResponse()

    if (!hasRole(user, "DOCTOR") && !hasRole(user, "ADMIN")) {
      return forbiddenResponse()
    }

    const { searchParams } = new URL(request.url)
    const prescriptionId = searchParams.get("prescriptionId")
    const medicineId = searchParams.get("medicineId")

    if (!prescriptionId || !medicineId) {
      return errorResponse("Prescription ID and Medicine ID are required")
    }

    // Verify prescription exists
    const prescription = await executeQuerySingle(
      `SELECT pr.PRESCRIPTION_ID, pr.PRESCRIBED_BY
       FROM PRESCRIPTIONS pr
       WHERE pr.PRESCRIPTION_ID = :prescriptionId`,
      [prescriptionId],
    )

    if (!prescription) {
      return errorResponse("Prescription not found", 404)
    }

    // If doctor, verify they own this prescription
    if (hasRole(user, "DOCTOR")) {
      const doctorId = await executeQuerySingle("SELECT DOCTOR_ID FROM DOCTORS WHERE USER_ID = :userId", [user.userId])
      if (doctorId && doctorId[0] !== prescription[1]) {
        return forbiddenResponse()
      }
    }

    // Delete the prescription medicine
    await executeQuery(
      `DELETE FROM PRESCRIPTION_MED
       WHERE PRESCRIPTION_ID = :prescriptionId AND MEDICINE_ID = :medicineId`,
      [prescriptionId, medicineId],
    )

    return successResponse({ message: "Medicine removed from prescription successfully" })
  } catch (error) {
    console.error("[v0] Delete prescription medicine error:", error)
    return errorResponse("Failed to remove medicine from prescription", 500)
  }
}
