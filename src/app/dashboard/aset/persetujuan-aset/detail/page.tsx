"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PaginatedTable, type ColumnDef } from "@/components/paginated-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { ArrowLeft, CheckCircle, X } from "lucide-react";
import { apiClient } from "@/lib/api/config";
import { AssetApprovalTLStatus } from "@/lib/assetsStore";
import { useAuth } from "@/hooks/use-auth";

interface Asset {
  id: string;
  name: string;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  type: { id: string; title: string };
  classification: { id: string; title: string };
  owner: {
    id: string;
    name: string;
    department: { id: string; name: string };
  };
}

interface Manager {
  id: string;
  name: string;
  email: string;
}

interface AssetApproval {
  id: string;
  organizationId: string;
  manager: Manager;
  message: string;
  status: string;
  assets: Asset[];
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export default function DetailApprovalPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <DetailApprovalContent />
    </React.Suspense>
  );
}

function DetailApprovalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading } = useAuth();
  const approvalId = searchParams.get("id") || "";

  // ALL STATE DECLARATIONS FIRST (never conditional)
  const [approval, setApproval] = React.useState<AssetApproval | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [approveConfirmDialog, setApproveConfirmDialog] = React.useState<{open: boolean, isLoading: boolean}>({ open: false, isLoading: false });
  const [rejectConfirmDialog, setRejectConfirmDialog] = React.useState<{open: boolean, isLoading: boolean}>({ open: false, isLoading: false });

  const isTopManagement = user?.role === "TOP_MANAGEMENT";
  const isRiskManager = user?.role === "RISK_MANAGER";

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
        const response = await apiClient.get(`/asset-approvals/${approvalId}`);

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
      case AssetApprovalTLStatus.MENUNGGU_PERSETUJUAN_FINAL:
        return "bg-yellow-100 text-yellow-700";
      case AssetApprovalTLStatus.DISETUJUI:
        return "bg-green-100 text-green-700";
      case AssetApprovalTLStatus.DITOLAK:
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
      case AssetApprovalTLStatus.MENUNGGU_PERSETUJUAN_FINAL:
        return "Menunggu Persetujuan Final";
      case AssetApprovalTLStatus.DISETUJUI:
        return "Disetujui";
      case AssetApprovalTLStatus.DITOLAK:
        return "Ditolak";
      default:
        return status || "-";
    }
  }

  function handleApproveApproval() {
    setApproveConfirmDialog({ open: true, isLoading: false });
  }

  async function confirmApproveApproval() {
    if (!approval) return;

    setApproveConfirmDialog((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await apiClient.patch(
        `/asset-approvals/${approval.id}`,
        {
          status: AssetApprovalTLStatus.DISETUJUI,
        }
      );

      if (response.status === 200) {
        toast.success("Pengajuan berhasil disetujui");
        setApproval({
          ...approval,
          status: AssetApprovalTLStatus.DISETUJUI,
        });
        setApproveConfirmDialog({ open: false, isLoading: false });
        setTimeout(() => router.back(), 1000);
      } else {
        toast.error("Gagal menyetujui pengajuan");
      }
    } catch (err) {
      console.error("Error approving:", err);
      toast.error("Gagal menyetujui pengajuan");
    } finally {
      setApproveConfirmDialog((prev) => ({ ...prev, isLoading: false }));
    }
  }

  function handleRejectApproval() {
    setRejectConfirmDialog({ open: true, isLoading: false });
  }

  async function confirmRejectApproval() {
    if (!approval) return;

    setRejectConfirmDialog((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await apiClient.patch(
        `/asset-approvals/${approval.id}`,
        {
          status: AssetApprovalTLStatus.DITOLAK,
        }
      );

      if (response.status === 200) {
        toast.success("Pengajuan berhasil ditolak");
        setApproval({
          ...approval,
          status: AssetApprovalTLStatus.DITOLAK,
        });
        setRejectConfirmDialog({ open: false, isLoading: false });
        setTimeout(() => router.back(), 1000);
      } else {
        toast.error("Gagal menolak pengajuan");
      }
    } catch (err) {
      console.error("Error rejecting:", err);
      toast.error("Gagal menolak pengajuan");
    } finally {
      setRejectConfirmDialog((prev) => ({ ...prev, isLoading: false }));
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
    approval.status === AssetApprovalTLStatus.MENUNGGU_PERSETUJUAN_FINAL;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-start justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 h-10 w-10 p-0 -ml-2"
        >
          <ArrowLeft size={24} />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">Detail Pengajuan Persetujuan</h1>
          <p className="text-sm text-gray-600 mt-1">Tinjau detail pengajuan persetujuan aset dari Risk Manager</p>
        </div>
      </div>

      <div className="rounded-lg border border-sky-100 shadow-md bg-white">
        <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50/50 to-white px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Informasi Pengajuan</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-sky-900 uppercase tracking-widest">Tanggal Pengajuan</p>
              <p className="font-semibold text-gray-900 mt-2">{formatDate(approval.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-sky-900 uppercase tracking-widest">Status</p>
              <div className="mt-2">
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
              <p className="text-sm font-semibold text-sky-900 uppercase tracking-widest">Manager</p>
              <p className="font-semibold text-gray-900 mt-2">{approval.manager.name}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-sky-900 uppercase tracking-widest">Email Manager</p>
              <p className="font-semibold text-gray-900 mt-2">{approval.manager.email}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-semibold text-sky-900 uppercase tracking-widest">Pesan</p>
              <p className="font-semibold text-gray-800 mt-2 p-3 bg-sky-50 border border-sky-100 rounded-lg">
                {approval.message || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isTopManagement && isPending && (
        <div className="flex gap-2">
          <Button
            onClick={handleApproveApproval}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle size={16} />
            Setujui Pengajuan
          </Button>
          <Button
            onClick={handleRejectApproval}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <X size={16} />
            Tolak Pengajuan
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-sky-100 shadow-md bg-white">
        <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50/50 to-white px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Daftar Aset ({approval.assets.length})
          </h2>
        </div>
        <div className="p-6">
          <PaginatedTable<Asset>
            data={approval.assets}
            columns={[
              {
                header: "No",
                key: "id",
                render: (_, row) => {
                  const index = approval.assets.findIndex(
                    (a) => a.id === row.id
                  );
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
                render: (value: any) => value?.title || "-",
              },
              {
                header: "Klasifikasi",
                key: "classification",
                render: (value: any) => value?.title || "-",
              },
              {
                header: "Lokasi",
                key: "location",
              },
              {
                header: "Owner",
                key: "owner",
                render: (value: any) => value?.name || "-",
              },
              {
                header: "Divisi",
                key: "owner",
                render: (value: any) => value?.department?.name || "-",
              },
              {
                header: "Status",
                key: "status",
                render: (value) => {
                  let statusClass = "bg-yellow-100 text-yellow-700";
                  let statusLabel = "Menunggu Persetujuan Final";

                  if (String(value) === "DISETUJUI") {
                    statusClass = "bg-green-100 text-green-700";
                    statusLabel = "Disetujui";
                  } else if (String(value) === "DITOLAK") {
                    statusClass = "bg-red-100 text-red-700";
                    statusLabel = "Ditolak";
                  }

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
            ]}
            pageSize={10}
            emptyMessage="Tidak ada aset dalam pengajuan ini"
          />
        </div>
      </div>

      <ConfirmationDialog
        open={approveConfirmDialog.open}
        onOpenChange={(open) =>
          setApproveConfirmDialog((prev) => ({ ...prev, open }))
        }
        title="Konfirmasi Setujui Pengajuan"
        description="Apakah Anda yakin ingin menyetujui pengajuan ini? Semua aset dalam pengajuan akan disetujui."
        confirmText="Setujui"
        cancelText="Batal"
        isLoading={approveConfirmDialog.isLoading}
        onConfirm={confirmApproveApproval}
      />

      <ConfirmationDialog
        open={rejectConfirmDialog.open}
        onOpenChange={(open) =>
          setRejectConfirmDialog((prev) => ({ ...prev, open }))
        }
        title="Konfirmasi Tolak Pengajuan"
        description="Apakah Anda yakin ingin menolak pengajuan ini? Semua aset dalam pengajuan akan ditolak."
        confirmText="Tolak"
        cancelText="Batal"
        isLoading={rejectConfirmDialog.isLoading}
        onConfirm={confirmRejectApproval}
        variant="danger"
      />
    </div>
  );
}
