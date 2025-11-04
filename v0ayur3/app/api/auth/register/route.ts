import type { NextRequest } from "next/server"
import { executeQuery, executeQuerySingle } from "@/lib/db"
import { hashPassword, successResponse, errorResponse, generateToken } from "@/lib/auth"
import { isValidEmail, isValidPhone, isStrongPassword, validateRequired } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, contactNo, role = "PATIENT" } = body

    if (!validateRequired(body, ["name", "email", "password", "contactNo"])) {
      return errorResponse("All fields are required")
    }

    if (!isValidEmail(email)) {
      return errorResponse("Invalid email format")
    }

    if (!isValidPhone(contactNo)) {
      return errorResponse("Invalid phone number format")
    }

    if (!isStrongPassword(password)) {
      return errorResponse("Password must be at least 8 characters with uppercase, lowercase, and numbers")
    }

    const existingUser = await executeQuerySingle("SELECT USER_ID FROM USERS WHERE EMAIL = :email", [email])

    if (existingUser) {
      return errorResponse("Email already registered", 409)
    }

    const hashedPassword = await hashPassword(password)

    const result = await executeQuery(
      `INSERT INTO USERS (NAME, EMAIL, PASSWORD, ROLE, CONTACT_NO) 
       VALUES (:name, :email, :password, :role, :contactNo)`,
      [name, email, hashedPassword, role, contactNo],
    )

    const user = await executeQuerySingle(
      "SELECT USER_ID, NAME, EMAIL, ROLE, CONTACT_NO FROM USERS WHERE EMAIL = :email",
      [email],
    )

    if (!user) {
      return errorResponse("Failed to create user", 500)
    }

    // If the registered user is a patient, ensure a PATIENTS row exists
    // let patientId: number | undefined = undefined
    // if (user[3] === "PATIENT") {
    //   const existingPatient = await executeQuerySingle("SELECT PATIENT_ID FROM PATIENTS WHERE USER_ID = :userId", [
    //     user[0],
    //   ])
    //   if (!existingPatient) {
    //     // create a minimal patient record (other details can be completed later)
    //     await executeQuery(
    //       `INSERT INTO PATIENTS (USER_ID) VALUES (:userId)`,
    //       [user[0]],
    //     )
    //   }
    //   const p = await executeQuerySingle("SELECT PATIENT_ID FROM PATIENTS WHERE USER_ID = :userId", [user[0]])
    //   if (p) patientId = p[0]
    // }

    const token = generateToken({
      userId: user[0],
      email: user[2],
      role: user[3],
    })

    return successResponse(
      {
        message: "User registered successfully",
        token,
        user: {
          userId: user[0],
          name: user[1],
          email: user[2],
          role: user[3],
        },
      },
      201,
    )
  } catch (error) {
    console.error("[v0] Register error:", error)
    return errorResponse("Failed to register user", 500)
  }
}
