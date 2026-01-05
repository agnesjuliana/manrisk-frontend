"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loadUsers, type User as StoreUser } from "@/lib/usersStore";
import { PaginatedTable, type ColumnDef } from "@/components/paginated-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye } from "lucide-react";
import { apiClient } from "@/lib/api/config";
import { useAuth } from "@/hooks/use-auth";

type User = StoreUser;

interface Risk {
  id: string;
  customRiskId: string;
  vulnerability: string;
  threat: string;
  identifiedRisk: string;
  assetId?: string;
  contextId?: string;
  detail?: string;
  isConfidentiality?: boolean;
  isIntegrity?: boolean;
  isAvailability?: boolean;
  impactSeverity?: number;
  likelihoodOccurence?: number;
  detection?: number;
  status: string;
  category?: { id: string; title: string };
  source?: { id: string; title: string };
  asset?: { id: string; name: string };
  context?: { id: string; name: string };
  owner?: { id: string; name: string };
  createdAt: string;
  updatedAt?: string;
}

export default function BuatAjuanPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  // ALL STATE DECLARATIONS FIRST (never conditional)
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
  const [selectedRisk, setSelectedRisk] = React.useState<Risk | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [riskCriteria, setRiskCriteria] = React.useState<any>(null);

  // Role variables
  const isRiskManager = user?.role === "RISK_MANAGER";
  const isTopManagement = user?.role === "TOP_MANAGEMENT";

  // THEN EFFECTS
  // Check if user has allowed roles
  React.useEffect(() => {
    if (!isAuthLoading && !isRiskManager && !isTopManagement) {
      toast.error("Akses ditolak. Hanya Risk Manager dan Top Management yang dapat akses halaman ini.");
      router.back();
    }
  }, [isAuthLoading, isRiskManager, isTopManagement, router]);

  // Load users on client side
  React.useEffect(() => {
    setUsers(loadUsers());
  }, []);

  // Load risk criteria and users on client side
  React.useEffect(() => {
    const loadCriteria = async () => {
      try {
        const response = await apiClient.get("/risk-criteria");
        if (response.data?.data) {
          setRiskCriteria(response.data.data);
        }
      } catch (err) {
        console.error("Error loading risk criteria:", err);
      }
    };

    loadCriteria();
  }, []);

  // Load risks from API with DISETUJUI_RM status filter
  React.useEffect(() => {
    if (isAuthLoading || (!isRiskManager && !isTopManagement)) return;

    const loadRisksFromAPI = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get("/risk-registers", {
          params: {
            page: currentPage,
            per_page: 20,
            status: "DISETUJUI_RM",
          },
        });

        if (response.data?.status && response.data?.data?.data) {
          setRisks(response.data.data.data);

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
  }, [currentPage, isAuthLoading, isRiskManager, isTopManagement]);

  // Show loading skeleton while checking auth
  if (isAuthLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // If user doesn't have allowed roles, don't render anything (will redirect)
  if (!isRiskManager && !isTopManagement) {
    return null;
  }

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

  function handleViewDetail(risk: Risk) {
    setSelectedRisk(risk);
    setDetailOpen(true);
  }

  function getStatusBadgeColor(status?: string) {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-700";
      case "MENUNGGU_PERSETUJUAN_RM":
        return "bg-yellow-100 text-yellow-700";
      case "DISETUJUI_RM":
        return "bg-lime-100 text-lime-700";
      case "MENUNGGU_PERSETUJUAN_FINAL":
        return "bg-blue-100 text-blue-700";
      case "REVISI":
        return "bg-orange-100 text-orange-700";
      case "DISETUJUI":
        return "bg-green-100 text-green-700";
      case "DITOLAK":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function getStatusLabel(status?: string) {
    const statusMap: Record<string, string> = {
      DRAFT: "Draft",
      MENUNGGU_PERSETUJUAN_RM: "Menunggu Persetujuan RM",
      DISETUJUI_RM: "Disetujui RM",
      MENUNGGU_PERSETUJUAN_FINAL: "Menunggu Persetujuan Final",
      REVISI: "Revisi",
      DISETUJUI: "Disetujui",
      DITOLAK: "Ditolak",
    };
    return statusMap[String(status)] || status || "-";
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
    } catch {
      return "-";
    }
  }

  function getRiskScoreColor(score: number) {
    const threshold = riskCriteria?.threshold ?? 9;

    if (score <= threshold) {
      return "bg-green-100 text-green-800";
    } else if (score <= 10) {
      return "bg-orange-100 text-orange-800";
    } else if (score <= 15) {
      return "bg-yellow-100 text-yellow-800";
    } else if (score <= 20) {
      return "bg-pink-100 text-pink-800";
    } else {
      return "bg-red-100 text-red-800";
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
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Buat Pengajuan Persetujuan Final Risiko
          </h1>
          <Button
            onClick={handleAjukanClick}
            disabled={selected.size === 0}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            Ajukan ({selected.size} risiko)
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Pilih risiko yang telah disetujui RM untuk dikirim ke top level management
        </p>
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
            render: (_, row) => {
              const index = risks.findIndex((r) => r.id === row.id);
              return <span className="text-gray-600">{index + 1}</span>;
            },
            searchable: false,
          },
          {
            header: "Risk ID",
            key: "customRiskId",
            render: (value) => (
              <span className="font-medium">{String(value)}</span>
            ),
          },
          {
            header: "Kategori",
            key: "category",
            render: (value: any) => value?.title || "-",
          },
          {
            header: "Identified Risk",
            key: "identifiedRisk",
            render: (value) => (
              <span className="font-bold">{String(value || "-")}</span>
            ),
          },
          ...(riskCriteria?.isFMEA
            ? [
                {
                  header: "RPN",
                  key: (row: Risk) => {
                    const rpn =
                      (row.impactSeverity ?? 1) *
                      (row.likelihoodOccurence ?? 1) *
                      (row.detection ?? 1);
                    return rpn;
                  },
                  render: (value: any) => {
                    const score = Number(value);
                    return (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRiskScoreColor(
                          score
                        )}`}
                      >
                        {String(value ?? "-")}
                      </span>
                    );
                  },
                  searchable: false,
                } as const,
              ]
            : [
                {
                  header: "Risk Score",
                  key: (row: Risk) => {
                    const score =
                      (row.impactSeverity ?? 1) *
                      (row.likelihoodOccurence ?? 1);
                    return score;
                  },
                  render: (value: any) => {
                    const score = Number(value);
                    return (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRiskScoreColor(
                          score
                        )}`}
                      >
                        {String(value ?? "-")}
                      </span>
                    );
                  },
                  searchable: false,
                } as const,
              ]),
          {
            header: "Status",
            key: "status",
            render: (value) => (
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                  String(value)
                )}`}
              >
                {getStatusLabel(String(value))}
              </span>
            ),
            searchable: false,
          },
          {
            header: "Aksi",
            key: "id",
            render: (value: any, row: Risk) => {
              return (
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title="Lihat detail"
                          onClick={() => handleViewDetail(row)}
                        >
                          <Eye size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Lihat detail risiko</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
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
              className="border-sky-200 text-sky-700 hover:bg-sky-50"
            >
              Sebelumnya
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i + 1}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  disabled={isLoading}
                  className={currentPage === i + 1 ? "bg-sky-600 hover:bg-sky-700 text-white" : "border-sky-200 text-sky-700 hover:bg-sky-50"}
                  variant={currentPage === i + 1 ? "default" : "outline"}
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
              className="border-sky-200 text-sky-700 hover:bg-sky-50"
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
            <DialogTitle className="text-xl text-gray-900">Ajukan Persetujuan Final Risiko</DialogTitle>
            <DialogDescription>
              Masukkan pesan untuk persetujuan {selected.size} risiko ke top level
              management
            </DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel className="text-xs font-semibold text-sky-900 uppercase tracking-widest">Pesan Persetujuan</FieldLabel>
            <Textarea
              placeholder="Contoh: Persetujuan untuk risiko-risiko berikut ke top level management"
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
                onClick={() => {
                  setShowModal(false);
                  setMessage("");
                }}
                disabled={isSending}
                className="border-sky-200 text-sky-700 hover:bg-sky-50"
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmitApproval}
                disabled={isSending || !message.trim()}
                className="bg-sky-600 hover:bg-sky-700 text-white"
              >
                {isSending ? "Mengirim..." : "Kirim Persetujuan"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto !max-w-5xl w-full">
          <DialogHeader className="border-b border-sky-100 pb-4">
            <DialogTitle className="text-xl text-gray-900">Detail Risiko</DialogTitle>
            <DialogDescription>
              Informasi lengkap risiko:{" "}
              <span className="font-mono font-semibold text-slate-700">
                {selectedRisk?.customRiskId}
              </span>
            </DialogDescription>
          </DialogHeader>

          {selectedRisk && (
            <div className="space-y-5">
              {/* Header Section with ID and Status */}
              <div className="border border-sky-200 rounded-lg p-4 bg-sky-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-sky-900 uppercase tracking-wide">
                      Risk ID
                    </p>
                    <p className="text-lg font-mono font-bold text-sky-900 mt-2">
                      {selectedRisk.customRiskId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-sky-900 uppercase tracking-wide">
                      Status
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                          selectedRisk.status
                        )}`}
                      >
                        {getStatusLabel(selectedRisk.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Classification */}
              <div className="border border-sky-200 rounded-lg p-4 bg-white">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Klasifikasi Risiko
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                      Kategori
                    </p>
                    <p className="text-sm text-slate-900">
                      {selectedRisk.category?.title || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                      Sumber Risiko
                    </p>
                    <p className="text-sm text-slate-900">
                      {selectedRisk.source?.title || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Elements */}
              <div className="border border-sky-200 rounded-lg p-4 bg-white">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Elemen Risiko
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                      Identified Risk
                    </p>
                    <p className="text-sm text-slate-900">
                      {selectedRisk.identifiedRisk || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                      Vulnerability
                    </p>
                    <p className="text-sm text-slate-900 font-mono">
                      {selectedRisk.vulnerability || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                      Threat
                    </p>
                    <p className="text-sm text-slate-900 font-mono">
                      {selectedRisk.threat || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assets & Context */}
              <div className="border border-sky-200 rounded-lg p-4 bg-white">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Aset & Konteks
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                      Asset
                    </p>
                    <p className="text-sm text-slate-900">
                      {selectedRisk.asset?.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                      Context
                    </p>
                    <p className="text-sm text-slate-900">
                      {selectedRisk.context?.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                      Risk Owner
                    </p>
                    <p className="text-sm text-slate-900">
                      {selectedRisk.owner?.name || selectedRisk.owner?.id || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scoring */}
              <div className="border border-sky-200 rounded-lg p-4 bg-white">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Penilaian
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-3 rounded border border-sky-200 text-center">
                      <p className="text-xs font-medium text-slate-600 uppercase">
                        Impact
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {selectedRisk.impactSeverity || "-"}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-sky-200 text-center">
                      <p className="text-xs font-medium text-slate-600 uppercase">
                        Likelihood
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {selectedRisk.likelihoodOccurence || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 rounded border border-sky-200 text-center bg-sky-50">
                    <p className="text-xs font-medium text-sky-600 uppercase mb-2">
                      Risk Score
                    </p>
                    <p className="text-3xl font-bold text-sky-900">
                      {(selectedRisk.impactSeverity ?? 1) *
                        (selectedRisk.likelihoodOccurence ?? 1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detail */}
              <div className="border border-sky-200 rounded-lg p-4 bg-white">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Detail Tambahan
                </h3>
                {selectedRisk.detail && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                      Keterangan
                    </p>
                    <p className="text-sm text-slate-900 whitespace-pre-wrap font-mono bg-sky-50 border border-sky-200 p-2 rounded">
                      {selectedRisk.detail}
                    </p>
                  </div>
                )}
                {selectedRisk.createdAt && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                      Dibuat Pada
                    </p>
                    <p className="text-sm text-slate-900">
                      {formatDate(selectedRisk.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-sky-100 pt-4 mt-6">
            <Button onClick={() => setDetailOpen(false)} className="w-full bg-sky-600 hover:bg-sky-700 text-white">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
