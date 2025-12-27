export enum AssetStatus {
  DRAFT = "DRAFT",
  MENUNGGU_PERSETUJUAN_RM = "MENUNGGU PERSETUJUAN_RM",
  MENUNGGU_PERSETUJUAN_FINAL = "MENUNGGU PERSETUJUAN_FINAL",
  REVISI = "REVISI",
  DISETUJUI = "DISETUJUI",
  DITOLAK = "DITOLAK",
}

export type Asset = {
  id: string;
  name: string;
  type: string;
  classification: string;
  ownerId?: string;
  location?: string;
  processes?: string[];
  status?: AssetStatus;
};

const STORAGE_KEY = "isms:assets:v1";

const DEFAULT_ASSETS: Asset[] = [];

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
