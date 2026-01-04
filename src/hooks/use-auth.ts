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
        console.log("useAuth: Checking auth, token exists:", !!token);
        
        // If no token and auth is required, redirect to login
        if (!token) {
          console.log("useAuth: No token found");
          if (options?.requireAuth) {
            console.log("useAuth: Auth required, redirecting to login");
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
              console.log("useAuth: Using cached user data");
            } else {
              console.log("useAuth: Cache expired, will fetch fresh data");
            }
          } catch (e) {
            console.log("useAuth: Invalid cache data");
            // Invalid cache, will fetch fresh data
          }
        }

        if (cachedUser) {
          // Use cached user data
          console.log("useAuth: Setting user from cache");
          setUser(cachedUser)
          setRole(cachedUser.role)
          setIsAuthenticated(true)
          setIsLoading(false)
        } else {
          // Fetch fresh user data from /users/me
          console.log("useAuth: Fetching fresh user data from /me");
          const response = await authApi.getProfile()
          console.log("useAuth: /me response:", response);
          
          if (response.status) {
            console.log("useAuth: Setting user from /me response");
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
            console.log("useAuth: User cached successfully");
            
            setIsLoading(false)
          } else {
            console.log("useAuth: /me response status false");
            setIsLoading(false)
          }
        }
      } catch (error) {
        console.error("useAuth: Error in checkAuth:", error);
        // Token is invalid or expired
        localStorage.removeItem("token")
        localStorage.removeItem(USER_CACHE_KEY)
        
        // Always set loading to false on error
        setIsLoading(false)
        
        // Only redirect if auth is required
        if (options?.requireAuth) {
          console.log("useAuth: Auth required but error, redirecting to login");
          router.push("/auth/login")
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
