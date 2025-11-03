import type { NextRequest } from "next/server"
import { executeQuerySingle } from "@/lib/db"
import { successResponse, errorResponse, verifyAuth, forbiddenResponse, hasRole } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = verifyAuth(request)
    if (!user) return forbiddenResponse()

    const patientId = Number.parseInt(params.id)

    const patient = await executeQuerySingle(
      `SELECT p.PATIENT_ID, u.USER_ID, u.NAME, u.EMAIL, u.CONTACT_NO,
              p.GENDER, p.DATE_OF_BIRTH, p.BLOOD_GROUP, p.ADDRESS,
              p.CITY, p.STATE, p.ZIP_CODE, p.EMERGENCY_CONTACT,
              p.ALLERGIES, p.MEDICAL_HISTORY, p.INSURANCE_ID, p.INSURANCE_PROVIDER
       FROM PATIENTS p
       JOIN USERS u ON p.USER_ID = u.USER_ID
       WHERE p.PATIENT_ID = :patientId`,
      [patientId],
    )

    if (!patient) {
      return errorResponse("Patient not found", 404)
    }

    // Authorization: allow ADMIN, or the patient owner, or a user whose token already contains the matching patientId
    if (!hasRole(user, "ADMIN") && user.patientId !== patientId && user.userId !== patient[1]) {
      return forbiddenResponse()
    }

    return successResponse({
      patientId: patient[0],
      userId: patient[1],
      name: patient[2],
      email: patient[3],
      contactNo: patient[4],
      gender: patient[5],
      dateOfBirth: patient[6],
      bloodGroup: patient[7],
      address: patient[8],
      city: patient[9],
      state: patient[10],
      zipCode: patient[11],
      emergencyContact: patient[12],
      allergies: patient[13],
      medicalHistory: patient[14],
      insuranceId: patient[15],
      insuranceProvider: patient[16],
    })
  } catch (error) {
    console.error("[v0] Get patient error:", error)
    return errorResponse("Failed to fetch patient", 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = verifyAuth(request)
    if (!user) return forbiddenResponse()

    const patientId = Number.parseInt(params.id)

    // fetch patient owner to validate authorization (allow admin or owner)
    const owner = await executeQuerySingle("SELECT USER_ID FROM PATIENTS WHERE PATIENT_ID = :patientId", [patientId])
    const ownerUserId = owner ? owner[0] : null

    if (!hasRole(user, "ADMIN") && user.patientId !== patientId && user.userId !== ownerUserId) {
      return forbiddenResponse()
    }

    const body = await request.json()
    const {
      gender,
      dateOfBirth,
      bloodGroup,
      address,
      city,
      state,
      zipCode,
      emergencyContact,
      allergies,
      medicalHistory,
      insuranceId,
      insuranceProvider,
    } = body

  const updates: string[] = []
  const values: any[] = []

    const fields = {
      GENDER: gender,
      DATE_OF_BIRTH: dateOfBirth,
      BLOOD_GROUP: bloodGroup,
      ADDRESS: address,
      CITY: city,
      STATE: state,
      ZIP_CODE: zipCode,
      EMERGENCY_CONTACT: emergencyContact,
      ALLERGIES: allergies,
      MEDICAL_HISTORY: medicalHistory,
      INSURANCE_ID: insuranceId,
      INSURANCE_PROVIDER: insuranceProvider,
    }

    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        // Handle DATE_OF_BIRTH explicitly to avoid Oracle implicit conversion issues.
        if (key === "DATE_OF_BIRTH") {
          // accept 'YYYY-MM-DD' or ISO strings; normalize to YYYY-MM-DD
          let dob: any = value
          if (typeof dob === "string") {
            dob = dob.trim()
            if (dob.includes("T")) dob = dob.split("T")[0]
          }
          updates.push("DATE_OF_BIRTH = TO_DATE(:DATE_OF_BIRTH, 'YYYY-MM-DD')")
          values.push(dob)
        } else {
          updates.push(`${key} = :${key}`)
          values.push(value)
        }
      }
    })

    if (updates.length === 0) {
      return errorResponse("No fields to update")
    }

    values.push(patientId)
    await executeQuerySingle(`UPDATE PATIENTS SET ${updates.join(", ")} WHERE PATIENT_ID = :patientId`, values)

    return successResponse({
      message: "Patient profile updated successfully",
    })
  } catch (error) {
    console.error("[v0] Update patient error:", error)
    return errorResponse("Failed to update patient", 500)
  }
}
