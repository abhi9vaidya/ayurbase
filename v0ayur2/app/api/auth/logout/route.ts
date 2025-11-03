import type { NextRequest } from "next/server"
import { successResponse } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    return successResponse({
      message: "Logout successful",
    })
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return successResponse({
      message: "Logout successful",
    })
  }
}
