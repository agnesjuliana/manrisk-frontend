"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { PaginatedTable } from "@/components/paginated-table";
import { toast } from "sonner";
import apiClient from "@/lib/api/config";

const RISK_SCORE_RANGES = [
  { min: 1, max: 5, label: "Low", color: "bg-green-200" },
  { min: 6, max: 10, label: "Medium", color: "bg-yellow-200" },
  { min: 11, max: 15, label: "High", color: "bg-orange-200" },
  { min: 16, max: 25, label: "Critical", color: "bg-red-200" },
];

interface RevisionLog {
  id: string;
  riskId: string;
  impactSeverity: number;
  likelihoodOccurence: number;
  detection: number;
  createdAt: string;
}

interface Risk {
  id: string;
  customRiskId: string;
  vulnerability: string;
  threat: string;
  identifiedRisk: string;
  detail: string;
  isConfidentiality: boolean;
  isIntegrity: boolean;
  isAvailability: boolean;
  impactSeverity: number;
  likelihoodOccurence: number;
  detection: number;
  revisionLog: RevisionLog | null;
}

interface Control {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  isAnnex: boolean;
}

interface RiskCriteria {
  id: string;
  organizationId: string;
  isFMEA: boolean;
  scale: number;
  threshold: number;
  scaleStatuses: Array<{ id: string; level: number; title: string }>;
  createdAt: string;
  updatedAt: string;
}

interface TreatmentRecord {
  id: string;
  riskId: string;
  treatmentOpt: string;
  detailedActionPlan: string;
  startAction: string;
  endAction: string;
  isApprovedByTop: boolean;
  risk: Risk;
  controls: Control[];
}

function computeScore(severity: number, likelihood: number): number {
  return severity * likelihood;
}

function computeRiskLevel(score: number): { label: string; color: string } {
  const range = RISK_SCORE_RANGES.find((r) => score >= r.min && score <= r.max);
  return range ? { label: range.label, color: range.color } : { label: "Unknown", color: "bg-gray-200" };
}

function getRiskLevelBadgeColor(level: string) {
  switch (level) {
    case "Critical":
      return "bg-red-100 text-red-700"
    case "High":
      return "bg-orange-100 text-orange-700"
    case "Medium":
      return "bg-yellow-100 text-yellow-700"
    case "Low":
      return "bg-green-100 text-green-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function ResiduRisikoPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  const [riskCriteria, setRiskCriteria] = useState<RiskCriteria | null>(null);
  const [editingRiskId, setEditingRiskId] = useState<string | null>(null);
  const [savingReassessment, setSavingReassessment] = useState(false);
  const [saveConfirmationOpen, setSaveConfirmationOpen] = useState(false);

  // Role checks
  const isRiskManager = user?.role === "RISK_MANAGER";
  const isRiskOwner = user?.role === "RISK_OWNER";
  const isTopManagement = user?.role === "TOP_MANAGEMENT";

  const [editForm, setEditForm] = useState({
    reassessedLikelihood: "",
    reassessedSeverity: "",
    reassessedDetection: "",
    notes: "",
  });

  // Auth validation - check if user has required role
  useEffect(() => {
    if (isAuthLoading) return;

    if (!isRiskManager && !isRiskOwner && !isTopManagement) {
      toast.error("Anda tidak memiliki akses ke halaman ini");
      router.back();
    }
  }, [isAuthLoading, isRiskManager, isRiskOwner, isTopManagement, router]);

  // Fetch data from API
  useEffect(() => {
    if (isAuthLoading || (!isRiskManager && !isRiskOwner && !isTopManagement)) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/risk-revisions");
        // Response structure: { code, message, status, data: { data: [...], metadata: {...} } }
        const treatmentData = response.data?.data?.data || [];
        setTreatments(Array.isArray(treatmentData) ? treatmentData : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching risk revisions:", err);
        setError("Gagal memuat data risiko");
        setTreatments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthLoading, isRiskManager, isRiskOwner, isTopManagement]);

  // Fetch risk criteria
  useEffect(() => {
    if (isAuthLoading || (!isRiskManager && !isRiskOwner && !isTopManagement)) return;

    const fetchRiskCriteria = async () => {
      try {
        const response = await apiClient.get("/risk-criteria");
        if (response.data?.data) {
          setRiskCriteria(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching risk criteria:", err);
        setRiskCriteria(null);
      }
    };

    fetchRiskCriteria();
  }, [isAuthLoading, isRiskManager, isRiskOwner, isTopManagement]);

  // Separate risks: those without revisionLog (need reassessment) vs with revisionLog (already reassessed)
  const risksNeedingReassessment = useMemo(() => {
    return treatments
      .filter((t) => t.isApprovedByTop && !t.risk.revisionLog)
      .map((t) => {
        const originalScore = computeScore(t.risk.impactSeverity, t.risk.likelihoodOccurence);
        const originalLevel = computeRiskLevel(originalScore);

        return {
          id: t.risk.id,
          riskId: t.risk.id,
          customRiskId: t.risk.customRiskId,
          identifiedRisk: t.risk.identifiedRisk,
          vulnerability: t.risk.vulnerability,
          threat: t.risk.threat,
          detail: t.risk.detail,
          isConfidentiality: t.risk.isConfidentiality,
          isIntegrity: t.risk.isIntegrity,
          isAvailability: t.risk.isAvailability,
          treatmentOption: t.treatmentOpt,
          originalSeverity: t.risk.impactSeverity,
          originalLikelihood: t.risk.likelihoodOccurence,
          originalScore,
          originalLevel,
          residualSeverity: t.risk.impactSeverity,
          residualLikelihood: t.risk.likelihoodOccurence,
          residualScore: originalScore,
          residualLevel: originalLevel,
          reduction: 0,
          reductionPercent: 0,
          treatmentId: t.id,
        };
      });
  }, [treatments]);

  const risksAlreadyReassessed = useMemo(() => {
    return treatments
      .filter((t) => t.isApprovedByTop && t.risk.revisionLog)
      .map((t) => {
        const originalScore = computeScore(t.risk.impactSeverity, t.risk.likelihoodOccurence);
        const originalLevel = computeRiskLevel(originalScore);

        const residualScore = computeScore(t.risk.impactSeverity, t.risk.likelihoodOccurence);
        const residualLevel = computeRiskLevel(residualScore);

        const revisionLog = t.risk.revisionLog!;
        const reassessedScore = computeScore(revisionLog.impactSeverity, revisionLog.likelihoodOccurence);
        const reassessedLevel = computeRiskLevel(reassessedScore);
        const scoreDifference = originalScore - reassessedScore;

        return {
          id: t.risk.id,
          riskId: t.risk.id,
          customRiskId: t.risk.customRiskId,
          identifiedRisk: t.risk.identifiedRisk,
          treatmentOption: t.treatmentOpt,
          originalScore,
          originalLevel,
          residualScore,
          residualLevel,
          reassessedScore,
          reassessedLevel,
          scoreDifference,
          reassessedLikelihood: revisionLog.likelihoodOccurence,
          reassessedSeverity: revisionLog.impactSeverity,
          notes: "",
          createdAt: revisionLog.createdAt,
        };
      });
  }, [treatments]);

  const selectedRisk = risksNeedingReassessment.find((r) => r.riskId === selectedRiskId);

  // Calculate statistics
  const stats = {
    totalTreated: risksNeedingReassessment.length + risksAlreadyReassessed.length,
    alreadyReassessed: risksAlreadyReassessed.length,
    needsReassessment: risksNeedingReassessment.length,
    completionRate: risksAlreadyReassessed.length + risksNeedingReassessment.length > 0 
      ? Math.round((risksAlreadyReassessed.length / (risksAlreadyReassessed.length + risksNeedingReassessment.length)) * 100)
      : 0,
  };

  function openReassessmentDialog(riskId: string) {
    const risk = risksNeedingReassessment.find((r) => r.riskId === riskId);
    if (risk) {
      setEditingRiskId(riskId);
      setEditForm({
        reassessedLikelihood: risk.residualLikelihood.toString(),
        reassessedSeverity: risk.residualSeverity.toString(),
        reassessedDetection: "",
        notes: "",
      });
      setSelectedRiskId(riskId);
    }
  }

  async function saveReassessment() {
    if (!editingRiskId) return;

    const treatment = treatments.find((t) => t.risk.id === editingRiskId);
    if (!treatment) return;

    try {
      setSavingReassessment(true);
      
      // POST to create revision log
      await apiClient.post("/risk-revisions", {
        riskId: editingRiskId,
        impactSeverity: parseInt(editForm.reassessedSeverity, 10),
        likelihoodOccurence: parseInt(editForm.reassessedLikelihood, 10),
        detection: 3, // Default value
      });

      // Refresh data
      const response = await apiClient.get("/risk-revisions");
      const treatmentData = response.data?.data?.data || [];
      setTreatments(Array.isArray(treatmentData) ? treatmentData : []);

      setEditingRiskId(null);
      setSelectedRiskId(null);
      alert("Penilaian ulang risiko berhasil disimpan");
    } catch (err) {
      console.error("Error saving reassessment:", err);
      alert("Gagal menyimpan penilaian ulang risiko");
    } finally {
      setSavingReassessment(false);
    }
  }

  // Show loading while checking auth
  if (isAuthLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0 w-full min-w-0">
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  // Return null if user is not authorized (will trigger redirect in useEffect)
  if (!isRiskManager && !isRiskOwner && !isTopManagement) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 w-full min-w-0">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">Memuat data risiko...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards - At the Top */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Total Risiko</p>
              <p className="mt-2 text-2xl font-bold">{stats.totalTreated}</p>
            </div>

            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Sudah Dinilai Ulang</p>
              <p className="mt-2 text-2xl font-bold">{stats.alreadyReassessed}</p>
            </div>

            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Menunggu Penilaian</p>
              <p className="mt-2 text-2xl font-bold">{stats.needsReassessment}</p>
            </div>

            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
              <p className="mt-2 text-2xl font-bold">{stats.completionRate}%</p>
            </div>
          </div>

          {/* Section 1: Risks Needing Reassessment */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Penilaian Ulang Risiko</h2>
                <p className="text-sm text-gray-600 mt-1">Risiko yang perlu dinilai ulang setelah treatment diterapkan</p>
              </div>
              <span className="text-sm font-medium bg-sky-100 text-sky-700 px-3 py-1 rounded-full">
                {risksNeedingReassessment.length} yang menunggu
              </span>
            </div>

            {risksNeedingReassessment.length > 0 ? (
              <PaginatedTable
                data={risksNeedingReassessment}
                columns={[
                  {
                    header: "No",
                    key: "riskId",
                    render: (_, row) => {
                      const index = risksNeedingReassessment.findIndex((t) => t.riskId === row.riskId)
                      return <span className="text-gray-600">{index + 1}</span>
                    },
                    searchable: false,
                  },
                  {
                    header: "Risk ID",
                    key: "customRiskId",
                    render: (value) => <span className="font-medium">{String(value)}</span>,
                  },
                  {
                    header: "Risiko",
                    key: "identifiedRisk",
                  },
                  {
                    header: "Perlakuan",
                    key: "treatmentOption",
                  },
                  {
                    header: "Skor Awal",
                    key: "originalScore",
                    render: (value) => (
                      <span className="inline-block rounded px-2 py-1 font-semibold text-xs bg-gray-100 text-gray-700">{String(value)}</span>
                    ),
                    searchable: false,
                  },
                  // {
                  //   header: "Original Level",
                  //   key: "originalLevel",
                  //   render: (value: any) => (
                  //     <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${(value as any).color}`}>
                  //       {(value as any).label}
                  //     </span>
                  //   ),
                  //   searchable: false,
                  // },
                  {
                    header: "Aksi",
                    key: "riskId",
                    render: (value) => (
                      (isRiskManager || isTopManagement) ? (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => openReassessmentDialog(String(value))}
                        >
                          Nilai Ulang
                        </Button>
                      ) : null
                    ),
                    searchable: false,
                  },
                ]}
                pageSize={10}
                emptyMessage="Tidak ada risiko yang perlu dinilai ulang"
              />
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">Semua risiko dengan treatment sudah dinilai ulang</p>
              </div>
            )}
          </div>

          {/* Section 2: Risks Already Reassessed */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Hasil Penilaian Ulang</h2>
                <p className="text-sm text-gray-600 mt-1">Risiko yang sudah dinilai ulang dengan hasil terbaru</p>
              </div>
              <span className="text-sm font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {risksAlreadyReassessed.length} sudah dinilai
              </span>
            </div>

            {risksAlreadyReassessed.length > 0 ? (
              <PaginatedTable
                data={risksAlreadyReassessed as any}
                columns={[
                  {
                    header: "No",
                    key: "riskId" as any,
                    render: (_, row: any) => {
                      const index = risksAlreadyReassessed.findIndex((t: any) => t.riskId === row.riskId)
                      return <span className="text-gray-600">{index + 1}</span>
                    },
                    searchable: false,
                  },
                  {
                    header: "Risk ID",
                    key: "customRiskId" as any,
                    render: (value) => <span className="font-medium">{String(value)}</span>,
                  },
                  {
                    header: "Risiko",
                    key: "identifiedRisk" as any,
                  },
                  {
                    header: "Perlakuan",
                    key: "treatmentOption" as any,
                  },
                  {
                    header: "Skor Awal",
                    key: "originalScore" as any,
                    render: (value) => (
                      <span className="inline-block rounded px-2 py-1 font-semibold text-xs bg-gray-100 text-gray-700">{String(value)}</span>
                    ),
                    searchable: false,
                  },
                  {
                    header: "Penilaian Ulang",
                    key: "reassessedScore" as any,
                    render: (value) => (
                      <span className="inline-block rounded px-2 py-1 font-semibold text-xs bg-blue-100 text-blue-700">{String(value)}</span>
                    ),
                    searchable: false,
                  },
                  {
                    header: "Hasil",
                    key: "scoreDifference" as any,
                    render: (value: any, row: any) => {
                      const diff = row.scoreDifference as number;
                      if (diff > 0) {
                        return (
                          <span className="inline-block rounded px-3 py-1 font-bold text-sm bg-green-100 text-green-700">
                            - {Math.abs(diff)}
                          </span>
                        );
                      } else if (diff < 0) {
                        return (
                          <span className="inline-block rounded px-3 py-1 font-bold text-sm bg-red-100 text-red-700">
                            + {Math.abs(diff)}
                          </span>
                        );
                      } else {
                        return (
                          <span className="inline-block rounded px-3 py-1 font-bold text-sm bg-gray-100 text-gray-700">
                            = 0
                          </span>
                        );
                      }
                    },
                    searchable: false,
                  },
                  // {
                  //   header: "Reassessed Level",
                  //   key: "reassessedLevel" as any,
                  //   render: (value: any) => (
                  //     <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${(value as any).color}`}>
                  //       {(value as any).label}
                  //     </span>
                  //   ),
                  //   searchable: false,
                  // },
                ]}
                pageSize={10}
                emptyMessage="Belum ada risiko yang dinilai ulang"
              />
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">Mulai dengan menilai risiko dari tabel di atas</p>
              </div>
            )}
          </div>

          {/* Dialog for Reassessment */}
          <Dialog open={editingRiskId !== null} onOpenChange={(open) => !open && setEditingRiskId(null)}>
            <DialogContent className="max-h-[90vh] overflow-y-auto !max-w-2xl w-full">
              <DialogHeader className="border-b border-sky-100 pb-4">
                <DialogTitle className="text-2xl text-gray-900">Penilaian Ulang Risiko</DialogTitle>
              </DialogHeader>

              {selectedRisk && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left: Risk Information */}
                    <div className="bg-sky-50 border border-sky-200 p-4 rounded-lg h-fit">
                      <p className="text-xs text-sky-900 font-semibold uppercase tracking-wide mb-3">Risk Information</p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-sky-900">Risk ID</p>
                          <p className="text-sm text-gray-700">{selectedRisk.customRiskId}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-sky-900">Risiko</p>
                          <p className="text-sm text-gray-700">{selectedRisk.identifiedRisk}</p>
                        </div>
                        {selectedRisk.vulnerability && (
                          <div>
                            <p className="text-xs font-medium text-sky-900">Vulnerability</p>
                            <p className="text-sm text-gray-700">{selectedRisk.vulnerability}</p>
                          </div>
                        )}
                        {selectedRisk.threat && (
                          <div>
                            <p className="text-xs font-medium text-sky-900">Threat</p>
                            <p className="text-sm text-gray-700">{selectedRisk.threat}</p>
                          </div>
                        )}
                        {selectedRisk.detail && (
                          <div>
                            <p className="text-xs font-medium text-sky-900">Detail</p>
                            <p className="text-sm text-gray-700">{selectedRisk.detail}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium text-sky-900">Treatment</p>
                          <p className="text-sm text-gray-700">{selectedRisk.treatmentOption}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Original Risk & Residual Risk */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                        <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">Original Risk</p>
                        <div className="space-y-2">
                          <p className="text-sm"><span className="font-medium text-gray-700">Severity:</span> <span className="font-semibold text-gray-900">{riskCriteria?.scaleStatuses?.find(s => s.level === selectedRisk.originalSeverity)?.title || selectedRisk.originalSeverity}</span></p>
                          <p className="text-sm"><span className="font-medium text-gray-700">Likelihood:</span> <span className="font-semibold text-gray-900">{riskCriteria?.scaleStatuses?.find(s => s.level === selectedRisk.originalLikelihood)?.title || selectedRisk.originalLikelihood}</span></p>
                          <p className="text-sm"><span className="font-medium text-gray-700">Score:</span> <span className="font-semibold text-gray-900">{selectedRisk.originalScore}</span></p>
                        </div>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                        <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide mb-3">Residual Risk</p>
                        <div className="space-y-2">
                          <p className="text-sm"><span className="font-medium text-amber-700">Severity:</span> <span className="font-semibold text-amber-900">{riskCriteria?.scaleStatuses?.find(s => s.level === selectedRisk.residualSeverity)?.title || selectedRisk.residualSeverity}</span></p>
                          <p className="text-sm"><span className="font-medium text-amber-700">Likelihood:</span> <span className="font-semibold text-amber-900">{riskCriteria?.scaleStatuses?.find(s => s.level === selectedRisk.residualLikelihood)?.title || selectedRisk.residualLikelihood}</span></p>
                          <p className="text-sm"><span className="font-medium text-amber-700">Score:</span> <span className="font-semibold text-amber-900">{selectedRisk.residualScore}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Fields - Full Width */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2 block">Severity *</label>
                      <Select
                        value={editForm.reassessedSeverity}
                        onValueChange={(value) => setEditForm((s) => ({ ...s, reassessedSeverity: value }))}
                      >
                        <SelectTrigger className="w-full border-sky-200 focus:border-sky-400 focus:ring-sky-100">
                          <SelectValue placeholder="Pilih severity" />
                        </SelectTrigger>
                        <SelectContent>
                          {riskCriteria?.scaleStatuses?.map((status) => (
                            <SelectItem key={status.id} value={status.level.toString()}>
                              {status.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {!riskCriteria?.isFMEA ? (
                      <div>
                        <label className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2 block">Likelihood *</label>
                        <Select
                          value={editForm.reassessedLikelihood}
                          onValueChange={(value) => setEditForm((s) => ({ ...s, reassessedLikelihood: value }))}
                        >
                          <SelectTrigger className="w-full border-sky-200 focus:border-sky-400 focus:ring-sky-100">
                            <SelectValue placeholder="Pilih likelihood" />
                          </SelectTrigger>
                          <SelectContent>
                            {riskCriteria?.scaleStatuses?.map((status) => (
                              <SelectItem key={status.id} value={status.level.toString()}>
                                {status.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2 block">Occurrence *</label>
                          <Select
                            value={editForm.reassessedLikelihood}
                            onValueChange={(value) => setEditForm((s) => ({ ...s, reassessedLikelihood: value }))}
                          >
                            <SelectTrigger className="w-full border-sky-200 focus:border-sky-400 focus:ring-sky-100">
                              <SelectValue placeholder="Pilih occurrence" />
                            </SelectTrigger>
                            <SelectContent>
                              {riskCriteria?.scaleStatuses?.map((status) => (
                                <SelectItem key={status.id} value={status.level.toString()}>
                                  {status.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2 block">Detection *</label>
                          <Select
                            value={editForm.reassessedDetection || ""}
                            onValueChange={(value) => setEditForm((s) => ({ ...s, reassessedDetection: value }))}
                          >
                            <SelectTrigger className="w-full border-sky-200 focus:border-sky-400 focus:ring-sky-100">
                              <SelectValue placeholder="Pilih detection" />
                            </SelectTrigger>
                            <SelectContent>
                              {riskCriteria?.scaleStatuses?.map((status) => (
                                <SelectItem key={status.id} value={status.level.toString()}>
                                  {status.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2 block">Catatan Penilaian</label>
                      <Input
                        placeholder="Masukkan catatan tentang penilaian ulang ini"
                        value={editForm.notes}
                        onChange={(e) => setEditForm((s) => ({ ...s, notes: e.target.value }))}
                        className="border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingRiskId(null)}>
                  Batal
                </Button>
                <Button onClick={() => setSaveConfirmationOpen(true)} disabled={savingReassessment}>
                  {savingReassessment ? "Menyimpan..." : "Simpan Penilaian"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Confirmation Dialog for Save */}
          <AlertDialog open={saveConfirmationOpen} onOpenChange={setSaveConfirmationOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Penilaian Ulang Risiko</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menyimpan penilaian ulang risiko ini?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    setSaveConfirmationOpen(false);
                    await saveReassessment();
                  }}
                >
                  Simpan
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
