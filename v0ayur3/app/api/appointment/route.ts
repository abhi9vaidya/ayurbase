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
      query = `SELECT a.APPOINTMENT_ID, a.PATIENT_ID, a.DOCTOR_ID, a.APPT_DATE,
                      a.DURATION_MIN, a.STATUS, a.REASON, a.CREATED_ON,
                      p.PATIENT_ID, u1.NAME as PATIENT_NAME,
                      d.DOCTOR_ID, u2.NAME as DOCTOR_NAME
               FROM APPOINTMENTS a
               JOIN PATIENTS p ON a.PATIENT_ID = p.PATIENT_ID
               JOIN USERS u1 ON p.USER_ID = u1.USER_ID
               JOIN DOCTORS d ON a.DOCTOR_ID = d.DOCTOR_ID
               JOIN USERS u2 ON d.USER_ID = u2.USER_ID
               ORDER BY a.APPT_DATE DESC`
    } else if (hasRole(user, "DOCTOR")) {
      query = `SELECT a.APPOINTMENT_ID, a.PATIENT_ID, a.DOCTOR_ID, a.APPT_DATE,
                      a.DURATION_MIN, a.STATUS, a.REASON, a.CREATED_ON,
                      p.PATIENT_ID, u1.NAME as PATIENT_NAME,
                      d.DOCTOR_ID, u2.NAME as DOCTOR_NAME
               FROM APPOINTMENTS a
               JOIN PATIENTS p ON a.PATIENT_ID = p.PATIENT_ID
               JOIN USERS u1 ON p.USER_ID = u1.USER_ID
               JOIN DOCTORS d ON a.DOCTOR_ID = d.DOCTOR_ID
               JOIN USERS u2 ON d.USER_ID = u2.USER_ID
               WHERE d.DOCTOR_ID = (SELECT DOCTOR_ID FROM DOCTORS WHERE USER_ID = :userId)
               ORDER BY a.APPT_DATE DESC`
      params = [user.userId]
    } else if (hasRole(user, "PATIENT")) {
      query = `SELECT a.APPOINTMENT_ID, a.PATIENT_ID, a.DOCTOR_ID, a.APPT_DATE,
                      a.DURATION_MIN, a.STATUS, a.REASON, a.CREATED_ON,
                      p.PATIENT_ID, u1.NAME as PATIENT_NAME,
                      d.DOCTOR_ID, u2.NAME as DOCTOR_NAME
               FROM APPOINTMENTS a
               JOIN PATIENTS p ON a.PATIENT_ID = p.PATIENT_ID
               JOIN USERS u1 ON p.USER_ID = u1.USER_ID
               JOIN DOCTORS d ON a.DOCTOR_ID = d.DOCTOR_ID
               JOIN USERS u2 ON d.USER_ID = u2.USER_ID
               WHERE p.PATIENT_ID = (SELECT PATIENT_ID FROM PATIENTS WHERE USER_ID = :userId)
               ORDER BY a.APPT_DATE DESC`
      params = [user.userId]
    }

    const result = await executeQuery(query, params)
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
        patientName: row[9],
        doctorName: row[11],
      })) || []

    return successResponse({ appointments, total: appointments.length })
  } catch (error) {
    console.error("[v0] Get appointments error:", error)
    return errorResponse("Failed to fetch appointments", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) return unauthorizedResponse()

    if (!hasRole(user, "PATIENT")) {
      return forbiddenResponse()
    }

    const body = await request.json()
    const { doctorId, apptDate, durationMin = 30, reason } = body
    // parse appointment date into a JS Date and validate. Bind JS Date to oracledb so the driver
    // passes a proper DATE/TIMESTAMP value to Oracle (avoids implicit string-to-date conversion errors)
    const apptDateObj = apptDate ? new Date(apptDate) : null
    if (!apptDateObj || Number.isNaN(apptDateObj.getTime())) {
      return errorResponse("Invalid appointment date", 400)
    }

    if (!validateRequired(body, ["doctorId", "apptDate"])) {
      return errorResponse("Doctor ID and appointment date are required")
    }

    const patientResult = await executeQuerySingle("SELECT PATIENT_ID FROM PATIENTS WHERE USER_ID = :userId", [
      user.userId,
    ])

    if (!patientResult) {
      return errorResponse("Patient not found", 404)
    }

    const doctor = await executeQuerySingle("SELECT DOCTOR_ID FROM DOCTORS WHERE DOCTOR_ID = :doctorId", [doctorId])

    if (!doctor) {
      return errorResponse("Doctor not found", 404)
    }

    const overlapping = await executeQuerySingle(
      `SELECT APPOINTMENT_ID FROM APPOINTMENTS
       WHERE DOCTOR_ID = :doctorId
       AND APPT_DATE = :apptDate
       AND STATUS != 'CANCELLED'`,
      [doctorId, apptDateObj],
    )

    if (overlapping) {
      return errorResponse("Doctor is not available at this time", 409)
    }

    const result = await executeQuery(
      `INSERT INTO APPOINTMENTS (PATIENT_ID, DOCTOR_ID, APPT_DATE, DURATION_MIN, STATUS, REASON)
       VALUES (:patientId, :doctorId, :apptDate, :durationMin, 'SCHEDULED', :reason)`,
      [patientResult[0], doctorId, apptDateObj, durationMin, reason],
    )

    return successResponse(
      {
        message: "Appointment booked successfully",
      },
      201,
    )
  } catch (error) {
    console.error("[v0] Create appointment error:", error)
    return errorResponse("Failed to book appointment", 500)
  }
}
