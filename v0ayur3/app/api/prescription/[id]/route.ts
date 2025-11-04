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
              pr.NOTES, pr.CREATED_ON, u.NAME as DOCTOR_NAME
       FROM PRESCRIPTIONS pr
       LEFT JOIN DOCTORS d ON pr.PRESCRIBED_BY = d.DOCTOR_ID
       LEFT JOIN USERS u ON d.USER_ID = u.USER_ID
       WHERE pr.PRESCRIPTION_ID = :prescriptionId`,
      [prescriptionId],
    )

    if (!prescription) {
      return errorResponse("Prescription not found", 404)
    }

    // convert DB driver objects to primitives to avoid circular JSON issues
    // NOTE: keep notes as strings (do not JSON.parse) so client textareas receive a string value
    const unwrap = (v: any) => {
      if (v === null || v === undefined) return null
      if (typeof v === "object") return String(v)
      if (typeof v === "string") {
        const trimmed = v.trim()
        const n = Number(trimmed)
        return Number.isNaN(n) ? trimmed : n
      }
      return v
    }

    const presRow: any = prescription
    const notesRaw = unwrap(presRow[3])
    let notesParsed = null
    if (typeof notesRaw === "string") {
      const t = notesRaw.trim()
      if ((t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"))) {
        try {
          notesParsed = JSON.parse(notesRaw)
        } catch (e) {
          notesParsed = null
        }
      }
    }

    const prescriptionObj = {
      prescriptionId: unwrap(presRow[0]),
      appointmentId: unwrap(presRow[1]),
      prescribedBy: unwrap(presRow[2]),
      notes: notesRaw,
      notesParsed,
      createdOn: unwrap(presRow[4]),
      doctorName: unwrap(presRow[5]),
    }

    if (hasRole(user, "DOCTOR")) {
      if (user.doctorId !== prescriptionObj.prescribedBy) {
        return forbiddenResponse()
      }
    } else if (hasRole(user, "PATIENT")) {
      const appointment = await executeQuerySingle(
        `SELECT a.PATIENT_ID FROM APPOINTMENTS a
         WHERE a.APPOINTMENT_ID = :appointmentId`,
        [prescriptionObj.appointmentId],
      )
      const patient = await executeQuerySingle("SELECT PATIENT_ID FROM PATIENTS WHERE USER_ID = :userId", [user.userId])
      const appointmentPatientId = appointment ? Number(String((appointment as any)[0])) : null
      const patientId = patient ? Number(String((patient as any)[0])) : null
      if (appointmentPatientId !== patientId) {
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
      medicinesResult.rows?.map((row: any) => ({
        medicineId: unwrap(row[0]),
        name: unwrap(row[1]),
        dose: unwrap(row[2]),
        duration: unwrap(row[3]),
        instructions: unwrap(row[4]),
      })) || []

    return successResponse({
      ...prescriptionObj,
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

    // normalize prescription row (keep notes as string)
    const unwrap2 = (v: any) => {
      if (v === null || v === undefined) return null
      if (typeof v === "object") return String(v)
      if (typeof v === "string") return v
      return v
    }
    const presRow2: any = prescription
    const prescriptionObj2 = {
      prescriptionId: Number(unwrap2(presRow2[0])),
      appointmentId: Number(unwrap2(presRow2[1])),
      prescribedBy: Number(unwrap2(presRow2[2])),
      notes: unwrap2(presRow2[3]),
      createdOn: unwrap2(presRow2[4]),
    }

    if (hasRole(user, "DOCTOR")) {
      if (user.doctorId !== prescriptionObj2.prescribedBy) {
        return forbiddenResponse()
      }
    } else if (!hasRole(user, "ADMIN")) {
      return forbiddenResponse()
    }

    const body = await request.json()
    const { notes } = body
    const notesStr = notes && typeof notes === "object" ? JSON.stringify(notes) : notes ?? null

    await executeQuery(
      `UPDATE PRESCRIPTIONS
       SET NOTES = :notes
       WHERE PRESCRIPTION_ID = :prescriptionId`,
      [notesStr, prescriptionId],
    )

    return successResponse({ message: "Prescription updated successfully" })
  } catch (error) {
    console.error("[v0] Update prescription error:", error)
    return errorResponse("Failed to update prescription", 500)
  }
}
