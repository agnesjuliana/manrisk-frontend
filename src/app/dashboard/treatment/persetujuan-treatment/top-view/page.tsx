"use client";

import * as React from "react";
import { loadTreatments, saveTreatments, type Treatment } from "@/lib/treatmentsStore";
import { loadRisks } from "@/lib/risksStore";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

export default function TopTreatmentApprovalPage() {
  const [treatments, setTreatments] = React.useState<Treatment[]>(() => {
    if (typeof window === "undefined") return [];
    return loadTreatments();
  });

  const risks = React.useMemo(() => loadRisks(), []);
  const riskMap = React.useMemo(() => new Map(risks.map((r) => [r.id, r])), [risks]);

  function approve(id: string) {
    setTreatments((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, approvalStatus: ("APPROVED" as const) } : t
      );
      saveTreatments(next);
      return next;
    });
  }

  function remove(id: string) {
    setTreatments((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTreatments(next);
      return next;
    });
  }

  const submittedTreatments = treatments.filter((t) => t.approvalStatus === "SUBMITTED");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Persetujuan Treatment (Top Management)</h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Treatment ID</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Risk Title</TableHead>
            <TableHead>Treatment Option</TableHead>
            <TableHead>Target Residual</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Controls</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submittedTreatments.map((t) => {
            const risk = riskMap.get(t.riskId);
            return (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.id}</TableCell>
                <TableCell>{t.riskId}</TableCell>
                <TableCell>{risk?.identifiedRisk ?? "-"}</TableCell>
                <TableCell>{t.option}</TableCell>
                <TableCell>
                  {t.target ? (
                    <span>
                      L:{t.target.likelihood ?? "-"} / I:{t.target.impact ?? "-"}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate">{t.reason ?? "-"}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {t.controls && t.controls.length > 0 ? t.controls.join(", ") : "-"}
                </TableCell>
                <TableCell>{t.approvalStatus}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button onClick={() => approve(t.id)} size="sm">
                      Setujui
                    </Button>
                    <Button variant="ghost" className="text-destructive" onClick={() => remove(t.id)} size="sm">
                      <Trash />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableCaption>{submittedTreatments.length} treatment submitted</TableCaption>
      </Table>
    </div>
  );
}
