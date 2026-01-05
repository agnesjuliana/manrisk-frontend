"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PaginatedTable, type ColumnDef } from "@/components/paginated-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { ArrowLeft, CheckCircle, X } from "lucide-react";
import { apiClient } from "@/lib/api/config";
import { useAuth } from "@/hooks/use-auth";

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

interface Manager {
  id: string;
  name: string;
  email: string;
}

interface RiskApproval {
  id: string;
  organizationId: string;
  manager: Manager;
  message: string;
  status: string;
  risks: Risk[];
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

enum RiskApprovalTLStatus {
  MENUNGGU_PERSETUJUAN_FINAL = "MENUNGGU_PERSETUJUAN_FINAL",
  DITOLAK = "DITOLAK",
  DISETUJUI = "DISETUJUI",
}

export default function DetailApprovalPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const approvalId = params.id as string;

  // ALL STATE DECLARATIONS FIRST (never conditional)
  const [approval, setApproval] = React.useState<RiskApproval | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = React.useState<{
    title: string;
    description: string;
    message: string;
    confirmText: string;
    onConfirm: () => Promise<void>;
    variant?: "default" | "danger";
  } | null>(null);

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

  // Load approval details from API
  React.useEffect(() => {
    if (isAuthLoading || (!isRiskManager && !isTopManagement)) return;

    const loadApprovalDetails = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/risk-approvals/${approvalId}`);

        if (response.data?.status && response.data?.data) {
          setApproval(response.data.data);
        } else {
          toast.error("Format respons API tidak sesuai");
          setApproval(null);
        }
      } catch (err) {
        console.error("Error loading approval details:", err);
        toast.error("Gagal memuat detail pengajuan");
        setApproval(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (approvalId) {
      loadApprovalDetails();
    }
  }, [approvalId, isAuthLoading, isRiskManager, isTopManagement]);

  // Show loading skeleton while checking auth
  if (isAuthLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // If user doesn't have allowed roles, don't render anything (will redirect)
  if (!isRiskManager && !isTopManagement) {
    return null;
  }

  function getStatusBadgeColor(status?: string) {
    switch (status) {
      case RiskApprovalTLStatus.MENUNGGU_PERSETUJUAN_FINAL:
        return "bg-yellow-100 text-yellow-700";
      case RiskApprovalTLStatus.DISETUJUI:
        return "bg-green-100 text-green-700";
      case RiskApprovalTLStatus.DITOLAK:
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function formatDate(isoString: string) {
    return new Date(isoString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  function getRiskScoreColor(score: number) {
    // Assuming default threshold of 9 if not available from criteria
    const threshold = 9;
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

  async function handleApproveApproval() {
    if (!approval) return;

    setConfirmDialogConfig({
      title: "Setujui Pengajuan",
      description: "Apakah Anda yakin ingin menyetujui pengajuan ini?",
      message: `Pengajuan dari ${approval.manager.name} dengan ${approval.risks.length} risiko akan disetujui.`,
      confirmText: "Ya, Setujui",
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          const response = await apiClient.patch(
            `/risk-approvals/${approval.id}`,
            {
              status: RiskApprovalTLStatus.DISETUJUI,
            }
          );

          if (response.status === 200) {
            toast.success("Pengajuan berhasil disetujui");
            setApproval({
              ...approval,
              status: RiskApprovalTLStatus.DISETUJUI,
            });
            setConfirmDialogOpen(false);
            setTimeout(() => router.back(), 1000);
          } else {
            toast.error("Gagal menyetujui pengajuan");
          }
        } catch (err) {
          console.error("Error approving:", err);
          toast.error("Gagal menyetujui pengajuan");
        } finally {
          setIsProcessing(false);
        }
      },
    });
    setConfirmDialogOpen(true);
  }

  async function handleRejectApproval() {
    if (!approval) return;

    setConfirmDialogConfig({
      title: "Tolak Pengajuan",
      description: "Apakah Anda yakin ingin menolak pengajuan ini?",
      message: `Pengajuan dari ${approval.manager.name} dengan ${approval.risks.length} risiko akan ditolak dan dikembalikan ke manager.`,
      confirmText: "Ya, Tolak",
      variant: "danger",
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          const response = await apiClient.patch(
            `/risk-approvals/${approval.id}`,
            {
              status: RiskApprovalTLStatus.DITOLAK,
            }
          );

          if (response.status === 200) {
            toast.success("Pengajuan berhasil ditolak");
            setApproval({
              ...approval,
              status: RiskApprovalTLStatus.DITOLAK,
            });
            setConfirmDialogOpen(false);
            setTimeout(() => router.back(), 1000);
          } else {
            toast.error("Gagal menolak pengajuan");
          }
        } catch (err) {
          console.error("Error rejecting:", err);
          toast.error("Gagal menolak pengajuan");
        } finally {
          setIsProcessing(false);
        }
      },
    });
    setConfirmDialogOpen(true);
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!approval) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p className="text-gray-500">Pengajuan tidak ditemukan</p>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mt-4"
        >
          Kembali
        </Button>
      </div>
    );
  }

  const isPending =
    approval.status === RiskApprovalTLStatus.MENUNGGU_PERSETUJUAN_FINAL;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-10 w-10 p-0 text-sky-600 hover:bg-sky-50"
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">Detail Pengajuan Persetujuan</h1>
        </div>
        <p className="text-sm text-gray-600 ml-14">
          Lihat detail dan kelola persetujuan risiko dari top level management
        </p>
      </div>

      <div className="rounded-lg border border-sky-100 shadow-md bg-white">
        <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50/50 to-white px-6 py-4">
          <h2 className="text-sm font-semibold text-sky-900 uppercase tracking-widest">Informasi Pengajuan</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2">Tanggal Pengajuan</p>
              <p className="text-sm text-gray-900 font-medium">{formatDate(approval.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2">Status</p>
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                    approval.status
                  )}`}
                >
                  {getStatusLabel(approval.status)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2">Manager</p>
              <p className="text-sm text-gray-900 font-medium">{approval.manager.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2">Email Manager</p>
              <p className="text-sm text-gray-900 font-medium">{approval.manager.email}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-sky-900 uppercase tracking-widest mb-2">Pesan</p>
              <div className="bg-sky-50 border border-sky-100 rounded-lg p-3">
                <p className="text-sm text-gray-900">
                  {approval.message || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
        {isTopManagement && isPending && (
          <div className="border-t border-sky-100 bg-gradient-to-r from-sky-50/30 to-white px-6 py-4 flex gap-2 justify-end">
            <Button
              onClick={handleRejectApproval}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              <X size={16} />
              {isProcessing ? "Menolak..." : "Tolak Pengajuan"}
            </Button>
            <Button
              onClick={handleApproveApproval}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              <CheckCircle size={16} />
              {isProcessing ? "Menyetujui..." : "Setujui Pengajuan"}
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-sky-100 shadow-md bg-white">
        <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50/50 to-white px-6 py-4">
          <h2 className="text-sm font-semibold text-sky-900 uppercase tracking-widest">
            Daftar Risiko ({approval.risks.length})
          </h2>
        </div>
        <div className="p-6">
        <PaginatedTable<Risk>
          data={approval.risks}
          columns={[
            {
              header: "No",
              key: "id",
              render: (_, row) => {
                const index = approval.risks.findIndex(
                  (r) => r.id === row.id
                );
                return <span className="text-gray-600">{index + 1}</span>;
              },
              searchable: false,
            },
            {
              header: "Risk ID",
              key: "customRiskId",
              render: (value) => (
                <span className="font-medium text-sky-900">{String(value)}</span>
              ),
            },
            {
              header: "Kategori",
              key: "category",
              render: (value: any) => value?.title || "-",
            },
            {
              header: "Risiko",
              key: "identifiedRisk",
              render: (value) => (
                <span className="font-bold text-sky-900">{String(value || "-")}</span>
              ),
            },
            {
              header: "Kerentanan",
              key: "vulnerability",
            },
            {
              header: "Ancaman",
              key: "threat",
            },
            {
              header: "CIA Impact",
              key: (row) => {
                const cias = [];
                if (row.isConfidentiality) cias.push("C");
                if (row.isIntegrity) cias.push("I");
                if (row.isAvailability) cias.push("A");
                return cias.join(", ") || "-";
              },
            },
            {
              header: "Impact",
              key: "impactSeverity",
              render: (value) => (
                <span className="text-center">{String(value ?? "-")}</span>
              ),
              searchable: false,
            },
            {
              header: "Likelihood",
              key: "likelihoodOccurence",
              render: (value) => (
                <span className="text-center">{String(value ?? "-")}</span>
              ),
              searchable: false,
            },
            {
              header: "Skor Risiko",
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
            },
            {
              header: "Status",
              key: "status",
              render: (value) => (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                  {getStatusLabel(String(value))}
                </span>
              ),
              searchable: false,
            },
          ]}
          pageSize={10}
          emptyMessage="Tidak ada risiko dalam pengajuan ini"
        />
        </div>
      </div>

      {confirmDialogConfig && (
        <ConfirmationDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          title={confirmDialogConfig.title}
          description={confirmDialogConfig.description}
          message={confirmDialogConfig.message}
          confirmText={confirmDialogConfig.confirmText}
          variant={confirmDialogConfig.variant}
          isLoading={isProcessing}
          onConfirm={confirmDialogConfig.onConfirm}
        />
      )}
    </div>
  );
}
