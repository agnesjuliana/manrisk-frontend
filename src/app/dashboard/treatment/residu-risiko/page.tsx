"use client";

import { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaginatedTable } from "@/components/paginated-table";
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
  const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  const [editingRiskId, setEditingRiskId] = useState<string | null>(null);
  const [savingReassessment, setSavingReassessment] = useState(false);
  const [editForm, setEditForm] = useState({
    reassessedLikelihood: "",
    reassessedSeverity: "",
    notes: "",
  });

  // Fetch data from API
  useEffect(() => {
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
  }, []);

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
                    header: "Identified Risk",
                    key: "identifiedRisk",
                  },
                  {
                    header: "Treatment",
                    key: "treatmentOption",
                  },
                  {
                    header: "Original Score",
                    key: "originalScore",
                    render: (value) => (
                      <span className="inline-block rounded px-2 py-1 font-semibold text-xs bg-gray-100 text-gray-700">{String(value)}</span>
                    ),
                    searchable: false,
                  },
                  {
                    header: "Original Level",
                    key: "originalLevel",
                    render: (value: any) => (
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${(value as any).color}`}>
                        {(value as any).label}
                      </span>
                    ),
                    searchable: false,
                  },
                  {
                    header: "Aksi",
                    key: "riskId",
                    render: (value) => (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => openReassessmentDialog(String(value))}
                      >
                        Nilai Ulang
                      </Button>
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
                    header: "Identified Risk",
                    key: "identifiedRisk" as any,
                  },
                  {
                    header: "Treatment",
                    key: "treatmentOption" as any,
                  },
                  {
                    header: "Original Score",
                    key: "originalScore" as any,
                    render: (value) => (
                      <span className="inline-block rounded px-2 py-1 font-semibold text-xs bg-gray-100 text-gray-700">{String(value)}</span>
                    ),
                    searchable: false,
                  },
                  {
                    header: "Reassessed Score",
                    key: "reassessedScore" as any,
                    render: (value) => (
                      <span className="inline-block rounded px-2 py-1 font-semibold text-xs bg-blue-100 text-blue-700">{String(value)}</span>
                    ),
                    searchable: false,
                  },
                  {
                    header: "Reassessed Level",
                    key: "reassessedLevel" as any,
                    render: (value: any) => (
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${(value as any).color}`}>
                        {(value as any).label}
                      </span>
                    ),
                    searchable: false,
                  },
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
                  <div className="bg-sky-50 border border-sky-200 p-4 rounded-lg">
                    <p className="text-xs text-sky-900 font-semibold uppercase tracking-wide mb-3">Risk Information</p>
                    <div className="space-y-2">
                      <p className="text-sm"><span className="font-medium text-sky-900">Risk ID:</span> <span className="text-gray-700">{selectedRisk.customRiskId}</span></p>
                      <p className="text-sm"><span className="font-medium text-sky-900">Risk:</span> <span className="text-gray-700">{selectedRisk.identifiedRisk}</span></p>
                      <p className="text-sm"><span className="font-medium text-sky-900">Treatment:</span> <span className="text-gray-700">{selectedRisk.treatmentOption}</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">Original Risk</p>
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-medium text-gray-700">Severity:</span> <span className="font-semibold text-gray-900">{selectedRisk.originalSeverity}</span></p>
                        <p className="text-sm"><span className="font-medium text-gray-700">Likelihood:</span> <span className="font-semibold text-gray-900">{selectedRisk.originalLikelihood}</span></p>
                        <p className="text-sm"><span className="font-medium text-gray-700">Score:</span> <span className="font-semibold text-gray-900">{selectedRisk.originalScore}</span></p>
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide mb-3">Residual Risk</p>
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-medium text-amber-700">Severity:</span> <span className="font-semibold text-amber-900">{selectedRisk.residualSeverity}</span></p>
                        <p className="text-sm"><span className="font-medium text-amber-700">Likelihood:</span> <span className="font-semibold text-amber-900">{selectedRisk.residualLikelihood}</span></p>
                        <p className="text-sm"><span className="font-medium text-amber-700">Score:</span> <span className="font-semibold text-amber-900">{selectedRisk.residualScore}</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2 block">Severity (1-5) *</label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={editForm.reassessedSeverity}
                        onChange={(e) => setEditForm((s) => ({ ...s, reassessedSeverity: e.target.value }))}
                        className="border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2 block">Likelihood (1-5) *</label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={editForm.reassessedLikelihood}
                        onChange={(e) => setEditForm((s) => ({ ...s, reassessedLikelihood: e.target.value }))}
                        className="border-sky-200 focus:border-sky-400 focus:ring-sky-100"
                      />
                    </div>
                  </div>

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
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingRiskId(null)}>
                  Batal
                </Button>
                <Button onClick={saveReassessment} disabled={savingReassessment}>
                  {savingReassessment ? "Menyimpan..." : "Simpan Penilaian"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
