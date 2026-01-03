import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"

const USER_CACHE_KEY = "isms:user:cached"
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

export function useAuth(options?: { requireAuth?: boolean }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        
        // If no token and auth is required, redirect to login
        if (!token) {
          if (options?.requireAuth) {
            router.push("/auth/login")
          }
          setIsLoading(false)
          return
        }

        // Check if we have cached user data
        const cachedUserStr = localStorage.getItem(USER_CACHE_KEY)
        let cachedUser = null
        
        if (cachedUserStr) {
          try {
            const { data, timestamp } = JSON.parse(cachedUserStr)
            // Use cache if still valid (within CACHE_DURATION)
            if (Date.now() - timestamp < CACHE_DURATION) {
              cachedUser = data
            }
          } catch (e) {
            // Invalid cache, will fetch fresh data
          }
        }

        if (cachedUser) {
          // Use cached user data
          setUser(cachedUser)
          setRole(cachedUser.role)
          setIsAuthenticated(true)
          setIsLoading(false)
        } else {
          // Fetch fresh user data from /users/me
          const response = await authApi.getProfile()
          
          if (response.status) {
            setUser(response.data)
            setRole(response.data.role)
            setIsAuthenticated(true)
            
            // Cache the user data
            localStorage.setItem(
              USER_CACHE_KEY,
              JSON.stringify({
                data: response.data,
                timestamp: Date.now(),
              })
            )
            
            setIsLoading(false)
          }
        }
      } catch (error) {
        // Token is invalid or expired
        localStorage.removeItem("token")
        localStorage.removeItem(USER_CACHE_KEY)
        
        // Only redirect if auth is required
        if (options?.requireAuth) {
          router.push("/auth/login")
        } else {
          setIsLoading(false)
        }
      }
    }

    checkAuth()
  }, [router, options?.requireAuth])

  const logout = () => {
    authApi.logout()
    setIsAuthenticated(false)
    setUser(null)
    setRole(null)
    localStorage.removeItem(USER_CACHE_KEY)
  }

  // Clear cache when user explicitly logs out
  const clearCache = () => {
    localStorage.removeItem(USER_CACHE_KEY)
  }

  return { isLoading, isAuthenticated, user, role, logout, clearCache }
}

export default useAuth
