"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { loadAssets, saveAssets, type Asset } from "@/lib/assetsStore";
import { loadUsers, type User as StoreUser } from "@/lib/usersStore";
import { PaginatedTable } from "@/components/paginated-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Eye, History } from "lucide-react";

interface AssetWithNotes extends Asset {
  rmNotes?: string;
}

export default function RmApprovalPage() {
  const router = useRouter();
  const [assets, setAssets] = React.useState<AssetWithNotes[]>(() => {
    if (typeof window === "undefined") return [];
    return loadAssets() as AssetWithNotes[];
  });
  const [users, setUsers] = React.useState<StoreUser[]>(() => {
    if (typeof window === "undefined") return [];
    return loadUsers();
  });

  const [selectedAssetId, setSelectedAssetId] = React.useState<string | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = React.useState(false);
  const [acceptNotes, setAcceptNotes] = React.useState("");

  function getStatusBadgeColor(status?: string) {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "APPROVED_BY_RM":
        return "bg-green-100 text-green-700";
      case "REVISION":
        return "bg-orange-100 text-orange-700";
      case "SUBMITTED_TO_TOP":
        return "bg-blue-100 text-blue-700";
      case "APPROVED_BY_TOP":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function handleAcceptAsset() {
    if (!selectedAssetId) return;

    const updatedAssets = assets.map((a) =>
      a.id === selectedAssetId
        ? {
            ...a,
            status: "APPROVED_BY_RM" as const,
            rmNotes: acceptNotes,
          }
        : a
    );

    setAssets(updatedAssets);
    saveAssets(updatedAssets);

    setSelectedAssetId(null);
    setAcceptNotes("");
    setShowAcceptDialog(false);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Daftar Aset untuk Persetujuan RM</h1>
        <Button
          onClick={() => router.push("/dashboard/aset/persetujuan-aset/rm-view/history")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <History size={18} />
          Lihat History Pengajuan
        </Button>
      </div>

      <PaginatedTable<AssetWithNotes>
        data={assets}
        columns={[
          {
            header: "No",
            key: "id",
            render: (_, row) => {
              const index = assets.findIndex((a) => a.id === row.id);
              return <span className="text-gray-600">{index + 1}</span>;
            },
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
          {
            header: "Status",
            key: "status",
            render: (value) => (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(String(value))}`}>
                {String(value ?? "PENDING")}
              </span>
            ),
            searchable: false,
          },
          {
            header: "Aksi",
            key: "id",
            render: (_, row) => (
              <div className="flex items-center gap-2">
                {row.status === "PENDING" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedAssetId(row.id);
                      setShowAcceptDialog(true);
                    }}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle size={16} />
                    Accept
                  </Button>
                )}
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                  <Eye size={18} className="text-gray-600" />
                </button>
              </div>
            ),
            searchable: false,
          },
        ]}
        pageSize={10}
        emptyMessage="Tidak ada aset yang tersedia"
      />

      {/* Accept Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terima Aset</DialogTitle>
            <DialogDescription>
              Anda akan menerima aset ini untuk diajukan ke top management.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Catatan RM (Opsional)</label>
              <Textarea
                placeholder="Masukkan catatan atau rekomendasi..."
                value={acceptNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAcceptNotes(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleAcceptAsset} className="bg-green-600 hover:bg-green-700">
              Terima Aset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
