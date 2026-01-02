"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loadUsers, type User as StoreUser } from "@/lib/usersStore";
import { type Asset, AssetStatus } from "@/lib/assetsStore";
import { PaginatedTable, type ColumnDef } from "@/components/paginated-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { assetsApi } from "@/lib/api";
import { apiClient } from "@/lib/api/config";

type User = StoreUser;

interface AssetWithCheckbox extends Asset {
  selected?: boolean;
}

export default function BuatAjuanPage() {
  const router = useRouter();

  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalAssets, setTotalAssets] = React.useState(0);
  const [showModal, setShowModal] = React.useState(false);
  const [message, setMessage] = React.useState("");

  // Load users on client side
  React.useEffect(() => {
    setUsers(loadUsers());
  }, []);

  // Load assets from API with DISETUJUI_RM status filter
  React.useEffect(() => {
    const loadAssetsFromAPI = async () => {
      setIsLoading(true);
      try {
        const response = await assetsApi.getAssets(
          currentPage,
          20,
          "DISETUJUI_RM"
        );

        if (response?.status && response?.data?.data) {
          const mappedAssets: Asset[] = response.data.data.map((asset: any) => {
            let mappedStatus: AssetStatus = AssetStatus.DRAFT;
            const apiStatus = (asset.status || "").toUpperCase();

            if (apiStatus in AssetStatus) {
              mappedStatus = apiStatus as AssetStatus;
            }

            return {
              id: asset.id,
              name: asset.name,
              type: asset.type?.title || "",
              classification: asset.classification?.title || "",
              location: asset.location || "",
              status: mappedStatus,
              ownerId: asset.owner?.id,
              ownerName: asset.owner?.name,
              division: asset.owner?.department?.name,
            };
          });

          setAssets(mappedAssets);

          if (response.data.metadata) {
            setTotalPages(response.data.metadata.total_page);
            setTotalAssets(response.data.metadata.total_data);
          }
        } else {
          setAssets([]);
        }
      } catch (err) {
        console.error("Error loading assets:", err);
        toast.error("Gagal memuat daftar aset");
        setAssets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssetsFromAPI();
  }, [currentPage]);

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

  function handleAjukanClick() {
    if (selected.size === 0) {
      toast.error("Pilih minimal satu aset");
      return;
    }
    setShowModal(true);
  }

  async function handleSubmitApproval() {
    if (!message.trim()) {
      toast.error("Pesan tidak boleh kosong");
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        message: message.trim(),
        assetIds: Array.from(selected),
      };

      const response = await apiClient.post("/asset-approvals", payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(
          `${selected.size} aset berhasil diajukan untuk persetujuan final`
        );
        setSelected(new Set());
        setMessage("");
        setShowModal(false);
        router.back();
      } else {
        toast.error("Gagal mengirim pengajuan persetujuan");
      }
    } catch (err) {
      console.error("Error submitting approval:", err);
      toast.error("Gagal mengirim pengajuan persetujuan");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Buat Pengajuan Persetujuan Final Aset
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Pilih aset yang telah disetujui Risk Manager untuk diajukan ke Top Level Management
          </p>
        </div>
        <Button
          onClick={handleAjukanClick}
          disabled={selected.size === 0}
          className="bg-sky-600 hover:bg-sky-700 text-white disabled:bg-sky-400"
        >
          Ajukan ({selected.size} aset)
        </Button>
      </div>

      {(() => {
        const columns: ColumnDef<Asset>[] = [
          {
            header: (
              <input
                type="checkbox"
                checked={selected.size === assets.length && assets.length > 0}
                onChange={toggleAll}
                ref={(el) => {
                  if (el) {
                    (el as HTMLInputElement).indeterminate =
                      selected.size > 0 && selected.size < assets.length;
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
            searchable: false,
          },
          {
            header: "No",
            key: "id",
            render: (_: any, row: Asset) => {
              const index = assets.findIndex((a) => a.id === row.id);
              return <span className="text-gray-600">{index + 1}</span>;
            },
            searchable: false,
          },
          {
            header: "Nama Aset",
            key: "name",
            render: (value) => (
              <span className="font-medium">{String(value)}</span>
            ),
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
            header: "Lokasi",
            key: "location",
          },
          {
            header: "Owner",
            key: "ownerName",
          },
          {
            header: "Divisi",
            key: "division",
          },
          {
            header: "Status",
            key: "status",
            render: (value: any) => {
              const status = String(value || AssetStatus.DRAFT);
              let statusClass = "bg-lime-100 text-lime-700";
              let statusLabel = "Disetujui RM";

              return (
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}
                >
                  {statusLabel}
                </span>
              );
            },
            searchable: false,
          },
        ];

        return (
          <PaginatedTable<Asset>
            data={assets}
            columns={columns}
            pageSize={20}
            emptyMessage="Belum ada aset dengan status Disetujui RM"
          />
        );
      })()}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Menampilkan halaman {currentPage} dari {totalPages} ({totalAssets}{" "}
            total aset)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-sky-200 text-sky-700 hover:bg-sky-50"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Sebelumnya
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  className={currentPage === i + 1 ? "bg-sky-600 hover:bg-sky-700 text-white" : "border-sky-200 text-sky-700 hover:bg-sky-50"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  disabled={isLoading}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              className="border-sky-200 text-sky-700 hover:bg-sky-50"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages || isLoading}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Approval Message Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader className="border-b border-sky-100 pb-4">
            <DialogTitle className="text-2xl text-gray-900">Ajukan Persetujuan Final Aset</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Masukkan pesan untuk persetujuan {selected.size} aset ke top level
              management
            </DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Pesan Persetujuan</FieldLabel>
            <Textarea
              placeholder="Contoh: Persetujuan untuk aset-aset berikut ke top level management"
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setMessage(e.target.value)
              }
              rows={4}
              className="border-sky-200 focus:border-sky-400 focus:ring-sky-100"
            />
          </Field>

          <DialogFooter className="border-t border-sky-100 pt-4 mt-6">
            <div className="flex justify-end w-full gap-2">
              <Button
                variant="outline"
                className="border-sky-200 text-sky-700 hover:bg-sky-50"
                onClick={() => {
                  setShowModal(false);
                  setMessage("");
                }}
                disabled={isSending}
              >
                Batal
              </Button>
              <Button
                className="bg-sky-600 hover:bg-sky-700 text-white disabled:bg-sky-400"
                onClick={handleSubmitApproval}
                disabled={isSending || !message.trim()}
              >
                {isSending ? "Mengirim..." : "Kirim Persetujuan"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
