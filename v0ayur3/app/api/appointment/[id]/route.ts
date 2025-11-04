import type { NextRequest } from "next/server"
import { executeQuerySingle } from "@/lib/db"
import { successResponse, errorResponse, verifyAuth, forbiddenResponse, hasRole } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = verifyAuth(request)
    if (!user) return forbiddenResponse()

    const appointmentId = Number.parseInt(params.id)

    const appointment = await executeQuerySingle(
      `SELECT a.APPOINTMENT_ID, a.PATIENT_ID, a.DOCTOR_ID, a.APPT_DATE,
              a.DURATION_MIN, a.STATUS, a.REASON, a.CREATED_ON
       FROM APPOINTMENTS a
       WHERE a.APPOINTMENT_ID = :appointmentId`,
      [appointmentId],
    )

    if (!appointment) {
      return errorResponse("Appointment not found", 404)
    }

    if (hasRole(user, "PATIENT") && user.patientId !== appointment[1]) {
      return forbiddenResponse()
    }
    if (hasRole(user, "DOCTOR")) {
      const doctorId = await executeQuerySingle("SELECT DOCTOR_ID FROM DOCTORS WHERE USER_ID = :userId", [user.userId])
      if (doctorId[0] !== appointment[2]) {
        return forbiddenResponse()
      }
    }

    return successResponse({
      appointmentId: appointment[0],
      patientId: appointment[1],
      doctorId: appointment[2],
      apptDate: appointment[3],
      durationMin: appointment[4],
      status: appointment[5],
      reason: appointment[6],
      createdOn: appointment[7],
    })
  } catch (error) {
    console.error("[v0] Get appointment error:", error)
    return errorResponse("Failed to fetch appointment", 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = verifyAuth(request)
    if (!user) return forbiddenResponse()

    const { id } = await params
    const appointmentId = Number.parseInt(id)
    const body = await request.json()
    const { status } = body

    if (!status) {
      return errorResponse("Status is required")
    }

    const validStatuses = ["SCHEDULED", "COMPLETED", "CANCELLED"]
    if (!validStatuses.includes(status)) {
      return errorResponse("Invalid status")
    }

    const appointment = await executeQuerySingle(
      "SELECT PATIENT_ID, DOCTOR_ID FROM APPOINTMENTS WHERE APPOINTMENT_ID = :appointmentId",
      [appointmentId],
    )

    if (!appointment) {
      return errorResponse("Appointment not found", 404)
    }

    if (hasRole(user, "PATIENT") && user.patientId !== appointment[0]) {
      return forbiddenResponse()
    }

    await executeQuerySingle("UPDATE APPOINTMENTS SET STATUS = :status WHERE APPOINTMENT_ID = :appointmentId", [
      status,
      appointmentId,
    ])

    return successResponse({
      message: "Appointment updated successfully",
    })
  } catch (error) {
    console.error("[v0] Update appointment error:", error)
    return errorResponse("Failed to update appointment", 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = verifyAuth(request)
    if (!user) return forbiddenResponse()

    const appointmentId = Number.parseInt(params.id)

    const appointment = await executeQuerySingle(
      "SELECT PATIENT_ID FROM APPOINTMENTS WHERE APPOINTMENT_ID = :appointmentId",
      [appointmentId],
    )

    if (!appointment) {
      return errorResponse("Appointment not found", 404)
    }

    if (!hasRole(user, "ADMIN") && user.patientId !== appointment[0]) {
      return forbiddenResponse()
    }

    await executeQuerySingle("UPDATE APPOINTMENTS SET STATUS = :status WHERE APPOINTMENT_ID = :appointmentId", [
      "CANCELLED",
      appointmentId,
    ])

    return successResponse({
      message: "Appointment cancelled successfully",
    })
  } catch (error) {
    console.error("[v0] Cancel appointment error:", error)
    return errorResponse("Failed to cancel appointment", 500)
  }
}
