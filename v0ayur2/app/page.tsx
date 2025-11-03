"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (token) {
      if (role === "ADMIN") router.push("/admin/dashboard")
      else if (role === "DOCTOR") router.push("/doctor/dashboard")
      else if (role === "PATIENT") router.push("/patient/dashboard")
    } else {
      router.push("/login")
    }
  }, [router])

  return null
}
