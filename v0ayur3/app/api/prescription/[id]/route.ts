import type { NextRequest } from "next/server"
import { executeQuerySingle, executeQuery } from "@/lib/db"
import { successResponse, errorResponse, verifyAuth, forbiddenResponse, hasRole } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = verifyAuth(request)
    if (!user) return forbiddenResponse()

    const {id} = await params;
    const prescriptionId = Number.parseInt(id)

    const prescription = await executeQuerySingle(
      `SELECT pr.PRESCRIPTION_ID, pr.APPOINTMENT_ID, pr.PRESCRIBED_BY,
              pr.NOTES, pr.CREATED_ON
       FROM PRESCRIPTIONS pr
       WHERE pr.PRESCRIPTION_ID = :prescriptionId`,
      [prescriptionId],
    )

    if (!prescription) {
      return errorResponse("Prescription not found", 404)
    }

    if (hasRole(user, "DOCTOR")) {
      if (user.doctorId !== prescription[2]) {
        return forbiddenResponse()
      }
    } else if (hasRole(user, "PATIENT")) {
      const appointment = await executeQuerySingle(
        `SELECT a.PATIENT_ID FROM APPOINTMENTS a
         WHERE a.APPOINTMENT_ID = :appointmentId`,
        [prescription[1]],
      )
      const patient = await executeQuerySingle("SELECT PATIENT_ID FROM PATIENTS WHERE USER_ID = :userId", [user.userId])
      if (appointment[0] !== patient[0]) {
        return forbiddenResponse()
      }
    }

    const medicinesResult = await executeQuery(
      `SELECT m.MEDICINE_ID, m.NAME, pm.DOSE, pm.DURATION, pm.INSTRUCTIONS
       FROM PRESCRIPTION_MED pm
       JOIN MEDICINE m ON pm.MEDICINE_ID = m.MEDICINE_ID
       WHERE pm.PRESCRIPTION_ID = :prescriptionId`,
      [prescriptionId],
    )

    const medicines =
      medicinesResult.rows?.map((row) => ({
        medicineId: row[0],
        name: row[1],
        dose: row[2],
        duration: row[3],
        instructions: row[4],
      })) || []

    return successResponse({
      prescriptionId: prescription[0],
      appointmentId: prescription[1],
      prescribedBy: prescription[2],
      notes: prescription[3],
      createdOn: prescription[4],
      medicines,
    })
  } catch (error) {
    console.error("[v0] Get prescription error:", error)
    return errorResponse("Failed to fetch prescription", 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = verifyAuth(request)
    if (!user) return forbiddenResponse()

    const prescriptionId = Number.parseInt(params.id)

    const prescription = await executeQuerySingle(
      `SELECT pr.PRESCRIPTION_ID, pr.APPOINTMENT_ID, pr.PRESCRIBED_BY,
              pr.NOTES, pr.CREATED_ON
       FROM PRESCRIPTIONS pr
       WHERE pr.PRESCRIPTION_ID = :prescriptionId`,
      [prescriptionId],
    )

    if (!prescription) {
      return errorResponse("Prescription not found", 404)
    }

    if (hasRole(user, "DOCTOR")) {
      if (user.doctorId !== prescription[2]) {
        return forbiddenResponse()
      }
    } else if (!hasRole(user, "ADMIN")) {
      return forbiddenResponse()
    }

    const body = await request.json()
    const { notes } = body

    await executeQuery(
      `UPDATE PRESCRIPTIONS
       SET NOTES = :notes
       WHERE PRESCRIPTION_ID = :prescriptionId`,
      [notes || null, prescriptionId],
    )

    return successResponse({ message: "Prescription updated successfully" })
  } catch (error) {
    console.error("[v0] Update prescription error:", error)
    return errorResponse("Failed to update prescription", 500)
  }
}
