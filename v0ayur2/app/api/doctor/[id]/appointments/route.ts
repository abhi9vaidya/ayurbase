import type { NextRequest } from "next/server"
import { executeQuery } from "@/lib/db"
import { successResponse, errorResponse, verifyAuth, forbiddenResponse, hasRole } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = verifyAuth(request)
    if (!user) return forbiddenResponse()

  // `params` should contain the dynamic segment (id) but sometimes (due to server/runtime differences)
  // it can be missing. Be defensive: prefer params.id, but fall back to parsing the pathname.
  // Also avoid using `await` on a non-promise value.
  const idFromParams = params?.id
  const idFromPath = request.nextUrl?.pathname?.split("/")?.[3]
  const id = idFromParams ?? idFromPath

  const doctorId = Number.parseInt(String(id))
  console.log("[v0] doctor appointments - parsed id:", { idFromParams, idFromPath, id, doctorId })

    if (!(hasRole(user, "ADMIN") || hasRole(user, "DOCTOR")) && user.doctorId !== doctorId) {
      return forbiddenResponse()
    }

    const result = await executeQuery(
      `SELECT a.APPOINTMENT_ID, a.PATIENT_ID, a.DOCTOR_ID, a.APPT_DATE,
              a.DURATION_MIN, a.STATUS, a.REASON, a.CREATED_ON,
              u.NAME as PATIENT_NAME, u.EMAIL as PATIENT_EMAIL
       FROM APPOINTMENTS a
       JOIN PATIENTS p ON a.PATIENT_ID = p.PATIENT_ID
       JOIN USERS u ON p.USER_ID = u.USER_ID
       WHERE a.DOCTOR_ID = :doctorId
       ORDER BY a.APPT_DATE DESC`,
      [doctorId],
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
        patientName: row[8],
        patientEmail: row[9],
      })) || []

    return successResponse({ appointments, total: appointments.length })
  } catch (error) {
    console.error("[v0] Get doctor appointments error:", error)
    return errorResponse("Failed to fetch appointments", 500)
  }
}
