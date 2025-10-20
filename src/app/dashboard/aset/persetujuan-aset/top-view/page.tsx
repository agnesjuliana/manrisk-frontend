"use client";

import * as React from "react";
import { loadAssets, saveAssets, type Asset } from "@/lib/assetsStore";
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

export default function TopApprovalPage() {
  const [assets, setAssets] = React.useState<Asset[]>(() => {
    if (typeof window === "undefined") return [];
    return loadAssets();
  });

  const users = loadUsers();

  function approve(id: string) {
    setAssets((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, status: ("APPROVED_BY_TOP" as Asset["status"]) } : a));
      saveAssets(next);
      return next;
    });
  }

  function remove(id: string) {
    setAssets((prev) => {
      const next = prev.filter((a) => a.id !== id);
      saveAssets(next);
      return next;
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Persetujuan Aset (Top Management)</h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Aset</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Lokasi</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets
            .filter((a) => a.status === "SUBMITTED_TO_TOP")
            .map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell>{users.find((u) => u.id === a.ownerId)?.name ?? "-"}</TableCell>
                <TableCell>{a.status}</TableCell>
                <TableCell>{a.location ?? "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button onClick={() => approve(a.id)}>Setujui</Button>
                    <Button variant="ghost" className="text-destructive" onClick={() => remove(a.id)}>
                      <Trash />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
        <TableCaption>{assets.filter((a) => a.status === "SUBMITTED_TO_TOP").length} request</TableCaption>
      </Table>
    </div>
  );
}
