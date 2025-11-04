import type { NextRequest } from "next/server"
import { executeQuerySingle, executeQuery } from "@/lib/db"
import { successResponse, errorResponse, verifyAuth, forbiddenResponse, hasRole } from "@/lib/auth"
import { validateRequired } from "@/lib/validation"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = verifyAuth(request)
    if (!user) return forbiddenResponse()

    const medicineId = Number.parseInt(params.id)

    const medicine = await executeQuerySingle(
      "SELECT MEDICINE_ID, NAME, FORM, DETAILS FROM MEDICINE WHERE MEDICINE_ID = :medicineId",
      [medicineId],
    )

    if (!medicine) {
      return errorResponse("Medicine not found", 404)
    }

    return successResponse({
      medicineId: medicine[0],
      name: medicine[1],
      form: medicine[2],
      details: medicine[3],
    })
  } catch (error) {
    console.error("[v0] Get medicine error:", error)
    return errorResponse("Failed to fetch medicine", 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = verifyAuth(request)
    if (!user) return forbiddenResponse()

    if (!hasRole(user, "ADMIN")) {
      return forbiddenResponse()
    }

    const medicineId = Number.parseInt(params.id)
    const body = await request.json()
    const { name, form, details } = body

    if (!validateRequired(body, ["name", "form"])) {
      return errorResponse("Medicine name and form are required")
    }

    const medicine = await executeQuerySingle("SELECT MEDICINE_ID FROM MEDICINE WHERE MEDICINE_ID = :medicineId", [
      medicineId,
    ])

    if (!medicine) {
      return errorResponse("Medicine not found", 404)
    }

    // Check for duplicate name (excluding current medicine)
    const duplicate = await executeQuerySingle(
      "SELECT MEDICINE_ID FROM MEDICINE WHERE UPPER(NAME) = UPPER(:name) AND MEDICINE_ID != :medicineId",
      [name, medicineId],
    )

    if (duplicate) {
      return errorResponse("Another medicine with this name already exists", 409)
    }

    await executeQuery(
      `UPDATE MEDICINE
       SET NAME = :name, FORM = :form, DETAILS = :details
       WHERE MEDICINE_ID = :medicineId`,
      [name, form, details || null, medicineId],
    )

    return successResponse({ message: "Medicine updated successfully" })
  } catch (error) {
    console.error("[v0] Update medicine error:", error)
    return errorResponse("Failed to update medicine", 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = verifyAuth(request)
    if (!user) return forbiddenResponse()

    if (!hasRole(user, "ADMIN")) {
      return forbiddenResponse()
    }

    const medicineId = Number.parseInt(params.id)

    const medicine = await executeQuerySingle("SELECT MEDICINE_ID FROM MEDICINE WHERE MEDICINE_ID = :medicineId", [
      medicineId,
    ])

    if (!medicine) {
      return errorResponse("Medicine not found", 404)
    }

    // Check if medicine is in use in prescriptions
    const inUse = await executeQuerySingle(
      "SELECT PRESCRIPTION_ID FROM PRESCRIPTION_MED WHERE MEDICINE_ID = :medicineId",
      [medicineId],
    )

    if (inUse) {
      return errorResponse("Cannot delete medicine that is used in prescriptions", 409)
    }

    await executeQuery("DELETE FROM MEDICINE WHERE MEDICINE_ID = :medicineId", [medicineId])

    return successResponse({ message: "Medicine deleted successfully" })
  } catch (error) {
    console.error("[v0] Delete medicine error:", error)
    return errorResponse("Failed to delete medicine", 500)
  }
}
