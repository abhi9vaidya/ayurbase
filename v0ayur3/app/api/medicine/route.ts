import type { NextRequest } from "next/server"
import { executeQuery, executeQuerySingle } from "@/lib/db"
import {
  successResponse,
  errorResponse,
  verifyAuth,
  forbiddenResponse,
  hasRole,
  unauthorizedResponse,
} from "@/lib/auth"
import { validateRequired } from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""

    let query = "SELECT MEDICINE_ID, NAME, FORM, DETAILS FROM MEDICINE"
    let params: any[] = []

    if (search.trim()) {
      query += " WHERE UPPER(NAME) LIKE UPPER(:search)"
      params = [`%${search}%`]
    }

    query += " ORDER BY NAME ASC"

    const result = await executeQuery(query, params)
    const medicines =
      result.rows?.map((row) => ({
        medicineId: row[0],
        name: row[1],
        form: row[2],
        details: row[3],
      })) || []

    return successResponse({ medicines, total: medicines.length })
  } catch (error) {
    console.error("[v0] Get medicines error:", error)
    return errorResponse("Failed to fetch medicines", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) return unauthorizedResponse()

    if (!hasRole(user, "ADMIN")) {
      return forbiddenResponse()
    }

    const body = await request.json()
    const { name, form, details } = body

    if (!validateRequired(body, ["name", "form"])) {
      return errorResponse("Medicine name and form are required")
    }

    // Check for duplicate medicine
    const existing = await executeQuerySingle("SELECT MEDICINE_ID FROM MEDICINE WHERE UPPER(NAME) = UPPER(:name)", [
      name,
    ])

    if (existing) {
      return errorResponse("Medicine with this name already exists", 409)
    }

    await executeQuery(
      `INSERT INTO MEDICINE (NAME, FORM, DETAILS)
       VALUES (:name, :form, :details)`,
      [name, form, details || null],
    )

    return successResponse({ message: "Medicine created successfully" }, 201)
  } catch (error) {
    console.error("[v0] Create medicine error:", error)
    return errorResponse("Failed to create medicine", 500)
  }
}
