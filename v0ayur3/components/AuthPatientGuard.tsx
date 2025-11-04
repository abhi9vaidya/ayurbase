"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function AuthPatientGuard() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    try {
      const userRaw = localStorage.getItem("user")
      if (!userRaw) return
      const user = JSON.parse(userRaw)
      // Only enforce for PATIENT role
      if (user?.role === "PATIENT" && !user?.patientId) {
        const allowed = ["/register", "/register/patient", "/login"]
        const isAllowed = allowed.includes(pathname)
        const isApi = pathname?.startsWith("/api")
        const isStatic = pathname?.startsWith("/_next") || pathname === "/favicon.ico"
        if (!isAllowed && !isApi && !isStatic) {
          router.push("/register/patient")
        }
      }
    } catch (err) {
      // ignore JSON parse errors
    }
  }, [pathname, router])

  return null
}
