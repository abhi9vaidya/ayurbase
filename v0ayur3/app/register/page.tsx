"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import apiClient from "@/lib/api-client"
import { toast } from "react-toastify"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNo: "",
    role: "PATIENT",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...submitData } = formData
      const response = await apiClient.post("/auth/register", submitData)
      const { token, user } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("role", user.role)

  toast.success("Registration successful!")
  // After creating the user, send them to the patient details step
  router.push("/register/patient")
    } catch (error: any) {
      const message = error.response?.data?.error || "Registration failed"
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
            <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
            <p className="text-slate-600">Register to book appointments</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full rounded-lg border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400"
              />
            </div>

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
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <Input
                type="tel"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                placeholder="+91-9876543210"
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
                placeholder="At least 8 characters"
                required
                className="w-full rounded-lg border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                className="w-full rounded-lg border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all duration-300"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
