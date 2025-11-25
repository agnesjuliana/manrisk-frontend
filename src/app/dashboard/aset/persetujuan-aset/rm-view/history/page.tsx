"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { loadSubmissions } from "@/lib/assetsSubmissionStore";
import { loadAssets } from "@/lib/assetsStore";
import { PaginatedTable } from "@/components/paginated-table";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";

export default function HistoryPengajuanPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = React.useState(() => {
    if (typeof window === "undefined") return [];
    return loadSubmissions();
  });

  function getStatusBadgeColor(status?: string) {
    switch (status) {
      case "PENDING_RM_REVIEW":
        return "bg-yellow-100 text-yellow-700";
      case "APPROVED_BY_RM":
        return "bg-green-100 text-green-700";
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

  function formatDate(isoString: string) {
    return new Date(isoString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">History Pengajuan ke Top Management</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push("/dashboard/aset/persetujuan-aset/rm-view")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Kembali
          </Button>
          <Button
            onClick={() => router.push("/dashboard/aset/persetujuan-aset/rm-view/history/buat-ajuan")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={18} />
            Buat Pengajuan Baru
          </Button>
        </div>
      </div>

      <PaginatedTable
        data={submissions}
        columns={[
          {
            header: "No",
            key: "id",
            render: (_, row) => {
              const index = submissions.findIndex((s) => s.id === row.id);
              return <span className="text-gray-600">{index + 1}</span>;
            },
            searchable: false,
          },
          {
            header: "Tanggal Pengajuan",
            key: "submissionDate",
            render: (value) => formatDate(String(value)),
          },
          {
            header: "Jumlah Aset",
            key: "totalAssets",
            render: (value) => `${value} aset`,
          },
          {
            header: "Status",
            key: "status",
            render: (value) => (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(String(value))}`}>
                {String(value)}
              </span>
            ),
            searchable: false,
          },
          {
            header: "Catatan RM",
            key: "rmNotes",
            render: (value) => <span className="text-gray-700">{String(value ?? "-")}</span>,
          },
        ]}
        pageSize={10}
        emptyMessage="Belum ada pengajuan ke top management"
      />
    </div>
  );
}
