"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export default function AssetApprovalRoutingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get current user from localStorage
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        const role = user.role || "RISK_MANAGER"

        // Route based on role
        if (role === "RISK_MANAGER") {
          router.push("/dashboard/aset/persetujuan-aset/rm-view")
        } else if (role === "TOP_MANAGEMENT") {
          router.push("/dashboard/aset/persetujuan-aset/top-view")
        } else {
          // Default to Risk Manager view
          router.push("/dashboard/aset/persetujuan-aset/rm-view")
        }
      } catch (error) {
        console.error("Failed to parse user:", error)
        // Default to Risk Manager view
        router.push("/dashboard/aset/persetujuan-aset/rm-view")
      }
    } else {
      // No user found, default to Risk Manager view
      router.push("/dashboard/aset/persetujuan-aset/rm-view")
    }

    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return null
}
