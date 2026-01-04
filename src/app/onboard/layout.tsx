"use client"

import { ReactNode } from "react"
import { OnboardProtector } from "./onboard-protector"

export default function OnboardLayout({ children }: { children: ReactNode }) {
  return <OnboardProtector>{children}</OnboardProtector>
}
