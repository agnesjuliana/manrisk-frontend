"use client"

import { useRouter } from "next/navigation"
import { ProfileForm } from "@/components/profile-form"
import { organizationsApi, authApi } from "@/lib/api"

const USER_CACHE_KEY = "isms:user:cached"

export default function CompanyProfilePage() {
  const router = useRouter()

  const handleSubmitProfile = async () => {
    try {
      console.log("Company profile submitted, fetching /me endpoint...")
      
      // Fetch fresh user data including organization
      const response = await authApi.getProfile()
      console.log("Profile response:", response)
      
      if (response.status && response.data) {
        // Cache user data to localStorage with same key useAuth uses
        const cacheData = {
          data: response.data,
          timestamp: Date.now(),
        }
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData))
        console.log("User data cached:", cacheData)
      }
      
      // Redirect to dashboard
      console.log("Redirecting to dashboard...")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error fetching profile:", error)
      // Still redirect even if fetch fails
      router.push("/dashboard")
    }
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ProfileForm 
          showHeader={true} 
          submitLabel="Lanjut"
          onSubmitProfile={handleSubmitProfile}
        />
      </div>
    </div>
  )
}
