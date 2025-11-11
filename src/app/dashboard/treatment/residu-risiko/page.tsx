"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { loadRisks } from "@/lib/risksStore";
import { loadTreatments } from "@/lib/treatmentsStore";

const RISK_SCORE_RANGES = [
  { min: 1, max: 5, label: "Low", color: "bg-green-200" },
  { min: 6, max: 10, label: "Medium", color: "bg-yellow-200" },
  { min: 11, max: 15, label: "High", color: "bg-orange-200" },
  { min: 16, max: 25, label: "Critical", color: "bg-red-200" },
];

function computeScore(severity: number, likelihood: number): number {
  return severity * likelihood;
}

function computeRiskLevel(score: number): { label: string; color: string } {
  const range = RISK_SCORE_RANGES.find((r) => score >= r.min && score <= r.max);
  return range ? { label: range.label, color: range.color } : { label: "Unknown", color: "bg-gray-200" };
}

export default function ResiduRisikoPage() {
  const risks = useMemo(() => loadRisks(), []);
  const treatments = useMemo(() => loadTreatments(), []);
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);

  const risksWithResidual = useMemo(() => {
    return risks
      .filter((r) => treatments.some((t) => t.riskId === r.id && t.approvalStatus === "APPROVED"))
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
          riskId: r.id,
          identifiedRisk: r.identifiedRisk,
          category: r.category,
          treatmentOption: treatment?.option,
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
  }, [risks, treatments]);

  const selectedRisk = risksWithResidual.find((r) => r.riskId === selectedRiskId);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Residu Risiko</h1>
        <p className="text-sm text-muted-foreground">{risksWithResidual.length} risiko dengan treatment</p>
      </div>

      <div className="rounded-xl bg-muted/50 p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Risk ID</TableHead>
              <TableHead>Identified Risk</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Treatment Option</TableHead>
              <TableHead colSpan={3} className="text-center">
                Original Risk
              </TableHead>
              <TableHead colSpan={3} className="text-center">
                Residual Risk
              </TableHead>
              <TableHead className="text-right">Reduction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {risksWithResidual.map((r) => (
              <TableRow key={r.riskId}>
                <TableCell className="w-20 font-medium">{r.riskId}</TableCell>
                <TableCell>
                  <Dialog open={selectedRiskId === r.riskId} onOpenChange={(open) => setSelectedRiskId(open ? r.riskId : null)}>
                    <DialogTrigger asChild>
                      <button className="text-left text-blue-600 underline hover:text-blue-800">{r.identifiedRisk}</button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{r.riskId} - {r.identifiedRisk}</DialogTitle>
                      </DialogHeader>
                      {selectedRisk && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="rounded border p-3">
                              <p className="text-xs font-semibold text-muted-foreground">ORIGINAL RISK</p>
                              <p className="mt-2 text-sm">
                                <strong>Severity:</strong> {selectedRisk.originalSeverity}
                              </p>
                              <p className="text-sm">
                                <strong>Likelihood:</strong> {selectedRisk.originalLikelihood}
                              </p>
                              <p className="text-sm">
                                <strong>Score:</strong> {selectedRisk.originalScore}
                              </p>
                              <p className={`mt-2 inline-block rounded px-2 py-1 text-sm font-semibold ${selectedRisk.originalLevel.color}`}>
                                {selectedRisk.originalLevel.label}
                              </p>
                            </div>

                            <div className="rounded border p-3">
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
                              <p className={`mt-2 inline-block rounded px-2 py-1 text-sm font-semibold ${selectedRisk.residualLevel.color}`}>
                                {selectedRisk.residualLevel.label}
                              </p>
                            </div>
                          </div>

                          <div className="rounded bg-blue-50 p-3">
                            <p className="text-xs font-semibold text-muted-foreground">TREATMENT APPLIED</p>
                            <p className="mt-2 text-sm">
                              <strong>Option:</strong> {selectedRisk.treatmentOption}
                            </p>
                            <p className="text-sm">
                              <strong>Risk Reduction:</strong> {selectedRisk.reduction} points ({selectedRisk.reductionPercent}%)
                            </p>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell>{r.category}</TableCell>
                <TableCell>{r.treatmentOption}</TableCell>

                {/* Original Risk */}
                <TableCell className="text-center">{r.originalSeverity}</TableCell>
                <TableCell className="text-center">{r.originalLikelihood}</TableCell>
                <TableCell className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={`inline-block rounded px-2 py-1 font-semibold ${r.originalLevel.color}`}>{r.originalScore}</span>
                      </TooltipTrigger>
                      <TooltipContent>{r.originalLevel.label}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>

                {/* Residual Risk */}
                <TableCell className="text-center">{r.residualSeverity}</TableCell>
                <TableCell className="text-center">{r.residualLikelihood}</TableCell>
                <TableCell className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={`inline-block rounded px-2 py-1 font-semibold ${r.residualLevel.color}`}>{r.residualScore}</span>
                      </TooltipTrigger>
                      <TooltipContent>{r.residualLevel.label}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>

                <TableCell className="text-right">
                  <div>
                    <p className="text-sm font-semibold">{r.reduction}</p>
                    <p className="text-xs text-muted-foreground">({r.reductionPercent}%)</p>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableCaption>
            {risksWithResidual.length === 0
              ? "Tidak ada risiko dengan treatment yang approved. Silakan buat dan approve treatment terlebih dahulu."
              : `Menampilkan ${risksWithResidual.length} risiko dengan treatment yang telah diapprove.`}
          </TableCaption>
        </Table>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Risks Treated</p>
          <p className="mt-2 text-2xl font-bold">{risksWithResidual.length}</p>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Avg Risk Reduction</p>
          <p className="mt-2 text-2xl font-bold">
            {risksWithResidual.length > 0 ? Math.round(risksWithResidual.reduce((sum, r) => sum + r.reductionPercent, 0) / risksWithResidual.length) : 0}%
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Score Reduction</p>
          <p className="mt-2 text-2xl font-bold">{risksWithResidual.reduce((sum, r) => sum + r.reduction, 0)}</p>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Critical Residuals</p>
          <p className="mt-2 text-2xl font-bold">{risksWithResidual.filter((r) => r.residualLevel.label === "Critical").length}</p>
        </div>
      </div>
    </div>
  );
}
