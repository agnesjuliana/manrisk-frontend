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

export default function RmTreatmentApprovalPage() {
  const [treatments, setTreatments] = React.useState<Treatment[]>(() => {
    if (typeof window === "undefined") return [];
    return loadTreatments();
  });

  const risks = React.useMemo(() => loadRisks(), []);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  }

  function approveSelected() {
    setTreatments((prev) => {
      const next = prev.map((t) =>
        selected.has(t.id) ? { ...t, approvalStatus: ("SUBMITTED" as const) } : t
      );
      saveTreatments(next);
      return next;
    });
    setSelected(new Set());
  }

  function submitToTop() {
    // submit all treatments that are SUBMITTED (approved by RM)
    setTreatments((prev) => {
      const next = prev.map((t) =>
        t.approvalStatus === "SUBMITTED" ? { ...t, approvalStatus: ("SUBMITTED" as const) } : t
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

  const draftTreatments = treatments.filter((t) => t.approvalStatus === "DRAFT" || !t.approvalStatus);
  const riskMap = React.useMemo(() => new Map(risks.map((r) => [r.id, r])), [risks]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Persetujuan Treatment (Risk Manager)</h1>
        <div className="flex gap-2">
          <Button onClick={approveSelected} disabled={selected.size === 0}>
            Setujui yang dipilih
          </Button>
          <Button variant="outline" onClick={submitToTop}>
            Ajukan ke Top Management
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <input
                type="checkbox"
                checked={draftTreatments.length > 0 && selected.size === draftTreatments.length}
                onChange={(e) => {
                  if (e.currentTarget.checked) {
                    const all = new Set(draftTreatments.map((t) => t.id));
                    setSelected(all);
                  } else setSelected(new Set());
                }}
              />
            </TableHead>
            <TableHead>Treatment ID</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Risk Title</TableHead>
            <TableHead>Treatment Option</TableHead>
            <TableHead>Target Residual</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {draftTreatments.map((t) => {
            const risk = riskMap.get(t.riskId);
            return (
              <TableRow key={t.id}>
                <TableCell>
                  {!t.approvalStatus || t.approvalStatus === "DRAFT" ? (
                    <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggle(t.id)} />
                  ) : null}
                </TableCell>
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
                <TableCell>{t.approvalStatus ?? "DRAFT"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="text-destructive" onClick={() => remove(t.id)}>
                      <Trash />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableCaption>{draftTreatments.length} treatment draft</TableCaption>
      </Table>
    </div>
  );
}
