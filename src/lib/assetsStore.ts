export type Asset = {
  id: string;
  name: string;
  type: string;
  classification: string;
  ownerId?: string;
  location?: string;
  processes?: string[];
};

const STORAGE_KEY = "isms:assets:v1";

const DEFAULT_ASSETS: Asset[] = [
  {
    id: "asset-1",
    name: "Server Database Utama",
    type: "hardware",
    classification: "rahasia",
    ownerId: "u-1",
    location: "Data Center A",
    processes: ["Pembayaran", "Rekonsiliasi"],
  },
  {
    id: "asset-2",
    name: "Aplikasi HR",
    type: "software",
    classification: "internal",
    ownerId: "u-2",
    location: "Cloud Provider - us-east-1",
    processes: ["Penggajian", "Manajemen Karyawan"],
  },
  {
    id: "asset-3",
    name: "File Backup Finance",
    type: "data",
    classification: "rahasia",
    ownerId: undefined,
    location: "Offsite Backup",
    processes: ["Audit", "Pelaporan"],
  },
];

export function loadAssets(): Asset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ASSETS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    return DEFAULT_ASSETS;
  }
}

export function saveAssets(assets: Asset[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  } catch (e) {
    // ignore
  }
}
