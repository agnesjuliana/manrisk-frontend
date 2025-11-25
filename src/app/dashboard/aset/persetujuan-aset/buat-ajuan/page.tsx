"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { loadAssets, type Asset } from "@/lib/assetsStore";
import { createSubmission, saveSubmissions, loadSubmissions } from "@/lib/assetsSubmissionStore";
import { loadUsers } from "@/lib/usersStore";
import { PaginatedTable, type ColumnDef } from "@/components/paginated-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AssetWithCheckbox extends Asset {
  selected?: boolean;
}

export default function BuatAjuanPage() {
  const router = useRouter();
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

  function toggleAll() {
    if (selected.size === assets.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(assets.map((a) => a.id)));
    }
  }

  function submitSubmission() {
    if (selected.size === 0) return;

    const newSubmission = createSubmission(Array.from(selected));
    const submissions = loadSubmissions();
    submissions.push(newSubmission);
    saveSubmissions(submissions);

    router.push("/dashboard/aset/persetujuan-aset/rm-view");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-1"
          >
            <ArrowLeft size={16} /> Kembali
          </Button>
          <h1 className="text-2xl font-semibold">Buat Ajuan Persetujuan Aset</h1>
        </div>
        <Button onClick={submitSubmission} disabled={selected.size === 0}>
          Ajukan ({selected.size} aset)
        </Button>
      </div>

      <PaginatedTable<Asset>
        data={assets}
        columns={[
          {
            header: (
              <input
                type="checkbox"
                checked={selected.size === assets.length && assets.length > 0}
                onChange={toggleAll}
                ref={(el) => {
                  if (el) {
                    (el as HTMLInputElement).indeterminate = selected.size > 0 && selected.size < assets.length;
                  }
                }}
              />
            ) as unknown as string,
            key: "id",
            render: (value: unknown) => (
              <input
                type="checkbox"
                checked={selected.has(String(value))}
                onChange={() => toggle(String(value))}
              />
            ),
          },
          {
            header: "Nama Aset",
            key: "name",
            render: (value) => <span className="font-medium">{String(value)}</span>,
          },
          {
            header: "Tipe",
            key: "type",
          },
          {
            header: "Owner",
            key: (row: Asset) => {
              const owner = users.find((u) => u.id === row.ownerId);
              return owner?.name ?? "-";
            },
          },
          {
            header: "Lokasi",
            key: (row: Asset) => row.location ?? "-",
          },
          {
            header: "Status",
            key: (row: Asset) => row.status ?? "PENDING",
            render: (value) => (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {String(value)}
              </span>
            ),
          },
        ]}
        pageSize={10}
        emptyMessage="Belum ada aset yang terdaftar"
      />
    </div>
  );
}
