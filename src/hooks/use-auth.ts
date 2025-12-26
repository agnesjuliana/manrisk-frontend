import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"

export function useAuth() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)

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
          setUser(response.data)
          setRole(response.data.role)
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

  const logout = () => {
    authApi.logout()
    setIsAuthenticated(false)
    setUser(null)
    setRole(null)
  }

  return { isLoading, isAuthenticated, user, role, logout }
}

export default useAuth
