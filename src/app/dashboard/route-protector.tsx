"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export function RouteProtector({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isLoading, user } = useAuth({ requireAuth: true })

  useEffect(() => {
    // Wait for auth check to complete
    if (!isLoading) {
      // No user or not authenticated
      if (!user) {
        console.log("RouteProtector: No user, redirecting to login")
        router.push("/auth/login")
        return
      }

      // User authenticated but no organization data - redirect to onboard
      if (!user.organization) {
        console.log("RouteProtector: User has no organization, redirecting to onboard")
        router.push("/onboard/welcome")
        return
      }

      console.log("RouteProtector: User authenticated with organization, allowing access")
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !user.organization) {
    return null
  }

  return <>{children}</>
}
