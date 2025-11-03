import type { NextRequest } from "next/server"
import { executeQuerySingle } from "@/lib/db"
import { successResponse, errorResponse, verifyAuth, forbiddenResponse, hasRole } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = verifyAuth(request)
    if (!user) return forbiddenResponse()

    const doctorId = Number.parseInt(params.id)

    if (!hasRole(user, "ADMIN") && user.doctorId !== doctorId) {
      return forbiddenResponse()
    }

    const doctor = await executeQuerySingle(
      `SELECT d.DOCTOR_ID, u.USER_ID, u.NAME, u.EMAIL, u.CONTACT_NO,
              d.SPECIALIZATION, d.EXPERIENCE_YRS, d.QUALIFICATION,
              d.AVAILABLE_FROM, d.AVAILABLE_TO
       FROM DOCTORS d
       JOIN USERS u ON d.USER_ID = u.USER_ID
       WHERE d.DOCTOR_ID = :doctorId`,
      [doctorId],
    )

    if (!doctor) {
      return errorResponse("Doctor not found", 404)
    }

    return successResponse({
      doctorId: doctor[0],
      userId: doctor[1],
      name: doctor[2],
      email: doctor[3],
      contactNo: doctor[4],
      specialization: doctor[5],
      experienceYrs: doctor[6],
      qualification: doctor[7],
      availableFrom: doctor[8],
      availableTo: doctor[9],
    })
  } catch (error) {
    console.error("[v0] Get doctor error:", error)
    return errorResponse("Failed to fetch doctor", 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = verifyAuth(request)
    if (!user) return forbiddenResponse()

    const doctorId = Number.parseInt(params.id)

    if (!hasRole(user, "ADMIN") && user.doctorId !== doctorId) {
      return forbiddenResponse()
    }

    const body = await request.json()
    const { specialization, experienceYrs, qualification, availableFrom, availableTo } = body

    const updates = []
    const values = []

    if (specialization) {
      updates.push("SPECIALIZATION = :specialization")
      values.push(specialization)
    }
    if (experienceYrs !== undefined) {
      updates.push("EXPERIENCE_YRS = :experienceYrs")
      values.push(experienceYrs)
    }
    if (qualification) {
      updates.push("QUALIFICATION = :qualification")
      values.push(qualification)
    }
    if (availableFrom) {
      updates.push("AVAILABLE_FROM = :availableFrom")
      values.push(availableFrom)
    }
    if (availableTo) {
      updates.push("AVAILABLE_TO = :availableTo")
      values.push(availableTo)
    }

    if (updates.length === 0) {
      return errorResponse("No fields to update")
    }

    values.push(doctorId)
    await executeQuerySingle(`UPDATE DOCTORS SET ${updates.join(", ")} WHERE DOCTOR_ID = :doctorId`, values)

    const updated = await executeQuerySingle(
      `SELECT d.DOCTOR_ID, d.SPECIALIZATION, d.EXPERIENCE_YRS, d.QUALIFICATION,
              d.AVAILABLE_FROM, d.AVAILABLE_TO
       FROM DOCTORS d
       WHERE d.DOCTOR_ID = :doctorId`,
      [doctorId],
    )

    return successResponse({
      message: "Doctor updated successfully",
      doctor: {
        doctorId: updated[0],
        specialization: updated[1],
        experienceYrs: updated[2],
        qualification: updated[3],
        availableFrom: updated[4],
        availableTo: updated[5],
      },
    })
  } catch (error) {
    console.error("[v0] Update doctor error:", error)
    return errorResponse("Failed to update doctor", 500)
  }
}
