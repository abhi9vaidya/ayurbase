"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import apiClient from "@/lib/api-client"
import { toast } from "react-toastify"

export default function NavBar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string>("")

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedRole = localStorage.getItem("role")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setRole(storedRole || "")
    }
  }, [])

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("role")
      toast.success("Logged out successfully")
      router.push("/login")
    } catch (error) {
      toast.error("Logout failed")
    }
  }

  const getDashboardLink = () => {
    switch (role) {
      case "ADMIN":
        return "/admin/dashboard"
      case "DOCTOR":
        return "/doctor/dashboard"
      case "PATIENT":
        return "/patient/dashboard"
      default:
        return "/"
    }
  }

  return (
    <nav className="border-b border-slate-200 bg-white shadow-sm animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              HA
            </div>
            <span className="font-semibold text-slate-900">Hospital Appointments</span>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium text-slate-900">{user.name}</p>
                <p className="text-slate-500 text-xs">{role}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-sm bg-transparent border-slate-300 hover:bg-slate-50 transition-all duration-300"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
