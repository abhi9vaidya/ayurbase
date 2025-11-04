import type { NextRequest } from 'next/server'
import { executeQuerySingle, executeQuery } from '@/lib/db'
import { verifyAuth, hasRole, successResponse, errorResponse, forbiddenResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) return forbiddenResponse()

    const row = await executeQuerySingle(
      `SELECT d.DOCTOR_ID, u.USER_ID, u.NAME, u.EMAIL, u.CONTACT_NO,
              d.SPECIALIZATION, d.EXPERIENCE_YRS, d.QUALIFICATION,
              d.AVAILABLE_FROM, d.AVAILABLE_TO
       FROM DOCTORS d
       JOIN USERS u ON d.USER_ID = u.USER_ID
       WHERE d.USER_ID = :userId`,
      [user.userId],
    )

    if (!row) return errorResponse('Doctor profile not found', 404)

    return successResponse({
      doctorId: row[0],
      userId: row[1],
      name: row[2],
      email: row[3],
      contactNo: row[4],
      specialization: row[5],
      experienceYrs: row[6],
      qualification: row[7],
      availableFrom: row[8],
      availableTo: row[9],
    })
  } catch (err) {
    console.error('[v0] GET /api/doctor/me error:', err)
    return errorResponse('Failed to fetch doctor profile', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) return forbiddenResponse()
    if (!(hasRole(user, 'DOCTOR') || hasRole(user, 'ADMIN'))) return forbiddenResponse()

    const body = await request.json()
    const { name, contactNo, specialization, experienceYrs, qualification } = body

    if (name || contactNo) {
      await executeQuery(
        `UPDATE USERS SET NAME = COALESCE(:name, NAME), CONTACT_NO = COALESCE(:contactNo, CONTACT_NO) WHERE USER_ID = :userId`,
        [name || null, contactNo || null, user.userId],
      )
    }

    await executeQuery(
      `UPDATE DOCTORS
       SET SPECIALIZATION = COALESCE(:specialization, SPECIALIZATION),
           EXPERIENCE_YRS = COALESCE(:experienceYrs, EXPERIENCE_YRS),
           QUALIFICATION = COALESCE(:qualification, QUALIFICATION)
       WHERE USER_ID = :userId`,
      [specialization || null, experienceYrs ?? null, qualification || null, user.userId],
    )

    return successResponse({ message: 'Profile updated' })
  } catch (err) {
    console.error('[v0] PUT /api/doctor/me error:', err)
    return errorResponse('Failed to update profile', 500)
  }
}
