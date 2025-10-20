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

export default function TopRiskApprovalPage() {
  const [risks, setRisks] = React.useState<Risk[]>(() => {
    if (typeof window === "undefined") return [];
    return loadRisks();
  });

  const users = loadUsers();

  function approve(id: string) {
    setRisks((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, status: ("APPROVED" as Risk["status"]) } : r));
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
        <h1 className="text-2xl font-semibold">Persetujuan Risiko (Top Management)</h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Risk ID</TableHead>
            <TableHead>Identified Risk</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {risks
            .filter((r) => r.status === "SUBMITTED")
            .map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.id}</TableCell>
                <TableCell>{r.identifiedRisk}</TableCell>
                <TableCell>{users.find((u) => u.id === r.ownerId)?.name ?? r.unit ?? "-"}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button onClick={() => approve(r.id)}>Setujui</Button>
                    <Button variant="ghost" className="text-destructive" onClick={() => remove(r.id)}>
                      <Trash />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
        <TableCaption>{risks.filter((r) => r.status === "SUBMITTED").length} request</TableCaption>
      </Table>
    </div>
  );
}
