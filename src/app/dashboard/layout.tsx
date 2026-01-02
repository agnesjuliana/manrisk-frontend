import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import Breadcrumbs from "@/components/breadcrumbs"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-visible">
        <header className="sticky top-0 z-40 flex h-16 items-center bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumbs />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto pt-4 bg-gradient-to-b from-sky-100/50 via-white to-white">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
