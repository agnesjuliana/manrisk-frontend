"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { loadSubmissions, updateSubmissionStatus, type AssetSubmission } from "@/lib/assetsSubmissionStore";
import { loadAssets } from "@/lib/assetsStore";
import { loadUsers } from "@/lib/usersStore";
import { PaginatedTable, type ColumnDef } from "@/components/paginated-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DetailAjuanPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const [submission, setSubmission] = React.useState<AssetSubmission | null>(null);
  const assets = loadAssets();
  const users = loadUsers();

  React.useEffect(() => {
    const submissions = loadSubmissions();
    const found = submissions.find((s) => s.id === submissionId);
    setSubmission(found || null);
  }, [submissionId]);

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

  function approveSubmission() {
    if (!submission) return;
    updateSubmissionStatus(submission.id, "APPROVED_BY_RM");
    const submissions = loadSubmissions();
    const updated = submissions.find((s) => s.id === submissionId);
    setSubmission(updated || null);
  }

  function submitToTop() {
    if (!submission) return;
    updateSubmissionStatus(submission.id, "SUBMITTED_TO_TOP");
    const submissions = loadSubmissions();
    const updated = submissions.find((s) => s.id === submissionId);
    setSubmission(updated || null);
  }

  if (!submission) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p className="text-gray-500">Ajuan tidak ditemukan</p>
      </div>
    );
  }

  const submittedAssets = assets.filter((a) => submission.assetIds.includes(a.id));

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
          <h1 className="text-2xl font-semibold">Detail Ajuan Persetujuan</h1>
        </div>
      </div>

      <div className="rounded-lg border p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Tanggal Pengajuan</p>
            <p className="font-semibold">{formatDate(submission.submissionDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <div className="mt-1">
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeColor(submission.status)}`}>
                {submission.status}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Jumlah Aset</p>
            <p className="font-semibold">{submission.totalAssets} aset</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {submission.status === "PENDING_RM_REVIEW" && (
          <>
            <Button onClick={approveSubmission}>Setujui</Button>
            <Button variant="outline">Tolak</Button>
          </>
        )}
        {submission.status === "APPROVED_BY_RM" && (
          <Button onClick={submitToTop}>Ajukan ke Top Management</Button>
        )}
      </div>

      <div className="rounded-lg border">
        <h2 className="border-b p-4 font-semibold">Daftar Aset</h2>
        <PaginatedTable<typeof submittedAssets[0]>
          data={submittedAssets}
          columns={[
            {
              header: "Nama Aset",
              key: "name",
              render: (value) => <span className="font-medium">{String(value)}</span>,
            },
            {
              header: "Tipe",
              key: "type",
            },
            {
              header: "Owner",
              key: (row) => {
                const owner = users.find((u) => u.id === row.ownerId);
                return owner?.name ?? "-";
              },
            },
            {
              header: "Lokasi",
              key: (row) => row.location ?? "-",
            },
          ]}
          pageSize={10}
          emptyMessage="Tidak ada aset dalam submission ini"
        />
      </div>
    </div>
  );
}
