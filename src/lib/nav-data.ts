import {
  Building,
  ChartSpline,
  FlaskConical,
  GalleryVerticalEnd,
  Package,
  PieChart,
  ShieldAlert,
  UserCog,
} from "lucide-react"

export const navMain = [
  {
    title: "Manajemen User",
    url: "/dashboard/user",
    icon: UserCog,
    isActive: true,
    accessRole: ["ADMIN"],
    items: [
      {
        title: "Divisi & Hak Akses",
        url: "/dashboard/user/access",
        accessRole: ["ADMIN"],
      },
      {
        title: "Daftar Pengguna",
        url: "/dashboard/user/registry",
        accessRole: ["ADMIN"],
      },
    ],
  },
  {
    title: "Organisasi",
    url: "/dashboard/organisasi",
    icon: Building,
    accessRole: ["ADMIN", "RISK_MANAGER", "RISK_OWNER"],
    items: [
      {
        title: "Konteks Organisasi",
        url: "/dashboard/organisasi/konteks-organisasi",
        accessRole: ["ADMIN", "RISK_MANAGER", "RISK_OWNER"],
        isViewOnly: ["RISK_OWNER"],
      },
      {
        title: "Kriteria Risiko",
        url: "/dashboard/organisasi/kriteria-risiko",
        accessRole: ["ADMIN", "RISK_MANAGER", "RISK_OWNER"],
        isViewOnly: ["RISK_OWNER"],
      },
    ],
  },
  {
    title: "Aset",
    url: "/dashboard/aset",
    icon: Package,
    accessRole: ["RISK_MANAGER", "RISK_OWNER"],
    items: [
      {
        title: "Daftar Aset",
        url: "/dashboard/aset/daftar-aset",
        accessRole: ["RISK_MANAGER", "RISK_OWNER"],
      },
      {
        title: "Persetujuan Aset",
        url: "/dashboard/aset/persetujuan-aset",
        accessRole: ["RISK_MANAGER"],
      },
    ],
  },
  {
    title: "Risiko",
    url: "/dashboard/risiko",
    icon: ShieldAlert,
    accessRole: ["RISK_MANAGER", "RISK_OWNER"],
    items: [
      {
        title: "Daftar Risiko",
        url: "/dashboard/risiko/daftar-risiko",
        accessRole: ["RISK_MANAGER", "RISK_OWNER"],
      },
      {
        title: "Prioritas Risiko",
        url: "/dashboard/risiko/prioritas-risiko",
        accessRole: ["RISK_MANAGER", "RISK_OWNER"],
      },
      {
        title: "Persetujuan Kajian",
        url: "/dashboard/risiko/persetujuan-risiko/rm-view",
        accessRole: ["RISK_MANAGER"],
      },
    ],
  },
  {
    title: "Treatment",
    url: "/dashboard/treatment",
    icon: FlaskConical,
    accessRole: ["RISK_MANAGER", "RISK_OWNER"],
    items: [
      {
        title: "Daftar Treatment",
        url: "/dashboard/treatment/daftar-treatment",
        accessRole: ["RISK_MANAGER", "RISK_OWNER"],
      },
      {
        title: "Persetujuan Treatment",
        url: "/dashboard/treatment/persetujuan-treatment",
        accessRole: ["RISK_MANAGER"],
      },
      {
        title: "Residu Risiko",
        url: "/dashboard/treatment/residu-risiko",
        accessRole: ["RISK_MANAGER"],
      },
    ],
  },
  {
    title: "Kontrol & SoA",
    url: "/dashboard/kontrol",
    icon: PieChart,
    accessRole: ["RISK_MANAGER", "RISK_OWNER"],
    items: [
      {
        title: "Daftar Kontrol",
        url: "/dashboard/kontrol/daftar-kontrol",
        accessRole: ["RISK_MANAGER", "RISK_OWNER"],
        isViewOnly: ["RISK_OWNER"],
      },
      {
        title: "SoA",
        url: "/dashboard/kontrol/soa",
        accessRole: ["RISK_MANAGER", "RISK_OWNER"],
        isViewOnly: ["RISK_OWNER"],
      },
    ],
  },
  {
    title: "Monitoring",
    url: "/dashboard/monitoring",
    icon: ChartSpline,
    accessRole: ["RISK_MANAGER", "RISK_OWNER"],
    items: [
      {
        title: "Rangkuman Risiko",
        url: "/dashboard/monitoring/rangkuman-risiko",
        accessRole: ["RISK_MANAGER", "RISK_OWNER"],
      },
      {
        title: "Daftar Tugas",
        url: "/dashboard/monitoring/daftar-tugas",
        accessRole: ["RISK_MANAGER", "RISK_OWNER"],
      },
    ],
  },
]

export default {
  navMain,
}
