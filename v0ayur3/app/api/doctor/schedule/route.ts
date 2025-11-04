import type { NextRequest } from 'next/server'
import { verifyAuth, hasRole, successResponse, forbiddenResponse, errorResponse } from '@/lib/auth'
import { executeQueryMany, executeQuery } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) return forbiddenResponse()

    // fetch doctor id from doctors table
    const docRow = await executeQueryMany(`SELECT DOCTOR_ID, AVAILABLE_FROM, AVAILABLE_TO FROM DOCTORS WHERE USER_ID = :userId`, [user.userId])
    const doctor = docRow?.[0]
    if (!doctor) return errorResponse('Doctor not found', 404)

    const doctorId = doctor[0]

    const appts = await executeQueryMany(
      `SELECT a.APPOINTMENT_ID, a.APPT_DATE, a.DURATION_MIN, a.STATUS, p.PATIENT_ID, u.NAME AS PATIENT_NAME
       FROM APPOINTMENTS a
       JOIN PATIENTS p ON a.PATIENT_ID = p.PATIENT_ID
       JOIN USERS u ON p.USER_ID = u.USER_ID
       WHERE a.DOCTOR_ID = :doctorId
       ORDER BY a.APPT_DATE`,
      [doctorId],
    )

    const items = appts.map((r: any) => ({
      appointmentId: r[0],
      apptDate: r[1],
      durationMin: r[2],
      status: r[3],
      patientId: r[4],
      patientName: r[5],
    }))

    return successResponse({ doctorId, schedule: items })
  } catch (err) {
    console.error('[v0] GET /api/doctor/schedule error:', err)
    return errorResponse('Failed to fetch schedule', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) return forbiddenResponse()
    if (!hasRole(user, 'DOCTOR')) return forbiddenResponse()

    const body = await request.json()
    const { availableFrom, availableTo } = body
    if (!availableFrom || !availableTo) return errorResponse('Missing availability', 400)

    await executeQuery(
      `UPDATE DOCTORS SET AVAILABLE_FROM = TO_TIMESTAMP(:availableFrom, 'YYYY-MM-DD"T"HH24:MI:SS.FF') , AVAILABLE_TO = TO_TIMESTAMP(:availableTo, 'YYYY-MM-DD"T"HH24:MI:SS.FF') WHERE USER_ID = :userId`,
      [availableFrom, availableTo, user.userId],
    )

    return successResponse({ message: 'Availability updated' })
  } catch (err) {
    console.error('[v0] PUT /api/doctor/schedule error:', err)
    return errorResponse('Failed to update availability', 500)
  }
}
