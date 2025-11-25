import { Risk } from "./risksStore";

export interface RiskSubmission {
  id: string;
  submissionDate: string;
  totalRisks: number;
  riskIds: string[];
  status: "PENDING_RM_REVIEW" | "APPROVED_BY_RM" | "SUBMITTED_TO_TOP" | "APPROVED_BY_TOP" | "REJECTED";
  rmNotes?: string;
  topNotes?: string;
}

const STORAGE_KEY = "risk_submissions";

const DEFAULT_SUBMISSIONS: RiskSubmission[] = [
  {
    id: "RSUB-001",
    submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    totalRisks: 2,
    riskIds: ["R001", "R002"],
    status: "SUBMITTED_TO_TOP",
    rmNotes: "Reviewed and approved by RM",
  },
  {
    id: "RSUB-002",
    submissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    totalRisks: 1,
    riskIds: ["R003"],
    status: "APPROVED_BY_TOP",
    rmNotes: "Risk assessment complete",
    topNotes: "Approved for implementation",
  },
  {
    id: "RSUB-003",
    submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    totalRisks: 3,
    riskIds: ["R004", "R005", "R006"],
    status: "SUBMITTED_TO_TOP",
    rmNotes: "Awaiting top management review",
  },
  {
    id: "RSUB-004",
    submissionDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    totalRisks: 2,
    riskIds: ["R007", "R008"],
    status: "REJECTED",
    rmNotes: "Initial assessment",
    topNotes: "Requires additional analysis",
  },
];

export function createSubmission(riskIds: string[]): RiskSubmission {
  return {
    id: `RSUB-${Date.now()}`,
    submissionDate: new Date().toISOString(),
    totalRisks: riskIds.length,
    riskIds,
    status: "SUBMITTED_TO_TOP",
    rmNotes: "",
  };
}

export function loadSubmissions(): RiskSubmission[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  // Return default submissions if no data in localStorage
  saveSubmissions(DEFAULT_SUBMISSIONS);
  return DEFAULT_SUBMISSIONS;
}

export function saveSubmissions(submissions: RiskSubmission[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

export function updateSubmissionStatus(
  id: string,
  status: RiskSubmission["status"],
  notes?: string
): void {
  const submissions = loadSubmissions();
  const idx = submissions.findIndex((s) => s.id === id);
  if (idx === -1) return;

  submissions[idx].status = status;
  if (notes) {
    if (status === "APPROVED_BY_TOP" || status === "REJECTED") {
      submissions[idx].topNotes = notes;
    } else {
      submissions[idx].rmNotes = notes;
    }
  }

  saveSubmissions(submissions);
}
