import type { NextRequest } from "next/server"
import { executeQuery, executeQuerySingle } from "@/lib/db"
import { hashPassword, successResponse, errorResponse, verifyAuth, hasRole, forbiddenResponse } from "@/lib/auth"
import { isValidEmail, validateRequired } from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    // if (!user || !hasRole(user, "ADMIN")) return forbiddenResponse()

    const result = await executeQuery(
      `SELECT 
        d.DOCTOR_ID, u.USER_ID, u.NAME, u.EMAIL, u.CONTACT_NO,
        d.SPECIALIZATION, d.EXPERIENCE_YRS, d.QUALIFICATION,
        d.AVAILABLE_FROM, d.AVAILABLE_TO, u.CREATED_ON
      FROM DOCTORS d
      JOIN USERS u ON d.USER_ID = u.USER_ID
      ORDER BY d.DOCTOR_ID`,
    )

    const doctors =
      result.rows?.map((row) => ({
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
        createdOn: row[10],
      })) || []

    return successResponse({ doctors, total: doctors.length })
  } catch (error) {
    console.error("[v0] Get doctors error:", error)
    return errorResponse("Failed to fetch doctors", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user || !hasRole(user, "ADMIN")) return forbiddenResponse()

    const body = await request.json()
    const { name, email, password, contactNo, specialization, experienceYrs, qualification } = body

    if (!validateRequired(body, ["name", "email", "password", "contactNo", "specialization"])) {
      return errorResponse("Required fields missing")
    }

    if (!isValidEmail(email)) {
      return errorResponse("Invalid email format")
    }

    const existing = await executeQuerySingle("SELECT USER_ID FROM USERS WHERE EMAIL = :email", [email])

    if (existing) {
      return errorResponse("Email already registered", 409)
    }

    const hashedPassword = await hashPassword(password)
    await executeQuery(
      `INSERT INTO USERS (NAME, EMAIL, PASSWORD, ROLE, CONTACT_NO)
       VALUES (:name, :email, :password, 'DOCTOR', :contactNo)`,
      [name, email, hashedPassword, contactNo],
    )

    const userResult = await executeQuerySingle("SELECT USER_ID FROM USERS WHERE EMAIL = :email", [email])

    await executeQuery(
      `INSERT INTO DOCTORS (USER_ID, SPECIALIZATION, EXPERIENCE_YRS, QUALIFICATION)
       VALUES (:userId, :specialization, :experienceYrs, :qualification)`,
      [userResult[0], specialization, experienceYrs || 0, qualification],
    )

    const doctor = await executeQuerySingle(
      `SELECT d.DOCTOR_ID, d.SPECIALIZATION, d.EXPERIENCE_YRS, d.QUALIFICATION
       FROM DOCTORS d
       WHERE d.USER_ID = :userId`,
      [userResult[0]],
    )

    return successResponse(
      {
        message: "Doctor registered successfully",
        doctor: {
          doctorId: doctor[0],
          userId: userResult[0],
          name,
          email,
          specialization: doctor[1],
          experienceYrs: doctor[2],
          qualification: doctor[3],
        },
      },
      201,
    )
  } catch (error) {
    console.error("[v0] Register doctor error:", error)
    return errorResponse("Failed to register doctor", 500)
  }
}
