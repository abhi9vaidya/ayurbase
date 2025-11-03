import type { NextRequest } from "next/server"
import { executeQuery, executeQuerySingle } from "@/lib/db"
import { successResponse, errorResponse, verifyAuth, generateToken } from "@/lib/auth"

// GET: return current user's patient record (if any)
export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) return errorResponse("Unauthorized", 401)

    const patient = await executeQuerySingle(
      `SELECT p.PATIENT_ID, p.GENDER, p.DATE_OF_BIRTH, p.BLOOD_GROUP, p.ADDRESS, p.CITY, p.STATE, p.ZIP_CODE, p.ALLERGIES
       FROM PATIENTS p
       WHERE p.USER_ID = :userId`,
      [user.userId],
    )

    if (!patient) return errorResponse("Patient record not found", 404)

    return successResponse({
      patient: {
        patientId: patient[0],
        gender: patient[1],
        dateOfBirth: patient[2],
        bloodGroup: patient[3],
        address: patient[4],
        city: patient[5],
        state: patient[6],
        zipCode: patient[7],
        allergies: patient[8],
      },
    })
  } catch (error) {
    console.error("[v0] Get/register patient error:", error)
    return errorResponse("Failed to fetch patient", 500)
  }
}

// POST: create or update patient record for the authenticated user and return updated token
export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) return errorResponse("Unauthorized", 401)

    const body = await request.json()
    const {
      gender = null,
      dateOfBirth = null,
      bloodGroup = null,
      address = null,
      city = null,
      state = null,
      zipCode = null,
      allergies = null,
    } = body || {}

    // Normalize dateOfBirth: accept ISO strings and keep only the date part (YYYY-MM-DD)
    let dob = dateOfBirth
    if (typeof dob === "string") {
      dob = dob.trim()
      if (dob === "") dob = null
      // strip time if present (e.g. 2023-01-02T00:00:00.000Z)
      if (dob && dob.includes("T")) dob = dob.split("T")[0]
    }

    const existing = await executeQuerySingle("SELECT PATIENT_ID FROM PATIENTS WHERE USER_ID = :userId", [user.userId])
    if (!existing) {
      await executeQuery(
        `INSERT INTO PATIENTS (USER_ID, GENDER, DATE_OF_BIRTH, BLOOD_GROUP, ADDRESS, CITY, STATE, ZIP_CODE, ALLERGIES)
         VALUES (:userId, :gender, TO_DATE(:dateOfBirth, 'YYYY-MM-DD'), :bloodGroup, :address, :city, :state, :zipCode, :allergies)`,
        [user.userId, gender, dob, bloodGroup, address, city, state, zipCode, allergies],
      )
    } else {
      // update existing record with provided fields (if any)
      const updates: string[] = []
      const values: any[] = []
      if (gender !== null) { updates.push("GENDER = :gender"); values.push(gender) }
  if (dateOfBirth !== null) { updates.push("DATE_OF_BIRTH = TO_DATE(:dateOfBirth, 'YYYY-MM-DD')"); values.push(dob) }
      if (bloodGroup !== null) { updates.push("BLOOD_GROUP = :bloodGroup"); values.push(bloodGroup) }
      if (address !== null) { updates.push("ADDRESS = :address"); values.push(address) }
      if (city !== null) { updates.push("CITY = :city"); values.push(city) }
      if (state !== null) { updates.push("STATE = :state"); values.push(state) }
      if (zipCode !== null) { updates.push("ZIP_CODE = :zipCode"); values.push(zipCode) }
      if (allergies !== null) { updates.push("ALLERGIES = :allergies"); values.push(allergies) }
      if (updates.length) {
        values.push(user.userId)
        await executeQuerySingle(`UPDATE PATIENTS SET ${updates.join(", ")} WHERE USER_ID = :userId`, values)
      }
    }

    const patient = await executeQuerySingle("SELECT PATIENT_ID FROM PATIENTS WHERE USER_ID = :userId", [user.userId])
    if (!patient) return errorResponse("Failed to create patient", 500)

    // Generate a fresh token including patientId
    const token = generateToken({
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      patientId: patient[0],
    })

    return successResponse({ message: "Patient saved", token, patientId: patient[0]}, 201)
  } catch (error) {
    console.error("[v0] Create/update register patient error:", error)
    return errorResponse("Failed to create/update patient", 500)
  }
}
