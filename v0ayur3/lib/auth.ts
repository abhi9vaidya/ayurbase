import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { type NextRequest, NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "hospital-secret-key-change-in-production"
const JWT_EXPIRY = "24h"

export interface TokenPayload {
  userId: number
  email: string
  role: "ADMIN" | "DOCTOR" | "PATIENT"
  name?: string
  doctorId?: number
  patientId?: number
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  return null
}

export function verifyAuth(request: NextRequest): TokenPayload | null {
  const token = extractToken(request)
  if (!token) return null
  return verifyToken(token)
}

export function hasRole(user: TokenPayload | null, ...roles: string[]): boolean {
  return user ? roles.includes(user.role) : false
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

export function successResponse(data: any, status = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}
