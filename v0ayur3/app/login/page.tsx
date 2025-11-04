"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import apiClient from "@/lib/api-client"
import { toast } from "react-toastify"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiClient.post("/auth/login", formData)
      const { token, user } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("role", user.role)

      toast.success("Login successful!")
      // Redirect based on role. If patient but no patientId exists, send to patient registration first.
      if (user.role === "ADMIN") {
        router.push("/admin/dashboard")
      } else if (user.role === "DOCTOR") {
        router.push("/doctor/dashboard")
      } else if (user.role === "PATIENT") {
        if (!user.patientId) {
          router.push("/register/patient")
        } else {
          router.push("/patient/dashboard")
        }
      } else {
        router.push("/")
      }
    } catch (error: any) {
      const message = error.response?.data?.error || "Login failed"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 animate-slide-in">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                HA
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Hospital Appointments</h1>
            <p className="text-slate-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                className="w-full rounded-lg border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all duration-300"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Don't have an account?</span>
            </div>
          </div>

          <Link href="/register">
            <Button
              variant="outline"
              className="w-full bg-slate-50 border-slate-300 text-slate-900 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              Create an Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
