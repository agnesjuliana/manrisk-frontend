"use client";

import * as React from "react";
import { loadSubmissions, updateSubmissionStatus, type RiskSubmission } from "@/lib/risksSubmissionStore";
import { loadRisks } from "@/lib/risksStore";
import { PaginatedTable } from "@/components/paginated-table";
import { Button } from "@/components/ui/button";

export default function TopApprovalRisikoPage() {
  const [submissions, setSubmissions] = React.useState<RiskSubmission[]>(() => {
    if (typeof window === "undefined") return [];
    return loadSubmissions().filter((s) => s.status === "SUBMITTED_TO_TOP");
  });

  const risks = loadRisks();

  function getStatusBadgeColor(status: RiskSubmission["status"]) {
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

  function getRiskIds(riskIds: string[]): string {
    return riskIds
      .map((id) => risks.find((r) => r.id === id)?.id ?? "Unknown")
      .join(", ");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Persetujuan Risiko (Top Management)</h1>
      </div>

      <PaginatedTable<RiskSubmission>
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
            render: (value) => <span className="font-medium">{formatDate(String(value))}</span>,
          },
          {
            header: "Jumlah Risiko",
            key: "totalRisks",
            render: (value) => `${value} risiko`,
          },
          {
            header: "Daftar Risk ID",
            key: (row: RiskSubmission) => getRiskIds(row.riskIds),
            render: (value) => <span className="text-sm">{value}</span>,
          },
          {
            header: "Status",
            key: "status",
            render: (value: RiskSubmission["status"]) => (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(value)}`}>
                {value}
              </span>
            ),
            searchable: false,
          },
          {
            header: "Action",
            key: "id",
            render: (_, row: RiskSubmission) => (
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
            searchable: false,
          },
        ]}
        pageSize={10}
        emptyMessage="Tidak ada ajuan yang menunggu persetujuan"
      />
    </div>
  );
}
