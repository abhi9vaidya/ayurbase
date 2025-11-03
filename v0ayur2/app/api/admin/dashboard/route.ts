import type { NextRequest } from "next/server"
import { executeQuerySingle } from "@/lib/db"
import { successResponse, errorResponse, verifyAuth, hasRole, forbiddenResponse } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    console.log(user);
    if (!user || !hasRole(user, "ADMIN")) {
      return forbiddenResponse()
    }

    const doctorCount = await executeQuerySingle("SELECT COUNT(*) FROM DOCTORS")

    const patientCount = await executeQuerySingle("SELECT COUNT(*) FROM PATIENTS")

    const appointmentCount = await executeQuerySingle("SELECT COUNT(*) FROM APPOINTMENTS")

    const scheduledCount = await executeQuerySingle("SELECT COUNT(*) FROM APPOINTMENTS WHERE STATUS = 'SCHEDULED'")

    const completedCount = await executeQuerySingle("SELECT COUNT(*) FROM APPOINTMENTS WHERE STATUS = 'COMPLETED'")

    const recentAppointments = await executeQuerySingle(
      `SELECT COUNT(*) FROM APPOINTMENTS 
       WHERE APPT_DATE >= SYSDATE - 7`,
    )

    return successResponse({
      statistics: {
        totalDoctors: doctorCount?.[0] || 0,
        totalPatients: patientCount?.[0] || 0,
        totalAppointments: appointmentCount?.[0] || 0,
        scheduledAppointments: scheduledCount?.[0] || 0,
        completedAppointments: completedCount?.[0] || 0,
        appointmentsThisWeek: recentAppointments?.[0] || 0,
      },
    })
  } catch (error) {
    console.error("[v0] Admin dashboard error:", error)
    return errorResponse("Failed to fetch dashboard data", 500)
  }
}
