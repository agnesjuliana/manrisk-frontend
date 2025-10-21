export type TreatmentOption = "Mitigate" | "Accept" | "Avoid" | "Transfer";

export type Treatment = {
  id: string; // T001
  riskId: string; // linked risk id
  option: TreatmentOption;
  target?: { likelihood?: number; impact?: number };
  reason?: string;
  controls?: string[]; // Annex A control codes or ids
  controlJustification?: string;
  createdAt: string;
  updatedAt?: string;
  status: "NOT_SET" | "SET";
};

const STORAGE_KEY = "isms:treatments:v1";

const DEFAULT_TREATMENTS: Treatment[] = [];

export function loadTreatments(): Treatment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TREATMENTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_TREATMENTS;
    return parsed;
  } catch (e) {
    return DEFAULT_TREATMENTS;
  }
}

export function saveTreatments(items: Treatment[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    // ignore
  }
}

export function nextTreatmentId(existing: Treatment[]) {
  const max = existing.reduce((acc, t) => {
    const n = parseInt(t.id.replace(/^T/, ""), 10);
    return isNaN(n) ? acc : Math.max(acc, n);
  }, 0);
  return `T${String(max + 1).padStart(3, "0")}`;
}
