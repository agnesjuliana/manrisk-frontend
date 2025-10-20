"use client";

import * as React from "react";
import { loadRisks, saveRisks, type Risk } from "@/lib/risksStore";
import { loadUsers } from "@/lib/usersStore";
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

export default function RmRiskApprovalPage() {
  const [risks, setRisks] = React.useState<Risk[]>(() => {
    if (typeof window === "undefined") return [];
    return loadRisks();
  });

  const users = loadUsers();
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
    setRisks((prev) => {
      const next = prev.map((r) =>
        selected.has(r.id) ? { ...r, status: ("APPROVED" as Risk["status"]) } : r
      );
      saveRisks(next);
      return next;
    });
    setSelected(new Set());
  }

  function submitToTop() {
    setRisks((prev) => {
      const next = prev.map((r) =>
        r.status === "APPROVED" ? { ...r, status: ("SUBMITTED" as Risk["status"]) } : r
      );
      saveRisks(next);
      return next;
    });
  }

  function remove(id: string) {
    setRisks((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveRisks(next);
      return next;
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Persetujuan Risiko (Risk Manager)</h1>
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
                checked={
                  risks.filter((r) => r.status === "DRAFT").length > 0 &&
                  selected.size === risks.filter((r) => r.status === "DRAFT").length
                }
                onChange={(e) => {
                  if (e.currentTarget.checked) {
                    const all = new Set(risks.filter((r) => r.status === "DRAFT").map((r) => r.id));
                    setSelected(all);
                  } else setSelected(new Set());
                }}
              />
            </TableHead>
            <TableHead>Risk ID</TableHead>
            <TableHead>Identified Risk</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {risks.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                {r.status === "DRAFT" ? (
                  <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
                ) : null}
              </TableCell>
              <TableCell className="font-medium">{r.id}</TableCell>
              <TableCell>{r.identifiedRisk}</TableCell>
              <TableCell>{users.find((u) => u.id === r.ownerId)?.name ?? r.unit ?? "-"}</TableCell>
              <TableCell>{r.status}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" className="text-destructive" onClick={() => remove(r.id)}>
                    <Trash />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>{risks.length} risiko</TableCaption>
      </Table>
    </div>
  );
}
