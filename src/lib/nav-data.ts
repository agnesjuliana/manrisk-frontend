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
    items: [
      {
        title: "Profil Instansi",
        url: "/dashboard/organisasi/profil-instansi",
        accessRole: ["RISK_MANAGER", "ADMIN"],
      },
      {
        title: "Konteks Organisasi",
        url: "/dashboard/organisasi/konteks-organisasi",
        accessRole: ["RISK_MANAGER"],
      },
      {
        title: "Kriteria Risiko",
        url: "/dashboard/organisasi/kriteria-risiko",
        accessRole: ["RISK_MANAGER"],
      },
    ],
  },
  {
    title: "Aset",
    url: "/dashboard/aset",
    icon: Package,
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
        url: "/dashboard/risiko/persetujuan-kajian",
        accessRole: ["RISK_MANAGER", "TOP_MANAGEMENT"],
      },
    ],
  },
  {
    title: "Treatment",
    url: "/dashboard/treatment",
    icon: FlaskConical,
    items: [
      {
        title: "Daftar Treatment",
        url: "/dashboard/treatment/daftar-treatment",
        accessRole: ["RISK_MANAGER", "RISK_OWNER"],
      },
      {
        title: "Persetujuan Treatment",
        url: "/dashboard/treatment/persetujuan-treatment",
        accessRole: ["RISK_MANAGER", "TOP_MANAGEMENT"],
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
    items: [
      {
        title: "Daftar Kontrol",
        url: "/dashboard/kontrol/daftar-kontrol",
        accessRole: ["RISK_MANAGER", "RISK_OWNER", "CONTROL_OWNER"],
      },
      {
        title: "SoA",
        url: "/dashboard/kontrol/soa",
        accessRole: ["RISK_MANAGER", "CONTROL_OWNER"],
      },
    ],
  },
  {
    title: "Monitoring",
    url: "/dashboard/monitoring",
    icon: ChartSpline,
    items: [
      {
        title: "Rangkuman Risiko",
        url: "/dashboard/monitoring/rangkuman-risiko",
        accessRole: [
          "RISK_MANAGER",
          "RISK_OWNER",
          "CONTROL_OWNER",
          "TOP_MANAGEMENT",
        ],
      },
      {
        title: "Daftar Tugas",
        url: "/dashboard/monitoring/daftar-tugas",
        accessRole: ["RISK_MANAGER", "RISK_OWNER", "CONTROL_OWNER"],
      },
    ],
  },
]

export default {
  navMain,
}
