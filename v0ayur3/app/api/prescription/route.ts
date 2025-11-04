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

    // allow optional filtering by appointmentId via query string (?appointmentId=123)
    const url = new URL(request.url)
    const appointmentIdParam = url.searchParams.get("appointmentId")

    if (hasRole(user, "ADMIN")) {
      query = `SELECT pr.PRESCRIPTION_ID, pr.APPOINTMENT_ID, pr.PRESCRIBED_BY,
                      pr.NOTES, pr.CREATED_ON, u.NAME as DOCTOR_NAME
               FROM PRESCRIPTIONS pr
               LEFT JOIN DOCTORS d ON pr.PRESCRIBED_BY = d.DOCTOR_ID
               LEFT JOIN USERS u ON d.USER_ID = u.USER_ID
               ORDER BY pr.CREATED_ON DESC`
      if (appointmentIdParam) {
        query = query.replace(/ORDER BY/, `WHERE pr.APPOINTMENT_ID = :appointmentId ORDER BY`)
        params = [appointmentIdParam]
      }
    } else if (hasRole(user, "DOCTOR")) {
      query = `SELECT pr.PRESCRIPTION_ID, pr.APPOINTMENT_ID, pr.PRESCRIBED_BY,
                      pr.NOTES, pr.CREATED_ON, u.NAME as DOCTOR_NAME
               FROM PRESCRIPTIONS pr
               LEFT JOIN DOCTORS d ON pr.PRESCRIBED_BY = d.DOCTOR_ID
               LEFT JOIN USERS u ON d.USER_ID = u.USER_ID
               WHERE pr.PRESCRIBED_BY = (SELECT DOCTOR_ID FROM DOCTORS WHERE USER_ID = :userId)
               ORDER BY pr.CREATED_ON DESC`
      params = [user.userId]
      if (appointmentIdParam) {
        query = query.replace("ORDER BY", "AND pr.APPOINTMENT_ID = :appointmentId ORDER BY")
        params.push(appointmentIdParam)
      }
    } else if (hasRole(user, "PATIENT")) {
      query = `SELECT pr.PRESCRIPTION_ID, pr.APPOINTMENT_ID, pr.PRESCRIBED_BY,
                      pr.NOTES, pr.CREATED_ON, u.NAME as DOCTOR_NAME
               FROM PRESCRIPTIONS pr
               LEFT JOIN DOCTORS d ON pr.PRESCRIBED_BY = d.DOCTOR_ID
               LEFT JOIN USERS u ON d.USER_ID = u.USER_ID
               JOIN APPOINTMENTS a ON pr.APPOINTMENT_ID = a.APPOINTMENT_ID
               WHERE a.PATIENT_ID = (SELECT PATIENT_ID FROM PATIENTS WHERE USER_ID = :userId)
               ORDER BY pr.CREATED_ON DESC`
      params = [user.userId]
      if (appointmentIdParam) {
        query = query.replace("ORDER BY", "AND pr.APPOINTMENT_ID = :appointmentId ORDER BY")
        params.push(appointmentIdParam)
      }
    }

    const result = await executeQuery(query, params)
    const unwrap = (v: any) => {
      if (v === null || v === undefined) return null
      // DB driver may return objects for some columns; coerce to primitive string
      if (typeof v === "object") return String(v)
      // If numeric-looking string, convert to number (useful for IDs/timestamps handled as strings)
      if (typeof v === "string") {
        const trimmed = v.trim()
        const n = Number(trimmed)
        return Number.isNaN(n) ? trimmed : n
      }
      return v
    }

    const prescriptions =
      result.rows?.map((row: any) => {
        const notesRaw = unwrap(row[3])
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

        return {
          prescriptionId: unwrap(row[0]),
          appointmentId: unwrap(row[1]),
          prescribedBy: unwrap(row[2]),
          // keep notes as string for compatibility; include parsed object when applicable
          notes: notesRaw,
          notesParsed,
          createdOn: unwrap(row[4]),
          doctorName: unwrap(row[5]),
        }
      }) || []

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
    const doctorId = Number(String(doctorResult[0]))

    const appointment = await executeQuerySingle(
      "SELECT APPOINTMENT_ID FROM APPOINTMENTS WHERE APPOINTMENT_ID = :appointmentId",
      [appointmentId],
    )

    if (!appointment) {
      return errorResponse("Appointment not found", 404)
    }

    // ensure notes is a string (if client passed an object, stringify it)
    const notesStr = notes && typeof notes === "object" ? JSON.stringify(notes) : notes ?? null

    // Check if a prescription already exists for this appointment. The schema enforces uniqueness,
    // but be defensive: if one exists return it instead of trying to insert again.
    const existing = await executeQuerySingle("SELECT PRESCRIPTION_ID FROM PRESCRIPTIONS WHERE APPOINTMENT_ID = :appointmentId", [
      appointmentId,
    ])

    if (existing) {
      const existingId = existing ? Number(String(existing[0])) : null
      return successResponse({ message: "Prescription already exists", prescriptionId: existingId })
    }

    await executeQuery(
      `INSERT INTO PRESCRIPTIONS (APPOINTMENT_ID, PRESCRIBED_BY, NOTES)
       VALUES (:appointmentId, :prescribedBy, :notes)`,
      [appointmentId, doctorId, notesStr],
    )

    // Fetch the newly created prescription id (defensive: schema enforces 1:1 with appointment)
    const inserted = await executeQuerySingle(
      "SELECT PRESCRIPTION_ID FROM PRESCRIPTIONS WHERE APPOINTMENT_ID = :appointmentId",
      [appointmentId],
    )
    const insertedId = inserted ? Number(String(inserted[0])) : null

    return successResponse(
      {
        message: "Prescription created successfully",
        prescriptionId: insertedId,
      },
      201,
    )
  } catch (error) {
    console.error("[v0] Create prescription error:", error)
    return errorResponse("Failed to create prescription", 500)
  }
}
