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
    switch (status) {
      case RiskApprovalTLStatus.MENUNGGU_PERSETUJUAN_FINAL:
        return "Menunggu Persetujuan Final";
      case RiskApprovalTLStatus.DISETUJUI:
        return "Disetujui";
      case RiskApprovalTLStatus.DITOLAK:
        return "Ditolak";
      default:
        return status || "-";
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
              render: (value) => String(value ?? "-"),
            },
            {
              header: "Impact",
              key: "impact",
              render: (value) => String(value ?? "-"),
            },
          ]}
          pageSize={10}
          emptyMessage="Tidak ada risiko dalam pengajuan ini"
        />
      </div>
    </div>
  );
}
