import type { NextRequest } from "next/server"
import { executeQuery, executeQuerySingle } from "@/lib/db"
import { hashPassword, successResponse, errorResponse, verifyAuth, hasRole, forbiddenResponse } from "@/lib/auth"
import { isValidEmail, validateRequired } from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user || !hasRole(user, "ADMIN")) return forbiddenResponse()

    const result = await executeQuery(
      `SELECT 
        p.PATIENT_ID, u.USER_ID, u.NAME, u.EMAIL, u.CONTACT_NO,
        p.GENDER, p.DATE_OF_BIRTH, p.BLOOD_GROUP, p.ADDRESS,
        p.CITY, p.STATE, p.ZIP_CODE, p.ALLERGIES, u.CREATED_ON
      FROM PATIENTS p
      JOIN USERS u ON p.USER_ID = u.USER_ID
      ORDER BY p.PATIENT_ID`,
    )

    const patients =
      result.rows?.map((row) => ({
        patientId: row[0],
        userId: row[1],
        name: row[2],
        email: row[3],
        contactNo: row[4],
        gender: row[5],
        dateOfBirth: row[6],
        bloodGroup: row[7],
        address: row[8],
        city: row[9],
        state: row[10],
        zipCode: row[11],
        allergies: row[12],
        createdOn: row[13],
      })) || []

    return successResponse({ patients, total: patients.length })
  } catch (error) {
    console.error("[v0] Get patients error:", error)
    return errorResponse("Failed to fetch patients", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      password,
      contactNo,
      gender,
      dateOfBirth,
      bloodGroup,
      address,
      city,
      state,
      zipCode,
      allergies,
    } = body

    if (!validateRequired(body, ["name", "email", "password", "contactNo"])) {
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
       VALUES (:name, :email, :password, 'PATIENT', :contactNo)`,
      [name, email, hashedPassword, contactNo],
    )

    const userResult = await executeQuerySingle("SELECT USER_ID FROM USERS WHERE EMAIL = :email", [email])

    await executeQuery(
      `INSERT INTO PATIENTS (USER_ID, GENDER, DATE_OF_BIRTH, BLOOD_GROUP, ADDRESS, CITY, STATE, ZIP_CODE, ALLERGIES)
       VALUES (:userId, :gender, :dateOfBirth, :bloodGroup, :address, :city, :state, :zipCode, :allergies)`,
      [userResult[0], gender, dateOfBirth, bloodGroup, address, city, state, zipCode, allergies],
    )

    const patient = await executeQuerySingle(
      `SELECT p.PATIENT_ID, p.GENDER, p.BLOOD_GROUP, p.ADDRESS
       FROM PATIENTS p
       WHERE p.USER_ID = :userId`,
      [userResult[0]],
    )

    return successResponse(
      {
        message: "Patient registered successfully",
        patient: {
          patientId: patient[0],
          userId: userResult[0],
          name,
          email,
          gender: patient[1],
          bloodGroup: patient[2],
        },
      },
      201,
    )
  } catch (error) {
    console.error("[v0] Register patient error:", error)
    return errorResponse("Failed to register patient", 500)
  }
}
