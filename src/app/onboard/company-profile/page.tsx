"use client"

import { ProfileForm } from "@/components/profile-form"

export default function SignupPage() {
  function handleSubmit(values: any) {
    // TODO: submit onboarding values to API
    console.log("onboard submit", values)
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ProfileForm onSubmitProfile={handleSubmit} submitLabel="Lanjut" />
      </div>
    </div>
  )
}
