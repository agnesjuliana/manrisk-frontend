"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { loadRisks, type Risk } from "@/lib/risksStore";
import { createSubmission, saveSubmissions, loadSubmissions } from "@/lib/risksSubmissionStore";
import { loadUsers } from "@/lib/usersStore";
import { PaginatedTable } from "@/components/paginated-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const DEFAULT_RISKS_TO_SUBMIT = [
  { id: "R001", status: "APPROVED" as const },
  { id: "R002", status: "APPROVED" as const },
];

export default function BuatAjuanRisikoPage() {
  const router = useRouter();
  const [risks, setRisks] = React.useState<Risk[]>(() => {
    if (typeof window === "undefined") return [];
    return loadRisks();
  });

  const users = loadUsers();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  // Filter risks with APPROVED status
  const approvedRisks = risks.filter((r) => r.status === "APPROVED");

  function toggle(id: string) {
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  }

  function toggleAll() {
    if (selected.size === approvedRisks.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(approvedRisks.map((r) => r.id)));
    }
  }

  function submitSubmission() {
    if (selected.size === 0) return;

    const newSubmission = createSubmission(Array.from(selected));
    const submissions = loadSubmissions();
    submissions.push(newSubmission);
    saveSubmissions(submissions);

    router.push("/dashboard/risiko/persetujuan-risiko/rm-view");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0">
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
          <h1 className="text-2xl font-semibold">Buat Ajuan Persetujuan Risiko</h1>
        </div>
        <Button onClick={submitSubmission} disabled={selected.size === 0}>
          Ajukan ({selected.size} risiko)
        </Button>
      </div>

      <PaginatedTable<Risk>
        data={approvedRisks}
        columns={[
          {
            header: (
              <input
                type="checkbox"
                checked={selected.size === approvedRisks.length && approvedRisks.length > 0}
                onChange={toggleAll}
                ref={(el) => {
                  if (el) {
                    (el as HTMLInputElement).indeterminate = selected.size > 0 && selected.size < approvedRisks.length;
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
            header: "Risk ID",
            key: "id",
            render: (value) => <span className="font-medium">{String(value)}</span>,
          },
          {
            header: "Identified Risk",
            key: "identifiedRisk",
          },
          {
            header: "Kategori",
            key: "category",
          },
          {
            header: "Owner",
            key: (row: Risk) => {
              const owner = users.find((u) => u.id === row.ownerId);
              return owner?.name ?? row.unit ?? "-";
            },
          },
          {
            header: "Severity",
            key: "severity",
            render: (value) => <span className="text-center">{String(value)}</span>,
          },
          {
            header: "Likelihood",
            key: "likelihood",
            render: (value) => <span className="text-center">{String(value)}</span>,
          },
          {
            header: "Status",
            key: "status",
            render: (value) => (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {String(value)}
              </span>
            ),
          },
        ]}
        pageSize={10}
        emptyMessage="Tidak ada risiko yang sudah disetujui"
      />
    </div>
  );
}
