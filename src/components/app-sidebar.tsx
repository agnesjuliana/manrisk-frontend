"use client";

import * as React from "react";
import { GalleryVerticalEnd } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navMain } from "@/lib/nav-data";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader />
        <SidebarContent />
        <SidebarFooter />
        <SidebarRail />
      </Sidebar>
    );
  }

  const userData = user ? {
    name: user.name,
    email: user.email,
    avatar: "/avatars/default.jpg",
  } : {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/default.jpg",
  };

  const teamsData = [
    {
      name: user?.organization?.name || "ManRisk Org.",
      logo: GalleryVerticalEnd,
      plan: user?.role || "User",
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teamsData} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
