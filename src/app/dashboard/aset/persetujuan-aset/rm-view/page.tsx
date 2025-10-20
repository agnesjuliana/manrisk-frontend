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

export default function RmApprovalPage() {
  const [assets, setAssets] = React.useState<Asset[]>(() => {
    if (typeof window === "undefined") return [];
    return loadAssets();
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
    setAssets((prev) => {
      const next = prev.map((a) =>
        selected.has(a.id) ? { ...a, status: ("APPROVED_BY_RM" as Asset["status"]) } : a
      );
      saveAssets(next);
      return next;
    });
    setSelected(new Set());
  }

  function submitToTop() {
    // submit all assets that are APPROVED_BY_RM
    setAssets((prev) => {
      const next = prev.map((a) =>
        a.status === "APPROVED_BY_RM" ? { ...a, status: ("SUBMITTED_TO_TOP" as Asset["status"]) } : a
      );
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
        <h1 className="text-2xl font-semibold">Persetujuan Aset (Risk Manager)</h1>
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
                    assets.filter((a) => a.status === "PENDING").length > 0 &&
                    selected.size === assets.filter((a) => a.status === "PENDING").length
                  }
                  onChange={(e) => {
                    if (e.currentTarget.checked) {
                      const all = new Set(assets.filter((a) => a.status === "PENDING").map((a) => a.id));
                      setSelected(all);
                    } else setSelected(new Set());
                  }}
                />
              </TableHead>
              <TableHead>Nama Aset</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  {a.status === "PENDING" ? (
                    <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggle(a.id)} />
                  ) : null}
                </TableCell>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell>{users.find((u) => u.id === a.ownerId)?.name ?? "-"}</TableCell>
                <TableCell>{a.status ?? "-"}</TableCell>
                <TableCell>{a.location ?? "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="text-destructive" onClick={() => remove(a.id)}>
                      <Trash />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableCaption>{assets.length} aset</TableCaption>
        </Table>
      </div>
    );
  }
