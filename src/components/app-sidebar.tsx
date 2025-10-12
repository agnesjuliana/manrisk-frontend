"use client";

import * as React from "react";
import {
  Building,
  ChartSpline,
  FlaskConical,
  GalleryVerticalEnd,
  Package,
  PieChart,
  ShieldAlert,
  UserCog,
} from "lucide-react";

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
import { title } from "process";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "ManRisk Org.",
      logo: GalleryVerticalEnd,
      plan: "Agnes - Role",
    },
  ],
  navMain: [
    {
      title: "Manajemen User",
      url: "#",
      icon: UserCog,
      isActive: true,
      items: [
        {
          title: "Divisi & Hak Akses",
          url: "#",
          accessRole: ["ADMIN"],
        },
        {
          title: "Daftar Pengguna",
          url: "#",
          accessRole: ["ADMIN"],
        },
      ],
    },
    {
      title: "Organisasi",
      url: "#",
      icon: Building,
      items: [
        {
          title: "Profil Instansi",
          url: "#",
          accessRole: ["RISK_MANAGER", "ADMIN"],
        },
        {
          title: "Konteks Organisasi",
          url: "#",
          accessRole: ["RISK_MANAGER"],
        },
        {
          title: "Kriteria Risiko",
          url: "#",
          accessRole: ["RISK_MANAGER"],
        },
      ],
    },
    {
      title: "Aset",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Daftar Aset",
          url: "#",
          accessRole: ["RISK_MANAGER", "RISK_OWNER"],
        },
        {
          title: "Persetujuan Aset",
          url: "#",
          accessRole: ["RISK_MANAGER"],
        },
      ],
    },
    {
      title: "Risiko",
      url: "#",
      icon: ShieldAlert,
      items: [
        {
          title: "Daftar Risiko",
          url: "#",
          accessRole: ["RISK_MANAGER", "RISK_OWNER"],
        },
        {
          title: "Prioritas Risiko",
          url: "#",
          accessRole: ["RISK_MANAGER", "RISK_OWNER"],
        },
        {
          title: "Persetujuan Kajian",
          url: "#",
          accessRole: ["RISK_MANAGER", "TOP_MANAGEMENT"],
        },
      ],
    },
    {
      title: "Treatment",
      url: "#",
      icon: FlaskConical,
      items: [
        {
          title: "Daftar Treatment",
          url: "#",
          accessRole: ["RISK_MANAGER", "RISK_OWNER"],
        },
        {
          title: "Persetujuan Treatment",
          url: "#",
          accessRole: ["RISK_MANAGER", "TOP_MANAGEMENT"],
        },
        {
          title: "Residu Risiko",
          url: "#",
          accessRole: ["RISK_MANAGER"],
        },
      ],
    },
    {
      title: "Kontrol & SoA",
      url: "#",
      icon: PieChart,
      items: [
        {
          title: "Daftar Kontrol",
          url: "#",
          accessRole: ["RISK_MANAGER", "RISK_OWNER", "CONTROL_OWNER"],
        },
        {
          title: "SoA",
          url: "#",
          accessRole: ["RISK_MANAGER", "CONTROL_OWNER"],
        },
      ],
    },
    {
      title: "Monitoring",
      url: "#",
      icon: ChartSpline,
      items: [
        {
          title: "Rangkuman Risiko",
          url: "#",
          accessRole: [
            "RISK_MANAGER",
            "RISK_OWNER",
            "CONTROL_OWNER",
            "TOP_MANAGEMENT",
          ],
        },
        {
          title: "Daftar Tugas",
          url: "#",
          accessRole: ["RISK_MANAGER", "RISK_OWNER", "CONTROL_OWNER"],
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
