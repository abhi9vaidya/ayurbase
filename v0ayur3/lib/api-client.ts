import axios, { type AxiosInstance, type AxiosError } from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api"

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    try {
      const requestUrl = (error.config && (error.config as any).url) || ""
      if (error.response?.status === 401 && !requestUrl.includes("/auth/login")) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          localStorage.removeItem("role")
          window.location.href = "/login"
        }
      }
    } catch (e) {
      // swallow any unexpected error here to avoid crashing UI on response errors
      console.error("[v0] api-client response interceptor error:", e)
    }
    return Promise.reject(error)
  },
)

export default apiClient
