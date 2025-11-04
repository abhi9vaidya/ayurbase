import type { NextRequest } from "next/server"
import { executeQuerySingle } from "@/lib/db"
import { comparePassword, successResponse, errorResponse, generateToken, type TokenPayload } from "@/lib/auth"
import { isValidEmail, validateRequired } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!validateRequired(body, ["email", "password"])) {
      return errorResponse("Email and password are required")
    }

    if (!isValidEmail(email)) {
      return errorResponse("Invalid email format")
    }

    const userResult = await executeQuerySingle(
      "SELECT USER_ID, NAME, EMAIL, PASSWORD, ROLE, CONTACT_NO FROM USERS WHERE EMAIL = :email",
      [email],
    )

    if (!userResult) {
      return errorResponse("Invalid email or password", 401)
    }

  // userResult columns: [USER_ID, NAME, EMAIL, PASSWORD, ROLE, CONTACT_NO]
  // PASSWORD is at index 3
  const passwordMatch = await comparePassword(password, userResult[3])
    if (!passwordMatch) {
      return errorResponse("Invalid email or password", 401)
    }

    const tokenPayload: TokenPayload = {
      userId: userResult[0],
      email: userResult[2],
      role: userResult[4],
      name: userResult[1],
    }

    if (userResult[4] === "DOCTOR") {
      const doctor = await executeQuerySingle("SELECT DOCTOR_ID FROM DOCTORS WHERE USER_ID = :userId", [userResult[0]])
      if (doctor) tokenPayload.doctorId = doctor[0]
    } else if (userResult[4] === "PATIENT") {
      const patient = await executeQuerySingle("SELECT PATIENT_ID FROM PATIENTS WHERE USER_ID = :userId", [
        userResult[0],
      ])
      if (patient) tokenPayload.patientId = patient[0]
      else {
        // no patient record yet - return success but indicate no patientId so client can redirect to patient registration
      }
    } else if (userResult[4] === "ADMIN") {
      // No additional IDs for ADMIN

    }

    const token = generateToken(tokenPayload)

    return successResponse({
      message: "Login successful",
      token,
      user: {
        userId: userResult[0],
        name: userResult[1],
        email: userResult[2],
        role: userResult[4],
        doctorId: tokenPayload.doctorId,
        patientId: tokenPayload.patientId,
      },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return errorResponse("Login failed", 500)
  }
}
