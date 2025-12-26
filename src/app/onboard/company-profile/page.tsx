"use client"

import { useAuth } from "@/hooks/use-auth"
import { ProfileForm } from "@/components/profile-form"

export default function CompanyProfilePage() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="w-full max-w-sm">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect via useAuth hook
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ProfileForm showHeader={true} submitLabel="Lanjut" />
      </div>
    </div>
  )
}
