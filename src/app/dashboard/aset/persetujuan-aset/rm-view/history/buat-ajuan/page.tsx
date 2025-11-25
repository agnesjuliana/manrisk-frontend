"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { loadAssets, type Asset } from "@/lib/assetsStore";
import { loadUsers } from "@/lib/usersStore";
import { createSubmission, saveSubmissions, loadSubmissions } from "@/lib/assetsSubmissionStore";
import { PaginatedTable } from "@/components/paginated-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AssetWithCheckbox extends Asset {
  selected?: boolean;
}

export default function BuatAjuanRmPage() {
  const router = useRouter();
  const [assets, setAssets] = React.useState<AssetWithCheckbox[]>(() => {
    if (typeof window === "undefined") return [];
    // Only show assets that are APPROVED_BY_RM
    return (loadAssets() as AssetWithCheckbox[]).filter((a) => a.status === "APPROVED_BY_RM");
  });
  const [users, setUsers] = React.useState(() => {
    if (typeof window === "undefined") return [];
    return loadUsers();
  });

  const [selected, setSelected] = React.useState(new Set<string>());

  function toggle(id: string) {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  }

  function handleSubmitToTop() {
    if (selected.size === 0) return;

    const selectedAssetIds = Array.from(selected);
    const submission = createSubmission(selectedAssetIds);

    const allSubmissions = loadSubmissions();
    allSubmissions.push(submission);
    saveSubmissions(allSubmissions);

    router.push("/dashboard/aset/persetujuan-aset/rm-view/history");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Buat Pengajuan ke Top Management</h1>
        <Button
          onClick={() => router.push("/dashboard/aset/persetujuan-aset/rm-view/history")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Kembali
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        Pilih aset yang telah diterima untuk diajukan ke top management. Total aset terpilih: <strong>{selected.size}</strong>
      </div>

      <PaginatedTable<AssetWithCheckbox>
        data={assets}
        columns={[
          {
            header: "Pilih",
            key: "id",
            render: (value) => (
              <input
                type="checkbox"
                checked={selected.has(String(value))}
                onChange={() => toggle(String(value))}
                className="w-4 h-4"
              />
            ),
            searchable: false,
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
            header: "Klasifikasi",
            key: "classification",
          },
          {
            header: "Pemilik",
            key: (row) => {
              const owner = users.find((u) => u.id === row.ownerId);
              return owner?.name ?? "-";
            },
          },
          {
            header: "Lokasi",
            key: (row) => row.location ?? "-",
          },
        ]}
        pageSize={10}
        emptyMessage="Tidak ada aset yang telah diterima"
      />

      <div className="flex gap-2 justify-end">
        <Button
          onClick={() => router.push("/dashboard/aset/persetujuan-aset/rm-view/history")}
          variant="outline"
        >
          Batal
        </Button>
        <Button
          onClick={handleSubmitToTop}
          disabled={selected.size === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Ajukan {selected.size} Aset ke Top Management
        </Button>
      </div>
    </div>
  );
}
