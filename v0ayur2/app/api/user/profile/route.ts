import type { NextRequest } from "next/server"
import { executeQuerySingle } from "@/lib/db"
import { verifyAuth, unauthorizedResponse, successResponse, errorResponse } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) return unauthorizedResponse()

    const userProfile = await executeQuerySingle(
      "SELECT USER_ID, NAME, EMAIL, ROLE, CONTACT_NO, CREATED_ON FROM USERS WHERE USER_ID = :userId",
      [user.userId],
    )

    if (!userProfile) {
      return errorResponse("User not found", 404)
    }

    return successResponse({
      userId: userProfile[0],
      name: userProfile[1],
      email: userProfile[2],
      role: userProfile[3],
      contactNo: userProfile[4],
      createdOn: userProfile[5],
    })
  } catch (error) {
    console.error("[v0] Get profile error:", error)
    return errorResponse("Failed to get profile", 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) return unauthorizedResponse()

    const body = await request.json()
    const { name, contactNo } = body

    if (name) {
      await executeQuerySingle("UPDATE USERS SET NAME = :name WHERE USER_ID = :userId", [name, user.userId])
    }

    if (contactNo) {
      await executeQuerySingle("UPDATE USERS SET CONTACT_NO = :contactNo WHERE USER_ID = :userId", [
        contactNo,
        user.userId,
      ])
    }

    const updatedProfile = await executeQuerySingle(
      "SELECT USER_ID, NAME, EMAIL, ROLE, CONTACT_NO FROM USERS WHERE USER_ID = :userId",
      [user.userId],
    )

    return successResponse({
      message: "Profile updated successfully",
      user: {
        userId: updatedProfile[0],
        name: updatedProfile[1],
        email: updatedProfile[2],
        role: updatedProfile[3],
        contactNo: updatedProfile[4],
      },
    })
  } catch (error) {
    console.error("[v0] Update profile error:", error)
    return errorResponse("Failed to update profile", 500)
  }
}
