import type { NextRequest } from "next/server"
import { executeQuery } from "@/lib/db"
import { successResponse, errorResponse, verifyAuth, hasRole, forbiddenResponse } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user || !hasRole(user, "ADMIN")) {
      return forbiddenResponse()
    }

    const topDoctors = await executeQuery(
      `SELECT u.NAME, d.SPECIALIZATION, COUNT(a.APPOINTMENT_ID) as APPOINTMENT_COUNT
       FROM DOCTORS d
       JOIN USERS u ON d.USER_ID = u.USER_ID
       LEFT JOIN APPOINTMENTS a ON d.DOCTOR_ID = a.DOCTOR_ID
       GROUP BY d.DOCTOR_ID, u.NAME, d.SPECIALIZATION
       ORDER BY APPOINTMENT_COUNT DESC
       FETCH FIRST 10 ROWS ONLY`,
    )

    const appointmentsByStatus = await executeQuery(
      `SELECT STATUS, COUNT(*) as COUNT
       FROM APPOINTMENTS
       GROUP BY STATUS`,
    )

    const specializations = await executeQuery(
      `SELECT SPECIALIZATION, COUNT(*) as DOCTOR_COUNT
       FROM DOCTORS
       GROUP BY SPECIALIZATION`,
    )

    return successResponse({
      reports: {
        topDoctors:
          topDoctors.rows?.map((row) => ({
            name: row[0],
            specialization: row[1],
            appointmentCount: row[2],
          })) || [],
        appointmentsByStatus:
          appointmentsByStatus.rows?.map((row) => ({
            status: row[0],
            count: row[1],
          })) || [],
        specializations:
          specializations.rows?.map((row) => ({
            specialization: row[0],
            doctorCount: row[1],
          })) || [],
      },
    })
  } catch (error) {
    console.error("[v0] Reports error:", error)
    return errorResponse("Failed to fetch reports", 500)
  }
}
