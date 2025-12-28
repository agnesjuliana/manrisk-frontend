"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PaginatedTable, type ColumnDef } from "@/components/paginated-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  const { user } = useAuth();
  const approvalId = params.id as string;

  const [approval, setApproval] = React.useState<RiskApproval | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const isTopManagement = user?.role === "TOP_MANAGEMENT";

  // Load approval details from API
  React.useEffect(() => {
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
  }, [approvalId]);

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
  }

  async function handleRejectApproval() {
    if (!approval) return;

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
          <h1 className="text-2xl font-semibold">Detail Pengajuan Persetujuan</h1>
        </div>
      </div>

      <div className="rounded-lg border p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Tanggal Pengajuan</p>
            <p className="font-semibold">{formatDate(approval.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <div className="mt-1">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeColor(
                  approval.status
                )}`}
              >
                {getStatusLabel(approval.status)}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Manager</p>
            <p className="font-semibold">{approval.manager.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email Manager</p>
            <p className="font-semibold">{approval.manager.email}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600">Pesan</p>
            <p className="font-semibold text-gray-800 mt-1">
              {approval.message || "-"}
            </p>
          </div>
        </div>
      </div>

      {isTopManagement && isPending && (
        <div className="flex gap-2">
          <Button
            onClick={handleApproveApproval}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle size={16} />
            {isProcessing ? "Menyetujui..." : "Setujui Pengajuan"}
          </Button>
          <Button
            onClick={handleRejectApproval}
            disabled={isProcessing}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <X size={16} />
            {isProcessing ? "Menolak..." : "Tolak Pengajuan"}
          </Button>
        </div>
      )}

      <div className="rounded-lg border p-6">
        <h2 className="font-semibold mb-4">
          Daftar Risiko ({approval.risks.length})
        </h2>
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
            {
              header: "Vulnerability",
              key: "vulnerability",
            },
            {
              header: "Threat",
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
            },
            {
              header: "Status",
              key: "status",
              render: (value) => (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
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
  );
}
