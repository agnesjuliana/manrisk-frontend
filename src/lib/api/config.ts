import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if we're on an auth page (login/register)
      const currentPath = typeof window !== "undefined" ? window.location.pathname : ""
      const isAuthPage = currentPath.includes("/auth/")

      // Only redirect to login if NOT already on an auth page
      // This allows login/register forms to handle 401 errors themselves
      if (!isAuthPage && typeof window !== "undefined") {
        localStorage.removeItem("token")
        window.location.href = "/auth/login"
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
