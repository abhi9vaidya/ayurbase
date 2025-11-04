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

export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) return unauthorizedResponse()

    let query = ""
    let params: any[] = []

    if (hasRole(user, "ADMIN")) {
      query = `SELECT pr.PRESCRIPTION_ID, pr.APPOINTMENT_ID, pr.PRESCRIBED_BY,
                      pr.NOTES, pr.CREATED_ON, u.NAME as DOCTOR_NAME
               FROM PRESCRIPTIONS pr
               JOIN DOCTORS d ON pr.PRESCRIBED_BY = d.DOCTOR_ID
               JOIN USERS u ON d.USER_ID = u.USER_ID
               ORDER BY pr.CREATED_ON DESC`
    } else if (hasRole(user, "DOCTOR")) {
      query = `SELECT pr.PRESCRIPTION_ID, pr.APPOINTMENT_ID, pr.PRESCRIBED_BY,
                      pr.NOTES, pr.CREATED_ON, u.NAME as DOCTOR_NAME
               FROM PRESCRIPTIONS pr
               JOIN DOCTORS d ON pr.PRESCRIBED_BY = d.DOCTOR_ID
               JOIN USERS u ON d.USER_ID = u.USER_ID
               WHERE pr.PRESCRIBED_BY = (SELECT DOCTOR_ID FROM DOCTORS WHERE USER_ID = :userId)
               ORDER BY pr.CREATED_ON DESC`
      params = [user.userId]
    } else if (hasRole(user, "PATIENT")) {
      query = `SELECT pr.PRESCRIPTION_ID, pr.APPOINTMENT_ID, pr.PRESCRIBED_BY,
                      pr.NOTES, pr.CREATED_ON, u.NAME as DOCTOR_NAME
               FROM PRESCRIPTIONS pr
               JOIN DOCTORS d ON pr.PRESCRIBED_BY = d.DOCTOR_ID
               JOIN USERS u ON d.USER_ID = u.USER_ID
               JOIN APPOINTMENTS a ON pr.APPOINTMENT_ID = a.APPOINTMENT_ID
               WHERE a.PATIENT_ID = (SELECT PATIENT_ID FROM PATIENTS WHERE USER_ID = :userId)
               ORDER BY pr.CREATED_ON DESC`
      params = [user.userId]
    }

    const result = await executeQuery(query, params)
    const prescriptions =
      result.rows?.map((row) => ({
        prescriptionId: row[0],
        appointmentId: row[1],
        prescribedBy: row[2],
        notes: row[3],
        createdOn: row[4],
        doctorName: row[5],
      })) || []

    return successResponse({ prescriptions, total: prescriptions.length })
  } catch (error) {
    console.error("[v0] Get prescriptions error:", error)
    return errorResponse("Failed to fetch prescriptions", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) return unauthorizedResponse()

    if (!hasRole(user, "DOCTOR")) {
      return forbiddenResponse()
    }

    const body = await request.json()
    const { appointmentId, notes, medicines } = body

    if (!validateRequired(body, ["appointmentId"])) {
      return errorResponse("Appointment ID is required")
    }

    const doctorResult = await executeQuerySingle("SELECT DOCTOR_ID FROM DOCTORS WHERE USER_ID = :userId", [
      user.userId,
    ])

    if (!doctorResult) {
      return errorResponse("Doctor not found", 404)
    }

    const appointment = await executeQuerySingle(
      "SELECT APPOINTMENT_ID FROM APPOINTMENTS WHERE APPOINTMENT_ID = :appointmentId",
      [appointmentId],
    )

    if (!appointment) {
      return errorResponse("Appointment not found", 404)
    }

    const result = await executeQuery(
      `INSERT INTO PRESCRIPTIONS (APPOINTMENT_ID, PRESCRIBED_BY, NOTES)
       VALUES (:appointmentId, :prescribedBy, :notes)`,
      [appointmentId, doctorResult[0], notes],
    )

    return successResponse(
      {
        message: "Prescription created successfully",
      },
      201,
    )
  } catch (error) {
    console.error("[v0] Create prescription error:", error)
    return errorResponse("Failed to create prescription", 500)
  }
}
