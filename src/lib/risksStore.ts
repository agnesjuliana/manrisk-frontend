export enum RiskStatus {
  DRAFT = "DRAFT",
  MENUNGGU_PERSETUJUAN_RM = "MENUNGGU_PERSETUJUAN_RM",
  DISETUJUI_RM = "DISETUJUI_RM",
  MENUNGGU_PERSETUJUAN_FINAL = "MENUNGGU_PERSETUJUAN_FINAL",
  REVISI = "REVISI",
  DISETUJUI = "DISETUJUI",
  DITOLAK = "DITOLAK",
}

export enum RiskApprovalTLStatus {
  MENUNGGU_PERSETUJUAN_FINAL = "MENUNGGU_PERSETUJUAN_FINAL",
  DITOLAK = "DITOLAK",
  DISETUJUI = "DISETUJUI",
}

export type Cia = "Confidentiality" | "Integrity" | "Availability";

export type Risk = {
  id: string;
  category: string;
  vulnerability: string;
  threat: string;
  identifiedRisk: string;
  source: string;
  cia: Cia[];
  unit?: string;
  ownerId?: string;
  identifiedAt: string;
  status: RiskStatus;
  notes?: string;
  severity: number;
  likelihood: number;
  detection?: number;
  priority?: "High" | "Medium" | "Low";
  assetId?: string;
  contextId?: string;
};

const STORAGE_KEY = "isms:risks:v1";

const DEFAULT_RISKS: Risk[] = [
  {
    id: "R001",
    category: "Operational",
    vulnerability: "Sistem cadangan belum diuji",
    threat: "Kegagalan hardware",
    identifiedRisk: "Downtime layanan utama",
    source: "Internal",
    cia: ["Availability"],
    unit: "IT",
    ownerId: "u-2",
    identifiedAt: new Date().toISOString(),
    status: "DRAFT",
    notes: "Perlu uji pemulihan",
    severity: 4,
    likelihood: 3,
    detection: 3,
    priority: "High",
  },
  {
    id: "R002",
    category: "Data Privacy",
    vulnerability: "Enkripsi lemah",
    threat: "Pencurian data",
    identifiedRisk: "Kebocoran data sensitif",
    source: "External",
    cia: ["Confidentiality"],
    unit: "Security",
    ownerId: "u-1",
    identifiedAt: new Date().toISOString(),
    status: "SUBMITTED",
    notes: "Audit sedang berlangsung",
    severity: 5,
    likelihood: 2,
    detection: 2,
    priority: "High",
  },
];

export function loadRisks(): Risk[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_RISKS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_RISKS;
    return parsed;
  } catch (e) {
    return DEFAULT_RISKS;
  }
}

export function saveRisks(risks: Risk[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(risks));
  } catch (e) {
    // ignore
  }
}
