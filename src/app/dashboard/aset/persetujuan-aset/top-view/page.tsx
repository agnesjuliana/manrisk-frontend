"use client";

import * as React from "react";
import { loadSubmissions, updateSubmissionStatus, type AssetSubmission } from "@/lib/assetsSubmissionStore";
import { loadAssets } from "@/lib/assetsStore";
import { PaginatedTable, type ColumnDef } from "@/components/paginated-table";
import { Button } from "@/components/ui/button";

export default function TopApprovalPage() {
  const [submissions, setSubmissions] = React.useState<AssetSubmission[]>(() => {
    if (typeof window === "undefined") return [];
    return loadSubmissions().filter((s) => s.status === "SUBMITTED_TO_TOP");
  });

  const assets = loadAssets();

  function getStatusBadgeColor(status: AssetSubmission["status"]) {
    switch (status) {
      case "PENDING_RM_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED_BY_RM":
        return "bg-blue-100 text-blue-800";
      case "SUBMITTED_TO_TOP":
        return "bg-purple-100 text-purple-800";
      case "APPROVED_BY_TOP":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  function approveSubmission(id: string) {
    updateSubmissionStatus(id, "APPROVED_BY_TOP");
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  }

  function rejectSubmission(id: string) {
    updateSubmissionStatus(id, "REJECTED");
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  }

  function getAssetNames(assetIds: string[]): string {
    return assetIds
      .map((id) => assets.find((a) => a.id === id)?.name ?? "Unknown")
      .join(", ");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Persetujuan Aset (Top Management)</h1>
      </div>

      <PaginatedTable<AssetSubmission>
        data={submissions}
        columns={[
          {
            header: "Tanggal Pengajuan",
            key: "submissionDate",
            render: (value) => <span className="font-medium">{formatDate(value)}</span>,
          },
          {
            header: "Jumlah Aset",
            key: "totalAssets",
            render: (value) => `${value} aset`,
          },
          {
            header: "Daftar Aset",
            key: (row: AssetSubmission) => getAssetNames(row.assetIds),
            render: (value) => <span className="text-sm">{value}</span>,
          },
          {
            header: "Status",
            key: "status",
            render: (value: AssetSubmission["status"]) => (
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeColor(value)}`}>
                {value}
              </span>
            ),
          },
          {
            header: "Action",
            key: "id",
            render: (_, row: AssetSubmission) => (
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => approveSubmission(row.id)}
                >
                  Setujui
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => rejectSubmission(row.id)}
                >
                  Tolak
                </Button>
              </div>
            ),
          },
        ]}
        pageSize={10}
        caption={`Total: ${submissions.length} ajuan menunggu persetujuan`}
        emptyMessage="Tidak ada ajuan yang menunggu persetujuan"
      />
    </div>
  );
}
