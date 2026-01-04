"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PaginatedTable } from "@/components/paginated-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, CheckCircle, X, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiClient } from "@/lib/api/config";
import { AssetApprovalTLStatus } from "@/lib/assetsStore";
import { useAuth } from "@/hooks/use-auth";

interface Asset {
  id: string;
  name: string;
  location: string;
  status: string;
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

export default function AssetApprovalPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  // ALL STATE DECLARATIONS FIRST (never conditional)
  const [approvals, setApprovals] = React.useState<AssetApproval[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalApprovals, setTotalApprovals] = React.useState(0);

  const isRiskManager = user?.role === "RISK_MANAGER";
  const isTopManagement = user?.role === "TOP_MANAGEMENT";

  // Check if user has allowed roles
  React.useEffect(() => {
    if (!isAuthLoading && !isRiskManager && !isTopManagement) {
      toast.error("Akses ditolak. Hanya Risk Manager dan Top Management yang dapat akses halaman ini.");
      router.back();
    }
  }, [isAuthLoading, isRiskManager, isTopManagement, router]);

  // Load approvals from API
  React.useEffect(() => {
    if (isAuthLoading || (!isRiskManager && !isTopManagement)) return;

    const loadApprovalsFromAPI = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get("/asset-approvals", {
          params: {
            page: currentPage,
            per_page: 10,
          },
        });

        if (response.data?.status && response.data?.data?.data) {
          setApprovals(response.data.data.data);

          if (response.data.data.metadata) {
            setTotalPages(response.data.data.metadata.total_page);
            setTotalApprovals(response.data.data.metadata.total_data);
          }
        } else {
          toast.error("Format respons API tidak sesuai");
          setApprovals([]);
        }
      } catch (err) {
        console.error("Error loading approvals:", err);
        toast.error("Gagal memuat daftar pengajuan");
        setApprovals([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadApprovalsFromAPI();
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

  async function handleApproveApproval(approvalId: string) {
    try {
      const response = await apiClient.patch(`/asset-approvals/${approvalId}`, {
        status: AssetApprovalTLStatus.DISETUJUI,
      });

      if (response.status === 200) {
        toast.success("Pengajuan disetujui");
        setCurrentPage(1);
        setApprovals([]);
      } else {
        toast.error("Gagal menyetujui pengajuan");
      }
    } catch (err) {
      console.error("Error approving:", err);
      toast.error("Gagal menyetujui pengajuan");
    }
  }

  async function handleRejectApproval(approvalId: string) {
    try {
      const response = await apiClient.patch(`/asset-approvals/${approvalId}`, {
        status: AssetApprovalTLStatus.DITOLAK,
      });

      if (response.status === 200) {
        toast.success("Pengajuan ditolak");
        setCurrentPage(1);
        setApprovals([]);
      } else {
        toast.error("Gagal menolak pengajuan");
      }
    } catch (err) {
      console.error("Error rejecting:", err);
      toast.error("Gagal menolak pengajuan");
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isRiskManager
              ? "Pengajuan ke Top Management"
              : "Persetujuan Pengajuan Aset"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isRiskManager
              ? "Kelola pengajuan aset untuk persetujuan top level management"
              : "Tinjau dan setujui pengajuan aset dari risk manager"}
          </p>
        </div>
        {isRiskManager && (
          <Button
            onClick={() =>
              router.push("/dashboard/aset/persetujuan-aset/buat-ajuan")
            }
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white"
          >
            <Plus size={18} />
            Buat Pengajuan Baru
          </Button>
        )}
      </div>

      <PaginatedTable
        data={approvals}
        columns={[
          {
            header: "No",
            key: "id",
            render: (_, row) => {
              const index = approvals.findIndex((a) => a.id === row.id);
              return <span className="text-gray-600">{index + 1}</span>;
            },
            searchable: false,
          },
          {
            header: "Tanggal Pengajuan",
            key: "createdAt",
            render: (value) => formatDate(String(value)),
          },
          {
            header: "Manager",
            key: "manager",
            render: (value: any) => (
              <span className="font-medium">{value?.name || "-"}</span>
            ),
          },
          {
            header: "Jumlah Aset",
            key: "assets",
            render: (value: any) =>
              `${Array.isArray(value) ? value.length : 0} aset`,
          },
          {
            header: "Pesan",
            key: "message",
            render: (value) => (
              <span className="text-gray-700 truncate max-w-xs">
                {String(value ?? "-")}
              </span>
            ),
          },
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
            render: (value: any, row: AssetApproval) => {
              return (
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            router.push(`/dashboard/aset/persetujuan-aset/detail/${String(value)}`)
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Eye size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Lihat detail pengajuan</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              );
            },
            searchable: false,
          },
        ]}
        pageSize={10}
        emptyMessage={
          isRiskManager
            ? "Belum ada pengajuan ke top management"
            : "Belum ada pengajuan yang menunggu persetujuan"
        }
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Menampilkan halaman {currentPage} dari {totalPages} ({totalApprovals}{" "}
            total pengajuan)
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
    </div>
  );
}
