/**
 * Controls Store
 * Manages implementation tracking of controls derived from treatments
 * ISO 27005 Phase 8: Control Implementation & SoA
 */

export type ImplementationStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "IMPLEMENTED"
  | "TESTING"
  | "VERIFIED";

export type Control = {
  id: string; // C001, C002, etc.
  name: string;
  description: string;
  treatmentId?: string; // Link to treatment that defined this control
  treatmentOption?: string; // MITIGATE, ACCEPT, AVOID, TRANSFER
  owner?: string; // Implementation owner (user ID)
  targetDate?: string; // ISO date string
  implementationStatus: ImplementationStatus;
  evidence?: string[]; // Evidence URLs, file names, or references
  effectivenessRating?: number; // 1-5 rating
  remarks?: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "isms:controls:v1";

// Mock controls linked to treatments
const DEFAULT_CONTROLS: Control[] = [
  {
    id: "C001",
    name: "Implementasi Backup Otomatis",
    description:
      "Backup sistem otomatis setiap hari ke lokasi terpisah dengan retention 30 hari",
    treatmentId: "T001",
    treatmentOption: "MITIGATE",
    owner: "u-2",
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    implementationStatus: "IN_PROGRESS",
    evidence: ["backup_policy_v2.pdf", "test_restore_20250110.log"],
    effectivenessRating: 4,
    remarks: "Fase implementasi server dengan 90% completion",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "C002",
    name: "Enkripsi Data End-to-End",
    description: "Implementasi enkripsi AES-256 untuk semua data sensitif di transit",
    treatmentId: "T002",
    treatmentOption: "MITIGATE",
    owner: "u-2",
    targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    implementationStatus: "PLANNED",
    evidence: [],
    remarks: "Sedang menunggu approval budget infrastruktur",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "C003",
    name: "Audit Log & Monitoring",
    description: "Implementasi sistem audit log terpusat dengan real-time monitoring",
    treatmentId: "T001",
    treatmentOption: "MITIGATE",
    owner: "u-3",
    targetDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    implementationStatus: "TESTING",
    evidence: ["audit_system_v1.yaml", "monitoring_dashboard_screenshot.png"],
    effectivenessRating: 3,
    remarks: "Fase testing dengan 5 sample events, ready untuk UAT",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "C004",
    name: "Access Control Matrix",
    description: "Definisi dan implementasi RBAC dengan principle of least privilege",
    treatmentId: "T003",
    treatmentOption: "MITIGATE",
    owner: "u-3",
    targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    implementationStatus: "PLANNED",
    evidence: [],
    remarks: "Menunggu approval dari Security Lead",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "C005",
    name: "Disaster Recovery Plan",
    description:
      "Dokumentasi dan testing regular DRP dengan target RTO 4 jam, RPO 1 jam",
    treatmentId: "T004",
    treatmentOption: "MITIGATE",
    owner: "u-2",
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    implementationStatus: "PLANNED",
    evidence: [],
    effectivenessRating: 5,
    remarks: "Comprehensive plan but needs quarterly drills",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Load all controls from localStorage
 */
export function loadControls(): Control[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading controls:", error);
  }

  // Return default controls on first load
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONTROLS));
  return DEFAULT_CONTROLS;
}

/**
 * Save controls to localStorage
 */
export function saveControls(controls: Control[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(controls));
  } catch (error) {
    console.error("Error saving controls:", error);
  }
}

/**
 * Get next control ID (e.g., C001 -> C002)
 */
export function nextControlId(): string {
  const controls = loadControls();
  if (controls.length === 0) return "C001";

  const ids = controls.map((c) => parseInt(c.id.substring(1), 10));
  const maxId = Math.max(...ids);
  return `C${String(maxId + 1).padStart(3, "0")}`;
}

/**
 * Add a new control
 */
export function addControl(control: Omit<Control, "id" | "createdAt" | "updatedAt">): Control {
  const controls = loadControls();
  const newControl: Control = {
    ...control,
    id: nextControlId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  controls.push(newControl);
  saveControls(controls);
  return newControl;
}

/**
 * Update an existing control
 */
export function updateControl(id: string, updates: Partial<Control>): Control | null {
  const controls = loadControls();
  const index = controls.findIndex((c) => c.id === id);

  if (index === -1) return null;

  const updated: Control = {
    ...controls[index],
    ...updates,
    id: controls[index].id, // Preserve ID
    createdAt: controls[index].createdAt, // Preserve creation time
    updatedAt: new Date().toISOString(),
  };

  controls[index] = updated;
  saveControls(controls);
  return updated;
}

/**
 * Delete a control
 */
export function deleteControl(id: string): boolean {
  const controls = loadControls();
  const filtered = controls.filter((c) => c.id !== id);

  if (filtered.length === controls.length) return false;

  saveControls(filtered);
  return true;
}

/**
 * Get control by ID
 */
export function getControl(id: string): Control | null {
  const controls = loadControls();
  return controls.find((c) => c.id === id) || null;
}

/**
 * Get controls by treatment ID
 */
export function getControlsByTreatmentId(treatmentId: string): Control[] {
  const controls = loadControls();
  return controls.filter((c) => c.treatmentId === treatmentId);
}

/**
 * Get controls by implementation status
 */
export function getControlsByStatus(status: ImplementationStatus): Control[] {
  const controls = loadControls();
  return controls.filter((c) => c.implementationStatus === status);
}

/**
 * Calculate implementation progress statistics
 */
export function getImplementationStats() {
  const controls = loadControls();

  const total = controls.length;
  const planned = controls.filter((c) => c.implementationStatus === "PLANNED").length;
  const inProgress = controls.filter((c) => c.implementationStatus === "IN_PROGRESS").length;
  const implemented = controls.filter((c) => c.implementationStatus === "IMPLEMENTED").length;
  const testing = controls.filter((c) => c.implementationStatus === "TESTING").length;
  const verified = controls.filter((c) => c.implementationStatus === "VERIFIED").length;

  const progressPercentage =
    total > 0
      ? Math.round(
          ((implemented + testing + verified + inProgress * 0.5) / total) * 100
        )
      : 0;

  const avgEffectiveness =
    controls.length > 0
      ? Math.round(
          (controls.reduce((sum, c) => sum + (c.effectivenessRating || 0), 0) /
            controls.filter((c) => c.effectivenessRating).length) *
            10
        ) / 10
      : 0;

  return {
    total,
    planned,
    inProgress,
    implemented,
    testing,
    verified,
    progressPercentage,
    avgEffectiveness,
  };
}

/**
 * Get overdue controls (past target date, not yet verified)
 */
export function getOverdueControls(): Control[] {
  const controls = loadControls();
  const now = new Date();

  return controls.filter((c) => {
    if (!c.targetDate || c.implementationStatus === "VERIFIED") return false;
    return new Date(c.targetDate) < now;
  });
}
