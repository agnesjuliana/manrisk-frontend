// Asset Submission History Store

export interface AssetSubmission {
  id: string;
  submissionDate: string; // ISO format
  totalAssets: number;
  assetIds: string[];
  status: "PENDING_RM_REVIEW" | "APPROVED_BY_RM" | "SUBMITTED_TO_TOP" | "APPROVED_BY_TOP" | "REJECTED";
  rmNotes?: string;
  topNotes?: string;
}

const STORAGE_KEY = "isms_asset_submissions";

export function loadSubmissions(): AssetSubmission[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSubmissions(submissions: AssetSubmission[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

export function createSubmission(assetIds: string[]): AssetSubmission {
  return {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    submissionDate: new Date().toISOString(),
    totalAssets: assetIds.length,
    assetIds,
    status: "PENDING_RM_REVIEW",
  };
}

export function updateSubmissionStatus(
  id: string,
  status: AssetSubmission["status"],
  notes?: string
): AssetSubmission | null {
  const submissions = loadSubmissions();
  const submission = submissions.find((s) => s.id === id);
  if (!submission) return null;

  submission.status = status;
  if (notes) {
    if (status.includes("RM")) {
      submission.rmNotes = notes;
    } else {
      submission.topNotes = notes;
    }
  }

  saveSubmissions(submissions);
  return submission;
}

export function deleteSubmission(id: string): void {
  const submissions = loadSubmissions();
  saveSubmissions(submissions.filter((s) => s.id !== id));
}
