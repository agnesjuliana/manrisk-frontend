"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaginatedTable } from "@/components/paginated-table";
import { loadRisks, Risk } from "@/lib/risksStore";
import { loadTreatments, Treatment } from "@/lib/treatmentsStore";

const RISK_SCORE_RANGES = [
  { min: 1, max: 5, label: "Low", color: "bg-green-200" },
  { min: 6, max: 10, label: "Medium", color: "bg-yellow-200" },
  { min: 11, max: 15, label: "High", color: "bg-orange-200" },
  { min: 16, max: 25, label: "Critical", color: "bg-red-200" },
];

interface RiskReassessment {
  riskId: string;
  reassessedLikelihood?: number;
  reassessedSeverity?: number;
  notes?: string;
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

function createDummyTreatments(): Treatment[] {
  return [
    {
      id: "TRT-001",
      riskId: "RISK-001",
      option: "Mitigate",
      target: { likelihood: 2, impact: 2 },
      reason: "Implementasi kontrols keamanan jaringan",
      controls: ["A.8.1", "A.8.3"],
      controlJustification: "Firewall dan IDS akan mengurangi likelihood",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "SET",
      approvalStatus: "APPROVED",
    },
    {
      id: "TRT-002",
      riskId: "RISK-002",
      option: "Mitigate",
      target: { likelihood: 3, impact: 3 },
      reason: "Peningkatan awareness dan training",
      controls: ["A.7.2"],
      controlJustification: "Regular training akan mengurangi human error",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "SET",
      approvalStatus: "APPROVED",
    },
    {
      id: "TRT-003",
      riskId: "RISK-003",
      option: "Accept",
      target: { likelihood: 4, impact: 3 },
      reason: "Risk diterima karena biaya mitigation sangat tinggi",
      controls: ["A.8.2"],
      controlJustification: "Monitor saja dengan periodic review",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: "SET",
      approvalStatus: "APPROVED",
    },
    {
      id: "TRT-004",
      riskId: "RISK-004",
      option: "Transfer",
      target: { likelihood: 2, impact: 2 },
      reason: "Asuransi cyber untuk transfer risiko",
      controls: ["A.16.1"],
      controlJustification: "Cyber insurance akan cover potential losses",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: "SET",
      approvalStatus: "APPROVED",
    },
  ];
}

function createDummyRisks(): Risk[] {
  return [
    {
      id: "RISK-001",
      identifiedRisk: "Unauthorized Access to Systems",
      category: "Security",
      ownerId: "1",
      severity: 5,
      likelihood: 3,
      status: "APPROVED",
      vulnerability: "Weak authentication",
      threat: "Unauthorized access",
      source: "External",
      cia: ["Confidentiality"],
      identifiedAt: new Date().toISOString(),
    } as unknown as Risk,
    {
      id: "RISK-002",
      identifiedRisk: "Employee Negligence",
      category: "Human",
      ownerId: "2",
      severity: 4,
      likelihood: 4,
      status: "APPROVED",
      vulnerability: "Human error",
      threat: "Data loss",
      source: "Internal",
      cia: ["Integrity"],
      identifiedAt: new Date().toISOString(),
    } as unknown as Risk,
    {
      id: "RISK-003",
      identifiedRisk: "System Downtime",
      category: "Operations",
      ownerId: "3",
      severity: 5,
      likelihood: 2,
      status: "APPROVED",
      vulnerability: "Hardware failure",
      threat: "Service unavailability",
      source: "Technical",
      cia: ["Availability"],
      identifiedAt: new Date().toISOString(),
    } as unknown as Risk,
    {
      id: "RISK-004",
      identifiedRisk: "Data Loss",
      category: "Data",
      ownerId: "4",
      severity: 5,
      likelihood: 2,
      status: "APPROVED",
      vulnerability: "Backup failure",
      threat: "Permanent data loss",
      source: "Technical",
      cia: ["Confidentiality"],
      identifiedAt: new Date().toISOString(),
    } as unknown as Risk,
  ];
}

export default function ResiduRisikoPage() {
  const allRisks = useMemo(() => {
    const storedRisks = loadRisks();
    // Use dummy data if no risks are loaded
    if (storedRisks.length === 0) {
      const dummyRisks = createDummyRisks();
      return dummyRisks;
    }
    return storedRisks;
  }, []);

  const allTreatments = useMemo(() => {
    const storedTreatments = loadTreatments();
    // Use dummy data if no treatments are loaded
    if (storedTreatments.length === 0) {
      const dummyTreatments = createDummyTreatments();
      return dummyTreatments;
    }
    return storedTreatments;
  }, []);

  // For debugging - log what we have
  if (typeof window !== "undefined") {
    console.log("Risks loaded:", allRisks.length, allRisks.map(r => r.id));
    console.log("Treatments loaded:", allTreatments.length, allTreatments.map(t => t.riskId));
  }

  const risks = allRisks;
  const treatments = allTreatments;
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  const [reassessments, setReassessments] = useState<Map<string, RiskReassessment>>(() => {
    // Dummy data for reassessments
    const dummyReassessments = new Map<string, RiskReassessment>();
    dummyReassessments.set("RISK-001", {
      riskId: "RISK-001",
      reassessedLikelihood: 2,
      reassessedSeverity: 3,
      notes: "Treatment sudah diterapkan dengan baik, risk level turun signifikan",
    });
    dummyReassessments.set("RISK-002", {
      riskId: "RISK-002",
      reassessedLikelihood: 3,
      reassessedSeverity: 4,
      notes: "Masih ada beberapa kendala, perlu monitoring lebih lanjut",
    });
    return dummyReassessments;
  });
  const [editingRiskId, setEditingRiskId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    reassessedLikelihood: "",
    reassessedSeverity: "",
    notes: "",
  });

  const risksNeedingReassessment = useMemo(() => {
    return risks
      .filter((r) => treatments.some((t) => t.riskId === r.id && t.approvalStatus === "APPROVED"))
      .filter((r) => !reassessments.has(r.id))
      .map((r) => {
        const treatment = treatments.find((t) => t.riskId === r.id && t.approvalStatus === "APPROVED");

        const originalScore = computeScore(r.severity, r.likelihood);
        const originalLevel = computeRiskLevel(originalScore);

        let residualLikelihood = r.likelihood;
        let residualSeverity = r.severity;

        if (treatment?.target) {
          if (treatment.target.likelihood) {
            residualLikelihood = Math.min(treatment.target.likelihood, r.likelihood);
          }
          if (treatment.target.impact) {
            residualSeverity = Math.min(treatment.target.impact, r.severity);
          }
        }

        const residualScore = computeScore(residualSeverity, residualLikelihood);
        const residualLevel = computeRiskLevel(residualScore);

        return {
          id: r.id,
          riskId: r.id,
          identifiedRisk: r.identifiedRisk,
          category: r.category,
          treatmentOption: treatment?.option ?? "-",
          originalSeverity: r.severity,
          originalLikelihood: r.likelihood,
          originalScore,
          originalLevel,
          residualSeverity,
          residualLikelihood,
          residualScore,
          residualLevel,
          reduction: originalScore - residualScore,
          reductionPercent: Math.round(((originalScore - residualScore) / originalScore) * 100),
        };
      });
  }, [risks, treatments, reassessments]);

  const risksAlreadyReassessed = useMemo(() => {
    return Array.from(reassessments.values()).map((reassessment) => {
      const risk = risks.find((r) => r.id === reassessment.riskId);
      const treatment = treatments.find((t) => t.riskId === reassessment.riskId && t.approvalStatus === "APPROVED");

      if (!risk) return null;

      const originalScore = computeScore(risk.severity, risk.likelihood);
      const originalLevel = computeRiskLevel(originalScore);

      let residualLikelihood = risk.likelihood;
      let residualSeverity = risk.severity;

      if (treatment?.target) {
        if (treatment.target.likelihood) {
          residualLikelihood = Math.min(treatment.target.likelihood, risk.likelihood);
        }
        if (treatment.target.impact) {
          residualSeverity = Math.min(treatment.target.impact, risk.severity);
        }
      }

      const residualScore = computeScore(residualSeverity, residualLikelihood);
      const residualLevel = computeRiskLevel(residualScore);

      const reassessedScore = computeScore(
        reassessment.reassessedSeverity ?? residualSeverity,
        reassessment.reassessedLikelihood ?? residualLikelihood
      );
      const reassessedLevel = computeRiskLevel(reassessedScore);

      return {
        id: risk.id,
        riskId: risk.id,
        identifiedRisk: risk.identifiedRisk,
        category: risk.category,
        treatmentOption: treatment?.option ?? "-",
        originalScore,
        originalLevel,
        residualScore,
        residualLevel,
        reassessedScore,
        reassessedLevel,
        reassessedLikelihood: reassessment.reassessedLikelihood ?? residualLikelihood,
        reassessedSeverity: reassessment.reassessedSeverity ?? residualSeverity,
        notes: reassessment.notes,
      };
    }).filter((r) => r !== null);
  }, [reassessments, risks, treatments]);

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

  function saveReassessment() {
    if (!editingRiskId) return;

    const newReassessments = new Map(reassessments);
    newReassessments.set(editingRiskId, {
      riskId: editingRiskId,
      reassessedLikelihood: editForm.reassessedLikelihood ? parseInt(editForm.reassessedLikelihood, 10) : undefined,
      reassessedSeverity: editForm.reassessedSeverity ? parseInt(editForm.reassessedSeverity, 10) : undefined,
      notes: editForm.notes || undefined,
    });
    setReassessments(newReassessments);
    setEditingRiskId(null);
    setSelectedRiskId(null);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 w-full min-w-0">
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
            <h2 className="text-lg font-semibold">Penilaian Ulang Risiko</h2>
            <p className="text-sm text-muted-foreground mt-1">Risiko yang perlu dinilai ulang setelah treatment diterapkan</p>
          </div>
          <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
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
                key: "riskId",
                render: (value) => <span className="font-medium">{String(value)}</span>,
              },
              {
                header: "Identified Risk",
                key: "identifiedRisk",
              },
              {
                header: "Category",
                key: "category",
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
                header: "Residual Score",
                key: "residualScore",
                render: (value) => (
                  <span className="inline-block rounded px-2 py-1 font-semibold text-xs bg-gray-100 text-gray-700">{String(value)}</span>
                ),
                searchable: false,
              },
              {
                header: "Residual Level",
                key: "residualLevel",
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
            <h2 className="text-lg font-semibold">Hasil Penilaian Ulang</h2>
            <p className="text-sm text-muted-foreground mt-1">Risiko yang sudah dinilai ulang dengan hasil terbaru</p>
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
                key: "riskId" as any,
                render: (value) => <span className="font-medium">{String(value)}</span>,
              },
              {
                header: "Identified Risk",
                key: "identifiedRisk" as any,
              },
              {
                header: "Category",
                key: "category" as any,
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
                header: "Residual Score",
                key: "residualScore" as any,
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Penilaian Ulang Risiko</DialogTitle>
          </DialogHeader>

          {selectedRisk && (
            <div className="space-y-4">
              <div className="rounded bg-gray-50 p-3">
                <p className="text-sm"><strong>Risk ID:</strong> {selectedRisk.riskId}</p>
                <p className="text-sm"><strong>Risk:</strong> {selectedRisk.identifiedRisk}</p>
                <p className="text-sm"><strong>Treatment:</strong> {selectedRisk.treatmentOption}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded bg-blue-50 p-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">RESIDUAL RISK</p>
                  <p className="mt-2 text-sm">
                    <strong>Severity:</strong> {selectedRisk.residualSeverity}
                  </p>
                  <p className="text-sm">
                    <strong>Likelihood:</strong> {selectedRisk.residualLikelihood}
                  </p>
                  <p className="text-sm">
                    <strong>Score:</strong> {selectedRisk.residualScore}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">EXPECTED TARGET</p>
                  <p className="text-sm text-muted-foreground">Hasil dari treatment yang direncanakan</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Severity (1-5)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={editForm.reassessedSeverity}
                    onChange={(e) => setEditForm((s) => ({ ...s, reassessedSeverity: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Likelihood (1-5)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={editForm.reassessedLikelihood}
                    onChange={(e) => setEditForm((s) => ({ ...s, reassessedLikelihood: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Catatan Penilaian</Label>
                <Input
                  placeholder="Masukkan catatan tentang penilaian ulang ini"
                  value={editForm.notes}
                  onChange={(e) => setEditForm((s) => ({ ...s, notes: e.target.value }))}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRiskId(null)}>
              Batal
            </Button>
            <Button onClick={saveReassessment}>Simpan Penilaian</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
