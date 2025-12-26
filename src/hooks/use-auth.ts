import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"

export function useAuth() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        
        // If no token, redirect to login
        if (!token) {
          router.push("/auth/login")
          return
        }

        // Verify token by calling /users/me
        const response = await authApi.getProfile()
        
        if (response.status) {
          setIsAuthenticated(true)
          setIsLoading(false)
        }
      } catch (error) {
        // Token is invalid or expired, redirect to login
        localStorage.removeItem("token")
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [router])

  return { isLoading, isAuthenticated }
}

export default useAuth
