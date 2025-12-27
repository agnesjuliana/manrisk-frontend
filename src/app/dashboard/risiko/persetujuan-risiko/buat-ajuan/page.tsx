"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loadUsers, type User as StoreUser } from "@/lib/usersStore";
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
import { apiClient } from "@/lib/api/config";

type User = StoreUser;

interface Risk {
  id: string;
  name: string;
  description?: string;
  likelihood?: string;
  impact?: string;
  inherentRisk?: number;
  owner?: {
    id: string;
    name: string;
  };
}

export default function BuatAjuanPage() {
  const router = useRouter();

  const [risks, setRisks] = React.useState<Risk[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalRisks, setTotalRisks] = React.useState(0);
  const [showModal, setShowModal] = React.useState(false);
  const [message, setMessage] = React.useState("");

  // Load users on client side
  React.useEffect(() => {
    setUsers(loadUsers());
  }, []);

  // Load risks from API with DISETUJUI_RM status filter
  React.useEffect(() => {
    const loadRisksFromAPI = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get("/risks", {
          params: {
            page: currentPage,
            per_page: 20,
            status: "DISETUJUI_RM",
          },
        });

        if (response.data?.status && response.data?.data?.data) {
          const mappedRisks: Risk[] = response.data.data.data.map(
            (risk: any) => ({
              id: risk.id,
              name: risk.name,
              description: risk.description || "",
              likelihood: risk.likelihood || "",
              impact: risk.impact || "",
              inherentRisk: risk.inherentRisk || 0,
              owner: risk.owner,
            })
          );

          setRisks(mappedRisks);

          if (response.data.data.metadata) {
            setTotalPages(response.data.data.metadata.total_page);
            setTotalRisks(response.data.data.metadata.total_data);
          }
        } else {
          setRisks([]);
        }
      } catch (err) {
        console.error("Error loading risks:", err);
        toast.error("Gagal memuat daftar risiko");
        setRisks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRisksFromAPI();
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
    if (selected.size === risks.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(risks.map((r) => r.id)));
    }
  }

  function handleAjukanClick() {
    if (selected.size === 0) {
      toast.error("Pilih minimal satu risiko");
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
        riskIds: Array.from(selected),
      };

      const response = await apiClient.post("/risk-approvals", payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(
          `${selected.size} risiko berhasil diajukan untuk persetujuan final`
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
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">
            Buat Pengajuan Persetujuan Final Risiko
          </h1>
        </div>
        <Button
          onClick={handleAjukanClick}
          disabled={selected.size === 0}
        >
          Ajukan ({selected.size} risiko)
        </Button>
      </div>

      {(() => {
        const columns: ColumnDef<Risk>[] = [
          {
            header: (
              <input
                type="checkbox"
                checked={selected.size === risks.length && risks.length > 0}
                onChange={toggleAll}
                ref={(el) => {
                  if (el) {
                    (el as HTMLInputElement).indeterminate =
                      selected.size > 0 && selected.size < risks.length;
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
            render: (_: any, row: Risk) => {
              const index = risks.findIndex((r) => r.id === row.id);
              return <span className="text-gray-600">{index + 1}</span>;
            },
            searchable: false,
          },
          {
            header: "Nama Risiko",
            key: "name",
            render: (value) => (
              <span className="font-medium">{String(value)}</span>
            ),
          },
          {
            header: "Deskripsi",
            key: "description",
            render: (value) => (
              <span className="text-sm text-gray-600 truncate max-w-xs">
                {String(value ?? "-")}
              </span>
            ),
          },
          {
            header: "Owner",
            key: "owner",
            render: (value: any) => value?.name || "-",
          },
          {
            header: "Likelihood",
            key: "likelihood",
          },
          {
            header: "Impact",
            key: "impact",
          },
          {
            header: "Status",
            key: "id",
            render: (value: any) => {
              return (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-lime-100 text-lime-700`}>
                  Disetujui RM
                </span>
              );
            },
            searchable: false,
          },
        ];

        return (
          <PaginatedTable<Risk>
            data={risks}
            columns={columns}
            pageSize={20}
            emptyMessage="Belum ada risiko dengan status Disetujui RM"
          />
        );
      })()}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Menampilkan halaman {currentPage} dari {totalPages} ({totalRisks}{" "}
            total risiko)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
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
          <DialogHeader>
            <DialogTitle>Ajukan Persetujuan Final Risiko</DialogTitle>
            <DialogDescription>
              Masukkan pesan untuk persetujuan {selected.size} risiko ke top level
              management
            </DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel>Pesan Persetujuan</FieldLabel>
            <Textarea
              placeholder="Contoh: Persetujuan untuk risiko-risiko berikut ke top level management"
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setMessage(e.target.value)
              }
              rows={4}
            />
          </Field>

          <DialogFooter>
            <div className="flex justify-end w-full gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setMessage("");
                }}
                disabled={isSending}
              >
                Batal
              </Button>
              <Button
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
