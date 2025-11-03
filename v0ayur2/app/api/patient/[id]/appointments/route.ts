import type { NextRequest } from "next/server"
import { executeQuery } from "@/lib/db"
import { successResponse, errorResponse, verifyAuth, forbiddenResponse, hasRole } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = verifyAuth(request)
    if (!user) return forbiddenResponse()

    // In some Next.js contexts `params` is a Promise — unwrap it before accessing properties.
    const { id } = await params

    // Parse the id and validate it.
    const patientId = Number.parseInt(id, 10)

    if (Number.isNaN(patientId)) {
      return errorResponse("Invalid patient id", 400) 
    }

    if (!hasRole(user, "ADMIN") && user.patientId !== patientId) {
      return forbiddenResponse()
    }

    const result = await executeQuery(
      `SELECT a.APPOINTMENT_ID, a.PATIENT_ID, a.DOCTOR_ID, a.APPT_DATE,
              a.DURATION_MIN, a.STATUS, a.REASON, a.CREATED_ON,
              u.NAME as DOCTOR_NAME, d.SPECIALIZATION, u.CONTACT_NO
       FROM APPOINTMENTS a
       JOIN DOCTORS d ON a.DOCTOR_ID = d.DOCTOR_ID
       JOIN USERS u ON d.USER_ID = u.USER_ID
       WHERE a.PATIENT_ID = :patientId
       ORDER BY a.APPT_DATE DESC`,
      [patientId],
    )

    const appointments =
      result.rows?.map((row) => ({
        appointmentId: row[0],
        patientId: row[1],
        doctorId: row[2],
        apptDate: row[3],
        durationMin: row[4],
        status: row[5],
        reason: row[6],
        createdOn: row[7],
        doctorName: row[8],
        specialization: row[9],
        doctorContact: row[10],
      })) || []

    return successResponse({ appointments, total: appointments.length })
  } catch (error) {
    console.error("[v0] Get patient appointments error:", error)
    return errorResponse("Failed to fetch appointments", 500)
  }
}
