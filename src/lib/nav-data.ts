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
    accessRole: ["ADMIN", "RISK_MANAGER", "RISK_OWNER", "TOP_MANAGEMENT"],
    items: [
      {
        title: "Konteks Organisasi",
        url: "/dashboard/organisasi/konteks-organisasi",
        accessRole: ["ADMIN", "RISK_MANAGER", "RISK_OWNER", "TOP_MANAGEMENT"],
        isViewOnly: ["RISK_OWNER", "TOP_MANAGEMENT"],
      },
      {
        title: "Kriteria Risiko",
        url: "/dashboard/organisasi/kriteria-risiko",
        accessRole: ["ADMIN", "RISK_MANAGER", "RISK_OWNER", "TOP_MANAGEMENT"],
        isViewOnly: ["RISK_OWNER", "TOP_MANAGEMENT"],
      },
    ],
  },
  {
    title: "Aset",
    url: "/dashboard/aset",
    icon: Package,
    accessRole: ["RISK_MANAGER", "RISK_OWNER", "TOP_MANAGEMENT"],
    items: [
      {
        title: "Daftar Aset",
        url: "/dashboard/aset/daftar-aset",
        accessRole: ["RISK_MANAGER", "RISK_OWNER", "TOP_MANAGEMENT"],
        isViewOnly: ["TOP_MANAGEMENT"],
      },
      {
        title: "Persetujuan Aset",
        url: "/dashboard/aset/persetujuan-aset",
        accessRole: ["RISK_MANAGER", "TOP_MANAGEMENT"],
      },
    ],
  },
  {
    title: "Risiko",
    url: "/dashboard/risiko",
    icon: ShieldAlert,
    accessRole: ["RISK_MANAGER", "RISK_OWNER", "TOP_MANAGEMENT"],
    items: [
      {
        title: "Daftar Risiko",
        url: "/dashboard/risiko/daftar-risiko",
        accessRole: ["RISK_MANAGER", "RISK_OWNER", "TOP_MANAGEMENT"],
        isViewOnly: ["TOP_MANAGEMENT"],
      },
      {
        title: "Prioritas Risiko",
        url: "/dashboard/risiko/prioritas-risiko",
        accessRole: ["RISK_MANAGER", "RISK_OWNER", "TOP_MANAGEMENT"],
      },
      {
        title: "Persetujuan Kajian",
        url: "/dashboard/risiko/persetujuan-risiko",
        accessRole: ["RISK_MANAGER", "TOP_MANAGEMENT"],
      },
    ],
  },
  {
    title: "Treatment",
    url: "/dashboard/treatment",
    icon: FlaskConical,
    accessRole: ["RISK_MANAGER", "RISK_OWNER", "TOP_MANAGEMENT"],
    items: [
      {
        title: "Daftar Treatment",
        url: "/dashboard/treatment/daftar-treatment",
        accessRole: ["RISK_MANAGER", "RISK_OWNER", "TOP_MANAGEMENT"],
      },
      {
        title: "Residu Risiko",
        url: "/dashboard/treatment/residu-risiko",
        accessRole: ["RISK_MANAGER", "TOP_MANAGEMENT"],
      },
    ],
  },
  {
    title: "Kontrol & SoA",
    url: "/dashboard/kontrol",
    icon: PieChart,
    accessRole: ["RISK_MANAGER", "RISK_OWNER", "TOP_MANAGEMENT"],
    items: [
      {
        title: "Daftar Kontrol",
        url: "/dashboard/kontrol/daftar-kontrol",
        accessRole: ["RISK_MANAGER", "RISK_OWNER", "TOP_MANAGEMENT"],
        isViewOnly: ["RISK_OWNER", "TOP_MANAGEMENT"],
      },
      {
        title: "Implementasi Kontrol",
        url: "/dashboard/kontrol/soa",
        accessRole: ["RISK_MANAGER", "RISK_OWNER", "TOP_MANAGEMENT"],
        isViewOnly: ["RISK_OWNER", "TOP_MANAGEMENT"],
      },
    ],
  },
  {
    title: "Monitoring",
    url: "/dashboard/monitoring",
    icon: ChartSpline,
    accessRole: ["RISK_MANAGER", "RISK_OWNER", "TOP_MANAGEMENT"],
    items: [
      {
        title: "Rangkuman Risiko",
        url: "/dashboard/monitoring/rangkuman-risiko",
        accessRole: ["RISK_MANAGER", "RISK_OWNER", "TOP_MANAGEMENT"],
      },
      {
        title: "Daftar Tugas",
        url: "/dashboard/monitoring/daftar-tugas",
        accessRole: ["RISK_MANAGER", "RISK_OWNER", "TOP_MANAGEMENT"],
      },
    ],
  },
]

export default {
  navMain,
}
